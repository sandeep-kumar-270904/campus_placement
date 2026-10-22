const { AsyncLocalStorage } = require('async_hooks');

const tenantStorage = new AsyncLocalStorage();

/**
 * Get active tenant context from AsyncLocalStorage
 * @returns {{ collegeId: string|null, isSuperAdmin: boolean, bypassTenantFilter: boolean, user: object|null }}
 */
const getTenantContext = () => {
  return tenantStorage.getStore() || {
    collegeId: null,
    isSuperAdmin: false,
    bypassTenantFilter: false,
    user: null,
  };
};

/**
 * Execute a function within an explicit tenant context
 */
const runWithTenantContext = (context, callback) => {
  return tenantStorage.run(context, callback);
};

/**
 * Express middleware to automatically resolve and bind tenant context for every request
 */
const tenantContextMiddleware = (req, res, next) => {
  const headerCollegeId = req.headers['x-college-id'] || req.headers['x-tenant-id'];
  const user = req.user;

  let collegeId = null;
  let isSuperAdmin = false;
  let bypassTenantFilter = false;

  if (user) {
    if (user.role === 'superadmin') {
      isSuperAdmin = true;
      if (headerCollegeId) {
        collegeId = headerCollegeId.toString();
      } else {
        // Global Super Admin queries bypass tenant filter by default unless targeting a tenant
        bypassTenantFilter = true;
      }
    } else {
      // Non-superadmin users MUST belong to a college
      collegeId = user.collegeId ? user.collegeId.toString() : null;

      // Detect and prevent spoofed cross-tenant headers from tenant users
      if (headerCollegeId && collegeId && headerCollegeId.toString() !== collegeId) {
        return res.status(403).json({
          error: {
            code: 'CROSS_TENANT_FORBIDDEN',
            message: 'Cross-tenant access forbidden. You cannot access data outside your assigned college.',
          },
        });
      }
    }
  } else if (headerCollegeId) {
    // Unauthenticated request with explicit tenant header (e.g. public branding, college check)
    collegeId = headerCollegeId.toString();
  }

  const context = {
    collegeId,
    isSuperAdmin,
    bypassTenantFilter,
    user: user || null,
  };

  req.tenant = context;

  tenantStorage.run(context, () => {
    next();
  });
};

module.exports = {
  tenantStorage,
  getTenantContext,
  runWithTenantContext,
  tenantContextMiddleware,
};
