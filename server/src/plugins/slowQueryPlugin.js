const logger = require('../utils/logger');

/**
 * Mongoose Plugin for Slow Query Profiling and Logging
 * Intercepts Mongoose queries and logs a warning with collection name,
 * filter, operation, and duration if execution exceeds SLOW_QUERY_THRESHOLD_MS.
 */
function slowQueryPlugin(schema) {
  const thresholdMs = parseInt(process.env.SLOW_QUERY_THRESHOLD_MS || '100', 10);

  const queryOps = [
    'find',
    'findOne',
    'findOneAndUpdate',
    'findOneAndDelete',
    'findOneAndReplace',
    'updateOne',
    'updateMany',
    'deleteOne',
    'deleteMany',
    'countDocuments',
  ];

  queryOps.forEach((op) => {
    schema.pre(op, function () {
      this._queryStartTime = process.hrtime.bigint();
    });

    schema.post(op, function () {
      if (!this._queryStartTime) return;
      const elapsedNs = process.hrtime.bigint() - this._queryStartTime;
      const durationMs = Math.round(Number(elapsedNs) / 1e4) / 100; // 2 decimal places

      if (durationMs >= thresholdMs) {
        logger.warn(`Slow Database Query Detected: ${durationMs}ms`, {
          type: 'slow_query',
          collection: this.model?.collection?.name || this.mongooseCollection?.name || 'unknown',
          operation: op,
          filter: sanitizeFilter(this.getFilter ? this.getFilter() : {}),
          durationMs,
          thresholdMs,
        });
      }
    });
  });
}

function sanitizeFilter(filter) {
  if (!filter || typeof filter !== 'object') return filter;
  const sanitized = { ...filter };
  // Redact password or secret fields if queried
  if (sanitized.password) sanitized.password = '[REDACTED]';
  if (sanitized.token) sanitized.token = '[REDACTED]';
  return sanitized;
}

module.exports = {
  slowQueryPlugin,
};
