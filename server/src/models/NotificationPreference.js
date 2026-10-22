const mongoose = require('mongoose');
const tenantPlugin = require('../plugins/tenantPlugin');

// Mandatory events where critical notifications must not be disabled
const MANDATORY_EVENTS = [
  'offer.extended',
  'interview.scheduled',
  'interview.reminder_1h',
];

const notificationPreferenceSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    channels: {
      in_app: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
    },
    pushSubscription: {
      endpoint: { type: String, default: '' },
      keys: {
        p256dh: { type: String, default: '' },
        auth: { type: String, default: '' },
      },
    },
    whatsappOptIn: {
      enabled: { type: Boolean, default: false },
      verifiedAt: { type: Date, default: null },
      phoneNumber: { type: String, default: '' },
    },
    emailUnsubscribed: {
      unsubscribed: { type: Boolean, default: false },
      unsubscribedAt: { type: Date, default: null },
    },
    // Map of eventType -> { in_app, email, push, whatsapp }
    customPreferences: {
      type: Map,
      of: new mongoose.Schema(
        {
          in_app: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          push: { type: Boolean, default: true },
          whatsapp: { type: Boolean, default: false },
        },
        { _id: false }
      ),
      default: {},
    },
  },
  { timestamps: true }
);

notificationPreferenceSchema.index({ collegeId: 1, userId: 1 }, { unique: true });

notificationPreferenceSchema.methods.isChannelAllowed = function (eventType, channel) {
  // If mandatory event, student cannot opt out of in_app or email
  if (MANDATORY_EVENTS.includes(eventType)) {
    if (channel === 'in_app' || channel === 'email') {
      return true;
    }
  }

  // Global email unsubscribe check
  if (channel === 'email' && this.emailUnsubscribed?.unsubscribed) {
    return false;
  }

  // WhatsApp requires explicit opt-in
  if (channel === 'whatsapp' && !this.whatsappOptIn?.enabled) {
    return false;
  }

  // Check event-specific override if present
  const eventPref = this.customPreferences?.get(eventType);
  if (eventPref && typeof eventPref[channel] === 'boolean') {
    return eventPref[channel];
  }

  // Fallback to general channel toggle
  return Boolean(this.channels?.[channel]);
};

notificationPreferenceSchema.plugin(tenantPlugin, { required: true });

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);
module.exports.MANDATORY_EVENTS = MANDATORY_EVENTS;
