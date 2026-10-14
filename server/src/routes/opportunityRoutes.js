const express = require('express');
const router = express.Router();
const { 
  getOpportunities, 
  createOpportunity, 
  applyToOpportunity, 
  getMyApplications,
  getOpportunityApplications,
  getAllApplications,
  updateApplicationStatus
} = require('../controllers/opportunityController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getOpportunities);
router.post('/', verifyToken, authorizeRoles('tpo', 'superadmin'), createOpportunity);
router.post('/:id/apply', verifyToken, authorizeRoles('student'), applyToOpportunity);
router.get('/applications/me', verifyToken, authorizeRoles('student'), getMyApplications);
router.get('/applications/all', verifyToken, authorizeRoles('tpo', 'superadmin'), getAllApplications);
router.get('/:id/applications', verifyToken, authorizeRoles('tpo', 'superadmin'), getOpportunityApplications);
router.put('/applications/:id/status', verifyToken, authorizeRoles('tpo', 'superadmin'), updateApplicationStatus);

module.exports = router;
