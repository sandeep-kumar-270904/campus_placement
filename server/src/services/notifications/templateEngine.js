const jwt = require('jsonwebtoken');
const NotificationTemplate = require('../../models/NotificationTemplate');
const { DEFAULT_TEMPLATES } = require('../../models/NotificationTemplate');

/**
 * Generate a signed one-click unsubscribe URL token for email recipients
 */
function generateUnsubscribeUrl(userId, collegeId) {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  const token = jwt.sign(
    { userId, collegeId, action: 'email_unsubscribe' },
    secret,
    { expiresIn: '90d' }
  );
  const baseUrl = process.env.APP_URL || 'https://placeearly.edu';
  return `${baseUrl}/api/notifications/unsubscribe?token=${token}`;
}

/**
 * Replace all {{variable}} placeholders with corresponding values
 */
function interpolate(templateString, variables = {}) {
  if (!templateString || typeof templateString !== 'string') return '';
  return templateString.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    return variables[key] !== undefined && variables[key] !== null ? String(variables[key]) : '';
  });
}

/**
 * Resolve template for a given college and event type, applying defaults and variable interpolation
 */
async function resolveAndRender({ collegeId, eventType, channel, variables = {} }) {
  let templateObj = null;

  if (collegeId) {
    templateObj = await NotificationTemplate.findOne({ collegeId, eventType }).lean();
  }

  const defaultForEvent = DEFAULT_TEMPLATES[eventType] || DEFAULT_TEMPLATES['system.test_send'];
  const channelTemplate =
    templateObj?.channels?.[channel] && Object.values(templateObj.channels[channel]).some(Boolean)
      ? templateObj.channels[channel]
      : defaultForEvent[channel] || {};

  // Inject unsubscribeUrl if missing and email channel
  if (channel === 'email' && !variables.unsubscribeUrl && variables.userId) {
    variables.unsubscribeUrl = generateUnsubscribeUrl(variables.userId, collegeId);
  }

  const rendered = {};
  for (const [key, val] of Object.entries(channelTemplate)) {
    if (typeof val === 'string') {
      rendered[key] = interpolate(val, variables);
    } else {
      rendered[key] = val;
    }
  }

  // Ensure mandatory unsubscribe footer for email html
  if (channel === 'email' && variables.unsubscribeUrl) {
    const unsubFooter = `<p style="font-size:11px;color:#94a3b8;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:12px;">You received this email because you are a registered student at your institution. <a href="${variables.unsubscribeUrl}" style="color:#64748b;">Unsubscribe from notification emails</a></p>`;
    if (rendered.bodyHtml && !rendered.bodyHtml.includes('unsubscribe')) {
      rendered.bodyHtml += unsubFooter;
    }
  }

  return rendered;
}

function verifyUnsubscribeToken(token) {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  return jwt.verify(token, secret);
}

module.exports = {
  interpolate,
  renderTemplate: interpolate,
  generateUnsubscribeUrl,
  verifyUnsubscribeToken,
  resolveAndRender,
};
