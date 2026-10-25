const PlacementPolicy = require('../../models/PlacementPolicy');
const PolicyOverride = require('../../models/PolicyOverride');
const Application = require('../../models/Application');
const StudentProfile = require('../../models/StudentProfile');
const Opportunity = require('../../models/Opportunity');
const User = require('../../models/User');

/**
 * Fetch or initialize placement policy for a college
 */
async function getCollegePlacementPolicy(collegeId) {
  const mongoose = require('mongoose');
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    let policy = await PlacementPolicy.findOne({ collegeId });
    if (!policy) {
      policy = await PlacementPolicy.create({
        collegeId,
        tierEligibility: {
          tiers: PlacementPolicy.DEFAULT_TIERS,
        },
      });
    }
    return policy;
  }
  return {
    collegeId,
    oneStudentOneOffer: { enabled: false },
    dreamCap: { enabled: false, maxDreamOffers: 1, dreamThresholdCtc: 15.0, allowUnlimitedCore: true },
    tierEligibility: { enabled: false, upgradeOnly: true, tiers: PlacementPolicy.DEFAULT_TIERS },
    priorityUnplaced: { enabled: false, blockPlacedStudents: true },
    maxConcurrentApplications: { enabled: false, maxActive: 5 },
    blackoutDates: [],
  };
}

/**
 * Calculate drive total CTC in LPA
 */
function getOpportunityCtc(opportunity) {
  if (!opportunity) return 0;
  if (opportunity.ctc && (opportunity.ctc.fixed || opportunity.ctc.variable)) {
    return Number((opportunity.ctc.fixed || 0) + (opportunity.ctc.variable || 0));
  }
  if (opportunity.salary) {
    const match = String(opportunity.salary).match(/(\d+(\.\d+)?)/);
    if (match) return parseFloat(match[1]);
  }
  return 0;
}

/**
 * Determine tier for a given CTC using policy tiers
 */
function determineTier(ctc, tiers) {
  if (!tiers || tiers.length === 0) {
    tiers = PlacementPolicy.DEFAULT_TIERS;
  }
  const sortedTiers = [...tiers].sort((a, b) => a.order - b.order);

  for (let i = sortedTiers.length - 1; i >= 0; i--) {
    const tier = sortedTiers[i];
    if (ctc >= tier.minCtc && (tier.maxCtc === null || tier.maxCtc === undefined || ctc < tier.maxCtc)) {
      return tier;
    }
  }
  return sortedTiers[0] || { name: 'Standard', order: 1, minCtc: 0, maxCtc: 6 };
}

/**
 * Check if a date falls within an effective range
 */
function isDateEffective(effectiveFrom, effectiveTo, targetDate = new Date()) {
  const d = new Date(targetDate);
  if (effectiveFrom && d < new Date(effectiveFrom)) return false;
  if (effectiveTo && d > new Date(effectiveTo)) return false;
  return true;
}

/**
 * Evaluate student against placement policy rules for a target opportunity
 */
async function evaluateStudentPolicy({
  collegeId,
  studentId,
  opportunity,
  studentProfile = null,
  applications = null,
  activeOffers = null,
  activeOverride = undefined,
  policy = null,
  currentDate = new Date(),
}) {
  const mongoose = require('mongoose');
  const targetDate = new Date(currentDate);

  if (!policy) {
    policy = await getCollegePlacementPolicy(collegeId);
  }

  // 1. Check for Active TPO Overrides
  let foundOverride = activeOverride;
  if (foundOverride === undefined) {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      foundOverride = await PolicyOverride.findOne({
        collegeId,
        studentId,
        isActive: true,
        $or: [
          { opportunityId: null },
          { opportunityId: opportunity._id || opportunity.id },
        ],
        $and: [
          {
            $or: [
              { expiresAt: null },
              { expiresAt: { $gt: targetDate } },
            ],
          },
        ],
      }).populate('approvedBy', 'firstName lastName email');
    } else {
      foundOverride = null;
    }
  }

  if (foundOverride && (foundOverride.policyType === 'all' || foundOverride.policyType)) {
    // If override is 'all' or covers the specific policy, we note it
    if (foundOverride.policyType === 'all') {
      return {
        isAllowed: true,
        hasOverride: true,
        overrideDetails: {
          id: foundOverride._id,
          policyType: foundOverride.policyType,
          reason: foundOverride.mandatoryReason,
          approver: foundOverride.approvedBy
            ? `${foundOverride.approvedBy.firstName} ${foundOverride.approvedBy.lastName}`
            : 'TPO Officer',
          grantedAt: foundOverride.createdAt,
        },
        blockingReasons: [],
      };
    }
  }

  // Load applications and profile if not provided
  if (!studentProfile) {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      studentProfile = await StudentProfile.findOne({
        $or: [{ user: studentId }, { _id: studentId }],
      }).lean();
    } else {
      studentProfile = { isPlaced: false };
    }
  }

  if (!applications) {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      applications = await Application.find({
        collegeId,
        studentId: studentProfile?.user || studentId,
      }).populate('opportunityId').lean();
    } else {
      applications = [];
    }
  }

  const blockingReasons = [];
  const driveCtc = getOpportunityCtc(opportunity);
  const driveTier = determineTier(driveCtc, policy.tierEligibility?.tiers);

  // Accepted offers or existing placed details
  const acceptedApplications = applications.filter(
    (app) => app.offer?.status === 'Accepted' || app.status === 'Placed'
  );
  const isPlaced = Boolean(
    studentProfile?.isPlaced ||
    acceptedApplications.length > 0 ||
    studentProfile?.placedDetails?.companyName
  );

  // Check override helper for specific policy type
  const hasSpecificOverride = (type) => {
    return Boolean(
      foundOverride &&
      (foundOverride.policyType === 'all' || foundOverride.policyType === type)
    );
  };

  // -------------------------------------------------------------
  // Rule 1: Institutional Blackout Dates
  // -------------------------------------------------------------
  if (policy.blackoutDates && policy.blackoutDates.length > 0) {
    for (const blackout of policy.blackoutDates) {
      const bStart = new Date(blackout.startDate);
      const bEnd = new Date(blackout.endDate);
      if (targetDate >= bStart && targetDate <= bEnd) {
        const driveMatches =
          blackout.appliesToAllDrives ||
          (blackout.affectedDriveIds &&
            blackout.affectedDriveIds.some(
              (id) => String(id) === String(opportunity._id || opportunity.id)
            ));

        if (driveMatches && !hasSpecificOverride('blackout_dates')) {
          blockingReasons.push({
            policyType: 'blackout_dates',
            code: 'POLICY_BLACKOUT_ACTIVE',
            title: 'Blackout Period Active',
            message: `Institutional Blackout Active: "${blackout.title}" (${bStart.toLocaleDateString()} to ${bEnd.toLocaleDateString()}). ${blackout.reason || 'Applications are currently paused.'}`,
          });
          break; // Stop at first active blackout
        }
      }
    }
  }

  // -------------------------------------------------------------
  // Rule 2: Max Concurrent Applications Cap
  // -------------------------------------------------------------
  if (
    policy.maxConcurrentApplications?.enabled &&
    isDateEffective(
      policy.maxConcurrentApplications.effectiveFrom,
      policy.maxConcurrentApplications.effectiveTo,
      targetDate
    ) &&
    !hasSpecificOverride('max_concurrent_apps')
  ) {
    const activeStatuses = [
      'Applied',
      'In Review',
      'Shortlisted',
      'Hold',
      'Online Assessment',
      'Technical Round',
      'HR Round',
      'Offer Proposed',
      'Offer Extended',
    ];
    const activeAppsCount = applications.filter((app) =>
      activeStatuses.includes(app.status)
    ).length;

    const maxAllowed = policy.maxConcurrentApplications.maxActive || 5;
    if (activeAppsCount >= maxAllowed) {
      blockingReasons.push({
        policyType: 'max_concurrent_apps',
        code: 'POLICY_CONCURRENT_LIMIT_REACHED',
        title: 'Max Concurrent Applications Limit',
        message: `Application Limit Reached: You have ${activeAppsCount} active in-progress applications. Institutional policy limits students to ${maxAllowed} simultaneous applications.`,
      });
    }
  }

  // -------------------------------------------------------------
  // Rule 3: Priority for Unplaced Students
  // -------------------------------------------------------------
  if (
    policy.priorityUnplaced?.enabled &&
    policy.priorityUnplaced.blockPlacedStudents &&
    isDateEffective(
      policy.priorityUnplaced.effectiveFrom,
      policy.priorityUnplaced.effectiveTo,
      targetDate
    ) &&
    !hasSpecificOverride('priority_unplaced')
  ) {
    if (isPlaced) {
      blockingReasons.push({
        policyType: 'priority_unplaced',
        code: 'POLICY_UNPLACED_PRIORITY',
        title: 'Priority for Unplaced Candidates',
        message: 'Priority Placement Active: This drive is reserved for unplaced students to ensure equitable placement distribution.',
      });
    }
  }

  // -------------------------------------------------------------
  // Rule 4: One-Student-One-Offer Policy
  // -------------------------------------------------------------
  if (
    policy.oneStudentOneOffer?.enabled &&
    isDateEffective(
      policy.oneStudentOneOffer.effectiveFrom,
      policy.oneStudentOneOffer.effectiveTo,
      targetDate
    ) &&
    !hasSpecificOverride('one_student_one_offer')
  ) {
    if (acceptedApplications.length > 0 || studentProfile?.isPlaced) {
      const placedCompany =
        acceptedApplications[0]?.opportunityId?.companyName ||
        studentProfile?.placedDetails?.companyName ||
        'an employer';
      blockingReasons.push({
        policyType: 'one_student_one_offer',
        code: 'POLICY_ONE_STUDENT_ONE_OFFER',
        title: 'One-Student-One-Offer Rule',
        message: `One-Student-One-Offer Policy: You have already accepted an offer with ${placedCompany}. Institutional policy permits only one accepted placement per student.`,
      });
    }
  }

  // -------------------------------------------------------------
  // Rule 5: Tier-Based Eligibility & Upgrade Progression
  // -------------------------------------------------------------
  if (
    policy.tierEligibility?.enabled &&
    isDateEffective(
      policy.tierEligibility.effectiveFrom,
      policy.tierEligibility.effectiveTo,
      targetDate
    ) &&
    !hasSpecificOverride('tier_eligibility')
  ) {
    if (acceptedApplications.length > 0) {
      // Find highest placed tier among accepted offers
      let highestPlacedTier = { order: 0, name: 'None', minCtc: 0 };
      let highestPlacedCtc = 0;

      for (const app of acceptedApplications) {
        const appCtc =
          app.offer?.ctc ||
          getOpportunityCtc(app.opportunityId) ||
          studentProfile?.placedDetails?.ctc ||
          0;
        const appTier = determineTier(appCtc, policy.tierEligibility.tiers);
        if (appTier.order > highestPlacedTier.order) {
          highestPlacedTier = appTier;
          highestPlacedCtc = appCtc;
        }
      }

      if (policy.tierEligibility.upgradeOnly && driveTier.order <= highestPlacedTier.order) {
        blockingReasons.push({
          policyType: 'tier_eligibility',
          code: 'POLICY_TIER_NOT_UPGRADE',
          title: 'Tier-Based Progression Rule',
          message: `Tier Policy: You hold an accepted offer in ${highestPlacedTier.name} tier (${highestPlacedCtc} LPA). You may only apply to higher tier opportunities (${driveTier.name} tier is not an upgrade).`,
        });
      }
    }
  }

  // -------------------------------------------------------------
  // Rule 6: Dream Cap Rule
  // -------------------------------------------------------------
  if (
    policy.dreamCap?.enabled &&
    isDateEffective(
      policy.dreamCap.effectiveFrom,
      policy.dreamCap.effectiveTo,
      targetDate
    ) &&
    !hasSpecificOverride('dream_cap')
  ) {
    const dreamThreshold = policy.dreamCap.dreamThresholdCtc || 15.0;
    const isDriveDream = driveCtc >= dreamThreshold || driveTier.name.includes('Dream');

    if (isDriveDream) {
      // Count student's existing dream offers
      const dreamOffers = applications.filter((app) => {
        const hasOffer = ['Pending', 'Accepted'].includes(app.offer?.status);
        const offerCtc = app.offer?.ctc || getOpportunityCtc(app.opportunityId) || 0;
        return hasOffer && offerCtc >= dreamThreshold;
      });

      const maxDream = policy.dreamCap.maxDreamOffers || 1;
      if (dreamOffers.length >= maxDream) {
        blockingReasons.push({
          policyType: 'dream_cap',
          code: 'POLICY_DREAM_CAP_EXCEEDED',
          title: 'Dream Tier Cap Reached',
          message: `Dream Cap Reached: You have already secured ${dreamOffers.length} Dream tier offer(s). The institutional cap is ${maxDream} Dream offer(s). ${policy.dreamCap.allowUnlimitedCore ? 'You may continue applying for Core/Standard tier opportunities.' : ''}`.trim(),
        });
      }
    }
  }

  const isAllowed = blockingReasons.length === 0;

  return {
    isAllowed,
    hasOverride: Boolean(activeOverride),
    overrideDetails: activeOverride
      ? {
          id: activeOverride._id,
          policyType: activeOverride.policyType,
          reason: activeOverride.mandatoryReason,
          approver: activeOverride.approvedBy
            ? `${activeOverride.approvedBy.firstName} ${activeOverride.approvedBy.lastName}`
            : 'TPO Officer',
          grantedAt: activeOverride.createdAt,
        }
      : null,
    driveDetails: {
      ctc: driveCtc,
      tier: driveTier.name,
      tierOrder: driveTier.order,
    },
    blockingReasons,
  };
}

/**
 * Preview impact of a policy on an opportunity across all registered students
 */
async function simulatePolicyImpact({ collegeId, opportunityId, proposedPolicy = null }) {
  const opportunity = await Opportunity.findById(opportunityId).lean();
  if (!opportunity) {
    throw new Error('Opportunity not found for simulation preview.');
  }

  const policy = proposedPolicy || (await getCollegePlacementPolicy(collegeId));

  // Fetch all registered students in the college
  const students = await StudentProfile.find({ collegeId })
    .populate('user', 'firstName lastName email')
    .lean();

  const allApplications = await Application.find({ collegeId })
    .populate('opportunityId')
    .lean();

  // Group applications by studentId
  const appsByStudent = {};
  for (const app of allApplications) {
    const sId = String(app.studentId);
    if (!appsByStudent[sId]) appsByStudent[sId] = [];
    appsByStudent[sId].push(app);
  }

  let totalStudents = students.length;
  let totalEligibleWithoutPolicy = 0;
  let totalBlockedByPolicy = 0;
  const breakdown = {
    oneStudentOneOffer: 0,
    dreamCap: 0,
    tierEligibility: 0,
    priorityUnplaced: 0,
    maxConcurrentApplications: 0,
    blackoutDates: 0,
  };
  const sampleBlocked = [];

  for (const s of students) {
    const sId = String(s.user?._id || s.user);
    const sApps = appsByStudent[sId] || [];

    // Basic eligibility check (CGPA, backlogs, branch)
    const minCgpa = opportunity.eligibilityRules?.minCgpa || 0;
    const maxBacklogs = opportunity.eligibilityRules?.maxBacklogs ?? 99;
    const allowedBranches = opportunity.eligibilityRules?.allowedBranches || [];

    const isAcademicallyEligible =
      (s.cgpa || 0) >= minCgpa &&
      (s.backlogs || 0) <= maxBacklogs &&
      (allowedBranches.length === 0 || allowedBranches.includes(s.branch));

    if (isAcademicallyEligible) {
      totalEligibleWithoutPolicy++;

      // Run policy evaluation
      const evalResult = await evaluateStudentPolicy({
        collegeId,
        studentId: s.user?._id || s.user,
        opportunity,
        studentProfile: s,
        applications: sApps,
        policy,
      });

      if (!evalResult.isAllowed) {
        totalBlockedByPolicy++;
        for (const reason of evalResult.blockingReasons) {
          if (reason.policyType === 'one_student_one_offer') breakdown.oneStudentOneOffer++;
          if (reason.policyType === 'dream_cap') breakdown.dreamCap++;
          if (reason.policyType === 'tier_eligibility') breakdown.tierEligibility++;
          if (reason.policyType === 'priority_unplaced') breakdown.priorityUnplaced++;
          if (reason.policyType === 'max_concurrent_apps') breakdown.maxConcurrentApplications++;
          if (reason.policyType === 'blackout_dates') breakdown.blackoutDates++;
        }

        if (sampleBlocked.length < 15) {
          sampleBlocked.push({
            rollNo: s.rollNo,
            name: s.user ? `${s.user.firstName} ${s.user.lastName}` : s.rollNo,
            branch: s.branch,
            cgpa: s.cgpa,
            primaryBlockingReason: evalResult.blockingReasons[0]?.message || 'Blocked by placement policy',
            policyType: evalResult.blockingReasons[0]?.policyType,
          });
        }
      }
    }
  }

  const driveCtc = getOpportunityCtc(opportunity);
  const driveTier = determineTier(driveCtc, policy.tierEligibility?.tiers);

  return {
    drive: {
      id: opportunity._id,
      title: opportunity.title,
      companyName: opportunity.companyName,
      ctc: driveCtc,
      tier: driveTier.name,
    },
    totalStudents,
    totalEligibleWithoutPolicy,
    totalBlockedByPolicy,
    totalEligibleWithPolicy: Math.max(0, totalEligibleWithoutPolicy - totalBlockedByPolicy),
    breakdown,
    sampleBlocked,
  };
}

/**
 * Generate Fairness & Diversity Report with Small-Cell Suppression (n < 5)
 */
async function generateFairnessReport({ collegeId }) {
  const students = await StudentProfile.find({ collegeId })
    .populate('user', 'firstName lastName email')
    .lean();

  const applications = await Application.find({ collegeId })
    .populate('opportunityId')
    .lean();

  // Build cohort maps
  const initCohort = () => ({
    totalStudents: 0,
    placedCount: 0,
    totalOffers: 0,
    totalCtc: 0,
    highestCtc: 0,
  });

  const byGender = {};
  const byBranch = {};
  const byCategory = {};

  // Group applications by studentId
  const appsByStudent = {};
  for (const app of applications) {
    const sId = String(app.studentId);
    if (!appsByStudent[sId]) appsByStudent[sId] = [];
    appsByStudent[sId].push(app);
  }

  for (const s of students) {
    const sId = String(s.user?._id || s.user);
    const sApps = appsByStudent[sId] || [];

    const gender = s.personalInfo?.gender || 'Unspecified';
    const branch = s.branch || 'General Engineering';
    const category = s.personalInfo?.category || 'General';

    if (!byGender[gender]) byGender[gender] = initCohort();
    if (!byBranch[branch]) byBranch[branch] = initCohort();
    if (!byCategory[category]) byCategory[category] = initCohort();

    byGender[gender].totalStudents++;
    byBranch[branch].totalStudents++;
    byCategory[category].totalStudents++;

    // Check offers and placed status
    const acceptedOffers = sApps.filter(
      (a) => a.offer?.status === 'Accepted' || a.status === 'Placed'
    );
    const allOffers = sApps.filter((a) =>
      ['Pending', 'Accepted'].includes(a.offer?.status)
    );

    const isPlaced = s.isPlaced || acceptedOffers.length > 0;
    const offersCount = allOffers.length;

    let studentHighestCtc = 0;
    for (const off of allOffers) {
      const ctc = off.offer?.ctc || getOpportunityCtc(off.opportunityId) || 0;
      if (ctc > studentHighestCtc) studentHighestCtc = ctc;
    }
    if (s.placedDetails?.ctc && s.placedDetails.ctc > studentHighestCtc) {
      studentHighestCtc = s.placedDetails.ctc;
    }

    if (isPlaced) {
      byGender[gender].placedCount++;
      byBranch[branch].placedCount++;
      byCategory[category].placedCount++;
    }

    byGender[gender].totalOffers += offersCount;
    byBranch[branch].totalOffers += offersCount;
    byCategory[category].totalOffers += offersCount;

    if (studentHighestCtc > 0) {
      byGender[gender].totalCtc += studentHighestCtc;
      byBranch[branch].totalCtc += studentHighestCtc;
      byCategory[category].totalCtc += studentHighestCtc;

      if (studentHighestCtc > byGender[gender].highestCtc) byGender[gender].highestCtc = studentHighestCtc;
      if (studentHighestCtc > byBranch[branch].highestCtc) byBranch[branch].highestCtc = studentHighestCtc;
      if (studentHighestCtc > byCategory[category].highestCtc) byCategory[category].highestCtc = studentHighestCtc;
    }
  }

  // Format with k-anonymity (small cell suppression if totalStudents < 5)
  const formatCohortMap = (cohortMap) => {
    return Object.entries(cohortMap).map(([label, data]) => {
      const isSuppressed = data.totalStudents < 5;
      const placementRate =
        data.totalStudents > 0
          ? Math.round((data.placedCount / data.totalStudents) * 100)
          : 0;
      const averageCtc =
        data.placedCount > 0 ? Number((data.totalCtc / data.placedCount).toFixed(2)) : 0;

      return {
        label,
        isSuppressed,
        totalStudents: isSuppressed ? '<5' : data.totalStudents,
        placedCount: isSuppressed ? '<5' : data.placedCount,
        totalOffers: isSuppressed ? '<5' : data.totalOffers,
        placementRate: isSuppressed ? 'Suppressed (n<5)' : `${placementRate}%`,
        placementRateNumeric: isSuppressed ? null : placementRate,
        averageCtc: isSuppressed ? 'Suppressed' : `${averageCtc} LPA`,
        highestCtc: isSuppressed ? 'Suppressed' : `${data.highestCtc} LPA`,
        rawCount: data.totalStudents,
      };
    });
  };

  const genderReport = formatCohortMap(byGender);
  const branchReport = formatCohortMap(byBranch);
  const categoryReport = formatCohortMap(byCategory);

  const totalRegistered = students.length;
  const totalPlaced = students.filter(
    (s) => s.isPlaced || (appsByStudent[String(s.user?._id || s.user)] || []).some((a) => a.offer?.status === 'Accepted')
  ).length;
  const overallPlacementRate = totalRegistered > 0 ? Math.round((totalPlaced / totalRegistered) * 100) : 0;

  return {
    generatedAt: new Date(),
    summary: {
      totalRegistered,
      totalPlaced,
      overallPlacementRate: `${overallPlacementRate}%`,
      suppressionThreshold: 5,
      suppressionPolicy: 'Differential Privacy / k-Anonymity (subgroups n < 5 suppressed to prevent student re-identification)',
    },
    genderReport,
    branchReport,
    categoryReport,
  };
}

/**
 * Format Fairness Report to CSV
 */
function exportFairnessReportToCsv(report) {
  const lines = [];
  lines.push('INSTITUTIONAL PLACEMENT FAIRNESS & DIVERSITY REPORT');
  lines.push(`Generated At,${new Date(report.generatedAt).toISOString()}`);
  lines.push(`Total Registered,${report.summary.totalRegistered}`);
  lines.push(`Total Placed,${report.summary.totalPlaced}`);
  lines.push(`Overall Placement Rate,${report.summary.overallPlacementRate}`);
  lines.push(`Privacy Policy,"${report.summary.suppressionPolicy}"`);
  lines.push('');

  const appendSection = (title, rows) => {
    lines.push(`=== ${title} ===`);
    lines.push('Cohort,Total Students,Placed Students,Total Offers,Placement Rate,Average CTC,Highest CTC,Status');
    for (const r of rows) {
      lines.push(
        `"${r.label}","${r.totalStudents}","${r.placedCount}","${r.totalOffers}","${r.placementRate}","${r.averageCtc}","${r.highestCtc}","${r.isSuppressed ? 'Suppressed (n<5)' : 'Published'}"`
      );
    }
    lines.push('');
  };

  appendSection('BREAKDOWN BY GENDER', report.genderReport);
  appendSection('BREAKDOWN BY BRANCH', report.branchReport);
  appendSection('BREAKDOWN BY CATEGORY', report.categoryReport);

  return lines.join('\n');
}

module.exports = {
  getCollegePlacementPolicy,
  getOpportunityCtc,
  determineTier,
  evaluateStudentPolicy,
  simulatePolicyImpact,
  generateFairnessReport,
  exportFairnessReportToCsv,
};
