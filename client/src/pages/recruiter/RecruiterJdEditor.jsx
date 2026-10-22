import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import recruiterService from '../../services/recruiterService';
import {
  FileEdit,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  ShieldCheck,
  Send,
  Building2,
} from 'lucide-react';

export default function RecruiterJdEditor() {
  const { driveId } = useParams();
  const navigate = useNavigate();

  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    salary: '',
    ctc: {
      total: 0,
      fixed: 0,
      variable: 0,
      currency: 'INR',
    },
    eligibilityRules: {
      minCgpa: 8.0,
      maxBacklogs: 0,
      allowedBranches: ['CSE', 'IT'],
    },
    rounds: [],
  });

  useEffect(() => {
    loadDrive();
  }, [driveId]);

  const loadDrive = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await recruiterService.getDriveDetails(driveId);
      const opp = data.drive || data;
      setDrive(opp);

      // Initialize form with existing or proposed values
      const initial = opp.proposedJd && opp.proposedJd.status === 'Pending_Approval'
        ? opp.proposedJd
        : opp;

      setFormData({
        title: initial.title || '',
        description: initial.description || '',
        salary: initial.salary || '',
        ctc: {
          total: initial.ctc?.total || 0,
          fixed: initial.ctc?.fixed || 0,
          variable: initial.ctc?.variable || 0,
          currency: initial.ctc?.currency || 'INR',
        },
        eligibilityRules: {
          minCgpa: initial.eligibilityRules?.minCgpa ?? 7.5,
          maxBacklogs: initial.eligibilityRules?.maxBacklogs ?? 0,
          allowedBranches: initial.eligibilityRules?.allowedBranches || ['CSE', 'IT'],
        },
        rounds: initial.rounds?.length
          ? initial.rounds
          : [
              { roundNumber: 1, name: 'Online Coding Assessment', type: 'OA' },
              { roundNumber: 2, name: 'Technical Round 1', type: 'Tech' },
              { roundNumber: 3, name: 'Googleyness & HR', type: 'HR' },
            ],
      });
    } catch (err) {
      console.error('Failed to load drive:', err);
      setError(err.response?.data?.error?.message || 'Failed to load drive details.');
    } finally {
      setLoading(false);
    }
  };

  const handleBranchToggle = (branch) => {
    const current = formData.eligibilityRules.allowedBranches || [];
    const exists = current.includes(branch);
    const updated = exists ? current.filter((b) => b !== branch) : [...current, branch];
    setFormData({
      ...formData,
      eligibilityRules: {
        ...formData.eligibilityRules,
        allowedBranches: updated,
      },
    });
  };

  const handleAddRound = () => {
    const nextNum = formData.rounds.length + 1;
    setFormData({
      ...formData,
      rounds: [
        ...formData.rounds,
        { roundNumber: nextNum, name: `Round ${nextNum}`, type: 'Tech' },
      ],
    });
  };

  const handleRemoveRound = (idx) => {
    const updated = formData.rounds.filter((_, i) => i !== idx).map((r, i) => ({
      ...r,
      roundNumber: i + 1,
    }));
    setFormData({ ...formData, rounds: updated });
  };

  const handleRoundChange = (idx, field, value) => {
    const updated = [...formData.rounds];
    updated[idx][field] = value;
    setFormData({ ...formData, rounds: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        salary: formData.salary,
        ctc: {
          total: Number(formData.ctc.fixed || 0) + Number(formData.ctc.variable || 0),
          fixed: Number(formData.ctc.fixed || 0),
          variable: Number(formData.ctc.variable || 0),
          currency: 'INR',
        },
        eligibilityRules: formData.eligibilityRules,
        rounds: formData.rounds,
      };

      await recruiterService.proposeJd(driveId, payload);
      setSuccessMsg('Proposed JD & criteria submitted successfully for TPO approval!');
      await loadDrive();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit JD proposal.');
    } finally {
      setSaving(false);
    }
  };

  const proposedJd = drive?.proposedJd;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium mb-1">
            <span>{drive?.companyName || 'Corporate Drive'}</span>
            <span>•</span>
            <span>Job Description & Selection Criteria</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileEdit className="w-6 h-6 text-indigo-400" />
            JD & Criteria Proposal Editor
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Propose revisions to job roles, CTC breakdowns, rounds, or academic eligibility. All changes are submitted to the college Placement Cell for endorsement.
          </p>
        </div>
      </div>

      {/* Proposal State Notification Banner */}
      {proposedJd && proposedJd.status === 'Pending_Approval' && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/50 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-amber-300 block text-sm">
              Proposal Awaiting TPO Endorsement
            </span>
            <p className="text-slate-300">
              You submitted proposed updates on{' '}
              {new Date(proposedJd.proposedAt).toLocaleDateString()} at{' '}
              {new Date(proposedJd.proposedAt).toLocaleTimeString()}. The campus TPO is currently reviewing the criteria changes against university placement policy.
            </p>
          </div>
        </div>
      )}

      {proposedJd && proposedJd.status === 'Approved' && (
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/50 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-emerald-300 block text-sm">
              Latest Proposal Approved by TPO
            </span>
            <p className="text-slate-300">
              Your updates have been reviewed and accepted into the live drive criteria.
              {proposedJd.tpoRemarks && (
                <span className="block italic text-emerald-400/90 mt-0.5">
                  TPO Note: "{proposedJd.tpoRemarks}"
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {proposedJd && proposedJd.status === 'Rejected' && (
        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/50 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-red-300 block text-sm">
              Proposal Returned / Rejected by TPO
            </span>
            <p className="text-slate-300">
              The Placement Cell returned this proposal without approval.
              {proposedJd.tpoRemarks && (
                <span className="block font-semibold text-red-300 mt-0.5">
                  Reason: {proposedJd.tpoRemarks}
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="h-96 bg-slate-900/60 border border-slate-800 rounded-2xl animate-pulse p-8" />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Role Overview */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Role & Job Description
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Role Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g. Software Development Engineer - Cloud & AI"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Job Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Responsibilities, technical expectations, and stack..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">
                  Salary / Package Display String
                </label>
                <input
                  type="text"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="e.g. 24 - 32 LPA"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: CTC Breakdown */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              CTC Breakdown
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Fixed Component (₹)</label>
                <input
                  type="number"
                  value={formData.ctc.fixed}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ctc: { ...formData.ctc, fixed: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Variable / Performance (₹)</label>
                <input
                  type="number"
                  value={formData.ctc.variable}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ctc: { ...formData.ctc, variable: Number(e.target.value) },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Calculated Annual Total CTC:</span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                ₹{(Number(formData.ctc.fixed || 0) + Number(formData.ctc.variable || 0)).toLocaleString()} (
                {(
                  (Number(formData.ctc.fixed || 0) + Number(formData.ctc.variable || 0)) /
                  100000
                ).toFixed(2)}{' '}
                LPA)
              </span>
            </div>
          </div>

          {/* Section 3: Academic Eligibility Thresholds */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Academic Eligibility Thresholds
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Minimum CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.eligibilityRules.minCgpa}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      eligibilityRules: {
                        ...formData.eligibilityRules,
                        minCgpa: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Maximum Active Backlogs</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.eligibilityRules.maxBacklogs}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      eligibilityRules: {
                        ...formData.eligibilityRules,
                        maxBacklogs: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-2 font-semibold text-xs">
                Allowed Engineering Disciplines
              </label>
              <div className="flex flex-wrap gap-2 text-xs">
                {['CSE', 'IT', 'ECE', 'EE', 'MECH', 'CIVIL'].map((branch) => {
                  const selected = formData.eligibilityRules.allowedBranches?.includes(branch);
                  return (
                    <button
                      type="button"
                      key={branch}
                      onClick={() => handleBranchToggle(branch)}
                      className={`px-3 py-1.5 rounded-lg font-semibold border transition ${
                        selected
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {branch}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 4: Selection Rounds */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Recruitment Stages & Rounds
              </h3>
              <button
                type="button"
                onClick={handleAddRound}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Add Round</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.rounds.map((round, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs"
                >
                  <span className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center font-bold text-slate-400">
                    {round.roundNumber || idx + 1}
                  </span>

                  <input
                    type="text"
                    value={round.name}
                    onChange={(e) => handleRoundChange(idx, 'name', e.target.value)}
                    placeholder="Round Name (e.g. Systems Design)"
                    required
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200"
                  />

                  <select
                    value={round.type}
                    onChange={(e) => handleRoundChange(idx, 'type', e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200"
                  >
                    <option value="OA">OA / Assessment</option>
                    <option value="Tech">Technical Interview</option>
                    <option value="HR">HR / Leadership</option>
                    <option value="Group Discussion">Group Discussion</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleRemoveRound(idx)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition"
                    title="Remove Round"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => navigate('/recruiter/drives')}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-lg shadow-indigo-600/20 transition"
            >
              <Send className="w-4 h-4" />
              <span>{saving ? 'Submitting...' : 'Submit Proposal for TPO Approval'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
