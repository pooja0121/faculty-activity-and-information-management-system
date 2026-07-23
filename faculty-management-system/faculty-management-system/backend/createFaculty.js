// backend/createFaculty.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const createFacultyUser = async (facultyId, name, email, password) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const existingFaculty = await User.findOne({ facultyId: facultyId, role: 'faculty' });
    if (existingFaculty) {
      console.log('Faculty user already exists');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const facultyUser = new User({
      facultyId: facultyId,
      name,
      email,
      password: hashedPassword,
      role: 'faculty',
    });

    await facultyUser.save();
    console.log('Faculty user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating faculty user:', error);
    process.exit(1);
  }
};

// Create sample faculty users
const createSampleFaculty = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Sample faculty users
    const facultyUsers = [
      {
        facultyId: 'buvan_123',
        name: 'Dr. Buvanesh Kumar',
        email: 'buvan.kumar@nec.edu.in',
        password: 'faculty123'
      },
      {
        facultyId: 'john_doe',
        name: 'Dr. John Doe',
        email: 'john.doe@nec.edu.in',
        password: 'faculty123'
      },
      {
        facultyId: 'jane_smith',
        name: 'Dr. Jane Smith',
        email: 'jane.smith@nec.edu.in',
        password: 'faculty123'
      }
    ];

    for (const faculty of facultyUsers) {
      const existingFaculty = await User.findOne({ facultyId: faculty.facultyId, role: 'faculty' });
      if (!existingFaculty) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(faculty.password, salt);

        const facultyUser = new User({
          facultyId: faculty.facultyId,
          name: faculty.name,
          email: faculty.email,
          password: hashedPassword,
          role: 'faculty',
        });

        await facultyUser.save();
        console.log(`Faculty user ${faculty.facultyId} created successfully`);
      } else {
        console.log(`Faculty user ${faculty.facultyId} already exists`);
      }
    }

    console.log('Sample faculty users creation completed');
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample faculty users:', error);
    process.exit(1);
  }
};

// Check if specific faculty ID is provided as command line argument
const args = process.argv.slice(2);
if (args.length > 0) {
  const [facultyId, name, email, password] = args;
  createFacultyUser(facultyId, name, email, password);
} else {
  // Create sample faculty users
  createSampleFaculty();
}

module.exports = { createFacultyUser };
