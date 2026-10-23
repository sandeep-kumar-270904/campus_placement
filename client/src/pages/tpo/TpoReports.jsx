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
  Settings,
  Mail,
  Sparkles,
  BarChart3,
  Calendar,
  X,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import reportService from '../../services/reportService';
import tpoService from '../../services/tpoService';
import api from '../../services/api';

const REPORT_TEMPLATES = [
  {
    id: 'nirf-placement-report',
    title: 'NIRF / NAAC Mandatory Placement Audit Report',
    description:
      'Formatted to NIRF and NAAC accreditation standards with graduating batch, placement status, median salary, higher studies, and entrepreneurship.',
    category: 'Accreditation & Compliance',
    formats: ['xlsx', 'pdf', 'csv'],
  },
  {
    id: 'placement-brochure',
    title: 'Annual Placement Brochure Dataset',
    description:
      'Comprehensive institutional overview: marquee recruiters, highest CTC offers, department placement rates, and sector distribution.',
    category: 'Institutional Marketing',
    formats: ['xlsx', 'pdf', 'csv'],
  },
  {
    id: 'company-wise',
    title: 'Corporate Recruiter Directory & Hiring Breakdown',
    description:
      'Company-level recruitment performance: drives conducted, total offers extended, highest/average packages, and target branches.',
    category: 'Corporate Relations',
    formats: ['xlsx', 'pdf', 'csv'],
  },
  {
    id: 'department-stats',
    title: 'Department-Wise Placement Statistics',
    description:
      'Discipline-level strength, eligible candidates, placed count, placement %, median CTC, and higher studies admissions across branches.',
    category: 'Institutional Metrics',
    formats: ['xlsx', 'pdf', 'csv'],
  },
  {
    id: 'unplaced-candidates',
    title: 'Unplaced Candidates Remediation Roster',
    description:
      'Targeted follow-up list of unplaced students with contact details, CGPA, backlogs, total applications, and counseling notes.',
    category: 'Counseling & Support',
    formats: ['xlsx', 'pdf', 'csv'],
  },
  {
    id: 'drive-funnel',
    title: 'Drive-Wise Recruitment Funnel Analytics',
    description:
      'Round-by-round candidate conversion rates (Applied → OA → Technical → HR → Offer Extended) with stage yield drops.',
    category: 'Placement Operations',
    formats: ['xlsx', 'pdf', 'csv'],
  },
];

export default function TpoReports() {
  const [history, setHistory] = useState([]);
  const [yoyData, setYoyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected format and filters
  const [selectedFormat, setSelectedFormat] = useState('xlsx'); // 'xlsx' | 'pdf' | 'csv'
  const [selectedBatch, setSelectedBatch] = useState('2026');

  // Asynchronous Job Progress State
  const [activeJob, setActiveJob] = useState(null); // { jobId, progress, status, templateId }
  const [pollInterval, setPollInterval] = useState(null);

  // Template Settings Modal
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [signatoryForm, setSignatoryForm] = useState([
    { title: 'Training & Placement Officer', name: 'Dr. Placement Officer' },
    { title: 'Principal / Director', name: 'Dr. College Principal' },
  ]);
  const [headerTitle, setHeaderTitle] = useState('CAMPUS PLACEMENT & ACCREDITATION AUDIT REPORT');
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Weekly Digest Modal
  const [digestModalOpen, setDigestModalOpen] = useState(false);
  const [digestData, setDigestData] = useState(null);
  const [digestLoading, setDigestLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [hist, yoy] = await Promise.all([
        reportService.getReportHistory(),
        reportService.getYoyAnalytics(),
      ]);
      setHistory(hist || []);
      setYoyData(yoy || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load report data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [pollInterval]);

  // Handle Asynchronous Report Generation
  const handleInitiateJob = async (templateId) => {
    try {
      setError(null);
      const res = await reportService.initiateJob(templateId, selectedFormat, {
        graduationYear: selectedBatch,
      });

      const { jobId } = res;
      setActiveJob({ jobId, progress: 15, status: 'processing', templateId });

      // Poll progress every 800ms
      const interval = setInterval(async () => {
        try {
          const job = await reportService.getJobProgress(jobId);
          setActiveJob({
            jobId,
            progress: job.progress || 50,
            status: job.status,
            templateId,
            downloadUrl: job.downloadUrl,
            fileName: job.fileName,
          });

          if (job.status === 'completed') {
            clearInterval(interval);
            // Trigger download automatically
            window.location.href = job.downloadUrl;
            setTimeout(() => {
              setActiveJob(null);
              fetchData();
            }, 3000);
          } else if (job.status === 'failed') {
            clearInterval(interval);
            setError(job.error || 'Report generation job failed.');
            setTimeout(() => setActiveJob(null), 4000);
          }
        } catch {
          // resilient retry
        }
      }, 800);

      setPollInterval(interval);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to initiate report job.');
    }
  };

  // Save Configured Signatories & Header
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSettingsSaving(true);
      await reportService.updateReportSettings({
        headerTitle,
        signatories: signatoryForm,
      });
      setSettingsModalOpen(false);
      alert('Report template signatories and header branding saved.');
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to update settings.');
    } finally {
      setSettingsSaving(false);
    }
  };

  // Preview Weekly TPO Digest Briefing
  const handleOpenDigest = async () => {
    try {
      setDigestModalOpen(true);
      setDigestLoading(true);
      const res = await reportService.getWeeklyDigest();
      setDigestData(res);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to compile weekly briefing.');
    } finally {
      setDigestLoading(false);
    }
  };

  const getTemplateIcon = (id) => {
    switch (id) {
      case 'nirf-placement-report':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'placement-brochure':
        return <Award className="w-5 h-5 text-amber-400" />;
      case 'company-wise':
        return <Building2 className="w-5 h-5 text-cyan-400" />;
      case 'department-stats':
        return <TrendingUp className="w-5 h-5 text-purple-400" />;
      case 'unplaced-candidates':
        return <Users className="w-5 h-5 text-rose-400" />;
      case 'drive-funnel':
        return <BarChart3 className="w-5 h-5 text-indigo-400" />;
      default:
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Automated Accreditation & Compliance
            </span>
            <span className="text-xs text-slate-400 font-medium">NAAC • NIRF • NBA Official Audits</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Institutional Placement Reporting Center
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Multi-format export engine generating verified spreadsheets, PDF dossiers with institutional crest and signatory lines, YoY comparison charts, and weekly executive digests.
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setSettingsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition shadow-sm"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>Template Settings</span>
          </button>

          <button
            onClick={handleOpenDigest}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition shadow-sm"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            <span>Weekly Digest Briefing</span>
          </button>

          {/* Batch Selector */}
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-bold focus:outline-none focus:border-emerald-500"
          >
            <option value="2024">Batch 2024</option>
            <option value="2025">Batch 2025</option>
            <option value="2026">Batch 2026</option>
          </select>

          {/* Format Switcher */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            {['xlsx', 'pdf', 'csv'].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`px-3 py-1.5 font-bold rounded-lg transition uppercase ${
                  selectedFormat === fmt
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Progress Bar for Background Jobs */}
      {activeJob && (
        <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-3 shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Generating {activeJob.templateId} in background queue...</span>
            </span>
            <span className="font-mono text-indigo-300">{activeJob.progress}% Completed</span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${activeJob.progress}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Compiling grounded cohort totals and synthesizing {selectedFormat.toUpperCase()} document stream. The download will start automatically upon completion.
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-white text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Year-over-Year (YoY) Visualizer & Trends Section */}
      {yoyData.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Multi-Year Progression</span>
              </div>
              <h2 className="text-lg font-bold text-white">Year-over-Year (YoY) Institutional Audit Trends</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">Batches: 2024 • 2025 • 2026</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Placement & Progression Rate */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Placement % & Progression Rate (%)</span>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yoyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="placementPercentage" name="Placement Rate (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="progressionRate" name="Progression Rate (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Median vs Highest CTC */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Compensation Trends (LPA)</span>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yoyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="medianCtc" name="Median CTC (LPA)" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="highestCtc" name="Highest CTC (LPA)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* YoY Comparison Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Academic Batch</th>
                  <th className="p-3">Total Cohort</th>
                  <th className="p-3">Placed Students</th>
                  <th className="p-3">Placement %</th>
                  <th className="p-3">Higher Studies</th>
                  <th className="p-3">Median CTC</th>
                  <th className="p-3">Average CTC</th>
                  <th className="p-3">Highest CTC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-mono text-[11px]">
                {yoyData.map((y) => (
                  <tr key={y.year} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-white font-sans">Batch of {y.year}</td>
                    <td className="p-3">{y.totalCohort}</td>
                    <td className="p-3 text-emerald-400 font-bold">{y.placedCount}</td>
                    <td className="p-3 font-bold">{y.placementPercentage}%</td>
                    <td className="p-3">{y.higherStudiesCount}</td>
                    <td className="p-3 text-cyan-300">{y.medianCtc} LPA</td>
                    <td className="p-3">{y.averageCtc} LPA</td>
                    <td className="p-3 text-amber-400 font-bold">{y.highestCtc} LPA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Prebuilt Report Templates Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Preconfigured Compliance & Operational Templates</h2>
          <span className="text-xs text-slate-400">Targeting {selectedFormat.toUpperCase()} output</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {REPORT_TEMPLATES.map((tpl) => {
            const isProcessing = activeJob?.templateId === tpl.id;
            return (
              <div
                key={tpl.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 flex flex-col justify-between transition-all group shadow-lg hover:shadow-2xl space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center shrink-0">
                      {getTemplateIcon(tpl.id)}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
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

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono uppercase">
                    Target: {selectedFormat}
                  </span>
                  <button
                    onClick={() => handleInitiateJob(tpl.id)}
                    disabled={Boolean(activeJob)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{isProcessing ? 'Queued...' : 'Generate Report'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generated Reports Audit Trail */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Generated Report History & Audit Trail</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical catalog of verified exports with author attribution and instant re-download
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-emerald-400 border border-slate-700">
            {history.length} logged
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs italic">
            No reports generated yet. Click "Generate Report" on any template above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Report Title</th>
                  <th className="px-6 py-3.5">Format</th>
                  <th className="px-6 py-3.5">Rows</th>
                  <th className="px-6 py-3.5">Generated By</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {history.map((item) => (
                  <tr key={item.id || item.jobId} className="hover:bg-slate-850/40 transition">
                    <td className="px-6 py-4 font-bold text-white flex items-center gap-2.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{item.reportName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                        {item.format}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                      {item.rowCount} rows
                    </td>
                    <td className="px-6 py-4 text-slate-300">{item.generatedBy}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                      {new Date(item.generatedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.downloadUrl ? (
                        <a
                          href={item.downloadUrl}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                        >
                          <Download className="w-3 h-3 text-emerald-400" />
                          <span>Re-download</span>
                        </a>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Configurable Template Settings Modal */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Configure Report Template & Signatories</h3>
              </div>
              <button onClick={() => setSettingsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Header Title Banner</label>
                <input
                  type="text"
                  value={headerTitle}
                  onChange={(e) => setHeaderTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="space-y-3">
                <span className="text-slate-300 font-semibold block">Institutional Signatory Lines</span>
                {signatoryForm.map((sig, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Signatory Title"
                      value={sig.title}
                      onChange={(e) => {
                        const updated = [...signatoryForm];
                        updated[idx].title = e.target.value;
                        setSignatoryForm(updated);
                      }}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Signatory Name"
                      value={sig.name}
                      onChange={(e) => {
                        const updated = [...signatoryForm];
                        updated[idx].name = e.target.value;
                        setSignatoryForm(updated);
                      }}
                      className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSettingsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={settingsSaving}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition"
                >
                  {settingsSaving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Weekly Digest Briefing Modal */}
      {digestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Weekly TPO Executive Briefing Digest</h3>
              </div>
              <button onClick={() => setDigestModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {digestLoading ? (
              <div className="p-12 text-center text-xs text-slate-400">Compiling weekly placement briefing...</div>
            ) : digestData ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Applications (7d)</span>
                    <strong className="text-emerald-400 font-mono text-base">{digestData.digestData?.metrics?.applicationsThisWeek}</strong>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Pending Verifications</span>
                    <strong className="text-amber-400 font-mono text-base">{digestData.digestData?.metrics?.pendingVerificationsCount}</strong>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Upcoming Interviews</span>
                    <strong className="text-indigo-400 font-mono text-base">{digestData.digestData?.metrics?.upcomingInterviewsCount}</strong>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Open Drives</span>
                    <strong className="text-white font-mono text-base">{digestData.digestData?.metrics?.openDrivesCount}</strong>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-slate-300 font-bold block">Active Drives Closing Soon</span>
                  <div className="space-y-1">
                    {(digestData.digestData?.openDrives || []).map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 text-[11px]">
                        <div>
                          <strong className="text-white">{d.company}</strong> — {d.title}
                        </div>
                        <span className="text-emerald-400 font-mono font-bold">{d.package}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-800">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(digestData.htmlPreview);
                      alert('Briefing HTML copied to clipboard.');
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                  >
                    Copy HTML Template
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
