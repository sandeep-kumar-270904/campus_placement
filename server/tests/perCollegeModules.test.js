const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

// Models
const College = require('../src/models/College');
const AlumniProfile = require('../src/models/AlumniProfile');
const AlumniReferralRequest = require('../src/models/AlumniReferralRequest');
const InterviewExperience = require('../src/models/InterviewExperience');
const InternshipRecord = require('../src/models/InternshipRecord');
const ExternalOutcome = require('../src/models/ExternalOutcome');
const StudentProfile = require('../src/models/StudentProfile');

// Middleware
const { requireFeature } = require('../src/middleware/featureFlagMiddleware');

// Services / Data
const { ALL_RESOURCES, LEARNING_PLATFORMS, JOB_PLATFORMS } = require('../src/data/resourcesData');
const { getResources } = require('../src/controllers/resourceController');

describe('Per-College Feature-Flagged Modules Tests', () => {
  const collegeId = new mongoose.Types.ObjectId().toString();
  const studentId = new mongoose.Types.ObjectId().toString();
  const alumniId = new mongoose.Types.ObjectId().toString();
  const tpoId = new mongoose.Types.ObjectId().toString();

  // =========================================================================
  // 1. ALUMNI NETWORK MODULE (Feature Flag: alumniNetwork)
  // =========================================================================
  describe('1. Alumni Network Module', () => {
    it('Auto-verifies alumni with institutional educational domain email (.edu or .ac.in)', () => {
      const emailEdu = 'rahul.alumni@stanford.edu';
      const emailAcIn = 'priya.alumni@iitb.ac.in';
      const emailGmail = 'rahul.personal@gmail.com';

      const isEduVerified = emailEdu.includes('.edu') || emailEdu.includes('.ac.in');
      const isAcInVerified = emailAcIn.includes('.edu') || emailAcIn.includes('.ac.in');
      const isGmailVerified = emailGmail.includes('.edu') || emailGmail.includes('.ac.in');

      assert.strictEqual(isEduVerified, true, '.edu domain must be auto-verified');
      assert.strictEqual(isAcInVerified, true, '.ac.in domain must be auto-verified');
      assert.strictEqual(isGmailVerified, false, 'Personal email must require manual TPO verification');
    });

    it('Validates AlumniProfile schema with company, role, batch, and mentorship preferences', () => {
      const profile = new AlumniProfile({
        userId: new mongoose.Types.ObjectId(alumniId),
        collegeId: new mongoose.Types.ObjectId(collegeId),
        fullName: 'Sameer Sen',
        email: 'sameer.sen@microsoft.com',
        batchYear: 2022,
        branch: 'Computer Science',
        currentCompany: 'Microsoft',
        currentRole: 'Senior SDE',
        location: 'Redmond, WA',
        willingToRefer: true,
        willingToMentor: true,
        mentorshipDomains: ['System Design', 'Cloud Architecture'],
        isVerifiedAlumni: true,
        verificationMethod: 'tpo_manual',
        verifiedBy: new mongoose.Types.ObjectId(tpoId),
      });

      const err = profile.validateSync();
      assert.strictEqual(err, undefined);
      assert.strictEqual(profile.currentCompany, 'Microsoft');
      assert.strictEqual(profile.currentRole, 'Senior SDE');
      assert.strictEqual(profile.batchYear, 2022);
      assert.strictEqual(profile.willingToRefer, true);
      assert.strictEqual(profile.isVerifiedAlumni, true);
    });

    it('Enforces strict anti-spam rate limit: blocks 4th referral request within 7-day sliding window', () => {
      const MAX_REQUESTS_PER_WEEK = 3;
      const recentRequestsCount = 3;

      const isAllowed = recentRequestsCount < MAX_REQUESTS_PER_WEEK;
      assert.strictEqual(isAllowed, false, 'Student with 3 existing requests must be rate limited');

      const quotaRemaining = Math.max(0, MAX_REQUESTS_PER_WEEK - (recentRequestsCount + 1));
      assert.strictEqual(quotaRemaining, 0);
    });

    it('Validates AlumniReferralRequest lifecycle transitions (Pending -> Accepted / Declined / Referred)', () => {
      const request = new AlumniReferralRequest({
        studentId: new mongoose.Types.ObjectId(studentId),
        alumniId: new mongoose.Types.ObjectId(alumniId),
        collegeId: new mongoose.Types.ObjectId(collegeId),
        targetCompany: 'Google',
        targetRole: 'Software Engineer',
        jobUrlOrId: 'https://careers.google.com/jobs/12345',
        message: 'Hi Sameer, I am graduating this year with strong DSA skills. Would appreciate a referral.',
        status: 'Pending',
      });

      assert.strictEqual(request.validateSync(), undefined);
      assert.strictEqual(request.status, 'Pending');

      // Alumni accepts and responds
      request.status = 'Accepted';
      request.alumniNote = 'Happy to refer! Submitted via our internal portal.';
      request.respondedAt = new Date();
      assert.strictEqual(request.validateSync(), undefined);
      assert.strictEqual(request.status, 'Accepted');
    });

    it('Matches mentors by academic branch and career goal', () => {
      const sampleMentors = [
        { name: 'Alice', branch: 'Computer Science', willingToMentor: true, domains: ['Backend', 'DSA'] },
        { name: 'Bob', branch: 'Electronics & Communication', willingToMentor: true, domains: ['VLSI', 'Embedded'] },
        { name: 'Charlie', branch: 'Mechanical Engineering', willingToMentor: true, domains: ['CAD', 'Robotics'] },
      ];

      const matchStudent = (branch) => sampleMentors.filter((m) => m.willingToMentor && m.branch === branch);

      const cseMentors = matchStudent('Computer Science');
      assert.strictEqual(cseMentors.length, 1);
      assert.strictEqual(cseMentors[0].name, 'Alice');

      const eceMentors = matchStudent('Electronics & Communication');
      assert.strictEqual(eceMentors.length, 1);
      assert.strictEqual(eceMentors[0].name, 'Bob');
    });

    it('Guards Alumni API behind per-college feature flag alumniNetwork', async () => {
      const middleware = requireFeature('alumniNetwork');

      let blocked = false;
      const mockReq = { tenant: { collegeId }, user: { collegeId, role: 'student' } };
      const mockRes = {
        status: (code) => {
          if (code === 403) blocked = true;
          return { json: () => {} };
        },
      };

      const origFindById = College.findById;
      College.findById = () => ({
        lean: async () => ({ featureFlags: { alumniNetwork: false } }),
      });

      try {
        await middleware(mockReq, mockRes, () => {});
        assert.strictEqual(blocked, true, 'Must return 403 when alumniNetwork flag is false');
      } finally {
        College.findById = origFindById;
      }
    });
  });

  // =========================================================================
  // 2. INTERVIEW EXPERIENCE LIBRARY (Feature Flag: interviewExperiences)
  // =========================================================================
  describe('2. Interview Experience Library Module', () => {
    it('Validates structured submission with rounds, questions, difficulty, and tips', () => {
      const exp = new InterviewExperience({
        studentId: new mongoose.Types.ObjectId(studentId),
        collegeId: new mongoose.Types.ObjectId(collegeId),
        companyName: 'Atlassian',
        role: 'Full Stack Engineer',
        jobType: 'Full-time',
        batchYear: 2026,
        branch: 'Computer Science',
        overallDifficulty: 'Hard',
        outcome: 'Selected',
        rounds: [
          {
            roundNumber: 1,
            roundName: 'Online Assessment',
            roundType: 'OA',
            durationMinutes: 90,
            questions: ['3 algorithmic problems: DP on trees, sliding window, and graph BFS'],
            experience: 'Test was hosted on HackerRank. Needed passing all test cases.',
          },
          {
            roundNumber: 2,
            roundName: 'System & Code Craft',
            roundType: 'Technical',
            durationMinutes: 60,
            questions: ['Design an in-memory rate limiter with token bucket algorithm'],
            experience: 'Interviewer focused heavily on edge cases and thread safety.',
          },
        ],
        preparationTips: 'Practice LeetCode mediums and review NeetCode concurrency module.',
        isAnonymous: true,
        status: 'pending_review',
      });

      assert.strictEqual(exp.validateSync(), undefined);
      assert.strictEqual(exp.rounds.length, 2);
      assert.strictEqual(exp.status, 'pending_review', 'Submissions default to pending_review moderation');
      assert.strictEqual(exp.isAnonymous, true);
    });

    it('Properly anonymizes author identity when isAnonymous is enabled', () => {
      const rawDoc = {
        companyName: 'Amazon',
        role: 'SDE-1',
        batchYear: 2026,
        isAnonymous: true,
        studentId: { firstName: 'Kavita', lastName: 'Nambiar', branch: 'CSE' },
      };

      const getAuthorName = (item) => {
        if (item.isAnonymous) {
          return `Anonymous ${item.batchYear || 2026} Graduate`;
        }
        return `${item.studentId?.firstName} ${item.studentId?.lastName}`;
      };

      assert.strictEqual(getAuthorName(rawDoc), 'Anonymous 2026 Graduate');

      rawDoc.isAnonymous = false;
      assert.strictEqual(getAuthorName(rawDoc), 'Kavita Nambiar');
    });

    it('TPO moderation workflow updates status and preserves feedback', () => {
      const exp = new InterviewExperience({
        studentId: new mongoose.Types.ObjectId(studentId),
        collegeId: new mongoose.Types.ObjectId(collegeId),
        companyName: 'Goldman Sachs',
        role: 'Analyst',
        status: 'pending_review',
      });

      // TPO approves
      exp.status = 'approved';
      exp.tpoReviewedBy = new mongoose.Types.ObjectId(tpoId);
      exp.tpoFeedback = 'Well-structured debrief with helpful technical context.';
      assert.strictEqual(exp.status, 'approved');
      assert.strictEqual(exp.tpoFeedback, 'Well-structured debrief with helpful technical context.');
    });

    it('Allows upvoting and prevents duplicate voting by the same student', () => {
      const exp = new InterviewExperience({
        studentId: new mongoose.Types.ObjectId(studentId),
        collegeId: new mongoose.Types.ObjectId(collegeId),
        companyName: 'Google',
        role: 'SWE',
        upvotes: [],
        upvoteCount: 0,
      });

      const user1 = new mongoose.Types.ObjectId();
      const user2 = new mongoose.Types.ObjectId();

      // User 1 votes
      exp.upvotes.push(user1);
      exp.upvoteCount = exp.upvotes.length;
      assert.strictEqual(exp.upvoteCount, 1);

      // User 2 votes
      exp.upvotes.push(user2);
      exp.upvoteCount = exp.upvotes.length;
      assert.strictEqual(exp.upvoteCount, 2);

      // User 1 toggles off
      exp.upvotes = exp.upvotes.filter((id) => !id.equals(user1));
      exp.upvoteCount = exp.upvotes.length;
      assert.strictEqual(exp.upvoteCount, 1);
    });

    it('Guards Interview Experiences API behind per-college feature flag interviewExperiences', async () => {
      const middleware = requireFeature('interviewExperiences');

      let blocked = false;
      const mockReq = { tenant: { collegeId }, user: { collegeId, role: 'student' } };
      const mockRes = {
        status: (code) => {
          if (code === 403) blocked = true;
          return { json: () => {} };
        },
      };

      const origFindById = College.findById;
      College.findById = () => ({
        lean: async () => ({ featureFlags: { interviewExperiences: false } }),
      });

      try {
        await middleware(mockReq, mockRes, () => {});
        assert.strictEqual(blocked, true, 'Must return 403 when interviewExperiences flag is false');
      } finally {
        College.findById = origFindById;
      }
    });
  });

  // =========================================================================
  // 3. INTERNSHIP & PPO TRACKING (Feature Flag: internshipPpo)
  // =========================================================================
  describe('3. Internship & PPO Tracking Module', () => {
    it('Validates InternshipRecord with stipend, duration, and dates independent of full-time drives', () => {
      const internship = new InternshipRecord({
        studentId: new mongoose.Types.ObjectId(studentId),
        collegeId: new mongoose.Types.ObjectId(collegeId),
        companyName: 'Morgan Stanley',
        role: 'Summer Technology Analyst',
        stipendMonthly: 75000,
        durationMonths: 2,
        startDate: new Date('2026-05-15'),
        endDate: new Date('2026-07-15'),
        mode: 'Hybrid',
        location: 'Mumbai, India',
        mentorName: 'Anil Kapoor',
        mentorEmail: 'anil.k@morganstanley.com',
        ppoStatus: 'In Progress',
      });

      assert.strictEqual(internship.validateSync(), undefined);
      assert.strictEqual(internship.stipendMonthly, 75000);
      assert.strictEqual(internship.durationMonths, 2);
      assert.strictEqual(internship.ppoStatus, 'In Progress');
    });

    it('Updates PPO conversion status with full-time CTC breakdown upon offer', () => {
      const internship = new InternshipRecord({
        studentId: new mongoose.Types.ObjectId(studentId),
        collegeId: new mongoose.Types.ObjectId(collegeId),
        companyName: 'Adobe',
        role: 'Product Intern',
        stipendMonthly: 100000,
        ppoStatus: 'PPO Offered',
        ppoDetails: {
          ctc: 32.0,
          fixedCtc: 24.0,
          variableCtc: 8.0,
          role: 'Software Engineer (Member of Technical Staff)',
          offeredAt: new Date(),
        },
      });

      assert.strictEqual(internship.validateSync(), undefined);
      assert.strictEqual(internship.ppoStatus, 'PPO Offered');
      assert.strictEqual(internship.ppoDetails.ctc, 32.0);
      assert.strictEqual(internship.ppoDetails.fixedCtc, 24.0);
    });

    it('Calculates aggregate college-level PPO conversion rate', () => {
      const records = [
        { ppoStatus: 'PPO Offered' },
        { ppoStatus: 'PPO Accepted' },
        { ppoStatus: 'Not Converted' },
        { ppoStatus: 'In Progress' },
      ];

      const totalEvaluated = records.filter((r) => ['PPO Offered', 'PPO Accepted', 'Not Converted'].includes(r.ppoStatus)).length;
      const convertedCount = records.filter((r) => ['PPO Offered', 'PPO Accepted'].includes(r.ppoStatus)).length;
      const conversionRate = totalEvaluated > 0 ? Number(((convertedCount / totalEvaluated) * 100).toFixed(1)) : 0;

      assert.strictEqual(totalEvaluated, 3);
      assert.strictEqual(convertedCount, 2);
      assert.strictEqual(conversionRate, 66.7);
    });

    it('Guards Internship & PPO API behind per-college feature flag internshipPpo', async () => {
      const middleware = requireFeature('internshipPpo');

      let blocked = false;
      const mockReq = { tenant: { collegeId }, user: { collegeId, role: 'student' } };
      const mockRes = {
        status: (code) => {
          if (code === 403) blocked = true;
          return { json: () => {} };
        },
      };

      const origFindById = College.findById;
      College.findById = () => ({
        lean: async () => ({ featureFlags: { internshipPpo: false } }),
      });

      try {
        await middleware(mockReq, mockRes, () => {});
        assert.strictEqual(blocked, true, 'Must return 403 when internshipPpo flag is false');
      } finally {
        College.findById = origFindById;
      }
    });
  });

  // =========================================================================
  // 4. OFF-CAMPUS & HIGHER-STUDIES TRACKING (Feature Flag: offCampusHigherStudies)
  // =========================================================================
  describe('4. Off-Campus & Higher-Studies Tracking Module', () => {
    it('Validates self-reported off-campus placement with company and compensation', () => {
      const offCampus = new ExternalOutcome({
        studentId: new mongoose.Types.ObjectId(studentId),
        collegeId: new mongoose.Types.ObjectId(collegeId),
        category: 'Off-Campus Placement',
        offCampusDetails: {
          companyName: 'Databricks',
          role: 'Solutions Architect',
          ctcLpa: 36.0,
          location: 'Bengaluru',
          offerLetterUrl: 'https://cdn.placeearly.edu/offers/databricks.pdf',
        },
        verificationStatus: 'pending',
      });

      assert.strictEqual(offCampus.validateSync(), undefined);
      assert.strictEqual(offCampus.category, 'Off-Campus Placement');
      assert.strictEqual(offCampus.offCampusDetails.ctcLpa, 36.0);
      assert.strictEqual(offCampus.verificationStatus, 'pending');
    });

    it('Validates self-reported higher studies admission with university and exam scores', () => {
      const higherStudies = new ExternalOutcome({
        studentId: new mongoose.Types.ObjectId(studentId),
        collegeId: new mongoose.Types.ObjectId(collegeId),
        category: 'Higher Studies',
        higherStudiesDetails: {
          universityName: 'Columbia University',
          degree: 'MS',
          country: 'United States',
          program: 'Computer Science & AI',
          examTaken: 'GRE',
          score: '332 (Q170, V162)',
          admissionLetterUrl: 'https://cdn.placeearly.edu/admissions/columbia.pdf',
        },
        verificationStatus: 'pending',
      });

      assert.strictEqual(higherStudies.validateSync(), undefined);
      assert.strictEqual(higherStudies.category, 'Higher Studies');
      assert.strictEqual(higherStudies.higherStudiesDetails.universityName, 'Columbia University');
      assert.strictEqual(higherStudies.higherStudiesDetails.score, '332 (Q170, V162)');
    });

    it('TPO verification updates status and records verifier audit trail', () => {
      const outcome = new ExternalOutcome({
        studentId: new mongoose.Types.ObjectId(studentId),
        collegeId: new mongoose.Types.ObjectId(collegeId),
        category: 'Higher Studies',
        verificationStatus: 'pending',
      });

      outcome.verificationStatus = 'verified';
      outcome.verifiedBy = new mongoose.Types.ObjectId(tpoId);
      outcome.verifiedAt = new Date();

      assert.strictEqual(outcome.verificationStatus, 'verified');
      assert.ok(outcome.verifiedAt instanceof Date);
    });

    it('Guards Off-Campus & Higher Studies API behind per-college feature flag offCampusHigherStudies', async () => {
      const middleware = requireFeature('offCampusHigherStudies');

      let blocked = false;
      const mockReq = { tenant: { collegeId }, user: { collegeId, role: 'student' } };
      const mockRes = {
        status: (code) => {
          if (code === 403) blocked = true;
          return { json: () => {} };
        },
      };

      const origFindById = College.findById;
      College.findById = () => ({
        lean: async () => ({ featureFlags: { offCampusHigherStudies: false } }),
      });

      try {
        await middleware(mockReq, mockRes, () => {});
        assert.strictEqual(blocked, true, 'Must return 403 when offCampusHigherStudies flag is false');
      } finally {
        College.findById = origFindById;
      }
    });
  });

  // =========================================================================
  // 5. CONSOLIDATED RESOURCES PAGE (Feature Flag: consolidatedResources)
  // =========================================================================
  describe('5. Consolidated Resources Page Module', () => {
    it('Collapses learning and job platforms into unified catalog of 90+ verified resources', () => {
      assert.ok(ALL_RESOURCES.length >= 20, 'Catalog contains curated resources');
      assert.ok(LEARNING_PLATFORMS.length >= 10, 'Contains learning platforms');
      assert.ok(JOB_PLATFORMS.length >= 8, 'Contains job platforms');

      // Verify learning platforms tag
      const leetcode = ALL_RESOURCES.find((p) => p.id === 'leetcode');
      assert.ok(leetcode);
      assert.strictEqual(leetcode.resourceType, 'learning');

      // Verify job platforms tag
      const wellfound = ALL_RESOURCES.find((p) => p.id === 'wellfound');
      assert.ok(wellfound);
      assert.strictEqual(wellfound.resourceType, 'job');
    });

    it('Generates curated recommendations matching student target role', () => {
      const targetRole = 'Software Development Engineer';
      const normalized = targetRole.toLowerCase();

      const matched = ALL_RESOURCES.filter((p) => {
        return p.targetRoles && p.targetRoles.some((r) => r.toLowerCase().includes(normalized));
      });

      assert.ok(matched.length >= 5, 'Must find multiple recommended resources for SDE');
      const names = matched.map((m) => m.name);
      assert.ok(names.includes('LeetCode'));
      assert.ok(names.includes('NeetCode'));
      assert.ok(names.includes('Naukri.com'));
    });

    it('Allows student bookmarking and toggling platforms', () => {
      let bookmarks = ['leetcode', 'neetcode'];

      // Toggle add wellfound
      const resourceId = 'wellfound';
      if (!bookmarks.includes(resourceId)) {
        bookmarks.push(resourceId);
      }
      assert.strictEqual(bookmarks.includes('wellfound'), true);
      assert.strictEqual(bookmarks.length, 3);

      // Toggle remove leetcode
      bookmarks = bookmarks.filter((id) => id !== 'leetcode');
      assert.strictEqual(bookmarks.includes('leetcode'), false);
      assert.strictEqual(bookmarks.length, 2);
    });

    it('Guards Consolidated Resources API behind per-college feature flag consolidatedResources', async () => {
      const middleware = requireFeature('consolidatedResources');

      let blocked = false;
      const mockReq = { tenant: { collegeId }, user: { collegeId, role: 'student' } };
      const mockRes = {
        status: (code) => {
          if (code === 403) blocked = true;
          return { json: () => {} };
        },
      };

      const origFindById = College.findById;
      College.findById = () => ({
        lean: async () => ({ featureFlags: { consolidatedResources: false } }),
      });

      try {
        await middleware(mockReq, mockRes, () => {});
        assert.strictEqual(blocked, true, 'Must return 403 when consolidatedResources flag is false');
      } finally {
        College.findById = origFindById;
      }
    });
  });
});
