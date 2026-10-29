import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import recruiterService from '../../services/recruiterService';
import {
  Users,
  Search,
  Filter,
  Download,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  Send,
  AlertCircle,
  ChevronDown,
  Sparkles,
  Award,
} from 'lucide-react';
import aiService from '../../services/aiService';
import AiBadge from '../../components/ai/AiBadge';

export default function RecruiterDriveCandidates() {
  const { driveId } = useParams();

  const [candidates, setCandidates] = useState([]);
  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [minCgpaFilter, setMinCgpaFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [skillsFilter, setSkillsFilter] = useState('');

  // Modal States
  const [rejectModalApp, setRejectModalApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [feedbackModalApp, setFeedbackModalApp] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    roundName: 'Technical Round 1',
    strengths: '',
    gaps: '',
    comments: '',
    visibleToStudent: true,
  });
  const [isPolishingFeedback, setIsPolishingFeedback] = useState(false);
  const [isAiFeedbackRefined, setIsAiFeedbackRefined] = useState(false);

  const [offerModalApp, setOfferModalApp] = useState(null);
  const [offerForm, setOfferForm] = useState({
    designation: 'Software Development Engineer',
    fixedCtc: 2000000,
    variableCtc: 400000,
    joiningDate: '2026-07-01',
  });

  const [actionLoading, setActionLoading] = useState(false);

  const handleAiPolishFeedback = async () => {
    const rawNotes = [feedbackForm.strengths, feedbackForm.gaps, feedbackForm.comments]
      .filter(Boolean)
      .join('\n');
    if (!rawNotes.trim()) {
      setError('Please enter some notes in strengths, gaps, or internal comments first for AI to synthesize.');
      return;
    }
    setIsPolishingFeedback(true);
    setError('');
    try {
      const res = await aiService.summarizeFeedback({
        applicationId: feedbackModalApp?._id,
        rawNotes,
        rating: feedbackForm.rating,
      });
      if (res?.summary) {
        setFeedbackForm((prev) => ({
          ...prev,
          strengths: (res.summary.keyStrengths || []).join('; ') || prev.strengths,
          gaps: (res.summary.areasForImprovement || []).join('; ') || prev.gaps,
          comments: res.summary.summaryParagraph || prev.comments,
        }));
        setIsAiFeedbackRefined(true);
      }
    } catch (err) {
      console.error('Failed to polish feedback:', err);
      setError(err.response?.data?.error?.message || 'Failed to synthesize feedback with AI.');
    } finally {
      setIsPolishingFeedback(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [driveId]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [driveRes, candRes] = await Promise.all([
        recruiterService.getDriveDetails(driveId),
        recruiterService.getCandidates(driveId, {
          branch: branchFilter || undefined,
          minCgpa: minCgpaFilter || undefined,
          status: statusFilter || undefined,
          skills: skillsFilter || undefined,
          search: search || undefined,
        }),
      ]);
      setDrive(driveRes.drive || driveRes);
      setCandidates(candRes.candidates || []);
    } catch (err) {
      console.error('Failed to load candidate roster:', err);
      setError(
        err.response?.data?.error?.message ||
          'Failed to load candidates for this drive. Please check your corporate permissions.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterApply = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const candRes = await recruiterService.getCandidates(driveId, {
        branch: branchFilter || undefined,
        minCgpa: minCgpaFilter || undefined,
        status: statusFilter || undefined,
        skills: skillsFilter || undefined,
        search: search || undefined,
      });
      setCandidates(candRes.candidates || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Filter query failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appId, newStatus, reason = '') => {
    setActionLoading(true);
    try {
      await recruiterService.updateCandidateStatus(driveId, appId, {
        status: newStatus,
        rejectionReason: reason,
      });
      setSuccessMsg(`Candidate status updated to ${newStatus}`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setRejectModalApp(null);
      setRejectionReason('');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update candidate status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadResume = async (appId, studentName) => {
    try {
      const res = await recruiterService.getCandidateResume(driveId, appId);
      if (res?.signedUrl) {
        window.open(res.signedUrl, '_blank', 'noopener,noreferrer');
      } else {
        alert('Resume file is not available or could not be generated.');
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to generate signed resume URL.');
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await recruiterService.exportShortlistCsv(driveId);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${drive?.title || 'Drive'}_Shortlist.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export shortlist CSV. Please ensure you have candidates in shortlisted state.');
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackModalApp) return;
    setActionLoading(true);
    try {
      await recruiterService.submitRoundFeedback(driveId, feedbackModalApp._id, feedbackForm);
      setSuccessMsg('Interview scorecard & feedback successfully submitted!');
      setTimeout(() => setSuccessMsg(''), 4000);
      setFeedbackModalApp(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit feedback.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    if (!offerModalApp) return;
    setActionLoading(true);
    try {
      const payload = {
        designation: offerForm.designation,
        fixed: Number(offerForm.fixedCtc),
        variable: Number(offerForm.variableCtc),
        total: Number(offerForm.fixedCtc) + Number(offerForm.variableCtc),
        joiningDate: offerForm.joiningDate,
      };
      await recruiterService.proposeOffer(driveId, offerModalApp._id, payload);
      setSuccessMsg('Offer proposal submitted for TPO endorsement!');
      setTimeout(() => setSuccessMsg(''), 4000);
      setOfferModalApp(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to propose offer.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium mb-1">
            <span>{drive?.companyName || 'Corporate Drive'}</span>
            <span>•</span>
            <span>Candidate Evaluation & Shortlist</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            {drive?.title || 'Drive Candidates'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked candidate roster with verified academic seals, talent filters, and privacy-shielded contact access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 shadow-sm transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Shortlist CSV</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-400 hover:text-white">✕</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filtering Bar */}
      <form
        onSubmit={handleFilterApply}
        className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3"
      >
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate name or roll no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Branches</option>
            <option value="CSE">Computer Science (CSE)</option>
            <option value="IT">Information Tech (IT)</option>
            <option value="ECE">Electronics (ECE)</option>
            <option value="EE">Electrical (EE)</option>
            <option value="MECH">Mechanical (MECH)</option>
          </select>
        </div>

        <div>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            placeholder="Min CGPA (e.g. 8.0)"
            value={minCgpaFilter}
            onChange={(e) => setMinCgpaFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Stages</option>
            <option value="Applied">Applied</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Technical Round">Technical Round</option>
            <option value="HR Round">HR Round</option>
            <option value="Offer Proposed">Offer Proposed</option>
            <option value="Offer Extended">Offer Extended</option>
            <option value="Placed">Placed</option>
            <option value="Hold">Hold</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Apply Filters</span>
          </button>
        </div>
      </form>

      {/* Candidate Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-900/60 border border-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto">
          <Users className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No Matching Candidates Found</h3>
          <p className="text-xs text-slate-400">
            Adjust your filter criteria or check back once candidates apply to this drive.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {candidates.map((cand) => {
            const isShortlisted = [
              'Shortlisted',
              'Technical Round',
              'HR Round',
              'Offer Proposed',
              'Offer Extended',
              'Placed',
              'Hired',
            ].includes(cand.applicationStatus);

            return (
              <div
                key={cand.applicationId}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Top: Name, Roll No & Verified Seal */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {cand.name}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">
                        {cand.rollNo} • {cand.branch} • Batch {cand.batch || '2026'}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        cand.applicationStatus === 'Shortlisted'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : cand.applicationStatus === 'Technical Round' ||
                            cand.applicationStatus === 'HR Round'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : cand.applicationStatus === 'Offer Proposed' ||
                            cand.applicationStatus === 'Offer Extended'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : cand.applicationStatus === 'Rejected'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {cand.applicationStatus}
                    </span>
                  </div>

                  {/* Academic Seal Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>CGPA: {cand.cgpa?.toFixed(2) || 'N/A'}</span>
                    </div>
                    {cand.isVerifiedByTPO && (
                      <span className="text-[10px] text-emerald-400/90 font-medium flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        TPO Cryptographically Sealed
                      </span>
                    )}
                  </div>

                  {/* Contact Privacy Box */}
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 my-3 space-y-1.5 text-xs">
                    {isShortlisted ? (
                      <>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                          <span className="truncate">{cand.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                          <span>{cand.phone}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400 italic text-[11px]">
                        <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span>Contact info protected. Shortlist candidate to unlock email & phone.</span>
                      </div>
                    )}
                  </div>

                  {/* Skills Tags */}
                  {cand.skills && cand.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {cand.skills.slice(0, 4).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-medium text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                      {cand.skills.length > 4 && (
                        <span className="text-[10px] text-slate-500 self-center">
                          +{cand.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Rejection Note if Rejected */}
                  {cand.applicationStatus === 'Rejected' && cand.rejectionReason && (
                    <div className="p-2 rounded-lg bg-red-950/30 border border-red-900/40 text-[11px] text-red-300 mb-3">
                      <span className="font-semibold block">Rejection Feedback:</span>
                      {cand.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  {/* Profile & Resume Links */}
                  <div className="flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleDownloadResume(cand.applicationId, cand.name)}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Resume</span>
                    </button>

                    <Link
                      to={`/portfolio/${cand.rollNo}`}
                      target="_blank"
                      className="text-slate-400 hover:text-slate-200 flex items-center gap-1 text-[11px]"
                    >
                      <span>Public Portfolio</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Stage Advancement Buttons */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {cand.applicationStatus !== 'Shortlisted' &&
                      !['Technical Round', 'HR Round', 'Offer Proposed', 'Offer Extended', 'Placed'].includes(
                        cand.applicationStatus
                      ) && (
                        <button
                          onClick={() => handleStatusUpdate(cand.applicationId, 'Shortlisted')}
                          disabled={actionLoading}
                          className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition text-center"
                        >
                          Shortlist
                        </button>
                      )}

                    {cand.applicationStatus !== 'Hold' &&
                      cand.applicationStatus !== 'Placed' &&
                      cand.applicationStatus !== 'Rejected' && (
                        <button
                          onClick={() => handleStatusUpdate(cand.applicationId, 'Hold')}
                          disabled={actionLoading}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition"
                        >
                          Hold
                        </button>
                      )}

                    {isShortlisted && (
                      <>
                        <button
                          onClick={() => {
                            setFeedbackModalApp(cand);
                            setFeedbackForm({
                              rating: 5,
                              roundName: cand.currentRound || 'Technical Round 1',
                              strengths: '',
                              gaps: '',
                              comments: '',
                              visibleToStudent: true,
                            });
                          }}
                          className="px-2 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition flex items-center gap-1"
                          title="Scorecard Feedback"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>Feedback</span>
                        </button>

                        <button
                          onClick={() => {
                            setOfferModalApp(cand);
                            setOfferForm({
                              designation: drive?.title || 'Associate Engineer',
                              fixedCtc: drive?.ctc?.fixed || 1800000,
                              variableCtc: drive?.ctc?.variable || 400000,
                              joiningDate: '2026-07-01',
                            });
                          }}
                          className="px-2 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition flex items-center gap-1"
                          title="Propose Formal Offer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Offer</span>
                        </button>
                      </>
                    )}

                    {cand.applicationStatus !== 'Rejected' &&
                      cand.applicationStatus !== 'Placed' && (
                        <button
                          onClick={() => setRejectModalApp(cand)}
                          disabled={actionLoading}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 transition"
                        >
                          Reject
                        </button>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal with Mandatory Reason */}
      {rejectModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 text-red-400">
              <XCircle className="w-5 h-5" />
              Reject Candidate: {rejectModalApp.name}
            </h3>
            <p className="text-xs text-slate-400">
              Please provide clear evaluation feedback explaining why this candidate is being eliminated from the process.
            </p>

            <textarea
              rows={4}
              placeholder="e.g. Needs deeper mastery of core data structures or did not clear the practical coding assessment threshold."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-red-500"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectModalApp(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  handleStatusUpdate(rejectModalApp.applicationId, 'Rejected', rejectionReason)
                }
                disabled={!rejectionReason.trim() || actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white transition shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Round Feedback Scorecard Modal */}
      {feedbackModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleSubmitFeedback}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                Interview Scorecard: {feedbackModalApp.name}
              </h3>
              <button
                type="button"
                onClick={() => setFeedbackModalApp(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Round Name</label>
                <input
                  type="text"
                  value={feedbackForm.roundName}
                  onChange={(e) =>
                    setFeedbackForm({ ...feedbackForm, roundName: e.target.value })
                  }
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Overall Rating (1 - 5)</label>
                <select
                  value={feedbackForm.rating}
                  onChange={(e) =>
                    setFeedbackForm({ ...feedbackForm, rating: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value={5}>5 - Outstanding (Strong Hire)</option>
                  <option value={4}>4 - Exceeds Requirements (Hire)</option>
                  <option value={3}>3 - Meets Standard (Lean Hire)</option>
                  <option value={2}>2 - Marginal Gaps (Lean No Hire)</option>
                  <option value={1}>1 - Below Expectations (No Hire)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-300">Candidate Evaluation</span>
                {isAiFeedbackRefined && <AiBadge text="AI Refined" />}
              </div>
              <button
                type="button"
                onClick={handleAiPolishFeedback}
                disabled={isPolishingFeedback}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isPolishingFeedback ? 'Synthesizing...' : 'AI Polish / Synthesize'}</span>
              </button>
            </div>

            <div className="text-xs">
              <label className="text-slate-400 block mb-1">Key Strengths Demonstrated</label>
              <textarea
                rows={2}
                placeholder="e.g. Exceptional problem decomposition, optimal asymptotic complexity..."
                value={feedbackForm.strengths}
                onChange={(e) =>
                  setFeedbackForm({ ...feedbackForm, strengths: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="text-xs">
              <label className="text-slate-400 block mb-1">Areas for Growth / Gaps</label>
              <textarea
                rows={2}
                placeholder="e.g. Could deepen concurrency semantics in multithreaded environments..."
                value={feedbackForm.gaps}
                onChange={(e) =>
                  setFeedbackForm({ ...feedbackForm, gaps: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="text-xs">
              <label className="text-slate-400 block mb-1">Internal Recruiter & TPO Notes</label>
              <textarea
                rows={2}
                placeholder="Private remarks for hiring panel and campus placement cell..."
                value={feedbackForm.comments}
                onChange={(e) =>
                  setFeedbackForm({ ...feedbackForm, comments: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1 text-xs">
              <input
                type="checkbox"
                id="visibleToStudent"
                checked={feedbackForm.visibleToStudent}
                onChange={(e) =>
                  setFeedbackForm({ ...feedbackForm, visibleToStudent: e.target.checked })
                }
                className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="visibleToStudent" className="text-slate-300">
                Allow student to view strengths and constructive growth points on their dashboard
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setFeedbackModalApp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
              >
                Save Scorecard
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Propose Offer Modal */}
      {offerModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleSubmitOffer}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2 text-emerald-400">
                <Send className="w-5 h-5" />
                Propose Formal Offer: {offerModalApp.name}
              </h3>
              <button
                type="button"
                onClick={() => setOfferModalApp(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Submit full CTC breakdown for TPO verification. Once endorsed by the Placement Cell, the offer is officially released to the student.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Offered Role / Designation</label>
                <input
                  type="text"
                  value={offerForm.designation}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, designation: e.target.value })
                  }
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Fixed CTC (₹)</label>
                  <input
                    type="number"
                    value={offerForm.fixedCtc}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, fixedCtc: e.target.value })
                    }
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Variable CTC (₹)</label>
                  <input
                    type="number"
                    value={offerForm.variableCtc}
                    onChange={(e) =>
                      setOfferForm({ ...offerForm, variableCtc: e.target.value })
                    }
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400">Total Proposed CTC:</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  ₹{(Number(offerForm.fixedCtc || 0) + Number(offerForm.variableCtc || 0)).toLocaleString()} (
                  {(
                    (Number(offerForm.fixedCtc || 0) + Number(offerForm.variableCtc || 0)) /
                    100000
                  ).toFixed(2)}{' '}
                  LPA)
                </span>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Joining Date</label>
                <input
                  type="date"
                  value={offerForm.joiningDate}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, joiningDate: e.target.value })
                  }
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setOfferModalApp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
              >
                Submit for TPO Approval
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
