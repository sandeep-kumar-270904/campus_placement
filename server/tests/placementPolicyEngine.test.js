const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const PlacementPolicy = require('../src/models/PlacementPolicy');
const PolicyOverride = require('../src/models/PolicyOverride');
const PolicyExceptionRequest = require('../src/models/PolicyExceptionRequest');
const {
  determineTier,
  getOpportunityCtc,
  evaluateStudentPolicy,
  generateFairnessReport,
  exportFairnessReportToCsv,
} = require('../src/services/policyEngine/placementPolicyEngine');

describe('Placement Policy Engine & Governance Tests', () => {
  const collegeId = new mongoose.Types.ObjectId().toString();
  const student1Id = new mongoose.Types.ObjectId().toString();
  const student2Id = new mongoose.Types.ObjectId().toString();
  const drive1Id = new mongoose.Types.ObjectId().toString();
  const drive2Id = new mongoose.Types.ObjectId().toString();
  const tpoId = new mongoose.Types.ObjectId().toString();

  describe('1. CTC Tier Resolution', () => {
    test('Correctly maps CTC to Standard, Core, Dream, and Super Dream tiers', () => {
      const tiers = PlacementPolicy.DEFAULT_TIERS;

      const standardTier = determineTier(4.5, tiers);
      assert.strictEqual(standardTier.name, 'Standard');
      assert.strictEqual(standardTier.order, 1);

      const coreTier = determineTier(8.0, tiers);
      assert.strictEqual(coreTier.name, 'Core');
      assert.strictEqual(coreTier.order, 2);

      const dreamTier = determineTier(16.5, tiers);
      assert.strictEqual(dreamTier.name, 'Dream');
      assert.strictEqual(dreamTier.order, 3);

      const superDreamTier = determineTier(35.0, tiers);
      assert.strictEqual(superDreamTier.name, 'Super Dream');
      assert.strictEqual(superDreamTier.order, 4);
    });
  });

  describe('2. One-Student-One-Offer Policy Enforcement', () => {
    const policy = {
      oneStudentOneOffer: {
        enabled: true,
      },
    };

    const targetOpportunity = {
      _id: drive1Id,
      title: 'Software Engineer',
      companyName: 'Atlassian',
      ctc: { fixed: 20, variable: 4 },
    };

    test('Blocks student who has already accepted an offer', async () => {
      const studentProfile = {
        _id: student1Id,
        user: student1Id,
        isPlaced: true,
        placedDetails: { companyName: 'Amazon', ctc: 18 },
      };

      const applications = [
        {
          _id: new mongoose.Types.ObjectId(),
          opportunityId: { companyName: 'Amazon', title: 'SDE 1' },
          status: 'Placed',
          offer: { status: 'Accepted', ctc: 18 },
        },
      ];

      const result = await evaluateStudentPolicy({
        collegeId,
        studentId: student1Id,
        opportunity: targetOpportunity,
        studentProfile,
        applications,
        policy,
      });

      assert.strictEqual(result.isAllowed, false);
      assert.strictEqual(result.blockingReasons.length, 1);
      assert.strictEqual(result.blockingReasons[0].code, 'POLICY_ONE_STUDENT_ONE_OFFER');
      assert.ok(result.blockingReasons[0].message.includes('Amazon'));
    });

    test('Allows unplaced student to apply when One-Student-One-Offer is enabled', async () => {
      const studentProfile = {
        _id: student2Id,
        user: student2Id,
        isPlaced: false,
      };

      const applications = [
        {
          _id: new mongoose.Types.ObjectId(),
          status: 'Applied',
          offer: { status: 'None' },
        },
      ];

      const result = await evaluateStudentPolicy({
        collegeId,
        studentId: student2Id,
        opportunity: targetOpportunity,
        studentProfile,
        applications,
        policy,
      });

      assert.strictEqual(result.isAllowed, true);
      assert.strictEqual(result.blockingReasons.length, 0);
    });
  });

  describe('3. Dream Cap Policy Enforcement', () => {
    const policy = {
      dreamCap: {
        enabled: true,
        maxDreamOffers: 1,
        dreamThresholdCtc: 15.0,
        allowUnlimitedCore: true,
      },
      tierEligibility: {
        tiers: PlacementPolicy.DEFAULT_TIERS,
      },
    };

    test('Blocks candidate who already holds 1 Dream offer from applying to another Dream drive', async () => {
      const dreamOpportunity = {
        _id: drive1Id,
        title: 'Cloud Specialist',
        companyName: 'Google Cloud',
        ctc: { fixed: 22, variable: 6 }, // 28 LPA >= 15 LPA (Dream)
      };

      const studentProfile = {
        _id: student1Id,
        user: student1Id,
        isPlaced: false,
      };

      const applications = [
        {
          _id: new mongoose.Types.ObjectId(),
          opportunityId: { companyName: 'Microsoft', title: 'SDE', ctc: { fixed: 18, variable: 2 } },
          status: 'Offer Extended',
          offer: { status: 'Pending', ctc: 20 }, // 1st Dream offer
        },
      ];

      const result = await evaluateStudentPolicy({
        collegeId,
        studentId: student1Id,
        opportunity: dreamOpportunity,
        studentProfile,
        applications,
        policy,
      });

      assert.strictEqual(result.isAllowed, false);
      assert.strictEqual(result.blockingReasons[0].code, 'POLICY_DREAM_CAP_EXCEEDED');
      assert.ok(result.blockingReasons[0].message.includes('Dream Cap Reached'));
    });

    test('Permits candidate to apply to Core tier drive even after reaching Dream cap when unlimited core is active', async () => {
      const coreOpportunity = {
        _id: drive2Id,
        title: 'Junior Developer',
        companyName: 'Infosys Special',
        ctc: { fixed: 8, variable: 1 }, // 9 LPA < 15 LPA (Core)
      };

      const studentProfile = {
        _id: student1Id,
        user: student1Id,
        isPlaced: false,
      };

      const applications = [
        {
          _id: new mongoose.Types.ObjectId(),
          opportunityId: { companyName: 'Microsoft', title: 'SDE', ctc: { fixed: 18, variable: 2 } },
          status: 'Offer Extended',
          offer: { status: 'Pending', ctc: 20 }, // 1st Dream offer
        },
      ];

      const result = await evaluateStudentPolicy({
        collegeId,
        studentId: student1Id,
        opportunity: coreOpportunity,
        studentProfile,
        applications,
        policy,
      });

      assert.strictEqual(result.isAllowed, true);
    });
  });

  describe('4. Tier-Based Eligibility & Upgrade Progression', () => {
    const policy = {
      tierEligibility: {
        enabled: true,
        upgradeOnly: true,
        tiers: PlacementPolicy.DEFAULT_TIERS,
      },
    };

    test('Blocks student with Core offer from applying to lower or equal tier (Core or Standard)', async () => {
      const lowerOpportunity = {
        _id: drive1Id,
        title: 'Associate Engineer',
        companyName: 'TCS Digital',
        ctc: { fixed: 7, variable: 0 }, // 7 LPA (Core tier)
      };

      const applications = [
        {
          _id: new mongoose.Types.ObjectId(),
          opportunityId: { companyName: 'Wipro Turbo', ctc: { fixed: 8 } },
          status: 'Placed',
          offer: { status: 'Accepted', ctc: 8 }, // Placed in Core Tier (order 2)
        },
      ];

      const result = await evaluateStudentPolicy({
        collegeId,
        studentId: student1Id,
        opportunity: lowerOpportunity,
        applications,
        policy,
      });

      assert.strictEqual(result.isAllowed, false);
      assert.strictEqual(result.blockingReasons[0].code, 'POLICY_TIER_NOT_UPGRADE');
      assert.ok(result.blockingReasons[0].message.includes('Core tier'));
    });

    test('Allows student with Core offer to apply to higher tier (Dream or Super Dream)', async () => {
      const dreamOpportunity = {
        _id: drive2Id,
        title: 'Software Development Engineer',
        companyName: 'Salesforce',
        ctc: { fixed: 16, variable: 4 }, // 20 LPA (Super Dream or Dream)
      };

      const applications = [
        {
          _id: new mongoose.Types.ObjectId(),
          opportunityId: { companyName: 'Wipro Turbo', ctc: { fixed: 8 } },
          status: 'Placed',
          offer: { status: 'Accepted', ctc: 8 }, // Placed in Core Tier (order 2)
        },
      ];

      const result = await evaluateStudentPolicy({
        collegeId,
        studentId: student1Id,
        opportunity: dreamOpportunity,
        applications,
        policy,
      });

      assert.strictEqual(result.isAllowed, true);
    });
  });

  describe('5. Priority for Unplaced Students Policy', () => {
    const policy = {
      priorityUnplaced: {
        enabled: true,
        blockPlacedStudents: true,
      },
    };

    const targetOpportunity = {
      _id: drive1Id,
      title: 'Graduate Trainee',
      companyName: 'Cognizant',
      ctc: { fixed: 5 },
    };

    test('Blocks placed candidate when priority for unplaced is enabled', async () => {
      const studentProfile = {
        _id: student1Id,
        user: student1Id,
        isPlaced: true,
        placedDetails: { companyName: 'Accenture' },
      };

      const result = await evaluateStudentPolicy({
        collegeId,
        studentId: student1Id,
        opportunity: targetOpportunity,
        studentProfile,
        applications: [],
        policy,
      });

      assert.strictEqual(result.isAllowed, false);
      assert.strictEqual(result.blockingReasons[0].code, 'POLICY_UNPLACED_PRIORITY');
    });

    test('Allows unplaced candidate to apply under unplaced priority rule', async () => {
      const studentProfile = {
        _id: student2Id,
        user: student2Id,
        isPlaced: false,
      };

      const result = await evaluateStudentPolicy({
        collegeId,
        studentId: student2Id,
        opportunity: targetOpportunity,
        studentProfile,
        applications: [],
        policy,
      });

      assert.strictEqual(result.isAllowed, true);
    });
  });

  describe('6. Max Concurrent Applications Cap', () => {
    const policy = {
      maxConcurrentApplications: {
        enabled: true,
        maxActive: 3,
      },
    };

    const targetOpportunity = {
      _id: drive1Id,
      title: 'Full Stack Engineer',
      companyName: 'Razorpay',
      ctc: { fixed: 15 },
    };

    test('Blocks student when active applications reach or exceed cap', async () => {
      const applications = [
        { _id: new mongoose.Types.ObjectId(), status: 'Applied' },
        { _id: new mongoose.Types.ObjectId(), status: 'Technical Round' },
        { _id: new mongoose.Types.ObjectId(), status: 'Online Assessment' },
      ];

      const result = await evaluateStudentPolicy({
        collegeId,
        studentId: student1Id,
        opportunity: targetOpportunity,
        applications,
        policy,
      });

      assert.strictEqual(result.isAllowed, false);
      assert.strictEqual(result.blockingReasons[0].code, 'POLICY_CONCURRENT_LIMIT_REACHED');
      assert.ok(result.blockingReasons[0].message.includes('3 active in-progress applications'));
    });

    test('Allows student when active applications count is below cap (e.g. 2 active, 1 rejected)', async () => {
      const applications = [
        { _id: new mongoose.Types.ObjectId(), status: 'Applied' },
        { _id: new mongoose.Types.ObjectId(), status: 'Technical Round' },
        { _id: new mongoose.Types.ObjectId(), status: 'Rejected' }, // Inactive
      ];

      const result = await evaluateStudentPolicy({
        collegeId,
        studentId: student1Id,
        opportunity: targetOpportunity,
        applications,
        policy,
      });

      assert.strictEqual(result.isAllowed, true);
    });
  });

  describe('7. Institutional Blackout Dates', () => {
    const targetOpportunity = {
      _id: drive1Id,
      title: 'DevOps Intern',
      companyName: 'RedHat',
      ctc: { fixed: 12 },
    };

    test('Blocks applications during active blackout window', async () => {
      const policy = {
        blackoutDates: [
          {
            title: 'End-Semester Exams',
            startDate: new Date('2026-11-01'),
            endDate: new Date('2026-11-20'),
            reason: 'Students on study leave',
            appliesToAllDrives: true,
          },
        ],
      };

      const result = await evaluateStudentPolicy({
        collegeId,
        studentId: student1Id,
        opportunity: targetOpportunity,
        applications: [],
        policy,
        currentDate: new Date('2026-11-10'), // Inside blackout
      });

      assert.strictEqual(result.isAllowed, false);
      assert.strictEqual(result.blockingReasons[0].code, 'POLICY_BLACKOUT_ACTIVE');
      assert.ok(result.blockingReasons[0].message.includes('End-Semester Exams'));
    });

    test('Allows applications when current date is outside blackout window', async () => {
      const policy = {
        blackoutDates: [
          {
            title: 'End-Semester Exams',
            startDate: new Date('2026-11-01'),
            endDate: new Date('2026-11-20'),
            reason: 'Students on study leave',
            appliesToAllDrives: true,
          },
        ],
      };

      const result = await evaluateStudentPolicy({
        collegeId,
        studentId: student1Id,
        opportunity: targetOpportunity,
        applications: [],
        policy,
        currentDate: new Date('2026-11-25'), // After blackout
      });

      assert.strictEqual(result.isAllowed, true);
    });
  });

  describe('8. PolicyOverride Model Validation & Engine Bypass', () => {
    test('Enforces mandatory reason when creating PolicyOverride', () => {
      const override = new PolicyOverride({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        studentId: new mongoose.Types.ObjectId(student1Id),
        policyType: 'one_student_one_offer',
        mandatoryReason: '', // Empty reason should fail validation
        approvedBy: new mongoose.Types.ObjectId(tpoId),
      });
      const err = override.validateSync();
      assert.ok(err && err.errors && err.errors.mandatoryReason);
    });

    test('Active PolicyOverride bypasses One-Student-One-Offer block', async () => {
      const policy = {
        oneStudentOneOffer: { enabled: true },
      };
      const targetOpportunity = {
        _id: drive1Id,
        title: 'Software Engineer',
        companyName: 'Atlassian',
        ctc: { fixed: 20 },
      };
      const studentProfile = {
        _id: student1Id,
        user: student1Id,
        isPlaced: true,
        placedDetails: { companyName: 'Amazon', ctc: 18 },
      };
      const applications = [
        {
          _id: new mongoose.Types.ObjectId(),
          opportunityId: { companyName: 'Amazon' },
          status: 'Placed',
          offer: { status: 'Accepted', ctc: 18 },
        },
      ];

      // With active override
      const activeOverride = {
        _id: new mongoose.Types.ObjectId(),
        policyType: 'all',
        mandatoryReason: 'Special dean approval for higher studies research track',
        approvedBy: { firstName: 'Dean', lastName: 'Academics' },
        createdAt: new Date(),
      };

      const result = await evaluateStudentPolicy({
        collegeId,
        studentId: student1Id,
        opportunity: targetOpportunity,
        studentProfile,
        applications,
        policy,
        activeOverride,
      });

      assert.strictEqual(result.isAllowed, true);
      assert.strictEqual(result.hasOverride, true);
      assert.strictEqual(result.blockingReasons.length, 0);
    });

    test('Validates complete PolicyOverride with required fields', () => {
      const override = new PolicyOverride({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        studentId: new mongoose.Types.ObjectId(student1Id),
        policyType: 'dream_cap',
        mandatoryReason: 'Exceptional academic excellence and ACM ICPC World Finalist endorsement.',
        approvedBy: new mongoose.Types.ObjectId(tpoId),
      });

      const err = override.validateSync();
      assert.strictEqual(err, undefined);
      assert.strictEqual(override.isActive, true);
      assert.strictEqual(override.policyType, 'dream_cap');
    });
  });

  describe('9. PolicyExceptionRequest Model Validation', () => {
    test('Constructs student exception appeal with justification and documents', () => {
      const exceptionReq = new PolicyExceptionRequest({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        studentId: new mongoose.Types.ObjectId(student1Id),
        opportunityId: new mongoose.Types.ObjectId(drive1Id),
        policyType: 'tier_eligibility',
        justification: 'Offered role directly aligns with published IEEE research in AI systems.',
        documents: [
          { name: 'Research_Paper.pdf', url: 'https://cdn.placeearly.edu/docs/paper.pdf' },
        ],
        status: 'Pending',
      });

      const err = exceptionReq.validateSync();
      assert.strictEqual(err, undefined);
      assert.strictEqual(exceptionReq.status, 'Pending');
      assert.strictEqual(exceptionReq.documents.length, 1);
    });
  });

  describe('10. Fairness & Diversity Report with Small-Cell Suppression (n < 5)', () => {
    test('Suppresses subgroups with fewer than 5 students for differential privacy', () => {
      const dummyReport = {
        generatedAt: new Date(),
        summary: {
          totalRegistered: 28,
          totalPlaced: 20,
          overallPlacementRate: '71%',
          suppressionPolicy: 'Differential Privacy / k-Anonymity (subgroups n < 5 suppressed)',
        },
        genderReport: [
          {
            label: 'Female',
            totalStudents: 15,
            placedCount: 12,
            totalOffers: 14,
            placementRate: '80%',
            averageCtc: '14.2 LPA',
            highestCtc: '28 LPA',
            isSuppressed: false,
          },
          {
            label: 'Non-Binary',
            totalStudents: '<5',
            placedCount: '<5',
            totalOffers: '<5',
            placementRate: 'Suppressed (n<5)',
            averageCtc: 'Suppressed',
            highestCtc: 'Suppressed',
            isSuppressed: true,
          },
        ],
        branchReport: [],
        categoryReport: [],
      };

      const csv = exportFairnessReportToCsv(dummyReport);
      assert.ok(csv.includes('INSTITUTIONAL PLACEMENT FAIRNESS & DIVERSITY REPORT'));
      assert.ok(csv.includes('"Female","15","12","14","80%","14.2 LPA","28 LPA","Published"'));
      assert.ok(csv.includes('"Non-Binary","<5","<5","<5","Suppressed (n<5)","Suppressed","Suppressed","Suppressed (n<5)"'));
    });
  });

  describe('11. Combined Multi-Policy Interactions & Matrix Scenarios', () => {
    test('Simultaneously evaluates and returns all matching blocking reasons when multiple policies are breached', async () => {
      const combinedPolicy = {
        oneStudentOneOffer: { enabled: true },
        priorityUnplaced: { enabled: true, blockPlacedStudents: true },
        tierEligibility: { enabled: true, upgradeOnly: true, tiers: PlacementPolicy.DEFAULT_TIERS },
        maxConcurrentApplications: { enabled: true, maxActive: 2 },
      };

      const placedStudent = {
        _id: student1Id,
        user: student1Id,
        isPlaced: true,
        placedDetails: { companyName: 'TCS', ctc: 5.0 },
      };

      // Student has 1 placed offer in Standard tier (5 LPA), and 2 other active applications
      const applications = [
        {
          _id: new mongoose.Types.ObjectId(),
          opportunityId: { companyName: 'TCS', title: 'Developer' },
          status: 'Placed',
          offer: { status: 'Accepted', ctc: 5.0 },
        },
        {
          _id: new mongoose.Types.ObjectId(),
          opportunityId: { companyName: 'Wipro', title: 'Analyst' },
          status: 'Technical Round',
        },
        {
          _id: new mongoose.Types.ObjectId(),
          opportunityId: { companyName: 'Infosys', title: 'Specialist' },
          status: 'Applied',
        },
      ];

      // Target drive is Standard tier (4.5 LPA)
      const targetOpportunity = {
        _id: drive1Id,
        title: 'Associate Engineer',
        companyName: 'Cognizant',
        ctc: { fixed: 4.5 },
      };

      const result = await evaluateStudentPolicy({
        collegeId,
        studentId: student1Id,
        opportunity: targetOpportunity,
        studentProfile: placedStudent,
        applications,
        policy: combinedPolicy,
      });

      assert.strictEqual(result.isAllowed, false);
      const policyTypes = result.blockingReasons.map((r) => r.policyType);

      // Must identify concurrent limit (3 active >= 2), unplaced priority, one-student-one-offer, AND tier not upgrade
      assert.ok(policyTypes.includes('max_concurrent_apps'));
      assert.ok(policyTypes.includes('priority_unplaced'));
      assert.ok(policyTypes.includes('one_student_one_offer'));
      assert.ok(policyTypes.includes('tier_eligibility'));
      assert.strictEqual(result.blockingReasons.length, 4);
    });

    test('Selective policy override unblocks targeted policy while keeping remaining policies enforced', async () => {
      const policy = {
        oneStudentOneOffer: { enabled: true },
        maxConcurrentApplications: { enabled: true, maxActive: 1 },
      };

      const placedStudent = {
        _id: student1Id,
        user: student1Id,
        isPlaced: true,
        placedDetails: { companyName: 'Accenture', ctc: 6.5 },
      };

      const applications = [
        {
          _id: new mongoose.Types.ObjectId(),
          opportunityId: { companyName: 'Accenture' },
          status: 'Placed',
          offer: { status: 'Accepted', ctc: 6.5 },
        },
        {
          _id: new mongoose.Types.ObjectId(),
          opportunityId: { companyName: 'Oracle' },
          status: 'In Review',
        },
      ];

      const targetOpportunity = {
        _id: drive1Id,
        title: 'Cloud Engineer',
        companyName: 'Microsoft',
        ctc: { fixed: 25.0 },
      };

      // TPO grants override ONLY for one_student_one_offer, NOT for max_concurrent_apps
      const specificOverride = {
        _id: new mongoose.Types.ObjectId(),
        policyType: 'one_student_one_offer',
        mandatoryReason: 'Special exemption granted by placement committee',
        approvedBy: { firstName: 'TPO', lastName: 'Head' },
      };

      const result = await evaluateStudentPolicy({
        collegeId,
        studentId: student1Id,
        opportunity: targetOpportunity,
        studentProfile: placedStudent,
        applications,
        policy,
        activeOverride: specificOverride,
      });

      assert.strictEqual(result.isAllowed, false);
      const policyTypes = result.blockingReasons.map((r) => r.policyType);

      // one_student_one_offer was bypassed by override, but max_concurrent_apps remains blocked!
      assert.strictEqual(policyTypes.includes('one_student_one_offer'), false);
      assert.ok(policyTypes.includes('max_concurrent_apps'));
    });

    test('Dream Cap allows applying to Core drive even with existing Dream offer when unlimited core is active', async () => {
      const policy = {
        dreamCap: {
          enabled: true,
          maxDreamOffers: 1,
          dreamThresholdCtc: 15.0,
          allowUnlimitedCore: true,
        },
        oneStudentOneOffer: { enabled: false }, // Dream cap standalone
      };

      const studentProfile = {
        _id: student1Id,
        user: student1Id,
        isPlaced: false,
      };

      // Student has 1 Dream offer (18 LPA)
      const applications = [
        {
          _id: new mongoose.Types.ObjectId(),
          opportunityId: { companyName: 'Goldman Sachs' },
          status: 'Offer Extended',
          offer: { status: 'Pending', ctc: 18.0 },
        },
      ];

      // Target drive is Core (8.5 LPA)
      const coreDrive = {
        _id: drive1Id,
        title: 'Core Java Engineer',
        companyName: 'Morgan Stanley',
        ctc: { fixed: 8.5 },
      };

      const resultCore = await evaluateStudentPolicy({
        collegeId,
        studentId: student1Id,
        opportunity: coreDrive,
        studentProfile,
        applications,
        policy,
      });

      assert.strictEqual(resultCore.isAllowed, true);

      // Target drive is another Dream drive (22 LPA) -> should be blocked!
      const dreamDrive = {
        _id: drive2Id,
        title: 'AI Systems Engineer',
        companyName: 'NVIDIA',
        ctc: { fixed: 22.0 },
      };

      const resultDream = await evaluateStudentPolicy({
        collegeId,
        studentId: student1Id,
        opportunity: dreamDrive,
        studentProfile,
        applications,
        policy,
      });

      assert.strictEqual(resultDream.isAllowed, false);
      assert.strictEqual(resultDream.blockingReasons[0].policyType, 'dream_cap');
    });
  });
});
