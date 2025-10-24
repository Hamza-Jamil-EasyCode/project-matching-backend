const User = require('../models/User');

class UserService {
  // Create a new user
  async createUser(userData) {
    try {
      const user = new User(userData);
      await user.save();
      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  // Find user by email
  async findByEmail(email) {
    return await User.findOne({ email });
  }

  // Find user by email with password (for login)
  async findByEmailWithPassword(email) {
    return await User.findByEmailWithPassword(email);
  }

  // Find user by ID
  async findById(id) {
    return await User.findById(id);
  }

  // Update user
  async updateUser(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    });
  }

  // Update last login
  async updateLastLogin(id) {
    return await User.findByIdAndUpdate(id, { 
      lastLogin: new Date() 
    }, { new: true });
  }

  // Get all users (for admin)
  async getAllUsers() {
    return await User.find({}).select('-password');
  }

  // Delete user
  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }

  // Check if user exists
  async userExists(email) {
    const user = await User.findOne({ email });
    return !!user;
  }
}

module.exports = new UserService();
