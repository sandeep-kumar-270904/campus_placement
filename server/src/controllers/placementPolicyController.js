const PlacementPolicy = require('../models/PlacementPolicy');
const PolicyOverride = require('../models/PolicyOverride');
const PolicyExceptionRequest = require('../models/PolicyExceptionRequest');
const StudentProfile = require('../models/StudentProfile');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const {
  getCollegePlacementPolicy,
  evaluateStudentPolicy,
  simulatePolicyImpact,
  generateFairnessReport,
  exportFairnessReportToCsv,
} = require('../services/policyEngine/placementPolicyEngine');

/**
 * @desc    Get placement policy configuration for tenant college
 * @route   GET /api/policies
 * @access  Private
 */
exports.getPolicy = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    if (!collegeId) {
      return res.status(400).json({ error: { message: 'College tenant context is required.' } });
    }

    const policy = await getCollegePlacementPolicy(collegeId);
    res.json({ success: true, policy });
  } catch (err) {
    console.error('getPolicy error:', err);
    res.status(500).json({ error: { message: err.message || 'Failed to fetch placement policy.' } });
  }
};

/**
 * @desc    Update placement policy configuration
 * @route   PUT /api/policies
 * @access  Private (TPO / Admin)
 */
exports.updatePolicy = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    if (!collegeId) {
      return res.status(400).json({ error: { message: 'College tenant context is required.' } });
    }

    const {
      oneStudentOneOffer,
      dreamCap,
      tierEligibility,
      priorityUnplaced,
      maxConcurrentApplications,
      blackoutDates,
      customRules,
    } = req.body;

    let policy = await PlacementPolicy.findOne({ collegeId });
    if (!policy) {
      policy = new PlacementPolicy({ collegeId });
    }

    if (oneStudentOneOffer !== undefined) policy.oneStudentOneOffer = oneStudentOneOffer;
    if (dreamCap !== undefined) policy.dreamCap = dreamCap;
    if (tierEligibility !== undefined) policy.tierEligibility = tierEligibility;
    if (priorityUnplaced !== undefined) policy.priorityUnplaced = priorityUnplaced;
    if (maxConcurrentApplications !== undefined) policy.maxConcurrentApplications = maxConcurrentApplications;
    if (Array.isArray(blackoutDates)) policy.blackoutDates = blackoutDates;
    if (Array.isArray(customRules)) policy.customRules = customRules;

    await policy.save();

    await AuditLog.create({
      collegeId,
      performedBy: req.user?._id || req.user?.id,
      action: 'PLACEMENT_POLICY_UPDATED',
      targetModel: 'PlacementPolicy',
      targetId: policy._id,
      details: {
        oneStudentOneOffer: policy.oneStudentOneOffer?.enabled,
        dreamCap: policy.dreamCap?.enabled,
        tierEligibility: policy.tierEligibility?.enabled,
        priorityUnplaced: policy.priorityUnplaced?.enabled,
        maxConcurrent: policy.maxConcurrentApplications?.enabled,
      },
    });

    res.json({
      success: true,
      message: 'Placement policy configuration updated successfully.',
      policy,
    });
  } catch (err) {
    console.error('updatePolicy error:', err);
    res.status(500).json({ error: { message: err.message || 'Failed to update placement policy.' } });
  }
};

/**
 * @desc    Simulate policy impact against an opportunity
 * @route   POST /api/policies/preview
 * @access  Private (TPO / Admin)
 */
exports.previewSimulation = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { opportunityId, proposedPolicy } = req.body;

    if (!opportunityId) {
      return res.status(400).json({ error: { message: 'opportunityId is required for impact simulation.' } });
    }

    const simulation = await simulatePolicyImpact({
      collegeId,
      opportunityId,
      proposedPolicy,
    });

    res.json({ success: true, simulation });
  } catch (err) {
    console.error('previewSimulation error:', err);
    res.status(500).json({ error: { message: err.message || 'Failed to simulate policy impact.' } });
  }
};

/**
 * @desc    Get all policy overrides with optional filters
 * @route   GET /api/policies/overrides
 * @access  Private (TPO / Admin)
 */
exports.getOverrides = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { isActive, policyType } = req.query;

    const filter = { collegeId };
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    if (policyType) {
      filter.policyType = policyType;
    }

    const overrides = await PolicyOverride.find(filter)
      .populate('studentId', 'firstName lastName email rollNo')
      .populate('opportunityId', 'title companyName')
      .populate('approvedBy', 'firstName lastName email')
      .populate('revokedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    // Attach student roll numbers from StudentProfile if needed
    for (const ov of overrides) {
      if (ov.studentId && !ov.studentId.rollNo) {
        const prof = await StudentProfile.findOne({ user: ov.studentId._id }).select('rollNo branch').lean();
        if (prof) {
          ov.studentRollNo = prof.rollNo;
          ov.studentBranch = prof.branch;
        }
      } else if (ov.studentId) {
        ov.studentRollNo = ov.studentId.rollNo;
      }
    }

    res.json({ success: true, overrides });
  } catch (err) {
    console.error('getOverrides error:', err);
    res.status(500).json({ error: { message: err.message || 'Failed to fetch policy overrides.' } });
  }
};

/**
 * @desc    Grant an institutional policy override with mandatory reason
 * @route   POST /api/policies/overrides
 * @access  Private (TPO / Admin)
 */
exports.grantOverride = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { studentId, opportunityId, policyType, mandatoryReason, expiresAt } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: { message: 'studentId is required.' } });
    }
    if (!policyType) {
      return res.status(400).json({ error: { message: 'policyType is required.' } });
    }
    if (!mandatoryReason || mandatoryReason.trim().length < 5) {
      return res.status(400).json({
        error: { message: 'A mandatory justification of at least 5 characters is required to grant an override.' },
      });
    }

    const approverId = req.user?._id || req.user?.id;

    const override = await PolicyOverride.create({
      collegeId,
      studentId,
      opportunityId: opportunityId || null,
      policyType,
      mandatoryReason: mandatoryReason.trim(),
      approvedBy: approverId,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: true,
    });

    await AuditLog.create({
      collegeId,
      performedBy: approverId,
      action: 'POLICY_OVERRIDE_GRANTED',
      targetModel: 'PolicyOverride',
      targetId: override._id,
      details: {
        studentId,
        opportunityId,
        policyType,
        mandatoryReason: mandatoryReason.trim(),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Policy override granted and audit-logged successfully.',
      override,
    });
  } catch (err) {
    console.error('grantOverride error:', err);
    res.status(500).json({ error: { message: err.message || 'Failed to grant policy override.' } });
  }
};

/**
 * @desc    Revoke an active policy override
 * @route   DELETE /api/policies/overrides/:id
 * @access  Private (TPO / Admin)
 */
exports.revokeOverride = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { id } = req.params;
    const { reason } = req.body || {};

    const override = await PolicyOverride.findOne({ _id: id, collegeId });
    if (!override) {
      return res.status(404).json({ error: { message: 'Policy override not found.' } });
    }

    override.isActive = false;
    override.revokedAt = new Date();
    override.revokedBy = req.user?._id || req.user?.id;
    override.revocationReason = reason || 'Revoked by TPO.';
    await override.save();

    await AuditLog.create({
      collegeId,
      performedBy: req.user?._id || req.user?.id,
      action: 'POLICY_OVERRIDE_REVOKED',
      targetModel: 'PolicyOverride',
      targetId: override._id,
      details: {
        reason: override.revocationReason,
      },
    });

    res.json({
      success: true,
      message: 'Policy override revoked successfully.',
      override,
    });
  } catch (err) {
    console.error('revokeOverride error:', err);
    res.status(500).json({ error: { message: err.message || 'Failed to revoke policy override.' } });
  }
};

/**
 * @desc    Get student policy exception appeals queue (TPO)
 * @route   GET /api/policies/exceptions
 * @access  Private (TPO / Admin)
 */
exports.getExceptions = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { status } = req.query;

    const filter = { collegeId };
    if (status) filter.status = status;

    const exceptions = await PolicyExceptionRequest.find(filter)
      .populate('studentId', 'firstName lastName email rollNo')
      .populate('opportunityId', 'title companyName ctc')
      .populate('reviewedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    for (const ex of exceptions) {
      if (ex.studentId && !ex.studentId.rollNo) {
        const prof = await StudentProfile.findOne({ user: ex.studentId._id }).select('rollNo branch cgpa').lean();
        if (prof) {
          ex.studentRollNo = prof.rollNo;
          ex.studentBranch = prof.branch;
          ex.studentCgpa = prof.cgpa;
        }
      }
    }

    res.json({ success: true, exceptions });
  } catch (err) {
    console.error('getExceptions error:', err);
    res.status(500).json({ error: { message: err.message || 'Failed to fetch exception requests.' } });
  }
};

/**
 * @desc    Submit an eligibility exception request (Student)
 * @route   POST /api/policies/exceptions
 * @access  Private (Student)
 */
exports.submitException = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const studentId = req.user?._id || req.user?.id;
    const { opportunityId, policyType, justification, documents } = req.body;

    if (!opportunityId) {
      return res.status(400).json({ error: { message: 'opportunityId is required.' } });
    }
    if (!justification || justification.trim().length < 10) {
      return res.status(400).json({
        error: { message: 'A written justification of at least 10 characters is required for your appeal.' },
      });
    }

    // Check if an existing pending request is already filed
    const existing = await PolicyExceptionRequest.findOne({
      collegeId,
      studentId,
      opportunityId,
      status: 'Pending',
    });

    if (existing) {
      return res.status(400).json({
        error: { message: 'You already have a pending exception appeal for this placement drive.' },
      });
    }

    const request = await PolicyExceptionRequest.create({
      collegeId,
      studentId,
      opportunityId,
      policyType: policyType || 'general',
      justification: justification.trim(),
      documents: Array.isArray(documents) ? documents : [],
      status: 'Pending',
    });

    await AuditLog.create({
      collegeId,
      performedBy: studentId,
      action: 'POLICY_EXCEPTION_REQUESTED',
      targetModel: 'PolicyExceptionRequest',
      targetId: request._id,
      details: { opportunityId, policyType },
    });

    res.status(201).json({
      success: true,
      message: 'Your eligibility exception appeal has been submitted for TPO moderation.',
      request,
    });
  } catch (err) {
    console.error('submitException error:', err);
    res.status(500).json({ error: { message: err.message || 'Failed to submit exception appeal.' } });
  }
};

/**
 * @desc    Review and approve/reject student exception appeal (TPO)
 * @route   PATCH /api/policies/exceptions/:id
 * @access  Private (TPO / Admin)
 */
exports.reviewException = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { id } = req.params;
    const { status, reviewRemarks, mandatoryOverrideReason } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: { message: "Status must be 'Approved' or 'Rejected'." } });
    }

    const request = await PolicyExceptionRequest.findOne({ _id: id, collegeId });
    if (!request) {
      return res.status(404).json({ error: { message: 'Exception request not found.' } });
    }

    const tpoUserId = req.user?._id || req.user?.id;
    request.status = status;
    request.reviewRemarks = reviewRemarks || '';
    request.reviewedBy = tpoUserId;
    request.reviewedAt = new Date();

    let createdOverride = null;
    if (status === 'Approved') {
      const reason =
        mandatoryOverrideReason ||
        reviewRemarks ||
        `Approved student exception appeal: ${request.justification}`;

      createdOverride = await PolicyOverride.create({
        collegeId,
        studentId: request.studentId,
        opportunityId: request.opportunityId,
        policyType: request.policyType === 'general' ? 'all' : request.policyType,
        mandatoryReason: reason,
        approvedBy: tpoUserId,
        isActive: true,
      });

      request.overrideId = createdOverride._id;
    }

    await request.save();

    await AuditLog.create({
      collegeId,
      performedBy: tpoUserId,
      action: status === 'Approved' ? 'POLICY_EXCEPTION_APPROVED' : 'POLICY_EXCEPTION_REJECTED',
      targetModel: 'PolicyExceptionRequest',
      targetId: request._id,
      details: {
        status,
        reviewRemarks,
        overrideId: createdOverride?._id,
      },
    });

    res.json({
      success: true,
      message: `Exception request ${status.toLowerCase()} successfully.`,
      request,
      override: createdOverride,
    });
  } catch (err) {
    console.error('reviewException error:', err);
    res.status(500).json({ error: { message: err.message || 'Failed to review exception request.' } });
  }
};

/**
 * @desc    Check student policy eligibility for a specific drive
 * @route   GET /api/opportunities/:id/policy-status
 * @access  Private
 */
exports.checkOpportunityPolicyStatus = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const studentId = req.user?._id || req.user?.id;
    const { id: opportunityId } = req.params;

    const opportunity = await Opportunity.findOne({ _id: opportunityId, collegeId });
    if (!opportunity) {
      return res.status(404).json({ error: { message: 'Placement drive not found.' } });
    }

    const result = await evaluateStudentPolicy({
      collegeId,
      studentId,
      opportunity,
    });

    // Check if student has a pending exception request
    const pendingException = await PolicyExceptionRequest.findOne({
      collegeId,
      studentId,
      opportunityId,
      status: 'Pending',
    }).select('status justification createdAt');

    res.json({
      success: true,
      ...result,
      pendingException,
    });
  } catch (err) {
    console.error('checkOpportunityPolicyStatus error:', err);
    res.status(500).json({ error: { message: err.message || 'Failed to check policy status.' } });
  }
};

/**
 * @desc    Get Fairness & Diversity Report JSON
 * @route   GET /api/policies/fairness-report
 * @access  Private (TPO / Admin)
 */
exports.getFairnessReport = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    if (!collegeId) {
      return res.status(400).json({ error: { message: 'College tenant context is required.' } });
    }

    const report = await generateFairnessReport({ collegeId });
    res.json({ success: true, report });
  } catch (err) {
    console.error('getFairnessReport error:', err);
    res.status(500).json({ error: { message: err.message || 'Failed to generate fairness report.' } });
  }
};

/**
 * @desc    Export Fairness & Diversity Report as CSV
 * @route   GET /api/policies/fairness-report/export
 * @access  Private (TPO / Admin)
 */
exports.exportFairnessReport = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const report = await generateFairnessReport({ collegeId });
    const csvContent = exportFairnessReportToCsv(report);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="Fairness_Report_${new Date().toISOString().split('T')[0]}.csv"`);
    return res.status(200).send(csvContent);
  } catch (err) {
    console.error('exportFairnessReport error:', err);
    res.status(500).json({ error: { message: err.message || 'Failed to export fairness report.' } });
  }
};
