const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const College = require('../models/College');
const Company = require('../models/Company');
const Opportunity = require('../models/Opportunity');
const Session = require('../models/Session');
const { getJwtSecret } = require('../middleware/authMiddleware');
const { logAuditAction } = require('../utils/auditLogger');

// Generate 15-minute short-lived access token
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      userId: user._id || user.id,
      role: user.role,
      department: user.department || null,
      collegeId: user.collegeId ? user.collegeId.toString() : null,
      companyId: user.companyId ? user.companyId.toString() : null,
    },
    getJwtSecret(),
    {
      expiresIn: '15m',
    }
  );
};
exports.generateAccessToken = generateAccessToken;

// Helper: parse basic device info from user-agent string
const parseDeviceInfo = (userAgent = '') => {
  let browser = 'Desktop Browser';
  if (/mobile/i.test(userAgent)) browser = 'Mobile Browser';
  else if (/chrome/i.test(userAgent)) browser = 'Chrome';
  else if (/firefox/i.test(userAgent)) browser = 'Firefox';
  else if (/safari/i.test(userAgent)) browser = 'Safari';
  else if (/edge/i.test(userAgent)) browser = 'Edge';

  let os = 'Windows / Linux';
  if (/macintosh|mac os x/i.test(userAgent)) os = 'macOS';
  else if (/android/i.test(userAgent)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(userAgent)) os = 'iOS';
  else if (/windows/i.test(userAgent)) os = 'Windows';

  return {
    browser,
    os,
    device: /mobile/i.test(userAgent) ? 'Mobile' : 'Desktop',
  };
};

// Create a new session with rotating refresh token
const createSessionAndRefreshToken = async (user, req) => {
  const rawToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const family = crypto.randomUUID();
  const userAgent = req?.headers?.['user-agent'] || '';
  const ipAddress = req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';

  const session = await Session.create({
    userId: user._id || user.id,
    collegeId: user.collegeId || null,
    tokenHash,
    family,
    isRevoked: false,
    deviceInfo: parseDeviceInfo(userAgent),
    ipAddress,
    userAgent,
    lastActiveAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  return { rawToken, session };
};

// Helper to set httpOnly, secure cookie for refresh token
const setRefreshTokenCookie = (res, rawToken) => {
  res.cookie('refreshToken', rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, department, collegeCode, collegeId } = req.body;

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
        const emailDomain = normalizedEmail.split('@')[1];
        if (emailDomain) {
          targetCollege = await College.findOne({ domains: emailDomain });
        }
      }

      if (!targetCollege) {
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
      department: department ? department.trim() : null,
    });

    const accessToken = generateAccessToken(user);
    const { rawToken } = await createSessionAndRefreshToken(user, req);
    setRefreshTokenCookie(res, rawToken);

    await logAuditAction({
      req,
      collegeId: resolvedCollegeId,
      actorId: user._id,
      actor: user.email,
      role: user.role,
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: user._id.toString(),
      after: { email: user.email, role: user.role, collegeId: resolvedCollegeId },
    });

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      department: user.department || null,
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
      token: accessToken,
      refreshToken: rawToken,
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

// @desc    Authenticate user & get token with session
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

      const accessToken = generateAccessToken(user);
      const { rawToken } = await createSessionAndRefreshToken(user, req);
      setRefreshTokenCookie(res, rawToken);

      await logAuditAction({
        req,
        collegeId: user.collegeId,
        actorId: user._id,
        actor: user.email,
        role: user.role,
        action: 'LOGIN_SUCCESS',
        entity: 'User',
        entityId: user._id.toString(),
        after: { email: user.email, role: user.role },
      });

      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department || null,
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
        token: accessToken,
        refreshToken: rawToken,
      });
    } else {
      // Record failed login audit attempt
      await logAuditAction({
        req,
        actor: normalizedEmail,
        role: 'unauthenticated',
        action: 'LOGIN_FAILED',
        entity: 'User',
        before: { email: normalizedEmail },
      });

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

// @desc    Refresh access token with rotation and reuse detection
// @route   POST /api/auth/refresh
// @access  Public (via cookie or body)
exports.refreshAccessToken = async (req, res) => {
  try {
    const rawToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!rawToken) {
      return res.status(401).json({
        error: {
          code: 'REFRESH_TOKEN_REQUIRED',
          message: 'No refresh token provided in cookie or payload.',
        },
      });
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const session = await Session.findOne({ tokenHash });

    if (!session) {
      return res.status(401).json({
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Session token does not exist or has already been pruned.',
        },
      });
    }

    // Token Reuse Detection
    if (session.isRevoked) {
      // Invalidate the entire token family
      await Session.updateMany({ family: session.family }, { isRevoked: true });

      await logAuditAction({
        req,
        collegeId: session.collegeId,
        actorId: session.userId,
        actor: 'security-monitor',
        role: 'system',
        action: 'TOKEN_REUSE_DETECTED',
        entity: 'Session',
        entityId: session.family,
        before: { family: session.family, reusedSessionId: session._id },
      });

      res.clearCookie('refreshToken', { path: '/api/auth' });
      return res.status(401).json({
        error: {
          code: 'TOKEN_REUSE_DETECTED',
          message: 'Suspicious token reuse detected. All sessions in this family have been terminated for security.',
        },
      });
    }

    // Check expiration
    if (new Date() > new Date(session.expiresAt)) {
      session.isRevoked = true;
      await session.save();
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return res.status(401).json({
        error: {
          code: 'REFRESH_TOKEN_EXPIRED',
          message: 'Refresh token has expired. Please sign in again.',
        },
      });
    }

    // Token is valid: Rotate token in the same family
    session.isRevoked = true; // Mark current token consumed
    await session.save();

    const user = await User.findById(session.userId);
    if (!user) {
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return res.status(401).json({
        error: { code: 'USER_NOT_FOUND', message: 'User account no longer exists.' },
      });
    }

    const newRawToken = crypto.randomBytes(40).toString('hex');
    const newTokenHash = crypto.createHash('sha256').update(newRawToken).digest('hex');

    const newSession = await Session.create({
      userId: user._id,
      collegeId: user.collegeId,
      tokenHash: newTokenHash,
      family: session.family, // Preserve rotation family
      isRevoked: false,
      deviceInfo: session.deviceInfo,
      ipAddress: req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || session.ipAddress,
      userAgent: req?.headers?.['user-agent'] || session.userAgent,
      lastActiveAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const newAccessToken = generateAccessToken(user);
    setRefreshTokenCookie(res, newRawToken);

    res.json({
      token: newAccessToken,
      refreshToken: newRawToken,
      expiresIn: 900, // 15 minutes
    });
  } catch (error) {
    console.error('refreshAccessToken error:', error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Failed to refresh authentication token.' },
    });
  }
};

// @desc    Logout user and revoke active session
// @route   POST /api/auth/logout
// @access  Public / Private
exports.logoutUser = async (req, res) => {
  try {
    const rawToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (rawToken) {
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      await Session.updateOne({ tokenHash }, { isRevoked: true });
    }

    res.clearCookie('refreshToken', { path: '/api/auth' });

    if (req.user) {
      await logAuditAction({
        req,
        actorId: req.user.id,
        actor: req.user.email,
        role: req.user.role,
        action: 'LOGOUT',
        entity: 'User',
        entityId: req.user.id.toString(),
      });
    }

    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to log out.' } });
  }
};

// @desc    Forgot Password - Request 30-minute single-use reset token
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email, collegeCode } = req.body;
    if (!email) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Email address is required.' },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let query = { email: normalizedEmail };

    if (collegeCode) {
      const college = await College.findOne({ code: collegeCode.toUpperCase().trim() });
      if (college) query.collegeId = college._id;
    }

    const user = await User.findOne(query).setOptions({ bypassTenantFilter: true });

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      await user.save();

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

      await logAuditAction({
        req,
        collegeId: user.collegeId,
        actorId: user._id,
        actor: user.email,
        role: user.role,
        action: 'PASSWORD_RESET_REQUESTED',
        entity: 'User',
        entityId: user._id.toString(),
      });

      // Response includes resetToken in non-production for automated testing and manual verification
      return res.json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been dispatched. The link expires in 30 minutes.',
        ...(process.env.NODE_ENV !== 'production' ? { resetUrl, resetToken: rawToken } : {}),
      });
    }

    // Do not reveal email non-existence
    return res.json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been dispatched. The link expires in 30 minutes.',
    });
  } catch (error) {
    console.error('forgotPassword error:', error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Failed to process password reset request.' },
    });
  }
};

// @desc    Reset password using single-use 30-minute token
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Reset token and new password are required.' },
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 6 characters long.' },
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).setOptions({ bypassTenantFilter: true });

    if (!user) {
      return res.status(400).json({
        error: {
          code: 'INVALID_OR_EXPIRED_TOKEN',
          message: 'Password reset link is invalid, expired, or has already been used.',
        },
      });
    }

    // Single-use: Clear reset token immediately and set new password (cost 12 hashed via pre-save)
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Revoke all existing active sessions for security
    await Session.updateMany({ userId: user._id }, { isRevoked: true });

    await logAuditAction({
      req,
      collegeId: user.collegeId,
      actorId: user._id,
      actor: user.email,
      role: user.role,
      action: 'PASSWORD_RESET_COMPLETED',
      entity: 'User',
      entityId: user._id.toString(),
    });

    res.json({
      success: true,
      message: 'Password has been reset successfully. Please sign in with your new password.',
    });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: 'Failed to reset password.' },
    });
  }
};

// @desc    Google OAuth Sign-In (Restricted to allowed college email domains)
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res) => {
  try {
    const { email, firstName, lastName, googleId, collegeCode } = req.body;

    if (!email) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Google account email is required.' },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailDomain = normalizedEmail.split('@')[1];

    let targetCollege = null;
    if (collegeCode) {
      targetCollege = await College.findOne({ code: collegeCode.toUpperCase().trim() });
    } else {
      targetCollege = await College.findOne({ domains: emailDomain });
    }

    if (!targetCollege) {
      targetCollege = await College.findOne({ code: 'DEFAULT' });
    }

    if (!targetCollege) {
      return res.status(400).json({
        error: {
          code: 'COLLEGE_NOT_FOUND',
          message: 'No institutional partner matching this email domain or college code.',
        },
      });
    }

    // Domain Restriction Validation:
    // If the college specifies allowed domains, enforce that user's email domain matches
    if (targetCollege.domains && targetCollege.domains.length > 0) {
      const isAllowed = targetCollege.domains.some(
        (d) => d.toLowerCase().trim() === emailDomain.toLowerCase().trim()
      );
      if (!isAllowed) {
        return res.status(403).json({
          error: {
            code: 'DOMAIN_NOT_ALLOWED',
            message: `Email domain '@${emailDomain}' is not an authorized domain for ${targetCollege.name}. Allowed domains: ${targetCollege.domains.join(', ')}.`,
          },
        });
      }
    }

    let user = await User.findOne({
      collegeId: targetCollege._id,
      email: normalizedEmail,
    }).setOptions({ bypassTenantFilter: true });

    if (!user) {
      // Auto-provision student user from verified Google profile
      const tempPass = crypto.randomBytes(24).toString('hex');
      user = await User.create({
        collegeId: targetCollege._id,
        firstName: firstName || 'Google',
        lastName: lastName || 'User',
        email: normalizedEmail,
        password: tempPass,
        role: 'student',
        isVerified: true,
        googleId: googleId || `google_${Date.now()}`,
      });
    } else if (googleId && !user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const accessToken = generateAccessToken(user);
    const { rawToken } = await createSessionAndRefreshToken(user, req);
    setRefreshTokenCookie(res, rawToken);

    await logAuditAction({
      req,
      collegeId: targetCollege._id,
      actorId: user._id,
      actor: user.email,
      role: user.role,
      action: 'GOOGLE_LOGIN_SUCCESS',
      entity: 'User',
      entityId: user._id.toString(),
      after: { email: user.email, googleId: user.googleId },
    });

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      department: user.department || null,
      collegeId: user.collegeId,
      college: {
        _id: targetCollege._id,
        name: targetCollege.name,
        code: targetCollege.code,
        branding: targetCollege.branding,
      },
      token: accessToken,
      refreshToken: rawToken,
    });
  } catch (error) {
    console.error('googleLogin error:', error);
    res.status(500).json({
      error: { code: 'SERVER_ERROR', message: error.message || 'Google authentication failed.' },
    });
  }
};

// @desc    List active sessions for current authenticated user
// @route   GET /api/auth/sessions
// @access  Private
exports.getUserSessions = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const currentRawToken = req.cookies?.refreshToken;
    const currentHash = currentRawToken ? crypto.createHash('sha256').update(currentRawToken).digest('hex') : null;

    const sessions = await Session.find({
      userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    })
      .sort({ lastActiveAt: -1 })
      .lean();

    const formatted = sessions.map((s) => ({
      id: s._id,
      deviceInfo: s.deviceInfo,
      ipAddress: s.ipAddress,
      lastActiveAt: s.lastActiveAt,
      isCurrent: s.tokenHash === currentHash,
      createdAt: s.createdAt,
    }));

    res.json({ sessions: formatted });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to retrieve active sessions.' } });
  }
};

// @desc    Revoke specific session by ID
// @route   DELETE /api/auth/sessions/:id
// @access  Private
exports.revokeSession = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { id } = req.params;

    const session = await Session.findOne({ _id: id, userId });
    if (!session) {
      return res.status(404).json({ error: { message: 'Session not found.' } });
    }

    session.isRevoked = true;
    await session.save();

    await logAuditAction({
      req,
      actorId: userId,
      actor: req.user.email,
      role: req.user.role,
      action: 'SESSION_REVOKED',
      entity: 'Session',
      entityId: id,
    });

    res.json({ success: true, message: 'Session revoked successfully.' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to revoke session.' } });
  }
};

// @desc    Revoke all other active sessions except current
// @route   DELETE /api/auth/sessions/other
// @access  Private
exports.revokeOtherSessions = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const currentRawToken = req.cookies?.refreshToken;
    const currentHash = currentRawToken ? crypto.createHash('sha256').update(currentRawToken).digest('hex') : null;

    const filter = { userId, isRevoked: false };
    if (currentHash) {
      filter.tokenHash = { $ne: currentHash };
    }

    const result = await Session.updateMany(filter, { isRevoked: true });

    await logAuditAction({
      req,
      actorId: userId,
      actor: req.user.email,
      role: req.user.role,
      action: 'ALL_OTHER_SESSIONS_REVOKED',
      entity: 'Session',
      after: { revokedCount: result.modifiedCount },
    });

    res.json({
      success: true,
      message: `Revoked ${result.modifiedCount} other active sessions.`,
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to revoke other sessions.' } });
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
      department: user.department || null,
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

    if (Array.isArray(driveIds) && driveIds.length > 0) {
      await Opportunity.updateMany(
        { _id: { $in: driveIds } },
        { $addToSet: { invitedRecruiterIds: user._id } }
      );
    }

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
      req,
      collegeId,
      actorId: req.user.id || req.user.userId,
      actor: req.user.email,
      role: req.user.role,
      action: 'RECRUITER_INVITED',
      entity: 'User',
      entityId: user._id.toString(),
      after: {
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
    const accessToken = generateAccessToken(user);
    const { rawToken } = await createSessionAndRefreshToken(user, req);
    setRefreshTokenCookie(res, rawToken);

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
      token: accessToken,
      refreshToken: rawToken,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to set password.' } });
  }
};
