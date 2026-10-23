import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  Compass,
  Search,
  Star,
  ExternalLink,
  Sparkles,
  BookOpen,
  Briefcase,
  Code2,
  GraduationCap,
  Globe,
  Filter,
  ArrowUpRight,
  Layers,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';
import { LEARNING_PLATFORMS_DATA } from '../../data/learningPlatformsData';
import { JOB_PLATFORMS_DATA } from '../../data/jobPlatformsData';
import { AuthContext } from '../../context/AuthContext';

export default function StudentResources() {
  const { user } = useContext(AuthContext);

  // Search & Active Tab
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'learning' | 'jobs' | 'dsa' | 'courses' | 'startups' | 'internships' | 'bookmarks'

  // Bookmarks persisted in localStorage
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('student_bookmarked_resources');
      return saved ? JSON.parse(saved) : ['leetcode', 'neetcode', 'linkedin', 'wellfound'];
    } catch {
      return ['leetcode', 'neetcode', 'linkedin', 'wellfound'];
    }
  });

  // Selected Platform for Drawer / Detail Modal
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  // Combine both directories into a unified catalog
  const allPlatforms = useMemo(() => {
    const learning = LEARNING_PLATFORMS_DATA.map((item) => ({
      ...item,
      resourceType: 'learning',
    }));
    const jobs = JOB_PLATFORMS_DATA.map((item) => ({
      ...item,
      resourceType: 'job',
    }));
    return [...learning, ...jobs];
  }, []);

  const toggleBookmark = (id, e) => {
    e.stopPropagation();
    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id];
      try {
        localStorage.setItem('student_bookmarked_resources', JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });
  };

  // Student's target role from profile
  const targetRole = user?.targetRole || user?.profile?.targetRole || 'Software Development Engineer';

  // Recommendations: Curated platforms tailored for SDE / Fresher roles
  const recommendedPlatforms = useMemo(() => {
    const recIds = ['leetcode', 'neetcode', 'geeksforgeeks', 'wellfound', 'linkedin', 'unstop', 'github', 'roadmap-sh'];
    return allPlatforms.filter((p) => recIds.includes(p.id));
  }, [allPlatforms]);

  // Tab Filtering
  const filteredPlatforms = useMemo(() => {
    return allPlatforms.filter((platform) => {
      // Search matching
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        platform.name?.toLowerCase().includes(query) ||
        platform.tagline?.toLowerCase().includes(query) ||
        platform.tags?.some((t) => t.toLowerCase().includes(query)) ||
        platform.category?.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // Tab matching
      if (activeTab === 'all') return true;
      if (activeTab === 'bookmarks') return bookmarks.includes(platform.id);
      if (activeTab === 'learning') return platform.resourceType === 'learning';
      if (activeTab === 'jobs') return platform.resourceType === 'job';
      if (activeTab === 'dsa') {
        return (
          platform.category?.toLowerCase().includes('dsa') ||
          platform.category?.toLowerCase().includes('coding') ||
          platform.tags?.some((t) => ['dsa', 'algorithms', 'leetcode'].includes(t.toLowerCase()))
        );
      }
      if (activeTab === 'courses') {
        return (
          platform.category?.toLowerCase().includes('course') ||
          platform.category?.toLowerCase().includes('cs') ||
          platform.category?.toLowerCase().includes('theory')
        );
      }
      if (activeTab === 'startups') {
        return (
          platform.category?.toLowerCase().includes('startup') ||
          platform.category?.toLowerCase().includes('remote') ||
          platform.tags?.some((t) => ['startup', 'remote', 'yc'].includes(t.toLowerCase()))
        );
      }
      if (activeTab === 'internships') {
        return (
          platform.category?.toLowerCase().includes('internship') ||
          platform.tags?.some((t) => ['internship', 'fresher'].includes(t.toLowerCase()))
        );
      }

      return true;
    });
  }, [allPlatforms, searchTerm, activeTab, bookmarks]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
              Unified Career Hub
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-400" />
            Consolidated Resources Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access 90+ verified platforms for coding practice, interview roadmaps, internships, startup hiring, and off-campus drives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
              activeTab === 'bookmarks'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Star className={`w-3.5 h-3.5 text-amber-400 ${bookmarks.length > 0 ? 'fill-current' : ''}`} />
            <span>My Bookmarks ({bookmarks.length})</span>
          </button>
        </div>
      </div>

      {/* Recommended for You Row (Based on Target Role) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/20 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Recommended for You: <span className="text-emerald-400">{targetRole}</span>
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Curated Essentials</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {recommendedPlatforms.map((plat) => {
            const isBookmarked = bookmarks.includes(plat.id);
            return (
              <div
                key={plat.id}
                onClick={() => setSelectedPlatform(plat)}
                className="group relative p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/40 transition cursor-pointer flex flex-col items-center text-center justify-between"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white mb-1.5 shadow-sm"
                  style={{ backgroundColor: plat.color || '#10B981' }}
                >
                  {plat.name?.charAt(0)}
                </div>
                <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition truncate w-full">
                  {plat.name}
                </span>
                <span className="text-[9px] text-slate-500 truncate w-full mt-0.5">
                  {plat.category?.split(' ')[0]}
                </span>

                <button
                  onClick={(e) => toggleBookmark(plat.id, e)}
                  className="absolute top-1 right-1 p-1 text-slate-600 hover:text-amber-400 transition"
                  title="Bookmark"
                >
                  <Star className={`w-3 h-3 ${isBookmarked ? 'text-amber-400 fill-current' : ''}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search across 90+ platforms (e.g., LeetCode, Y Combinator, Naukri, DSA, System Design)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
          {[
            { id: 'all', label: `All Resources (${allPlatforms.length})`, icon: Layers },
            { id: 'bookmarks', label: `Bookmarks (${bookmarks.length})`, icon: Star },
            { id: 'dsa', label: 'Coding & DSA Practice', icon: Code2 },
            { id: 'courses', label: 'Courses & CS Theory', icon: BookOpen },
            { id: 'jobs', label: 'All Job Platforms', icon: Briefcase },
            { id: 'startups', label: 'Startups & Remote', icon: Globe },
            { id: 'internships', label: 'Internships & Freshers', icon: GraduationCap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Grid */}
      {filteredPlatforms.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
          <Compass className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Platforms Match Your Filter</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try searching with broader terms or clear your active filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlatforms.map((platform) => {
            const isBookmarked = bookmarks.includes(platform.id);
            return (
              <div
                key={platform.id}
                onClick={() => setSelectedPlatform(platform)}
                className="group p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between cursor-pointer relative"
              >
                <div className="space-y-3">
                  {/* Top card header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-md flex-shrink-0"
                        style={{ backgroundColor: platform.color || '#10B981' }}
                      >
                        {platform.name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-white group-hover:text-emerald-400 transition flex items-center gap-1.5">
                          {platform.name}
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition text-emerald-400" />
                        </h4>
                        <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
                          {platform.category}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => toggleBookmark(platform.id, e)}
                      className={`p-1.5 rounded-lg border transition ${
                        isBookmarked
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-slate-800/60 text-slate-500 border-slate-700/60 hover:text-slate-300'
                      }`}
                      title={isBookmarked ? 'Remove Bookmark' : 'Add to Bookmarks'}
                    >
                      <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {platform.tagline}
                  </p>

                  {/* Tags */}
                  {platform.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {platform.tags.slice(0, 3).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-950 border border-slate-800 text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer deep links & visit */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    {platform.resourceType === 'learning' ? (
                      <span className="text-cyan-400 font-semibold">Practice Platform</span>
                    ) : (
                      <span className="text-purple-400 font-semibold">Job / Hiring Portal</span>
                    )}
                  </span>

                  <a
                    href={platform.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 font-bold text-emerald-400 hover:text-emerald-300 transition"
                  >
                    Visit <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Platform Deep Detail Modal */}
      {selectedPlatform && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-md flex-shrink-0"
                  style={{ backgroundColor: selectedPlatform.color || '#10B981' }}
                >
                  {selectedPlatform.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {selectedPlatform.name}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedPlatform.category}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPlatform(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-200 leading-relaxed font-medium">
                {selectedPlatform.tagline}
              </p>

              {/* Best For */}
              {selectedPlatform.bestFor && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                    Best For:
                  </span>
                  <p className="text-slate-300 leading-relaxed">{selectedPlatform.bestFor}</p>
                </div>
              )}

              {/* Key Features */}
              {selectedPlatform.features?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Key Features:
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {selectedPlatform.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Learning Tip or ATS Guide */}
              {(selectedPlatform.learningTip || selectedPlatform.atsGuide) && (
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-300">
                  <span className="font-bold block mb-1">
                    {selectedPlatform.learningTip ? '💡 Learning Tip' : '🎯 ATS Strategy'}
                  </span>
                  <p className="leading-relaxed">
                    {selectedPlatform.learningTip || selectedPlatform.atsGuide}
                  </p>
                </div>
              )}

              {/* Deep Links */}
              {selectedPlatform.deepLinks?.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Direct Deep Links:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlatform.deepLinks.map((dl, dlIdx) => (
                      <a
                        key={dlIdx}
                        href={dl.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <span>{dl.label}</span>
                        <ExternalLink className="w-3 h-3 text-emerald-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={(e) => toggleBookmark(selectedPlatform.id, e)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    bookmarks.includes(selectedPlatform.id) ? 'text-amber-400 fill-current' : ''
                  }`}
                />
                {bookmarks.includes(selectedPlatform.id) ? 'Bookmarked' : 'Add to Bookmarks'}
              </button>

              <a
                href={selectedPlatform.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-md shadow-emerald-500/20"
              >
                Open Platform <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
