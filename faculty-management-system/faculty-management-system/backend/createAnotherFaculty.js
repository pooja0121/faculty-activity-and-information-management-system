const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

require('dotenv').config();

const createAnotherFaculty = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/faculty-management-system');
    console.log('MongoDB connected successfully');

    const existingUser = await User.findOne({ facultyId: 'faculty4' });
    if (existingUser) {
      console.log('Faculty user already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash('faculty123', 10);

    const faculty = new User({
      facultyId: 'faculty4',
      name: 'Faculty4 User',
      email: 'faculty4@nec.edu.in',
      password: hashedPassword,
      role: 'faculty',
    });

    await faculty.save();
    console.log('Another faculty user created successfully');
  } catch (error) {
    console.error('Error creating faculty user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAnotherFaculty();
