const StudentProfile = require('../../models/StudentProfile');
const Application = require('../../models/Application');
const Opportunity = require('../../models/Opportunity');
const Company = require('../../models/Company');
const ExternalOutcome = require('../../models/ExternalOutcome');

/**
 * Calculates mathematical median from a list of numbers.
 */
function calculateMedian(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
  }
  return Number(sorted[mid].toFixed(2));
}

/**
 * Calculates arithmetic mean.
 */
function calculateAverage(numbers) {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, n) => acc + n, 0);
  return Number((sum / numbers.length).toFixed(2));
}

/**
 * 1. NAAC / NIRF / NBA Mandatory Placement Audit Report
 */
async function generateNirfNaacStats(collegeId, filters = {}) {
  const query = { ...(collegeId ? { collegeId } : {}) };
  if (filters.graduationYear) query.gradYear = Number(filters.graduationYear);
  if (filters.branch && filters.branch !== 'all') query.branch = filters.branch;

  const profiles = await StudentProfile.find(query)
    .populate('user', 'firstName lastName email')
    .lean();

  const totalCohort = profiles.length;
  const userIds = profiles.map((p) => p.user?._id || p.user).filter(Boolean);

  // Placed offers from applications
  const placedApps = await Application.find({
    ...(collegeId ? { collegeId } : {}),
    studentId: { $in: userIds },
    status: { $in: ['Offer Extended', 'Placed'] },
  })
    .populate('opportunityId', 'companyName ctc salary')
    .lean();

  const userOfferMap = {};
  const ctcValues = [];

  placedApps.forEach((a) => {
    const uid = (a.studentId?._id || a.studentId)?.toString();
    if (uid && !userOfferMap[uid]) {
      const ctcVal = Number(a.offerDetails?.ctcTotal || a.opportunityId?.ctc?.total || parseFloat(a.opportunityId?.salary) || 0);
      userOfferMap[uid] = {
        employer: a.opportunityId?.companyName || 'Corporate Partner',
        ctc: ctcVal,
      };
      if (ctcVal > 0) ctcValues.push(ctcVal);
    }
  });

  // Include student profile reported placement / CTC if not in application
  profiles.forEach((p) => {
    const uid = (p.user?._id || p.user)?.toString();
    if (p.isPlaced) {
      if (!userOfferMap[uid]) {
        const ctcVal = Number(p.placedPackage || 6.5);
        userOfferMap[uid] = {
          employer: p.placedCompany || 'Campus Recruiter',
          ctc: ctcVal,
        };
        if (ctcVal > 0) ctcValues.push(ctcVal);
      }
    }
  });

  // External outcomes (Verified Higher Studies & Entrepreneurship)
  const outcomesQuery = {
    ...(collegeId ? { collegeId } : {}),
    verificationStatus: 'verified',
  };
  const verifiedOutcomes = await ExternalOutcome.find(outcomesQuery).lean();

  const higherStudiesMap = {};
  const entrepreneurshipMap = {};
  let higherStudiesCount = 0;
  let entrepreneurshipCount = 0;

  verifiedOutcomes.forEach((o) => {
    const sId = o.studentId?.toString();
    if (o.category === 'Higher Studies') {
      higherStudiesMap[sId] = o.higherStudiesDetails;
      higherStudiesCount++;
    } else if (o.category === 'Entrepreneurship') {
      entrepreneurshipMap[sId] = o.entrepreneurshipDetails;
      entrepreneurshipCount++;
    } else if (o.category === 'Off-Campus Placement') {
      if (!userOfferMap[sId]) {
        const ctc = o.offCampusDetails?.ctcLpa || 0;
        userOfferMap[sId] = {
          employer: `${o.offCampusDetails?.companyName || 'Off-Campus'} (Off-Campus)`,
          ctc,
        };
        if (ctc > 0) ctcValues.push(ctc);
      }
    }
  });

  const placedCount = profiles.filter((p) => {
    const uid = (p.user?._id || p.user)?.toString();
    return p.isPlaced || userOfferMap[uid];
  }).length;

  const medianCtc = calculateMedian(ctcValues);
  const averageCtc = calculateAverage(ctcValues);
  const highestCtc = ctcValues.length > 0 ? Math.max(...ctcValues) : 0;
  const placementPercentage = totalCohort > 0 ? Number(((placedCount / totalCohort) * 100).toFixed(1)) : 0;
  const progressionRate = totalCohort > 0
    ? Number((((placedCount + higherStudiesCount + entrepreneurshipCount) / totalCohort) * 100).toFixed(1))
    : 0;

  // Department breakdown
  const deptStats = {};
  profiles.forEach((p) => {
    const b = p.branch || 'Unassigned';
    if (!deptStats[b]) {
      deptStats[b] = { total: 0, placed: 0, higherStudies: 0, ctcs: [] };
    }
    deptStats[b].total++;
    const uid = (p.user?._id || p.user)?.toString();
    if (p.isPlaced || userOfferMap[uid]) {
      deptStats[b].placed++;
      if (userOfferMap[uid]?.ctc > 0) {
        deptStats[b].ctcs.push(userOfferMap[uid].ctc);
      }
    }
    if (higherStudiesMap[uid]) {
      deptStats[b].higherStudies++;
    }
  });

  const departmentBreakdown = Object.entries(deptStats).map(([branch, stat]) => ({
    branch,
    total: stat.total,
    placed: stat.placed,
    placementPercentage: stat.total > 0 ? Number(((stat.placed / stat.total) * 100).toFixed(1)) : 0,
    higherStudies: stat.higherStudies,
    medianCtc: calculateMedian(stat.ctcs),
    highestCtc: stat.ctcs.length > 0 ? Math.max(...stat.ctcs) : 0,
  }));

  const rows = profiles.map((p, idx) => {
    const uid = (p.user?._id || p.user)?.toString();
    const off = userOfferMap[uid];
    const hs = higherStudiesMap[uid];
    const ent = entrepreneurshipMap[uid];

    let status = 'Seeking Employment';
    let employerOrProgression = '—';
    let packageLpa = '—';

    if (off) {
      status = 'Placed';
      employerOrProgression = off.employer;
      packageLpa = `${off.ctc} LPA`;
    } else if (hs) {
      status = 'Higher Studies';
      employerOrProgression = `${hs.degree || 'Degree'} at ${hs.universityName || 'University'}, ${hs.country || ''}`.trim();
      packageLpa = 'Admitted';
    } else if (ent) {
      status = 'Entrepreneurship';
      employerOrProgression = `${ent.startupName || 'Startup'} (${ent.sector || 'Sector'})`;
      packageLpa = 'Self-Employed';
    }

    return {
      'S.No': idx + 1,
      'Roll Number': p.rollNo || 'N/A',
      'Student Name': p.user ? `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim() : 'N/A',
      'Department / Branch': p.branch || 'N/A',
      'Graduation Year': p.gradYear || filters.graduationYear || '2026',
      'CGPA': p.cgpa || 0,
      'Progression Status': status,
      'Employer / Institution': employerOrProgression,
      'Compensation / Status': packageLpa,
    };
  });

  return {
    summary: {
      totalCohort,
      placedCount,
      placementPercentage,
      higherStudiesCount,
      entrepreneurshipCount,
      progressionRate,
      medianCtc,
      averageCtc,
      highestCtc,
    },
    departmentBreakdown,
    rows,
  };
}

/**
 * 2. Annual Placement Brochure Dataset
 */
async function generateBrochureData(collegeId, filters = {}) {
  const base = await generateNirfNaacStats(collegeId, filters);

  const companies = await Company.find({ ...(collegeId ? { collegeId } : {}) }).lean();
  const marqueeRecruiters = companies.slice(0, 15).map((c) => ({
    name: c.name,
    tier: c.tier,
    industry: c.industry,
  }));

  const rows = base.rows.filter((r) => r['Progression Status'] === 'Placed').map((r, idx) => ({
    'S.No': idx + 1,
    'Student Name': r['Student Name'],
    'Department': r['Department / Branch'],
    'Recruiting Company': r['Employer / Institution'],
    'Package Offered': r['Compensation / Status'],
  }));

  return {
    summary: base.summary,
    departmentBreakdown: base.departmentBreakdown,
    marqueeRecruiters,
    rows,
  };
}

/**
 * 3. Company-Wise Recruiter Hiring Report
 */
async function generateCompanyWiseReport(collegeId, filters = {}) {
  const query = { ...(collegeId ? { collegeId } : {}) };
  const drives = await Opportunity.find(query).sort({ createdAt: -1 }).lean();
  const driveIds = drives.map((d) => d._id);

  const apps = await Application.find({
    ...(collegeId ? { collegeId } : {}),
    opportunityId: { $in: driveIds },
  })
    .populate('studentId', 'branch')
    .lean();

  const companyMap = {};

  drives.forEach((d) => {
    const cName = d.companyName || 'Corporate Partner';
    if (!companyMap[cName]) {
      companyMap[cName] = {
        name: cName,
        industry: d.jobType || 'Technology',
        drivesCount: 0,
        applicantsCount: 0,
        offersCount: 0,
        fixedCtc: d.ctc?.fixed || 0,
        totalCtc: d.ctc?.total || 0,
        branchesHired: new Set(),
      };
    }
    companyMap[cName].drivesCount++;
  });

  apps.forEach((a) => {
    const cName = a.opportunityId?.companyName;
    if (cName && companyMap[cName]) {
      companyMap[cName].applicantsCount++;
      if (a.status === 'Offer Extended' || a.status === 'Placed') {
        companyMap[cName].offersCount++;
        if (a.studentId?.branch) {
          companyMap[cName].branchesHired.add(a.studentId.branch);
        }
      }
    }
  });

  const rows = Object.values(companyMap).map((c, idx) => ({
    'S.No': idx + 1,
    'Company Name': c.name,
    'Industry / Job Type': c.industry,
    'Drives Conducted': c.drivesCount,
    'Total Applications': c.applicantsCount,
    'Final Offers Extended': c.offersCount,
    'Fixed CTC (LPA)': c.fixedCtc,
    'Total Package (LPA)': c.totalCtc,
    'Target Disciplines': Array.from(c.branchesHired).join(', ') || 'All Branches',
  }));

  return {
    summary: {
      totalRecruiters: Object.keys(companyMap).length,
      totalOffers: Object.values(companyMap).reduce((acc, c) => acc + c.offersCount, 0),
    },
    rows,
  };
}

/**
 * 4. Department-Wise Placement Statistics
 */
async function generateDepartmentStats(collegeId, filters = {}) {
  const base = await generateNirfNaacStats(collegeId, filters);
  const rows = base.departmentBreakdown.map((d, idx) => ({
    'S.No': idx + 1,
    'Academic Department': d.branch,
    'Total Enrolled Students': d.total,
    'Placed Candidates': d.placed,
    'Placement Rate (%)': `${d.placementPercentage}%`,
    'Higher Studies Admissions': d.higherStudies,
    'Median CTC (LPA)': `${d.medianCtc} LPA`,
    'Highest CTC (LPA)': `${d.highestCtc} LPA`,
  }));

  return {
    summary: base.summary,
    rows,
  };
}

/**
 * 5. Unplaced Candidates Remediation Roster
 */
async function generateUnplacedRoster(collegeId, filters = {}) {
  const query = {
    ...(collegeId ? { collegeId } : {}),
    isPlaced: false,
  };
  if (filters.graduationYear) query.gradYear = Number(filters.graduationYear);
  if (filters.branch && filters.branch !== 'all') query.branch = filters.branch;

  const profiles = await StudentProfile.find(query)
    .populate('user', 'firstName lastName email')
    .lean();

  const userIds = profiles.map((p) => p.user?._id || p.user).filter(Boolean);
  const apps = await Application.find({
    ...(collegeId ? { collegeId } : {}),
    studentId: { $in: userIds },
  }).lean();

  const userAppsCount = {};
  apps.forEach((a) => {
    const uid = (a.studentId?._id || a.studentId)?.toString();
    userAppsCount[uid] = (userAppsCount[uid] || 0) + 1;
  });

  const rows = profiles.map((p, idx) => {
    const uid = (p.user?._id || p.user)?.toString();
    return {
      'S.No': idx + 1,
      'Roll Number': p.rollNo || 'N/A',
      'Student Name': p.user ? `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim() : 'N/A',
      'Email Address': p.user?.email || 'N/A',
      'Department / Branch': p.branch || 'N/A',
      'CGPA': p.cgpa || 0,
      'Active Backlogs': p.activeBacklogs || 0,
      'Drives Applied': userAppsCount[uid] || 0,
      'Academic Seal': p.isVerifiedByTPO ? 'Verified' : 'Pending',
    };
  });

  return {
    summary: {
      totalUnplaced: profiles.length,
    },
    rows,
  };
}

/**
 * 6. Drive-Wise Recruitment Funnel Report
 */
async function generateDriveFunnelReport(collegeId, filters = {}) {
  const query = { ...(collegeId ? { collegeId } : {}) };
  const drives = await Opportunity.find(query).sort({ createdAt: -1 }).lean();
  const driveIds = drives.map((d) => d._id);

  const apps = await Application.find({
    ...(collegeId ? { collegeId } : {}),
    opportunityId: { $in: driveIds },
  }).lean();

  const funnelMap = {};
  drives.forEach((d) => {
    funnelMap[d._id.toString()] = {
      title: d.title,
      company: d.companyName,
      ctc: d.ctc?.total || d.salary || 0,
      date: d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : '—',
      applied: 0,
      oa: 0,
      tech: 0,
      hr: 0,
      offerExtended: 0,
      placed: 0,
    };
  });

  apps.forEach((a) => {
    const dId = a.opportunityId?.toString();
    const st = funnelMap[dId];
    if (st) {
      st.applied++;
      if (a.status === 'Online Assessment') st.oa++;
      if (a.status === 'Technical Round') st.tech++;
      if (a.status === 'HR Round') st.hr++;
      if (a.status === 'Offer Extended') st.offerExtended++;
      if (a.status === 'Placed') st.placed++;
    }
  });

  const rows = Object.values(funnelMap).map((f, idx) => {
    const totalOffers = f.offerExtended + f.placed;
    const conversionRate = f.applied > 0 ? `${((totalOffers / f.applied) * 100).toFixed(1)}%` : '0%';
    return {
      'S.No': idx + 1,
      'Company Name': f.company,
      'Role Title': f.title,
      'Package (LPA)': f.ctc,
      'Date Published': f.date,
      'Total Applicants': f.applied,
      'OA Stage': f.oa,
      'Technical Interview': f.tech,
      'HR Final Round': f.hr,
      'Offers Extended': totalOffers,
      'Conversion Yield (%)': conversionRate,
    };
  });

  return {
    summary: {
      totalDrives: drives.length,
      totalApplicantsAcrossDrives: apps.length,
    },
    rows,
  };
}

/**
 * 7. Year-over-Year (YoY) Multi-Batch Comparison
 */
async function getYoyComparison(collegeId) {
  const years = [2024, 2025, 2026];
  const results = [];

  for (const year of years) {
    const stats = await generateNirfNaacStats(collegeId, { graduationYear: String(year) });
    results.push({
      year,
      totalCohort: stats.summary.totalCohort,
      placedCount: stats.summary.placedCount,
      placementPercentage: stats.summary.placementPercentage,
      higherStudiesCount: stats.summary.higherStudiesCount,
      progressionRate: stats.summary.progressionRate,
      medianCtc: stats.summary.medianCtc,
      averageCtc: stats.summary.averageCtc,
      highestCtc: stats.summary.highestCtc,
    });
  }

  return results;
}

module.exports = {
  calculateMedian,
  calculateAverage,
  generateNirfNaacStats,
  generateBrochureData,
  generateCompanyWiseReport,
  generateDepartmentStats,
  generateUnplacedRoster,
  generateDriveFunnelReport,
  getYoyComparison,
};
