const INotificationProvider = require('./INotificationProvider');

class SmsProvider extends INotificationProvider {
  constructor() {
    super();
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || null;
    this.authToken = process.env.TWILIO_AUTH_TOKEN || null;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '+15005550006';
  }

  async send({ to, title, body, metadata }) {
    if (!to || typeof to !== 'string' || to.trim().length < 6) {
      return { success: false, error: 'Recipient mobile number is invalid.' };
    }

    try {
      const mockId = `sms_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      return {
        success: true,
        messageId: mockId,
      };
    } catch (err) {
      return { success: false, error: err.message || 'SMS delivery failed' };
    }
  }
}

module.exports = SmsProvider;
