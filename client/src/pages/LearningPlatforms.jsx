import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ExternalLink, Star, X,
  BookOpen, ArrowUpRight, Sparkles,
  CheckCircle2, Compass
} from 'lucide-react';
import { LEARNING_PLATFORMS_DATA, LEARNING_CATEGORIES } from '../data/learningPlatformsData';

// High-fidelity vector logos and monograms for each learning platform
const LearningLogo = ({ id, name }) => {
  switch (id) {
    case 'leetcode':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#FFA116] flex items-center justify-center text-white shadow-xs font-bold text-base flex-shrink-0 font-mono">
          LC
        </div>
      );
    case 'neetcode':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#10B981] flex items-center justify-center text-white shadow-xs font-bold text-sm flex-shrink-0 font-mono">
          {'<NC>'}
        </div>
      );
    case 'geeksforgeeks':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#2F8D46] flex items-center justify-center text-white shadow-xs font-bold text-sm flex-shrink-0">
          {'{ }'}
        </div>
      );
    case 'hackerrank':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#00EA64] flex items-center justify-center text-slate-900 shadow-xs font-extrabold text-base flex-shrink-0 font-mono">
          [H]
        </div>
      );
    case 'codeforces':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#1F8ACB] flex items-center justify-center text-white shadow-xs font-bold text-xs flex-shrink-0">
          CF
        </div>
      );
    case 'codechef':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#5B4638] flex items-center justify-center text-white shadow-xs font-bold text-xs flex-shrink-0">
          CC
        </div>
      );
    case 'harvard-cs50':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#A51C30] flex items-center justify-center text-white shadow-xs font-extrabold text-xs flex-shrink-0 tracking-tight font-display">
          CS50
        </div>
      );
    case 'mit-ocw':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#A31F34] flex items-center justify-center text-white shadow-xs font-extrabold text-xs flex-shrink-0 font-mono">
          MIT
        </div>
      );
    case 'coursera':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#0056D2] flex items-center justify-center text-white shadow-xs font-extrabold text-xl flex-shrink-0 font-serif">
          C
        </div>
      );
    case 'edx':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#02262B] flex items-center justify-center text-[#B7E305] shadow-xs font-bold text-sm flex-shrink-0 font-mono">
          edX
        </div>
      );
    case 'nptel':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#F58220] flex items-center justify-center text-white shadow-xs font-extrabold text-xs flex-shrink-0">
          IIT
        </div>
      );
    case 'freecodecamp':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#0A0A23] flex items-center justify-center text-[#00EA64] shadow-xs font-mono font-bold text-xs flex-shrink-0">
          (fcc)
        </div>
      );
    case 'the-odin-project':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#D19A66] flex items-center justify-center text-white shadow-xs font-extrabold text-xs flex-shrink-0">
          TOP
        </div>
      );
    case 'roadmap-sh':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#FACC15] flex items-center justify-center text-slate-900 shadow-xs font-bold text-xs flex-shrink-0 font-mono">
          MAP
        </div>
      );
    case 'frontend-masters':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#C02D28] flex items-center justify-center text-white shadow-xs font-bold text-xs flex-shrink-0">
          FM
        </div>
      );
    case 'scrimba':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#6C5CE7] flex items-center justify-center text-white shadow-xs font-bold text-sm flex-shrink-0">
          Sc
        </div>
      );
    case 'codecademy':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#1F2430] flex items-center justify-center text-[#646FF0] shadow-xs font-bold text-base flex-shrink-0 font-mono">
          [ ]
        </div>
      );
    case 'bytebytego':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#00A3C4] flex items-center justify-center text-white shadow-xs font-bold text-xs flex-shrink-0 font-mono">
          BBG
        </div>
      );
    case 'takeuforward':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#DC2626] flex items-center justify-center text-white shadow-xs font-bold text-xs flex-shrink-0">
          TUF
        </div>
      );
    case 'algoexpert':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#007BFF] flex items-center justify-center text-white shadow-xs font-bold text-xs flex-shrink-0 font-mono">
          AE
        </div>
      );
    case 'educative':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#0D9488] flex items-center justify-center text-white shadow-xs font-bold text-sm flex-shrink-0">
          Ed
        </div>
      );
    case 'interviewbit':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#F37021] flex items-center justify-center text-white shadow-xs font-bold text-sm flex-shrink-0">
          IB
        </div>
      );
    case 'deeplearning-ai':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#1E3A8A] flex items-center justify-center text-white shadow-xs font-bold text-xs flex-shrink-0 font-mono">
          D.AI
        </div>
      );
    case 'kaggle':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#20BEFF] flex items-center justify-center text-white shadow-xs font-extrabold text-lg flex-shrink-0 font-display">
          K
        </div>
      );
    case 'huggingface':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#FFD21E] flex items-center justify-center text-slate-900 shadow-xs font-bold text-sm flex-shrink-0">
          HF
        </div>
      );
    case 'fast-ai':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#4F46E5] flex items-center justify-center text-white shadow-xs font-bold text-xs flex-shrink-0 font-mono">
          fast
        </div>
      );
    case 'datacamp':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#03EF62] flex items-center justify-center text-slate-900 shadow-xs font-bold text-xs flex-shrink-0">
          DC
        </div>
      );
    case 'aws-skill-builder':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#FF9900] flex items-center justify-center text-slate-900 shadow-xs font-bold text-xs flex-shrink-0 font-display">
          AWS
        </div>
      );
    case 'gcp-skills-boost':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#4285F4] flex items-center justify-center text-white shadow-xs font-bold text-xs flex-shrink-0">
          GCP
        </div>
      );
    case 'microsoft-learn':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#0078D4] flex items-center justify-center text-white shadow-xs font-bold text-xs flex-shrink-0">
          MS
        </div>
      );
    case 'tryhackme':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#E53E3E] flex items-center justify-center text-white shadow-xs font-bold text-xs flex-shrink-0">
          THM
        </div>
      );
    case 'hackthebox':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#1A1E24] border border-[#9FEF00]/40 flex items-center justify-center text-[#9FEF00] shadow-xs font-bold text-xs flex-shrink-0 font-mono">
          HTB
        </div>
      );
    case 'udemy':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#A435F0] flex items-center justify-center text-white shadow-xs font-bold text-sm flex-shrink-0">
          Ud
        </div>
      );
    case 'pluralsight':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#F80067] flex items-center justify-center text-white shadow-xs font-bold text-sm flex-shrink-0">
          PS
        </div>
      );
    case 'udacity':
      return (
        <div className="w-11 h-11 rounded-2xl bg-[#01B3E3] flex items-center justify-center text-white shadow-xs font-bold text-lg flex-shrink-0 font-display">
          U
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

// Helper badge for pricing tiers
const PricingBadge = ({ pricing }) => {
  const isFree = pricing.includes('Free') || pricing.includes('100%');
  const isPaid = pricing.includes('Subscription') || pricing.includes('Paid');

  if (isFree) {
    return (
      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md flex-shrink-0">
        {pricing}
      </span>
    );
  }
  if (isPaid) {
    return (
      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-md flex-shrink-0">
        {pricing}
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md flex-shrink-0">
      {pricing}
    </span>
  );
};

const LearningPlatforms = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Platforms');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('placeearly_bookmarked_learning');
      return saved ? JSON.parse(saved) : ['leetcode', 'harvard-cs50', 'freecodecamp', 'bytebytego', 'takeuforward'];
    } catch {
      return ['leetcode', 'harvard-cs50', 'freecodecamp', 'bytebytego', 'takeuforward'];
    }
  });
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [activeModalPlatform, setActiveModalPlatform] = useState(null);

  // Sync bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('placeearly_bookmarked_learning', JSON.stringify(bookmarkedIds));
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
  const filteredPlatforms = LEARNING_PLATFORMS_DATA.filter(platform => {
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
      
      {/* Top Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="w-full max-w-[1750px] 2xl:max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 h-16 flex items-center justify-between">
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
              <Link to="/job-platforms" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Job Platforms</Link>
              <Link to="/learning-platforms" className="text-sm font-bold text-slate-900 flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                Learning Platforms
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors hidden sm:block px-3 py-1.5">
              Sign In
            </Link>
            <Link to="/student/dashboard" className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-black transition-all flex items-center gap-1.5 shadow-sm">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              Student Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Expansive Hero Section */}
      <section className="relative pt-24 pb-8 border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50/70 to-[#F8FAFC]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none"></div>

        <div className="w-full max-w-[1750px] 2xl:max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            
            {/* Split Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200/80 shadow-xs mb-3 text-xs font-bold text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  <span>Global Tech Education Directory</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-medium">{LEARNING_PLATFORMS_DATA.length} Verified Platforms</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900 tracking-[-0.035em] leading-[1.15]">
                  Tech & Coding Learning Directory
                </h1>

                <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed mt-2 max-w-2xl">
                  Curated portals for Data Structures, algorithmic problem solving, university CS curricula, system design, generative AI, and cloud certifications.
                </p>
              </div>

              {/* Quick Info Badges */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="bg-white border border-slate-200/80 rounded-2xl px-4 py-2.5 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">DSA & Contests</span>
                  <span className="text-xs font-bold text-slate-900 font-display">LeetCode & NeetCode</span>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl px-4 py-2.5 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">University CS</span>
                  <span className="text-xs font-bold text-slate-900 font-display">Harvard CS50 & MIT</span>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl px-4 py-2.5 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Systems & Web</span>
                  <span className="text-xs font-bold text-slate-900 font-display">ByteByteGo & Odin</span>
                </div>
              </div>
            </div>

            {/* Expansive Search & Filter Toolbar */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full md:w-80 lg:w-96 flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by platform, topic, or syllabus..."
                  className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200/70 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-all font-sans"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                {LEARNING_CATEGORIES.map(cat => (
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

      {/* Main Content Area - 5 Columns Grid */}
      <main className="flex-1 w-full max-w-[1750px] 2xl:max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-8">
        
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

        {/* 5-Column High-Fidelity Cards Grid */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 items-stretch">
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
                        <LearningLogo id={platform.id} name={platform.name} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-700 transition-colors">
                              {platform.name}
                            </h3>
                          </div>
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

                    {/* Pricing Badge */}
                    <div className="mb-2">
                      <PricingBadge pricing={platform.pricing} />
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
                      Launch Portal
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
                  <LearningLogo id={activeModalPlatform.id} name={activeModalPlatform.name} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">
                        {activeModalPlatform.name}
                      </h3>
                      <PricingBadge pricing={activeModalPlatform.pricing} />
                    </div>
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
                  <h4 className="font-bold text-slate-900 mb-1">About & Purpose</h4>
                  <p className="text-slate-600 leading-relaxed">
                    {activeModalPlatform.tagline} {activeModalPlatform.bestFor}
                  </p>
                </div>

                {/* Direct Learning Tracks */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-1.5">Top Tracks & Syllabi</h4>
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
                  <h4 className="font-bold text-slate-900 mb-1.5">Curriculum Highlights</h4>
                  <ul className="space-y-1.5 text-slate-600">
                    {activeModalPlatform.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Learning & Placement Strategy */}
                <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5">
                  <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Placement & Study Recommendation
                  </h4>
                  <p className="text-blue-900/90 leading-relaxed font-medium">
                    {activeModalPlatform.learningTip}
                  </p>
                </div>

                {/* External Action Button */}
                <div className="pt-2">
                  <a
                    href={activeModalPlatform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs font-display"
                  >
                    Open {activeModalPlatform.name}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6">
        <div className="w-full max-w-[1750px] 2xl:max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PLACEearly Ecosystem. Hand-curated technical education resources.</p>
          <div className="flex items-center gap-6 font-semibold">
            <Link to="/job-platforms" className="hover:text-slate-900 transition-colors">Job Platforms Directory</Link>
            <Link to="/for-students" className="hover:text-slate-900 transition-colors">Student Portfolio</Link>
            <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LearningPlatforms;
