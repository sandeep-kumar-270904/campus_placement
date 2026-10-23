import React, { useState, useEffect, useContext } from 'react';
import {
  Briefcase,
  TrendingUp,
  Award,
  DollarSign,
  Calendar,
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  Plus,
  X,
  AlertCircle,
  Sparkles,
  User,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import internshipService from '../../services/internshipService';
import { AuthContext } from '../../context/AuthContext';

export default function StudentInternships() {
  const { user } = useContext(AuthContext);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Self-report modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    role: '',
    stipendMonthly: 25000,
    durationMonths: 6,
    startDate: new Date().toISOString().split('T')[0],
    mode: 'Onsite',
    location: 'Bengaluru, India',
    mentorName: '',
    mentorEmail: '',
  });

  const fetchInternships = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await internshipService.getInternships();
      // Filter for the logged-in student
      const myInternships = (res.internships || []).filter(
        (i) => (i.studentId?._id || i.studentId) === (user?.id || user?._id)
      );
      setInternships(myInternships);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Failed to fetch internship records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.companyName.trim() || !form.role.trim()) {
      setError('Company name and role are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await internshipService.createInternship(form);
      setSuccessMessage('Internship successfully logged in your profile.');
      setModalOpen(false);
      setForm({
        companyName: '',
        role: '',
        stipendMonthly: 25000,
        durationMonths: 6,
        startDate: new Date().toISOString().split('T')[0],
        mode: 'Onsite',
        location: 'Bengaluru, India',
        mentorName: '',
        mentorEmail: '',
      });
      await fetchInternships();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit internship record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest">
              Career Trajectory
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-amber-400" />
            My Internships & Pre-Placement Offers (PPO)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Log active industrial internships, track your monthly stipends, and record PPO conversion letters.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Log New Internship
        </button>
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

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading your internship engagements...</p>
        </div>
      ) : internships.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Internships Logged Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Secured an off-campus or college-sponsored summer/winter internship? Log it here to track your stipend and PPO eligibility.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition"
          >
            <Plus className="w-4 h-4" />
            Log Internship
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {internships.map((record) => {
            const hasPpo = ['PPO Offered', 'PPO Accepted'].includes(record.ppoStatus);
            return (
              <div
                key={record._id}
                className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                  hasPpo
                    ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/30 border-purple-800/50 shadow-lg shadow-purple-950/20'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="space-y-4">
                  {/* Top company & status */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-400" />
                        {record.companyName}
                      </h3>
                      <p className="text-xs font-semibold text-slate-300 mt-0.5">{record.role}</p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                        record.ppoStatus === 'PPO Accepted'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : record.ppoStatus === 'PPO Offered'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : record.ppoStatus === 'In Progress'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {record.ppoStatus}
                    </span>
                  </div>

                  {/* PPO Celebration Banner if available */}
                  {hasPpo && (
                    <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/60 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold text-lg">
                        <Award className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">
                            Pre-Placement Offer (PPO) Converted!
                          </span>
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                        <p className="text-[11px] text-purple-200 mt-0.5">
                          Package Offered:{' '}
                          <span className="font-extrabold text-emerald-400">
                            ₹{record.ppoDetails?.ctc || 12} LPA
                          </span>{' '}
                          as {record.ppoDetails?.role || record.role}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Key Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide block">
                        Monthly Stipend
                      </span>
                      <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                        <DollarSign className="w-3 h-3" />₹
                        {record.stipendMonthly?.toLocaleString('en-IN') || 0}/mo
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide block">
                        Duration & Mode
                      </span>
                      <span className="font-semibold text-slate-200 mt-0.5 block">
                        {record.durationMonths} Months • {record.mode}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide block">
                        Start Date
                      </span>
                      <span className="font-semibold text-slate-300 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(record.startDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide block">
                        Location
                      </span>
                      <span className="font-semibold text-slate-300 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {record.location || 'India'}
                      </span>
                    </div>
                  </div>

                  {/* Mentor details */}
                  {record.mentorName && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>
                        Corporate Mentor: <strong className="text-slate-300">{record.mentorName}</strong>{' '}
                        {record.mentorEmail && `(${record.mentorEmail})`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-400" />
                Log Industrial Internship
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cisco Systems, Microsoft"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Designation / Role *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Engineering Intern"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Monthly Stipend (INR)</label>
                  <input
                    type="number"
                    value={form.stipendMonthly}
                    onChange={(e) => setForm({ ...form, stipendMonthly: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Duration (Months)</label>
                  <input
                    type="number"
                    value={form.durationMonths}
                    onChange={(e) => setForm({ ...form, durationMonths: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Work Mode</label>
                  <select
                    value={form.mode}
                    onChange={(e) => setForm({ ...form, mode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  >
                    <option value="Onsite">Onsite</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Mentor Name (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Mentor Name"
                    value={form.mentorName}
                    onChange={(e) => setForm({ ...form, mentorName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Mentor Email (optional)</label>
                  <input
                    type="email"
                    placeholder="mentor@company.com"
                    value={form.mentorEmail}
                    onChange={(e) => setForm({ ...form, mentorEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
