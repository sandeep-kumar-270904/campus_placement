import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FileText,
  RotateCcw,
  Sparkles,
  Command,
  Eye,
  X,
  Clock
} from 'lucide-react';
import tpoService from '../../services/tpoService';

export default function TpoVerification() {
  const location = useLocation();

  const [queue, setQueue] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [branchFilter, setBranchFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Rejection modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Marksheet does not match entered CGPA / backlogs');
  const [actionLoading, setActionLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      const res = await tpoService.getVerificationQueue({ branch: branchFilter, q: search });
      setQueue(res.queue || []);
      setSelectedIndex(0);
    } catch (err) {
      console.error(err);
      showToast('Failed to load verification queue', 'error');
    } finally {
      setLoading(false);
    }
  }, [branchFilter, search]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // If specific studentId in URL, select that candidate
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sid = params.get('studentId');
    if (sid && queue.length > 0) {
      const idx = queue.findIndex((q) => q.userId === sid || q.id === sid);
      if (idx !== -1) setSelectedIndex(idx);
    }
  }, [location.search, queue]);

  const activeStudent = queue[selectedIndex] || null;

  // Verification Action
  const handleAction = async (action, reason = '') => {
    if (!activeStudent || actionLoading) return;
    try {
      setActionLoading(true);
      const res = await tpoService.actionVerification(activeStudent.id, {
        action,
        reason,
      });

      showToast(res.message);
      setIsRejectModalOpen(false);

      // Remove from queue or update
      const updatedQueue = queue.filter((_, idx) => idx !== selectedIndex);
      setQueue(updatedQueue);
      if (selectedIndex >= updatedQueue.length) {
        setSelectedIndex(Math.max(0, updatedQueue.length - 1));
      }
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.error?.message || 'Verification action failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user typing in input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleAction('approve');
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setIsRejectModalOpen(true);
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setRejectReason('Please re-upload a clearer copy of your latest marksheet');
        setIsRejectModalOpen(true);
      } else if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < queue.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStudent, queue.length, actionLoading]);

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
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Academic Verification Queue</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {queue.length} pending
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Side-by-side marksheet verification with Ed25519 digital signing and keyboard shortcuts.
          </p>
        </div>

        {/* Keyboard Shortcuts Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
          <Command className="w-3.5 h-3.5 text-emerald-400" />
          <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-bold">A</kbd> Approve</span>
          <span>•</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-bold">R</kbd> Reject</span>
          <span>•</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-bold">J</kbd>/<kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-bold">K</kbd> Next/Prev</span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading pending verification queue...</div>
      ) : queue.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-2xl font-black">
            ✓
          </div>
          <h3 className="text-base font-bold text-white">All Records Verified!</h3>
          <p className="text-xs text-slate-400 px-6">
            There are currently zero pending student verifications in the queue. All academic metrics are cryptographically sealed.
          </p>
          <button
            onClick={fetchQueue}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            Check for New Submissions
          </button>
        </div>
      ) : (
        /* Split Screen Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[75vh]">
          {/* Left Panel: Pending Student List (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-800 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter queue by roll or branch..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Queue Position: <strong className="text-white">{selectedIndex + 1} of {queue.length}</strong></span>
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300"
                >
                  <option value="all">All Branches</option>
                  <option value="Computer Science">CSE</option>
                  <option value="Information Technology">IT</option>
                  <option value="Electronics & Communication">ECE</option>
                </select>
              </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
              {queue.map((student, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={student.id}
                    onClick={() => setSelectedIndex(idx)}
                    className={`p-3.5 transition cursor-pointer flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-emerald-500/10 border-l-4 border-emerald-400 pl-2.5'
                        : 'hover:bg-slate-850/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                          {student.fullName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">{student.rollNo}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{student.branch}</p>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-400">{student.cgpa.toFixed(2)}</div>
                      <span className="text-[10px] text-slate-500">{student.backlogs} backlogs</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Side-by-Side Comparison Workspace (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Action Bar Header */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reviewing Record</span>
                <h3 className="text-base font-black text-white">
                  {activeStudent?.fullName} <span className="font-mono text-emerald-400">({activeStudent?.rollNo})</span>
                </h3>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedIndex((prev) => Math.max(0, prev - 1))}
                  disabled={selectedIndex === 0}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
                  title="Previous candidate (K)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedIndex((prev) => Math.min(queue.length - 1, prev + 1))}
                  disabled={selectedIndex === queue.length - 1}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300"
                  title="Next candidate (J)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsRejectModalOpen(true)}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/50 hover:bg-red-900/50 border border-red-800 text-red-300 font-bold text-xs transition cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Reject</span>
                  <kbd className="ml-1 text-[9px] px-1 bg-red-900/60 rounded">R</kbd>
                </button>

                <button
                  onClick={() => handleAction('approve')}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                  <span>Approve & Seal</span>
                  <kbd className="ml-1 text-[9px] px-1 bg-emerald-600 text-slate-950 rounded">A</kbd>
                </button>
              </div>
            </div>

            {/* Split Details & Document Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              {/* Column A: Entered Academic Data */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
                <div className="flex items-center gap-2 text-slate-400 pb-2 border-b border-slate-800">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold uppercase tracking-wider text-[11px] text-white">Entered Academic Metrics</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Undergrad CGPA</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">{activeStudent?.cgpa?.toFixed(2)}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Active Backlogs</span>
                    <span className={`text-base font-black ${activeStudent?.backlogs > 0 ? 'text-red-400' : 'text-slate-300'}`}>
                      {activeStudent?.backlogs}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Class 10th Score</span>
                      <span className="text-xs font-bold text-white">{activeStudent?.tenthPercentage || '—'}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Class 12th Score</span>
                      <span className="text-xs font-bold text-white">{activeStudent?.twelfthPercentage || '—'}%</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] text-slate-400 block">Branch & Graduation Year</span>
                    <p className="font-bold text-white">{activeStudent?.branch} (Batch of {activeStudent?.graduationYear})</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] text-slate-400 block">Contact Information</span>
                    <p className="text-slate-300">{activeStudent?.email}</p>
                    {activeStudent?.phone && <p className="text-slate-400">{activeStudent?.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Column B: Uploaded Marksheet Viewer */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold uppercase tracking-wider text-[11px] text-white">Marksheet Preview</span>
                  </div>
                  {activeStudent?.marksheetDoc?.signedUrl && (
                    <a
                      href={activeStudent.marksheetDoc.signedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                    >
                      Open in New Tab <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center min-h-[300px]">
                  {activeStudent?.marksheetDoc?.signedUrl ? (
                    activeStudent.marksheetDoc.mimeType?.includes('pdf') ? (
                      <iframe
                        src={activeStudent.marksheetDoc.signedUrl}
                        title="Marksheet PDF"
                        className="w-full h-full min-h-[380px] rounded-xl"
                      />
                    ) : (
                      <img
                        src={activeStudent.marksheetDoc.signedUrl}
                        alt="Uploaded Marksheet"
                        className="max-h-[380px] w-auto object-contain p-2"
                      />
                    )
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <FileText className="w-10 h-10 text-slate-700 mx-auto" />
                      <p className="text-slate-400 font-bold">No Marksheet Attached</p>
                      <p className="text-[11px] text-slate-600">Candidate has not uploaded a marksheet document yet.</p>
                      <button
                        onClick={() => {
                          setRejectReason('Please upload your official consolidated semester marksheet');
                          setIsRejectModalOpen(true);
                        }}
                        className="mt-2 px-3 py-1.5 rounded-xl bg-slate-850 border border-slate-700 text-amber-400 text-[11px] font-semibold"
                      >
                        Request Marksheet Upload
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsRejectModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-red-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Reject Verification for {activeStudent?.rollNo}</h3>
            </div>
            <p className="text-xs text-slate-400">
              State the reason for rejection or correction request. This will be transmitted to {activeStudent?.fullName}.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50"
              placeholder="e.g. CGPA in marksheet reads 7.82, entered 8.92..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-slate-400 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction('reject', rejectReason)}
                disabled={actionLoading || !rejectReason.trim()}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs disabled:opacity-50"
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
