const express = require('express');
const router = express.Router();
const {
  createCollege,
  getColleges,
  getPublicCollegeByCodeOrDomain,
  getCollegeById,
  updateCollegeConfig,
  updateFeatureFlags,
  inviteInitialTpo,
  getCollegeStats,
} = require('../controllers/collegeController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Public route for institutional branding and lookup
router.get('/public/:identifier', getPublicCollegeByCodeOrDomain);

// Super Admin College Operations
router.get('/', verifyToken, authorizeRoles('superadmin'), getColleges);
router.post('/', verifyToken, authorizeRoles('superadmin'), createCollege);

// College Profile and Config
router.get('/:id', verifyToken, authorizeRoles('superadmin', 'tpo', 'admin'), getCollegeById);
router.put('/:id/config', verifyToken, authorizeRoles('superadmin', 'tpo', 'admin'), updateCollegeConfig);

// Super Admin Feature Flag Management
router.put('/:id/features', verifyToken, authorizeRoles('superadmin'), updateFeatureFlags);

// Super Admin TPO Provisioning
router.post('/:id/tpo-invite', verifyToken, authorizeRoles('superadmin'), inviteInitialTpo);

// College Usage Statistics
router.get('/:id/stats', verifyToken, authorizeRoles('superadmin', 'tpo', 'admin'), getCollegeStats);

module.exports = router;
