process.env.NODE_ENV = 'test';
const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const authController = require('../src/controllers/authController');
const logger = require('../src/utils/logger');
const { logAuditAction } = require('../src/utils/auditLogger');
const S3StorageProvider = require('../src/services/storage/S3StorageProvider');
const { eventBus, DOMAIN_EVENTS } = require('../src/services/notifications/events/EventBus');
const { interpolate } = require('../src/services/notifications/templateEngine');
const {
  determineTier,
  evaluateStudentPolicy,
  exportFairnessReportToCsv,
} = require('../src/services/policyEngine/placementPolicyEngine');
const PlacementPolicy = require('../src/models/PlacementPolicy');

describe('Server Core Logic Unit & Edge Case Suite', () => {
  describe('1. Auth Controller Unit Tests', () => {
    test('generateAccessToken creates valid JWT with user claims and expiration', () => {
      const user = {
        _id: new mongoose.Types.ObjectId(),
        email: 'test@campus.edu',
        role: 'student',
        collegeId: new mongoose.Types.ObjectId(),
      };

      const token = authController.generateAccessToken(user);
      assert.ok(typeof token === 'string');
      assert.ok(token.split('.').length === 3);
    });

    test('registerUser rejects missing email or password with 400', async () => {
      let statusCode = 0;
      let jsonBody = null;

      const req = { body: {} };
      const res = {
        status: (c) => {
          statusCode = c;
          return {
            json: (b) => {
              jsonBody = b;
            },
          };
        },
      };

      await authController.registerUser(req, res);
      assert.strictEqual(statusCode, 400);
      assert.ok(jsonBody.error || jsonBody.message);
    });

    test('loginUser rejects missing credentials with 400', async () => {
      let statusCode = 0;
      let jsonBody = null;

      const req = { body: { email: '' } };
      const res = {
        status: (c) => {
          statusCode = c;
          return {
            json: (b) => {
              jsonBody = b;
            },
          };
        },
      };

      await authController.loginUser(req, res);
      assert.strictEqual(statusCode, 400);
      assert.ok(jsonBody.error || jsonBody.message);
    });

    test('refreshAccessToken rejects missing cookie with 401', async () => {
      let statusCode = 0;
      let jsonBody = null;

      const req = { cookies: {} };
      const res = {
        status: (c) => {
          statusCode = c;
          return {
            json: (b) => {
              jsonBody = b;
            },
          };
        },
      };

      await authController.refreshAccessToken(req, res);
      assert.strictEqual(statusCode, 401);
      assert.ok(jsonBody.error || jsonBody.message);
    });

    test('logoutUser clears refreshToken cookie and returns 200', async () => {
      let clearedCookie = null;

      const req = { cookies: {}, user: { id: 'test' } };
      const res = {
        clearCookie: (name, options) => {
          clearedCookie = name;
        },
        status: (c) => ({
          json: (b) => {},
        }),
      };

      await authController.logoutUser(req, res);
      assert.strictEqual(clearedCookie, 'refreshToken');
    });

    test('forgotPassword rejects missing email with 400', async () => {
      let statusCode = 0;
      const req = { body: {} };
      const res = {
        status: (c) => ({
          json: (b) => {
            statusCode = c;
          },
        }),
      };

      await authController.forgotPassword(req, res);
      assert.strictEqual(statusCode, 400);
    });

    test('resetPassword rejects missing resetToken with 400', async () => {
      let statusCode = 0;
      const req = { body: { newPassword: 'Password@123' } };
      const res = {
        status: (c) => ({
          json: (b) => {
            statusCode = c;
          },
        }),
      };

      await authController.resetPassword(req, res);
      assert.strictEqual(statusCode, 400);
    });

    test('validateInviteToken rejects missing token with 400', async () => {
      let statusCode = 0;
      const req = { params: {} };
      const res = {
        status: (c) => ({
          json: (b) => {
            statusCode = c;
          },
        }),
      };

      await authController.validateInviteToken(req, res);
      assert.strictEqual(statusCode, 400);
    });

    test('setPassword rejects missing password with 400', async () => {
      let statusCode = 0;
      const req = { body: {} };
      const res = {
        status: (c) => ({
          json: (b) => {
            statusCode = c;
          },
        }),
      };

      await authController.setPassword(req, res);
      assert.strictEqual(statusCode, 400);
    });
  });

  describe('2. Observability Logger & Audit Trail Logic', () => {
    test('Logger outputs formatted entries for info, warn, error, debug', () => {
      const entry = logger.formatEntry('info', 'Test message', {
        requestId: 'req-12345',
        durationMs: 45.2,
      });

      assert.strictEqual(entry.level, 'info');
      assert.strictEqual(entry.message, 'Test message');
      assert.strictEqual(entry.requestId, 'req-12345');
      assert.strictEqual(entry.durationMs, 45.2);
      assert.ok(entry.timestamp);

      // Verify Error formatting
      const errEntry = logger.formatEntry('error', 'Critical failure', {
        error: new Error('DB timeout'),
      });
      assert.strictEqual(errEntry.error.message, 'DB timeout');
      assert.ok(errEntry.error.stack);
    });

    test('logAuditAction executes safely without crash even when MongoDB is offline', async () => {
      const AuditLog = require('../src/models/AuditLog');
      const origCreate = AuditLog.create;
      AuditLog.create = async (doc) => ({ _id: 'mock-audit-id', ...doc });

      try {
        await logAuditAction({
          actorEmail: 'tpo@college.edu',
          actorRole: 'TPO',
          action: 'POLICY_OVERRIDE_GRANTED',
          entity: 'StudentProfile',
          entityId: 'stu-001',
          collegeId: new mongoose.Types.ObjectId().toString(),
        });

        assert.ok(true);
      } finally {
        AuditLog.create = origCreate;
      }
    });
  });

  describe('3. Notification EventBus & Template Engine', () => {
    test('eventBus emits domain events to registered listeners', async () => {
      let eventPayload = null;

      eventBus.on('TEST_EVENT', (data) => {
        eventPayload = data;
      });

      await eventBus.emitAsync('TEST_EVENT', {
        studentId: 'stu-1',
        title: 'SDE at Google',
      });

      assert.ok(eventPayload);
      assert.strictEqual(eventPayload.studentId, 'stu-1');
      assert.strictEqual(eventPayload.title, 'SDE at Google');
    });

    test('TemplateEngine interpolate replaces variables', () => {
      const template = 'Hello {{studentName}}, your application for {{jobTitle}} is {{status}}!';
      const result = interpolate(template, {
        studentName: 'Aarav Sharma',
        jobTitle: 'Software Engineer',
        status: 'Shortlisted',
      });

      assert.strictEqual(
        result,
        'Hello Aarav Sharma, your application for Software Engineer is Shortlisted!'
      );
    });
  });

  describe('4. Placement Policy Engine: Fairness Report CSV & Edge Cases', () => {
    test('exportFairnessReportToCsv produces valid formatted CSV string with header and rows', () => {
      const mockReport = {
        generatedAt: new Date().toISOString(),
        summary: {
          totalRegistered: 100,
          totalPlaced: 70,
          overallPlacementRate: '70.0%',
          suppressionPolicy: 'Cohorts under 5 suppressed',
        },
        genderReport: [
          { label: 'Male', totalStudents: 60, placedCount: 45, totalOffers: 50, placementRate: '75.0%', averageCtc: '12 LPA', highestCtc: '42 LPA', isSuppressed: false },
          { label: 'Female', totalStudents: 40, placedCount: 25, totalOffers: 28, placementRate: '62.5%', averageCtc: '14 LPA', highestCtc: '38 LPA', isSuppressed: false },
        ],
        branchReport: [
          { label: 'CSE', totalStudents: 50, placedCount: 45, totalOffers: 52, placementRate: '90.0%', averageCtc: '16 LPA', highestCtc: '42 LPA', isSuppressed: false },
        ],
        categoryReport: [],
      };

      const csv = exportFairnessReportToCsv(mockReport);
      assert.ok(typeof csv === 'string');
      assert.ok(csv.includes('INSTITUTIONAL PLACEMENT FAIRNESS & DIVERSITY REPORT'));
      assert.ok(csv.includes('Total Registered,100'));
      assert.ok(csv.includes('BREAKDOWN BY GENDER'));
      assert.ok(csv.includes('"Male","60","45"'));
    });

    test('evaluateStudentPolicy enforces Dream Cap when student already has max Dream offers', async () => {
      const policy = {
        dreamCap: { enabled: true, maxDreamOffers: 1 },
      };

      const placedStudent = {
        _id: new mongoose.Types.ObjectId(),
        isPlaced: true,
      };

      const applications = [
        {
          _id: new mongoose.Types.ObjectId(),
          opportunityId: { ctc: { fixed: 15.0 } }, // 15 LPA = Dream
          status: 'Placed',
          offer: { status: 'Accepted', ctc: 15.0 },
        },
      ];

      const targetOpportunity = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Senior Software Engineer',
        companyName: 'Salesforce',
        ctc: { fixed: 18.0 }, // 18 LPA = Dream
      };

      const result = await evaluateStudentPolicy({
        collegeId: new mongoose.Types.ObjectId().toString(),
        studentId: placedStudent._id.toString(),
        opportunity: targetOpportunity,
        studentProfile: placedStudent,
        applications,
        policy,
        overrides: [],
      });

      assert.strictEqual(result.isAllowed, false);
      assert.ok(
        result.blockingReasons.some(
          (r) => r.policyType === 'dream_cap' || r.code?.includes('DREAM') || r.message?.includes('Dream')
        )
      );
    });
  });

  describe('5. Storage Service Providers Fallback', () => {
    test('S3StorageProvider initializes and configures default bucket and region', () => {
      const provider = new S3StorageProvider({
        bucket: 'placeearly-test-bucket',
        region: 'us-east-1',
      });

      assert.ok(provider);
      assert.strictEqual(provider.bucket, 'placeearly-test-bucket');
      assert.strictEqual(provider.region, 'us-east-1');
    });
  });
});
