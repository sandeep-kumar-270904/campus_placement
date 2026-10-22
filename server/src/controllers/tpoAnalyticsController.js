const mongoose = require('mongoose');
const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');

/**
 * @desc    Get comprehensive placement analytics overview
 * @route   GET /api/tpo/analytics/overview
 * @access  Private (TPO / SuperAdmin)
 */
exports.getAnalyticsOverview = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { graduationYear, branch } = req.query;

    const profileFilter = {
      ...(collegeId ? { collegeId } : {}),
    };
    if (graduationYear) {
      profileFilter.gradYear = Number(graduationYear);
    }
    if (branch) {
      profileFilter.branch = branch;
    }

    const profiles = await StudentProfile.find(profileFilter)
      .populate('user', 'firstName lastName email')
      .lean();

    const totalStudents = profiles.length;
    const placedProfiles = profiles.filter((p) => p.isPlaced);
    const placedCount = placedProfiles.length;
    const placementRate = totalStudents > 0 ? ((placedCount / totalStudents) * 100).toFixed(1) : 0;

    // Fetch all applications in this college (and for these students)
    const studentUserIds = profiles.map((p) => p.user?._id || p.user).filter(Boolean);
    const appFilter = {
      ...(collegeId ? { collegeId } : {}),
      ...(studentUserIds.length > 0 ? { studentId: { $in: studentUserIds } } : {}),
    };

    const applications = await Application.find(appFilter)
      .populate('opportunityId', 'companyName title ctc')
      .lean();

    // Offers and CTC calculations
    const offerApps = applications.filter(
      (a) => a.status === 'Offer Extended' || a.status === 'Placed'
    );
    const totalOffers = offerApps.length;

    const ctcValues = [];
    offerApps.forEach((a) => {
      const ctcVal = a.offerDetails?.ctcTotal || a.opportunityId?.ctc?.total || 0;
      if (ctcVal > 0) ctcValues.push(ctcVal);
    });

    ctcValues.sort((a, b) => a - b);
    const highestCtc = ctcValues.length > 0 ? Math.max(...ctcValues) : 0;
    const avgCtc =
      ctcValues.length > 0
        ? (ctcValues.reduce((sum, v) => sum + v, 0) / ctcValues.length).toFixed(2)
        : 0;
    const medianCtc =
      ctcValues.length > 0
        ? ctcValues[Math.floor(ctcValues.length / 2)]
        : 0;

    // CTC Bands Distribution
    const ctcBands = [
      { band: '< 5 LPA', count: 0 },
      { band: '5 - 10 LPA', count: 0 },
      { band: '10 - 15 LPA', count: 0 },
      { band: '15 - 25 LPA', count: 0 },
      { band: '> 25 LPA', count: 0 },
    ];

    ctcValues.forEach((val) => {
      if (val < 5) ctcBands[0].count++;
      else if (val <= 10) ctcBands[1].count++;
      else if (val <= 15) ctcBands[2].count++;
      else if (val <= 25) ctcBands[3].count++;
      else ctcBands[4].count++;
    });

    // Department / Branch Wise Breakdown
    const branchMap = {};
    profiles.forEach((p) => {
      const b = p.branch || 'Unassigned';
      if (!branchMap[b]) {
        branchMap[b] = { branch: b, total: 0, placed: 0, ctcList: [] };
      }
      branchMap[b].total++;
      if (p.isPlaced) {
        branchMap[b].placed++;
      }
    });

    // Associate CTC to branches
    const userToBranch = {};
    profiles.forEach((p) => {
      const uid = (p.user?._id || p.user)?.toString();
      if (uid) userToBranch[uid] = p.branch || 'Unassigned';
    });

    offerApps.forEach((a) => {
      const uid = (a.studentId?._id || a.studentId)?.toString();
      const b = userToBranch[uid];
      const ctcVal = a.offerDetails?.ctcTotal || a.opportunityId?.ctc?.total || 0;
      if (b && branchMap[b] && ctcVal > 0) {
        branchMap[b].ctcList.push(ctcVal);
      }
    });

    const departmentStats = Object.values(branchMap).map((d) => {
      const bAvg =
        d.ctcList.length > 0
          ? (d.ctcList.reduce((s, v) => s + v, 0) / d.ctcList.length).toFixed(2)
          : 0;
      return {
        branch: d.branch,
        totalStudents: d.total,
        placedStudents: d.placed,
        placementPercentage: d.total > 0 ? Math.round((d.placed / d.total) * 100) : 0,
        averageCtc: Number(bAvg),
      };
    });

    // Top Recruiters Leaderboard
    const companyHires = {};
    offerApps.forEach((a) => {
      const cName = a.opportunityId?.companyName || 'Corporate Partner';
      const ctcVal = a.offerDetails?.ctcTotal || a.opportunityId?.ctc?.total || 0;
      if (!companyHires[cName]) {
        companyHires[cName] = { company: cName, hires: 0, maxCtc: 0, ctcList: [] };
      }
      companyHires[cName].hires++;
      if (ctcVal > companyHires[cName].maxCtc) companyHires[cName].maxCtc = ctcVal;
      if (ctcVal > 0) companyHires[cName].ctcList.push(ctcVal);
    });

    const topRecruiters = Object.values(companyHires)
      .map((c) => ({
        company: c.company,
        hires: c.hires,
        highestCtc: c.maxCtc,
        avgCtc:
          c.ctcList.length > 0
            ? Number((c.ctcList.reduce((s, v) => s + v, 0) / c.ctcList.length).toFixed(2))
            : 0,
      }))
      .sort((a, b) => b.hires - a.hires)
      .slice(0, 8);

    // Recruitment Funnel Progression
    const appliedUserIds = new Set();
    const oaUserIds = new Set();
    const techUserIds = new Set();
    const hrUserIds = new Set();
    const offerUserIds = new Set();

    applications.forEach((a) => {
      const uid = (a.studentId?._id || a.studentId)?.toString();
      if (!uid) return;
      appliedUserIds.add(uid);

      if (
        ['Online Assessment', 'Technical Round', 'HR Round', 'Offer Extended', 'Placed'].includes(
          a.status
        )
      ) {
        oaUserIds.add(uid);
      }
      if (['Technical Round', 'HR Round', 'Offer Extended', 'Placed'].includes(a.status)) {
        techUserIds.add(uid);
      }
      if (['HR Round', 'Offer Extended', 'Placed'].includes(a.status)) {
        hrUserIds.add(uid);
      }
      if (['Offer Extended', 'Placed'].includes(a.status)) {
        offerUserIds.add(uid);
      }
    });

    const funnel = [
      { stage: 'Cohort Pool', count: totalStudents },
      { stage: 'Applied', count: appliedUserIds.size },
      { stage: 'Assessment', count: oaUserIds.size },
      { stage: 'Tech Interview', count: techUserIds.size },
      { stage: 'HR Interview', count: hrUserIds.size },
      { stage: 'Offers Extended', count: offerUserIds.size },
      { stage: 'Final Placed', count: placedCount },
    ];

    res.json({
      success: true,
      summary: {
        totalStudents,
        placedCount,
        placementRate: Number(placementRate),
        totalOffers,
        highestCtc,
        avgCtc: Number(avgCtc),
        medianCtc,
      },
      departmentStats,
      ctcBands,
      topRecruiters,
      funnel,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch analytics.' } });
  }
};

/**
 * @desc    Get list of unplaced students for targeted counseling and drive allocation
 * @route   GET /api/tpo/analytics/unplaced
 * @access  Private (TPO / SuperAdmin)
 */
exports.getAnalyticsUnplaced = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { branch, limit = 50 } = req.query;

    const filter = {
      ...(collegeId ? { collegeId } : {}),
      isPlaced: false,
    };
    if (branch) filter.branch = branch;

    const profiles = await StudentProfile.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ cgpa: -1 })
      .limit(Number(limit))
      .lean();

    const userIds = profiles.map((p) => p.user?._id || p.user).filter(Boolean);

    // Count applications submitted by each unplaced student
    const appsAgg = await Application.aggregate([
      {
        $match: {
          ...(collegeId ? { collegeId: new mongoose.Types.ObjectId(collegeId) } : {}),
          studentId: { $in: userIds.map((id) => new mongoose.Types.ObjectId(id)) },
        },
      },
      {
        $group: {
          _id: '$studentId',
          totalApplications: { $sum: 1 },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] },
          },
        },
      },
    ]);

    const appMap = {};
    appsAgg.forEach((a) => {
      appMap[a._id.toString()] = a;
    });

    const students = profiles.map((p) => {
      const uid = (p.user?._id || p.user)?.toString();
      const stats = appMap[uid] || { totalApplications: 0, rejectedCount: 0 };
      return {
        id: p._id,
        userId: uid,
        name: p.user ? `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim() : 'Student',
        email: p.user?.email || '',
        rollNo: p.rollNo || '',
        branch: p.branch || '',
        gradYear: p.gradYear,
        cgpa: p.cgpa || 0,
        activeBacklogs: p.activeBacklogs || 0,
        totalApplications: stats.totalApplications,
        rejectedCount: stats.rejectedCount,
      };
    });

    res.json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch unplaced students.' } });
  }
};

/**
 * @desc    Get list of candidates with multiple offers
 * @route   GET /api/tpo/analytics/multiple-offers
 * @access  Private (TPO / SuperAdmin)
 */
exports.getAnalyticsMultipleOffers = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;

    const offerApps = await Application.find({
      ...(collegeId ? { collegeId } : {}),
      status: { $in: ['Offer Extended', 'Placed'] },
    })
      .populate('studentId', 'firstName lastName email')
      .populate('opportunityId', 'companyName title ctc')
      .lean();

    const studentOffers = {};
    offerApps.forEach((a) => {
      const uid = (a.studentId?._id || a.studentId)?.toString();
      if (!uid) return;
      if (!studentOffers[uid]) {
        studentOffers[uid] = {
          studentId: uid,
          name: `${a.studentId?.firstName || ''} ${a.studentId?.lastName || ''}`.trim(),
          email: a.studentId?.email || '',
          offers: [],
        };
      }
      studentOffers[uid].offers.push({
        company: a.opportunityId?.companyName || 'Unknown',
        title: a.opportunityId?.title || 'Offer',
        ctc: a.offerDetails?.ctcTotal || a.opportunityId?.ctc?.total || 0,
      });
    });

    const multipleOffers = Object.values(studentOffers)
      .filter((s) => s.offers.length >= 2)
      .sort((a, b) => b.offers.length - a.offers.length);

    res.json({
      success: true,
      count: multipleOffers.length,
      candidates: multipleOffers,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch multiple offers.' } });
  }
};
