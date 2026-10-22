const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  uploadDocument,
  getSignedUrlForDocument,
  serveRawLocalFile,
  getMyDocuments,
} = require('../controllers/documentController');
const { verifyToken } = require('../middleware/authMiddleware');

// Multer memory storage configured with 5 MB maximum file limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

// Upload document (PDF, PNG, JPG, DOCX validated by magic bytes)
router.post('/upload', verifyToken, upload.single('document'), uploadDocument);

// Get a 5-minute signed download URL with per-role access validation
router.get('/:id/signed-url', verifyToken, getSignedUrlForDocument);

// Serve local raw file (protected by signed HMAC token and 5-minute expiration)
router.get('/raw/{*key}', serveRawLocalFile);
router.get('/raw', serveRawLocalFile);

// List authenticated user documents
router.get('/', verifyToken, getMyDocuments);

module.exports = router;
