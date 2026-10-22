const path = require('path');
const Document = require('../models/Document');
const StudentProfile = require('../models/StudentProfile');
const { getStorageService, LocalStorageProvider } = require('../services/storage');
const { validateUploadedFile } = require('../utils/fileValidator');
const { logAuditAction } = require('../utils/auditLogger');

/**
 * @desc    Upload document to private object storage with magic-byte validation
 * @route   POST /api/documents/upload
 * @access  Private
 */
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: {
          code: 'FILE_MISSING',
          message: 'No file provided. Please upload a PDF, PNG, JPG, or DOCX file.',
        },
      });
    }

    // 1. Magic-byte and size validation
    const validation = await validateUploadedFile(req.file);
    if (!validation.isValid) {
      return res.status(400).json({
        error: {
          code: 'INVALID_FILE',
          message: validation.error,
        },
      });
    }

    const { fileType, hash, scanResult } = validation;
    const purpose = req.body.purpose || 'resume';
    const validPurposes = ['resume', 'marksheet', 'offer_letter', 'noc', 'id_proof'];
    const resolvedPurpose = validPurposes.includes(purpose) ? purpose : 'resume';

    const collegeId = req.tenant?.collegeId || req.user.collegeId;
    const userId = req.user.userId || req.user.id;

    // 2. Compute private storage key
    const uniqueKey = `tenants/${collegeId || 'common'}/${resolvedPurpose}/${Date.now()}-${hash.slice(0, 12)}${fileType.ext}`;

    // 3. Upload to private cloud object storage
    const storageService = getStorageService();
    await storageService.upload({
      key: uniqueKey,
      buffer: req.file.buffer,
      contentType: fileType.mime,
      metadata: {
        collegeId: collegeId ? collegeId.toString() : 'none',
        ownerId: userId.toString(),
        sha256Hash: hash,
        purpose: resolvedPurpose,
      },
    });

    // 4. Persist Document metadata in database
    const document = await Document.create({
      collegeId,
      ownerId: userId,
      filename: path.basename(uniqueKey),
      originalName: req.file.originalname,
      mimeType: fileType.mime,
      size: req.file.buffer.length,
      storageKey: uniqueKey,
      sha256Hash: hash,
      purpose: resolvedPurpose,
      scanStatus: scanResult.isClean ? 'clean' : 'flagged',
      scanDetails: scanResult.details,
    });

    // 5. Generate signed URL with 5-minute expiry
    const signedDownload = await storageService.getSignedDownloadUrl({
      key: uniqueKey,
      expiresInSeconds: 300,
      filename: req.file.originalname,
    });

    // 6. Link to StudentProfile if resume
    if (resolvedPurpose === 'resume') {
      const profile = await StudentProfile.findOne({
        $or: [{ user: userId }, { userId }],
      });
      if (profile) {
        profile.resumeUrl = signedDownload.url;
        await profile.save();
      }
    }

    await logAuditAction({
      req,
      action: 'DOCUMENT_UPLOADED',
      targetModel: 'Document',
      targetId: document._id,
      afterState: {
        filename: document.originalName,
        hash,
        purpose: resolvedPurpose,
      },
    });

    return res.status(201).json({
      message: 'Document uploaded and securely stored',
      document: {
        _id: document._id,
        originalName: document.originalName,
        mimeType: document.mimeType,
        size: document.size,
        purpose: document.purpose,
        sha256Hash: document.sha256Hash,
        uploadedAt: document.uploadedAt,
      },
      file: {
        url: signedDownload.url,
        expiresAt: signedDownload.expiresAt,
      },
    });
  } catch (err) {
    console.error('uploadDocument error:', err);
    return res.status(500).json({
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message || 'Server error during file upload',
      },
    });
  }
};

/**
 * @desc    Generate a 5-minute signed URL for an existing document with per-role access control
 * @route   GET /api/documents/:id/signed-url
 * @access  Private (Role-enforced)
 */
exports.getSignedUrlForDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: 'Document record not found',
        },
      });
    }

    const currentUserId = (req.user.userId || req.user.id).toString();
    const currentUserRole = req.user.role;
    const isOwner = document.ownerId.toString() === currentUserId;
    const isSuperAdmin = currentUserRole === 'superadmin';
    const isCollegeTpo =
      (currentUserRole === 'tpo' || currentUserRole === 'admin') &&
      document.collegeId.toString() === (req.tenant?.collegeId || req.user.collegeId)?.toString();

    // Per-role access enforcement:
    // Students can ONLY access their own documents.
    // TPOs can access documents belonging to students within their college.
    // Super Admins can access documents across all colleges.
    if (!isOwner && !isCollegeTpo && !isSuperAdmin) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied. You do not have permission to view or download this document.',
        },
      });
    }

    const storageService = getStorageService();
    const signed = await storageService.getSignedDownloadUrl({
      key: document.storageKey,
      expiresInSeconds: 300, // 5-minute expiry
      filename: document.originalName,
    });

    return res.json({
      documentId: document._id,
      originalName: document.originalName,
      url: signed.url,
      expiresAt: signed.expiresAt,
      expiresInSeconds: 300,
    });
  } catch (err) {
    console.error('getSignedUrlForDocument error:', err);
    return res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: err.message,
      },
    });
  }
};

/**
 * @desc    Serve local raw files when using LocalStorageProvider, strictly verifying HMAC token & 5-min expiry
 * @route   GET /api/documents/raw/:key
 * @access  Public (protected by signed token & expiry query parameters)
 */
exports.serveRawLocalFile = async (req, res) => {
  try {
    const key = req.query.key || (Array.isArray(req.params.key) ? req.params.key.join('/') : req.params.key);
    const { token, expires, filename } = req.query;

    const storageService = getStorageService();
    if (!(storageService instanceof LocalStorageProvider)) {
      return res.status(400).json({
        error: {
          code: 'NOT_SUPPORTED',
          message: 'Direct raw route only available under LocalStorageProvider.',
        },
      });
    }

    const isValid = storageService.verifySignature(key, token, expires);
    if (!isValid) {
      return res.status(403).json({
        error: {
          code: 'SIGNED_URL_INVALID_OR_EXPIRED',
          message: 'This document download link has expired (5-minute limit) or the signature is invalid.',
        },
      });
    }

    const { buffer, contentType } = await storageService.getFileBuffer(key);

    res.setHeader('Content-Type', contentType);
    if (filename) {
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${path.basename(key)}"`);
    }
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    return res.send(buffer);
  } catch (err) {
    console.error('serveRawLocalFile error:', err);
    return res.status(404).json({
      error: {
        code: 'FILE_NOT_FOUND',
        message: 'The requested document file could not be located in storage.',
      },
    });
  }
};

/**
 * @desc    List documents for current user or college
 * @route   GET /api/documents
 * @access  Private
 */
exports.getMyDocuments = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const query = { ownerId: userId };
    const docs = await Document.find(query).sort({ uploadedAt: -1 });
    return res.json(docs);
  } catch (err) {
    console.error('getMyDocuments error:', err);
    return res.status(500).json({
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};
