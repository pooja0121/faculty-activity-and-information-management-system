// backend/createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const createAdminUser = async (adminId, name, email, password) => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/faculty-management-system');
    console.log('MongoDB connected');

    const existingAdmin = await User.findOne({ facultyId: adminId, role: 'admin' });
    if (existingAdmin) {
      await User.deleteOne({ facultyId: adminId, role: 'admin' });
      console.log('Existing admin user deleted');
    }

    const adminUser = new User({
      facultyId: adminId,
      name,
      email,
      password,
      role: 'admin',
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

// Replace these values with desired admin credentials
const adminId = 'admin';
const name = 'Admin Two';
const email = 'admin2@nec.edu.in';
const password = 'admin123';

createAdminUser(adminId, name, email, password);
