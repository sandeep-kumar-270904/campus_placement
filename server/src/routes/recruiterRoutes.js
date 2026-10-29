const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getMyCompanyDrives,
  getDriveDetails,
  proposeJd,
  getCandidates,
  updateCandidateStatus,
  exportShortlistCsv,
  getCandidateResume,
  autoAllocateSlots,
  getDriveSchedule,
  submitRoundFeedback,
  proposeOffer,
  getDriveFunnel,
} = require('../controllers/recruiterController');

// All recruiter portal routes require authenticated recruiter (or admin/superadmin)
router.use(protect);
router.use(authorize('recruiter', 'admin', 'superadmin'));

// 1. Company Drives & JD Proposing
router.get('/drives', getMyCompanyDrives);
router.get('/drives/:id', getDriveDetails);
router.put('/drives/:id/propose-jd', proposeJd);
router.post('/drives/:id/propose-jd', proposeJd);

// 2. Candidate View & Shortlisting (Privacy Boundary Protected)
router.get('/drives/:id/candidates', getCandidates);
router.patch('/applications/:id/status', updateCandidateStatus);
router.patch('/drives/:driveId/candidates/:id/status', updateCandidateStatus);
router.get('/drives/:id/export-shortlist', exportShortlistCsv);
router.get('/applications/:id/resume', getCandidateResume);
router.get('/drives/:driveId/candidates/:id/resume', getCandidateResume);

// 3. Slot Booking & Auto-Allocation
router.post('/drives/:id/schedule-slots', autoAllocateSlots);
router.post('/drives/:id/schedule/auto-allocate', autoAllocateSlots);
router.get('/drives/:id/schedule', getDriveSchedule);

// 4. Candidate Feedback & Evaluation
router.post('/applications/:id/feedback', submitRoundFeedback);
router.post('/drives/:driveId/candidates/:id/feedback', submitRoundFeedback);

// 5. Offer Proposal Workflow (Submitted for TPO approval)
router.post('/applications/:id/propose-offer', proposeOffer);
router.post('/drives/:driveId/candidates/:id/offer', proposeOffer);

// 6. Recruitment Funnel Analytics
router.get('/drives/:id/funnel', getDriveFunnel);

module.exports = router;
