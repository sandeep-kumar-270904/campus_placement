import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Users, Building, ShieldCheck, PieChart, Bell, Search, 
  Plus, Download, ExternalLink, X,
  Calendar, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getOpportunities,
  createOpportunity,
  toggleOpportunityStatus,
  getAllApplications,
  updateApplicationStatus,
  getStudents,
  verifyStudentProfile,
  getPlatformAnalytics,
  getNotifications,
  markNotificationsAsRead
} from '../services/placementStore';

const TpoDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Modals
  const [isNewDriveModalOpen, setIsNewDriveModalOpen] = useState(false);
  const [previewResumeUrl, setPreviewResumeUrl] = useState(null);
  const [scheduleModalApplicant, setScheduleModalApplicant] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    roundName: 'Technical Interview 1',
    date: '2026-10-30',
    time: '14:00',
    venue: 'Google Meet (https://meet.google.com/abc-defg-hij)',
    instructions: 'Please be ready with your coding IDE and camera turned on.'
  });

  // Bulk Selection
  const [selectedAppIds, setSelectedAppIds] = useState([]);

  // New Drive Form
  const [newDriveForm, setNewDriveForm] = useState({
    title: '',
    companyName: '',
    companyLogo: '',
    type: 'Job',
    location: 'Bangalore, India',
    salary: '20 LPA',
    deadline: '2026-11-20',
    description: '',
    minCgpa: 7.5,
    maxBacklogs: 0,
    allowedBranches: 'Computer Science, Information Technology'
  });

  // Search & Filter States
  const [verificationSearch, setVerificationSearch] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('All');
  const [pipelineSearch, setPipelineSearch] = useState('');
  const [pipelineDriveFilter, setPipelineDriveFilter] = useState('All');

  // Refresh from store
  const refreshData = () => {
    setOpportunities(getOpportunities());
    setApplications(getAllApplications());
    setStudents(getStudents());
    setAnalytics(getPlatformAnalytics());
    setNotifications(getNotifications());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Verify / Reject Student Profile
  const handleVerifyStudent = (studentId, isVerified) => {
    verifyStudentProfile(studentId, isVerified);
    refreshData();
  };

  // Toggle Drive Status (Open/Closed)
  const handleToggleDrive = (oppId) => {
    toggleOpportunityStatus(oppId);
    refreshData();
  };

  // Update applicant recruitment stage
  const handleAdvanceApplicant = (appId, newStatus, currentRound) => {
    updateApplicationStatus(appId, newStatus, currentRound);
    refreshData();
  };

  // Schedule Interview Round Submit
  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!scheduleModalApplicant) return;

    updateApplicationStatus(
      scheduleModalApplicant.id, 
      'Shortlisted', 
      `${scheduleForm.roundName} (${scheduleForm.date} ${scheduleForm.time})`
    );

    alert(`✅ Interview scheduled for ${scheduleModalApplicant.studentName}!\nRound: ${scheduleForm.roundName}\nVenue: ${scheduleForm.venue}`);
    setScheduleModalApplicant(null);
    refreshData();
  };

  // Bulk Status Update
  const handleBulkAdvance = (targetStatus, targetRound) => {
    if (selectedAppIds.length === 0) return;
    selectedAppIds.forEach(id => {
      updateApplicationStatus(id, targetStatus, targetRound);
    });
    alert(`🎉 Successfully updated ${selectedAppIds.length} candidate(s) to "${targetStatus}"!`);
    setSelectedAppIds([]);
    refreshData();
  };

  // Create New Drive Submit
  const handleCreateDriveSubmit = (e) => {
    e.preventDefault();
    createOpportunity({
      title: newDriveForm.title,
      companyName: newDriveForm.companyName,
      companyLogo: newDriveForm.companyLogo || 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
      type: newDriveForm.type,
      location: newDriveForm.location,
      salary: newDriveForm.salary,
      deadline: newDriveForm.deadline,
      description: newDriveForm.description || `Drive for ${newDriveForm.companyName} open for qualifying candidates.`,
      eligibilityRules: {
        minCgpa: parseFloat(newDriveForm.minCgpa),
        maxBacklogs: parseInt(newDriveForm.maxBacklogs, 10),
        allowedBranches: newDriveForm.allowedBranches.split(',').map(b => b.trim()).filter(Boolean)
      }
    });

    setIsNewDriveModalOpen(false);
    refreshData();
    alert(`🎉 Placement drive for ${newDriveForm.companyName} created successfully!`);
    setNewDriveForm({
      title: '',
      companyName: '',
      companyLogo: '',
      type: 'Job',
      location: 'Bangalore, India',
      salary: '20 LPA',
      deadline: '2026-11-20',
      description: '',
      minCgpa: 7.5,
      maxBacklogs: 0,
      allowedBranches: 'Computer Science, Information Technology'
    });
  };

  // Export Applicants to CSV
  const handleExportCSV = () => {
    const headers = ['Student Name', 'Roll No', 'Branch', 'CGPA', 'Company', 'Role', 'Status', 'Current Round', 'Applied Date'];
    const rows = applications.map(a => [
      `"${a.studentName}"`,
      `"${a.studentRollNo}"`,
      `"${a.branch}"`,
      a.cgpa,
      `"${a.opportunity?.companyName || ''}"`,
      `"${a.opportunity?.title || ''}"`,
      `"${a.status}"`,
      `"${a.currentRound}"`,
      `"${a.appliedAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `placement_candidates_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Students for Verification
  const pendingVerifications = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(verificationSearch.toLowerCase()) ||
                          s.rollNo.toLowerCase().includes(verificationSearch.toLowerCase()) ||
                          s.branch.toLowerCase().includes(verificationSearch.toLowerCase());
    const matchesFilter = verificationFilter === 'All' || 
      (verificationFilter === 'Pending' && !s.isVerified) ||
      (verificationFilter === 'Verified' && s.isVerified);
    return matchesSearch && matchesFilter;
  });

  // Filtered Pipeline Applications
  const filteredPipeline = applications.filter(app => {
    const matchesSearch = app.studentName.toLowerCase().includes(pipelineSearch.toLowerCase()) ||
                          app.studentRollNo.toLowerCase().includes(pipelineSearch.toLowerCase()) ||
                          (app.opportunity?.companyName || '').toLowerCase().includes(pipelineSearch.toLowerCase());
    const matchesDrive = pipelineDriveFilter === 'All' || app.opportunityId === pipelineDriveFilter;
    return matchesSearch && matchesDrive;
  });

  const pendingCount = students.filter(s => !s.isVerified).length;
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col">
      {/* Top Header */}
      <header className="bg-mongo-dark border-b border-gray-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-[1416px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-mongo-green rounded-md flex items-center justify-center">
              <span className="text-mongo-dark font-bold text-xl font-display">P</span>
            </div>
            <span className="text-xl font-display font-bold text-white tracking-tight">
              PLACEearly <span className="text-mongo-green text-xs font-bold uppercase tracking-wider bg-mongo-green/20 px-2 py-0.5 rounded ml-1">TPO Portal</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Trigger */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markNotificationsAsRead();
                }}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 relative transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-mongo-green rounded-full border-2 border-mongo-dark"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 text-gray-900"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <h4 className="font-bold text-gray-900 text-sm">Placement Office Alerts</h4>
                      <span className="text-xs text-mongo-green-dark font-semibold">TPO System</span>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto mt-2">
                      {notifications.map(n => (
                        <div key={n.id} className="py-3 flex gap-3 text-left">
                          <div className="w-2 h-2 rounded-full bg-mongo-green mt-1.5 flex-shrink-0"></div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">{n.title}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">{n.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-700">
              <div className="text-sm text-right hidden sm:block">
                <p className="font-semibold text-white">{user?.firstName || 'TPO'} {user?.lastName || 'Director'}</p>
                <p className="text-xs text-mongo-green font-medium capitalize">Placement Officer</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-mongo-green border border-gray-700 font-bold">
                {(user?.firstName?.charAt(0) || 'T').toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-[1416px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8 flex-1 w-full">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 flex-shrink-0 h-[calc(100vh-8rem)] sticky top-24">
          <nav className="space-y-2 flex-1">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'overview' 
                  ? 'bg-mongo-dark text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <PieChart className={`${activeTab === 'overview' ? 'text-mongo-green' : 'text-gray-400 group-hover:text-gray-600'} mr-3 flex-shrink-0 h-5 w-5`} />
              Overview
            </button>

            <button 
              onClick={() => setActiveTab('verifications')}
              className={`w-full group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all justify-between ${
                activeTab === 'verifications' 
                  ? 'bg-mongo-dark text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <ShieldCheck className={`${activeTab === 'verifications' ? 'text-mongo-green' : 'text-gray-400 group-hover:text-gray-600'} mr-3 flex-shrink-0 h-5 w-5`} />
                Verifications
              </div>
              {pendingCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === 'verifications' ? 'bg-mongo-green text-mongo-dark' : 'bg-red-100 text-red-600'
                }`}>
                  {pendingCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('companies')}
              className={`w-full group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'companies' 
                  ? 'bg-mongo-dark text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Building className={`${activeTab === 'companies' ? 'text-mongo-green' : 'text-gray-400 group-hover:text-gray-600'} mr-3 flex-shrink-0 h-5 w-5`} />
              Companies & Drives
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${activeTab === 'companies' ? 'bg-mongo-green text-mongo-dark' : 'bg-gray-200 text-gray-700'}`}>
                {opportunities.length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('students')}
              className={`w-full group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'students' 
                  ? 'bg-mongo-dark text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className={`${activeTab === 'students' ? 'text-mongo-green' : 'text-gray-400 group-hover:text-gray-600'} mr-3 flex-shrink-0 h-5 w-5`} />
              Applicant Pipeline
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${activeTab === 'students' ? 'bg-mongo-green text-mongo-dark' : 'bg-gray-200 text-gray-700'}`}>
                {applications.length}
              </span>
            </button>
          </nav>
          
          <div className="mt-auto pt-6 border-t border-gray-200 space-y-3">
            <button 
              onClick={() => setIsNewDriveModalOpen(true)}
              className="w-full py-2.5 px-4 bg-mongo-green text-mongo-dark text-sm font-bold rounded-xl hover:bg-[#00E05B] transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Post Placement Drive
            </button>

            <button 
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-50 group flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-colors w-full"
            >
              <LogOut className="text-red-500 mr-3 flex-shrink-0 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-12">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-gray-900">Placement Command Center</h1>
                  <p className="text-sm text-gray-500 mt-1">Live metrics and hiring funnel for the 2026 graduation cohort.</p>
                </div>
                <button 
                  onClick={() => setIsNewDriveModalOpen(true)}
                  className="bg-mongo-dark text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-md flex items-center gap-2 w-max"
                >
                  <Plus className="w-4 h-4 text-mongo-green" />
                  + New Placement Drive
                </button>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gray-50 rounded-bl-full group-hover:bg-mongo-green/10 transition-colors"></div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Students</p>
                  <p className="text-3xl font-display font-bold text-mongo-dark mb-1">{analytics.totalStudents || 5}</p>
                  <p className="text-xs font-bold text-mongo-green-dark bg-mongo-green/10 inline-block px-2 py-0.5 rounded">100% Onboarded</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gray-50 rounded-bl-full group-hover:bg-mongo-green/10 transition-colors"></div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Verified Profiles</p>
                  <p className="text-3xl font-display font-bold text-mongo-dark mb-1">{analytics.verifiedStudents || 2} <span className="text-xs text-gray-400 font-normal">({analytics.verifiedRate}%)</span></p>
                  <p className="text-xs font-bold text-blue-700 bg-blue-50 inline-block px-2 py-0.5 rounded">{pendingCount} pending review</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gray-50 rounded-bl-full group-hover:bg-mongo-green/10 transition-colors"></div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Active Drives</p>
                  <p className="text-3xl font-display font-bold text-mongo-dark mb-1">{analytics.activeDrives || opportunities.length}</p>
                  <p className="text-xs font-bold text-purple-700 bg-purple-50 inline-block px-2 py-0.5 rounded">Campus Hiring</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gray-50 rounded-bl-full group-hover:bg-mongo-green/10 transition-colors"></div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Placement Rate</p>
                  <p className="text-3xl font-display font-bold text-mongo-dark mb-1">{analytics.placementPercentage || '86%'}</p>
                  <p className="text-xs font-bold text-mongo-green-dark bg-mongo-green/10 inline-block px-2 py-0.5 rounded">Avg: {analytics.averagePackage}</p>
                </div>
              </div>

              {/* Chart & Quick Action */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-xs p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-mongo-dark">Recruitment Pipeline Conversion</h3>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">2026 Batch</span>
                  </div>
                  <div className="h-64 flex items-end justify-between gap-3 mt-8 pt-4 border-b border-gray-100">
                    {[
                      { label: 'Registered', h: '95%', val: '124' },
                      { label: 'Eligible', h: '80%', val: '98' },
                      { label: 'OA / Tested', h: '65%', val: '74' },
                      { label: 'Interviewed', h: '45%', val: '46' },
                      { label: 'Placed / Offered', h: '35%', val: '38' },
                    ].map((bar, i) => (
                      <div key={i} className="flex flex-col items-center flex-1 group">
                        <span className="text-xs font-bold text-gray-500 mb-2">{bar.val}</span>
                        <div 
                          className="w-full bg-mongo-dark rounded-t-xl transition-all duration-500 group-hover:bg-mongo-green group-hover:shadow-md" 
                          style={{ height: bar.h }}
                        ></div>
                        <span className="text-xs font-semibold text-gray-600 mt-3 text-center">{bar.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500 font-medium">
                    <span>Highest Package: <strong className="text-mongo-dark font-bold">{analytics.highestPackage}</strong></span>
                    <span>Average CTC: <strong className="text-mongo-dark font-bold">{analytics.averagePackage}</strong></span>
                  </div>
                </div>

                {/* Pending Actions Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-mongo-dark mb-4">Action Required</h3>
                    <div className="space-y-3">
                      {students.slice(0, 3).map((student, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div>
                            <p className="text-sm font-bold text-gray-900">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.rollNo} • {student.branch}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded font-bold ${student.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
                            {student.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveTab('verifications')}
                    className="w-full mt-6 text-sm font-bold text-mongo-dark py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-center"
                  >
                    Go to Verification Center ({pendingCount} pending)
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: VERIFICATIONS */}
          {activeTab === 'verifications' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-gray-900">Student Profile Verifications</h1>
                  <p className="text-sm text-gray-500 mt-1">Review student academic records and approve eligibility for placement drives.</p>
                </div>
                
                <div className="flex gap-2">
                  <select 
                    value={verificationFilter} 
                    onChange={(e) => setVerificationFilter(e.target.value)}
                    className="bg-white px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold shadow-xs"
                  >
                    <option value="All">All Students</option>
                    <option value="Pending">Pending Review</option>
                    <option value="Verified">Verified Only</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="text" 
                      value={verificationSearch}
                      onChange={(e) => setVerificationSearch(e.target.value)}
                      placeholder="Search by Roll No, Name, or Branch..." 
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-mongo-green"
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-500">{pendingVerifications.length} student records</span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student Details</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Academic Record</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Resume Document</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {pendingVerifications.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-mongo-dark text-mongo-green font-bold flex items-center justify-center text-sm">
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">{student.name}</p>
                                <p className="text-xs text-gray-500">{student.rollNo} • {student.branch}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">{student.cgpa} CGPA</div>
                            <div className="text-xs text-gray-500">{student.backlogs} Backlogs • Class of {student.gradYear}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {student.resumeUrl ? (
                              <button 
                                onClick={() => setPreviewResumeUrl(student.resumeUrl)}
                                className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 gap-1 bg-blue-50 px-2.5 py-1 rounded-lg cursor-pointer"
                              >
                                View Resume <ExternalLink className="w-3 h-3" />
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400">Not Uploaded</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {student.isVerified ? (
                              <span className="px-3 py-1 inline-flex text-xs font-bold rounded-full bg-green-100 text-green-800">
                                Verified
                              </span>
                            ) : (
                              <span className="px-3 py-1 inline-flex text-xs font-bold rounded-full bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            {student.isVerified ? (
                              <button 
                                onClick={() => handleVerifyStudent(student.id, false)}
                                className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Revoke
                              </button>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => handleVerifyStudent(student.id, true)}
                                  className="text-xs font-bold text-mongo-dark bg-mongo-green hover:bg-[#00E05B] px-3.5 py-1.5 rounded-lg transition-all shadow-xs"
                                >
                                  Verify & Approve
                                </button>
                                <button 
                                  onClick={() => handleVerifyStudent(student.id, false)}
                                  className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: COMPANIES & DRIVES */}
          {activeTab === 'companies' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-gray-900">Companies & Placement Drives</h1>
                  <p className="text-sm text-gray-500 mt-1">Configure recruitment drives, eligibility rules, and application windows.</p>
                </div>
                <button 
                  onClick={() => setIsNewDriveModalOpen(true)}
                  className="bg-mongo-green text-mongo-dark px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#00E05B] shadow-sm flex items-center gap-2 w-max"
                >
                  <Plus className="w-4 h-4" />
                  + Post New Drive
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {opportunities.map(opp => (
                  <div key={opp.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center p-2">
                          <img src={opp.companyLogo} alt="" className="w-full h-full object-contain" />
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          opp.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {opp.status}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 text-lg leading-snug">{opp.title}</h3>
                      <p className="text-sm text-gray-500 font-medium">{opp.companyName} • {opp.salary}</p>

                      <div className="my-4 pt-4 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                        <p><strong className="text-gray-900">Min CGPA:</strong> {opp.eligibilityRules.minCgpa}</p>
                        <p><strong className="text-gray-900">Max Backlogs:</strong> {opp.eligibilityRules.maxBacklogs}</p>
                        <p><strong className="text-gray-900">Deadline:</strong> {opp.deadline}</p>
                        <p className="truncate"><strong className="text-gray-900">Branches:</strong> {opp.eligibilityRules.allowedBranches?.join(', ')}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-600">
                        {opp.applicantsCount || 0} Applicants
                      </span>
                      <button 
                        onClick={() => handleToggleDrive(opp.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          opp.status === 'Open' 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {opp.status === 'Open' ? 'Close Drive' : 'Re-open Drive'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 4: APPLICANT PIPELINE */}
          {activeTab === 'students' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-gray-900">Applicant Pipeline & Rounds</h1>
                  <p className="text-sm text-gray-500 mt-1">Review candidates, progress recruitment stages, and export reports.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedAppIds.length > 0 && (
                    <div className="flex items-center gap-2 bg-mongo-dark text-white px-3 py-1.5 rounded-xl text-xs font-bold">
                      <span>{selectedAppIds.length} Selected:</span>
                      <button 
                        onClick={() => handleBulkAdvance('Shortlisted', 'Technical Round 1')}
                        className="bg-purple-600 hover:bg-purple-700 px-2.5 py-1 rounded-lg"
                      >
                        Shortlist All
                      </button>
                      <button 
                        onClick={() => handleBulkAdvance('Offer Extended', 'Final Placed')}
                        className="bg-mongo-green text-mongo-dark hover:bg-[#00E05B] px-2.5 py-1 rounded-lg"
                      >
                        Extend Offer to All
                      </button>
                    </div>
                  )}

                  <button 
                    onClick={handleExportCSV}
                    className="bg-mongo-dark text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 shadow-sm flex items-center gap-2 w-max"
                  >
                    <Download className="w-4 h-4 text-mongo-green" />
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Filters for Pipeline */}
              <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text"
                    value={pipelineSearch}
                    onChange={(e) => setPipelineSearch(e.target.value)}
                    placeholder="Search candidate or company..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mongo-green"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-gray-500 font-semibold">Filter Drive:</span>
                  <select 
                    value={pipelineDriveFilter}
                    onChange={(e) => setPipelineDriveFilter(e.target.value)}
                    className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-mongo-green"
                  >
                    <option value="All">All Drives</option>
                    {opportunities.map(o => (
                      <option key={o.id} value={o.id}>{o.companyName} - {o.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-center">
                          <input 
                            type="checkbox"
                            checked={selectedAppIds.length === filteredPipeline.length && filteredPipeline.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedAppIds(filteredPipeline.map(a => a.id));
                              else setSelectedAppIds([]);
                            }}
                            className="rounded text-mongo-green focus:ring-mongo-green"
                          />
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Candidate</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Applied Drive</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">CGPA / Branch</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Current Round</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Application Status</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredPipeline.map(app => (
                        <tr key={app.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-4 py-3 text-center">
                            <input 
                              type="checkbox"
                              checked={selectedAppIds.includes(app.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedAppIds([...selectedAppIds, app.id]);
                                else setSelectedAppIds(selectedAppIds.filter(id => id !== app.id));
                              }}
                              className="rounded text-mongo-green focus:ring-mongo-green"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-bold text-gray-900">{app.studentName}</p>
                            <p className="text-xs text-gray-500">{app.studentRollNo}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-bold text-gray-900">{app.opportunity?.companyName}</p>
                            <p className="text-xs text-gray-500">{app.opportunity?.title}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-600">
                            <span className="font-bold text-gray-900">{app.cgpa} CGPA</span> • {app.branch}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-blue-700">
                            {app.currentRound}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                              app.status === 'Offer Extended' || app.status === 'Placed'
                                ? 'bg-green-100 text-green-800'
                                : app.status === 'Shortlisted'
                                ? 'bg-purple-100 text-purple-800'
                                : app.status === 'Rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                            <button 
                              onClick={() => setScheduleModalApplicant(app)}
                              className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                            >
                              <Calendar className="w-3.5 h-3.5" /> Schedule
                            </button>

                            <select 
                              value={app.status}
                              onChange={(e) => {
                                const newStat = e.target.value;
                                let newRound = app.currentRound;
                                if (newStat === 'Shortlisted') newRound = 'Technical Round 1';
                                if (newStat === 'Offer Extended') newRound = 'Final Offer Placed';
                                if (newStat === 'Rejected') newRound = 'Archived';
                                handleAdvanceApplicant(app.id, newStat, newRound);
                              }}
                              className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-mongo-green cursor-pointer"
                            >
                              <option value="Under Review">Under Review</option>
                              <option value="Shortlisted">Shortlist</option>
                              <option value="Offer Extended">Offer (Placed!)</option>
                              <option value="Rejected">Reject</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

        </main>
      </div>

      {/* SCHEDULE INTERVIEW ROUND MODAL */}
      <AnimatePresence>
        {scheduleModalApplicant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 font-display">Schedule Recruitment Round</h3>
                  <p className="text-xs text-gray-500">Candidate: {scheduleModalApplicant.studentName} ({scheduleModalApplicant.studentRollNo})</p>
                </div>
                <button onClick={() => setScheduleModalApplicant(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Round Name</label>
                  <select 
                    value={scheduleForm.roundName}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, roundName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-mongo-green"
                  >
                    <option value="Online Assessment">Online Assessment</option>
                    <option value="Technical Interview 1">Technical Interview 1</option>
                    <option value="Technical Interview 2">Technical Interview 2 (System Design)</option>
                    <option value="HR & Culture Fit Round">HR & Culture Fit Round</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Date</label>
                    <input 
                      type="date"
                      required
                      value={scheduleForm.date}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-mongo-green focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Time</label>
                    <input 
                      type="time"
                      required
                      value={scheduleForm.time}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-mongo-green focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Meeting Link or Room Venue</label>
                  <input 
                    type="text"
                    required
                    value={scheduleForm.venue}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, venue: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-mongo-green focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Instructions for Student</label>
                  <textarea 
                    rows="2"
                    value={scheduleForm.instructions}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, instructions: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-mongo-green focus:outline-none"
                  ></textarea>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setScheduleModalApplicant(null)}
                    className="px-4 py-2 text-xs font-semibold border border-gray-200 rounded-xl text-gray-700"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 text-xs font-bold bg-mongo-green text-mongo-dark rounded-xl shadow-xs hover:bg-[#00E05B]"
                  >
                    Notify & Confirm Schedule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RESUME PREVIEW MODAL */}
      <AnimatePresence>
        {previewResumeUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-gray-200 flex flex-col h-[80vh]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-mongo-green-dark" />
                  <h3 className="font-bold text-gray-900 text-sm">Resume Document Preview</h3>
                </div>
                <div className="flex items-center gap-2">
                  <a 
                    href={previewResumeUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Open in New Tab <ExternalLink className="w-3 h-3" />
                  </a>
                  <button onClick={() => setPreviewResumeUrl(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 flex items-center justify-center">
                <iframe 
                  src={previewResumeUrl} 
                  title="Resume Viewer" 
                  className="w-full h-full border-none"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE NEW PLACEMENT DRIVE MODAL */}
      <AnimatePresence>
        {isNewDriveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 font-display">Post New Placement Drive</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Define role details, package, and eligibility rules for candidates.</p>
                </div>
                <button 
                  onClick={() => setIsNewDriveModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateDriveSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Company Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Goldman Sachs"
                      value={newDriveForm.companyName}
                      onChange={(e) => setNewDriveForm({ ...newDriveForm, companyName: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-mongo-green focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Job Role Title</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Quantitative Analyst"
                      value={newDriveForm.title}
                      onChange={(e) => setNewDriveForm({ ...newDriveForm, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-mongo-green focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Type</label>
                    <select 
                      value={newDriveForm.type}
                      onChange={(e) => setNewDriveForm({ ...newDriveForm, type: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-mongo-green focus:outline-none font-medium"
                    >
                      <option value="Job">Job (Full-Time)</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">CTC / Package</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 28 LPA"
                      value={newDriveForm.salary}
                      onChange={(e) => setNewDriveForm({ ...newDriveForm, salary: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-mongo-green focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Deadline</label>
                    <input 
                      type="date" 
                      required
                      value={newDriveForm.deadline}
                      onChange={(e) => setNewDriveForm({ ...newDriveForm, deadline: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-mongo-green focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Location</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Bangalore / Remote"
                    value={newDriveForm.location}
                    onChange={(e) => setNewDriveForm({ ...newDriveForm, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-mongo-green focus:outline-none"
                  />
                </div>

                {/* Eligibility Engine Criteria */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <h4 className="text-xs font-bold text-mongo-dark uppercase tracking-wider">Eligibility Engine Rules</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 font-semibold mb-1">Min CGPA Required</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={newDriveForm.minCgpa}
                        onChange={(e) => setNewDriveForm({ ...newDriveForm, minCgpa: e.target.value })}
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-mongo-green focus:outline-none font-bold bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 font-semibold mb-1">Max Active Backlogs</label>
                      <input 
                        type="number" 
                        value={newDriveForm.maxBacklogs}
                        onChange={(e) => setNewDriveForm({ ...newDriveForm, maxBacklogs: e.target.value })}
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-mongo-green focus:outline-none bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 font-semibold mb-1">Allowed Branches (Comma separated)</label>
                    <input 
                      type="text" 
                      value={newDriveForm.allowedBranches}
                      onChange={(e) => setNewDriveForm({ ...newDriveForm, allowedBranches: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-mongo-green focus:outline-none bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Job Description</label>
                  <textarea 
                    rows="3"
                    placeholder="Provide overview of responsibilities and technical expectations..."
                    value={newDriveForm.description}
                    onChange={(e) => setNewDriveForm({ ...newDriveForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-mongo-green focus:outline-none"
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsNewDriveModalOpen(false)}
                    className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-mongo-green text-mongo-dark rounded-xl text-sm font-bold hover:bg-[#00E05B] shadow-md transition-all"
                  >
                    Publish Drive to Platform
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TpoDashboard;
