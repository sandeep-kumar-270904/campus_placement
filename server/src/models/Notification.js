const mongoose = require('mongoose');
const tenantPlugin = require('../plugins/tenantPlugin');

const notificationSchema = new mongoose.Schema(
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
    eventId: {
      type: String,
      default: '',
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        'drive.published',
        'drive.deadline_24h',
        'drive.deadline_3h',
        'application.status_changed',
        'interview.scheduled',
        'interview.reminder_1d',
        'interview.reminder_1h',
        'offer.extended',
        'verification.approved',
        'verification.rejected',
        'announcement.sent',
        'system.test_send',
      ],
      index: true,
    },
    channel: {
      type: String,
      required: true,
      enum: ['in_app', 'email', 'push', 'whatsapp', 'sms'],
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    deepLink: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['queued', 'sent', 'delivered', 'failed', 'read', 'skipped'],
      default: 'queued',
      index: true,
    },
    failureReason: {
      type: String,
      default: '',
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    nextRetryAt: {
      type: Date,
      default: null,
      index: true,
    },
    idempotencyKey: {
      type: String,
      required: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isMandatory: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    queuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound indexes for unread lookups, delivery reports, and queue processing
notificationSchema.index({ collegeId: 1, userId: 1, channel: 1, status: 1 });
notificationSchema.index({ collegeId: 1, status: 1, nextRetryAt: 1 });
notificationSchema.index({ collegeId: 1, idempotencyKey: 1 }, { unique: true });

notificationSchema.plugin(tenantPlugin, { required: true });

module.exports = mongoose.model('Notification', notificationSchema);
