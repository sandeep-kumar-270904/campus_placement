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
  actor,
  role,
  action,
  targetModel,
  entity,
  targetId,
  entityId,
  beforeState,
  before,
  afterState,
  after,
  ip,
  ipAddress,
  userAgent,
}) => {
  try {
    const finalCollegeId = collegeId || req?.user?.collegeId || req?.tenant?.collegeId || null;
    const finalActorId = actorId || req?.user?._id || req?.user?.userId || req?.user?.id || null;
    const finalActor = actor || actorEmail || req?.user?.email || 'system';
    const finalRole = role || actorRole || req?.user?.role || 'system';
    const finalEntity = entity || targetModel || 'System';
    const finalEntityId = entityId || (targetId ? targetId.toString() : '');
    const finalBefore = before !== undefined ? before : (beforeState || null);
    const finalAfter = after !== undefined ? after : (afterState || null);
    const finalIp = ip || ipAddress || req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';
    const finalUserAgent = userAgent || req?.headers?.['user-agent'] || '';

    await AuditLog.create({
      collegeId: finalCollegeId,
      actorId: finalActorId,
      actor: finalActor,
      actorEmail: finalActor,
      role: finalRole,
      actorRole: finalRole,
      action,
      entity: finalEntity,
      targetModel: finalEntity,
      entityId: finalEntityId,
      targetId: finalEntityId,
      before: finalBefore,
      beforeState: finalBefore,
      after: finalAfter,
      afterState: finalAfter,
      ip: finalIp,
      ipAddress: finalIp,
      userAgent: finalUserAgent,
    });
  } catch (err) {
    // Non-blocking: audit log errors should not crash the primary transaction
    console.error('AuditLog creation error:', err.message);
  }
};

module.exports = {
  logAuditAction,
};
