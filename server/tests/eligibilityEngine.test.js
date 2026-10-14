const { test, describe } = require('node:test');
const assert = require('node:assert');
const { checkEligibility } = require('../src/services/eligibilityService');

describe('Eligibility Engine Unit Tests', () => {
  const mockOpportunity = {
    title: 'Software Development Engineer',
    companyName: 'Google',
    eligibilityRules: {
      minCgpa: 8.0,
      maxBacklogs: 0,
      allowedBranches: ['Computer Science', 'Information Technology']
    }
  };

  test('should approve a verified student meeting all CGPA, branch, and backlog criteria', () => {
    const student = {
      cgpa: 8.8,
      backlogs: 0,
      branch: 'Computer Science',
      isVerified: true
    };
    const result = checkEligibility(mockOpportunity, student);
    assert.strictEqual(result.isEligible, true);
    assert.ok(result.reason.includes('Eligible'));
  });

  test('should reject a student with CGPA below the threshold', () => {
    const student = {
      cgpa: 7.4,
      backlogs: 0,
      branch: 'Computer Science',
      isVerified: true
    };
    const result = checkEligibility(mockOpportunity, student);
    assert.strictEqual(result.isEligible, false);
    assert.ok(result.reason.includes('CGPA requirement not met'));
  });

  test('should reject a student with active backlogs exceeding allowed limit', () => {
    const student = {
      cgpa: 8.5,
      backlogs: 2,
      branch: 'Computer Science',
      isVerified: true
    };
    const result = checkEligibility(mockOpportunity, student);
    assert.strictEqual(result.isEligible, false);
    assert.ok(result.reason.includes('Backlog criteria exceeded'));
  });

  test('should reject a student from a non-allowed branch', () => {
    const student = {
      cgpa: 9.0,
      backlogs: 0,
      branch: 'Civil Engineering',
      isVerified: true
    };
    const result = checkEligibility(mockOpportunity, student);
    assert.strictEqual(result.isEligible, false);
    assert.ok(result.reason.includes('Branch not eligible'));
  });

  test('should reject a student whose profile is not verified by TPO', () => {
    const student = {
      cgpa: 9.5,
      backlogs: 0,
      branch: 'Computer Science',
      isVerified: false
    };
    const result = checkEligibility(mockOpportunity, student);
    assert.strictEqual(result.isEligible, false);
    assert.ok(result.reason.includes('pending TPO verification'));
  });

  test('should reject when profile data is missing or incomplete', () => {
    const result = checkEligibility(mockOpportunity, null);
    assert.strictEqual(result.isEligible, false);
    assert.ok(result.reason.includes('Profile incomplete'));
  });
});
