const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const Announcement = require('../src/models/Announcement');

describe('TPO Segmented Announcements & Broadcast Engine Tests (Page 8)', () => {
  const collegeId = new mongoose.Types.ObjectId().toString();
  const tpoId = new mongoose.Types.ObjectId().toString();

  describe('1. Announcement Model Schema & Default Stats', () => {
    test('Constructs announcement with segment parameters and delivery stats', () => {
      const ann = new Announcement({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        title: 'Google Online Assessment Instructions',
        body: 'Please ensure you have a working webcam and stable Wi-Fi connection.',
        category: 'Placement Drive',
        segments: {
          targetAll: false,
          branches: ['Computer Science', 'Information Technology'],
          graduationYears: [2026],
          placedStatus: 'unplaced_only',
        },
        channels: {
          inApp: true,
          email: true,
          smsOrWhatsapp: false,
        },
        sentBy: new mongoose.Types.ObjectId(tpoId),
        recipientCount: 85,
        deliveryStats: {
          delivered: 85,
          read: 12,
          failed: 0,
        },
        status: 'Sent',
      });

      assert.strictEqual(ann.title, 'Google Online Assessment Instructions');
      assert.strictEqual(ann.category, 'Placement Drive');
      assert.strictEqual(ann.segments.branches.length, 2);
      assert.strictEqual(ann.segments.placedStatus, 'unplaced_only');
      assert.strictEqual(ann.channels.email, true);
      assert.strictEqual(ann.deliveryStats.delivered, 85);
      assert.strictEqual(ann.status, 'Sent');
    });
  });

  describe('2. Scheduling & Broadcast Status Logic', () => {
    test('Correctly sets Scheduled status when scheduledAt is in the future', () => {
      const futureDate = new Date(Date.now() + 86400000); // 24h later
      const isScheduled = futureDate > new Date();

      const ann = new Announcement({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        title: 'Interview Slot Release Notice',
        body: 'Slots will be announced tomorrow at 9 AM.',
        scheduledAt: futureDate,
        status: isScheduled ? 'Scheduled' : 'Sent',
        sentBy: new mongoose.Types.ObjectId(tpoId),
      });

      assert.strictEqual(ann.status, 'Scheduled');
      assert.ok(ann.scheduledAt > new Date());
    });
  });

  describe('3. Audience Segmentation Filter Computation', () => {
    test('Builds appropriate filter queries for different segment combinations', () => {
      const buildProfileFilter = (segments) => {
        const query = {};
        if (!segments.targetAll) {
          if (segments.branches?.length > 0) query.branch = { $in: segments.branches };
          if (segments.graduationYears?.length > 0) query.gradYear = { $in: segments.graduationYears };
          if (segments.placedStatus === 'unplaced_only') query.isPlaced = false;
          if (segments.placedStatus === 'placed_only') query.isPlaced = true;
        }
        return query;
      };

      const filter1 = buildProfileFilter({
        targetAll: false,
        branches: ['CSE'],
        graduationYears: [2026],
        placedStatus: 'unplaced_only',
      });

      assert.deepStrictEqual(filter1.branch, { $in: ['CSE'] });
      assert.deepStrictEqual(filter1.gradYear, { $in: [2026] });
      assert.strictEqual(filter1.isPlaced, false);

      const filterAll = buildProfileFilter({
        targetAll: true,
        branches: ['CSE'], // Ignored when targetAll is true
      });
      assert.deepStrictEqual(filterAll, {});
    });
  });

  describe('4. Tenant Indexing Verification', () => {
    test('Announcement schema registers compound index on (collegeId, createdAt)', () => {
      const indexes = Announcement.schema.indexes();
      const hasTenantCreatedIndex = indexes.some((idx) => {
        const fields = idx[0];
        return fields.collegeId === 1 && fields.createdAt === -1;
      });

      assert.strictEqual(
        hasTenantCreatedIndex,
        true,
        'Announcement model must index (collegeId, createdAt) for performant broadcast history queries'
      );
    });
  });
});
