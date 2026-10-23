const ExternalOutcome = require('../models/ExternalOutcome');
const StudentProfile = require('../models/StudentProfile');

/**
 * @desc    Student self-reports off-campus, higher studies, or entrepreneurship outcome
 * @route   POST /api/external-outcomes
 * @access  Private (Student)
 */
exports.submitOutcome = async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?._id;
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { category, offCampusDetails, higherStudiesDetails, entrepreneurshipDetails } = req.body;

    if (!['Off-Campus Placement', 'Higher Studies', 'Entrepreneurship'].includes(category)) {
      return res.status(400).json({ error: { message: 'Invalid outcome category.' } });
    }

    const outcome = await ExternalOutcome.create({
      studentId,
      collegeId,
      category,
      offCampusDetails: offCampusDetails || {},
      higherStudiesDetails: higherStudiesDetails || {},
      entrepreneurshipDetails: entrepreneurshipDetails || {},
      verificationStatus: 'pending',
    });

    res.status(201).json({
      success: true,
      message: `Self-reported ${category} submitted. Pending TPO verification for institutional accreditation record.`,
      outcome,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Submission failed.' } });
  }
};

/**
 * @desc    Get current user's self-reported outcomes
 * @route   GET /api/external-outcomes/my-outcomes
 * @access  Private (Student)
 */
exports.getMyOutcomes = async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?._id;
    const outcomes = await ExternalOutcome.find({ studentId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      outcomes,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch outcomes.' } });
  }
};

/**
 * @desc    Get TPO verification queue for pending external outcomes
 * @route   GET /api/external-outcomes/tpo/queue
 * @access  Private (TPO / Admin)
 */
exports.getVerificationQueue = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { status = 'pending', category } = req.query;

    const query = {
      ...(collegeId ? { collegeId } : {}),
      verificationStatus: status,
    };
    if (category) query.category = category;

    const queue = await ExternalOutcome.find(query)
      .populate('studentId', 'firstName lastName email rollNo branch gradYear')
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
 * @desc    TPO verifies or rejects an external outcome
 * @route   PATCH /api/external-outcomes/tpo/verify/:id
 * @access  Private (TPO / Admin)
 */
exports.verifyOutcome = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason = '' } = req.body; // action: 'approve' | 'reject'
    const verifiedBy = req.user?.id || req.user?._id;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: { message: 'Action must be approve or reject.' } });
    }

    const outcome = await ExternalOutcome.findByIdAndUpdate(
      id,
      {
        $set: {
          verificationStatus: action === 'approve' ? 'verified' : 'rejected',
          rejectionReason: action === 'reject' ? rejectionReason : '',
          verifiedBy,
          verifiedAt: new Date(),
        },
      },
      { new: true }
    );

    // If verified off-campus placement, update student profile isPlaced
    if (action === 'approve' && outcome.category === 'Off-Campus Placement') {
      await StudentProfile.findOneAndUpdate(
        { user: outcome.studentId },
        {
          $set: {
            isPlaced: true,
            placedCompany: `${outcome.offCampusDetails?.companyName || 'Off-Campus'} (Off-Campus)`,
            placedPackage: outcome.offCampusDetails?.ctcLpa || 6.5,
          },
        }
      );
    }

    res.json({
      success: true,
      message: `Outcome ${action === 'approve' ? 'verified and integrated into NAAC/NIRF reporting' : 'rejected'}.`,
      outcome,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Verification failed.' } });
  }
};

/**
 * @desc    Get aggregate statistics of verified outcomes
 * @route   GET /api/external-outcomes/stats
 * @access  Private
 */
exports.getOutcomeStats = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const query = {
      ...(collegeId ? { collegeId } : {}),
      verificationStatus: 'verified',
    };

    const verified = await ExternalOutcome.find(query).lean();

    const offCampus = verified.filter((v) => v.category === 'Off-Campus Placement');
    const higherStudies = verified.filter((v) => v.category === 'Higher Studies');
    const entrepreneurship = verified.filter((v) => v.category === 'Entrepreneurship');

    res.json({
      success: true,
      stats: {
        totalVerifiedOutcomes: verified.length,
        offCampusCount: offCampus.length,
        higherStudiesCount: higherStudies.length,
        entrepreneurshipCount: entrepreneurship.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch stats.' } });
  }
};
