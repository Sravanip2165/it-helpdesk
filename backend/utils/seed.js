require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');
const connectDB = require('../config/db');

const seedUsers = async () => {
  await connectDB();

  await User.deleteMany({});

  await User.create([
    {
      name:     'Admin User',
      email:    'admin@helpdesk.com',
      password: 'admin123',
      role:     'admin',
    },
    {
      name:     'John Engineer',
      email:    'engineer@helpdesk.com',
      password: 'engineer123',
      role:     'engineer',
    },
    {
      name:     'Jane Employee',
      email:    'employee@helpdesk.com',
      password: 'employee123',
      role:     'employee',
    },
  ]);

  console.log('✅ Users seeded successfully!');
  console.log('Admin:    admin@helpdesk.com    / admin123');
  console.log('Engineer: engineer@helpdesk.com / engineer123');
  console.log('Employee: employee@helpdesk.com / employee123');
  process.exit();
};

seedUsers();