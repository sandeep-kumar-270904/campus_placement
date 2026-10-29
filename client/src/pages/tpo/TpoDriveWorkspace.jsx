import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Building2,
  Calendar,
  Clock,
  Columns3,
  List,
  Upload,
  Download,
  Plus,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  Star,
  Award,
  ChevronLeft,
  X,
  History,
  Send,
  MessageSquare,
  Sparkles,
  UserPlus,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import tpoService from '../../services/tpoService';
import TpoFeedbackApprovalModal from '../../components/tpo/TpoFeedbackApprovalModal';

const KANBAN_STAGES = [
  { key: 'Applied', title: 'Applied', color: 'border-slate-700 bg-slate-900/60' },
  { key: 'Online Assessment', title: 'Online Assessment', color: 'border-blue-500/40 bg-blue-950/20' },
  { key: 'Technical Round', title: 'Technical Interview', color: 'border-purple-500/40 bg-purple-950/20' },
  { key: 'HR Round', title: 'HR Round', color: 'border-amber-500/40 bg-amber-950/20' },
  { key: 'Offer Extended', title: 'Offer Extended', color: 'border-teal-500/40 bg-teal-950/20' },
  { key: 'Placed', title: 'Placed', color: 'border-emerald-500/40 bg-emerald-950/20' },
];

export default function TpoDriveWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workspaceData, setWorkspaceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pipeline'); // 'overview', 'eligible', 'applicants', 'pipeline', 'schedule', 'feedback', 'offers', 'activity'
  const [pipelineView, setPipelineView] = useState('kanban'); // 'kanban' or 'table'

  // Non-applicants
  const [eligibleNonApplicants, setEligibleNonApplicants] = useState([]);

  // Shortlist Modal
  const [shortlistModalOpen, setShortlistModalOpen] = useState(false);
  const [shortlistFile, setShortlistFile] = useState(null);
  const [shortlistResult, setShortlistResult] = useState(null);
  const [targetRound, setTargetRound] = useState('Technical Round');
  const [shortlistLoading, setShortlistLoading] = useState(false);

  // Scorecard / Feedback Modal
  const [feedbackModalApp, setFeedbackModalApp] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 4,
    strengths: '',
    gaps: '',
    comments: '',
    visibleToStudent: false,
  });

  // Offer Extension Modal
  const [offerModalApp, setOfferModalApp] = useState(null);
  const [offerForm, setOfferForm] = useState({
    ctc: 20,
    fixedCtc: 16,
    variableCtc: 4,
    role: '',
    joiningDate: '2026-07-01',
    remarks: 'Standard joining conditions apply',
  });

  // Reject Modal
  const [rejectModalApp, setRejectModalApp] = useState(null);
  const [rejectReason, setRejectReason] = useState('Did not clear round assessment threshold');

  // AI Feedback Approval Modal
  const [reviewFeedbackData, setReviewFeedbackData] = useState(null);

  // JD Review State
  const [jdReviewRemarks, setJdReviewRemarks] = useState('');
  const [jdReviewLoading, setJdReviewLoading] = useState(false);

  // Recruiter Proposed Offer Review Modal
  const [reviewOfferModalApp, setReviewOfferModalApp] = useState(null);
  const [reviewOfferRemarks, setReviewOfferRemarks] = useState('');
  const [reviewOfferBypassWarning, setReviewOfferBypassWarning] = useState(false);
  const [reviewOfferLoading, setReviewOfferLoading] = useState(false);

  // Invite Drive Recruiter Modal
  const [inviteRecruiterModalOpen, setInviteRecruiterModalOpen] = useState(false);
  const [inviteRecruiterEmail, setInviteRecruiterEmail] = useState('');
  const [inviteRecruiterName, setInviteRecruiterName] = useState('');
  const [inviteRecruiterResult, setInviteRecruiterResult] = useState(null);
  const [inviteRecruiterLoading, setInviteRecruiterLoading] = useState(false);
  const [copiedDriveInviteLink, setCopiedDriveInviteLink] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchWorkspace = useCallback(async () => {
    try {
      setLoading(true);
      const res = await tpoService.getDriveWorkspace(id);
      setWorkspaceData(res);
    } catch (err) {
      console.error(err);
      showToast('Failed to load drive workspace', 'error');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWorkspace();
  }, [fetchWorkspace]);

  // Fetch eligible non-applicants when clicking that tab
  useEffect(() => {
    if (activeTab === 'eligible') {
      const fetchEligible = async () => {
        try {
          const res = await tpoService.getEligibleNonApplicants ? (await fetch(`/api/tpo/drives/${id}/eligible-non-applicants`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })).json() : { students: [] };
          setEligibleNonApplicants(res.students || []);
        } catch (err) {
          console.error(err);
        }
      };
      fetchEligible();
    }
  }, [activeTab, id]);

  const drive = workspaceData?.drive;
  const applicants = workspaceData?.applicants || [];

  // Advance Candidate Action
  const handleAdvance = async (appId, targetStatus, nextRound) => {
    try {
      await tpoService.advanceApplicants(id, {
        applicationIds: [appId],
        targetStatus,
        targetRound: nextRound,
      });
      showToast(`Advanced candidate to ${targetStatus}`);
      fetchWorkspace();
    } catch (err) {
      showToast('Failed to advance candidate', 'error');
    }
  };

  // Reject Candidate Action
  const handleReject = async () => {
    if (!rejectModalApp) return;
    try {
      await tpoService.advanceApplicants(id, {
        applicationIds: [rejectModalApp.id],
        targetStatus: 'Rejected',
        rejectionReason: rejectReason,
      });
      showToast(`Candidate marked as Rejected`);
      setRejectModalApp(null);
      fetchWorkspace();
    } catch (err) {
      showToast('Failed to reject candidate', 'error');
    }
  };

  // Shortlist Upload Preview
  const handleShortlistFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setShortlistFile(file);
    try {
      setShortlistLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await tpoService.uploadShortlist(id, formData);
      setShortlistResult(res);
    } catch (err) {
      showToast('Failed to parse shortlist file', 'error');
    } finally {
      setShortlistLoading(false);
    }
  };

  // Shortlist Commit
  const handleConfirmShortlistMove = async () => {
    if (!shortlistResult?.matched?.length) return;
    try {
      const appIds = shortlistResult.matched.map((m) => m.applicationId);
      await tpoService.advanceApplicants(id, {
        applicationIds: appIds,
        targetStatus: targetRound.includes('HR') ? 'HR Round' : targetRound.includes('Offer') ? 'Offer Extended' : 'Technical Round',
        targetRound,
      });
      showToast(`Shortlisted and moved ${appIds.length} candidate(s) to ${targetRound}`);
      setShortlistModalOpen(false);
      setShortlistFile(null);
      setShortlistResult(null);
      fetchWorkspace();
    } catch (err) {
      showToast('Failed to advance shortlisted candidates', 'error');
    }
  };

  // Submit Feedback
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackModalApp) return;
    try {
      await tpoService.submitRoundFeedback(id, feedbackModalApp.id, {
        ...feedbackForm,
        roundName: feedbackModalApp.currentRound,
      });
      showToast('Interview scorecard recorded');
      setFeedbackModalApp(null);
      fetchWorkspace();
    } catch (err) {
      showToast('Failed to submit scorecard', 'error');
    }
  };

  // Extend Offer Submit
  const handleExtendOfferSubmit = async (e) => {
    e.preventDefault();
    if (!offerModalApp) return;
    try {
      await tpoService.extendOffer(id, offerModalApp.id, offerForm);
      showToast('Formal placement offer extended successfully!');
      setOfferModalApp(null);
      fetchWorkspace();
    } catch (err) {
      showToast('Failed to extend offer', 'error');
    }
  };

  // Review Recruiter Proposed JD Changes
  const handleReviewProposedJd = async (decision) => {
    try {
      setJdReviewLoading(true);
      await tpoService.reviewProposedJd(id, {
        decision,
        tpoRemarks: jdReviewRemarks,
      });
      showToast(`Recruiter JD revisions ${decision.toLowerCase()} successfully!`);
      setJdReviewRemarks('');
      fetchWorkspace();
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to review JD revisions', 'error');
    } finally {
      setJdReviewLoading(false);
    }
  };

  // Review Recruiter Proposed Offer
  const handleReviewProposedOffer = async (decision) => {
    if (!reviewOfferModalApp) return;
    try {
      setReviewOfferLoading(true);
      await tpoService.reviewProposedOffer(reviewOfferModalApp.id, {
        decision,
        tpoRemarks: reviewOfferRemarks,
        bypassPolicyWarning: reviewOfferBypassWarning,
      });
      showToast(
        decision === 'Approved'
          ? '🎉 Recruiter offer approved and formally extended to student!'
          : 'Offer proposal rejected and recruiter notified.'
      );
      setReviewOfferModalApp(null);
      setReviewOfferRemarks('');
      setReviewOfferBypassWarning(false);
      fetchWorkspace();
    } catch (err) {
      const errData = err.response?.data?.error;
      if (errData?.requiresOverride) {
        setReviewOfferBypassWarning(true);
      }
      showToast(errData?.message || 'Failed to process offer review', 'error');
    } finally {
      setReviewOfferLoading(false);
    }
  };

  // Invite Recruiter to this Drive
  const handleInviteDriveRecruiter = async (e) => {
    e.preventDefault();
    try {
      setInviteRecruiterLoading(true);
      const res = await tpoService.inviteRecruiter({
        email: inviteRecruiterEmail,
        firstName: inviteRecruiterName.split(' ')[0] || 'Recruiter',
        lastName: inviteRecruiterName.split(' ').slice(1).join(' ') || '',
        companyId: drive.companyId || undefined,
        companyName: drive.companyName,
        driveIds: [drive.id || drive._id],
      });
      setInviteRecruiterResult(res);
      showToast('Recruiter invitation issued and linked to this drive!');
      fetchWorkspace();
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to invite recruiter', 'error');
    } finally {
      setInviteRecruiterLoading(false);
    }
  };

  const handleCopyDriveInviteLink = () => {
    if (!inviteRecruiterResult?.inviteUrl && !inviteRecruiterResult?.inviteToken) return;
    const url =
      inviteRecruiterResult.inviteUrl ||
      `${window.location.origin}/recruiter/accept-invite?token=${inviteRecruiterResult.inviteToken}`;
    navigator.clipboard.writeText(url);
    setCopiedDriveInviteLink(true);
    setTimeout(() => setCopiedDriveInviteLink(false), 2500);
  };

  if (loading) {
    return <div className="py-24 text-center text-xs text-slate-400">Loading drive recruitment workspace...</div>;
  }

  if (!drive) {
    return (
      <div className="py-20 text-center rounded-2xl bg-slate-900 border border-slate-800">
        <h3 className="text-base font-bold text-white mb-2">Drive Not Found</h3>
        <button onClick={() => navigate('/tpo/drives')} className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-white">
          Return to Drives Roster
        </button>
      </div>
    );
  }

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

      {/* Top Banner & Quick Controls */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/tpo/drives')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            title="Back to Drives"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {drive.companyLogo ? (
            <img src={drive.companyLogo} alt={drive.companyName} className="w-12 h-12 rounded-2xl object-contain bg-white p-1.5" />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-lg flex items-center justify-center">
              {drive.companyName?.charAt(0)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">{drive.title}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                {drive.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              {drive.companyName} • <span className="text-emerald-400 font-bold">{drive.salary}</span> • {drive.location}
            </p>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShortlistModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            Upload Shortlist (CSV)
          </button>
          <button
            onClick={() => navigate(`/tpo/schedule?driveId=${drive.id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            Schedule
          </button>
          <button
            onClick={() => {
              setInviteRecruiterResult(null);
              setCopiedDriveInviteLink(false);
              setInviteRecruiterEmail('');
              setInviteRecruiterName('');
              setInviteRecruiterModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition shadow-sm cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Invite Recruiter
          </button>
        </div>
      </div>

      {/* Proposed JD Revisions Banner */}
      {drive?.proposedJd?.status === 'Pending_Approval' && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 shadow-xl space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  Corporate Recruiter Proposed Job Description Revisions
                </h3>
                <p className="text-xs text-amber-300/80">
                  The recruiter submitted revised compensation, criteria, or rounds for placement cell review and endorsement.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px] uppercase tracking-wider shrink-0">
              Pending TPO Endorsement
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-amber-500/20 text-xs text-slate-300">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Proposed Title</span>
              <span className="font-semibold text-white">{drive.proposedJd.title || drive.title}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Proposed CTC & Salary</span>
              <span className="font-semibold text-emerald-400">
                {drive.proposedJd.salary || (drive.proposedJd.ctc?.total ? `${drive.proposedJd.ctc.total / 100000} LPA` : drive.salary)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Min CGPA & Backlogs</span>
              <span className="font-semibold text-white">
                CGPA &gt;= {drive.proposedJd.eligibilityRules?.minCgpa ?? drive.eligibilityRules?.minCgpa ?? 'N/A'}, Max Backlogs: {drive.proposedJd.eligibilityRules?.maxBacklogs ?? drive.eligibilityRules?.maxBacklogs ?? 0}
              </span>
            </div>
          </div>

          {drive.proposedJd.description && (
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Proposed Job Summary:</span>
              <p className="line-clamp-2">{drive.proposedJd.description}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <input
              type="text"
              placeholder="Add TPO endorsement remarks or feedback (optional)..."
              value={jdReviewRemarks}
              onChange={(e) => setJdReviewRemarks(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            />
            <div className="flex items-center gap-2">
              <button
                disabled={jdReviewLoading}
                onClick={() => handleReviewProposedJd('Rejected')}
                className="px-3.5 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                Reject Revisions
              </button>
              <button
                disabled={jdReviewLoading}
                onClick={() => handleReviewProposedJd('Approved')}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition disabled:opacity-50 cursor-pointer"
              >
                {jdReviewLoading ? 'Processing...' : 'Approve & Apply to Drive'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8 Workspace Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-800 scrollbar-none text-xs">
        {[
          { id: 'pipeline', label: 'Recruitment Pipeline' },
          { id: 'applicants', label: `Applicants (${applicants.length})` },
          { id: 'eligible', label: 'Eligible Non-Applicants' },
          { id: 'overview', label: 'Drive Overview & JD' },
          { id: 'feedback', label: 'Scorecards & Feedback' },
          { id: 'offers', label: 'Offers Extended' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 font-bold transition whitespace-nowrap border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Pipeline (Kanban or Table) */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">View Style:</span>
              <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
                <button
                  onClick={() => setPipelineView('kanban')}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                    pipelineView === 'kanban' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Columns3 className="w-3.5 h-3.5" />
                  Kanban
                </button>
                <button
                  onClick={() => setPipelineView('table')}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                    pipelineView === 'table' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  Table
                </button>
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Drag or click card arrow to advance round
            </span>
          </div>

          {/* Kanban Board View */}
          {pipelineView === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 min-h-[60vh] overflow-x-auto pb-4">
              {KANBAN_STAGES.map((stage, stageIdx) => {
                const stageApps = applicants.filter((a) => {
                  if (stage.key === 'Applied') return !a.status || a.status === 'Applied';
                  return a.status === stage.key;
                });

                return (
                  <div key={stage.key} className={`rounded-2xl border p-3 flex flex-col ${stage.color}`}>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                      <span className="font-extrabold text-xs text-white truncate">{stage.title}</span>
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center">
                        {stageApps.length}
                      </span>
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto max-h-[550px] pr-1">
                      {stageApps.length === 0 ? (
                        <div className="py-8 text-center text-[10px] text-slate-600">No candidates in stage</div>
                      ) : (
                        stageApps.map((candidate) => (
                          <div
                            key={candidate.id}
                            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-2 shadow-sm text-xs group"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-bold text-white group-hover:text-emerald-400 transition">{candidate.studentName}</p>
                                <p className="text-[10px] font-mono text-slate-500">{candidate.rollNo}</p>
                              </div>
                              <span className="text-emerald-400 font-mono font-bold text-[11px]">
                                {candidate.cgpa.toFixed(2)}
                              </span>
                            </div>

                            <div className="text-[10px] text-slate-400 flex items-center justify-between">
                              <span>{candidate.branch.slice(0, 3)}</span>
                              <span>{candidate.currentRound}</span>
                            </div>

                            {candidate.offer?.status === 'Proposed_By_Recruiter' && (
                              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-[10px] text-purple-300 space-y-1">
                                <div className="flex items-center justify-between font-bold">
                                  <span>Recruiter Offer</span>
                                  <span className="font-mono text-emerald-400">
                                    {candidate.offer.ctc ? `${candidate.offer.ctc > 1000 ? candidate.offer.ctc / 100000 : candidate.offer.ctc} LPA` : 'Pending'}
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    setReviewOfferModalApp(candidate);
                                    setReviewOfferRemarks('');
                                    setReviewOfferBypassWarning(false);
                                  }}
                                  className="w-full py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] transition text-center cursor-pointer"
                                >
                                  Review Proposal
                                </button>
                              </div>
                            )}

                            {/* Card Actions */}
                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                              <button
                                onClick={() => setRejectModalApp(candidate)}
                                className="text-[10px] text-red-400 hover:underline font-semibold"
                              >
                                Reject
                              </button>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setFeedbackModalApp(candidate)}
                                  className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                                  title="Add Scorecard"
                                >
                                  <Star className="w-3 h-3 text-amber-400" />
                                </button>
                                {stageIdx < KANBAN_STAGES.length - 1 && (
                                  <button
                                    onClick={() => {
                                      const nextStage = KANBAN_STAGES[stageIdx + 1];
                                      if (nextStage.key === 'Offer Extended') {
                                        setOfferModalApp(candidate);
                                      } else {
                                        handleAdvance(candidate.id, nextStage.key, nextStage.title);
                                      }
                                    }}
                                    className="p-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                    title="Advance to next round"
                                  >
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table Pipeline View */
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Roll No</th>
                    <th className="p-3">Candidate</th>
                    <th className="p-3">Branch</th>
                    <th className="p-3">CGPA</th>
                    <th className="p-3">Pipeline Stage</th>
                    <th className="p-3">Current Round</th>
                    <th className="p-3 text-right">Advance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {applicants.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-850">
                      <td className="p-3 font-mono font-bold text-white">{a.rollNo}</td>
                      <td className="p-3 font-bold text-white">{a.studentName}</td>
                      <td className="p-3 text-slate-300">{a.branch}</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">{a.cgpa.toFixed(2)}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px]">
                          {a.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{a.currentRound}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => setFeedbackModalApp(a)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                        >
                          Scorecard
                        </button>
                        <button
                          onClick={() => {
                            const curIdx = KANBAN_STAGES.findIndex((s) => s.key === a.status);
                            const nextStage = KANBAN_STAGES[curIdx + 1] || KANBAN_STAGES[KANBAN_STAGES.length - 1];
                            handleAdvance(a.id, nextStage.key, nextStage.title);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                        >
                          Advance &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Applicants Full Table */}
      {activeTab === 'applicants' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Roll No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Branch</th>
                <th className="p-3">CGPA</th>
                <th className="p-3">Status</th>
                <th className="p-3">Resume</th>
                <th className="p-3">Applied Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {applicants.map((a) => (
                <tr key={a.id} className="hover:bg-slate-850">
                  <td className="p-3 font-mono font-bold text-white">{a.rollNo}</td>
                  <td className="p-3 font-bold text-white">{a.studentName}</td>
                  <td className="p-3 text-slate-400">{a.email}</td>
                  <td className="p-3 text-slate-300">{a.branch}</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">{a.cgpa.toFixed(2)}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px]">
                      {a.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {a.resumeUrl ? (
                      <a href={a.resumeUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
                        Resume <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="p-3 text-slate-400 font-mono text-[11px]">
                    {new Date(a.appliedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Eligible Non-Applicants */}
      {activeTab === 'eligible' && (
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white">Eligible Students Awaiting Application</h3>
              <p className="text-[11px] text-slate-400">These candidates meet all CGPA, branch, and backlog criteria for {drive.companyName}.</p>
            </div>
            <button
              onClick={() => showToast(`Sent reminder broadcast to ${eligibleNonApplicants.length} eligible candidates`)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Nudge All Eligible ({eligibleNonApplicants.length})
            </button>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3">CGPA</th>
                  <th className="p-3">Backlogs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {eligibleNonApplicants.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-850">
                    <td className="p-3 font-mono font-bold text-white">{s.rollNo}</td>
                    <td className="p-3 font-bold text-white">{s.name}</td>
                    <td className="p-3 text-slate-400">{s.email}</td>
                    <td className="p-3 text-slate-300">{s.branch}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">{s.cgpa.toFixed(2)}</td>
                    <td className="p-3 text-slate-400">{s.backlogs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Overview & JD */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="md:col-span-2 space-y-5">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="font-bold text-white text-sm">Job Description & Responsibilities</h3>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{drive.description}</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="font-bold text-white text-sm">Recruitment Rounds Defined</h3>
              <div className="space-y-2">
                {drive.rounds?.map((r, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Round {r.roundNumber}: {r.name}</p>
                      <p className="text-[11px] text-slate-400">{r.type} • Mode: {r.mode}</p>
                    </div>
                    {r.venueOrLink && <span className="text-[11px] font-mono text-emerald-400">{r.venueOrLink}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="font-bold text-white text-sm">Eligibility Rules</h3>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Min CGPA</span>
                  <span className="font-mono font-bold text-emerald-400">{drive.eligibilityRules?.minCgpa || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Max Backlogs</span>
                  <span className="font-bold text-white">{drive.eligibilityRules?.maxBacklogs || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Branches</span>
                  <span className="font-bold text-white truncate max-w-[150px]">
                    {drive.eligibilityRules?.allowedBranches?.join(', ') || 'All'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Service Bond</span>
                  <span className="font-bold text-slate-300">{drive.bondDetails || 'None'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Feedback Scorecards */}
      {activeTab === 'feedback' && (
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white">Interviewer Scorecards & Candidate Feedback</h3>
            <span className="text-slate-400 text-[11px]">Recorded across Technical & HR rounds</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applicants
              .filter((a) => a.feedback?.length > 0)
              .map((app) => (
                <div key={app.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <h4 className="font-bold text-white">{app.studentName}</h4>
                      <p className="text-[10px] font-mono text-slate-500">{app.rollNo} • {app.branch}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px]">
                      {app.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {app.feedback.map((fb, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-400">{fb.roundName}</span>
                          <div className="flex items-center text-amber-400">
                            {[...Array(fb.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        {fb.strengths && <p className="text-slate-300"><strong>Strengths:</strong> {fb.strengths}</p>}
                        {fb.gaps && <p className="text-slate-400"><strong>Gaps:</strong> {fb.gaps}</p>}
                        {fb.comments && <p className="text-slate-400 italic">"{fb.comments}"</p>}
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setReviewFeedbackData({ application: app, feedback: fb })}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold transition cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            <span>AI Review & Release</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab 6: Offers Extended */}
      {activeTab === 'offers' && (
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white">Placement Offers Extended ({applicants.filter((a) => a.offer?.status !== 'None').length})</h3>
            <span className="text-emerald-400 font-bold font-mono">
              Accepted: {applicants.filter((a) => a.offer?.status === 'Accepted').length}
            </span>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Candidate</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Offered CTC</th>
                  <th className="p-3">Joining Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Offer Letter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {applicants
                  .filter((a) => a.offer?.status !== 'None')
                  .map((a) => (
                    <tr key={a.id} className="hover:bg-slate-850">
                      <td className="p-3 font-mono font-bold text-white">{a.rollNo}</td>
                      <td className="p-3 font-bold text-white">{a.studentName}</td>
                      <td className="p-3 text-slate-300">{a.offer?.role || drive.title}</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">{a.offer?.ctc} LPA</td>
                      <td className="p-3 text-slate-400 font-mono">
                        {a.offer?.joiningDate ? new Date(a.offer.joiningDate).toLocaleDateString() : 'TBD'}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            a.offer?.status === 'Accepted'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : a.offer?.status === 'Declined'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                              : a.offer?.status === 'Proposed_By_Recruiter'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {a.offer?.status === 'Proposed_By_Recruiter' ? 'Pending TPO Endorsement' : a.offer?.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {a.offer?.status === 'Proposed_By_Recruiter' ? (
                          <button
                            onClick={() => {
                              setReviewOfferModalApp(a);
                              setReviewOfferRemarks('');
                              setReviewOfferBypassWarning(false);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] transition cursor-pointer"
                          >
                            Review Proposal
                          </button>
                        ) : a.offer?.offerLetterUrl ? (
                          <a href={a.offer.offerLetterUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                            Download Letter &rarr;
                          </a>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Shortlist Upload Modal */}
      {shortlistModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShortlistModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Upload Round Shortlist (CSV / Excel)</h3>
              <button onClick={() => setShortlistModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Target Round to Advance Matched Candidates</label>
                <select
                  value={targetRound}
                  onChange={(e) => setTargetRound(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Online Assessment">Online Assessment</option>
                  <option value="Technical Round">Technical Interview</option>
                  <option value="HR Round">HR Round</option>
                  <option value="Offer Extended">Final Placement Offer</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-slate-700 rounded-2xl p-5 text-center">
                <Upload className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <p className="font-bold text-white mb-1">Upload CSV or Excel containing student Roll Numbers</p>
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleShortlistFileChange}
                  className="text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-emerald-500 file:text-slate-950"
                />
              </div>

              {shortlistLoading && <p className="text-center text-slate-400">Matching roll numbers against drive applicants...</p>}

              {shortlistResult && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-300">Total in Sheet: {shortlistResult.totalInSheet}</span>
                    <span className="text-emerald-400">✓ Matched: {shortlistResult.matchedCount}</span>
                    {shortlistResult.unmatchedCount > 0 && (
                      <span className="text-amber-400">✕ Unmatched: {shortlistResult.unmatchedCount}</span>
                    )}
                  </div>
                  <div className="max-h-32 overflow-y-auto text-[10px] space-y-1">
                    {shortlistResult.matched.map((m) => (
                      <div key={m.applicationId} className="text-slate-300 flex justify-between">
                        <span>{m.rollNo} • {m.name}</span>
                        <span className="text-emerald-400">&rarr; {targetRound}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button onClick={() => setShortlistModalOpen(false)} className="px-3 py-1.5 text-xs text-slate-400">
                Cancel
              </button>
              <button
                onClick={handleConfirmShortlistMove}
                disabled={!shortlistResult?.matched?.length}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-50"
              >
                Confirm & Move Candidates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scorecard Modal */}
      {feedbackModalApp && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setFeedbackModalApp(null)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Scorecard for {feedbackModalApp.studentName}</h3>
                <p className="text-[11px] text-slate-400">{feedbackModalApp.currentRound}</p>
              </div>
              <button onClick={() => setFeedbackModalApp(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-3">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Interview Rating (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                      className={`p-2 rounded-xl border flex-1 font-bold ${
                        feedbackForm.rating >= star
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-slate-950 text-slate-500 border-slate-800'
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Demonstrated Strengths</label>
                <input
                  type="text"
                  placeholder="e.g. Fast problem solving, strong SQL fundamentals"
                  value={feedbackForm.strengths}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, strengths: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Improvement Gaps</label>
                <input
                  type="text"
                  placeholder="e.g. Communication in English, system design scaling"
                  value={feedbackForm.gaps}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, gaps: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Private interviewer feedback..."
                  value={feedbackForm.comments}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setFeedbackModalApp(null)} className="px-3 py-1.5 text-slate-400">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold">
                  Save Scorecard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offer Extension Modal */}
      {offerModalApp && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOfferModalApp(null)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Extend Offer to {offerModalApp.studentName}</h3>
                <p className="text-[11px] text-slate-400">{drive.companyName}</p>
              </div>
              <button onClick={() => setOfferModalApp(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExtendOfferSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Offered Role</label>
                  <input
                    type="text"
                    required
                    placeholder={drive.title}
                    value={offerForm.role}
                    onChange={(e) => setOfferForm({ ...offerForm, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Total CTC (LPA)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={offerForm.ctc}
                    onChange={(e) => setOfferForm({ ...offerForm, ctc: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Expected Joining Date</label>
                <input
                  type="date"
                  required
                  value={offerForm.joiningDate}
                  onChange={(e) => setOfferForm({ ...offerForm, joiningDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setOfferModalApp(null)} className="px-3 py-1.5 text-slate-400">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold">
                  Extend Placement Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalApp && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setRejectModalApp(null)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-red-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Reject Candidate: {rejectModalApp.studentName}</h3>
            </div>
            <p className="text-slate-400">Please provide reason for rejection:</p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setRejectModalApp(null)} className="px-3 py-1.5 text-slate-400">
                Cancel
              </button>
              <button onClick={handleReject} className="px-4 py-1.5 rounded-xl bg-red-600 text-white font-bold">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Feedback Approval Modal */}
      {reviewFeedbackData && (
        <TpoFeedbackApprovalModal
          application={reviewFeedbackData.application}
          initialFeedback={reviewFeedbackData.feedback}
          onClose={() => setReviewFeedbackData(null)}
          onApproved={() => {
            showToast('Feedback verified and released to candidate workspace');
            fetchWorkspace();
          }}
        />
      )}

      {/* Review Recruiter Proposed Offer Modal */}
      {reviewOfferModalApp && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setReviewOfferModalApp(null)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-purple-500/30 rounded-3xl p-6 shadow-2xl space-y-4 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Endorse Recruiter Offer Proposal
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Candidate: <strong className="text-white">{reviewOfferModalApp.studentName}</strong> ({reviewOfferModalApp.rollNo})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewOfferModalApp(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Proposed Role</span>
                <span className="font-bold text-white">
                  {reviewOfferModalApp.offer?.role || drive.title}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Total Proposed CTC</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {reviewOfferModalApp.offer?.ctc ? `${reviewOfferModalApp.offer.ctc > 1000 ? reviewOfferModalApp.offer.ctc / 100000 : reviewOfferModalApp.offer.ctc} LPA` : 'N/A'}
                </span>
              </div>
              {reviewOfferModalApp.offer?.fixedCtc > 0 && (
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Fixed CTC Component</span>
                  <span>{reviewOfferModalApp.offer.fixedCtc > 1000 ? reviewOfferModalApp.offer.fixedCtc / 100000 : reviewOfferModalApp.offer.fixedCtc} LPA</span>
                </div>
              )}
              {reviewOfferModalApp.offer?.variableCtc > 0 && (
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Variable / Performance Component</span>
                  <span>{reviewOfferModalApp.offer.variableCtc > 1000 ? reviewOfferModalApp.offer.variableCtc / 100000 : reviewOfferModalApp.offer.variableCtc} LPA</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Proposed Joining Date</span>
                <span className="font-mono text-slate-300">
                  {reviewOfferModalApp.offer?.joiningDate
                    ? new Date(reviewOfferModalApp.offer.joiningDate).toLocaleDateString()
                    : 'To be determined'}
                </span>
              </div>
              {reviewOfferModalApp.offer?.remarks && (
                <div className="pt-2 border-t border-slate-850">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Recruiter Remarks:
                  </span>
                  <p className="text-slate-300 italic">
                    "{reviewOfferModalApp.offer.remarks}"
                  </p>
                </div>
              )}
            </div>

            {reviewOfferBypassWarning && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Institutional Placement Policy Warning Flagged</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Extending this offer might conflict with One-Student-One-Offer or Dream Cap thresholds. Check the box below if you have institutional authorization to override.
                </p>
                <label className="flex items-center gap-2 text-xs text-white font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reviewOfferBypassWarning}
                    onChange={(e) => setReviewOfferBypassWarning(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Authorize Placement Cell Policy Override</span>
                </label>
              </div>
            )}

            <div>
              <label className="text-slate-400 font-semibold block mb-1">
                TPO Endorsement Remarks / Conditions
              </label>
              <textarea
                rows={2}
                placeholder="Optional endorsement note recorded in audit log..."
                value={reviewOfferRemarks}
                onChange={(e) => setReviewOfferRemarks(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                disabled={reviewOfferLoading}
                onClick={() => handleReviewProposedOffer('Rejected')}
                className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 font-bold transition disabled:opacity-50 cursor-pointer"
              >
                Reject Proposal
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReviewOfferModalApp(null)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={reviewOfferLoading}
                  onClick={() => handleReviewProposedOffer('Approved')}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow-lg shadow-purple-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {reviewOfferLoading ? 'Endorsing...' : 'Approve & Extend Offer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Drive Recruiter Modal */}
      {inviteRecruiterModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setInviteRecruiterModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Invite Recruiter to this Drive
                  </h3>
                  <p className="text-[11px] text-slate-400">{drive.companyName} • {drive.title}</p>
                </div>
              </div>
              <button
                onClick={() => setInviteRecruiterModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteRecruiterResult ? (
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-white">Invitation Issued Successfully!</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Recruiter is authorized to access and manage candidates for this drive.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Direct Activation URL:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={
                        inviteRecruiterResult.inviteUrl ||
                        `${window.location.origin}/recruiter/accept-invite?token=${inviteRecruiterResult.inviteToken}`
                      }
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono truncate"
                    />
                    <button
                      onClick={handleCopyDriveInviteLink}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      {copiedDriveInviteLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedDriveInviteLink ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1.5 block">
                    Recruiter can set their password and start reviewing candidates immediately.
                  </span>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setInviteRecruiterModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInviteDriveRecruiter} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Recruiter Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="recruiter@company.com"
                    value={inviteRecruiterEmail}
                    onChange={(e) => setInviteRecruiterEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Recruiter Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={inviteRecruiterName}
                    onChange={(e) => setInviteRecruiterName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-xs text-purple-300">
                  <p>
                    Invited recruiter will be granted scoped authority over <strong>{drive.title}</strong>, candidate shortlists, interview schedule slots, and feedback entry.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setInviteRecruiterModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteRecruiterLoading}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {inviteRecruiterLoading ? 'Issuing...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
