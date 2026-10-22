const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const Company = require('../src/models/Company');

describe('TPO Company CRM Tests (Page 7)', () => {
  const collegeId = new mongoose.Types.ObjectId().toString();

  describe('1. Company Schema & Contact Validation', () => {
    test('Constructs company document with contacts, past visits, and CTC history', () => {
      const company = new Company({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        name: 'Google LLC',
        industry: 'Software & Cloud',
        tier: 'Super Dream',
        status: 'confirmed',
        website: 'https://careers.google.com',
        contactPersons: [
          {
            name: 'Sarah Connor',
            designation: 'University Relations Lead',
            email: 'sarah.c@google.com',
            phone: '+1 415 555 0192',
            isPrimary: true,
          },
        ],
        pastVisits: [
          {
            year: 2025,
            hiredCount: 12,
            highestCtc: 44.5,
            avgCtc: 32.0,
          },
        ],
        ctcHistory: [
          {
            year: 2025,
            minCtc: 24,
            maxCtc: 45,
            avgCtc: 32,
          },
        ],
      });

      assert.strictEqual(company.name, 'Google LLC');
      assert.strictEqual(company.tier, 'Super Dream');
      assert.strictEqual(company.status, 'confirmed');
      assert.strictEqual(company.contactPersons.length, 1);
      assert.strictEqual(company.contactPersons[0].isPrimary, true);
      assert.strictEqual(company.pastVisits[0].hiredCount, 12);
      assert.strictEqual(company.ctcHistory[0].maxCtc, 45);
    });
  });

  describe('2. Status Transitions & Tier Enumerations', () => {
    test('Allows valid CRM statuses and tiers', () => {
      const validStatuses = ['prospect', 'invited', 'confirmed', 'visited'];
      const validTiers = ['Super Dream', 'Dream', 'Core', 'Standard'];

      validStatuses.forEach((status) => {
        const c = new Company({
          collegeId: new mongoose.Types.ObjectId(collegeId),
          name: `Test-${status}`,
          status,
        });
        assert.strictEqual(c.status, status);
      });

      validTiers.forEach((tier) => {
        const c = new Company({
          collegeId: new mongoose.Types.ObjectId(collegeId),
          name: `Test-${tier}`,
          tier,
        });
        assert.strictEqual(c.tier, tier);
      });
    });
  });

  describe('3. Follow-Up Reminders Engine', () => {
    test('Adds reminders with dueDate and tracks completion', () => {
      const company = new Company({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        name: 'Microsoft',
      });

      const due = new Date(Date.now() + 7 * 86400000);
      company.followUpReminders.push({
        title: 'Follow up on autumn campus visit slot confirmation',
        dueDate: due,
        completed: false,
      });

      assert.strictEqual(company.followUpReminders.length, 1);
      assert.strictEqual(company.followUpReminders[0].completed, false);
      assert.ok(company.followUpReminders[0].dueDate >= new Date());

      // Complete reminder
      company.followUpReminders[0].completed = true;
      assert.strictEqual(company.followUpReminders[0].completed, true);
    });
  });

  describe('4. Tenant Compound Uniqueness on Company Name', () => {
    test('Company schema defines compound index on (collegeId, name)', () => {
      const indexes = Company.schema.indexes();
      const hasTenantNameIndex = indexes.some((idx) => {
        const fields = idx[0];
        const opts = idx[1] || {};
        return fields.collegeId === 1 && fields.name === 1 && opts.unique === true;
      });

      assert.strictEqual(
        hasTenantNameIndex,
        true,
        'Company model must enforce compound unique index on (collegeId, name)'
      );
    });
  });
});
