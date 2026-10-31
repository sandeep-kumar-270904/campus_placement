/**
 * Client Sentry Monitoring Integration
 * Safely initializes Sentry in production if VITE_SENTRY_DSN is configured.
 */
import * as Sentry from '@sentry/react';

export function initClientSentry() {
  const dsn = import.meta.env?.VITE_SENTRY_DSN;
  if (!dsn || !Sentry?.init) {
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE || 'development',
      integrations: [
        Sentry.browserTracingIntegration?.() || {},
        Sentry.replayIntegration?.() || {},
      ].filter(Boolean),
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.05,
      replaysOnErrorSampleRate: 1.0,
    });
    console.log('[Monitoring] Client Sentry initialized successfully.');
  } catch (err) {
    console.warn('[Monitoring] Failed to initialize Sentry on client:', err);
  }
}

export function captureClientError(error, errorInfo = {}) {
  if (Sentry?.captureException) {
    Sentry.captureException(error, { extra: errorInfo });
  } else {
    console.error('[Error Monitoring]', error, errorInfo);
  }
}
