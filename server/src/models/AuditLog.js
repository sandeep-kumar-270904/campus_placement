const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    index: true,
    default: null,
  },
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  actor: {
    type: String, // Email or name identifier
    required: true,
    index: true,
  },
  actorEmail: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    required: true,
    index: true,
  },
  actorRole: {
    type: String,
    default: '',
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  entity: {
    type: String,
    required: true,
    index: true,
  },
  targetModel: {
    type: String,
    default: '',
  },
  entityId: {
    type: String,
    default: '',
    index: true,
  },
  targetId: {
    type: String,
    default: '',
  },
  before: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  beforeState: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  after: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  afterState: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  ip: {
    type: String,
    default: '127.0.0.1',
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

// Pre-save hook to ensure alias fields stay synchronized
auditLogSchema.pre('save', function (next) {
  if (!this.actor && this.actorEmail) this.actor = this.actorEmail;
  if (!this.actorEmail && this.actor) this.actorEmail = this.actor;
  if (!this.role && this.actorRole) this.role = this.actorRole;
  if (!this.actorRole && this.role) this.actorRole = this.role;
  if (!this.entity && this.targetModel) this.entity = this.targetModel;
  if (!this.targetModel && this.entity) this.targetModel = this.entity;
  if (!this.entityId && this.targetId) this.entityId = this.targetId;
  if (!this.targetId && this.entityId) this.targetId = this.entityId;
  if (!this.before && this.beforeState) this.before = this.beforeState;
  if (!this.beforeState && this.before) this.beforeState = this.before;
  if (!this.after && this.afterState) this.after = this.afterState;
  if (!this.afterState && this.after) this.afterState = this.after;
  if (!this.ip && this.ipAddress) this.ip = this.ipAddress;
  if (!this.ipAddress && this.ip) this.ipAddress = this.ip;
  next();
});

// Compound indexes for fast tenant filtering, action auditing, and date range exports
auditLogSchema.index({ collegeId: 1, createdAt: -1 });
auditLogSchema.index({ collegeId: 1, action: 1 });
auditLogSchema.index({ collegeId: 1, entity: 1 });
auditLogSchema.index({ collegeId: 1, actor: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
