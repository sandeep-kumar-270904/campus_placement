const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { tenantContextMiddleware } = require('./middleware/tenantContext');

dotenv.config();

const app = express();

app.set('trust proxy', 1);

// Standard Middleware
app.use(cors());
app.use(express.json());

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

// Initialize event-driven notification subscribers
require('./services/notifications');

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

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      code: err.code || 'SERVER_ERROR',
      message: err.message || 'An unexpected internal server error occurred',
    },
  });
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placeearly';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.warn('MongoDB connection failed (offline/pending). Server running in resilient mode.', err.message);
  });

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
