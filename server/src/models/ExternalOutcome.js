const mongoose = require('mongoose');

const externalOutcomeSchema = new mongoose.Schema(
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
    category: {
      type: String,
      enum: ['Off-Campus Placement', 'Higher Studies', 'Entrepreneurship'],
      required: true,
      index: true,
    },
    // Category 1: Off-Campus Placement
    offCampusDetails: {
      companyName: { type: String, default: '' },
      role: { type: String, default: '' },
      ctcLpa: { type: Number, default: 0 },
      location: { type: String, default: '' },
      offerLetterUrl: { type: String, default: '' },
      joiningDate: { type: Date },
    },
    // Category 2: Higher Studies
    higherStudiesDetails: {
      universityName: { type: String, default: '' },
      degree: {
        type: String,
        enum: ['MS', 'MTech', 'MBA', 'PhD', 'Other', ''],
        default: 'MS',
      },
      country: { type: String, default: 'India' },
      program: { type: String, default: '' },
      examTaken: {
        type: String,
        enum: ['GATE', 'GRE', 'CAT', 'GMAT', 'TOEFL', 'IELTS', 'None', ''],
        default: 'GATE',
      },
      score: { type: String, default: '' },
      admissionLetterUrl: { type: String, default: '' },
    },
    // Category 3: Entrepreneurship
    entrepreneurshipDetails: {
      startupName: { type: String, default: '' },
      sector: { type: String, default: 'Technology / SaaS' },
      role: { type: String, default: 'Founder' },
      incorporationDate: { type: Date },
      website: { type: String, default: '' },
      teamSize: { type: Number, default: 1 },
      fundingRaisedLakhs: { type: Number, default: 0 },
      cinOrUdyamNumber: { type: String, default: '' },
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

externalOutcomeSchema.index({ collegeId: 1, category: 1, verificationStatus: 1 });
externalOutcomeSchema.index({ collegeId: 1, studentId: 1 });

const tenantPlugin = require('../plugins/tenantPlugin');
externalOutcomeSchema.plugin(tenantPlugin, { required: true });

const ExternalOutcome = mongoose.model('ExternalOutcome', externalOutcomeSchema);
module.exports = ExternalOutcome;
