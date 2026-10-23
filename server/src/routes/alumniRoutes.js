const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { requireFeature } = require('../middleware/featureFlagMiddleware');
const alumniController = require('../controllers/alumniController');

router.use(protect);
router.use(requireFeature('alumniNetwork'));

// Public within college
router.get('/directory', alumniController.getAlumniDirectory);
router.post('/profile', alumniController.createOrUpdateProfile);
router.post('/referrals/request', alumniController.requestReferral);
router.get('/referrals/my-requests', alumniController.getMyReferralRequests);
router.patch('/referrals/:id', alumniController.respondToReferralRequest);
router.get('/mentors/match', alumniController.matchMentors);

// TPO Moderation
router.get('/tpo/unverified', authorize('tpo', 'admin', 'superadmin'), alumniController.getUnverifiedAlumniQueue);
router.patch('/tpo/verify/:id', authorize('tpo', 'admin', 'superadmin'), alumniController.verifyAlumniProfile);

module.exports = router;
