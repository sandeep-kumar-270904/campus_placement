// Centralized Placement Management Engine & Store
// Provides live synchronous state persistence across Student and TPO dashboards

const STORAGE_KEY = 'placeearly_platform_store_v1';

const INITIAL_DATA = {
  opportunities: [
    {
      id: 'opp_1',
      title: 'Software Engineering Intern',
      companyName: 'Google',
      companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
      type: 'Internship',
      location: 'Bangalore, India',
      salary: '₹1.2L / month',
      stipendOrCtc: '1.2L/mo',
      deadline: '2026-10-28',
      description: 'Join Google core infrastructure and cloud engineering teams. You will collaborate on distributed systems, modern web microservices, and AI-assisted workflows.',
      eligibilityRules: {
        minCgpa: 8.0,
        maxBacklogs: 0,
        allowedBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm']
      },
      status: 'Open',
      applicantsCount: 42
    },
    {
      id: 'opp_2',
      title: 'Backend Systems Engineer',
      companyName: 'Microsoft',
      companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
      type: 'Job',
      location: 'Hyderabad, India',
      salary: '44 LPA',
      stipendOrCtc: '44 LPA',
      deadline: '2026-11-02',
      description: 'Develop scalable Azure cloud and distributed services powering global enterprise workflows. Experience with C#, Java, Go, or Rust is highly appreciated.',
      eligibilityRules: {
        minCgpa: 8.5,
        maxBacklogs: 0,
        allowedBranches: ['Computer Science', 'Information Technology']
      },
      status: 'Open',
      applicantsCount: 28
    },
    {
      id: 'opp_3',
      title: 'Frontend Developer',
      companyName: 'Vercel',
      companyLogo: 'https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png',
      type: 'Job',
      location: 'Remote (Global)',
      salary: '24 LPA',
      stipendOrCtc: '24 LPA',
      deadline: '2026-10-31',
      description: 'Build fast, delightful developer tooling and web platforms with Next.js, React, and modern TypeScript.',
      eligibilityRules: {
        minCgpa: 7.0,
        maxBacklogs: 1,
        allowedBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm', 'Mechanical']
      },
      status: 'Open',
      applicantsCount: 65
    },
    {
      id: 'opp_4',
      title: 'Data & Analytics Specialist',
      companyName: 'Amazon',
      companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
      type: 'Job',
      location: 'Bangalore / Hyderabad',
      salary: '28 LPA',
      stipendOrCtc: '28 LPA',
      deadline: '2026-11-10',
      description: 'Analyze multi-petabyte datasets across AWS cloud and retail logistics to optimize supply chain pipelines.',
      eligibilityRules: {
        minCgpa: 7.5,
        maxBacklogs: 0,
        allowedBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm']
      },
      status: 'Open',
      applicantsCount: 51
    },
    {
      id: 'opp_5',
      title: 'Site Reliability Engineer',
      companyName: 'Atlassian',
      companyLogo: 'https://wac-cdn.atlassian.com/assets/img/favicons/atlassian/favicon.png',
      type: 'Job',
      location: 'Bangalore, India',
      salary: '32 LPA',
      stipendOrCtc: '32 LPA',
      deadline: '2026-11-15',
      description: 'Maintain and scale mission-critical collaboration tools like Jira, Confluence, and Bitbucket with 99.99% uptime.',
      eligibilityRules: {
        minCgpa: 7.2,
        maxBacklogs: 0,
        allowedBranches: ['Computer Science', 'Information Technology']
      },
      status: 'Open',
      applicantsCount: 34
    }
  ],
  applications: [
    {
      id: 'app_1',
      opportunityId: 'opp_1',
      studentEmail: 'student@university.edu',
      studentName: 'Alex Mercer',
      studentRollNo: 'CS2026-08',
      branch: 'Computer Science',
      cgpa: 8.8,
      status: 'Shortlisted',
      currentRound: 'Technical Interview 1',
      appliedAt: '2026-10-10'
    },
    {
      id: 'app_2',
      opportunityId: 'opp_4',
      studentEmail: 'student@university.edu',
      studentName: 'Alex Mercer',
      studentRollNo: 'CS2026-08',
      branch: 'Computer Science',
      cgpa: 8.8,
      status: 'Under Review',
      currentRound: 'Resume Screening',
      appliedAt: '2026-10-12'
    },
    {
      id: 'app_3',
      opportunityId: 'opp_3',
      studentEmail: 'priya.patel@university.edu',
      studentName: 'Priya Patel',
      studentRollNo: 'IT2026-42',
      branch: 'Information Technology',
      cgpa: 8.1,
      status: 'Offer Extended',
      currentRound: 'HR Final Round Cleared',
      appliedAt: '2026-10-04'
    },
    {
      id: 'app_4',
      opportunityId: 'opp_1',
      studentEmail: 'rahul.s@university.edu',
      studentName: 'Rahul Sharma',
      studentRollNo: 'CS2026-01',
      branch: 'Computer Science',
      cgpa: 8.75,
      status: 'In Review',
      currentRound: 'Online Coding Assessment',
      appliedAt: '2026-10-11'
    }
  ],
  students: [
    {
      id: 'stu_1',
      name: 'Rahul Sharma',
      email: 'rahul.s@university.edu',
      rollNo: 'CS2026-01',
      branch: 'Computer Science',
      cgpa: 8.75,
      backlogs: 0,
      gradYear: 2026,
      isVerified: true,
      resumeUrl: 'https://drive.google.com/file/d/sample-resume-1',
      placedCompany: 'Google (In Progress)'
    },
    {
      id: 'stu_2',
      name: 'Priya Patel',
      email: 'priya.patel@university.edu',
      rollNo: 'IT2026-42',
      branch: 'Information Technology',
      cgpa: 8.10,
      backlogs: 0,
      gradYear: 2026,
      isVerified: true,
      resumeUrl: 'https://drive.google.com/file/d/sample-resume-2',
      placedCompany: 'Vercel (Offered - 24 LPA)'
    },
    {
      id: 'stu_3',
      name: 'Amit Kumar',
      email: 'amit.k@university.edu',
      rollNo: 'EC2026-11',
      branch: 'Electronics & Comm',
      cgpa: 7.40,
      backlogs: 1,
      gradYear: 2026,
      isVerified: false,
      resumeUrl: 'https://drive.google.com/file/d/sample-resume-3',
      placedCompany: 'Not Placed'
    },
    {
      id: 'stu_4',
      name: 'Sneha Reddy',
      email: 'sneha.r@university.edu',
      rollNo: 'CS2026-89',
      branch: 'Computer Science',
      cgpa: 9.15,
      backlogs: 0,
      gradYear: 2026,
      isVerified: false,
      resumeUrl: 'https://drive.google.com/file/d/sample-resume-4',
      placedCompany: 'Not Placed'
    },
    {
      id: 'stu_5',
      name: 'Vikram Joshi',
      email: 'vikram.j@university.edu',
      rollNo: 'ME2026-15',
      branch: 'Mechanical',
      cgpa: 7.80,
      backlogs: 0,
      gradYear: 2026,
      isVerified: false,
      resumeUrl: 'https://drive.google.com/file/d/sample-resume-5',
      placedCompany: 'Not Placed'
    }
  ],
  notifications: [
    {
      id: 'notif_1',
      title: 'Google Drive Announced',
      message: 'Google SDE Intern registration deadline closes in 48 hours.',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 'notif_2',
      title: 'Application Shortlisted',
      message: 'Your application for Google Software Engineering Intern has advanced to Technical Interview 1.',
      time: 'Yesterday',
      unread: true
    },
    {
      id: 'notif_3',
      title: 'Verification Status',
      message: 'TPO has scheduled document reviews for 2026 graduation candidates.',
      time: '3 days ago',
      unread: false
    }
  ]
};

// Load or initialize store from LocalStorage
export const getStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading placement store', e);
    return INITIAL_DATA;
  }
};

export const setStore = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed saving placement store', e);
  }
};

// =======================
// OPPORTUNITY ACTIONS
// =======================
export const getOpportunities = () => {
  const store = getStore();
  return store.opportunities || [];
};

export const createOpportunity = (oppData) => {
  const store = getStore();
  const newOpp = {
    id: 'opp_' + Date.now(),
    ...oppData,
    applicantsCount: 0,
    status: 'Open'
  };
  store.opportunities.unshift(newOpp);
  
  // Create platform announcement notification
  store.notifications.unshift({
    id: 'notif_' + Date.now(),
    title: `New Drive: ${newOpp.companyName}`,
    message: `${newOpp.title} (${newOpp.salary}) has been published. Check your eligibility now!`,
    time: 'Just now',
    unread: true
  });

  setStore(store);
  return newOpp;
};

export const toggleOpportunityStatus = (oppId) => {
  const store = getStore();
  const opp = store.opportunities.find(o => o.id === oppId);
  if (opp) {
    opp.status = opp.status === 'Open' ? 'Closed' : 'Open';
    setStore(store);
  }
  return opp;
};

// =======================
// APPLICATION ENGINE
// =======================
export const checkEligibility = (opportunity, studentProfile) => {
  if (!studentProfile) {
    return { isEligible: false, reason: 'Profile incomplete. Please set up your academic profile.' };
  }

  if (!studentProfile.isVerified) {
    return { isEligible: false, reason: 'Profile pending TPO verification. Please wait for TPO approval.' };
  }

  const { minCgpa, maxBacklogs, allowedBranches } = opportunity.eligibilityRules;

  if (minCgpa !== undefined && (studentProfile.cgpa || 0) < minCgpa) {
    return { 
      isEligible: false, 
      reason: `CGPA requirement not met (Required: ${minCgpa}, Current: ${studentProfile.cgpa || 0})` 
    };
  }

  if (maxBacklogs !== undefined && (studentProfile.backlogs || 0) > maxBacklogs) {
    return { 
      isEligible: false, 
      reason: `Backlog criteria exceeded (Allowed: ${maxBacklogs}, Current: ${studentProfile.backlogs || 0})` 
    };
  }

  if (allowedBranches && allowedBranches.length > 0) {
    const studentBranch = studentProfile.branch || '';
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

  return { isEligible: true, reason: 'Eligible for this opportunity!' };
};

export const applyToOpportunity = (opportunityId, studentUser, studentProfile) => {
  const store = getStore();
  const opp = store.opportunities.find(o => o.id === opportunityId);
  if (!opp) throw new Error('Opportunity not found');

  // Check if already applied
  const existingApp = store.applications.find(a => 
    a.opportunityId === opportunityId && 
    (a.studentEmail === studentUser.email || a.studentEmail === studentProfile?.email)
  );
  if (existingApp) {
    throw new Error('You have already applied to this drive.');
  }

  // Check eligibility
  const eligibility = checkEligibility(opp, studentProfile);
  if (!eligibility.isEligible) {
    throw new Error(eligibility.reason);
  }

  const newApp = {
    id: 'app_' + Date.now(),
    opportunityId,
    studentEmail: studentUser.email,
    studentName: `${studentUser.firstName} ${studentUser.lastName}`,
    studentRollNo: studentProfile.rollNo || 'CS2026-XX',
    branch: studentProfile.branch || 'Computer Science',
    cgpa: studentProfile.cgpa || 8.5,
    status: 'Under Review',
    currentRound: 'Application Review',
    appliedAt: new Date().toISOString().split('T')[0]
  };

  store.applications.unshift(newApp);
  opp.applicantsCount = (opp.applicantsCount || 0) + 1;

  // Add notification
  store.notifications.unshift({
    id: 'notif_' + Date.now(),
    title: 'Application Submitted!',
    message: `Your application for ${opp.companyName} (${opp.title}) was received.`,
    time: 'Just now',
    unread: true
  });

  setStore(store);
  return newApp;
};

export const getMyApplications = (userEmail) => {
  const store = getStore();
  return store.applications
    .filter(a => !userEmail || a.studentEmail === userEmail || a.studentEmail === 'student@university.edu')
    .map(a => {
      const opp = store.opportunities.find(o => o.id === a.opportunityId) || {};
      return { ...a, opportunity: opp };
    });
};

export const getAllApplications = () => {
  const store = getStore();
  return store.applications.map(a => {
    const opp = store.opportunities.find(o => o.id === a.opportunityId) || {};
    return { ...a, opportunity: opp };
  });
};

export const updateApplicationStatus = (appId, newStatus, currentRound) => {
  const store = getStore();
  const app = store.applications.find(a => a.id === appId);
  if (app) {
    app.status = newStatus;
    if (currentRound) app.currentRound = currentRound;

    // If placed, update student record
    if (newStatus === 'Offer Extended' || newStatus === 'Placed') {
      const student = store.students.find(s => s.email === app.studentEmail);
      const opp = store.opportunities.find(o => o.id === app.opportunityId);
      if (student && opp) {
        student.placedCompany = `${opp.companyName} (${opp.salary})`;
      }
    }

    setStore(store);
  }
  return app;
};

// =======================
// STUDENT PROFILE & VERIFICATION
// =======================
export const getStudentProfile = (user) => {
  const store = getStore();
  let student = store.students.find(s => s.email === user?.email);
  if (!student) {
    // create default student entry
    student = {
      id: 'stu_' + (user?.id || 'current'),
      name: `${user?.firstName || 'Student'} ${user?.lastName || ''}`.trim(),
      email: user?.email || 'student@university.edu',
      rollNo: 'CS2026-08',
      branch: 'Computer Science',
      cgpa: 8.85,
      backlogs: 0,
      gradYear: 2026,
      isVerified: true, // Auto-verified for instant trial / demo
      degree: 'B.Tech Computer Science',
      resumeUrl: 'https://drive.google.com/file/d/alex-mercer-resume-2026',
      skills: ['React', 'Node.js', 'MongoDB', 'Python', 'Docker', 'System Design'],
      placedCompany: 'Not Placed'
    };
    store.students.push(student);
    setStore(store);
  }
  return student;
};

export const updateStudentProfile = (user, profileData) => {
  const store = getStore();
  let student = store.students.find(s => s.email === user?.email);
  if (!student) {
    student = { id: 'stu_' + Date.now(), email: user?.email };
    store.students.push(student);
  }

  Object.assign(student, profileData);
  // Re-trigger verification when student changes critical academic data
  student.isVerified = profileData.isVerified !== undefined ? profileData.isVerified : false;

  setStore(store);
  return student;
};

export const getStudents = () => {
  const store = getStore();
  return store.students || [];
};

export const verifyStudentProfile = (studentId, isVerified) => {
  const store = getStore();
  const student = store.students.find(s => s.id === studentId);
  if (student) {
    student.isVerified = isVerified;
    setStore(store);
  }
  return student;
};

// =======================
// ANALYTICS ENGINE
// =======================
export const getPlatformAnalytics = () => {
  const store = getStore();
  const totalStudents = store.students.length;
  const verifiedStudents = store.students.filter(s => s.isVerified).length;
  const activeDrives = store.opportunities.filter(o => o.status === 'Open').length;
  const totalApplications = store.applications.length;
  const placedApplications = store.applications.filter(a => a.status === 'Offer Extended' || a.status === 'Placed').length;

  return {
    totalStudents,
    verifiedStudents,
    verifiedRate: Math.round((verifiedStudents / (totalStudents || 1)) * 100),
    activeDrives,
    totalApplications,
    placedCount: placedApplications + 142, // Includes mock cohort history
    averagePackage: '14.8 LPA',
    highestPackage: '44 LPA (Microsoft)',
    placementPercentage: '86%'
  };
};

export const getNotifications = () => {
  const store = getStore();
  return store.notifications || [];
};

export const markNotificationsAsRead = () => {
  const store = getStore();
  store.notifications.forEach(n => n.unread = false);
  setStore(store);
  return store.notifications;
};
