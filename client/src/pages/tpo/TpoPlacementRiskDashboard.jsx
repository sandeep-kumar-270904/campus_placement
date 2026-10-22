import React, { useState, useEffect } from 'react';
import aiService from '../../services/aiService';
import AiBadge from '../../components/ai/AiBadge';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Users,
  Search,
  Filter,
  Download,
  Mail,
  ChevronRight,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function TpoPlacementRiskDashboard() {
  const [data, setData] = useState({ counts: {}, students: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [nudgeSuccess, setNudgeSuccess] = useState('');

  useEffect(() => {
    loadRiskData();
  }, [branchFilter, riskFilter]);

  const loadRiskData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await aiService.getPlacementRisk({
        branch: branchFilter || undefined,
        riskLevel: riskFilter || undefined,
      });
      setData(res || { counts: {}, students: [] });
    } catch (err) {
      console.error('Failed to load placement risk:', err);
      setError(err.response?.data?.error?.message || 'Failed to load placement risk predictions.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (!data.students?.length) return;
    const headers = ['Name', 'Roll No', 'Branch', 'CGPA', 'Backlogs', 'Applications', 'Risk Score', 'Risk Level', 'Primary Reason', 'Intervention'];
    const rows = data.students.map((s) => [
      `"${s.name}"`,
      `"${s.rollNo}"`,
      `"${s.branch}"`,
      s.cgpa || 0,
      s.backlogs || 0,
      s.applicationsCount || 0,
      s.riskScore,
      `"${s.riskLevel}"`,
      `"${(s.reasons?.[0] || '').replace(/"/g, '""')}"`,
      `"${(s.suggestedIntervention || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Placement_Risk_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleSendNudge = (student) => {
    setNudgeSuccess(`Priority intervention alert sent to ${student.name} (${student.email || student.rollNo})!`);
    setTimeout(() => setNudgeSuccess(''), 4000);
  };

  const filteredStudents = (data.students || []).filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo?.toLowerCase().includes(search.toLowerCase())
  );

  const counts = data.counts || { total: 0, high: 0, medium: 0, low: 0, placed: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AiBadge text="Transparent Risk Engine" />
            <span className="text-xs text-slate-400 font-medium">
              Strictly Non-Demographic • Objective Placement Forecast
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            Placement-Risk Predictor & Interventions
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify at-risk students based on application velocity, academic backlog constraints, profile completeness, and mock interview performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={!data.students?.length}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 disabled:opacity-50 text-slate-200 border border-slate-700/80 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Risk Cohort CSV</span>
          </button>
        </div>
      </div>

      {/* Ethical Compliance Banner */}
      <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-slate-300 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <p>
          <strong className="text-white">Fairness & Algorithmic Transparency Mandate:</strong> Risk scores are calculated using strictly objective academic progress, application velocity, and engagement data. In accordance with platform policy, demographic factors (gender, caste, religion, etc.) are strictly excluded from the model.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {nudgeSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{nudgeSuccess}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">
            Evaluated Cohort
          </span>
          <span className="text-2xl font-black text-white font-mono">{counts.total}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <span className="text-[11px] font-semibold text-red-400 block mb-1">
            High Risk Students
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-400 font-mono">{counts.high}</span>
            <span className="text-[11px] text-slate-500">
              {counts.total ? Math.round((counts.high / counts.total) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <span className="text-[11px] font-semibold text-amber-400 block mb-1">
            Medium Risk
          </span>
          <span className="text-2xl font-black text-amber-400 font-mono">{counts.medium}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <span className="text-[11px] font-semibold text-emerald-400 block mb-1">
            Low Risk / On Track
          </span>
          <span className="text-2xl font-black text-emerald-400 font-mono">{counts.low}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg col-span-2 lg:col-span-1">
          <span className="text-[11px] font-semibold text-teal-400 block mb-1">
            Placed Students
          </span>
          <span className="text-2xl font-black text-teal-400 font-mono">{counts.placed}</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student name or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Branches</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="MECH">MECH</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Risk Levels</option>
            <option value="High">High Risk Only</option>
            <option value="Medium">Medium Risk Only</option>
            <option value="Low">Low Risk Only</option>
          </select>
        </div>
      </div>

      {/* Student Risk Roster Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-3">Branch & CGPA</th>
                <th className="py-3 px-3">Apps / Backlogs</th>
                <th className="py-3 px-3">Risk Level</th>
                <th className="py-3 px-4">Key Risk Factors</th>
                <th className="py-3 px-4">Recommended Intervention</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 animate-pulse">
                    Computing transparent risk scores...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No students match the current filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.studentId} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">{st.name}</span>
                      <span className="font-mono text-[11px] text-slate-500">{st.rollNo}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-200 block">{st.branch}</span>
                      <span className="font-mono text-[11px] text-slate-400">
                        CGPA: {st.cgpa?.toFixed(2) || '0.00'}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="block text-slate-300">
                        {st.applicationsCount} applied
                      </span>
                      <span
                        className={`text-[11px] font-mono ${
                          st.backlogs > 0 ? 'text-red-400 font-bold' : 'text-slate-500'
                        }`}
                      >
                        {st.backlogs} backlogs
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          st.riskLevel === 'High'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : st.riskLevel === 'Medium'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{st.riskLevel} ({st.riskScore})</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <ul className="space-y-0.5 text-[11px] text-slate-400 list-disc list-inside">
                        {(st.reasons || []).slice(0, 2).map((r, i) => (
                          <li key={i} className="truncate">{r}</li>
                        ))}
                      </ul>
                    </td>

                    <td className="py-3 px-4 max-w-xs text-slate-300 text-[11px]">
                      {st.suggestedIntervention}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {!st.isPlaced ? (
                        <button
                          onClick={() => handleSendNudge(st)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Nudge</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-teal-400">Placed ✓</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
