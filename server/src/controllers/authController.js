const User = require('../models/User');
const College = require('../models/College');
const jwt = require('jsonwebtoken');
const { logAuditAction } = require('../utils/auditLogger');

// Generate JWT with tenant context embedded
const generateToken = (id, role, collegeId) => {
  return jwt.sign(
    {
      id,
      userId: id,
      role,
      collegeId: collegeId ? collegeId.toString() : null,
    },
    process.env.JWT_SECRET || 'fallback_secret',
    {
      expiresIn: '30d',
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, collegeCode, collegeId } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'First name, last name, email, and password are required',
        },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const assignedRole = role || 'student';

    let targetCollege = null;

    if (assignedRole !== 'superadmin') {
      if (collegeId) {
        targetCollege = await College.findById(collegeId);
      } else if (collegeCode) {
        targetCollege = await College.findOne({ code: collegeCode.toUpperCase().trim() });
      } else if (req.tenant?.collegeId) {
        targetCollege = await College.findById(req.tenant.collegeId);
      } else {
        // Attempt domain auto-match
        const emailDomain = normalizedEmail.split('@')[1];
        if (emailDomain) {
          targetCollege = await College.findOne({ domains: emailDomain });
        }
      }

      if (!targetCollege) {
        // Fallback to default college if one exists
        targetCollege = await College.findOne({ code: 'DEFAULT' });
      }

      if (!targetCollege) {
        return res.status(400).json({
          error: {
            code: 'COLLEGE_REQUIRED',
            message: 'College identification (collegeCode or valid institutional email domain) is required',
          },
        });
      }
    }

    const resolvedCollegeId = targetCollege ? targetCollege._id : null;

    // Check if user already exists within this college tenant
    const query = { email: normalizedEmail };
    if (resolvedCollegeId) {
      query.collegeId = resolvedCollegeId;
    }

    const userExists = await User.findOne(query).setOptions({ bypassTenantFilter: true });
    if (userExists) {
      return res.status(400).json({
        error: {
          code: 'USER_EXISTS',
          message: 'A user with this email already exists in this institution',
        },
      });
    }

    const user = await User.create({
      collegeId: resolvedCollegeId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password,
      role: assignedRole,
    });

    await logAuditAction({
      collegeId: resolvedCollegeId,
      actorId: user._id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'USER_REGISTERED',
      targetModel: 'User',
      targetId: user._id,
      afterState: { email: user.email, role: user.role, collegeId: resolvedCollegeId },
    });

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId,
      college: targetCollege ? {
        _id: targetCollege._id,
        name: targetCollege.name,
        code: targetCollege.code,
        logo: targetCollege.logo,
        branding: targetCollege.branding,
        featureFlags: targetCollege.featureFlags,
        gradingSystem: targetCollege.gradingSystem,
        branches: targetCollege.branches,
      } : null,
      token: generateToken(user._id, user.role, user.collegeId),
    });
  } catch (error) {
    console.error('registerUser error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Internal server error during registration',
      },
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password, collegeCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required',
        },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = null;

    if (collegeCode) {
      const college = await College.findOne({ code: collegeCode.toUpperCase().trim() });
      if (!college) {
        return res.status(404).json({
          error: {
            code: 'COLLEGE_NOT_FOUND',
            message: `No college found with code '${collegeCode}'`,
          },
        });
      }
      user = await User.findOne({
        collegeId: college._id,
        email: normalizedEmail,
      }).setOptions({ bypassTenantFilter: true });
    } else {
      const matchingUsers = await User.find({ email: normalizedEmail }).setOptions({ bypassTenantFilter: true });

      if (matchingUsers.length === 1) {
        user = matchingUsers[0];
      } else if (matchingUsers.length > 1) {
        return res.status(400).json({
          error: {
            code: 'MULTIPLE_INSTITUTIONS_FOUND',
            message: 'Your email is registered with multiple institutions. Please provide your collegeCode to sign in.',
          },
        });
      }
    }

    if (user && (await user.matchPassword(password))) {
      let college = null;
      if (user.collegeId) {
        college = await College.findById(user.collegeId);
      }

      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        collegeId: user.collegeId,
        college: college ? {
          _id: college._id,
          name: college.name,
          code: college.code,
          logo: college.logo,
          branding: college.branding,
          featureFlags: college.featureFlags,
          gradingSystem: college.gradingSystem,
          branches: college.branches,
        } : null,
        token: generateToken(user._id, user.role, user.collegeId),
      });
    } else {
      res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }
  } catch (error) {
    console.error('loginUser error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Internal server error during login',
      },
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User profile not found',
        },
      });
    }

    let college = null;
    if (user.collegeId) {
      college = await College.findById(user.collegeId);
    }

    res.json({
      ...user.toObject(),
      college: college ? {
        _id: college._id,
        name: college.name,
        code: college.code,
        logo: college.logo,
        branding: college.branding,
        featureFlags: college.featureFlags,
        gradingSystem: college.gradingSystem,
        branches: college.branches,
        academicYearConfig: college.academicYearConfig,
        policies: college.policies,
      } : null,
    });
  } catch (error) {
    console.error('getUserProfile error:', error);
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: error.message || 'Failed to fetch user profile',
      },
    });
  }
};
