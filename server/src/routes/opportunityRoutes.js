const express = require('express');
const router = express.Router();
const { getOpportunities, createOpportunity, applyToOpportunity, getMyApplications } = require('../controllers/opportunityController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getOpportunities);
router.post('/', verifyToken, authorizeRoles('tpo', 'superadmin'), createOpportunity);
router.post('/:id/apply', verifyToken, authorizeRoles('student'), applyToOpportunity);
router.get('/applications/me', verifyToken, authorizeRoles('student'), getMyApplications);

module.exports = router;
