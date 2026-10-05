const express = require('express');
const router = express.Router();
const { getMyProfile, upsertProfile } = require('../controllers/profileController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/me', verifyToken, getMyProfile);
router.post('/', verifyToken, upsertProfile);

module.exports = router;
