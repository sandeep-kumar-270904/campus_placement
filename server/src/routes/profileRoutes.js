const express = require('express');
const router = express.Router();
const { getMyProfile, upsertProfile, getAllProfiles, verifyProfile } = require('../controllers/profileController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/me', verifyToken, getMyProfile);
router.post('/', verifyToken, upsertProfile);
router.get('/all', verifyToken, authorizeRoles('tpo', 'superadmin'), getAllProfiles);
router.put('/:id/verify', verifyToken, authorizeRoles('tpo', 'superadmin'), verifyProfile);

module.exports = router;
