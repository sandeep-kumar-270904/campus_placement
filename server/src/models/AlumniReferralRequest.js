const mongoose = require('mongoose');

const alumniReferralRequestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    alumniId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AlumniProfile',
      required: true,
      index: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      index: true,
    },
    requestType: {
      type: String,
      enum: ['Referral', 'Mentorship'],
      default: 'Referral',
    },
    targetCompany: {
      type: String,
      required: true,
    },
    targetRole: {
      type: String,
      required: true,
    },
    jobUrlOrId: {
      type: String,
      default: '',
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Declined', 'Referred'],
      default: 'Pending',
      index: true,
    },
    alumniNote: {
      type: String,
      default: '',
    },
    respondedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Compound index to facilitate weekly rate-limiting queries
alumniReferralRequestSchema.index({ studentId: 1, createdAt: -1 });
alumniReferralRequestSchema.index({ collegeId: 1, studentId: 1 });
alumniReferralRequestSchema.index({ collegeId: 1, alumniId: 1 });

const tenantPlugin = require('../plugins/tenantPlugin');
alumniReferralRequestSchema.plugin(tenantPlugin, { required: true });

const AlumniReferralRequest = mongoose.model('AlumniReferralRequest', alumniReferralRequestSchema);
module.exports = AlumniReferralRequest;
