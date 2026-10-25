const mongoose = require('mongoose');

const internshipRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      index: true,
    },
    opportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    stipendMonthly: {
      type: Number,
      required: true,
      default: 25000,
    },
    durationMonths: {
      type: Number,
      required: true,
      default: 6,
    },
    startDate: {
      type: Date,
      default: () => new Date(),
    },
    endDate: {
      type: Date,
    },
    mode: {
      type: String,
      enum: ['Online', 'Onsite', 'Hybrid'],
      default: 'Onsite',
    },
    location: {
      type: String,
      default: 'Bengaluru, India',
    },
    mentorName: {
      type: String,
      default: '',
    },
    mentorEmail: {
      type: String,
      default: '',
    },
    ppoStatus: {
      type: String,
      enum: ['In Progress', 'PPO Offered', 'PPO Accepted', 'PPO Rejected', 'No Conversion'],
      default: 'In Progress',
      index: true,
    },
    ppoDetails: {
      ctc: { type: Number, default: 0 },
      fixedCtc: { type: Number, default: 0 },
      variableCtc: { type: Number, default: 0 },
      role: { type: String, default: '' },
      offerLetterUrl: { type: String, default: '' },
      conversionDate: { type: Date },
    },
    performanceRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    notes: {
      type: String,
      default: '',
    },
    isVerifiedByTPO: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

internshipRecordSchema.index({ collegeId: 1, ppoStatus: 1 });
internshipRecordSchema.index({ collegeId: 1, studentId: 1 });

const tenantPlugin = require('../plugins/tenantPlugin');
internshipRecordSchema.plugin(tenantPlugin, { required: true });

const InternshipRecord = mongoose.model('InternshipRecord', internshipRecordSchema);
module.exports = InternshipRecord;
