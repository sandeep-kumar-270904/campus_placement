const { z } = require('zod');

const POLICY_TYPE_MAP = {
  OneStudentOneOffer: 'one_student_one_offer',
  DreamCap: 'dream_cap',
  TierProgression: 'tier_eligibility',
  UnplacedPriority: 'priority_unplaced',
  MaxConcurrentApplications: 'max_concurrent_apps',
  BlackoutPeriod: 'blackout_dates',
  Other: 'all',
  general: 'all',
};

const VALID_POLICY_TYPES = [
  'one_student_one_offer',
  'dream_cap',
  'tier_eligibility',
  'priority_unplaced',
  'max_concurrent_apps',
  'blackout_dates',
  'all',
];

const grantOverrideSchema = z.object({
  studentId: z.string().min(1, 'studentId is required'),
  opportunityId: z.string().optional().nullable(),
  policyType: z
    .string()
    .min(1, 'policyType is required')
    .transform((val) => POLICY_TYPE_MAP[val] || val)
    .refine((val) => VALID_POLICY_TYPES.includes(val), {
      message: `policyType must be one of: ${VALID_POLICY_TYPES.join(', ')} (or corresponding camelCase)`,
    }),
  mandatoryReason: z
    .string()
    .trim()
    .min(5, 'A mandatory justification of at least 5 characters is required to grant an override.'),
  expiresAt: z.string().or(z.date()).optional().nullable(),
});

const revokeOverrideSchema = z.object({
  reason: z.string().optional().default('Revoked by TPO.'),
});

const submitExceptionSchema = z.object({
  opportunityId: z.string().min(1, 'opportunityId is required'),
  policyType: z.string().min(1, 'policyType is required'),
  justification: z
    .string()
    .trim()
    .min(10, 'A written justification of at least 10 characters is required for your appeal.'),
  documents: z.array(z.any()).optional().default([]),
});

const reviewExceptionSchema = z.object({
  decision: z.enum(['Approved', 'Rejected'], {
    errorMap: () => ({ message: 'Decision must be either Approved or Rejected.' }),
  }),
  comments: z.string().optional().default(''),
});

const previewSimulationSchema = z.object({
  opportunityId: z.string().min(1, 'opportunityId is required for impact simulation.'),
  proposedPolicy: z.record(z.any()).optional(),
});

const updatePolicyConfigSchema = z.object({
  maxActiveBacklogsAllowed: z.number().min(0).optional(),
  allowMultipleOffers: z.boolean().optional(),
  dreamTierThreshold: z.number().min(0).optional(),
  maxConcurrentApplications: z.number().min(1).optional(),
  rules: z.array(z.string()).optional(),
  blackoutDates: z
    .array(
      z.object({
        name: z.string().optional().default('Institutional Blackout'),
        startDate: z.string().or(z.date()),
        endDate: z.string().or(z.date()),
        reason: z.string().optional().default(''),
      })
    )
    .optional(),
  tierProgression: z
    .array(
      z.object({
        tier: z.string(),
        minCtc: z.number().min(0),
        maxCtc: z.number().min(0).optional(),
        maxOffersAllowed: z.number().min(0).optional(),
      })
    )
    .optional(),
});

module.exports = {
  VALID_POLICY_TYPES,
  POLICY_TYPES: VALID_POLICY_TYPES,
  POLICY_TYPE_MAP,
  grantOverrideSchema,
  revokeOverrideSchema,
  submitExceptionSchema,
  reviewExceptionSchema,
  previewSimulationSchema,
  updatePolicyConfigSchema,
};

