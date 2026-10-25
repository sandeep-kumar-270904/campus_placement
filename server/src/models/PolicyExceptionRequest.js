const mongoose = require('mongoose');
const tenantPlugin = require('../plugins/tenantPlugin');

const exceptionDocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
}, { _id: false });

const policyExceptionRequestSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true,
    index: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true,
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
      'cgpa_exception',
      'backlog_waiver',
      'general',
    ],
    default: 'general',
    required: true,
  },
  justification: {
    type: String,
    required: [true, 'A written justification is required for the policy exception appeal'],
    trim: true,
  },
  documents: [exceptionDocumentSchema],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
    index: true,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewRemarks: {
    type: String,
    default: '',
  },
  reviewedAt: {
    type: Date,
  },
  overrideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PolicyOverride',
  },
}, { timestamps: true });

policyExceptionRequestSchema.index({ collegeId: 1, studentId: 1, opportunityId: 1 });
policyExceptionRequestSchema.plugin(tenantPlugin, { required: true });

module.exports = mongoose.model('PolicyExceptionRequest', policyExceptionRequestSchema);
