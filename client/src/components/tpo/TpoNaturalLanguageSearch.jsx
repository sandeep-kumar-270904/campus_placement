import React, { useState } from 'react';
import aiService from '../../services/aiService';
import AiBadge from '../ai/AiBadge';
import {
  Sparkles,
  Search,
  Filter,
  Download,
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function TpoNaturalLanguageSearch({ onSelectCohort }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState('');

  const sampleQueries = [
    'CSE students above 8 CGPA, no backlogs, not applied to any drive',
    'ECE students with CGPA >= 7.5, unplaced',
    'IT students with active backlogs, pending verification',
    'Unapplied students across all branches',
  ];

  const handleSearch = async (e, customQuery) => {
    if (e) e.preventDefault();
    const textToSearch = customQuery || query;
    if (!textToSearch.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await aiService.naturalLanguageTpoQuery(textToSearch.trim());
      setResult(res);
      if (onSelectCohort && res.students) {
        onSelectCohort(res.students);
      }
    } catch (err) {
      console.error('NL query failed:', err);
      setError(err.response?.data?.error?.message || 'Failed to parse search query.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (!result?.students?.length) return;
    const headers = ['Name', 'Roll No', 'Branch', 'CGPA', 'Backlogs', 'Email', 'Verified'];
    const rows = result.students.map((s) => [
      `"${s.name}"`,
      `"${s.rollNo}"`,
      `"${s.branch}"`,
      s.cgpa || 0,
      s.backlogs || 0,
      `"${s.email}"`,
      s.isVerifiedByTPO ? 'Yes' : 'No',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cohort_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Search Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AiBadge text="Natural Language Assistant" />
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <span>Conversational Cohort Filter</span>
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">
          Strictly read-only & tenant isolated
        </span>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder='e.g. "CSE students above 8 CGPA, no backlogs, not applied to any drive"'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{loading ? 'Interpreting...' : 'Search'}</span>
        </button>
      </form>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="text-slate-500 font-semibold mr-1">Examples:</span>
        {sampleQueries.map((sample, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setQuery(sample);
              handleSearch(null, sample);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            "{sample}"
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Query Results & Interpretation Preview */}
      {result && (
        <div className="p-4 bg-slate-950 border border-indigo-500/30 rounded-xl space-y-3 text-xs animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">
                Interpreted Safe Filter
              </span>
              <p className="text-white font-semibold">{result.explanation}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs">
                Found <strong className="text-white">{result.totalCount || 0}</strong> students
              </span>

              {result.students?.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs transition"
                >
                  <Download className="w-3 h-3 text-emerald-400" />
                  <span>Export CSV</span>
                </button>
              )}
            </div>
          </div>

          {/* Table Preview of Top Matches */}
          {result.students?.length > 0 ? (
            <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-800/80">
              <table className="w-full text-left text-[11px] text-slate-300">
                <thead className="bg-slate-900 sticky top-0 text-slate-400">
                  <tr>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-2">Roll No</th>
                    <th className="py-2 px-2">Branch</th>
                    <th className="py-2 px-2">CGPA</th>
                    <th className="py-2 px-2">Backlogs</th>
                    <th className="py-2 px-3">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
                  {result.students.slice(0, 10).map((s) => (
                    <tr key={s.id} className="hover:bg-slate-900/50">
                      <td className="py-2 px-3 font-semibold text-white">{s.name}</td>
                      <td className="py-2 px-2 font-mono text-slate-400">{s.rollNo}</td>
                      <td className="py-2 px-2">{s.branch}</td>
                      <td className="py-2 px-2 font-mono">{s.cgpa?.toFixed(2) || '0.00'}</td>
                      <td className="py-2 px-2">{s.backlogs}</td>
                      <td className="py-2 px-3 truncate max-w-[150px]">{s.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.students.length > 10 && (
                <div className="p-2 text-center text-[10px] text-slate-500 bg-slate-950">
                  + {result.students.length - 10} more students in cohort
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-500 italic py-2">
              No students matched this exact query combination.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
