const { z } = require('zod');

const createCollegeSchema = z.object({
  name: z.string().min(2, 'College name must be at least 2 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters').max(12, 'Code cannot exceed 12 characters').regex(/^[A-Za-z0-9_-]+$/, 'Code can only contain letters, numbers, hyphens, and underscores'),
  logo: z.string().optional().default(''),
  domains: z.array(z.string().min(3)).optional().default([]),
  timezone: z.string().optional().default('Asia/Kolkata'),
  academicYearConfig: z.object({
    currentYear: z.string().optional().default('2025-2026'),
    startMonth: z.number().min(1).max(12).optional().default(7),
    endMonth: z.number().min(1).max(12).optional().default(6),
    placementSeason: z.object({
      startDate: z.string().or(z.date()).optional(),
      endDate: z.string().or(z.date()).optional(),
    }).optional(),
  }).optional(),
  branches: z.array(z.string()).optional().default([
    'Computer Science',
    'Information Technology',
    'Electronics & Comm',
    'Electrical & Electronics',
    'Mechanical Engineering',
    'Civil Engineering',
  ]),
  gradingSystem: z.object({
    scale: z.enum(['10-point', 'percentage']).optional().default('10-point'),
    minPassCgpa: z.number().min(0).max(100).optional().default(4.0),
  }).default({ scale: '10-point', minPassCgpa: 4.0 }),
  policies: z.object({
    maxActiveBacklogsAllowed: z.number().min(0).optional().default(0),
    allowMultipleOffers: z.boolean().optional().default(true),
    dreamTierThreshold: z.number().min(0).optional().default(15.0),
    rules: z.array(z.string()).optional().default([]),
  }).default({ maxActiveBacklogsAllowed: 0, allowMultipleOffers: true, dreamTierThreshold: 15.0, rules: [] }),
  featureFlags: z.object({
    atsMatcher: z.boolean().optional().default(true),
    prepHub: z.boolean().optional().default(true),
    publicPortfolio: z.boolean().optional().default(true),
    interviewScheduler: z.boolean().optional().default(true),
    alumniNetwork: z.boolean().optional().default(true),
  }).default({
    atsMatcher: true,
    prepHub: true,
    publicPortfolio: true,
    interviewScheduler: true,
    alumniNetwork: true,
  }),
  branding: z.object({
    primaryColor: z.string().optional().default('#00ED64'),
    accentColor: z.string().optional().default('#00684A'),
    darkBg: z.string().optional().default('#001E2B'),
    logoUrl: z.string().optional().default(''),
  }).default({
    primaryColor: '#00ED64',
    accentColor: '#00684A',
    darkBg: '#001E2B',
    logoUrl: '',
  }),
  plan: z.enum(['Starter', 'Pro', 'Enterprise']).optional().default('Pro'),
});

const updateCollegeConfigSchema = z.object({
  name: z.string().min(2).optional(),
  domains: z.array(z.string()).optional(),
  timezone: z.string().optional(),
  academicYearConfig: z.object({
    currentYear: z.string().optional(),
    startMonth: z.number().min(1).max(12).optional(),
    endMonth: z.number().min(1).max(12).optional(),
    placementSeason: z.object({
      startDate: z.string().or(z.date()).optional(),
      endDate: z.string().or(z.date()).optional(),
    }).optional(),
  }).optional(),
  branches: z.array(z.string()).optional(),
  gradingSystem: z.object({
    scale: z.enum(['10-point', 'percentage']).optional(),
    minPassCgpa: z.number().min(0).max(100).optional(),
  }).optional(),
  policies: z.object({
    maxActiveBacklogsAllowed: z.number().min(0).optional(),
    allowMultipleOffers: z.boolean().optional(),
    dreamTierThreshold: z.number().min(0).optional(),
    rules: z.array(z.string()).optional(),
  }).optional(),
  branding: z.object({
    primaryColor: z.string().optional(),
    accentColor: z.string().optional(),
    darkBg: z.string().optional(),
    logoUrl: z.string().optional(),
  }).optional(),
  status: z.enum(['Active', 'Suspended', 'Onboarding']).optional(),
});

const updateFeatureFlagsSchema = z.object({
  atsMatcher: z.boolean().optional(),
  prepHub: z.boolean().optional(),
  publicPortfolio: z.boolean().optional(),
  interviewScheduler: z.boolean().optional(),
  alumniNetwork: z.boolean().optional(),
});

const inviteTpoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

module.exports = {
  createCollegeSchema,
  updateCollegeConfigSchema,
  updateFeatureFlagsSchema,
  inviteTpoSchema,
};
