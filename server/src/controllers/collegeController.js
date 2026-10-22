const College = require('../models/College');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const { logAuditAction } = require('../utils/auditLogger');
const {
  createCollegeSchema,
  updateCollegeConfigSchema,
  updateFeatureFlagsSchema,
  inviteTpoSchema,
} = require('../validations/collegeValidation');

/**
 * @desc    Create a new college (Super Admin only)
 * @route   POST /api/colleges
 * @access  Private (Super Admin)
 */
exports.createCollege = async (req, res) => {
  try {
    const parseResult = createCollegeSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid college data provided',
          details: parseResult.error.issues,
        },
      });
    }

    const { code, name, ...rest } = parseResult.data;
    const upperCode = code.toUpperCase().trim();

    // Check code uniqueness
    const existing = await College.findOne({ code: upperCode });
    if (existing) {
      return res.status(409).json({
        error: {
          code: 'COLLEGE_CODE_EXISTS',
          message: `A college with code '${upperCode}' already exists`,
        },
      });
    }

    const college = await College.create({
      name: name.trim(),
      code: upperCode,
      ...rest,
    });

    await logAuditAction({
      req,
      collegeId: college._id,
      action: 'COLLEGE_CREATED',
      targetModel: 'College',
      targetId: college._id,
      afterState: college.toObject(),
    });

    return res.status(201).json(college);
  } catch (error) {
    console.error('createCollege error:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Internal server error while creating college',
      },
    });
  }
};

/**
 * @desc    Get all colleges with pagination & stats (Super Admin only)
 * @route   GET /api/colleges
 * @access  Private (Super Admin)
 */
exports.getColleges = async (req, res) => {
  try {
    const { q, status, plan, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (plan) filter.plan = plan;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } },
        { domains: { $regex: q, $options: 'i' } },
      ];
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const take = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [colleges, total] = await Promise.all([
      College.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(take)
        .lean(),
      College.countDocuments(filter),
    ]);

    // Attach basic student & drive counts for each college
    const collegeIds = colleges.map((c) => c._id);
    const [studentCounts, opportunityCounts] = await Promise.all([
      StudentProfile.aggregate([
        { $match: { collegeId: { $in: collegeIds } } },
        { $group: { _id: '$collegeId', count: { $sum: 1 } } },
      ]),
      Opportunity.aggregate([
        { $match: { collegeId: { $in: collegeIds } } },
        { $group: { _id: '$collegeId', count: { $sum: 1 } } },
      ]),
    ]);

    const studentMap = {};
    studentCounts.forEach((sc) => {
      studentMap[sc._id.toString()] = sc.count;
    });

    const oppMap = {};
    opportunityCounts.forEach((oc) => {
      oppMap[oc._id.toString()] = oc.count;
    });

    const enriched = colleges.map((col) => ({
      ...col,
      totalStudents: studentMap[col._id.toString()] || 0,
      totalOpportunities: oppMap[col._id.toString()] || 0,
    }));

    return res.json({
      colleges: enriched,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error('getColleges error:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Internal server error while fetching colleges',
      },
    });
  }
};

/**
 * @desc    Get public college details by code or domain (No auth needed)
 * @route   GET /api/colleges/public/:identifier
 * @access  Public
 */
exports.getPublicCollegeByCodeOrDomain = async (req, res) => {
  try {
    const { identifier } = req.params;
    if (!identifier) {
      return res.status(400).json({
        error: { code: 'INVALID_PARAM', message: 'College identifier is required' },
      });
    }

    const trimmed = identifier.trim();
    const college = await College.findOne({
      $or: [
        { code: trimmed.toUpperCase() },
        { domains: trimmed.toLowerCase() },
      ],
      status: 'Active',
    }).select('name code logo branding gradingSystem branches featureFlags academicYearConfig');

    if (!college) {
      return res.status(404).json({
        error: {
          code: 'COLLEGE_NOT_FOUND',
          message: `No active college found matching '${identifier}'`,
        },
      });
    }

    return res.json(college);
  } catch (error) {
    console.error('getPublicCollegeByCodeOrDomain error:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * @desc    Get college details by ID
 * @route   GET /api/colleges/:id
 * @access  Private (Super Admin or College TPO/Admin)
 */
exports.getCollegeById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check tenant permission: non-superadmin can only query their own college
    if (req.user.role !== 'superadmin' && req.tenant.collegeId !== id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You are not authorized to view another college’s profile',
        },
      });
    }

    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'College not found',
        },
      });
    }

    return res.json(college);
  } catch (error) {
    console.error('getCollegeById error:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * @desc    Update college configuration & branding
 * @route   PUT /api/colleges/:id/config
 * @access  Private (Super Admin or College TPO/Admin)
 */
exports.updateCollegeConfig = async (req, res) => {
  try {
    const { id } = req.params;

    // Authorization check
    if (req.user.role !== 'superadmin' && req.tenant.collegeId !== id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You are not authorized to modify configuration for this college',
        },
      });
    }

    const parseResult = updateCollegeConfigSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid configuration payload',
          details: parseResult.error.issues,
        },
      });
    }

    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'College not found' },
      });
    }

    const beforeState = college.toObject();
    const data = parseResult.data;

    if (data.name) college.name = data.name;
    if (data.domains) college.domains = data.domains;
    if (data.timezone) college.timezone = data.timezone;
    if (data.branches) college.branches = data.branches;
    if (data.gradingSystem) {
      college.gradingSystem = { ...college.gradingSystem.toObject(), ...data.gradingSystem };
    }
    if (data.policies) {
      college.policies = { ...college.policies.toObject(), ...data.policies };
    }
    if (data.academicYearConfig) {
      college.academicYearConfig = { ...college.academicYearConfig.toObject(), ...data.academicYearConfig };
    }
    if (data.branding) {
      college.branding = { ...college.branding.toObject(), ...data.branding };
    }
    if (data.status && req.user.role === 'superadmin') {
      college.status = data.status;
    }

    await college.save();

    await logAuditAction({
      req,
      collegeId: college._id,
      action: 'COLLEGE_CONFIG_UPDATED',
      targetModel: 'College',
      targetId: college._id,
      beforeState,
      afterState: college.toObject(),
    });

    return res.json(college);
  } catch (error) {
    console.error('updateCollegeConfig error:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * @desc    Toggle feature flags for a college (Super Admin only)
 * @route   PUT /api/colleges/:id/features
 * @access  Private (Super Admin)
 */
exports.updateFeatureFlags = async (req, res) => {
  try {
    const { id } = req.params;

    const parseResult = updateFeatureFlagsSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid feature flags payload',
          details: parseResult.error.issues,
        },
      });
    }

    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'College not found' },
      });
    }

    const beforeState = college.featureFlags.toObject();
    college.featureFlags = { ...college.featureFlags.toObject(), ...parseResult.data };
    await college.save();

    await logAuditAction({
      req,
      collegeId: college._id,
      action: 'FEATURE_FLAGS_UPDATED',
      targetModel: 'College',
      targetId: college._id,
      beforeState,
      afterState: college.featureFlags.toObject(),
    });

    return res.json(college.featureFlags);
  } catch (error) {
    console.error('updateFeatureFlags error:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * @desc    Provision first TPO for a newly registered college
 * @route   POST /api/colleges/:id/tpo-invite
 * @access  Private (Super Admin)
 */
exports.inviteInitialTpo = async (req, res) => {
  try {
    const { id } = req.params;

    const parseResult = inviteTpoSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid TPO credentials provided',
          details: parseResult.error.issues,
        },
      });
    }

    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'College not found' },
      });
    }

    const { firstName, lastName, email, password } = parseResult.data;

    // Check if user already exists for this college
    const existingUser = await User.findOne({
      collegeId: college._id,
      email: email.toLowerCase().trim(),
    }).setOptions({ bypassTenantFilter: true });

    if (existingUser) {
      return res.status(409).json({
        error: {
          code: 'USER_EXISTS',
          message: `User with email '${email}' already exists in ${college.name}`,
        },
      });
    }

    const tpoUser = await User.create({
      collegeId: college._id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'tpo',
      isVerified: true,
    });

    await logAuditAction({
      req,
      collegeId: college._id,
      action: 'TPO_PROVISIONED',
      targetModel: 'User',
      targetId: tpoUser._id,
      afterState: { email: tpoUser.email, role: tpoUser.role },
    });

    return res.status(201).json({
      message: `TPO successfully provisioned for ${college.name}`,
      user: {
        _id: tpoUser._id,
        firstName: tpoUser.firstName,
        lastName: tpoUser.lastName,
        email: tpoUser.email,
        role: tpoUser.role,
        collegeId: tpoUser.collegeId,
      },
    });
  } catch (error) {
    console.error('inviteInitialTpo error:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
      },
    });
  }
};

/**
 * @desc    Get detailed usage statistics for a college
 * @route   GET /api/colleges/:id/stats
 * @access  Private (Super Admin or College TPO/Admin)
 */
exports.getCollegeStats = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'superadmin' && req.tenant.collegeId !== id) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Not authorized for this college' },
      });
    }

    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'College not found' },
      });
    }

    const [
      totalStudents,
      verifiedStudents,
      totalOpportunities,
      activeOpportunities,
      totalApplications,
      placedCount,
    ] = await Promise.all([
      StudentProfile.countDocuments({ collegeId: college._id }).setOptions({ bypassTenantFilter: true }),
      StudentProfile.countDocuments({ collegeId: college._id, isVerifiedByTPO: true }).setOptions({ bypassTenantFilter: true }),
      Opportunity.countDocuments({ collegeId: college._id }).setOptions({ bypassTenantFilter: true }),
      Opportunity.countDocuments({ collegeId: college._id, status: 'Open' }).setOptions({ bypassTenantFilter: true }),
      Application.countDocuments({ collegeId: college._id }).setOptions({ bypassTenantFilter: true }),
      Application.countDocuments({
        collegeId: college._id,
        status: { $in: ['Offer Extended', 'Hired', 'Placed'] },
      }).setOptions({ bypassTenantFilter: true }),
    ]);

    return res.json({
      college: {
        _id: college._id,
        name: college.name,
        code: college.code,
        plan: college.plan,
        status: college.status,
      },
      stats: {
        totalStudents,
        verifiedStudents,
        unverifiedStudents: totalStudents - verifiedStudents,
        verificationRate: totalStudents > 0 ? Math.round((verifiedStudents / totalStudents) * 100) : 0,
        totalOpportunities,
        activeOpportunities,
        totalApplications,
        placedCount,
      },
    });
  } catch (error) {
    console.error('getCollegeStats error:', error);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
      },
    });
  }
};
