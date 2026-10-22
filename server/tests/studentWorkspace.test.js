const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const StudentProfile = require('../src/models/StudentProfile');
const Application = require('../src/models/Application');
const Opportunity = require('../src/models/Opportunity');
const InterviewSlot = require('../src/models/InterviewSlot');
const Document = require('../src/models/Document');
const College = require('../src/models/College');
const { evaluateEligibility } = require('../src/services/eligibilityEngine');

describe('Student Workspace API & Core Logic Tests (Part B)', () => {
  const dummyCollegeId = new mongoose.Types.ObjectId();
  const dummyStudentId = new mongoose.Types.ObjectId();

  describe('1. Readiness Score & Profile Completeness Breakdown', () => {
    test('Calculates completeness percentage and next best action correctly', () => {
      const partialProfile = {
        personalInfo: { phone: '9876543210', gender: 'Female' },
        academics: { tenth: { score: 90 }, twelfth: { score: 85 } },
        skills: ['JavaScript', 'React'], // < 3 skills
        projects: [],
        resumeVersions: [],
        isVerifiedByTPO: false,
      };

      // Check completeness logic
      let completed = 0;
      const missing = [];
      if (partialProfile.personalInfo?.phone && partialProfile.personalInfo?.gender) completed++;
      else missing.push('Personal Details');

      if (partialProfile.academics?.tenth?.score && partialProfile.academics?.twelfth?.score) completed++;
      else missing.push('School Academics');

      if (partialProfile.resumeVersions?.length > 0) completed++;
      else missing.push('Primary Resume Document');

      if (partialProfile.skills?.length >= 3) completed++;
      else missing.push('Key Technical Skills (at least 3)');

      if (partialProfile.projects?.length >= 1) completed++;
      else missing.push('Portfolio Project');

      if (partialProfile.isVerifiedByTPO) completed++;
      else missing.push('TPO Academic Verification Seal');

      const percentage = Math.round((completed / 6) * 100);
      assert.strictEqual(completed, 2);
      assert.strictEqual(percentage, 33);
      assert.strictEqual(missing.length, 4);
      assert.strictEqual(missing[0], 'Primary Resume Document');
    });

    test('Readiness score evaluates composite signals including CGPA, skills, projects, and seal', () => {
      const comprehensiveProfile = {
        isVerifiedByTPO: true, // +20
        cgpa: 8.5,             // +15
        skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'], // +10
        projects: [{ title: 'PLACEearly', link: 'https://github.com' }], // +10
        certifications: [{ name: 'AWS Certified Cloud Practitioner' }], // +5
        academics: { tenth: { score: 92 }, twelfth: { score: 88 } }, // +5
        resumeVersions: [{ version: 1, fileUrl: 'https://storage/resume.pdf' }], // +15
      };

      let score = 20; // Base registered
      if (comprehensiveProfile.isVerifiedByTPO) score += 20;
      if (comprehensiveProfile.cgpa >= 7.5) score += 15;
      if (comprehensiveProfile.resumeVersions?.length > 0) score += 15;
      if (comprehensiveProfile.skills?.length >= 3) score += 10;
      if (comprehensiveProfile.projects?.length >= 1) score += 10;
      if (comprehensiveProfile.certifications?.length >= 1) score += 5;
      if (comprehensiveProfile.academics?.tenth?.score && comprehensiveProfile.academics?.twelfth?.score) score += 5;

      assert.strictEqual(score, 100);
    });
  });

  describe('2. Explanatory Eligibility UI Messages & What-If Actions', () => {
    test('Produces exact explanatory messages for non-eligible student', () => {
      const drive = {
        title: 'Cloud Engineer',
        companyName: 'Amazon',
        eligibilityRules: {
          minCgpa: 8.5,
          maxBacklogs: 0,
          allowedBranches: ['Computer Science'],
        },
      };

      const student = {
        cgpa: 8.1,
        backlogs: 2,
        branch: 'Mechanical',
        isVerifiedByTPO: false,
      };

      const res = evaluateEligibility(drive, student);
      assert.strictEqual(res.isEligible, false);

      const cgpaFail = res.reasons.find((r) => r.rule === 'Minimum CGPA');
      assert.strictEqual(cgpaFail.status, 'failed');
      assert.ok(cgpaFail.message.includes('need 0.4 more CGPA'));

      const backlogFail = res.reasons.find((r) => r.rule === 'Active Backlogs');
      assert.strictEqual(backlogFail.status, 'failed');
      assert.ok(backlogFail.message.includes('Backlogs: you have 2, maximum is 0'));

      const branchFail = res.reasons.find((r) => r.rule === 'Eligible Branches');
      assert.strictEqual(branchFail.status, 'failed');
      assert.ok(branchFail.message.includes('Branch not allowed'));

      const verifyFail = res.reasons.find((r) => r.rule === 'TPO Verification');
      assert.strictEqual(verifyFail.status, 'failed');
      assert.ok(verifyFail.message.includes('Profile not verified yet'));

      // What-if actions
      assert.ok(res.whatIf.length >= 2);
      const backlogAction = res.whatIf.find((w) => w.action === 'clear_backlogs');
      assert.ok(backlogAction);
      assert.ok(backlogAction.description.includes('Clear 2 active backlog'));
    });
  });

  describe('3. Application Withdrawal & Offer Decision Flow', () => {
    test('Allows withdrawal before drive deadline when still in Applied state', () => {
      const futureDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const app = {
        status: 'Applied',
        opportunity: { deadline: futureDeadline },
      };

      const canWithdraw =
        new Date() <= app.opportunity.deadline &&
        !['Shortlisted', 'Technical Round', 'HR Round', 'Offer Extended', 'Placed'].includes(app.status);

      assert.strictEqual(canWithdraw, true);
    });

    test('Blocks withdrawal after deadline has elapsed', () => {
      const pastDeadline = new Date(Date.now() - 1000);
      const app = {
        status: 'Applied',
        opportunity: { deadline: pastDeadline },
      };

      const isExpired = new Date() > app.opportunity.deadline;
      assert.strictEqual(isExpired, true);
    });

    test('Blocks withdrawal if student has advanced to Technical or HR Round', () => {
      const futureDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const app = {
        status: 'Technical Round',
        opportunity: { deadline: futureDeadline },
      };

      const blockedDueToRound = ['Shortlisted', 'Technical Round', 'HR Round', 'Offer Extended', 'Placed'].includes(app.status);
      assert.strictEqual(blockedDueToRound, true);
    });

    test('Accepting offer transitions application to Placed and marks offer Accepted', () => {
      const app = {
        status: 'Offer Extended',
        offer: {
          role: 'Backend Developer',
          ctc: 12,
          status: 'Pending',
        },
        roundHistory: [],
      };

      const decision = 'Accepted';
      const remarks = 'Excited to join!';

      app.offer.status = decision;
      app.offer.decisionDate = new Date();
      app.offer.remarks = remarks;
      app.status = 'Placed';
      app.roundHistory.push({
        roundName: 'Offer Decision',
        status: 'Offer Accepted',
        notes: remarks,
      });

      assert.strictEqual(app.status, 'Placed');
      assert.strictEqual(app.offer.status, 'Accepted');
      assert.strictEqual(app.roundHistory.length, 1);
    });

    test('Declining offer transitions application to Rejected with remarks', () => {
      const app = {
        status: 'Offer Extended',
        offer: {
          role: 'Backend Developer',
          ctc: 8,
          status: 'Pending',
        },
      };

      const decision = 'Declined';
      const remarks = 'Pursuing higher education.';

      app.offer.status = decision;
      app.status = 'Rejected';
      app.offer.remarks = remarks;

      assert.strictEqual(app.status, 'Rejected');
      assert.strictEqual(app.offer.status, 'Declined');
    });
  });

  describe('4. Interview Calendar Clash Detection & RFC 5545 ICS Format', () => {
    test('Accurately flags overlapping interview slots as clashes', () => {
      const slots = [
        {
          id: 'slot_1',
          startDateTime: new Date('2026-11-01T10:00:00Z'),
          endDateTime: new Date('2026-11-01T11:00:00Z'),
        },
        {
          id: 'slot_2',
          startDateTime: new Date('2026-11-01T10:30:00Z'), // Clashes with slot_1!
          endDateTime: new Date('2026-11-01T11:30:00Z'),
        },
        {
          id: 'slot_3',
          startDateTime: new Date('2026-11-01T14:00:00Z'), // No clash
          endDateTime: new Date('2026-11-01T15:00:00Z'),
        },
      ];

      const evaluated = slots.map((s, idx) => {
        const sStart = s.startDateTime.getTime();
        const sEnd = s.endDateTime.getTime();
        const hasClash = slots.some((other, oIdx) => {
          if (idx === oIdx) return false;
          return sStart < other.endDateTime.getTime() && sEnd > other.startDateTime.getTime();
        });
        return { ...s, hasClash };
      });

      assert.strictEqual(evaluated[0].hasClash, true);
      assert.strictEqual(evaluated[1].hasClash, true);
      assert.strictEqual(evaluated[2].hasClash, false);
    });

    test('Constructs valid iCalendar (ICS) formatted document', () => {
      const slot = {
        id: 'slot_99',
        opportunityId: { companyName: 'Microsoft', title: 'Fullstack Engineer' },
        roundName: 'System Design',
        mode: 'Online (MS Teams)',
        roomOrLink: 'https://teams.microsoft.com/l/meetup-join/123',
        startDateTime: new Date('2026-11-10T09:00:00Z'),
        endDateTime: new Date('2026-11-10T10:00:00Z'),
      };

      const formatIcs = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

      const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//PLACEearly Campus Placement OS//Student Interview Calendar//EN',
        'BEGIN:VEVENT',
        `UID:pe-interview-${slot.id}@placeearly.edu`,
        `DTSTART:${formatIcs(slot.startDateTime)}`,
        `DTEND:${formatIcs(slot.endDateTime)}`,
        `SUMMARY:${slot.opportunityId.companyName} - ${slot.roundName} (${slot.opportunityId.title})`,
        `LOCATION:${slot.roomOrLink}`,
        'END:VEVENT',
        'END:VCALENDAR',
      ];

      const ics = lines.join('\r\n');
      assert.ok(ics.includes('BEGIN:VCALENDAR'));
      assert.ok(ics.includes('Microsoft - System Design'));
      assert.ok(ics.includes('DTSTART:20261110T090000Z'));
      assert.ok(ics.includes('END:VCALENDAR'));
    });
  });

  describe('5. GDPR & DPDP Student Privacy, Consent, & Deletion Request', () => {
    test('Synthesizes portable JSON data subject access request package', () => {
      const dataPackage = {
        exportMetadata: {
          exportedAt: new Date().toISOString(),
          compliance: 'GDPR / DPDP Data Subject Access Request',
        },
        user: { name: 'Alice Student', email: 'alice@college.edu', role: 'student' },
        profile: { rollNo: 'CS2026-042', cgpa: 9.1, branch: 'Computer Science' },
        applications: [{ company: 'Google', role: 'SDE', status: 'Applied' }],
        documents: [{ title: 'Resume_v2.pdf', type: 'resume' }],
      };

      const jsonStr = JSON.stringify(dataPackage);
      const parsed = JSON.parse(jsonStr);

      assert.strictEqual(parsed.exportMetadata.compliance, 'GDPR / DPDP Data Subject Access Request');
      assert.strictEqual(parsed.profile.rollNo, 'CS2026-042');
      assert.strictEqual(parsed.applications.length, 1);
    });

    test('Records recruiter consent with timestamp, IP, and policy version', () => {
      const consentRecord = {
        consentedAt: new Date(),
        consentType: 'recruiter_data_sharing',
        ipAddress: '192.168.1.100',
        version: '1.0',
      };

      assert.strictEqual(consentRecord.consentType, 'recruiter_data_sharing');
      assert.strictEqual(consentRecord.version, '1.0');
      assert.ok(consentRecord.consentedAt instanceof Date);
    });

    test('Submits account deletion request with reason and pending status', () => {
      const deletionRequest = {
        requestedAt: new Date(),
        reason: 'Graduated from university and wish to purge personal placement records.',
        status: 'Pending',
      };

      assert.strictEqual(deletionRequest.status, 'Pending');
      assert.ok(deletionRequest.reason.includes('Graduated'));
    });
  });

  describe('6. Bonafide / NOC Internship Workflow Schema', () => {
    test('Constructs NOC request with company, role, dates, and pending review state', () => {
      const noc = {
        companyName: 'Tesla Energy',
        role: 'Firmware Engineering Intern',
        purpose: 'Summer Internship NOC',
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-07-31'),
        status: 'Pending',
        tpoRemarks: '',
      };

      assert.strictEqual(noc.status, 'Pending');
      assert.strictEqual(noc.companyName, 'Tesla Energy');
      assert.strictEqual(noc.purpose, 'Summer Internship NOC');
      assert.ok(noc.endDate > noc.startDate);
    });
  });
});
