const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middlewares/auth');
const { 
  register, 
  login, 
  verifyEmail,
  resendVerification,
  requestPasswordReset,
  resetPassword,
  updateStatus,
  getAllUsers,
  getUserById,
  deleteUser,
  getProfile
} = require('../controllers/authController');

// Public Routes
router.post('/', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);

// Protected Routes (require authentication)
router.get('/profile', authenticate, getProfile);

// Admin Routes (require admin privileges)
router.get('/', authenticate, isAdmin, getAllUsers);
router.get('/:id', authenticate, isAdmin, getUserById);
router.delete('/:id', authenticate, isAdmin, deleteUser);
router.put('/:id/status', authenticate, isAdmin, updateStatus);

module.exports = router;