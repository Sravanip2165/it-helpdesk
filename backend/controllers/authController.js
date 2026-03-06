const User = require('../models/User');
const jwt  = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @route POST /api/auth/register
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  // Only allow employee or engineer to register
  if (!['employee', 'engineer'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role selected' });
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password, role });

  res.status(201).json({
    token: generateToken(user._id),
    user: {
      id:    user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
  });
};

// @route POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: 'Your account has been deactivated' });
  }

  res.status(200).json({
    token: generateToken(user._id),
    user: {
      id:    user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
  });
};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.status(200).json({ user });
};