const rateLimit = require('express-rate-limit');

/**
 * Brute-force protection for authentication endpoints (Login & Register)
 * Limit: 5 requests per 1-minute window per IP
 */
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please wait 60 seconds before trying again.',
    },
  },
});

/**
 * Throttle password reset requests
 * Limit: 3 requests per 15-minute window per IP
 */
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many password reset requests. Please wait 15 minutes before requesting again.',
    },
  },
});

/**
 * Throttle drive applications
 * Limit: 10 applications per 1-minute window per user/IP
 */
const applyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req) => req.user?.id || req.ip || 'global',
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Application submission rate limit exceeded. Please wait a minute before submitting again.',
    },
  },
});

/**
 * Throttle document uploads
 * Limit: 15 uploads per 1-minute window per user/IP
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req) => req.user?.id || req.ip || 'global',
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Document upload rate limit exceeded. Please wait a minute before uploading again.',
    },
  },
});

/**
 * NoSQL Injection Protection:
 * Sanitizes req.body, req.query, and req.params by removing any keys starting with '$' or containing '.'
 */
function sanitizeNoSql(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeNoSql);
  }

  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      // Discard malicious operator keys
      continue;
    }
    clean[key] = typeof val === 'object' && val !== null ? sanitizeNoSql(val) : val;
  }
  return clean;
}

function noSqlSanitizer(req, res, next) {
  if (req.body) req.body = sanitizeNoSql(req.body);
  if (req.query) req.query = sanitizeNoSql(req.query);
  if (req.params) req.params = sanitizeNoSql(req.params);
  next();
}

/**
 * Basic XSS Sanitization:
 * Strips script tags and executable javascript: URI schemes from string fields
 */
function sanitizeXssString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:[^"']*/gi, '')
    .replace(/onload\s*=\s*['"][^'"]*['"]/gi, '')
    .replace(/onerror\s*=\s*['"][^'"]*['"]/gi, '');
}

function sanitizeXss(obj) {
  if (!obj || typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeXssString(obj) : obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeXss);
  }

  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    clean[key] = sanitizeXss(val);
  }
  return clean;
}

function xssSanitizer(req, res, next) {
  if (req.body) req.body = sanitizeXss(req.body);
  next();
}

module.exports = {
  authLimiter,
  passwordResetLimiter,
  applyLimiter,
  uploadLimiter,
  noSqlSanitizer,
  xssSanitizer,
};
