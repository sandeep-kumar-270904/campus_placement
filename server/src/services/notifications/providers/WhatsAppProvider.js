const INotificationProvider = require('./INotificationProvider');

class WhatsAppProvider extends INotificationProvider {
  constructor() {
    super();
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || null;
    this.authToken = process.env.TWILIO_AUTH_TOKEN || null;
    this.fromNumber = process.env.WHATSAPP_FROM || 'whatsapp:+14155238886';
  }

  async send({ to, recipientName, title, body, metadata }) {
    if (!to || typeof to !== 'string' || to.trim().length < 6) {
      return { success: false, error: 'Recipient phone number is invalid or missing.' };
    }

    try {
      // Meta WhatsApp Cloud API dispatch
      if (process.env.META_WHATSAPP_TOKEN && process.env.META_WHATSAPP_PHONE_NUMBER_ID) {
        const cleanNumber = to.replace(/[^0-9]/g, '');
        const res = await fetch(
          `https://graph.facebook.com/v19.0/${process.env.META_WHATSAPP_PHONE_NUMBER_ID}/messages`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.META_WHATSAPP_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: cleanNumber,
              type: 'text',
              text: { preview_url: false, body },
            }),
          }
        );

        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error?.message || 'Meta WhatsApp dispatch failed' };
        }
        return { success: true, messageId: data.messages?.[0]?.id || `wa_${Date.now()}` };
      }

      if (this.accountSid && this.authToken) {
        // Twilio WhatsApp dispatch
        const cleanTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
        const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
        const params = new URLSearchParams({
          From: this.fromNumber,
          To: cleanTo,
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
          return { success: false, error: data.message || 'Twilio WhatsApp dispatch failed' };
        }
        return { success: true, messageId: data.sid };
      }

      // Dev / Test Mock
      const mockId = `wa_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      return {
        success: true,
        messageId: mockId,
      };
    } catch (err) {
      return { success: false, error: err.message || 'WhatsApp delivery exception' };
    }
  }
}

module.exports = WhatsAppProvider;
