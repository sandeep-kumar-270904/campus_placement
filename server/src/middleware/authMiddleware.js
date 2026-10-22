const jwt = require('jsonwebtoken');
const { tenantContextMiddleware } = require('./tenantContext');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      req.user = {
        ...decoded,
        id: decoded.id || decoded.userId,
        userId: decoded.id || decoded.userId,
        collegeId: decoded.collegeId || null,
        companyId: decoded.companyId || null,
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

  if (!token) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Not authorized, no bearer token provided',
      },
    });
  }
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
};
