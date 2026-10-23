import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  Plus,
  X,
  Building2,
  Calendar,
  DollarSign,
  User,
  GraduationCap,
  MapPin,
  FileCheck,
  Star,
  RefreshCw,
  Award,
} from 'lucide-react';
import internshipService from '../../services/internshipService';

export default function TpoInternships() {
  const [internships, setInternships] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [ppoStatusFilter, setPpoStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');

  // Modals
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [updatePpoModalItem, setUpdatePpoModalItem] = useState(null);

  // Record Form
  const [recordForm, setRecordForm] = useState({
    companyName: '',
    role: '',
    stipendMonthly: 30000,
    durationMonths: 6,
    startDate: new Date().toISOString().split('T')[0],
    mode: 'Onsite',
    location: 'Bengaluru, India',
    mentorName: '',
    mentorEmail: '',
    ppoStatus: 'In Progress',
  });
  const [submittingRecord, setSubmittingRecord] = useState(false);

  // Update PPO Form
  const [ppoForm, setPpoForm] = useState({
    ppoStatus: 'PPO Offered',
    ctc: 12,
    fixedCtc: 10,
    variableCtc: 2,
    role: '',
    performanceRating: 5,
    notes: '',
  });
  const [submittingPpo, setSubmittingPpo] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [internshipsRes, statsRes] = await Promise.all([
        internshipService.getInternships({
          q: search,
          ppoStatus: ppoStatusFilter,
          mode: modeFilter,
        }),
        internshipService.getStats(),
      ]);
      setInternships(internshipsRes.internships || []);
      setStats(statsRes);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Failed to load internships data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [ppoStatusFilter, modeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleCreateInternship = async (e) => {
    e.preventDefault();
    if (!recordForm.companyName.trim() || !recordForm.role.trim()) {
      setError('Company name and role are required.');
      return;
    }
    try {
      setSubmittingRecord(true);
      setError(null);
      await internshipService.createInternship(recordForm);
      setSuccessMessage('Internship recorded successfully.');
      setRecordModalOpen(false);
      setRecordForm({
        companyName: '',
        role: '',
        stipendMonthly: 30000,
        durationMonths: 6,
        startDate: new Date().toISOString().split('T')[0],
        mode: 'Onsite',
        location: 'Bengaluru, India',
        mentorName: '',
        mentorEmail: '',
        ppoStatus: 'In Progress',
      });
      await loadData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to record internship.');
    } finally {
      setSubmittingRecord(false);
    }
  };

  const handleOpenPpoModal = (item) => {
    setUpdatePpoModalItem(item);
    setPpoForm({
      ppoStatus: item.ppoStatus || 'PPO Offered',
      ctc: item.ppoDetails?.ctc || 12,
      fixedCtc: item.ppoDetails?.fixedCtc || 10,
      variableCtc: item.ppoDetails?.variableCtc || 2,
      role: item.ppoDetails?.role || item.role || '',
      performanceRating: item.performanceRating || 5,
      notes: item.notes || '',
    });
  };

  const handleSavePpoUpdate = async (e) => {
    e.preventDefault();
    if (!updatePpoModalItem) return;
    try {
      setSubmittingPpo(true);
      setError(null);
      await internshipService.updatePpoStatus(
        updatePpoModalItem._id,
        ppoForm.ppoStatus,
        {
          ctc: ppoForm.ctc,
          fixedCtc: ppoForm.fixedCtc,
          variableCtc: ppoForm.variableCtc,
          role: ppoForm.role,
        },
        ppoForm.performanceRating,
        ppoForm.notes
      );
      setSuccessMessage(`PPO status updated to ${ppoForm.ppoStatus}.`);
      setUpdatePpoModalItem(null);
      await loadData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update PPO status.');
    } finally {
      setSubmittingPpo(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest">
              Talent Pipeline
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-amber-400" />
            Internship & PPO Tracking CRM
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track student industrial internships, monitor monthly stipends, and manage pre-placement offer (PPO) conversion funnels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setRecordModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Record Internship
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Active Internships</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats?.totalInternships || 0}</p>
          <p className="text-[10px] text-slate-500 mt-1">
            {stats?.inProgress || 0} currently in progress
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">PPO Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{stats?.conversionRate || 0}%</p>
          <p className="text-[10px] text-emerald-400/80 mt-1">
            {stats?.ppoOffered || 0} PPOs offered
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">PPOs Accepted</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400">{stats?.ppoAccepted || 0}</p>
          <p className="text-[10px] text-slate-500 mt-1">Converted to full-time hires</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Avg Monthly Stipend</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">
            ₹{Number(stats?.avgStipend || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Per intern per month</p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by company, role, or mentor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
          >
            Filter
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400 font-medium">PPO Funnel Status:</span>
            <select
              value={ppoStatusFilter}
              onChange={(e) => setPpoStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="PPO Offered">PPO Offered</option>
              <option value="PPO Accepted">PPO Accepted</option>
              <option value="PPO Rejected">PPO Rejected</option>
              <option value="No Conversion">No Conversion</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Work Mode:</span>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none"
            >
              <option value="all">All Modes</option>
              <option value="Onsite">Onsite</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Online">Online</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table of Internships */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5 pl-5">Student Candidate</th>
                <th className="p-3.5">Company & Role</th>
                <th className="p-3.5">Stipend & Duration</th>
                <th className="p-3.5">Work Mode & Location</th>
                <th className="p-3.5">PPO Status</th>
                <th className="p-3.5 pr-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading internship cohort...
                  </td>
                </tr>
              ) : internships.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No internship records found matching current filters.
                  </td>
                </tr>
              ) : (
                internships.map((record) => {
                  const student = record.studentId;
                  const ppoColor =
                    record.ppoStatus === 'PPO Accepted'
                      ? 'bg-purple-500/15 text-purple-400 border-purple-500/30 font-bold'
                      : record.ppoStatus === 'PPO Offered'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold'
                      : record.ppoStatus === 'In Progress'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700';

                  return (
                    <tr key={record._id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3.5 pl-5">
                        <div className="font-bold text-white flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {student?.firstName} {student?.lastName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {student?.rollNo || 'Roll N/A'} • {student?.branch || 'N/A'}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                          {record.companyName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{record.role}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-emerald-400">
                          ₹{record.stipendMonthly?.toLocaleString('en-IN') || 0}/mo
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {record.durationMonths} Months Duration
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {record.mode}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {record.location || 'India'}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${ppoColor}`}>
                          {record.ppoStatus}
                        </span>
                        {record.ppoDetails?.ctc > 0 && (
                          <div className="text-[11px] text-emerald-400 font-bold mt-1">
                            {record.ppoDetails.ctc} LPA Package
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 pr-5 text-right">
                        <button
                          onClick={() => handleOpenPpoModal(record)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                        >
                          Update PPO
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Internship Modal */}
      {recordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-400" />
                Record New Industrial Internship
              </h3>
              <button
                onClick={() => setRecordModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInternship} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cisco Systems, Goldman Sachs"
                  value={recordForm.companyName}
                  onChange={(e) => setRecordForm({ ...recordForm, companyName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Designation / Role *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Engineering Intern"
                  value={recordForm.role}
                  onChange={(e) => setRecordForm({ ...recordForm, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Monthly Stipend (INR)</label>
                  <input
                    type="number"
                    value={recordForm.stipendMonthly}
                    onChange={(e) => setRecordForm({ ...recordForm, stipendMonthly: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Duration (Months)</label>
                  <input
                    type="number"
                    value={recordForm.durationMonths}
                    onChange={(e) => setRecordForm({ ...recordForm, durationMonths: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Work Mode</label>
                  <select
                    value={recordForm.mode}
                    onChange={(e) => setRecordForm({ ...recordForm, mode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  >
                    <option value="Onsite">Onsite</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    value={recordForm.location}
                    onChange={(e) => setRecordForm({ ...recordForm, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Mentor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe (Manager)"
                    value={recordForm.mentorName}
                    onChange={(e) => setRecordForm({ ...recordForm, mentorName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Mentor Email</label>
                  <input
                    type="email"
                    placeholder="mentor@company.com"
                    value={recordForm.mentorEmail}
                    onChange={(e) => setRecordForm({ ...recordForm, mentorEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRecordModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRecord}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition disabled:opacity-50"
                >
                  {submittingRecord ? 'Saving...' : 'Record Internship'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update PPO Status Modal */}
      {updatePpoModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Update PPO Conversion Outcome
              </h3>
              <button
                onClick={() => setUpdatePpoModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePpoUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">PPO Status *</label>
                <select
                  value={ppoForm.ppoStatus}
                  onChange={(e) => setPpoForm({ ...ppoForm, ppoStatus: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none font-bold text-emerald-400"
                >
                  <option value="In Progress">In Progress (Internship ongoing)</option>
                  <option value="PPO Offered">PPO Offered (Formal letter issued)</option>
                  <option value="PPO Accepted">PPO Accepted (Student accepted offer)</option>
                  <option value="PPO Rejected">PPO Rejected (Student declined offer)</option>
                  <option value="No Conversion">No Conversion (Company did not extend PPO)</option>
                </select>
              </div>

              {['PPO Offered', 'PPO Accepted'].includes(ppoForm.ppoStatus) && (
                <div className="space-y-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Total CTC (LPA)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={ppoForm.ctc}
                        onChange={(e) => setPpoForm({ ...ppoForm, ctc: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Fixed CTC (LPA)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={ppoForm.fixedCtc}
                        onChange={(e) => setPpoForm({ ...ppoForm, fixedCtc: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Full-time Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Associate Software Engineer"
                      value={ppoForm.role}
                      onChange={(e) => setPpoForm({ ...ppoForm, role: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Manager Performance Rating (1 to 5)
                </label>
                <select
                  value={ppoForm.performanceRating}
                  onChange={(e) => setPpoForm({ ...ppoForm, performanceRating: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional / Exceeds Expectations)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Strong Performer)</option>
                  <option value={3}>⭐⭐⭐ (3 - Meets Expectations)</option>
                  <option value={2}>⭐⭐ (2 - Needs Improvement)</option>
                  <option value={1}>⭐ (1 - Unsatisfactory)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">TPO Internal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional notes, conversion conditions, or joining dates..."
                  value={ppoForm.notes}
                  onChange={(e) => setPpoForm({ ...ppoForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUpdatePpoModalItem(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPpo}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition disabled:opacity-50"
                >
                  {submittingPpo ? 'Updating...' : 'Save PPO Outcome'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
