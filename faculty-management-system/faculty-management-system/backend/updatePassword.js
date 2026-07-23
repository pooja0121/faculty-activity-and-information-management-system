const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const updateFacultyPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const user = await User.findOne({ facultyId: 'faculty7' });
    if (!user) {
      console.log('User not found');
      return;
    }

    const newPassword = 'faculty7@123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();
    console.log('Password updated successfully for faculty7');
  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    mongoose.connection.close();
  }
};

updateFacultyPassword();
