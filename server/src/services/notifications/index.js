const { eventBus, DOMAIN_EVENTS } = require('./events/EventBus');
const NotificationSubscriber = require('./events/NotificationSubscriber');
const AuditLogSubscriber = require('./events/AuditLogSubscriber');
const AnalyticsSubscriber = require('./events/AnalyticsSubscriber');
const { notificationQueue } = require('./queue/NotificationQueue');
const providers = require('./providers');
const templateEngine = require('./templateEngine');

let initialized = false;

function initNotificationSystem() {
  if (initialized) return;
  NotificationSubscriber.init();
  AuditLogSubscriber.init();
  AnalyticsSubscriber.init();
  initialized = true;
}

// Auto-initialize
initNotificationSystem();

module.exports = {
  eventBus,
  DOMAIN_EVENTS,
  notificationQueue,
  providers,
  templateEngine,
  initNotificationSystem,
};
