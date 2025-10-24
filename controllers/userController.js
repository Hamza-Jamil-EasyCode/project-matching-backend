const userService = require('../services/userService');
const { generateUserToken } = require('../utils/jwt');

class UserController {
  // Register a new user
  async register(req, res) {
    try {
      const { name, email, programOfStudy, interest, skills, projectIdea, availabilityDate, password } = req.body;

      // Check if user already exists
      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Create new user
      const user = await userService.createUser({
        name,
        email,
        programOfStudy,
        interest,
        skills,
        projectIdea,
        availabilityDate,
        password
      });

      // Generate JWT token
      const token = generateUserToken(user);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = {};
        Object.keys(error.errors).forEach(field => {
          validationErrors[field] = error.errors[field].message;
        });
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }
      
      // Handle duplicate key errors
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`,
          error: `${field} must be unique`
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user with password
      const user = await userService.findByEmailWithPassword(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Update last login
      await userService.updateLastLogin(user._id);

      // Generate JWT token
      const token = generateUserToken(user);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user: req.user
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile',
        error: error.message
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const { name, email, programOfStudy, interest, skills, projectIdea, availabilityDate } = req.body;
      const userId = req.user._id;

      // Check if email is being changed and if it already exists
      if (email && email !== req.user.email) {
        const existingUser = await userService.findByEmail(email);
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists'
          });
        }
      }

      // Update user
      const updatedUser = await userService.updateUser(userId, {
        name,
        email,
        programOfStudy,
        interest,
        skills,
        projectIdea,
        availabilityDate
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: updatedUser
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const validationErrors = {};
        Object.keys(error.errors).forEach(field => {
          validationErrors[field] = error.errors[field].message;
        });
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }
      
      // Handle duplicate key errors
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`,
          error: `${field} must be unique`
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message
      });
    }
  }

  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      
      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users,
          count: users.length
        }
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users',
        error: error.message
      });
    }
  }

  // Get matching users based on interests, skills, and project ideas
  async getMatches(req, res) {
    try {
      const currentUser = req.user;
      const matches = await userService.findMatches(currentUser);
      
      res.status(200).json({
        success: true,
        message: 'Matches retrieved successfully',
        data: {
          matches,
          count: matches.length
        }
      });
    } catch (error) {
      console.error('Get matches error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get matches',
        error: error.message
      });
    }
  }
}

module.exports = new UserController();
