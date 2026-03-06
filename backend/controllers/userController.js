const User = require('../models/User');

// GET all users
exports.getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.status(200).json({ users });
};

// POST create user
exports.createUser = async (req, res) => {
  const { name, email, password, role, department, skills } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already exists' });
  const user = await User.create({ name, email, password, role, department, skills });
  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
};

// PUT update user
exports.updateUser = async (req, res) => {
  const { name, email, role, isActive, department, skills } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (name       !== undefined) user.name       = name;
  if (email      !== undefined) user.email      = email;
  if (role       !== undefined) user.role       = role;
  if (isActive   !== undefined) user.isActive   = isActive;
  if (department !== undefined) user.department = department;
  if (skills     !== undefined) user.skills     = skills;

  await user.save();

  const updated = await User.findById(req.params.id).select('-password');
  res.status(200).json({ user: updated });
};

// DELETE user
exports.deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.status(200).json({ message: 'User deleted successfully' });
};