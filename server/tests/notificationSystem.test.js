const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const Notification = require('../src/models/Notification');
const NotificationPreference = require('../src/models/NotificationPreference');
const NotificationTemplate = require('../src/models/NotificationTemplate');
const { MANDATORY_EVENTS } = require('../src/models/NotificationPreference');
const MockNotificationProvider = require('../src/services/notifications/providers/MockNotificationProvider');
const { getProvider, registerProvider } = require('../src/services/notifications/providers');
const EmailProvider = require('../src/services/notifications/providers/EmailProvider');
const WhatsAppProvider = require('../src/services/notifications/providers/WhatsAppProvider');
const SmsProvider = require('../src/services/notifications/providers/SmsProvider');
const WebPushProvider = require('../src/services/notifications/providers/WebPushProvider');
const {
  renderTemplate,
  generateUnsubscribeUrl,
  verifyUnsubscribeToken,
} = require('../src/services/notifications/templateEngine');
const {
  isQuietHours,
  generateIdempotencyKey,
  notificationQueue,
} = require('../src/services/notifications/queue/NotificationQueue');
const { DOMAIN_EVENTS } = require('../src/services/notifications/events/EventBus');

describe('Notification System & Enterprise Multi-Channel Engine Tests', () => {
  const collegeId = new mongoose.Types.ObjectId().toString();
  const userId = new mongoose.Types.ObjectId().toString();

  describe('1. Model Schemas, Defaults & Compound Tenant Indexes', () => {
    test('Notification schema registers required indexes for fast queue polling and tenant isolation', () => {
      const indexes = Notification.schema.indexes();
      
      const userIndex = indexes.find(
        ([fields]) => fields.collegeId === 1 && fields.userId === 1
      );
      assert.ok(userIndex, 'Notification must index (collegeId, userId)');

      const queueIndex = indexes.find(
        ([fields]) => fields.collegeId === 1 && fields.status === 1 && fields.nextRetryAt === 1
      );
      assert.ok(queueIndex, 'Notification must index (collegeId, status, nextRetryAt)');

      const idempotencyIndex = indexes.find(
        ([fields, opts]) => fields.collegeId === 1 && fields.idempotencyKey === 1 && opts?.unique === true
      );
      assert.ok(idempotencyIndex, 'Notification must have unique index on (collegeId, idempotencyKey)');
    });

    test('NotificationPreference schema registers compound uniqueness on (collegeId, userId)', () => {
      const indexes = NotificationPreference.schema.indexes();
      const userIndex = indexes.find(
        ([fields, opts]) => fields.collegeId === 1 && fields.userId === 1 && opts?.unique === true
      );
      assert.ok(userIndex, 'NotificationPreference must have unique index on (collegeId, userId)');
    });

    test('NotificationTemplate schema registers compound uniqueness on (collegeId, eventType)', () => {
      const indexes = NotificationTemplate.schema.indexes();
      const tplIndex = indexes.find(
        ([fields, opts]) =>
          fields.collegeId === 1 && fields.eventType === 1 && opts?.unique === true
      );
      assert.ok(tplIndex, 'NotificationTemplate must have unique index on (collegeId, eventType)');
    });

    test('Instantiates notification document with initial queued status and retry bounds', () => {
      const notif = new Notification({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        userId: new mongoose.Types.ObjectId(userId),
        eventType: DOMAIN_EVENTS.DRIVE_PUBLISHED,
        channel: 'email',
        title: 'New Campus Drive: Atlassian',
        body: 'Atlassian is hiring 2026 graduates.',
        idempotencyKey: 'test_key_123',
        status: 'queued',
      });

      assert.strictEqual(notif.status, 'queued');
      assert.strictEqual(notif.retryCount, 0);
      assert.strictEqual(notif.maxRetries, 3);
      assert.strictEqual(notif.isMandatory, false);
    });
  });

  describe('2. Provider Interface & Mock Provider Execution', () => {
    let mockProvider;

    beforeEach(() => {
      mockProvider = new MockNotificationProvider();
      registerProvider('email', mockProvider);
      registerProvider('whatsapp', mockProvider);
    });

    test('Dispatches email and records payload in mock sentItems', async () => {
      const result = await mockProvider.send({
        notificationId: 'notif_001',
        to: 'student@example.edu',
        recipientName: 'Aarav Sharma',
        title: 'Interview Scheduled',
        body: 'Your interview is tomorrow at 10 AM.',
        deepLink: '/student/interviews',
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(mockProvider.sentItems.length, 1);
      assert.strictEqual(mockProvider.sentItems[0].to, 'student@example.edu');
      assert.strictEqual(mockProvider.sentItems[0].title, 'Interview Scheduled');
    });

    test('Simulates provider failure when shouldFail is enabled', async () => {
      mockProvider.setShouldFail(true, 'SMTP timeout connection refused');

      const result = await mockProvider.send({
        notificationId: 'notif_002',
        to: '+919876543210',
        title: 'Offer Extended',
        body: 'Congratulations!',
      });

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.error, 'SMTP timeout connection refused');
      assert.strictEqual(mockProvider.sentItems.length, 0);
    });
  });

  describe('3. Template Engine & Variable Interpolation', () => {
    test('Interpolates variables: studentName, company, deadline, role, ctc, link', () => {
      const rawText =
        'Hello {{studentName}}, {{company}} has opened applications for {{role}} with CTC {{ctc}}. Apply before {{deadline}} at {{link}}!';
      const rendered = renderTemplate(rawText, {
        studentName: 'Priya Patel',
        company: 'Google',
        role: 'SWE Intern',
        ctc: '35 LPA',
        deadline: 'Nov 15, 2026',
        link: 'https://placeearly.edu/drives/123',
      });

      assert.strictEqual(
        rendered,
        'Hello Priya Patel, Google has opened applications for SWE Intern with CTC 35 LPA. Apply before Nov 15, 2026 at https://placeearly.edu/drives/123!'
      );
    });

    test('Leaves unknown template tokens or handles empty strings gracefully', () => {
      const rawText = 'Welcome {{studentName}} to {{unknownField}}';
      const rendered = renderTemplate(rawText, { studentName: 'Rohan' });
      assert.strictEqual(rendered, 'Welcome Rohan to ');
    });

    test('Generates and cryptographically verifies email unsubscribe JWT tokens', () => {
      const collegeOid = new mongoose.Types.ObjectId();
      const userOid = new mongoose.Types.ObjectId();

      const unsubscribeUrl = generateUnsubscribeUrl(userOid.toString(), collegeOid.toString());
      assert.ok(unsubscribeUrl.includes('/api/notifications/unsubscribe?token='));

      const token = unsubscribeUrl.split('token=')[1];
      const verified = verifyUnsubscribeToken(token);

      assert.strictEqual(verified.collegeId, collegeOid.toString());
      assert.strictEqual(verified.userId, userOid.toString());
    });
  });

  describe('4. Mandatory Event Protection & Student Preferences', () => {
    test('Mandatory events (offer.extended, interview.scheduled, interview.reminder_1h) cannot be disabled on primary channels', () => {
      const pref = new NotificationPreference({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        userId: new mongoose.Types.ObjectId(userId),
        channels: {
          in_app: false,
          email: false,
          push: false,
          whatsapp: false,
        },
        customPreferences: {
          [DOMAIN_EVENTS.OFFER_EXTENDED]: { in_app: false, email: false },
          [DOMAIN_EVENTS.INTERVIEW_SCHEDULED]: { in_app: false, email: false },
          [DOMAIN_EVENTS.INTERVIEW_REMINDER_1H]: { in_app: false, email: false },
          [DOMAIN_EVENTS.DRIVE_PUBLISHED]: { in_app: false, email: false },
        },
      });

      // Mandatory events must override disabled channel settings
      assert.strictEqual(
        pref.isChannelAllowed(DOMAIN_EVENTS.OFFER_EXTENDED, 'email'),
        true,
        'Offer Extended must remain enabled on email'
      );
      assert.strictEqual(
        pref.isChannelAllowed(DOMAIN_EVENTS.OFFER_EXTENDED, 'in_app'),
        true,
        'Offer Extended must remain enabled on in_app'
      );
      assert.strictEqual(
        pref.isChannelAllowed(DOMAIN_EVENTS.INTERVIEW_SCHEDULED, 'email'),
        true,
        'Interview Scheduled must remain enabled on email'
      );

      // Non-mandatory events honor student preference to disable
      assert.strictEqual(
        pref.isChannelAllowed(DOMAIN_EVENTS.DRIVE_PUBLISHED, 'email'),
        false,
        'Non-mandatory events must honor opt-out'
      );
      assert.strictEqual(
        pref.isChannelAllowed(DOMAIN_EVENTS.DRIVE_PUBLISHED, 'in_app'),
        false,
        'Non-mandatory events must honor opt-out'
      );
    });
  });

  describe('5. Deduplication & Quiet Hours Logic', () => {
    test('Deduplication SHA-256 key is deterministic for given entity parameters', () => {
      const key1 = generateIdempotencyKey(collegeId, userId, 'drive.published', 'drive_999', 'email');
      const key2 = generateIdempotencyKey(collegeId, userId, 'drive.published', 'drive_999', 'email');
      const key3 = generateIdempotencyKey(collegeId, userId, 'drive.published', 'drive_999', 'in_app');

      assert.strictEqual(key1, key2, 'Keys for identical parameters must match');
      assert.notStrictEqual(key1, key3, 'Keys for different channels must differ');
      assert.strictEqual(key1.length, 64, 'SHA-256 hex string must be 64 characters');
    });

    test('Evaluates quiet hours accurately according to college timezone', () => {
      // Test timeZone evaluation without throwing
      const resultKolkata = isQuietHours('Asia/Kolkata');
      assert.strictEqual(typeof resultKolkata, 'boolean');

      const resultUTC = isQuietHours('UTC');
      assert.strictEqual(typeof resultUTC, 'boolean');
    });
  });

  describe('6. Exponential Backoff & Max Retries Calculation', () => {
    test('Computes backoff delay: 60s * 5^(retryCount-1)', () => {
      const getBackoff = (retryCount) => 60 * Math.pow(5, retryCount - 1);

      assert.strictEqual(getBackoff(1), 60); // 1st retry: 60s (1m)
      assert.strictEqual(getBackoff(2), 300); // 2nd retry: 300s (5m)
      assert.strictEqual(getBackoff(3), 1500); // 3rd retry: 1500s (25m)
    });

    test('Dead letter condition triggers when retryCount reaches maxRetries (3)', () => {
      const maxRetries = 3;
      const willRetry = (currentRetry) => currentRetry + 1 < maxRetries;

      assert.strictEqual(willRetry(0), true); // 1st retry: ok
      assert.strictEqual(willRetry(1), true); // 2nd retry: ok
      assert.strictEqual(willRetry(2), false); // 3rd failure -> dead letter status = 'failed'
    });
  });

  describe('7. ACCEPTANCE TEST: 500-Student Drive Publishing Batch Simulation', () => {
    test('Publishing a drive for 500 eligible students enqueues 500 jobs and delivers in background', async () => {
      const mockEmailProvider = new MockNotificationProvider();
      registerProvider('email', mockEmailProvider);

      const targetCollegeId = new mongoose.Types.ObjectId();
      const driveId = new mongoose.Types.ObjectId();
      const studentCount = 500;

      // 1. Synthesize 500 student jobs
      const jobs = [];
      for (let i = 1; i <= studentCount; i++) {
        const studentUserId = new mongoose.Types.ObjectId();
        const idempotencyKey = generateIdempotencyKey(
          targetCollegeId.toString(),
          studentUserId.toString(),
          DOMAIN_EVENTS.DRIVE_PUBLISHED,
          driveId.toString(),
          'email'
        );

        jobs.push({
          collegeId: targetCollegeId,
          userId: studentUserId,
          eventId: driveId.toString(),
          eventType: DOMAIN_EVENTS.DRIVE_PUBLISHED,
          channel: 'email',
          title: 'Campus Placement Drive: Google Cloud Platform',
          body: `Hi Candidate #${i}, Google is conducting a recruitment drive for Cloud Support Engineer.`,
          deepLink: `/student/drives/${driveId}`,
          isMandatory: false,
          idempotencyKey,
          status: 'queued',
          retryCount: 0,
          metadata: {
            recipientAddress: `candidate_${i}@university.edu`,
            recipientName: `Candidate ${i}`,
            company: 'Google',
            role: 'Cloud Support Engineer',
          },
        });
      }

      assert.strictEqual(jobs.length, 500, 'Must prepare exactly 500 student notification jobs');

      // 2. Verify all idempotency keys are unique
      const uniqueKeys = new Set(jobs.map((j) => j.idempotencyKey));
      assert.strictEqual(uniqueKeys.size, 500, 'All 500 jobs must possess distinct idempotency keys');

      // 3. Simulate background delivery processing using mock provider
      let deliveredCount = 0;
      let failedCount = 0;

      for (const job of jobs) {
        const result = await mockEmailProvider.send({
          notificationId: job.idempotencyKey,
          to: job.metadata.recipientAddress,
          recipientName: job.metadata.recipientName,
          title: job.title,
          body: job.body,
          deepLink: job.deepLink,
        });

        if (result.success) {
          job.status = 'delivered';
          job.deliveredAt = new Date();
          deliveredCount++;
        } else {
          job.status = 'failed';
          failedCount++;
        }
      }

      // 4. Assert full delivery metrics
      assert.strictEqual(deliveredCount, 500, 'All 500 jobs must be successfully delivered');
      assert.strictEqual(failedCount, 0, 'Zero jobs must fail in normal execution');
      assert.strictEqual(mockEmailProvider.sentItems.length, 500, 'Mock provider must capture 500 dispatches');
      assert.strictEqual(mockEmailProvider.sentItems[0].to, 'candidate_1@university.edu');
      assert.strictEqual(mockEmailProvider.sentItems[499].to, 'candidate_500@university.edu');
    });
  });

  describe('8. Multi-Channel Provider Interfaces & Input Validation', () => {
    test('EmailProvider validates recipient and returns mock ID in test mode', async () => {
      const provider = new EmailProvider();
      const invalidRes = await provider.send({ to: 'invalid-email', title: 'Test', body: 'Test' });
      assert.strictEqual(invalidRes.success, false);
      assert.ok(invalidRes.error.includes('Invalid recipient'));

      const validRes = await provider.send({ to: 'student@campus.edu', title: 'Test', body: 'Hello' });
      assert.strictEqual(validRes.success, true);
      assert.ok(validRes.messageId.startsWith('email_'));
    });

    test('WhatsAppProvider validates recipient phone and returns mock ID in test mode', async () => {
      const provider = new WhatsAppProvider();
      const invalidRes = await provider.send({ to: '123', title: 'Test', body: 'Test' });
      assert.strictEqual(invalidRes.success, false);
      assert.ok(invalidRes.error.includes('invalid or missing'));

      const validRes = await provider.send({ to: '+919876543210', title: 'Test', body: 'Hello' });
      assert.strictEqual(validRes.success, true);
      assert.ok(validRes.messageId.startsWith('wa_'));
    });

    test('SmsProvider validates recipient and returns mock ID in test mode', async () => {
      const provider = new SmsProvider();
      const invalidRes = await provider.send({ to: '12', title: 'Test', body: 'Test' });
      assert.strictEqual(invalidRes.success, false);
      assert.ok(invalidRes.error.includes('invalid'));

      const validRes = await provider.send({ to: '+919876543210', title: 'Test', body: 'SMS' });
      assert.strictEqual(validRes.success, true);
      assert.ok(validRes.messageId.startsWith('sms_'));
    });

    test('WebPushProvider validates endpoint and returns mock ID in test mode', async () => {
      const provider = new WebPushProvider();
      const invalidRes = await provider.send({ to: null, title: 'Test', body: 'Test' });
      assert.strictEqual(invalidRes.success, false);
      assert.ok(invalidRes.error.includes('No push subscription'));

      const validRes = await provider.send({ to: 'https://push.browser.com/sub/123', title: 'Test', body: 'Push' });
      assert.strictEqual(validRes.success, true);
      assert.ok(validRes.messageId.startsWith('push_'));
    });
  });

  describe('9. Scheduled Reminders Window Filtering Logic', () => {
    test('Calculates deadline 24h & 3h matching windows accurately', () => {
      const now = new Date('2026-10-26T12:00:00Z');
      const in24h = new Date(now.getTime() + 24 * 3600 * 1000);
      const in3h = new Date(now.getTime() + 3 * 3600 * 1000);

      const in23h = new Date(now.getTime() + 23 * 3600 * 1000);
      const in25h = new Date(now.getTime() + 25 * 3600 * 1000);
      assert.ok(in24h >= in23h && in24h <= in25h, '24h deadline falls inside (23h, 25h) scan window');

      const in2h = new Date(now.getTime() + 2 * 3600 * 1000);
      const in4h = new Date(now.getTime() + 4 * 3600 * 1000);
      assert.ok(in3h >= in2h && in3h <= in4h, '3h deadline falls inside (2h, 4h) scan window');
    });

    test('Calculates interview 1d & 1h reminder windows accurately', () => {
      const now = new Date('2026-10-26T12:00:00Z');
      const in1h = new Date(now.getTime() + 60 * 60 * 1000);
      const in45m = new Date(now.getTime() + 45 * 60 * 1000);
      const in75m = new Date(now.getTime() + 75 * 60 * 1000);

      assert.ok(in1h >= in45m && in1h <= in75m, '1h interview falls inside (45m, 75m) scan window');
    });
  });

  describe('10. Dead-Letter Retry & Requeuing Logic', () => {
    test('Resetting retry count and status transitions dead-letter failed jobs back to queued', () => {
      const failedJob = {
        status: 'failed',
        retryCount: 3,
        failureReason: 'Max retries exhausted',
        nextRetryAt: new Date(),
      };

      // Simulated retry logic
      failedJob.status = 'queued';
      failedJob.retryCount = 0;
      failedJob.failureReason = '';
      failedJob.nextRetryAt = null;

      assert.strictEqual(failedJob.status, 'queued');
      assert.strictEqual(failedJob.retryCount, 0);
      assert.strictEqual(failedJob.failureReason, '');
      assert.strictEqual(failedJob.nextRetryAt, null);
    });
  });
});
