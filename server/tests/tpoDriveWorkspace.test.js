const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const Application = require('../src/models/Application');

describe('TPO Drive Workspace & Pipeline Tests (Page 5)', () => {
  const collegeId = new mongoose.Types.ObjectId().toString();
  const studentId = new mongoose.Types.ObjectId().toString();
  const opportunityId = new mongoose.Types.ObjectId().toString();
  const tpoId = new mongoose.Types.ObjectId().toString();

  describe('1. Pipeline Progression & History Logging', () => {
    test('Records round history upon advancement', () => {
      const app = new Application({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        studentId: new mongoose.Types.ObjectId(studentId),
        opportunityId: new mongoose.Types.ObjectId(opportunityId),
        status: 'Applied',
        currentRound: 'Application Review',
      });

      // Advance to Online Assessment
      app.status = 'Online Assessment';
      app.currentRound = 'Coding Round';
      app.roundHistory.push({
        roundName: 'Coding Round',
        status: 'Online Assessment',
        movedAt: new Date(),
        movedBy: new mongoose.Types.ObjectId(tpoId),
        notes: 'Cleared resume screening',
      });

      assert.strictEqual(app.status, 'Online Assessment');
      assert.strictEqual(app.roundHistory.length, 1);
      assert.strictEqual(app.roundHistory[0].roundName, 'Coding Round');
      assert.strictEqual(app.roundHistory[0].notes, 'Cleared resume screening');
    });
  });

  describe('2. Shortlist Roll Number Matching Logic', () => {
    test('Correctly identifies matched and unmatched candidates in candidate callset', () => {
      const applicants = [
        { rollNo: '2026-CS-001', appId: 'app1' },
        { rollNo: '2026-CS-002', appId: 'app2' },
        { rollNo: '2026-CS-003', appId: 'app3' },
      ];

      const inputRolls = ['2026-CS-001', '2026-CS-003', '2026-CS-999'];

      const applicantMap = new Map(applicants.map((a) => [a.rollNo, a.appId]));

      const matched = [];
      const unmatched = [];

      inputRolls.forEach((roll) => {
        if (applicantMap.has(roll)) {
          matched.push({ rollNo: roll, appId: applicantMap.get(roll) });
        } else {
          unmatched.push(roll);
        }
      });

      assert.strictEqual(matched.length, 2);
      assert.strictEqual(unmatched.length, 1);
      assert.strictEqual(unmatched[0], '2026-CS-999');
    });
  });

  describe('3. Interview Scorecard & Rating Constraints', () => {
    test('Stores structured feedback with strengths, gaps, and student visibility toggle', () => {
      const app = new Application({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        studentId: new mongoose.Types.ObjectId(studentId),
        opportunityId: new mongoose.Types.ObjectId(opportunityId),
      });

      app.feedback.push({
        roundName: 'Technical Round 1',
        rating: 4,
        strengths: 'Strong knowledge of binary trees and dynamic programming',
        gaps: 'Could optimize memory allocation in C++',
        comments: 'Recommended for Senior Panel review',
        visibleToStudent: false,
        submittedBy: new mongoose.Types.ObjectId(tpoId),
        createdAt: new Date(),
      });

      assert.strictEqual(app.feedback.length, 1);
      assert.strictEqual(app.feedback[0].rating, 4);
      assert.strictEqual(app.feedback[0].visibleToStudent, false);
      assert.strictEqual(app.feedback[0].roundName, 'Technical Round 1');
    });
  });

  describe('4. Offer Extension Structure', () => {
    test('Constructs formal offer with pending acceptance status and CTC breakdown', () => {
      const app = new Application({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        studentId: new mongoose.Types.ObjectId(studentId),
        opportunityId: new mongoose.Types.ObjectId(opportunityId),
        status: 'Offer Extended',
        offer: {
          status: 'Pending',
          role: 'Member of Technical Staff',
          ctc: 24,
          fixedCtc: 20,
          variableCtc: 4,
          joiningDate: new Date('2026-07-01'),
          remarks: 'Pre-placement offer',
        },
      });

      assert.strictEqual(app.status, 'Offer Extended');
      assert.strictEqual(app.offer.status, 'Pending');
      assert.strictEqual(app.offer.ctc, 24);
      assert.strictEqual(app.offer.fixedCtc, 20);
      assert.strictEqual(app.offer.role, 'Member of Technical Staff');
    });
  });
});
