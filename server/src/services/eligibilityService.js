/**
 * Core Eligibility Service
 * Delegates to the enhanced explanatory eligibility engine
 */
const { evaluateEligibility } = require('./eligibilityEngine');

const checkEligibility = (opportunity, studentProfile, college = null) => {
  const result = evaluateEligibility(opportunity, studentProfile, college);
  return {
    ...result,
    reason: result.summary, // Backward compatibility for legacy tests and callers
  };
};

module.exports = {
  checkEligibility,
  evaluateEligibility,
};
