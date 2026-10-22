const mongoose = require('mongoose');
const tenantPlugin = require('../plugins/tenantPlugin');

const opportunitySchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  companyLogo: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['Job', 'Internship'],
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  salary: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  eligibilityRules: {
    minCgpa: {
      type: Number,
      default: 0,
    },
    maxBacklogs: {
      type: Number,
      default: 0,
    },
    allowedBranches: [{
      type: String,
    }],
  },
  deadline: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open',
    index: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

// Compound indexes for tenant-scoped opportunity queries
opportunitySchema.index({ collegeId: 1, status: 1, deadline: 1 });
opportunitySchema.index({ collegeId: 1, createdAt: -1 });

// Apply tenant plugin
opportunitySchema.plugin(tenantPlugin, { required: true });

module.exports = mongoose.model('Opportunity', opportunitySchema);
