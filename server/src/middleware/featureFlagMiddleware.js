const College = require('../models/College');

/**
 * Middleware to enforce per-college feature flags.
 * @param {string} flagName - e.g. 'alumniNetwork', 'interviewExperiences', 'internshipPpo', 'offCampusHigherStudies', 'consolidatedResources'
 */
const requireFeature = (flagName) => {
  return async (req, res, next) => {
    try {
      const collegeId = req.tenant?.collegeId || req.user?.collegeId;
      if (!collegeId) {
        // Superadmin or non-tenant route bypass
        return next();
      }

      const college = await College.findById(collegeId).lean();
      if (!college) {
        return next();
      }

      const flags = college.featureFlags || {};
      // Default to true if not explicitly set to false
      if (flags[flagName] === false) {
        return res.status(403).json({
          error: {
            code: 'FEATURE_DISABLED',
            message: `The feature '${flagName}' is disabled for your institution. Please contact your administrator.`,
          },
        });
      }

      req.college = college;
      next();
    } catch (error) {
      console.error(`Feature flag check failed for ${flagName}:`, error);
      next();
    }
  };
};

module.exports = { requireFeature };
