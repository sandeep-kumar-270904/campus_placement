import React, { useState } from 'react';
import aiService from '../../services/aiService';
import AiBadge from '../ai/AiBadge';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  ShieldCheck,
  Edit3,
} from 'lucide-react';

export default function TpoFeedbackApprovalModal({ application, initialFeedback, onApproved, onClose }) {
  const [editedComments, setEditedComments] = useState(
    initialFeedback?.comments || ''
  );
  const [visibleToStudent, setVisibleToStudent] = useState(true);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState('');

  const handleApprove = async () => {
    setApproving(true);
    setError('');
    try {
      await aiService.approveFeedback(application._id || application.id, {
        feedbackIndex: 0,
        editedComments,
        visibleToStudent,
      });

      if (onApproved) onApproved();
      onClose();
    } catch (err) {
      console.error('Approve feedback error:', err);
      setError(err.response?.data?.error?.message || 'Failed to approve feedback.');
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AiBadge text="AI Feedback Summarizer" />
              <span className="text-xs text-amber-400 font-semibold">
                Requires TPO Verification Before Student Release
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Review & Approve Candidate Feedback
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review, edit, and authorize release of the synthesized interview evaluation for candidate {application?.studentName || 'Student'}.
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

        <div className="space-y-4 text-xs">
          {/* Key highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-emerald-400 font-bold block">Key Strengths Noted</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {initialFeedback?.strengths || 'Solid foundational algorithmic intuition and clean code organization.'}
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-amber-400 font-bold block">Growth Areas / Gaps</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {initialFeedback?.gaps || 'Can deepen knowledge of multi-threaded race conditions and memory barriers.'}
              </p>
            </div>
          </div>

          {/* Editable Student-Facing Summary Paragraph */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Student-Facing Feedback Paragraph (Editable)</span>
              </label>
              <span className="text-[10px] text-slate-500">
                Visible to candidate upon approval
              </span>
            </div>

            <textarea
              rows={5}
              value={editedComments}
              onChange={(e) => setEditedComments(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 text-xs leading-relaxed focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Visibility toggle */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center gap-2.5">
            <input
              type="checkbox"
              id="releaseToggle"
              checked={visibleToStudent}
              onChange={(e) => setVisibleToStudent(e.target.checked)}
              className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="releaseToggle" className="text-slate-300 text-xs font-medium cursor-pointer">
              Release feedback to student workspace upon confirmation
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApprove}
              disabled={approving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-lg shadow-emerald-600/20 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{approving ? 'Approving...' : 'Approve & Release to Student'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
