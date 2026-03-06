const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      enum: ['Hardware', 'Software', 'Network', 'Access', 'Storage', 'Other'],
      default: 'Other',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'waiting', 'resolved', 'closed'],
      default: 'open',
    },
    location: {
      type: String,
      default: '',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    engineerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    comments: [
      {
        text:    { type: String, required: true },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    slaDeadline: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Auto set SLA deadline 24hrs after creation
incidentSchema.pre('save', function () {
  if (this.isNew) {
    this.slaDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
});

module.exports = mongoose.model('Incident', incidentSchema);