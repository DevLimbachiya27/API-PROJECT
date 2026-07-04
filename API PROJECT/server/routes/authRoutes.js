const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  getAllUsers
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, updateProfile);
router.put('/changepassword', protect, changePassword);

// Admin only
router.get('/users', protect, authorize('admin'), getAllUsers);

module.exports = router;
