const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getInAppNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getPreferences,
  updatePreferences,
  whatsappOptIn,
  subscribeWebPush,
  unsubscribeEmail,
  getDeliveryTracking,
  retryFailedJobs,
  getTemplates,
  updateTemplate,
  testSendNotification,
  processQueueBatch,
  triggerScheduledReminders,
} = require('../controllers/notificationController');

// Public one-click email unsubscribe route
router.get('/unsubscribe', unsubscribeEmail);

// All other notification routes require authenticated user
router.use(protect);

// 1. In-App Notification Center
router.get('/', getInAppNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markAsRead);
router.post('/mark-all-read', markAllAsRead);

// 2. Student Notification Preferences & Opt-Ins
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);
router.post('/preferences/whatsapp-optin', whatsappOptIn);
router.post('/preferences/push-subscribe', subscribeWebPush);

// 3. TPO Delivery Tracking, Templates & Test Send (TPO / Admin only)
router.get('/tracking', authorize('tpo', 'admin', 'superadmin'), getDeliveryTracking);
router.post('/retry-failed', authorize('tpo', 'admin', 'superadmin'), retryFailedJobs);
router.get('/templates', authorize('tpo', 'admin', 'superadmin'), getTemplates);
router.put('/templates/:eventType', authorize('tpo', 'admin', 'superadmin'), updateTemplate);
router.post('/templates/test-send', authorize('tpo', 'admin', 'superadmin'), testSendNotification);

// 4. Serverless Queue & Reminders Trigger (can be invoked by cron / TPO / webhook)
router.post('/queue/drain', processQueueBatch);
router.post('/trigger-reminders', authorize('tpo', 'admin', 'superadmin'), triggerScheduledReminders);

module.exports = router;
