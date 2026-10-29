const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const os = require('os');
const mongoose = require('mongoose');

const ReportJob = require('../src/models/ReportJob');
const {
  storeReportBuffer,
  getReportBuffer,
  clearReportBufferCache,
} = require('../src/services/reports/reportBufferCache');
const { downloadReportFile } = require('../src/controllers/tpoReportJobController');
const LocalStorageProvider = require('../src/services/storage/LocalStorageProvider');

const {
  createOpportunitySchema,
  applyOpportunitySchema,
} = require('../src/validations/opportunityValidation');
const {
  grantOverrideSchema,
  submitExceptionSchema,
  previewSimulationSchema,
} = require('../src/validations/placementPolicyValidation');
const {
  initiateReportJobSchema,
  updateReportSettingsSchema,
} = require('../src/validations/reportJobValidation');

describe('Serverless Resilience & Validation Hardening Test Suite', () => {
  describe('1. Distributed ReportJob Persistence & Serverless Cache Miss Recovery', () => {
    beforeEach(() => {
      clearReportBufferCache();
    });

    test('ReportJob model stores fileBase64 and contentType', () => {
      const dummyBase64 = Buffer.from('NIRF Placement Report Sample Data').toString('base64');
      const job = new ReportJob({
        jobId: 'job-test-123',
        collegeId: new mongoose.Types.ObjectId(),
        templateId: 'nirf-placement-report',
        format: 'xlsx',
        status: 'completed',
        progress: 100,
        fileName: 'nirf-2026.xlsx',
        fileSize: 42,
        fileBase64: dummyBase64,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      assert.strictEqual(job.fileBase64, dummyBase64);
      assert.strictEqual(job.contentType, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });

    test('downloadReportFile recovers file from MongoDB fileBase64 on cold-start cache miss', async () => {
      const rawPayload = 'PDF-1.4 Mock Binary Report Stream';
      const rawBuffer = Buffer.from(rawPayload);
      const fileBase64 = rawBuffer.toString('base64');
      const testJobId = 'job-cache-miss-' + Date.now();

      // Ensure cache is completely empty (simulating new container invocation)
      assert.strictEqual(getReportBuffer(testJobId), undefined);

      // Mock ReportJob.findOne to return job with fileBase64
      const originalFindOne = ReportJob.findOne;
      ReportJob.findOne = (query) => ({
        lean: async () => {
          if (query.jobId === testJobId) {
            return {
              jobId: testJobId,
              status: 'completed',
              fileName: 'test-report.pdf',
              fileBase64,
              contentType: 'application/pdf',
            };
          }
          return null;
        },
      });

      let sentHeaders = {};
      let sentBody = null;
      const res = {
        setHeader: (k, v) => {
          sentHeaders[k] = v;
        },
        send: (data) => {
          sentBody = data;
        },
        status: (code) => ({
          json: (err) => {
            sentBody = { code, err };
          },
        }),
      };

      try {
        await downloadReportFile({ params: { jobId: testJobId } }, res);

        // Verify recovered buffer matches original rawBuffer
        assert.ok(Buffer.isBuffer(sentBody), 'Response body should be a Buffer');
        assert.strictEqual(sentBody.toString(), rawPayload);
        assert.strictEqual(sentHeaders['Content-Type'], 'application/pdf');
        assert.ok(sentHeaders['Content-Disposition'].includes('test-report.pdf'));

        // Verify that in-memory cache was re-populated for subsequent hits
        const cached = getReportBuffer(testJobId);
        assert.ok(cached, 'Cache should be re-populated after DB recovery');
        assert.strictEqual(cached.buffer.toString(), rawPayload);
      } finally {
        ReportJob.findOne = originalFindOne;
        clearReportBufferCache();
      }
    });
  });

  describe('2. LocalStorageProvider Vercel / Lambda Safe Fallback', () => {
    const originalVercel = process.env.VERCEL;

    afterEach(() => {
      if (originalVercel !== undefined) {
        process.env.VERCEL = originalVercel;
      } else {
        delete process.env.VERCEL;
      }
    });

    test('Defaults baseDir to os.tmpdir()/placeearly_vault when VERCEL=1', () => {
      process.env.VERCEL = '1';
      const provider = new LocalStorageProvider();
      const expectedPrefix = path.join(os.tmpdir(), 'placeearly_vault');
      assert.strictEqual(provider.baseDir, expectedPrefix);
    });

    test('Can write, read, and delete file in temporary vault without EROFS crash', async () => {
      process.env.VERCEL = '1';
      const provider = new LocalStorageProvider();

      const testKey = `test-folder/doc-${Date.now()}.txt`;
      const content = Buffer.from('Test serverless safe file content');

      const uploaded = await provider.upload({
        key: testKey,
        buffer: content,
        contentType: 'text/plain',
      });
      assert.strictEqual(uploaded.key, testKey);

      const exists = await provider.exists({ key: testKey });
      assert.strictEqual(exists, true);

      const fetched = await provider.getFileBuffer(testKey);
      assert.strictEqual(fetched.buffer.toString(), 'Test serverless safe file content');
      assert.strictEqual(fetched.contentType, 'text/plain');

      const deleted = await provider.delete({ key: testKey });
      assert.strictEqual(deleted, true);
    });
  });

  describe('3. Zod Input Validation Hardening', () => {
    describe('A. Opportunity Validation', () => {
      test('createOpportunitySchema rejects missing required fields', () => {
        const result = createOpportunitySchema.safeParse({
          title: 'A', // Too short (< 2)
          // missing companyName, location, salary, description, deadline
        });
        assert.strictEqual(result.success, false);
        const issues = result.error.issues.map((i) => i.path[0]);
        assert.ok(issues.includes('companyName'));
        assert.ok(issues.includes('location'));
        assert.ok(issues.includes('salary'));
        assert.ok(issues.includes('deadline'));
      });

      test('createOpportunitySchema accepts valid full drive payload', () => {
        const validPayload = {
          title: 'Software Development Engineer',
          companyName: 'Atlassian',
          type: 'Job',
          jobType: 'Full-time',
          location: 'Bengaluru / Remote',
          salary: '22 LPA',
          ctc: { fixed: 18, variable: 4, currency: 'INR', lpaString: '22 LPA' },
          description: 'Build world-class distributed collaboration tools for engineering teams.',
          deadline: '2026-12-31T23:59:59.000Z',
          eligibilityRules: {
            minCgpa: 7.5,
            maxBacklogs: 0,
            allowedBranches: ['Computer Science', 'Information Technology'],
          },
        };
        const result = createOpportunitySchema.safeParse(validPayload);
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data.title, 'Software Development Engineer');
        assert.strictEqual(result.data.eligibilityRules.minCgpa, 7.5);
      });

      test('applyOpportunitySchema rejects statement exceeding 1000 characters', () => {
        const longStatement = 'a'.repeat(1005);
        const result = applyOpportunitySchema.safeParse({ statement: longStatement });
        assert.strictEqual(result.success, false);
      });
    });

    describe('B. Placement Policy Validation', () => {
      test('grantOverrideSchema rejects justification shorter than 5 characters', () => {
        const result = grantOverrideSchema.safeParse({
          studentId: 'stud_123',
          policyType: 'one_student_one_offer',
          mandatoryReason: 'ok', // < 5 chars
        });
        assert.strictEqual(result.success, false);
        assert.ok(result.error.issues[0].message.includes('5 characters'));
      });

      test('grantOverrideSchema normalizes camelCase policyType to snake_case', () => {
        const result = grantOverrideSchema.safeParse({
          studentId: 'stud_123',
          policyType: 'OneStudentOneOffer',
          mandatoryReason: 'Exceptional placement committee approval for leadership role.',
        });
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data.policyType, 'one_student_one_offer');
      });

      test('submitExceptionSchema rejects justification under 10 characters', () => {
        const result = submitExceptionSchema.safeParse({
          opportunityId: 'opp_456',
          policyType: 'tier_eligibility',
          justification: 'Help me', // 7 chars (< 10)
        });
        assert.strictEqual(result.success, false);
        assert.ok(result.error.issues[0].message.includes('10 characters'));
      });

      test('submitExceptionSchema accepts valid appeal with attached documents', () => {
        const result = submitExceptionSchema.safeParse({
          opportunityId: 'opp_456',
          policyType: 'tier_eligibility',
          justification: 'Cleared final semester revaluation with 8.9 CGPA and no active backlogs.',
          documents: [{ name: 'marksheet.pdf', url: 'https://vault.placeearly.edu/marksheet.pdf' }],
        });
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data.documents.length, 1);
      });

      test('previewSimulationSchema rejects missing opportunityId', () => {
        const result = previewSimulationSchema.safeParse({});
        assert.strictEqual(result.success, false);
      });
    });

    describe('C. Report Job Validation', () => {
      test('initiateReportJobSchema rejects invalid templateId', () => {
        const result = initiateReportJobSchema.safeParse({
          templateId: 'unsupported-template',
          format: 'xlsx',
        });
        assert.strictEqual(result.success, false);
      });

      test('initiateReportJobSchema rejects unsupported format (e.g. docx)', () => {
        const result = initiateReportJobSchema.safeParse({
          templateId: 'nirf-placement-report',
          format: 'docx',
        });
        assert.strictEqual(result.success, false);
      });

      test('initiateReportJobSchema accepts valid template and format with default filters', () => {
        const result = initiateReportJobSchema.safeParse({
          templateId: 'nirf-placement-report',
          format: 'pdf',
        });
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data.templateId, 'nirf-placement-report');
        assert.strictEqual(result.data.format, 'pdf');
        assert.strictEqual(result.data.filters.graduationYear, '2026');
      });

      test('updateReportSettingsSchema validates signatories structure', () => {
        const result = updateReportSettingsSchema.safeParse({
          headerTitle: 'Indian Institute of Engineering & Technology',
          signatories: [
            { title: 'Training & Placement Officer', name: 'Dr. John Doe' },
            { title: 'Director', name: 'Prof. Jane Smith' },
          ],
          customDisclaimer: 'Strictly confidential for NBA & NAAC accreditation review.',
        });
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.data.signatories.length, 2);
      });
    });
  });
});
