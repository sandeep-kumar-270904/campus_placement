const AlumniProfile = require('../models/AlumniProfile');
const AlumniReferralRequest = require('../models/AlumniReferralRequest');
const User = require('../models/User');

/**
 * @desc    Get alumni directory with filters
 * @route   GET /api/alumni/directory
 * @access  Private
 */
exports.getAlumniDirectory = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { q, company, branch, batchYear, willingToMentor, willingToRefer } = req.query;

    const query = {
      ...(collegeId ? { collegeId } : {}),
      isVerifiedAlumni: true,
    };

    if (company) query.currentCompany = new RegExp(company, 'i');
    if (branch && branch !== 'all') query.branch = branch;
    if (batchYear) query.batchYear = Number(batchYear);
    if (willingToMentor === 'true') query.willingToMentor = true;
    if (willingToRefer === 'true') query.willingToRefer = true;

    if (q) {
      query.$or = [
        { fullName: new RegExp(q, 'i') },
        { currentCompany: new RegExp(q, 'i') },
        { currentRole: new RegExp(q, 'i') },
        { branch: new RegExp(q, 'i') },
      ];
    }

    const alumni = await AlumniProfile.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      alumni,
      total: alumni.length,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch alumni directory.' } });
  }
};

/**
 * @desc    Create or update current user's alumni profile
 * @route   POST /api/alumni/profile
 * @access  Private
 */
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const {
      fullName,
      email,
      batchYear,
      branch,
      currentCompany,
      currentRole,
      location,
      linkedinUrl,
      bio,
      willingToRefer = true,
      willingToMentor = true,
      mentorshipDomains = [],
    } = req.body;

    // Check if user has an institutional email domain
    const user = await User.findById(userId).lean();
    const userEmail = email || user?.email || '';
    const isDomainVerified = userEmail.includes('.edu') || userEmail.includes('.ac.in');

    const profile = await AlumniProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          collegeId,
          fullName: fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          email: userEmail,
          batchYear: Number(batchYear) || 2024,
          branch: branch || 'Computer Science',
          currentCompany: currentCompany || 'Technology Partner',
          currentRole: currentRole || 'Software Engineer',
          location: location || 'Bengaluru, India',
          linkedinUrl: linkedinUrl || '',
          bio: bio || '',
          willingToRefer: Boolean(willingToRefer),
          willingToMentor: Boolean(willingToMentor),
          mentorshipDomains,
          ...(isDomainVerified ? { isVerifiedAlumni: true, verificationMethod: 'domain_email' } : {}),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      message: 'Alumni profile saved.',
      profile,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to save alumni profile.' } });
  }
};

/**
 * @desc    Submit a referral or mentorship request to alumni with rate-limit
 * @route   POST /api/alumni/referrals/request
 * @access  Private (Student)
 */
exports.requestReferral = async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?._id;
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { alumniId, targetCompany, targetRole, jobUrlOrId, resumeUrl, message, requestType = 'Referral' } = req.body;

    if (!alumniId || !message) {
      return res.status(400).json({ error: { message: 'Alumni ID and message are required.' } });
    }

    // Rate Limit: Max 3 active pending requests in past 7 days per student
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    const recentRequestsCount = await AlumniReferralRequest.countDocuments({
      studentId,
      createdAt: { $gte: sevenDaysAgo },
    });

    if (recentRequestsCount >= 3) {
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'You have reached your limit of 3 alumni requests per week. Please wait for responses or try next week.',
        },
      });
    }

    const request = await AlumniReferralRequest.create({
      studentId,
      alumniId,
      collegeId,
      requestType,
      targetCompany: targetCompany || 'Company',
      targetRole: targetRole || 'Role',
      jobUrlOrId: jobUrlOrId || '',
      resumeUrl: resumeUrl || '',
      message: message.trim(),
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      message: 'Referral request delivered to alumni.',
      request,
      weeklyQuotaRemaining: 2 - recentRequestsCount,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to submit referral request.' } });
  }
};

/**
 * @desc    Get user's sent or received referral requests
 * @route   GET /api/alumni/referrals/my-requests
 * @access  Private
 */
exports.getMyReferralRequests = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const myProfile = await AlumniProfile.findOne({ userId }).lean();

    // Student sent requests
    const sent = await AlumniReferralRequest.find({ studentId: userId })
      .populate('alumniId', 'fullName currentCompany currentRole branch batchYear')
      .sort({ createdAt: -1 })
      .lean();

    // Alumni received requests
    let received = [];
    if (myProfile) {
      received = await AlumniReferralRequest.find({ alumniId: myProfile._id })
        .populate('studentId', 'firstName lastName email rollNo branch')
        .sort({ createdAt: -1 })
        .lean();
    }

    res.json({
      success: true,
      sent,
      received,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch requests.' } });
  }
};

/**
 * @desc    Alumni accepts, declines, or completes referral request
 * @route   PATCH /api/alumni/referrals/:id
 * @access  Private (Alumni)
 */
exports.respondToReferralRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, alumniNote } = req.body;

    if (!['Accepted', 'Declined', 'Referred'].includes(status)) {
      return res.status(400).json({ error: { message: 'Invalid status.' } });
    }

    const request = await AlumniReferralRequest.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          alumniNote: alumniNote || '',
          respondedAt: new Date(),
        },
      },
      { new: true }
    );

    if (status === 'Referred') {
      await AlumniProfile.findByIdAndUpdate(request.alumniId, {
        $inc: { totalReferralsProvided: 1 },
      });
    }

    res.json({
      success: true,
      message: `Request status updated to ${status}.`,
      request,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to update request.' } });
  }
};

/**
 * @desc    Mentor matching algorithm matching student branch and target career goal
 * @route   GET /api/alumni/mentors/match
 * @access  Private (Student)
 */
exports.matchMentors = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { branch, goal } = req.query;

    const query = {
      ...(collegeId ? { collegeId } : {}),
      isVerifiedAlumni: true,
      willingToMentor: true,
    };

    if (branch && branch !== 'all') {
      query.branch = branch;
    }

    let mentors = await AlumniProfile.find(query).limit(10).lean();

    // If branch-specific filter yielded few results, fallback to all willing mentors
    if (mentors.length === 0) {
      delete query.branch;
      mentors = await AlumniProfile.find(query).limit(10).lean();
    }

    res.json({
      success: true,
      matches: mentors,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to match mentors.' } });
  }
};

/**
 * @desc    Get unverified alumni queue for TPO verification
 * @route   GET /api/alumni/tpo/unverified
 * @access  Private (TPO / Admin)
 */
exports.getUnverifiedAlumniQueue = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const unverified = await AlumniProfile.find({
      ...(collegeId ? { collegeId } : {}),
      isVerifiedAlumni: false,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      unverified,
      total: unverified.length,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch queue.' } });
  }
};

/**
 * @desc    TPO verifies an alumni profile
 * @route   PATCH /api/alumni/tpo/verify/:id
 * @access  Private (TPO / Admin)
 */
exports.verifyAlumniProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const verifiedBy = req.user?.id || req.user?._id;

    const profile = await AlumniProfile.findByIdAndUpdate(
      id,
      {
        $set: {
          isVerifiedAlumni: true,
          verifiedBy,
          verifiedAt: new Date(),
          verificationMethod: 'tpo_manual',
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      message: `Alumni ${profile.fullName} verified successfully.`,
      profile,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Verification failed.' } });
  }
};
