const { test, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const College = require('../src/models/College');
const User = require('../src/models/User');

describe('TPO Placement Policies & Settings Tests (Page 11)', () => {
  const collegeId = new mongoose.Types.ObjectId().toString();

  describe('1. Policy Rules & Dream Threshold Mutation', () => {
    test('Updates placement policies and grading thresholds', () => {
      const college = new College({
        name: 'Apex Institute of Technology',
        code: 'AIT-2026',
        policies: {
          maxActiveBacklogsAllowed: 1,
          allowMultipleOffers: true,
          dreamTierThreshold: 18.0,
          rules: ['One regular offer allowed plus one dream tier offer above 18 LPA.'],
        },
        gradingSystem: {
          scale: '10-point',
          minPassCgpa: 5.5,
        },
      });

      assert.strictEqual(college.policies.maxActiveBacklogsAllowed, 1);
      assert.strictEqual(college.policies.dreamTierThreshold, 18.0);
      assert.strictEqual(college.policies.rules.length, 1);
      assert.strictEqual(college.gradingSystem.minPassCgpa, 5.5);

      // Mutate policy to strict zero backlogs
      college.policies.maxActiveBacklogsAllowed = 0;
      college.policies.allowMultipleOffers = false;
      assert.strictEqual(college.policies.maxActiveBacklogsAllowed, 0);
      assert.strictEqual(college.policies.allowMultipleOffers, false);
    });
  });

  describe('2. Institutional Engineering Branches Configuration', () => {
    test('Validates and stores non-empty branches list', () => {
      const initialBranches = ['Computer Science', 'Information Technology'];
      const updatedBranches = [
        'Computer Science',
        'Information Technology',
        'Electronics & Communication',
        'Data Science & AI',
      ];

      const college = new College({
        name: 'Tech University',
        code: 'TECH-U',
        branches: initialBranches,
      });

      assert.strictEqual(college.branches.length, 2);

      college.branches = updatedBranches;
      assert.strictEqual(college.branches.length, 4);
      assert.strictEqual(college.branches.includes('Data Science & AI'), true);
    });
  });

  describe('3. TPO Staff & Coordinator Creation & Hashing', () => {
    test('Constructs team staff user with password hash and valid role', async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('SecurePassword@123', salt);

      const staff = new User({
        collegeId: new mongoose.Types.ObjectId(collegeId),
        firstName: 'Elena',
        lastName: 'Rostova',
        email: 'elena.rostova@campus.edu',
        role: 'coordinator',
        password: hashedPassword,
      });

      assert.strictEqual(staff.role, 'coordinator');
      assert.strictEqual(staff.email, 'elena.rostova@campus.edu');
      assert.notStrictEqual(staff.password, 'SecurePassword@123');

      const isMatch = await bcrypt.compare('SecurePassword@123', staff.password);
      assert.strictEqual(isMatch, true);
    });
  });
});
