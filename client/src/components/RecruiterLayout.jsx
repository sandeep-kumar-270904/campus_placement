import React, { useContext, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  Briefcase,
  Users,
  Calendar,
  FileEdit,
  TrendingUp,
  LogOut,
  Building2,
  Shield,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export default function RecruiterLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { driveId } = useParams();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      path: '/recruiter/drives',
      label: 'Company Drives',
      icon: Briefcase,
      description: 'Active & upcoming campus drives',
    },
    ...(driveId
      ? [
          {
            path: `/recruiter/drives/${driveId}/candidates`,
            label: 'Candidate Roster',
            icon: Users,
            description: 'Ranked applicants & shortlists',
          },
          {
            path: `/recruiter/drives/${driveId}/schedule`,
            label: 'Slot Booking',
            icon: Calendar,
            description: 'Panels & auto-allocation',
          },
          {
            path: `/recruiter/drives/${driveId}/jd-editor`,
            label: 'JD & Criteria',
            icon: FileEdit,
            description: 'Propose updates for TPO approval',
          },
          {
            path: `/recruiter/drives/${driveId}/funnel`,
            label: 'Funnel & Analytics',
            icon: TrendingUp,
            description: 'Conversion rates & pipeline yield',
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Top Corporate Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Corporate Tag */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/recruiter/drives')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                P
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  PLACEearly
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Recruiter
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 block -mt-0.5 font-medium">
                  Corporate Talent Portal
                </span>
              </div>
            </button>

            {/* Recruiter's Scoped Company Pill */}
            {user?.companyName && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-semibold text-slate-200">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{user.companyName}</span>
              </div>
            )}
          </div>

          {/* User Controls & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-white">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[11px] text-slate-400">{user?.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Secondary Subnav for Active Drive or Navigation */}
        <div className="bg-slate-900/60 border-t border-slate-800/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto py-2 gap-2">
            <nav className="flex items-center gap-1">
              <NavLink
                to="/recruiter/drives"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>My Drives</span>
              </NavLink>

              {driveId && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <NavLink
                    to={`/recruiter/drives/${driveId}/candidates`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`
                    }
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Candidate Shortlist</span>
                  </NavLink>

                  <NavLink
                    to={`/recruiter/drives/${driveId}/schedule`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`
                    }
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Slots & Panels</span>
                  </NavLink>

                  <NavLink
                    to={`/recruiter/drives/${driveId}/jd-editor`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`
                    }
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>JD & Criteria</span>
                  </NavLink>

                  <NavLink
                    to={`/recruiter/drives/${driveId}/funnel`}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`
                    }
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Funnel Yield</span>
                  </NavLink>
                </>
              )}
            </nav>

            <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-500">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cryptographic Seal Verification Active</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-900/40 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 PLACEearly Recruitment OS. Corporate Recruiter Portal.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400">Strict Data Isolation Enforced</span>
            <span>•</span>
            <span className="text-slate-400">Audited Candidate Access</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
