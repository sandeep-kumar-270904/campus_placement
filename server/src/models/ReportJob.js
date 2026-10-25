const mongoose = require('mongoose');

const reportJobSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      index: true,
    },
    templateId: {
      type: String,
      required: true,
      enum: [
        'nirf-placement-report',
        'placement-brochure',
        'company-wise',
        'department-stats',
        'unplaced-candidates',
        'drive-funnel',
      ],
    },
    format: {
      type: String,
      required: true,
      enum: ['xlsx', 'pdf', 'csv'],
      default: 'xlsx',
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed'],
      default: 'queued',
      index: true,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    downloadUrl: {
      type: String,
      default: '',
    },
    fileName: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    rowCount: {
      type: Number,
      default: 0,
    },
    generatedBy: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      name: {
        type: String,
        default: 'TPO Officer',
      },
      email: {
        type: String,
        default: '',
      },
      role: {
        type: String,
        default: 'tpo',
      },
    },
    filters: {
      graduationYear: { type: String, default: '2026' },
      branch: { type: String, default: 'all' },
      dateRange: { type: String, default: '' },
    },
    error: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

reportJobSchema.index({ collegeId: 1, createdAt: -1 });

const tenantPlugin = require('../plugins/tenantPlugin');
reportJobSchema.plugin(tenantPlugin, { required: true });

const ReportJob = mongoose.model('ReportJob', reportJobSchema);
module.exports = ReportJob;
