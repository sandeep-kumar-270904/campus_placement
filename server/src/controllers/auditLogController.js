const xlsx = require('xlsx');
const AuditLog = require('../models/AuditLog');
const { logAuditAction } = require('../utils/auditLogger');

/**
 * @desc    Get paginated audit logs with search and multi-filtering
 * @route   GET /api/admin/audit-logs
 * @access  Private (Admin / TPO / SuperAdmin)
 */
exports.getAuditLogs = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const {
      page = 1,
      limit = 20,
      actor = '',
      action = '',
      entity = '',
      startDate = '',
      endDate = '',
      q = '',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = collegeId ? { collegeId } : {};

    if (actor.trim()) {
      filter.$or = [
        { actor: new RegExp(actor.trim(), 'i') },
        { actorEmail: new RegExp(actor.trim(), 'i') },
      ];
    }

    if (action.trim() && action !== 'all') {
      filter.action = action.trim();
    }

    if (entity.trim() && entity !== 'all') {
      filter.$or = [
        { entity: new RegExp(`^${entity.trim()}$`, 'i') },
        { targetModel: new RegExp(`^${entity.trim()}$`, 'i') },
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { actor: regex },
        { actorEmail: regex },
        { action: regex },
        { entity: regex },
        { entityId: regex },
        { ip: regex },
      ];
    }

    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(filter),
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    const formatted = logs.map((log) => ({
      id: log._id,
      actor: log.actor || log.actorEmail || 'System',
      role: log.role || log.actorRole || 'system',
      action: log.action,
      entity: log.entity || log.targetModel || 'Unknown',
      entityId: log.entityId || log.targetId || '-',
      before: log.before || log.beforeState || null,
      after: log.after || log.afterState || null,
      ip: log.ip || log.ipAddress || '127.0.0.1',
      userAgent: log.userAgent || '',
      createdAt: log.createdAt,
    }));

    res.json({
      logs: formatted,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    console.error('getAuditLogs error:', error);
    res.status(500).json({ error: { message: 'Failed to retrieve audit logs.' } });
  }
};

/**
 * @desc    Export filtered audit logs as CSV
 * @route   GET /api/admin/audit-logs/export
 * @access  Private (Admin / TPO / SuperAdmin)
 */
exports.exportAuditLogsCsv = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const {
      actor = '',
      action = '',
      entity = '',
      startDate = '',
      endDate = '',
    } = req.query;

    const filter = collegeId ? { collegeId } : {};

    if (actor.trim()) {
      filter.$or = [
        { actor: new RegExp(actor.trim(), 'i') },
        { actorEmail: new RegExp(actor.trim(), 'i') },
      ];
    }

    if (action.trim() && action !== 'all') {
      filter.action = action.trim();
    }

    if (entity.trim() && entity !== 'all') {
      filter.$or = [
        { entity: new RegExp(`^${entity.trim()}$`, 'i') },
        { targetModel: new RegExp(`^${entity.trim()}$`, 'i') },
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(5000)
      .lean();

    const rows = logs.map((l) => ({
      Timestamp: new Date(l.createdAt).toISOString(),
      Actor: l.actor || l.actorEmail || 'System',
      Role: l.role || l.actorRole || 'system',
      Action: l.action,
      Entity: l.entity || l.targetModel || '-',
      EntityId: l.entityId || l.targetId || '-',
      IP_Address: l.ip || l.ipAddress || '127.0.0.1',
      User_Agent: l.userAgent || '-',
      Before_State: l.before ? JSON.stringify(l.before) : '',
      After_State: l.after ? JSON.stringify(l.after) : '',
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(rows.length > 0 ? rows : [{ Status: 'No logs matching criteria' }]);
    xlsx.utils.book_append_sheet(wb, ws, 'Audit_Logs');
    const csvBuffer = xlsx.write(wb, { type: 'buffer', bookType: 'csv' });

    await logAuditAction({
      req,
      collegeId,
      actorId: req.user?.id || req.user?.userId,
      actor: req.user?.email,
      role: req.user?.role,
      action: 'CSV_EXPORT',
      entity: 'AuditLog',
      after: { exportCount: rows.length, filterApplied: { action, entity, actor } },
    });

    const fileName = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(csvBuffer);
  } catch (error) {
    console.error('exportAuditLogsCsv error:', error);
    res.status(500).json({ error: { message: 'Failed to export audit logs to CSV.' } });
  }
};
