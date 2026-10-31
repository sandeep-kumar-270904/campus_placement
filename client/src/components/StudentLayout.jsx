import React, { useContext, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { useTranslation } from '../context/I18nContext';
import ThemeToggle from './common/ThemeToggle';
import LanguageSelector from './common/LanguageSelector';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  Calendar,
  FolderLock,
  ShieldAlert,
  Bell,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Sparkles,
  ChevronRight,
  Users,
  MessageSquareText,
  TrendingUp,
  GraduationCap,
  Compass,
  Search,
  Building2,
} from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import { CommandPalette } from './ui/CommandPalette';

const ALL_NAV_ITEMS = [
  { path: '/student/dashboard', translationKey: 'dashboard', label: 'Today Hub', icon: LayoutDashboard },
  { path: '/student/opportunities', translationKey: 'opportunities', label: 'Opportunities', icon: Briefcase },
  { path: '/student/applications', translationKey: 'applications', label: 'My Applications', icon: FileText },
  { path: '/student/profile', translationKey: 'profile', label: 'Profile Builder', icon: User },
  { path: '/student/interviews', translationKey: 'interviews', label: 'Interview Calendar', icon: Calendar },
  { path: '/student/mock-interview', translationKey: 'mockInterview', label: 'AI Mock Interviewer', icon: Sparkles, featureFlag: 'atsMatcher' },
  { path: '/student/alumni', translationKey: 'alumni', label: 'Alumni Network', icon: Users, featureFlag: 'alumniNetwork' },
  { path: '/student/interview-experiences', translationKey: 'interviewExperiences', label: 'Interview Debriefs', icon: MessageSquareText, featureFlag: 'interviewExperiences' },
  { path: '/student/internships', translationKey: 'internships', label: 'Internships & PPO', icon: TrendingUp, featureFlag: 'internshipPpo' },
  { path: '/student/outcomes', translationKey: 'outcomes', label: 'Off-Campus & Outcomes', icon: GraduationCap, featureFlag: 'offCampusHigherStudies' },
  { path: '/career-pages', label: 'MNC & PBC Careers', icon: Building2 },
  { path: '/student/resources', translationKey: 'resources', label: 'Career Resources (90+)', icon: Compass, featureFlag: 'consolidatedResources' },
  { path: '/student/documents', translationKey: 'documents', label: 'Documents & NOC', icon: FolderLock },
  { path: '/student/privacy', translationKey: 'privacy', label: 'Data & Privacy', icon: ShieldAlert },
  { path: '/student/notifications/preferences', translationKey: 'settings', label: 'Notification Settings', icon: Bell },
  { path: '/settings/sessions', translationKey: 'settings', label: 'Active Sessions', icon: FolderLock },
];

export default function StudentLayout() {
  const { user, logout } = useContext(AuthContext);
  const { branding, college, isFeatureEnabled } = useTenant();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = ALL_NAV_ITEMS.filter(
    (item) => !item.featureFlag || (isFeatureEnabled && isFeatureEnabled(item.featureFlag))
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row transition-colors">
      {/* Mobile Top Navigation */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          {branding?.logoUrl ? (
            <img src={branding.logoUrl} alt="Logo" className="w-8 h-8 rounded object-contain bg-white/10 p-0.5" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center text-sm">
              PE
            </div>
          )}
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">PLACEearly</h1>
            <p className="text-[10px] text-emerald-400 font-medium">Student Workspace</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSelector />
          <NotificationCenter />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-md border-r border-slate-800 flex flex-col transition-transform duration-200 md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="w-9 h-9 rounded-lg object-contain bg-white/10 p-1" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-base shadow-lg shadow-emerald-500/20">
                PE
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">PLACEearly</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Student
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[140px] font-medium">
                {college?.name || 'Campus Placement OS'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card Mini */}
        <div className="p-3 m-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm">
            {user?.name?.[0]?.toUpperCase() || user?.firstName?.[0]?.toUpperCase() || 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user?.name || `${user?.firstName || 'Student'} ${user?.lastName || ''}`.trim()}
            </p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
          <Link
            to={`/portfolio/${user?.rollNo || user?.id || 'me'}`}
            target="_blank"
            rel="noopener noreferrer"
            title="View Public Portfolio"
            className="p-1.5 text-slate-400 hover:text-emerald-400 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Quick Search Shortcut */}
        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="w-full flex items-center justify-between bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-400 cursor-pointer transition shadow-inner group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              <span>Jump to...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-900 border border-slate-700/80 rounded text-slate-400">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/student/dashboard' && location.pathname.startsWith(item.path));
            const translatedLabel = item.translationKey ? t(`nav.${item.translationKey}`, item.label) : item.label;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{translatedLabel}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          {/* Theme & Language Bar */}
          <div className="flex items-center justify-between px-2 py-1">
            <LanguageSelector />
            <ThemeToggle />
          </div>

          <div className="hidden md:flex items-center justify-between px-2 py-1">
            <span className="text-[11px] text-slate-400 font-medium">Notifications</span>
            <NotificationCenter />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/30 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto min-h-screen">
        <Outlet />
      </main>

      {/* Global Command Palette */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
