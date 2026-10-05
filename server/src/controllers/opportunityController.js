const Opportunity = require('../models/Opportunity');
const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');

// @desc    Get all opportunities (Students see Open, TPOs see all)
// @route   GET /api/opportunities
exports.getOpportunities = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.status = 'Open';
    }
    const opportunities = await Opportunity.find(query).sort({ createdAt: -1 });
    res.status(200).json(opportunities);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Create new opportunity
// @route   POST /api/opportunities
exports.createOpportunity = async (req, res) => {
  try {
    const { title, companyName, companyLogo, type, location, salary, description, eligibilityRules, deadline } = req.body;
    
    const opportunity = new Opportunity({
      title,
      companyName,
      companyLogo,
      type,
      location,
      salary,
      description,
      eligibilityRules,
      deadline,
      createdBy: req.user.userId
    });

    await opportunity.save();
    res.status(201).json(opportunity);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Apply to an opportunity
// @route   POST /api/opportunities/:id/apply
exports.applyToOpportunity = async (req, res) => {
  try {
    const opportunityId = req.params.id;
    const studentId = req.user.userId;

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });

    // Check Eligibility Engine
    const profile = await StudentProfile.findOne({ userId: studentId });
    if (!profile) return res.status(400).json({ message: 'Please complete your student profile first' });
    if (!profile.isVerified) return res.status(400).json({ message: 'Profile must be verified by TPO before applying' });

    const rules = opportunity.eligibilityRules;
    if (rules.minCgpa && profile.academicInfo.cgpa < rules.minCgpa) {
      return res.status(400).json({ message: 'Not eligible: CGPA requirement not met' });
    }
    if (rules.maxBacklogs !== undefined && profile.academicInfo.activeBacklogs > rules.maxBacklogs) {
      return res.status(400).json({ message: 'Not eligible: Too many active backlogs' });
    }
    if (rules.allowedBranches && rules.allowedBranches.length > 0 && !rules.allowedBranches.includes(profile.academicInfo.branch)) {
      return res.status(400).json({ message: 'Not eligible: Branch not allowed' });
    }

    // Create Application
    const application = new Application({
      studentId,
      opportunityId
    });

    await application.save();
    res.status(201).json({ message: 'Successfully applied!', application });

  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'You have already applied to this opportunity' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Get my applications (Student)
// @route   GET /api/opportunities/applications/me
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.user.userId })
                                          .populate('opportunityId')
                                          .sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
