const INotificationProvider = require('./INotificationProvider');
const Notification = require('../../../models/Notification');

class InAppProvider extends INotificationProvider {
  async send({ notificationId, to, title, body, deepLink, metadata }) {
    try {
      if (notificationId) {
        await Notification.findByIdAndUpdate(notificationId, {
          status: 'delivered',
          deliveredAt: new Date(),
        });
      }
      return { success: true, messageId: String(notificationId || to) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = InAppProvider;
