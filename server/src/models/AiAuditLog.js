const mongoose = require('mongoose');

const aiAuditLogSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      index: true,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: true,
    },
    userRole: {
      type: String,
      enum: ['student', 'tpo', 'coordinator', 'recruiter', 'admin', 'superadmin'],
      required: true,
    },
    feature: {
      type: String,
      required: true,
      enum: [
        'resume_match',
        'mock_interview',
        'company_prep_pack',
        'placement_risk',
        'nl_tpo_query',
        'jd_parser',
        'feedback_summarizer',
      ],
      index: true,
    },
    model: {
      type: String,
      required: true,
      default: 'claude-3-5-sonnet-20241022',
    },
    promptTokens: {
      type: Number,
      default: 0,
    },
    completionTokens: {
      type: Number,
      default: 0,
    },
    totalTokens: {
      type: Number,
      default: 0,
    },
    estimatedCostUsd: {
      type: Number,
      default: 0,
    },
    latencyMs: {
      type: Number,
      default: 0,
    },
    isFallback: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['success', 'rate_limited', 'fallback', 'error'],
      default: 'success',
    },
    sanitizedMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      // Strictly no PII (no raw resume text, emails, phones, or names)
    },
  },
  { timestamps: true }
);

aiAuditLogSchema.index({ createdAt: -1 });

const AiAuditLog = mongoose.model('AiAuditLog', aiAuditLogSchema);
module.exports = AiAuditLog;
