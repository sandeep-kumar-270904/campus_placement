import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  Search,
  Building2,
  Users,
  Briefcase,
  FileText,
  Sliders,
  Sparkles,
  BookOpen,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  ExternalLink,
} from 'lucide-react';

/**
 * Enterprise Accessible Dark-First Command Palette (Ctrl+K)
 * Fast keyboard-first navigation for TPO, Students, and Recruiters across drives, pages, and actions.
 */
export function CommandPalette({ isOpen: controlledIsOpen, onClose: controlledOnClose }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalOpen;

  const handleClose = () => {
    if (isControlled && controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalOpen(false);
    }
    setQuery('');
    setSelectedIndex(0);
  };

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isControlled && controlledOnClose) {
          controlledIsOpen ? controlledOnClose() : controlledOnClose(true);
        } else {
          setInternalOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isControlled, controlledIsOpen, controlledOnClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const navigationItems = [
    // --- TPO Views & Tools ---
    { id: 'tpo-dash', title: 'TPO Dashboard', category: 'TPO Management', path: '/tpo', icon: BarChart3 },
    { id: 'tpo-drives', title: 'Drives & Openings', category: 'TPO Management', path: '/tpo/drives', icon: Briefcase },
    { id: 'tpo-students', title: 'Student Directory & Verification', category: 'TPO Management', path: '/tpo/students', icon: Users },
    { id: 'tpo-policies', title: 'Placement Policy Engine', category: 'TPO Management', path: '/tpo/settings/policies', icon: Sliders },
    { id: 'tpo-reports', title: 'NAAC / NIRF / NBA Reporting', category: 'TPO Management', path: '/tpo/reports', icon: FileText },
    { id: 'tpo-fairness', title: 'Fairness & Equal Opportunity Report', category: 'TPO Management', path: '/tpo/settings/policies#fairness', icon: ShieldCheck },
    
    // --- Student Views ---
    { id: 'student-dash', title: 'Student Dashboard', category: 'Student Hub', path: '/student', icon: GraduationCap },
    { id: 'company-careers', title: 'Top MNC & PBC Career Portals (Google, Amazon, Flipkart, Cred, Walmart)', category: 'Career Hub', path: '/career-pages', icon: Building2 },
    { id: 'student-opps', title: 'Opportunity Hub & Drives', category: 'Student Hub', path: '/student/opportunities', icon: Briefcase },
    { id: 'student-apps', title: 'My Applications & Offers', category: 'Student Hub', path: '/student/applications', icon: FileText },
    { id: 'student-resources', title: 'Preparation Resources (55+ Platforms)', category: 'Student Hub', path: '/student/resources', icon: BookOpen },
    { id: 'student-alumni', title: 'Alumni Network & Referrals', category: 'Student Hub', path: '/student/alumni', icon: Users },
    { id: 'student-experiences', title: 'Interview Experience Library', category: 'Student Hub', path: '/student/interview-experiences', icon: Sparkles },
    { id: 'student-profile', title: 'Academic Profile & Hashing', category: 'Student Hub', path: '/student/profile', icon: Users },

    // --- Recruiter Views ---
    { id: 'recruiter-dash', title: 'Recruiter Dashboard', category: 'Recruitment', path: '/recruiter', icon: Building2 },
    { id: 'recruiter-drives', title: 'Manage Campus Drives', category: 'Recruitment', path: '/recruiter/drives', icon: Briefcase },

    // --- System & Styleguide ---
    { id: 'styleguide', title: 'Design System & Component Styleguide', category: 'System', path: '/styleguide', icon: Sparkles },
  ];

  const filteredItems = navigationItems.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.path.toLowerCase().includes(q)
    );
  });

  const handleSelect = (item) => {
    handleClose();
    if (item.path) {
      navigate(item.path);
    }
  };

  const handleKeyDownInDialog = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Floating Search Container */}
      <div
        onKeyDown={handleKeyDownInDialog}
        className="relative w-full max-w-xl rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl overflow-hidden flex flex-col animate-scaleUp z-10"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3 bg-slate-900/90">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a page, tool, student, or policy..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700 shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No results found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`
                    flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors
                    ${
                      isSelected
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-[11px] text-slate-500">{item.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 shrink-0">
                    <span className="text-[11px] font-mono hidden sm:inline">{item.path}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800 bg-slate-900/60 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-slate-800 px-1 py-0.5 rounded border border-slate-700">↑↓</kbd> to navigate
            </span>
            <span>
              <kbd className="font-mono bg-slate-800 px-1 py-0.5 rounded border border-slate-700">↵</kbd> to select
            </span>
          </div>
          <span className="font-mono text-emerald-400">Ctrl+K</span>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
}
