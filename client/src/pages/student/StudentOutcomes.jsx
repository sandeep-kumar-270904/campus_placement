import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Briefcase,
  Rocket,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  X,
  ExternalLink,
  Building2,
  FileText,
  DollarSign,
  Award,
  Globe,
  Sparkles,
} from 'lucide-react';
import externalOutcomeService from '../../services/externalOutcomeService';

export default function StudentOutcomes() {
  const [outcomes, setOutcomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [category, setCategory] = useState('Off-Campus Placement');

  // Form states
  const [offCampusForm, setOffCampusForm] = useState({
    companyName: '',
    role: '',
    ctcLpa: 12,
    location: 'Bengaluru, India',
    offerLetterUrl: '',
    joiningDate: '',
  });

  const [higherStudiesForm, setHigherStudiesForm] = useState({
    universityName: '',
    degree: 'MS',
    country: 'United States',
    program: 'Computer Science',
    examTaken: 'GRE',
    score: '325 / 340',
    admissionLetterUrl: '',
  });

  const [startupForm, setStartupForm] = useState({
    startupName: '',
    sector: 'Technology / SaaS',
    role: 'Co-Founder & CTO',
    website: '',
    teamSize: 3,
    fundingRaisedLakhs: 0,
    cinOrUdyamNumber: '',
  });

  const fetchOutcomes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await externalOutcomeService.getMyOutcomes();
      setOutcomes(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Failed to fetch self-reported outcomes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutcomes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      const payload = { category };
      if (category === 'Off-Campus Placement') {
        if (!offCampusForm.companyName.trim() || !offCampusForm.role.trim()) {
          setError('Company and designation are required.');
          setSubmitting(false);
          return;
        }
        payload.offCampusDetails = offCampusForm;
      } else if (category === 'Higher Studies') {
        if (!higherStudiesForm.universityName.trim() || !higherStudiesForm.program.trim()) {
          setError('University and program name are required.');
          setSubmitting(false);
          return;
        }
        payload.higherStudiesDetails = higherStudiesForm;
      } else if (category === 'Entrepreneurship') {
        if (!startupForm.startupName.trim()) {
          setError('Startup name is required.');
          setSubmitting(false);
          return;
        }
        payload.entrepreneurshipDetails = startupForm;
      }

      await externalOutcomeService.submitOutcome(payload);
      setSuccessMessage(`${category} submitted successfully. Pending TPO verification.`);
      setModalOpen(false);
      await fetchOutcomes();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit outcome.');
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
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-widest">
              Accreditation & Career Progress
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-400" />
            Off-Campus Offers, Higher Studies & Startups
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Self-report external career accomplishments to earn institutional validation and inclusion in NAAC/NIRF accreditation records.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Self-Report Outcome
        </button>
      </div>

      {/* Explanatory Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold flex-shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs">
          <span className="font-bold text-white block">Official Institutional Verification</span>
          <p className="text-slate-400 mt-0.5 leading-relaxed">
            All self-reported accomplishments are reviewed by the Training & Placement Cell. Upon approval, your outcome receives a cryptographic Ed25519 verification seal and is counted towards your college’s NIRF, NAAC Criterion V, and NBA progression benchmarks.
          </p>
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

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading your reported outcomes...</p>
        </div>
      ) : outcomes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <GraduationCap className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Outcomes Reported</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Received an off-campus offer, cleared GATE/GRE/CAT for higher studies, or founded a startup venture? Report it here!
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
          >
            <Plus className="w-4 h-4" />
            Self-Report Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outcomes.map((item) => {
            const isVerified = item.verificationStatus === 'verified';
            const isPending = item.verificationStatus === 'pending';

            return (
              <div
                key={item._id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Category & Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                      {item.category === 'Off-Campus Placement' && (
                        <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      {item.category === 'Higher Studies' && (
                        <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                      {item.category === 'Entrepreneurship' && (
                        <Rocket className="w-3.5 h-3.5 text-purple-400" />
                      )}
                      {item.category}
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${
                        isVerified
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : isPending
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-red-500/15 text-red-400 border-red-500/30'
                      }`}
                    >
                      {isVerified && <ShieldCheck className="w-3 h-3" />}
                      {isPending && <Clock className="w-3 h-3" />}
                      {isVerified ? 'TPO Verified' : isPending ? 'Pending Verification' : 'Rejected'}
                    </span>
                  </div>

                  {/* Category-Specific Details */}
                  {item.category === 'Off-Campus Placement' && (
                    <div className="space-y-2 text-xs">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-400" />
                        {item.offCampusDetails?.companyName}
                      </h4>
                      <p className="text-slate-300 font-semibold">{item.offCampusDetails?.role}</p>

                      <div className="grid grid-cols-2 gap-2 mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Offered CTC</span>
                          <span className="font-extrabold text-emerald-400 text-sm">
                            ₹{item.offCampusDetails?.ctcLpa} LPA
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Location</span>
                          <span className="font-semibold text-slate-300">
                            {item.offCampusDetails?.location || 'India'}
                          </span>
                        </div>
                      </div>

                      {item.offCampusDetails?.offerLetterUrl && (
                        <a
                          href={item.offCampusDetails.offerLetterUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline pt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Offer Letter Document
                        </a>
                      )}
                    </div>
                  )}

                  {item.category === 'Higher Studies' && (
                    <div className="space-y-2 text-xs">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-cyan-400" />
                        {item.higherStudiesDetails?.universityName}
                      </h4>
                      <p className="text-slate-300 font-semibold">
                        {item.higherStudiesDetails?.degree} in {item.higherStudiesDetails?.program} (
                        {item.higherStudiesDetails?.country})
                      </p>

                      <div className="grid grid-cols-2 gap-2 mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Entrance Exam</span>
                          <span className="font-bold text-cyan-400">
                            {item.higherStudiesDetails?.examTaken || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Score / Rank</span>
                          <span className="font-semibold text-slate-300">
                            {item.higherStudiesDetails?.score || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {item.higherStudiesDetails?.admissionLetterUrl && (
                        <a
                          href={item.higherStudiesDetails.admissionLetterUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline pt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Admission Letter
                        </a>
                      )}
                    </div>
                  )}

                  {item.category === 'Entrepreneurship' && (
                    <div className="space-y-2 text-xs">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <Rocket className="w-4 h-4 text-purple-400" />
                        {item.entrepreneurshipDetails?.startupName}
                      </h4>
                      <p className="text-slate-300 font-semibold">
                        {item.entrepreneurshipDetails?.role} • {item.entrepreneurshipDetails?.sector}
                      </p>

                      <div className="grid grid-cols-2 gap-2 mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Team Size</span>
                          <span className="font-bold text-slate-200">
                            {item.entrepreneurshipDetails?.teamSize || 1} Members
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Funding Raised</span>
                          <span className="font-semibold text-emerald-400">
                            ₹{item.entrepreneurshipDetails?.fundingRaisedLakhs || 0} Lakhs
                          </span>
                        </div>
                      </div>

                      {item.entrepreneurshipDetails?.website && (
                        <a
                          href={item.entrepreneurshipDetails.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-purple-400 hover:underline pt-1"
                        >
                          <Globe className="w-3 h-3" />
                          Visit Venture Website
                        </a>
                      )}
                    </div>
                  )}

                  {item.rejectionReason && (
                    <p className="mt-2 text-[11px] text-red-300 bg-red-950/30 p-2 rounded-lg border border-red-900/40">
                      <strong>Rejection Note:</strong> {item.rejectionReason}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Reported on {new Date(item.createdAt).toLocaleDateString()}</span>
                  {isVerified && (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Included in Institutional NIRF
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                Self-Report Career Progression
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Selector Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCategory('Off-Campus Placement')}
                className={`py-1.5 rounded-lg transition ${
                  category === 'Off-Campus Placement'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Off-Campus Job
              </button>
              <button
                type="button"
                onClick={() => setCategory('Higher Studies')}
                className={`py-1.5 rounded-lg transition ${
                  category === 'Higher Studies'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Higher Studies
              </button>
              <button
                type="button"
                onClick={() => setCategory('Entrepreneurship')}
                className={`py-1.5 rounded-lg transition ${
                  category === 'Entrepreneurship'
                    ? 'bg-purple-500 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Startup
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {/* Category 1: Off-Campus Form */}
              {category === 'Off-Campus Placement' && (
                <>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amazon, Oracle, Razorpay"
                      value={offCampusForm.companyName}
                      onChange={(e) => setOffCampusForm({ ...offCampusForm, companyName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Designation / Role *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Software Engineer"
                        value={offCampusForm.role}
                        onChange={(e) => setOffCampusForm({ ...offCampusForm, role: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Offered CTC (LPA) *</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={offCampusForm.ctcLpa}
                        onChange={(e) => setOffCampusForm({ ...offCampusForm, ctcLpa: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Job Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Hyderabad / Remote"
                      value={offCampusForm.location}
                      onChange={(e) => setOffCampusForm({ ...offCampusForm, location: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Offer Letter Document / Drive Link *
                    </label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={offCampusForm.offerLetterUrl}
                      onChange={(e) => setOffCampusForm({ ...offCampusForm, offerLetterUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* Category 2: Higher Studies Form */}
              {category === 'Higher Studies' && (
                <>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">University / Institute *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. IISc Bangalore, Stanford University, IIT Bombay"
                      value={higherStudiesForm.universityName}
                      onChange={(e) =>
                        setHigherStudiesForm({ ...higherStudiesForm, universityName: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Degree Program</label>
                      <select
                        value={higherStudiesForm.degree}
                        onChange={(e) =>
                          setHigherStudiesForm({ ...higherStudiesForm, degree: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                      >
                        <option value="MS">MS</option>
                        <option value="MTech">M.Tech</option>
                        <option value="MBA">MBA</option>
                        <option value="PhD">PhD</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Country</label>
                      <input
                        type="text"
                        value={higherStudiesForm.country}
                        onChange={(e) =>
                          setHigherStudiesForm({ ...higherStudiesForm, country: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Entrance Exam</label>
                      <select
                        value={higherStudiesForm.examTaken}
                        onChange={(e) =>
                          setHigherStudiesForm({ ...higherStudiesForm, examTaken: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                      >
                        <option value="GATE">GATE</option>
                        <option value="GRE">GRE</option>
                        <option value="CAT">CAT</option>
                        <option value="GMAT">GMAT</option>
                        <option value="TOEFL">TOEFL</option>
                        <option value="IELTS">IELTS</option>
                        <option value="None">Direct / None</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Score / Percentile / Rank</label>
                      <input
                        type="text"
                        placeholder="e.g. AIR 142 / 99.4%"
                        value={higherStudiesForm.score}
                        onChange={(e) =>
                          setHigherStudiesForm({ ...higherStudiesForm, score: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Admission Letter Link</label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={higherStudiesForm.admissionLetterUrl}
                      onChange={(e) =>
                        setHigherStudiesForm({ ...higherStudiesForm, admissionLetterUrl: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* Category 3: Startup Form */}
              {category === 'Entrepreneurship' && (
                <>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Startup / Venture Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Zenith Robotics"
                      value={startupForm.startupName}
                      onChange={(e) => setStartupForm({ ...startupForm, startupName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Sector / Domain</label>
                      <input
                        type="text"
                        value={startupForm.sector}
                        onChange={(e) => setStartupForm({ ...startupForm, sector: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Your Role</label>
                      <input
                        type="text"
                        value={startupForm.role}
                        onChange={(e) => setStartupForm({ ...startupForm, role: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Team Size</label>
                      <input
                        type="number"
                        value={startupForm.teamSize}
                        onChange={(e) => setStartupForm({ ...startupForm, teamSize: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Funding Raised (Lakhs)</label>
                      <input
                        type="number"
                        value={startupForm.fundingRaisedLakhs}
                        onChange={(e) =>
                          setStartupForm({ ...startupForm, fundingRaisedLakhs: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Website URL</label>
                    <input
                      type="url"
                      placeholder="https://myventure.io"
                      value={startupForm.website}
                      onChange={(e) => setStartupForm({ ...startupForm, website: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                    />
                  </div>
                </>
              )}

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
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit for Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
