const mongoose = require('mongoose');
const tenantPlugin = require('../plugins/tenantPlugin');

const announcementSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true,
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
  category: {
    type: String,
    enum: ['General', 'Placement Drive', 'Interview Alert', 'Policy Update', 'Urgent'],
    default: 'General',
  },
  segments: {
    targetAll: { type: Boolean, default: false },
    branches: [{ type: String }],
    graduationYears: [{ type: Number }],
    driveId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' },
    driveRound: { type: String, default: '' },
    placedStatus: {
      type: String,
      enum: ['all', 'unplaced_only', 'placed_only'],
      default: 'all',
    },
  },
  channels: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    smsOrWhatsapp: { type: Boolean, default: false },
  },
  scheduledAt: {
    type: Date,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipientCount: {
    type: Number,
    default: 0,
  },
  deliveryStats: {
    delivered: { type: Number, default: 0 },
    read: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
  },
  status: {
    type: String,
    enum: ['Draft', 'Scheduled', 'Sent', 'Cancelled'],
    default: 'Sent',
    index: true,
  },
}, { timestamps: true });

announcementSchema.index({ collegeId: 1, createdAt: -1 });
announcementSchema.index({ collegeId: 1, status: 1, scheduledAt: 1 });

announcementSchema.plugin(tenantPlugin, { required: true });

module.exports = mongoose.model('Announcement', announcementSchema);
