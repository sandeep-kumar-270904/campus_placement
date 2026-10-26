const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getDashboardSummary } = require('../controllers/tpoDashboardController');
const {
  getStudents,
  getStudentDetails,
  bulkVerifyStudents,
  previewBulkImport,
  commitBulkImport,
  addStudentManual,
  updateStudentManual,
  bulkAddToDrive,
  addStudentNote,
} = require('../controllers/tpoStudentController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for Excel/CSV imports
});

// All TPO endpoints are protected and restricted to staff roles (TPO, Coordinator, Admin, SuperAdmin)
// Students and Recruiters are immediately rejected with 403 FORBIDDEN
router.use(protect);
router.use(authorize('tpo', 'coordinator', 'admin', 'superadmin'));

const { requirePermission, requireDeptScope } = require('../middleware/permissionMiddleware');

const {
  getVerificationQueue,
  actionVerification,
} = require('../controllers/tpoVerificationController');
const {
  getDrives,
  createDrive,
  updateDrive,
  previewEligibility,
  updateDriveStatus,
  duplicateDrive,
  reviewProposedJd,
} = require('../controllers/tpoDriveController');
const {
  getDriveWorkspace,
  getEligibleNonApplicants,
  advanceApplicants,
  uploadShortlist,
  submitFeedback,
  extendOffer,
  reviewProposedOffer,
} = require('../controllers/tpoDriveWorkspaceController');

// 1. Dashboard Summary
router.get('/dashboard-summary', getDashboardSummary);

// 2. Student Directory, Details, Bulk Verification, and Import
router.get('/students', requireDeptScope, getStudents);
router.get('/students/:id', requireDeptScope, getStudentDetails);
router.post('/students/bulk-verify', requirePermission('student:verify'), bulkVerifyStudents);
router.post('/students/bulk-import/preview', requirePermission('student:import'), upload.single('file'), previewBulkImport);
router.post('/students/bulk-import/commit', requirePermission('student:import'), commitBulkImport);
router.post('/students/manual', requirePermission('student:import'), addStudentManual);
router.put('/students/:id', requirePermission('student:import'), updateStudentManual);
router.post('/students/bulk-add-to-drive', requirePermission('drive:update'), bulkAddToDrive);
router.put('/students/:id/notes', requireDeptScope, addStudentNote);

// 3. Academic Verification Queue & Actions
router.get('/verification-queue', requireDeptScope, getVerificationQueue);
router.post('/verification/:studentId/action', requireDeptScope, actionVerification);

// 4. Placement Drives Roster, Wizard & State Transitions
router.get('/drives', getDrives);
router.post('/drives', requirePermission('drive:create'), createDrive);
router.put('/drives/:id', requirePermission('drive:update'), updateDrive);
router.post('/drives/preview-eligibility', previewEligibility);
router.patch('/drives/:id/status', requirePermission('drive:close'), updateDriveStatus);
router.post('/drives/:id/duplicate', requirePermission('drive:create'), duplicateDrive);
router.patch('/drives/:id/review-proposed-jd', requirePermission('drive:update'), reviewProposedJd);

// 5. Drive Workspace, Pipeline Kanban, Shortlist Upload, Feedback & Offers
router.get('/drives/:id/workspace', getDriveWorkspace);
router.get('/drives/:id/eligible-non-applicants', getEligibleNonApplicants);
router.patch('/drives/:id/applicants/advance', advanceApplicants);
router.post('/drives/:id/shortlist-upload', upload.single('file'), uploadShortlist);
router.post('/drives/:id/applicants/:appId/feedback', submitFeedback);
router.post('/drives/:id/applicants/:appId/offer', extendOffer);
router.patch('/applications/:appId/review-proposed-offer', reviewProposedOffer);

const {
  getScheduleSlots,
  checkScheduleClashes,
  bulkGenerateSlots,
  updateScheduleSlot,
  exportIcs,
} = require('../controllers/tpoScheduleController');

// 6. Recruitment Calendar, Clash Detection & Auto-Slots
router.get('/schedule/slots', getScheduleSlots);
router.post('/schedule/check-clash', checkScheduleClashes);
router.post('/schedule/bulk-generate', bulkGenerateSlots);
router.put('/schedule/slots/:id', updateScheduleSlot);
router.get('/schedule/export-ics', exportIcs);

const {
  getCompanies,
  createCompany,
  updateCompany,
  setCompanyReminder,
} = require('../controllers/tpoCompanyController');

// 7. Company CRM, Contacts, Past Visits & Reminders
router.get('/companies', getCompanies);
router.post('/companies', createCompany);
router.put('/companies/:id', updateCompany);
router.post('/companies/:id/reminder', setCompanyReminder);

const {
  getAnnouncements,
  previewAnnouncementRecipients,
  sendAnnouncement,
} = require('../controllers/tpoAnnouncementController');

// 8. Segmented Broadcast Engine, Recipient Preview & Delivery Logs
router.get('/announcements', getAnnouncements);
router.post('/announcements/preview-recipients', previewAnnouncementRecipients);
router.post('/announcements/send', sendAnnouncement);

const {
  getAnalyticsOverview,
  getAnalyticsUnplaced,
  getAnalyticsMultipleOffers,
} = require('../controllers/tpoAnalyticsController');

// 9. Institutional Analytics, Funnel Conversion, CTC Bands & Unplaced Cohorts
router.get('/analytics/overview', getAnalyticsOverview);
router.get('/analytics/unplaced', getAnalyticsUnplaced);
router.get('/analytics/multiple-offers', getAnalyticsMultipleOffers);

const {
  getReportTemplates,
  generateReport,
  getReportHistory,
} = require('../controllers/tpoReportController');

const {
  initiateReportJob,
  getJobProgress,
  downloadReportFile,
  getReportJobsHistory,
  getYoyAnalytics,
  updateReportSettings,
  getWeeklyDigest,
} = require('../controllers/tpoReportJobController');

// 10. Prebuilt Reports Exporter, Async Jobs, PDF/XLSX/CSV Generation & Audit History
router.get('/reports/templates', getReportTemplates);
router.post('/reports/generate', generateReport);
router.get('/reports/history', getReportHistory);
router.post('/reports/jobs', initiateReportJob);
router.get('/reports/jobs/:jobId', getJobProgress);
router.get('/reports/download/:jobId', downloadReportFile);
router.get('/reports/jobs-history', getReportJobsHistory);
router.get('/reports/yoy', getYoyAnalytics);
router.patch('/reports/settings', updateReportSettings);
router.post('/reports/digest', getWeeklyDigest);

const {
  getSettings,
  updatePolicies,
  updateBranches,
  addTeamMember,
  updateTemplates,
} = require('../controllers/tpoSettingsController');

// 11. Placement Policies, Operating Thresholds, Branches & Team Staff
router.get('/settings', getSettings);
router.put('/settings/policies', updatePolicies);
router.put('/settings/branches', updateBranches);
router.post('/settings/team', addTeamMember);
router.put('/settings/templates', updateTemplates);

module.exports = router;
