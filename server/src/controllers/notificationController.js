const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');
const NotificationPreference = require('../models/NotificationPreference');
const NotificationTemplate = require('../models/NotificationTemplate');
const { DEFAULT_TEMPLATES } = require('../models/NotificationTemplate');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const InterviewSlot = require('../models/InterviewSlot');
const User = require('../models/User');
const College = require('../models/College');
const { notificationQueue } = require('../services/notifications/queue/NotificationQueue');
const { eventBus, DOMAIN_EVENTS } = require('../services/notifications/events/EventBus');
const { resolveAndRender } = require('../services/notifications/templateEngine');

// 1. In-App Notification Center
exports.getInAppNotifications = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { page = 1, limit = 20, unreadOnly } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {
      ...(collegeId ? { collegeId } : {}),
      userId,
      channel: 'in_app',
      status: { $in: ['queued', 'sent', 'delivered', 'read'] },
    };

    if (unreadOnly === 'true') {
      query.status = { $ne: 'read' };
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({
        ...(collegeId ? { collegeId } : {}),
        userId,
        channel: 'in_app',
        status: { $ne: 'read' },
      }),
    ]);

    res.json({
      success: true,
      notifications,
      total,
      unreadCount,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch notifications.' } });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;

    const count = await Notification.countDocuments({
      ...(collegeId ? { collegeId } : {}),
      userId,
      channel: 'in_app',
      status: { $ne: 'read' },
    });

    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to count unread.' } });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?.userId;

    const notif = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { $set: { status: 'read', readAt: new Date() } },
      { new: true }
    );

    if (!notif) {
      return res.status(404).json({ error: { message: 'Notification not found.' } });
    }

    res.json({ success: true, notification: notif });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to mark notification.' } });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;

    const result = await Notification.updateMany(
      {
        ...(collegeId ? { collegeId } : {}),
        userId,
        channel: 'in_app',
        status: { $ne: 'read' },
      },
      {
        $set: { status: 'read', readAt: new Date() },
      }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read.',
      markedCount: result.modifiedCount || 0,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to mark all as read.' } });
  }
};

// 2. Student Preferences
exports.getPreferences = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;

    let pref = await NotificationPreference.findOne({ collegeId, userId }).lean();
    if (!pref) {
      pref = await NotificationPreference.create({
        collegeId,
        userId,
        channels: { in_app: true, email: true, push: true, whatsapp: false, sms: false },
      });
    }

    res.json({
      success: true,
      preferences: pref,
      mandatoryEvents: ['offer.extended', 'interview.scheduled', 'interview.reminder_1h'],
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to get preferences.' } });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { channels, customPreferences } = req.body;

    let pref = await NotificationPreference.findOne({ collegeId, userId });
    if (!pref) {
      pref = new NotificationPreference({ collegeId, userId });
    }

    if (channels) {
      pref.channels = {
        ...pref.channels,
        ...channels,
      };
    }

    if (customPreferences) {
      // Validate that mandatory events cannot have both email and in_app turned off
      const mandatory = ['offer.extended', 'interview.scheduled', 'interview.reminder_1h'];
      for (const ev of mandatory) {
        if (customPreferences[ev]) {
          const inAppOff = customPreferences[ev].in_app === false;
          const emailOff = customPreferences[ev].email === false;
          if (inAppOff && emailOff) {
            return res.status(400).json({
              error: {
                message: `Mandatory alert '${ev}' cannot have both email and in-app notifications disabled.`,
              },
            });
          }
        }
      }
      pref.customPreferences = customPreferences;
    }

    await pref.save();

    res.json({
      success: true,
      message: 'Notification preferences updated successfully.',
      preferences: pref,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to update preferences.' } });
  }
};

exports.whatsappOptIn = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { enabled, phoneNumber } = req.body;

    if (enabled && (!phoneNumber || phoneNumber.trim().length < 8)) {
      return res.status(400).json({ error: { message: 'A valid WhatsApp mobile number is required.' } });
    }

    let pref = await NotificationPreference.findOne({ collegeId, userId });
    if (!pref) {
      pref = new NotificationPreference({ collegeId, userId });
    }

    pref.whatsappOptIn = {
      enabled: Boolean(enabled),
      verifiedAt: enabled ? new Date() : null,
      phoneNumber: enabled ? phoneNumber.trim() : '',
    };
    if (enabled) {
      pref.channels.whatsapp = true;
    }

    await pref.save();

    res.json({
      success: true,
      message: enabled ? 'WhatsApp notifications enabled successfully.' : 'WhatsApp notifications disabled.',
      whatsappOptIn: pref.whatsappOptIn,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to update WhatsApp opt-in.' } });
  }
};

exports.subscribeWebPush = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: { message: 'Valid push subscription object required.' } });
    }

    let pref = await NotificationPreference.findOne({ collegeId, userId });
    if (!pref) {
      pref = new NotificationPreference({ collegeId, userId });
    }

    pref.pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys?.p256dh || '',
        auth: subscription.keys?.auth || '',
      },
    };
    pref.channels.push = true;

    await pref.save();

    res.json({
      success: true,
      message: 'Browser push notifications registered successfully.',
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to register push subscription.' } });
  }
};

exports.unsubscribeEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send('<h3>Invalid or missing unsubscribe token.</h3>');
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const decoded = jwt.verify(token, secret);

    if (decoded.action !== 'email_unsubscribe' || !decoded.userId) {
      return res.status(400).send('<h3>Invalid unsubscribe request.</h3>');
    }

    await NotificationPreference.findOneAndUpdate(
      { userId: decoded.userId },
      {
        $set: {
          'channels.email': false,
          'emailUnsubscribed.unsubscribed': true,
          'emailUnsubscribed.unsubscribedAt': new Date(),
        },
      },
      { upsert: true }
    );

    res.send(`
      <div style="font-family:sans-serif;max-width:500px;margin:50px auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;text-align:center;">
        <h2 style="color:#0f172a;">You have been unsubscribed</h2>
        <p style="color:#64748b;">You will no longer receive non-mandatory email notifications from PLACEearly. You can update your preferences anytime in your student dashboard.</p>
      </div>
    `);
  } catch (error) {
    res.status(400).send('<h3>Link expired or invalid.</h3>');
  }
};

// 3. TPO Delivery Tracking & Reports
exports.getDeliveryTracking = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { page = 1, limit = 25, status, channel, eventType, search } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {
      ...(collegeId ? { collegeId } : {}),
    };
    if (status) query.status = status;
    if (channel) query.channel = channel;
    if (eventType) query.eventType = eventType;
    if (search) {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    const [logs, total] = await Promise.all([
      Notification.find(query)
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Notification.countDocuments(query),
    ]);

    // KPI stats across notifications for this college
    const statsAgg = await Notification.aggregate([
      { $match: collegeId ? { collegeId: new (require('mongoose').Types.ObjectId)(collegeId) } : {} },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          delivered: {
            $sum: { $cond: [{ $in: ['$status', ['delivered', 'read']] }, 1, 0] },
          },
          queued: {
            $sum: { $cond: [{ $eq: ['$status', 'queued'] }, 1, 0] },
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
          },
        },
      },
    ]);

    const stats = statsAgg[0] || { total: 0, delivered: 0, queued: 0, failed: 0 };

    res.json({
      success: true,
      logs: logs.map((l) => ({
        ...l,
        recipientName: l.userId ? `${l.userId.firstName || ''} ${l.userId.lastName || ''}`.trim() : 'Recipient',
        recipientEmail: l.userId?.email || '',
      })),
      total,
      stats: {
        ...stats,
        deliveryRate: stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 100,
      },
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch delivery report.' } });
  }
};

exports.retryFailedJobs = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { notificationIds = [] } = req.body;

    const result = await notificationQueue.retryFailed({ collegeId, notificationIds });

    // Instantly process a batch of requeued jobs
    const batchResult = await notificationQueue.processBatch({ batchSize: 50, collegeId });

    res.json({
      success: true,
      message: `Re-queued ${result.requeuedCount} failed notifications. Processed ${batchResult.delivered} delivered.`,
      result,
      batchResult,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to retry jobs.' } });
  }
};

// 4. Template Management & Live Preview Test-Send
exports.getTemplates = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;

    const customTemplates = await NotificationTemplate.find({
      ...(collegeId ? { collegeId } : {}),
    }).lean();

    const customMap = {};
    customTemplates.forEach((t) => {
      customMap[t.eventType] = t.channels;
    });

    const merged = {};
    for (const [event, defChannels] of Object.entries(DEFAULT_TEMPLATES)) {
      merged[event] = {
        ...defChannels,
        ...(customMap[event] || {}),
      };
    }

    res.json({
      success: true,
      templates: merged,
      defaultTokens: [
        '{{studentName}}',
        '{{company}}',
        '{{role}}',
        '{{ctc}}',
        '{{roundName}}',
        '{{deadline}}',
        '{{date}}',
        '{{time}}',
        '{{linkOrRoom}}',
        '{{link}}',
      ],
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to fetch templates.' } });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const { eventType } = req.params;
    const { channels } = req.body;

    if (!channels) {
      return res.status(400).json({ error: { message: 'Channels configuration required.' } });
    }

    const tpl = await NotificationTemplate.findOneAndUpdate(
      { collegeId, eventType },
      { $set: { channels } },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: `Template for ${eventType} updated successfully.`,
      template: tpl,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Failed to update template.' } });
  }
};

exports.testSendNotification = async (req, res) => {
  try {
    const collegeId = req.tenant?.collegeId || req.user?.collegeId;
    const userId = req.user?.id || req.user?.userId;
    const { eventType = 'system.test_send', channel = 'in_app' } = req.body;

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ error: { message: 'User not found.' } });
    }

    const sampleVars = {
      studentName: `${user.firstName} ${user.lastName}`,
      company: 'Acme Technologies',
      role: 'Staff Software Engineer',
      ctc: '28.5',
      roundName: 'Technical Interview',
      deadline: 'Tomorrow at 6:00 PM',
      date: new Date().toLocaleDateString(),
      time: '11:00 AM',
      linkOrRoom: 'https://meet.google.com/test-preview',
      link: '/student/dashboard',
    };

    const rendered = await resolveAndRender({
      collegeId,
      eventType,
      channel,
      variables: sampleVars,
    });

    const job = await notificationQueue.enqueue({
      collegeId,
      userId: user._id,
      eventType,
      channel,
      title: rendered.title || rendered.subject || 'Live Test Preview',
      body: rendered.bodyHtml || rendered.body || rendered.bodyText || 'Test Body',
      deepLink: rendered.deepLink || '/tpo/settings',
      metadata: {
        recipientAddress: channel === 'email' ? user.email : String(user._id),
        recipientName: `${user.firstName} ${user.lastName}`,
      },
      isMandatory: true, // test sends bypass quiet hours
    });

    // Instantly process queue for the test send
    await notificationQueue.processBatch({ batchSize: 5, collegeId });

    res.json({
      success: true,
      message: `Test notification sent via ${channel}.`,
      rendered,
      notification: job.notification,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Test send failed.' } });
  }
};

// 5. Serverless Queue Batch Drain & Scheduled Reminders Trigger
exports.processQueueBatch = async (req, res) => {
  try {
    const collegeId = req.query.collegeId || req.tenant?.collegeId;
    const batchSize = parseInt(req.query.batchSize, 10) || 100;

    const result = await notificationQueue.processBatch({ batchSize, collegeId });

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Queue processing failed.' } });
  }
};

exports.triggerScheduledReminders = async (req, res) => {
  try {
    const now = new Date();
    const results = {
      deadline24hDrives: 0,
      deadline3hDrives: 0,
      interview1dSlots: 0,
      interview1hSlots: 0,
    };

    // 1. Scan for drives closing in 24h (23h to 25h window)
    const in23h = new Date(now.getTime() + 23 * 3600 * 1000);
    const in25h = new Date(now.getTime() + 25 * 3600 * 1000);

    const closing24hDrives = await Opportunity.find({
      status: 'Open',
      deadline: { $gte: in23h, $lte: in25h },
    }).lean();

    for (const drive of closing24hDrives) {
      // Find non-applied eligible students
      const applied = await Application.find({ opportunityId: drive._id }).select('studentId').lean();
      const appliedUserIds = applied.map((a) => a.studentId.toString());

      const college = await College.findById(drive.collegeId).lean();
      // Emit deadline 24h event
      await eventBus.emitAsync(DOMAIN_EVENTS.DRIVE_DEADLINE_24H, {
        drive,
        nonAppliedUserIds: appliedUserIds,
        collegeId: drive.collegeId,
        collegeTimezone: college?.timezone || 'Asia/Kolkata',
      });
      results.deadline24hDrives++;
    }

    // 2. Scan for interview slots in 1 hour (45m to 75m window)
    const in45m = new Date(now.getTime() + 45 * 60 * 1000);
    const in75m = new Date(now.getTime() + 75 * 60 * 1000);

    const upcomingSlots = await InterviewSlot.find({
      status: 'Scheduled',
      startDateTime: { $gte: in45m, $lte: in75m },
      studentId: { $ne: null },
    })
      .populate('studentId', 'firstName lastName email')
      .populate('opportunityId', 'title companyName')
      .lean();

    for (const slot of upcomingSlots) {
      await eventBus.emitAsync(DOMAIN_EVENTS.INTERVIEW_REMINDER_1H, {
        slot,
        studentUser: slot.studentId,
        drive: slot.opportunityId,
        collegeId: slot.collegeId,
      });
      results.interview1hSlots++;
    }

    // Process a queue batch immediately
    const queueStats = await notificationQueue.processBatch({ batchSize: 100 });

    res.json({
      success: true,
      remindersTriggered: results,
      queueStats,
    });
  } catch (error) {
    res.status(500).json({ error: { message: error.message || 'Scheduled reminders trigger failed.' } });
  }
};
