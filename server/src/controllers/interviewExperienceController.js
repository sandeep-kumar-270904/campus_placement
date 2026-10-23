const InterviewExperience = require('../models/InterviewExperience');

/**
 * @desc    Get approved interview experiences with search, filters, and upvotes
 * @route   GET /api/interview-experiences
 * @access  Private
 */
exports.getApprovedExperiences = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { q, company, difficulty, outcome, sortBy = 'upvotes' } = req.query;

    const query = {
      ...(collegeId ? { collegeId } : {}),
      status: 'approved',
    };

    if (company) query.companyName = new RegExp(company, 'i');
    if (difficulty && difficulty !== 'all') query.overallDifficulty = difficulty;
    if (outcome && outcome !== 'all') query.outcome = outcome;

    if (q) {
      query.$or = [
        { companyName: new RegExp(q, 'i') },
        { role: new RegExp(q, 'i') },
        { preparationTips: new RegExp(q, 'i') },
        { 'rounds.questions': new RegExp(q, 'i') },
      ];
    }

    const sortOrder = sortBy === 'recent' ? { createdAt: -1 } : { upvoteCount: -1, createdAt: -1 };

    const experiences = await InterviewExperience.find(query)
      .populate('studentId', 'firstName lastName branch rollNo gradYear')
      .sort(sortOrder)
      .lean();

    // Mask author names if isAnonymous is true
    const sanitized = experiences.map((exp) => {
      const isAnon = exp.isAnonymous;
      const student = exp.studentId;
      return {
        ...exp,
        authorName: isAnon
          ? `Anonymous ${exp.batchYear || 2026} Graduate`
          : student
          ? `${student.firstName || ''} ${student.lastName || ''}`.trim()
          : 'Anonymous Graduate',
        hasUserUpvoted: exp.upvotes?.some(
          (uid) => uid.toString() === (req.user?.id || req.user?._id)?.toString()
        ),
      };
    });

    res.json({
      success: true,
      experiences: sanitized,
      total: sanitized.length,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch interview experiences.' } });
  }
};

/**
 * @desc    Submit an interview experience for moderation
 * @route   POST /api/interview-experiences
 * @access  Private (Student)
 */
exports.submitExperience = async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?._id;
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const {
      companyName,
      role,
      jobType = 'Full-time',
      batchYear = 2026,
      branch = 'Computer Science',
      overallDifficulty = 'Medium',
      outcome = 'Selected',
      rounds = [],
      preparationTips = '',
      isAnonymous = false,
    } = req.body;

    if (!companyName || !role) {
      return res.status(400).json({ error: { message: 'Company name and role are required.' } });
    }

    const experience = await InterviewExperience.create({
      studentId,
      collegeId,
      companyName: companyName.trim(),
      role: role.trim(),
      jobType,
      batchYear: Number(batchYear) || 2026,
      branch,
      overallDifficulty,
      outcome,
      rounds: rounds.length > 0 ? rounds : [
        {
          roundName: 'Technical Interview',
          roundType: 'Technical',
          durationMinutes: 45,
          questions: ['Explain projects on resume', 'Data structures problem'],
          difficulty: 'Medium',
        },
      ],
      preparationTips: preparationTips.trim(),
      isAnonymous: Boolean(isAnonymous),
      status: 'pending_review',
    });

    res.status(201).json({
      success: true,
      message: 'Interview experience submitted. It will be publicly published following TPO verification.',
      experience,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to submit experience.' } });
  }
};

/**
 * @desc    Toggle upvote on an interview experience
 * @route   POST /api/interview-experiences/:id/upvote
 * @access  Private
 */
exports.toggleUpvote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    const exp = await InterviewExperience.findById(id);
    if (!exp) {
      return res.status(404).json({ error: { message: 'Interview experience not found.' } });
    }

    const alreadyUpvoted = exp.upvotes.some((u) => u.toString() === userId.toString());

    if (alreadyUpvoted) {
      exp.upvotes = exp.upvotes.filter((u) => u.toString() !== userId.toString());
      exp.upvoteCount = Math.max(0, exp.upvoteCount - 1);
    } else {
      exp.upvotes.push(userId);
      exp.upvoteCount = (exp.upvoteCount || 0) + 1;
    }

    await exp.save();

    res.json({
      success: true,
      upvoted: !alreadyUpvoted,
      upvoteCount: exp.upvoteCount,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Upvote action failed.' } });
  }
};

/**
 * @desc    Get pending moderation queue for TPO
 * @route   GET /api/interview-experiences/moderation
 * @access  Private (TPO / Admin)
 */
exports.getModerationQueue = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const queue = await InterviewExperience.find({
      ...(collegeId ? { collegeId } : {}),
      status: 'pending_review',
    })
      .populate('studentId', 'firstName lastName email rollNo branch')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      queue,
      total: queue.length,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch queue.' } });
  }
};

/**
 * @desc    TPO approves or rejects an interview experience
 * @route   PATCH /api/interview-experiences/:id/moderate
 * @access  Private (TPO / Admin)
 */
exports.moderateExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, tpoReviewNote = '' } = req.body; // action: 'approve' | 'reject'
    const moderatedBy = req.user?.id || req.user?._id;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: { message: 'Action must be approve or reject.' } });
    }

    const exp = await InterviewExperience.findByIdAndUpdate(
      id,
      {
        $set: {
          status: action === 'approve' ? 'approved' : 'rejected',
          tpoReviewNote,
          moderatedBy,
          moderatedAt: new Date(),
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      message: `Interview experience ${action === 'approve' ? 'approved and published' : 'rejected'}.`,
      experience: exp,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Moderation failed.' } });
  }
};
