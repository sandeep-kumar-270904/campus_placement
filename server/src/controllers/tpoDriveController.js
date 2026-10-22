const mongoose = require('mongoose');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const AuditLog = require('../models/AuditLog');

/**
 * @desc    Fetch paginated campus drives roster with applicant counts
 * @route   GET /api/tpo/drives
 * @access  Private (TPO / SuperAdmin)
 */
exports.getDrives = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    if (!collegeId && req.user?.role !== 'superadmin') {
      return res.status(400).json({ error: { message: 'College tenant context is required.' } });
    }

    const {
      page = 1,
      limit = 20,
      status = 'all',
      type = 'all',
      q = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = collegeId ? { collegeId } : {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (type && type !== 'all') {
      filter.$or = [{ type }, { jobType: type }];
    }

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [{ title: regex }, { companyName: regex }, { location: regex }],
      });
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [total, drives] = await Promise.all([
      Opportunity.countDocuments(filter),
      Opportunity.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    // Attach applicant metrics to each drive
    const driveIds = drives.map((d) => d._id);
    const appAggregations = await Application.aggregate([
      { $match: { opportunityId: { $in: driveIds } } },
      {
        $group: {
          _id: '$opportunityId',
          totalApplicants: { $sum: 1 },
          shortlisted: {
            $sum: {
              $cond: [{ $in: ['$status', ['Shortlisted', 'Technical Round', 'HR Round']] }, 1, 0],
            },
          },
          offers: {
            $sum: {
              $cond: [{ $in: ['$status', ['Offer Extended', 'Placed', 'Hired']] }, 1, 0],
            },
          },
        },
      },
    ]);

    const statsByDrive = {};
    appAggregations.forEach((item) => {
      statsByDrive[item._id.toString()] = item;
    });

    const enrichedDrives = drives.map((d) => {
      const stats = statsByDrive[d._id.toString()] || {
        totalApplicants: 0,
        shortlisted: 0,
        offers: 0,
      };
      return {
        ...d,
        id: d._id,
        applicantsCount: stats.totalApplicants,
        shortlistedCount: stats.shortlisted,
        offersCount: stats.offers,
      };
    });

    return res.json({
      drives: enrichedDrives,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    console.error('getDrives error:', err);
    return res.status(500).json({ error: { message: err.message || 'Error fetching placement drives' } });
  }
};

/**
 * @desc    Live preview of eligible candidates before publishing
 * @route   POST /api/tpo/drives/preview-eligibility
 * @access  Private (TPO / SuperAdmin)
 */
exports.previewEligibility = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const {
      minCgpa = 0,
      maxBacklogs = 0,
      allowedBranches = [],
      allowedGraduationYears = [],
      minTenthPercentage = 0,
      minTwelfthPercentage = 0,
      genderNeutral = true,
    } = req.body;

    const baseFilter = {
      ...(collegeId ? { collegeId } : {}),
      isVerifiedByTPO: true, // Only verified students qualify for official campus drives
    };

    const criteriaFilter = { ...baseFilter };

    if (minCgpa > 0) {
      criteriaFilter.cgpa = { $gte: parseFloat(minCgpa) };
    }

    if (maxBacklogs !== undefined && maxBacklogs !== null && maxBacklogs !== '') {
      criteriaFilter.backlogs = { $lte: parseInt(maxBacklogs, 10) };
    }

    if (Array.isArray(allowedBranches) && allowedBranches.length > 0) {
      criteriaFilter.branch = { $in: allowedBranches };
    }

    if (Array.isArray(allowedGraduationYears) && allowedGraduationYears.length > 0) {
      criteriaFilter.graduationYear = { $in: allowedGraduationYears };
    }

    const [totalRegistered, totalVerified, eligibleCount, sampleEligible] = await Promise.all([
      StudentProfile.countDocuments(collegeId ? { collegeId } : {}),
      StudentProfile.countDocuments(baseFilter),
      StudentProfile.countDocuments(criteriaFilter),
      StudentProfile.find(criteriaFilter)
        .populate('user', 'firstName lastName email')
        .select('rollNo branch cgpa backlogs graduationYear user')
        .limit(10)
        .lean(),
    ]);

    const eligiblePercentage = totalVerified > 0 ? Math.round((eligibleCount / totalVerified) * 100) : 0;

    return res.json({
      totalRegistered,
      totalVerified,
      eligibleCount,
      eligiblePercentage,
      sampleStudents: sampleEligible.map((s) => ({
        id: s._id,
        rollNo: s.rollNo,
        name: s.user ? `${s.user.firstName || ''} ${s.user.lastName || ''}`.trim() : 'Candidate',
        email: s.user?.email || '',
        branch: s.branch,
        cgpa: s.cgpa,
        backlogs: s.backlogs,
      })),
    });
  } catch (err) {
    console.error('previewEligibility error:', err);
    return res.status(500).json({ error: { message: err.message } });
  }
};

/**
 * @desc    Create new drive via Wizard with automatic Company CRM discovery
 * @route   POST /api/tpo/drives
 * @access  Private (TPO / SuperAdmin)
 */
exports.createDrive = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const tpoId = req.user.userId || req.user.id;

    const {
      title,
      companyName,
      companyLogo,
      type = 'Job',
      jobType = 'Full-time',
      location,
      salary,
      ctc,
      description,
      driveDate,
      deadline,
      scheduledPublishAt,
      rounds = [],
      eligibilityRules = {},
      requiredDocuments = ['resume'],
      bondDetails = '',
      status = 'Draft',
    } = req.body;

    if (!title || !companyName || !deadline) {
      return res.status(400).json({ error: { message: 'Title, company name, and deadline are required.' } });
    }

    // Auto-discover or link Company in CRM
    let company = await Company.findOne({
      ...(collegeId ? { collegeId } : {}),
      name: { $regex: new RegExp(`^${companyName.trim()}$`, 'i') },
    });

    if (!company) {
      company = await Company.create({
        collegeId,
        name: companyName.trim(),
        logo: companyLogo || '',
        status: status === 'Open' ? 'confirmed' : 'invited',
      });
    }

    const drive = await Opportunity.create({
      collegeId,
      companyId: company._id,
      title: title.trim(),
      companyName: companyName.trim(),
      companyLogo: companyLogo || company.logo || '',
      type,
      jobType,
      location: location || 'Campus / Remote',
      salary: salary || (ctc?.fixed ? `${ctc.fixed} LPA` : 'Competitive'),
      ctc: {
        fixed: ctc?.fixed || 0,
        variable: ctc?.variable || 0,
        currency: ctc?.currency || 'INR',
        lpaString: salary || `${ctc?.fixed || 0} LPA`,
      },
      description: description || `Campus placement drive for ${companyName}.`,
      driveDate: driveDate ? new Date(driveDate) : null,
      deadline: new Date(deadline),
      scheduledPublishAt: scheduledPublishAt ? new Date(scheduledPublishAt) : null,
      rounds: rounds.map((r, idx) => ({
        roundNumber: r.roundNumber || idx + 1,
        name: r.name || `Round ${idx + 1}`,
        type: r.type || 'Technical',
        mode: r.mode || 'Online',
        expectedDate: r.expectedDate ? new Date(r.expectedDate) : null,
        venueOrLink: r.venueOrLink || '',
      })),
      eligibilityRules: {
        minCgpa: eligibilityRules.minCgpa || 0,
        maxBacklogs: eligibilityRules.maxBacklogs || 0,
        allowedBranches: eligibilityRules.allowedBranches || [],
        allowedGraduationYears: eligibilityRules.allowedGraduationYears || [2026],
        minTenthPercentage: eligibilityRules.minTenthPercentage || 0,
        minTwelfthPercentage: eligibilityRules.minTwelfthPercentage || 0,
        genderNeutral: eligibilityRules.genderNeutral !== false,
      },
      requiredDocuments,
      bondDetails,
      status,
      createdBy: tpoId,
    });

    await AuditLog.create({
      collegeId,
      actorId: tpoId,
      action: 'DRIVE_CREATED',
      resource: 'Opportunity',
      metadata: { driveId: drive._id, title: drive.title, company: drive.companyName, status },
    });

    if (drive.status === 'Open') {
      try {
        const { eventBus, DOMAIN_EVENTS } = require('../services/notifications/events/EventBus');
        const eligibleQuery = {
          ...(collegeId ? { collegeId } : {}),
        };
        if (drive.eligibilityRules?.allowedBranches?.length > 0) {
          eligibleQuery.branch = { $in: drive.eligibilityRules.allowedBranches };
        }
        if (drive.eligibilityRules?.minCgpa) {
          eligibleQuery.cgpa = { $gte: drive.eligibilityRules.minCgpa };
        }
        if (drive.eligibilityRules?.maxBacklogs !== undefined) {
          eligibleQuery.backlogs = { $lte: drive.eligibilityRules.maxBacklogs };
        }
        const eligibleProfiles = await StudentProfile.find(eligibleQuery).select('user').lean();
        const eligibleUserIds = eligibleProfiles.map((p) => p.user).filter(Boolean);

        await eventBus.emitAsync(DOMAIN_EVENTS.DRIVE_PUBLISHED, {
          drive,
          eligibleStudentUserIds: eligibleUserIds,
          collegeId,
        });
      } catch (eventErr) {
        console.error('Failed to emit DRIVE_PUBLISHED event:', eventErr);
      }
    }

    return res.status(201).json({
      success: true,
      message: `Drive '${drive.title}' created successfully in ${status} mode.`,
      drive,
    });
  } catch (err) {
    console.error('createDrive error:', err);
    return res.status(500).json({ error: { message: err.message } });
  }
};

/**
 * @desc    Update existing drive details
 * @route   PUT /api/tpo/drives/:id
 * @access  Private (TPO / SuperAdmin)
 */
exports.updateDrive = async (req, res) => {
  try {
    const { id } = req.params;
    const tpoId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;

    const drive = await Opportunity.findById(id);
    if (!drive) {
      return res.status(404).json({ error: { message: 'Placement drive not found.' } });
    }

    const updatable = [
      'title', 'companyName', 'companyLogo', 'type', 'jobType', 'location',
      'salary', 'ctc', 'description', 'driveDate', 'deadline', 'scheduledPublishAt',
      'rounds', 'eligibilityRules', 'requiredDocuments', 'bondDetails', 'status',
    ];

    for (const key of updatable) {
      if (req.body[key] !== undefined) {
        drive[key] = req.body[key];
      }
    }

    await drive.save();

    await AuditLog.create({
      collegeId,
      actorId: tpoId,
      action: 'DRIVE_UPDATED',
      resource: 'Opportunity',
      metadata: { driveId: drive._id, title: drive.title },
    });

    return res.json({
      success: true,
      message: 'Drive updated successfully.',
      drive,
    });
  } catch (err) {
    console.error('updateDrive error:', err);
    return res.status(500).json({ error: { message: err.message } });
  }
};

/**
 * @desc    Transition drive status (Draft -> Open -> In Progress -> Closed -> Archived)
 * @route   PATCH /api/tpo/drives/:id/status
 * @access  Private (TPO / SuperAdmin)
 */
exports.updateDriveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['Draft', 'Open', 'Closed', 'In Progress', 'Completed', 'Archived'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: { message: `Invalid status. Valid values: ${validStatuses.join(', ')}` } });
    }

    const tpoId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;

    const drive = await Opportunity.findById(id);
    if (!drive) {
      return res.status(404).json({ error: { message: 'Drive not found.' } });
    }

    const prevStatus = drive.status;
    drive.status = status;
    await drive.save();

    await AuditLog.create({
      collegeId,
      actorId: tpoId,
      action: status === 'Open' ? 'DRIVE_PUBLISHED' : 'DRIVE_STATUS_CHANGED',
      resource: 'Opportunity',
      metadata: { driveId: drive._id, prevStatus, newStatus: status },
    });

    if (status === 'Open' && prevStatus !== 'Open') {
      try {
        const { eventBus, DOMAIN_EVENTS } = require('../services/notifications/events/EventBus');
        const eligibleQuery = {
          ...(collegeId ? { collegeId } : {}),
        };
        if (drive.eligibilityRules?.allowedBranches?.length > 0) {
          eligibleQuery.branch = { $in: drive.eligibilityRules.allowedBranches };
        }
        if (drive.eligibilityRules?.minCgpa) {
          eligibleQuery.cgpa = { $gte: drive.eligibilityRules.minCgpa };
        }
        if (drive.eligibilityRules?.maxBacklogs !== undefined) {
          eligibleQuery.backlogs = { $lte: drive.eligibilityRules.maxBacklogs };
        }
        const eligibleProfiles = await StudentProfile.find(eligibleQuery).select('user').lean();
        const eligibleUserIds = eligibleProfiles.map((p) => p.user).filter(Boolean);

        await eventBus.emitAsync(DOMAIN_EVENTS.DRIVE_PUBLISHED, {
          drive,
          eligibleStudentUserIds: eligibleUserIds,
          collegeId,
        });
      } catch (eventErr) {
        console.error('Failed to emit DRIVE_PUBLISHED event:', eventErr);
      }
    }

    return res.json({
      success: true,
      message: `Drive status moved from ${prevStatus} to ${status}.`,
      drive,
    });
  } catch (err) {
    console.error('updateDriveStatus error:', err);
    return res.status(500).json({ error: { message: err.message } });
  }
};

/**
 * @desc    Duplicate an existing drive as a new Draft template
 * @route   POST /api/tpo/drives/:id/duplicate
 * @access  Private (TPO / SuperAdmin)
 */
exports.duplicateDrive = async (req, res) => {
  try {
    const { id } = req.params;
    const tpoId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;

    const source = await Opportunity.findById(id).lean();
    if (!source) {
      return res.status(404).json({ error: { message: 'Source drive not found.' } });
    }

    delete source._id;
    delete source.createdAt;
    delete source.updatedAt;

    const clone = await Opportunity.create({
      ...source,
      title: `${source.title} (Clone)`,
      status: 'Draft',
      createdBy: tpoId,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default 14 days out
    });

    await AuditLog.create({
      collegeId,
      actorId: tpoId,
      action: 'DRIVE_DUPLICATED',
      resource: 'Opportunity',
      metadata: { sourceId: id, newDriveId: clone._id },
    });

    return res.status(201).json({
      success: true,
      message: `Duplicated drive '${source.title}' as new Draft.`,
      drive: clone,
    });
  } catch (err) {
    console.error('duplicateDrive error:', err);
    return res.status(500).json({ error: { message: err.message } });
  }
};

/**
 * @desc    Approve or reject recruiter's proposed JD updates
 * @route   PATCH /api/tpo/drives/:id/review-proposed-jd
 * @access  Private (TPO / Admin)
 */
exports.reviewProposedJd = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, tpoRemarks = '' } = req.body; // 'Approved' | 'Rejected'
    const collegeId = req.tenant?.collegeId || req.user.collegeId;
    const tpoId = req.user.userId || req.user.id;

    if (!['Approved', 'Rejected'].includes(decision)) {
      return res.status(400).json({ error: { message: "Decision must be 'Approved' or 'Rejected'." } });
    }

    const drive = await Opportunity.findOne({
      _id: id,
      ...(collegeId ? { collegeId } : {}),
    });

    if (!drive) {
      return res.status(404).json({ error: { message: 'Drive not found.' } });
    }

    if (!drive.proposedJd || drive.proposedJd.status !== 'Pending_Approval') {
      return res.status(400).json({ error: { message: 'No pending JD proposal for this drive.' } });
    }

    drive.proposedJd.status = decision;
    drive.proposedJd.tpoRemarks = tpoRemarks.trim();
    drive.proposedJd.reviewedAt = new Date();

    if (decision === 'Approved') {
      if (drive.proposedJd.title) drive.title = drive.proposedJd.title;
      if (drive.proposedJd.description) drive.description = drive.proposedJd.description;
      if (drive.proposedJd.salary) drive.salary = drive.proposedJd.salary;
      if (drive.proposedJd.ctc) drive.ctc = drive.proposedJd.ctc;
      if (drive.proposedJd.rounds && drive.proposedJd.rounds.length > 0) drive.rounds = drive.proposedJd.rounds;
      if (drive.proposedJd.eligibilityRules) {
        drive.eligibilityRules = {
          ...drive.eligibilityRules,
          ...drive.proposedJd.eligibilityRules,
        };
      }
    }

    await drive.save();

    await AuditLog.create({
      collegeId: drive.collegeId,
      performedBy: tpoId,
      action: decision === 'Approved' ? 'RECRUITER_JD_APPROVED' : 'RECRUITER_JD_REJECTED',
      targetModel: 'Opportunity',
      targetId: drive._id,
      details: {
        decision,
        tpoRemarks,
      },
    });

    res.json({
      success: true,
      message: `Recruiter JD proposal has been ${decision.toLowerCase()}.`,
      drive,
    });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
};
