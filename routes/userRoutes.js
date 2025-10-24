const express = require('express');
const { celebrate } = require('celebrate');
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { registerValidation, loginValidation, updateUserValidation } = require('../validation/authValidation');

const router = express.Router();

// Public routes
router.post('/register', celebrate(registerValidation), userController.register);
router.post('/login', celebrate(loginValidation), userController.login);

// Protected routes
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, celebrate(updateUserValidation), userController.updateProfile);
router.get('/get-matches', authenticateToken, userController.getMatches);

// Admin routes
router.get('/users', authenticateToken, requireAdmin, userController.getAllUsers);

module.exports = router;
