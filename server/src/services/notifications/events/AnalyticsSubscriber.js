const { eventBus, DOMAIN_EVENTS } = require('./EventBus');

class AnalyticsSubscriber {
  static eventCounts = {};

  static init() {
    Object.values(DOMAIN_EVENTS).forEach((eventName) => {
      eventBus.on(eventName, async (payload) => {
        try {
          const collegeId = String(payload.collegeId || 'global');
          if (!AnalyticsSubscriber.eventCounts[collegeId]) {
            AnalyticsSubscriber.eventCounts[collegeId] = {};
          }
          AnalyticsSubscriber.eventCounts[collegeId][eventName] =
            (AnalyticsSubscriber.eventCounts[collegeId][eventName] || 0) + 1;
        } catch (err) {
          console.error(`[AnalyticsSubscriber] Failed to track analytics for ${eventName}:`, err.message);
        }
      });
    });
  }

  static getStats(collegeId) {
    return AnalyticsSubscriber.eventCounts[String(collegeId)] || {};
  }
}

module.exports = AnalyticsSubscriber;
