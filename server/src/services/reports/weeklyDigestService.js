const Opportunity = require('../../models/Opportunity');
const Application = require('../../models/Application');
const StudentProfile = require('../../models/StudentProfile');
const InterviewSlot = require('../../models/InterviewSlot');
const College = require('../../models/College');
const User = require('../../models/User');

/**
 * Compiles real-time metrics for the weekly TPO briefing digest.
 */
async function compileWeeklyDigestData(collegeId) {
  const query = { ...(collegeId ? { collegeId } : {}) };
  const now = new Date();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const sevenDaysAhead = new Date(Date.now() + 7 * 24 * 3600 * 1000);

  // 1. Active open drives
  const openDrives = await Opportunity.find({
    ...query,
    status: 'Open',
    deadline: { $gte: now },
  })
    .sort({ deadline: 1 })
    .limit(5)
    .lean();

  // 2. Applications submitted this past week
  const appsThisWeek = await Application.countDocuments({
    ...query,
    appliedAt: { $gte: sevenDaysAgo },
  });

  // 3. Pending academic verifications
  const pendingVerifications = await StudentProfile.countDocuments({
    ...query,
    isVerifiedByTPO: false,
  });

  // 4. Interviews scheduled for the upcoming week
  const upcomingInterviews = await InterviewSlot.find({
    ...query,
    status: { $in: ['Scheduled', 'Booked'] },
    startTime: { $gte: now, $lte: sevenDaysAhead },
  })
    .sort({ startTime: 1 })
    .limit(10)
    .lean();

  // 5. Expiring offers
  const pendingOffers = await Application.countDocuments({
    ...query,
    status: 'Offer Extended',
    'offer.status': 'Pending',
  });

  const college = collegeId ? await College.findById(collegeId).lean() : null;

  return {
    compiledAt: now.toISOString(),
    collegeName: college?.name || 'Campus Placement Cell',
    metrics: {
      openDrivesCount: openDrives.length,
      applicationsThisWeek: appsThisWeek,
      pendingVerificationsCount: pendingVerifications,
      upcomingInterviewsCount: upcomingInterviews.length,
      pendingOffersCount: pendingOffers,
    },
    openDrives: openDrives.map((d) => ({
      title: d.title,
      company: d.companyName,
      package: d.ctc?.total ? `${d.ctc.total} LPA` : d.salary || 'Best in Industry',
      deadline: d.deadline ? new Date(d.deadline).toLocaleDateString() : 'Rolling',
      daysRemaining: d.deadline ? Math.max(0, Math.ceil((new Date(d.deadline) - now) / (1000 * 3600 * 24))) : 0,
      link: `/tpo/drives/${d._id}`,
    })),
    deepLinks: {
      drivesUrl: '/tpo/drives',
      verificationUrl: '/tpo/verification',
      scheduleUrl: '/tpo/schedule',
      reportsUrl: '/tpo/reports',
    },
  };
}

/**
 * Builds standard responsive HTML digest email.
 */
function buildWeeklyDigestHtml(digestData) {
  const { collegeName, metrics, openDrives, deepLinks } = digestData;

  const drivesHtml = openDrives.length > 0
    ? openDrives.map(d => `
      <tr style="border-bottom: 1px solid #334155;">
        <td style="padding: 10px; color: #f8fafc; font-weight: bold;">${d.company} — ${d.title}</td>
        <td style="padding: 10px; color: #34d399; font-family: monospace;">${d.package}</td>
        <td style="padding: 10px; color: #94a3b8;">${d.deadline} (${d.daysRemaining}d left)</td>
      </tr>
    `).join('')
    : '<tr><td colspan="3" style="padding: 12px; color: #94a3b8; text-align: center;">No active drives closing this week.</td></tr>';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Weekly TPO Executive Briefing</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; padding: 24px; margin: 0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, #059669, #0d9488); padding: 24px; color: #ffffff;">
        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">Weekly Executive Briefing</div>
        <h1 style="font-size: 20px; font-weight: 900; margin: 4px 0 0 0;">${collegeName}</h1>
      </div>

      <!-- Highlights Dashboard -->
      <div style="padding: 24px;">
        <h2 style="font-size: 14px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 0;">Key Recruitment Metrics (Past 7 Days)</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
          <div style="background-color: #1e293b; padding: 14px; border-radius: 12px;">
            <div style="font-size: 11px; color: #94a3b8;">New Applications</div>
            <div style="font-size: 24px; font-weight: 900; color: #34d399;">${metrics.applicationsThisWeek}</div>
          </div>
          <div style="background-color: #1e293b; padding: 14px; border-radius: 12px;">
            <div style="font-size: 11px; color: #94a3b8;">Pending Verifications</div>
            <div style="font-size: 24px; font-weight: 900; color: #fbbf24;">${metrics.pendingVerificationsCount}</div>
          </div>
          <div style="background-color: #1e293b; padding: 14px; border-radius: 12px;">
            <div style="font-size: 11px; color: #94a3b8;">Interviews This Week</div>
            <div style="font-size: 24px; font-weight: 900; color: #60a5fa;">${metrics.upcomingInterviewsCount}</div>
          </div>
          <div style="background-color: #1e293b; padding: 14px; border-radius: 12px;">
            <div style="font-size: 11px; color: #94a3b8;">Open Drives</div>
            <div style="font-size: 24px; font-weight: 900; color: #a78bfa;">${metrics.openDrivesCount}</div>
          </div>
        </div>

        <!-- Drives Table -->
        <h3 style="font-size: 13px; font-weight: bold; color: #e2e8f0; margin-bottom: 8px;">Active Drives Closing Soon</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #1e293b; text-align: left; color: #94a3b8;">
              <th style="padding: 8px 10px;">Company & Role</th>
              <th style="padding: 8px 10px;">Package</th>
              <th style="padding: 8px 10px;">Deadline</th>
            </tr>
          </thead>
          <tbody>
            ${drivesHtml}
          </tbody>
        </table>

        <!-- Deep Action Links -->
        <div style="border-top: 1px solid #1e293b; padding-top: 20px; display: flex; gap: 8px; justify-content: space-between;">
          <a href="${deepLinks.drivesUrl}" style="background-color: #059669; color: #ffffff; text-decoration: none; padding: 8px 14px; border-radius: 8px; font-size: 11px; font-weight: bold;">Manage Drives</a>
          <a href="${deepLinks.verificationUrl}" style="background-color: #334155; color: #f8fafc; text-decoration: none; padding: 8px 14px; border-radius: 8px; font-size: 11px; font-weight: bold;">Review Queue</a>
          <a href="${deepLinks.scheduleUrl}" style="background-color: #334155; color: #f8fafc; text-decoration: none; padding: 8px 14px; border-radius: 8px; font-size: 11px; font-weight: bold;">Schedule</a>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}

module.exports = {
  compileWeeklyDigestData,
  buildWeeklyDigestHtml,
};
