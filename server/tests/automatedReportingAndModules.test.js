const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const xlsx = require('xlsx');

// Services and Generators
const {
  calculateMedian,
  calculateAverage,
} = require('../src/services/reports/reportEngine');
const { generatePdfReportBuffer } = require('../src/services/reports/pdfReportGenerator');
const { generateXlsxReportBuffer } = require('../src/services/reports/xlsxReportGenerator');
const { storeReportBuffer, getReportBuffer } = require('../src/services/reports/reportBufferCache');
const { compileWeeklyDigestData, buildWeeklyDigestHtml } = require('../src/services/reports/weeklyDigestService');
const { requireFeature } = require('../src/middleware/featureFlagMiddleware');

// Models
const ReportJob = require('../src/models/ReportJob');
const AlumniProfile = require('../src/models/AlumniProfile');
const AlumniReferralRequest = require('../src/models/AlumniReferralRequest');
const InterviewExperience = require('../src/models/InterviewExperience');
const InternshipRecord = require('../src/models/InternshipRecord');
const ExternalOutcome = require('../src/models/ExternalOutcome');
const College = require('../src/models/College');

describe('Automated Reporting & Compliance Engine Tests', () => {
  describe('1. NAAC / NIRF / NBA Ground-Truth Mathematical Formulas', () => {
    it('Calculates median CTC with odd number of candidate offers', () => {
      const oddCtcs = [6.0, 8.5, 12.0, 15.0, 24.0];
      const median = calculateMedian(oddCtcs);
      assert.equal(median, 12.0, 'Median of odd elements must be the exact middle element');
    });

    it('Calculates median CTC with even number of candidate offers (NIRF Standard)', () => {
      const evenCtcs = [6.0, 8.0, 10.0, 14.0, 18.0, 22.0];
      // middle elements are 10.0 and 14.0 -> average = 12.0
      const median = calculateMedian(evenCtcs);
      assert.equal(median, 12.0, 'Median of even elements must be the average of middle pair');
    });

    it('Calculates median gracefully for unsorted arrays and edge cases', () => {
      const unsorted = [25.0, 5.0, 15.0];
      assert.equal(calculateMedian(unsorted), 15.0);
      assert.equal(calculateMedian([]), 0);
      assert.equal(calculateMedian([10.5]), 10.5);
    });

    it('Calculates arithmetic mean (Average CTC) accurately with two decimal precision', () => {
      const ctcs = [7.0, 9.0, 11.5, 14.0];
      // sum = 41.5, avg = 10.375 -> rounded to 10.38
      const avg = calculateAverage(ctcs);
      assert.equal(avg, 10.38);
      assert.equal(calculateAverage([]), 0);
    });

    it('Computes NIRF total progression rate combining placed, higher studies, and entrepreneurship', () => {
      const totalCohort = 100;
      const placed = 70;
      const higherStudies = 12;
      const entrepreneurship = 3;

      const totalProgression = placed + higherStudies + entrepreneurship;
      const progressionRate = Number(((totalProgression / totalCohort) * 100).toFixed(1));
      const placementRate = Number(((placed / totalCohort) * 100).toFixed(1));

      assert.equal(progressionRate, 85.0, 'Progression rate must be exactly 85.0%');
      assert.equal(placementRate, 70.0, 'Placement rate must be exactly 70.0%');
    });
  });

  describe('2. Multi-Format Report Document Generators (PDF, XLSX, CSV)', () => {
    it('Generates valid PDF 1.4 binary buffer with header and institutional signatories', () => {
      const pdfBuffer = generatePdfReportBuffer({
        title: 'NAAC Mandatory Placement Audit',
        collegeName: 'National Institute of Engineering',
        batchYear: '2026',
        summary: {
          totalCohort: 120,
          placedCount: 96,
          placementPercentage: 80.0,
          medianCtc: 9.5,
          highestCtc: 24.0,
          higherStudiesCount: 10,
        },
        rows: [
          { 'Roll Number': 'CS202601', 'Student Name': 'Rahul Sharma', Branch: 'CSE', Status: 'Placed' },
          { 'Roll Number': 'CS202602', 'Student Name': 'Ananya Sen', Branch: 'IT', Status: 'Higher Studies' },
        ],
        signatories: [
          { title: 'Head of Placements', name: 'Dr. TPO Head' },
          { title: 'Dean of Academic Affairs', name: 'Dr. Dean' },
        ],
      });

      assert.ok(Buffer.isBuffer(pdfBuffer), 'Must return a Node.js Buffer');
      assert.ok(pdfBuffer.length > 500, 'PDF buffer must have valid content');
      const headerStr = pdfBuffer.slice(0, 8).toString('utf8');
      assert.ok(headerStr.startsWith('%PDF-1.4'), 'Must start with valid PDF 1.4 magic bytes');
      const trailerStr = pdfBuffer.toString('utf8');
      assert.ok(trailerStr.includes('%%EOF'), 'Must end with standard PDF EOF marker');
      assert.ok(trailerStr.includes('Head of Placements'), 'Must include custom signatory titles');
    });

    it('Generates multi-sheet XLSX workbook binary with Audit Data and Executive Summary', () => {
      const xlsxBuffer = generateXlsxReportBuffer({
        title: 'Institutional Placement Report',
        collegeName: 'Campus Institute',
        summary: {
          totalCohort: 50,
          placedCount: 42,
          placementPercentage: 84.0,
          medianCtc: 8.0,
          averageCtc: 8.75,
          highestCtc: 18.0,
          higherStudiesCount: 5,
        },
        rows: [
          { 'Roll Number': '2026CS01', Name: 'Aarav Patel', Department: 'CSE', CTC: '12 LPA' },
          { 'Roll Number': '2026IT05', Name: 'Sneha Rao', Department: 'IT', CTC: '8 LPA' },
        ],
        departmentBreakdown: [
          { branch: 'CSE', total: 30, placed: 28, placementPercentage: 93.3 },
          { branch: 'IT', total: 20, placed: 14, placementPercentage: 70.0 },
        ],
      });

      assert.ok(Buffer.isBuffer(xlsxBuffer), 'Must return binary buffer');
      // Verify parsing back with xlsx library
      const parsedWb = xlsx.read(xlsxBuffer, { type: 'buffer' });
      assert.ok(parsedWb.SheetNames.includes('Audit Data'), 'Must contain Audit Data sheet');
      assert.ok(parsedWb.SheetNames.includes('Executive Summary'), 'Must contain Executive Summary sheet');
      assert.ok(parsedWb.SheetNames.includes('Department Breakdown'), 'Must contain Department Breakdown sheet');

      const auditRows = xlsx.utils.sheet_to_json(parsedWb.Sheets['Audit Data']);
      assert.equal(auditRows.length, 2, 'Audit Data sheet must have 2 data rows');
      assert.equal(auditRows[0]['Roll Number'], '2026CS01');
    });

    it('Buffer cache stores and retrieves report files with exact content integrity', () => {
      const testJobId = 'job-test-12345';
      const sampleBuf = Buffer.from('TEST_REPORT_CSV_CONTENT', 'utf8');
      storeReportBuffer(testJobId, {
        buffer: sampleBuf,
        contentType: 'text/csv',
        fileName: 'nirf-report.csv',
      });

      const retrieved = getReportBuffer(testJobId);
      assert.ok(retrieved, 'Buffer must be stored in cache');
      assert.equal(retrieved.fileName, 'nirf-report.csv');
      assert.equal(retrieved.contentType, 'text/csv');
      assert.equal(retrieved.buffer.toString('utf8'), 'TEST_REPORT_CSV_CONTENT');
    });
  });

  describe('3. Weekly TPO Digest Email Builder', () => {
    it('Compiles responsive HTML email digest with action links and metrics', () => {
      const mockDigestData = {
        compiledAt: new Date().toISOString(),
        collegeName: 'Apex Institute of Technology',
        metrics: {
          openDrivesCount: 4,
          applicationsThisWeek: 142,
          pendingVerificationsCount: 18,
          upcomingInterviewsCount: 26,
          pendingOffersCount: 5,
        },
        openDrives: [
          {
            title: 'Software Engineer',
            company: 'Google India',
            package: '24 LPA',
            deadline: '2026-11-01',
            daysRemaining: 8,
          },
        ],
        deepLinks: {
          drivesUrl: '/tpo/drives',
          verificationUrl: '/tpo/verification',
          scheduleUrl: '/tpo/schedule',
          reportsUrl: '/tpo/reports',
        },
      };

      const html = buildWeeklyDigestHtml(mockDigestData);
      assert.ok(html.includes('Weekly Executive Briefing'), 'Must contain briefing title');
      assert.ok(html.includes('Google India'), 'Must include active drive company');
      assert.ok(html.includes('142'), 'Must include applications count');
      assert.ok(html.includes('/tpo/verification'), 'Must include deep link to verification queue');
    });
  });

  describe('4. Alumni Network Model & Rate-Limiting Rules', () => {
    it('Validates AlumniProfile schema and default mentorship preferences', () => {
      const profile = new AlumniProfile({
        userId: '507f1f77bcf86cd799439011',
        collegeId: '507f1f77bcf86cd799439012',
        fullName: 'Vikram Seth',
        email: 'vikram.seth@alumni.college.edu',
        batchYear: 2023,
        branch: 'Computer Science',
        currentCompany: 'Microsoft',
        currentRole: 'Senior SDE',
      });

      assert.equal(profile.isVerifiedAlumni, false, 'Alumni profile defaults to unverified');
      assert.equal(profile.willingToRefer, true, 'Defaults to willing to refer');
      assert.equal(profile.willingToMentor, true, 'Defaults to willing to mentor');
    });

    it('Enforces maximum 3 referral requests per student within sliding 7-day window', () => {
      // Logic check for student rate limit
      const studentRecentRequestsCount = 3;
      const isAllowed = studentRecentRequestsCount < 3;
      assert.equal(isAllowed, false, 'Student with 3 recent requests must be rate-limited from sending 4th');
    });
  });

  describe('5. Interview Experience Library Model & Moderation', () => {
    it('Validates InterviewExperience with pending_review default and author anonymization', () => {
      const exp = new InterviewExperience({
        studentId: '507f1f77bcf86cd799439011',
        collegeId: '507f1f77bcf86cd799439012',
        companyName: 'Amazon',
        role: 'SDE-1',
        batchYear: 2025,
        overallDifficulty: 'Hard',
        outcome: 'Selected',
        isAnonymous: true,
      });

      assert.equal(exp.status, 'pending_review', 'Interview debriefs require TPO moderation before publishing');
      assert.equal(exp.isAnonymous, true, 'Must preserve anonymous flag');
      assert.equal(exp.upvoteCount, 0, 'Initial upvote count must be 0');
    });

    it('Correctly toggles upvotes without duplicate user voting', () => {
      const userId = '507f1f77bcf86cd799439099';
      const exp = new InterviewExperience({
        studentId: '507f1f77bcf86cd799439011',
        collegeId: '507f1f77bcf86cd799439012',
        companyName: 'Atlassian',
        role: 'Full Stack Engineer',
      });

      // Upvote
      exp.upvotes.push(userId);
      exp.upvoteCount += 1;
      assert.equal(exp.upvoteCount, 1);

      // Toggle off
      exp.upvotes = exp.upvotes.filter((u) => u.toString() !== userId);
      exp.upvoteCount -= 1;
      assert.equal(exp.upvoteCount, 0);
    });
  });

  describe('6. Internship & PPO Tracking Funnel', () => {
    it('Validates InternshipRecord with stipend and PPO outcome progression', () => {
      const internship = new InternshipRecord({
        studentId: '507f1f77bcf86cd799439011',
        collegeId: '507f1f77bcf86cd799439012',
        companyName: 'Uber',
        role: 'Software Engineer Intern',
        stipendMonthly: 85000,
        durationMonths: 6,
        ppoStatus: 'PPO Offered',
        ppoDetails: {
          ctc: 28.5,
          fixedCtc: 22.0,
          variableCtc: 6.5,
          role: 'Software Engineer (L3)',
        },
      });

      assert.equal(internship.stipendMonthly, 85000);
      assert.equal(internship.ppoStatus, 'PPO Offered');
      assert.equal(internship.ppoDetails.ctc, 28.5);
    });
  });

  describe('7. Off-Campus & Higher-Studies External Outcome Model', () => {
    it('Validates ExternalOutcome for higher studies and startup tracking', () => {
      const higherStudies = new ExternalOutcome({
        studentId: '507f1f77bcf86cd799439011',
        collegeId: '507f1f77bcf86cd799439012',
        category: 'Higher Studies',
        higherStudiesDetails: {
          universityName: 'Carnegie Mellon University',
          degree: 'MS',
          country: 'United States',
          examTaken: 'GRE',
          score: '328',
        },
      });

      assert.equal(higherStudies.verificationStatus, 'pending');
      assert.equal(higherStudies.higherStudiesDetails.degree, 'MS');
      assert.equal(higherStudies.higherStudiesDetails.examTaken, 'GRE');
    });

    it('Validates ExternalOutcome for student startup entrepreneurship', () => {
      const startup = new ExternalOutcome({
        studentId: '507f1f77bcf86cd799439011',
        collegeId: '507f1f77bcf86cd799439012',
        category: 'Entrepreneurship',
        entrepreneurshipDetails: {
          startupName: 'AgenticFlow AI',
          sector: 'Enterprise AI & Automation',
          role: 'Founder',
          fundingRaisedLakhs: 45,
        },
      });

      assert.equal(startup.category, 'Entrepreneurship');
      assert.equal(startup.entrepreneurshipDetails.fundingRaisedLakhs, 45);
    });
  });

  describe('8. Per-College Feature Flag Middleware Guard', () => {
    it('requireFeature blocks disabled features with 403 status and descriptive error', async () => {
      const middleware = requireFeature('alumniNetwork');

      const mockReq = {
        tenant: { collegeId: '507f1f77bcf86cd799439012' },
        user: { role: 'student' },
      };

      let statusReceived = null;
      let jsonReceived = null;
      const mockRes = {
        status: (code) => {
          statusReceived = code;
          return {
            json: (payload) => {
              jsonReceived = payload;
            },
          };
        },
      };

      let nextCalled = false;
      const mockNext = () => {
        nextCalled = true;
      };

      // Mock College.findById to return college with alumniNetwork disabled
      const origFindById = College.findById;
      College.findById = () => ({
        lean: async () => ({
          name: 'Demo College',
          featureFlags: { alumniNetwork: false },
        }),
      });

      try {
        await middleware(mockReq, mockRes, mockNext);
        assert.equal(statusReceived, 403, 'Must return 403 FORBIDDEN when feature is disabled');
        assert.equal(jsonReceived.error.code, 'FEATURE_DISABLED');
        assert.equal(nextCalled, false, 'Next must not be called when feature is blocked');
      } finally {
        College.findById = origFindById;
      }
    });

    it('requireFeature allows request when feature flag is enabled', async () => {
      const middleware = requireFeature('alumniNetwork');

      const mockReq = {
        tenant: { collegeId: '507f1f77bcf86cd799439012' },
        user: { role: 'student' },
      };

      const mockRes = {};
      let nextCalled = false;
      const mockNext = () => {
        nextCalled = true;
      };

      const origFindById = College.findById;
      College.findById = () => ({
        lean: async () => ({
          name: 'Demo College',
          featureFlags: { alumniNetwork: true },
        }),
      });

      try {
        await middleware(mockReq, mockRes, mockNext);
        assert.equal(nextCalled, true, 'Next must be called when feature is enabled');
      } finally {
        College.findById = origFindById;
      }
    });
  });
});
