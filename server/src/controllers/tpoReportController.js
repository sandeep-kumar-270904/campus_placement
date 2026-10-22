const mongoose = require('mongoose');
const xlsx = require('xlsx');
const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const Company = require('../models/Company');
const AuditLog = require('../models/AuditLog');

const REPORT_TEMPLATES = [
  {
    id: 'nirf-placement-report',
    title: 'NIRF / NAAC Mandatory Placement Audit Report',
    description:
      'Formatted to NIRF and NAAC compliance standards with graduating batch, placement status, employer name, and median salary.',
    category: 'Accreditation & Compliance',
    supportedFormats: ['xlsx', 'csv'],
  },
  {
    id: 'drive-hiring-roster',
    title: 'Placement Drive Performance & Roster',
    description:
      'Detailed company drive statistics, rounds completed, applicant conversion counts, and final offer letters issued.',
    category: 'Placement Operations',
    supportedFormats: ['xlsx', 'csv'],
  },
  {
    id: 'department-stats',
    title: 'Department-Wise Placement Statistics',
    description:
      'Total batch strength, eligible candidates, placed percentage, and average CTC breakdown across engineering branches.',
    category: 'Institutional Metrics',
    supportedFormats: ['xlsx', 'csv'],
  },
  {
    id: 'company-crm-history',
    title: 'Corporate Recruiter Directory & Visit Log',
    description:
      'Full catalog of recruiters, tier classifications, university relations contacts, and historical hire numbers.',
    category: 'Corporate Relations',
    supportedFormats: ['xlsx', 'csv'],
  },
  {
    id: 'master-student-callset',
    title: 'Master Student Directory & Verified Seals',
    description:
      'All registered students with academic CGPA, active backlogs, TPO Ed25519 digital seal status, and offer status.',
    category: 'Student Data',
    supportedFormats: ['xlsx', 'csv'],
  },
  {
    id: 'unplaced-candidates',
    title: 'Unplaced Students Follow-Up Roster',
    description:
      'Target list of unplaced students with contact info, CGPA, backlogs, and total applications submitted.',
    category: 'Counseling & Support',
    supportedFormats: ['xlsx', 'csv'],
  },
];

/**
 * @desc    Get list of available prebuilt report templates
 * @route   GET /api/tpo/reports/templates
 * @access  Private (TPO / SuperAdmin)
 */
exports.getReportTemplates = async (req, res) => {
  res.json({
    success: true,
    templates: REPORT_TEMPLATES,
  });
};

/**
 * @desc    Get audit history of generated reports
 * @route   GET /api/tpo/reports/history
 * @access  Private (TPO / SuperAdmin)
 */
exports.getReportHistory = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;

    const logs = await AuditLog.find({
      ...(collegeId ? { collegeId } : {}),
      action: 'REPORT_GENERATED',
    })
      .populate('performedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const history = logs.map((l) => ({
      id: l._id,
      reportName: l.details?.reportName || 'Generated Report',
      templateId: l.details?.templateId || '',
      format: l.details?.format || 'xlsx',
      rowCount: l.details?.rowCount || 0,
      generatedAt: l.createdAt,
      generatedBy: l.performedBy
        ? `${l.performedBy.firstName || ''} ${l.performedBy.lastName || ''}`.trim()
        : 'TPO Officer',
    }));

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch report history.' } });
  }
};

/**
 * @desc    Generate and download prebuilt report in CSV or XLSX format
 * @route   POST /api/tpo/reports/generate
 * @access  Private (TPO / SuperAdmin)
 */
exports.generateReport = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { templateId, format = 'xlsx', filters = {} } = req.body;

    const template = REPORT_TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      return res.status(400).json({ error: { message: 'Invalid report template ID.' } });
    }

    let reportRows = [];
    let filenameBase = template.id;

    if (templateId === 'nirf-placement-report') {
      const query = {
        ...(collegeId ? { collegeId } : {}),
      };
      if (filters.graduationYear) query.gradYear = Number(filters.graduationYear);
      if (filters.branch) query.branch = filters.branch;

      const profiles = await StudentProfile.find(query)
        .populate('user', 'firstName lastName email')
        .lean();

      // Find offers for placed students
      const placedUserIds = profiles
        .filter((p) => p.isPlaced)
        .map((p) => p.user?._id || p.user)
        .filter(Boolean);

      const placedApps = await Application.find({
        ...(collegeId ? { collegeId } : {}),
        studentId: { $in: placedUserIds },
        status: { $in: ['Offer Extended', 'Placed'] },
      })
        .populate('opportunityId', 'companyName')
        .lean();

      const userOfferMap = {};
      placedApps.forEach((a) => {
        const uid = (a.studentId?._id || a.studentId)?.toString();
        if (uid && !userOfferMap[uid]) {
          userOfferMap[uid] = {
            employer: a.opportunityId?.companyName || 'Corporate Partner',
            ctc: a.offerDetails?.ctcTotal || 0,
          };
        }
      });

      reportRows = profiles.map((p, idx) => {
        const uid = (p.user?._id || p.user)?.toString();
        const off = userOfferMap[uid] || {};
        return {
          'S.No': idx + 1,
          'Roll Number': p.rollNo || 'N/A',
          'Student Name': p.user ? `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim() : 'N/A',
          Branch: p.branch || 'N/A',
          'Graduating Batch': p.gradYear || 'N/A',
          'Placement Status': p.isPlaced ? 'Placed' : 'Seeking Employment / Higher Studies',
          'Recruiting Employer': p.isPlaced ? off.employer || 'Corporate Partner' : 'N/A',
          'Offered CTC (LPA)': p.isPlaced ? off.ctc || 'Standard Package' : 'N/A',
        };
      });
    } else if (templateId === 'drive-hiring-roster') {
      const query = {
        ...(collegeId ? { collegeId } : {}),
      };
      const drives = await Opportunity.find(query).sort({ createdAt: -1 }).lean();

      const driveIds = drives.map((d) => d._id);
      const apps = await Application.find({
        ...(collegeId ? { collegeId } : {}),
        opportunityId: { $in: driveIds },
      }).lean();

      const statsByDrive = {};
      apps.forEach((a) => {
        const dId = a.opportunityId.toString();
        if (!statsByDrive[dId]) {
          statsByDrive[dId] = { applied: 0, offers: 0 };
        }
        statsByDrive[dId].applied++;
        if (a.status === 'Offer Extended' || a.status === 'Placed') {
          statsByDrive[dId].offers++;
        }
      });

      reportRows = drives.map((d, idx) => {
        const st = statsByDrive[d._id.toString()] || { applied: 0, offers: 0 };
        return {
          'S.No': idx + 1,
          'Company Name': d.companyName,
          'Drive Title': d.title,
          'Job Role': d.jobRole,
          'Job Type': d.jobType || 'Full-time',
          'Drive Status': d.status,
          'Fixed CTC (LPA)': d.ctc?.fixed || 0,
          'Total CTC (LPA)': d.ctc?.total || 0,
          'Rounds Count': d.rounds?.length || 1,
          'Total Applicants': st.applied,
          'Final Offers Extended': st.offers,
        };
      });
    } else if (templateId === 'department-stats') {
      const profiles = await StudentProfile.find({
        ...(collegeId ? { collegeId } : {}),
      }).lean();

      const branchGroups = {};
      profiles.forEach((p) => {
        const b = p.branch || 'Unassigned';
        if (!branchGroups[b]) {
          branchGroups[b] = { total: 0, placed: 0 };
        }
        branchGroups[b].total++;
        if (p.isPlaced) branchGroups[b].placed++;
      });

      reportRows = Object.entries(branchGroups).map(([branch, counts], idx) => ({
        'S.No': idx + 1,
        'Engineering Discipline': branch,
        'Total Strength': counts.total,
        'Placed Candidates': counts.placed,
        'Unplaced Candidates': counts.total - counts.placed,
        'Placement %': counts.total > 0 ? `${Math.round((counts.placed / counts.total) * 100)}%` : '0%',
      }));
    } else if (templateId === 'company-crm-history') {
      const companies = await Company.find({
        ...(collegeId ? { collegeId } : {}),
      }).lean();

      reportRows = companies.map((c, idx) => {
        const primary = c.contactPersons?.find((cp) => cp.isPrimary) || c.contactPersons?.[0] || {};
        return {
          'S.No': idx + 1,
          'Company Name': c.name,
          Tier: c.tier,
          Status: c.status,
          Industry: c.industry,
          Website: c.website || 'N/A',
          'Primary Recruiter': primary.name || 'N/A',
          'Recruiter Email': primary.email || 'N/A',
          'Recruiter Phone': primary.phone || 'N/A',
        };
      });
    } else if (templateId === 'master-student-callset') {
      const profiles = await StudentProfile.find({
        ...(collegeId ? { collegeId } : {}),
      })
        .populate('user', 'firstName lastName email')
        .lean();

      reportRows = profiles.map((p, idx) => ({
        'S.No': idx + 1,
        'Roll Number': p.rollNo || '',
        'Full Name': p.user ? `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim() : '',
        Email: p.user?.email || '',
        Branch: p.branch || '',
        'Grad Year': p.gradYear || '',
        CGPA: p.cgpa || 0,
        'Active Backlogs': p.activeBacklogs || 0,
        'TPO Verified Seal': p.isVerifiedByTPO ? 'SEALED & VERIFIED' : 'PENDING',
        'Placement Status': p.isPlaced ? 'Placed' : 'Unplaced',
      }));
    } else if (templateId === 'unplaced-candidates') {
      const profiles = await StudentProfile.find({
        ...(collegeId ? { collegeId } : {}),
        isPlaced: false,
      })
        .populate('user', 'firstName lastName email')
        .lean();

      reportRows = profiles.map((p, idx) => ({
        'S.No': idx + 1,
        'Roll Number': p.rollNo || '',
        'Full Name': p.user ? `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim() : '',
        Email: p.user?.email || '',
        Branch: p.branch || '',
        CGPA: p.cgpa || 0,
        'Active Backlogs': p.activeBacklogs || 0,
      }));
    }

    // Build workbook using xlsx
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(reportRows.length > 0 ? reportRows : [{ Status: 'No records found' }]);
    xlsx.utils.book_append_sheet(wb, ws, 'Report Data');

    const isCsv = format.toLowerCase() === 'csv';
    const buffer = xlsx.write(wb, {
      type: 'buffer',
      bookType: isCsv ? 'csv' : 'xlsx',
    });

    // Record audit log
    await AuditLog.create({
      collegeId,
      performedBy: req.user?.id || req.user?._id,
      action: 'REPORT_GENERATED',
      targetModel: 'College',
      details: {
        templateId,
        reportName: template.title,
        format: isCsv ? 'csv' : 'xlsx',
        rowCount: reportRows.length,
      },
    });

    const extension = isCsv ? 'csv' : 'xlsx';
    const contentType = isCsv ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}-${Date.now()}.${extension}"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to generate report.' } });
  }
};
