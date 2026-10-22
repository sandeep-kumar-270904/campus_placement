const crypto = require('crypto');
const User = require('../models/User');
const College = require('../models/College');
const Company = require('../models/Company');
const Opportunity = require('../models/Opportunity');
const jwt = require('jsonwebtoken');
const { logAuditAction } = require('../utils/auditLogger');

// Generate JWT with tenant context embedded
const generateToken = (id, role, collegeId, companyId) => {
  return jwt.sign(
    {
      id,
      userId: id,
      role,
      collegeId: collegeId ? collegeId.toString() : null,
      companyId: companyId ? companyId.toString() : null,
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
        companyId: user.companyId || null,
        companyName: user.companyName || '',
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
        token: generateToken(user._id, user.role, user.collegeId, user.companyId),
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
      companyId: user.companyId || null,
      companyName: user.companyName || '',
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

// @desc    Invite recruiter by email
// @route   POST /api/auth/invite-recruiter
// @access  Private (TPO / Admin)
exports.inviteRecruiter = async (req, res) => {
  try {
    const { email, firstName = 'Recruiter', lastName = '', companyId, companyName, driveIds = [] } = req.body;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    if (!email) {
      return res.status(400).json({ error: { message: 'Recruiter email is required.' } });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let company = null;
    if (companyId) {
      company = await Company.findById(companyId);
    } else if (companyName) {
      company = await Company.findOne({
        ...(collegeId ? { collegeId } : {}),
        name: new RegExp(`^${companyName.trim()}$`, 'i'),
      });
      if (!company) {
        company = await Company.create({
          collegeId,
          name: companyName.trim(),
          status: 'invited',
        });
      }
    }

    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    let user = await User.findOne({
      ...(collegeId ? { collegeId } : {}),
      email: normalizedEmail,
    }).setOptions({ bypassTenantFilter: true });

    if (user) {
      user.role = 'recruiter';
      user.isInvited = true;
      user.inviteToken = inviteToken;
      user.inviteExpiresAt = inviteExpiresAt;
      if (company) {
        user.companyId = company._id;
        user.companyName = company.name;
      }
      await user.save();
    } else {
      const tempPass = crypto.randomBytes(16).toString('hex');
      user = await User.create({
        collegeId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        password: tempPass,
        role: 'recruiter',
        isInvited: true,
        inviteToken,
        inviteExpiresAt,
        companyId: company ? company._id : null,
        companyName: company ? company.name : (companyName || ''),
      });
    }

    // Associate recruiter with specified driveIds
    if (Array.isArray(driveIds) && driveIds.length > 0) {
      await Opportunity.updateMany(
        { _id: { $in: driveIds } },
        { $addToSet: { invitedRecruiterIds: user._id } }
      );
    }

    // If company exists, also associate with all active drives for that company
    if (company) {
      await Opportunity.updateMany(
        {
          ...(collegeId ? { collegeId } : {}),
          $or: [{ companyId: company._id }, { companyName: new RegExp(`^${company.name}$`, 'i') }],
        },
        { $addToSet: { invitedRecruiterIds: user._id } }
      );
    }

    await logAuditAction({
      collegeId,
      actorId: req.user.id || req.user.userId,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      action: 'RECRUITER_INVITED',
      targetModel: 'User',
      targetId: user._id,
      details: {
        recruiterEmail: normalizedEmail,
        companyName: user.companyName,
        driveIds,
      },
    });

    const inviteUrl = `/recruiter/accept-invite?token=${inviteToken}`;

    res.status(201).json({
      success: true,
      message: `Invitation issued for ${normalizedEmail}.`,
      inviteToken,
      inviteUrl,
      user: {
        id: user._id,
        email: user.email,
        companyName: user.companyName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('inviteRecruiter error:', error);
    res.status(500).json({ error: { message: error.message || 'Failed to invite recruiter.' } });
  }
};

// @desc    Validate recruiter invite token
// @route   GET /api/auth/invite/:token
// @access  Public
exports.validateInviteToken = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ error: { message: 'Invite token is required.' } });
    }

    const user = await User.findOne({
      inviteToken: token,
      inviteExpiresAt: { $gt: new Date() },
    }).setOptions({ bypassTenantFilter: true });

    if (!user) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INVITE_TOKEN',
          message: 'Invitation link is invalid, expired, or has already been used.',
        },
      });
    }

    const college = user.collegeId ? await College.findById(user.collegeId) : null;

    res.json({
      success: true,
      valid: true,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      companyName: user.companyName,
      collegeName: college ? college.name : 'Partner University',
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to validate invite token.' } });
  }
};

// @desc    Set password for invited recruiter
// @route   POST /api/auth/set-password
// @access  Public
exports.setPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: { message: 'Token and new password are required.' } });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: { message: 'Password must be at least 6 characters long.' } });
    }

    const user = await User.findOne({
      inviteToken: token,
      inviteExpiresAt: { $gt: new Date() },
    }).setOptions({ bypassTenantFilter: true });

    if (!user) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INVITE_TOKEN',
          message: 'Invitation link is invalid or expired.',
        },
      });
    }

    user.password = password;
    user.inviteToken = null;
    user.inviteExpiresAt = null;
    user.isInvited = false;
    user.isVerified = true;
    await user.save();

    const college = user.collegeId ? await College.findById(user.collegeId) : null;

    res.json({
      success: true,
      message: 'Password set successfully! Welcome to the Recruiter Portal.',
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      companyName: user.companyName,
      collegeId: user.collegeId,
      college: college ? {
        _id: college._id,
        name: college.name,
        code: college.code,
        branding: college.branding,
      } : null,
      token: generateToken(user._id, user.role, user.collegeId, user.companyId),
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to set password.' } });
  }
};
