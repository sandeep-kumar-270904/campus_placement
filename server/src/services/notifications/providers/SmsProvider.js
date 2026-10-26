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
      if (this.accountSid && this.authToken) {
        const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
        const params = new URLSearchParams({
          From: this.fromNumber,
          To: to,
          Body: body,
        });

        const res = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          }
        );

        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.message || 'Twilio SMS dispatch failed' };
        }
        return { success: true, messageId: data.sid };
      }

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
