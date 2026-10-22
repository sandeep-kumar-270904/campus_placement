import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Building2,
  Users,
  Award,
  ChevronRight,
  MoreVertical,
  Copy,
  Archive,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Trash2,
  X,
  FileText,
  DollarSign
} from 'lucide-react';
import tpoService from '../../services/tpoService';
import TpoJdParserModal from '../../components/tpo/TpoJdParserModal';

const STATUS_TABS = ['all', 'Open', 'In Progress', 'Draft', 'Closed', 'Archived'];

export default function TpoDrives() {
  const navigate = useNavigate();
  const location = useLocation();

  const [drives, setDrives] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Drive Creation Wizard
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isJdParserOpen, setIsJdParserOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardForm, setWizardForm] = useState({
    title: '',
    companyName: '',
    companyLogo: '',
    jobType: 'Full-time',
    location: 'Bangalore, India',
    fixedCtc: 18,
    variableCtc: 4,
    deadline: '',
    driveDate: '',
    description: '',
    rounds: [
      { roundNumber: 1, name: 'Online Coding Challenge', type: 'OA', mode: 'Online' },
      { roundNumber: 2, name: 'Technical Interview', type: 'Technical', mode: 'Online' },
      { roundNumber: 3, name: 'HR Final Round', type: 'HR', mode: 'Online' },
    ],
    eligibilityRules: {
      minCgpa: 7.5,
      maxBacklogs: 0,
      allowedBranches: ['Computer Science', 'Information Technology'],
      allowedGraduationYears: [2026],
      minTenthPercentage: 60,
      minTwelfthPercentage: 60,
      genderNeutral: true,
    },
    requiredDocuments: ['resume', 'marksheet'],
    bondDetails: 'None',
  });

  // Live Eligibility Preview State
  const [eligibilityPreview, setEligibilityPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submittingDrive, setSubmittingDrive] = useState(false);

  // Fetch drives roster
  const fetchDrives = useCallback(async () => {
    try {
      setLoading(true);
      const res = await tpoService.getDrives({
        page: pagination.page,
        limit: pagination.limit,
        status: activeTab,
        q: search,
      });
      setDrives(res.drives || []);
      setPagination(res.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 });
    } catch (err) {
      console.error(err);
      showToast('Failed to load placement drives', 'error');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, activeTab, search]);

  useEffect(() => {
    fetchDrives();
  }, [fetchDrives]);

  // Check URL query action=new
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new') {
      setIsWizardOpen(true);
    }
  }, [location.search]);

  // Live preview query when eligibility rules change
  const triggerEligibilityPreview = useCallback(async (rules) => {
    try {
      setPreviewLoading(true);
      const res = await tpoService.previewEligibility(rules);
      setEligibilityPreview(res);
    } catch (err) {
      console.error(err);
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isWizardOpen && wizardStep === 3) {
      triggerEligibilityPreview(wizardForm.eligibilityRules);
    }
  }, [isWizardOpen, wizardStep, wizardForm.eligibilityRules, triggerEligibilityPreview]);

  // Status Transition
  const handleStatusChange = async (driveId, newStatus) => {
    try {
      const res = await tpoService.updateDriveStatus(driveId, newStatus);
      showToast(res.message);
      fetchDrives();
    } catch (err) {
      showToast(err?.response?.data?.error?.message || 'Failed to update status', 'error');
    }
  };

  // Duplicate Drive
  const handleDuplicate = async (driveId) => {
    try {
      const res = await tpoService.duplicateDrive(driveId);
      showToast(res.message);
      fetchDrives();
    } catch (err) {
      showToast('Failed to duplicate drive', 'error');
    }
  };

  // Submit New Drive
  const handleCreateDriveSubmit = async (finalStatus = 'Open') => {
    try {
      setSubmittingDrive(true);
      const payload = {
        ...wizardForm,
        salary: `${wizardForm.fixedCtc + wizardForm.variableCtc} LPA (${wizardForm.fixedCtc} Fixed + ${wizardForm.variableCtc} Variable)`,
        ctc: {
          fixed: wizardForm.fixedCtc,
          variable: wizardForm.variableCtc,
          currency: 'INR',
          lpaString: `${wizardForm.fixedCtc + wizardForm.variableCtc} LPA`,
        },
        status: finalStatus,
      };

      const res = await tpoService.createDrive(payload);
      showToast(res.message);
      setIsWizardOpen(false);
      setWizardStep(1);
      fetchDrives();
    } catch (err) {
      showToast(err?.response?.data?.error?.message || 'Failed to create drive', 'error');
    } finally {
      setSubmittingDrive(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 ${
            toast.type === 'error'
              ? 'bg-red-950 border-red-700 text-red-200'
              : 'bg-emerald-950 border-emerald-700 text-emerald-200'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Placement Drives</h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {pagination.total} total
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Multi-round recruitment campaigns, automated eligibility filtering, and candidate pipeline tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsJdParserOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-xs transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            AI Prefill from Raw JD
          </button>
          <button
            onClick={() => {
              setWizardStep(1);
              setIsWizardOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Create Placement Drive
          </button>
        </div>
      </div>

      {/* Status Filter Tabs & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer capitalize ${
                activeTab === tab
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              {tab === 'all' ? 'All Drives' : tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search drives, companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Drives Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading placement drives...</div>
      ) : drives.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <Briefcase className="w-10 h-10 text-slate-700 mx-auto" />
          <h3 className="text-sm font-bold text-white">No placement drives found</h3>
          <p className="text-xs text-slate-500">No drives match the active status or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {drives.map((drive) => {
            const isClosingSoon =
              drive.status === 'Open' &&
              new Date(drive.deadline).getTime() - Date.now() < 48 * 3600 * 1000 &&
              new Date(drive.deadline).getTime() > Date.now();

            return (
              <div
                key={drive.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4 shadow-xl group"
              >
                <div>
                  {/* Card Top: Logo, Status & Actions */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {drive.companyLogo ? (
                        <img
                          src={drive.companyLogo}
                          alt={drive.companyName}
                          className="w-10 h-10 rounded-xl object-contain bg-white p-1 border border-slate-800"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 font-black text-sm flex items-center justify-center">
                          {drive.companyName?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-extrabold text-white text-sm group-hover:text-emerald-400 transition">
                          {drive.title}
                        </h3>
                        <p className="text-xs text-slate-400 font-semibold">{drive.companyName}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        drive.status === 'Open'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : drive.status === 'Draft'
                          ? 'bg-slate-800 text-slate-400'
                          : drive.status === 'In Progress'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {drive.status}
                    </span>
                  </div>

                  {/* CTC & Location Chip */}
                  <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950/40 text-emerald-300 font-mono font-bold border border-emerald-800/40">
                      {drive.salary}
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px]">
                      {drive.jobType || drive.type}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate max-w-[140px]">{drive.location}</span>
                  </div>

                  {/* Rounds Roadmap */}
                  {drive.rounds?.length > 0 && (
                    <div className="space-y-1 my-3">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Rounds Roadmap ({drive.rounds.length})
                      </div>
                      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                        {drive.rounds.map((r, i) => (
                          <React.Fragment key={i}>
                            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 whitespace-nowrap">
                              {r.name}
                            </span>
                            {i < drive.rounds.length - 1 && <span className="text-slate-600">&rarr;</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Applicant Metrics Counter */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500">Applicants</div>
                      <div className="font-mono font-bold text-white">{drive.applicantsCount || 0}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">In Pipeline</div>
                      <div className="font-mono font-bold text-purple-400">{drive.shortlistedCount || 0}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Offers</div>
                      <div className="font-mono font-bold text-emerald-400">{drive.offersCount || 0}</div>
                    </div>
                  </div>
                </div>

                {/* Bottom Footer */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Clock className={`w-3.5 h-3.5 ${isClosingSoon ? 'text-red-400 animate-pulse' : ''}`} />
                    <span className={isClosingSoon ? 'text-red-400 font-bold' : ''}>
                      {new Date(drive.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDuplicate(drive.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Duplicate drive template"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => navigate(`/tpo/drives/${drive.id}`)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs transition"
                    >
                      Workspace <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Multi-Step Drive Creation Wizard Modal */}
      {isWizardOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsWizardOpen(false)}
        >
          <div
            className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                  {wizardStep}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create Placement Drive</h3>
                  <p className="text-[11px] text-slate-400">Step {wizardStep} of 4: {
                    wizardStep === 1 ? 'Company & Job Scope' :
                    wizardStep === 2 ? 'Recruitment Rounds' :
                    wizardStep === 3 ? 'Eligibility Criteria & Live Preview' :
                    'Final Review & Publishing'
                  }</p>
                </div>
              </div>
              <button onClick={() => setIsWizardOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Company & Job Scope */}
            {wizardStep === 1 && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Google, Microsoft, Atlassian"
                      value={wizardForm.companyName}
                      onChange={(e) => setWizardForm({ ...wizardForm, companyName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Role Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Software Engineer (Backend)"
                      value={wizardForm.title}
                      onChange={(e) => setWizardForm({ ...wizardForm, title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Job Type</label>
                    <select
                      value={wizardForm.jobType}
                      onChange={(e) => setWizardForm({ ...wizardForm, jobType: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Internship">Internship</option>
                      <option value="PPO">PPO</option>
                      <option value="Internship+PPO">Internship + PPO</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Fixed CTC (LPA)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={wizardForm.fixedCtc}
                      onChange={(e) => setWizardForm({ ...wizardForm, fixedCtc: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Variable CTC (LPA)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={wizardForm.variableCtc}
                      onChange={(e) => setWizardForm({ ...wizardForm, variableCtc: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Application Deadline *</label>
                    <input
                      type="date"
                      required
                      value={wizardForm.deadline}
                      onChange={(e) => setWizardForm({ ...wizardForm, deadline: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Drive Date</label>
                    <input
                      type="date"
                      value={wizardForm.driveDate}
                      onChange={(e) => setWizardForm({ ...wizardForm, driveDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Job Description & Responsibilities</label>
                  <textarea
                    rows={4}
                    placeholder="Enter detailed job requirements, skill sets, eligibility expectations..."
                    value={wizardForm.description}
                    onChange={(e) => setWizardForm({ ...wizardForm, description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Recruitment Rounds Definition */}
            {wizardStep === 2 && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-white">Defined Rounds ({wizardForm.rounds.length})</span>
                  <button
                    onClick={() =>
                      setWizardForm({
                        ...wizardForm,
                        rounds: [
                          ...wizardForm.rounds,
                          {
                            roundNumber: wizardForm.rounds.length + 1,
                            name: `Round ${wizardForm.rounds.length + 1}`,
                            type: 'Technical',
                            mode: 'Online',
                          },
                        ],
                      })
                    }
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold"
                  >
                    + Add Round
                  </button>
                </div>

                <div className="space-y-3">
                  {wizardForm.rounds.map((round, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-400 text-xs">Round {idx + 1}</span>
                        {wizardForm.rounds.length > 1 && (
                          <button
                            onClick={() =>
                              setWizardForm({
                                ...wizardForm,
                                rounds: wizardForm.rounds.filter((_, i) => i !== idx),
                              })
                            }
                            className="text-slate-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Round Name"
                          value={round.name}
                          onChange={(e) => {
                            const newRounds = [...wizardForm.rounds];
                            newRounds[idx].name = e.target.value;
                            setWizardForm({ ...wizardForm, rounds: newRounds });
                          }}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
                        />
                        <select
                          value={round.type}
                          onChange={(e) => {
                            const newRounds = [...wizardForm.rounds];
                            newRounds[idx].type = e.target.value;
                            setWizardForm({ ...wizardForm, rounds: newRounds });
                          }}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
                        >
                          <option value="OA">Online Assessment</option>
                          <option value="Technical">Technical Interview</option>
                          <option value="HR">HR Interview</option>
                          <option value="GD">Group Discussion</option>
                          <option value="Aptitude">Aptitude Test</option>
                        </select>
                        <select
                          value={round.mode}
                          onChange={(e) => {
                            const newRounds = [...wizardForm.rounds];
                            newRounds[idx].mode = e.target.value;
                            setWizardForm({ ...wizardForm, rounds: newRounds });
                          }}
                          className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
                        >
                          <option value="Online">Online</option>
                          <option value="Offline">Offline</option>
                          <option value="Hybrid">Hybrid</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Eligibility Rules & Live Preview */}
            {wizardStep === 3 && (
              <div className="space-y-5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Minimum Undergrad CGPA</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={wizardForm.eligibilityRules.minCgpa}
                      onChange={(e) => {
                        const newRules = {
                          ...wizardForm.eligibilityRules,
                          minCgpa: parseFloat(e.target.value) || 0,
                        };
                        setWizardForm({ ...wizardForm, eligibilityRules: newRules });
                        triggerEligibilityPreview(newRules);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Max Active Backlogs Allowed</label>
                    <input
                      type="number"
                      min="0"
                      value={wizardForm.eligibilityRules.maxBacklogs}
                      onChange={(e) => {
                        const newRules = {
                          ...wizardForm.eligibilityRules,
                          maxBacklogs: parseInt(e.target.value, 10) || 0,
                        };
                        setWizardForm({ ...wizardForm, eligibilityRules: newRules });
                        triggerEligibilityPreview(newRules);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                {/* Branches Allowed */}
                <div>
                  <label className="text-slate-400 font-semibold block mb-2">Eligible Engineering Branches</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      'Computer Science',
                      'Information Technology',
                      'Electronics & Communication',
                      'Mechanical Engineering',
                      'Electrical & Electronics',
                      'Civil Engineering',
                    ].map((branch) => {
                      const isChecked = wizardForm.eligibilityRules.allowedBranches.includes(branch);
                      return (
                        <label
                          key={branch}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                            isChecked
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...wizardForm.eligibilityRules.allowedBranches, branch]
                                : wizardForm.eligibilityRules.allowedBranches.filter((b) => b !== branch);
                              const newRules = { ...wizardForm.eligibilityRules, allowedBranches: updated };
                              setWizardForm({ ...wizardForm, eligibilityRules: newRules });
                              triggerEligibilityPreview(newRules);
                            }}
                            className="rounded border-slate-700 text-emerald-500"
                          />
                          <span className="truncate">{branch}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Live Eligibility Preview Pill */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-950 to-slate-950 border border-emerald-600/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-white text-xs">Live Eligibility Telemetry</span>
                    </div>
                    {previewLoading && <span className="text-[10px] text-emerald-400 animate-pulse">Recalculating...</span>}
                  </div>

                  {eligibilityPreview ? (
                    <div>
                      <div className="text-xl font-black text-emerald-400">
                        {eligibilityPreview.eligibleCount} candidates eligible{' '}
                        <span className="text-xs text-slate-400 font-normal">
                          out of {eligibilityPreview.totalVerified} verified students ({eligibilityPreview.eligiblePercentage}%)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {eligibilityPreview.sampleStudents.map((s) => (
                          <span key={s.id} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 font-mono">
                            {s.rollNo} ({s.branch.slice(0, 3)})
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[11px]">Adjust criteria to calculate matching student cohort.</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Final Review & Publishing */}
            {wizardStep === 4 && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="font-bold text-white text-xs">Drive Summary Review</h4>
                  <div className="grid grid-cols-2 gap-3 text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Company & Role</span>
                      <strong className="text-white">{wizardForm.companyName}</strong> — {wizardForm.title}
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">CTC Package</span>
                      <strong className="text-emerald-400">{wizardForm.fixedCtc + wizardForm.variableCtc} LPA</strong> ({wizardForm.fixedCtc}L Fixed)
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Application Deadline</span>
                      {wizardForm.deadline || 'Immediate'}
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Eligible Cohort</span>
                      {eligibilityPreview?.eligibleCount || 0} students meet criteria
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Service Bond / Agreement Terms</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 year service agreement or None"
                    value={wizardForm.bondDetails}
                    onChange={(e) => setWizardForm({ ...wizardForm, bondDetails: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
            )}

            {/* Modal Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              {wizardStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep((s) => s - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
                >
                  &larr; Back
                </button>
              ) : (
                <div></div>
              )}

              <div className="flex items-center gap-2">
                {wizardStep === 4 ? (
                  <>
                    <button
                      type="button"
                      disabled={submittingDrive}
                      onClick={() => handleCreateDriveSubmit('Draft')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                    >
                      Save as Draft
                    </button>
                    <button
                      type="button"
                      disabled={submittingDrive}
                      onClick={() => handleCreateDriveSubmit('Open')}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20"
                    >
                      {submittingDrive ? 'Publishing...' : 'Publish Drive Now'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (wizardStep === 1 && (!wizardForm.title || !wizardForm.companyName || !wizardForm.deadline)) {
                        showToast('Please fill company name, title, and deadline', 'error');
                        return;
                      }
                      setWizardStep((s) => s + 1);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI JD Parser Modal */}
      {isJdParserOpen && (
        <TpoJdParserModal
          onClose={() => setIsJdParserOpen(false)}
          onApplyStructuredJd={(parsed) => {
            setWizardForm((prev) => ({
              ...prev,
              title: parsed.title || prev.title,
              companyName: parsed.companyName || prev.companyName,
              fixedCtc: parsed.ctc?.fixed || prev.fixedCtc,
              variableCtc: parsed.ctc?.variable || prev.variableCtc,
              rounds: parsed.rounds?.length ? parsed.rounds : prev.rounds,
              eligibilityRules: {
                ...prev.eligibilityRules,
                minCgpa: parsed.eligibilityRules?.minCgpa ?? prev.eligibilityRules.minCgpa,
                maxBacklogs: parsed.eligibilityRules?.maxBacklogs ?? prev.eligibilityRules.maxBacklogs,
                allowedBranches: parsed.eligibilityRules?.allowedBranches?.length ? parsed.eligibilityRules.allowedBranches : prev.eligibilityRules.allowedBranches,
              },
              description: parsed.description || prev.description,
            }));
            setIsWizardOpen(true);
            setWizardStep(1);
            showToast('Prefilled drive form from parsed JD!');
          }}
        />
      )}
    </div>
  );
}
