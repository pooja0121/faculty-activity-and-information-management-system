const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const resetFacultyPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const facultyUsers = await User.find({ role: 'faculty' });
    console.log(`Found ${facultyUsers.length} faculty users`);

    const defaultPassword = 'faculty123';
    let updatedCount = 0;

    for (const user of facultyUsers) {
      user.password = defaultPassword; // Set plain password, pre-save hook will hash it
      await user.save();
      console.log(`Password reset for ${user.facultyId}`);
      updatedCount++;
    }

    console.log(`Updated ${updatedCount} faculty users with default password '${defaultPassword}'. The pre-save hook hashed them correctly.`);
  } catch (error) {
    console.error('Error resetting passwords:', error);
  } finally {
    mongoose.connection.close();
  }
};

resetFacultyPasswords();
