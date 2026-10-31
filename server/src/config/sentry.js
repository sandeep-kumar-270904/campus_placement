const logger = require('../utils/logger');

let Sentry = null;
let isInitialized = false;

try {
  Sentry = require('@sentry/node');
} catch (e) {
  // Sentry package optional / fallback
}

function initSentry(app) {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn || !Sentry) {
    if (process.env.NODE_ENV === 'production' && !dsn) {
      logger.warn('SENTRY_DSN not configured in production environment. Error monitoring is running in local fallback mode.');
    }
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
      release: process.env.npm_package_version || '1.0.0',
    });
    isInitialized = true;
    logger.info('Sentry server monitoring initialized successfully.');
  } catch (err) {
    logger.error('Failed to initialize Sentry:', { error: err });
  }
}

function captureException(err, context = {}) {
  if (isInitialized && Sentry) {
    Sentry.captureException(err, { extra: context });
  } else {
    logger.error(`Exception captured (local): ${err.message}`, { error: err, ...context });
  }
}

module.exports = {
  initSentry,
  captureException,
  get Sentry() {
    return Sentry;
  },
};
