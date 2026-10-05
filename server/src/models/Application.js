const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true
  },
  status: {
    type: String,
    enum: ['Applied', 'In Review', 'Shortlisted', 'Rejected', 'Hired'],
    default: 'Applied'
  },
  currentRound: {
    type: String,
    default: 'Application Review'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Ensure a student can only apply to an opportunity once
applicationSchema.index({ studentId: 1, opportunityId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
