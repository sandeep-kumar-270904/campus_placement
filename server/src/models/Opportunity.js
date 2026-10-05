const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
  },
  companyLogo: {
    type: String, // URL
  },
  type: {
    type: String,
    enum: ['Job', 'Internship'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  salary: {
    type: String, // e.g. "24 LPA"
    required: true
  },
  description: {
    type: String,
    required: true
  },
  eligibilityRules: {
    minCgpa: {
      type: Number,
      default: 0
    },
    maxBacklogs: {
      type: Number,
      default: 0
    },
    allowedBranches: [{
      type: String
    }]
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // TPO who created it
  }
}, { timestamps: true });

module.exports = mongoose.model('Opportunity', opportunitySchema);
