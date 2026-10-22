const crypto = require('crypto');
const pdfParse = require('pdf-parse');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const MockInterviewSession = require('../models/MockInterviewSession');
const { anthropicService } = require('../services/ai/anthropicService');
const aiCache = require('../services/ai/aiCache');
const { computeStudentPlacementRisk } = require('../services/ai/fallbackEngine');
const { getStorageService } = require('../services/storage');

/**
 * Helper to extract text from a stored resume document
 */
async function extractResumeText(studentId, collegeId, profile) {
  let extractedText = '';

  try {
    const storageService = getStorageService();
    const primaryVersion = profile.resumeVersions?.find((r) => r.isPrimary) || profile.resumeVersions?.[0];

    if (primaryVersion && primaryVersion.storageKey) {
      const fileData = await storageService.getFileBuffer(primaryVersion.storageKey);
      if (fileData && fileData.buffer) {
        if (primaryVersion.storageKey.endsWith('.pdf') || fileData.contentType === 'application/pdf') {
          const parsed = await pdfParse(fileData.buffer);
          extractedText = parsed.text || '';
        } else {
          // Plain text / markdown fallback
          extractedText = fileData.buffer.toString('utf8');
        }
      }
    }
  } catch (err) {
    // Non-fatal if storage file extraction fails, fall back to profile data
    console.warn('PDF text extraction error, using profile structured fields:', err.message);
  }

  // Combine with profile data
  const profileCorpus = [
    `Candidate Profile: ${profile.rollNo} - ${profile.branch}`,
    `Skills: ${(profile.skills || []).join(', ')}`,
    `CGPA: ${profile.cgpa || 0}`,
    `Projects: ${(profile.projects || [])
      .map((p) => `${p.title}: ${p.description || ''} (${(p.technologies || []).join(', ')})`)
      .join('; ')}`,
    `Certifications: ${(profile.certifications || []).map((c) => c.name).join(', ')}`,
  ].join('\n');

  return (extractedText + '\n\n' + profileCorpus).trim();
}

/**
 * 1. Resume vs Drive Match
 * POST /api/ai/resume-match
 */
exports.checkResumeMatch = async (req, res) => {
  try {
    const { driveId } = req.body;
    const studentUserId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    if (!driveId) {
      return res.status(400).json({ error: { message: 'driveId is required.' } });
    }

    const [opportunity, profile] = await Promise.all([
      Opportunity.findById(driveId).lean(),
      StudentProfile.findOne({ user: studentUserId, ...(collegeId ? { collegeId } : {}) }).lean(),
    ]);

    if (!opportunity) {
      return res.status(404).json({ error: { message: 'Placement drive not found.' } });
    }

    if (!profile) {
      return res.status(404).json({ error: { message: 'Student profile not found. Please complete your profile.' } });
    }

    const jdText = `Role: ${opportunity.title}\nCompany: ${opportunity.companyName}\nDescription: ${opportunity.description}\n` +
      `Skills: ${(opportunity.skillsRequired || []).join(', ')}\n` +
      `Eligibility: Min CGPA ${opportunity.eligibilityRules?.minCgpa || 0}, Max Backlogs ${opportunity.eligibilityRules?.maxBacklogs || 0}, Branches: ${(opportunity.eligibilityRules?.allowedBranches || []).join(', ')}`;

    // Extract resume text
    const resumeText = await extractResumeText(studentUserId, collegeId, profile);

    // Compute hashes for deterministic caching
    const resumeHash = crypto.createHash('sha256').update(resumeText).digest('hex');
    const jdHash = crypto.createHash('sha256').update(jdText).digest('hex');
    const cacheKey = aiCache.generateKey('resume_match', resumeHash, jdHash);

    const cached = aiCache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        cached: true,
        result: cached,
      });
    }

    // Call Anthropic service
    const matchResult = await anthropicService.matchResumeWithDrive({
      userId: studentUserId,
      userRole: req.user.role,
      collegeId,
      resumeText,
      jdText,
      eligibilityRules: opportunity.eligibilityRules || {},
      profile,
    });

    aiCache.set(cacheKey, matchResult);

    res.json({
      success: true,
      cached: false,
      result: matchResult,
    });
  } catch (err) {
    console.error('checkResumeMatch error:', err);
    res.status(err.status || 500).json({
      error: {
        code: err.status === 429 ? 'RATE_LIMIT_EXCEEDED' : 'AI_ERROR',
        message: err.message || 'Failed to analyze resume match.',
        retryAfterSeconds: err.retryAfterSeconds,
      },
    });
  }
};

/**
 * 2. Mock Interview Engine
 */
exports.startMockInterview = async (req, res) => {
  try {
    const { company, role, roundType = 'Technical' } = req.body;
    const studentUserId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    if (!company || !role) {
      return res.status(400).json({ error: { message: 'Company and role are required.' } });
    }

    const session = new MockInterviewSession({
      collegeId,
      studentId: studentUserId,
      company: company.trim(),
      role: role.trim(),
      roundType,
      status: 'In_Progress',
      currentQuestionIndex: 1,
      maxQuestions: 5,
      transcript: [],
    });

    // Generate first question
    const firstTurn = await anthropicService.mockInterviewTurn({
      userId: studentUserId,
      userRole: req.user.role,
      collegeId,
      session,
      studentAnswer: '',
    });

    session.transcript.push({
      role: 'ai',
      content: firstTurn.nextQuestion,
      questionNumber: 1,
      timestamp: new Date(),
    });

    await session.save();

    res.status(201).json({
      success: true,
      sessionId: session._id,
      session: {
        id: session._id,
        company: session.company,
        role: session.role,
        roundType: session.roundType,
        currentQuestionIndex: 1,
        maxQuestions: session.maxQuestions,
        transcript: session.transcript,
      },
    });
  } catch (err) {
    console.error('startMockInterview error:', err);
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
};

exports.respondMockInterview = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { answer } = req.body;
    const studentUserId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ error: { message: 'Answer text is required.' } });
    }

    const session = await MockInterviewSession.findOne({
      _id: sessionId,
      studentId: studentUserId,
    });

    if (!session) {
      return res.status(404).json({ error: { message: 'Mock interview session not found.' } });
    }

    if (session.status === 'Completed') {
      return res.status(400).json({ error: { message: 'This interview session has already been concluded.' } });
    }

    // Append student answer
    session.transcript.push({
      role: 'student',
      content: answer.trim(),
      timestamp: new Date(),
    });

    // Generate AI response or conclusion
    const turnResult = await anthropicService.mockInterviewTurn({
      userId: studentUserId,
      userRole: req.user.role,
      collegeId,
      session,
      studentAnswer: answer.trim(),
    });

    if (turnResult.isCompleted) {
      session.status = 'Completed';
      session.completedAt = new Date();
      session.rubricScore = turnResult.rubricScore;
      session.strengths = turnResult.strengths || [];
      session.weaknesses = turnResult.weaknesses || [];
      session.studyPlan = turnResult.studyPlan || [];
      session.feedbackSummary = turnResult.feedbackSummary || '';

      session.transcript.push({
        role: 'system',
        content: `Interview Concluded! Overall Rubric Score: ${turnResult.rubricScore?.overallScore}%`,
        timestamp: new Date(),
      });
    } else {
      session.currentQuestionIndex += 1;
      session.transcript.push({
        role: 'ai',
        content: turnResult.nextQuestion,
        questionNumber: session.currentQuestionIndex,
        timestamp: new Date(),
      });
    }

    await session.save();

    res.json({
      success: true,
      session: {
        id: session._id,
        status: session.status,
        currentQuestionIndex: session.currentQuestionIndex,
        maxQuestions: session.maxQuestions,
        transcript: session.transcript,
        rubricScore: session.rubricScore,
        strengths: session.strengths,
        weaknesses: session.weaknesses,
        studyPlan: session.studyPlan,
        feedbackSummary: session.feedbackSummary,
      },
    });
  } catch (err) {
    console.error('respondMockInterview error:', err);
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
};

exports.getMockInterviewHistory = async (req, res) => {
  try {
    const studentUserId = req.user.userId || req.user.id;

    const sessions = await MockInterviewSession.find({
      studentId: studentUserId,
    })
      .sort({ createdAt: -1 })
      .select('company role roundType status rubricScore startedAt completedAt')
      .lean();

    res.json({
      success: true,
      sessions,
    });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
};

exports.getMockInterviewSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const studentUserId = req.user.userId || req.user.id;

    const session = await MockInterviewSession.findOne({
      _id: sessionId,
      studentId: studentUserId,
    }).lean();

    if (!session) {
      return res.status(404).json({ error: { message: 'Session not found.' } });
    }

    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
};

/**
 * 3. Company Prep Pack Aggregator
 * GET /api/ai/prep-pack/:companyName
 */
exports.getCompanyPrepPack = async (req, res) => {
  try {
    const { companyName } = req.params;
    const studentUserId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    if (!companyName) {
      return res.status(400).json({ error: { message: 'companyName is required.' } });
    }

    // Query drives for this company
    const drives = await Opportunity.find({
      ...(collegeId ? { collegeId } : {}),
      companyName: new RegExp(`^${companyName.trim()}$`, 'i'),
    }).lean();

    const driveIds = drives.map((d) => d._id);

    // Query past feedback for this company's drives
    const applications = await Application.find({
      opportunityId: { $in: driveIds },
      'feedback.0': { $exists: true },
    })
      .select('feedback currentRound')
      .lean();

    const pastFeedback = applications.flatMap((a) => a.feedback || []);

    const prepPack = await anthropicService.generatePrepPack({
      userId: studentUserId,
      userRole: req.user.role,
      collegeId,
      companyName: companyName.trim(),
      drives,
      pastFeedback,
    });

    res.json({
      success: true,
      prepPack,
    });
  } catch (err) {
    console.error('getCompanyPrepPack error:', err);
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
};

/**
 * 4. Transparent Rule-Based Placement-Risk Predictor (For TPOs)
 * GET /api/ai/placement-risk
 * STRICT MANDATE: NO gender, caste, religion, or demographic features!
 */
exports.getPlacementRisk = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user.collegeId;
    const { branch, riskLevel } = req.query;

    const studentQuery = {
      ...(collegeId ? { collegeId } : {}),
    };
    if (branch) studentQuery.branch = branch;

    const [profiles, users, openDrivesCount] = await Promise.all([
      StudentProfile.find(studentQuery).lean(),
      User.find({ ...(collegeId ? { collegeId } : {}), role: 'student' }).select('firstName lastName email').lean(),
      Opportunity.countDocuments({ ...(collegeId ? { collegeId } : {}), status: 'Open' }),
    ]);

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    // Bulk evaluate each student
    const evaluatedStudents = await Promise.all(
      profiles.map(async (profile) => {
        const studentUser = userMap.get(profile.user?.toString()) || {};
        const [apps, mocks] = await Promise.all([
          Application.find({ studentId: profile.user }).select('status offer').lean(),
          MockInterviewSession.find({ studentId: profile.user, status: 'Completed' })
            .select('rubricScore')
            .lean(),
        ]);

        const mergedStudent = {
          ...profile,
          firstName: studentUser.firstName,
          lastName: studentUser.lastName,
          email: studentUser.email,
        };

        return computeStudentPlacementRisk(mergedStudent, apps, openDrivesCount, mocks);
      })
    );

    // Optional filter by riskLevel
    const filtered = riskLevel
      ? evaluatedStudents.filter((s) => s.riskLevel.toLowerCase() === riskLevel.toLowerCase())
      : evaluatedStudents;

    // Sort by riskScore descending
    filtered.sort((a, b) => b.riskScore - a.riskScore);

    const counts = {
      total: evaluatedStudents.length,
      high: evaluatedStudents.filter((s) => s.riskLevel === 'High').length,
      medium: evaluatedStudents.filter((s) => s.riskLevel === 'Medium').length,
      low: evaluatedStudents.filter((s) => s.riskLevel === 'Low').length,
      placed: evaluatedStudents.filter((s) => s.isPlaced).length,
    };

    res.json({
      success: true,
      counts,
      students: filtered,
    });
  } catch (err) {
    console.error('getPlacementRisk error:', err);
    res.status(500).json({ error: { message: err.message } });
  }
};

/**
 * 5. Natural-Language TPO Assistant
 * POST /api/ai/nl-assistant/query
 */
exports.naturalLanguageTpoQuery = async (req, res) => {
  try {
    const { query } = req.body;
    const tpoUserId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: { message: 'Query string is required.' } });
    }

    const parsedResult = await anthropicService.parseNaturalLanguageQuery({
      userId: tpoUserId,
      userRole: req.user.role,
      collegeId,
      query: query.trim(),
    });

    const parsedFilter = parsedResult.parsedFilter || {};
    const applicationFilter = parsedResult.applicationFilter || 'all';

    // Build safe scoped MongoDB query
    const mongoQuery = {
      ...(collegeId ? { collegeId } : {}),
      ...parsedFilter,
    };

    let matchedProfiles = await StudentProfile.find(mongoQuery)
      .populate('user', 'firstName lastName email')
      .lean();

    // Filter by application status if requested
    if (applicationFilter === 'unapplied') {
      const studentIds = matchedProfiles.map((p) => p.user?._id || p.user);
      const appliedStudentIds = await Application.distinct('studentId', {
        studentId: { $in: studentIds },
      });
      const appliedSet = new Set(appliedStudentIds.map((id) => id.toString()));
      matchedProfiles = matchedProfiles.filter(
        (p) => !appliedSet.has((p.user?._id || p.user).toString())
      );
    } else if (applicationFilter === 'placed') {
      const placedStudentIds = await Application.distinct('studentId', {
        status: 'Placed',
      });
      const placedSet = new Set(placedStudentIds.map((id) => id.toString()));
      matchedProfiles = matchedProfiles.filter((p) =>
        placedSet.has((p.user?._id || p.user).toString())
      );
    } else if (applicationFilter === 'unplaced') {
      const placedStudentIds = await Application.distinct('studentId', {
        status: 'Placed',
      });
      const placedSet = new Set(placedStudentIds.map((id) => id.toString()));
      matchedProfiles = matchedProfiles.filter(
        (p) => !placedSet.has((p.user?._id || p.user).toString())
      );
    }

    const students = matchedProfiles.map((p) => ({
      id: p._id,
      userId: p.user?._id,
      name: `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.trim() || 'Student',
      email: p.user?.email || 'N/A',
      rollNo: p.rollNo,
      branch: p.branch,
      cgpa: p.cgpa,
      backlogs: p.backlogs,
      isVerifiedByTPO: p.isVerifiedByTPO,
    }));

    res.json({
      success: true,
      explanation: parsedResult.explanation || `Filtered ${students.length} students matching criteria`,
      parsedFilter,
      applicationFilter,
      totalCount: students.length,
      students,
      isAiGenerated: true,
    });
  } catch (err) {
    console.error('naturalLanguageTpoQuery error:', err);
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
};

/**
 * 6. Drive Description Assistant (Raw JD parser)
 * POST /api/ai/parse-jd
 */
exports.parseDriveDescription = async (req, res) => {
  try {
    const { rawJdText } = req.body;
    const userId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    if (!rawJdText || !rawJdText.trim()) {
      return res.status(400).json({ error: { message: 'rawJdText is required.' } });
    }

    const structuredJd = await anthropicService.parseDriveDescription({
      userId,
      userRole: req.user.role,
      collegeId,
      rawJdText: rawJdText.trim(),
    });

    res.json({
      success: true,
      structuredJd,
      isAiGenerated: true,
    });
  } catch (err) {
    console.error('parseDriveDescription error:', err);
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
};

/**
 * 7. Feedback Summarizer (Requires TPO Approval)
 * POST /api/ai/summarize-feedback
 */
exports.summarizeFeedback = async (req, res) => {
  try {
    const { applicationId, rawNotes, rating = 4 } = req.body;
    const userId = req.user.userId || req.user.id;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    if (!rawNotes || !rawNotes.trim()) {
      return res.status(400).json({ error: { message: 'rawNotes text is required.' } });
    }

    const summaryResult = await anthropicService.summarizeFeedback({
      userId,
      userRole: req.user.role,
      collegeId,
      rawNotes: rawNotes.trim(),
      rating: Number(rating),
    });

    // If an applicationId is provided, attach as pending draft
    if (applicationId) {
      const application = await Application.findById(applicationId);
      if (application) {
        if (!application.feedback) application.feedback = [];
        application.feedback.push({
          rating: Number(rating),
          roundName: 'AI Summarized Evaluation',
          strengths: (summaryResult.keyStrengths || []).join('; '),
          gaps: (summaryResult.areasForImprovement || []).join('; '),
          comments: summaryResult.summaryParagraph,
          visibleToStudent: false, // Hidden until TPO approves
          submittedBy: userId,
          submittedAt: new Date(),
        });
        await application.save();
      }
    }

    res.json({
      success: true,
      summary: summaryResult,
      isAiGenerated: true,
      requiresTpoApproval: true,
    });
  } catch (err) {
    console.error('summarizeFeedback error:', err);
    res.status(err.status || 500).json({ error: { message: err.message } });
  }
};

/**
 * Approve AI Summarized Feedback
 * PATCH /api/ai/feedback/:appId/approve
 */
exports.approveFeedback = async (req, res) => {
  try {
    const { appId } = req.params;
    const { feedbackIndex = 0, editedComments, visibleToStudent = true } = req.body;
    const collegeId = req.tenant?.collegeId || req.user.collegeId;

    const application = await Application.findOne({
      _id: appId,
      ...(collegeId ? { collegeId } : {}),
    });

    if (!application) {
      return res.status(404).json({ error: { message: 'Application not found.' } });
    }

    if (!application.feedback || !application.feedback[feedbackIndex]) {
      return res.status(404).json({ error: { message: 'Feedback entry not found on application.' } });
    }

    if (editedComments) {
      application.feedback[feedbackIndex].comments = editedComments;
    }
    application.feedback[feedbackIndex].visibleToStudent = Boolean(visibleToStudent);

    await application.save();

    res.json({
      success: true,
      message: 'Feedback reviewed and approved for candidate release.',
      feedback: application.feedback[feedbackIndex],
    });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
};
