const mongoose = require('mongoose');
const StudentProfile = require('../models/StudentProfile');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const InterviewSlot = require('../models/InterviewSlot');
const Document = require('../models/Document');
const College = require('../models/College');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const EligibilityCache = require('../models/EligibilityCache');
const { evaluateEligibility } = require('../services/eligibilityEngine');
const { getStorageService } = require('../services/storage');

/**
 * Format Date to UTC iCalendar string: YYYYMMDDTHHmmssZ
 */
function formatIcsDate(date) {
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Calculate readiness score (0-100) based on profile completeness & achievements
 */
function calculateReadinessScore(profile, user) {
  if (!profile) return 0;
  let score = 20; // Base registered

  if (profile.isVerifiedByTPO) score += 20;
  if ((profile.cgpa || 0) >= 7.5) score += 15;
  else if ((profile.cgpa || 0) >= 6.0) score += 10;

  if (profile.resumeUrl || (profile.resumeVersions && profile.resumeVersions.length > 0)) score += 15;
  if (profile.skills && profile.skills.length >= 3) score += 10;
  if (profile.projects && profile.projects.length >= 1) score += 10;
  if (profile.certifications && profile.certifications.length >= 1) score += 5;
  if (profile.academics?.tenth?.score && profile.academics?.twelfth?.score) score += 5;

  return Math.min(100, score);
}

/**
 * Calculate profile completeness breakdown & next best action
 */
function calculateProfileCompleteness(profile) {
  const missing = [];
  let completedSections = 0;
  const totalSections = 6;

  if (profile?.personalInfo?.phone && profile?.personalInfo?.gender) {
    completedSections++;
  } else {
    missing.push('Personal Details (Phone & Gender)');
  }

  if (profile?.academics?.tenth?.score && profile?.academics?.twelfth?.score) {
    completedSections++;
  } else {
    missing.push('School Academics (10th & 12th Scores)');
  }

  if (profile?.resumeVersions?.length > 0 || profile?.resumeUrl) {
    completedSections++;
  } else {
    missing.push('Primary Resume Document');
  }

  if (profile?.skills?.length >= 3) {
    completedSections++;
  } else {
    missing.push('Key Technical Skills (at least 3)');
  }

  if (profile?.projects?.length >= 1) {
    completedSections++;
  } else {
    missing.push('Portfolio Project with demo/GitHub link');
  }

  if (profile?.isVerifiedByTPO) {
    completedSections++;
  } else {
    missing.push('TPO Academic Verification Seal');
  }

  const percentage = Math.round((completedSections / totalSections) * 100);

  let nextBestAction = 'Your profile is 100% complete and recruiter-ready!';
  if (missing.length > 0) {
    nextBestAction = `Next step: Add ${missing[0]} to boost your placement readiness.`;
  }

  return { percentage, missing, nextBestAction };
}

/**
 * @desc    Get Student "Today" command center dashboard summary
 * @route   GET /api/student/dashboard/today
 * @access  Private (Student)
 */
exports.getDashboardToday = async (req, res) => {
  try {
    const studentUserId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    const [profile, college, user, applications, openDrives, interviewSlots] = await Promise.all([
      StudentProfile.findOne({
        ...(collegeId ? { collegeId } : {}),
        user: studentUserId,
      }).lean(),
      collegeId ? College.findById(collegeId).lean() : null,
      User.findById(studentUserId).select('-password').lean(),
      Application.find({
        ...(collegeId ? { collegeId } : {}),
        studentId: studentUserId,
      })
        .populate('opportunityId', 'title companyName companyLogo location salary ctc deadline rounds status')
        .sort({ updatedAt: -1 })
        .lean(),
      Opportunity.find({
        ...(collegeId ? { collegeId } : {}),
        status: 'Open',
      })
        .sort({ deadline: 1 })
        .limit(10)
        .lean(),
      InterviewSlot.find({
        ...(collegeId ? { collegeId } : {}),
        studentId: studentUserId,
        status: { $ne: 'Cancelled' },
        startDateTime: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      })
        .populate('opportunityId', 'title companyName companyLogo')
        .sort({ startDateTime: 1 })
        .lean(),
    ]);

    const readinessScore = calculateReadinessScore(profile, user);
    const completeness = calculateProfileCompleteness(profile);

    // 1. "Today" panel deadlines (drives closing in <= 48 hours)
    const now = new Date();
    const fortyEightHours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const appliedOppIds = new Set(applications.map((a) => (a.opportunityId?._id || a.opportunityId)?.toString()));

    const closingDeadlines = openDrives
      .filter((d) => d.deadline && new Date(d.deadline) <= fortyEightHours && new Date(d.deadline) >= now)
      .map((d) => ({
        id: d._id,
        title: d.title,
        companyName: d.companyName,
        companyLogo: d.companyLogo,
        deadline: d.deadline,
        hasApplied: appliedOppIds.has(d._id.toString()),
      }));

    // 2. Pending Actions
    const pendingActions = [];
    if (!profile?.isVerifiedByTPO) {
      pendingActions.push({
        type: 'verification_pending',
        priority: 'high',
        title: 'Academic Verification Pending',
        message: 'Upload your verified marksheets to receive the TPO cryptographic seal.',
        actionLink: '/student/documents',
      });
    }

    // Check for pending offer decisions
    applications.forEach((a) => {
      if (a.offer?.status === 'Pending') {
        pendingActions.push({
          type: 'offer_pending',
          priority: 'urgent',
          title: `Action Required: Offer from ${a.opportunityId?.companyName || 'Recruiter'}`,
          message: `Formal offer extended for ${a.offer.role || a.opportunityId?.title} (${a.offer.ctc} LPA). Please accept or decline.`,
          actionLink: '/student/applications',
          applicationId: a._id,
        });
      }
    });

    if (completeness.missing.length > 0) {
      pendingActions.push({
        type: 'profile_incomplete',
        priority: 'medium',
        title: 'Complete Your Profile',
        message: completeness.nextBestAction,
        actionLink: '/student/profile',
      });
    }

    // 3. Application Summary Pipeline
    const applicationSummary = {
      total: applications.length,
      applied: applications.filter((a) => a.status === 'Applied' || a.status === 'In Review').length,
      onlineAssessment: applications.filter((a) => a.status === 'Online Assessment').length,
      shortlisted: applications.filter((a) => a.status === 'Shortlisted').length,
      technical: applications.filter((a) => a.status === 'Technical Round').length,
      hrRound: applications.filter((a) => a.status === 'HR Round').length,
      offers: applications.filter((a) => a.offer?.status === 'Pending' || a.status === 'Offer Extended' || a.offer?.status === 'Accepted').length,
      placed: applications.filter((a) => a.status === 'Placed' || a.offer?.status === 'Accepted').length,
    };

    // 4. Recommended Drives (with explanatory eligibility)
    const recommendedDrives = [];
    for (const drive of openDrives) {
      const eligibility = await EligibilityCache.getCachedOrCompute(drive, profile, college);
      recommendedDrives.push({
        id: drive._id,
        title: drive.title,
        companyName: drive.companyName,
        companyLogo: drive.companyLogo,
        location: drive.location,
        salary: drive.salary,
        ctc: drive.ctc,
        deadline: drive.deadline,
        hasApplied: appliedOppIds.has(drive._id.toString()),
        eligibility,
      });
    }

    res.json({
      success: true,
      profile: profile || { isVerifiedByTPO: false, cgpa: 0, backlogs: 0 },
      readinessScore,
      completeness,
      today: {
        closingDeadlines,
        todayInterviews: interviewSlots,
        pendingActions,
      },
      applicationSummary,
      recommendedDrives,
      recentApplications: applications.slice(0, 5),
    });
  } catch (error) {
    console.error('getDashboardToday error:', error);
    res.status(500).json({ error: { message: error.message || 'Failed to fetch dashboard data.' } });
  }
};

/**
 * @desc    Get opportunities for student with explanatory eligibility tags & filters
 * @route   GET /api/student/opportunities
 * @access  Private (Student)
 */
exports.getStudentOpportunities = async (req, res) => {
  try {
    const studentUserId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;
    const { q, eligibleOnly, ctcMin, ctcMax, jobType, closingSoon } = req.query;

    const [profile, college, applications] = await Promise.all([
      StudentProfile.findOne({
        ...(collegeId ? { collegeId } : {}),
        user: studentUserId,
      }).lean(),
      collegeId ? College.findById(collegeId).lean() : null,
      Application.find({
        ...(collegeId ? { collegeId } : {}),
        studentId: studentUserId,
      }).select('opportunityId status offer appliedAt').lean(),
    ]);

    const appliedMap = {};
    applications.forEach((a) => {
      appliedMap[a.opportunityId.toString()] = a;
    });

    const filter = {
      ...(collegeId ? { collegeId } : {}),
      status: 'Open',
    };

    if (jobType && jobType !== 'all') {
      filter.$or = [{ jobType }, { type: jobType }];
    }

    if (closingSoon === 'true') {
      const soon = new Date(Date.now() + 48 * 60 * 60 * 1000);
      filter.deadline = { $lte: soon, $gte: new Date() };
    }

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [{ title: regex }, { companyName: regex }, { location: regex }, { description: regex }],
      });
    }

    const drives = await Opportunity.find(filter).sort({ deadline: 1 }).lean();

    // Decorate each drive with explanatory eligibility
    const decoratedDrives = [];
    for (const drive of drives) {
      const eligibility = await EligibilityCache.getCachedOrCompute(drive, profile, college);
      const app = appliedMap[drive._id.toString()];

      const driveCtc = drive.ctc?.fixed || drive.ctc?.total || 0;
      if (ctcMin && driveCtc < Number(ctcMin)) continue;
      if (ctcMax && driveCtc > Number(ctcMax)) continue;
      if (eligibleOnly === 'true' && !eligibility.isEligible) continue;

      decoratedDrives.push({
        ...drive,
        id: drive._id,
        hasApplied: Boolean(app),
        application: app || null,
        eligibility,
      });
    }

    res.json({
      success: true,
      count: decoratedDrives.length,
      opportunities: decoratedDrives,
    });
  } catch (error) {
    console.error('getStudentOpportunities error:', error);
    res.status(500).json({ error: { message: error.message || 'Failed to fetch opportunities.' } });
  }
};

/**
 * @desc    Get detailed explanatory eligibility breakdown for a specific drive
 * @route   GET /api/student/opportunities/:id/eligibility
 * @access  Private (Student)
 */
exports.getOpportunityEligibility = async (req, res) => {
  try {
    const { id } = req.params;
    const studentUserId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    const [opportunity, profile, college] = await Promise.all([
      Opportunity.findById(id).lean(),
      StudentProfile.findOne({
        ...(collegeId ? { collegeId } : {}),
        user: studentUserId,
      }).lean(),
      collegeId ? College.findById(collegeId).lean() : null,
    ]);

    if (!opportunity) {
      return res.status(404).json({ error: { message: 'Opportunity not found.' } });
    }

    const eligibility = evaluateEligibility(opportunity, profile, college);

    res.json({
      success: true,
      opportunityTitle: opportunity.title,
      companyName: opportunity.companyName,
      eligibility,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to evaluate eligibility.' } });
  }
};

/**
 * @desc    Apply to an opportunity with explanatory pre-check
 * @route   POST /api/student/opportunities/:id/apply
 * @access  Private (Student)
 */
exports.applyOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const studentUserId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    const [opportunity, profile, college, existingApp] = await Promise.all([
      Opportunity.findById(id),
      StudentProfile.findOne({
        ...(collegeId ? { collegeId } : {}),
        user: studentUserId,
      }),
      collegeId ? College.findById(collegeId).lean() : null,
      Application.findOne({
        ...(collegeId ? { collegeId } : {}),
        opportunityId: id,
        studentId: studentUserId,
      }),
    ]);

    if (!opportunity) {
      return res.status(404).json({ error: { message: 'Opportunity not found.' } });
    }

    if (existingApp) {
      return res.status(400).json({ error: { message: 'You have already applied to this drive.' } });
    }

    // Check drive status and deadline
    if (opportunity.status !== 'Open') {
      return res.status(400).json({ error: { message: `Drive is currently ${opportunity.status} and not accepting applications.` } });
    }

    if (opportunity.deadline && new Date() > new Date(opportunity.deadline)) {
      return res.status(400).json({ error: { message: 'The application deadline has passed.' } });
    }

    // Explanatory Eligibility Check
    const eligibility = evaluateEligibility(opportunity.toObject(), profile?.toObject(), college);
    if (!eligibility.isEligible) {
      return res.status(400).json({
        error: {
          code: 'INELIGIBLE_FOR_DRIVE',
          message: 'You do not meet the corporate or institutional eligibility requirements.',
          eligibility,
        },
      });
    }

    const application = await Application.create({
      collegeId: opportunity.collegeId,
      studentId: studentUserId,
      opportunityId: opportunity._id,
      status: 'Applied',
      currentRound: 'Application Review',
      roundHistory: [
        {
          roundName: 'Applied',
          status: 'Submitted',
          movedAt: new Date(),
          notes: 'Candidate submitted formal application.',
        },
      ],
      appliedAt: new Date(),
    });

    await AuditLog.create({
      collegeId,
      performedBy: studentUserId,
      action: 'DRIVE_APPLICATION_SUBMITTED',
      targetModel: 'Application',
      targetId: application._id,
      details: {
        opportunityId: opportunity._id,
        companyName: opportunity.companyName,
        title: opportunity.title,
      },
    });

    res.status(201).json({
      success: true,
      message: `🎉 Successfully applied to ${opportunity.companyName} for ${opportunity.title}!`,
      application,
    });
  } catch (error) {
    console.error('applyOpportunity error:', error);
    res.status(500).json({ error: { message: error.message || 'Failed to submit application.' } });
  }
};

/**
 * @desc    Withdraw application before deadline
 * @route   DELETE /api/student/opportunities/:id/withdraw
 * @access  Private (Student)
 */
exports.withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const studentUserId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    const [opportunity, application] = await Promise.all([
      Opportunity.findById(id),
      Application.findOne({
        ...(collegeId ? { collegeId } : {}),
        opportunityId: id,
        studentId: studentUserId,
      }),
    ]);

    if (!application) {
      return res.status(404).json({ error: { message: 'Application not found.' } });
    }

    if (opportunity?.deadline && new Date() > new Date(opportunity.deadline)) {
      return res.status(400).json({ error: { message: 'Cannot withdraw after the drive deadline has closed.' } });
    }

    if (['Shortlisted', 'Technical Round', 'HR Round', 'Offer Extended', 'Placed'].includes(application.status)) {
      return res.status(400).json({ error: { message: `Cannot withdraw once advanced to ${application.status}.` } });
    }

    await Application.findByIdAndDelete(application._id);

    await AuditLog.create({
      collegeId,
      performedBy: studentUserId,
      action: 'DRIVE_APPLICATION_WITHDRAWN',
      targetModel: 'Application',
      targetId: application._id,
      details: {
        opportunityId: id,
        companyName: opportunity?.companyName,
      },
    });

    res.json({
      success: true,
      message: 'Application withdrawn successfully.',
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to withdraw application.' } });
  }
};

/**
 * @desc    Get student's applications with timeline, interview details, and feedback
 * @route   GET /api/student/applications
 * @access  Private (Student)
 */
exports.getMyApplications = async (req, res) => {
  try {
    const studentUserId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    const applications = await Application.find({
      ...(collegeId ? { collegeId } : {}),
      studentId: studentUserId,
    })
      .populate('opportunityId', 'title companyName companyLogo location salary ctc deadline rounds status bondDetails')
      .sort({ updatedAt: -1 })
      .lean();

    // Filter feedback to only include items marked visibleToStudent: true
    const sanitized = applications.map((app) => ({
      ...app,
      id: app._id,
      feedback: (app.feedback || []).filter((f) => f.visibleToStudent),
    }));

    res.json({
      success: true,
      count: sanitized.length,
      applications: sanitized,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch applications.' } });
  }
};

/**
 * @desc    Accept or Decline formal offer
 * @route   PATCH /api/student/applications/:id/offer-decision
 * @access  Private (Student)
 */
exports.decideOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, remarks = '' } = req.body; // 'Accepted' | 'Declined'
    const studentUserId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    if (!['Accepted', 'Declined'].includes(decision)) {
      return res.status(400).json({ error: { message: "Decision must be 'Accepted' or 'Declined'." } });
    }

    const application = await Application.findOne({
      _id: id,
      studentId: studentUserId,
      ...(collegeId ? { collegeId } : {}),
    }).populate('opportunityId');

    if (!application) {
      return res.status(404).json({ error: { message: 'Application not found.' } });
    }

    if (application.offer?.status !== 'Pending') {
      return res.status(400).json({ error: { message: `Offer is already marked as ${application.offer?.status || 'None'}.` } });
    }

    application.offer.status = decision;
    application.offer.decisionDate = new Date();
    application.offer.remarks = remarks;

    if (decision === 'Accepted') {
      application.status = 'Placed';
      // Update student profile as placed
      await StudentProfile.findOneAndUpdate(
        { user: studentUserId },
        {
          isPlaced: true,
          placedDetails: {
            companyName: application.opportunityId?.companyName || 'Corporate Partner',
            role: application.offer.role || application.opportunityId?.title,
            ctc: application.offer.ctc,
            offerLetterUrl: application.offer.offerLetterUrl,
            placedAt: new Date(),
          },
        }
      );
    } else {
      application.status = 'Rejected';
    }

    application.roundHistory.push({
      roundName: 'Offer Decision',
      status: decision === 'Accepted' ? 'Offer Accepted' : 'Offer Declined',
      movedAt: new Date(),
      notes: remarks || `Candidate formally ${decision.toLowerCase()} the offer.`,
    });

    await application.save();

    await AuditLog.create({
      collegeId,
      performedBy: studentUserId,
      action: decision === 'Accepted' ? 'OFFER_ACCEPTED_BY_STUDENT' : 'OFFER_DECLINED_BY_STUDENT',
      targetModel: 'Application',
      targetId: application._id,
      details: {
        decision,
        companyName: application.opportunityId?.companyName,
        ctc: application.offer.ctc,
      },
    });

    res.json({
      success: true,
      message: decision === 'Accepted' ? '🎉 Congratulations on accepting the placement offer!' : 'Offer decision recorded.',
      offer: application.offer,
      applicationStatus: application.status,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to record offer decision.' } });
  }
};

/**
 * @desc    Get student interviews calendar schedule with clash warnings
 * @route   GET /api/student/interviews
 * @access  Private (Student)
 */
exports.getStudentInterviews = async (req, res) => {
  try {
    const studentUserId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    const slots = await InterviewSlot.find({
      ...(collegeId ? { collegeId } : {}),
      studentId: studentUserId,
      status: { $ne: 'Cancelled' },
    })
      .populate('opportunityId', 'title companyName companyLogo location')
      .sort({ startDateTime: 1 })
      .lean();

    // Detect internal clashes between scheduled slots
    const slotsWithClash = slots.map((s, idx) => {
      const sStart = new Date(s.startDateTime).getTime();
      const sEnd = new Date(s.endDateTime).getTime();

      const clash = slots.some((other, oIdx) => {
        if (idx === oIdx) return false;
        const oStart = new Date(other.startDateTime).getTime();
        const oEnd = new Date(other.endDateTime).getTime();
        return sStart < oEnd && sEnd > oStart;
      });

      return {
        ...s,
        id: s._id,
        hasClash: clash,
      };
    });

    res.json({
      success: true,
      count: slotsWithClash.length,
      hasAnyClash: slotsWithClash.some((s) => s.hasClash),
      slots: slotsWithClash,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch interview schedule.' } });
  }
};

/**
 * @desc    Export student interviews as iCalendar (.ics) file
 * @route   GET /api/student/interviews/export-ics
 * @access  Private (Student)
 */
exports.exportStudentIcs = async (req, res) => {
  try {
    const studentUserId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    const slots = await InterviewSlot.find({
      ...(collegeId ? { collegeId } : {}),
      studentId: studentUserId,
      status: { $ne: 'Cancelled' },
    })
      .populate('opportunityId', 'title companyName')
      .lean();

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PLACEearly Campus Placement OS//Student Interview Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    for (const slot of slots) {
      const company = slot.opportunityId?.companyName || 'Campus Recruiter';
      const role = slot.opportunityId?.title || 'Placement Interview';
      const summary = `${company} - ${slot.roundName || 'Interview'} (${role})`;
      const desc = `Interview with ${company} for ${role}. Panel: ${slot.panelName || 'General'}. Mode: ${slot.mode || 'Online'}. ${slot.roomOrLink ? `Join: ${slot.roomOrLink}` : ''}`;

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:pe-interview-${slot._id}@placeearly.edu`,
        `DTSTAMP:${formatIcsDate(new Date())}`,
        `DTSTART:${formatIcsDate(slot.startDateTime)}`,
        `DTEND:${formatIcsDate(slot.endDateTime)}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${desc.replace(/\n/g, '\\n')}`,
        `LOCATION:${slot.roomOrLink || slot.mode || 'Campus'}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    }

    icsContent.push('END:VCALENDAR');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="my-interviews.ics"');
    res.send(icsContent.join('\r\n'));
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to export calendar.' } });
  }
};

/**
 * @desc    Get student documents & secure download URLs
 * @route   GET /api/student/documents
 * @access  Private (Student)
 */
exports.getStudentDocuments = async (req, res) => {
  try {
    const studentUserId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    const [documents, profile] = await Promise.all([
      Document.find({
        ...(collegeId ? { collegeId } : {}),
        ownerId: studentUserId,
      }).sort({ createdAt: -1 }).lean(),
      StudentProfile.findOne({
        ...(collegeId ? { collegeId } : {}),
        user: studentUserId,
      }).lean(),
    ]);

    const storage = getStorageService();
    const docsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        try {
          const signed = await storage.getSignedDownloadUrl({
            key: doc.storageKey,
            expiresInSeconds: 300,
            filename: doc.originalName,
          });
          return {
            ...doc,
            id: doc._id,
            signedUrl: signed.url,
          };
        } catch {
          return { ...doc, id: doc._id, signedUrl: '' };
        }
      })
    );

    res.json({
      success: true,
      documents: docsWithUrls,
      resumeVersions: profile?.resumeVersions || [],
      nocRequests: profile?.nocRequests || [],
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch documents.' } });
  }
};

/**
 * @desc    Submit Bonafide / NOC request for internship
 * @route   POST /api/student/documents/noc-request
 * @access  Private (Student)
 */
exports.requestNoc = async (req, res) => {
  try {
    const { companyName, role, purpose = 'Internship NOC', startDate, endDate } = req.body;
    const studentUserId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    if (!companyName || !role) {
      return res.status(400).json({ error: { message: 'Company Name and Internship Role are required.' } });
    }

    const profile = await StudentProfile.findOne({
      ...(collegeId ? { collegeId } : {}),
      user: studentUserId,
    });

    if (!profile) {
      return res.status(404).json({ error: { message: 'Student profile not found.' } });
    }

    const newNoc = {
      companyName: companyName.trim(),
      role: role.trim(),
      purpose,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      status: 'Pending',
      tpoRemarks: '',
      requestedAt: new Date(),
    };

    profile.nocRequests.push(newNoc);
    await profile.save();

    res.status(201).json({
      success: true,
      message: 'NOC request submitted to Placement Cell for review.',
      nocRequest: profile.nocRequests[profile.nocRequests.length - 1],
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to submit NOC request.' } });
  }
};

/**
 * @desc    Download full student data JSON package (GDPR & Data Privacy compliance)
 * @route   GET /api/student/privacy/export-data
 * @access  Private (Student)
 */
exports.exportMyData = async (req, res) => {
  try {
    const studentUserId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    const [user, profile, applications, interviewSlots, documents, college] = await Promise.all([
      User.findById(studentUserId).select('-password').lean(),
      StudentProfile.findOne({ user: studentUserId }).lean(),
      Application.find({ studentId: studentUserId }).populate('opportunityId', 'title companyName').lean(),
      InterviewSlot.find({ studentId: studentUserId }).populate('opportunityId', 'title companyName').lean(),
      Document.find({ ownerId: studentUserId }).select('-storageKey').lean(),
      collegeId ? College.findById(collegeId).select('name code domains').lean() : null,
    ]);

    const dataPackage = {
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        institution: college?.name || 'Affiliated Institution',
        platform: 'PLACEearly Campus Placement Operating System',
        compliance: 'GDPR / DPDP Data Subject Access Request',
      },
      user,
      profile,
      applications,
      interviews: interviewSlots,
      documents,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="placeearly-data-${profile?.rollNo || studentUserId}.json"`);
    res.send(JSON.stringify(dataPackage, null, 2));
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to export personal data.' } });
  }
};

/**
 * @desc    Submit Account Deletion Request
 * @route   POST /api/student/privacy/deletion-request
 * @access  Private (Student)
 */
exports.requestDeletion = async (req, res) => {
  try {
    const { reason = '' } = req.body;
    const studentUserId = req.user.userId || req.user.id;

    const profile = await StudentProfile.findOne({ user: studentUserId });
    if (!profile) {
      return res.status(404).json({ error: { message: 'Profile not found.' } });
    }

    profile.deletionRequest = {
      requestedAt: new Date(),
      reason: reason.trim(),
      status: 'Pending',
    };

    await profile.save();

    res.json({
      success: true,
      message: 'Account deletion request submitted to Institution Data Controller for review.',
      deletionRequest: profile.deletionRequest,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to submit deletion request.' } });
  }
};

/**
 * @desc    Record recruiter data sharing consent
 * @route   POST /api/student/privacy/consent
 * @access  Private (Student)
 */
exports.recordConsent = async (req, res) => {
  try {
    const { consentType = 'recruiter_data_sharing', version = '1.0' } = req.body;
    const studentUserId = req.user.userId || req.user.id;

    const profile = await StudentProfile.findOne({ user: studentUserId });
    if (!profile) {
      return res.status(404).json({ error: { message: 'Profile not found.' } });
    }

    profile.consentLog.push({
      consentedAt: new Date(),
      consentType,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
      version,
    });

    await profile.save();

    res.json({
      success: true,
      message: 'Consent recorded successfully.',
      consentLog: profile.consentLog,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to record consent.' } });
  }
};

/**
 * @desc    Get Student Profile
 * @route   GET /api/student/profile
 * @access  Private (Student)
 */
exports.getProfile = async (req, res) => {
  try {
    const studentUserId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    const [profile, user, college] = await Promise.all([
      StudentProfile.findOne({
        ...(collegeId ? { collegeId } : {}),
        user: studentUserId,
      }).lean(),
      User.findById(studentUserId).select('-password').lean(),
      collegeId ? College.findById(collegeId).lean() : null,
    ]);

    const completeness = calculateProfileCompleteness(profile);
    const readinessScore = calculateReadinessScore(profile, user);

    res.json({
      success: true,
      profile: profile || null,
      user,
      college: college ? { id: college._id, name: college.name, code: college.code } : null,
      completeness,
      readinessScore,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch student profile.' } });
  }
};

/**
 * @desc    Comprehensive Profile Update (Personal, Academics, Semesters, Skills, Projects, Certifications, Links)
 * @route   PUT /api/student/profile
 * @access  Private (Student)
 */
exports.updateProfile = async (req, res) => {
  try {
    const studentUserId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;
    const data = req.body;

    let profile = await StudentProfile.findOne({
      ...(collegeId ? { collegeId } : {}),
      user: studentUserId,
    });

    if (!profile) {
      profile = new StudentProfile({
        collegeId,
        user: studentUserId,
        rollNo: data.rollNo || 'NEW-STUDENT',
      });
    }

    // Update top-level academic fields
    if (data.cgpa !== undefined) profile.cgpa = data.cgpa;
    if (data.backlogs !== undefined) profile.backlogs = data.backlogs;
    if (data.branch) profile.branch = data.branch;
    if (data.graduationYear) profile.graduationYear = data.graduationYear;
    if (data.educationGapYears !== undefined) profile.educationGapYears = data.educationGapYears;
    if (data.resumeUrl !== undefined) profile.resumeUrl = data.resumeUrl;

    // Personal info
    if (data.personalInfo) {
      profile.personalInfo = {
        ...profile.personalInfo,
        ...data.personalInfo,
      };
    }

    // Academics (10th & 12th)
    if (data.academics) {
      if (data.academics.tenth) profile.academics.tenth = data.academics.tenth;
      if (data.academics.twelfth) profile.academics.twelfth = data.academics.twelfth;
    }

    // Semester SGPAs
    if (Array.isArray(data.semesters)) {
      profile.semesters = data.semesters;
    }

    // Skills, Projects, Certifications, Social links
    if (Array.isArray(data.skills)) profile.skills = data.skills;
    if (Array.isArray(data.projects)) profile.projects = data.projects;
    if (Array.isArray(data.certifications)) profile.certifications = data.certifications;
    if (data.socialLinks) profile.socialLinks = data.socialLinks;
    if (Array.isArray(data.resumeVersions)) profile.resumeVersions = data.resumeVersions;
    if (data.publicPortfolioSettings) profile.publicPortfolioSettings = data.publicPortfolioSettings;

    await profile.save();

    // Invalidate cached eligibility when profile changes!
    await EligibilityCache.invalidateForStudent(studentUserId);

    res.json({
      success: true,
      message: 'Student profile updated successfully!',
      profile,
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ error: { message: error.message || 'Failed to update profile.' } });
  }
};
