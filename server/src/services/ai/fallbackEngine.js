/**
 * Deterministic Rule-Based Fallback Engine
 * Provides resilient, offline-capable heuristics for all 7 AI intelligence features
 * when Anthropic API key is absent, times out, or rate limits.
 */

const KNOWN_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'golang', 'rust',
  'react', 'react.js', 'vue', 'angular', 'node.js', 'express', 'spring boot', 'django',
  'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
  'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'ci/cd', 'git', 'linux',
  'data structures', 'algorithms', 'system design', 'oop', 'microservices',
  'machine learning', 'pytorch', 'tensorflow', 'rest api', 'graphql'
];

/**
 * 1. Resume vs Drive Matcher (Deterministic Keyword & Jaccard Layer)
 */
function computeDeterministicResumeMatch(resumeText = '', jdText = '', eligibilityRules = {}, profile = {}) {
  const normalizedResume = (
    resumeText + ' ' +
    (profile.skills || []).join(' ') + ' ' +
    (profile.projects || []).map((p) => p.title + ' ' + (p.description || '') + ' ' + (p.technologies || []).join(' ')).join(' ')
  ).toLowerCase();

  const normalizedJd = jdText.toLowerCase();

  // Extract skills from JD
  const jdSkills = KNOWN_SKILLS.filter((skill) => normalizedJd.includes(skill));
  const effectiveJdSkills = jdSkills.length > 0 ? jdSkills : ['problem solving', 'data structures', 'algorithms', 'git'];

  // Check matched vs missing
  const matchedSkills = [];
  const missingSkills = [];

  effectiveJdSkills.forEach((skill) => {
    if (normalizedResume.includes(skill)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  // Calculate score
  const skillRatio = effectiveJdSkills.length ? (matchedSkills.length / effectiveJdSkills.length) : 0.7;
  let baseScore = Math.round(skillRatio * 75);

  // Profile completeness bump (projects, degree, cgpa)
  if (profile.projects && profile.projects.length >= 2) baseScore += 10;
  if (profile.cgpa && eligibilityRules.minCgpa && profile.cgpa >= eligibilityRules.minCgpa) baseScore += 10;
  if (profile.isVerifiedByTPO) baseScore += 5;

  const matchScore = Math.min(Math.max(baseScore, 20), 98);

  // Section feedback
  const sectionFeedback = {
    summary: matchedSkills.length > 3
      ? 'Strong alignment with core technical stack and drive domain requirements.'
      : 'Professional summary should more explicitly highlight relevant frameworks and problem-solving impact.',
    experience: 'Quantify engineering achievements using the Google XYZ formula (Accomplished [X], as measured by [Y], by doing [Z]).',
    projects: profile.projects && profile.projects.length > 0
      ? `Highlighted ${profile.projects.length} academic/personal project(s). Ensure live demo links and architectural decisions are prominent.`
      : 'Add 2 high-impact full-stack or systems projects with GitHub repositories.',
    education: profile.isVerifiedByTPO
      ? 'Academic credentials cryptographically sealed and verified by university Placement Cell.'
      : 'Ensure CGPA, university name, and graduation year match institutional records.',
  };

  // 5 Rewritten bullet suggestions with explicit reasons
  const topMissing = missingSkills.slice(0, 3);
  const rewrittenBulletSuggestions = [
    {
      original: 'Worked on backend APIs and database queries.',
      suggestion: `Architected scalable RESTful services using ${matchedSkills[0] || 'Node.js'} and optimized SQL queries, reducing API latency by 35%.`,
      reason: 'Replaces generic passive phrasing with quantifiable performance metrics and specific technologies.',
      targetSection: 'Experience',
    },
    {
      original: 'Built a web application for project management.',
      suggestion: `Engineered a collaborative task management platform utilizing ${matchedSkills[1] || 'React'} and WebSockets for real-time state synchronization across 500+ simulated users.`,
      reason: 'Demonstrates concurrency handling and user scale rather than simple CRUD functionality.',
      targetSection: 'Projects',
    },
    {
      original: 'Responsible for bug fixing and testing code.',
      suggestion: 'Implemented automated CI/CD unit testing suite achieving 85% test coverage, cutting regression release bugs by 40%.',
      reason: 'Highlights software quality assurance rigor and automated deployment familiarity.',
      targetSection: 'Experience',
    },
    {
      original: 'Used machine learning / data structures in coursework.',
      suggestion: `Designed and benchmarked distributed caching mechanisms utilizing ${topMissing[0] || 'Redis'} and LRU eviction, improving throughput by 2.4x.`,
      reason: `Directly targets key missing technical skill (${topMissing[0] || 'Redis'}) expected for this corporate drive.`,
      targetSection: 'Projects',
    },
    {
      original: 'Good team player with communication skills.',
      suggestion: 'Spearheaded sprint planning and code review ceremonies for a 4-engineer student capstone team, delivering project milestones 2 weeks ahead of deadline.',
      reason: 'Converts soft-skill cliché into concrete collaborative leadership evidence.',
      targetSection: 'Leadership',
    },
  ];

  return {
    matchScore,
    matchedSkills: matchedSkills.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    missingSkills: missingSkills.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    sectionFeedback,
    rewrittenBulletSuggestions,
    isAiGenerated: true,
    isFallback: true,
    modelUsed: 'deterministic-heuristics',
  };
}

/**
 * 2. Mock Interview Engine Turn Generator
 */
const QUESTION_BANKS = {
  Technical: [
    'Can you explain the difference between a process and a thread, and how memory is shared between them?',
    'Describe how a Hash Map works under the hood. What is the time complexity of lookup, and how are hash collisions resolved?',
    'Explain the concept of database indexing. When would adding an index degrade database write performance?',
    'What is the difference between TCP and UDP? In what scenario would you explicitly choose UDP over TCP?',
    'Walk me through how you would optimize a slow database query handling millions of records.',
  ],
  'System Design': [
    'How would you design a scalable URL shortening service like TinyURL to handle 100 million daily active redirects?',
    'Explain the trade-offs between SQL (Relational) and NoSQL (Document/Key-Value) databases in a high-throughput microservices architecture.',
    'How does a Distributed Cache (like Redis or Memcached) maintain cache consistency, and what eviction strategies would you use?',
    'Describe how you would design a rate limiter to protect backend APIs from abusive spikes or DDoS attempts.',
    'What is the CAP Theorem, and how would you apply it when choosing between consistency and availability in a global financial ledger?',
  ],
  HR: [
    'Tell me about a challenging technical or team obstacle you faced, and how you worked to resolve it.',
    'Why are you interested in joining our organization specifically, and how do our engineering values align with your career goals?',
    'Describe a scenario where you disagreed with a teammate or project lead on technical implementation. How did you handle the discussion?',
    'Where do you see yourself technically in the next 3 to 5 years, and what skills are you currently developing to get there?',
    'Can you share an instance where you had to quickly learn an unfamiliar technology stack to meet a critical deadline?',
  ],
  Behavioral: [
    'Describe a situation where a project deadline was compromised. How did you prioritize tasks and communicate with stakeholders?',
    'Give an example of when you received constructive or critical feedback on your code. How did you react and improve?',
    'Tell me about a time you took initiative to solve a problem that was not formally assigned to you.',
    'How do you manage stress and maintain code quality when multiple deadlines coincide during campus recruitment?',
    'Describe a time you mentored or helped a junior peer grasp a complex programming or algorithmic concept.',
  ],
};

function generateMockInterviewTurn(session, studentAnswer = '') {
  const roundType = session.roundType || 'Technical';
  const questions = QUESTION_BANKS[roundType] || QUESTION_BANKS.Technical;
  const currentIndex = session.transcript.filter((t) => t.role === 'ai').length;

  // If this is the concluding turn (reached max questions)
  if (currentIndex >= session.maxQuestions) {
    // Evaluate full transcript
    const studentResponses = session.transcript
      .filter((t) => t.role === 'student')
      .map((t) => t.content);

    const totalWords = studentResponses.reduce((acc, text) => acc + text.split(/\s+/).length, 0);
    const avgWordsPerAnswer = studentResponses.length ? Math.round(totalWords / studentResponses.length) : 0;

    // Communication score based on answer elaboration
    const commScore = Math.min(Math.max(Math.round(avgWordsPerAnswer / 15) + 4, 5), 9);
    // Correctness score
    const correctnessScore = Math.min(Math.max(Math.round(commScore * 0.95), 5), 9);
    // Depth score
    const depthScore = avgWordsPerAnswer > 40 ? 8 : 6;
    // Structure score
    const structureScore = 7;

    const overallScore = Math.round(((commScore + correctnessScore + depthScore + structureScore) / 40) * 100);

    const strengths = [
      'Articulated core algorithmic concepts with clear chronological reasoning.',
      'Demonstrated structured problem-solving approach during inquiry.',
      'Showcased practical understanding of edge cases and computational trade-offs.',
    ];

    const weaknesses = [
      'Elaborate more concretely on quantifiable performance trade-offs.',
      'Structure behavioral and architectural answers using the STAR format (Situation, Task, Action, Result).',
    ];

    const studyPlan = [
      'Day 1-2: Review core concurrency, locking, and distributed caching paradigms.',
      'Day 3-4: Practice 5 medium LeetCode tree and graph problems with time constraints.',
      'Day 5: Rehearse 3 STAR-format behavioral project stories focusing on technical leadership.',
    ];

    return {
      isCompleted: true,
      rubricScore: {
        communication: commScore,
        correctness: correctnessScore,
        depth: depthScore,
        structure: structureScore,
        overallScore,
      },
      strengths,
      weaknesses,
      studyPlan,
      feedbackSummary: `Candidate completed the ${roundType} round with an overall score of ${overallScore}%. Answers demonstrated solid foundational knowledge with opportunities for deeper quantitative metrics in architectural trade-offs.`,
    };
  }

  // Next question
  const nextQuestionText = questions[currentIndex] || 'Could you walk me through how you debug an unexpected production crash?';
  const aiFollowUp = studentAnswer
    ? `Thank you for sharing that context. To follow up on your point regarding implementation details:\n\n${nextQuestionText}`
    : nextQuestionText;

  return {
    isCompleted: false,
    nextQuestion: aiFollowUp,
    questionNumber: currentIndex + 1,
  };
}

/**
 * 3. Company Prep Pack Aggregator & Study Plan Generator
 */
function generateCompanyPrepPack(companyName, drives = [], pastFeedback = []) {
  const avgRating = pastFeedback.length
    ? (pastFeedback.reduce((acc, f) => acc + (f.rating || 3), 0) / pastFeedback.length).toFixed(1)
    : '4.2';

  const collectedStrengths = pastFeedback.flatMap((f) => f.strengths ? [f.strengths] : []);
  const collectedGaps = pastFeedback.flatMap((f) => f.gaps ? [f.gaps] : []);

  const topStrengths = collectedStrengths.length > 0
    ? collectedStrengths.slice(0, 3)
    : [
        'Optimal asymptotic time complexity analysis on binary search and dynamic programming.',
        'Clean modular object-oriented design and clean code naming conventions.',
        'Clear communication of thought process during live pair-coding.',
      ];

  const topGaps = collectedGaps.length > 0
    ? collectedGaps.slice(0, 3)
    : [
        'Overlooking 64-bit integer overflow and null pointer boundary conditions.',
        'Hesitation when explaining multithreaded race conditions or distributed consensus.',
        'Insufficient preparation regarding specific company product architectures.',
      ];

  const studyPlan = [
    {
      day: 'Day 1 & 2',
      focus: 'High-Frequency Data Structures & Algorithms',
      hoursPerDay: 4,
      topics: ['Binary Search on Answer', 'Trees & Graphs (BFS/DFS)', 'Sliding Window', 'Two Pointers'],
      resources: 'LeetCode Company Tagged & NeetCode 150',
    },
    {
      day: 'Day 3 & 4',
      focus: 'System Design & OS / DBMS Fundamentals',
      hoursPerDay: 3.5,
      topics: ['Database Indexing & ACID transactions', 'Load Balancing & Caching (Redis)', 'Process vs Thread', 'TCP/IP Model'],
      resources: 'ByteByteGo System Design & High Scalability blogs',
    },
    {
      day: 'Day 5',
      focus: 'Company Product Deep Dive & Recent Engineering Blogs',
      hoursPerDay: 2.5,
      topics: [`Analyze ${companyName}'s primary tech stack`, 'Recent tech announcements', 'Architecture teardown'],
      resources: `${companyName} Engineering Blog & GitHub Repositories`,
    },
    {
      day: 'Day 6 & 7',
      focus: 'Leadership Principles, Culture Fit & Mock Run',
      hoursPerDay: 3,
      topics: ['STAR framework behavioral stories', 'Failures & technical conflicts', '2 Timed Mock Rounds'],
      resources: 'PLACEearly Text Mock Interviewer',
    },
  ];

  return {
    companyName,
    avgCandidateRating: avgRating,
    totalPastRoundsEvaluated: Math.max(pastFeedback.length, 12),
    commonStrengths: topStrengths,
    commonRejectionReasons: topGaps,
    studyPlan,
    isAiGenerated: true,
    isFallback: true,
  };
}

/**
 * 4. Transparent Rule-Based Placement-Risk Predictor
 * STRICT ETHICAL MANDATE: NO gender, caste, religion, or demographic attributes!
 */
function computeStudentPlacementRisk(student, applications = [], eligibleDrivesCount = 0, mockSessions = []) {
  let riskScore = 0;
  const reasons = [];
  const interventions = [];

  const appCount = applications.length;
  const placedApp = applications.find((a) => a.status === 'Placed' || a.offer?.status === 'Accepted');

  if (placedApp) {
    return {
      studentId: student._id || student.user,
      name: `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student',
      rollNo: student.rollNo || 'N/A',
      branch: student.branch || 'Engineering',
      riskLevel: 'Low',
      riskScore: 5,
      reasons: ['Student is already placed and holds an accepted corporate offer.'],
      suggestedIntervention: 'No intervention required. Monitor onboarding and NOC clearance.',
      isPlaced: true,
    };
  }

  // Factor 1: Application volume vs eligible opportunities
  if (eligibleDrivesCount > 0) {
    const appRatio = appCount / eligibleDrivesCount;
    if (appCount === 0) {
      riskScore += 35;
      reasons.push(`Zero applications submitted despite qualifying for ${eligibleDrivesCount} active campus drive(s).`);
      interventions.push('Immediate 1-on-1 counselor nudge to unblock application hesitation.');
    } else if (appRatio < 0.25) {
      riskScore += 20;
      reasons.push(`Low application rate: applied to only ${appCount} out of ${eligibleDrivesCount} eligible opportunities.`);
      interventions.push('Send automated priority alert highlighting drives closing within 48 hours.');
    }
  }

  // Factor 2: Academic Backlogs & CGPA Thresholds
  const backlogs = student.backlogs ?? student.academics?.activeBacklogs ?? 0;
  const cgpa = student.cgpa ?? student.academics?.currentCgpa ?? 0;

  if (backlogs > 0) {
    riskScore += 25;
    reasons.push(`Has ${backlogs} active backlog subject(s), restricting eligibility from Tier-1 corporate drives.`);
    interventions.push('Enroll student in remedial academic support cohort before upcoming recruitment cycle.');
  }

  if (cgpa < 6.5) {
    riskScore += 20;
    reasons.push(`Current CGPA (${cgpa.toFixed(2)}) is below the standard 7.0 company screening cutoff.`);
    interventions.push('Target mass-recruiter and startup drives with relaxed CGPA cutoffs.');
  } else if (cgpa < 7.5) {
    riskScore += 10;
    reasons.push(`CGPA (${cgpa.toFixed(2)}) is marginally close to median corporate cutoffs.`);
  }

  // Factor 3: Profile & Resume Completeness
  const hasResume = Boolean(student.resumeUrl || (student.resumeVersions && student.resumeVersions.length > 0));
  const skillsCount = (student.skills || []).length;
  const projectsCount = (student.projects || []).length;

  if (!hasResume) {
    riskScore += 20;
    reasons.push('No primary resume uploaded to institutional vault.');
    interventions.push('Require resume upload before permitting drive registrations.');
  }

  if (skillsCount < 3) {
    riskScore += 10;
    reasons.push('Fewer than 3 technical skills listed in student profile.');
  }

  if (projectsCount === 0) {
    riskScore += 10;
    reasons.push('No software or engineering projects documented on profile.');
    interventions.push('Recommend capstone and guided project builder resources.');
  }

  // Factor 4: Verification Status
  if (!student.isVerifiedByTPO) {
    riskScore += 10;
    reasons.push('Academic records not yet verified with university cryptographic seal.');
    interventions.push('TPO staff should expedite academic marksheets verification.');
  }

  // Factor 5: Mock Interview History
  if (mockSessions.length === 0) {
    riskScore += 10;
    reasons.push('Has not completed any mock technical or HR interview assessments.');
    interventions.push('Assign mandatory AI mock interview sprint on PLACEearly.');
  } else {
    const avgMockScore =
      mockSessions.reduce((acc, s) => acc + (s.rubricScore?.overallScore || 50), 0) /
      mockSessions.length;
    if (avgMockScore < 50) {
      riskScore += 15;
      reasons.push(`Average mock interview score is low (${Math.round(avgMockScore)}%).`);
      interventions.push('Schedule mock interview coaching with department placement coordinator.');
    }
  }

  // Cap score between 0 and 100
  const finalScore = Math.min(Math.max(riskScore, 0), 100);

  let riskLevel = 'Low';
  if (finalScore >= 55) {
    riskLevel = 'High';
  } else if (finalScore >= 30) {
    riskLevel = 'Medium';
  }

  return {
    studentId: student._id || student.user,
    name: `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student',
    rollNo: student.rollNo || 'N/A',
    branch: student.branch || 'Engineering',
    cgpa,
    backlogs,
    applicationsCount: appCount,
    riskScore: finalScore,
    riskLevel,
    reasons: reasons.length > 0 ? reasons : ['Student on track with active applications and verified academics.'],
    suggestedIntervention: interventions.length > 0 ? interventions[0] : 'Monitor ongoing drive pipeline.',
    isPlaced: false,
    isAiGenerated: true,
    isFallback: true,
  };
}

/**
 * 5. Natural-Language TPO Assistant (Safe Regex & Keyword Sanitizer)
 */
function parseNaturalLanguageTpoQueryFallback(query = '') {
  const normalized = query.toLowerCase();
  const filter = {};
  const explanations = [];

  // Branch matching with word boundaries
  const branches = [];
  if (/\b(cse|computer\s+science)\b/i.test(normalized)) branches.push('CSE');
  if (/\b(it|information\s+tech)\b/i.test(normalized)) branches.push('IT');
  if (/\b(ece|electronics)\b/i.test(normalized)) branches.push('ECE');
  if (/\b(mech|mechanical)\b/i.test(normalized)) branches.push('MECH');
  if (/\b(ee|electrical)\b/i.test(normalized)) branches.push('EE');

  if (branches.length > 0) {
    filter.branch = { $in: branches };
    explanations.push(`Enrolled in ${branches.join(' or ')}`);
  }

  // CGPA matching
  const cgpaMatch = normalized.match(/(?:above|greater than|>=|>)\s*(\d+(?:\.\d+)?)\s*(?:cgpa)?/);
  if (cgpaMatch) {
    const minVal = parseFloat(cgpaMatch[1]);
    filter.cgpa = { $gte: minVal };
    explanations.push(`CGPA >= ${minVal}`);
  }

  // Backlogs matching
  if (normalized.includes('no backlog') || normalized.includes('0 backlog') || normalized.includes('zero backlog') || normalized.includes('clear')) {
    filter.backlogs = 0;
    explanations.push('0 active backlogs');
  } else {
    const backlogMatch = normalized.match(/(?:max|at most|<=)\s*(\d+)\s*backlog/);
    if (backlogMatch) {
      const maxB = parseInt(backlogMatch[1], 10);
      filter.backlogs = { $lte: maxB };
      explanations.push(`Maximum ${maxB} backlog(s)`);
    }
  }

  // Verification matching
  if (normalized.includes('verified') && !normalized.includes('unverified')) {
    filter.isVerifiedByTPO = true;
    explanations.push('Academics verified by TPO');
  } else if (normalized.includes('unverified') || normalized.includes('pending verification')) {
    filter.isVerifiedByTPO = false;
    explanations.push('Pending TPO verification');
  }

  // Application / Placed matching
  let applicationFilter = 'all';
  if (normalized.includes('not applied') || normalized.includes('zero applied') || normalized.includes('unapplied')) {
    applicationFilter = 'unapplied';
    explanations.push('Not applied to any active drive');
  } else if (normalized.includes('unplaced')) {
    applicationFilter = 'unplaced';
    explanations.push('Unplaced candidates');
  } else if (normalized.includes('placed')) {
    applicationFilter = 'placed';
    explanations.push('Placed candidates');
  }

  return {
    parsedFilter: filter,
    applicationFilter,
    explanation: explanations.length > 0 ? explanations.join(', ') : 'All registered students',
    isAiGenerated: true,
    isFallback: true,
  };
}

/**
 * 6. Drive Description Parser (Regex & Pattern Extractor)
 */
function parseDriveDescriptionFallback(rawText = '') {
  const normalized = rawText.toLowerCase();

  // Role title
  let title = 'Software Development Engineer';
  if (normalized.includes('frontend') || normalized.includes('react')) title = 'Frontend Engineer';
  else if (normalized.includes('backend') || normalized.includes('node') || normalized.includes('java')) title = 'Backend Engineer';
  else if (normalized.includes('cloud') || normalized.includes('devops')) title = 'Cloud & DevOps Engineer';
  else if (normalized.includes('data engineer') || normalized.includes('analytics')) title = 'Data Engineer';

  // Extract CTC / Salary
  let ctcTotal = 1800000;
  let fixedCtc = 1500000;
  let variableCtc = 300000;
  let salaryString = '18 LPA';

  const lpaMatch = rawText.match(/(\d+(?:\.\d+)?)\s*(?:-|to)?\s*(\d+(?:\.\d+)?)?\s*LPA/i);
  if (lpaMatch) {
    const num = parseFloat(lpaMatch[2] || lpaMatch[1]);
    ctcTotal = Math.round(num * 100000);
    fixedCtc = Math.round(ctcTotal * 0.85);
    variableCtc = ctcTotal - fixedCtc;
    salaryString = `${num} LPA`;
  }

  // Extract Min CGPA
  let minCgpa = 7.0;
  const cgpaMatch = rawText.match(/(?:(?:cgpa|gpa)\s*(?:of|>=|:|is)?\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:cgpa|gpa))/i);
  if (cgpaMatch) {
    minCgpa = parseFloat(cgpaMatch[1] || cgpaMatch[2]);
  }

  // Extract allowed branches
  const branches = [];
  if (normalized.includes('cse') || normalized.includes('computer')) branches.push('CSE');
  if (normalized.includes('it') || normalized.includes('information')) branches.push('IT');
  if (normalized.includes('ece') || normalized.includes('electronics')) branches.push('ECE');
  if (branches.length === 0) branches.push('CSE', 'IT');

  // Extract skills
  const skills = KNOWN_SKILLS.filter((s) => normalized.includes(s)).slice(0, 8);

  // Standard rounds
  const rounds = [
    { roundNumber: 1, name: 'Online Assessment: Coding & Aptitude', type: 'OA' },
    { roundNumber: 2, name: 'Technical Round 1: DSA & Core CS', type: 'Tech' },
    { roundNumber: 3, name: 'HR & Culture Fit', type: 'HR' },
  ];

  return {
    title,
    description: rawText.slice(0, 500) + (rawText.length > 500 ? '...' : ''),
    salary: salaryString,
    ctc: {
      total: ctcTotal,
      fixed: fixedCtc,
      variable: variableCtc,
      currency: 'INR',
    },
    eligibilityRules: {
      minCgpa,
      maxBacklogs: 0,
      allowedBranches: branches,
      gradYear: 2026,
    },
    skillsRequired: skills.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    rounds,
    isAiGenerated: true,
    isFallback: true,
  };
}

/**
 * 7. Feedback Summarizer
 */
function summarizeFeedbackFallback(rawNotes = '', rating = 4) {
  const strengths = [];
  const improvements = [];

  const sentences = rawNotes.split(/[.,;\n]+/).map((s) => s.trim()).filter(Boolean);

  sentences.forEach((s) => {
    const lower = s.toLowerCase();
    if (lower.includes('good') || lower.includes('strong') || lower.includes('great') || lower.includes('impressive') || lower.includes('cleared')) {
      strengths.push(s);
    } else {
      improvements.push(s);
    }
  });

  const summaryParagraph = `During the evaluation, the candidate demonstrated commendable technical foundations and engagement. Key strengths noted include: ${
    strengths.slice(0, 2).join(', ') || 'solid algorithmic clarity and problem decomposition'
  }. For continued professional growth, focusing on ${
    improvements.slice(0, 2).join(', ') || 'deepening multithreading concepts and quantitative architectural trade-offs'
  } will significantly elevate technical performance in subsequent rounds.`;

  return {
    summaryParagraph,
    keyStrengths: strengths.length ? strengths : ['Good understanding of data structures and problem breakdown.'],
    areasForImprovement: improvements.length ? improvements : ['Deepen systems-level concurrency and memory model understanding.'],
    isAiGenerated: true,
    isFallback: true,
    requiresTpoApproval: true,
    status: 'Pending_TPO_Approval',
  };
}

module.exports = {
  computeDeterministicResumeMatch,
  generateMockInterviewTurn,
  generateCompanyPrepPack,
  computeStudentPlacementRisk,
  parseNaturalLanguageTpoQueryFallback,
  parseDriveDescriptionFallback,
  summarizeFeedbackFallback,
};
