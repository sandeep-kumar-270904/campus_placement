const { eventBus, DOMAIN_EVENTS } = require('./EventBus');
const { notificationQueue } = require('../queue/NotificationQueue');
const { resolveAndRender } = require('../templateEngine');
const NotificationPreference = require('../../../models/NotificationPreference');
const { MANDATORY_EVENTS } = require('../../../models/NotificationPreference');
const User = require('../../../models/User');
const StudentProfile = require('../../../models/StudentProfile');

/**
 * Helper to fetch or create default preference record for user
 */
async function getUserPreference(collegeId, userId) {
  let pref = await NotificationPreference.findOne({ collegeId, userId });
  if (!pref) {
    pref = new NotificationPreference({
      collegeId,
      userId,
      channels: { in_app: true, email: true, push: true, whatsapp: false, sms: false },
    });
  }
  return pref;
}

/**
 * Build jobs for an individual recipient across all permitted channels
 */
async function buildJobsForRecipient({
  collegeId,
  user,
  profile,
  eventType,
  eventId,
  variables,
  deepLink,
  isMandatory,
}) {
  const pref = await getUserPreference(collegeId, user._id || user.id);
  const channelsToCheck = ['in_app', 'email', 'push', 'whatsapp'];
  const jobs = [];

  for (const channel of channelsToCheck) {
    if (!pref.isChannelAllowed(eventType, channel)) {
      continue;
    }

    // Determine recipient address for channel
    let recipientAddress = '';
    if (channel === 'email') {
      recipientAddress = user.email || '';
      if (!recipientAddress) continue;
    } else if (channel === 'whatsapp') {
      recipientAddress = pref.whatsappOptIn?.phoneNumber || profile?.personalInfo?.phone || '';
      if (!recipientAddress) continue;
    } else if (channel === 'push') {
      recipientAddress = pref.pushSubscription?.endpoint || String(user._id || user.id);
    } else {
      recipientAddress = String(user._id || user.id);
    }

    const rendered = await resolveAndRender({
      collegeId,
      eventType,
      channel,
      variables: {
        ...variables,
        studentName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Student',
        userId: String(user._id || user.id),
      },
    });

    const jobTitle = rendered.title || rendered.subject || 'Campus Alert';
    const jobBody = rendered.bodyHtml || rendered.body || rendered.bodyText || '';

    jobs.push({
      collegeId,
      userId: user._id || user.id,
      eventId: String(eventId || ''),
      eventType,
      channel,
      title: jobTitle,
      body: jobBody,
      deepLink: deepLink || rendered.deepLink || '/student/dashboard',
      isMandatory: Boolean(isMandatory),
      metadata: {
        recipientAddress,
        recipientName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        ...variables,
      },
    });
  }

  return jobs;
}

class NotificationSubscriber {
  static init() {
    // 1. Drive Published -> notify all eligible students
    eventBus.on(DOMAIN_EVENTS.DRIVE_PUBLISHED, async (payload) => {
      const { drive, eligibleStudentUserIds = [], collegeId, collegeTimezone } = payload;
      if (eligibleStudentUserIds.length === 0) return;

      const users = await User.find({ _id: { $in: eligibleStudentUserIds } }).lean();
      const profiles = await StudentProfile.find({
        collegeId,
        user: { $in: eligibleStudentUserIds },
      }).lean();

      const profileByUser = {};
      profiles.forEach((p) => {
        profileByUser[p.user.toString()] = p;
      });

      const allJobs = [];
      for (const u of users) {
        const p = profileByUser[u._id.toString()];
        const jobs = await buildJobsForRecipient({
          collegeId,
          user: u,
          profile: p,
          eventType: DOMAIN_EVENTS.DRIVE_PUBLISHED,
          eventId: drive._id,
          variables: {
            company: drive.companyName || 'Corporate Partner',
            role: drive.title || drive.jobRole || 'Engineer',
            ctc: drive.ctc?.total || drive.ctc?.fixed || 'Competitive',
            deadline: drive.deadline ? new Date(drive.deadline).toLocaleDateString() : 'Closing Soon',
            link: `/student/dashboard`,
          },
          deepLink: '/student/dashboard',
          isMandatory: false,
        });
        allJobs.push(...jobs);
      }

      await notificationQueue.enqueueBatch(allJobs, collegeTimezone);
    });

    // 2. Drive Deadline 24h & 3h Reminders
    const handleDeadlineReminder = async (payload, eventType) => {
      const { drive, nonAppliedUserIds = [], collegeId, collegeTimezone } = payload;
      if (nonAppliedUserIds.length === 0) return;

      const users = await User.find({ _id: { $in: nonAppliedUserIds } }).lean();
      const allJobs = [];

      for (const u of users) {
        const jobs = await buildJobsForRecipient({
          collegeId,
          user: u,
          eventType,
          eventId: drive._id,
          variables: {
            company: drive.companyName || 'Campus Recruiter',
            role: drive.title || drive.jobRole || 'Role',
            deadline: drive.deadline ? new Date(drive.deadline).toLocaleTimeString() : '',
            time: drive.deadline ? new Date(drive.deadline).toLocaleTimeString() : '',
            link: '/student/dashboard',
          },
          deepLink: '/student/dashboard',
          isMandatory: false,
        });
        allJobs.push(...jobs);
      }

      await notificationQueue.enqueueBatch(allJobs, collegeTimezone);
    };

    eventBus.on(DOMAIN_EVENTS.DRIVE_DEADLINE_24H, (p) =>
      handleDeadlineReminder(p, DOMAIN_EVENTS.DRIVE_DEADLINE_24H)
    );
    eventBus.on(DOMAIN_EVENTS.DRIVE_DEADLINE_3H, (p) =>
      handleDeadlineReminder(p, DOMAIN_EVENTS.DRIVE_DEADLINE_3H)
    );

    // 3. Application Status Changed
    eventBus.on(DOMAIN_EVENTS.APPLICATION_STATUS_CHANGED, async (payload) => {
      const { application, studentUser, drive, newStatus, collegeId } = payload;
      if (!studentUser) return;

      const jobs = await buildJobsForRecipient({
        collegeId,
        user: studentUser,
        eventType: DOMAIN_EVENTS.APPLICATION_STATUS_CHANGED,
        eventId: `${application._id}:${newStatus}`,
        variables: {
          company: drive?.companyName || 'Company',
          role: drive?.title || drive?.jobRole || 'Position',
          status: newStatus,
          link: '/student/dashboard',
        },
        deepLink: '/student/dashboard',
        isMandatory: false,
      });

      await notificationQueue.enqueueBatch(jobs);
    });

    // 4. Interview Scheduled
    eventBus.on(DOMAIN_EVENTS.INTERVIEW_SCHEDULED, async (payload) => {
      const { slot, studentUser, drive, collegeId } = payload;
      if (!studentUser) return;

      const isMandatory = MANDATORY_EVENTS.includes(DOMAIN_EVENTS.INTERVIEW_SCHEDULED);
      const jobs = await buildJobsForRecipient({
        collegeId,
        user: studentUser,
        eventType: DOMAIN_EVENTS.INTERVIEW_SCHEDULED,
        eventId: slot._id,
        variables: {
          company: drive?.companyName || 'Company',
          roundName: slot.roundName || 'Interview Round',
          date: slot.date ? new Date(slot.date).toLocaleDateString() : '',
          time: slot.startTime || '',
          linkOrRoom: slot.roomOrLink || 'To be communicated',
          link: '/student/dashboard',
        },
        deepLink: '/student/dashboard',
        isMandatory,
      });

      await notificationQueue.enqueueBatch(jobs);
    });

    // 5. Interview Reminders (1 Day & 1 Hour)
    const handleInterviewReminder = async (payload, eventType) => {
      const { slot, studentUser, drive, collegeId } = payload;
      if (!studentUser) return;

      const isMandatory = eventType === DOMAIN_EVENTS.INTERVIEW_REMINDER_1H;
      const jobs = await buildJobsForRecipient({
        collegeId,
        user: studentUser,
        eventType,
        eventId: `${slot._id}:${eventType}`,
        variables: {
          company: drive?.companyName || 'Company',
          roundName: slot.roundName || 'Interview',
          date: slot.date ? new Date(slot.date).toLocaleDateString() : '',
          time: slot.startTime || '',
          linkOrRoom: slot.roomOrLink || '',
          link: '/student/dashboard',
        },
        deepLink: '/student/dashboard',
        isMandatory,
      });

      await notificationQueue.enqueueBatch(jobs);
    };

    eventBus.on(DOMAIN_EVENTS.INTERVIEW_REMINDER_1D, (p) =>
      handleInterviewReminder(p, DOMAIN_EVENTS.INTERVIEW_REMINDER_1D)
    );
    eventBus.on(DOMAIN_EVENTS.INTERVIEW_REMINDER_1H, (p) =>
      handleInterviewReminder(p, DOMAIN_EVENTS.INTERVIEW_REMINDER_1H)
    );

    // 6. Offer Extended (Mandatory Event!)
    eventBus.on(DOMAIN_EVENTS.OFFER_EXTENDED, async (payload) => {
      const { application, studentUser, drive, offerDetails, collegeId } = payload;
      if (!studentUser) return;

      const jobs = await buildJobsForRecipient({
        collegeId,
        user: studentUser,
        eventType: DOMAIN_EVENTS.OFFER_EXTENDED,
        eventId: application._id,
        variables: {
          company: drive?.companyName || 'Company',
          role: drive?.title || drive?.jobRole || 'Engineer',
          ctc: offerDetails?.ctcTotal || drive?.ctc?.total || 'Offer',
          link: '/student/dashboard',
        },
        deepLink: '/student/dashboard',
        isMandatory: true,
      });

      await notificationQueue.enqueueBatch(jobs);
    });

    // 7. Academic Verification Approved / Rejected
    eventBus.on(DOMAIN_EVENTS.VERIFICATION_APPROVED, async (payload) => {
      const { studentUser, verificationCode, collegeId } = payload;
      if (!studentUser) return;

      const jobs = await buildJobsForRecipient({
        collegeId,
        user: studentUser,
        eventType: DOMAIN_EVENTS.VERIFICATION_APPROVED,
        eventId: `ver_app_${studentUser._id || studentUser.id}`,
        variables: {
          verificationCode: verificationCode || '',
          link: '/student/dashboard',
        },
        deepLink: '/student/dashboard',
        isMandatory: false,
      });

      await notificationQueue.enqueueBatch(jobs);
    });

    eventBus.on(DOMAIN_EVENTS.VERIFICATION_REJECTED, async (payload) => {
      const { studentUser, rejectionReason, collegeId } = payload;
      if (!studentUser) return;

      const jobs = await buildJobsForRecipient({
        collegeId,
        user: studentUser,
        eventType: DOMAIN_EVENTS.VERIFICATION_REJECTED,
        eventId: `ver_rej_${studentUser._id || studentUser.id}_${Date.now()}`,
        variables: {
          reason: rejectionReason || 'Information requires update',
          link: '/student/dashboard',
        },
        deepLink: '/student/dashboard',
        isMandatory: false,
      });

      await notificationQueue.enqueueBatch(jobs);
    });

    // 8. TPO Announcement Broadcast
    eventBus.on(DOMAIN_EVENTS.ANNOUNCEMENT_SENT, async (payload) => {
      const { announcement, recipientUserIds = [], collegeId } = payload;
      if (recipientUserIds.length === 0) return;

      const users = await User.find({ _id: { $in: recipientUserIds } }).lean();
      const allJobs = [];

      for (const u of users) {
        const jobs = await buildJobsForRecipient({
          collegeId,
          user: u,
          eventType: DOMAIN_EVENTS.ANNOUNCEMENT_SENT,
          eventId: announcement._id,
          variables: {
            title: announcement.title || 'Announcement',
            body: announcement.body || '',
            bodySnippet: (announcement.body || '').substring(0, 120),
            link: '/student/dashboard',
          },
          deepLink: '/student/dashboard',
          isMandatory: false,
        });
        allJobs.push(...jobs);
      }

      await notificationQueue.enqueueBatch(allJobs);
    });
  }
}

module.exports = NotificationSubscriber;
