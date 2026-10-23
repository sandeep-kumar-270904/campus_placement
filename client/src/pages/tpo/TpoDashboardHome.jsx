import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  Briefcase,
  TrendingUp,
  Award,
  Clock,
  AlertTriangle,
  Calendar,
  ChevronRight,
  RefreshCw,
  Plus,
  FileSpreadsheet,
  Megaphone,
  CheckCircle2,
  ExternalLink,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import tpoService from '../../services/tpoService';
import { useTenant } from '../../context/TenantContext';

export default function TpoDashboardHome() {
  const navigate = useNavigate();
  const { isFeatureEnabled } = useTenant();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await tpoService.getDashboardSummary();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
      setError(err?.response?.data?.error?.message || 'Failed to load real-time placement data. Please retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Aggregating live institutional placement metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-2xl bg-red-950/20 border border-red-800/40 text-center max-w-lg mx-auto my-12">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-1">Failed to Connect to Placement Engine</h3>
        <p className="text-xs text-slate-400 mb-6">{error}</p>
        <button
          onClick={fetchSummary}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { kpis, needsAttention, recentActivity } = data || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">TPO Command Center</h1>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time telemetry, student verification queue, and automated hiring pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSummary}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <div className="text-[11px] text-slate-500 font-mono bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
            {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* 6 Key Performance Indicator (KPI) Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Total Students */}
        <div
          onClick={() => navigate('/tpo/students')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400">Total Students</span>
            <Users className="w-4 h-4 text-blue-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-white">{kpis?.totalStudents || 0}</div>
          <p className="text-[10px] text-slate-500 mt-1">
            <span className="text-emerald-400 font-semibold">{kpis?.verifiedCount || 0}</span> verified
          </p>
        </div>

        {/* Card 2: Verified % */}
        <div
          onClick={() => navigate('/tpo/verification')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400">Records Verified</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{kpis?.verifiedPercent || 0}%</div>
          <p className="text-[10px] text-slate-500 mt-1">
            Ed25519 sealed
          </p>
        </div>

        {/* Card 3: Active Drives */}
        <div
          onClick={() => navigate('/tpo/drives')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400">Active Drives</span>
            <Briefcase className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-amber-400">{kpis?.activeDrives || 0}</div>
          <p className="text-[10px] text-slate-500 mt-1">In progress</p>
        </div>

        {/* Card 4: Applications This Week */}
        <div
          onClick={() => navigate('/tpo/drives')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400">This Week Apps</span>
            <TrendingUp className="w-4 h-4 text-purple-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-purple-400">{kpis?.applicationsThisWeek || 0}</div>
          <p className="text-[10px] text-slate-500 mt-1">Submissions (7d)</p>
        </div>

        {/* Card 5: Offers Made */}
        <div
          onClick={() => navigate('/tpo/analytics')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400">Offers Extended</span>
            <Award className="w-4 h-4 text-teal-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-teal-400">{kpis?.offersMade || 0}</div>
          <p className="text-[10px] text-slate-500 mt-1">Candidate offers</p>
        </div>

        {/* Card 6: Placement % */}
        <div
          onClick={() => navigate('/tpo/analytics')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400">Placement Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{kpis?.placementPercent || 0}%</div>
          <p className="text-[10px] text-slate-500 mt-1">{kpis?.placedStudents || 0} placed</p>
        </div>
      </div>

      {/* Quick Action Command Strip */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200">Quick Actions:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/tpo/drives?action=new')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Drive
          </button>
          <button
            onClick={() => navigate('/tpo/students?action=import')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            Import Students
          </button>
          <button
            onClick={() => navigate('/tpo/announcements?action=compose')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer"
          >
            <Megaphone className="w-3.5 h-3.5 text-amber-400" />
            Send Announcement
          </button>
          <button
            onClick={() => navigate('/tpo/reports')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-purple-400" />
            Export Report
          </button>
          {(!isFeatureEnabled || isFeatureEnabled('internshipPpo')) && (
            <button
              onClick={() => navigate('/tpo/internships')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Internships & PPO
            </button>
          )}
          {(!isFeatureEnabled || isFeatureEnabled('offCampusHigherStudies')) && (
            <button
              onClick={() => navigate('/tpo/outcomes')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              External Outcomes
            </button>
          )}
          {(!isFeatureEnabled || isFeatureEnabled('alumniNetwork')) && (
            <button
              onClick={() => navigate('/tpo/alumni')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Alumni Queue
            </button>
          )}
          {(!isFeatureEnabled || isFeatureEnabled('interviewExperiences')) && (
            <button
              onClick={() => navigate('/tpo/interview-experiences')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              Debriefs Moderation
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Needs Attention Queue (Left 2 cols) & Live Activity Feed (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Needs Attention Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Needs Attention Queue
              </h2>
            </div>
            <span className="text-[11px] text-slate-500">Live system triage</span>
          </div>

          <div className="space-y-4">
            {/* 1. Pending Verifications */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">Students Pending Academic Verification</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {needsAttention?.pendingVerifications?.length || 0}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/tpo/verification')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  Open Queue <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {needsAttention?.pendingVerifications?.length > 0 ? (
                <div className="divide-y divide-slate-800/60">
                  {needsAttention.pendingVerifications.map((s) => (
                    <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{s.name}</span>
                          <span className="text-slate-500 font-mono text-[11px]">{s.rollNo}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {s.branch} • CGPA: <span className="font-semibold text-emerald-400">{s.cgpa}</span> • Backlogs: {s.backlogs}
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/tpo/verification?studentId=${s.studentId}`)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold text-[11px] transition"
                      >
                        Verify Record
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-2">✅ All student academic records are currently verified!</p>
              )}
            </div>

            {/* 2. Drives Closing Soon (in 48h) */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-bold text-white">Placement Drives Closing Within 48 Hours</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    {needsAttention?.drivesClosingSoon?.length || 0}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/tpo/drives')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  View All <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {needsAttention?.drivesClosingSoon?.length > 0 ? (
                <div className="divide-y divide-slate-800/60">
                  {needsAttention.drivesClosingSoon.map((d) => (
                    <div key={d.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        {d.companyLogo ? (
                          <img src={d.companyLogo} alt={d.companyName} className="w-7 h-7 rounded-lg object-contain bg-white p-1" />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-[10px] text-emerald-400">
                            {d.companyName?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white">{d.title} • {d.companyName}</p>
                          <p className="text-[11px] text-red-400 font-medium">
                            Closes {new Date(d.deadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/tpo/drives/${d.id}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px]"
                      >
                        Manage
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-2">No drives are closing in the next 48 hours.</p>
              )}
            </div>

            {/* 3. Interviews Scheduled Today */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-white">Interviews Scheduled Today</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {needsAttention?.interviewsToday?.length || 0}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/tpo/schedule')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  Calendar <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {needsAttention?.interviewsToday?.length > 0 ? (
                <div className="divide-y divide-slate-800/60">
                  {needsAttention.interviewsToday.map((i) => (
                    <div key={i.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-white">{i.studentName} — {i.roundName}</p>
                        <p className="text-[11px] text-slate-400">
                          {i.companyName} • <span className="text-blue-400 font-semibold">{i.startTime} - {i.endTime}</span>
                        </p>
                      </div>
                      {i.roomOrLink && (
                        <a
                          href={i.roomOrLink.startsWith('http') ? i.roomOrLink : '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 text-[11px] font-semibold flex items-center gap-1"
                        >
                          Join <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-2">No candidate interviews booked for today.</p>
              )}
            </div>

            {/* 4. Unscheduled Shortlisted Candidates */}
            {needsAttention?.unscheduledShortlisted?.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white">Shortlisted Candidates Awaiting Interview Slots</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {needsAttention.unscheduledShortlisted.length}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/tpo/schedule')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    Bulk Schedule <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="divide-y divide-slate-800/60">
                  {needsAttention.unscheduledShortlisted.map((u) => (
                    <div key={u.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white">{u.studentName}</span>
                        <span className="text-slate-400 text-[11px] ml-2">({u.companyName} • {u.currentRound})</span>
                      </div>
                      <button
                        onClick={() => navigate('/tpo/schedule')}
                        className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold"
                      >
                        Assign Slot &rarr;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Audit Activity Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Activity Feed
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">AUDIT LOG</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 max-h-[700px] overflow-y-auto">
            {recentActivity?.length > 0 ? (
              <div className="relative border-l border-slate-800 ml-2 space-y-6 py-2">
                {recentActivity.map((log) => (
                  <div key={log.id} className="relative pl-6 text-xs">
                    {/* Activity Timeline Bullet */}
                    <div className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full bg-slate-900 border-2 border-emerald-400"></div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{log.actorName}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
                          {log.action?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Resource: <span className="text-slate-300">{log.resource}</span>
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No recent audit events recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
