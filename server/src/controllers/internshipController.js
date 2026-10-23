const InternshipRecord = require('../models/InternshipRecord');
const StudentProfile = require('../models/StudentProfile');

/**
 * @desc    Get all registered internships with PPO status filtering
 * @route   GET /api/internships
 * @access  Private
 */
exports.getInternships = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { ppoStatus, company, mode, q } = req.query;

    const query = { ...(collegeId ? { collegeId } : {}) };

    if (ppoStatus && ppoStatus !== 'all') query.ppoStatus = ppoStatus;
    if (company) query.companyName = new RegExp(company, 'i');
    if (mode && mode !== 'all') query.mode = mode;

    if (q) {
      query.$or = [
        { companyName: new RegExp(q, 'i') },
        { role: new RegExp(q, 'i') },
        { mentorName: new RegExp(q, 'i') },
      ];
    }

    const internships = await InternshipRecord.find(query)
      .populate('studentId', 'firstName lastName email rollNo branch')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      internships,
      total: internships.length,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch internships.' } });
  }
};

/**
 * @desc    Create a new internship record
 * @route   POST /api/internships
 * @access  Private
 */
exports.createInternship = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const userId = req.user?.id || req.user?._id;
    const {
      studentId = userId,
      companyName,
      role,
      stipendMonthly = 25000,
      durationMonths = 6,
      startDate = new Date(),
      endDate,
      mode = 'Onsite',
      location = 'Bengaluru, India',
      mentorName = '',
      mentorEmail = '',
      ppoStatus = 'In Progress',
    } = req.body;

    if (!companyName || !role) {
      return res.status(400).json({ error: { message: 'Company name and role are required.' } });
    }

    const internship = await InternshipRecord.create({
      studentId,
      collegeId,
      companyName: companyName.trim(),
      role: role.trim(),
      stipendMonthly: Number(stipendMonthly),
      durationMonths: Number(durationMonths),
      startDate,
      endDate: endDate || new Date(new Date(startDate).getTime() + durationMonths * 30 * 24 * 3600 * 1000),
      mode,
      location,
      mentorName,
      mentorEmail,
      ppoStatus,
    });

    res.status(201).json({
      success: true,
      message: 'Internship recorded successfully.',
      internship,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to create internship.' } });
  }
};

/**
 * @desc    Update PPO conversion outcome and CTC details
 * @route   PATCH /api/internships/:id/ppo
 * @access  Private
 */
exports.updatePpoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { ppoStatus, ppoDetails = {}, performanceRating, notes } = req.body;

    if (!['In Progress', 'PPO Offered', 'PPO Accepted', 'PPO Rejected', 'No Conversion'].includes(ppoStatus)) {
      return res.status(400).json({ error: { message: 'Invalid PPO status.' } });
    }

    const update = {
      ppoStatus,
      'ppoDetails.conversionDate': new Date(),
    };

    if (ppoDetails.ctc !== undefined) update['ppoDetails.ctc'] = Number(ppoDetails.ctc);
    if (ppoDetails.fixedCtc !== undefined) update['ppoDetails.fixedCtc'] = Number(ppoDetails.fixedCtc);
    if (ppoDetails.variableCtc !== undefined) update['ppoDetails.variableCtc'] = Number(ppoDetails.variableCtc);
    if (ppoDetails.role) update['ppoDetails.role'] = ppoDetails.role;
    if (ppoDetails.offerLetterUrl) update['ppoDetails.offerLetterUrl'] = ppoDetails.offerLetterUrl;
    if (performanceRating) update.performanceRating = Number(performanceRating);
    if (notes) update.notes = notes;

    const internship = await InternshipRecord.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    );

    // If PPO was accepted, update student profile isPlaced to true
    if (ppoStatus === 'PPO Accepted') {
      await StudentProfile.findOneAndUpdate(
        { user: internship.studentId },
        {
          $set: {
            isPlaced: true,
            placedCompany: internship.companyName,
            placedPackage: internship.ppoDetails?.ctc || 10,
          },
        }
      );
    }

    res.json({
      success: true,
      message: `Internship PPO status updated to ${ppoStatus}.`,
      internship,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to update PPO status.' } });
  }
};

/**
 * @desc    Get aggregate analytics for internship cohort and PPO conversion rate
 * @route   GET /api/internships/stats
 * @access  Private
 */
exports.getInternshipStats = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const query = { ...(collegeId ? { collegeId } : {}) };

    const internships = await InternshipRecord.find(query).lean();
    const total = internships.length;
    const ppoOffered = internships.filter((i) => ['PPO Offered', 'PPO Accepted'].includes(i.ppoStatus)).length;
    const ppoAccepted = internships.filter((i) => i.ppoStatus === 'PPO Accepted').length;

    const stipends = internships.map((i) => i.stipendMonthly).filter((s) => s > 0);
    const avgStipend = stipends.length > 0
      ? Math.round(stipends.reduce((a, b) => a + b, 0) / stipends.length)
      : 0;
    const highestStipend = stipends.length > 0 ? Math.max(...stipends) : 0;

    const conversionRate = total > 0 ? Number(((ppoOffered / total) * 100).toFixed(1)) : 0;

    res.json({
      success: true,
      stats: {
        totalInterns: total,
        ppoOffered,
        ppoAccepted,
        conversionRate,
        averageStipendMonthly: avgStipend,
        highestStipendMonthly: highestStipend,
      },
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to compile stats.' } });
  }
};
