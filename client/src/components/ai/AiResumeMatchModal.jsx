import React, { useState, useEffect } from 'react';
import aiService from '../../services/aiService';
import AiBadge from './AiBadge';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  X,
  Target,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  BookOpen,
} from 'lucide-react';

export default function AiResumeMatchModal({ drive, onClose }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);

  useEffect(() => {
    if (drive?._id || drive?.id) {
      loadMatch();
    }
  }, [drive]);

  const loadMatch = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await aiService.checkResumeMatch(drive._id || drive.id);
      setData(res.result || res);
    } catch (err) {
      console.error('Resume match failed:', err);
      setError(
        err.response?.data?.error?.message ||
          'Failed to analyze resume match against this drive. Please ensure you have uploaded a resume.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (!drive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AiBadge />
              <span className="text-xs text-slate-400 font-medium">
                Deterministic + Anthropic Claude Hybrid Evaluation
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              Resume Match: {drive.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Targeted role alignment, skill gap detection, and ATS bullet rewrites for {drive.companyName}.
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
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white">Analyzing Resume & Drive Criteria...</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Parsing resume text streams, matching technical keywords, and synthesizing high-impact ATS bullet suggestions.
              </p>
            </div>
          </div>
        ) : data ? (
          <div className="space-y-6 text-xs">
            {/* Score & Skill Pill Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-center items-center text-center shadow-inner">
                <span className="text-[11px] font-semibold text-slate-400 mb-1">
                  Role Match Score
                </span>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-4xl font-black font-mono ${
                      data.matchScore >= 75
                        ? 'text-emerald-400'
                        : data.matchScore >= 50
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}
                  >
                    {data.matchScore}
                  </span>
                  <span className="text-xs text-slate-500">/ 100</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 font-medium">
                  {data.matchScore >= 75
                    ? 'Strong Alignment'
                    : data.matchScore >= 50
                    ? 'Moderate Fit'
                    : 'Requires Skill Tailoring'}
                </span>
              </div>

              {/* Matched Skills */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 sm:col-span-2">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  Matched Technical Skills ({data.matchedSkills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {data.matchedSkills?.length ? (
                    data.matchedSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold text-[11px]"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">No exact skill matches detected.</span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs mb-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Missing / Desired Skills ({data.missingSkills?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {data.missingSkills?.length ? (
                      data.missingSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-semibold text-[11px]"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">All primary drive skills covered!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section-by-Section Feedback */}
            {data.sectionFeedback && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Section-by-Section Feedback
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                    <span className="font-bold text-indigo-300 block">Professional Summary</span>
                    <p className="text-slate-400">{data.sectionFeedback.summary}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                    <span className="font-bold text-indigo-300 block">Experience / Internships</span>
                    <p className="text-slate-400">{data.sectionFeedback.experience}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                    <span className="font-bold text-indigo-300 block">Projects & Engineering</span>
                    <p className="text-slate-400">{data.sectionFeedback.projects}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                    <span className="font-bold text-indigo-300 block">Education & Verification</span>
                    <p className="text-slate-400">{data.sectionFeedback.education}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 5 Rewritten Bullet Suggestions with Reasons */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  5 High-Impact Bullet Rewrites (Google XYZ Formula)
                </h4>
                <span className="text-[10px] text-slate-400">
                  Tailored for {drive.companyName}
                </span>
              </div>

              <div className="space-y-3">
                {(data.rewrittenBulletSuggestions || []).map((bullet, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2 hover:border-indigo-500/40 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300">
                        {bullet.targetSection || 'Experience'} • Suggestion #{idx + 1}
                      </span>

                      <button
                        onClick={() => handleCopy(bullet.suggestion, idx)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold transition"
                      >
                        {copiedIdx === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Bullet</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <p className="text-slate-400 italic line-through text-[11px]">
                        Original: "{bullet.original}"
                      </p>
                      <p className="text-emerald-300 font-medium text-xs leading-relaxed">
                        ✨ {bullet.suggestion}
                      </p>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/60 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300">Why this helps: </span>
                      {bullet.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer Footer */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/60 text-[11px] text-slate-500 text-center">
              Scores and suggestions are synthesized by server-side Claude & deterministic keyword modeling. Always review and adapt bullet points to reflect your genuine engineering accomplishments.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
