import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  ExternalLink,
  GraduationCap,
  Briefcase,
  MapPin,
  Sparkles,
  Award,
  Filter,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  Bookmark,
  Share2,
  Info,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  COMPANY_CAREERS_DATA,
  COMPANY_CATEGORIES,
  filterCompanies,
} from '../data/companyCareersData';
import {
  Button,
  Input,
  Select,
  Badge,
  Tabs,
  EmptyState,
  Drawer,
  useToast,
} from '../components/ui';

export default function CompanyCareers() {
  const { addToast } = useToast();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [fresherOnly, setFresherOnly] = useState(false);
  const [internOnly, setInternOnly] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('placeearly_bookmarked_companies');
      return saved ? JSON.parse(saved) : ['google', 'flipkart', 'walmart'];
    } catch {
      return ['google', 'flipkart', 'walmart'];
    }
  });

  // Selected company for detailed slide-over drawer
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Extract all distinct locations
  const allLocations = useMemo(() => {
    const locSet = new Set();
    COMPANY_CAREERS_DATA.forEach((comp) => {
      comp.indiaHubs.forEach((hub) => locSet.add(hub.split(' ')[0]));
    });
    return ['All', ...Array.from(locSet).sort()];
  }, []);

  // Filtered dataset
  const filteredCompanies = useMemo(() => {
    let list = filterCompanies(COMPANY_CAREERS_DATA, {
      category: activeCategory,
      search: searchTerm,
      fresherOnly,
      internOnly,
    });

    if (selectedLocation !== 'All') {
      list = list.filter((comp) =>
        comp.indiaHubs.some((hub) =>
          hub.toLowerCase().includes(selectedLocation.toLowerCase())
        )
      );
    }

    return list;
  }, [activeCategory, searchTerm, fresherOnly, internOnly, selectedLocation]);

  const toggleBookmark = (id, e) => {
    e?.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      try {
        localStorage.setItem('placeearly_bookmarked_companies', JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save bookmark:', err);
      }
      return next;
    });

    addToast({
      type: 'info',
      title: bookmarkedIds.includes(id) ? 'Bookmark Removed' : 'Company Saved',
      message: bookmarkedIds.includes(id)
        ? 'Removed from your pinned career targets.'
        : 'Saved to your pinned career targets.',
    });
  };

  const categoryTabs = COMPANY_CATEGORIES.map((cat) => ({
    id: cat,
    label: cat,
    badge:
      cat === 'All'
        ? COMPANY_CAREERS_DATA.length
        : COMPANY_CAREERS_DATA.filter((c) => c.type === cat).length,
  }));

  const getCompanyTypeBadgeVariant = (type) => {
    switch (type) {
      case 'MNC (Big Tech)':
        return 'primary';
      case 'Product-Based Company':
        return 'info';
      case 'Global Capability Center (GCC)':
        return 'purple';
      case 'FinTech & Banking':
        return 'warning';
      case 'Semiconductors & Systems':
        return 'indigo';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top Hero Banner */}
      <div className="border-b border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-slate-950 pt-10 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Building2 className="w-6 h-6" />
                </span>
                <Badge variant="primary" size="sm">
                  Official Career Portals
                </Badge>
                <Badge variant="neutral" size="sm">
                  {COMPANY_CAREERS_DATA.length} Top MNCs, PBCs & GCCs
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                Top MNC, PBC & GCC Career Hub
              </h1>

              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                Direct gateways to official career portals, university hiring schemes, off-campus drives,
                and interview tips for top product corporations and global technology capability centers.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-400 font-medium">Pinned Targets</p>
                <p className="text-lg font-bold text-emerald-400 font-mono">
                  {bookmarkedIds.length} Saved
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Category Tabs */}
        <div className="overflow-x-auto pb-1">
          <Tabs
            variant="pills"
            activeTab={activeCategory}
            onChange={setActiveCategory}
            tabs={categoryTabs}
          />
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="flex-1 max-w-md">
            <Input
              icon={Search}
              clearable
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
              placeholder="Search companies (Google, Cred, Walmart), roles, hubs..."
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Location Filter */}
            <div className="w-40">
              <Select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                options={allLocations.map((loc) => ({
                  value: loc,
                  label: loc === 'All' ? 'All Locations' : `📍 ${loc}`,
                }))}
              />
            </div>

            {/* Fresher Friendly Filter */}
            <button
              type="button"
              onClick={() => setFresherOnly(!fresherOnly)}
              className={`
                px-3 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer
                ${
                  fresherOnly
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/30'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-850'
                }
              `}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Fresher Friendly</span>
            </button>

            {/* Internships Filter */}
            <button
              type="button"
              onClick={() => setInternOnly(!internOnly)}
              className={`
                px-3 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer
                ${
                  internOnly
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 ring-1 ring-sky-500/30'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-850'
                }
              `}
            >
              <Briefcase className="w-4 h-4" />
              <span>Internships Open</span>
            </button>
          </div>
        </div>

        {/* Results Counter & Actions */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Showing <strong className="text-slate-200">{filteredCompanies.length}</strong> company career portals
            {activeCategory !== 'All' ? ` under ${activeCategory}` : ''}
          </span>
          {bookmarkedIds.length > 0 && (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              <span>{bookmarkedIds.length} companies bookmarked</span>
            </span>
          )}
        </div>

        {/* Company Cards Grid */}
        {filteredCompanies.length === 0 ? (
          <EmptyState
            title="No Companies Found"
            description={`No company matches "${searchTerm || activeCategory}". Try clearing your filters or search query.`}
            actionLabel="Reset All Filters"
            onAction={() => {
              setActiveCategory('All');
              setSearchTerm('');
              setFresherOnly(false);
              setInternOnly(false);
              setSelectedLocation('All');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCompanies.map((company) => {
              const isBookmarked = bookmarkedIds.includes(company.id);

              return (
                <div
                  key={company.id}
                  onClick={() => setSelectedCompany(company)}
                  className="group relative rounded-2xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer"
                >
                  {/* Top Row: Avatar, Name & Bookmark */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Company Avatar */}
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-md shrink-0 border border-white/10"
                          style={{
                            backgroundColor: company.color || '#10b981',
                          }}
                        >
                          {company.name.slice(0, 2).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-base text-slate-100 group-hover:text-emerald-300 transition-colors truncate">
                              {company.name}
                            </h3>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            {company.industry}
                          </p>
                        </div>
                      </div>

                      {/* Bookmark Icon */}
                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(company.id, e)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          isBookmarked
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border-slate-700'
                        }`}
                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark company'}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`}
                        />
                      </button>
                    </div>

                    {/* Tagline */}
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {company.tagline}
                    </p>

                    {/* Badges & Metrics Row */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <Badge variant={getCompanyTypeBadgeVariant(company.type)} size="xs">
                        {company.type}
                      </Badge>

                      {company.ctcRange && (
                        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {company.ctcRange}
                        </span>
                      )}

                      {company.fresherFriendly && (
                        <Badge variant="success" size="xs">
                          Fresher Hiring
                        </Badge>
                      )}
                    </div>

                    {/* Locations */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">
                        {company.indiaHubs.slice(0, 3).join(', ')}
                        {company.indiaHubs.length > 3 ? ` +${company.indiaHubs.length - 3}` : ''}
                      </span>
                    </div>

                    {/* Typical Roles */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Key Engineering Tracks:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {company.roles.slice(0, 2).map((role) => (
                          <span
                            key={role}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/80 truncate max-w-[200px]"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <a
                      href={company.careersUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm active:scale-95"
                    >
                      <span>Careers Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {company.earlyCareersUrl && (
                      <a
                        href={company.earlyCareersUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
                        title="Student / University early careers portal"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
                        <span className="hidden sm:inline">Students</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Extensibility & Contribution Footer Banner */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Extensible Company Careers Dataset</span>
            </h4>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Targeting more companies? Add structured profiles into{' '}
              <code className="text-emerald-400 font-mono text-[11px]">
                client/src/data/companyCareersData.js
              </code>{' '}
              to expand this directory to 500+ MNCs, PBCs, GCCs, and emerging unicorns.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              addToast({
                type: 'info',
                title: 'Data Schema Ready',
                message: 'Data can be appended to COMPANY_CAREERS_DATA in client/src/data/companyCareersData.js.',
              });
            }}
          >
            Data Extensibility Docs
          </Button>
        </div>
      </div>

      {/* Slide-Over Drawer with Deep Company Details & ATS Advice */}
      {selectedCompany && (
        <Drawer
          isOpen={Boolean(selectedCompany)}
          onClose={() => setSelectedCompany(null)}
          title={selectedCompany.name}
          subtitle={`${selectedCompany.type} • ${selectedCompany.industry}`}
          width="lg"
          footer={
            <div className="flex items-center justify-between w-full gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCompany(null)}
              >
                Close
              </Button>
              <a
                href={selectedCompany.careersUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
              >
                <span>Visit Official Careers Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          }
        >
          <div className="space-y-6 text-slate-200 text-xs">
            {/* Header Card */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[11px]">Estimated Entry CTC Bracket</p>
                <p className="text-xl font-bold font-mono text-emerald-400">
                  {selectedCompany.ctcRange || 'Competitive Industry Standard'}
                </p>
              </div>
              <Badge variant={getCompanyTypeBadgeVariant(selectedCompany.type)} size="sm">
                {selectedCompany.type}
              </Badge>
            </div>

            {/* Overview */}
            <div className="space-y-2">
              <h5 className="font-bold text-sm text-slate-100 uppercase tracking-wider text-[11px]">
                Company Overview & Scale
              </h5>
              <p className="text-slate-300 leading-relaxed">{selectedCompany.tagline}</p>
            </div>

            {/* Hubs & HQ */}
            <div className="space-y-2">
              <h5 className="font-bold text-sm text-slate-100 uppercase tracking-wider text-[11px]">
                Locations & India Engineering Centers
              </h5>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Global HQ:</span>
                  <span className="text-slate-200 font-semibold">{selectedCompany.hq}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1.5">India Presence:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCompany.indiaHubs.map((hub) => (
                      <span
                        key={hub}
                        className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[11px]"
                      >
                        📍 {hub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Roles Recruited */}
            <div className="space-y-2">
              <h5 className="font-bold text-sm text-slate-100 uppercase tracking-wider text-[11px]">
                Active Engineering & Tech Tracks
              </h5>
              <div className="flex flex-wrap gap-2">
                {selectedCompany.roles.map((r) => (
                  <span
                    key={r}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-medium"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {/* ATS Guide & Interview Tips */}
            <div className="space-y-2">
              <h5 className="font-bold text-sm text-slate-100 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>ATS Screening & Interview Preparation Tips</span>
              </h5>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed">
                {selectedCompany.atsTips}
              </div>
            </div>

            {/* Hiring Tags / Specialized Campus Programs */}
            {selectedCompany.hiringTags && (
              <div className="space-y-2">
                <h5 className="font-bold text-sm text-slate-100 uppercase tracking-wider text-[11px]">
                  Specialized Hiring Programs & Hackathons
                </h5>
                <div className="flex flex-wrap gap-2">
                  {selectedCompany.hiringTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20 text-xs font-medium"
                    >
                      🎯 {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Drawer>
      )}
    </div>
  );
}
