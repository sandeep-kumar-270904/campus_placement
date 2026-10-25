const express = require('express');
const router = express.Router();
const { getAuditLogs, exportAuditLogsCsv } = require('../controllers/auditLogController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');

// All audit log routes are restricted to TPO, Admin, and SuperAdmin
router.use(protect);
router.use(authorize('tpo', 'admin', 'superadmin'));

router.get('/', requirePermission('audit:read'), getAuditLogs);
router.get('/export', requirePermission('audit:export'), exportAuditLogsCsv);

module.exports = router;
