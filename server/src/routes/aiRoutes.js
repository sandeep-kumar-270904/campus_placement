const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  checkResumeMatch,
  startMockInterview,
  respondMockInterview,
  getMockInterviewHistory,
  getMockInterviewSession,
  getCompanyPrepPack,
  getPlacementRisk,
  naturalLanguageTpoQuery,
  parseDriveDescription,
  summarizeFeedback,
  approveFeedback,
} = require('../controllers/aiController');

// All AI endpoints require valid JWT authentication
router.use(protect);

// 1. Resume vs Drive Match (Student + TPO)
router.post('/resume-match', checkResumeMatch);

// 2. Interactive Mock Interviewer (Student)
router.post('/mock-interview/start', startMockInterview);
router.post('/mock-interview/:sessionId/respond', respondMockInterview);
router.get('/mock-interview/history', getMockInterviewHistory);
router.get('/mock-interview/:sessionId', getMockInterviewSession);

// 3. Company Prep Pack (Student + TPO)
router.get('/prep-pack/:companyName', getCompanyPrepPack);

// 4. Placement Risk Predictor (TPO / Admin)
router.get(
  '/placement-risk',
  authorize('tpo', 'admin', 'superadmin'),
  getPlacementRisk
);

// 5. Natural-Language TPO Query Assistant (TPO / Admin)
router.post(
  '/nl-assistant/query',
  authorize('tpo', 'admin', 'superadmin'),
  naturalLanguageTpoQuery
);

// 6. Drive Description Assistant (TPO / Recruiter / Admin)
router.post(
  '/parse-jd',
  authorize('tpo', 'recruiter', 'admin', 'superadmin'),
  parseDriveDescription
);

// 7. Interview Feedback Summarizer & TPO Approval
router.post(
  '/summarize-feedback',
  authorize('tpo', 'recruiter', 'admin', 'superadmin'),
  summarizeFeedback
);
router.patch(
  '/feedback/:appId/approve',
  authorize('tpo', 'admin', 'superadmin'),
  approveFeedback
);

module.exports = router;
