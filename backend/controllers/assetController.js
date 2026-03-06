const Asset = require('../models/Asset');

// GET all assets
exports.getAllAssets = async (req, res) => {
  const assets = await Asset.find().populate('assignedTo', 'name email');
  res.status(200).json({ assets });
};

// POST create asset
exports.createAsset = async (req, res) => {
  const asset = await Asset.create(req.body);
  res.status(201).json({ asset });
};

// PUT update asset
exports.updateAsset = async (req, res) => {
  const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('assignedTo', 'name email');
  if (!asset) return res.status(404).json({ message: 'Asset not found' });
  res.status(200).json({ asset });
};

// DELETE asset
exports.deleteAsset = async (req, res) => {
  const asset = await Asset.findByIdAndDelete(req.params.id);
  if (!asset) return res.status(404).json({ message: 'Asset not found' });
  res.status(200).json({ message: 'Asset deleted' });
};

// PATCH assign asset to user
exports.assignAsset = async (req, res) => {
  const { userId } = req.body;
  const asset = await Asset.findByIdAndUpdate(
    req.params.id,
    { assignedTo: userId || null, status: userId ? 'Assigned' : 'Working' },
    { new: true }
  ).populate('assignedTo', 'name email');
  if (!asset) return res.status(404).json({ message: 'Asset not found' });
  res.status(200).json({ asset });
};