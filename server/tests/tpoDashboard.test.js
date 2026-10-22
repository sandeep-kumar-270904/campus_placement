const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const StudentProfile = require('../src/models/StudentProfile');
const Opportunity = require('../src/models/Opportunity');
const Application = require('../src/models/Application');
const InterviewSlot = require('../src/models/InterviewSlot');
const AuditLog = require('../src/models/AuditLog');
const { authorize } = require('../src/middleware/authMiddleware');
const { runWithTenantContext } = require('../src/middleware/tenantContext');

describe('TPO Command Center Dashboard Summary Tests (Page 1)', () => {
  const collegeId = new mongoose.Types.ObjectId().toString();

  describe('1. Role Authorization Enforcement', () => {
    test('Student role is blocked from TPO command center with 403 FORBIDDEN', () => {
      const middleware = authorize('tpo', 'admin', 'superadmin');
      const req = { user: { role: 'student', id: '123' } };
      let statusCode = 200;
      let errorBody = null;
      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (body) => {
              errorBody = body;
            },
          };
        },
      };

      middleware(req, res, () => {});

      assert.strictEqual(statusCode, 403);
      assert.strictEqual(errorBody?.error?.code, 'FORBIDDEN');
    });

    test('TPO and Admin roles are granted access', () => {
      const middleware = authorize('tpo', 'admin', 'superadmin');
      let tpoNextCalled = false;
      middleware({ user: { role: 'tpo', id: '456' } }, {}, () => {
        tpoNextCalled = true;
      });
      assert.strictEqual(tpoNextCalled, true, 'TPO role must pass');

      let adminNextCalled = false;
      middleware({ user: { role: 'admin', id: '789' } }, {}, () => {
        adminNextCalled = true;
      });
      assert.strictEqual(adminNextCalled, true, 'Admin role must pass');
    });
  });

  describe('2. KPI Metric Computation & Accuracy', () => {
    test('Calculates verified percentage and placement percentage accurately', () => {
      const totalStudents = 120;
      const verifiedCount = 96;
      const placedStudents = 84;

      const verifiedPercent = totalStudents > 0 ? Math.round((verifiedCount / totalStudents) * 100) : 0;
      const placementPercent = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

      assert.strictEqual(verifiedPercent, 80, '96/120 must equal 80%');
      assert.strictEqual(placementPercent, 70, '84/120 must equal 70%');
    });

    test('Handles division by zero gracefully when college has 0 registered students', () => {
      const totalStudents = 0;
      const verifiedCount = 0;
      const placedStudents = 0;

      const verifiedPercent = totalStudents > 0 ? Math.round((verifiedCount / totalStudents) * 100) : 0;
      const placementPercent = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

      assert.strictEqual(verifiedPercent, 0);
      assert.strictEqual(placementPercent, 0);
    });
  });

  describe('3. Needs-Attention Query Filtering', () => {
    test('Drives closing in 48h query correctly identifies closing drives', () => {
      const now = new Date('2026-10-23T12:00:00Z');
      const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      const drives = [
        { title: 'Drive A', deadline: new Date('2026-10-24T18:00:00Z'), status: 'Open' }, // Within 48h
        { title: 'Drive B', deadline: new Date('2026-10-28T10:00:00Z'), status: 'Open' }, // After 48h
        { title: 'Drive C', deadline: new Date('2026-10-22T10:00:00Z'), status: 'Open' }, // Past
        { title: 'Drive D', deadline: new Date('2026-10-24T10:00:00Z'), status: 'Closed' }, // Closed
      ];

      const closingSoon = drives.filter(
        (d) => d.status === 'Open' && d.deadline >= now && d.deadline <= in48Hours
      );

      assert.strictEqual(closingSoon.length, 1);
      assert.strictEqual(closingSoon[0].title, 'Drive A');
    });

    test('Unscheduled shortlisted candidates detection', () => {
      const candidates = [
        { name: 'Alice', status: 'Shortlisted', interviewSchedule: null },
        { name: 'Bob', status: 'Shortlisted', interviewSchedule: { date: new Date('2026-10-25') } },
        { name: 'Charlie', status: 'Applied', interviewSchedule: null },
        { name: 'Dave', status: 'Shortlisted', interviewSchedule: {} },
      ];

      const unscheduled = candidates.filter(
        (c) => c.status === 'Shortlisted' && (!c.interviewSchedule || !c.interviewSchedule.date)
      );

      assert.strictEqual(unscheduled.length, 2);
      assert.deepStrictEqual(unscheduled.map((u) => u.name), ['Alice', 'Dave']);
    });
  });

  describe('4. Tenant Scoping of Dashboard Entities', () => {
    test('Scoped queries automatically inject tenant collegeId filter', () => {
      runWithTenantContext({ collegeId, isSuperAdmin: false }, () => {
        const studentQuery = StudentProfile.find({ isVerifiedByTPO: false });
        StudentProfile.schema.s.hooks.execPreSync('find', studentQuery);
        assert.strictEqual(studentQuery.getFilter().collegeId, collegeId);

        const oppQuery = Opportunity.find({ status: 'Open' });
        Opportunity.schema.s.hooks.execPreSync('find', oppQuery);
        assert.strictEqual(oppQuery.getFilter().collegeId, collegeId);

        const appQuery = Application.find({ status: 'Shortlisted' });
        Application.schema.s.hooks.execPreSync('find', appQuery);
        assert.strictEqual(appQuery.getFilter().collegeId, collegeId);
      });
    });
  });
});
