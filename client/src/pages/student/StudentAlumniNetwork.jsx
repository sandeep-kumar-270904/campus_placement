import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Building2,
  Briefcase,
  GraduationCap,
  MapPin,
  ExternalLink,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Compass,
  Clock,
} from 'lucide-react';
import alumniService from '../../services/alumniService';

export default function StudentAlumniNetwork() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'mentors' | 'my-requests'

  // Request Modal
  const [requestModalAlumni, setRequestModalAlumni] = useState(null);
  const [requestForm, setRequestForm] = useState({
    requestType: 'Referral',
    targetCompany: '',
    targetRole: '',
    jobUrlOrId: '',
    resumeUrl: '',
    message: '',
  });
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestFeedback, setRequestFeedback] = useState(null);

  // My Requests
  const [myRequests, setMyRequests] = useState([]);

  // Mentor Matches
  const [mentorMatches, setMentorMatches] = useState([]);
  const [matchingLoading, setMatchingLoading] = useState(false);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await alumniService.getAlumniDirectory({
        q: search,
        company: companyFilter,
        branch: branchFilter !== 'all' ? branchFilter : undefined,
      });
      setAlumni(res.alumni || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch alumni directory.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const res = await alumniService.getMyRequests();
      setMyRequests(res.sent || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMentorMatches = async () => {
    try {
      setMatchingLoading(true);
      const res = await alumniService.matchMentors({ branch: branchFilter });
      setMentorMatches(res.matches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setMatchingLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
    fetchMyRequests();
  }, [branchFilter]);

  useEffect(() => {
    if (activeTab === 'mentors') {
      fetchMentorMatches();
    }
  }, [activeTab]);

  const handleOpenRequestModal = (alum, type = 'Referral') => {
    setRequestModalAlumni(alum);
    setRequestForm({
      requestType: type,
      targetCompany: alum.currentCompany,
      targetRole: 'Software Engineer',
      jobUrlOrId: '',
      resumeUrl: '',
      message: `Hi ${alum.fullName}, I am a student at our college interested in opportunities at ${alum.currentCompany}. Would you be open to reviewing my profile?`,
    });
    setRequestFeedback(null);
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!requestModalAlumni) return;

    try {
      setSubmittingRequest(true);
      setRequestFeedback(null);
      const res = await alumniService.requestReferral({
        alumniId: requestModalAlumni._id,
        ...requestForm,
      });

      setRequestFeedback({
        type: 'success',
        msg: `🎉 ${requestForm.requestType} request sent to ${requestModalAlumni.fullName}!`,
      });
      fetchMyRequests();
      setTimeout(() => {
        setRequestModalAlumni(null);
        setRequestFeedback(null);
      }, 2500);
    } catch (err) {
      setRequestFeedback({
        type: 'error',
        msg: err.response?.data?.error?.message || 'Failed to deliver request.',
      });
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Institutional Alumni Network
            </span>
            <span className="text-xs text-slate-400">Verified Graduates & Mentors</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Alumni Connections & Referrals
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Connect with verified alumni across top engineering firms. Request direct job referrals (up to 3/week) or discover mentors matching your target career domain.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-2xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 font-bold rounded-xl transition ${
              activeTab === 'directory' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Alumni Directory
          </button>
          <button
            onClick={() => setActiveTab('mentors')}
            className={`px-4 py-2 font-bold rounded-xl transition ${
              activeTab === 'mentors' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mentor Match
          </button>
          <button
            onClick={() => setActiveTab('my-requests')}
            className={`px-4 py-2 font-bold rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'my-requests' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>My Requests</span>
            {myRequests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono">
                {myRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Directory Tab View */}
      {activeTab === 'directory' && (
        <div className="space-y-5">
          {/* Search & Branch Filter Bar */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search alumni by name, company, role, or skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchAlumni()}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Disciplines</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">ECE</option>
                <option value="Mechanical Engineering">Mechanical</option>
              </select>

              <button
                onClick={fetchAlumni}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
              >
                Filter
              </button>
            </div>
          </div>

          {/* Alumni Grid */}
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400">Loading verified alumni directory...</div>
          ) : alumni.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <Users className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No alumni match your criteria</h3>
              <p className="text-xs text-slate-500">Try broadening your company or branch filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {alumni.map((alum) => (
                <div
                  key={alum._id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 flex flex-col justify-between transition-all group shadow-md hover:shadow-xl space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition">
                          {alum.fullName}
                        </h3>
                        <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{alum.currentCompany}</span>
                        </p>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                        Class of {alum.batchYear}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1">
                      <p className="font-medium text-slate-200">{alum.currentRole}</p>
                      <p className="text-[11px] text-slate-400">{alum.branch} • {alum.location}</p>
                    </div>

                    {alum.bio && (
                      <p className="text-xs text-slate-400 italic line-clamp-2 leading-relaxed">
                        "{alum.bio}"
                      </p>
                    )}

                    {alum.mentorshipDomains?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {alum.mentorshipDomains.map((d, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
                            {d}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    {alum.linkedinUrl ? (
                      <a
                        href={alum.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        <span>LinkedIn</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-600">Verified Alumni</span>
                    )}

                    <div className="flex items-center gap-1.5">
                      {alum.willingToMentor && (
                        <button
                          onClick={() => handleOpenRequestModal(alum, 'Mentorship')}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold"
                        >
                          Mentor
                        </button>
                      )}
                      {alum.willingToRefer && (
                        <button
                          onClick={() => handleOpenRequestModal(alum, 'Referral')}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                        >
                          <Send className="w-3 h-3" />
                          <span>Referral</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mentor Matching Tab */}
      {activeTab === 'mentors' && (
        <div className="space-y-4">
          <div className="p-5 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl space-y-1">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-400" />
              <span>Personalized Mentor Matching</span>
            </h3>
            <p className="text-xs text-slate-400">
              Alumni from your department who have volunteered for technical mock interviews, resume critique, and career roadmap guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mentorMatches.map((alum) => (
              <div key={alum._id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white">{alum.fullName}</h4>
                    <p className="text-xs text-indigo-400 font-semibold">{alum.currentCompany} — {alum.currentRole}</p>
                    <p className="text-[11px] text-slate-500">{alum.branch} • Batch of {alum.batchYear}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {alum.mentorshipDomains?.map((d, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/40 border border-indigo-800/40 text-indigo-300">
                      {d}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => handleOpenRequestModal(alum, 'Mentorship')}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                >
                  Request Mentorship
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Requests Tab */}
      {activeTab === 'my-requests' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-5 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Your Active Referral & Mentorship Requests</h3>
            <span className="text-xs text-slate-400">Weekly limit: 3 requests max</span>
          </div>

          {myRequests.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              You have not submitted any referral requests yet. Browse the alumni directory to connect!
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {myRequests.map((req) => (
                <div key={req._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{req.targetCompany}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {req.requestType}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.status === 'Accepted'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : req.status === 'Referred'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                            : req.status === 'Declined'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <p className="text-slate-400">Role: <strong className="text-slate-200">{req.targetRole}</strong></p>
                    <p className="text-slate-400 italic">"{req.message}"</p>
                    {req.alumniNote && (
                      <p className="text-emerald-300 font-medium">Alumni Note: {req.alumniNote}</p>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Referral Request Modal */}
      {requestModalAlumni && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Send {requestForm.requestType} Request
                </h3>
                <p className="text-xs text-slate-400">to {requestModalAlumni.fullName} ({requestModalAlumni.currentCompany})</p>
              </div>
              <button onClick={() => setRequestModalAlumni(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {requestFeedback && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
                  requestFeedback.type === 'success'
                    ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/50 border-rose-800 text-rose-300'
                }`}
              >
                {requestFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{requestFeedback.msg}</span>
              </div>
            )}

            <form onSubmit={handleSendRequest} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Target Company</label>
                  <input
                    type="text"
                    required
                    value={requestForm.targetCompany}
                    onChange={(e) => setRequestForm({ ...requestForm, targetCompany: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Target Role</label>
                  <input
                    type="text"
                    required
                    value={requestForm.targetRole}
                    onChange={(e) => setRequestForm({ ...requestForm, targetRole: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Job Requisition URL or Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. https://careers.company.com/job/12345"
                  value={requestForm.jobUrlOrId}
                  onChange={(e) => setRequestForm({ ...requestForm, jobUrlOrId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Personalized Message</label>
                <textarea
                  rows={4}
                  required
                  value={requestForm.message}
                  onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white leading-relaxed"
                />
                <span className="text-[10px] text-slate-500">
                  Rate-limited: Maximum 3 active requests per week to prevent spamming alumni.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRequestModalAlumni(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs disabled:opacity-50 transition"
                >
                  {submittingRequest ? 'Delivering...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
