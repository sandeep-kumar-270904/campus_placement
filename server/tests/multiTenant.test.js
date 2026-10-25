const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const College = require('../src/models/College');
const User = require('../src/models/User');
const StudentProfile = require('../src/models/StudentProfile');
const Opportunity = require('../src/models/Opportunity');
const Application = require('../src/models/Application');
const AiAuditLog = require('../src/models/AiAuditLog');
const AlumniProfile = require('../src/models/AlumniProfile');
const AlumniReferralRequest = require('../src/models/AlumniReferralRequest');
const Announcement = require('../src/models/Announcement');
const AuditLog = require('../src/models/AuditLog');
const Company = require('../src/models/Company');
const Document = require('../src/models/Document');
const EligibilityCache = require('../src/models/EligibilityCache');
const ExternalOutcome = require('../src/models/ExternalOutcome');
const InternshipRecord = require('../src/models/InternshipRecord');
const InterviewExperience = require('../src/models/InterviewExperience');
const InterviewSlot = require('../src/models/InterviewSlot');
const MockInterviewSession = require('../src/models/MockInterviewSession');
const Notification = require('../src/models/Notification');
const NotificationPreference = require('../src/models/NotificationPreference');
const NotificationTemplate = require('../src/models/NotificationTemplate');
const PlacementPolicy = require('../src/models/PlacementPolicy');
const PolicyExceptionRequest = require('../src/models/PolicyExceptionRequest');
const PolicyOverride = require('../src/models/PolicyOverride');
const ReportJob = require('../src/models/ReportJob');
const Session = require('../src/models/Session');

const { runWithTenantContext, tenantContextMiddleware } = require('../src/middleware/tenantContext');
const {
  createCollegeSchema,
  updateCollegeConfigSchema,
  updateFeatureFlagsSchema,
  inviteTpoSchema,
} = require('../src/validations/collegeValidation');

const ALL_TENANT_MODELS = [
  { model: User, name: 'User', sample: () => ({ email: 'test@campus.edu', password: 'Password123!', role: 'student', firstName: 'A', lastName: 'B' }) },
  { model: StudentProfile, name: 'StudentProfile', sample: () => ({ user: new mongoose.Types.ObjectId(), rollNo: 'TEST-001', branch: 'CSE', cgpa: 8.5 }) },
  { model: Opportunity, name: 'Opportunity', sample: () => ({ title: 'SDE', companyName: 'Acme', type: 'Job', location: 'Remote', salary: '10 LPA', description: 'Desc', deadline: new Date(), createdBy: new mongoose.Types.ObjectId() }) },
  { model: Application, name: 'Application', sample: () => ({ studentId: new mongoose.Types.ObjectId(), opportunityId: new mongoose.Types.ObjectId(), studentRollNo: 'TEST-001' }) },
  { model: AiAuditLog, name: 'AiAuditLog', sample: () => ({ userId: new mongoose.Types.ObjectId(), userRole: 'student', feature: 'resume_match' }) },
  { model: AlumniProfile, name: 'AlumniProfile', sample: () => ({ user: new mongoose.Types.ObjectId(), fullName: 'Alum', graduationBatch: 2024, branch: 'CSE', currentCompany: 'Google', currentRole: 'SDE' }) },
  { model: AlumniReferralRequest, name: 'AlumniReferralRequest', sample: () => ({ studentId: new mongoose.Types.ObjectId(), alumniId: new mongoose.Types.ObjectId(), targetCompany: 'Amazon', targetRole: 'Dev', message: 'Hello' }) },
  { model: Announcement, name: 'Announcement', sample: () => ({ title: 'Notice', message: 'Content', author: new mongoose.Types.ObjectId() }) },
  { model: AuditLog, name: 'AuditLog', sample: () => ({ actor: 'tpo@campus.edu', role: 'tpo', action: 'LOGIN_SUCCESS', entity: 'User' }) },
  { model: Company, name: 'Company', sample: () => ({ name: 'Microsoft' }) },
  { model: Document, name: 'Document', sample: () => ({ studentId: new mongoose.Types.ObjectId(), title: 'Resume', fileUrl: 'https://storage/resume.pdf', fileType: 'pdf' }) },
  { model: EligibilityCache, name: 'EligibilityCache', sample: () => ({ studentId: new mongoose.Types.ObjectId(), opportunityId: new mongoose.Types.ObjectId(), isEligible: true }) },
  { model: ExternalOutcome, name: 'ExternalOutcome', sample: () => ({ studentId: new mongoose.Types.ObjectId(), category: 'off_campus_placement', roleOrDegree: 'SDE', organizationName: 'Startup' }) },
  { model: InternshipRecord, name: 'InternshipRecord', sample: () => ({ studentId: new mongoose.Types.ObjectId(), companyName: 'Uber', role: 'Intern' }) },
  { model: InterviewExperience, name: 'InterviewExperience', sample: () => ({ studentId: new mongoose.Types.ObjectId(), company: 'Meta', role: 'SWE' }) },
  { model: InterviewSlot, name: 'InterviewSlot', sample: () => ({ driveId: new mongoose.Types.ObjectId(), companyName: 'Stripe', candidateId: new mongoose.Types.ObjectId(), date: new Date(), startTime: '10:00', endTime: '10:30' }) },
  { model: MockInterviewSession, name: 'MockInterviewSession', sample: () => ({ studentId: new mongoose.Types.ObjectId(), companyName: 'Amazon', role: 'SDE-1', roundType: 'technical' }) },
  { model: Notification, name: 'Notification', sample: () => ({ recipient: new mongoose.Types.ObjectId(), title: 'Alert', message: 'Msg' }) },
  { model: NotificationPreference, name: 'NotificationPreference', sample: () => ({ user: new mongoose.Types.ObjectId() }) },
  { model: NotificationTemplate, name: 'NotificationTemplate', sample: () => ({ name: 'Tpl', eventType: 'DRIVE_PUBLISHED', channels: { inApp: { enabled: true, template: 'T' } } }) },
  { model: PlacementPolicy, name: 'PlacementPolicy', sample: () => ({}) },
  { model: PolicyExceptionRequest, name: 'PolicyExceptionRequest', sample: () => ({ studentId: new mongoose.Types.ObjectId(), opportunityId: new mongoose.Types.ObjectId(), policyType: 'dream_cap', reason: 'Appeal' }) },
  { model: PolicyOverride, name: 'PolicyOverride', sample: () => ({ studentId: new mongoose.Types.ObjectId(), opportunityId: new mongoose.Types.ObjectId(), policyType: 'dream_cap', reason: 'Granted', grantedBy: new mongoose.Types.ObjectId() }) },
  { model: ReportJob, name: 'ReportJob', sample: () => ({ reportType: 'naac_nirf', format: 'xlsx' }) },
  { model: Session, name: 'Session', sample: () => ({ userId: new mongoose.Types.ObjectId(), tokenHash: 'hash', family: 'fam', expiresAt: new Date(Date.now() + 10000) }) },
];

describe('Multi-Tenant Database Models & Central Scoping Engine Tests', () => {
  const collegeAId = new mongoose.Types.ObjectId().toString();
  const collegeBId = new mongoose.Types.ObjectId().toString();

  describe('1. ACCEPTANCE CRITERIA: Two Seeded Colleges with Identical Roll Numbers Isolation', () => {
    test('Two colleges with identical roll number (2026-CS-001) are completely isolated and never leak data', () => {
      // Simulate College A and College B student profiles in memory
      const studentCollegeA = {
        _id: new mongoose.Types.ObjectId().toString(),
        collegeId: collegeAId,
        rollNo: '2026-CS-001',
        fullName: 'Aarav Sharma (ANITS College)',
        branch: 'Computer Science',
        cgpa: 9.1,
      };

      const studentCollegeB = {
        _id: new mongoose.Types.ObjectId().toString(),
        collegeId: collegeBId,
        rollNo: '2026-CS-001',
        fullName: 'Vikram Joshi (IIT Bombay)',
        branch: 'Computer Science',
        cgpa: 9.8,
      };

      const database = [studentCollegeA, studentCollegeB];

      // 1. Query executed within College A context
      runWithTenantContext({ collegeId: collegeAId, isSuperAdmin: false }, () => {
        const query = StudentProfile.find({ rollNo: '2026-CS-001' });
        StudentProfile.schema.s.hooks.execPreSync('find', query);
        const filter = query.getFilter();

        // Enforced query filter strictly includes College A
        assert.strictEqual(filter.rollNo, '2026-CS-001');
        assert.strictEqual(filter.collegeId, collegeAId);

        // Execute against mock database using filter
        const matched = database.filter(
          (doc) => doc.rollNo === filter.rollNo && doc.collegeId === filter.collegeId
        );

        assert.strictEqual(matched.length, 1);
        assert.strictEqual(matched[0].fullName, 'Aarav Sharma (ANITS College)');
        assert.strictEqual(matched[0].collegeId, collegeAId);
        assert.notStrictEqual(matched[0].collegeId, collegeBId);
      });

      // 2. Query executed within College B context
      runWithTenantContext({ collegeId: collegeBId, isSuperAdmin: false }, () => {
        const query = StudentProfile.find({ rollNo: '2026-CS-001' });
        StudentProfile.schema.s.hooks.execPreSync('find', query);
        const filter = query.getFilter();

        // Enforced query filter strictly includes College B
        assert.strictEqual(filter.rollNo, '2026-CS-001');
        assert.strictEqual(filter.collegeId, collegeBId);

        // Execute against mock database using filter
        const matched = database.filter(
          (doc) => doc.rollNo === filter.rollNo && doc.collegeId === filter.collegeId
        );

        assert.strictEqual(matched.length, 1);
        assert.strictEqual(matched[0].fullName, 'Vikram Joshi (IIT Bombay)');
        assert.strictEqual(matched[0].collegeId, collegeBId);
        assert.notStrictEqual(matched[0].collegeId, collegeAId);
      });
    });

    test('StudentProfile model schema enforces compound uniqueness on (collegeId, rollNo)', () => {
      const indexes = StudentProfile.schema.indexes();
      const rollNoIndex = indexes.find(
        ([fields, opts]) => fields.collegeId === 1 && fields.rollNo === 1 && opts?.unique === true
      );
      assert.ok(rollNoIndex, 'Must possess unique index on { collegeId: 1, rollNo: 1 }');
    });
  });

  describe('2. Cross-Tenant Read & Write Rejection Across Every Model', () => {
    ALL_TENANT_MODELS.forEach(({ model, name, sample }) => {
      test(`[${name}] rejects cross-tenant write with CROSS_TENANT_WRITE_FORBIDDEN`, async () => {
        await runWithTenantContext({ collegeId: collegeAId, isSuperAdmin: false }, async () => {
          const docData = {
            ...sample(),
            collegeId: new mongoose.Types.ObjectId(collegeBId), // Attempt cross-tenant write into College B
          };
          const doc = new model(docData);

          let hookError = null;
          try {
            await model.schema.s.hooks.execPre('save', doc, []);
          } catch (err) {
            hookError = err;
          }

          assert.ok(hookError, `${name} must reject cross-tenant write`);
          assert.strictEqual(
            hookError.code,
            'CROSS_TENANT_WRITE_FORBIDDEN',
            `${name} pre-save hook must throw CROSS_TENANT_WRITE_FORBIDDEN`
          );
        });
      });

      test(`[${name}] automatically injects active collegeId on queries`, () => {
        runWithTenantContext({ collegeId: collegeAId, isSuperAdmin: false }, () => {
          const query = model.find({});
          model.schema.s.hooks.execPreSync('find', query);
          const filter = query.getFilter();

          assert.strictEqual(
            filter.collegeId,
            collegeAId,
            `${name} query filter must automatically scope to active collegeId`
          );
        });
      });
    });
  });

  describe('3. Aggregation Pipeline Scoping & Central Query Helper', () => {
    test('Aggregation pipelines in tenant context automatically prepend $match stage', () => {
      runWithTenantContext({ collegeId: collegeAId, isSuperAdmin: false }, () => {
        const aggregate = Application.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        Application.schema.s.hooks.execPreSync('aggregate', aggregate);
        const pipeline = aggregate.pipeline();

        assert.strictEqual(pipeline.length, 2, 'Pipeline must have prepended match stage');
        assert.deepStrictEqual(pipeline[0], {
          $match: { collegeId: new mongoose.Types.ObjectId(collegeAId) },
        });
      });
    });

    test('Query helper forTenant sets explicit collegeId filter', () => {
      const query = Opportunity.find().forTenant(collegeAId);
      const filter = query.getFilter();
      assert.strictEqual(filter.collegeId, collegeAId);
    });
  });

  describe('4. College Model Full Specification Verification', () => {
    test('College schema contains all mandatory tenant attributes and JSON policies', () => {
      const paths = College.schema.paths;
      assert.ok(paths['name'], 'Must include name');
      assert.ok(paths['code'], 'Must include code');
      assert.ok(paths['logo'], 'Must include logo');
      assert.ok(paths['domains'], 'Must include domains');
      assert.ok(paths['timezone'], 'Must include timezone');
      assert.ok(paths['academicYearConfig.currentYear'], 'Must include academicYearConfig.currentYear');
      assert.ok(paths['academicYearConfig.placementSeason.startDate'], 'Must include placementSeason.startDate');
      assert.ok(paths['branches'], 'Must include branches list');
      assert.ok(paths['policies.customPolicies'], 'Must include policies.customPolicies (JSON)');
      assert.ok(paths['policies.dreamTierThreshold'], 'Must include policies.dreamTierThreshold');
      assert.ok(paths['plan'], 'Must include plan');
      assert.ok(paths['createdAt'], 'Must include createdAt timestamp');
      assert.ok(paths['updatedAt'], 'Must include updatedAt timestamp');
      assert.ok(paths['branding.primaryColor'], 'Must include branding.primaryColor');
      assert.ok(paths['branding.accentColor'], 'Must include branding.accentColor');
    });
  });

  describe('5. Middleware Header Spoofing Prevention & SuperAdmin Flexibility', () => {
    test('Tenant user spoofing foreign college in x-college-id header receives 403 CROSS_TENANT_FORBIDDEN', () => {
      const req = {
        headers: { 'x-college-id': collegeBId },
        user: { id: 'user-001', role: 'tpo', collegeId: collegeAId },
      };

      let statusCode = null;
      let jsonPayload = null;
      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (data) => {
              jsonPayload = data;
            },
          };
        },
      };

      let nextCalled = false;
      tenantContextMiddleware(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(statusCode, 403);
      assert.strictEqual(jsonPayload?.error?.code, 'CROSS_TENANT_FORBIDDEN');
      assert.strictEqual(nextCalled, false);
    });

    test('Super Admin can target any college using x-college-id header', () => {
      const req = {
        headers: { 'x-college-id': collegeBId },
        user: { id: 'admin-001', role: 'superadmin' },
      };

      let nextCalled = false;
      tenantContextMiddleware(req, {}, () => {
        nextCalled = true;
        assert.strictEqual(req.tenant.collegeId, collegeBId);
        assert.strictEqual(req.tenant.isSuperAdmin, true);
        assert.strictEqual(req.tenant.bypassTenantFilter, false);
      });

      assert.strictEqual(nextCalled, true);
    });
  });

  describe('6. Multi-Tenant Validation Schemas (Zod)', () => {
    test('createCollegeSchema validates correct fields and populates default flags and branding', () => {
      const parsed = createCollegeSchema.safeParse({
        name: 'Andhra University College of Engineering',
        code: 'AUCOE',
        domains: ['andhrauniversity.edu.in'],
      });

      assert.strictEqual(parsed.success, true);
      assert.strictEqual(parsed.data.name, 'Andhra University College of Engineering');
      assert.strictEqual(parsed.data.code, 'AUCOE');
      assert.strictEqual(parsed.data.gradingSystem.scale, '10-point');
      assert.strictEqual(parsed.data.featureFlags.atsMatcher, true);
      assert.strictEqual(parsed.data.branding.primaryColor, '#00ED64');
    });

    test('createCollegeSchema rejects malformed college code with spaces or symbols', () => {
      const parsed = createCollegeSchema.safeParse({
        name: 'Invalid College',
        code: 'BAD CODE!',
      });
      assert.strictEqual(parsed.success, false);
    });
  });
});
