import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  Award,
  DollarSign,
  Users,
  Building2,
  Download,
  Filter,
  AlertCircle,
  Briefcase,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import tpoService from '../../services/tpoService';

const CTC_COLORS = ['#38bdf8', '#34d399', '#818cf8', '#f59e0b', '#ec4899'];

export default function TpoAnalytics() {
  const [activeTab, setActiveTab] = useState('insights'); // 'insights' | 'unplaced' | 'multiple-offers'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [graduationYear, setGraduationYear] = useState('2026');

  // Analytics Data
  const [summary, setSummary] = useState({
    totalStudents: 0,
    placedCount: 0,
    placementRate: 0,
    totalOffers: 0,
    highestCtc: 0,
    avgCtc: 0,
    medianCtc: 0,
  });
  const [departmentStats, setDepartmentStats] = useState([]);
  const [ctcBands, setCtcBands] = useState([]);
  const [topRecruiters, setTopRecruiters] = useState([]);
  const [funnel, setFunnel] = useState([]);

  // Unplaced & Multiple Offer data
  const [unplacedStudents, setUnplacedStudents] = useState([]);
  const [multipleOfferStudents, setMultipleOfferStudents] = useState([]);
  const [loadingSub, setLoadingSub] = useState(false);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await tpoService.getAnalyticsOverview({
        graduationYear: graduationYear || undefined,
      });

      if (res.summary) setSummary(res.summary);
      setDepartmentStats(res.departmentStats || []);
      setCtcBands(res.ctcBands || []);
      setTopRecruiters(res.topRecruiters || []);
      setFunnel(res.funnel || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load analytics overview.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubTab = async (tab) => {
    try {
      setLoadingSub(true);
      if (tab === 'unplaced') {
        const res = await tpoService.getAnalyticsUnplaced();
        setUnplacedStudents(res.students || []);
      } else if (tab === 'multiple-offers') {
        const res = await tpoService.getAnalyticsMultipleOffers();
        setMultipleOfferStudents(res.candidates || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSub(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [graduationYear]);

  useEffect(() => {
    if (activeTab === 'unplaced' || activeTab === 'multiple-offers') {
      fetchSubTab(activeTab);
    }
  }, [activeTab]);

  const handleExportCsv = () => {
    if (activeTab === 'insights') {
      const headers = ['Department,Total Students,Placed Students,Placement Rate %,Average CTC (LPA)'];
      const rows = departmentStats.map(
        (d) => `"${d.branch}",${d.totalStudents},${d.placedStudents},${d.placementPercentage}%,${d.averageCtc}`
      );
      const csv = [headers, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `placement-department-stats-${graduationYear}.csv`;
      a.click();
    } else if (activeTab === 'unplaced') {
      const headers = ['Roll No,Name,Branch,CGPA,Active Backlogs,Total Applications,Email'];
      const rows = unplacedStudents.map(
        (s) =>
          `"${s.rollNo}","${s.name}","${s.branch}",${s.cgpa},${s.activeBacklogs},${s.totalApplications},"${s.email}"`
      );
      const csv = [headers, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `unplaced-candidates-${graduationYear}.csv`;
      a.click();
    } else if (activeTab === 'multiple-offers') {
      const headers = ['Candidate,Email,Offer Count,Offers'];
      const rows = multipleOfferStudents.map(
        (s) =>
          `"${s.name}","${s.email}",${s.offers.length},"${s.offers.map((o) => `${o.company} (${o.ctc} LPA)`).join('; ')}"`
      );
      const csv = [headers, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `multiple-offer-stars-${graduationYear}.csv`;
      a.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Institutional Intelligence
            </span>
            <span className="text-xs text-slate-400">Class of {graduationYear}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Placement Analytics & Recruitment Performance
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time department conversion ratios, CTC package distributions, recruitment funnel stages, and unplaced student tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={graduationYear}
            onChange={(e) => setGraduationYear(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-semibold focus:outline-none focus:border-emerald-500"
          >
            <option value="2025">Batch 2025</option>
            <option value="2026">Batch 2026</option>
            <option value="2027">Batch 2027</option>
          </select>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Export CSV
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 shadow-sm transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            Export PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Placement Rate
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            {summary.placementRate}%
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {summary.placedCount} of {summary.totalStudents} students placed
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Average CTC
            </span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            {summary.avgCtc} <span className="text-sm font-normal text-slate-400">LPA</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Median: {summary.medianCtc} LPA
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Highest CTC
            </span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-2">
            {summary.highestCtc} <span className="text-sm font-normal text-slate-400">LPA</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Top compensation offer</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Offers Extended
            </span>
            <Briefcase className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            {summary.totalOffers}
          </div>
          <span className="text-xs text-purple-400/80 mt-1 block">Total job extensions</span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center border-b border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('insights')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'insights'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Department & CTC Visualizations
        </button>

        <button
          onClick={() => setActiveTab('unplaced')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'unplaced'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Unplaced Candidate Cohort ({summary.totalStudents - summary.placedCount})
        </button>

        <button
          onClick={() => setActiveTab('multiple-offers')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'multiple-offers'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          Multiple Offer Stars
        </button>
      </div>

      {/* Main Tab Content */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Computing analytics metrics & distributions...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-8 text-center text-rose-300">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <p className="font-semibold text-sm mb-3">{error}</p>
          <button
            onClick={fetchOverview}
            className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : activeTab === 'insights' ? (
        <div className="space-y-6">
          {/* Charts Row 1: Department Bar Chart & CTC Bands */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Breakdown BarChart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-1">
                Department Placement Rate (%)
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Comparative conversion percentage across engineering disciplines
              </p>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="branch"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="placementPercentage"
                      name="Placed %"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CTC Band Distribution BarChart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-1">
                CTC Compensation Bands (LPA)
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Candidate package distribution across salary brackets
              </p>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ctcBands} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="band" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" name="Offers" radius={[6, 6, 0, 0]}>
                      {ctcBands.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CTC_COLORS[index % CTC_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2: Recruitment Funnel & Top Recruiters Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Funnel Progression */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-1">
                Recruitment Funnel Conversion
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Drop-off rate from cohort registration to final offers
              </p>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={funnel}
                    margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={11} />
                    <YAxis
                      dataKey="stage"
                      type="category"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Candidates"
                      fill="#38bdf8"
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Recruiters Leaderboard */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Top Recruiters Leaderboard
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Highest intake corporate partners and compensation levels
                </p>

                {topRecruiters.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-8 text-center">
                    No offer extensions recorded yet.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {topRecruiters.map((recruiter, idx) => (
                      <div
                        key={idx}
                        className="py-2.5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 font-bold text-slate-500 font-mono">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-white">{recruiter.company}</span>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <span className="text-emerald-400 font-bold">
                            {recruiter.hires} hires
                          </span>
                          <span className="text-slate-400">
                            Avg: {recruiter.avgCtc} LPA
                          </span>
                          <span className="text-amber-400 font-semibold">
                            Max: {recruiter.highestCtc} LPA
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'unplaced' ? (
        /* Unplaced Students Tab */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Unplaced Candidates Directory</h3>
              <p className="text-xs text-slate-400">
                Prioritize for upcoming interview drives, counseling sessions, and training bootcamps
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {unplacedStudents.length} candidates
            </span>
          </div>

          {loadingSub ? (
            <div className="p-12 text-center text-slate-400">Loading unplaced candidates...</div>
          ) : unplacedStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              100% Placement achieved! No unplaced students found in this cohort.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Roll No</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Branch</th>
                    <th className="px-4 py-3">CGPA</th>
                    <th className="px-4 py-3">Backlogs</th>
                    <th className="px-4 py-3">Applications</th>
                    <th className="px-4 py-3">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {unplacedStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-white font-semibold">{s.rollNo}</td>
                      <td className="px-4 py-3 font-bold text-white">{s.name}</td>
                      <td className="px-4 py-3 text-slate-400">{s.branch}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-400">{s.cgpa}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.activeBacklogs > 0
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400'
                          }`}
                        >
                          {s.activeBacklogs}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold">{s.totalApplications} applied</td>
                      <td className="px-4 py-3 text-slate-400">{s.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Multiple Offers Tab */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Multiple Offer Achievers</h3>
              <p className="text-xs text-slate-400">
                Candidates holding 2 or more formal placement offers
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
              {multipleOfferStudents.length} candidates
            </span>
          </div>

          {loadingSub ? (
            <div className="p-12 text-center text-slate-400">Loading offer data...</div>
          ) : multipleOfferStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              No multiple offer holders in this batch yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {multipleOfferStudents.map((cand, idx) => (
                <div key={idx} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-base font-bold text-white">{cand.name}</h4>
                    <p className="text-xs text-slate-400">{cand.email}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {cand.offers.map((offer, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 flex items-center gap-2"
                      >
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-semibold">{offer.company}</span>
                        <span className="text-emerald-400 font-bold">{offer.ctc} LPA</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
