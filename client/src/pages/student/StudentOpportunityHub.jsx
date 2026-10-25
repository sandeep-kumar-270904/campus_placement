import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  DollarSign,
  ChevronRight,
  Info,
  X,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Check,
  BookOpen,
  ShieldAlert,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import studentService from '../../services/studentService';
import policyService from '../../services/policyService';
import { useTenant } from '../../context/TenantContext';
import AiResumeMatchModal from '../../components/ai/AiResumeMatchModal';
import CompanyPrepPackModal from '../../components/ai/CompanyPrepPackModal';

export default function StudentOpportunityHub() {
  const { branding, formatGrade } = useTenant();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState([]);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [jobType, setJobType] = useState('all');
  const [closingSoon, setClosingSoon] = useState(searchParams.get('closingSoon') === 'true');
  const [ctcMin, setCtcMin] = useState('');

  // Modals
  const [eligibilityModalDrive, setEligibilityModalDrive] = useState(null);
  const [applyModalDrive, setApplyModalDrive] = useState(null);
  const [withdrawModalDrive, setWithdrawModalDrive] = useState(null);
  const [resumeMatchDrive, setResumeMatchDrive] = useState(null);
  const [prepPackCompany, setPrepPackCompany] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });

  // Policy Exception Appeal States
  const [policyBlockedAlert, setPolicyBlockedAlert] = useState(null);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealDrive, setAppealDrive] = useState(null);
  const [appealForm, setAppealForm] = useState({
    justification: '',
    documentName: '',
    documentUrl: '',
    policyType: 'general',
  });
  const [submittingAppeal, setSubmittingAppeal] = useState(false);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        q: searchQuery,
        eligibleOnly: eligibleOnly ? 'true' : 'false',
        jobType: jobType !== 'all' ? jobType : undefined,
        closingSoon: closingSoon ? 'true' : 'false',
        ctcMin: ctcMin ? Number(ctcMin) : undefined,
      };

      const res = await studentService.getOpportunities(params);
      setOpportunities(res.opportunities || []);
    } catch (err) {
      console.error('Failed to load opportunities:', err);
      setError(err?.response?.data?.error?.message || 'Failed to fetch campus drives.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [eligibleOnly, jobType, closingSoon]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOpportunities();
  };

  const handleApplyConfirm = async () => {
    if (!applyModalDrive) return;
    try {
      setActionLoading(true);
      setActionMsg({ type: '', text: '' });
      await studentService.applyOpportunity(applyModalDrive.id || applyModalDrive._id);
      setActionMsg({
        type: 'success',
        text: `🎉 Successfully applied to ${applyModalDrive.companyName} for ${applyModalDrive.title}!`,
      });
      setApplyModalDrive(null);
      setTimeout(() => setActionMsg({ type: '', text: '' }), 5000);
      fetchOpportunities();
    } catch (err) {
      const errRes = err?.response?.data;
      const errorObj = errRes?.error;
      const errorMsg = errorObj?.message || errRes?.message || 'Failed to submit application.';

      if (errorObj?.code?.startsWith('POLICY_') || errorObj?.canRequestException) {
        setPolicyBlockedAlert({
          drive: applyModalDrive,
          code: errorObj.code,
          message: errorMsg,
          policyType: errorObj.policyType || 'general',
          blockingReasons: errorObj.blockingReasons || [],
        });
      }

      setActionMsg({
        type: 'error',
        text: errorMsg,
      });
      setApplyModalDrive(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitAppeal = async (e) => {
    e.preventDefault();
    if (!appealDrive) return;
    if (!appealForm.justification.trim() || appealForm.justification.trim().length < 10) {
      setActionMsg({
        type: 'error',
        text: 'Please write a justification of at least 10 characters for your appeal.',
      });
      return;
    }
    try {
      setSubmittingAppeal(true);
      const docs = appealForm.documentUrl
        ? [{ name: appealForm.documentName || 'Supporting_Proof.pdf', url: appealForm.documentUrl }]
        : [];
      await policyService.submitException({
        opportunityId: appealDrive.id || appealDrive._id,
        policyType: appealForm.policyType,
        justification: appealForm.justification.trim(),
        documents: docs,
      });
      setActionMsg({
        type: 'success',
        text: 'Your policy exception appeal has been submitted to the TPO moderation queue.',
      });
      setShowAppealModal(false);
      setPolicyBlockedAlert(null);
      setAppealForm({ justification: '', documentName: '', documentUrl: '', policyType: 'general' });
    } catch (err) {
      setActionMsg({
        type: 'error',
        text: err?.response?.data?.error?.message || 'Failed to submit exception appeal.',
      });
    } finally {
      setSubmittingAppeal(false);
    }
  };

  const handleWithdrawConfirm = async () => {
    if (!withdrawModalDrive) return;
    try {
      setActionLoading(true);
      setActionMsg({ type: '', text: '' });
      await studentService.withdrawApplication(withdrawModalDrive.id || withdrawModalDrive._id);
      setActionMsg({
        type: 'success',
        text: `Application for ${withdrawModalDrive.companyName} has been withdrawn.`,
      });
      setWithdrawModalDrive(null);
      setTimeout(() => setActionMsg({ type: '', text: '' }), 5000);
      fetchOpportunities();
    } catch (err) {
      setActionMsg({
        type: 'error',
        text: err?.response?.data?.error?.message || 'Failed to withdraw application.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-white">Campus Opportunity Hub</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {opportunities.length} Active Drives
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time corporate placement drives with explanatory eligibility modeling & one-click application.
          </p>
        </div>

        {/* Global Action Notifications */}
        {actionMsg.text && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
              actionMsg.type === 'success'
                ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
                : 'bg-rose-950/70 border-rose-700 text-rose-300'
            }`}
          >
            {actionMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{actionMsg.text}</span>
          </div>
        )}
      </div>

      {/* Policy Blocked Alert Banner with 1-Click Appeal */}
      {policyBlockedAlert && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                Institutional Placement Policy Block
              </span>
              <p className="text-xs font-semibold text-white mt-0.5">
                {policyBlockedAlert.message}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Target Drive: {policyBlockedAlert.drive?.companyName} - {policyBlockedAlert.drive?.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => {
                setAppealDrive(policyBlockedAlert.drive);
                setAppealForm((prev) => ({
                  ...prev,
                  policyType: policyBlockedAlert.policyType || 'general',
                }));
                setShowAppealModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm transition cursor-pointer"
            >
              Appeal for TPO Exception
            </button>
            <button
              onClick={() => setPolicyBlockedAlert(null)}
              className="p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, role title, skills or location..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Role Types</option>
              <option value="Full-time">Full-time (FTE)</option>
              <option value="Internship">Internship</option>
              <option value="Internship + FTE">Internship + FTE</option>
            </select>

            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition"
            >
              Filter
            </button>
          </div>
        </form>

        {/* Filter Toggles */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={eligibleOnly}
                onChange={(e) => setEligibleOnly(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700 focus:ring-emerald-500"
              />
              <span className={`font-semibold ${eligibleOnly ? 'text-emerald-400' : 'text-slate-300'}`}>
                Show Eligible Only
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={closingSoon}
                onChange={(e) => setClosingSoon(e.target.checked)}
                className="w-4 h-4 rounded text-rose-500 bg-slate-800 border-slate-700 focus:ring-rose-500"
              />
              <span className={`font-semibold ${closingSoon ? 'text-rose-400' : 'text-slate-300'}`}>
                Closing Soon (&lt; 48h)
              </span>
            </label>
          </div>

          <div className="text-[11px] text-slate-400">
            Showing <span className="font-semibold text-white">{opportunities.length}</span> matching drives
          </div>
        </div>
      </div>

      {/* Drives Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Filtering opportunities and computing explanatory eligibility...</p>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
          <h2 className="text-sm font-bold text-white">No Matching Campus Drives</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {eligibleOnly
              ? 'No drives meet your current eligibility parameters. Try unchecking "Show Eligible Only" to view what-if actions.'
              : 'There are currently no active placement drives matching your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {opportunities.map((drive) => {
            const isEligible = drive.eligibility?.isEligible;
            const failedRulesCount = drive.eligibility?.reasons?.filter((r) => r.status === 'failed').length || 0;
            const hasApplied = drive.hasApplied;
            const isDeadlinePassed = drive.deadline && new Date() > new Date(drive.deadline);

            return (
              <div
                key={drive.id || drive._id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-lg hover:shadow-xl space-y-4"
              >
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <h2 className="text-sm font-bold text-white leading-tight">{drive.companyName}</h2>
                      <p className="text-xs font-semibold text-emerald-400">{drive.title}</p>
                    </div>

                    {/* Explanatory Eligibility Tag */}
                    <button
                      onClick={() => setEligibilityModalDrive(drive)}
                      title="Click for full rule-by-rule explanatory breakdown"
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition ${
                        isEligible
                          ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {isEligible ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Eligible
                        </>
                      ) : (
                        <>
                          <Info className="w-3 h-3" /> Ineligible ({failedRulesCount})
                        </>
                      )}
                    </button>
                  </div>

                  {/* Badges / Meta */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{drive.ctc?.total || drive.salary || 'Best in Market'} LPA</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{drive.location || 'Pan India'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-teal-400" />
                      <span>{drive.jobType || drive.type || 'Full-time'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="truncate">
                        {drive.deadline ? new Date(drive.deadline).toLocaleDateString() : 'Rolling'}
                      </span>
                    </div>
                  </div>

                  {/* Summary / Criteria Snippet */}
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300 space-y-1">
                    <p className="font-semibold text-slate-200">Institutional Criteria:</p>
                    <p className="text-slate-400">
                      Min CGPA: <span className="text-white">{drive.eligibilityRules?.minCgpa ?? 'None'}</span> • Max
                      Backlogs: <span className="text-white">{drive.eligibilityRules?.maxBacklogs ?? 0}</span>
                    </p>
                    {drive.eligibilityRules?.allowedBranches?.length > 0 && (
                      <p className="text-slate-400 truncate">
                        Branches: {drive.eligibilityRules.allowedBranches.join(', ')}
                      </p>
                    )}
                  </div>

                  {/* AI Intelligence Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setResumeMatchDrive(drive)}
                      className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Check Resume</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrepPackCompany(drive.companyName)}
                      className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-semibold transition cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Company Prep</span>
                    </button>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setEligibilityModalDrive(drive)}
                    className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition flex items-center gap-1"
                  >
                    <span>Eligibility Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {hasApplied ? (
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                        Applied
                      </span>
                      {!isDeadlinePassed && (
                        <button
                          onClick={() => setWithdrawModalDrive(drive)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-900/40 text-xs font-medium transition"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setApplyModalDrive(drive)}
                      disabled={!isEligible || isDeadlinePassed}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                        isEligible && !isDeadlinePassed
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <span>{isDeadlinePassed ? 'Deadline Closed' : isEligible ? 'Apply Now' : 'Ineligible'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Explanatory Eligibility Modal with Reasons & What-If */}
      {eligibilityModalDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {eligibilityModalDrive.companyName} — Eligibility Breakdown
                  </h3>
                  <p className="text-[11px] text-slate-400">{eligibilityModalDrive.title}</p>
                </div>
              </div>
              <button
                onClick={() => setEligibilityModalDrive(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Overall Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center gap-3 ${
                  eligibilityModalDrive.eligibility?.isEligible
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                }`}
              >
                {eligibilityModalDrive.eligibility?.isEligible ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                )}
                <div>
                  <p className="text-xs font-bold text-white">
                    {eligibilityModalDrive.eligibility?.isEligible
                      ? 'Congratulations! You are eligible for this recruitment drive.'
                      : 'You do not meet one or more institutional eligibility rules for this drive.'}
                  </p>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    {eligibilityModalDrive.eligibility?.summary || 'Review criteria below.'}
                  </p>
                </div>
              </div>

              {/* Rule-by-Rule Explanatory Breakdown Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Rule-by-Rule Assessment ({eligibilityModalDrive.eligibility?.passedCount || 0} /{' '}
                  {eligibilityModalDrive.eligibility?.totalRules || 0} Met)
                </h4>

                <div className="space-y-2">
                  {(eligibilityModalDrive.eligibility?.reasons || []).map((reason, idx) => {
                    const isPassed = reason.status === 'passed';
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          isPassed
                            ? 'bg-slate-800/40 border-slate-700/60'
                            : 'bg-amber-950/20 border-amber-800/40'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${isPassed ? 'bg-emerald-400' : 'bg-amber-400'}`}
                            />
                            <span className="text-xs font-bold text-white">{reason.rule}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 font-medium">{reason.message}</p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400">
                            <span>Required: {String(reason.required)}</span>
                            <span>•</span>
                            <span>Actual: {String(reason.actual)}</span>
                            {reason.gap !== null && reason.gap !== undefined && (
                              <>
                                <span>•</span>
                                <span className="text-amber-400 font-semibold">Gap: {String(reason.gap)}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <span
                          className={`self-start sm:self-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            isPassed
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {isPassed ? 'Passed' : 'Not Met'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* "Will be eligible if" What-If Advice Card */}
              {(eligibilityModalDrive.eligibility?.whatIf || []).length > 0 && (
                <div className="bg-slate-800/60 border border-teal-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                      "Will be eligible if" What-If Guidance
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {eligibilityModalDrive.eligibility.whatIf.map((action, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-800 border border-slate-700/80 space-y-1">
                        <p className="text-xs font-semibold text-white">{action.description}</p>
                        <p className="text-[11px] text-emerald-400 font-medium">Impact: {action.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-end gap-3">
              <button
                onClick={() => setEligibilityModalDrive(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              {eligibilityModalDrive.eligibility?.isEligible && !eligibilityModalDrive.hasApplied && (
                <button
                  onClick={() => {
                    setApplyModalDrive(eligibilityModalDrive);
                    setEligibilityModalDrive(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Proceed to Apply
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Apply Confirmation Dialog */}
      {applyModalDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Confirm Application</h3>
                <p className="text-xs text-slate-400">{applyModalDrive.companyName}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are applying for the role of <span className="font-semibold text-white">{applyModalDrive.title}</span>{' '}
              ({applyModalDrive.ctc?.total || applyModalDrive.salary} LPA).
            </p>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">The following will be shared with the recruiter:</p>
              <p>• Verified Institutional Academic Record & CGPA</p>
              <p>• Active Primary Resume & Contact Details</p>
              <p>• Placement Cell Cryptographic Seal</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setApplyModalDrive(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyConfirm}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition disabled:opacity-50"
              >
                {actionLoading ? 'Submitting...' : 'Confirm & Apply'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Confirmation Dialog */}
      {withdrawModalDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Withdraw Application</h3>
                <p className="text-xs text-slate-400">{withdrawModalDrive.companyName}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to withdraw your formal application for{' '}
              <span className="font-semibold text-white">{withdrawModalDrive.title}</span>?
            </p>
            <p className="text-[11px] text-amber-400">
              Note: You can only withdraw while the application deadline remains open.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setWithdrawModalDrive(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Keep Application
              </button>
              <button
                type="button"
                onClick={handleWithdrawConfirm}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition disabled:opacity-50"
              >
                {actionLoading ? 'Withdrawing...' : 'Yes, Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Resume Match Modal */}
      {resumeMatchDrive && (
        <AiResumeMatchModal
          driveId={resumeMatchDrive.id || resumeMatchDrive._id}
          driveTitle={`${resumeMatchDrive.companyName} — ${resumeMatchDrive.title}`}
          onClose={() => setResumeMatchDrive(null)}
        />
      )}

      {/* AI Company Prep Pack Modal */}
      {prepPackCompany && (
        <CompanyPrepPackModal
          companyName={prepPackCompany}
          onClose={() => setPrepPackCompany(null)}
        />
      )}

      {/* Student Policy Exception Appeal Modal */}
      {showAppealModal && appealDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleSubmitAppeal}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Appeal for Policy Exception</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAppealModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <span className="text-[10px] uppercase font-bold text-indigo-400 block">Target Drive</span>
              <p className="font-semibold text-white">
                {appealDrive.companyName} — {appealDrive.title}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Policy Category *</label>
                <select
                  value={appealForm.policyType}
                  onChange={(e) => setAppealForm({ ...appealForm, policyType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="general">General Policy Exception</option>
                  <option value="one_student_one_offer">One-Student-One-Offer Exemption</option>
                  <option value="dream_cap">Dream Tier Cap Exemption</option>
                  <option value="tier_eligibility">Tier Progression Exemption</option>
                  <option value="max_concurrent_apps">Concurrent Applications Waiver</option>
                  <option value="cgpa_exception">Academic / CGPA Exception</option>
                  <option value="backlog_waiver">Backlog Waiver</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Written Justification / Statement * (Min 10 characters)
                </label>
                <textarea
                  placeholder="Provide your specific reasoning, academic context, or career rationale to the TPO moderation committee..."
                  value={appealForm.justification}
                  onChange={(e) => setAppealForm({ ...appealForm, justification: e.target.value })}
                  required
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Supporting Document Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dean_Approval_Letter.pdf"
                    value={appealForm.documentName}
                    onChange={(e) => setAppealForm({ ...appealForm, documentName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Document Link / URL</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={appealForm.documentUrl}
                    onChange={(e) => setAppealForm({ ...appealForm, documentUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAppealModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAppeal}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
              >
                {submittingAppeal ? 'Submitting Appeal...' : 'Submit Appeal to TPO'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
