/**
 * Core Eligibility Engine Service
 * Evaluates whether a student candidate meets institutional and company requirements
 */

const checkEligibility = (opportunity, studentProfile) => {
  if (!studentProfile) {
    return { 
      isEligible: false, 
      reason: 'Profile incomplete. Please set up your academic profile.' 
    };
  }

  if (!studentProfile.isVerified) {
    return { 
      isEligible: false, 
      reason: 'Profile pending TPO verification. Please wait for TPO approval.' 
    };
  }

  const { minCgpa, maxBacklogs, allowedBranches } = opportunity.eligibilityRules || {};

  if (minCgpa !== undefined && (studentProfile.cgpa || 0) < minCgpa) {
    return { 
      isEligible: false, 
      reason: `CGPA requirement not met (Required: ${minCgpa}, Current: ${studentProfile.cgpa || 0})` 
    };
  }

  if (maxBacklogs !== undefined && (studentProfile.backlogs !== undefined ? studentProfile.backlogs : (studentProfile.academicInfo?.activeBacklogs || 0)) > maxBacklogs) {
    const currentBacklogs = studentProfile.backlogs !== undefined ? studentProfile.backlogs : (studentProfile.academicInfo?.activeBacklogs || 0);
    return { 
      isEligible: false, 
      reason: `Backlog criteria exceeded (Allowed: ${maxBacklogs}, Current: ${currentBacklogs})` 
    };
  }

  if (allowedBranches && allowedBranches.length > 0) {
    const studentBranch = studentProfile.branch || studentProfile.academicInfo?.branch || '';
    const branchMatched = allowedBranches.some(b => 
      b.toLowerCase().trim() === studentBranch.toLowerCase().trim() ||
      studentBranch.toLowerCase().includes(b.toLowerCase()) ||
      b.toLowerCase().includes(studentBranch.toLowerCase())
    );
    if (!branchMatched) {
      return { 
        isEligible: false, 
        reason: `Branch not eligible (${studentBranch || 'Unspecified'}). Eligible: ${allowedBranches.join(', ')}` 
      };
    }
  }

  return { 
    isEligible: true, 
    reason: 'Eligible for this opportunity!' 
  };
};

module.exports = { checkEligibility };
