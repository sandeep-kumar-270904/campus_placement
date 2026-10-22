const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const xlsx = require('xlsx');

const StudentProfile = require('../src/models/StudentProfile');
const { generateVerificationSeal, verifyVerificationSeal } = require('../src/utils/verificationSeal');

describe('TPO Student Directory & Bulk Import Tests (Page 2)', () => {
  const collegeId = new mongoose.Types.ObjectId().toString();
  const tpoId = new mongoose.Types.ObjectId().toString();

  describe('1. Pagination & Query Filter Computation', () => {
    test('Calculates skip and totalPages accurately', () => {
      const total = 54;
      const limit = 20;
      const page = 3;
      const skip = (page - 1) * limit;
      const totalPages = Math.ceil(total / limit);

      assert.strictEqual(skip, 40, 'Page 3 with limit 20 must skip 40');
      assert.strictEqual(totalPages, 3, '54 items with limit 20 must yield 3 pages');
    });

    test('Filter builder maps CGPA and backlogs properly', () => {
      const minCgpa = '7.5';
      const maxBacklogs = '0';
      const branch = 'Computer Science';

      const filter = { collegeId };
      if (branch) filter.branch = branch;
      if (minCgpa) filter.cgpa = { $gte: parseFloat(minCgpa) };
      if (maxBacklogs !== '') filter.backlogs = { $lte: parseInt(maxBacklogs, 10) };

      assert.strictEqual(filter.branch, 'Computer Science');
      assert.strictEqual(filter.cgpa.$gte, 7.5);
      assert.strictEqual(filter.backlogs.$lte, 0);
    });
  });

  describe('2. Dry-Run Sheet Validation & Duplicate Detection', () => {
    test('Parses sheet buffer and detects invalid rows and duplicates', () => {
      const testRows = [
        { 'Roll No': '2026-CS-001', 'Full Name': 'Alice Smith', Email: 'alice@anits.edu', Branch: 'CSE', CGPA: '8.8', Backlogs: '0' },
        { 'Roll No': '', 'Full Name': 'Bad Row', Email: 'bad@anits.edu', Branch: 'CSE', CGPA: '7.5', Backlogs: '0' }, // Missing roll
        { 'Roll No': '2026-CS-002', 'Full Name': 'Bob Brown', Email: 'not-an-email', Branch: 'IT', CGPA: '9.0', Backlogs: '0' }, // Invalid email
        { 'Roll No': '2026-CS-001', 'Full Name': 'Alice Duplicate', Email: 'alice2@anits.edu', Branch: 'CSE', CGPA: '8.8', Backlogs: '0' }, // Duplicate roll in file
      ];

      const ws = xlsx.utils.json_to_sheet(testRows);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Students');
      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

      // Simulate parsing logic
      const readWb = xlsx.read(buffer, { type: 'buffer' });
      const rows = xlsx.utils.sheet_to_json(readWb.Sheets[readWb.SheetNames[0]]);

      const seenRolls = new Set();
      const errors = [];

      rows.forEach((r, idx) => {
        const roll = r['Roll No'];
        const email = r['Email'];
        const rowNum = idx + 2;

        if (!roll) {
          errors.push({ rowNum, error: 'Missing roll number' });
        } else if (seenRolls.has(roll)) {
          errors.push({ rowNum, error: `Duplicate roll number ${roll}` });
        } else {
          seenRolls.add(roll);
        }

        if (!email || !email.includes('@')) {
          errors.push({ rowNum, error: 'Invalid email' });
        }
      });

      assert.strictEqual(rows.length, 4);
      assert.strictEqual(errors.length, 3);
      assert.strictEqual(errors[0].error, 'Missing roll number');
      assert.strictEqual(errors[1].error, 'Invalid email');
      assert.strictEqual(errors[2].error, 'Duplicate roll number 2026-CS-001');
    });
  });

  describe('3. Bulk Verification with Ed25519 Sealing', () => {
    test('Approve action generates valid cryptographic seal', () => {
      const studentData = {
        collegeId,
        studentId: new mongoose.Types.ObjectId().toString(),
        rollNo: '2026-CS-099',
        branch: 'Information Technology',
        gradYear: 2026,
        cgpa: 8.92,
        backlogs: 0,
        verifiedAt: new Date(),
        verifiedByTpoId: tpoId,
      };

      const seal = generateVerificationSeal(studentData);
      assert.ok(seal.signature, 'Signature must be generated');
      assert.ok(seal.verificationCode.startsWith('PE-'), 'Verification code must start with PE-');

      const verification = verifyVerificationSeal({
        currentData: studentData,
        verificationRecord: seal,
      });

      assert.strictEqual(verification.isValid, true);
      assert.strictEqual(verification.status, 'Signature valid');
    });
  });

  describe('4. TPO Private Notes Structure', () => {
    test('StudentProfile accepts and stores TPO notes with author and timestamp', () => {
      const profile = new StudentProfile({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        user: new mongoose.Types.ObjectId(),
        rollNo: '2026-CS-101',
        branch: 'Computer Science',
        cgpa: 8.5,
        backlogs: 0,
      });

      profile.tpoNotes.push({
        note: 'Excellent communicator; recommended for leadership roles.',
        createdBy: new mongoose.Types.ObjectId(tpoId),
        createdAt: new Date(),
      });

      assert.strictEqual(profile.tpoNotes.length, 1);
      assert.strictEqual(profile.tpoNotes[0].note, 'Excellent communicator; recommended for leadership roles.');
      assert.strictEqual(profile.tpoNotes[0].createdBy.toString(), tpoId);
    });
  });
});
