const mongoose = require('mongoose');
const tenantPlugin = require('../plugins/tenantPlugin');

const roundHistorySchema = new mongoose.Schema({
  roundName: { type: String, required: true },
  status: { type: String, required: true },
  movedAt: { type: Date, default: Date.now },
  movedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String, default: '' },
}, { _id: false });

const feedbackSchema = new mongoose.Schema({
  roundName: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, default: 3 },
  strengths: { type: String, default: '' },
  gaps: { type: String, default: '' },
  comments: { type: String, default: '' },
  visibleToStudent: { type: Boolean, default: false },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const offerSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['None', 'Pending', 'Accepted', 'Declined'],
    default: 'None',
  },
  role: { type: String, default: '' },
  ctc: { type: Number, default: 0 },
  fixedCtc: { type: Number, default: 0 },
  variableCtc: { type: Number, default: 0 },
  joiningDate: { type: Date },
  offerLetterUrl: { type: String, default: '' },
  decisionDate: { type: Date },
  remarks: { type: String, default: '' },
}, { _id: false });

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
  rejectionReason: {
    type: String,
    default: '',
  },
  interviewSchedule: {
    roundName: { type: String },
    date: { type: Date },
    time: { type: String },
    venueOrLink: { type: String },
    notes: { type: String },
  },
  roundHistory: [roundHistorySchema],
  feedback: [feedbackSchema],
  offer: {
    type: offerSchema,
    default: () => ({ status: 'None' }),
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
applicationSchema.index({ collegeId: 1, 'offer.status': 1 });

// Apply tenant plugin
applicationSchema.plugin(tenantPlugin, { required: true });

module.exports = mongoose.model('Application', applicationSchema);
