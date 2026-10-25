/**
 * RBAC Permission Matrix for PLACEearly
 * Maps system roles to their authorized capability action sets.
 *
 * Roles:
 * - student
 * - coordinator (Department Coordinator)
 * - recruiter
 * - tpo (Training & Placement Officer)
 * - admin (College Admin)
 * - superadmin (Platform Super Admin)
 */

const ROLE_PERMISSIONS = {
  student: [
    'drive:read',
    'drive:apply',
    'application:read:own',
    'application:decision:own',
    'application:withdraw:own',
    'student:profile:read:own',
    'student:profile:write:own',
    'document:upload',
    'document:read:own',
    'document:download',
    'interview:read:own',
    'mock_interview:use',
    'alumni:read',
    'alumni:request',
    'experience:read',
    'experience:create',
    'internship:read:own',
    'internship:create:own',
    'external_outcome:read:own',
    'external_outcome:create:own',
    'resource:read',
    'policy:read',
    'policy:exception:request',
    'announcement:read',
    'session:manage:own',
  ],

  coordinator: [
    'drive:read',
    'student:read:dept',
    'student:verify:dept',
    'student:notes:dept',
    'student:export:dept',
    'document:read:dept',
    'document:download',
    'company:read',
    'announcement:read',
    'analytics:read:dept',
    'report:read:dept',
    'policy:read',
    'session:manage:own',
  ],

  recruiter: [
    'drive:read',
    'recruiter:drives:read',
    'recruiter:jd:edit',
    'recruiter:candidates:read',
    'recruiter:candidate:status',
    'recruiter:schedule:slots',
    'recruiter:feedback',
    'recruiter:offer:propose',
    'recruiter:funnel:read',
    'document:download',
    'session:manage:own',
  ],

  tpo: [
    'drive:read',
    'drive:create',
    'drive:update',
    'drive:delete',
    'drive:close',
    'drive:workspace',
    'student:read',
    'student:verify',
    'student:notes',
    'student:import',
    'student:export',
    'application:status:update',
    'document:read:all',
    'document:download',
    'company:read',
    'company:manage',
    'schedule:manage',
    'announcement:read',
    'announcement:create',
    'analytics:read',
    'report:generate',
    'report:read',
    'policy:read',
    'policy:manage',
    'policy:override',
    'policy:exception:review',
    'alumni:read',
    'alumni:manage',
    'alumni:verify',
    'experience:read',
    'experience:moderate',
    'internship:manage',
    'external_outcome:verify',
    'risk:read',
    'notification:manage',
    'recruiter:drives:read',
    'recruiter:jd:edit',
    'recruiter:candidates:read',
    'recruiter:candidate:status',
    'recruiter:schedule:slots',
    'recruiter:feedback',
    'recruiter:offer:propose',
    'recruiter:funnel:read',
    'audit:read',
    'audit:export',
    'settings:college:read',
    'session:manage:own',
  ],

  admin: [
    // Admin inherits all TPO permissions plus settings modification
    'drive:read',
    'drive:create',
    'drive:update',
    'drive:delete',
    'drive:close',
    'drive:workspace',
    'student:read',
    'student:verify',
    'student:notes',
    'student:import',
    'student:export',
    'application:status:update',
    'document:read:all',
    'document:download',
    'company:read',
    'company:manage',
    'schedule:manage',
    'announcement:read',
    'announcement:create',
    'analytics:read',
    'report:generate',
    'report:read',
    'policy:read',
    'policy:manage',
    'policy:override',
    'policy:exception:review',
    'alumni:read',
    'alumni:manage',
    'alumni:verify',
    'experience:read',
    'experience:moderate',
    'internship:manage',
    'external_outcome:verify',
    'risk:read',
    'notification:manage',
    'recruiter:drives:read',
    'recruiter:jd:edit',
    'recruiter:candidates:read',
    'recruiter:candidate:status',
    'recruiter:schedule:slots',
    'recruiter:feedback',
    'recruiter:offer:propose',
    'recruiter:funnel:read',
    'audit:read',
    'audit:export',
    'settings:college:read',
    'settings:college:update',
    'user:role:manage',
    'session:manage:own',
  ],

  superadmin: [
    '*', // Wildcard access
  ],
};

/**
 * Checks if a role has the specified permission
 * @param {string} role - The user's role
 * @param {string} permission - The required permission string
 * @returns {boolean}
 */
function hasPermission(role, permission) {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  if (permissions.includes('*')) return true;
  return permissions.includes(permission);
}

module.exports = {
  ROLE_PERMISSIONS,
  hasPermission,
};
