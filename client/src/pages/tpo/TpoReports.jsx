import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Clock,
  CheckCircle,
  FileText,
  Filter,
  ShieldCheck,
  Building2,
  Users,
  Award,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import tpoService from '../../services/tpoService';
import api from '../../services/api';

export default function TpoReports() {
  const [templates, setTemplates] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected format and filters for generation
  const [selectedFormat, setSelectedFormat] = useState('xlsx'); // 'xlsx' | 'csv'
  const [selectedBatch, setSelectedBatch] = useState('2026');
  const [generatingId, setGeneratingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tplRes, histRes] = await Promise.all([
        tpoService.getReportTemplates(),
        tpoService.getReportHistory(),
      ]);

      setTemplates(tplRes.templates || []);
      setHistory(histRes.history || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load report templates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateReport = async (templateId) => {
    try {
      setGeneratingId(templateId);

      // Request file download via blob
      const response = await api.post(
        '/tpo/reports/generate',
        {
          templateId,
          format: selectedFormat,
          filters: { graduationYear: selectedBatch },
        },
        { responseType: 'blob' }
      );

      // Create download trigger
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = selectedFormat === 'csv' ? 'csv' : 'xlsx';
      link.setAttribute('download', `${templateId}-${Date.now()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Refresh history
      const histRes = await tpoService.getReportHistory();
      setHistory(histRes.history || []);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to generate report.');
    } finally {
      setGeneratingId(null);
    }
  };

  const getTemplateIcon = (id) => {
    switch (id) {
      case 'nirf-placement-report':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'drive-hiring-roster':
        return <Building2 className="w-5 h-5 text-cyan-400" />;
      case 'department-stats':
        return <TrendingUp className="w-5 h-5 text-purple-400" />;
      case 'company-crm-history':
        return <Building2 className="w-5 h-5 text-amber-400" />;
      case 'master-student-callset':
        return <Users className="w-5 h-5 text-indigo-400" />;
      default:
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Export Center
            </span>
            <span className="text-xs text-slate-400">Institutional Reports & Audit Logs</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Institutional Reports & Compliance Exporter
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate audit-ready spreadsheets for NIRF, NAAC accreditation, department performance reviews, and recruiter catalogs.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Batch Selector */}
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-semibold focus:outline-none focus:border-emerald-500"
          >
            <option value="2025">Batch 2025</option>
            <option value="2026">Batch 2026</option>
            <option value="2027">Batch 2027</option>
          </select>

          {/* Format Switcher */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setSelectedFormat('xlsx')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedFormat === 'xlsx'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Excel (.xlsx)
            </button>
            <button
              onClick={() => setSelectedFormat('csv')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedFormat === 'csv'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              CSV (.csv)
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading preconfigured report templates...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 text-center text-rose-300">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <p className="font-semibold text-sm mb-3">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Report Templates Grid */}
          <div>
            <h2 className="text-base font-bold text-white mb-3">Prebuilt Report Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {templates.map((tpl) => {
                const isGenerating = generatingId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-sm hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center shrink-0">
                          {getTemplateIcon(tpl.id)}
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {tpl.category}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {tpl.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-mono uppercase">
                        Format: {selectedFormat}
                      </span>
                      <button
                        onClick={() => handleGenerateReport(tpl.id)}
                        disabled={isGenerating}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
                      >
                        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                        {isGenerating ? 'Generating...' : 'Download Report'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Generated History Audit Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Report Generation Audit History</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Logged history of synthesized exports with record counts and timestamps
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {history.length} reports logged
              </span>
            </div>

            {history.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs italic">
                No reports generated yet in this session. Click any template above to generate an export.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-3">Report Name</th>
                      <th className="px-5 py-3">Format</th>
                      <th className="px-5 py-3">Records Exported</th>
                      <th className="px-5 py-3">Generated By</th>
                      <th className="px-5 py-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {history.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-white flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                          {item.reportName}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                            {item.format}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-emerald-400">
                          {item.rowCount} rows
                        </td>
                        <td className="px-5 py-3.5 text-slate-300">{item.generatedBy}</td>
                        <td className="px-5 py-3.5 text-slate-400">
                          {new Date(item.generatedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
