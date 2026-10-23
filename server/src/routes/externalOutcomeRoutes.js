const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { requireFeature } = require('../middleware/featureFlagMiddleware');
const outcomeController = require('../controllers/externalOutcomeController');

router.use(protect);
router.use(requireFeature('offCampusHigherStudies'));

// Student endpoints
router.post('/', outcomeController.submitOutcome);
router.get('/my-outcomes', outcomeController.getMyOutcomes);
router.get('/stats', outcomeController.getOutcomeStats);

// TPO Verification Queue
router.get('/tpo/queue', authorize('tpo', 'admin', 'superadmin'), outcomeController.getVerificationQueue);
router.patch('/tpo/verify/:id', authorize('tpo', 'admin', 'superadmin'), outcomeController.verifyOutcome);

module.exports = router;
