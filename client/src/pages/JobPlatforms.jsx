import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ExternalLink, Star, CheckCircle2, Sparkles, 
  Compass, ShieldCheck, Zap, X, Globe,
  Briefcase, Lightbulb
} from 'lucide-react';
import { JOB_PLATFORMS_DATA, CATEGORIES } from '../data/jobPlatformsData';

const JobPlatforms = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Platforms');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('placeearly_bookmarked_platforms');
      return saved ? JSON.parse(saved) : ['wellfound', 'yc-startup', 'unstop', 'linkedin'];
    } catch {
      return ['wellfound', 'yc-startup', 'unstop', 'linkedin'];
    }
  });
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [activeModalPlatform, setActiveModalPlatform] = useState(null);

  // Sync bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('placeearly_bookmarked_platforms', JSON.stringify(bookmarkedIds));
    } catch (e) {
      console.error(e);
    }
  }, [bookmarkedIds]);

  const toggleBookmark = (id, e) => {
    e.stopPropagation();
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filter logic
  const filteredPlatforms = JOB_PLATFORMS_DATA.filter(platform => {
    const matchesCategory = selectedCategory === 'All Platforms' || platform.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      platform.name.toLowerCase().includes(query) ||
      platform.category.toLowerCase().includes(query) ||
      platform.tagline.toLowerCase().includes(query) ||
      platform.bestFor.toLowerCase().includes(query) ||
      platform.features.some(f => f.toLowerCase().includes(query));
    
    const matchesBookmark = !onlyBookmarked || bookmarkedIds.includes(platform.id);
    return matchesCategory && matchesSearch && matchesBookmark;
  });

  return (
    <div className="min-h-screen bg-mongo-bg text-mongo-text font-sans selection:bg-mongo-green selection:text-mongo-dark overflow-x-hidden flex flex-col">
      
      {/* Top Navbar */}
      <nav className="fixed w-full z-50 bg-mongo-bg/90 backdrop-blur-md border-b border-mongo-gray/30">
        <div className="max-w-[1416px] mx-auto px-6 h-[88px] flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-mongo-dark rounded-md flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-mongo-green font-bold text-xl font-display">P</span>
              </div>
              <span className="text-xl font-display font-bold tracking-tight text-mongo-dark">PLACEearly</span>
            </Link>
            <div className="hidden lg:flex items-center gap-8">
              <Link to="/for-students" className="text-[15px] font-medium text-mongo-text hover:text-mongo-green-dark transition-colors">For Students</Link>
              <Link to="/for-colleges" className="text-[15px] font-medium text-mongo-text hover:text-mongo-green-dark transition-colors">For Colleges</Link>
              <Link to="/how-it-works" className="text-[15px] font-medium text-mongo-text hover:text-mongo-green-dark transition-colors">How it Works</Link>
              <Link to="/job-platforms" className="text-[15px] font-bold text-mongo-green-dark transition-colors flex items-center gap-1">
                Job Platforms
                <span className="bg-mongo-green/20 text-mongo-dark text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded ml-1">Directory</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/login" className="text-[15px] font-medium text-mongo-text hover:text-mongo-green-dark transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link to="/student/dashboard" className="text-[15px] font-bold bg-mongo-green text-mongo-dark px-5 py-2.5 rounded-full hover:bg-[#00E05B] transition-colors shadow-xs flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" />
              Student Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-[140px] pb-24 px-4 sm:px-6 lg:px-8 max-w-[1416px] mx-auto w-full">
        
        {/* Header Hero */}
        <section className="text-center max-w-3xl mx-auto mb-12">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-mongo-gray bg-white mb-6 shadow-xs">
              <Globe className="w-4 h-4 text-mongo-green-dark" />
              <span className="text-xs font-bold text-mongo-dark uppercase tracking-wider">Off-Campus & Global Hiring Ecosystem</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-mongo-dark tracking-tight leading-tight mb-4">
              The Curated Job Platforms Directory
            </h1>

            <p className="text-base sm:text-lg text-mongo-text/80 font-light leading-relaxed mb-8">
              Explore, compare, and directly launch the world’s best career portals. From tier-1 YC tech startups and remote USD engineering to campus hackathons and enterprise drives.
            </p>

            {/* Search Input Bar */}
            <div className="relative max-w-2xl mx-auto shadow-md rounded-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search platforms by name, tech stack, feature, or role (e.g. Wellfound, Internships, Remote, React)..."
                className="w-full pl-12 pr-10 py-4 bg-white border border-gray-200 rounded-2xl text-sm sm:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-mongo-green"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </section>

        {/* 30-Minute Daily Action Playbook */}
        <section className="mb-10 bg-gradient-to-r from-mongo-dark via-[#012738] to-mongo-dark text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-800 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-mongo-green/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-mongo-green" />
                <span className="text-xs font-bold uppercase tracking-wider text-mongo-green">Proven Placement Strategy</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-2">
                The 30-Minute Daily Off-Campus Routine
              </h2>
              <p className="text-sm text-gray-300 max-w-2xl font-light">
                Students who consistently rotate between 3 platform tiers land 4x more interview calls than those relying solely on mass portal easy-applies.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
              <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 text-left">
                <span className="text-xs font-bold text-mongo-green block mb-1">Step 1: 10 Mins</span>
                <p className="text-xs font-bold text-white mb-0.5">Campus & Contests</p>
                <p className="text-[11px] text-gray-300 leading-tight">Check Unstop & Internshala for new hiring challenges.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 text-left">
                <span className="text-xs font-bold text-mongo-green block mb-1">Step 2: 10 Mins</span>
                <p className="text-xs font-bold text-white mb-0.5">Direct Founder Outreach</p>
                <p className="text-[11px] text-gray-300 leading-tight">Send 2 Wellfound / YC startup applications with your GitHub demo.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 text-left">
                <span className="text-xs font-bold text-mongo-green block mb-1">Step 3: 10 Mins</span>
                <p className="text-xs font-bold text-white mb-0.5">Alumni Warm Networking</p>
                <p className="text-[11px] text-gray-300 leading-tight">Connect with 2 university alumni on LinkedIn working at target firms.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Category Navigation & Bookmark Filter */}
        <section className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? 'bg-mongo-dark text-white shadow-sm' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Bookmarked Filter Pill */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => setOnlyBookmarked(!onlyBookmarked)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                onlyBookmarked 
                  ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyBookmarked ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
              Starred Routine ({bookmarkedIds.length})
            </button>

            <span className="text-xs font-semibold text-gray-500">
              {filteredPlatforms.length} {filteredPlatforms.length === 1 ? 'Platform' : 'Platforms'}
            </span>
          </div>
        </section>

        {/* Platforms Directory Grid */}
        {filteredPlatforms.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-lg mx-auto my-12 shadow-xs">
            <Compass className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No platforms match your criteria</h3>
            <p className="text-xs text-gray-500 mb-6">Try clearing your search query or selecting "All Platforms".</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('All Platforms'); setOnlyBookmarked(false); }}
              className="px-4 py-2 bg-mongo-dark text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlatforms.map((platform) => {
              const isBookmarked = bookmarkedIds.includes(platform.id);
              return (
                <motion.div
                  layout
                  key={platform.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-3xl border border-gray-200/90 p-6 shadow-xs hover:shadow-xl hover:border-gray-300 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center font-display font-extrabold text-white text-xl shadow-xs"
                          style={{ backgroundColor: platform.color }}
                        >
                          {platform.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-gray-900 text-lg leading-tight group-hover:text-mongo-green-dark transition-colors">
                            {platform.name}
                          </h3>
                          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                            {platform.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => toggleBookmark(platform.id, e)}
                          title={isBookmarked ? "Remove from daily routine" : "Add to daily routine"}
                          className="p-1.5 text-gray-400 hover:text-amber-500 rounded-lg hover:bg-amber-50 transition-colors"
                        >
                          <Star className={`w-4 h-4 ${isBookmarked ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                        </button>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-mongo-green/20 text-mongo-dark border border-mongo-green/30">
                          {platform.badge}
                        </span>
                      </div>
                    </div>

                    {/* Tagline */}
                    <p className="text-xs text-gray-600 font-medium mb-4 leading-relaxed">
                      {platform.tagline}
                    </p>

                    {/* Key Features Bullet Points */}
                    <div className="space-y-2 mb-5 bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Direct Features</p>
                      {platform.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-mongo-green-dark mt-0.5 flex-shrink-0" />
                          <span className="leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Quick Search Deep Links */}
                    <div className="mb-5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Instant Search Shortcuts</p>
                      <div className="flex flex-wrap gap-1.5">
                        {platform.deepLinks.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700 bg-white border border-gray-200 hover:border-mongo-green hover:text-mongo-dark hover:bg-mongo-green/5 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            {link.label}
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Pro Tip Box */}
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 mb-5 text-left">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Application Hack</span>
                      </div>
                      <p className="text-xs text-amber-950 font-normal leading-relaxed">
                        {platform.proTip}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
                    <button
                      onClick={() => setActiveModalPlatform(platform)}
                      className="flex-1 py-2.5 px-3 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 text-mongo-green-dark" />
                      Platform Guide
                    </button>

                    <a
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-3 text-xs font-bold text-mongo-dark bg-mongo-green hover:bg-[#00E05B] rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs font-display"
                    >
                      Launch Platform
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </main>

      {/* PLATFORM DETAIL & ATS GUIDE MODAL */}
      <AnimatePresence>
        {activeModalPlatform && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between pb-4 border-b border-gray-100 mb-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-display font-extrabold text-white text-xl shadow-xs"
                    style={{ backgroundColor: activeModalPlatform.color }}
                  >
                    {activeModalPlatform.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-gray-900 leading-tight">
                      {activeModalPlatform.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {activeModalPlatform.category} • {activeModalPlatform.badge}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModalPlatform(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6 text-left">
                {/* Overview */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Overview & Mission</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {activeModalPlatform.tagline}. It is particularly tailored for <strong>{activeModalPlatform.bestFor}</strong>.
                  </p>
                </div>

                {/* Key Features */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Key Platform Features</h4>
                  <div className="space-y-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    {activeModalPlatform.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-800 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-mongo-green-dark mt-0.5 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ATS & Profile Optimization Guide */}
                <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                      ATS & Recruiter Algorithm Strategy
                    </h4>
                  </div>
                  <p className="text-xs text-blue-950 leading-relaxed font-normal">
                    {activeModalPlatform.atsGuide}
                  </p>
                </div>

                {/* Pro Tip */}
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-700" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      Actionable Success Hack
                    </h4>
                  </div>
                  <p className="text-xs text-amber-950 leading-relaxed font-normal">
                    {activeModalPlatform.proTip}
                  </p>
                </div>

                {/* Deep Links */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Quick Search Channels</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeModalPlatform.deepLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-800 bg-gray-50 hover:bg-mongo-green/20 hover:text-mongo-dark border border-gray-200 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setActiveModalPlatform(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
                <a
                  href={activeModalPlatform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-mongo-green text-mongo-dark hover:bg-[#00E05B] rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-2 font-display"
                >
                  Launch {activeModalPlatform.name}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-mongo-dark text-white border-t border-gray-800 py-12 mt-auto">
        <div className="max-w-[1416px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-mongo-green rounded-md flex items-center justify-center">
              <span className="text-mongo-dark font-bold text-lg font-display">P</span>
            </div>
            <span className="font-display font-bold text-lg tracking-tight">PLACEearly</span>
            <span className="text-gray-400 text-xs ml-2">Job Platforms Directory</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/for-students" className="hover:text-white transition-colors">For Students</Link>
            <Link to="/for-colleges" className="hover:text-white transition-colors">For Colleges</Link>
            <Link to="/how-it-works" className="hover:text-white transition-colors">How it Works</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>

          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} PLACEearly. Built for campus recruitment and career enablement.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default JobPlatforms;
