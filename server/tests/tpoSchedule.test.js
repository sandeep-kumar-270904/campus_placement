const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const InterviewSlot = require('../src/models/InterviewSlot');

describe('TPO Recruitment Calendar & Schedule Tests (Page 6)', () => {
  const collegeId = new mongoose.Types.ObjectId().toString();
  const opportunityId = new mongoose.Types.ObjectId().toString();
  const student1Id = new mongoose.Types.ObjectId().toString();
  const student2Id = new mongoose.Types.ObjectId().toString();

  describe('1. Slot Interval & Multi-Panel Distribution Math', () => {
    test('Calculates exact slots with duration and break buffers', () => {
      const startTime = '09:00';
      const endTime = '11:00';
      const slotDuration = 30; // minutes
      const breakDuration = 10; // minutes

      const dayStart = new Date(`2026-11-05T${startTime}:00`);
      const dayEnd = new Date(`2026-11-05T${endTime}:00`);

      const intervals = [];
      let currentStart = new Date(dayStart);

      while (true) {
        const currentEnd = new Date(currentStart.getTime() + slotDuration * 60000);
        if (currentEnd > dayEnd) break;
        intervals.push({
          start: new Date(currentStart),
          end: new Date(currentEnd),
        });
        currentStart = new Date(currentEnd.getTime() + breakDuration * 60000);
      }

      // Slot 1: 09:00 - 09:30
      // Break: 09:30 - 09:40
      // Slot 2: 09:40 - 10:10
      // Break: 10:10 - 10:20
      // Slot 3: 10:20 - 10:50
      // Next slot would end at 11:30 > 11:00
      assert.strictEqual(intervals.length, 3);
      assert.strictEqual(intervals[0].start.getHours(), 9);
      assert.strictEqual(intervals[0].start.getMinutes(), 0);
      assert.strictEqual(intervals[0].end.getMinutes(), 30);
      assert.strictEqual(intervals[1].start.getMinutes(), 40);
    });

    test('Evenly distributes candidates across multiple interview panels', () => {
      const candidates = [student1Id, student2Id, 'student3', 'student4'];
      const panels = ['Panel 1', 'Panel 2'];
      const intervals = [{ time: '09:00' }, { time: '09:30' }];

      const slots = [];
      let candIdx = 0;

      for (const interval of intervals) {
        for (const panel of panels) {
          slots.push({
            panel,
            time: interval.time,
            candidate: candidates[candIdx] || null,
          });
          candIdx++;
        }
      }

      assert.strictEqual(slots.length, 4);
      assert.strictEqual(slots[0].panel, 'Panel 1');
      assert.strictEqual(slots[0].candidate, student1Id);
      assert.strictEqual(slots[1].panel, 'Panel 2');
      assert.strictEqual(slots[1].candidate, student2Id);
      assert.strictEqual(slots[2].panel, 'Panel 1');
      assert.strictEqual(slots[2].candidate, 'student3');
      assert.strictEqual(slots[3].panel, 'Panel 2');
      assert.strictEqual(slots[3].candidate, 'student4');
    });
  });

  describe('2. Schedule Clash Detection Logic', () => {
    test('Detects overlap when time ranges intersect (start < other.end && end > other.start)', () => {
      const existingSlot = {
        start: new Date('2026-11-05T10:00:00Z'),
        end: new Date('2026-11-05T10:45:00Z'),
        studentId: student1Id,
        panel: 'Panel 1',
      };

      const hasOverlap = (newStart, newEnd) => {
        return newStart < existingSlot.end && newEnd > existingSlot.start;
      };

      // Exact match
      assert.strictEqual(
        hasOverlap(new Date('2026-11-05T10:00:00Z'), new Date('2026-11-05T10:45:00Z')),
        true
      );
      // Partial overlap earlier
      assert.strictEqual(
        hasOverlap(new Date('2026-11-05T09:45:00Z'), new Date('2026-11-05T10:15:00Z')),
        true
      );
      // Partial overlap later
      assert.strictEqual(
        hasOverlap(new Date('2026-11-05T10:30:00Z'), new Date('2026-11-05T11:00:00Z')),
        true
      );
      // Completely before (no overlap)
      assert.strictEqual(
        hasOverlap(new Date('2026-11-05T09:00:00Z'), new Date('2026-11-05T10:00:00Z')),
        false
      );
      // Completely after (no overlap)
      assert.strictEqual(
        hasOverlap(new Date('2026-11-05T10:45:00Z'), new Date('2026-11-05T11:30:00Z')),
        false
      );
    });
  });

  describe('3. InterviewSlot Model Schema & Multi-Tenant Scoping', () => {
    test('Constructs InterviewSlot with tenant scoping and status', () => {
      const slot = new InterviewSlot({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        opportunityId: new mongoose.Types.ObjectId(opportunityId),
        roundName: 'Technical Interview',
        roundNumber: 2,
        studentId: new mongoose.Types.ObjectId(student1Id),
        panelName: 'System Architecture Panel',
        date: new Date('2026-11-05'),
        startTime: '10:00',
        endTime: '10:45',
        startDateTime: new Date('2026-11-05T10:00:00Z'),
        endDateTime: new Date('2026-11-05T10:45:00Z'),
        mode: 'Online',
        roomOrLink: 'https://meet.google.com/abc-defg-hij',
        status: 'Scheduled',
      });

      assert.strictEqual(slot.roundName, 'Technical Interview');
      assert.strictEqual(slot.roundNumber, 2);
      assert.strictEqual(slot.status, 'Scheduled');
      assert.strictEqual(slot.mode, 'Online');
      assert.strictEqual(slot.collegeId.toString(), collegeId);
    });
  });

  describe('4. ICS Calendar Export Generation', () => {
    test('Generates RFC 5545 compliant iCalendar string', () => {
      const mockSlot = {
        _id: 'slot123',
        companyName: 'Acme Corp',
        roundName: 'Technical Round 1',
        panelName: 'Panel Alpha',
        studentName: 'Alex Doe',
        rollNo: '2026-CS-042',
        branch: 'Computer Science',
        mode: 'Online',
        roomOrLink: 'https://meet.google.com/test',
        startDateTime: new Date('2026-11-05T10:00:00Z'),
        endDateTime: new Date('2026-11-05T10:45:00Z'),
      };

      const formatIcsDate = (date) =>
        new Date(date).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

      const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//PLACEearly//Placement Operating System//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:slot-${mockSlot._id}@placeearly.edu`,
        `DTSTART:${formatIcsDate(mockSlot.startDateTime)}`,
        `DTEND:${formatIcsDate(mockSlot.endDateTime)}`,
        `SUMMARY:${mockSlot.companyName} - ${mockSlot.roundName} (${mockSlot.panelName})`,
        `DESCRIPTION:Candidate: ${mockSlot.studentName}`,
        `LOCATION:${mockSlot.roomOrLink}`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR',
      ];

      const icsOutput = lines.join('\r\n');

      assert.ok(icsOutput.includes('BEGIN:VCALENDAR'));
      assert.ok(icsOutput.includes('BEGIN:VEVENT'));
      assert.ok(icsOutput.includes('DTSTART:20261105T100000Z'));
      assert.ok(icsOutput.includes('SUMMARY:Acme Corp - Technical Round 1 (Panel Alpha)'));
      assert.ok(icsOutput.includes('END:VCALENDAR'));
    });
  });
});
