const { z } = require('zod');

const REPORT_TEMPLATES = [
  'nirf-placement-report',
  'placement-brochure',
  'company-wise',
  'department-stats',
  'unplaced-candidates',
  'drive-funnel',
];

const initiateReportJobSchema = z.object({
  templateId: z.enum(REPORT_TEMPLATES, {
    errorMap: () => ({ message: `templateId must be one of: ${REPORT_TEMPLATES.join(', ')}` }),
  }).default('nirf-placement-report'),
  format: z.enum(['xlsx', 'pdf', 'csv'], {
    errorMap: () => ({ message: 'format must be one of: xlsx, pdf, csv' }),
  }).default('xlsx'),
  filters: z
    .object({
      graduationYear: z.string().optional().default('2026'),
      branch: z.string().optional().default('all'),
      dateRange: z.string().optional().default(''),
    })
    .default({
      graduationYear: '2026',
      branch: 'all',
      dateRange: '',
    }),
});

const updateReportSettingsSchema = z.object({
  headerTitle: z.string().min(2, 'Header title must be at least 2 characters').optional(),
  logoUrl: z.string().optional().nullable(),
  signatories: z.array(
    z.object({
      title: z.string().min(1, 'Signatory title is required'),
      name: z.string().min(1, 'Signatory name is required'),
    })
  ).optional(),
  customDisclaimer: z.string().optional().nullable(),
});

module.exports = {
  REPORT_TEMPLATES,
  initiateReportJobSchema,
  updateReportSettingsSchema,
};
