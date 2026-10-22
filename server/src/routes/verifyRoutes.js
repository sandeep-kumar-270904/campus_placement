const express = require('express');
const router = express.Router();
const { verifyStudentSeal } = require('../controllers/verifyController');

// Public route: Verify student cryptographic credential by code or roll number
router.get('/:code', verifyStudentSeal);

module.exports = router;
