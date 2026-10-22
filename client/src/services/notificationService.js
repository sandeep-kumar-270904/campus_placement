import api from './api';

const notificationService = {
  // In-App Feed & Counts
  async getInAppNotifications({ page = 1, limit = 20, unreadOnly = false } = {}) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(unreadOnly ? { unreadOnly: 'true' } : {}),
    });
    const res = await api.get(`/notifications?${params.toString()}`);
    return res.data;
  },

  async getUnreadCount() {
    const res = await api.get('/notifications/unread-count');
    return res.data;
  },

  async markAsRead(notificationId) {
    const res = await api.patch(`/notifications/${notificationId}/read`);
    return res.data;
  },

  async markAllAsRead() {
    const res = await api.post('/notifications/mark-all-read');
    return res.data;
  },

  // Student Preferences & Channel Verification
  async getPreferences() {
    const res = await api.get('/notifications/preferences');
    return res.data;
  },

  async updatePreferences(data) {
    const res = await api.put('/notifications/preferences', data);
    return res.data;
  },

  async optInWhatsApp(phoneNumber) {
    const res = await api.post('/notifications/preferences/whatsapp-optin', { phoneNumber });
    return res.data;
  },

  async subscribePush(subscription) {
    const res = await api.post('/notifications/preferences/push-subscribe', { subscription });
    return res.data;
  },

  // TPO Delivery Tracking & Queue Management
  async getDeliveryTracking({ page = 1, limit = 20, channel = '', status = '', eventType = '' } = {}) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(channel && channel !== 'all' ? { channel } : {}),
      ...(status && status !== 'all' ? { status } : {}),
      ...(eventType && eventType !== 'all' ? { eventType } : {}),
    });
    const res = await api.get(`/notifications/tracking?${params.toString()}`);
    return res.data;
  },

  async retryFailedJobs() {
    const res = await api.post('/notifications/retry-failed');
    return res.data;
  },

  async drainQueue() {
    const res = await api.post('/notifications/queue/drain');
    return res.data;
  },

  async triggerReminders() {
    const res = await api.post('/notifications/trigger-reminders');
    return res.data;
  },

  // TPO Template Configuration & Live Test Sends
  async getTemplates() {
    const res = await api.get('/notifications/templates');
    return res.data;
  },

  async updateTemplate(eventType, data) {
    const res = await api.put(`/notifications/templates/${encodeURIComponent(eventType)}`, data);
    return res.data;
  },

  async testSendNotification(channel = 'email', eventType = 'system.test_send') {
    const res = await api.post('/notifications/templates/test-send', { channel, eventType });
    return res.data;
  },
};

export default notificationService;
