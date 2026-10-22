const mongoose = require('mongoose');
const tenantPlugin = require('../plugins/tenantPlugin');

const roundDefinitionSchema = new mongoose.Schema({
  roundNumber: { type: Number, required: true },
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['OA', 'Technical', 'HR', 'GD', 'Aptitude', 'Other'],
    default: 'Technical',
  },
  mode: {
    type: String,
    enum: ['Online', 'Offline', 'Hybrid'],
    default: 'Online',
  },
  expectedDate: { type: Date },
  venueOrLink: { type: String, default: '' },
}, { _id: false });

const opportunitySchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true,
    index: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
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
    default: 'Job',
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Internship', 'PPO', 'Internship+PPO', 'Job'],
    default: 'Full-time',
  },
  location: {
    type: String,
    required: true,
  },
  salary: {
    type: String,
    required: true,
  },
  ctc: {
    fixed: { type: Number, default: 0 },
    variable: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    lpaString: { type: String, default: '' },
  },
  description: {
    type: String,
    required: true,
  },
  driveDate: {
    type: Date,
  },
  deadline: {
    type: Date,
    required: true,
  },
  scheduledPublishAt: {
    type: Date,
  },
  rounds: [roundDefinitionSchema],
  eligibilityRules: {
    minCgpa: { type: Number, default: 0 },
    maxBacklogs: { type: Number, default: 0 },
    allowedBranches: [{ type: String }],
    allowedGraduationYears: [{ type: Number }],
    minTenthPercentage: { type: Number, default: 0 },
    minTwelfthPercentage: { type: Number, default: 0 },
    genderNeutral: { type: Boolean, default: true },
  },
  requiredDocuments: [{
    type: String,
  }],
  bondDetails: {
    type: String,
    default: '',
  },
  attachments: [{
    name: { type: String },
    url: { type: String },
  }],
  status: {
    type: String,
    enum: ['Draft', 'Open', 'Closed', 'In Progress', 'Completed', 'Archived'],
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
opportunitySchema.index({ collegeId: 1, companyName: 1 });

// Apply tenant plugin
opportunitySchema.plugin(tenantPlugin, { required: true });

module.exports = mongoose.model('Opportunity', opportunitySchema);
