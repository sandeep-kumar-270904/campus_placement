const INotificationProvider = require('./INotificationProvider');

class EmailProvider extends INotificationProvider {
  constructor(options = {}) {
    super();
    this.apiKey = options.apiKey || process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY || null;
    this.fromEmail = options.fromEmail || process.env.FROM_EMAIL || 'notifications@placeearly.edu';
    this.providerName = process.env.RESEND_API_KEY ? 'Resend' : process.env.SENDGRID_API_KEY ? 'SendGrid' : 'DevMock';
  }

  async send({ to, recipientName, title, body, metadata, unsubscribeUrl }) {
    if (!to || !to.includes('@')) {
      return { success: false, error: 'Invalid recipient email address.' };
    }

    try {
      // If Resend API key is provided
      if (process.env.RESEND_API_KEY) {
        // Direct REST dispatch to Resend API
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: this.fromEmail,
            to: [to],
            subject: title,
            html: body,
            headers: unsubscribeUrl
              ? {
                  'List-Unsubscribe': `<${unsubscribeUrl}>`,
                  'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
                }
              : {},
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.message || 'Resend delivery failed' };
        }
        return { success: true, messageId: data.id };
      }

      // Default / Dev / Test Mock execution
      const mockMessageId = `email_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      return {
        success: true,
        messageId: mockMessageId,
      };
    } catch (err) {
      return { success: false, error: err.message || 'Email delivery exception' };
    }
  }
}

module.exports = EmailProvider;
