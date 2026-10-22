const mongoose = require('mongoose');
const xlsx = require('xlsx');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const InterviewSlot = require('../models/InterviewSlot');
const AuditLog = require('../models/AuditLog');
const { getStorageService } = require('../services/storage');

/**
 * @desc    Get drive workspace summary, overview, and pipeline stage counts
 * @route   GET /api/tpo/drives/:id/workspace
 * @access  Private (TPO / SuperAdmin)
 */
exports.getDriveWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;

    const drive = await Opportunity.findById(id).lean();
    if (!drive) {
      return res.status(404).json({ error: { message: 'Drive not found.' } });
    }

    const applications = await Application.find({
      ...(collegeId ? { collegeId } : {}),
      opportunityId: id,
    })
      .populate('studentId', 'firstName lastName email')
      .lean();

    // Fetch student profile roll numbers and CGPA for applicants
    const userIds = applications.map((a) => a.studentId?._id || a.studentId).filter(Boolean);
    const profiles = await StudentProfile.find({
      ...(collegeId ? { collegeId } : {}),
      user: { $in: userIds },
    }).lean();

    const profileByUser = {};
    profiles.forEach((p) => {
      profileByUser[p.user.toString()] = p;
    });

    const pipelineStages = {
      Applied: 0,
      'Online Assessment': 0,
      'Technical Round': 0,
      'HR Round': 0,
      'Offer Extended': 0,
      Placed: 0,
      Rejected: 0,
    };

    const enrichedApps = applications.map((a) => {
      const p = profileByUser[(a.studentId?._id || a.studentId)?.toString()] || {};
      const stage = a.status in pipelineStages ? a.status : 'Applied';
      pipelineStages[stage] = (pipelineStages[stage] || 0) + 1;

      return {
        id: a._id,
        studentId: a.studentId?._id || a.studentId,
        studentName: a.studentId ? `${a.studentId.firstName || ''} ${a.studentId.lastName || ''}`.trim() : 'Candidate',
        email: a.studentId?.email || '',
        rollNo: p.rollNo || '—',
        branch: p.branch || '—',
        cgpa: p.cgpa || 0,
        backlogs: p.backlogs || 0,
        resumeUrl: p.resumeUrl || '',
        status: a.status,
        currentRound: a.currentRound,
        interviewSchedule: a.interviewSchedule,
        feedback: a.feedback || [],
        offer: a.offer || { status: 'None' },
        appliedAt: a.appliedAt,
      };
    });

    return res.json({
      drive: { ...drive, id: drive._id },
      totalApplicants: applications.length,
      pipelineStages,
      applicants: enrichedApps,
    });
  } catch (err) {
    console.error('getDriveWorkspace error:', err);
    return res.status(500).json({ error: { message: err.message } });
  }
};

/**
 * @desc    Get eligible students who have not yet applied to this drive
 * @route   GET /api/tpo/drives/:id/eligible-non-applicants
 * @access  Private (TPO / SuperAdmin)
 */
exports.getEligibleNonApplicants = async (req, res) => {
  try {
    const { id } = req.params;
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;

    const drive = await Opportunity.findById(id).lean();
    if (!drive) {
      return res.status(404).json({ error: { message: 'Drive not found.' } });
    }

    // Existing applicants
    const existingApplicantUserIds = await Application.distinct('studentId', {
      ...(collegeId ? { collegeId } : {}),
      opportunityId: id,
    });

    const rules = drive.eligibilityRules || {};
    const filter = {
      ...(collegeId ? { collegeId } : {}),
      isVerifiedByTPO: true,
      user: { $nin: existingApplicantUserIds },
    };

    if (rules.minCgpa > 0) filter.cgpa = { $gte: rules.minCgpa };
    if (rules.maxBacklogs !== undefined) filter.backlogs = { $lte: rules.maxBacklogs };
    if (rules.allowedBranches?.length > 0) filter.branch = { $in: rules.allowedBranches };
    if (rules.allowedGraduationYears?.length > 0) filter.graduationYear = { $in: rules.allowedGraduationYears };

    const nonApplicants = await StudentProfile.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ cgpa: -1 })
      .lean();

    return res.json({
      totalEligibleNonApplicants: nonApplicants.length,
      students: nonApplicants.map((s) => ({
        id: s._id,
        userId: s.user?._id || s.user,
        rollNo: s.rollNo,
        name: s.user ? `${s.user.firstName || ''} ${s.user.lastName || ''}`.trim() : 'Candidate',
        email: s.user?.email || '',
        branch: s.branch,
        cgpa: s.cgpa,
        backlogs: s.backlogs,
      })),
    });
  } catch (err) {
    console.error('getEligibleNonApplicants error:', err);
    return res.status(500).json({ error: { message: err.message } });
  }
};

/**
 * @desc    Advance or reject candidate(s) in recruitment pipeline
 * @route   PATCH /api/tpo/drives/:id/applicants/advance
 * @access  Private (TPO / SuperAdmin)
 */
exports.advanceApplicants = async (req, res) => {
  try {
    const { id } = req.params;
    const { applicationIds, targetStatus, targetRound, rejectionReason, notes } = req.body;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0 || !targetStatus) {
      return res.status(400).json({ error: { message: 'applicationIds array and targetStatus are required.' } });
    }

    const tpoId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;

    let modifiedCount = 0;

    for (const appId of applicationIds) {
      const app = await Application.findById(appId);
      if (!app) continue;

      app.status = targetStatus;
      if (targetRound) app.currentRound = targetRound;
      if (targetStatus === 'Rejected' && rejectionReason) {
        app.rejectionReason = rejectionReason;
      }

      app.roundHistory.push({
        roundName: targetRound || app.currentRound,
        status: targetStatus,
        movedAt: new Date(),
        movedBy: tpoId,
        notes: notes || '',
      });

      await app.save();
      modifiedCount++;
    }

    await AuditLog.create({
      collegeId,
      actorId: tpoId,
      action: 'APPLICANTS_PIPELINE_MOVED',
      resource: 'Application',
      metadata: {
        driveId: id,
        count: modifiedCount,
        targetStatus,
        targetRound,
      },
    });

    try {
      const { eventBus, DOMAIN_EVENTS } = require('../services/notifications/events/EventBus');
      const drive = await Opportunity.findById(id).lean();
      const updatedApps = await Application.find({ _id: { $in: applicationIds } })
        .populate('studentId')
        .lean();

      for (const a of updatedApps) {
        if (a.studentId) {
          await eventBus.emitAsync(DOMAIN_EVENTS.APPLICATION_STATUS_CHANGED, {
            application: a,
            studentUser: a.studentId,
            drive,
            newStatus: targetStatus,
            collegeId,
          });
        }
      }
    } catch (eventErr) {
      console.error('Failed to emit APPLICATION_STATUS_CHANGED:', eventErr);
    }

    return res.json({
      success: true,
      message: `Successfully advanced ${modifiedCount} candidate(s) to '${targetStatus}'.`,
      modifiedCount,
    });
  } catch (err) {
    console.error('advanceApplicants error:', err);
    return res.status(500).json({ error: { message: err.message } });
  }
};

/**
 * @desc    Upload CSV/Excel of roll numbers to shortlist candidates for a round
 * @route   POST /api/tpo/drives/:id/shortlist-upload
 * @access  Private (TPO / SuperAdmin)
 */
exports.uploadShortlist = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: { message: 'Shortlist file buffer is required.' } });
    }

    const collegeId = req.tenant?.collegeId || req.user?.collegeId;

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: { message: 'Uploaded sheet contains no data rows.' } });
    }

    // Extract roll numbers
    const headers = Object.keys(rows[0]);
    const rollHeader = headers.find((h) => h.toLowerCase().includes('roll') || h.toLowerCase().includes('reg')) || headers[0];

    const inputRolls = rows
      .map((r) => String(r[rollHeader] || '').trim().toUpperCase())
      .filter(Boolean);

    const uniqueInputRolls = [...new Set(inputRolls)];

    // Find student profiles matching these roll numbers in this college
    const profiles = await StudentProfile.find({
      ...(collegeId ? { collegeId } : {}),
      rollNo: { $in: uniqueInputRolls },
    })
      .populate('user', 'firstName lastName email')
      .lean();

    const profileByRoll = {};
    profiles.forEach((p) => {
      profileByRoll[p.rollNo.toUpperCase()] = p;
    });

    const userIds = profiles.map((p) => p.user?._id || p.user);

    // Find applications for this drive
    const applications = await Application.find({
      ...(collegeId ? { collegeId } : {}),
      opportunityId: id,
      studentId: { $in: userIds },
    }).lean();

    const appByUserId = {};
    applications.forEach((a) => {
      appByUserId[a.studentId.toString()] = a;
    });

    const matched = [];
    const unmatched = [];

    uniqueInputRolls.forEach((roll) => {
      const p = profileByRoll[roll];
      if (p) {
        const uid = (p.user?._id || p.user)?.toString();
        const app = appByUserId[uid];
        if (app) {
          matched.push({
            applicationId: app._id,
            rollNo: p.rollNo,
            name: `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.trim(),
            email: p.user?.email || '',
            currentStatus: app.status,
            currentRound: app.currentRound,
          });
        } else {
          unmatched.push({ rollNo: roll, reason: 'Registered student, but did not apply to this drive' });
        }
      } else {
        unmatched.push({ rollNo: roll, reason: 'Roll number not found in institution database' });
      }
    });

    return res.json({
      totalInSheet: uniqueInputRolls.length,
      matchedCount: matched.length,
      unmatchedCount: unmatched.length,
      matched,
      unmatched,
    });
  } catch (err) {
    console.error('uploadShortlist error:', err);
    return res.status(500).json({ error: { message: err.message } });
  }
};

/**
 * @desc    Submit interviewer scorecard/feedback for a candidate
 * @route   POST /api/tpo/drives/:id/applicants/:appId/feedback
 * @access  Private (TPO / SuperAdmin)
 */
exports.submitFeedback = async (req, res) => {
  try {
    const { appId } = req.params;
    const { roundName, rating = 3, strengths, gaps, comments, visibleToStudent = false } = req.body;
    const tpoId = req.user.userId || req.user.id;

    const application = await Application.findById(appId);
    if (!application) {
      return res.status(404).json({ error: { message: 'Application not found.' } });
    }

    application.feedback.push({
      roundName: roundName || application.currentRound,
      rating: Math.max(1, Math.min(5, parseInt(rating, 10))),
      strengths: strengths || '',
      gaps: gaps || '',
      comments: comments || '',
      visibleToStudent: Boolean(visibleToStudent),
      submittedBy: tpoId,
      createdAt: new Date(),
    });

    await application.save();

    return res.json({
      success: true,
      message: 'Feedback recorded successfully.',
      feedback: application.feedback,
    });
  } catch (err) {
    console.error('submitFeedback error:', err);
    return res.status(500).json({ error: { message: err.message } });
  }
};

/**
 * @desc    Extend formal placement offer to candidate
 * @route   POST /api/tpo/drives/:id/applicants/:appId/offer
 * @access  Private (TPO / SuperAdmin)
 */
exports.extendOffer = async (req, res) => {
  try {
    const { id, appId } = req.params;
    const { ctc, fixedCtc, variableCtc, role, joiningDate, offerLetterUrl, remarks } = req.body;
    const tpoId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;

    const [application, drive] = await Promise.all([
      Application.findById(appId),
      Opportunity.findById(id),
    ]);

    if (!application) {
      return res.status(404).json({ error: { message: 'Application not found.' } });
    }

    application.status = 'Offer Extended';
    application.currentRound = 'Final Placement Offer';
    application.offer = {
      status: 'Pending',
      role: role || drive?.title || 'Engineer',
      ctc: parseFloat(ctc) || (drive?.ctc?.fixed + drive?.ctc?.variable) || 0,
      fixedCtc: parseFloat(fixedCtc) || drive?.ctc?.fixed || 0,
      variableCtc: parseFloat(variableCtc) || drive?.ctc?.variable || 0,
      joiningDate: joiningDate ? new Date(joiningDate) : null,
      offerLetterUrl: offerLetterUrl || '',
      remarks: remarks || '',
      decisionDate: null,
    };

    application.roundHistory.push({
      roundName: 'Offer Extended',
      status: 'Offer Extended',
      movedAt: new Date(),
      movedBy: tpoId,
      notes: `Offer extended for ${role || drive?.title} at ${ctc} LPA.`,
    });

    await application.save();

    await AuditLog.create({
      collegeId,
      actorId: tpoId,
      action: 'OFFER_EXTENDED',
      resource: 'Application',
      metadata: {
        driveId: id,
        applicationId: appId,
        studentId: application.studentId,
        ctc,
      },
    });

    try {
      const { eventBus, DOMAIN_EVENTS } = require('../services/notifications/events/EventBus');
      const studentUser = await User.findById(application.studentId).lean();
      if (studentUser) {
        await eventBus.emitAsync(DOMAIN_EVENTS.OFFER_EXTENDED, {
          application,
          studentUser,
          drive,
          offerDetails: { ctcTotal: application.offer.ctc },
          collegeId,
        });
      }
    } catch (eventErr) {
      console.error('Failed to emit OFFER_EXTENDED event:', eventErr);
    }

    return res.json({
      success: true,
      message: `Formal offer extended successfully! Candidate notified.`,
      offer: application.offer,
    });
  } catch (err) {
    console.error('extendOffer error:', err);
    return res.status(500).json({ error: { message: err.message } });
  }
};

/**
 * @desc    Approve or reject recruiter's proposed offer
 * @route   PATCH /api/tpo/applications/:appId/review-proposed-offer
 * @access  Private (TPO / Admin)
 */
exports.reviewProposedOffer = async (req, res) => {
  try {
    const { appId } = req.params;
    const { decision, tpoRemarks = '' } = req.body; // 'Approved' | 'Rejected'
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const tpoId = req.user?.userId || req.user?.id;

    if (!['Approved', 'Rejected'].includes(decision)) {
      return res.status(400).json({ error: { message: "Decision must be 'Approved' or 'Rejected'." } });
    }

    const application = await Application.findOne({
      _id: appId,
      ...(collegeId ? { collegeId } : {}),
    }).populate('opportunityId');

    if (!application) {
      return res.status(404).json({ error: { message: 'Application not found.' } });
    }

    if (!application.offer || application.offer.status !== 'Proposed_By_Recruiter') {
      return res.status(400).json({ error: { message: 'No proposed recruiter offer found for this candidate.' } });
    }

    if (decision === 'Approved') {
      application.offer.status = 'Pending';
      application.offer.tpoApprovedAt = new Date();
      application.offer.tpoApprovedBy = tpoId;
      application.status = 'Offer Extended';

      application.roundHistory.push({
        roundName: 'Offer Approved',
        status: 'Offer Extended to Student',
        movedAt: new Date(),
        movedBy: tpoId,
        notes: tpoRemarks || `TPO endorsed and extended offer of ${application.offer.ctc} LPA to candidate.`,
      });

      await application.save();

      // Emit event so student is notified
      try {
        const { eventBus, DOMAIN_EVENTS } = require('../services/notifications/events/EventBus');
        const studentUser = await User.findById(application.studentId).lean();
        if (studentUser) {
          await eventBus.emitAsync(DOMAIN_EVENTS.OFFER_EXTENDED, {
            application,
            studentUser,
            drive: application.opportunityId,
            offerDetails: { ctcTotal: application.offer.ctc },
            collegeId,
          });
        }
      } catch (e) {
        console.warn('Failed to emit OFFER_EXTENDED on approval:', e);
      }
    } else {
      application.offer.status = 'Rejected_By_TPO';
      application.offer.remarks = tpoRemarks || 'Offer proposal rejected by TPO.';
      await application.save();
    }

    await AuditLog.create({
      collegeId: application.collegeId,
      performedBy: tpoId,
      action: decision === 'Approved' ? 'RECRUITER_OFFER_APPROVED' : 'RECRUITER_OFFER_REJECTED',
      targetModel: 'Application',
      targetId: application._id,
      details: {
        decision,
        tpoRemarks,
        ctc: application.offer.ctc,
      },
    });

    res.json({
      success: true,
      message: `Recruiter offer proposal has been ${decision.toLowerCase()}.`,
      offer: application.offer,
      applicationStatus: application.status,
    });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
};
