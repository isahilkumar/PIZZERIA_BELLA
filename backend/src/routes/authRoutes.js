const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public User Auth
router.post('/register', authController.register);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/verify-email', (req, res) => authController.verifyEmail({ ...req, params: { token: req.body.token } }, res));
router.post('/resend-verification', authController.resendVerification);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Dedicated Admin Login (Not part of user registration flow)
router.post('/admin/login', authController.adminLogin);

// Protected Profile
router.get('/me', protect, authController.getMe);

module.exports = router;

