const User     = require('../models/User');
const Asset    = require('../models/Asset');
const Incident = require('../models/Incident');

exports.getAdminDashboard = async (req, res) => {
  const [users, assets, incidents] = await Promise.all([
    User.find(),
    Asset.find(),
    Incident.find(),
  ]);

  // Asset types breakdown
  const assetTypes = ['Laptop', 'Monitor', 'Phone', 'Printer', 'Keyboard', 'Mouse', 'Other'].map((type) => ({
    name:  type,
    value: assets.filter((a) => a.type === type).length,
  })).filter((a) => a.value > 0);

  // Incidents by priority
  const incidentsByPriority = ['Low', 'Medium', 'High'].map((priority) => ({
    priority,
    count: incidents.filter((i) => i.priority === priority).length,
  }));

  // Incidents per month (last 6 months)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now    = new Date();
  const incidentsPerMonth = [];
  for (let i = 5; i >= 0; i--) {
    const date  = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    incidentsPerMonth.push({
      month: months[date.getMonth()],
      count: incidents.filter((inc) => new Date(inc.createdAt) >= date && new Date(inc.createdAt) < end).length,
    });
  }

  res.status(200).json({
    totalUsers:     users.length,
    totalAssets:    assets.length,
    totalIncidents: incidents.length,
    slaBreaches:    incidents.filter((i) => i.status === 'Delayed').length,
    assetTypes,
    incidentsByPriority,
    incidentsPerMonth,
  });
};

exports.getEngineerDashboard = async (req, res) => {
  const incidents = await Incident.find({ engineerId: req.user.id });
  res.status(200).json({
    total:      incidents.length,
    open:       incidents.filter((i) => i.status === 'Open').length,
    inProgress: incidents.filter((i) => i.status === 'In Progress').length,
    resolved:   incidents.filter((i) => i.status === 'Resolved').length,
    delayed:    incidents.filter((i) => i.status === 'Delayed').length,
  });
};

exports.getEmployeeDashboard = async (req, res) => {
  const incidents = await Incident.find({ userId: req.user.id });
  res.status(200).json({
    total:      incidents.length,
    open:       incidents.filter((i) => i.status === 'Open').length,
    inProgress: incidents.filter((i) => i.status === 'In Progress').length,
    resolved:   incidents.filter((i) => i.status === 'Resolved').length,
  });
};