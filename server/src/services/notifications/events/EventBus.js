const EventEmitter = require('events');

const DOMAIN_EVENTS = {
  DRIVE_PUBLISHED: 'drive.published',
  DRIVE_DEADLINE_24H: 'drive.deadline_24h',
  DRIVE_DEADLINE_3H: 'drive.deadline_3h',
  APPLICATION_STATUS_CHANGED: 'application.status_changed',
  INTERVIEW_SCHEDULED: 'interview.scheduled',
  INTERVIEW_REMINDER_1D: 'interview.reminder_1d',
  INTERVIEW_REMINDER_1H: 'interview.reminder_1h',
  OFFER_EXTENDED: 'offer.extended',
  VERIFICATION_APPROVED: 'verification.approved',
  VERIFICATION_REJECTED: 'verification.rejected',
  ANNOUNCEMENT_SENT: 'announcement.sent',
};

class DomainEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }

  /**
   * Emit domain event asynchronously with error isolation across subscribers
   */
  async emitAsync(eventName, payload) {
    const listeners = this.listeners(eventName);
    if (!listeners || listeners.length === 0) return;

    const promises = listeners.map(async (listener) => {
      try {
        await listener(payload);
      } catch (err) {
        console.error(`[EventBus] Error in subscriber for ${eventName}:`, err.message || err);
      }
    });

    await Promise.all(promises);
  }
}

const eventBus = new DomainEventBus();

module.exports = {
  eventBus,
  DOMAIN_EVENTS,
};
