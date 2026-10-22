const StudentProfile = require('../models/StudentProfile');
const College = require('../models/College');
const { logAuditAction } = require('../utils/auditLogger');
const { generateVerificationSeal } = require('../utils/verificationSeal');

// @desc    Get current student profile
// @route   GET /api/profile/me
// @access  Private (Student)
exports.getMyProfile = async (req, res) => {
  try {
    const studentId = req.user.userId || req.user.id;
    const profile = await StudentProfile.findOne({
      $or: [{ user: studentId }, { userId: studentId }],
    }).populate('user', ['firstName', 'lastName', 'email']);

    if (!profile) {
      return res.status(404).json({
        error: { code: 'PROFILE_NOT_FOUND', message: 'Student profile not found' },
      });
    }
    return res.status(200).json(profile);
  } catch (err) {
    console.error('getMyProfile error:', err);
    return res.status(500).json({
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// @desc    Create or update student profile
// @route   POST /api/profile
// @access  Private (Student)
exports.upsertProfile = async (req, res) => {
  try {
    const studentId = req.user.userId || req.user.id;
    const { personalInfo, academicInfo, skills, careerGoals, rollNo, branch, cgpa, backlogs } = req.body;

    let profile = await StudentProfile.findOne({
      $or: [{ user: studentId }, { userId: studentId }],
    });

    if (profile) {
      // Update existing
      if (personalInfo) profile.personalInfo = { ...profile.personalInfo.toObject(), ...personalInfo };
      if (academicInfo) profile.academicInfo = academicInfo;
      if (skills) profile.skills = skills;
      if (careerGoals !== undefined) profile.careerGoals = careerGoals;
      if (rollNo) profile.rollNo = rollNo;
      if (branch) profile.branch = branch;
      if (cgpa !== undefined) profile.cgpa = cgpa;
      if (backlogs !== undefined) profile.backlogs = backlogs;

      // Note: pre('save') hook automatically invalidates verification if academic fields changed!
      if (req.user.role === 'student' && (cgpa !== undefined || backlogs !== undefined || branch !== undefined)) {
        profile.isVerifiedByTPO = false;
        if (profile.verificationRecord) {
          profile.verificationRecord.status = 'Needs re-verification';
        }
      }

      await profile.save();
      return res.status(200).json(profile);
    }

    // Create new profile
    const derivedRollNo = rollNo || academicInfo?.rollNo || `RN-${Date.now().toString().slice(-6)}`;
    const newCollegeId = req.tenant?.collegeId || req.user.collegeId;

    profile = new StudentProfile({
      collegeId: newCollegeId,
      user: studentId,
      rollNo: derivedRollNo,
      branch: branch || academicInfo?.branch || 'Computer Science',
      cgpa: cgpa !== undefined ? cgpa : (academicInfo?.cgpa || 0),
      backlogs: backlogs !== undefined ? backlogs : (academicInfo?.activeBacklogs || 0),
      personalInfo: personalInfo || {},
      academicInfo: academicInfo || {},
      skills: skills || [],
      careerGoals: careerGoals || '',
      isVerifiedByTPO: false,
      verificationRecord: { status: 'Unverified' },
    });

    await profile.save();

    await logAuditAction({
      req,
      action: 'PROFILE_CREATED',
      targetModel: 'StudentProfile',
      targetId: profile._id,
      afterState: { rollNo: profile.rollNo, user: studentId },
    });

    return res.status(201).json(profile);
  } catch (err) {
    console.error('upsertProfile error:', err);
    return res.status(500).json({
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// @desc    Get all student profiles (TPO / Super Admin)
// @route   GET /api/profile/all
// @access  Private (TPO / Super Admin)
exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await StudentProfile.find()
      .populate('user', ['firstName', 'lastName', 'email'])
      .sort({ createdAt: -1 });

    return res.status(200).json(profiles);
  } catch (err) {
    console.error('getAllProfiles error:', err);
    return res.status(500).json({
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// @desc    Verify or reject a student profile with Ed25519 digital signature seal (TPO only)
// @route   PUT /api/profile/:id/verify
// @access  Private (TPO / Super Admin)
exports.verifyProfile = async (req, res) => {
  try {
    const { isVerified } = req.body;
    const profile = await StudentProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        error: { code: 'PROFILE_NOT_FOUND', message: 'Student profile not found' },
      });
    }

    const tpoId = (req.user.userId || req.user.id).toString();
    const beforeState = {
      isVerifiedByTPO: profile.isVerifiedByTPO,
      verificationRecord: profile.verificationRecord ? profile.verificationRecord.toObject() : null,
    };

    if (isVerified) {
      // Fetch college code
      const college = await College.findById(profile.collegeId);
      const collegeCode = college?.code || 'COL';

      // Generate Ed25519 digital seal over canonical JSON
      const seal = generateVerificationSeal({
        collegeId: profile.collegeId.toString(),
        collegeCode,
        studentId: (profile.user || profile.userId).toString(),
        rollNo: profile.rollNo,
        branch: profile.branch,
        gradYear: profile.graduationYear || profile.academics?.graduationYear || 2026,
        cgpa: profile.cgpa ?? profile.academics?.currentCgpa ?? 0,
        backlogs: profile.backlogs ?? profile.academics?.activeBacklogs ?? 0,
        verifiedByTpoId: tpoId,
        verifiedAt: new Date(),
      });

      profile.isVerifiedByTPO = true;
      profile.verificationRecord = seal;
    } else {
      profile.isVerifiedByTPO = false;
      if (profile.verificationRecord) {
        profile.verificationRecord.status = 'Unverified';
      }
    }

    await profile.save();

    await logAuditAction({
      req,
      action: isVerified ? 'STUDENT_VERIFIED_ED25519' : 'STUDENT_UNVERIFIED',
      targetModel: 'StudentProfile',
      targetId: profile._id,
      beforeState,
      afterState: {
        isVerifiedByTPO: profile.isVerifiedByTPO,
        verificationCode: profile.verificationRecord?.verificationCode,
        keyId: profile.verificationRecord?.keyId,
      },
    });

    return res.status(200).json({
      message: `Profile verification updated to ${isVerified}`,
      profile,
    });
  } catch (err) {
    console.error('verifyProfile error:', err);
    return res.status(500).json({
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};
