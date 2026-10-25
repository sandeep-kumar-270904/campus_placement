const jwt = require('jsonwebtoken');
const { tenantContextMiddleware } = require('./tenantContext');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is missing in production environment.');
    }
    // Safe deterministic development secret
    return 'dev_placeearly_super_secure_jwt_secret_key_2026';
  }
  return secret;
};

const protect = async (req, res, next) => {
  let token;

  // Enforce tokens strictly via the Authorization Bearer header (no query param leakage)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, getJwtSecret());
      req.user = {
        ...decoded,
        id: decoded.id || decoded.userId,
        userId: decoded.id || decoded.userId,
        collegeId: decoded.collegeId || null,
        companyId: decoded.companyId || null,
        role: decoded.role || 'student',
        department: decoded.department || null,
      };

      // Wrap downstream route handling in tenant context
      return tenantContextMiddleware(req, res, next);
    } catch (error) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authorized, token failed or expired',
        },
      });
    }
  }

  return res.status(401).json({
    error: {
      code: 'UNAUTHORIZED',
      message: 'Not authorized, no bearer token provided in Authorization header',
    },
  });
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Role '${req.user?.role || 'unauthenticated'}' is not authorized.`,
        },
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
  verifyToken: protect,
  authorizeRoles: (...roles) => authorize(...roles),
  getJwtSecret,
};
