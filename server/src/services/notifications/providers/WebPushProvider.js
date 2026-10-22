const INotificationProvider = require('./INotificationProvider');

class WebPushProvider extends INotificationProvider {
  constructor() {
    super();
    this.vapidPublicKey = process.env.VAPID_PUBLIC_KEY || 'BFallbackVapidPublicKeyForWebPushTesting';
    this.vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || 'FallbackPrivateKey';
  }

  async send({ to, title, body, deepLink, metadata }) {
    // 'to' can be an object with endpoint & keys, or a user id lookup
    if (!to) {
      return { success: false, error: 'No push subscription endpoint provided.' };
    }

    try {
      const messageId = `push_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      return {
        success: true,
        messageId,
      };
    } catch (err) {
      return { success: false, error: err.message || 'Push dispatch failed.' };
    }
  }
}

module.exports = WebPushProvider;
