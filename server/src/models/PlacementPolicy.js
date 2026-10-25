const mongoose = require('mongoose');
const tenantPlugin = require('../plugins/tenantPlugin');

const tierDefinitionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  minCtc: {
    type: Number,
    required: true,
    default: 0,
  },
  maxCtc: {
    type: Number,
    default: null, // null means infinity / unbounded
  },
  order: {
    type: Number,
    required: true,
    default: 1,
  },
}, { _id: false });

const blackoutDateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    default: 'Institutional Blackout Window',
  },
  appliesToAllDrives: {
    type: Boolean,
    default: true,
  },
  affectedDriveIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
  }],
});

const DEFAULT_TIERS = [
  { name: 'Standard', minCtc: 0, maxCtc: 6, order: 1 },
  { name: 'Core', minCtc: 6, maxCtc: 10, order: 2 },
  { name: 'Dream', minCtc: 10, maxCtc: 20, order: 3 },
  { name: 'Super Dream', minCtc: 20, maxCtc: null, order: 4 },
];

const placementPolicySchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true,
    unique: true,
    index: true,
  },

  // 1. One-student-one-offer
  oneStudentOneOffer: {
    enabled: { type: Boolean, default: false },
    effectiveFrom: { type: Date },
    effectiveTo: { type: Date },
    allowHold: { type: Boolean, default: false },
  },

  // 2. Dream cap
  dreamCap: {
    enabled: { type: Boolean, default: false },
    maxDreamOffers: { type: Number, default: 1 },
    dreamThresholdCtc: { type: Number, default: 15.0 }, // in LPA
    allowUnlimitedCore: { type: Boolean, default: true },
    effectiveFrom: { type: Date },
    effectiveTo: { type: Date },
  },

  // 3. Tier-based eligibility
  tierEligibility: {
    enabled: { type: Boolean, default: false },
    upgradeOnly: { type: Boolean, default: true },
    tiers: {
      type: [tierDefinitionSchema],
      default: DEFAULT_TIERS,
    },
    effectiveFrom: { type: Date },
    effectiveTo: { type: Date },
  },

  // 4. Priority for unplaced students
  priorityUnplaced: {
    enabled: { type: Boolean, default: false },
    blockPlacedStudents: { type: Boolean, default: true },
    effectiveFrom: { type: Date },
    effectiveTo: { type: Date },
  },

  // 5. Max concurrent applications
  maxConcurrentApplications: {
    enabled: { type: Boolean, default: false },
    maxActive: { type: Number, default: 5 },
    effectiveFrom: { type: Date },
    effectiveTo: { type: Date },
  },

  // 6. Blackout dates
  blackoutDates: [blackoutDateSchema],

  // Custom institutional text rules
  customRules: [{
    name: { type: String, required: true },
    plainLanguage: { type: String, required: true },
    enabled: { type: Boolean, default: true },
  }],
}, { timestamps: true });

// Plugin tenant scoping
placementPolicySchema.plugin(tenantPlugin, { required: true });

module.exports = mongoose.model('PlacementPolicy', placementPolicySchema);
module.exports.DEFAULT_TIERS = DEFAULT_TIERS;
