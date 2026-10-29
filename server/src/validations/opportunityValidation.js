const { z } = require('zod');

const roundSchema = z.object({
  roundNumber: z.number().min(1),
  name: z.string().min(1, 'Round name is required'),
  type: z.enum(['OA', 'Technical', 'HR', 'GD', 'Aptitude', 'Other']).default('Technical'),
  mode: z.enum(['Online', 'Offline', 'Hybrid']).default('Online'),
  expectedDate: z.string().or(z.date()).optional(),
  venueOrLink: z.string().optional().default(''),
});

const eligibilityRulesSchema = z.object({
  minCgpa: z.number().min(0).max(10).optional().default(0),
  maxBacklogs: z.number().min(0).optional().default(0),
  allowedBranches: z.array(z.string()).optional().default([]),
  allowedGraduationYears: z.array(z.number()).optional().default([]),
  minTenthPercentage: z.number().min(0).max(100).optional().default(0),
  minTwelfthPercentage: z.number().min(0).max(100).optional().default(0),
  genderNeutral: z.boolean().optional().default(true),
}).optional().default({});

const createOpportunitySchema = z.object({
  title: z.string().min(2, 'Job title must be at least 2 characters').max(150),
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100),
  companyLogo: z.string().optional().default(''),
  type: z.string().optional().default('Job'),
  jobType: z.enum(['Full-time', 'Internship', 'PPO', 'Internship+PPO', 'Job']).optional().default('Full-time'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  salary: z.string().min(1, 'Salary string is required'),
  ctc: z.object({
    fixed: z.number().min(0).optional().default(0),
    variable: z.number().min(0).optional().default(0),
    currency: z.string().optional().default('INR'),
    lpaString: z.string().optional().default(''),
  }).optional(),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  deadline: z.string().or(z.date()).refine((val) => !isNaN(new Date(val).getTime()), {
    message: 'Valid deadline date is required',
  }),
  driveDate: z.string().or(z.date()).optional(),
  rounds: z.array(roundSchema).optional().default([]),
  eligibilityRules: eligibilityRulesSchema,
  requiredDocuments: z.array(z.string()).optional().default([]),
  bondDetails: z.string().optional().default(''),
  status: z.enum(['Draft', 'Open', 'Closed', 'In Progress', 'Completed', 'Archived']).optional().default('Open'),
});

const applyOpportunitySchema = z.object({
  resumeUrl: z.string().optional(),
  answers: z.record(z.any()).optional().default({}),
  statement: z.string().max(1000).optional().default(''),
});

module.exports = {
  createOpportunitySchema,
  applyOpportunitySchema,
  roundSchema,
  eligibilityRulesSchema,
};
