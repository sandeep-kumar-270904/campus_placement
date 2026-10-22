const { eventBus, DOMAIN_EVENTS } = require('./EventBus');
const AuditLog = require('../../../models/AuditLog');

class AuditLogSubscriber {
  static init() {
    Object.values(DOMAIN_EVENTS).forEach((eventName) => {
      eventBus.on(eventName, async (payload) => {
        try {
          const collegeId = payload.collegeId;
          const performedBy = payload.performedBy || payload.studentUser?._id || null;

          await AuditLog.create({
            collegeId,
            performedBy,
            action: `DOMAIN_EVENT_${eventName.toUpperCase().replace(/\./g, '_')}`,
            targetModel: payload.drive ? 'Opportunity' : payload.application ? 'Application' : 'Notification',
            targetId: payload.drive?._id || payload.application?._id || payload.slot?._id || null,
            details: {
              eventName,
              summary: payload.drive?.companyName || payload.newStatus || payload.verificationCode || 'Event processed',
              timestamp: new Date(),
            },
          });
        } catch (err) {
          // Non-blocking error handling
          console.error(`[AuditLogSubscriber] Failed to record audit log for ${eventName}:`, err.message);
        }
      });
    });
  }
}

module.exports = AuditLogSubscriber;
