const User = require('../models/User');

const dropEmailIndex = async (req, res) => {
  try {
    await User.collection.dropIndex("email_1");
    res.status(200).json({ message: 'Email unique index dropped successfully' });
  } catch (error) {
    console.error('Error dropping index:', error);
    res.status(500).json({ message: 'Error dropping email index', error: error.message });
  }
};

// Test route to check MongoDB connection and list all users
const testUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// Temporary route to delete a user by email (for fixing registration conflicts)
const deleteUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const deletedUser = await User.findOneAndDelete({ email });
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully', deletedUser: deletedUser.facultyId });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

module.exports = { dropEmailIndex, testUsers, deleteUser };
