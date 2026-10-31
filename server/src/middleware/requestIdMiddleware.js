const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Middleware that assigns a unique Request ID to each incoming request,
 * attaches it to response headers, and records structured JSON access logs.
 */
function requestIdMiddleware(req, res, next) {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);

  const startTime = process.hrtime.bigint();

  res.on('finish', () => {
    const elapsedNs = process.hrtime.bigint() - startTime;
    const durationMs = Number(elapsedNs) / 1e6;

    // Do not log noisy healthz polling in development unless error
    if (req.originalUrl === '/healthz' && res.statusCode === 200 && process.env.NODE_ENV !== 'production') {
      return;
    }

    const logData = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    };

    if (res.statusCode >= 500) {
      logger.error(`HTTP ${req.method} ${req.originalUrl} - ${res.statusCode} (${logData.durationMs}ms)`, logData);
    } else if (res.statusCode >= 400) {
      logger.warn(`HTTP ${req.method} ${req.originalUrl} - ${res.statusCode} (${logData.durationMs}ms)`, logData);
    } else {
      logger.info(`HTTP ${req.method} ${req.originalUrl} - ${res.statusCode} (${logData.durationMs}ms)`, logData);
    }
  });

  next();
}

module.exports = {
  requestIdMiddleware,
};
