const mongoose = require('mongoose');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const InterviewSlot = require('../models/InterviewSlot');
const Company = require('../models/Company');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { getStorageService } = require('../services/storage');
const { eventBus, DOMAIN_EVENTS } = require('../services/notifications/events/EventBus');

/**
 * Verify recruiter has authority to view or mutate a drive
 * Must belong to recruiter's company or be invited directly
 */
async function verifyDriveAccess(driveId, user, collegeId) {
  const query = { _id: driveId };
  if (collegeId) query.collegeId = collegeId;

  const opportunity = await Opportunity.findOne(query).lean();
  if (!opportunity) {
    return { authorized: false, status: 404, message: 'Recruitment drive not found.' };
  }

  // Superadmin or Admin can manage everything
  if (user.role === 'superadmin' || user.role === 'admin' || user.role === 'tpo') {
    return { authorized: true, opportunity };
  }

  const userCompanyId = user.companyId ? user.companyId.toString() : null;
  const oppCompanyId = opportunity.companyId ? opportunity.companyId.toString() : null;
  const userCompanyName = (user.companyName || '').toLowerCase().trim();
  const oppCompanyName = (opportunity.companyName || '').toLowerCase().trim();

  const isCompanyMatch =
    (userCompanyId && oppCompanyId && userCompanyId === oppCompanyId) ||
    (userCompanyName && oppCompanyName && userCompanyName === oppCompanyName);

  const isInvited =
    Array.isArray(opportunity.invitedRecruiterIds) &&
    opportunity.invitedRecruiterIds.some((id) => id.toString() === (user.id || user.userId).toString());

  if (isCompanyMatch || isInvited) {
    return { authorized: true, opportunity };
  }

  return {
    authorized: false,
    status: 403,
    message: 'Access forbidden: You are not authorized to view or manage recruitment drives of other corporate entities.',
  };
}

/**
 * @desc    Get all drives scoped to recruiter's company
 * @route   GET /api/recruiter/drives
 * @access  Private (Recruiter)
 */
exports.getMyCompanyDrives = async (req, res) => {
  try {
    const recruiterUserId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;
    const companyId = req.user.companyId;
    const companyName = req.user.companyName;

    const query = {
      ...(collegeId ? { collegeId } : {}),
      $or: [
        ...(companyId ? [{ companyId }] : []),
        ...(companyName ? [{ companyName: new RegExp(`^${companyName.trim()}$`, 'i') }] : []),
        { invitedRecruiterIds: recruiterUserId },
      ],
    };

    const drives = await Opportunity.find(query).sort({ deadline: -1 }).lean();

    // Compute candidate pipeline counts per drive
    const drivesWithStats = await Promise.all(
      drives.map(async (drive) => {
        const apps = await Application.find({ opportunityId: drive._id }).select('status offer').lean();
        const total = apps.length;
        const shortlisted = apps.filter((a) =>
          ['Shortlisted', 'Technical Round', 'HR Round', 'Offer Proposed', 'Offer Extended', 'Placed', 'Hired'].includes(
            a.status
          )
        ).length;
        const inProgress = apps.filter((a) =>
          ['Online Assessment', 'Technical Round', 'HR Round'].includes(a.status)
        ).length;
        const offers = apps.filter((a) => a.offer?.status === 'Proposed_By_Recruiter' || a.offer?.status === 'Pending').length;
        const placed = apps.filter((a) => a.status === 'Placed' || a.offer?.status === 'Accepted').length;

        return {
          ...drive,
          id: drive._id,
          stats: {
            total,
            shortlisted,
            inProgress,
            offers,
            placed,
          },
        };
      })
    );

    res.json({
      success: true,
      count: drivesWithStats.length,
      drives: drivesWithStats,
    });
  } catch (error) {
    console.error('getMyCompanyDrives error:', error);
    res.status(500).json({ error: { message: error.message || 'Failed to fetch company drives.' } });
  }
};

/**
 * @desc    Get drive details with proposed JD status & candidate metrics
 * @route   GET /api/recruiter/drives/:id
 * @access  Private (Recruiter)
 */
exports.getDriveDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    const access = await verifyDriveAccess(id, req.user, collegeId);
    if (!access.authorized) {
      return res.status(access.status).json({
        error: { code: 'UNAUTHORIZED_DRIVE_ACCESS', message: access.message },
      });
    }

    const drive = access.opportunity;
    const applications = await Application.find({ opportunityId: drive._id }).select('status offer appliedAt').lean();

    const stats = {
      total: applications.length,
      applied: applications.filter((a) => a.status === 'Applied' || a.status === 'In Review').length,
      shortlisted: applications.filter((a) =>
        ['Shortlisted', 'Technical Round', 'HR Round', 'Offer Proposed', 'Offer Extended', 'Placed'].includes(a.status)
      ).length,
      hold: applications.filter((a) => a.status === 'Hold').length,
      technical: applications.filter((a) => a.status === 'Technical Round').length,
      hr: applications.filter((a) => a.status === 'HR Round').length,
      offersProposed: applications.filter((a) => a.offer?.status === 'Proposed_By_Recruiter').length,
      offersExtended: applications.filter((a) => a.offer?.status === 'Pending').length,
      placed: applications.filter((a) => a.status === 'Placed' || a.offer?.status === 'Accepted').length,
      rejected: applications.filter((a) => a.status === 'Rejected').length,
    };

    res.json({
      success: true,
      drive: {
        ...drive,
        id: drive._id,
      },
      stats,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch drive details.' } });
  }
};

/**
 * @desc    Propose updated JD & criteria (subject to TPO approval)
 * @route   PUT /api/recruiter/drives/:id/propose-jd
 * @access  Private (Recruiter)
 */
exports.proposeJd = async (req, res) => {
  try {
    const { id } = req.params;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;
    const recruiterUserId = req.user.userId || req.user.id;

    const access = await verifyDriveAccess(id, req.user, collegeId);
    if (!access.authorized) {
      return res.status(access.status).json({
        error: { code: 'UNAUTHORIZED_DRIVE_ACCESS', message: access.message },
      });
    }

    const {
      title,
      description,
      salary,
      ctc,
      rounds = [],
      eligibilityRules = {},
    } = req.body;

    const drive = await Opportunity.findById(id);

    drive.proposedJd = {
      title: title || drive.title,
      description: description || drive.description,
      salary: salary || drive.salary,
      ctc: {
        fixed: ctc?.fixed ?? drive.ctc?.fixed ?? 0,
        variable: ctc?.variable ?? drive.ctc?.variable ?? 0,
        currency: ctc?.currency || drive.ctc?.currency || 'INR',
        lpaString: ctc?.lpaString || drive.ctc?.lpaString || '',
      },
      rounds: rounds.length > 0 ? rounds : drive.rounds,
      eligibilityRules: {
        minCgpa: eligibilityRules.minCgpa ?? drive.eligibilityRules?.minCgpa ?? 0,
        maxBacklogs: eligibilityRules.maxBacklogs ?? drive.eligibilityRules?.maxBacklogs ?? 0,
        allowedBranches: eligibilityRules.allowedBranches || drive.eligibilityRules?.allowedBranches || [],
        allowedGraduationYears: eligibilityRules.allowedGraduationYears || drive.eligibilityRules?.allowedGraduationYears || [],
        minTenthPercentage: eligibilityRules.minTenthPercentage ?? drive.eligibilityRules?.minTenthPercentage ?? 0,
        minTwelfthPercentage: eligibilityRules.minTwelfthPercentage ?? drive.eligibilityRules?.minTwelfthPercentage ?? 0,
      },
      status: 'Pending_Approval',
      tpoRemarks: '',
      proposedBy: recruiterUserId,
      proposedAt: new Date(),
    };

    await drive.save();

    await AuditLog.create({
      collegeId: drive.collegeId,
      performedBy: recruiterUserId,
      action: 'RECRUITER_JD_PROPOSED',
      targetModel: 'Opportunity',
      targetId: drive._id,
      details: {
        proposedTitle: drive.proposedJd.title,
        recruiterEmail: req.user.email,
        companyName: req.user.companyName,
      },
    });

    res.json({
      success: true,
      message: 'Job Description & criteria proposed successfully. Awaiting TPO review and approval.',
      proposedJd: drive.proposedJd,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to submit JD proposal.' } });
  }
};

/**
 * @desc    Get candidates for recruiter drive (ranked, filtered, contact info redacted if not shortlisted)
 * @route   GET /api/recruiter/drives/:id/candidates
 * @access  Private (Recruiter)
 */
exports.getCandidates = async (req, res) => {
  try {
    const { id } = req.params;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;
    const recruiterUserId = req.user.userId || req.user.id;
    const { q, skills, minCgpa, maxBacklogs, branch, status } = req.query;

    const access = await verifyDriveAccess(id, req.user, collegeId);
    if (!access.authorized) {
      return res.status(access.status).json({
        error: { code: 'UNAUTHORIZED_DRIVE_ACCESS', message: access.message },
      });
    }

    const appFilter = { opportunityId: id };
    if (status && status !== 'all') {
      appFilter.status = status;
    }

    const applications = await Application.find(appFilter)
      .populate('studentId', 'firstName lastName email rollNo')
      .sort({ appliedAt: -1 })
      .lean();

    const studentUserIds = applications.map((a) => a.studentId?._id).filter(Boolean);
    const profiles = await StudentProfile.find({ user: { $in: studentUserIds } }).lean();

    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.user.toString()] = p;
    });

    // Build candidates callset with filters & privacy boundary
    const candidateList = [];

    for (const app of applications) {
      const studentUser = app.studentId;
      if (!studentUser) continue;

      const profile = profileMap[studentUser._id.toString()] || {};

      const candidateCgpa = profile.cgpa ?? profile.academics?.currentCgpa ?? 0;
      const candidateBacklogs = profile.backlogs ?? profile.academics?.activeBacklogs ?? 0;
      const candidateBranch = profile.branch || 'Unspecified';
      const candidateSkills = profile.skills || [];
      const candidateProjects = profile.projects || [];
      const isVerified = Boolean(profile.isVerifiedByTPO || profile.isVerified);

      // Filters
      if (minCgpa && candidateCgpa < Number(minCgpa)) continue;
      if (maxBacklogs !== undefined && maxBacklogs !== '' && candidateBacklogs > Number(maxBacklogs)) continue;
      if (branch && branch !== 'all' && !candidateBranch.toLowerCase().includes(branch.toLowerCase())) continue;

      if (skills && skills.trim()) {
        const searchSkill = skills.toLowerCase().trim();
        const hasSkill = candidateSkills.some((s) => s.toLowerCase().includes(searchSkill));
        if (!hasSkill) continue;
      }

      const fullName = `${studentUser.firstName || ''} ${studentUser.lastName || ''}`.trim() || 'Candidate';
      if (q && q.trim()) {
        const queryNorm = q.toLowerCase().trim();
        const matchesName = fullName.toLowerCase().includes(queryNorm);
        const matchesRoll = (profile.rollNo || '').toLowerCase().includes(queryNorm);
        if (!matchesName && !matchesRoll) continue;
      }

      // PRIVACY BOUNDARY: Redact contact details UNLESS candidate is shortlisted or beyond
      const isShortlisted = [
        'Shortlisted',
        'Technical Round',
        'HR Round',
        'Offer Proposed',
        'Offer Extended',
        'Placed',
        'Hired',
      ].includes(app.status);

      const email = isShortlisted ? studentUser.email : '[Hidden until shortlisted]';
      const phone = isShortlisted
        ? profile.personalInfo?.phone || 'Not provided'
        : '[Hidden until shortlisted]';

      candidateList.push({
        applicationId: app._id,
        studentId: studentUser._id,
        rollNo: profile.rollNo || 'Pending',
        name: fullName,
        email,
        phone,
        isContactUnlocked: isShortlisted,
        branch: candidateBranch,
        graduationYear: profile.graduationYear || 2026,
        cgpa: candidateCgpa,
        backlogs: candidateBacklogs,
        isVerifiedByTPO: isVerified,
        sealLevel: isVerified ? 'Ed25519 Cryptographic Seal' : 'Unverified',
        skills: candidateSkills,
        projectsCount: candidateProjects.length,
        projects: candidateProjects,
        certificationsCount: (profile.certifications || []).length,
        hasResume: Boolean(profile.resumeUrl || (profile.resumeVersions && profile.resumeVersions.length > 0)),
        publicPortfolioUrl: `/portfolio/${encodeURIComponent(profile.rollNo || studentUser._id)}`,
        status: app.status,
        currentRound: app.currentRound || 'Application Review',
        rejectionReason: app.rejectionReason || '',
        offer: app.offer || null,
        appliedAt: app.appliedAt || app.createdAt,
      });
    }

    // Sort ranked by CGPA desc
    candidateList.sort((a, b) => b.cgpa - a.cgpa);

    // Audit log access for tracking
    await AuditLog.create({
      collegeId: access.opportunity.collegeId,
      performedBy: recruiterUserId,
      action: 'RECRUITER_CANDIDATE_LIST_VIEWED',
      targetModel: 'Opportunity',
      targetId: id,
      details: {
        recruiterEmail: req.user.email,
        companyName: req.user.companyName,
        returnedCandidatesCount: candidateList.length,
      },
    });

    res.json({
      success: true,
      count: candidateList.length,
      candidates: candidateList,
    });
  } catch (error) {
    console.error('getCandidates error:', error);
    res.status(500).json({ error: { message: error.message || 'Failed to fetch candidate list.' } });
  }
};

/**
 * @desc    Update candidate application status (Shortlist, Hold, Reject with reason)
 * @route   PATCH /api/recruiter/applications/:id/status
 * @access  Private (Recruiter)
 */
exports.updateCandidateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason = '', roundName = '' } = req.body;
    const recruiterUserId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    if (!['Shortlisted', 'Hold', 'Rejected'].includes(status)) {
      return res.status(400).json({
        error: { message: "Status must be 'Shortlisted', 'Hold', or 'Rejected'." },
      });
    }

    if (status === 'Rejected' && !rejectionReason.trim()) {
      return res.status(400).json({
        error: { message: 'Rejection reason is required when rejecting a candidate.' },
      });
    }

    const application = await Application.findById(id).populate('opportunityId');
    if (!application) {
      return res.status(404).json({ error: { message: 'Application not found.' } });
    }

    // Check recruiter drive access boundary
    const access = await verifyDriveAccess(application.opportunityId._id, req.user, collegeId);
    if (!access.authorized) {
      return res.status(access.status).json({
        error: { code: 'UNAUTHORIZED_ACCESS', message: access.message },
      });
    }

    application.status = status;
    if (status === 'Rejected') {
      application.rejectionReason = rejectionReason.trim();
    }

    application.roundHistory.push({
      roundName: roundName || application.currentRound || 'Recruiter Review',
      status,
      movedAt: new Date(),
      movedBy: recruiterUserId,
      notes: rejectionReason || `Candidate status updated to ${status} by recruiter.`,
    });

    await application.save();

    await AuditLog.create({
      collegeId: application.collegeId,
      performedBy: recruiterUserId,
      action: `CANDIDATE_${status.toUpperCase()}`,
      targetModel: 'Application',
      targetId: application._id,
      details: {
        newStatus: status,
        rejectionReason,
        recruiterEmail: req.user.email,
      },
    });

    // Emit domain event for notification subscribers
    eventBus.emit(DOMAIN_EVENTS.APPLICATION_STATUS_CHANGED, {
      collegeId: application.collegeId,
      studentId: application.studentId,
      opportunityId: application.opportunityId._id,
      applicationId: application._id,
      newStatus: status,
      companyName: application.opportunityId?.companyName,
    });

    res.json({
      success: true,
      message: `Candidate application moved to ${status}.`,
      status: application.status,
      rejectionReason: application.rejectionReason,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to update candidate status.' } });
  }
};

/**
 * @desc    Export shortlisted candidates as CSV (with unmasked contact details)
 * @route   GET /api/recruiter/drives/:id/export-shortlist
 * @access  Private (Recruiter)
 */
exports.exportShortlistCsv = async (req, res) => {
  try {
    const { id } = req.params;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;
    const recruiterUserId = req.user.userId || req.user.id;

    const access = await verifyDriveAccess(id, req.user, collegeId);
    if (!access.authorized) {
      return res.status(access.status).json({
        error: { code: 'UNAUTHORIZED_DRIVE_ACCESS', message: access.message },
      });
    }

    const drive = access.opportunity;
    const applications = await Application.find({
      opportunityId: id,
      status: {
        $in: [
          'Shortlisted',
          'Technical Round',
          'HR Round',
          'Offer Proposed',
          'Offer Extended',
          'Placed',
          'Hired',
        ],
      },
    })
      .populate('studentId', 'firstName lastName email rollNo')
      .lean();

    const studentUserIds = applications.map((a) => a.studentId?._id).filter(Boolean);
    const profiles = await StudentProfile.find({ user: { $in: studentUserIds } }).lean();

    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.user.toString()] = p;
    });

    const rows = [
      [
        'Roll Number',
        'Student Name',
        'Email Address',
        'Phone Number',
        'Branch',
        'CGPA',
        'Backlogs',
        'Graduation Year',
        'Verified Seal',
        'Application Status',
        'Rounds Cleared',
      ],
    ];

    applications.forEach((app) => {
      const student = app.studentId;
      if (!student) return;
      const profile = profileMap[student._id.toString()] || {};

      rows.push([
        profile.rollNo || 'N/A',
        `${student.firstName} ${student.lastName}`,
        student.email,
        profile.personalInfo?.phone || 'N/A',
        profile.branch || 'N/A',
        profile.cgpa ?? 0,
        profile.backlogs ?? 0,
        profile.graduationYear || 2026,
        profile.isVerifiedByTPO ? 'Verified (Ed25519 Sealed)' : 'Unverified',
        app.status,
        app.roundHistory?.length || 1,
      ]);
    });

    const csvContent = rows
      .map((row) =>
        row
          .map((cell) => {
            const str = String(cell ?? '').replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(',')
      )
      .join('\r\n');

    await AuditLog.create({
      collegeId: drive.collegeId,
      performedBy: recruiterUserId,
      action: 'RECRUITER_SHORTLIST_EXPORTED',
      targetModel: 'Opportunity',
      targetId: id,
      details: {
        shortlistedCount: applications.length,
        recruiterEmail: req.user.email,
        companyName: req.user.companyName,
      },
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="shortlist-${drive.companyName || 'drive'}-${new Date().toISOString().split('T')[0]}.csv"`
    );
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to export shortlist CSV.' } });
  }
};

/**
 * @desc    Get secure signed resume download URL with audit logging
 * @route   GET /api/recruiter/applications/:id/resume
 * @access  Private (Recruiter)
 */
exports.getCandidateResume = async (req, res) => {
  try {
    const { id } = req.params;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;
    const recruiterUserId = req.user.userId || req.user.id;

    const application = await Application.findById(id).populate('studentId').populate('opportunityId');
    if (!application) {
      return res.status(404).json({ error: { message: 'Application not found.' } });
    }

    const access = await verifyDriveAccess(application.opportunityId._id, req.user, collegeId);
    if (!access.authorized) {
      return res.status(access.status).json({
        error: { code: 'UNAUTHORIZED_ACCESS', message: access.message },
      });
    }

    const profile = await StudentProfile.findOne({ user: application.studentId._id }).lean();
    if (!profile) {
      return res.status(404).json({ error: { message: 'Student profile not found.' } });
    }

    const activeResume =
      (profile.resumeVersions || []).find((v) => v.isActive) ||
      (profile.resumeVersions || [])[0] ||
      { fileUrl: profile.resumeUrl, title: 'Resume.pdf' };

    if (!activeResume.fileUrl && !activeResume.storageKey) {
      return res.status(404).json({ error: { message: 'No resume document uploaded for this candidate.' } });
    }

    let downloadUrl = activeResume.fileUrl;
    if (activeResume.storageKey) {
      const storage = getStorageService();
      const signed = await storage.getSignedDownloadUrl({
        key: activeResume.storageKey,
        expiresInSeconds: 300,
        filename: `${profile.rollNo || 'Candidate'}_Resume.pdf`,
      });
      downloadUrl = signed.url;
    }

    await AuditLog.create({
      collegeId: application.collegeId,
      performedBy: recruiterUserId,
      action: 'RECRUITER_RESUME_DOWNLOADED',
      targetModel: 'Application',
      targetId: application._id,
      details: {
        studentRollNo: profile.rollNo,
        recruiterEmail: req.user.email,
        companyName: req.user.companyName,
      },
    });

    res.json({
      success: true,
      downloadUrl,
      title: activeResume.title || 'Candidate Resume',
      version: activeResume.version || 1,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to retrieve resume URL.' } });
  }
};

/**
 * @desc    Slot booking: recruiter sets availability window and panel counts; system auto-allocates shortlisted students
 * @route   POST /api/recruiter/drives/:id/schedule-slots
 * @access  Private (Recruiter)
 */
exports.autoAllocateSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;
    const recruiterUserId = req.user.userId || req.user.id;

    const access = await verifyDriveAccess(id, req.user, collegeId);
    if (!access.authorized) {
      return res.status(access.status).json({
        error: { code: 'UNAUTHORIZED_DRIVE_ACCESS', message: access.message },
      });
    }

    const {
      date,
      startTime = '09:00',
      endTime = '17:00',
      slotDurationMinutes = 30,
      breakDurationMinutes = 15,
      panelCount = 2,
      roundName = 'Technical Interview 1',
      mode = 'Online',
      roomOrLink = '',
    } = req.body;

    if (!date) {
      return res.status(400).json({ error: { message: 'Date is required for interview scheduling.' } });
    }

    // 1. Calculate time slots between startTime and endTime
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const baseDate = new Date(date);
    const startTotalMin = startH * 60 + startM;
    const endTotalMin = endH * 60 + endM;

    const slotIntervals = [];
    let currentMin = startTotalMin;

    while (currentMin + slotDurationMinutes <= endTotalMin) {
      const slotStart = currentMin;
      const slotEnd = currentMin + slotDurationMinutes;

      const formatTime = (min) => {
        const h = String(Math.floor(min / 60)).padStart(2, '0');
        const m = String(min % 60).padStart(2, '0');
        return `${h}:${m}`;
      };

      const startDateTime = new Date(baseDate);
      startDateTime.setHours(Math.floor(slotStart / 60), slotStart % 60, 0, 0);

      const endDateTime = new Date(baseDate);
      endDateTime.setHours(Math.floor(slotEnd / 60), slotEnd % 60, 0, 0);

      slotIntervals.push({
        startTime: formatTime(slotStart),
        endTime: formatTime(slotEnd),
        startDateTime,
        endDateTime,
      });

      currentMin = slotEnd + breakDurationMinutes;
    }

    if (slotIntervals.length === 0) {
      return res.status(400).json({ error: { message: 'No valid slots could be generated in the given time window.' } });
    }

    // 2. Fetch shortlisted candidates who do not already have an interview scheduled for this round
    const applications = await Application.find({
      opportunityId: id,
      status: {
        $in: ['Shortlisted', 'Technical Round', 'HR Round'],
      },
    })
      .populate('studentId', 'firstName lastName email rollNo')
      .lean();

    const existingSlots = await InterviewSlot.find({
      opportunityId: id,
      roundName,
      status: { $ne: 'Cancelled' },
    }).select('studentId');

    const scheduledStudentIds = new Set(existingSlots.map((s) => s.studentId?.toString()));
    const unallocatedApps = applications.filter((a) => !scheduledStudentIds.has(a.studentId?._id?.toString()));

    // 3. Generate panel slots and auto-allocate students
    const panels = Array.from({ length: Math.max(1, panelCount) }, (_, i) => `Panel ${i + 1}`);
    const createdSlots = [];
    let studentIndex = 0;

    for (const interval of slotIntervals) {
      for (const panel of panels) {
        if (studentIndex >= unallocatedApps.length) break;

        const candidateApp = unallocatedApps[studentIndex];
        const student = candidateApp.studentId;

        const slot = await InterviewSlot.create({
          collegeId: access.opportunity.collegeId,
          opportunityId: id,
          roundName,
          studentId: student._id,
          panelName: panel,
          date: baseDate,
          startTime: interval.startTime,
          endTime: interval.endTime,
          startDateTime: interval.startDateTime,
          endDateTime: interval.endDateTime,
          mode,
          roomOrLink,
          status: 'Scheduled',
        });

        // Update application
        await Application.findByIdAndUpdate(candidateApp._id, {
          status: 'Technical Round',
          interviewSchedule: {
            roundName,
            date: baseDate,
            time: `${interval.startTime} - ${interval.endTime}`,
            venueOrLink: roomOrLink,
            notes: `Assigned to ${panel} (${mode}).`,
          },
          $push: {
            roundHistory: {
              roundName,
              status: 'Interview Scheduled',
              movedAt: new Date(),
              movedBy: recruiterUserId,
              notes: `Auto-allocated to ${panel} at ${interval.startTime} - ${interval.endTime}.`,
            },
          },
        });

        // Emit notification
        eventBus.emit(DOMAIN_EVENTS.INTERVIEW_SCHEDULED, {
          collegeId: access.opportunity.collegeId,
          studentId: student._id,
          opportunityId: id,
          roundName,
          startDateTime: interval.startDateTime,
          roomOrLink,
          companyName: access.opportunity.companyName,
        });

        createdSlots.push({
          slotId: slot._id,
          candidateName: `${student.firstName} ${student.lastName}`,
          studentId: student._id,
          panel,
          startTime: interval.startTime,
          endTime: interval.endTime,
        });

        studentIndex++;
      }
      if (studentIndex >= unallocatedApps.length) break;
    }

    await AuditLog.create({
      collegeId: access.opportunity.collegeId,
      performedBy: recruiterUserId,
      action: 'INTERVIEW_SLOTS_ALLOCATED',
      targetModel: 'Opportunity',
      targetId: id,
      details: {
        roundName,
        panelCount,
        allocatedCount: createdSlots.length,
        recruiterEmail: req.user.email,
      },
    });

    res.status(201).json({
      success: true,
      message: `🎉 Successfully auto-allocated ${createdSlots.length} shortlisted candidates across ${panels.length} panel(s).`,
      allocatedCount: createdSlots.length,
      unallocatedRemaining: Math.max(0, unallocatedApps.length - createdSlots.length),
      slots: createdSlots,
    });
  } catch (error) {
    console.error('autoAllocateSlots error:', error);
    res.status(500).json({ error: { message: error.message || 'Failed to auto-allocate interview slots.' } });
  }
};

/**
 * @desc    Get recruitment schedule and interview slots for a drive
 * @route   GET /api/recruiter/drives/:id/schedule
 * @access  Private (Recruiter)
 */
exports.getDriveSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    const access = await verifyDriveAccess(id, req.user, collegeId);
    if (!access.authorized) {
      return res.status(access.status).json({
        error: { code: 'UNAUTHORIZED_DRIVE_ACCESS', message: access.message },
      });
    }

    const slots = await InterviewSlot.find({
      opportunityId: id,
      status: { $ne: 'Cancelled' },
    })
      .populate('studentId', 'firstName lastName email rollNo')
      .sort({ startDateTime: 1 })
      .lean();

    res.json({
      success: true,
      count: slots.length,
      slots: slots.map((s) => ({
        ...s,
        id: s._id,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch schedule.' } });
  }
};

/**
 * @desc    Submit candidate round feedback (rating, strengths, gaps, visibleToStudent flag)
 * @route   POST /api/recruiter/applications/:id/feedback
 * @access  Private (Recruiter)
 */
exports.submitRoundFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;
    const recruiterUserId = req.user.userId || req.user.id;

    const {
      roundName = 'Technical Interview',
      rating = 3,
      strengths = '',
      gaps = '',
      comments = '',
      visibleToStudent = false,
    } = req.body;

    const application = await Application.findById(id).populate('opportunityId');
    if (!application) {
      return res.status(404).json({ error: { message: 'Application not found.' } });
    }

    const access = await verifyDriveAccess(application.opportunityId._id, req.user, collegeId);
    if (!access.authorized) {
      return res.status(access.status).json({
        error: { code: 'UNAUTHORIZED_ACCESS', message: access.message },
      });
    }

    const newFeedback = {
      roundName,
      rating: Math.max(1, Math.min(5, Number(rating))),
      strengths: strengths.trim(),
      gaps: gaps.trim(),
      comments: comments.trim(),
      visibleToStudent: Boolean(visibleToStudent),
      submittedBy: recruiterUserId,
      createdAt: new Date(),
    };

    application.feedback.push(newFeedback);
    await application.save();

    await AuditLog.create({
      collegeId: application.collegeId,
      performedBy: recruiterUserId,
      action: 'RECRUITER_FEEDBACK_SUBMITTED',
      targetModel: 'Application',
      targetId: application._id,
      details: {
        roundName,
        rating,
        visibleToStudent,
        recruiterEmail: req.user.email,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Interview round feedback saved successfully.',
      feedback: newFeedback,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to submit feedback.' } });
  }
};

/**
 * @desc    Propose offer for student (submitted for TPO approval)
 * @route   POST /api/recruiter/applications/:id/propose-offer
 * @access  Private (Recruiter)
 */
exports.proposeOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;
    const recruiterUserId = req.user.userId || req.user.id;

    const {
      role,
      fixedCtc = 0,
      variableCtc = 0,
      totalCtc,
      joiningDate,
      remarks = '',
      offerLetterUrl = '',
    } = req.body;

    const application = await Application.findById(id).populate('opportunityId');
    if (!application) {
      return res.status(404).json({ error: { message: 'Application not found.' } });
    }

    const access = await verifyDriveAccess(application.opportunityId._id, req.user, collegeId);
    if (!access.authorized) {
      return res.status(access.status).json({
        error: { code: 'UNAUTHORIZED_ACCESS', message: access.message },
      });
    }

    const computedTotal = totalCtc ? Number(totalCtc) : Number(fixedCtc) + Number(variableCtc);

    application.offer = {
      status: 'Proposed_By_Recruiter',
      role: role || application.opportunityId?.title,
      ctc: computedTotal,
      fixedCtc: Number(fixedCtc),
      variableCtc: Number(variableCtc),
      joiningDate: joiningDate ? new Date(joiningDate) : null,
      offerLetterUrl,
      remarks: remarks.trim(),
      proposedByRecruiterId: recruiterUserId,
      proposedAt: new Date(),
    };

    application.status = 'Offer Proposed';
    application.roundHistory.push({
      roundName: 'Offer Proposal',
      status: 'Offer Proposed by Recruiter',
      movedAt: new Date(),
      movedBy: recruiterUserId,
      notes: `Recruiter proposed ${computedTotal} LPA (${application.offer.role}) for TPO review.`,
    });

    await application.save();

    await AuditLog.create({
      collegeId: application.collegeId,
      performedBy: recruiterUserId,
      action: 'OFFER_PROPOSED_BY_RECRUITER',
      targetModel: 'Application',
      targetId: application._id,
      details: {
        role: application.offer.role,
        ctc: computedTotal,
        recruiterEmail: req.user.email,
        companyName: req.user.companyName,
      },
    });

    res.json({
      success: true,
      message: `🎉 Offer proposal of ${computedTotal} LPA submitted to Placement Cell for review and endorsement.`,
      offer: application.offer,
      applicationStatus: application.status,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to submit offer proposal.' } });
  }
};

/**
 * @desc    Get recruitment funnel analytics for a specific drive
 * @route   GET /api/recruiter/drives/:id/funnel
 * @access  Private (Recruiter)
 */
exports.getDriveFunnel = async (req, res) => {
  try {
    const { id } = req.params;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    const access = await verifyDriveAccess(id, req.user, collegeId);
    if (!access.authorized) {
      return res.status(access.status).json({
        error: { code: 'UNAUTHORIZED_DRIVE_ACCESS', message: access.message },
      });
    }

    const drive = access.opportunity;
    const applications = await Application.find({ opportunityId: id }).lean();

    const totalApplied = applications.length;
    const shortlisted = applications.filter((a) =>
      ['Shortlisted', 'Technical Round', 'HR Round', 'Offer Proposed', 'Offer Extended', 'Placed', 'Hired'].includes(
        a.status
      )
    ).length;
    const technical = applications.filter((a) =>
      ['Technical Round', 'HR Round', 'Offer Proposed', 'Offer Extended', 'Placed', 'Hired'].includes(a.status)
    ).length;
    const hr = applications.filter((a) =>
      ['HR Round', 'Offer Proposed', 'Offer Extended', 'Placed', 'Hired'].includes(a.status)
    ).length;
    const offersProposed = applications.filter(
      (a) => a.offer?.status === 'Proposed_By_Recruiter' || a.offer?.status === 'Pending' || a.offer?.status === 'Accepted'
    ).length;
    const offersExtended = applications.filter(
      (a) => a.offer?.status === 'Pending' || a.offer?.status === 'Accepted'
    ).length;
    const placed = applications.filter((a) => a.status === 'Placed' || a.offer?.status === 'Accepted').length;
    const rejected = applications.filter((a) => a.status === 'Rejected').length;
    const hold = applications.filter((a) => a.status === 'Hold').length;

    const calcRate = (num, denom) => (denom > 0 ? Math.round((num / denom) * 100) : 0);

    const funnelStages = [
      { stage: 'Total Applied', count: totalApplied, conversionPct: 100, dropOff: totalApplied - shortlisted },
      { stage: 'Shortlisted', count: shortlisted, conversionPct: calcRate(shortlisted, totalApplied), dropOff: shortlisted - technical },
      { stage: 'Technical Interviews', count: technical, conversionPct: calcRate(technical, shortlisted), dropOff: technical - hr },
      { stage: 'HR Round', count: hr, conversionPct: calcRate(hr, technical), dropOff: hr - offersProposed },
      { stage: 'Offers Proposed', count: offersProposed, conversionPct: calcRate(offersProposed, hr), dropOff: offersProposed - offersExtended },
      { stage: 'Offers Endorsed by TPO', count: offersExtended, conversionPct: calcRate(offersExtended, offersProposed), dropOff: offersExtended - placed },
      { stage: 'Hired & Placed', count: placed, conversionPct: calcRate(placed, offersExtended), dropOff: 0 },
    ];

    res.json({
      success: true,
      driveTitle: drive.title,
      companyName: drive.companyName,
      metrics: {
        totalApplied,
        shortlisted,
        technical,
        hr,
        offersProposed,
        offersExtended,
        placed,
        rejected,
        hold,
        overallAcceptanceRate: calcRate(placed, totalApplied),
      },
      funnelStages,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch recruitment funnel.' } });
  }
};
