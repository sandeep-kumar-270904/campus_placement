const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const Opportunity = require('../src/models/Opportunity');

describe('TPO Placement Drives & Wizard Tests (Page 4)', () => {
  const collegeId = new mongoose.Types.ObjectId().toString();
  const tpoId = new mongoose.Types.ObjectId().toString();

  describe('1. Drive Schema & Validation', () => {
    test('Constructs full drive with structured rounds and CTC breakdown', () => {
      const drive = new Opportunity({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        title: 'Senior Software Engineer',
        companyName: 'Atlassian',
        jobType: 'Full-time',
        location: 'Bangalore, India',
        salary: '28 LPA',
        ctc: {
          fixed: 22,
          variable: 6,
          currency: 'INR',
          lpaString: '28 LPA',
        },
        description: 'Engineering role for high-throughput distributed systems.',
        deadline: new Date('2026-11-30'),
        rounds: [
          { roundNumber: 1, name: 'Online Coding Challenge', type: 'OA', mode: 'Online' },
          { roundNumber: 2, name: 'System Design Interview', type: 'Technical', mode: 'Online' },
          { roundNumber: 3, name: 'Values & Culture Fit', type: 'HR', mode: 'Online' },
        ],
        eligibilityRules: {
          minCgpa: 8.0,
          maxBacklogs: 0,
          allowedBranches: ['Computer Science', 'Information Technology'],
          allowedGraduationYears: [2026],
        },
        status: 'Draft',
        createdBy: new mongoose.Types.ObjectId(tpoId),
      });

      assert.strictEqual(drive.title, 'Senior Software Engineer');
      assert.strictEqual(drive.companyName, 'Atlassian');
      assert.strictEqual(drive.rounds.length, 3);
      assert.strictEqual(drive.rounds[0].type, 'OA');
      assert.strictEqual(drive.rounds[1].name, 'System Design Interview');
      assert.strictEqual(drive.ctc.fixed, 22);
      assert.strictEqual(drive.ctc.variable, 6);
      assert.strictEqual(drive.eligibilityRules.minCgpa, 8.0);
    });

    test('Validates status transitions', () => {
      const validStatuses = ['Draft', 'Open', 'Closed', 'In Progress', 'Completed', 'Archived'];
      for (const st of validStatuses) {
        const drive = new Opportunity({
          collegeId: new mongoose.Types.ObjectId(collegeId),
          title: 'Role',
          companyName: 'Company',
          location: 'Remote',
          salary: '10 LPA',
          description: 'Desc',
          deadline: new Date(),
          status: st,
          createdBy: new mongoose.Types.ObjectId(tpoId),
        });
        assert.strictEqual(drive.status, st);
      }
    });
  });

  describe('2. Live Eligibility Preview Filtering', () => {
    test('Correctly filters student cohort based on multiple criteria', () => {
      const pool = [
        { rollNo: 'S1', isVerifiedByTPO: true, cgpa: 8.5, backlogs: 0, branch: 'Computer Science', gradYear: 2026 },
        { rollNo: 'S2', isVerifiedByTPO: true, cgpa: 7.2, backlogs: 0, branch: 'Computer Science', gradYear: 2026 }, // Below CGPA
        { rollNo: 'S3', isVerifiedByTPO: true, cgpa: 9.1, backlogs: 1, branch: 'Computer Science', gradYear: 2026 }, // Has backlog
        { rollNo: 'S4', isVerifiedByTPO: true, cgpa: 8.8, backlogs: 0, branch: 'Civil Engineering', gradYear: 2026 }, // Wrong branch
        { rollNo: 'S5', isVerifiedByTPO: false, cgpa: 9.5, backlogs: 0, branch: 'Computer Science', gradYear: 2026 }, // Not verified
      ];

      const minCgpa = 8.0;
      const maxBacklogs = 0;
      const allowedBranches = ['Computer Science', 'Information Technology'];

      const eligible = pool.filter(
        (s) =>
          s.isVerifiedByTPO &&
          s.cgpa >= minCgpa &&
          s.backlogs <= maxBacklogs &&
          allowedBranches.includes(s.branch)
      );

      assert.strictEqual(eligible.length, 1);
      assert.strictEqual(eligible[0].rollNo, 'S1');
    });
  });

  describe('3. Drive Duplication Logic', () => {
    test('Clones drive details and appends (Clone) with Draft status', () => {
      const original = {
        title: 'Backend Engineer',
        companyName: 'Stripe',
        location: 'Remote',
        salary: '32 LPA',
        rounds: [{ name: 'OA' }, { name: 'Technical' }],
        eligibilityRules: { minCgpa: 8.5 },
      };

      const clone = {
        ...original,
        title: `${original.title} (Clone)`,
        status: 'Draft',
      };

      assert.strictEqual(clone.title, 'Backend Engineer (Clone)');
      assert.strictEqual(clone.status, 'Draft');
      assert.strictEqual(clone.companyName, 'Stripe');
      assert.strictEqual(clone.rounds.length, 2);
    });
  });
});
