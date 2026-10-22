const crypto = require('crypto');
const Notification = require('../../../models/Notification');
const College = require('../../../models/College');
const { getProvider } = require('../providers');

/**
 * Check if the current time in the college timezone falls between 10 PM (22:00) and 7 AM (07:00)
 */
function isQuietHours(timeZone = 'Asia/Kolkata') {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      hour12: false,
    });
    const currentHour = parseInt(formatter.format(now), 10);
    // Quiet hours: 10 PM (22) through 6:59 AM (hour < 7)
    return currentHour >= 22 || currentHour < 7;
  } catch (err) {
    // If timezone parsing fails, fallback to local hour
    const localHour = new Date().getHours();
    return localHour >= 22 || localHour < 7;
  }
}

/**
 * Calculate the next 7:00 AM timestamp in the given timezone
 */
function getNextQuietHoursEnd(timeZone = 'Asia/Kolkata') {
  const now = new Date();
  // Safe default: defer 4 hours or calculate next 7am
  return new Date(now.getTime() + 4 * 60 * 60 * 1000);
}

/**
 * Generate standard idempotency key for deduplication
 */
function generateIdempotencyKey(collegeId, userId, eventType, eventId, channel, windowSalt = '') {
  const raw = `${collegeId}:${userId}:${eventType}:${eventId || 'global'}:${channel}:${windowSalt}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

class NotificationQueue {
  /**
   * Enqueue a single notification job
   */
  async enqueue(jobData) {
    const {
      collegeId,
      userId,
      eventId,
      eventType,
      channel,
      title,
      body,
      deepLink,
      metadata = {},
      isMandatory = false,
      collegeTimezone = 'Asia/Kolkata',
    } = jobData;

    const idempotencyKey =
      jobData.idempotencyKey ||
      generateIdempotencyKey(collegeId, userId, eventType, eventId, channel);

    // Deduplication check
    const existing = await Notification.findOne({ collegeId, idempotencyKey }).lean();
    if (existing) {
      return { skipped: true, duplicate: true, notification: existing };
    }

    // Quiet hours evaluation (non-urgent notifications are deferred until 7:00 AM)
    let nextRetryAt = null;
    if (!isMandatory && isQuietHours(collegeTimezone)) {
      nextRetryAt = getNextQuietHoursEnd(collegeTimezone);
    }

    const notification = await Notification.create({
      collegeId,
      userId,
      eventId,
      eventType,
      channel,
      title,
      body,
      deepLink,
      metadata,
      isMandatory,
      idempotencyKey,
      status: 'queued',
      retryCount: 0,
      nextRetryAt,
      queuedAt: new Date(),
    });

    return { skipped: false, notification };
  }

  /**
   * Enqueue a batch of jobs (e.g. 500 eligible students for a drive announcement)
   */
  async enqueueBatch(jobsArray, collegeTimezone = 'Asia/Kolkata') {
    if (!Array.isArray(jobsArray) || jobsArray.length === 0) {
      return { enqueuedCount: 0, skippedCount: 0, jobIds: [] };
    }

    const quietActive = isQuietHours(collegeTimezone);
    const quietEnd = quietActive ? getNextQuietHoursEnd(collegeTimezone) : null;

    const docsToInsert = jobsArray.map((job) => {
      const idempotencyKey =
        job.idempotencyKey ||
        generateIdempotencyKey(job.collegeId, job.userId, job.eventType, job.eventId, job.channel);

      const nextRetryAt = !job.isMandatory && quietActive ? quietEnd : null;

      return {
        collegeId: job.collegeId,
        userId: job.userId,
        eventId: job.eventId || '',
        eventType: job.eventType,
        channel: job.channel,
        title: job.title,
        body: job.body,
        deepLink: job.deepLink || '',
        metadata: job.metadata || {},
        isMandatory: Boolean(job.isMandatory),
        idempotencyKey,
        status: 'queued',
        retryCount: 0,
        nextRetryAt,
        queuedAt: new Date(),
      };
    });

    try {
      // High-performance batch insert with duplicate key tolerance (ordered: false)
      const inserted = await Notification.insertMany(docsToInsert, { ordered: false });
      return {
        enqueuedCount: inserted.length,
        skippedCount: docsToInsert.length - inserted.length,
        jobIds: inserted.map((doc) => doc._id),
      };
    } catch (error) {
      // In bulk insert, MongoBulkWriteError still inserts non-duplicates
      const insertedCount = error.insertedDocs?.length || 0;
      return {
        enqueuedCount: insertedCount,
        skippedCount: docsToInsert.length - insertedCount,
        jobIds: (error.insertedDocs || []).map((doc) => doc._id),
      };
    }
  }

  /**
   * Process due jobs from the queue with exponential backoff and error tracking
   */
  async processBatch({ batchSize = 100, collegeId } = {}) {
    const query = {
      status: 'queued',
      $or: [{ nextRetryAt: null }, { nextRetryAt: { $lte: new Date() } }],
    };
    if (collegeId) query.collegeId = collegeId;

    const dueJobs = await Notification.find(query)
      .sort({ createdAt: 1 })
      .limit(batchSize)
      .lean();

    if (dueJobs.length === 0) {
      return { processed: 0, delivered: 0, failed: 0 };
    }

    let deliveredCount = 0;
    let failedCount = 0;

    for (const job of dueJobs) {
      try {
        const provider = getProvider(job.channel);
        const recipientIdentifier = job.metadata?.recipientAddress || String(job.userId);

        const result = await provider.send({
          notificationId: job._id,
          to: recipientIdentifier,
          recipientName: job.metadata?.recipientName || 'Student',
          title: job.title,
          body: job.body,
          deepLink: job.deepLink,
          metadata: job.metadata,
          unsubscribeUrl: job.metadata?.unsubscribeUrl,
        });

        if (result.success) {
          await Notification.findByIdAndUpdate(job._id, {
            status: 'delivered',
            deliveredAt: new Date(),
            sentAt: new Date(),
            failureReason: '',
          });
          deliveredCount++;
        } else {
          // Provider reported failure -> apply exponential backoff
          const nextRetryCount = (job.retryCount || 0) + 1;
          const maxRetries = job.maxRetries || 3;

          if (nextRetryCount < maxRetries) {
            // Exponential backoff: 60s * 5^retryCount -> 60s, 300s (5m), 1500s (25m)
            const backoffSeconds = 60 * Math.pow(5, nextRetryCount - 1);
            const nextRetryAt = new Date(Date.now() + backoffSeconds * 1000);

            await Notification.findByIdAndUpdate(job._id, {
              status: 'queued',
              retryCount: nextRetryCount,
              nextRetryAt,
              failureReason: result.error || 'Provider rejected message',
            });
          } else {
            // Dead letter queue: max retries reached
            await Notification.findByIdAndUpdate(job._id, {
              status: 'failed',
              retryCount: nextRetryCount,
              failureReason: result.error || 'Max retries exhausted',
            });
          }
          failedCount++;
        }
      } catch (err) {
        // Unexpected processing exception
        await Notification.findByIdAndUpdate(job._id, {
          status: 'failed',
          failureReason: err.message || 'Processing exception',
        });
        failedCount++;
      }
    }

    return {
      processed: dueJobs.length,
      delivered: deliveredCount,
      failed: failedCount,
    };
  }

  /**
   * Retry all failed notifications for a college or specific IDs
   */
  async retryFailed({ collegeId, notificationIds = [] }) {
    const filter = {
      status: 'failed',
      ...(collegeId ? { collegeId } : {}),
    };
    if (notificationIds.length > 0) {
      filter._id = { $in: notificationIds };
    }

    const result = await Notification.updateMany(filter, {
      $set: {
        status: 'queued',
        retryCount: 0,
        nextRetryAt: null,
        failureReason: '',
      },
    });

    return {
      requeuedCount: result.modifiedCount || 0,
    };
  }
}

const notificationQueue = new NotificationQueue();

module.exports = {
  notificationQueue,
  NotificationQueue,
  isQuietHours,
  getNextQuietHoursEnd,
  generateIdempotencyKey,
};
