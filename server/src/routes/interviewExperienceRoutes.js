const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { requireFeature } = require('../middleware/featureFlagMiddleware');
const expController = require('../controllers/interviewExperienceController');

router.use(protect);
router.use(requireFeature('interviewExperiences'));

// Approved feed & submissions
router.get('/', expController.getApprovedExperiences);
router.post('/', expController.submitExperience);
router.post('/:id/upvote', expController.toggleUpvote);

// TPO Moderation
router.get('/moderation', authorize('tpo', 'admin', 'superadmin'), expController.getModerationQueue);
router.patch('/:id/moderate', authorize('tpo', 'admin', 'superadmin'), expController.moderateExperience);

module.exports = router;
