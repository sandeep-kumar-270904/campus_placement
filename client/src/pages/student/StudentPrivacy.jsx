import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lock,
  FileText,
  UserX,
  History,
  X,
  Sparkles,
} from 'lucide-react';
import studentService from '../../services/studentService';
import { useTenant } from '../../context/TenantContext';

export default function StudentPrivacy() {
  const { branding } = useTenant();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [toastMsg, setToastMsg] = useState({ type: '', text: '' });

  // Consent Toggles
  const [consentRecruiter, setConsentRecruiter] = useState(true);
  const [consentAnalytics, setConsentAnalytics] = useState(true);
  const [savingConsent, setSavingConsent] = useState(false);

  // Deletion Modal
  const [deletionModalOpen, setDeletionModalOpen] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [submittingDeletion, setSubmittingDeletion] = useState(false);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await studentService.getProfile();
      setProfile(res.profile || {});
    } catch (err) {
      console.error('Failed to load privacy details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleDownloadMyData = async () => {
    try {
      setExporting(true);
      setToastMsg({ type: '', text: '' });

      const blobData = await studentService.exportMyData();
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `placeearly-my-data-${profile?.rollNo || 'export'}.json`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      setToastMsg({
        type: 'success',
        text: 'Personal data package downloaded successfully (GDPR & DPDP compliant).',
      });
      setTimeout(() => setToastMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setToastMsg({
        type: 'error',
        text: err?.response?.data?.error?.message || 'Failed to export data package.',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleRecordConsent = async () => {
    try {
      setSavingConsent(true);
      setToastMsg({ type: '', text: '' });
      await studentService.recordConsent('recruiter_data_sharing', '2.0');
      setToastMsg({
        type: 'success',
        text: 'Recruiter data sharing preferences recorded and timestamped in audit log.',
      });
      setTimeout(() => setToastMsg({ type: '', text: '' }), 4000);
      fetchProfileData();
    } catch (err) {
      setToastMsg({
        type: 'error',
        text: err?.response?.data?.error?.message || 'Failed to record consent.',
      });
    } finally {
      setSavingConsent(false);
    }
  };

  const handleDeletionSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingDeletion(true);
      setToastMsg({ type: '', text: '' });
      const res = await studentService.requestDeletion(deletionReason);
      setToastMsg({
        type: 'success',
        text: res.message || 'Account deletion request submitted to Institution Data Controller.',
      });
      setDeletionModalOpen(false);
      setDeletionReason('');
      setTimeout(() => setToastMsg({ type: '', text: '' }), 5000);
      fetchProfileData();
    } catch (err) {
      setToastMsg({
        type: 'error',
        text: err?.response?.data?.error?.message || 'Failed to submit deletion request.',
      });
    } finally {
      setSubmittingDeletion(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-white">Data Privacy & Subject Rights</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              DPDP & GDPR Compliant
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Control institutional data portability, recruiter consent records, and right-to-erasure requests.
          </p>
        </div>

        <button
          onClick={handleDownloadMyData}
          disabled={exporting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{exporting ? 'Generating JSON...' : 'Download My Data (JSON)'}</span>
        </button>
      </div>

      {toastMsg.text && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
            toastMsg.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
              : 'bg-rose-950/70 border-rose-700 text-rose-300'
          }`}
        >
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Main Grid: Data Portability & Consent Logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recruiter Data Sharing Consent Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recruiter Data Sharing Consent</h2>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Specify how your academic and contact details are disclosed to external corporate campus recruiters.
          </p>

          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 cursor-pointer">
              <input
                type="checkbox"
                checked={consentRecruiter}
                onChange={(e) => setConsentRecruiter(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500"
              />
              <div className="space-y-0.5 text-xs">
                <span className="font-bold text-white block">Corporate Recruiter Resume Access</span>
                <span className="text-slate-400 block text-[11px]">
                  Authorize verified partner companies to inspect your resume, GitHub links, and CGPA during active drives.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 cursor-pointer">
              <input
                type="checkbox"
                checked={consentAnalytics}
                onChange={(e) => setConsentAnalytics(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500"
              />
              <div className="space-y-0.5 text-xs">
                <span className="font-bold text-white block">Institutional Placement Analytics</span>
                <span className="text-slate-400 block text-[11px]">
                  Permit anonymized compensation and CTC benchmarking for accreditation and NIRF reporting.
                </span>
              </div>
            </label>
          </div>

          <button
            onClick={handleRecordConsent}
            disabled={savingConsent}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md disabled:opacity-50"
          >
            {savingConsent ? 'Recording...' : 'Update & Record Consent'}
          </button>
        </div>

        {/* Account Deletion Request Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <UserX className="w-5 h-5 text-rose-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Account Deletion & Erasure</h2>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Under DPDP Act and GDPR Article 17, you have the right to request the erasure of your personal placement records upon graduating or un-enrolling.
            </p>

            {profile?.deletionRequest ? (
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">Deletion Request Active</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                    {profile.deletionRequest.status || 'Pending'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Requested on {new Date(profile.deletionRequest.requestedAt).toLocaleDateString()}
                </p>
                {profile.deletionRequest.reason && (
                  <p className="text-[11px] text-slate-400 italic">"{profile.deletionRequest.reason}"</p>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-400">
                Submitting a deletion request will notify the college TPO and Data Protection Officer to purge your candidate profiles, uploaded documents, and interview logs.
              </div>
            )}
          </div>

          {!profile?.deletionRequest && (
            <button
              onClick={() => setDeletionModalOpen(true)}
              className="w-full py-2.5 bg-slate-800 hover:bg-rose-950/50 text-rose-400 hover:text-rose-300 border border-rose-900/40 font-semibold text-xs rounded-xl transition"
            >
              Request Account Deletion
            </button>
          )}
        </div>
      </div>

      {/* Consent Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-teal-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Immutable Consent Audit Log ({profile?.consentLog?.length || 0})
          </h2>
        </div>

        {(!profile?.consentLog || profile.consentLog.length === 0) ? (
          <p className="text-xs text-slate-500 py-3 text-center">No recorded consent entries found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3">Consent Type</th>
                  <th className="p-3">Policy Version</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {profile.consentLog.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-white">{log.consentType}</td>
                    <td className="p-3 text-slate-400">v{log.version || '1.0'}</td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">{log.ipAddress || 'Client IP'}</td>
                    <td className="p-3 text-right text-slate-400">
                      {log.consentedAt ? new Date(log.consentedAt).toLocaleString() : 'Recorded'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Account Deletion Request Modal */}
      {deletionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleDeletionSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Confirm Account Deletion Request</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeletionModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will formally request the complete purge of your student placement profile and cloud documents. Please state your reason for university compliance records.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Reason for Deletion</label>
              <textarea
                required
                rows={3}
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                placeholder="e.g. Graduated from college in 2026 and wish to permanently close account."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletionModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingDeletion || !deletionReason.trim()}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition disabled:opacity-50"
              >
                {submittingDeletion ? 'Submitting...' : 'Submit Deletion Request'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
