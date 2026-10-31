const crypto = require('crypto');

/**
 * Structured JSON Logger for Production Observability
 * Formats all application logs as structured JSON in production for log aggregators
 * (Datadog, CloudWatch, Logstash, Grafana Loki), with human-readable output in development.
 */
class Logger {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  formatEntry(level, message, meta = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message: typeof message === 'string' ? message : JSON.stringify(message),
      ...meta,
    };

    if (meta.error instanceof Error) {
      entry.error = {
        name: meta.error.name,
        message: meta.error.message,
        stack: meta.error.stack,
      };
    }

    return entry;
  }

  output(level, message, meta = {}) {
    const entry = this.formatEntry(level, message, meta);

    if (this.isProduction) {
      const json = JSON.stringify(entry);
      if (level === 'error') {
        process.stderr.write(json + '\n');
      } else {
        process.stdout.write(json + '\n');
      }
    } else {
      const colorMap = {
        info: '\x1b[36m', // Cyan
        warn: '\x1b[33m', // Yellow
        error: '\x1b[31m', // Red
        debug: '\x1b[90m', // Gray
      };
      const reset = '\x1b[0m';
      const color = colorMap[level] || reset;
      const reqInfo = meta.requestId ? ` [Req: ${meta.requestId.substring(0, 8)}]` : '';
      const formatted = `${color}[${entry.timestamp}] [${level.toUpperCase()}]${reqInfo} ${entry.message}${reset}`;

      if (level === 'error') {
        console.error(formatted, meta.error || '');
      } else if (level === 'warn') {
        console.warn(formatted);
      } else {
        console.log(formatted);
      }
    }
  }

  info(message, meta) {
    this.output('info', message, meta);
  }

  warn(message, meta) {
    this.output('warn', message, meta);
  }

  error(message, meta) {
    this.output('error', message, meta);
  }

  debug(message, meta) {
    if (process.env.DEBUG || !this.isProduction) {
      this.output('debug', message, meta);
    }
  }
}

const logger = new Logger();

module.exports = logger;
