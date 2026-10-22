const mongoose = require('mongoose');
const tenantPlugin = require('../plugins/tenantPlugin');

const interviewSlotSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true,
    index: true,
  },
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true,
    index: true,
  },
  roundName: {
    type: String,
    required: true,
    trim: true,
  },
  roundNumber: {
    type: Number,
    default: 1,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  panelName: {
    type: String,
    default: 'Panel 1',
    trim: true,
  },
  interviewerNames: [{
    type: String,
  }],
  date: {
    type: Date,
    required: true,
    index: true,
  },
  startTime: {
    type: String, // HH:mm format, e.g. "10:00"
    required: true,
  },
  endTime: {
    type: String, // HH:mm format, e.g. "10:45"
    required: true,
  },
  startDateTime: {
    type: Date,
    required: true,
    index: true,
  },
  endDateTime: {
    type: Date,
    required: true,
    index: true,
  },
  mode: {
    type: String,
    enum: ['Online', 'Offline', 'Hybrid'],
    default: 'Online',
  },
  roomOrLink: {
    type: String,
    default: '',
    trim: true,
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Rescheduled'],
    default: 'Scheduled',
    index: true,
  },
  cancellationReason: {
    type: String,
    default: '',
  },
  feedbackSummary: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

interviewSlotSchema.index({ collegeId: 1, opportunityId: 1, status: 1 });
interviewSlotSchema.index({ collegeId: 1, studentId: 1, startDateTime: 1, endDateTime: 1 });
interviewSlotSchema.index({ collegeId: 1, panelName: 1, startDateTime: 1, endDateTime: 1 });

interviewSlotSchema.plugin(tenantPlugin, { required: true });

module.exports = mongoose.model('InterviewSlot', interviewSlotSchema);
