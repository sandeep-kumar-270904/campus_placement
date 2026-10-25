const mongoose = require('mongoose');

const interviewRoundSchema = new mongoose.Schema(
  {
    roundName: {
      type: String,
      required: true,
      default: 'Round 1: Online Assessment',
    },
    roundType: {
      type: String,
      enum: ['OA', 'Technical', 'System Design', 'HR', 'Managerial', 'Behavioral'],
      default: 'Technical',
    },
    durationMinutes: {
      type: Number,
      default: 60,
    },
    questions: {
      type: [String],
      default: [],
    },
    tips: {
      type: String,
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
  },
  { _id: false }
);

const interviewExperienceSchema = new mongoose.Schema(
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
    jobType: {
      type: String,
      enum: ['Full-time', 'Internship', 'Internship+FTE'],
      default: 'Full-time',
    },
    batchYear: {
      type: Number,
      default: 2026,
    },
    branch: {
      type: String,
      default: 'Computer Science',
    },
    overallDifficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
      index: true,
    },
    outcome: {
      type: String,
      enum: ['Selected', 'Rejected', 'Waitlisted'],
      default: 'Selected',
      index: true,
    },
    rounds: {
      type: [interviewRoundSchema],
      default: [],
    },
    preparationTips: {
      type: String,
      default: '',
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending_review', 'approved', 'rejected'],
      default: 'pending_review',
      index: true,
    },
    tpoReviewNote: {
      type: String,
      default: '',
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    moderatedAt: {
      type: Date,
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    upvoteCount: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true }
);

interviewExperienceSchema.index({ collegeId: 1, status: 1, upvoteCount: -1 });
interviewExperienceSchema.index({ collegeId: 1, company: 1 });

const tenantPlugin = require('../plugins/tenantPlugin');
interviewExperienceSchema.plugin(tenantPlugin, { required: true });

const InterviewExperience = mongoose.model('InterviewExperience', interviewExperienceSchema);
module.exports = InterviewExperience;
