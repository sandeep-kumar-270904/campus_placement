import React, { useState, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Building2,
  GraduationCap,
  Sparkles,
  AlertCircle,
  Clock,
  RefreshCw,
  User,
  Check,
  X,
  MessageSquare,
  Eye,
} from 'lucide-react';
import interviewExperienceService from '../../services/interviewExperienceService';

export default function TpoInterviewModeration() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Reject note modal
  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await interviewExperienceService.getModerationQueue();
      setQueue(res.queue || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Failed to fetch moderation queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleModerate = async (id, action, note = '') => {
    try {
      setProcessingId(id);
      setError(null);
      await interviewExperienceService.moderateExperience(id, action, note);
      setSuccessMessage(
        action === 'approve'
          ? 'Interview debrief published to student library.'
          : 'Interview debrief rejected.'
      );
      if (rejectModalItem) setRejectModalItem(null);
      await fetchQueue();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Moderation action failed.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-widest">
              Peer Learning Quality
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            Interview Experience Moderation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review student-submitted interview questions and tips before publishing them into the campus debrief library.
          </p>
        </div>

        <button
          onClick={fetchQueue}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </button>
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

      {/* Queue items */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading moderation queue...</p>
        </div>
      ) : queue.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">All Submissions Reviewed</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            There are no pending interview debriefs awaiting moderation at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{queue.length} Submission{queue.length > 1 ? 's' : ''} Awaiting Review</span>
          </div>

          {queue.map((item) => {
            const student = item.studentId;
            return (
              <div
                key={item._id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition space-y-4"
              >
                {/* Top header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-white">{item.companyName}</h3>
                        <span className="text-slate-500">•</span>
                        <span className="text-xs font-bold text-slate-300">{item.role}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          {item.jobType}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {item.overallDifficulty}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {item.outcome}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Submitted on {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Student submitter information */}
                  <div className="text-right text-xs">
                    <div className="flex items-center gap-1.5 justify-end text-slate-300 font-semibold">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{student?.firstName} {student?.lastName}</span>
                      <span className="text-slate-500 font-mono text-[11px]">({student?.rollNo || 'Roll N/A'})</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.branch} • Batch {item.batchYear}
                    </p>
                    {item.isAnonymous && (
                      <span className="inline-block mt-1 px-2 py-0.2 rounded text-[9px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        Requested Anonymity to Peers
                      </span>
                    )}
                  </div>
                </div>

                {/* Rounds Content */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Rounds & Questions
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(item.rounds || []).map((round, rIdx) => (
                      <div
                        key={rIdx}
                        className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-white">
                          <span>{round.roundName}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {round.roundType} • {round.durationMinutes}m
                          </span>
                        </div>

                        {round.questions?.length > 0 && (
                          <div>
                            <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1">
                              Questions:
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                              {round.questions.map((q, qIdx) => (
                                <li key={qIdx}>{q}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {round.tips && (
                          <p className="text-[11px] text-amber-300/80 bg-amber-950/20 p-1.5 rounded border border-amber-900/30">
                            <span className="font-semibold text-amber-400">Tip:</span> {round.tips}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overall tips */}
                {item.preparationTips && (
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                    <span className="font-bold text-slate-200 block mb-1">Student Preparation Notes:</span>
                    <p className="leading-relaxed whitespace-pre-wrap">{item.preparationTips}</p>
                  </div>
                )}

                {/* Moderation Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setRejectModalItem(item);
                      setRejectNote('');
                    }}
                    disabled={processingId === item._id}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/30 hover:bg-red-950/60 text-red-400 border border-red-900/40 text-xs font-bold transition disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject Submission
                  </button>

                  <button
                    onClick={() => handleModerate(item._id, 'approve')}
                    disabled={processingId === item._id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition disabled:opacity-50 shadow-md shadow-emerald-500/10"
                  >
                    {processingId === item._id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    )}
                    Approve & Publish to Campus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              Reject Experience Submission
            </h3>
            <p className="text-xs text-slate-400">
              Provide an optional note to explain why this debrief cannot be published (e.g. contains inappropriate language, inaccurate NDA violations).
            </p>

            <textarea
              rows={3}
              placeholder="Reason for rejection (optional)..."
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-red-500/50"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalItem(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleModerate(rejectModalItem._id, 'reject', rejectNote)}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
