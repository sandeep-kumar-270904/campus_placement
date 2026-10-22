import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import collegeService from '../services/collegeService';
import TenantBrandingHeader from '../components/TenantBrandingHeader';

export default function SuperAdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const { switchTenant } = useTenant();
  const navigate = useNavigate();

  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTpoModal, setShowTpoModal] = useState(false);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  // New College Form
  const [newCollege, setNewCollege] = useState({
    name: '',
    code: '',
    domains: '',
    plan: 'Pro',
    timezone: 'Asia/Kolkata',
    primaryColor: '#00ED64',
    accentColor: '#00684A',
    gradingScale: '10-point',
    branches: 'Computer Science, Information Technology, Electronics & Comm, Mechanical Engineering',
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState(null);

  // TPO Invite Form
  const [tpoForm, setTpoForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [tpoSubmitting, setTpoSubmitting] = useState(false);
  const [tpoError, setTpoError] = useState(null);
  const [provisionedTpo, setProvisionedTpo] = useState(null);

  // Features State
  const [featuresState, setFeaturesState] = useState({
    atsMatcher: true,
    prepHub: true,
    publicPortfolio: true,
    interviewScheduler: true,
    alumniNetwork: true,
  });
  const [featuresSaving, setFeaturesSaving] = useState(false);

  // Fetch colleges list
  const fetchColleges = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (searchQuery) params.q = searchQuery;
      if (statusFilter) params.status = statusFilter;
      if (planFilter) params.plan = planFilter;

      const data = await collegeService.getColleges(params);
      setColleges(data.colleges || []);
    } catch (err) {
      console.error('Failed to fetch colleges:', err);
      setError(err.response?.data?.error?.message || err.message || 'Failed to load colleges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, [searchQuery, statusFilter, planFilter]);

  // Handle Create College Submit
  const handleCreateCollege = async (e) => {
    e.preventDefault();
    try {
      setCreateSubmitting(true);
      setCreateError(null);

      const payload = {
        name: newCollege.name.trim(),
        code: newCollege.code.trim().toUpperCase(),
        domains: newCollege.domains
          ? newCollege.domains.split(',').map((d) => d.trim().toLowerCase()).filter(Boolean)
          : [],
        plan: newCollege.plan,
        timezone: newCollege.timezone,
        branding: {
          primaryColor: newCollege.primaryColor,
          accentColor: newCollege.accentColor,
        },
        gradingSystem: {
          scale: newCollege.gradingScale,
          minPassCgpa: newCollege.gradingScale === 'percentage' ? 40 : 4.0,
        },
        branches: newCollege.branches
          ? newCollege.branches.split(',').map((b) => b.trim()).filter(Boolean)
          : ['Computer Science', 'Information Technology'],
      };

      const created = await collegeService.createCollege(payload);
      setShowCreateModal(false);
      setNewCollege({
        name: '',
        code: '',
        domains: '',
        plan: 'Pro',
        timezone: 'Asia/Kolkata',
        primaryColor: '#00ED64',
        accentColor: '#00684A',
        gradingScale: '10-point',
        branches: 'Computer Science, Information Technology, Electronics & Comm, Mechanical Engineering',
      });

      setActionSuccess(`Successfully onboarded institutional tenant: ${created.name} (${created.code})`);
      setTimeout(() => setActionSuccess(null), 5000);
      fetchColleges();
    } catch (err) {
      console.error('Create college error:', err);
      setCreateError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to create college. Please check required fields.'
      );
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Open TPO Provision Modal
  const openTpoModal = (college) => {
    setSelectedCollege(college);
    setTpoForm({
      firstName: '',
      lastName: '',
      email: college.domains?.[0] ? `tpo@${college.domains[0]}` : '',
      password: '',
    });
    setTpoError(null);
    setProvisionedTpo(null);
    setShowTpoModal(true);
  };

  // Handle TPO Invite
  const handleInviteTpo = async (e) => {
    e.preventDefault();
    if (!selectedCollege) return;
    try {
      setTpoSubmitting(true);
      setTpoError(null);
      const res = await collegeService.inviteTpo(selectedCollege._id, tpoForm);
      setProvisionedTpo({
        ...tpoForm,
        collegeName: selectedCollege.name,
      });
      setActionSuccess(`First TPO credential issued for ${selectedCollege.name}`);
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err) {
      console.error('TPO invite error:', err);
      setTpoError(err.response?.data?.error?.message || err.message || 'Failed to provision TPO');
    } finally {
      setTpoSubmitting(false);
    }
  };

  // Open Feature Flags Modal
  const openFeaturesModal = (college) => {
    setSelectedCollege(college);
    setFeaturesState({
      atsMatcher: college.featureFlags?.atsMatcher ?? true,
      prepHub: college.featureFlags?.prepHub ?? true,
      publicPortfolio: college.featureFlags?.publicPortfolio ?? true,
      interviewScheduler: college.featureFlags?.interviewScheduler ?? true,
      alumniNetwork: college.featureFlags?.alumniNetwork ?? true,
    });
    setShowFeaturesModal(true);
  };

  // Save Feature Flags
  const handleSaveFeatures = async () => {
    if (!selectedCollege) return;
    try {
      setFeaturesSaving(true);
      const updated = await collegeService.updateFeatureFlags(selectedCollege._id, featuresState);
      setColleges((prev) =>
        prev.map((c) => (c._id === selectedCollege._id ? { ...c, featureFlags: updated } : c))
      );
      setShowFeaturesModal(false);
      setActionSuccess(`Feature flags updated for ${selectedCollege.name}`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      console.error('Save features error:', err);
      alert(err.response?.data?.error?.message || 'Failed to save feature flags');
    } finally {
      setFeaturesSaving(false);
    }
  };

  // Open Stats Modal
  const openStatsModal = async (college) => {
    setSelectedCollege(college);
    setShowStatsModal(true);
    try {
      setStatsLoading(true);
      const data = await collegeService.getCollegeStats(college._id);
      setStatsData(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Enter Tenant as Super Admin
  const handleEnterTenant = (college) => {
    switchTenant(college);
    navigate('/tpo/dashboard');
  };

  // Summary Metrics
  const totalColleges = colleges.length;
  const totalStudentsEnrolled = colleges.reduce((sum, c) => sum + (c.totalStudents || 0), 0);
  const totalDrivesAcrossColleges = colleges.reduce((sum, c) => sum + (c.totalOpportunities || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <TenantBrandingHeader />

      {/* Super Admin Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-black text-xl shadow-lg">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Super Admin Platform Console</h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Global Isolation Mode
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage multi-tenant colleges, institutional boundaries, feature flags & quotas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Onboard New College
          </button>

          <Link
            to="/tpo/dashboard"
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            TPO Portal
          </Link>

          <button
            onClick={logout}
            className="px-3 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-medium border border-red-800/40 transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Success Alert */}
        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-600/50 text-emerald-300 text-xs flex items-center justify-between shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-base">✓</span>
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white cursor-pointer font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Global Statistics Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
              Active Tenants
            </div>
            <div className="text-3xl font-black text-white tracking-tight">{totalColleges}</div>
            <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Cryptographically Isolated
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
              Cross-Tenant Students
            </div>
            <div className="text-3xl font-black text-purple-300 tracking-tight">{totalStudentsEnrolled}</div>
            <div className="text-[11px] text-slate-400 mt-2">Zero roll-number collision</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
              Placement Drives Run
            </div>
            <div className="text-3xl font-black text-emerald-400 tracking-tight">{totalDrivesAcrossColleges}</div>
            <div className="text-[11px] text-slate-400 mt-2">Across all colleges</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-md">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
              Data Isolation Engine
            </div>
            <div className="text-xl font-bold text-sky-400 tracking-tight">AsyncLocalStorage</div>
            <div className="text-[11px] text-slate-400 mt-2">Automatic query injection</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/70 flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[240px] relative">
            <input
              type="text"
              placeholder="Search colleges by name, code (e.g. ANITS, IITB), or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Onboarding">Onboarding</option>
              <option value="Suspended">Suspended</option>
            </select>

            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="">All Plans</option>
              <option value="Starter">Starter</option>
              <option value="Pro">Pro</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        {/* Colleges Roster Table */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white tracking-wide">Registered Institutional Tenants</h2>
            <span className="text-xs text-slate-400">{colleges.length} colleges found</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading institutional tenants...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400 text-xs">{error}</div>
          ) : colleges.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No colleges match the current search or filters. Click &quot;Onboard New College&quot; to register one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-5 font-semibold">College & Code</th>
                    <th className="py-3 px-4 font-semibold">Plan</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Domain</th>
                    <th className="py-3 px-4 font-semibold">Students</th>
                    <th className="py-3 px-4 font-semibold">Drives</th>
                    <th className="py-3 px-5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {colleges.map((col) => {
                    const primaryColor = col.branding?.primaryColor || '#00ED64';
                    return (
                      <tr key={col._id} className="hover:bg-slate-800/30 transition">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-slate-950 text-xs shrink-0 shadow"
                              style={{ backgroundColor: primaryColor }}
                            >
                              {col.code ? col.code.slice(0, 3) : 'COL'}
                            </div>
                            <div>
                              <div className="font-semibold text-white tracking-tight">{col.name}</div>
                              <div className="text-[11px] font-mono text-slate-400">{col.code}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              col.plan === 'Enterprise'
                                ? 'bg-purple-950/60 text-purple-300 border-purple-700/50'
                                : col.plan === 'Pro'
                                ? 'bg-sky-950/60 text-sky-300 border-sky-700/50'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {col.plan}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              col.status === 'Active'
                                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50'
                                : col.status === 'Onboarding'
                                ? 'bg-amber-950/60 text-amber-300 border border-amber-700/50'
                                : 'bg-red-950/60 text-red-300 border border-red-700/50'
                            }`}
                          >
                            {col.status}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-mono text-[11px] text-slate-400">
                          {col.domains?.[0] || '—'}
                        </td>

                        <td className="py-4 px-4 font-semibold text-slate-200">
                          {col.totalStudents || 0}
                        </td>

                        <td className="py-4 px-4 font-semibold text-slate-200">
                          {col.totalOpportunities || 0}
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              onClick={() => openTpoModal(col)}
                              title="Provision initial TPO account"
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] border border-slate-700 transition cursor-pointer"
                            >
                              Invite TPO
                            </button>

                            <button
                              onClick={() => openFeaturesModal(col)}
                              title="Configure active features for this college"
                              className="px-2.5 py-1 rounded bg-purple-950/70 hover:bg-purple-900/80 text-purple-300 text-[11px] border border-purple-700/60 transition cursor-pointer"
                            >
                              Features
                            </button>

                            <button
                              onClick={() => openStatsModal(col)}
                              title="View real-time usage metrics"
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] border border-slate-700 transition cursor-pointer"
                            >
                              Stats
                            </button>

                            <button
                              onClick={() => handleEnterTenant(col)}
                              title="Switch active tenant and view as TPO"
                              className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-[11px] transition shadow cursor-pointer"
                            >
                              Enter ➔
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* CREATE COLLEGE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Onboard New Institutional Tenant</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/50 text-red-300 text-xs">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateCollege} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">College Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ANITS Engineering College"
                    value={newCollege.name}
                    onChange={(e) => setNewCollege({ ...newCollege, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">College Code (Unique) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ANITS"
                    value={newCollege.code}
                    onChange={(e) => setNewCollege({ ...newCollege, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white uppercase font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Institutional Email Domains (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. anits.edu.in, alumni.anits.edu.in"
                  value={newCollege.domains}
                  onChange={(e) => setNewCollege({ ...newCollege, domains: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Students and faculty registering with these email domains will automatically bind to this tenant.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Subscription Plan</label>
                  <select
                    value={newCollege.plan}
                    onChange={(e) => setNewCollege({ ...newCollege, plan: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Starter">Starter (Up to 500 students)</option>
                    <option value="Pro">Pro (Up to 2,500 students)</option>
                    <option value="Enterprise">Enterprise (Unlimited students)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Grading System</label>
                  <select
                    value={newCollege.gradingScale}
                    onChange={(e) => setNewCollege({ ...newCollege, gradingScale: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="10-point">10-Point CGPA Scale</option>
                    <option value="percentage">Percentage (100% Scale)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Primary Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newCollege.primaryColor}
                      onChange={(e) => setNewCollege({ ...newCollege, primaryColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newCollege.primaryColor}
                      onChange={(e) => setNewCollege({ ...newCollege, primaryColor: e.target.value })}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Secondary Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newCollege.accentColor}
                      onChange={(e) => setNewCollege({ ...newCollege, accentColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newCollege.accentColor}
                      onChange={(e) => setNewCollege({ ...newCollege, accentColor: e.target.value })}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Active Engineering Branches (comma-separated)
                </label>
                <textarea
                  rows={2}
                  value={newCollege.branches}
                  onChange={(e) => setNewCollege({ ...newCollege, branches: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  {createSubmitting ? 'Creating Tenant...' : 'Deploy College Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INITIAL TPO PROVISION MODAL */}
      {showTpoModal && selectedCollege && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Provision First TPO Account</h3>
                <p className="text-xs text-purple-400 font-medium">{selectedCollege.name} ({selectedCollege.code})</p>
              </div>
              <button
                onClick={() => setShowTpoModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {tpoError && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/50 text-red-300 text-xs">
                {tpoError}
              </div>
            )}

            {provisionedTpo ? (
              <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-600/60 space-y-3">
                <div className="text-emerald-300 font-bold text-xs flex items-center gap-2">
                  <span className="text-emerald-400 text-base">✓</span> TPO Account Successfully Provisioned!
                </div>
                <div className="bg-slate-950 p-3 rounded-lg font-mono text-[11px] text-slate-300 space-y-1">
                  <div>Institution: {provisionedTpo.collegeName}</div>
                  <div>Email: <span className="text-emerald-400">{provisionedTpo.email}</span></div>
                  <div>Password: <span className="text-amber-400">{provisionedTpo.password}</span></div>
                </div>
                <p className="text-[10px] text-slate-400">
                  Please securely send these credentials to the institutional placement officer.
                </p>
                <button
                  type="button"
                  onClick={() => setShowTpoModal(false)}
                  className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleInviteTpo} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Ramesh"
                      value={tpoForm.firstName}
                      onChange={(e) => setTpoForm({ ...tpoForm, firstName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sharma"
                      value={tpoForm.lastName}
                      onChange={(e) => setTpoForm({ ...tpoForm, lastName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Institutional Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="tpo@college.edu.in"
                    value={tpoForm.email}
                    onChange={(e) => setTpoForm({ ...tpoForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Initial Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={tpoForm.password}
                    onChange={(e) => setTpoForm({ ...tpoForm, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowTpoModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={tpoSubmitting}
                    className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow-lg shadow-purple-600/30 cursor-pointer disabled:opacity-50"
                  >
                    {tpoSubmitting ? 'Provisioning...' : 'Provision TPO'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FEATURE FLAGS MODAL */}
      {showFeaturesModal && selectedCollege && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Feature Flags Matrix</h3>
                <p className="text-xs text-purple-400 font-medium">{selectedCollege.name}</p>
              </div>
              <button
                onClick={() => setShowFeaturesModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {[
                { key: 'atsMatcher', label: 'ATS Resume Matcher', desc: 'Allow students & TPOs to run AI keyword scoring against drives' },
                { key: 'prepHub', label: 'Preparation Hub', desc: 'Enable learning platform catalog and interview prep resources' },
                { key: 'publicPortfolio', label: 'Public Student Portfolio', desc: 'Permit public verification links for placed student profiles' },
                { key: 'interviewScheduler', label: 'Interview Scheduler', desc: 'TPO round slotting & candidate schedule management' },
                { key: 'alumniNetwork', label: 'Alumni Network', desc: 'Connect verified graduates with current campus batches' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex-1">
                    <div className="font-semibold text-white text-xs">{label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={Boolean(featuresState[key])}
                      onChange={(e) =>
                        setFeaturesState({ ...featuresState, [key]: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowFeaturesModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFeatures}
                disabled={featuresSaving}
                className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/30 cursor-pointer disabled:opacity-50"
              >
                {featuresSaving ? 'Saving Changes...' : 'Save Flags'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATS MODAL */}
      {showStatsModal && selectedCollege && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Institutional Usage Metrics</h3>
                <p className="text-xs text-purple-400 font-medium">{selectedCollege.name} ({selectedCollege.code})</p>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {statsLoading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Computing live analytics...</div>
            ) : !statsData ? (
              <div className="p-8 text-center text-red-400 text-xs">Unable to load metrics</div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-slate-400 text-[11px] mb-1">Total Enrolled Students</div>
                    <div className="text-2xl font-black text-white">{statsData.stats.totalStudents}</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {statsData.stats.verifiedStudents} verified by TPO
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-slate-400 text-[11px] mb-1">TPO Verification Rate</div>
                    <div className="text-2xl font-black text-emerald-400">{statsData.stats.verificationRate}%</div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full transition-all"
                        style={{ width: `${statsData.stats.verificationRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-slate-400 text-[10px] uppercase">Drives</div>
                    <div className="text-xl font-bold text-white mt-1">{statsData.stats.totalOpportunities}</div>
                    <div className="text-[10px] text-emerald-400">{statsData.stats.activeOpportunities} Active</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-slate-400 text-[10px] uppercase">Applications</div>
                    <div className="text-xl font-bold text-white mt-1">{statsData.stats.totalApplications}</div>
                    <div className="text-[10px] text-slate-400">Total submitted</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-slate-400 text-[10px] uppercase">Offers / Hired</div>
                    <div className="text-xl font-bold text-purple-300 mt-1">{statsData.stats.placedCount}</div>
                    <div className="text-[10px] text-purple-400">Placed candidates</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Database Scoping:</span>
                    <span className="font-mono text-emerald-400">Strict collegeId isolation</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assigned Plan:</span>
                    <span className="font-semibold text-white">{statsData.college.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tenant Status:</span>
                    <span className="font-semibold text-white">{statsData.college.status}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setShowStatsModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
