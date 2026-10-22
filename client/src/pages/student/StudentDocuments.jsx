import React, { useState, useEffect } from 'react';
import {
  FolderLock,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Plus,
  ShieldCheck,
  Building2,
  FileCheck,
  X,
  Calendar,
} from 'lucide-react';
import studentService from '../../services/studentService';
import { uploadFile } from '../../services/documentService';
import { useTenant } from '../../context/TenantContext';

export default function StudentDocuments() {
  const { branding } = useTenant();

  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [resumeVersions, setResumeVersions] = useState([]);
  const [nocRequests, setNocRequests] = useState([]);
  const [error, setError] = useState('');

  // Upload Modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePurpose, setFilePurpose] = useState('marksheet');
  const [uploading, setUploading] = useState(false);

  // NOC Request Modal
  const [nocModalOpen, setNocModalOpen] = useState(false);
  const [nocForm, setNocForm] = useState({
    companyName: '',
    role: '',
    purpose: 'Internship NOC',
    startDate: '',
    endDate: '',
  });
  const [submittingNoc, setSubmittingNoc] = useState(false);
  const [toastMsg, setToastMsg] = useState({ type: '', text: '' });

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await studentService.getDocuments();
      setDocuments(res.documents || []);
      setResumeVersions(res.resumeVersions || []);
      setNocRequests(res.nocRequests || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
      setError(err?.response?.data?.error?.message || 'Failed to fetch student documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      setToastMsg({ type: '', text: '' });
      await uploadFile(selectedFile, filePurpose);
      setToastMsg({
        type: 'success',
        text: `File "${selectedFile.name}" uploaded to secure cloud storage!`,
      });
      setUploadModalOpen(false);
      setSelectedFile(null);
      setTimeout(() => setToastMsg({ type: '', text: '' }), 4000);
      fetchDocuments();
    } catch (err) {
      setToastMsg({
        type: 'error',
        text: err?.response?.data?.error?.message || 'Failed to upload document.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleNocSubmit = async (e) => {
    e.preventDefault();
    if (!nocForm.companyName.trim() || !nocForm.role.trim()) return;

    try {
      setSubmittingNoc(true);
      setToastMsg({ type: '', text: '' });
      const res = await studentService.requestNoc(nocForm);
      setToastMsg({
        type: 'success',
        text: res.message || 'Bonafide / NOC request submitted to Placement Cell!',
      });
      setNocModalOpen(false);
      setNocForm({
        companyName: '',
        role: '',
        purpose: 'Internship NOC',
        startDate: '',
        endDate: '',
      });
      setTimeout(() => setToastMsg({ type: '', text: '' }), 4000);
      fetchDocuments();
    } catch (err) {
      setToastMsg({
        type: 'error',
        text: err?.response?.data?.error?.message || 'Failed to submit NOC request.',
      });
    } finally {
      setSubmittingNoc(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-white">Document Vault & Bonafide NOC</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Private Cloud Storage
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Encrypted object storage with magic-byte scanning, 5-minute signed links, and TPO internship approval workflow.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setNocModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition"
          >
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Request Bonafide / NOC</span>
          </button>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
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

      {/* Main Grid: Document Vault (Left) & NOC Tracker (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Document Vault & Resume Versions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Vault */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderLock className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Academic Marksheets & Verified Files ({documents.length})
                </h2>
              </div>
              <span className="text-[11px] text-slate-400">Signed download links expire in 5m</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading documents...</div>
            ) : documents.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-800/40 border border-dashed border-slate-700 space-y-2">
                <FileText className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-300 font-semibold">No uploaded documents found.</p>
                <p className="text-[11px] text-slate-500">
                  Upload your semester marksheets, certificates, or 10th/12th pass certificates for TPO verification.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id || doc._id}
                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {doc.mimeType?.includes('pdf') ? 'PDF' : 'DOC'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white truncate">{doc.originalName}</p>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700 text-slate-300 capitalize">
                            {doc.purpose || 'marksheet'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Size: {((doc.sizeBytes || doc.size || 0) / 1024).toFixed(1)} KB • Uploaded:{' '}
                          {new Date(doc.createdAt || doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      {doc.signedUrl ? (
                        <a
                          href={doc.signedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <span>Download</span> <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-500">Unavailable</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Resume Versions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-teal-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Resume Version Library ({resumeVersions.length})
                </h2>
              </div>
            </div>

            {resumeVersions.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No resume versions uploaded. Upload one in the Profile Builder or via Document Vault.
              </p>
            ) : (
              <div className="space-y-3">
                {resumeVersions.map((v, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                      v.isActive
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-slate-800/40 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-slate-800 text-emerald-400 font-bold text-xs flex items-center justify-center">
                        v{v.version || idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white">{v.title || `Resume v${v.version}`}</p>
                          {v.isActive && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                              Active Primary
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {v.uploadedAt ? new Date(v.uploadedAt).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>

                    {v.fileUrl && (
                      <a
                        href={v.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:text-white flex items-center gap-1"
                      >
                        <span>Preview</span> <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Bonafide / NOC Internship Workflow */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  NOC Requests ({nocRequests.length})
                </h2>
              </div>
              <button
                onClick={() => setNocModalOpen(true)}
                className="text-xs font-bold text-emerald-400 hover:underline"
              >
                + Request
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Required for college endorsement and academic credit clearance for industry internships.
            </p>

            {nocRequests.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-800/40 border border-slate-700 space-y-1">
                <p className="text-xs text-slate-400">No NOC requests filed yet.</p>
                <p className="text-[10px] text-slate-500">
                  Click "+ Request" when an employer extends an off-campus or campus internship.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {nocRequests.map((noc, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-white">{noc.companyName}</h4>
                        <p className="text-[11px] text-emerald-400">{noc.role}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          noc.status === 'Approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : noc.status === 'Rejected'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {noc.status}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 space-y-0.5">
                      <p>Purpose: {noc.purpose}</p>
                      {noc.startDate && noc.endDate && (
                        <p>
                          Duration: {new Date(noc.startDate).toLocaleDateString()} —{' '}
                          {new Date(noc.endDate).toLocaleDateString()}
                        </p>
                      )}
                      {noc.tpoRemarks && (
                        <p className="text-slate-300 pt-1 border-t border-slate-700">
                          TPO Note: {noc.tpoRemarks}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleFileUpload}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Upload New Document</h3>
              </div>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Document Category / Purpose</label>
              <select
                value={filePurpose}
                onChange={(e) => setFilePurpose(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="marksheet">Academic Marksheet</option>
                <option value="certificate">Certification / Degree</option>
                <option value="id">Institutional ID / Govt ID</option>
                <option value="noc">Internship NOC Offer Evidence</option>
                <option value="resume">Resume Document</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Select File (Max 5 MB)</label>
              <input
                type="file"
                required
                accept=".pdf,.png,.jpg,.docx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-slate-950 hover:file:bg-emerald-400 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Supported formats: PDF, PNG, JPG, DOCX (magic-byte scanned)
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload File'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Request Bonafide / NOC Modal */}
      {nocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleNocSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Request Bonafide / NOC</h3>
              </div>
              <button
                type="button"
                onClick={() => setNocModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Company / Organization</label>
              <input
                type="text"
                required
                value={nocForm.companyName}
                onChange={(e) => setNocForm({ ...nocForm, companyName: e.target.value })}
                placeholder="e.g. Microsoft India"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Internship Role</label>
              <input
                type="text"
                required
                value={nocForm.role}
                onChange={(e) => setNocForm({ ...nocForm, role: e.target.value })}
                placeholder="e.g. Software Engineering Intern"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={nocForm.startDate}
                  onChange={(e) => setNocForm({ ...nocForm, startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={nocForm.endDate}
                  onChange={(e) => setNocForm({ ...nocForm, endDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Purpose / Endorsement Details</label>
              <input
                type="text"
                value={nocForm.purpose}
                onChange={(e) => setNocForm({ ...nocForm, purpose: e.target.value })}
                placeholder="e.g. Summer Internship NOC for 8th Semester"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setNocModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingNoc}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition disabled:opacity-50"
              >
                {submittingNoc ? 'Submitting...' : 'Submit NOC Request'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
