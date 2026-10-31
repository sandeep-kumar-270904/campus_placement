const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

function getHealthStatus() {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbStatus = dbStatusMap[dbState] || 'unknown';
  const isHealthy = dbState === 1 || process.env.NODE_ENV === 'test';

  const memory = process.memoryUsage();
  const formatMB = (bytes) => Math.round((bytes / 1024 / 1024) * 100) / 100;

  return {
    isHealthy,
    payload: {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: {
          status: dbStatus,
          readyState: dbState,
          databaseName: mongoose.connection.name || 'none',
        },
        memory: {
          heapUsedMB: formatMB(memory.heapUsed),
          heapTotalMB: formatMB(memory.heapTotal),
          rssMB: formatMB(memory.rss),
        },
        system: {
          nodeVersion: process.version,
          pid: process.pid,
        },
      },
    },
  };
}

// Full health and readiness probe
router.get(['/', '/healthz', '/api/health'], (req, res) => {
  const { isHealthy, payload } = getHealthStatus();
  const statusCode = isHealthy ? 200 : 503;
  res.status(statusCode).json(payload);
});

// Fast liveness probe (for Kubernetes / container orchestrators)
router.get('/liveness', (req, res) => {
  res.status(200).json({ status: 'live', timestamp: new Date().toISOString() });
});

// Readiness probe
router.get('/readiness', (req, res) => {
  const { isHealthy, payload } = getHealthStatus();
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ready' : 'not_ready',
    database: payload.checks.database.status,
  });
});

module.exports = router;
