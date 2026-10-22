const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const College = require('../models/College');
const { verifyVerificationSeal } = require('../utils/verificationSeal');

/**
 * @desc    Public verification endpoint for TPO Ed25519 Verified Seal
 * @route   GET /api/verify/:code
 * @access  Public (No login required, sensitive personal data excluded)
 */
exports.verifyStudentSeal = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({
        error: { code: 'INVALID_CODE', message: 'Verification code is required' },
      });
    }

    const trimmedCode = code.trim();

    // Look up by verification code or roll number across all institutions
    const profile = await StudentProfile.findOne({
      $or: [
        { 'verificationRecord.verificationCode': trimmedCode },
        { rollNo: trimmedCode.toUpperCase() },
        { rollNo: trimmedCode },
      ],
    }).setOptions({ bypassTenantFilter: true });

    if (!profile) {
      return res.status(404).json({
        valid: false,
        status: 'Record changed or invalid',
        error: {
          code: 'RECORD_NOT_FOUND',
          message: `No institutional record found matching verification code or roll number '${code}'`,
        },
      });
    }

    // Retrieve associated user and college
    const [studentUser, college, verifierUser] = await Promise.all([
      User.findById(profile.user).setOptions({ bypassTenantFilter: true }),
      College.findById(profile.collegeId),
      profile.verificationRecord?.verifiedBy
        ? User.findById(profile.verificationRecord.verifiedBy).setOptions({ bypassTenantFilter: true })
        : null,
    ]);

    const studentName = studentUser
      ? `${studentUser.firstName} ${studentUser.lastName}`
      : 'Registered Student';

    const collegeName = college ? college.name : 'Affiliated University';
    const collegeCode = college ? college.code : 'INSTITUTION';
    const verifierName = verifierUser
      ? `${verifierUser.firstName} ${verifierUser.lastName} (TPO)`
      : 'Institutional Placement Cell';

    // 1. Check if record has ever been verified
    if (!profile.verificationRecord || !profile.verificationRecord.hash || !profile.verificationRecord.signature) {
      return res.json({
        valid: false,
        status: 'Record changed or invalid',
        reason: 'This student academic profile has not been cryptographically signed or verified by the institutional placement office.',
        student: {
          name: studentName,
          rollNo: profile.rollNo,
          collegeName,
          collegeCode,
          branch: profile.branch,
          gradYear: profile.graduationYear || profile.academics?.graduationYear || 2026,
          cgpa: profile.cgpa,
          backlogs: profile.backlogs,
          verifiedAt: null,
          verifier: verifierName,
          status: 'Unverified',
        },
      });
    }

    // 2. Check if marked as needing re-verification (e.g. edited after verification)
    if (profile.verificationRecord.status === 'Needs re-verification' || !profile.isVerifiedByTPO) {
      return res.json({
        valid: false,
        status: 'Record changed or invalid',
        reason: 'Record changed or invalid: Academic records (CGPA, backlogs, or branch) were modified after initial TPO signing and require re-verification.',
        student: {
          name: studentName,
          rollNo: profile.rollNo,
          collegeName,
          collegeCode,
          branch: profile.branch,
          gradYear: profile.graduationYear || profile.academics?.graduationYear || 2026,
          cgpa: profile.cgpa,
          backlogs: profile.backlogs,
          verifiedAt: profile.verificationRecord.verifiedAt,
          verifier: verifierName,
          status: 'Needs re-verification',
          keyId: profile.verificationRecord.keyId,
          version: profile.verificationRecord.version,
          verificationCode: profile.verificationRecord.verificationCode,
        },
      });
    }

    // 3. Cryptographic Ed25519 signature & canonical SHA-256 validation against CURRENT database fields
    const currentData = {
      collegeId: profile.collegeId.toString(),
      studentId: (profile.user || profile.userId).toString(),
      rollNo: profile.rollNo,
      branch: profile.branch,
      gradYear: profile.graduationYear || profile.academics?.graduationYear || 2026,
      cgpa: profile.cgpa ?? profile.academics?.currentCgpa ?? 0,
      backlogs: profile.backlogs ?? profile.academics?.activeBacklogs ?? 0,
    };

    const sealResult = verifyVerificationSeal({
      currentData,
      verificationRecord: profile.verificationRecord,
    });

    if (!sealResult.isValid) {
      return res.json({
        valid: false,
        status: 'Record changed or invalid',
        reason: sealResult.reason || 'Cryptographic seal verification failed: database record was modified without authorization.',
        student: {
          name: studentName,
          rollNo: profile.rollNo,
          collegeName,
          collegeCode,
          branch: profile.branch,
          gradYear: profile.graduationYear || profile.academics?.graduationYear || 2026,
          cgpa: profile.cgpa,
          backlogs: profile.backlogs,
          verifiedAt: profile.verificationRecord.verifiedAt,
          verifier: verifierName,
          status: 'Tampered / Invalid',
          keyId: profile.verificationRecord.keyId,
          version: profile.verificationRecord.version,
          verificationCode: profile.verificationRecord.verificationCode,
        },
      });
    }

    // 4. Valid Seal: return authentic certificate data (sensitive personal info excluded)
    return res.json({
      valid: true,
      status: 'Signature valid',
      student: {
        name: studentName,
        rollNo: profile.rollNo,
        collegeName,
        collegeCode,
        branch: profile.branch,
        gradYear: profile.graduationYear || profile.academics?.graduationYear || 2026,
        cgpa: profile.cgpa,
        backlogs: profile.backlogs,
        verifiedAt: profile.verificationRecord.verifiedAt,
        verifier: verifierName,
        status: 'Verified',
        keyId: profile.verificationRecord.keyId,
        version: profile.verificationRecord.version,
        verificationCode: profile.verificationRecord.verificationCode,
      },
    });
  } catch (err) {
    console.error('verifyStudentSeal error:', err);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: err.message,
      },
    });
  }
};
