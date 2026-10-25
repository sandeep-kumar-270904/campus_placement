const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getPolicy,
  updatePolicy,
  previewSimulation,
  getOverrides,
  grantOverride,
  revokeOverride,
  getExceptions,
  submitException,
  reviewException,
  checkOpportunityPolicyStatus,
  getFairnessReport,
  exportFairnessReport,
} = require('../controllers/placementPolicyController');

// All policy routes require authentication
router.use(protect);

// Student & general endpoints
router.get('/', getPolicy);
router.post('/exceptions', submitException);
router.get('/check/:id', checkOpportunityPolicyStatus);

// TPO / Admin restricted endpoints
router.put('/', authorize('tpo', 'admin', 'superadmin'), updatePolicy);
router.post('/preview', authorize('tpo', 'admin', 'superadmin'), previewSimulation);

// Overrides
router.get('/overrides', authorize('tpo', 'admin', 'superadmin'), getOverrides);
router.post('/overrides', authorize('tpo', 'admin', 'superadmin'), grantOverride);
router.delete('/overrides/:id', authorize('tpo', 'admin', 'superadmin'), revokeOverride);

// Student Exception Requests Queue
router.get('/exceptions', authorize('tpo', 'admin', 'superadmin'), getExceptions);
router.patch('/exceptions/:id', authorize('tpo', 'admin', 'superadmin'), reviewException);

// Fairness & Diversity Report
router.get('/fairness-report', authorize('tpo', 'admin', 'superadmin'), getFairnessReport);
router.get('/fairness-report/export', authorize('tpo', 'admin', 'superadmin'), exportFairnessReport);

module.exports = router;
