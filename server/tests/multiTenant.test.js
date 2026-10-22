const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const College = require('../src/models/College');
const User = require('../src/models/User');
const StudentProfile = require('../src/models/StudentProfile');
const Opportunity = require('../src/models/Opportunity');
const Application = require('../src/models/Application');
const { runWithTenantContext, tenantContextMiddleware } = require('../src/middleware/tenantContext');
const {
  createCollegeSchema,
  updateCollegeConfigSchema,
  updateFeatureFlagsSchema,
  inviteTpoSchema,
} = require('../src/validations/collegeValidation');

describe('Multi-Tenant Database Models & Scoping Engine Tests', () => {
  const collegeAId = new mongoose.Types.ObjectId().toString();
  const collegeBId = new mongoose.Types.ObjectId().toString();

  describe('1. Compound Index & Schema Verification (Roll No & Email Isolation)', () => {
    test('StudentProfile must register compound unique index on (collegeId, rollNo)', () => {
      const indexes = StudentProfile.schema.indexes();
      const rollNoIndex = indexes.find(
        ([fields, opts]) => fields.collegeId === 1 && fields.rollNo === 1 && opts?.unique === true
      );
      assert.ok(rollNoIndex, 'StudentProfile must have unique index on { collegeId: 1, rollNo: 1 }');
    });

    test('StudentProfile must register compound unique index on (collegeId, user)', () => {
      const indexes = StudentProfile.schema.indexes();
      const userIndex = indexes.find(
        ([fields, opts]) => fields.collegeId === 1 && fields.user === 1 && opts?.unique === true
      );
      assert.ok(userIndex, 'StudentProfile must have unique index on { collegeId: 1, user: 1 }');
    });

    test('User must register compound unique index on (collegeId, email)', () => {
      const indexes = User.schema.indexes();
      const emailIndex = indexes.find(
        ([fields, opts]) => fields.collegeId === 1 && fields.email === 1 && opts?.unique === true
      );
      assert.ok(emailIndex, 'User must have unique index on { collegeId: 1, email: 1 }');
    });

    test('Application must register compound unique index on (collegeId, studentId, opportunityId)', () => {
      const indexes = Application.schema.indexes();
      const appIndex = indexes.find(
        ([fields, opts]) =>
          fields.collegeId === 1 && fields.studentId === 1 && fields.opportunityId === 1 && opts?.unique === true
      );
      assert.ok(appIndex, 'Application must have unique index on { collegeId: 1, studentId: 1, opportunityId: 1 }');
    });
  });

  describe('2. Central Query Helper & Tenant Scoping Verification', () => {
    test('Opportunity queries in College A context automatically scope filter to College A', () => {
      runWithTenantContext({ collegeId: collegeAId, isSuperAdmin: false }, () => {
        const query = Opportunity.find({ status: 'Open' });
        // Execute pre-hooks on query
        Opportunity.schema.s.hooks.execPreSync('find', query);
        const filter = query.getFilter();
        assert.strictEqual(filter.status, 'Open');
        assert.strictEqual(filter.collegeId, collegeAId);
      });
    });

    test('Opportunity queries in College B context scope to College B and never College A', () => {
      runWithTenantContext({ collegeId: collegeBId, isSuperAdmin: false }, () => {
        const query = Opportunity.find({});
        Opportunity.schema.s.hooks.execPreSync('find', query);
        const filter = query.getFilter();
        assert.strictEqual(filter.collegeId, collegeBId);
        assert.notStrictEqual(filter.collegeId, collegeAId);
      });
    });

    test('StudentProfile queries automatically enforce active collegeId filter', () => {
      runWithTenantContext({ collegeId: collegeAId, isSuperAdmin: false }, () => {
        const query = StudentProfile.find({ branch: 'Computer Science' });
        StudentProfile.schema.s.hooks.execPreSync('find', query);
        const filter = query.getFilter();
        assert.strictEqual(filter.collegeId, collegeAId);
        assert.strictEqual(filter.branch, 'Computer Science');
      });
    });

    test('Application queries automatically enforce active collegeId filter', () => {
      runWithTenantContext({ collegeId: collegeBId, isSuperAdmin: false }, () => {
        const query = Application.find();
        Application.schema.s.hooks.execPreSync('find', query);
        const filter = query.getFilter();
        assert.strictEqual(filter.collegeId, collegeBId);
      });
    });

    test('Super Admin queries bypass tenant filter when bypassTenantFilter is true', () => {
      runWithTenantContext({ collegeId: null, isSuperAdmin: true, bypassTenantFilter: true }, () => {
        const query = Opportunity.find({});
        Opportunity.schema.s.hooks.execPreSync('find', query);
        const filter = query.getFilter();
        assert.strictEqual(filter.collegeId, undefined);
      });
    });

    test('Super Admin queries target specific tenant when collegeId is specified', () => {
      runWithTenantContext({ collegeId: collegeAId, isSuperAdmin: true, bypassTenantFilter: false }, () => {
        const query = Opportunity.find({});
        Opportunity.schema.s.hooks.execPreSync('find', query);
        const filter = query.getFilter();
        assert.strictEqual(filter.collegeId, collegeAId);
      });
    });
  });

  describe('3. Cross-Tenant Write & Save Protection via tenantPlugin', () => {
    test('Saving a document with cross-tenant collegeId is rejected by tenantPlugin pre-save hook', () => {
      runWithTenantContext({ collegeId: collegeAId, isSuperAdmin: false }, () => {
        const doc = new Opportunity({
          collegeId: new mongoose.Types.ObjectId(collegeBId),
          title: 'Tampered Drive',
          companyName: 'Acme',
          type: 'Job',
          location: 'Remote',
          salary: '10 LPA',
          description: 'Desc',
          deadline: new Date(),
          createdBy: new mongoose.Types.ObjectId(),
        });

        // Test the pre-save hook logic
        let hookError = null;
        Opportunity.schema.s.hooks.execPre('save', doc, [
          (err) => {
            hookError = err;
          },
        ]);

        assert.ok(hookError, 'Pre-save hook should throw error on mismatched collegeId');
        assert.strictEqual(hookError.code, 'CROSS_TENANT_WRITE_FORBIDDEN');
      });
    });

    test('Saving a document without explicit collegeId automatically receives the active tenant collegeId', () => {
      runWithTenantContext({ collegeId: collegeAId, isSuperAdmin: false }, () => {
        const doc = new Opportunity({
          title: 'College A Drive',
          companyName: 'TechCorp',
          type: 'Job',
          location: 'Hyderabad',
          salary: '12 LPA',
          description: 'Desc',
          deadline: new Date(),
          createdBy: new mongoose.Types.ObjectId(),
        });

        Opportunity.schema.s.hooks.execPre('save', doc, [() => {}]);
        assert.strictEqual(doc.collegeId.toString(), collegeAId);
      });
    });
  });

  describe('4. Cross-Tenant Header Spoofing & Middleware Enforcement', () => {
    test('Middleware rejects regular tenant user spoofing another college in x-college-id header with 403', () => {
      const req = {
        headers: {
          'x-college-id': collegeBId,
        },
        user: {
          id: 'user-123',
          role: 'student',
          collegeId: collegeAId,
        },
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

    test('Middleware accepts matching tenant header and binds tenant context', () => {
      const req = {
        headers: {
          'x-college-id': collegeAId,
        },
        user: {
          id: 'user-123',
          role: 'tpo',
          collegeId: collegeAId,
        },
      };

      let nextCalled = false;
      const res = {};
      tenantContextMiddleware(req, res, () => {
        nextCalled = true;
        assert.strictEqual(req.tenant.collegeId, collegeAId);
        assert.strictEqual(req.tenant.isSuperAdmin, false);
      });

      assert.strictEqual(nextCalled, true);
    });

    test('Middleware allows Super Admin to target any college using x-college-id header', () => {
      const req = {
        headers: {
          'x-college-id': collegeBId,
        },
        user: {
          id: 'admin-001',
          role: 'superadmin',
        },
      };

      let nextCalled = false;
      const res = {};
      tenantContextMiddleware(req, res, () => {
        nextCalled = true;
        assert.strictEqual(req.tenant.collegeId, collegeBId);
        assert.strictEqual(req.tenant.isSuperAdmin, true);
        assert.strictEqual(req.tenant.bypassTenantFilter, false);
      });

      assert.strictEqual(nextCalled, true);
    });
  });

  describe('5. Zod Validation Schemas for Multi-Tenant Management', () => {
    test('createCollegeSchema succeeds with valid input and populates default flags and branding', () => {
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
      assert.strictEqual(parsed.data.featureFlags.prepHub, true);
      assert.strictEqual(parsed.data.branding.primaryColor, '#00ED64');
    });

    test('createCollegeSchema rejects invalid characters in college code', () => {
      const parsed = createCollegeSchema.safeParse({
        name: 'Invalid College',
        code: 'BAD CODE!',
      });

      assert.strictEqual(parsed.success, false);
    });

    test('updateFeatureFlagsSchema allows toggling individual features', () => {
      const parsed = updateFeatureFlagsSchema.safeParse({
        atsMatcher: false,
        prepHub: true,
      });

      assert.strictEqual(parsed.success, true);
      assert.strictEqual(parsed.data.atsMatcher, false);
      assert.strictEqual(parsed.data.prepHub, true);
    });

    test('inviteTpoSchema validates initial TPO credentials', () => {
      const invalid = inviteTpoSchema.safeParse({
        firstName: 'John',
        lastName: 'Doe',
        email: 'not-an-email',
        password: '123', // too short
      });
      assert.strictEqual(invalid.success, false);

      const valid = inviteTpoSchema.safeParse({
        firstName: 'Dr. Ramesh',
        lastName: 'Sharma',
        email: 'tpo@anits.edu.in',
        password: 'SecurePassword123!',
      });
      assert.strictEqual(valid.success, true);
    });
  });
});
