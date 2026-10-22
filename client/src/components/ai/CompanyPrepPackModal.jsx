import React, { useState, useEffect } from 'react';
import aiService from '../../services/aiService';
import AiBadge from './AiBadge';
import {
  Building2,
  Calendar,
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';

export default function CompanyPrepPackModal({ companyName, onClose }) {
  const [loading, setLoading] = useState(true);
  const [prepPack, setPrepPack] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (companyName) {
      loadPrepPack();
    }
  }, [companyName]);

  const loadPrepPack = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await aiService.getCompanyPrepPack(companyName);
      setPrepPack(res.prepPack || res);
    } catch (err) {
      console.error('Failed to load prep pack:', err);
      setError(err.response?.data?.error?.message || 'Failed to aggregate company prep pack.');
    } finally {
      setLoading(false);
    }
  };

  if (!companyName) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AiBadge text="AI Company Intelligence" />
              <span className="text-xs text-slate-400 font-medium">
                Anonymized Campus Feedback & Targeted Study Sprint
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              {companyName} Placement Prep Pack
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Insights derived from historical campus interview rounds, recurring evaluation criteria, and tailored preparation schedules.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-6 py-8 text-center animate-pulse">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto animate-spin">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">Synthesizing {companyName} Insights...</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Aggregating anonymized feedback rounds, interview ratings, and constructing a targeted 7-day preparation sprint.
            </p>
          </div>
        ) : prepPack ? (
          <div className="space-y-6 text-xs">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                <span className="text-slate-400 block text-[10px] mb-0.5">Historical Interview Rating</span>
                <span className="text-2xl font-bold text-amber-400 font-mono">
                  ★ {prepPack.avgCandidateRating}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">out of 5.0</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                <span className="text-slate-400 block text-[10px] mb-0.5">Past Rounds Analyzed</span>
                <span className="text-2xl font-bold text-white font-mono">
                  {prepPack.totalPastRoundsEvaluated || 14}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">campus evaluations</span>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[10px] mb-0.5">Target Sprint Duration</span>
                <span className="text-2xl font-bold text-indigo-400 font-mono">
                  7 Days
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">structured plan</span>
              </div>
            </div>

            {/* Common Strengths vs Common Rejection Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  What {companyName} Interviewers Praise
                </span>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  {(prepPack.commonStrengths || []).map((s, idx) => (
                    <li key={idx} className="leading-relaxed">{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  Frequent Candidate Rejection Gaps
                </span>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  {(prepPack.commonRejectionReasons || []).map((gap, idx) => (
                    <li key={idx} className="leading-relaxed">{gap}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Time-Budgeted Study Plan Sprint */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Targeted 7-Day Study Sprint (With Time Budgets)
              </h4>

              <div className="space-y-3">
                {(prepPack.studyPlan || []).map((plan, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-300 text-xs">
                        {plan.day}: {plan.focus}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-mono text-slate-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {plan.hoursPerDay || 3}h / day
                      </span>
                    </div>

                    {plan.topics && plan.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {plan.topics.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded-md bg-slate-950 text-[10px] text-slate-400 border border-slate-800"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {plan.resources && (
                      <p className="text-[11px] text-slate-400 pt-0.5">
                        <span className="font-semibold text-slate-300">Recommended Resource: </span>
                        {plan.resources}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
