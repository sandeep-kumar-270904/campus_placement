import React, { useState } from 'react';
import aiService from '../../services/aiService';
import AiBadge from '../ai/AiBadge';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Layers,
} from 'lucide-react';

export default function TpoJdParserModal({ onApplyStructuredJd, onClose }) {
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedJd, setParsedJd] = useState(null);
  const [error, setError] = useState('');

  const sampleRawJd = `Google India is hiring Software Development Engineers for our Cloud & AI teams in Bengaluru and Hyderabad.
CTC Package: 28 LPA (Fixed: 22 LPA, Variable Performance Bonus: 6 LPA).
Selection Process:
1. Online Coding Assessment
2. Technical Round 1: DSA & Problem Solving
3. Technical Round 2: Systems Architecture
4. Googleyness & Leadership Round
Eligibility Criteria:
Minimum CGPA of 8.0, 0 active backlogs.
Allowed Engineering Streams: Computer Science (CSE), Information Technology (IT), and Electronics (ECE). Batch of 2026.`;

  const handleParse = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await aiService.parseDriveDescription(rawText.trim());
      setParsedJd(res.structuredJd || res);
    } catch (err) {
      console.error('JD parse error:', err);
      setError(err.response?.data?.error?.message || 'Failed to parse job description.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (parsedJd && onApplyStructuredJd) {
      onApplyStructuredJd(parsedJd);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AiBadge text="AI JD Parser" />
              <span className="text-xs text-slate-400 font-medium">
                Structured Field Extraction Assistant
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Drive Description Assistant
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Paste unformatted JD text from an email, PDF, or corporate notification. AI will extract roles, compensation, rounds, and eligibility for review.
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

        {!parsedJd ? (
          /* Raw Input Area */
          <form onSubmit={handleParse} className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 font-semibold">Paste Raw Job Description</label>
                <button
                  type="button"
                  onClick={() => setRawText(sampleRawJd)}
                  className="text-indigo-400 hover:text-indigo-300 text-[11px] font-medium"
                >
                  Load Sample Google JD
                </button>
              </div>

              <textarea
                rows={10}
                placeholder="Paste job description text here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed resize-y font-mono text-[11px]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || !rawText.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-lg shadow-indigo-600/20 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'Extracting Fields...' : 'Extract Structured Drive Fields'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Parsed Fields Review & Edit */
          <div className="space-y-5 text-xs animate-fadeIn">
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 text-slate-300 space-y-1">
              <span className="font-bold text-white block">Review Extracted Fields</span>
              <p className="text-[11px] text-slate-400">
                You can review the extracted values below before applying them into the Drive Creation Wizard.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Role Title</span>
                <p className="text-white font-bold">{parsedJd.title}</p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">CTC Package</span>
                <p className="text-emerald-400 font-bold font-mono">
                  {parsedJd.salary} (₹{parsedJd.ctc?.total?.toLocaleString()})
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Eligibility</span>
                <p className="text-slate-300">
                  Min CGPA: <strong>{parsedJd.eligibilityRules?.minCgpa}</strong> • Max Backlogs: <strong>{parsedJd.eligibilityRules?.maxBacklogs}</strong>
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Allowed Branches</span>
                <p className="text-indigo-300 font-semibold">
                  {(parsedJd.eligibilityRules?.allowedBranches || []).join(', ')}
                </p>
              </div>
            </div>

            {/* Rounds */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Extracted Rounds</span>
              <div className="space-y-1.5">
                {(parsedJd.rounds || []).map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px]"
                  >
                    <span className="font-semibold text-slate-200">
                      Round {r.roundNumber || i + 1}: {r.name}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                      {r.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setParsedJd(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Back to Raw Text
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply to Drive Creation Wizard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
