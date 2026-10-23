import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Building2,
  Briefcase,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  HelpCircle,
  ShieldCheck,
  User,
  Filter,
  Check,
} from 'lucide-react';
import interviewExperienceService from '../../services/interviewExperienceService';

export default function StudentInterviewExperiences() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [outcomeFilter, setOutcomeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('upvotes'); // 'upvotes' | 'recent'

  // Expanded experience IDs
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Share Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    jobType: 'Full-time',
    batchYear: new Date().getFullYear(),
    branch: 'Computer Science',
    overallDifficulty: 'Medium',
    outcome: 'Selected',
    isAnonymous: false,
    preparationTips: '',
    rounds: [
      {
        roundName: 'Round 1: Online Assessment',
        roundType: 'OA',
        durationMinutes: 60,
        questions: '',
        tips: '',
        difficulty: 'Medium',
      },
      {
        roundName: 'Round 2: Technical Interview',
        roundType: 'Technical',
        durationMinutes: 45,
        questions: '',
        tips: '',
        difficulty: 'Medium',
      },
    ],
  });

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await interviewExperienceService.getExperiences({
        q: search,
        difficulty: difficultyFilter,
        outcome: outcomeFilter,
        sortBy,
      });
      setExperiences(res.experiences || []);
      // Expand first experience by default
      if (res.experiences?.length > 0) {
        setExpandedIds(new Set([res.experiences[0]._id]));
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Failed to fetch interview experiences.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, [difficultyFilter, outcomeFilter, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExperiences();
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleUpvote = async (id) => {
    try {
      // Optimistic update
      setExperiences((prev) =>
        prev.map((exp) => {
          if (exp._id === id) {
            const hasUpvoted = exp.hasUserUpvoted;
            return {
              ...exp,
              hasUserUpvoted: !hasUpvoted,
              upvoteCount: hasUpvoted ? exp.upvoteCount - 1 : exp.upvoteCount + 1,
            };
          }
          return exp;
        })
      );
      await interviewExperienceService.toggleUpvote(id);
    } catch (err) {
      console.error('Failed to toggle upvote:', err);
      // Revert if error
      fetchExperiences();
    }
  };

  // Modal Round Management
  const handleAddRound = () => {
    setFormData((prev) => ({
      ...prev,
      rounds: [
        ...prev.rounds,
        {
          roundName: `Round ${prev.rounds.length + 1}: Technical Interview`,
          roundType: 'Technical',
          durationMinutes: 45,
          questions: '',
          tips: '',
          difficulty: 'Medium',
        },
      ],
    }));
  };

  const handleRemoveRound = (idx) => {
    if (formData.rounds.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      rounds: prev.rounds.filter((_, i) => i !== idx),
    }));
  };

  const handleRoundChange = (idx, field, value) => {
    setFormData((prev) => {
      const updatedRounds = [...prev.rounds];
      updatedRounds[idx] = { ...updatedRounds[idx], [field]: value };
      return { ...prev, rounds: updatedRounds };
    });
  };

  const handleSubmitExperience = async (e) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !formData.role.trim()) {
      setSubmitError('Please provide company name and role.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      // Process rounds questions into array
      const processedRounds = formData.rounds.map((r) => ({
        roundName: r.roundName,
        roundType: r.roundType,
        durationMinutes: Number(r.durationMinutes) || 45,
        tips: r.tips,
        difficulty: r.difficulty,
        questions: r.questions
          ? r.questions
              .split('\n')
              .map((q) => q.trim())
              .filter(Boolean)
          : [],
      }));

      await interviewExperienceService.submitExperience({
        companyName: formData.companyName,
        role: formData.role,
        jobType: formData.jobType,
        batchYear: formData.batchYear,
        branch: formData.branch,
        overallDifficulty: formData.overallDifficulty,
        outcome: formData.outcome,
        isAnonymous: formData.isAnonymous,
        preparationTips: formData.preparationTips,
        rounds: processedRounds,
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setModalOpen(false);
        // Reset form
        setFormData({
          companyName: '',
          role: '',
          jobType: 'Full-time',
          batchYear: new Date().getFullYear(),
          branch: 'Computer Science',
          overallDifficulty: 'Medium',
          outcome: 'Selected',
          isAnonymous: false,
          preparationTips: '',
          rounds: [
            {
              roundName: 'Round 1: Online Assessment',
              roundType: 'OA',
              durationMinutes: 60,
              questions: '',
              tips: '',
              difficulty: 'Medium',
            },
          ],
        });
      }, 2500);
    } catch (err) {
      setSubmitError(err.response?.data?.error?.message || 'Failed to submit experience.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-widest">
              Crowdsourced Debriefs
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            Interview Experience Library
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real questions, round-by-round walkthroughs, and tactical preparation tips debriefed by seniors and placed peers.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Share Your Experience
        </button>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by company (e.g., Google, Cisco), role, or specific questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400 font-medium">Difficulty:</span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none"
            >
              <option value="all">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Outcome:</span>
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none"
            >
              <option value="all">All Outcomes</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
              <option value="Waitlisted">Waitlisted</option>
            </select>
          </div>

          <div className="flex items-center gap-2 sm:ml-auto">
            <span className="text-slate-400 font-medium">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none"
            >
              <option value="upvotes">Most Helpful (Upvotes)</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading interview experiences...</p>
        </div>
      ) : experiences.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No Experiences Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Be the first to share an interview experience from your recent recruitment drive!
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition"
          >
            <Plus className="w-4 h-4" />
            Share Debrief
          </button>
        </div>
      ) : (
        /* Experiences Feed */
        <div className="space-y-4">
          {experiences.map((exp) => {
            const isExpanded = expandedIds.has(exp._id);
            const difficultyBadge =
              exp.overallDifficulty === 'Hard'
                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                : exp.overallDifficulty === 'Medium'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

            const outcomeBadge =
              exp.outcome === 'Selected'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : exp.outcome === 'Waitlisted'
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700';

            return (
              <div
                key={exp._id}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition overflow-hidden"
              >
                {/* Header row */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-400" />
                        {exp.companyName}
                      </h3>
                      <span className="text-slate-500">•</span>
                      <span className="text-sm font-semibold text-slate-300">{exp.role}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider bg-slate-800 text-slate-400 border-slate-700">
                        {exp.jobType}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${difficultyBadge}`}>
                        {exp.overallDifficulty} Difficulty
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${outcomeBadge}`}>
                        {exp.outcome}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        {exp.authorName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                        {exp.branch} (Batch {exp.batchYear})
                      </span>
                      <span>•</span>
                      <span>{new Date(exp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Actions: Upvote & Expand Toggle */}
                  <div className="flex items-center gap-3 self-end md:self-center">
                    <button
                      onClick={() => handleUpvote(exp._id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                        exp.hasUserUpvoted
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${exp.hasUserUpvoted ? 'fill-current' : ''}`} />
                      <span>{exp.upvoteCount || 0}</span>
                    </button>

                    <button
                      onClick={() => toggleExpand(exp._id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                    >
                      <span>{isExpanded ? 'Hide Rounds' : `View ${exp.rounds?.length || 0} Rounds`}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4 bg-slate-950/40">
                    {/* Rounds Breakdown */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        Interview Rounds Breakdown
                      </h4>

                      <div className="space-y-2.5">
                        {(exp.rounds || []).map((round, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-white flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center text-[10px]">
                                  {idx + 1}
                                </span>
                                {round.roundName}
                              </span>
                              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                  {round.roundType}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {round.durationMinutes} mins
                                </span>
                              </div>
                            </div>

                            {/* Questions asked */}
                            {round.questions?.length > 0 && (
                              <div className="pt-1.5 text-xs">
                                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 block mb-1">
                                  Key Questions / Topics Asked:
                                </span>
                                <ul className="list-disc list-inside space-y-1 text-slate-200">
                                  {round.questions.map((q, qIdx) => (
                                    <li key={qIdx} className="leading-relaxed">
                                      {q}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Round tips */}
                            {round.tips && (
                              <p className="text-xs text-amber-300/90 bg-amber-950/20 border border-amber-900/30 p-2 rounded-lg">
                                <span className="font-bold text-amber-400">Round Tip: </span>
                                {round.tips}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Overall Preparation Tips */}
                    {exp.preparationTips && (
                      <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-xs">
                        <span className="font-bold text-emerald-400 block mb-1">
                          General Preparation Advice & Strategy:
                        </span>
                        <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {exp.preparationTips}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Share Experience Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  Share Interview Experience
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your debrief helps junior batches prepare. All submissions are moderated by TPO before publishing.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitExperience} className="p-5 overflow-y-auto space-y-4 text-xs">
              {submitSuccess ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-xl">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h4 className="text-base font-bold text-white">Experience Submitted!</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Thank you for contributing to your college community. Your debrief has been sent to the TPO moderation queue and will appear publicly once approved.
                  </p>
                </div>
              ) : (
                <>
                  {submitError && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300">
                      {submitError}
                    </div>
                  )}

                  {/* Company & Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Company Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Microsoft, Deloitte"
                        required
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Target Role *</label>
                      <input
                        type="text"
                        placeholder="e.g. SDE 1, Graduate Trainee"
                        required
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>

                  {/* Job Type, Difficulty & Outcome */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Position Type</label>
                      <select
                        value={formData.jobType}
                        onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Internship">Internship</option>
                        <option value="Internship+FTE">Internship + FTE</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Overall Difficulty</label>
                      <select
                        value={formData.overallDifficulty}
                        onChange={(e) => setFormData({ ...formData, overallDifficulty: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Final Outcome</label>
                      <select
                        value={formData.outcome}
                        onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                      >
                        <option value="Selected">Selected / Offer</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Waitlisted">Waitlisted</option>
                      </select>
                    </div>
                  </div>

                  {/* Anonymous Toggle */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">Post Anonymously</span>
                      <span className="text-[11px] text-slate-400">
                        Mask your name to peers (shows as "Anonymous 2026 Graduate"). Visible only to TPO.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.isAnonymous}
                      onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                    />
                  </div>

                  {/* Rounds Builder */}
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                        Rounds Detail
                      </label>
                      <button
                        type="button"
                        onClick={handleAddRound}
                        className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Round
                      </button>
                    </div>

                    {formData.rounds.map((round, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 relative"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={round.roundName}
                            onChange={(e) => handleRoundChange(idx, 'roundName', e.target.value)}
                            placeholder={`Round ${idx + 1} Name`}
                            className="bg-transparent font-bold text-white border-b border-slate-800 focus:outline-none focus:border-cyan-400 text-xs flex-1"
                          />
                          {formData.rounds.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRound(idx)}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={round.roundType}
                            onChange={(e) => handleRoundChange(idx, 'roundType', e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300"
                          >
                            <option value="OA">OA / Assessment</option>
                            <option value="Technical">Technical</option>
                            <option value="System Design">System Design</option>
                            <option value="HR">HR</option>
                            <option value="Managerial">Managerial</option>
                            <option value="Behavioral">Behavioral</option>
                          </select>

                          <input
                            type="number"
                            placeholder="Duration (mins)"
                            value={round.durationMinutes}
                            onChange={(e) => handleRoundChange(idx, 'durationMinutes', e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                            Questions Asked (1 per line)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="e.g. Reverse linked list in groups of K&#10;Explain ACID properties and indexing in Postgres"
                            value={round.questions}
                            onChange={(e) => handleRoundChange(idx, 'questions', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500/50"
                          />
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Specific tip for this round (optional)"
                            value={round.tips}
                            onChange={(e) => handleRoundChange(idx, 'tips', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 placeholder-slate-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* General Tips */}
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      General Advice / Preparation Roadmap for Juniors
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Share resources used, core topics emphasized by the interviewers, projects discussed, etc."
                      value={formData.preparationTips}
                      onChange={(e) => setFormData({ ...formData, preparationTips: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit for TPO Moderation'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
