const express = require('express');
const { celebrate } = require('celebrate');
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { registerValidation, loginValidation, updateUserValidation, sendConnectionRequestValidation, respondToConnectionRequestValidation, deleteUserValidation } = require('../validation/authValidation');

const router = express.Router();

// Public routes
router.post('/register', celebrate(registerValidation), userController.register);
router.post('/login', celebrate(loginValidation), userController.login);

// Protected routes
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, celebrate(updateUserValidation), userController.updateProfile);
router.get('/get-matches', authenticateToken, userController.getMatches);
router.post('/send-connection-request', authenticateToken, celebrate(sendConnectionRequestValidation), userController.sendConnectionRequest);
router.post('/respond-to-connection-request', authenticateToken, celebrate(respondToConnectionRequestValidation), userController.respondToConnectionRequest);

// Admin routes
router.get('/users', authenticateToken, requireAdmin, userController.getAllUsers);
router.delete('/users/:userId', authenticateToken, requireAdmin, celebrate(deleteUserValidation), userController.deleteUser);

module.exports = router;
