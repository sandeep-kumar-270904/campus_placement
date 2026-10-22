const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    index: true,
  },
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  actorEmail: {
    type: String,
    required: true,
  },
  actorRole: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  targetModel: {
    type: String,
    required: true,
  },
  targetId: {
    type: String,
  },
  beforeState: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  afterState: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1',
  },
  userAgent: {
    type: String,
    default: '',
  },
}, { timestamps: { createdAt: true, updatedAt: false } });

// Compound indexes for tenant-scoped audit searching
auditLogSchema.index({ collegeId: 1, createdAt: -1 });
auditLogSchema.index({ collegeId: 1, action: 1 });
auditLogSchema.index({ collegeId: 1, actorId: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
