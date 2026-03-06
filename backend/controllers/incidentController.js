const Incident = require('../models/Incident');
const User     = require('../models/User');

// ─── Smart Auto-Assignment Engine ───────────────────────────────────────────
const smartAssign = async (category) => {
  const engineers = await User.find({ role: 'engineer', isActive: true });
  if (engineers.length === 0) return null;

  // Score each engineer
  const scored = await Promise.all(
    engineers.map(async (eng) => {
      // Workload score — count open incidents
      const openCount = await Incident.countDocuments({
        engineerId: eng._id,
        status: { $in: ['open', 'in-progress', 'waiting'] },
      });

      // Skill match score
      // +3 if engineer has exact skill match
      // +1 if engineer has no skills set (generalist)
      // +0 if engineer has skills but none match
      let skillScore = 0;
      if (eng.skills && eng.skills.length > 0) {
        skillScore = eng.skills.includes(category) ? 3 : 0;
      } else {
        skillScore = 1; // generalist — can handle anything
      }

      // Final score: higher skill match + lower workload = better
      // We want HIGH score to win
      const finalScore = skillScore - (openCount * 0.5);

      return { engineer: eng, score: finalScore, openCount, skillScore };
    })
  );

  // Sort by score descending — highest score wins
  scored.sort((a, b) => b.score - a.score);

  console.log('🎯 Smart Assignment Scores:');
  scored.forEach((s) => {
    console.log(`  ${s.engineer.name}: skill=${s.skillScore} workload=${s.openCount} total=${s.score.toFixed(2)}`);
  });

  return scored[0].engineer;
};

// ─── POST /api/incidents — Create incident (employee) ───────────────────────
exports.createIncident = async (req, res) => {
  const { title, description, priority, category, location } = req.body;

  // Smart assign based on category
  const assignedEngineer = await smartAssign(category || 'Other');

  const incident = await Incident.create({
    title,
    description,
    priority:   priority || 'medium',
    category:   category || 'Other',
    location:   location || '',
    userId:     req.user.id,
    engineerId: assignedEngineer?._id || null,
  });

  // Notify assigned engineer via socket
  const io = req.app.get('io');
  if (io && assignedEngineer) {
    io.to(`user_${assignedEngineer._id}`).emit('notification', {
      type:       'new_incident',
      message:    `New ${category} incident assigned to you: ${title}`,
      incidentId: incident._id,
    });
  }

  res.status(201).json({ incident });
};

// ─── GET /api/incidents — All incidents (admin) ─────────────────────────────
exports.getAllIncidents = async (req, res) => {
  const incidents = await Incident.find()
    .populate('userId',     'name email department')
    .populate('engineerId', 'name email skills')
    .sort({ createdAt: -1 });

  res.status(200).json({ incidents });
};

// ─── GET /api/incidents/my — My incidents (employee) ────────────────────────
exports.getMyIncidents = async (req, res) => {
  const incidents = await Incident.find({ userId: req.user.id })
    .populate('engineerId', 'name email skills')
    .sort({ createdAt: -1 });

  res.status(200).json({ incidents });
};

// ─── GET /api/incidents/assigned — Assigned incidents (engineer) ─────────────
exports.getAssignedIncidents = async (req, res) => {
  const incidents = await Incident.find({ engineerId: req.user.id })
    .populate('userId', 'name email department')
    .sort({ createdAt: -1 });

  res.status(200).json({ incidents });
};

// ─── GET /api/incidents/:id — Get single incident ───────────────────────────
exports.getIncidentById = async (req, res) => {
  const incident = await Incident.findById(req.params.id)
    .populate('userId',           'name email department')
    .populate('engineerId',       'name email skills')
    .populate('comments.addedBy', 'name email role');

  if (!incident) return res.status(404).json({ message: 'Incident not found' });
  res.status(200).json(incident);
};

// ─── PUT /api/incidents/:id — Update incident (engineer/admin) ───────────────
exports.updateIncident = async (req, res) => {
  const { status, engineerId, priority, title, description } = req.body;

  const incident = await Incident.findById(req.params.id);
  if (!incident) return res.status(404).json({ message: 'Incident not found' });

  if (status)      incident.status      = status;
  if (engineerId)  incident.engineerId  = engineerId;
  if (priority)    incident.priority    = priority;
  if (title)       incident.title       = title;
  if (description) incident.description = description;

  await incident.save();

  // Emit real-time updates
  const io = req.app.get('io');
  if (io) {
    io.to(req.params.id).emit('incident_updated', {
      incidentId: req.params.id,
      updates:    { status: incident.status },
    });

    if (status) {
      io.to(`user_${incident.userId}`).emit('notification', {
        type:       'status_change',
        message:    `Your ticket INC-${incident._id.toString().slice(-4).toUpperCase()} is now "${status}"`,
        incidentId: incident._id,
      });
    }

    if (engineerId) {
      io.to(`user_${engineerId}`).emit('notification', {
        type:       'new_incident',
        message:    `Incident INC-${incident._id.toString().slice(-4).toUpperCase()} assigned to you`,
        incidentId: incident._id,
      });
    }
  }

  const updated = await Incident.findById(req.params.id)
    .populate('userId',     'name email department')
    .populate('engineerId', 'name email skills');

  res.status(200).json({ incident: updated });
};

// ─── DELETE /api/incidents/:id — Delete incident (admin) ────────────────────
exports.deleteIncident = async (req, res) => {
  const incident = await Incident.findByIdAndDelete(req.params.id);
  if (!incident) return res.status(404).json({ message: 'Incident not found' });
  res.status(200).json({ message: 'Incident deleted' });
};

// ─── POST /api/incidents/:id/comments — Add comment ────────────────────────
exports.addComment = async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ message: 'Comment text is required' });

  const incident = await Incident.findById(req.params.id);
  if (!incident) return res.status(404).json({ message: 'Incident not found' });

  incident.comments.push({
    text:    text.trim(),
    addedBy: req.user.id,
    addedAt: new Date(),
  });

  await incident.save();

  const updated = await Incident.findById(req.params.id)
    .populate('comments.addedBy', 'name email role');

  const savedComment = updated.comments[updated.comments.length - 1];

  // Emit to incident room
  const io = req.app.get('io');
  if (io) {
    io.to(req.params.id).emit('new_comment', {
      incidentId: req.params.id,
      comment:    savedComment,
    });

    // Notify the other party
    const notifyUserId =
      req.user.id.toString() === incident.userId.toString()
        ? incident.engineerId
        : incident.userId;

    if (notifyUserId) {
      io.to(`user_${notifyUserId}`).emit('notification', {
        type:       'new_comment',
        message:    `New comment on INC-${incident._id.toString().slice(-4).toUpperCase()} from ${req.user.name}`,
        incidentId: incident._id,
      });
    }
  }

  res.status(201).json(savedComment);
};

// ─── PATCH /api/incidents/:id/assign — Assign engineer (admin) ──────────────
exports.assignEngineer = async (req, res) => {
  const { engineerId } = req.body;

  const incident = await Incident.findByIdAndUpdate(
    req.params.id,
    { engineerId },
    { new: true }
  ).populate('userId engineerId', 'name email');

  if (!incident) return res.status(404).json({ message: 'Incident not found' });

  const io = req.app.get('io');
  if (io && engineerId) {
    io.to(`user_${engineerId}`).emit('notification', {
      type:       'new_incident',
      message:    `Incident INC-${incident._id.toString().slice(-4).toUpperCase()} assigned to you`,
      incidentId: incident._id,
    });
  }

  res.status(200).json({ incident });
};