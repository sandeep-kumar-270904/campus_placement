const mongoose = require('mongoose');
const Announcement = require('../models/Announcement');
const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

/**
 * Helper to build matching query for student profiles based on segmentation rules
 */
async function resolveRecipients(collegeId, segments = {}) {
  const { targetAll, branches = [], graduationYears = [], driveId, driveRound, placedStatus = 'all' } = segments;

  const profileQuery = {
    ...(collegeId ? { collegeId } : {}),
  };

  if (!targetAll) {
    if (branches.length > 0) {
      profileQuery.branch = { $in: branches };
    }
    if (graduationYears.length > 0) {
      profileQuery.gradYear = { $in: graduationYears.map(Number) };
    }
    if (placedStatus === 'unplaced_only') {
      profileQuery.isPlaced = false;
    } else if (placedStatus === 'placed_only') {
      profileQuery.isPlaced = true;
    }
  }

  // If filtered by drive applicants
  if (driveId) {
    const appQuery = {
      ...(collegeId ? { collegeId } : {}),
      opportunityId: driveId,
    };
    if (driveRound) {
      appQuery.currentRound = driveRound;
    }
    const apps = await Application.find(appQuery).select('studentId').lean();
    const studentUserIds = apps.map((a) => a.studentId).filter(Boolean);
    profileQuery.user = { $in: studentUserIds };
  }

  const profiles = await StudentProfile.find(profileQuery)
    .populate('user', 'firstName lastName email')
    .lean();

  const recipients = profiles.map((p) => ({
    profileId: p._id,
    userId: p.user?._id,
    name: p.user ? `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim() : 'Student',
    email: p.user?.email || '',
    rollNo: p.rollNo || '',
    branch: p.branch || '',
    gradYear: p.gradYear,
    isPlaced: p.isPlaced,
  }));

  return recipients;
}

/**
 * @desc    Get paginated announcements and broadcast history
 * @route   GET /api/tpo/announcements
 * @access  Private (TPO / SuperAdmin)
 */
exports.getAnnouncements = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { page = 1, limit = 15, category, status } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {
      ...(collegeId ? { collegeId } : {}),
    };
    if (category) query.category = category;
    if (status) query.status = status;

    const [announcements, total] = await Promise.all([
      Announcement.find(query)
        .populate('sentBy', 'firstName lastName email')
        .populate('segments.driveId', 'title companyName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Announcement.countDocuments(query),
    ]);

    res.json({
      success: true,
      announcements,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch announcements.' } });
  }
};

/**
 * @desc    Preview matching recipients count and sample for given segmentation filters
 * @route   POST /api/tpo/announcements/preview-recipients
 * @access  Private (TPO / SuperAdmin)
 */
exports.previewAnnouncementRecipients = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const segments = req.body || {};

    const recipients = await resolveRecipients(collegeId, segments);

    res.json({
      success: true,
      matchingCount: recipients.length,
      sampleRecipients: recipients.slice(0, 10),
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to preview recipients.' } });
  }
};

/**
 * @desc    Broadcast or schedule announcement to targeted segment
 * @route   POST /api/tpo/announcements/send
 * @access  Private (TPO / SuperAdmin)
 */
exports.sendAnnouncement = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const {
      title,
      body,
      category = 'General',
      segments = {},
      channels = { inApp: true, email: true, smsOrWhatsapp: false },
      scheduledAt,
    } = req.body;

    if (!title || !title.trim() || !body || !body.trim()) {
      return res.status(400).json({ error: { message: 'Title and message body are required.' } });
    }

    const recipients = await resolveRecipients(collegeId, segments);
    const isScheduled = scheduledAt && new Date(scheduledAt) > new Date();

    const announcement = await Announcement.create({
      collegeId,
      title: title.trim(),
      body: body.trim(),
      category,
      segments,
      channels,
      scheduledAt: isScheduled ? new Date(scheduledAt) : null,
      sentAt: isScheduled ? null : new Date(),
      status: isScheduled ? 'Scheduled' : 'Sent',
      sentBy: req.user?.id || req.user?._id,
      recipientCount: recipients.length,
      deliveryStats: {
        delivered: isScheduled ? 0 : recipients.length,
        read: 0,
        failed: 0,
      },
    });

    await AuditLog.create({
      collegeId,
      performedBy: req.user?.id || req.user?._id,
      action: isScheduled ? 'ANNOUNCEMENT_SCHEDULED' : 'ANNOUNCEMENT_BROADCAST',
      targetModel: 'Announcement',
      targetId: announcement._id,
      details: {
        title: announcement.title,
        recipientCount: announcement.recipientCount,
        category: announcement.category,
      },
    });

    const populated = await Announcement.findById(announcement._id)
      .populate('sentBy', 'firstName lastName email')
      .populate('segments.driveId', 'title companyName')
      .lean();

    res.status(201).json({
      success: true,
      message: isScheduled
        ? `Announcement scheduled for ${new Date(scheduledAt).toLocaleString()} (${recipients.length} recipients)`
        : `Broadcast dispatched successfully to ${recipients.length} students.`,
      announcement: populated,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to dispatch announcement.' } });
  }
};
