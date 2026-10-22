/**
 * Unified Notification Provider Interface
 */
class INotificationProvider {
  /**
   * @param {Object} payload
   * @param {string} payload.to - Recipient identifier (user ID, email, phone, or push subscription)
   * @param {string} payload.recipientName - Full name of recipient
   * @param {string} payload.title - Subject or title
   * @param {string} payload.body - Formatted text or HTML body
   * @param {string} [payload.deepLink] - Optional URL or route to navigate to
   * @param {Object} [payload.metadata] - Extra entity metadata
   * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
   */
  async send(payload) {
    throw new Error('send() must be implemented by provider');
  }
}

module.exports = INotificationProvider;
