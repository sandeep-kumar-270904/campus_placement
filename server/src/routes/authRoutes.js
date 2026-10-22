const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  inviteRecruiter,
  validateInviteToken,
  setPassword,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

// Recruiter Invitation & Password Setup
router.post('/invite-recruiter', protect, authorize('tpo', 'admin', 'superadmin'), inviteRecruiter);
router.get('/invite/:token', validateInviteToken);
router.post('/set-password', setPassword);

module.exports = router;

