import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ExternalLink, Star, X, Globe,
  ShieldCheck, Zap, Briefcase, ArrowUpRight, Sparkles,
  CheckCircle2, Compass
} from 'lucide-react';
import { JOB_PLATFORMS_DATA, CATEGORIES } from '../data/jobPlatformsData';

// High-fidelity vector logos for each platform
const PlatformLogo = ({ id, name }) => {
  switch (id) {
    case 'linkedin':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#0A66C2] flex items-center justify-center text-white shadow-xs flex-shrink-0">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
          </svg>
        </div>
      );
    case 'yc-startup':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#FF6600] flex items-center justify-center text-white shadow-xs font-bold text-xl font-mono flex-shrink-0">
          Y
        </div>
      );
    case 'wellfound':
      return (
        <div className="w-11 h-11 rounded-2xl bg-black flex items-center justify-center text-white shadow-xs flex-shrink-0">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2L1 21h4.5l6.5-12 6.5 12H23L12 2zm0 6l-3.5 6.5h7L12 8z"/>
          </svg>
        </div>
      );
    case 'unstop':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#0052CC] flex items-center justify-center text-white shadow-xs font-extrabold text-sm tracking-tight flex-shrink-0">
          UN
        </div>
      );
    case 'internshala':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#008BD3] flex items-center justify-center text-white shadow-xs font-bold text-base flex-shrink-0">
          IS
        </div>
      );
    case 'remoteok':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#FF4742] flex items-center justify-center text-white shadow-xs flex-shrink-0">
          <Globe className="w-5 h-5" />
        </div>
      );
    case 'weworkremotely':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#E05A47] flex items-center justify-center text-white shadow-xs font-bold text-xs flex-shrink-0">
          WWR
        </div>
      );
    case 'cuvette':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#6366F1] flex items-center justify-center text-white shadow-xs font-mono font-bold text-sm flex-shrink-0">
          {'<c>'}
        </div>
      );
    case 'gfg-jobs':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#2F8D46] flex items-center justify-center text-white shadow-xs font-bold text-sm flex-shrink-0">
          {'{ }'}
        </div>
      );
    case 'cutshort':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#10B981] flex items-center justify-center text-white shadow-xs flex-shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
      );
    case 'instahyre':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#0D9488] flex items-center justify-center text-white shadow-xs flex-shrink-0">
          <Zap className="w-5 h-5" />
        </div>
      );
    case 'indeed':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#2164F3] flex items-center justify-center text-white shadow-xs font-bold text-xl font-serif italic flex-shrink-0">
          i
        </div>
      );
    case 'naukri':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#4A90E2] flex items-center justify-center text-white shadow-xs font-bold text-base flex-shrink-0">
          N
        </div>
      );
    case 'hirist':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#3B82F6] flex items-center justify-center text-white shadow-xs font-bold text-base flex-shrink-0">
          H
        </div>
      );
    case 'mlh-fellowship':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#D9381E] flex items-center justify-center text-white shadow-xs font-mono font-bold text-xs flex-shrink-0">
          MLH
        </div>
      );
    case 'foundit':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#6D28D9] flex items-center justify-center text-white shadow-xs font-bold text-base flex-shrink-0">
          fi
        </div>
      );
    case 'herkey':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#BE185D] flex items-center justify-center text-white shadow-xs font-bold text-base flex-shrink-0">
          HK
        </div>
      );
    case 'shine':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#EA580C] flex items-center justify-center text-white shadow-xs font-bold text-lg flex-shrink-0 font-display">
          S
        </div>
      );
    case 'google-jobs':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#4285F4] flex items-center justify-center text-white shadow-xs font-bold text-xl flex-shrink-0 font-display">
          G
        </div>
      );
    case 'glassdoor':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#0CAA41] flex items-center justify-center text-white shadow-xs font-bold text-base flex-shrink-0">
          GD
        </div>
      );
    case 'hirect':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#06B6D4] flex items-center justify-center text-white shadow-xs font-bold text-lg flex-shrink-0 font-display">
          H
        </div>
      );
    case 'freshersworld':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#4F46E5] flex items-center justify-center text-white shadow-xs font-bold text-sm flex-shrink-0">
          FW
        </div>
      );
    case 'letsintern':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#F43F5E] flex items-center justify-center text-white shadow-xs font-bold text-base flex-shrink-0">
          LI
        </div>
      );
    case 'apna':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#15803D] flex items-center justify-center text-white shadow-xs font-bold text-sm flex-shrink-0">
          apna
        </div>
      );
    case 'workindia':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#1D4ED8] flex items-center justify-center text-white shadow-xs font-bold text-sm flex-shrink-0">
          WI
        </div>
      );
    case 'timesjobs':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#DC2626] flex items-center justify-center text-white shadow-xs font-bold text-sm flex-shrink-0">
          TJ
        </div>
      );
    case 'jobsora':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#0284C7] flex items-center justify-center text-white shadow-xs font-bold text-sm flex-shrink-0">
          JS
        </div>
      );
    case 'quikrjobs':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#EAB308] flex items-center justify-center text-slate-900 shadow-xs font-bold text-lg flex-shrink-0 font-display">
          Q
        </div>
      );
    case 'jooble':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#7C3AED] flex items-center justify-center text-white shadow-xs font-bold text-sm flex-shrink-0">
          jb
        </div>
      );
    default:
      return (
        <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xs font-bold text-base flex-shrink-0">
          {name.charAt(0)}
        </div>
      );
  }
};

const JobPlatforms = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Platforms');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('placeearly_bookmarked_platforms');
      return saved ? JSON.parse(saved) : ['wellfound', 'yc-startup', 'linkedin', 'unstop'];
    } catch {
      return ['wellfound', 'yc-startup', 'linkedin', 'unstop'];
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
      platform.tags.some(t => t.toLowerCase().includes(query));
    
    const matchesBookmark = !onlyBookmarked || bookmarkedIds.includes(platform.id);
    return matchesCategory && matchesSearch && matchesBookmark;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-mongo-green selection:text-mongo-dark flex flex-col antialiased">
      
      {/* Top Navbar - Full Screen Width */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="w-full max-w-[1650px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs">
                <span className="text-mongo-green font-bold text-lg font-display">P</span>
              </div>
              <span className="text-lg font-display font-extrabold tracking-tight text-slate-900">PLACEearly</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/for-students" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">For Students</Link>
              <Link to="/for-colleges" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">For Colleges</Link>
              <Link to="/how-it-works" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">How it Works</Link>
              <Link to="/job-platforms" className="text-sm font-bold text-slate-900 flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-mongo-green"></span>
                Job Platforms
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors hidden sm:block px-3 py-1.5">
              Sign In
            </Link>
            <Link to="/student/dashboard" className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-black transition-all flex items-center gap-1.5 shadow-sm">
              <Briefcase className="w-3.5 h-3.5 text-mongo-green" />
              Student Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Expansive Hero Section Filling Horizontal Width */}
      <section className="relative pt-24 pb-8 border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50/70 to-[#F8FAFC]">
        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none"></div>

        <div className="w-full max-w-[1650px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            
            {/* Split Header: Left Heading + Right Quick Signals */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200/80 shadow-xs mb-3 text-xs font-bold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-mongo-green animate-pulse"></span>
                  <span>Global Hiring Ecosystem</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-medium">{JOB_PLATFORMS_DATA.length} Verified Platforms</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900 tracking-[-0.035em] leading-[1.15]">
                  Hiring & Career Platforms Directory
                </h1>

                <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed mt-2 max-w-2xl">
                  Direct access to verified tech startup ecosystems, campus hiring challenges, internships, and remote developer networks.
                </p>
              </div>

              {/* Quick Info Badges */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="bg-white border border-slate-200/80 rounded-2xl px-4 py-2.5 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Startup Channels</span>
                  <span className="text-xs font-bold text-slate-900 font-display">Wellfound & YC</span>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl px-4 py-2.5 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Campus Drives</span>
                  <span className="text-xs font-bold text-slate-900 font-display">Unstop & Internshala</span>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl px-4 py-2.5 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Global Remote</span>
                  <span className="text-xs font-bold text-slate-900 font-display">USD & EUR Salaries</span>
                </div>
              </div>
            </div>

            {/* Expansive Search & Filter Toolbar Across the Full Width */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full md:w-80 lg:w-96 flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by company, role, or feature..."
                  className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200/70 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-all font-sans"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Pills filling the center */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat 
                        ? 'bg-slate-900 text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Saved Filter Button */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={() => setOnlyBookmarked(!onlyBookmarked)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    onlyBookmarked 
                      ? 'bg-amber-500 text-white shadow-xs' 
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${onlyBookmarked ? 'fill-current' : 'text-amber-500'}`} />
                  Saved ({bookmarkedIds.length})
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      {/* Main Content Area - 4 Columns Across Full Screen Width */}
      <main className="flex-1 w-full max-w-[1650px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-8">
        
        {/* Results Counter Bar */}
        <div className="flex items-center justify-between mb-5 px-1">
          <p className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-900">{filteredPlatforms.length}</strong> {filteredPlatforms.length === 1 ? 'platform' : 'platforms'}
          </p>
          {(searchQuery || selectedCategory !== 'All Platforms' || onlyBookmarked) && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All Platforms'); setOnlyBookmarked(false); }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* 4-Column High-Fidelity Cards Grid */}
        {filteredPlatforms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8 shadow-xs">
            <Compass className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900 mb-1">No platforms match your search</h3>
            <p className="text-xs text-slate-500 mb-4">Try clearing your search query or selecting a different category.</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('All Platforms'); setOnlyBookmarked(false); }}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
            {filteredPlatforms.map((platform) => {
              const isBookmarked = bookmarkedIds.includes(platform.id);
              return (
                <div
                  key={platform.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between group shadow-xs"
                >
                  <div>
                    {/* Header: Logo, Name, Category & Star */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-3">
                        <PlatformLogo id={platform.id} name={platform.name} />
                        <div>
                          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition-colors">
                            {platform.name}
                          </h3>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {platform.category}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => toggleBookmark(platform.id, e)}
                        title={isBookmarked ? "Remove from saved" : "Save platform"}
                        className="p-1.5 text-slate-300 hover:text-amber-500 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <Star className={`w-4 h-4 ${isBookmarked ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                      </button>
                    </div>

                    {/* Tagline */}
                    <p className="text-xs text-slate-600 leading-relaxed mb-3.5 line-clamp-2">
                      {platform.tagline}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {platform.tags.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200/70 px-2 py-0.5 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => setActiveModalPlatform(platform)}
                      className="py-2.5 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      Details
                    </button>

                    <a
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs font-display"
                    >
                      Visit Platform
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Clean Material Dialog Modal */}
      <AnimatePresence>
        {activeModalPlatform && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-3.5 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-3">
                  <PlatformLogo id={activeModalPlatform.id} name={activeModalPlatform.name} />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {activeModalPlatform.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">
                      {activeModalPlatform.category}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModalPlatform(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="space-y-4 text-left text-xs text-slate-700">
                {/* Overview */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">About</h4>
                  <p className="text-slate-600 leading-relaxed">
                    {activeModalPlatform.tagline} {activeModalPlatform.bestFor}
                  </p>
                </div>

                {/* Direct Search Channels */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-1.5">Direct Search Channels</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeModalPlatform.deepLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors"
                      >
                        {link.label}
                        <ArrowUpRight className="w-3 h-3 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Key Features */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-1.5">Platform Features</h4>
                  <ul className="space-y-1.5 text-slate-600">
                    {activeModalPlatform.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Application Advice */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Application Tip
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    {activeModalPlatform.atsGuide}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setActiveModalPlatform(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Close
                </button>
                <a
                  href={activeModalPlatform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-900 text-white hover:bg-black rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  Open {activeModalPlatform.name}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clean Minimal Footer - Full Width */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto text-xs text-slate-500">
        <div className="w-full max-w-[1650px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">PLACEearly</span>
            <span>•</span>
            <span>Hiring Platforms Directory</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <Link to="/for-students" className="hover:text-slate-900 transition-colors">Students</Link>
            <Link to="/for-colleges" className="hover:text-slate-900 transition-colors">Colleges</Link>
            <Link to="/how-it-works" className="hover:text-slate-900 transition-colors">How It Works</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default JobPlatforms;
