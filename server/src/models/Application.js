const mongoose = require('mongoose');
const tenantPlugin = require('../plugins/tenantPlugin');

const applicationSchema = new mongoose.Schema({
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
  },
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true,
  },
  status: {
    type: String,
    enum: [
      'Applied',
      'In Review',
      'Online Assessment',
      'Shortlisted',
      'Technical Round',
      'HR Round',
      'Offer Extended',
      'Hired',
      'Placed',
      'Rejected',
    ],
    default: 'Applied',
    index: true,
  },
  currentRound: {
    type: String,
    default: 'Application Review',
  },
  interviewSchedule: {
    roundName: { type: String },
    date: { type: Date },
    time: { type: String },
    venueOrLink: { type: String },
    notes: { type: String },
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Compound unique index ensuring student can only apply once to a drive within their college
applicationSchema.index({ collegeId: 1, studentId: 1, opportunityId: 1 }, { unique: true });
applicationSchema.index({ collegeId: 1, opportunityId: 1, status: 1 });
applicationSchema.index({ collegeId: 1, studentId: 1 });

// Apply tenant plugin
applicationSchema.plugin(tenantPlugin, { required: true });

module.exports = mongoose.model('Application', applicationSchema);
