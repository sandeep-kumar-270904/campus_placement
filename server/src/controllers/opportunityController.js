const Opportunity = require('../models/Opportunity');
const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');
const { logAuditAction } = require('../utils/auditLogger');

// @desc    Get all opportunities (Students see Open, TPOs see all)
// @route   GET /api/opportunities
exports.getOpportunities = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'student') {
      query.status = 'Open';
    }
    const opportunities = await Opportunity.find(query).sort({ createdAt: -1 });
    return res.status(200).json(opportunities);
  } catch (err) {
    console.error('getOpportunities error:', err);
    return res.status(500).json({
      message: 'Server error',
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// @desc    Create new opportunity
// @route   POST /api/opportunities
exports.createOpportunity = async (req, res) => {
  try {
    const {
      title,
      companyName,
      companyLogo,
      type,
      location,
      salary,
      description,
      eligibilityRules,
      deadline,
    } = req.body;

    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    const opportunity = new Opportunity({
      collegeId,
      title,
      companyName,
      companyLogo: companyLogo || '',
      type,
      location,
      salary,
      description,
      eligibilityRules: eligibilityRules || {},
      deadline,
      createdBy: req.user.userId || req.user.id,
    });

    await opportunity.save();

    await logAuditAction({
      req,
      action: 'DRIVE_CREATED',
      targetModel: 'Opportunity',
      targetId: opportunity._id,
      afterState: { title: opportunity.title, companyName: opportunity.companyName },
    });

    return res.status(201).json(opportunity);
  } catch (err) {
    console.error('createOpportunity error:', err);
    return res.status(500).json({
      message: 'Server error',
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// @desc    Apply to an opportunity
// @route   POST /api/opportunities/:id/apply
exports.applyToOpportunity = async (req, res) => {
  try {
    const opportunityId = req.params.id;
    const studentId = req.user.userId || req.user.id;

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({
        message: 'Opportunity not found',
        error: { code: 'OPPORTUNITY_NOT_FOUND', message: 'Opportunity not found' },
      });
    }

    // Tenant check: ensure drive belongs to student's college
    if (req.tenant?.collegeId && opportunity.collegeId.toString() !== req.tenant.collegeId.toString()) {
      return res.status(403).json({
        message: 'Opportunity belongs to another college',
        error: {
          code: 'CROSS_TENANT_APPLY_FORBIDDEN',
          message: 'You cannot apply to placement drives outside your college',
        },
      });
    }

    // Check Eligibility Engine
    const profile = await StudentProfile.findOne({
      $or: [{ user: studentId }, { userId: studentId }],
    });

    if (!profile) {
      return res.status(400).json({
        message: 'Please complete your student profile first',
        error: { code: 'PROFILE_INCOMPLETE', message: 'Please complete your student profile first' },
      });
    }

    const isVerified = profile.isVerifiedByTPO || profile.isVerified;
    if (!isVerified) {
      return res.status(400).json({
        message: 'Profile must be verified by TPO before applying',
        error: { code: 'PROFILE_NOT_VERIFIED', message: 'Profile must be verified by TPO before applying' },
      });
    }

    const rules = opportunity.eligibilityRules || {};
    const studentCgpa = profile.cgpa ?? profile.academics?.currentCgpa ?? profile.academicInfo?.cgpa ?? 0;
    const studentBacklogs = profile.backlogs ?? profile.academics?.activeBacklogs ?? profile.academicInfo?.activeBacklogs ?? 0;
    const studentBranch = profile.branch ?? profile.academics?.undergrad?.branch ?? profile.academicInfo?.branch ?? '';

    if (rules.minCgpa !== undefined && studentCgpa < rules.minCgpa) {
      return res.status(400).json({
        message: 'Not eligible: CGPA requirement not met',
        error: { code: 'INELIGIBLE_CGPA', message: 'Not eligible: CGPA requirement not met' },
      });
    }
    if (rules.maxBacklogs !== undefined && studentBacklogs > rules.maxBacklogs) {
      return res.status(400).json({
        message: 'Not eligible: Too many active backlogs',
        error: { code: 'INELIGIBLE_BACKLOGS', message: 'Not eligible: Too many active backlogs' },
      });
    }
    if (rules.allowedBranches && rules.allowedBranches.length > 0 && !rules.allowedBranches.includes(studentBranch)) {
      return res.status(400).json({
        message: 'Not eligible: Branch not allowed',
        error: { code: 'INELIGIBLE_BRANCH', message: 'Not eligible: Branch not allowed' },
      });
    }

    // Enforce Institutional Placement Policy Engine
    const { evaluateStudentPolicy } = require('../services/policyEngine/placementPolicyEngine');
    const policyResult = await evaluateStudentPolicy({
      collegeId: opportunity.collegeId,
      studentId,
      opportunity,
      studentProfile: profile,
    });

    if (!policyResult.isAllowed) {
      const primaryReason = policyResult.blockingReasons[0];
      return res.status(403).json({
        message: primaryReason?.message || 'Application blocked by institutional placement policy',
        error: {
          code: primaryReason?.code || 'POLICY_BLOCKED',
          message: primaryReason?.message || 'Application blocked by institutional placement policy',
          policyType: primaryReason?.policyType,
          blockingReasons: policyResult.blockingReasons,
          canRequestException: true,
        },
      });
    }

    // Create Application
    const application = new Application({
      collegeId: opportunity.collegeId,
      studentId,
      opportunityId,
    });

    await application.save();

    await logAuditAction({
      req,
      action: 'DRIVE_APPLICATION_SUBMITTED',
      targetModel: 'Application',
      targetId: application._id,
      afterState: { opportunityId, studentId },
    });

    return res.status(201).json({ message: 'Successfully applied!', application });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: 'You have already applied to this opportunity',
        error: { code: 'ALREADY_APPLIED', message: 'You have already applied to this opportunity' },
      });
    }
    console.error('applyToOpportunity error:', err);
    return res.status(500).json({
      message: 'Server error',
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// @desc    Get my applications (Student)
// @route   GET /api/opportunities/applications/me
exports.getMyApplications = async (req, res) => {
  try {
    const studentId = req.user.userId || req.user.id;
    const applications = await Application.find({ studentId })
      .populate('opportunityId')
      .sort({ createdAt: -1 });

    return res.status(200).json(applications);
  } catch (err) {
    console.error('getMyApplications error:', err);
    return res.status(500).json({
      message: 'Server error',
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// @desc    Get all applications for a drive (TPO)
// @route   GET /api/opportunities/:id/applications
exports.getOpportunityApplications = async (req, res) => {
  try {
    const applications = await Application.find({ opportunityId: req.params.id })
      .populate('studentId', ['firstName', 'lastName', 'email'])
      .populate('opportunityId')
      .sort({ createdAt: -1 });

    return res.status(200).json(applications);
  } catch (err) {
    console.error('getOpportunityApplications error:', err);
    return res.status(500).json({
      message: 'Server error',
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// @desc    Get all applications across drives (TPO)
// @route   GET /api/opportunities/applications/all
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('studentId', ['firstName', 'lastName', 'email'])
      .populate('opportunityId')
      .sort({ createdAt: -1 });

    return res.status(200).json(applications);
  } catch (err) {
    console.error('getAllApplications error:', err);
    return res.status(500).json({
      message: 'Server error',
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// @desc    Update application status (TPO)
// @route   PUT /api/opportunities/applications/:id/status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, currentRound, interviewSchedule } = req.body;
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        message: 'Application not found',
        error: { code: 'APPLICATION_NOT_FOUND', message: 'Application not found' },
      });
    }

    const beforeState = { status: application.status, currentRound: application.currentRound };

    if (status) application.status = status;
    if (currentRound) application.currentRound = currentRound;
    if (interviewSchedule) application.interviewSchedule = interviewSchedule;
    await application.save();

    await logAuditAction({
      req,
      action: 'APPLICATION_STATUS_UPDATED',
      targetModel: 'Application',
      targetId: application._id,
      beforeState,
      afterState: { status: application.status, currentRound: application.currentRound },
    });

    return res.status(200).json({ message: 'Application status updated', application });
  } catch (err) {
    console.error('updateApplicationStatus error:', err);
    return res.status(500).json({
      message: 'Server error',
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};
