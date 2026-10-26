const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const xlsx = require('xlsx');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const { generateVerificationSeal } = require('../utils/verificationSeal');
const { getStorageService } = require('../services/storage');

/**
 * @desc    Get paginated students directory with multi-filter, search, and sorting
 * @route   GET /api/tpo/students
 * @access  Private (TPO / SuperAdmin)
 */
exports.getStudents = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    if (!collegeId && req.user?.role !== 'superadmin') {
      return res.status(400).json({ error: { message: 'College tenant context is required.' } });
    }

    const {
      page = 1,
      limit = 20,
      q = '',
      branch = '',
      graduationYear = '',
      verificationStatus = 'all', // 'all', 'verified', 'unverified'
      placedStatus = 'all', // 'all', 'placed', 'unplaced'
      minCgpa = '',
      maxCgpa = '',
      maxBacklogs = '',
      opportunityId = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = collegeId ? { collegeId } : {};

    if (req.user?.role === 'coordinator') {
      const coordinatorDept = req.deptScope || req.user.department;
      if (!coordinatorDept) {
        return res.status(403).json({
          error: {
            code: 'NO_DEPARTMENT_ASSIGNED',
            message: 'Department Coordinator account has no assigned department.',
          },
        });
      }
      filter.branch = new RegExp(`^${coordinatorDept.trim()}$`, 'i');
    } else if (branch && branch !== 'all') {
      filter.branch = branch;
    }

    if (graduationYear && graduationYear !== 'all') {
      filter.graduationYear = parseInt(graduationYear, 10);
    }

    if (verificationStatus === 'verified') {
      filter.isVerifiedByTPO = true;
    } else if (verificationStatus === 'unverified') {
      filter.isVerifiedByTPO = false;
    }

    if (placedStatus === 'placed') {
      filter.isPlaced = true;
    } else if (placedStatus === 'unplaced') {
      filter.isPlaced = { $ne: true };
    }

    if (minCgpa !== '' || maxCgpa !== '') {
      filter.cgpa = {};
      if (minCgpa !== '') filter.cgpa.$gte = parseFloat(minCgpa);
      if (maxCgpa !== '') filter.cgpa.$lte = parseFloat(maxCgpa);
    }

    if (maxBacklogs !== '') {
      filter.backlogs = { $lte: parseInt(maxBacklogs, 10) };
    }

    // Filter by applied drive if opportunityId is provided
    if (opportunityId) {
      const applicantStudentIds = await Application.distinct('studentId', {
        ...(collegeId ? { collegeId } : {}),
        opportunityId,
      });
      filter.user = { $in: applicantStudentIds };
    }

    // Search query matching rollNo, branch, or populated user names
    if (q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      const matchingUsers = await User.find({
        ...(collegeId ? { collegeId } : {}),
        role: 'student',
        $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);
      filter.$or = [
        { rollNo: regex },
        { branch: regex },
        { user: { $in: userIds } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [total, students] = await Promise.all([
      StudentProfile.countDocuments(filter),
      StudentProfile.find(filter)
        .populate('user', 'firstName lastName email role')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    // Attach application counts for each student
    const studentUserIds = students.map((s) => s.user?._id || s.user).filter(Boolean);
    const applications = await Application.find({
      ...(collegeId ? { collegeId } : {}),
      studentId: { $in: studentUserIds },
    })
      .populate('opportunityId', 'companyName title salary status')
      .lean();

    const appsByUser = {};
    for (const app of applications) {
      const uid = app.studentId.toString();
      if (!appsByUser[uid]) appsByUser[uid] = [];
      appsByUser[uid].push(app);
    }

    const enrichedStudents = students.map((s) => {
      const uid = (s.user?._id || s.user)?.toString();
      const userApps = appsByUser[uid] || [];
      const placedApp = userApps.find((a) => a.status === 'Placed' || a.offer?.status === 'Accepted');

      return {
        id: s._id,
        userId: uid,
        firstName: s.user?.firstName || '',
        lastName: s.user?.lastName || '',
        fullName: `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.trim() || 'Student',
        email: s.user?.email || '',
        rollNo: s.rollNo,
        branch: s.branch,
        cgpa: s.cgpa,
        backlogs: s.backlogs,
        graduationYear: s.graduationYear,
        resumeUrl: s.resumeUrl,
        marksheetUrl: s.marksheetUrl,
        isVerifiedByTPO: s.isVerifiedByTPO,
        isPlaced: s.isPlaced || !!placedApp,
        placedCompany: placedApp?.opportunityId?.companyName || null,
        verificationRecord: s.verificationRecord,
        tpoNotesCount: s.tpoNotes?.length || 0,
        applicationsCount: userApps.length,
        createdAt: s.createdAt,
      };
    });

    return res.json({
      students: enrichedStudents,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    console.error('getStudents error:', err);
    return res.status(500).json({ error: { message: err.message || 'Error fetching students directory' } });
  }
};

/**
 * @desc    Get detailed single student record for row drawer
 * @route   GET /api/tpo/students/:id
 * @access  Private (TPO / SuperAdmin)
 */
exports.getStudentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await StudentProfile.findById(id)
      .populate('user', 'firstName lastName email phone role createdAt')
      .populate('tpoNotes.createdBy', 'firstName lastName')
      .lean();

    if (!student) {
      return res.status(404).json({ error: { message: 'Student profile not found.' } });
    }

    if (req.user?.role === 'coordinator') {
      const coordinatorDept = req.deptScope || req.user.department;
      if (!coordinatorDept || (student.branch || '').trim().toLowerCase() !== coordinatorDept.trim().toLowerCase()) {
        return res.status(403).json({
          error: {
            code: 'DEPARTMENT_MISMATCH',
            message: `Access denied. You can only view students in the '${coordinatorDept || 'assigned'}' department.`,
          },
        });
      }
    }

    const collegeId = student.collegeId;
    const userId = student.user?._id || student.user;

    // Fetch applications history
    const applications = await Application.find({
      collegeId,
      studentId: userId,
    })
      .populate('opportunityId', 'companyName title salary type location deadline status')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch student uploaded documents
    const documents = await Document.find({
      collegeId,
      ownerId: userId,
    }).lean();

    // Generate signed download URLs for documents (5-min expiry)
    const storageService = getStorageService();
    const signedDocs = await Promise.all(
      documents.map(async (doc) => {
        try {
          const signed = await storageService.getSignedDownloadUrl({
            key: doc.storageKey,
            expiresInSeconds: 300,
            filename: doc.originalName,
          });
          return {
            id: doc._id,
            originalName: doc.originalName,
            purpose: doc.purpose,
            mimeType: doc.mimeType,
            size: doc.size,
            signedUrl: signed.url,
            uploadedAt: doc.createdAt,
          };
        } catch {
          return null;
        }
      })
    );

    return res.json({
      profile: student,
      applications,
      documents: signedDocs.filter(Boolean),
    });
  } catch (err) {
    console.error('getStudentDetails error:', err);
    return res.status(500).json({ error: { message: err.message } });
  }
};

/**
 * @desc    Bulk verify or reject selected students with cryptographic Ed25519 sealing
 * @route   POST /api/tpo/students/bulk-verify
 * @access  Private (TPO / SuperAdmin)
 */
exports.bulkVerifyStudents = async (req, res) => {
  try {
    const { studentIds, action, rejectionReason } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: { message: 'studentIds array is required.' } });
    }

    const tpoId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;

    let modifiedCount = 0;

    for (const studentId of studentIds) {
      const profile = await StudentProfile.findById(studentId);
      if (!profile) continue;

      if (action === 'approve') {
        const seal = generateVerificationSeal({
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
          rejectionReason: rejectionReason || 'Information requires correction',
          verifiedAt: new Date(),
          verifiedBy: tpoId,
        };
      }

      await profile.save();
      modifiedCount++;
    }

    await AuditLog.create({
      collegeId,
      actorId: tpoId,
      action: action === 'approve' ? 'STUDENT_BULK_VERIFIED' : 'STUDENT_BULK_REJECTED',
      resource: 'StudentProfile',
      metadata: { count: modifiedCount, action, rejectionReason },
    });

    return res.json({
      success: true,
      message: `Successfully processed ${modifiedCount} student record(s).`,
      modifiedCount,
    });
  } catch (err) {
    console.error('bulkVerifyStudents error:', err);
    return res.status(500).json({ error: { message: err.message } });
  }
};

/**
 * @desc    Dry-run preview and header mapping validation for student CSV/Excel bulk upload
 * @route   POST /api/tpo/students/bulk-import/preview
 * @access  Private (TPO / SuperAdmin)
 */
exports.previewBulkImport = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: { message: 'Excel or CSV file buffer is required.' } });
    }

    const collegeId = req.tenant?.collegeId || req.user?.collegeId;

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const rawRows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ error: { message: 'Uploaded sheet contains no data rows.' } });
    }

    const detectedHeaders = Object.keys(rawRows[0]);

    // Intelligent auto-detection of column mapping
    const headerMapping = {};
    for (const h of detectedHeaders) {
      const lower = h.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (lower.includes('roll') || lower.includes('reg') || lower.includes('hallticket')) headerMapping.rollNo = h;
      else if (lower.includes('firstname') || lower === 'first') headerMapping.firstName = h;
      else if (lower.includes('lastname') || lower === 'last') headerMapping.lastName = h;
      else if (lower.includes('name') && !headerMapping.firstName) headerMapping.firstName = h;
      else if (lower.includes('email') || lower.includes('mail')) headerMapping.email = h;
      else if (lower.includes('branch') || lower.includes('dept') || lower.includes('department')) headerMapping.branch = h;
      else if (lower.includes('cgpa') || lower.includes('gpa') || lower.includes('percentage')) headerMapping.cgpa = h;
      else if (lower.includes('backlog') || lower.includes('arrear')) headerMapping.backlogs = h;
      else if (lower.includes('year') || lower.includes('grad') || lower.includes('batch')) headerMapping.graduationYear = h;
      else if (lower.includes('phone') || lower.includes('mobile')) headerMapping.phone = h;
    }

    // Existing roll numbers and emails in the college for duplicate check
    const [existingProfiles, existingUsers] = await Promise.all([
      StudentProfile.find({ collegeId }).select('rollNo').lean(),
      User.find({ collegeId }).select('email').lean(),
    ]);

    const existingRolls = new Set(existingProfiles.map((p) => p.rollNo?.toUpperCase()));
    const existingEmails = new Set(existingUsers.map((u) => u.email?.toLowerCase()));

    const seenRollsInFile = new Set();
    const seenEmailsInFile = new Set();

    const rowErrors = [];
    const previewData = [];

    rawRows.forEach((row, idx) => {
      const rowNum = idx + 2; // 1-indexed, accounting for header row
      const rollNo = String(row[headerMapping.rollNo] || '').trim();
      const email = String(row[headerMapping.email] || '').trim().toLowerCase();
      const firstName = String(row[headerMapping.firstName] || '').trim();
      const lastName = String(row[headerMapping.lastName] || '').trim();
      const branch = String(row[headerMapping.branch] || 'Computer Science').trim();
      const cgpa = parseFloat(row[headerMapping.cgpa]) || 0;
      const backlogs = parseInt(row[headerMapping.backlogs], 10) || 0;
      const graduationYear = parseInt(row[headerMapping.graduationYear], 10) || 2026;

      const errors = [];

      if (!rollNo) errors.push('Roll number is missing');
      else if (existingRolls.has(rollNo.toUpperCase())) errors.push(`Roll number '${rollNo}' already registered in institution`);
      else if (seenRollsInFile.has(rollNo.toUpperCase())) errors.push(`Duplicate roll number '${rollNo}' within uploaded file`);
      else seenRollsInFile.add(rollNo.toUpperCase());

      if (!email || !email.includes('@')) errors.push('Valid email address is missing');
      else if (existingEmails.has(email)) errors.push(`Email '${email}' already registered in institution`);
      else if (seenEmailsInFile.has(email)) errors.push(`Duplicate email '${email}' within file`);
      else seenEmailsInFile.add(email);

      if (cgpa < 0 || cgpa > 100) errors.push('CGPA must be between 0 and 100');

      const isValid = errors.length === 0;

      if (!isValid) {
        rowErrors.push({ rowNumber: rowNum, rollNo, email, errors });
      }

      previewData.push({
        rowNumber: rowNum,
        rollNo,
        name: `${firstName} ${lastName}`.trim() || 'Student',
        firstName: firstName || 'Student',
        lastName,
        email,
        branch,
        cgpa,
        backlogs,
        graduationYear,
        isValid,
        errors,
      });
    });

    return res.json({
      totalRows: rawRows.length,
      validCount: rawRows.length - rowErrors.length,
      invalidCount: rowErrors.length,
      detectedHeaders,
      suggestedMapping: headerMapping,
      errors: rowErrors,
      preview: previewData.slice(0, 50), // first 50 rows preview
    });
  } catch (err) {
    console.error('previewBulkImport error:', err);
    return res.status(500).json({ error: { message: err.message || 'Error processing sheet' } });
  }
};

/**
 * @desc    Commit bulk student creation from validated sheet data
 * @route   POST /api/tpo/students/bulk-import/commit
 * @access  Private (TPO / SuperAdmin)
 */
exports.commitBulkImport = async (req, res) => {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: { message: 'rows array is required.' } });
    }

    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const tpoId = req.user.userId || req.user.id;

    let createdCount = 0;
    const skipped = [];

    for (const r of rows) {
      try {
        const rollNo = String(r.rollNo || '').trim();
        const email = String(r.email || '').trim().toLowerCase();
        if (!rollNo || !email) {
          skipped.push({ rollNo, reason: 'Missing rollNo or email' });
          continue;
        }

        // Generate temporary password (student can reset upon initial login)
        const tempPassword = `PE@${rollNo.replace(/[^a-zA-Z0-9]/g, '')}`;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        const user = await User.create({
          collegeId,
          email,
          password: hashedPassword,
          firstName: r.firstName || 'Student',
          lastName: r.lastName || '',
          role: 'student',
        });

        await StudentProfile.create({
          collegeId,
          user: user._id,
          rollNo,
          branch: r.branch || 'Computer Science',
          cgpa: parseFloat(r.cgpa) || 0,
          backlogs: parseInt(r.backlogs, 10) || 0,
          graduationYear: parseInt(r.graduationYear, 10) || 2026,
          isVerifiedByTPO: false,
        });

        createdCount++;
      } catch (rowErr) {
        skipped.push({ rollNo: r.rollNo, reason: rowErr.message });
      }
    }

    await AuditLog.create({
      collegeId,
      actorId: tpoId,
      action: 'STUDENTS_BULK_IMPORTED',
      resource: 'StudentProfile',
      metadata: { createdCount, skippedCount: skipped.length },
    });

    return res.json({
      success: true,
      createdCount,
      skippedCount: skipped.length,
      skipped,
      message: `Successfully imported ${createdCount} student profile(s).`,
    });
  } catch (err) {
    console.error('commitBulkImport error:', err);
    return res.status(500).json({ error: { message: err.message } });
  }
};

/**
 * @desc    Manually add single student
 * @route   POST /api/tpo/students/manual
 * @access  Private (TPO / SuperAdmin)
 */
exports.addStudentManual = async (req, res) => {
  try {
    const { firstName, lastName, email, rollNo, branch, cgpa, backlogs, graduationYear, phone } = req.body;
    if (!email || !rollNo) {
      return res.status(400).json({ error: { message: 'Email and roll number are required.' } });
    }

    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const tpoId = req.user.userId || req.user.id;

    // Duplicate check
    const existingUser = await User.findOne({ collegeId, email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: { message: `Student with email '${email}' already exists.` } });
    }

    const existingProfile = await StudentProfile.findOne({ collegeId, rollNo: rollNo.trim() });
    if (existingProfile) {
      return res.status(400).json({ error: { message: `Student with roll number '${rollNo}' already exists.` } });
    }

    const tempPassword = `PE@${rollNo.replace(/[^a-zA-Z0-9]/g, '')}`;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const user = await User.create({
      collegeId,
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName: firstName || 'Student',
      lastName: lastName || '',
      role: 'student',
    });

    const profile = await StudentProfile.create({
      collegeId,
      user: user._id,
      rollNo: rollNo.trim(),
      branch: branch || 'Computer Science',
      cgpa: parseFloat(cgpa) || 0,
      backlogs: parseInt(backlogs, 10) || 0,
      graduationYear: parseInt(graduationYear, 10) || 2026,
      personalInfo: { phone: phone || '' },
      isVerifiedByTPO: false,
    });

    await AuditLog.create({
      collegeId,
      actorId: tpoId,
      action: 'STUDENT_MANUALLY_CREATED',
      resource: 'StudentProfile',
      metadata: { rollNo, email },
    });

    return res.status(201).json({
      success: true,
      message: 'Student profile created successfully.',
      student: { id: profile._id, rollNo, email },
    });
  } catch (err) {
    console.error('addStudentManual error:', err);
    return res.status(500).json({ error: { message: err.message } });
  }
};

/**
 * @desc    Add TPO-private note to student profile
 * @route   PUT /api/tpo/students/:id/notes
 * @access  Private (TPO / SuperAdmin)
 */
exports.addStudentNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({ error: { message: 'Note text cannot be empty.' } });
    }

    const tpoId = req.user.userId || req.user.id;
    const profile = await StudentProfile.findById(id);
    if (!profile) {
      return res.status(404).json({ error: { message: 'Student profile not found.' } });
    }

    if (req.user?.role === 'coordinator') {
      const coordinatorDept = req.deptScope || req.user.department;
      if (!coordinatorDept || (profile.branch || '').trim().toLowerCase() !== coordinatorDept.trim().toLowerCase()) {
        return res.status(403).json({
          error: {
            code: 'DEPARTMENT_MISMATCH',
            message: `Access denied. You can only annotate students in the '${coordinatorDept || 'assigned'}' department.`,
          },
        });
      }
    }

    profile.tpoNotes.push({
      note: note.trim(),
      createdBy: tpoId,
      createdAt: new Date(),
    });

    await profile.save();

    return res.json({
      success: true,
      notes: profile.tpoNotes,
    });
  } catch (err) {
    console.error('addStudentNote error:', err);
    return res.status(500).json({ error: { message: err.message } });
  }
};

/**
 * @desc    Edit existing student profile and user details
 * @route   PUT /api/tpo/students/:id
 * @access  Private (TPO / SuperAdmin / Coordinator)
 */
exports.updateStudentManual = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, rollNo, branch, cgpa, backlogs, graduationYear, phone } = req.body;
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const tpoId = req.user.userId || req.user.id;

    const profile = await StudentProfile.findById(id).populate('user');
    if (!profile) {
      return res.status(404).json({ error: { message: 'Student profile not found.' } });
    }

    if (rollNo && rollNo.trim() !== profile.rollNo) {
      const duplicateRoll = await StudentProfile.findOne({
        collegeId,
        rollNo: rollNo.trim(),
        _id: { $ne: id },
      });
      if (duplicateRoll) {
        return res.status(400).json({ error: { message: `Student with roll number '${rollNo}' already exists.` } });
      }
      profile.rollNo = rollNo.trim();
    }

    if (branch) profile.branch = branch;
    if (cgpa !== undefined) profile.cgpa = parseFloat(cgpa);
    if (backlogs !== undefined) profile.backlogs = parseInt(backlogs, 10);
    if (graduationYear !== undefined) profile.graduationYear = parseInt(graduationYear, 10);
    if (phone !== undefined) {
      profile.personalInfo = profile.personalInfo || {};
      profile.personalInfo.phone = phone;
    }

    await profile.save();

    if (profile.user) {
      if (firstName !== undefined) profile.user.firstName = firstName;
      if (lastName !== undefined) profile.user.lastName = lastName;
      if (email && email.toLowerCase() !== profile.user.email) {
        const duplicateEmail = await User.findOne({
          collegeId,
          email: email.toLowerCase(),
          _id: { $ne: profile.user._id },
        });
        if (duplicateEmail) {
          return res.status(400).json({ error: { message: `Student with email '${email}' already exists.` } });
        }
        profile.user.email = email.toLowerCase();
      }
      await profile.user.save();
    }

    await AuditLog.create({
      collegeId,
      actorId: tpoId,
      action: 'STUDENT_MANUALLY_UPDATED',
      resource: 'StudentProfile',
      metadata: { studentId: id, rollNo: profile.rollNo },
    });

    return res.json({
      success: true,
      message: 'Student profile updated successfully.',
      student: { id: profile._id, rollNo: profile.rollNo },
    });
  } catch (err) {
    console.error('updateStudentManual error:', err);
    return res.status(500).json({ error: { message: err.message } });
  }
};

/**
 * @desc    Bulk enroll / add students to an opportunity drive
 * @route   POST /api/tpo/students/bulk-add-to-drive
 * @access  Private (TPO / SuperAdmin)
 */
exports.bulkAddToDrive = async (req, res) => {
  try {
    const { studentIds, opportunityId } = req.body;
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0 || !opportunityId) {
      return res.status(400).json({ error: { message: 'studentIds array and opportunityId are required.' } });
    }

    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const tpoId = req.user.userId || req.user.id;

    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ error: { message: 'Placement drive not found.' } });
    }

    const profiles = await StudentProfile.find({
      _id: { $in: studentIds },
      ...(collegeId ? { collegeId } : {}),
    });

    let enrolledCount = 0;
    for (const prof of profiles) {
      const studentUserId = prof.user;
      const existingApp = await Application.findOne({
        opportunityId,
        studentId: studentUserId,
      });

      if (!existingApp) {
        await Application.create({
          collegeId,
          opportunityId,
          studentId: studentUserId,
          status: 'Applied',
          currentRound: opportunity.rounds?.[0]?.name || 'Round 1',
          appliedAt: new Date(),
        });
        enrolledCount++;
      }
    }

    await AuditLog.create({
      collegeId,
      actorId: tpoId,
      action: 'STUDENTS_BULK_ENROLLED_TO_DRIVE',
      resource: 'Opportunity',
      metadata: { opportunityId, enrolledCount, totalSelected: studentIds.length },
    });

    return res.json({
      success: true,
      message: `Enrolled ${enrolledCount} candidate(s) to ${opportunity.title} • ${opportunity.companyName}`,
      enrolledCount,
    });
  } catch (err) {
    console.error('bulkAddToDrive error:', err);
    return res.status(500).json({ error: { message: err.message } });
  }
};

