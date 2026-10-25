const { hasPermission } = require('../config/permissions');
const StudentProfile = require('../models/StudentProfile');

/**
 * Enforce RBAC permission check against req.user.role
 * @param {string} permission - The permission identifier to require (e.g. 'drive:create')
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required before checking permissions.',
        },
      });
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Role '${req.user.role}' does not possess required permission '${permission}'.`,
        },
      });
    }

    next();
  };
}

/**
 * Middleware ensuring Department Coordinators can only view and act on students in their own department.
 */
async function requireDeptScope(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
    });
  }

  // TPO, Admin, and SuperAdmin have college-wide access
  if (['tpo', 'admin', 'superadmin'].includes(req.user.role)) {
    return next();
  }

  // If coordinator, enforce department restriction
  if (req.user.role === 'coordinator') {
    const coordinatorDept = req.user.department;
    if (!coordinatorDept) {
      return res.status(403).json({
        error: {
          code: 'NO_DEPARTMENT_ASSIGNED',
          message: 'Department Coordinator account has no assigned department.',
        },
      });
    }

    // Attach deptScope to request for query filtering
    req.deptScope = coordinatorDept;

    // If an individual student ID is in route params, verify department match immediately
    const studentId = req.params.id || req.params.studentId;
    if (studentId) {
      try {
        const student = await StudentProfile.findById(studentId).lean();
        if (student) {
          const studentBranch = (student.branch || '').trim().toLowerCase();
          const coordBranch = coordinatorDept.trim().toLowerCase();
          if (studentBranch !== coordBranch) {
            return res.status(403).json({
              error: {
                code: 'DEPARTMENT_MISMATCH',
                message: `Access denied. You can only view and manage students in the '${coordinatorDept}' department.`,
              },
            });
          }
        }
      } catch (err) {
        // Fall through to standard controller 404/error handling
      }
    }

    return next();
  }

  // Any other role attempting to access department-scoped student management
  return res.status(403).json({
    error: {
      code: 'FORBIDDEN',
      message: 'Access denied: insufficient administrative privileges.',
    },
  });
}

module.exports = {
  requirePermission,
  requireDeptScope,
};
