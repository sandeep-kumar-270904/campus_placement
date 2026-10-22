const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'College name is required'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'College code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
  },
  logo: {
    type: String,
    default: '',
  },
  domains: [{
    type: String,
    lowercase: true,
    trim: true,
  }],
  timezone: {
    type: String,
    default: 'Asia/Kolkata',
  },
  academicYearConfig: {
    currentYear: {
      type: String,
      default: '2025-2026',
    },
    startMonth: {
      type: Number,
      default: 7, // July
    },
    endMonth: {
      type: Number,
      default: 6, // June
    },
    placementSeason: {
      startDate: {
        type: Date,
        default: () => new Date('2025-07-01'),
      },
      endDate: {
        type: Date,
        default: () => new Date('2026-06-30'),
      },
    },
  },
  branches: [{
    type: String,
    trim: true,
  }],
  gradingSystem: {
    scale: {
      type: String,
      enum: ['10-point', 'percentage'],
      default: '10-point',
    },
    minPassCgpa: {
      type: Number,
      default: 4.0,
    },
  },
  policies: {
    maxActiveBacklogsAllowed: {
      type: Number,
      default: 0,
    },
    allowMultipleOffers: {
      type: Boolean,
      default: true,
    },
    dreamTierThreshold: {
      type: Number,
      default: 15.0, // 15 LPA
    },
    rules: [{
      type: String,
    }],
  },
  featureFlags: {
    atsMatcher: {
      type: Boolean,
      default: true,
    },
    prepHub: {
      type: Boolean,
      default: true,
    },
    publicPortfolio: {
      type: Boolean,
      default: true,
    },
    interviewScheduler: {
      type: Boolean,
      default: true,
    },
    alumniNetwork: {
      type: Boolean,
      default: true,
    },
  },
  branding: {
    primaryColor: {
      type: String,
      default: '#00ED64',
    },
    accentColor: {
      type: String,
      default: '#00684A',
    },
    darkBg: {
      type: String,
      default: '#001E2B',
    },
    logoUrl: {
      type: String,
      default: '',
    },
  },
  plan: {
    type: String,
    enum: ['Starter', 'Pro', 'Enterprise'],
    default: 'Pro',
  },
  status: {
    type: String,
    enum: ['Active', 'Suspended', 'Onboarding'],
    default: 'Active',
    index: true,
  },
}, { timestamps: true });

// Compound index on domains for fast domain matching
collegeSchema.index({ domains: 1 });

const College = mongoose.model('College', collegeSchema);
module.exports = College;
