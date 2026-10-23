import React, { useState, useEffect } from 'react';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  RefreshCw,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Rocket,
  Building2,
  ExternalLink,
  User,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import externalOutcomeService from '../../services/externalOutcomeService';

export default function TpoExternalOutcomes() {
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('pending'); // 'pending' | 'verified' | 'rejected'
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Reject Modal
  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [queueRes, statsRes] = await Promise.all([
        externalOutcomeService.getVerificationQueue({
          status: statusFilter,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
        }),
        externalOutcomeService.getStats(),
      ]);
      setQueue(queueRes.queue || []);
      setStats(statsRes);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Failed to load external outcomes queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter]);

  const handleVerify = async (id, action, reason = '') => {
    try {
      setProcessingId(id);
      setError(null);
      await externalOutcomeService.verifyOutcome(id, action, reason);
      setSuccessMessage(
        action === 'approve'
          ? 'Outcome verified and added to official institutional records.'
          : 'Outcome submission rejected.'
      );
      if (rejectModalItem) setRejectModalItem(null);
      await loadData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to verify outcome.');
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
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-widest">
              NIRF & NAAC Verification
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-400" />
            External Outcomes Verification Queue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review and digitally seal self-reported off-campus jobs, GATE/GRE admissions, and student startups for accreditation statistics.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Pending Verification</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{stats?.pending || 0}</p>
          <p className="text-[10px] text-slate-500 mt-1">Awaiting TPO validation</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Verified Off-Campus</span>
            <Briefcase className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{stats?.verifiedOffCampus || 0}</p>
          <p className="text-[10px] text-slate-500 mt-1">Added to placement stats</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Higher Studies</span>
            <GraduationCap className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-cyan-400">{stats?.verifiedHigherStudies || 0}</p>
          <p className="text-[10px] text-slate-500 mt-1">MS / MTech / MBA admissions</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Student Startups</span>
            <Rocket className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400">{stats?.verifiedStartups || 0}</p>
          <p className="text-[10px] text-slate-500 mt-1">Active venture founders</p>
        </div>
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

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Status:</span>
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                statusFilter === 'pending' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending Review ({stats?.pending || 0})
            </button>
            <button
              onClick={() => setStatusFilter('verified')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                statusFilter === 'verified' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Verified ({(stats?.verifiedOffCampus || 0) + (stats?.verifiedHigherStudies || 0) + (stats?.verifiedStartups || 0)})
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                statusFilter === 'rejected' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-400 font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Off-Campus Placement">Off-Campus Placement</option>
            <option value="Higher Studies">Higher Studies</option>
            <option value="Entrepreneurship">Entrepreneurship</option>
          </select>
        </div>
      </div>

      {/* Queue items */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading submissions...</p>
        </div>
      ) : queue.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No Outcomes Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            There are no student submissions matching the selected status and category filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => {
            const student = item.studentId;
            return (
              <div
                key={item._id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4"
              >
                {/* Header row with student info and category */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                      {item.category === 'Off-Campus Placement' && <Briefcase className="w-5 h-5 text-emerald-400" />}
                      {item.category === 'Higher Studies' && <GraduationCap className="w-5 h-5 text-cyan-400" />}
                      {item.category === 'Entrepreneurship' && <Rocket className="w-5 h-5 text-purple-400" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-base">
                          {student?.firstName} {student?.lastName}
                        </span>
                        <span className="font-mono text-slate-400 text-xs">({student?.rollNo || 'Roll N/A'})</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {student?.branch} • Class of {student?.gradYear || 2026} • {student?.email}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    Reported on {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Outcome specific details */}
                {item.category === 'Off-Campus Placement' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Company</span>
                      <span className="font-bold text-slate-200 mt-0.5 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                        {item.offCampusDetails?.companyName}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Role</span>
                      <span className="font-semibold text-slate-300 mt-0.5 block truncate">
                        {item.offCampusDetails?.role}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">CTC (LPA)</span>
                      <span className="font-extrabold text-emerald-400 mt-0.5 block">
                        ₹{item.offCampusDetails?.ctcLpa} LPA
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Location</span>
                      <span className="font-semibold text-slate-300 mt-0.5 block">
                        {item.offCampusDetails?.location || 'India'}
                      </span>
                    </div>
                  </div>
                )}

                {item.category === 'Higher Studies' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Institution</span>
                      <span className="font-bold text-slate-200 mt-0.5 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                        {item.higherStudiesDetails?.universityName}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Program</span>
                      <span className="font-semibold text-slate-300 mt-0.5 block">
                        {item.higherStudiesDetails?.degree} in {item.higherStudiesDetails?.program}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Exam</span>
                      <span className="font-bold text-cyan-400 mt-0.5 block">
                        {item.higherStudiesDetails?.examTaken}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Score / Rank</span>
                      <span className="font-semibold text-slate-300 mt-0.5 block">
                        {item.higherStudiesDetails?.score || 'N/A'}
                      </span>
                    </div>
                  </div>
                )}

                {item.category === 'Entrepreneurship' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Startup Name</span>
                      <span className="font-bold text-slate-200 mt-0.5 flex items-center gap-1">
                        <Rocket className="w-3.5 h-3.5 text-purple-400" />
                        {item.entrepreneurshipDetails?.startupName}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Role & Domain</span>
                      <span className="font-semibold text-slate-300 mt-0.5 block truncate">
                        {item.entrepreneurshipDetails?.role} • {item.entrepreneurshipDetails?.sector}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Team Size</span>
                      <span className="font-bold text-slate-300 mt-0.5 block">
                        {item.entrepreneurshipDetails?.teamSize} Members
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Funding</span>
                      <span className="font-bold text-emerald-400 mt-0.5 block">
                        ₹{item.entrepreneurshipDetails?.fundingRaisedLakhs || 0} Lakhs
                      </span>
                    </div>
                  </div>
                )}

                {/* Uploaded Document Proof Link */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2">
                  <div>
                    {item.offCampusDetails?.offerLetterUrl && (
                      <a
                        href={item.offCampusDetails.offerLetterUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-cyan-400 hover:underline font-semibold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Uploaded Offer Letter Document
                      </a>
                    )}
                    {item.higherStudiesDetails?.admissionLetterUrl && (
                      <a
                        href={item.higherStudiesDetails.admissionLetterUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-cyan-400 hover:underline font-semibold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Uploaded Admission Letter
                      </a>
                    )}
                    {item.entrepreneurshipDetails?.website && (
                      <a
                        href={item.entrepreneurshipDetails.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-purple-400 hover:underline font-semibold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Visit Startup Website
                      </a>
                    )}
                  </div>

                  {/* Actions for pending items */}
                  {statusFilter === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setRejectModalItem(item);
                          setRejectionReason('');
                        }}
                        disabled={processingId === item._id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-950/30 hover:bg-red-950/60 text-red-400 border border-red-900/40 text-xs font-semibold transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>

                      <button
                        onClick={() => handleVerify(item._id, 'approve')}
                        disabled={processingId === item._id}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-md shadow-emerald-500/10"
                      >
                        {processingId === item._id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        )}
                        Verify & Seal for NIRF
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              Reject Outcome Verification
            </h3>
            <p className="text-xs text-slate-400">
              Provide a reason to the student explaining why the document could not be validated (e.g. illegible letter, unofficial offer).
            </p>

            <textarea
              rows={3}
              placeholder="Rejection explanation..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-red-500/50"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalItem(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerify(rejectModalItem._id, 'reject', rejectionReason)}
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
