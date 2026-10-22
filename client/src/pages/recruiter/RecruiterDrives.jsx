import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import recruiterService from '../../services/recruiterService';
import {
  Briefcase,
  Users,
  Calendar,
  FileEdit,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  ChevronRight,
  Search,
  Sparkles,
} from 'lucide-react';

export default function RecruiterDrives() {
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDrives();
  }, []);

  const loadDrives = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await recruiterService.getMyCompanyDrives();
      setDrives(data.drives || []);
    } catch (err) {
      console.error('Failed to load drives:', err);
      setError(
        err.response?.data?.error?.message ||
          'Failed to load company recruitment drives. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredDrives = drives.filter(
    (drive) =>
      drive.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-indigo-400" />
            Company Recruitment Drives
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your company's campus recruitment pipelines, candidate shortlists, and interview schedules.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search drives or roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-56 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6" />
          ))}
        </div>
      ) : filteredDrives.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">No Recruitment Drives Found</h3>
          <p className="text-xs text-slate-400 mb-4">
            There are currently no active or assigned drives for your organization. Once your campus TPO invites you to a drive, it will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDrives.map((drive) => {
            const stats = drive.stats || {
              total: 0,
              shortlisted: 0,
              inProgress: 0,
              offers: 0,
              placed: 0,
            };

            const isPendingJd = drive.proposedJd?.status === 'Pending_Approval';

            return (
              <div
                key={drive._id || drive.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Company & Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-400 block">
                          {drive.companyName}
                        </span>
                        <h3 className="text-base font-bold text-white tracking-tight">
                          {drive.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          drive.status === 'Open'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : drive.status === 'Completed'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {drive.status}
                      </span>

                      {isPendingJd && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          JD Proposal Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CTC & Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-3 border-y border-slate-800/80 my-3 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 block">CTC Package</span>
                      <span className="font-semibold text-emerald-400">
                        {drive.salary || (drive.ctc?.total ? `${drive.ctc.total / 100000} LPA` : 'Competitive')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Min CGPA</span>
                      <span className="font-semibold text-slate-200">
                        {drive.eligibilityRules?.minCgpa ? `${drive.eligibilityRules.minCgpa} CGPA` : 'Open'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Deadline</span>
                      <span className="font-semibold text-slate-200">
                        {drive.deadline
                          ? new Date(drive.deadline).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Ongoing'}
                      </span>
                    </div>
                  </div>

                  {/* Pipeline Quick Metric Badges */}
                  <div className="grid grid-cols-5 gap-2 my-4 bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/60 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Applied</span>
                      <span className="text-sm font-bold text-white">{stats.total}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Shortlisted</span>
                      <span className="text-sm font-bold text-indigo-400">{stats.shortlisted}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Interview</span>
                      <span className="text-sm font-bold text-amber-400">{stats.inProgress}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Offers</span>
                      <span className="text-sm font-bold text-emerald-400">{stats.offers}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Placed</span>
                      <span className="text-sm font-bold text-teal-400">{stats.placed}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => navigate(`/recruiter/drives/${drive._id || drive.id}/candidates`)}
                    className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Candidate Shortlist</span>
                  </button>

                  <button
                    onClick={() => navigate(`/recruiter/drives/${drive._id || drive.id}/schedule`)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition"
                  >
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Slots</span>
                  </button>

                  <button
                    onClick={() => navigate(`/recruiter/drives/${drive._id || drive.id}/jd-editor`)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition"
                  >
                    <FileEdit className="w-3.5 h-3.5 text-amber-400" />
                    <span>JD</span>
                  </button>

                  <button
                    onClick={() => navigate(`/recruiter/drives/${drive._id || drive.id}/funnel`)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Funnel</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
