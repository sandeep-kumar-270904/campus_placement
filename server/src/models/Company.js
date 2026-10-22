const mongoose = require('mongoose');
const tenantPlugin = require('../plugins/tenantPlugin');

const contactPersonSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  designation: { type: String, default: '' },
  email: { type: String, default: '', trim: true, lowercase: true },
  phone: { type: String, default: '' },
  linkedIn: { type: String, default: '' },
  isPrimary: { type: Boolean, default: false },
});

const companySchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  logo: {
    type: String,
    default: '',
  },
  industry: {
    type: String,
    default: 'Software & Technology',
  },
  tier: {
    type: String,
    enum: ['Super Dream', 'Dream', 'Core', 'Standard'],
    default: 'Dream',
  },
  status: {
    type: String,
    enum: ['prospect', 'invited', 'confirmed', 'visited'],
    default: 'prospect',
    index: true,
  },
  website: {
    type: String,
    default: '',
  },
  contactPersons: [contactPersonSchema],
  pastVisits: [{
    year: { type: Number },
    driveDate: { type: Date },
    hiredCount: { type: Number, default: 0 },
    highestCtc: { type: Number, default: 0 },
    avgCtc: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  }],
  hiresHistory: [{
    year: { type: Number },
    count: { type: Number, default: 0 },
    roles: [{ type: String }],
  }],
  ctcHistory: [{
    year: { type: Number },
    minCtc: { type: Number, default: 0 },
    maxCtc: { type: Number, default: 0 },
    avgCtc: { type: Number, default: 0 },
  }],
  notes: [{
    note: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  }],
  followUpReminders: [{
    title: { type: String, required: true },
    dueDate: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

companySchema.index({ collegeId: 1, name: 1 }, { unique: true });
companySchema.index({ collegeId: 1, status: 1 });
companySchema.index({ collegeId: 1, tier: 1 });

companySchema.plugin(tenantPlugin, { required: true });

module.exports = mongoose.model('Company', companySchema);
