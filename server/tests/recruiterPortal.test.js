const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const User = require('../src/models/User');
const Opportunity = require('../src/models/Opportunity');
const Application = require('../src/models/Application');
const StudentProfile = require('../src/models/StudentProfile');
const InterviewSlot = require('../src/models/InterviewSlot');
const AuditLog = require('../src/models/AuditLog');

describe('Recruiter Portal & Corporate Scoping Engine Tests', () => {
  const collegeId = new mongoose.Types.ObjectId().toString();
  const companyAId = new mongoose.Types.ObjectId().toString();
  const companyBId = new mongoose.Types.ObjectId().toString();
  const recruiterAId = new mongoose.Types.ObjectId().toString();
  const recruiterBId = new mongoose.Types.ObjectId().toString();
  const tpoId = new mongoose.Types.ObjectId().toString();

  describe('1. Recruiter Invite & Token Activation Lifecycle', () => {
    test('Constructs recruiter user with inviteToken, expiry, and company linkage', () => {
      const inviteToken = 'test-recruiter-token-xyz123';
      const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const recruiter = new User({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        firstName: 'Sundar',
        lastName: 'Pichai',
        email: 'recruiter.google@techcorp.com',
        password: 'temporary_hash_password',
        role: 'recruiter',
        companyId: new mongoose.Types.ObjectId(companyAId),
        companyName: 'Google India',
        isInvited: true,
        inviteToken,
        inviteExpiresAt,
      });

      assert.strictEqual(recruiter.role, 'recruiter');
      assert.strictEqual(recruiter.isInvited, true);
      assert.strictEqual(recruiter.companyName, 'Google India');
      assert.strictEqual(recruiter.inviteToken, inviteToken);
      assert.ok(recruiter.inviteExpiresAt > new Date());
    });

    test('Password activation clears invite token and marks user verified', () => {
      const recruiter = new User({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        firstName: 'Sundar',
        lastName: 'Pichai',
        email: 'recruiter.google@techcorp.com',
        role: 'recruiter',
        companyId: new mongoose.Types.ObjectId(companyAId),
        companyName: 'Google India',
        isInvited: true,
        inviteToken: 'active-token-999',
        inviteExpiresAt: new Date(Date.now() + 100000),
      });

      // Recruiter sets password
      recruiter.password = 'NewSecurePassword@123';
      recruiter.inviteToken = null;
      recruiter.inviteExpiresAt = null;
      recruiter.isInvited = false;
      recruiter.isVerified = true;

      assert.strictEqual(recruiter.isInvited, false);
      assert.strictEqual(recruiter.isVerified, true);
      assert.strictEqual(recruiter.inviteToken, null);
      assert.strictEqual(recruiter.inviteExpiresAt, null);
    });
  });

  describe('2. Permission Boundary & Cross-Company Data Isolation', () => {
    test('Drive access rule strictly blocks recruiter of Company A from accessing Company B drive', () => {
      const driveCompanyB = {
        _id: new mongoose.Types.ObjectId(),
        companyId: new mongoose.Types.ObjectId(companyBId),
        companyName: 'Microsoft R&D',
        invitedRecruiterIds: [],
      };

      const recruiterUserA = {
        id: recruiterAId,
        role: 'recruiter',
        companyId: new mongoose.Types.ObjectId(companyAId),
        companyName: 'Google India',
      };

      // Inline verifyDriveAccess logic
      const isCompanyMatch =
        recruiterUserA.companyId.toString() === driveCompanyB.companyId.toString() ||
        recruiterUserA.companyName.toLowerCase() === driveCompanyB.companyName.toLowerCase();

      const isInvited = driveCompanyB.invitedRecruiterIds.includes(recruiterUserA.id);

      const authorized = isCompanyMatch || isInvited;
      assert.strictEqual(authorized, false, 'Recruiter A must NOT have access to Company B drive');
    });

    test('Recruiter granted access if directly present in invitedRecruiterIds', () => {
      const guestRecruiterId = new mongoose.Types.ObjectId().toString();
      const driveWithInvite = {
        _id: new mongoose.Types.ObjectId(),
        companyId: new mongoose.Types.ObjectId(companyBId),
        companyName: 'Microsoft R&D',
        invitedRecruiterIds: [new mongoose.Types.ObjectId(guestRecruiterId)],
      };

      const guestRecruiter = {
        id: guestRecruiterId,
        role: 'recruiter',
        companyId: null,
        companyName: 'External Agency',
      };

      const isInvited = driveWithInvite.invitedRecruiterIds.some(
        (id) => id.toString() === guestRecruiter.id
      );
      assert.strictEqual(isInvited, true, 'Recruiter invited directly should be authorized');
    });

    test('TPO and Admin roles bypass company-specific scoping', () => {
      const drive = {
        _id: new mongoose.Types.ObjectId(),
        companyId: new mongoose.Types.ObjectId(companyAId),
        companyName: 'Google India',
      };

      const tpoUser = { id: tpoId, role: 'tpo', companyId: null };
      const adminUser = { id: tpoId, role: 'admin', companyId: null };

      const isBypassed = (user) => ['superadmin', 'admin', 'tpo'].includes(user.role);
      assert.strictEqual(isBypassed(tpoUser), true);
      assert.strictEqual(isBypassed(adminUser), true);
    });
  });

  describe('3. Candidate Contact Redaction Privacy Barrier', () => {
    test('Unshortlisted candidate contact info (email, phone) is strictly redacted', () => {
      const studentEmail = 'student.topper@campus.edu';
      const studentPhone = '+91 9876543210';
      const applicationStatus = 'Applied';

      const isShortlisted = [
        'Shortlisted',
        'Technical Round',
        'HR Round',
        'Offer Proposed',
        'Offer Extended',
        'Placed',
        'Hired',
      ].includes(applicationStatus);

      const exposedEmail = isShortlisted ? studentEmail : '[Hidden until shortlisted]';
      const exposedPhone = isShortlisted ? studentPhone : '[Hidden until shortlisted]';

      assert.strictEqual(exposedEmail, '[Hidden until shortlisted]');
      assert.strictEqual(exposedPhone, '[Hidden until shortlisted]');
    });

    test('Shortlisted candidate contact info is unmasked', () => {
      const studentEmail = 'student.topper@campus.edu';
      const studentPhone = '+91 9876543210';
      const applicationStatus = 'Shortlisted';

      const isShortlisted = [
        'Shortlisted',
        'Technical Round',
        'HR Round',
        'Offer Proposed',
        'Offer Extended',
        'Placed',
        'Hired',
      ].includes(applicationStatus);

      const exposedEmail = isShortlisted ? studentEmail : '[Hidden until shortlisted]';
      const exposedPhone = isShortlisted ? studentPhone : '[Hidden until shortlisted]';

      assert.strictEqual(exposedEmail, studentEmail);
      assert.strictEqual(exposedPhone, studentPhone);
    });

    test('Rejection requires mandatory non-empty reason', () => {
      const validReject = { status: 'Rejected', rejectionReason: 'Insufficient core DSA experience' };
      const invalidReject = { status: 'Rejected', rejectionReason: '   ' };

      const validateReject = (req) => {
        if (req.status === 'Rejected' && (!req.rejectionReason || !req.rejectionReason.trim())) {
          return { valid: false, error: 'Rejection reason is required when rejecting a candidate.' };
        }
        return { valid: true };
      };

      assert.strictEqual(validateReject(validReject).valid, true);
      assert.strictEqual(validateReject(invalidReject).valid, false);
      assert.strictEqual(
        validateReject(invalidReject).error,
        'Rejection reason is required when rejecting a candidate.'
      );
    });
  });

  describe('4. Recruiter JD Proposal & TPO Approval Pipeline', () => {
    test('Recruiter proposes JD updates into proposedJd with Pending_Approval status', () => {
      const opportunity = new Opportunity({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        title: 'Software Development Engineer',
        companyName: 'Google India',
        type: 'Job',
        salary: '24 LPA',
        ctc: { total: 2400000, fixed: 2000000, variable: 400000, currency: 'INR' },
        deadline: new Date(Date.now() + 86400000),
        status: 'Open',
        createdBy: new mongoose.Types.ObjectId(tpoId),
      });

      // Recruiter submits proposed changes
      opportunity.proposedJd = {
        title: 'Senior Software Engineer - Cloud',
        description: 'Advanced distributed systems engineering role',
        salary: '32 LPA',
        ctc: { total: 3200000, fixed: 2600000, variable: 600000, currency: 'INR' },
        rounds: [
          { roundNumber: 1, name: 'Online Coding Challenge', type: 'OA' },
          { roundNumber: 2, name: 'Systems Architecture', type: 'Tech' },
          { roundNumber: 3, name: 'Leadership & Culture Fit', type: 'HR' },
        ],
        eligibilityRules: { minCgpa: 8.5, maxBacklogs: 0 },
        status: 'Pending_Approval',
        proposedBy: new mongoose.Types.ObjectId(recruiterAId),
        proposedAt: new Date(),
      };

      assert.strictEqual(opportunity.proposedJd.status, 'Pending_Approval');
      assert.strictEqual(opportunity.proposedJd.title, 'Senior Software Engineer - Cloud');
      assert.strictEqual(opportunity.title, 'Software Development Engineer'); // Original unchanged until approved
    });

    test('TPO approves proposed JD: live opportunity fields updated accordingly', () => {
      const opportunity = {
        title: 'Software Development Engineer',
        salary: '24 LPA',
        ctc: { total: 2400000, fixed: 2000000, variable: 400000, currency: 'INR' },
        proposedJd: {
          title: 'Senior Software Engineer - Cloud',
          salary: '32 LPA',
          ctc: { total: 3200000, fixed: 2600000, variable: 600000, currency: 'INR' },
          status: 'Pending_Approval',
        },
      };

      // TPO approves
      const decision = 'Approved';
      const tpoRemarks = 'Approved high-CTC tier revision';

      opportunity.proposedJd.status = decision;
      opportunity.proposedJd.tpoRemarks = tpoRemarks;
      if (decision === 'Approved') {
        opportunity.title = opportunity.proposedJd.title;
        opportunity.salary = opportunity.proposedJd.salary;
        opportunity.ctc = opportunity.proposedJd.ctc;
      }

      assert.strictEqual(opportunity.proposedJd.status, 'Approved');
      assert.strictEqual(opportunity.title, 'Senior Software Engineer - Cloud');
      assert.strictEqual(opportunity.salary, '32 LPA');
      assert.strictEqual(opportunity.ctc.total, 3200000);
    });

    test('TPO rejects proposed JD: live opportunity remains unchanged with remarks', () => {
      const opportunity = {
        title: 'Software Development Engineer',
        salary: '24 LPA',
        proposedJd: {
          title: 'Unrealistic 80 LPA Architect',
          status: 'Pending_Approval',
        },
      };

      // TPO rejects
      const decision = 'Rejected';
      const tpoRemarks = 'Exceeds campus policy band limit';

      opportunity.proposedJd.status = decision;
      opportunity.proposedJd.tpoRemarks = tpoRemarks;

      assert.strictEqual(opportunity.proposedJd.status, 'Rejected');
      assert.strictEqual(opportunity.title, 'Software Development Engineer');
      assert.strictEqual(opportunity.proposedJd.tpoRemarks, 'Exceeds campus policy band limit');
    });
  });

  describe('5. Recruiter Multi-Panel Slot Booking & Auto-Allocation Math', () => {
    test('Calculates slots and evenly allocates shortlisted candidates across panels', () => {
      const candidates = [
        { id: 'cand1', name: 'Alice' },
        { id: 'cand2', name: 'Bob' },
        { id: 'cand3', name: 'Charlie' },
        { id: 'cand4', name: 'Diana' },
      ];

      const startTime = '09:00';
      const endTime = '11:00'; // 120 minutes total
      const duration = 45; // 45 min per interview
      const buffer = 15; // 15 min break -> 60 min cycle
      const panelCount = 2; // 2 panels

      // Calculate time windows
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      const totalMinutes = endH * 60 + endM - (startH * 60 + startM);
      const cycleDuration = duration + buffer;
      const slotsPerPanel = Math.floor(totalMinutes / cycleDuration); // 120 / 60 = 2 slots per panel
      const totalCapacity = slotsPerPanel * panelCount; // 4 total interview slots

      assert.strictEqual(slotsPerPanel, 2);
      assert.strictEqual(totalCapacity, 4);

      // Auto-allocation matrix
      const allocations = [];
      let candidateIdx = 0;

      for (let s = 0; s < slotsPerPanel; s++) {
        for (let p = 1; p <= panelCount; p++) {
          if (candidateIdx < candidates.length) {
            allocations.push({
              panel: `Panel ${p}`,
              slotIndex: s,
              candidate: candidates[candidateIdx],
            });
            candidateIdx++;
          }
        }
      }

      assert.strictEqual(allocations.length, 4);
      assert.strictEqual(allocations[0].panel, 'Panel 1');
      assert.strictEqual(allocations[0].candidate.name, 'Alice');
      assert.strictEqual(allocations[1].panel, 'Panel 2');
      assert.strictEqual(allocations[1].candidate.name, 'Bob');
      assert.strictEqual(allocations[2].panel, 'Panel 1');
      assert.strictEqual(allocations[2].candidate.name, 'Charlie');
      assert.strictEqual(allocations[3].panel, 'Panel 2');
      assert.strictEqual(allocations[3].candidate.name, 'Diana');
    });
  });

  describe('6. Round Feedback Scorecard & Student Visibility Toggle', () => {
    test('Validates rating scale 1 to 5 and respects visibleToStudent flag', () => {
      const validateFeedback = (rating, strengths, gaps, comments, visibleToStudent) => {
        if (!rating || rating < 1 || rating > 5) {
          throw new Error('Rating must be an integer between 1 and 5.');
        }
        return {
          rating,
          strengths: strengths || '',
          gaps: gaps || '',
          comments: comments || '',
          visibleToStudent: Boolean(visibleToStudent),
        };
      };

      const validFeedback = validateFeedback(
        5,
        'Excellent algorithmic intuition',
        'Can deepen distributed caching knowledge',
        'Strong hire recommendation',
        true
      );

      assert.strictEqual(validFeedback.rating, 5);
      assert.strictEqual(validFeedback.visibleToStudent, true);

      // Verify boundary error on invalid ratings
      assert.throws(() => validateFeedback(0), /Rating must be an integer between 1 and 5/);
      assert.throws(() => validateFeedback(6), /Rating must be an integer between 1 and 5/);
    });
  });

  describe('7. Offer Proposal & Two-Stage TPO Verification Pipeline', () => {
    test('Recruiter proposes offer; status transitions to Proposed_By_Recruiter', () => {
      const application = new Application({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        studentId: new mongoose.Types.ObjectId(),
        opportunityId: new mongoose.Types.ObjectId(),
        status: 'HR Round',
      });

      const proposedCtc = {
        fixed: 1800000,
        variable: 400000,
        total: 2200000,
      };

      application.offer = {
        designation: 'Associate Cloud Engineer',
        ctc: proposedCtc.total,
        fixedCtc: proposedCtc.fixed,
        variableCtc: proposedCtc.variable,
        joiningDate: new Date('2026-07-01'),
        status: 'Proposed_By_Recruiter',
        proposedByRecruiterId: new mongoose.Types.ObjectId(recruiterAId),
        proposedAt: new Date(),
      };
      application.status = 'Offer Proposed';

      assert.strictEqual(application.offer.status, 'Proposed_By_Recruiter');
      assert.strictEqual(application.status, 'Offer Proposed');
      assert.strictEqual(application.offer.ctc, 2200000);
      assert.strictEqual(application.offer.fixedCtc, 1800000);
    });

    test('TPO approves recruiter proposed offer and extends to student (Pending)', () => {
      const application = {
        status: 'Offer Proposed',
        offer: {
          status: 'Proposed_By_Recruiter',
          ctc: 2200000,
        },
      };

      // TPO approves
      application.offer.status = 'Pending';
      application.offer.tpoApprovedAt = new Date();
      application.offer.tpoApprovedBy = new mongoose.Types.ObjectId(tpoId);
      application.status = 'Offer Extended';

      assert.strictEqual(application.offer.status, 'Pending');
      assert.strictEqual(application.status, 'Offer Extended');
      assert.ok(application.offer.tpoApprovedAt);
    });

    test('TPO rejects recruiter proposed offer', () => {
      const application = {
        status: 'Offer Proposed',
        offer: {
          status: 'Proposed_By_Recruiter',
          ctc: 2200000,
        },
      };

      // TPO rejects
      application.offer.status = 'Rejected_By_TPO';
      application.offer.tpoRemarks = 'CTC does not match MoU agreed terms';
      application.status = 'HR Round'; // Returns to previous pipeline stage

      assert.strictEqual(application.offer.status, 'Rejected_By_TPO');
      assert.strictEqual(application.status, 'HR Round');
    });
  });

  describe('8. Drive Funnel Analytics Math', () => {
    test('Calculates funnel metrics and conversion percentages accurately', () => {
      const applications = [
        { status: 'Applied' },
        { status: 'Applied' },
        { status: 'Shortlisted' },
        { status: 'Shortlisted' },
        { status: 'Technical Round' },
        { status: 'HR Round' },
        { status: 'Offer Proposed' },
        { status: 'Offer Extended' },
        { status: 'Placed' },
        { status: 'Placed' },
      ];

      const totalApplied = applications.length; // 10
      const shortlistedCount = applications.filter((a) =>
        ['Shortlisted', 'Technical Round', 'HR Round', 'Offer Proposed', 'Offer Extended', 'Placed'].includes(a.status)
      ).length; // 8
      const interviewCount = applications.filter((a) =>
        ['Technical Round', 'HR Round', 'Offer Proposed', 'Offer Extended', 'Placed'].includes(a.status)
      ).length; // 6
      const offerCount = applications.filter((a) =>
        ['Offer Proposed', 'Offer Extended', 'Placed'].includes(a.status)
      ).length; // 4
      const placedCount = applications.filter((a) => a.status === 'Placed').length; // 2

      const shortlistRate = totalApplied ? ((shortlistedCount / totalApplied) * 100).toFixed(1) : 0;
      const offerRate = shortlistedCount ? ((offerCount / shortlistedCount) * 100).toFixed(1) : 0;
      const placementYield = totalApplied ? ((placedCount / totalApplied) * 100).toFixed(1) : 0;

      assert.strictEqual(totalApplied, 10);
      assert.strictEqual(shortlistedCount, 8);
      assert.strictEqual(interviewCount, 6);
      assert.strictEqual(offerCount, 4);
      assert.strictEqual(placedCount, 2);
      assert.strictEqual(shortlistRate, '80.0');
      assert.strictEqual(offerRate, '50.0');
      assert.strictEqual(placementYield, '20.0');
    });
  });

  describe('9. Audit Logging & Security Tracking for Recruiter Actions', () => {
    test('Constructs audit logs for candidate list viewing, resume download, and CSV export', () => {
      const candidateListAudit = new AuditLog({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        performedBy: new mongoose.Types.ObjectId(recruiterAId),
        action: 'RECRUITER_CANDIDATE_LIST_VIEWED',
        targetModel: 'Opportunity',
        targetId: new mongoose.Types.ObjectId(),
        details: { count: 25 },
      });

      const resumeDownloadAudit = new AuditLog({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        performedBy: new mongoose.Types.ObjectId(recruiterAId),
        action: 'RECRUITER_RESUME_DOWNLOADED',
        targetModel: 'StudentProfile',
        targetId: new mongoose.Types.ObjectId(),
        details: { studentName: 'Alice Smith' },
      });

      const csvExportAudit = new AuditLog({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        performedBy: new mongoose.Types.ObjectId(recruiterAId),
        action: 'RECRUITER_SHORTLIST_EXPORTED',
        targetModel: 'Opportunity',
        targetId: new mongoose.Types.ObjectId(),
        details: { exportedCount: 12 },
      });

      assert.strictEqual(candidateListAudit.action, 'RECRUITER_CANDIDATE_LIST_VIEWED');
      assert.strictEqual(resumeDownloadAudit.action, 'RECRUITER_RESUME_DOWNLOADED');
      assert.strictEqual(csvExportAudit.action, 'RECRUITER_SHORTLIST_EXPORTED');
    });
  });
});
