const mongoose = require('mongoose');
const tenantPlugin = require('../plugins/tenantPlugin');

const policyOverrideSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true,
    index: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required for policy override'],
    index: true,
  },
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    default: null, // null means global override for this student across all drives
    index: true,
  },
  policyType: {
    type: String,
    enum: [
      'one_student_one_offer',
      'dream_cap',
      'tier_eligibility',
      'priority_unplaced',
      'max_concurrent_apps',
      'blackout_dates',
      'all',
    ],
    required: [true, 'Policy type is required for override'],
  },
  mandatoryReason: {
    type: String,
    required: [true, 'A mandatory reason is required to grant an institutional policy override'],
    trim: true,
    minlength: [5, 'Reason must be at least 5 characters long'],
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Approver TPO ID is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  revokedAt: {
    type: Date,
  },
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  revocationReason: {
    type: String,
    default: '',
  },
}, { timestamps: true });

policyOverrideSchema.index({ collegeId: 1, studentId: 1, isActive: 1 });
policyOverrideSchema.plugin(tenantPlugin, { required: true });

module.exports = mongoose.model('PolicyOverride', policyOverrideSchema);
