import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  FileText,
  Building2,
  Award,
  TrendingUp,
  ExternalLink,
  Info,
} from 'lucide-react';
import studentService from '../../services/studentService';
import { useTenant } from '../../context/TenantContext';

export default function StudentDashboardHome() {
  const { branding, formatGrade } = useTenant();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await studentService.getDashboardToday();
      setData(res);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
      setError(err?.response?.data?.error?.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading your placement command center...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-slate-900 border border-red-800/60 rounded-2xl p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-xs text-slate-400 mb-6">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { profile, readinessScore, completeness, today, applicationSummary, recommendedDrives, recentApplications } =
    data || {};

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/80 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Welcome back, {profile?.personalInfo?.name || 'Candidate'}!
            </h1>
            {profile?.isVerifiedByTPO ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Candidate
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Clock className="w-3.5 h-3.5" />
                Verification Pending
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            {profile?.branch || 'Engineering'} • Roll No: {profile?.rollNo || 'Pending'} • CGPA:{' '}
            <span className="font-semibold text-slate-200">{formatGrade ? formatGrade(profile?.cgpa || 0) : profile?.cgpa || 'N/A'}</span>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/student/opportunities"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
          >
            <Briefcase className="w-4 h-4" />
            <span>Explore Drives</span>
          </Link>
          <Link
            to="/student/profile"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards & Readiness Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Readiness Meter Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Placement Readiness</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{readinessScore || 0}%</span>
            <span className="text-[11px] font-semibold text-emerald-400">
              {readinessScore >= 80 ? 'Placement Ready' : readinessScore >= 50 ? 'Progressing' : 'Needs Setup'}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${readinessScore || 0}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 truncate">{completeness?.nextBestAction}</p>
        </div>

        {/* Applications Total */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Active Applications</span>
            <FileText className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{applicationSummary?.total || 0}</span>
            <span className="text-[11px] text-slate-400">Total submitted</span>
          </div>
          <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
            <span>OA: {applicationSummary?.onlineAssessment || 0}</span>
            <span>•</span>
            <span>Tech/HR: {(applicationSummary?.technical || 0) + (applicationSummary?.hrRound || 0)}</span>
          </div>
        </div>

        {/* Offers Extended */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Offers & Placements</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{applicationSummary?.offers || 0}</span>
            <span className="text-[11px] font-semibold text-emerald-400">
              {profile?.isPlaced ? 'Placed 🎉' : 'Offers Extended'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            {profile?.isPlaced
              ? `${profile?.placedDetails?.companyName || 'Corporate'} (${profile?.placedDetails?.ctc || 0} LPA)`
              : 'Review pending offers in Applications'}
          </p>
        </div>

        {/* Profile Completeness */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Profile Completeness</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{completeness?.percentage || 0}%</span>
            <span className="text-[11px] text-slate-400">Sections filled</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${completeness?.percentage || 0}%` }}
            />
          </div>
          <Link
            to="/student/profile"
            className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:underline mt-2 font-medium"
          >
            <span>Complete missing sections</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main Grid: "Today" Action Center & Recommended Drives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): "Today" Urgent Actions & Deadlines */}
        <div className="lg:col-span-2 space-y-6">
          {/* Urgent Pending Actions Card */}
          {today?.pendingActions?.length > 0 && (
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  Action Required ({today.pendingActions.length})
                </h2>
              </div>
              <div className="space-y-2">
                {today.pendingActions.map((act, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{act.title}</p>
                      <p className="text-[11px] text-slate-300 mt-0.5">{act.message}</p>
                    </div>
                    <Link
                      to={act.actionLink}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold whitespace-nowrap transition"
                    >
                      Take Action
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drives Closing in 48 Hours */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-400" />
                <h2 className="text-sm font-bold text-white">Drives Closing Within 48 Hours</h2>
              </div>
              <Link to="/student/opportunities?closingSoon=true" className="text-xs text-emerald-400 hover:underline">
                View all closing
              </Link>
            </div>

            {today?.closingDeadlines?.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-800/40 border border-dashed border-slate-700">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-slate-300 font-semibold">No urgent drive deadlines in the next 48 hours.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Explore active drives to submit early applications.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {today.closingDeadlines.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-white truncate">{opp.companyName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Closing Soon
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium truncate">{opp.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Deadline: {new Date(opp.deadline).toLocaleDateString()} at{' '}
                        {new Date(opp.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-700/50">
                      {opp.hasApplied ? (
                        <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                        </span>
                      ) : (
                        <Link
                          to={`/student/opportunities?highlight=${opp.id}`}
                          className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          Apply Now <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Drives with Explanatory Eligibility Pills */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Recommended Campus Drives</h2>
              </div>
              <Link to="/student/opportunities" className="text-xs text-emerald-400 hover:underline">
                View all ({recommendedDrives?.length || 0})
              </Link>
            </div>

            {recommendedDrives?.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No open drives scheduled currently.</p>
            ) : (
              <div className="space-y-3">
                {recommendedDrives.slice(0, 4).map((drive) => {
                  const isEligible = drive.eligibility?.isEligible;
                  return (
                    <div
                      key={drive.id}
                      className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70 hover:border-slate-600 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-white">{drive.companyName}</h3>
                          {/* Explanatory Eligibility Tag */}
                          {isEligible ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" /> Eligible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              <Info className="w-3 h-3" /> Ineligible ({drive.eligibility?.reasons?.filter((r) => r.status === 'failed').length || 1} gaps)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 font-medium">{drive.title}</p>
                        <p className="text-[11px] text-slate-400">
                          Package: <span className="text-slate-200 font-semibold">{drive.ctc?.total || drive.salary || 'Competitive'} LPA</span> • Location: {drive.location || 'Multiple'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {drive.hasApplied ? (
                          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                            ✓ Applied
                          </span>
                        ) : (
                          <Link
                            to={`/student/opportunities?driveId=${drive.id}`}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                              isEligible
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                            }`}
                          >
                            <span>Inspect & Apply</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Today's Interviews & Recent Application Tracker */}
        <div className="space-y-6">
          {/* Today / Upcoming Interviews */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Upcoming Interviews</h2>
              </div>
              <Link to="/student/interviews" className="text-xs text-emerald-400 hover:underline">
                Calendar
              </Link>
            </div>

            {today?.todayInterviews?.length === 0 ? (
              <div className="p-4 text-center rounded-xl bg-slate-800/40 border border-slate-700/60">
                <Calendar className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">No interviews scheduled today.</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Shortlisted rounds will appear here automatically.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {today.todayInterviews.map((slot) => (
                  <div key={slot._id} className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        {slot.opportunityId?.companyName || 'Recruiter'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {slot.roundName || 'Technical'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Time: {new Date(slot.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {new Date(slot.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {slot.roomOrLink && (
                      <a
                        href={slot.roomOrLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:underline"
                      >
                        Join Interview Room <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Applications Mini Tracker */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                <h2 className="text-sm font-bold text-white">Recent Applications</h2>
              </div>
              <Link to="/student/applications" className="text-xs text-emerald-400 hover:underline">
                View All
              </Link>
            </div>

            {recentApplications?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No applications submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div
                    key={app._id}
                    className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-white truncate">
                        {app.opportunityId?.companyName || 'Company'}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{app.opportunityId?.title}</p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                        app.status === 'Placed' || app.offer?.status === 'Accepted'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : app.status === 'Offer Extended'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : app.status === 'Rejected'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
