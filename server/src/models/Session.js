const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    index: true,
    default: null,
  },
  tokenHash: {
    type: String,
    required: true,
    index: true,
  },
  family: {
    type: String,
    required: true,
    index: true,
  },
  isRevoked: {
    type: Boolean,
    default: false,
    index: true,
  },
  deviceInfo: {
    browser: { type: String, default: 'Unknown Browser' },
    os: { type: String, default: 'Unknown OS' },
    device: { type: String, default: 'Desktop' },
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1',
  },
  userAgent: {
    type: String,
    default: '',
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // MongoDB TTL auto-cleanup when expiresAt is reached
  },
}, { timestamps: true });

// Compound indexes for session querying and rotation verification
sessionSchema.index({ userId: 1, isRevoked: 1 });
sessionSchema.index({ family: 1, isRevoked: 1 });
sessionSchema.index({ collegeId: 1, userId: 1 });
sessionSchema.index({ collegeId: 1, tokenHash: 1 });

const tenantPlugin = require('../plugins/tenantPlugin');
sessionSchema.plugin(tenantPlugin, { required: false });

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
