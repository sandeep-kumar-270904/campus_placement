const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getDashboardToday,
  getStudentOpportunities,
  getOpportunityEligibility,
  applyOpportunity,
  withdrawApplication,
  getMyApplications,
  decideOffer,
  getStudentInterviews,
  exportStudentIcs,
  getStudentDocuments,
  requestNoc,
  exportMyData,
  requestDeletion,
  recordConsent,
  getProfile,
  updateProfile,
} = require('../controllers/studentController');

// All student endpoints require authenticated student (or admin)
router.use(protect);
router.use(authorize('student', 'admin', 'superadmin'));

// 1. Student Dashboard Today
router.get('/dashboard/today', getDashboardToday);

// 2. Student Profile Builder
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// 3. Opportunities & Explanatory Eligibility
router.get('/opportunities', getStudentOpportunities);
router.get('/opportunities/:id/eligibility', getOpportunityEligibility);
router.post('/opportunities/:id/apply', applyOpportunity);
router.delete('/opportunities/:id/withdraw', withdrawApplication);

// 4. Applications & Offer Decisions
router.get('/applications', getMyApplications);
router.patch('/applications/:id/offer-decision', decideOffer);

// 5. Interviews & Calendar
router.get('/interviews', getStudentInterviews);
router.get('/interviews/export-ics', exportStudentIcs);

// 6. Documents Vault & NOC Request
router.get('/documents', getStudentDocuments);
router.post('/documents/noc-request', requestNoc);

// 7. Data Privacy & GDPR/DPDP
router.get('/privacy/export-data', exportMyData);
router.post('/privacy/deletion-request', requestDeletion);
router.post('/privacy/consent', recordConsent);

module.exports = router;
