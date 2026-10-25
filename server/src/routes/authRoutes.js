const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  forgotPassword,
  resetPassword,
  googleLogin,
  getUserSessions,
  revokeSession,
  revokeOtherSessions,
  getUserProfile,
  inviteRecruiter,
  validateInviteToken,
  setPassword,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { authLimiter, passwordResetLimiter } = require('../middleware/securityMiddleware');

// Authentication & Session Endpoints
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logoutUser);

// Password Recovery & OAuth
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google', googleLogin);

// User Profile
router.get('/profile', protect, getUserProfile);

// Active Session Management
router.get('/sessions', protect, getUserSessions);
router.delete('/sessions/other', protect, revokeOtherSessions);
router.delete('/sessions/:id', protect, revokeSession);

// Recruiter Invitation & Password Setup
router.post('/invite-recruiter', protect, authorize('tpo', 'admin', 'superadmin'), inviteRecruiter);
router.get('/invite/:token', validateInviteToken);
router.post('/set-password', setPassword);

module.exports = router;
