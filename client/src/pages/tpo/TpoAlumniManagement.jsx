import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Building2,
  Briefcase,
  GraduationCap,
  ExternalLink,
  CheckCircle2,
  Clock,
  Search,
  Sparkles,
  AlertCircle,
  Filter,
  RefreshCw,
  Mail,
  MapPin,
  Check,
} from 'lucide-react';
import alumniService from '../../services/alumniService';

export default function TpoAlumniManagement() {
  const [unverifiedList, setUnverifiedList] = useState([]);
  const [verifiedList, setVerifiedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('unverified'); // 'unverified' | 'directory'
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [unverifiedRes, directoryRes] = await Promise.all([
        alumniService.getUnverifiedAlumni(),
        alumniService.getAlumniDirectory(),
      ]);
      setUnverifiedList(unverifiedRes.unverified || []);
      setVerifiedList(directoryRes.alumni || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Failed to fetch alumni data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerify = async (id, name) => {
    try {
      setVerifyingId(id);
      setError(null);
      await alumniService.verifyAlumni(id);
      setSuccessMessage(`Successfully verified ${name} as official alumni.`);
      await loadData();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to verify alumni.');
    } finally {
      setVerifyingId(null);
    }
  };

  const filteredDirectory = verifiedList.filter((alum) => {
    const matchesSearch =
      alum.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alum.currentCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alum.currentRole?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = branchFilter === 'all' || alum.branch === branchFilter;
    return matchesSearch && matchesBranch;
  });

  const uniqueBranches = Array.from(
    new Set([...verifiedList.map((a) => a.branch), ...unverifiedList.map((a) => a.branch)].filter(Boolean))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
              Institutional Network
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            Alumni Network Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authenticate alumni credentials, moderate referral pipelines, and connect students with verified industry mentors.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Pending Verification</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{unverifiedList.length}</p>
          <p className="text-[10px] text-slate-500 mt-1">Awaiting TPO validation</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Verified Alumni</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{verifiedList.length}</p>
          <p className="text-[10px] text-emerald-400 mt-1">Active in directory</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Active Mentors</span>
            <GraduationCap className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-cyan-400">
            {verifiedList.filter((a) => a.willingToMentor).length}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Offering 1-on-1 guidance</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Referral Network</span>
            <Briefcase className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400">
            {verifiedList.filter((a) => a.willingToRefer).length}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Accepting student referrals</p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('unverified')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'unverified'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Verification Queue</span>
          {unverifiedList.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {unverifiedList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'directory'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified Alumni Directory ({verifiedList.length})</span>
        </button>
      </div>

      {/* Content: Unverified Queue */}
      {activeTab === 'unverified' && (
        <div className="space-y-4">
          {unverifiedList.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white">No Pending Verifications</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                All registered alumni have been verified. New alumni registrations via institutional email or portal will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unverifiedList.map((alum) => (
                <div
                  key={alum._id}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-white">{alum.fullName}</h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          {alum.email}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Needs Approval
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide block">Current Employer</span>
                        <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-emerald-400" />
                          {alum.currentCompany}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide block">Designation</span>
                        <span className="font-semibold text-slate-200 truncate block mt-0.5">
                          {alum.currentRole}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide block">Graduation Batch</span>
                        <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                          <GraduationCap className="w-3 h-3 text-cyan-400" />
                          Class of {alum.batchYear} ({alum.branch})
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide block">Location</span>
                        <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {alum.location || 'India'}
                        </span>
                      </div>
                    </div>

                    {alum.linkedinUrl && (
                      <a
                        href={alum.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Verify LinkedIn Profile
                      </a>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleVerify(alum._id, alum.fullName)}
                      disabled={verifyingId === alum._id}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition disabled:opacity-50"
                    >
                      {verifyingId === alum._id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      )}
                      Verify & Grant Access
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content: Directory */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search verified alumni by name, company, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Disciplines</option>
                {uniqueBranches.map((br) => (
                  <option key={br} value={br}>
                    {br}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDirectory.map((alum) => (
              <div
                key={alum._id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white">{alum.fullName}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{alum.currentRole}</p>
                    </div>
                    <span className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Verified Alumni">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-slate-300">
                    <p className="flex items-center gap-1.5 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                      {alum.currentCompany}
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-400">
                      <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                      Class of {alum.batchYear} • {alum.branch}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {alum.willingToRefer && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        Referrals Open
                      </span>
                    )}
                    {alum.willingToMentor && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        Mentor
                      </span>
                    )}
                  </div>
                </div>

                {alum.linkedinUrl && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <a
                      href={alum.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View LinkedIn
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
