const mongoose = require('mongoose');
const College = require('../models/College');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');

/**
 * @desc    Get college placement settings, policies, branches, and team members
 * @route   GET /api/tpo/settings
 * @access  Private (TPO / SuperAdmin)
 */
exports.getSettings = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    if (!collegeId) {
      return res.status(400).json({ error: { message: 'Tenant college context is required.' } });
    }

    const college = await College.findById(collegeId).lean();
    if (!college) {
      return res.status(404).json({ error: { message: 'College profile not found.' } });
    }

    // Fetch placement team members
    const teamMembers = await User.find({
      collegeId,
      role: { $in: ['tpo', 'admin', 'coordinator'] },
    })
      .select('firstName lastName email role createdAt')
      .lean();

    res.json({
      success: true,
      college: {
        id: college._id,
        name: college.name,
        code: college.code,
        logo: college.logo,
        timezone: college.timezone,
        academicYearConfig: college.academicYearConfig,
        branches: college.branches || [],
        gradingSystem: college.gradingSystem,
        policies: college.policies,
        featureFlags: college.featureFlags,
        branding: college.branding,
      },
      teamMembers,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch settings.' } });
  }
};

/**
 * @desc    Update college placement policies and thresholds
 * @route   PUT /api/tpo/settings/policies
 * @access  Private (TPO / SuperAdmin)
 */
exports.updatePolicies = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const {
      maxActiveBacklogsAllowed,
      allowMultipleOffers,
      dreamTierThreshold,
      rules,
      minPassCgpa,
      gradingScale,
      academicYearConfig,
    } = req.body;

    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ error: { message: 'College not found.' } });
    }

    if (maxActiveBacklogsAllowed !== undefined) {
      college.policies.maxActiveBacklogsAllowed = Math.max(0, parseInt(maxActiveBacklogsAllowed, 10));
    }
    if (allowMultipleOffers !== undefined) {
      college.policies.allowMultipleOffers = Boolean(allowMultipleOffers);
    }
    if (dreamTierThreshold !== undefined) {
      college.policies.dreamTierThreshold = Math.max(0, parseFloat(dreamTierThreshold));
    }
    if (Array.isArray(rules)) {
      college.policies.rules = rules.map((r) => String(r).trim()).filter(Boolean);
    }
    if (minPassCgpa !== undefined) {
      college.gradingSystem.minPassCgpa = parseFloat(minPassCgpa);
    }
    if (gradingScale) {
      college.gradingSystem.scale = gradingScale;
    }
    if (academicYearConfig) {
      college.academicYearConfig = {
        ...college.academicYearConfig,
        ...academicYearConfig,
      };
    }

    await college.save();

    await AuditLog.create({
      collegeId,
      performedBy: req.user?.id || req.user?._id,
      action: 'SETTINGS_POLICIES_UPDATED',
      targetModel: 'College',
      targetId: college._id,
      details: {
        maxBacklogs: college.policies.maxActiveBacklogsAllowed,
        multipleOffers: college.policies.allowMultipleOffers,
        dreamThreshold: college.policies.dreamTierThreshold,
      },
    });

    res.json({
      success: true,
      message: 'Placement operational policies updated successfully.',
      policies: college.policies,
      gradingSystem: college.gradingSystem,
      academicYearConfig: college.academicYearConfig,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to update policies.' } });
  }
};

/**
 * @desc    Update institutional engineering branches and departments list
 * @route   PUT /api/tpo/settings/branches
 * @access  Private (TPO / SuperAdmin)
 */
exports.updateBranches = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { branches } = req.body;

    if (!Array.isArray(branches) || branches.length === 0) {
      return res.status(400).json({ error: { message: 'At least one branch is required.' } });
    }

    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ error: { message: 'College not found.' } });
    }

    college.branches = branches.map((b) => String(b).trim()).filter(Boolean);
    await college.save();

    await AuditLog.create({
      collegeId,
      performedBy: req.user?.id || req.user?._id,
      action: 'SETTINGS_BRANCHES_UPDATED',
      targetModel: 'College',
      targetId: college._id,
      details: { branchCount: college.branches.length },
    });

    res.json({
      success: true,
      message: 'Institutional branches updated successfully.',
      branches: college.branches,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to update branches.' } });
  }
};

/**
 * @desc    Add or invite a new TPO staff member / coordinator
 * @route   POST /api/tpo/settings/team
 * @access  Private (TPO / SuperAdmin)
 */
exports.addTeamMember = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { firstName, lastName, email, role = 'coordinator', password } = req.body;

    if (!firstName || !email) {
      return res.status(400).json({ error: { message: 'First name and email are required.' } });
    }

    const allowedRoles = ['tpo', 'admin', 'coordinator'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: { message: 'Invalid team role.' } });
    }

    // Check duplicate email in this college
    const existing = await User.findOne({
      collegeId,
      email: email.trim().toLowerCase(),
    });
    if (existing) {
      return res.status(400).json({ error: { message: 'User with this email already exists in this college.' } });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'PlaceEarly@2026', salt);

    const newUser = await User.create({
      collegeId,
      firstName: firstName.trim(),
      lastName: (lastName || '').trim(),
      email: email.trim().toLowerCase(),
      role,
      password: hashedPassword,
    });

    await AuditLog.create({
      collegeId,
      performedBy: req.user?.id || req.user?._id,
      action: 'TEAM_MEMBER_INVITED',
      targetModel: 'User',
      targetId: newUser._id,
      details: { email: newUser.email, role: newUser.role },
    });

    res.status(201).json({
      success: true,
      message: `Staff member ${newUser.firstName} added as ${newUser.role}.`,
      member: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to add team member.' } });
  }
};

/**
 * @desc    Update notification templates
 * @route   PUT /api/tpo/settings/templates
 * @access  Private (TPO / SuperAdmin)
 */
exports.updateTemplates = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const templates = req.body;

    await AuditLog.create({
      collegeId,
      performedBy: req.user?.id || req.user?._id,
      action: 'SETTINGS_TEMPLATES_UPDATED',
      targetModel: 'College',
      details: { templateCount: Object.keys(templates || {}).length },
    });

    res.json({
      success: true,
      message: 'Notification templates saved successfully.',
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to update templates.' } });
  }
};
