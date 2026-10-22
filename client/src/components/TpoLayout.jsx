import React, { useContext, useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ShieldAlert,
  Briefcase,
  Calendar,
  Building2,
  Megaphone,
  BarChart3,
  FileSpreadsheet,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Search,
  Plus,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import tpoService from '../services/tpoService';
import NotificationCenter from './NotificationCenter';

const NAV_ITEMS = [
  { path: '/tpo/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { path: '/tpo/students', label: 'Student Directory', icon: Users },
  { path: '/tpo/placement-risk', label: 'Placement Risk AI', icon: ShieldAlert },
  { path: '/tpo/verification', label: 'Verification Queue', icon: ShieldCheck, badgeKey: 'pendingVerifications' },
  { path: '/tpo/drives', label: 'Placement Drives', icon: Briefcase, badgeKey: 'activeDrives' },
  { path: '/tpo/schedule', label: 'Recruitment Schedule', icon: Calendar },
  { path: '/tpo/companies', label: 'Company CRM', icon: Building2 },
  { path: '/tpo/announcements', label: 'Broadcasts', icon: Megaphone },
  { path: '/tpo/notifications/tracking', label: 'Delivery Reports', icon: Bell },
  { path: '/tpo/analytics', label: 'Institutional Analytics', icon: BarChart3 },
  { path: '/tpo/reports', label: 'Reports & Exports', icon: FileSpreadsheet },
  { path: '/tpo/settings', label: 'Placement Policies', icon: Settings },
];

export default function TpoLayout() {
  const { user, logout } = useContext(AuthContext);
  const { branding, college } = useTenant();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [badges, setBadges] = useState({ pendingVerifications: 0, activeDrives: 0 });
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchBadges = async () => {
      try {
        const summary = await tpoService.getDashboardSummary();
        if (isMounted && summary?.kpis) {
          setBadges({
            pendingVerifications: summary.needsAttention?.pendingVerifications?.length || 0,
            activeDrives: summary.kpis.activeDrives || 0,
          });
        }
      } catch {
        // Resilient fallback
      }
    };
    fetchBadges();
    return () => { isMounted = false; };
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div
              onClick={() => navigate('/tpo/dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
                P
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-white">PLACE<span className="text-emerald-400">early</span></span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">TPO</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                  {college?.name || 'Campus Placement Operating System'}
                </p>
              </div>
            </div>
          </div>

          {/* Center: Search / Quick indicator */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students, roll numbers, companies, drives..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    navigate(`/tpo/students?q=${encodeURIComponent(e.target.value.trim())}`);
                  }
                }}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition"
              />
            </div>
          </div>

          {/* Right: Actions, Badges, Profile & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Action Dropdown */}
            <div className="relative">
              <button
                onClick={() => setQuickActionOpen(!quickActionOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">New Action</span>
              </button>

              {quickActionOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setQuickActionOpen(false)}
                >
                  <button
                    onClick={() => navigate('/tpo/drives?action=new')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                    Create Placement Drive
                  </button>
                  <button
                    onClick={() => navigate('/tpo/students?action=import')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Users className="w-4 h-4 text-blue-400" />
                    Import Students (CSV/Excel)
                  </button>
                  <button
                    onClick={() => navigate('/tpo/announcements?action=compose')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Megaphone className="w-4 h-4 text-amber-400" />
                    Broadcast Announcement
                  </button>
                  <button
                    onClick={() => navigate('/tpo/reports')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                    Export Placement Report
                  </button>
                </div>
              )}
            </div>

            {/* Verification Alert Indicator */}
            {badges.pendingVerifications > 0 && (
              <button
                onClick={() => navigate('/tpo/verification')}
                className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-amber-400 border border-amber-500/20"
                title={`${badges.pendingVerifications} students waiting for academic verification`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
                  {badges.pendingVerifications > 9 ? '9+' : badges.pendingVerifications}
                </span>
              </button>
            )}

            {/* Notification Center */}
            <NotificationCenter isDark={true} preferencesLink="/tpo/settings" />

            {/* User Profile & Logout */}
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-xs font-bold text-emerald-400">
                {(user?.firstName?.charAt(0) || 'T').toUpperCase()}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-bold text-white leading-tight">
                  {user?.firstName || 'Placement'} {user?.lastName || 'Officer'}
                </p>
                <p className="text-[10px] text-slate-400">TPO Lead</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition ml-1"
                title="Sign out of TPO Command Center"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex gap-6">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:flex flex-col w-60 flex-shrink-0 sticky top-22 self-start space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Navigation Menu
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition duration-150" />
                  <span>{item.label}</span>
                </div>
                {badgeCount > 0 && (
                  <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {badgeCount}
                  </span>
                )}
              </NavLink>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-800 px-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-slate-300 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Ed25519 Verified Seal
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                All approved academic metrics are cryptographically signed with tamper protection.
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm md:hidden flex"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-72 bg-slate-900 h-full p-4 flex flex-col justify-between border-r border-slate-800 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <span className="font-bold text-white text-sm">TPO Navigation</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-red-950/30 border border-red-800/40 text-red-400 text-xs font-bold"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
