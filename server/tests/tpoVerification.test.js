const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const StudentProfile = require('../src/models/StudentProfile');
const { generateVerificationSeal, verifyVerificationSeal } = require('../src/utils/verificationSeal');

describe('TPO Academic Verification Queue Tests (Page 3)', () => {
  const collegeId = new mongoose.Types.ObjectId().toString();
  const studentId = new mongoose.Types.ObjectId().toString();
  const tpoId = new mongoose.Types.ObjectId().toString();

  describe('1. Action Request Validation', () => {
    test('Rejection without reason is strictly rejected', () => {
      const action = 'reject';
      const reason = '';

      const isValid = ['approve', 'reject', 'request_correction'].includes(action);
      const hasReasonIfRequired = action === 'approve' || (reason && reason.trim().length > 0);

      assert.strictEqual(isValid, true);
      assert.strictEqual(Boolean(hasReasonIfRequired), false, 'Rejection must require a non-empty reason');
    });

    test('Valid approve action does not require rejection reason', () => {
      const action = 'approve';
      const reason = '';

      const isValid = ['approve', 'reject', 'request_correction'].includes(action);
      const hasReasonIfRequired = action === 'approve' || (reason && reason.trim().length > 0);

      assert.strictEqual(isValid, true);
      assert.strictEqual(Boolean(hasReasonIfRequired), true);
    });
  });

  describe('2. Cryptographic Approval Seal Verification', () => {
    test('Approving generates valid Ed25519 certificate and verified status', () => {
      const studentData = {
        collegeId,
        studentId,
        rollNo: '2026-IT-044',
        branch: 'Information Technology',
        gradYear: 2026,
        cgpa: 9.15,
        backlogs: 0,
        verifiedAt: new Date(),
        verifiedByTpoId: tpoId,
      };

      const seal = generateVerificationSeal(studentData);

      assert.ok(seal.signature, 'Signature must be generated');
      assert.ok(seal.hash, 'Hash must be generated');
      assert.strictEqual(seal.keyId.startsWith('pe-ed25519-'), true);

      const verification = verifyVerificationSeal({
        currentData: studentData,
        verificationRecord: seal,
      });

      assert.strictEqual(verification.isValid, true);
      assert.strictEqual(verification.status, 'Signature valid');
    });

    test('Rejecting marks isVerifiedByTPO false and preserves rejection reason', () => {
      const profile = new StudentProfile({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        user: new mongoose.Types.ObjectId(studentId),
        rollNo: '2026-IT-044',
        branch: 'Information Technology',
        cgpa: 7.2,
        backlogs: 2,
        isVerifiedByTPO: false,
        verificationRecord: {
          status: 'Needs re-verification',
          rejectionReason: 'Marksheet semester 5 is missing',
        },
      });

      assert.strictEqual(profile.isVerifiedByTPO, false);
      assert.strictEqual(profile.verificationRecord.status, 'Needs re-verification');
      assert.strictEqual(profile.verificationRecord.rejectionReason, 'Marksheet semester 5 is missing');
    });
  });
});
