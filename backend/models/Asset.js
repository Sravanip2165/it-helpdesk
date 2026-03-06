const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    assetTag: {
      type: String,
      required: [true, 'Asset tag is required'],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Laptop', 'Monitor', 'Phone', 'Printer', 'Keyboard', 'Mouse', 'Other'],
      required: true,
    },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    status: {
      type: String,
      enum: ['Working', 'Faulty', 'Assigned'],
      default: 'Working',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Asset', assetSchema);