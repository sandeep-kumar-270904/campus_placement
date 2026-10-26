const { test, describe } = require('node:test');
const assert = require('node:assert');
const { evaluateEligibility } = require('../src/services/eligibilityEngine');
const { checkEligibility } = require('../src/services/eligibilityService');
const EligibilityCache = require('../src/models/EligibilityCache');

describe('Explanatory Eligibility Engine & What-If Tests (Part A)', () => {
  const baseOpportunity = {
    _id: 'opp_123',
    title: 'Software Development Engineer',
    companyName: 'Google',
    ctc: { fixed: 14, total: 18 },
    eligibilityRules: {
      minCgpa: 8.0,
      maxBacklogs: 0,
      allowedBranches: ['Computer Science', 'Information Technology'],
      allowedGraduationYears: [2026],
      minTenthPercentage: 75.0,
      minTwelfthPercentage: 75.0,
      maxGapYears: 1,
    },
  };

  const fullyQualifiedStudent = {
    _id: 'stud_001',
    cgpa: 8.8,
    backlogs: 0,
    branch: 'Computer Science',
    isVerifiedByTPO: true,
    graduationYear: 2026,
    educationGapYears: 0,
    academics: {
      tenth: { score: 92.5 },
      twelfth: { score: 89.0 },
    },
    personalInfo: { gender: 'Male' },
    isPlaced: false,
  };

  test('1. Fully qualified student passes all criteria with 100% score and no gaps', () => {
    const res = evaluateEligibility(baseOpportunity, fullyQualifiedStudent);
    assert.strictEqual(res.isEligible, true);
    assert.strictEqual(res.score, 100);
    assert.strictEqual(res.whatIf.length, 0);
    assert.ok(res.summary.includes('You meet all'));

    const cgpaRule = res.reasons.find((r) => r.rule === 'Minimum CGPA');
    assert.ok(cgpaRule);
    assert.strictEqual(cgpaRule.status, 'passed');
    assert.strictEqual(cgpaRule.gap, null);

    const backlogRule = res.reasons.find((r) => r.rule === 'Active Backlogs');
    assert.strictEqual(backlogRule.status, 'passed');
  });

  test('2. Boundary testing: CGPA exactly equal to minCgpa (8.00 == 8.0) passes', () => {
    const student = {
      ...fullyQualifiedStudent,
      cgpa: 8.0,
    };
    const res = evaluateEligibility(baseOpportunity, student);
    assert.strictEqual(res.isEligible, true);
    const cgpaRule = res.reasons.find((r) => r.rule === 'Minimum CGPA');
    assert.strictEqual(cgpaRule.status, 'passed');
    assert.strictEqual(cgpaRule.gap, null);
  });

  test('3. Explanatory breakdown: CGPA below threshold shows exact gap and UI message', () => {
    const student = {
      ...fullyQualifiedStudent,
      cgpa: 7.6,
    };
    const res = evaluateEligibility(baseOpportunity, student);
    assert.strictEqual(res.isEligible, false);

    const cgpaRule = res.reasons.find((r) => r.rule === 'Minimum CGPA');
    assert.strictEqual(cgpaRule.status, 'failed');
    assert.strictEqual(cgpaRule.gap, 0.4);
    assert.strictEqual(cgpaRule.message, 'Not eligible: need 0.4 more CGPA (Required: 8, Current: 7.6).');

    // "Will be eligible if" what-if modeling
    const cgpaWhatIf = res.whatIf.find((w) => w.action === 'improve_cgpa');
    assert.ok(cgpaWhatIf, 'Must provide CGPA what-if advice when gap <= 0.6');
    assert.ok(cgpaWhatIf.description.includes('0.4'));
  });

  test('4. Explanatory breakdown: Backlogs exceeding limit shows exact count and what-if action', () => {
    const student = {
      ...fullyQualifiedStudent,
      backlogs: 2,
    };
    const res = evaluateEligibility(baseOpportunity, student);
    assert.strictEqual(res.isEligible, false);

    const backlogRule = res.reasons.find((r) => r.rule === 'Active Backlogs');
    assert.strictEqual(backlogRule.status, 'failed');
    assert.strictEqual(backlogRule.gap, 2);
    assert.strictEqual(backlogRule.message, 'Backlogs: you have 2, maximum is 0.');

    const backlogWhatIf = res.whatIf.find((w) => w.action === 'clear_backlogs');
    assert.ok(backlogWhatIf, 'Must generate clear backlogs what-if item');
    assert.ok(backlogWhatIf.description.includes('Clear 2 active backlog'));
  });

  test('5. Boundary testing: Backlogs exactly equal to maxBacklogs passes', () => {
    const oppWithBacklogs = {
      ...baseOpportunity,
      eligibilityRules: { ...baseOpportunity.eligibilityRules, maxBacklogs: 1 },
    };
    const student = {
      ...fullyQualifiedStudent,
      backlogs: 1,
    };
    const res = evaluateEligibility(oppWithBacklogs, student);
    assert.strictEqual(res.isEligible, true);
    const rule = res.reasons.find((r) => r.rule === 'Active Backlogs');
    assert.strictEqual(rule.status, 'passed');
  });

  test('6. Explanatory breakdown: Unverified profile shows clear TPO verification reason & what-if', () => {
    const student = {
      ...fullyQualifiedStudent,
      isVerifiedByTPO: false,
    };
    const res = evaluateEligibility(baseOpportunity, student);
    assert.strictEqual(res.isEligible, false);

    const verRule = res.reasons.find((r) => r.rule === 'TPO Verification');
    assert.strictEqual(verRule.status, 'failed');
    assert.ok(verRule.message.includes('Profile not verified yet'));

    const verWhatIf = res.whatIf.find((w) => w.action === 'tpo_verification');
    assert.ok(verWhatIf);
  });

  test('7. Multiple branch matching: Case-insensitive and trimmed branch matching', () => {
    const studentLower = {
      ...fullyQualifiedStudent,
      branch: '  information technology  ',
    };
    const res = evaluateEligibility(baseOpportunity, studentLower);
    assert.strictEqual(res.isEligible, true);

    const branchRule = res.reasons.find((r) => r.rule === 'Eligible Branches');
    assert.strictEqual(branchRule.status, 'passed');
  });

  test('8. Explanatory breakdown: Ineligible branch lists all allowed branches', () => {
    const studentCivil = {
      ...fullyQualifiedStudent,
      branch: 'Civil Engineering',
    };
    const res = evaluateEligibility(baseOpportunity, studentCivil);
    assert.strictEqual(res.isEligible, false);

    const branchRule = res.reasons.find((r) => r.rule === 'Eligible Branches');
    assert.strictEqual(branchRule.status, 'failed');
    assert.ok(branchRule.message.includes("Branch not allowed (Civil Engineering)"));
    assert.ok(branchRule.message.includes('Computer Science, Information Technology'));
  });

  test('9. Class 10th and 12th percentage validation and gap computation', () => {
    const studentLowScores = {
      ...fullyQualifiedStudent,
      academics: {
        tenth: { score: 71.0 }, // required: 75.0 (gap 4.0)
        twelfth: { score: 73.5 }, // required: 75.0 (gap 1.5)
      },
    };
    const res = evaluateEligibility(baseOpportunity, studentLowScores);
    assert.strictEqual(res.isEligible, false);

    const tenthRule = res.reasons.find((r) => r.rule === 'Class 10th Percentage');
    assert.strictEqual(tenthRule.status, 'failed');
    assert.strictEqual(tenthRule.gap, 4.0);

    const twelfthRule = res.reasons.find((r) => r.rule === 'Class 12th Percentage');
    assert.strictEqual(twelfthRule.status, 'failed');
    assert.strictEqual(twelfthRule.gap, 1.5);
  });

  test('10. Education gap years check: Flags gaps greater than allowed threshold', () => {
    const studentWithGap = {
      ...fullyQualifiedStudent,
      educationGapYears: 2, // allowed: max 1
    };
    const res = evaluateEligibility(baseOpportunity, studentWithGap);
    assert.strictEqual(res.isEligible, false);

    const gapRule = res.reasons.find((r) => r.rule === 'Education Gap Years');
    assert.strictEqual(gapRule.status, 'failed');
    assert.strictEqual(gapRule.gap, 1);
  });

  test('11. Gender-specific diversity drives: Enforces diversity restrictions when configured', () => {
    const diversityDrive = {
      ...baseOpportunity,
      eligibilityRules: {
        ...baseOpportunity.eligibilityRules,
        allowedGenders: ['Female'],
      },
    };

    const maleStudent = { ...fullyQualifiedStudent, personalInfo: { gender: 'Male' } };
    const femaleStudent = { ...fullyQualifiedStudent, personalInfo: { gender: 'Female' } };

    const maleRes = evaluateEligibility(diversityDrive, maleStudent);
    assert.strictEqual(maleRes.isEligible, false);
    const genderRule = maleRes.reasons.find((r) => r.rule === 'Gender Eligibility');
    assert.strictEqual(genderRule.status, 'failed');

    const femaleRes = evaluateEligibility(diversityDrive, femaleStudent);
    assert.strictEqual(femaleRes.isEligible, true);
  });

  test('12. College Placement Policy: Rejects placed student when multiple offers are disabled', () => {
    const collegePolicyNoMultiple = {
      policies: {
        allowMultipleOffers: false,
        dreamTierThreshold: 15.0,
      },
    };
    const placedStudent = {
      ...fullyQualifiedStudent,
      isPlaced: true,
    };

    const res = evaluateEligibility(baseOpportunity, placedStudent, collegePolicyNoMultiple);
    assert.strictEqual(res.isEligible, false);
    const policyRule = res.reasons.find((r) => r.rule === 'Institutional Placement Policy');
    assert.strictEqual(policyRule.status, 'failed');
    assert.ok(policyRule.message.includes('Multiple offers not permitted once placed'));
  });

  test('13. College Placement Policy: Placed student can only apply to Dream tier drives (>= 15 LPA)', () => {
    const collegePolicyDream = {
      policies: {
        allowMultipleOffers: true,
        dreamTierThreshold: 15.0,
      },
    };
    const placedStudent = {
      ...fullyQualifiedStudent,
      isPlaced: true,
    };

    // Drive offers 14 LPA (fixed) -> Ineligible for placed student
    const regularDrive = { ...baseOpportunity, ctc: { fixed: 14 } };
    const resRegular = evaluateEligibility(regularDrive, placedStudent, collegePolicyDream);
    assert.strictEqual(resRegular.isEligible, false);
    const regularPolicyRule = resRegular.reasons.find((r) => r.rule === 'Institutional Placement Policy');
    assert.strictEqual(regularPolicyRule.status, 'failed');
    assert.ok(regularPolicyRule.message.includes('Dream tier drives (>= 15 LPA)'));

    // Drive offers 22 LPA (fixed) -> Eligible!
    const dreamDrive = { ...baseOpportunity, ctc: { fixed: 22 } };
    const resDream = evaluateEligibility(dreamDrive, placedStudent, collegePolicyDream);
    assert.strictEqual(resDream.isEligible, true);
    const dreamPolicyRule = resDream.reasons.find((r) => r.rule === 'Institutional Placement Policy');
    assert.strictEqual(dreamPolicyRule.status, 'passed');
  });

  test('14. Robustness: Gracefully handles null / undefined profile or null fields without throwing', () => {
    const nullRes = evaluateEligibility(baseOpportunity, null);
    assert.strictEqual(nullRes.isEligible, false);
    assert.strictEqual(nullRes.score, 0);

    const emptyStudent = {
      _id: 'stud_empty',
      isVerifiedByTPO: false,
    };
    const emptyRes = evaluateEligibility(baseOpportunity, emptyStudent);
    assert.strictEqual(emptyRes.isEligible, false);
    assert.ok(emptyRes.reasons.length > 0);
  });

  test('15. Backward compatibility: checkEligibility service method returns both isEligible and reason string', () => {
    const res = checkEligibility(baseOpportunity, fullyQualifiedStudent);
    assert.strictEqual(res.isEligible, true);
    assert.strictEqual(res.eligible, true);
    assert.strictEqual(typeof res.reason, 'string');
    assert.ok(Array.isArray(res.reasons));
  });

  test('16. Batch graduation year coercion: String batch year matches numeric allowed year', () => {
    const studentStringBatch = {
      ...fullyQualifiedStudent,
      graduationYear: '2026',
    };
    const res = evaluateEligibility(baseOpportunity, studentStringBatch);
    assert.strictEqual(res.isEligible, true);
    const batchRule = res.reasons.find((r) => r.rule === 'Graduation Year');
    assert.strictEqual(batchRule.status, 'passed');
  });

  test('17. Empty allowed criteria: Empty branches and batches allow all students', () => {
    const openDrive = {
      ...baseOpportunity,
      eligibilityRules: {
        minCgpa: 6.0,
        maxBacklogs: 2,
        allowedBranches: [],
        allowedGraduationYears: [],
      },
    };
    const mechStudent = {
      ...fullyQualifiedStudent,
      branch: 'Mechanical Engineering',
      graduationYear: 2025,
      cgpa: 7.0,
    };
    const res = evaluateEligibility(openDrive, mechStudent);
    assert.strictEqual(res.isEligible, true);
    assert.ok(!res.reasons.some((r) => r.status === 'failed'));
  });

  test('18. Placed student policy handling with null / zero CTC drive', () => {
    const policy = {
      policies: {
        allowMultipleOffers: true,
        dreamTierThreshold: 12.0,
      },
    };
    const unpaidDrive = {
      ...baseOpportunity,
      ctc: null,
    };
    const placedStudent = {
      ...fullyQualifiedStudent,
      isPlaced: true,
    };
    const res = evaluateEligibility(unpaidDrive, placedStudent, policy);
    assert.strictEqual(res.isEligible, false);
    const rule = res.reasons.find((r) => r.rule === 'Institutional Placement Policy');
    assert.strictEqual(rule.status, 'failed');
  });

  test('19. Multiple branches edge cases: Trimming and casing differences', () => {
    const drive = {
      ...baseOpportunity,
      eligibilityRules: {
        ...baseOpportunity.eligibilityRules,
        allowedBranches: ['computer science', 'Electrical Engineering'],
      },
    };
    const student = {
      ...fullyQualifiedStudent,
      branch: '   COMPUTER SCIENCE   ',
    };
    const res = evaluateEligibility(drive, student);
    assert.strictEqual(res.isEligible, true);
  });

  test('20. Missing 10th and 12th scores treated safely as 0 with exact gap calculation', () => {
    const studentWithoutSchoolMarks = {
      ...fullyQualifiedStudent,
      academics: {},
    };
    const res = evaluateEligibility(baseOpportunity, studentWithoutSchoolMarks);
    assert.strictEqual(res.isEligible, false);
    const tenthRule = res.reasons.find((r) => r.rule === 'Class 10th Percentage');
    assert.strictEqual(tenthRule.status, 'failed');
    assert.strictEqual(tenthRule.gap, 75.0);
  });

  test('21. EligibilityCache static methods are defined and callable', () => {
    assert.strictEqual(typeof EligibilityCache.getCachedOrCompute, 'function');
    assert.strictEqual(typeof EligibilityCache.invalidateForStudent, 'function');
    assert.strictEqual(typeof EligibilityCache.invalidateForDrive, 'function');
  });
});
