/**
 * Explanatory Eligibility Engine
 * Provides rule-by-rule evaluation, gap analysis, and "will be eligible if" what-if modeling.
 */

function roundNumber(num, decimals = 2) {
  if (num === null || num === undefined || isNaN(num)) return 0;
  return Number(Math.round(Number(num + 'e' + decimals)) + 'e-' + decimals);
}

/**
 * Evaluates student eligibility for an opportunity with full explanatory breakdowns
 * @param {Object} opportunity - Drive object containing eligibilityRules and CTC
 * @param {Object} studentProfile - Complete student profile document
 * @param {Object} [college] - College document with institutional placement policies
 * @returns {Object} Explanatory eligibility result
 */
function evaluateEligibility(opportunity, studentProfile, college = null) {
  if (!studentProfile) {
    return {
      isEligible: false,
      score: 0,
      reasons: [
        {
          rule: 'Profile Setup',
          required: 'Complete Profile',
          actual: 'Incomplete',
          gap: 'Missing profile record',
          status: 'failed',
          message: 'Profile incomplete. Please set up your academic profile.',
        },
      ],
      whatIf: [
        {
          action: 'complete_profile',
          description: 'Complete your personal and academic profile in the profile builder.',
          impact: 'Enables eligibility evaluation across all active campus drives.',
        },
      ],
      summary: 'Profile setup required before eligibility can be assessed.',
    };
  }

  const rules = opportunity?.eligibilityRules || {};
  const reasons = [];
  const whatIf = [];

  // Helper values
  const studentCgpa = studentProfile.cgpa ?? studentProfile.academics?.currentCgpa ?? studentProfile.academicInfo?.cgpa ?? 0;
  const studentBacklogs = studentProfile.backlogs ?? studentProfile.academics?.activeBacklogs ?? studentProfile.academicInfo?.activeBacklogs ?? 0;
  const studentBranch = (studentProfile.branch || studentProfile.academics?.undergrad?.branch || studentProfile.academicInfo?.branch || '').trim();
  const studentGradYear = studentProfile.graduationYear || studentProfile.academics?.graduationYear || 2026;
  const isVerified = Boolean(studentProfile.isVerifiedByTPO || studentProfile.isVerified);
  const tenthScore = studentProfile.academics?.tenth?.score ?? 0;
  const twelfthScore = studentProfile.academics?.twelfth?.score ?? 0;
  const gapYears = studentProfile.educationGapYears ?? 0;
  const gender = studentProfile.personalInfo?.gender || '';
  const isPlaced = Boolean(studentProfile.isPlaced);

  // 1. TPO Academic Verification Rule
  if (isVerified) {
    reasons.push({
      rule: 'TPO Verification',
      required: 'Verified by TPO',
      actual: 'Verified',
      gap: null,
      status: 'passed',
      message: 'Academic record verified and cryptographically sealed by TPO.',
    });
  } else {
    reasons.push({
      rule: 'TPO Verification',
      required: 'Verified by TPO',
      actual: 'Unverified / Pending',
      gap: 'Pending verification',
      status: 'failed',
      message: 'Profile not verified yet. Verification by Placement Cell is mandatory.',
    });
    whatIf.push({
      action: 'tpo_verification',
      description: 'Upload your verified marksheets and wait for TPO approval.',
      impact: 'Unlocks formal drive registration and eligibility seals.',
    });
  }

  // 2. CGPA Rule
  const minCgpa = rules.minCgpa !== undefined && rules.minCgpa !== null ? rules.minCgpa : 0;
  if (studentCgpa >= minCgpa) {
    reasons.push({
      rule: 'Minimum CGPA',
      required: minCgpa,
      actual: roundNumber(studentCgpa),
      gap: null,
      status: 'passed',
      message: `CGPA requirement met (${studentCgpa} >= ${minCgpa}).`,
    });
  } else {
    const cgpaGap = roundNumber(minCgpa - studentCgpa);
    reasons.push({
      rule: 'Minimum CGPA',
      required: minCgpa,
      actual: roundNumber(studentCgpa),
      gap: cgpaGap,
      status: 'failed',
      message: `Not eligible: need ${cgpaGap} more CGPA (Required: ${minCgpa}, Current: ${studentCgpa}).`,
    });

    if (cgpaGap <= 0.6) {
      whatIf.push({
        action: 'improve_cgpa',
        description: `Raise your current CGPA by ${cgpaGap} point(s) in the upcoming semester exams.`,
        impact: `Will qualify for this role (${opportunity.companyName}).`,
      });
    }
  }

  // 3. Active Backlogs Rule
  const maxBacklogs = rules.maxBacklogs !== undefined && rules.maxBacklogs !== null ? rules.maxBacklogs : 0;
  if (studentBacklogs <= maxBacklogs) {
    reasons.push({
      rule: 'Active Backlogs',
      required: `Max ${maxBacklogs}`,
      actual: studentBacklogs,
      gap: null,
      status: 'passed',
      message: `Backlog criteria met (${studentBacklogs} active, maximum allowed is ${maxBacklogs}).`,
    });
  } else {
    const backlogExcess = studentBacklogs - maxBacklogs;
    reasons.push({
      rule: 'Active Backlogs',
      required: `Max ${maxBacklogs}`,
      actual: studentBacklogs,
      gap: backlogExcess,
      status: 'failed',
      message: `Backlogs: you have ${studentBacklogs}, maximum is ${maxBacklogs}.`,
    });
    whatIf.push({
      action: 'clear_backlogs',
      description: `Clear ${backlogExcess} active backlog subject(s) in remedial/supplementary exams.`,
      impact: 'Will bring you within the allowable backlog threshold.',
    });
  }

  // 4. Allowed Branches Rule
  const allowedBranches = Array.isArray(rules.allowedBranches) ? rules.allowedBranches.filter(Boolean) : [];
  if (allowedBranches.length === 0) {
    reasons.push({
      rule: 'Eligible Branches',
      required: 'All Branches',
      actual: studentBranch || 'All',
      gap: null,
      status: 'passed',
      message: 'Drive is open to all engineering departments.',
    });
  } else {
    const isBranchAllowed = allowedBranches.some((b) => {
      const bNorm = b.toLowerCase().trim();
      const sNorm = studentBranch.toLowerCase().trim();
      return bNorm === sNorm || sNorm.includes(bNorm) || bNorm.includes(sNorm);
    });

    if (isBranchAllowed) {
      reasons.push({
        rule: 'Eligible Branches',
        required: allowedBranches.join(', '),
        actual: studentBranch,
        gap: null,
        status: 'passed',
        message: `Branch permitted (${studentBranch}).`,
      });
    } else {
      reasons.push({
        rule: 'Eligible Branches',
        required: allowedBranches.join(', '),
        actual: studentBranch || 'Unspecified',
        gap: 'Branch mismatch',
        status: 'failed',
        message: `Branch not allowed (${studentBranch || 'Unspecified'}). Allowed: ${allowedBranches.join(', ')}.`,
      });
    }
  }

  // 5. Class 10th Percentage Rule
  const minTenth = rules.minTenthPercentage !== undefined && rules.minTenthPercentage !== null ? rules.minTenthPercentage : 0;
  if (minTenth > 0) {
    if (tenthScore >= minTenth) {
      reasons.push({
        rule: 'Class 10th Percentage',
        required: `${minTenth}%`,
        actual: `${tenthScore}%`,
        gap: null,
        status: 'passed',
        message: `Class 10th score requirement met (${tenthScore}% >= ${minTenth}%).`,
      });
    } else {
      const tenthGap = roundNumber(minTenth - tenthScore, 1);
      reasons.push({
        rule: 'Class 10th Percentage',
        required: `${minTenth}%`,
        actual: `${tenthScore}%`,
        gap: tenthGap,
        status: 'failed',
        message: `Class 10th: you have ${tenthScore}%, minimum is ${minTenth}%.`,
      });
    }
  }

  // 6. Class 12th Percentage Rule
  const minTwelfth = rules.minTwelfthPercentage !== undefined && rules.minTwelfthPercentage !== null ? rules.minTwelfthPercentage : 0;
  if (minTwelfth > 0) {
    if (twelfthScore >= minTwelfth) {
      reasons.push({
        rule: 'Class 12th Percentage',
        required: `${minTwelfth}%`,
        actual: `${twelfthScore}%`,
        gap: null,
        status: 'passed',
        message: `Class 12th score requirement met (${twelfthScore}% >= ${minTwelfth}%).`,
      });
    } else {
      const twelfthGap = roundNumber(minTwelfth - twelfthScore, 1);
      reasons.push({
        rule: 'Class 12th Percentage',
        required: `${minTwelfth}%`,
        actual: `${twelfthScore}%`,
        gap: twelfthGap,
        status: 'failed',
        message: `Class 12th: you have ${twelfthScore}%, minimum is ${minTwelfth}%.`,
      });
    }
  }

  // 7. Graduation Year Rule
  const allowedGradYears = Array.isArray(rules.allowedGraduationYears) ? rules.allowedGraduationYears : [];
  if (allowedGradYears.length > 0) {
    if (allowedGradYears.includes(Number(studentGradYear))) {
      reasons.push({
        rule: 'Graduation Year',
        required: allowedGradYears.join(', '),
        actual: studentGradYear,
        gap: null,
        status: 'passed',
        message: `Graduation batch verified (${studentGradYear}).`,
      });
    } else {
      reasons.push({
        rule: 'Graduation Year',
        required: allowedGradYears.join(', '),
        actual: studentGradYear,
        gap: 'Batch mismatch',
        status: 'failed',
        message: `Graduation batch ${studentGradYear} not eligible. Required: ${allowedGradYears.join(', ')}.`,
      });
    }
  }

  // 8. Education Gap Years Rule
  const maxGapYears = rules.maxGapYears !== undefined && rules.maxGapYears !== null ? rules.maxGapYears : null;
  if (maxGapYears !== null) {
    if (gapYears <= maxGapYears) {
      reasons.push({
        rule: 'Education Gap Years',
        required: `Max ${maxGapYears} year(s)`,
        actual: `${gapYears} year(s)`,
        gap: null,
        status: 'passed',
        message: `Education gap within allowed limit (${gapYears} <= ${maxGapYears}).`,
      });
    } else {
      reasons.push({
        rule: 'Education Gap Years',
        required: `Max ${maxGapYears} year(s)`,
        actual: `${gapYears} year(s)`,
        gap: gapYears - maxGapYears,
        status: 'failed',
        message: `Education gap: you have ${gapYears} year(s), maximum permitted is ${maxGapYears}.`,
      });
    }
  }

  // 9. Gender-Specific Diversity Drives (where legally specified)
  const allowedGenders = Array.isArray(rules.allowedGenders) && rules.allowedGenders.length > 0
    ? rules.allowedGenders
    : rules.genderNeutral === false && rules.allowedGender
    ? [rules.allowedGender]
    : ['All'];

  if (!allowedGenders.includes('All')) {
    if (gender && allowedGenders.map((g) => g.toLowerCase()).includes(gender.toLowerCase())) {
      reasons.push({
        rule: 'Gender Eligibility',
        required: allowedGenders.join(', '),
        actual: gender,
        gap: null,
        status: 'passed',
        message: `Diversity criteria matched (${gender}).`,
      });
    } else {
      reasons.push({
        rule: 'Gender Eligibility',
        required: allowedGenders.join(', '),
        actual: gender || 'Unspecified',
        gap: 'Diversity initiative restriction',
        status: 'failed',
        message: `This drive is open exclusively to ${allowedGenders.join(', ')} candidates.`,
      });
    }
  }

  // 10. Placed Student Policy (College Placement Regulations)
  if (college && college.policies && isPlaced) {
    const { allowMultipleOffers = true, dreamTierThreshold = 15.0 } = college.policies;
    const driveCtc = opportunity.ctc?.fixed || opportunity.ctc?.total || 0;

    if (!allowMultipleOffers) {
      reasons.push({
        rule: 'Institutional Placement Policy',
        required: 'Unplaced candidates only',
        actual: 'Already Placed',
        gap: 'Policy limit reached',
        status: 'failed',
        message: 'College policy: Multiple offers not permitted once placed.',
      });
    } else if (driveCtc < dreamTierThreshold) {
      const ctcGap = roundNumber(dreamTierThreshold - driveCtc);
      reasons.push({
        rule: 'Institutional Placement Policy',
        required: `Dream Tier (>= ${dreamTierThreshold} LPA)`,
        actual: `${driveCtc} LPA`,
        gap: ctcGap,
        status: 'failed',
        message: `College policy: Placed students may only apply to Dream tier drives (>= ${dreamTierThreshold} LPA). This drive offers ${driveCtc} LPA.`,
      });
    } else {
      reasons.push({
        rule: 'Institutional Placement Policy',
        required: `Dream Tier (>= ${dreamTierThreshold} LPA)`,
        actual: `${driveCtc} LPA`,
        gap: null,
        status: 'passed',
        message: `Qualifies under institutional Dream tier policy (${driveCtc} LPA >= ${dreamTierThreshold} LPA).`,
      });
    }
  }

  // Calculate composite score & overall eligibility
  const failedReasons = reasons.filter((r) => r.status === 'failed');
  const isEligible = failedReasons.length === 0;
  const passedCount = reasons.filter((r) => r.status === 'passed').length;
  const score = reasons.length > 0 ? Math.round((passedCount / reasons.length) * 100) : 100;

  // Build summary message
  let summary = '';
  if (isEligible) {
    summary = `You meet all ${reasons.length} institutional and corporate eligibility criteria!`;
  } else {
    summary = failedReasons.map((f) => f.message).join(' | ');
  }

  return {
    isEligible,
    eligible: isEligible, // Alias for backward compatibility
    score,
    passedCount,
    totalRules: reasons.length,
    reasons,
    whatIf,
    summary,
  };
}

module.exports = {
  evaluateEligibility,
  checkEligibility: evaluateEligibility, // Backward compatibility alias
};
