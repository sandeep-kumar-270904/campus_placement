const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { validateEnv } = require('./config/envValidation');

dotenv.config();

// Fail-fast startup configuration validation
validateEnv();

const { requestIdMiddleware } = require('./middleware/requestIdMiddleware');
const { initSentry, captureException } = require('./config/sentry');
const { slowQueryPlugin } = require('./plugins/slowQueryPlugin');
const logger = require('./utils/logger');
const { tenantContextMiddleware } = require('./middleware/tenantContext');
const { noSqlSanitizer, xssSanitizer } = require('./middleware/securityMiddleware');

const app = express();

// Initialize Sentry monitoring if configured
initSentry(app);

// Register slow query profiler plugin across Mongoose schemas
mongoose.plugin(slowQueryPlugin);

app.set('trust proxy', 1);

// Attach Request ID and structured HTTP access logger
app.use(requestIdMiddleware);

// Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Managed by Vercel / reverse proxy in production
  })
);

// Strict CORS Allowlist with credentials support
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error(`CORS origin '${origin}' not allowed by security policy.`));
    },
    credentials: true,
  })
);

// Request body size limits (1MB cap to prevent payload denial-of-service)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Cookie Parser for httpOnly refresh tokens
app.use(cookieParser());

// NoSQL Injection and XSS sanitization
app.use(noSqlSanitizer);
app.use(xssSanitizer);

// Global Tenant Context Middleware
app.use(tenantContextMiddleware);

// Routes
const authRoutes = require('./routes/authRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const profileRoutes = require('./routes/profileRoutes');
const documentRoutes = require('./routes/documentRoutes');
const collegeRoutes = require('./routes/collegeRoutes');
const verifyRoutes = require('./routes/verifyRoutes');
const tpoRoutes = require('./routes/tpoRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const studentRoutes = require('./routes/studentRoutes');
const recruiterRoutes = require('./routes/recruiterRoutes');
const aiRoutes = require('./routes/aiRoutes');
const alumniRoutes = require('./routes/alumniRoutes');
const interviewExperienceRoutes = require('./routes/interviewExperienceRoutes');
const internshipRoutes = require('./routes/internshipRoutes');
const externalOutcomeRoutes = require('./routes/externalOutcomeRoutes');
const placementPolicyRoutes = require('./routes/placementPolicyRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const healthRoutes = require('./routes/healthRoutes');

// Initialize event-driven notification subscribers
require('./services/notifications');

// Health Probes & Monitoring
app.use('/healthz', healthRoutes);
app.use('/api/health', healthRoutes);

// Basic Health Route
app.get('/', (req, res) => {
  res.send('PLACEearly Multi-Tenant Placement OS API is running');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/tpo', tpoRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/interview-experiences', interviewExperienceRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/external-outcomes', externalOutcomeRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/policies', placementPolicyRoutes);
app.use('/api/tpo/policies', placementPolicyRoutes);
app.use('/api/admin/audit-logs', auditLogRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// Central Error Handler with Sentry & Structured Logging
app.use((err, req, res, next) => {
  captureException(err, { requestId: req.id, url: req.originalUrl, method: req.method });
  logger.error(`Unhandled API Error: ${err.message}`, {
    requestId: req.id,
    url: req.originalUrl,
    method: req.method,
    error: err,
  });
  const status = err.status || 500;
  res.status(status).json({
    error: {
      code: err.code || 'SERVER_ERROR',
      message: err.message || 'An unexpected internal server error occurred',
      requestId: req.id,
    },
  });
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placeearly';

if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 })
    .then(() => {
      logger.info('Connected to MongoDB database');
    })
    .catch((err) => {
      logger.warn('MongoDB connection failed (offline/pending). Server running in resilient mode.', { error: err.message });
    });
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
