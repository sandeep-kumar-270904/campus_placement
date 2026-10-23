const mongoose = require('mongoose');

const alumniProfileSchema = new mongoose.Schema(
  {
    userId: {
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
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    batchYear: {
      type: Number,
      required: true,
      index: true,
    },
    branch: {
      type: String,
      required: true,
      index: true,
    },
    currentCompany: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    currentRole: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      default: 'Bengaluru, India',
    },
    linkedinUrl: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    isVerifiedAlumni: {
      type: Boolean,
      default: false,
      index: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    verificationMethod: {
      type: String,
      enum: ['domain_email', 'tpo_manual', 'roll_no_match'],
      default: 'tpo_manual',
    },
    willingToRefer: {
      type: Boolean,
      default: true,
      index: true,
    },
    willingToMentor: {
      type: Boolean,
      default: true,
      index: true,
    },
    mentorshipDomains: {
      type: [String],
      default: ['Software Engineering', 'System Design', 'Core CS'],
    },
    totalReferralsProvided: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

alumniProfileSchema.index({ collegeId: 1, currentCompany: 1, branch: 1 });

const AlumniProfile = mongoose.model('AlumniProfile', alumniProfileSchema);
module.exports = AlumniProfile;
