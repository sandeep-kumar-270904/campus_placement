const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const {
  createCanonicalJson,
  sha256,
  generateVerificationSeal,
  verifyVerificationSeal,
} = require('../src/utils/verificationSeal');
const { keyStore } = require('../src/utils/cryptoKeyStore');
const StudentProfile = require('../src/models/StudentProfile');

describe('Cryptographic TPO Verified Seal & Tamper Invalidation Tests (Part B)', () => {
  const collegeId = new mongoose.Types.ObjectId().toString();
  const studentId = new mongoose.Types.ObjectId().toString();
  const tpoId = new mongoose.Types.ObjectId().toString();

  const originalStudentData = {
    collegeId,
    collegeCode: 'ANITS',
    studentId,
    rollNo: '2026-CS-042',
    branch: 'Computer Science',
    gradYear: 2026,
    cgpa: 8.85,
    backlogs: 0,
    verifiedByTpoId: tpoId,
    verifiedAt: new Date('2026-10-20T10:00:00.000Z'),
  };

  test('Canonical JSON serialization produces strictly sorted and formatted JSON', () => {
    const json1 = createCanonicalJson(originalStudentData);
    const parsed = JSON.parse(json1);

    // Assert keys are sorted alphabetically
    const keys = Object.keys(parsed);
    const sorted = [...keys].sort();
    assert.deepStrictEqual(keys, sorted, 'Keys in canonical JSON must be sorted strictly');

    // Assert normalized representations
    assert.strictEqual(parsed.cgpa, '8.85');
    assert.strictEqual(parsed.backlogs, 0);
    assert.strictEqual(parsed.rollNo, '2026-CS-042');
  });

  test('generateVerificationSeal signs hash with server Ed25519 key and returns seal', () => {
    const seal = generateVerificationSeal(originalStudentData);

    assert.strictEqual(seal.status, 'Verified');
    assert.ok(seal.verificationCode.startsWith('PE-ANITS-'));
    assert.ok(seal.hash && seal.hash.length === 64, 'Must compute SHA-256 hash (64 hex chars)');
    assert.ok(seal.signature && seal.signature.length > 50, 'Must produce base64 Ed25519 signature');
    assert.strictEqual(seal.keyId, keyStore.activeKeyId);
    assert.strictEqual(seal.version, 1);
  });

  test('verifyVerificationSeal succeeds on authentic, untampered record', () => {
    const seal = generateVerificationSeal(originalStudentData);

    const verificationResult = verifyVerificationSeal({
      currentData: {
        collegeId: originalStudentData.collegeId,
        studentId: originalStudentData.studentId,
        rollNo: originalStudentData.rollNo,
        branch: originalStudentData.branch,
        gradYear: originalStudentData.gradYear,
        cgpa: originalStudentData.cgpa,
        backlogs: originalStudentData.backlogs,
      },
      verificationRecord: seal,
    });

    assert.strictEqual(verificationResult.isValid, true);
    assert.strictEqual(verificationResult.status, 'Signature valid');
    assert.strictEqual(verificationResult.currentHash, seal.hash);
  });

  test('ACCEPTANCE CRITERIA: Tampering directly with CGPA in DB makes verification fail with "Record changed or invalid"', () => {
    // 1. TPO generates genuine verified seal for CGPA 8.85
    const genuineSeal = generateVerificationSeal(originalStudentData);

    // 2. Tamperer directly alters CGPA in database from 8.85 to 9.95
    const tamperedData = {
      ...originalStudentData,
      cgpa: 9.95, // Tampered!
    };

    const verificationResult = verifyVerificationSeal({
      currentData: tamperedData,
      verificationRecord: genuineSeal,
    });

    // 3. Must reject with "Record changed or invalid"
    assert.strictEqual(verificationResult.isValid, false);
    assert.ok(
      verificationResult.reason.includes('Record changed or invalid'),
      `Reason must state record changed or invalid, got: ${verificationResult.reason}`
    );
    assert.notStrictEqual(
      verificationResult.currentHash,
      genuineSeal.hash,
      'Hash of tampered record must diverge from signed hash'
    );
  });

  test('ACCEPTANCE CRITERIA: Tampering directly with active backlogs in DB makes verification fail', () => {
    const genuineSeal = generateVerificationSeal(originalStudentData);

    // Tamper with backlogs from 0 to 3
    const tamperedData = {
      ...originalStudentData,
      backlogs: 3,
    };

    const verificationResult = verifyVerificationSeal({
      currentData: tamperedData,
      verificationRecord: genuineSeal,
    });

    assert.strictEqual(verificationResult.isValid, false);
    assert.ok(verificationResult.reason.includes('Record changed or invalid'));
  });

  test('Key rotation support: Seals signed with Key V1 continue to verify after rotating to Key V2', () => {
    // 1. Sign record with current active key (e.g. pe-ed25519-v1)
    const initialKeyId = keyStore.activeKeyId;
    const v1Seal = generateVerificationSeal(originalStudentData);
    assert.strictEqual(v1Seal.keyId, initialKeyId);

    // 2. Perform key rotation to a new key
    const newKeyId = 'pe-ed25519-v2';
    keyStore.rotateToNewKey(newKeyId);
    assert.strictEqual(keyStore.activeKeyId, newKeyId);

    // 3. Newly signed records receive v2 key
    const v2Seal = generateVerificationSeal(originalStudentData);
    assert.strictEqual(v2Seal.keyId, newKeyId);

    // 4. Assert historical v1 record STILL verifies against the registered v1 public key in the keystore!
    const v1Verification = verifyVerificationSeal({
      currentData: originalStudentData,
      verificationRecord: v1Seal,
    });
    assert.strictEqual(v1Verification.isValid, true, 'Historical V1 signature must verify after rotation');

    // 5. Assert v2 record also verifies
    const v2Verification = verifyVerificationSeal({
      currentData: originalStudentData,
      verificationRecord: v2Seal,
    });
    assert.strictEqual(v2Verification.isValid, true, 'V2 signature must verify');
  });

  test('StudentProfile pre-save hook automatically invalidates verification when CGPA is modified', async () => {
    // Create an instance of StudentProfile and initialize as persisted doc
    const profile = new StudentProfile();
    profile.init({
      collegeId: new mongoose.Types.ObjectId(collegeId),
      user: new mongoose.Types.ObjectId(studentId),
      rollNo: '2026-CS-042',
      branch: 'Computer Science',
      cgpa: 8.5,
      backlogs: 0,
      isVerifiedByTPO: true,
      verificationRecord: {
        status: 'Verified',
        verificationCode: 'PE-ANITS-123456-2026',
        hash: 'testhash',
        signature: 'testsig',
      },
    });

    // Mutate CGPA
    profile.cgpa = 9.0;

    // Trigger pre-save hook logic
    await StudentProfile.schema.s.hooks.execPre('save', profile, [() => {}]);

    assert.strictEqual(profile.isVerifiedByTPO, false, 'isVerifiedByTPO must be reset to false');
    assert.strictEqual(
      profile.verificationRecord.status,
      'Needs re-verification',
      'Status must move to "Needs re-verification"'
    );
  });
});
