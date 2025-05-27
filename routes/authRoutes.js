const express = require('express');
const router = express.Router();

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
  getProfile,
  getStatistics,
  sendStatisticsReport
} = require('../controllers/authController');

// Public Routes
router.post('/', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);

// Protected Routes (require authentication)
router.get('/profile',  getProfile);

// Admin Routes (require admin privileges)
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.delete('/:id', deleteUser);
router.put('/:id/status', updateStatus);

// Statistics Routes (admin only)
router.get('/statistics/system', getStatistics);
router.post('/statistics/send-report', sendStatisticsReport);

module.exports = router;