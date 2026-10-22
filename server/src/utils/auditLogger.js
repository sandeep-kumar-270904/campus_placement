const AuditLog = require('../models/AuditLog');

/**
 * Log an auditable sensitive mutation to the database
 */
const logAuditAction = async ({
  req,
  collegeId,
  actorId,
  actorEmail,
  actorRole,
  action,
  targetModel,
  targetId,
  beforeState,
  afterState,
}) => {
  try {
    const finalCollegeId = collegeId || req?.user?.collegeId || req?.tenant?.collegeId || null;
    const finalActorId = actorId || req?.user?._id || req?.user?.userId || req?.user?.id;
    const finalActorEmail = actorEmail || req?.user?.email || 'system';
    const finalActorRole = actorRole || req?.user?.role || 'system';
    const ipAddress = req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req?.headers?.['user-agent'] || '';

    if (!finalActorId) {
      console.warn('AuditLog: skipped logging because no actor was identified', action);
      return;
    }

    await AuditLog.create({
      collegeId: finalCollegeId,
      actorId: finalActorId,
      actorEmail: finalActorEmail,
      actorRole: finalActorRole,
      action,
      targetModel,
      targetId: targetId ? targetId.toString() : undefined,
      beforeState: beforeState || null,
      afterState: afterState || null,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    // Non-blocking: audit log errors should not crash request execution
    console.error('AuditLog creation error:', err.message);
  }
};

module.exports = {
  logAuditAction,
};
