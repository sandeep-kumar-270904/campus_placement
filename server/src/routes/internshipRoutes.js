const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { requireFeature } = require('../middleware/featureFlagMiddleware');
const internshipController = require('../controllers/internshipController');

router.use(protect);
router.use(requireFeature('internshipPpo'));

router.get('/', internshipController.getInternships);
router.post('/', internshipController.createInternship);
router.patch('/:id/ppo', internshipController.updatePpoStatus);
router.get('/stats', internshipController.getInternshipStats);

module.exports = router;
