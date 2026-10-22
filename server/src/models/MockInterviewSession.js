const mongoose = require('mongoose');

const transcriptMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['ai', 'student', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    questionNumber: {
      type: Number,
      default: null,
    },
  },
  { _id: false }
);

const rubricScoreSchema = new mongoose.Schema(
  {
    communication: { type: Number, default: 0, min: 0, max: 10 },
    correctness: { type: Number, default: 0, min: 0, max: 10 },
    depth: { type: Number, default: 0, min: 0, max: 10 },
    structure: { type: Number, default: 0, min: 0, max: 10 },
    overallScore: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: false }
);

const mockInterviewSessionSchema = new mongoose.Schema(
  {
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
    company: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    roundType: {
      type: String,
      enum: ['Technical', 'HR', 'System Design', 'Behavioral'],
      required: true,
    },
    status: {
      type: String,
      enum: ['In_Progress', 'Completed', 'Abandoned'],
      default: 'In_Progress',
      index: true,
    },
    transcript: [transcriptMessageSchema],
    currentQuestionIndex: {
      type: Number,
      default: 1,
    },
    maxQuestions: {
      type: Number,
      default: 5,
    },
    rubricScore: rubricScoreSchema,
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    studyPlan: [{ type: String }],
    feedbackSummary: {
      type: String,
      default: '',
    },
    isAiGenerated: {
      type: Boolean,
      default: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

mockInterviewSessionSchema.index({ studentId: 1, createdAt: -1 });

const MockInterviewSession = mongoose.model(
  'MockInterviewSession',
  mockInterviewSessionSchema
);

module.exports = MockInterviewSession;
