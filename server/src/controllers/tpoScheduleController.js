const mongoose = require('mongoose');
const InterviewSlot = require('../models/InterviewSlot');
const Opportunity = require('../models/Opportunity');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

/**
 * Format Date to UTC iCalendar string: YYYYMMDDTHHmmssZ
 */
function formatIcsDate(date) {
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * @desc    Get recruitment calendar interview slots
 * @route   GET /api/tpo/schedule/slots
 * @access  Private (TPO / SuperAdmin)
 */
exports.getScheduleSlots = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { startDate, endDate, opportunityId, panelName, studentId, status } = req.query;

    const filter = {};
    if (collegeId) filter.collegeId = collegeId;

    if (startDate && endDate) {
      filter.startDateTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      filter.startDateTime = { $gte: new Date(startDate) };
    }

    if (opportunityId) filter.opportunityId = opportunityId;
    if (panelName) filter.panelName = panelName;
    if (studentId) filter.studentId = studentId;
    if (status) filter.status = status;

    const slots = await InterviewSlot.find(filter)
      .populate('studentId', 'firstName lastName email')
      .populate('opportunityId', 'title companyName jobRole')
      .sort({ startDateTime: 1 })
      .lean();

    // Enrich with student profile rollNo and branch
    const studentUserIds = slots
      .map((s) => s.studentId?._id || s.studentId)
      .filter(Boolean);

    const profiles = await StudentProfile.find({
      ...(collegeId ? { collegeId } : {}),
      user: { $in: studentUserIds },
    }).lean();

    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.user.toString()] = p;
    });

    const enriched = slots.map((s) => {
      const uId = (s.studentId?._id || s.studentId)?.toString();
      const prof = profileMap[uId] || {};
      return {
        ...s,
        studentName: s.studentId
          ? `${s.studentId.firstName || ''} ${s.studentId.lastName || ''}`.trim()
          : 'Unassigned',
        studentEmail: s.studentId?.email || '',
        rollNo: prof.rollNo || '',
        branch: prof.branch || '',
        companyName: s.opportunityId?.companyName || 'Unknown Company',
        driveTitle: s.opportunityId?.title || 'Placement Drive',
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      slots: enriched,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch schedule slots.' } });
  }
};

/**
 * @desc    Check potential schedule clashes for candidate or panel
 * @route   POST /api/tpo/schedule/check-clash
 * @access  Private (TPO / SuperAdmin)
 */
exports.checkScheduleClashes = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { studentId, panelName, startDateTime, endDateTime, excludeSlotId } = req.body;

    if (!startDateTime || !endDateTime) {
      return res.status(400).json({ error: { message: 'startDateTime and endDateTime are required.' } });
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    const baseOverlapFilter = {
      ...(collegeId ? { collegeId } : {}),
      status: { $ne: 'Cancelled' },
      startDateTime: { $lt: end },
      endDateTime: { $gt: start },
    };

    if (excludeSlotId) {
      baseOverlapFilter._id = { $ne: excludeSlotId };
    }

    let studentClashes = [];
    if (studentId) {
      studentClashes = await InterviewSlot.find({
        ...baseOverlapFilter,
        studentId,
      })
        .populate('opportunityId', 'companyName title')
        .lean();
    }

    let panelClashes = [];
    if (panelName) {
      panelClashes = await InterviewSlot.find({
        ...baseOverlapFilter,
        panelName,
      })
        .populate('opportunityId', 'companyName title')
        .populate('studentId', 'firstName lastName')
        .lean();
    }

    const hasClash = studentClashes.length > 0 || panelClashes.length > 0;

    res.json({
      success: true,
      hasClash,
      studentClash: studentClashes.length > 0,
      panelClash: panelClashes.length > 0,
      conflicts: {
        studentClashes,
        panelClashes,
      },
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to check clashes.' } });
  }
};

/**
 * @desc    Bulk generate interview slots for a drive and round
 * @route   POST /api/tpo/schedule/bulk-generate
 * @access  Private (TPO / SuperAdmin)
 */
exports.bulkGenerateSlots = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const {
      opportunityId,
      roundName,
      roundNumber = 1,
      date,
      startTime = '09:00',
      endTime = '17:00',
      slotDurationMinutes = 30,
      breakDurationMinutes = 0,
      panelNames = ['Panel 1'],
      mode = 'Online',
      roomOrLink = '',
      studentIds = [],
    } = req.body;

    if (!opportunityId || !roundName || !date) {
      return res.status(400).json({
        error: { message: 'opportunityId, roundName, and date (YYYY-MM-DD) are required.' },
      });
    }

    // Verify opportunity exists
    const drive = await Opportunity.findById(opportunityId);
    if (!drive) {
      return res.status(404).json({ error: { message: 'Placement drive not found.' } });
    }

    // Parse time bounds
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const slotLen = Math.max(10, parseInt(slotDurationMinutes, 10) || 30);
    const breakLen = Math.max(0, parseInt(breakDurationMinutes, 10) || 0);

    const dayStart = new Date(`${date}T${startTime}:00`);
    const dayEnd = new Date(`${date}T${endTime}:00`);

    if (dayEnd <= dayStart) {
      return res.status(400).json({ error: { message: 'endTime must be later than startTime.' } });
    }

    // Generate time intervals
    const intervals = [];
    let currentStart = new Date(dayStart);

    while (true) {
      const currentEnd = new Date(currentStart.getTime() + slotLen * 60000);
      if (currentEnd > dayEnd) break;

      const pad = (n) => String(n).padStart(2, '0');
      const sTimeStr = `${pad(currentStart.getHours())}:${pad(currentStart.getMinutes())}`;
      const eTimeStr = `${pad(currentEnd.getHours())}:${pad(currentEnd.getMinutes())}`;

      intervals.push({
        startDateTime: new Date(currentStart),
        endDateTime: new Date(currentEnd),
        startTime: sTimeStr,
        endTime: eTimeStr,
      });

      // advance by slotLen + breakLen
      currentStart = new Date(currentEnd.getTime() + breakLen * 60000);
    }

    if (intervals.length === 0) {
      return res.status(400).json({ error: { message: 'No valid slots fit inside the specified time window.' } });
    }

    const panels = panelNames.length > 0 ? panelNames : ['Panel 1'];
    const slotsToCreate = [];
    let studentIndex = 0;

    for (const interval of intervals) {
      for (const panel of panels) {
        let assignedStudentId = null;
        if (studentIds.length > 0 && studentIndex < studentIds.length) {
          assignedStudentId = studentIds[studentIndex];
          studentIndex++;
        }

        slotsToCreate.push({
          collegeId,
          opportunityId,
          roundName,
          roundNumber: parseInt(roundNumber, 10) || 1,
          panelName: panel,
          studentId: assignedStudentId,
          date: new Date(date),
          startTime: interval.startTime,
          endTime: interval.endTime,
          startDateTime: interval.startDateTime,
          endDateTime: interval.endDateTime,
          mode,
          roomOrLink,
          status: 'Scheduled',
          createdBy: req.user?.id || req.user?._id,
        });
      }
    }

    // Check for panel or student clashes in batch
    let clashesFound = 0;
    const finalSlots = [];

    for (const slotData of slotsToCreate) {
      const overlapQuery = {
        ...(collegeId ? { collegeId } : {}),
        status: { $ne: 'Cancelled' },
        startDateTime: { $lt: slotData.endDateTime },
        endDateTime: { $gt: slotData.startDateTime },
      };

      const clash = await InterviewSlot.findOne({
        ...overlapQuery,
        $or: [
          ...(slotData.studentId ? [{ studentId: slotData.studentId }] : []),
          { panelName: slotData.panelName },
        ],
      });

      if (clash) {
        clashesFound++;
      }

      const created = await InterviewSlot.create(slotData);
      finalSlots.push(created);
    }

    // Audit Log
    await AuditLog.create({
      collegeId,
      performedBy: req.user?.id || req.user?._id,
      action: 'SCHEDULE_BULK_SLOTS_GENERATED',
      targetModel: 'InterviewSlot',
      details: {
        opportunityId,
        roundName,
        slotsCount: finalSlots.length,
        panelsCount: panels.length,
        clashesFound,
        date,
      },
    });

    res.status(201).json({
      success: true,
      message: `Successfully generated ${finalSlots.length} interview slots across ${panels.length} panel(s).`,
      count: finalSlots.length,
      clashesFound,
      slots: finalSlots,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to bulk generate slots.' } });
  }
};

/**
 * @desc    Update an existing interview slot (reschedule, assign student, update status)
 * @route   PUT /api/tpo/schedule/slots/:id
 * @access  Private (TPO / SuperAdmin)
 */
exports.updateScheduleSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const {
      date,
      startTime,
      endTime,
      startDateTime,
      endDateTime,
      studentId,
      panelName,
      mode,
      roomOrLink,
      status,
      cancellationReason,
      feedbackSummary,
    } = req.body;

    const slot = await InterviewSlot.findById(id);
    if (!slot) {
      return res.status(404).json({ error: { message: 'Interview slot not found.' } });
    }

    if (date) slot.date = new Date(date);
    if (startTime) slot.startTime = startTime;
    if (endTime) slot.endTime = endTime;
    if (startDateTime) slot.startDateTime = new Date(startDateTime);
    if (endDateTime) slot.endDateTime = new Date(endDateTime);
    if (panelName) slot.panelName = panelName;
    if (mode) slot.mode = mode;
    if (roomOrLink !== undefined) slot.roomOrLink = roomOrLink;
    if (studentId !== undefined) slot.studentId = studentId || null;
    if (feedbackSummary !== undefined) slot.feedbackSummary = feedbackSummary;

    if (status && slot.status !== status) {
      slot.status = status;
      if (status === 'Cancelled' && cancellationReason) {
        slot.cancellationReason = cancellationReason;
      }
    }

    await slot.save();

    await AuditLog.create({
      collegeId,
      performedBy: req.user?.id || req.user?._id,
      action: 'SCHEDULE_SLOT_UPDATED',
      targetModel: 'InterviewSlot',
      targetId: slot._id,
      details: {
        newStatus: slot.status,
        panelName: slot.panelName,
        startDateTime: slot.startDateTime,
      },
    });

    const populated = await InterviewSlot.findById(slot._id)
      .populate('studentId', 'firstName lastName email')
      .populate('opportunityId', 'title companyName')
      .lean();

    res.json({
      success: true,
      message: 'Interview slot updated successfully.',
      slot: populated,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to update schedule slot.' } });
  }
};

/**
 * @desc    Export schedule slots as standard iCalendar (.ics) file
 * @route   GET /api/tpo/schedule/export-ics
 * @access  Private (TPO / SuperAdmin)
 */
exports.exportIcs = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { driveId } = req.query;

    const filter = {
      ...(collegeId ? { collegeId } : {}),
      status: { $ne: 'Cancelled' },
    };
    if (driveId) filter.opportunityId = driveId;

    const slots = await InterviewSlot.find(filter)
      .populate('studentId', 'firstName lastName email')
      .populate('opportunityId', 'title companyName')
      .sort({ startDateTime: 1 })
      .lean();

    const studentIds = slots.map((s) => s.studentId?._id || s.studentId).filter(Boolean);
    const profiles = await StudentProfile.find({
      ...(collegeId ? { collegeId } : {}),
      user: { $in: studentIds },
    }).lean();

    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.user.toString()] = p;
    });

    const nowStr = formatIcsDate(new Date());

    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PLACEearly//Placement Operating System//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Campus Placement Schedule',
    ];

    for (const slot of slots) {
      const uId = (slot.studentId?._id || slot.studentId)?.toString();
      const prof = profileMap[uId] || {};
      const studentName = slot.studentId
        ? `${slot.studentId.firstName || ''} ${slot.studentId.lastName || ''}`.trim()
        : 'Unassigned Candidate';
      const company = slot.opportunityId?.companyName || 'Campus Drive';
      const round = slot.roundName || 'Interview Round';
      const summary = `${company} - ${round} (${slot.panelName || 'Panel'})`;
      const description = `Candidate: ${studentName}\\nRoll No: ${prof.rollNo || 'N/A'}\\nBranch: ${prof.branch || 'N/A'}\\nMode: ${slot.mode}\\nLink/Room: ${slot.roomOrLink || 'TBA'}`;

      icsLines.push('BEGIN:VEVENT');
      icsLines.push(`UID:slot-${slot._id}@placeearly.edu`);
      icsLines.push(`DTSTAMP:${nowStr}`);
      icsLines.push(`DTSTART:${formatIcsDate(slot.startDateTime)}`);
      icsLines.push(`DTEND:${formatIcsDate(slot.endDateTime)}`);
      icsLines.push(`SUMMARY:${summary.replace(/,/g, '\\,')}`);
      icsLines.push(`DESCRIPTION:${description}`);
      if (slot.roomOrLink) {
        icsLines.push(`LOCATION:${slot.roomOrLink.replace(/,/g, '\\,')}`);
      }
      icsLines.push('STATUS:CONFIRMED');
      icsLines.push('END:VEVENT');
    }

    icsLines.push('END:VCALENDAR');

    const icsContent = icsLines.join('\r\n');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="placement-schedule.ics"');
    res.send(icsContent);
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to export ICS.' } });
  }
};
