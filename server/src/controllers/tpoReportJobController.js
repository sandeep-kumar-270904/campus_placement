const crypto = require('crypto');
const ReportJob = require('../models/ReportJob');
const College = require('../models/College');
const AuditLog = require('../models/AuditLog');
const reportEngine = require('../services/reports/reportEngine');
const { generatePdfReportBuffer } = require('../services/reports/pdfReportGenerator');
const { generateXlsxReportBuffer } = require('../services/reports/xlsxReportGenerator');
const { storeReportBuffer, getReportBuffer } = require('../services/reports/reportBufferCache');
const { compileWeeklyDigestData, buildWeeklyDigestHtml } = require('../services/reports/weeklyDigestService');
const {
  initiateReportJobSchema,
  updateReportSettingsSchema,
} = require('../validations/reportJobValidation');
const xlsx = require('xlsx');

const TEMPLATE_NAMES = {
  'nirf-placement-report': 'NIRF / NAAC Mandatory Placement Audit Report',
  'placement-brochure': 'Annual Placement Brochure Dataset',
  'company-wise': 'Corporate Recruiter Directory & Hiring Breakdown',
  'department-stats': 'Department-Wise Placement Statistics',
  'unplaced-candidates': 'Unplaced Candidates Remediation Roster',
  'drive-funnel': 'Drive-Wise Recruitment Funnel Analytics',
};

/**
 * @desc    Start asynchronous background report generation job
 * @route   POST /api/tpo/reports/jobs
 * @access  Private (TPO / Admin)
 */
exports.initiateReportJob = async (req, res) => {
  try {
    const parseResult = initiateReportJobSchema.safeParse(req.body || {});
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.issues[0]?.message || 'Invalid report job payload.',
          details: parseResult.error.issues,
        },
      });
    }

    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { templateId, format, filters } = parseResult.data;

    const jobId = crypto.randomUUID();
    const college = collegeId ? await College.findById(collegeId).lean() : null;

    const job = await ReportJob.create({
      jobId,
      collegeId,
      templateId,
      format,
      status: 'queued',
      progress: 5,
      filters,
      generatedBy: {
        id: req.user?.id || req.user?._id,
        name: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || 'TPO Officer',
        email: req.user?.email || '',
        role: req.user?.role || 'tpo',
      },
    });

    // Execute job asynchronously without blocking HTTP response
    setImmediate(async () => {
      try {
        await ReportJob.updateOne({ jobId }, { status: 'processing', progress: 25 });

        let reportResult;
        if (templateId === 'nirf-placement-report') {
          reportResult = await reportEngine.generateNirfNaacStats(collegeId, filters);
        } else if (templateId === 'placement-brochure') {
          reportResult = await reportEngine.generateBrochureData(collegeId, filters);
        } else if (templateId === 'company-wise') {
          reportResult = await reportEngine.generateCompanyWiseReport(collegeId, filters);
        } else if (templateId === 'department-stats') {
          reportResult = await reportEngine.generateDepartmentStats(collegeId, filters);
        } else if (templateId === 'unplaced-candidates') {
          reportResult = await reportEngine.generateUnplacedRoster(collegeId, filters);
        } else if (templateId === 'drive-funnel') {
          reportResult = await reportEngine.generateDriveFunnelReport(collegeId, filters);
        } else {
          reportResult = await reportEngine.generateNirfNaacStats(collegeId, filters);
        }

        await ReportJob.updateOne({ jobId }, { progress: 60 });

        const title = TEMPLATE_NAMES[templateId] || 'Placement Audit Report';
        const collegeName = college?.name || 'National Institute of Engineering & Technology';
        const batchYear = filters.graduationYear || '2026';
        const signatories = college?.reportSettings?.signatories || [
          { title: 'Training & Placement Officer', name: 'Dr. Placement Officer' },
          { title: 'Principal / Director', name: 'Dr. College Principal' },
        ];

        let buffer;
        let contentType;
        let extension = format.toLowerCase();
        const fileName = `${templateId}-${batchYear}-${Date.now()}.${extension}`;

        if (extension === 'pdf') {
          buffer = generatePdfReportBuffer({
            title,
            collegeName,
            batchYear,
            summary: reportResult.summary,
            rows: reportResult.rows,
            signatories,
          });
          contentType = 'application/pdf';
        } else if (extension === 'csv') {
          const wb = xlsx.utils.book_new();
          const ws = xlsx.utils.json_to_sheet(
            reportResult.rows.length > 0 ? reportResult.rows : [{ Status: 'No records matching query' }]
          );
          xlsx.utils.book_append_sheet(wb, ws, 'Data');
          buffer = xlsx.write(wb, { type: 'buffer', bookType: 'csv' });
          contentType = 'text/csv';
        } else {
          // XLSX
          buffer = generateXlsxReportBuffer({
            title,
            collegeName,
            summary: reportResult.summary,
            rows: reportResult.rows,
            departmentBreakdown: reportResult.departmentBreakdown,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          extension = 'xlsx';
        }

        await ReportJob.updateOne({ jobId }, { progress: 85 });

        // Store buffer in streaming cache
        storeReportBuffer(jobId, { buffer, contentType, fileName });

        // Update Job completion with base64 file buffer for serverless persistence
        await ReportJob.updateOne(
          { jobId },
          {
            status: 'completed',
            progress: 100,
            downloadUrl: `/api/tpo/reports/download/${jobId}`,
            fileName,
            fileSize: buffer.length,
            fileBase64: buffer.toString('base64'),
            contentType,
            rowCount: reportResult.rows?.length || 0,
            completedAt: new Date(),
          }
        );

        // Record Audit Log
        await AuditLog.create({
          collegeId,
          performedBy: req.user?.id || req.user?._id,
          action: 'REPORT_GENERATED',
          targetModel: 'College',
          details: {
            jobId,
            templateId,
            reportName: title,
            format: extension,
            rowCount: reportResult.rows?.length || 0,
            fileSize: buffer.length,
          },
        });
      } catch (err) {
        console.error('Async report job execution failed:', err);
        await ReportJob.updateOne(
          { jobId },
          {
            status: 'failed',
            progress: 0,
            error: err.message || 'Generation failed.',
          }
        );
      }
    });

    res.status(202).json({
      success: true,
      jobId,
      message: 'Report generation started in background job queue.',
      statusUrl: `/api/tpo/reports/jobs/${jobId}`,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to start report job.' } });
  }
};

/**
 * @desc    Poll background report job status and progress
 * @route   GET /api/tpo/reports/jobs/:jobId
 * @access  Private (TPO / Admin)
 */
exports.getJobProgress = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await ReportJob.findOne({ jobId }).lean();
    if (!job) {
      return res.status(404).json({ error: { message: 'Report job not found.' } });
    }

    res.json({
      success: true,
      job: {
        jobId: job.jobId,
        templateId: job.templateId,
        format: job.format,
        status: job.status,
        progress: job.progress,
        downloadUrl: job.downloadUrl,
        fileName: job.fileName,
        fileSize: job.fileSize,
        rowCount: job.rowCount,
        error: job.error,
        completedAt: job.completedAt,
        generatedBy: job.generatedBy,
      },
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to query job.' } });
  }
};

/**
 * @desc    Download completed report binary file
 * @route   GET /api/tpo/reports/download/:jobId
 * @access  Private (TPO / Admin)
 */
exports.downloadReportFile = async (req, res) => {
  try {
    const { jobId } = req.params;
    const cached = getReportBuffer(jobId);

    if (cached) {
      res.setHeader('Content-Type', cached.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${cached.fileName}"`);
      return res.send(cached.buffer);
    }

    // Fallback: check job record in database (handles serverless cold starts / container switches)
    const job = await ReportJob.findOne({ jobId }).lean();
    if (!job || job.status !== 'completed') {
      return res.status(404).json({ error: { message: 'Report not available or still processing.' } });
    }

    if (job.fileBase64) {
      const buffer = Buffer.from(job.fileBase64, 'base64');
      const contentType = job.contentType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const fileName = job.fileName || 'report.xlsx';

      // Re-populate in-memory cache for fast subsequent downloads
      storeReportBuffer(jobId, { buffer, contentType, fileName });

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(buffer);
    }

    // Regenerate on demand if both in-memory cache and fileBase64 are absent
    const collegeId = job.collegeId;
    const stats = await reportEngine.generateNirfNaacStats(collegeId, job.filters);
    const buffer = generateXlsxReportBuffer({
      title: TEMPLATE_NAMES[job.templateId] || 'Report',
      collegeName: 'Campus Placement Office',
      summary: stats.summary,
      rows: stats.rows,
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${job.fileName || 'report.xlsx'}"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Download failed.' } });
  }
};

/**
 * @desc    Get complete history of generated reports
 * @route   GET /api/tpo/reports/history
 * @access  Private (TPO / Admin)
 */
exports.getReportJobsHistory = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const query = { ...(collegeId ? { collegeId } : {}) };

    const jobs = await ReportJob.find(query)
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const history = jobs.map((j) => ({
      id: j._id,
      jobId: j.jobId,
      reportName: TEMPLATE_NAMES[j.templateId] || j.templateId,
      templateId: j.templateId,
      format: j.format,
      status: j.status,
      progress: j.progress,
      downloadUrl: j.downloadUrl,
      rowCount: j.rowCount,
      fileSize: j.fileSize,
      generatedAt: j.createdAt,
      generatedBy: j.generatedBy?.name || 'TPO Officer',
    }));

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch history.' } });
  }
};

/**
 * @desc    Get Year-over-Year comparison statistics
 * @route   GET /api/tpo/reports/yoy
 * @access  Private (TPO / Admin)
 */
exports.getYoyAnalytics = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const yoyData = await reportEngine.getYoyComparison(collegeId);

    res.json({
      success: true,
      yoyData,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to compute YoY stats.' } });
  }
};

/**
 * @desc    Update college report template configuration (signatories, header, logo)
 * @route   PATCH /api/tpo/reports/settings
 * @access  Private (TPO / Admin)
 */
exports.updateReportSettings = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    if (!collegeId) {
      return res.status(400).json({ error: { message: 'College ID required.' } });
    }

    const parseResult = updateReportSettingsSchema.safeParse(req.body || {});
    if (!parseResult.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.issues[0]?.message || 'Invalid settings payload.',
          details: parseResult.error.issues,
        },
      });
    }

    const { headerTitle, logoUrl, signatories, customDisclaimer } = parseResult.data;
    const update = {};
    if (headerTitle) update['reportSettings.headerTitle'] = headerTitle;
    if (logoUrl !== undefined) update['reportSettings.logoUrl'] = logoUrl;
    if (signatories) update['reportSettings.signatories'] = signatories;
    if (customDisclaimer !== undefined) update['reportSettings.customDisclaimer'] = customDisclaimer;

    const college = await College.findByIdAndUpdate(collegeId, { $set: update }, { new: true }).lean();

    res.json({
      success: true,
      message: 'Report template settings updated.',
      reportSettings: college?.reportSettings,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to update settings.' } });
  }
};

/**
 * @desc    Compile and preview/send weekly TPO digest briefing
 * @route   POST /api/tpo/reports/digest
 * @access  Private (TPO / Admin)
 */
exports.getWeeklyDigest = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const digestData = await compileWeeklyDigestData(collegeId);
    const htmlEmail = buildWeeklyDigestHtml(digestData);

    res.json({
      success: true,
      digestData,
      htmlPreview: htmlEmail,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to compile digest.' } });
  }
};
