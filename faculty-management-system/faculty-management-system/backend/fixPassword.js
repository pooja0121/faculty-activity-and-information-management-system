const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const fixFacultyPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const newPassword = 'faculty7@123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const result = await User.updateOne(
      { facultyId: 'faculty7' },
      { password: hashedPassword }
    );

    if (result.matchedCount > 0) {
      console.log('Password fixed successfully for faculty7');
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error fixing password:', error);
  } finally {
    mongoose.connection.close();
  }
};

fixFacultyPassword();
