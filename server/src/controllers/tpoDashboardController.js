const StudentProfile = require('../models/StudentProfile');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const InterviewSlot = require('../models/InterviewSlot');
const AuditLog = require('../models/AuditLog');

/**
 * @desc    Fetch real-time KPI metrics, needs-attention queue, and recent audit activity for TPO Command Center
 * @route   GET /api/tpo/dashboard-summary
 * @access  Private (TPO / SuperAdmin)
 */
exports.getDashboardSummary = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    if (!collegeId && req.user?.role !== 'superadmin') {
      return res.status(400).json({ error: { message: 'College tenant context is required.' } });
    }

    const filter = collegeId ? { collegeId } : {};

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Parallel aggregation for high performance
    const [
      totalStudents,
      verifiedCount,
      activeDrives,
      applicationsThisWeek,
      offersMadeCount,
      placedStudentsCount,
      pendingVerifications,
      drivesClosingSoon,
      interviewsToday,
      unscheduledShortlisted,
      expiringOffers,
      recentAuditLogs,
    ] = await Promise.all([
      StudentProfile.countDocuments(filter),
      StudentProfile.countDocuments({ ...filter, isVerifiedByTPO: true }),
      Opportunity.countDocuments({ ...filter, status: { $in: ['Open', 'In Progress'] } }),
      Application.countDocuments({ ...filter, appliedAt: { $gte: sevenDaysAgo } }),
      Application.countDocuments({
        ...filter,
        $or: [
          { status: { $in: ['Offer Extended', 'Placed', 'Hired'] } },
          { 'offer.status': { $in: ['Pending', 'Accepted'] } },
        ],
      }),
      Application.distinct('studentId', {
        ...filter,
        $or: [
          { status: { $in: ['Placed', 'Hired'] } },
          { 'offer.status': 'Accepted' },
        ],
      }).then((arr) => arr.length),
      // 1. Pending verifications
      StudentProfile.find({ ...filter, isVerifiedByTPO: false })
        .populate('user', 'firstName lastName email')
        .sort({ updatedAt: -1 })
        .limit(6)
        .lean(),
      // 2. Drives closing in 48h
      Opportunity.find({
        ...filter,
        status: 'Open',
        deadline: { $gte: now, $lte: in48Hours },
      })
        .select('title companyName companyLogo deadline salary')
        .sort({ deadline: 1 })
        .limit(5)
        .lean(),
      // 3. Interviews today
      InterviewSlot.find({
        ...filter,
        date: { $gte: startOfToday, $lte: endOfToday },
        status: { $ne: 'Cancelled' },
      })
        .populate('studentId', 'firstName lastName email')
        .populate('opportunityId', 'companyName title')
        .sort({ startDateTime: 1 })
        .limit(6)
        .lean(),
      // 4. Unscheduled shortlisted students
      Application.find({
        ...filter,
        status: 'Shortlisted',
        $or: [
          { 'interviewSchedule.date': { $exists: false } },
          { 'interviewSchedule.date': null },
        ],
      })
        .populate('studentId', 'firstName lastName email')
        .populate('opportunityId', 'companyName title')
        .limit(6)
        .lean(),
      // 5. Expiring/Pending offers
      Application.find({
        ...filter,
        $or: [
          { status: 'Offer Extended' },
          { 'offer.status': 'Pending' },
        ],
      })
        .populate('studentId', 'firstName lastName email')
        .populate('opportunityId', 'companyName title')
        .sort({ updatedAt: -1 })
        .limit(6)
        .lean(),
      // 6. Recent Audit Logs
      AuditLog.find(filter)
        .populate('actorId', 'firstName lastName email role')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const verifiedPercent = totalStudents > 0 ? Math.round((verifiedCount / totalStudents) * 100) : 0;
    const placementPercent = totalStudents > 0 ? Math.round((placedStudentsCount / totalStudents) * 100) : 0;

    return res.json({
      kpis: {
        totalStudents,
        verifiedCount,
        verifiedPercent,
        activeDrives,
        applicationsThisWeek,
        offersMade: offersMadeCount,
        placedStudents: placedStudentsCount,
        placementPercent,
      },
      needsAttention: {
        pendingVerifications: pendingVerifications.map((p) => ({
          id: p._id,
          studentId: p.user?._id || p.user,
          name: p.user ? `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim() || 'Student' : 'Student',
          rollNo: p.rollNo,
          branch: p.branch,
          cgpa: p.cgpa,
          backlogs: p.backlogs,
          marksheetUrl: p.marksheetUrl,
        })),
        drivesClosingSoon: drivesClosingSoon.map((d) => ({
          id: d._id,
          title: d.title,
          companyName: d.companyName,
          companyLogo: d.companyLogo,
          deadline: d.deadline,
          salary: d.salary,
        })),
        interviewsToday: interviewsToday.map((i) => ({
          id: i._id,
          studentName: i.studentId ? `${i.studentId.firstName || ''} ${i.studentId.lastName || ''}`.trim() : 'Candidate',
          companyName: i.opportunityId?.companyName || 'Campus Drive',
          roundName: i.roundName,
          startTime: i.startTime,
          endTime: i.endTime,
          roomOrLink: i.roomOrLink,
        })),
        unscheduledShortlisted: unscheduledShortlisted.map((u) => ({
          id: u._id,
          studentName: u.studentId ? `${u.studentId.firstName || ''} ${u.studentId.lastName || ''}`.trim() : 'Candidate',
          companyName: u.opportunityId?.companyName || 'Drive',
          currentRound: u.currentRound,
          appliedAt: u.appliedAt,
        })),
        expiringOffers: expiringOffers.map((o) => ({
          id: o._id,
          studentName: o.studentId ? `${o.studentId.firstName || ''} ${o.studentId.lastName || ''}`.trim() : 'Candidate',
          companyName: o.opportunityId?.companyName || 'Drive',
          role: o.offer?.role || 'Offer',
          ctc: o.offer?.ctc || 0,
          updatedAt: o.updatedAt,
        })),
      },
      recentActivity: recentAuditLogs.map((log) => ({
        id: log._id,
        action: log.action,
        resource: log.resource,
        actorName: log.actorId ? `${log.actorId.firstName || ''} ${log.actorId.lastName || ''}`.trim() : 'System',
        actorRole: log.actorId?.role || 'tpo',
        timestamp: log.createdAt,
        metadata: log.metadata,
      })),
    });
  } catch (err) {
    console.error('getDashboardSummary error:', err);
    return res.status(500).json({
      error: { code: 'SERVER_ERROR', message: err.message || 'Error fetching dashboard metrics' },
    });
  }
};
