const mongoose = require('mongoose');
const StudentProfile = require('../models/StudentProfile');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const { generateVerificationSeal } = require('../utils/verificationSeal');
const { getStorageService } = require('../services/storage');

/**
 * @desc    Fetch pending academic verification queue with marksheet documents and signed URLs
 * @route   GET /api/tpo/verification-queue
 * @access  Private (TPO / SuperAdmin)
 */
exports.getVerificationQueue = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    if (!collegeId && req.user?.role !== 'superadmin') {
      return res.status(400).json({ error: { message: 'College tenant context is required.' } });
    }

    const { branch, q } = req.query;
    const filter = {
      ...(collegeId ? { collegeId } : {}),
      isVerifiedByTPO: false,
    };

    if (branch && branch !== 'all') {
      filter.branch = branch;
    }

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [{ rollNo: regex }, { branch: regex }];
    }

    const pendingProfiles = await StudentProfile.find(filter)
      .populate('user', 'firstName lastName email phone')
      .sort({ updatedAt: -1 })
      .lean();

    const userIds = pendingProfiles.map((p) => p.user?._id || p.user).filter(Boolean);

    // Fetch marksheets & certificates uploaded by these students
    const documents = await Document.find({
      ...(collegeId ? { collegeId } : {}),
      ownerId: { $in: userIds },
      purpose: { $in: ['marksheet', 'resume', 'id_card'] },
    }).lean();

    const storageService = getStorageService();
    const docsByUser = {};

    await Promise.all(
      documents.map(async (doc) => {
        try {
          const signed = await storageService.getSignedDownloadUrl({
            key: doc.storageKey,
            expiresInSeconds: 300, // 5-minute expiry
            filename: doc.originalName,
          });

          const uid = doc.ownerId.toString();
          if (!docsByUser[uid]) docsByUser[uid] = [];
          docsByUser[uid].push({
            id: doc._id,
            originalName: doc.originalName,
            purpose: doc.purpose,
            mimeType: doc.mimeType,
            size: doc.size,
            signedUrl: signed.url,
            uploadedAt: doc.createdAt,
          });
        } catch {
          // resilient fallback
        }
      })
    );

    const queue = pendingProfiles.map((p) => {
      const uid = (p.user?._id || p.user)?.toString();
      const userDocs = docsByUser[uid] || [];
      const marksheetDoc = userDocs.find((d) => d.purpose === 'marksheet') || userDocs[0] || null;

      return {
        id: p._id,
        userId: uid,
        firstName: p.user?.firstName || '',
        lastName: p.user?.lastName || '',
        fullName: `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.trim() || 'Student',
        email: p.user?.email || '',
        phone: p.personalInfo?.phone || p.user?.phone || '',
        rollNo: p.rollNo,
        branch: p.branch,
        cgpa: p.cgpa,
        backlogs: p.backlogs,
        graduationYear: p.graduationYear,
        tenthPercentage: p.academics?.tenth?.score || 0,
        twelfthPercentage: p.academics?.twelfth?.score || 0,
        marksheetUrl: p.marksheetUrl,
        marksheetDoc,
        documents: userDocs,
        status: p.verificationRecord?.status || 'Unverified',
        rejectionReason: p.verificationRecord?.rejectionReason || '',
        updatedAt: p.updatedAt,
      };
    });

    return res.json({
      totalPending: queue.length,
      queue,
    });
  } catch (err) {
    console.error('getVerificationQueue error:', err);
    return res.status(500).json({ error: { message: err.message || 'Error fetching verification queue' } });
  }
};

/**
 * @desc    Approve, reject, or request correction with Ed25519 cryptographic seal and audit trail
 * @route   POST /api/tpo/verification/:studentId/action
 * @access  Private (TPO / SuperAdmin)
 */
exports.actionVerification = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { action, reason, notes } = req.body; // action: 'approve' | 'reject' | 'request_correction'

    if (!['approve', 'reject', 'request_correction'].includes(action)) {
      return res.status(400).json({ error: { message: "Invalid action. Must be 'approve', 'reject', or 'request_correction'." } });
    }

    if (action !== 'approve' && !reason?.trim()) {
      return res.status(400).json({ error: { message: 'A rejection or correction reason is required.' } });
    }

    const tpoId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;

    const profile = await StudentProfile.findById(studentId).populate('user', 'firstName lastName email');
    if (!profile) {
      return res.status(404).json({ error: { message: 'Student profile not found.' } });
    }

    let seal = null;

    if (action === 'approve') {
      seal = generateVerificationSeal({
        collegeId: profile.collegeId.toString(),
        studentId: (profile.user?._id || profile.user).toString(),
        rollNo: profile.rollNo,
        branch: profile.branch,
        gradYear: profile.graduationYear || 2026,
        cgpa: profile.cgpa,
        backlogs: profile.backlogs,
        verifiedAt: new Date(),
        verifiedByTpoId: tpoId.toString(),
      });

      profile.isVerifiedByTPO = true;
      profile.verificationRecord = {
        status: 'Verified',
        verificationCode: seal.verificationCode,
        hash: seal.hash,
        signature: seal.signature,
        keyId: seal.keyId,
        version: seal.version,
        verifiedAt: seal.payload.verifiedAt,
        verifiedBy: tpoId,
        signedPayload: seal.payload,
      };
    } else {
      profile.isVerifiedByTPO = false;
      profile.verificationRecord = {
        status: 'Needs re-verification',
        rejectionReason: reason.trim(),
        verifiedAt: new Date(),
        verifiedBy: tpoId,
      };
    }

    if (notes && notes.trim()) {
      profile.tpoNotes.push({
        note: notes.trim(),
        createdBy: tpoId,
        createdAt: new Date(),
      });
    }

    await profile.save();

    await AuditLog.create({
      collegeId,
      actorId: tpoId,
      action: action === 'approve' ? 'STUDENT_VERIFICATION_APPROVED' : 'STUDENT_VERIFICATION_REJECTED',
      resource: 'StudentProfile',
      metadata: {
        studentId: profile._id,
        rollNo: profile.rollNo,
        action,
        verificationCode: seal?.verificationCode,
        reason,
      },
    });

    try {
      const { eventBus, DOMAIN_EVENTS } = require('../services/notifications/events/EventBus');
      if (action === 'approve') {
        await eventBus.emitAsync(DOMAIN_EVENTS.VERIFICATION_APPROVED, {
          studentUser: profile.user,
          verificationCode: seal?.verificationCode,
          collegeId,
        });
      } else {
        await eventBus.emitAsync(DOMAIN_EVENTS.VERIFICATION_REJECTED, {
          studentUser: profile.user,
          rejectionReason: reason,
          collegeId,
        });
      }
    } catch (eventErr) {
      console.error('Failed to emit VERIFICATION event:', eventErr);
    }

    return res.json({
      success: true,
      action,
      isVerifiedByTPO: profile.isVerifiedByTPO,
      verificationRecord: profile.verificationRecord,
      message: action === 'approve'
        ? `Academic record for ${profile.rollNo} verified and cryptographically sealed!`
        : `Record rejected. Feedback transmitted to candidate.`,
    });
  } catch (err) {
    console.error('actionVerification error:', err);
    return res.status(500).json({ error: { message: err.message } });
  }
};
