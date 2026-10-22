import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Calendar,
  Building2,
  Award,
  DollarSign,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Briefcase,
} from 'lucide-react';
import studentService from '../../services/studentService';
import { useTenant } from '../../context/TenantContext';

const STAGES = ['Applied', 'Online Assessment', 'Technical Round', 'HR Round', 'Offer Extended'];

export default function StudentApplications() {
  const { branding } = useTenant();

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  // Offer Decision Modal
  const [decisionModal, setDecisionModal] = useState({ open: false, app: null, decision: 'Accepted', remarks: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await studentService.getMyApplications();
      setApplications(res.applications || []);
      if (res.applications?.length > 0 && !selectedApp) {
        setSelectedApp(res.applications[0]);
      } else if (selectedApp) {
        // Refresh selected application data
        const updated = (res.applications || []).find((a) => a.id === selectedApp.id || a._id === selectedApp._id);
        if (updated) setSelectedApp(updated);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
      setError(err?.response?.data?.error?.message || 'Failed to fetch applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDecisionSubmit = async () => {
    if (!decisionModal.app) return;
    try {
      setActionLoading(true);
      setFeedbackMsg({ type: '', text: '' });

      const res = await studentService.decideOffer(
        decisionModal.app.id || decisionModal.app._id,
        decisionModal.decision,
        decisionModal.remarks
      );

      setFeedbackMsg({
        type: 'success',
        text: res.message || 'Offer decision recorded successfully.',
      });
      setDecisionModal({ open: false, app: null, decision: 'Accepted', remarks: '' });
      setTimeout(() => setFeedbackMsg({ type: '', text: '' }), 5000);
      fetchApplications();
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: err?.response?.data?.error?.message || 'Failed to submit offer decision.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStageIndex = (status) => {
    if (status === 'Applied' || status === 'In Review') return 0;
    if (status === 'Online Assessment') return 1;
    if (status === 'Shortlisted' || status === 'Technical Round') return 2;
    if (status === 'HR Round') return 3;
    if (status === 'Offer Extended' || status === 'Placed') return 4;
    return -1;
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-white">Application Pipeline & Offers</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {applications.length} Submissions
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Track round progression, review evaluator feedback, inspect interview slots, and accept formal placement offers.
          </p>
        </div>

        {feedbackMsg.text && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
                : 'bg-rose-950/70 border-rose-700 text-rose-300'
            }`}
          >
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{feedbackMsg.text}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading your active applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h2 className="text-sm font-bold text-white">No Applications Yet</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You haven't submitted any applications for open campus drives. Visit the Opportunity Hub to explore eligible drives.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications Master List (1 Col) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Your Applications ({applications.length})
            </h3>
            <div className="space-y-2.5 overflow-y-auto max-h-[75vh] pr-1">
              {applications.map((app) => {
                const isSelected = (selectedApp?.id || selectedApp?._id) === (app.id || app._id);
                const isPlaced = app.status === 'Placed' || app.offer?.status === 'Accepted';
                const isOffer = app.offer?.status === 'Pending' || app.status === 'Offer Extended';
                const isRejected = app.status === 'Rejected' || app.offer?.status === 'Declined';

                return (
                  <button
                    key={app.id || app._id}
                    onClick={() => setSelectedApp(app)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500/50 shadow-lg'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">
                          {app.opportunityId?.companyName || 'Corporate Partner'}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">{app.opportunityId?.title}</p>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                          isPlaced
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isOffer
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                            : isRejected
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                        }`}
                      >
                        {isPlaced ? 'Placed 🎉' : isOffer ? 'Offer Extended' : app.status}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                      <span>Package: {app.opportunityId?.ctc?.total || app.opportunityId?.salary || 'N/A'} LPA</span>
                      <span>Applied: {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Application Detail View (2 Cols) */}
          {selectedApp && (
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-white">{selectedApp.opportunityId?.companyName}</h2>
                    <p className="text-xs font-semibold text-emerald-400">{selectedApp.opportunityId?.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      Stage: {selectedApp.status}
                    </span>
                  </div>
                </div>

                {/* 5-Stage Visual Progression Timeline */}
                <div className="py-4 border-y border-slate-800">
                  <div className="grid grid-cols-5 gap-1 relative">
                    {STAGES.map((stg, sIdx) => {
                      const currentIdx = getStageIndex(selectedApp.status);
                      const isCompleted = currentIdx > sIdx;
                      const isCurrent = currentIdx === sIdx;
                      const isPending = currentIdx < sIdx;

                      return (
                        <div key={stg} className="flex flex-col items-center text-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                              isCompleted
                                ? 'bg-emerald-500 text-slate-950'
                                : isCurrent
                                ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/20'
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}
                          >
                            {isCompleted ? '✓' : sIdx + 1}
                          </div>
                          <span
                            className={`text-[10px] mt-2 font-medium leading-tight ${
                              isCompleted || isCurrent ? 'text-white' : 'text-slate-500'
                            }`}
                          >
                            {stg}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Formal Offer Card if extended */}
                {selectedApp.offer && (
                  <div className="p-5 rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-800/80 to-slate-800 border border-amber-500/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                          Official Placement Offer
                        </h4>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                          selectedApp.offer.status === 'Accepted'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : selectedApp.offer.status === 'Declined'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        Offer {selectedApp.offer.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Offered Role</span>
                        <span className="font-bold text-white">
                          {selectedApp.offer.role || selectedApp.opportunityId?.title}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Annual CTC</span>
                        <span className="font-bold text-emerald-400">{selectedApp.offer.ctc} LPA</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Offer Extended</span>
                        <span className="font-semibold text-slate-200">
                          {selectedApp.offer.extendedAt
                            ? new Date(selectedApp.offer.extendedAt).toLocaleDateString()
                            : 'Recent'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Joining Date</span>
                        <span className="font-semibold text-slate-200">
                          {selectedApp.offer.joiningDate
                            ? new Date(selectedApp.offer.joiningDate).toLocaleDateString()
                            : 'To be announced'}
                        </span>
                      </div>
                    </div>

                    {selectedApp.offer.offerLetterUrl && (
                      <div className="pt-2">
                        <a
                          href={selectedApp.offer.offerLetterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          <span>View Official Offer Letter</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </div>
                    )}

                    {/* Pending Decision Action Buttons */}
                    {selectedApp.offer.status === 'Pending' && (
                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700/60">
                        <button
                          type="button"
                          onClick={() =>
                            setDecisionModal({
                              open: true,
                              app: selectedApp,
                              decision: 'Declined',
                              remarks: '',
                            })
                          }
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-800 text-xs font-semibold transition"
                        >
                          Decline Offer
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDecisionModal({
                              open: true,
                              app: selectedApp,
                              decision: 'Accepted',
                              remarks: '',
                            })
                          }
                          className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
                        >
                          Accept Offer 🎉
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Round History & Audit Log */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" /> Progression History & Milestones
                </h3>

                {(!selectedApp.roundHistory || selectedApp.roundHistory.length === 0) ? (
                  <p className="text-xs text-slate-400">Application submitted and awaiting initial recruiter review.</p>
                ) : (
                  <div className="space-y-3 relative pl-4 border-l-2 border-slate-800">
                    {selectedApp.roundHistory.map((rh, idx) => (
                      <div key={idx} className="relative space-y-1">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-slate-900" />
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white">{rh.roundName || 'Milestone'}</p>
                          <span className="text-[10px] text-slate-400">
                            {rh.movedAt ? new Date(rh.movedAt).toLocaleString() : ''}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-400 font-semibold">{rh.status}</p>
                        {rh.notes && <p className="text-xs text-slate-300">{rh.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Shared Evaluator Feedback */}
              {selectedApp.feedback?.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-teal-400" /> Shared Interview Feedback
                  </h3>

                  <div className="space-y-3">
                    {selectedApp.feedback.map((fb, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{fb.roundName || 'Technical Interview'}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                            Rating: {fb.rating}/5
                          </span>
                        </div>

                        {fb.strengths && (
                          <div className="text-xs text-slate-300 flex items-start gap-2">
                            <ThumbsUp className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <span>Strengths: {fb.strengths}</span>
                          </div>
                        )}

                        {fb.areasOfImprovement && (
                          <div className="text-xs text-slate-400 flex items-start gap-2">
                            <ThumbsDown className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                            <span>Areas to Grow: {fb.areasOfImprovement}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Offer Decision Confirmation Modal */}
      {decisionModal.open && decisionModal.app && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  decisionModal.decision === 'Accepted'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                }`}
              >
                {decisionModal.decision === 'Accepted' ? <Award className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Confirm {decisionModal.decision === 'Accepted' ? 'Offer Acceptance' : 'Offer Decline'}
                </h3>
                <p className="text-xs text-slate-400">{decisionModal.app.opportunityId?.companyName}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {decisionModal.decision === 'Accepted'
                ? `You are about to formally accept the placement offer of ${decisionModal.app.offer?.ctc} LPA with ${decisionModal.app.opportunityId?.companyName}. This action will mark your student profile as Placed.`
                : `You are choosing to decline the offer from ${decisionModal.app.opportunityId?.companyName}. Please provide remarks for the TPO records.`}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Remarks / Note to Placement Cell (Optional)
              </label>
              <textarea
                value={decisionModal.remarks}
                onChange={(e) => setDecisionModal({ ...decisionModal, remarks: e.target.value })}
                placeholder={
                  decisionModal.decision === 'Accepted'
                    ? 'e.g. Grateful for the opportunity and looking forward to joining!'
                    : 'e.g. Opting for higher studies or accepted higher-tier offer.'
                }
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDecisionModal({ open: false, app: null, decision: 'Accepted', remarks: '' })}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDecisionSubmit}
                disabled={actionLoading}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition disabled:opacity-50 ${
                  decisionModal.decision === 'Accepted'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                {actionLoading ? 'Recording...' : `Confirm ${decisionModal.decision}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
