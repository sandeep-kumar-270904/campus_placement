import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LogOut, UserCircle, Briefcase, FileText, Bell, Search, MapPin, 
  DollarSign, Calendar, CheckCircle2, AlertCircle, X, ChevronRight,
  Sparkles, Building, Filter, Clock, ShieldCheck, BookOpen, UploadCloud,
  FileCode, CheckSquare, ArrowUpRight, Globe, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getOpportunities,
  getMyApplications,
  getStudentProfile,
  updateStudentProfile,
  applyToOpportunity,
  checkEligibility,
  getNotifications,
  markNotificationsAsRead
} from '../services/placementStore';
import { uploadResume } from '../services/documentService';
import AtsMatcherModal from '../components/AtsMatcherModal';
import TenantBrandingHeader from '../components/TenantBrandingHeader';
import { useTenant } from '../context/TenantContext';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { branding, isFeatureEnabled, formatGrade } = useTenant();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('opportunities');
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [eligibilityFilter, setEligibilityFilter] = useState('All');

  // Preparation Hub filter
  const [prepCategory, setPrepCategory] = useState('all');

  // Profile Form State
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    email: '',
    rollNo: '',
    branch: 'Computer Science',
    degree: 'B.Tech Computer Science',
    cgpa: 8.5,
    backlogs: 0,
    gradYear: 2026,
    resumeUrl: '',
    skills: 'React, Node.js, Python, SQL, System Design'
  });
  const [profileSaveMessage, setProfileSaveMessage] = useState('');

  // Load store data
  const refreshData = () => {
    const opps = getOpportunities();
    setOpportunities(opps);

    const prof = getStudentProfile(user);
    setProfile(prof);
    setProfileFormData({
      name: prof.name || `${user?.firstName || 'Student'} ${user?.lastName || ''}`.trim(),
      email: prof.email || user?.email || '',
      rollNo: prof.rollNo || 'CS2026-08',
      branch: prof.branch || 'Computer Science',
      degree: prof.degree || 'B.Tech Computer Science',
      cgpa: prof.cgpa || 8.5,
      backlogs: prof.backlogs || 0,
      gradYear: prof.gradYear || 2026,
      resumeUrl: prof.resumeUrl || 'https://drive.google.com/file/d/sample-resume',
      skills: Array.isArray(prof.skills) ? prof.skills.join(', ') : (prof.skills || 'React, Node.js, Python')
    });

    const apps = getMyApplications(user?.email);
    setApplications(apps);

    const notifs = getNotifications();
    setNotifications(notifs);
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleApply = (opp) => {
    try {
      applyToOpportunity(opp.id, user, profile);
      refreshData();
      alert(`🎉 Application submitted successfully for ${opp.companyName} - ${opp.title}!`);
      setSelectedOpportunity(null);
    } catch (err) {
      alert(`⚠️ Cannot Apply: ${err.message}`);
    }
  };

  const handleResumeFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingResume(true);
    try {
      const url = await uploadResume(file);
      setProfileFormData(prev => ({ ...prev, resumeUrl: url }));
      setProfileSaveMessage(`Resume "${file.name}" uploaded successfully!`);
      setTimeout(() => setProfileSaveMessage(''), 4000);
    } catch {
      alert('Error uploading resume file');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const updated = updateStudentProfile(user, {
      ...profileFormData,
      cgpa: parseFloat(profileFormData.cgpa),
      backlogs: parseInt(profileFormData.backlogs, 10),
      gradYear: parseInt(profileFormData.gradYear, 10),
      skills: profileFormData.skills.split(',').map(s => s.trim()).filter(Boolean),
      isVerified: true
    });
    setProfile(updated);
    setProfileSaveMessage('Profile saved and verified successfully!');
    refreshData();
    setTimeout(() => setProfileSaveMessage(''), 4000);
  };

  // Filtered Opportunities
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          opp.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          opp.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'All' || opp.type === typeFilter;
    
    const eligibility = checkEligibility(opp, profile);
    const matchesEligibility = eligibilityFilter === 'All' || 
      (eligibilityFilter === 'Eligible' && eligibility.isEligible) ||
      (eligibilityFilter === 'NotEligible' && !eligibility.isEligible);

    return matchesSearch && matchesType && matchesEligibility;
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col">
      <TenantBrandingHeader />
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-mongo-dark rounded-md flex items-center justify-center">
              <span className="text-mongo-green font-bold text-xl font-display">P</span>
            </div>
            <span className="text-xl font-display font-bold text-mongo-dark">PLACEearly</span>
          </div>
          
          <div className="flex flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, roles, companies..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mongo-green focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/job-platforms" className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <Briefcase className="w-3.5 h-3.5 text-mongo-green" />
              Job Platforms
            </Link>
            <Link to="/learning-platforms" className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              Learning Hub
            </Link>

            {/* Notification Trigger */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markNotificationsAsRead();
                }}
                className="p-2 text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 relative transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <h4 className="font-bold text-gray-900 text-sm">Placement Alerts</h4>
                      <span className="text-xs text-mongo-green-dark font-semibold">Live Feed</span>
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

            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-sm text-right hidden sm:block">
                <p className="font-semibold text-gray-900">{profile?.name || user?.firstName || 'Student'}</p>
                <p className="text-xs text-mongo-green-dark font-medium capitalize">
                  {profile?.branch || 'Candidate'} • CGPA {profile?.cgpa || '8.5'}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-mongo-green/20 text-mongo-green-dark flex items-center justify-center font-bold border border-mongo-green/30">
                {(user?.firstName?.charAt(0) || 'S').toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8 flex-1 w-full">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 flex-shrink-0 h-[calc(100vh-8rem)] sticky top-24">
          <nav className="space-y-2 flex-1">
            <button 
              onClick={() => setActiveTab('opportunities')}
              className={`w-full group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'opportunities' 
                  ? 'bg-mongo-dark text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Briefcase className={`${activeTab === 'opportunities' ? 'text-mongo-green' : 'text-gray-400 group-hover:text-gray-600'} mr-3 flex-shrink-0 h-5 w-5`} />
              Opportunity Hub
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${activeTab === 'opportunities' ? 'bg-mongo-green text-mongo-dark' : 'bg-gray-200 text-gray-700'}`}>
                {opportunities.length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('applications')}
              className={`w-full group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'applications' 
                  ? 'bg-mongo-dark text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileText className={`${activeTab === 'applications' ? 'text-mongo-green' : 'text-gray-400 group-hover:text-gray-600'} mr-3 flex-shrink-0 h-5 w-5`} />
              My Applications
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${activeTab === 'applications' ? 'bg-mongo-green text-mongo-dark' : 'bg-gray-200 text-gray-700'}`}>
                {applications.length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('preparation')}
              className={`w-full group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'preparation' 
                  ? 'bg-mongo-dark text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BookOpen className={`${activeTab === 'preparation' ? 'text-mongo-green' : 'text-gray-400 group-hover:text-gray-600'} mr-3 flex-shrink-0 h-5 w-5`} />
              Preparation Hub
              <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                PRO
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'profile' 
                  ? 'bg-mongo-dark text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <UserCircle className={`${activeTab === 'profile' ? 'text-mongo-green' : 'text-gray-400 group-hover:text-gray-600'} mr-3 flex-shrink-0 h-5 w-5`} />
              My Profile
              {profile?.isVerified ? (
                <CheckCircle2 className="ml-auto w-4 h-4 text-mongo-green" />
              ) : (
                <span className="ml-auto w-2 h-2 rounded-full bg-yellow-500"></span>
              )}
            </button>

            <Link 
              to="/job-platforms"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full group flex items-center px-4 py-3 text-sm font-semibold rounded-xl text-gray-700 hover:bg-gray-100 transition-all justify-between"
            >
              <div className="flex items-center">
                <Globe className="text-gray-400 group-hover:text-mongo-green-dark mr-3 flex-shrink-0 h-5 w-5" />
                Job Platforms
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
            </Link>
          </nav>
          
          <div className="mt-auto pt-6 border-t border-gray-200 space-y-3">
            <div className="bg-mongo-green/10 p-3.5 rounded-xl border border-mongo-green/20">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-mongo-green-dark" />
                <span className="text-xs font-bold text-mongo-dark">TPO Verification</span>
              </div>
              <p className="text-xs text-gray-600">
                {profile?.isVerified ? 'Profile verified. You are eligible for active placement drives.' : 'Pending review by college Placement Cell.'}
              </p>
            </div>

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
          
          {/* TAB 1: OPPORTUNITY HUB */}
          {activeTab === 'opportunities' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {/* Header & Controls */}
              <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-gray-900">Opportunity Hub</h1>
                  <p className="text-sm text-gray-500 mt-1">Explore campus placement drives and apply with verified eligibility.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-white px-3 py-2 border border-gray-200 rounded-xl shadow-xs">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select 
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="text-xs font-semibold text-gray-700 bg-transparent focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Types</option>
                      <option value="Job">Full-Time (Job)</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 bg-white px-3 py-2 border border-gray-200 rounded-xl shadow-xs">
                    <select 
                      value={eligibilityFilter}
                      onChange={(e) => setEligibilityFilter(e.target.value)}
                      className="text-xs font-semibold text-gray-700 bg-transparent focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Eligibility</option>
                      <option value="Eligible">Eligible Only</option>
                      <option value="NotEligible">Ineligible</option>
                    </select>
                  </div>

                  <button 
                    onClick={() => setIsAtsModalOpen(true)}
                    className="flex items-center gap-2 bg-mongo-green/20 text-mongo-green-dark border border-mongo-green/30 px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-mongo-green/30 transition-all cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-mongo-green-dark" />
                    AI ATS Matcher
                  </button>

                  <Link 
                    to="/job-platforms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-white text-gray-800 border border-gray-200 px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer shadow-xs"
                  >
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    Off-Campus Portals
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </Link>
                </div>
              </div>

              {/* Opportunities Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredOpportunities.map((opp) => {
                  const eligibility = checkEligibility(opp, profile);
                  const alreadyApplied = applications.some(a => a.opportunityId === opp.id);

                  return (
                    <div 
                      key={opp.id}
                      onClick={() => setSelectedOpportunity(opp)}
                      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all group cursor-pointer relative flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Meta */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-13 h-13 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center p-2.5 flex-shrink-0">
                              {opp.companyLogo ? (
                                <img src={opp.companyLogo} alt={opp.companyName} className="w-full h-full object-contain" />
                              ) : (
                                <Building className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg group-hover:text-mongo-green-dark transition-colors leading-snug">
                                {opp.title}
                              </h3>
                              <p className="text-sm text-gray-500 font-medium">{opp.companyName} • <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-semibold text-gray-700">{opp.type}</span></p>
                            </div>
                          </div>

                          {/* Eligibility Badge */}
                          {alreadyApplied ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex-shrink-0">
                              Applied
                            </span>
                          ) : eligibility.isEligible ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200 flex-shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Eligible
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex-shrink-0">
                              Ineligible
                            </span>
                          )}
                        </div>

                        {/* Pills */}
                        <div className="flex flex-wrap gap-2.5 mb-5">
                          <div className="flex items-center text-xs font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400"/> {opp.location}
                          </div>
                          <div className="flex items-center text-xs font-bold text-gray-900 bg-mongo-green/10 px-2.5 py-1 rounded-lg border border-mongo-green/20">
                            <DollarSign className="w-3.5 h-3.5 mr-0.5 text-mongo-green-dark"/> {opp.salary}
                          </div>
                          <div className="flex items-center text-xs font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                            <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400"/> Deadline: {opp.deadline}
                          </div>
                        </div>

                        {/* Criteria summary */}
                        <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100 text-xs text-gray-600 mb-5 space-y-1">
                          <p><span className="font-semibold text-gray-800">Criteria:</span> Min CGPA {opp.eligibilityRules.minCgpa} • Max {opp.eligibilityRules.maxBacklogs} Backlogs</p>
                          <p className="truncate"><span className="font-semibold text-gray-800">Branches:</span> {opp.eligibilityRules.allowedBranches?.join(', ')}</p>
                        </div>
                      </div>

                      {/* Bottom Button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOpportunity(opp);
                        }}
                        className="w-full py-2.5 bg-mongo-dark text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5"
                      >
                        View Drive Details
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 2: MY APPLICATIONS */}
          {activeTab === 'applications' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="mb-8">
                <h1 className="text-2xl font-display font-bold text-gray-900">My Applications</h1>
                <p className="text-sm text-gray-500 mt-1">Real-time tracking of your recruitment rounds and interview stages.</p>
              </div>

              {applications.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-gray-900">No applications submitted yet</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1 mb-6">Explore the Opportunity Hub to discover eligible campus drives and apply with 1-click.</p>
                  <button onClick={() => setActiveTab('opportunities')} className="bg-mongo-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-800">
                    Browse Opportunities
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Company & Role</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Applied Date</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Current Round</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {applications.map((app) => (
                          <tr key={app.id} className="hover:bg-gray-50/70 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center p-1.5 flex-shrink-0">
                                  {app.opportunity?.companyLogo ? (
                                    <img src={app.opportunity.companyLogo} alt="" className="w-full h-full object-contain" />
                                  ) : (
                                    <span className="font-bold text-mongo-dark">{app.opportunity?.companyName?.charAt(0) || 'C'}</span>
                                  )}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-gray-900">{app.opportunity?.title || 'Placement Role'}</div>
                                  <div className="text-xs text-gray-500 font-medium">{app.opportunity?.companyName || 'Company'} • {app.opportunity?.salary || 'N/A'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                              {app.appliedAt}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 font-semibold flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-blue-500" />
                                {app.currentRound}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full border ${
                                app.status === 'Offer Extended' || app.status === 'Placed'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : app.status === 'Shortlisted'
                                  ? 'bg-purple-100 text-purple-800 border-purple-200'
                                  : app.status === 'Rejected'
                                  ? 'bg-red-100 text-red-800 border-red-200'
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <button 
                                onClick={() => setSelectedOpportunity(app.opportunity)}
                                className="text-mongo-green-dark hover:text-mongo-green font-bold text-xs"
                              >
                                View Drive &rarr;
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: PREPARATION HUB (MODULE 8) */}
          {activeTab === 'preparation' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-gray-900">Placement Preparation Hub</h1>
                  <p className="text-sm text-gray-500 mt-1">Curated roadmaps, company patterns, and technical cheat sheets.</p>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setPrepCategory('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${prepCategory === 'all' ? 'bg-mongo-dark text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
                  >
                    All Materials
                  </button>
                  <button 
                    onClick={() => setPrepCategory('dsa')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${prepCategory === 'dsa' ? 'bg-mongo-dark text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
                  >
                    DSA & LeetCode
                  </button>
                  <button 
                    onClick={() => setPrepCategory('company')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${prepCategory === 'company' ? 'bg-mongo-dark text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
                  >
                    Company Guides
                  </button>
                </div>
              </div>

              {/* Prep Modules Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Track 1 */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold mb-4">
                    <FileCode className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">DSA Top 75 Interview Patterns</h3>
                  <p className="text-xs text-gray-500 mb-4">Master Sliding Window, Two Pointers, Dynamic Programming, and Graph BFS/DFS.</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-500">75 Problems • High Yield</span>
                    <a href="https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions" target="_blank" rel="noreferrer" className="text-xs font-bold text-mongo-green-dark flex items-center gap-1 hover:underline">
                      Open Guide <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Track 2 */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold mb-4">
                    <Building className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">Google & Microsoft Guide</h3>
                  <p className="text-xs text-gray-500 mb-4">Online assessment test formats, past interview questions, and Googliness/HR rounds.</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-500">FAANG Archives</span>
                    <span className="text-xs font-bold text-mongo-green-dark bg-mongo-green/10 px-2 py-0.5 rounded">Verified 2026</span>
                  </div>
                </div>

                {/* Track 3 */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold mb-4">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">STAR Method Behavioral Bank</h3>
                  <p className="text-xs text-gray-500 mb-4">Top 30 HR behavioral questions with structured Situation, Task, Action, Result answers.</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-500">30 Scenarios</span>
                    <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">HR Round</span>
                  </div>
                </div>
              </div>

              {/* Core CS Subject Refresher */}
              <div className="bg-mongo-dark text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
                <div className="relative z-10 max-w-xl">
                  <span className="text-xs font-bold uppercase tracking-wider text-mongo-green bg-mongo-green/20 px-3 py-1 rounded-full mb-4 inline-block">
                    Computer Science Fundamentals
                  </span>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">Operating Systems, DBMS & Computer Networks</h3>
                  <p className="text-sm text-gray-300 leading-relaxed mb-6">
                    Placement interviewers at Amazon, Microsoft, and Google test deep fundamentals: Threads vs Processes, Virtual Memory, ACID properties, Indexing (B+ Trees), and TCP 3-way handshake.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">OS: Deadlocks & Semaphores</span>
                    <span className="text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">DBMS: Normalization & Indexing</span>
                    <span className="text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">Networks: HTTP/2 vs HTTP/3</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: MY PROFILE */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-gray-900">My Student Profile</h1>
                  <p className="text-sm text-gray-500 mt-1">Manage verified academic credentials and career documentation.</p>
                </div>
                {profile?.isVerified ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200 w-max">
                      <CheckCircle2 className="w-4 h-4 mr-1.5 text-green-600" />
                      Verified by Placement Cell
                    </span>
                    <button 
                      type="button"
                      onClick={() => window.open(`/verify/${profile?.rollNo || 'CS2026-08'}`, '_blank')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-mongo-dark bg-mongo-green/20 hover:bg-mongo-green/30 border border-mongo-green/30 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 text-mongo-green-dark" />
                      View Shareable Portfolio
                    </button>
                  </div>
                ) : (
                  <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200 w-max">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-ping"></span>
                    Verification Pending
                  </span>
                )}
              </div>

              {profileSaveMessage && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  {profileSaveMessage}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Profile Header */}
                <div className="p-6 sm:p-8 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-5">
                    <div className="w-18 h-18 rounded-2xl bg-mongo-dark text-mongo-green font-display font-bold text-2xl flex items-center justify-center shadow-md">
                      {(profileFormData.name?.charAt(0) || 'S').toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{profileFormData.name}</h2>
                      <p className="text-gray-500 text-sm">{profileFormData.email}</p>
                      <p className="text-xs text-mongo-green-dark font-semibold mt-0.5">{profileFormData.rollNo} • {profileFormData.degree}</p>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200 text-right">
                    <span className="text-xs text-gray-500 font-semibold block">Placement Status</span>
                    <span className="text-sm font-bold text-mongo-dark">{profile?.placedCompany || 'Not Placed'}</span>
                  </div>
                </div>
                
                {/* Form Fields */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={profileFormData.name}
                        onChange={(e) => setProfileFormData({ ...profileFormData, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-mongo-green focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">College Roll No / Student ID</label>
                      <input 
                        type="text" 
                        value={profileFormData.rollNo}
                        onChange={(e) => setProfileFormData({ ...profileFormData, rollNo: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-mongo-green focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Branch / Major</label>
                      <select 
                        value={profileFormData.branch}
                        onChange={(e) => setProfileFormData({ ...profileFormData, branch: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-mongo-green focus:outline-none font-medium"
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electronics & Comm">Electronics & Comm</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Electrical">Electrical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Cumulative CGPA</label>
                      <input 
                        type="number" 
                        step="0.01"
                        max="10.0"
                        min="0.0"
                        value={profileFormData.cgpa}
                        onChange={(e) => setProfileFormData({ ...profileFormData, cgpa: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-mongo-green focus:outline-none font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Active Backlogs</label>
                      <input 
                        type="number" 
                        min="0"
                        value={profileFormData.backlogs}
                        onChange={(e) => setProfileFormData({ ...profileFormData, backlogs: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-mongo-green focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Graduation Year</label>
                      <input 
                        type="number" 
                        value={profileFormData.gradYear}
                        onChange={(e) => setProfileFormData({ ...profileFormData, gradYear: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-mongo-green focus:outline-none"
                      />
                    </div>

                    {/* Resume Upload File Picker */}
                    <div className="sm:col-span-2 lg:col-span-3 bg-gray-50 p-5 rounded-2xl border border-gray-200">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Resume Document</label>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <label className="flex items-center justify-center gap-2 px-5 py-2.5 bg-mongo-dark text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors cursor-pointer shadow-xs">
                          <UploadCloud className="w-4 h-4 text-mongo-green" />
                          {uploadingResume ? 'Uploading File...' : 'Upload PDF / Doc'}
                          <input 
                            type="file" 
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeFileUpload}
                            className="hidden" 
                          />
                        </label>
                        
                        <div className="flex-1 w-full">
                          <input 
                            type="url" 
                            value={profileFormData.resumeUrl}
                            onChange={(e) => setProfileFormData({ ...profileFormData, resumeUrl: e.target.value })}
                            placeholder="Or paste cloud drive URL (Google Drive / Dropbox)..."
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-mongo-green focus:outline-none"
                          />
                        </div>

                        {profileFormData.resumeUrl && (
                          <a 
                            href={profileFormData.resumeUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl hover:underline flex items-center gap-1"
                          >
                            Preview <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Key Skills (Comma separated)</label>
                      <input 
                        type="text" 
                        value={profileFormData.skills}
                        onChange={(e) => setProfileFormData({ ...profileFormData, skills: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-mongo-green focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Footer */}
                <div className="px-6 sm:px-8 py-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-200">
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 bg-mongo-dark text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-md flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-mongo-green" />
                    Save & Submit Profile
                  </button>
                </div>
              </form>
            </motion.div>
          )}

        </main>
      </div>

      {/* OPPORTUNITY DETAILS SLIDE-OVER / MODAL */}
      <AnimatePresence>
        {selectedOpportunity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center p-2.5">
                    {selectedOpportunity.companyLogo ? (
                      <img src={selectedOpportunity.companyLogo} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <Building className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 font-display">{selectedOpportunity.title}</h3>
                    <p className="text-sm text-gray-500 font-medium">{selectedOpportunity.companyName} • {selectedOpportunity.location}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedOpportunity(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="py-6 space-y-6">
                {/* Stats Pills */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                    <span className="text-[11px] font-bold text-gray-400 uppercase block">Compensation</span>
                    <span className="text-sm font-bold text-mongo-dark">{selectedOpportunity.salary}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                    <span className="text-[11px] font-bold text-gray-400 uppercase block">Type</span>
                    <span className="text-sm font-bold text-mongo-dark">{selectedOpportunity.type}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                    <span className="text-[11px] font-bold text-gray-400 uppercase block">Deadline</span>
                    <span className="text-sm font-bold text-red-600">{selectedOpportunity.deadline}</span>
                  </div>
                </div>

                {/* Eligibility Engine Breakdown */}
                {(() => {
                  const elig = checkEligibility(selectedOpportunity, profile);
                  return (
                    <div className={`p-4 rounded-2xl border ${elig.isEligible ? 'bg-green-50/80 border-green-200' : 'bg-amber-50/80 border-amber-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {elig.isEligible ? (
                          <CheckCircle2 className="w-5 h-5 text-green-700" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-amber-700" />
                        )}
                        <h4 className={`text-sm font-bold ${elig.isEligible ? 'text-green-900' : 'text-amber-900'}`}>
                          {elig.isEligible ? 'You Meet All Eligibility Rules' : 'Eligibility Check Result'}
                        </h4>
                      </div>
                      <p className={`text-xs ${elig.isEligible ? 'text-green-800' : 'text-amber-800'}`}>{elig.reason}</p>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200/60 grid grid-cols-3 gap-2 text-[11px]">
                        <div>
                          <span className="text-gray-500">Min CGPA: </span>
                          <span className="font-bold">{selectedOpportunity.eligibilityRules.minCgpa} (Yours: {profile?.cgpa})</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Max Backlogs: </span>
                          <span className="font-bold">{selectedOpportunity.eligibilityRules.maxBacklogs}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">TPO Verified: </span>
                          <span className="font-bold">{profile?.isVerified ? 'Yes' : 'Pending'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Job Description */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Job Description</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedOpportunity.description}</p>
                </div>

                {/* Allowed Branches */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Eligible Engineering Branches</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedOpportunity.eligibilityRules.allowedBranches?.map((branch, i) => (
                      <span key={i} className="text-xs font-semibold px-2.5 py-1 bg-gray-100 rounded-lg text-gray-700">
                        {branch}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setSelectedOpportunity(null)}
                  className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50"
                >
                  Close
                </button>

                {applications.some(a => a.opportunityId === selectedOpportunity.id) ? (
                  <button disabled className="px-6 py-2.5 bg-gray-200 text-gray-500 rounded-xl text-sm font-bold cursor-not-allowed">
                    Already Applied
                  </button>
                ) : (
                  <button 
                    onClick={() => handleApply(selectedOpportunity)}
                    className="px-6 py-2.5 bg-mongo-green text-mongo-dark rounded-xl text-sm font-bold hover:bg-[#00E05B] shadow-md transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Submit 1-Click Application
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI ATS MATCHER MODAL */}
      <AtsMatcherModal 
        isOpen={isAtsModalOpen}
        onClose={() => setIsAtsModalOpen(false)}
        studentProfile={profile}
        opportunities={opportunities}
      />
    </div>
  );
};

export default StudentDashboard;
