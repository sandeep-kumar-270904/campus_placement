/**
 * Unified Status & Stage Styling Configuration
 * Ensures consistent colors, borders, badges, and icon hints across the entire application.
 */

export const STATUS_CONFIGS = {
  // --- Recruitment Drive Stages ---
  Open: {
    label: 'Open for Applications',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-400 dark:text-emerald-300',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    type: 'success',
  },
  'In Progress': {
    label: 'Rounds in Progress',
    bg: 'bg-sky-500/10 dark:bg-sky-500/15',
    text: 'text-sky-400 dark:text-sky-300',
    border: 'border-sky-500/30',
    dot: 'bg-sky-400',
    badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    type: 'info',
  },
  Completed: {
    label: 'Drive Completed',
    bg: 'bg-purple-500/10 dark:bg-purple-500/15',
    text: 'text-purple-400 dark:text-purple-300',
    border: 'border-purple-500/30',
    dot: 'bg-purple-400',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    type: 'purple',
  },
  Closed: {
    label: 'Applications Closed',
    bg: 'bg-slate-500/10 dark:bg-slate-500/15',
    text: 'text-slate-400 dark:text-slate-300',
    border: 'border-slate-500/30',
    dot: 'bg-slate-400',
    badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    type: 'neutral',
  },
  Draft: {
    label: 'Draft',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-400 dark:text-amber-300',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    type: 'warning',
  },

  // --- Student Application Stages ---
  Applied: {
    label: 'Applied',
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    text: 'text-blue-400 dark:text-blue-300',
    border: 'border-blue-500/30',
    dot: 'bg-blue-400',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    type: 'info',
  },
  'In Review': {
    label: 'In Review',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-400 dark:text-amber-300',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    type: 'warning',
  },
  Shortlisted: {
    label: 'Shortlisted',
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    text: 'text-indigo-400 dark:text-indigo-300',
    border: 'border-indigo-500/30',
    dot: 'bg-indigo-400',
    badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    type: 'indigo',
  },
  'Online Assessment': {
    label: 'Assessment',
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
    text: 'text-cyan-400 dark:text-cyan-300',
    border: 'border-cyan-500/30',
    dot: 'bg-cyan-400',
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    type: 'info',
  },
  'Technical Round': {
    label: 'Technical Interview',
    bg: 'bg-violet-500/10 dark:bg-violet-500/15',
    text: 'text-violet-400 dark:text-violet-300',
    border: 'border-violet-500/30',
    dot: 'bg-violet-400',
    badgeClass: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    type: 'purple',
  },
  'HR Round': {
    label: 'HR Round',
    bg: 'bg-fuchsia-500/10 dark:bg-fuchsia-500/15',
    text: 'text-fuchsia-400 dark:text-fuchsia-300',
    border: 'border-fuchsia-500/30',
    dot: 'bg-fuchsia-400',
    badgeClass: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30',
    type: 'purple',
  },
  'Offer Proposed': {
    label: 'Offer Proposed (TPO Review)',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-400 dark:text-amber-300',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    type: 'warning',
  },
  'Offer Extended': {
    label: 'Offer Extended',
    bg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
    text: 'text-emerald-300 dark:text-emerald-200',
    border: 'border-emerald-500/40',
    dot: 'bg-emerald-400 animate-pulse',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 font-semibold',
    type: 'success',
  },
  Placed: {
    label: 'Placed & Accepted',
    bg: 'bg-emerald-500/20 dark:bg-emerald-500/25',
    text: 'text-emerald-300 dark:text-emerald-200',
    border: 'border-emerald-500/50',
    dot: 'bg-emerald-400',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold shadow-sm',
    type: 'success',
  },
  Hired: {
    label: 'Hired',
    bg: 'bg-emerald-500/20 dark:bg-emerald-500/25',
    text: 'text-emerald-300 dark:text-emerald-200',
    border: 'border-emerald-500/50',
    dot: 'bg-emerald-400',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold',
    type: 'success',
  },
  Hold: {
    label: 'On Hold',
    bg: 'bg-orange-500/10 dark:bg-orange-500/15',
    text: 'text-orange-400 dark:text-orange-300',
    border: 'border-orange-500/30',
    dot: 'bg-orange-400',
    badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    type: 'warning',
  },
  Rejected: {
    label: 'Not Selected',
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-400 dark:text-rose-300',
    border: 'border-rose-500/30',
    dot: 'bg-rose-400',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    type: 'danger',
  },

  // --- Verification States ---
  Verified: {
    label: 'Verified Academic Seal',
    bg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
    text: 'text-emerald-400 dark:text-emerald-300',
    border: 'border-emerald-500/40',
    dot: 'bg-emerald-400',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
    type: 'success',
  },
  Approved: {
    label: 'Approved',
    bg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
    text: 'text-emerald-400 dark:text-emerald-300',
    border: 'border-emerald-500/40',
    dot: 'bg-emerald-400',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
    type: 'success',
  },
  Pending: {
    label: 'Pending Verification',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-400 dark:text-amber-300',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    type: 'warning',
  },
  'Needs re-verification': {
    label: 'Needs Re-verification (Tampered / Edited)',
    bg: 'bg-rose-500/15 dark:bg-rose-500/20',
    text: 'text-rose-400 dark:text-rose-300',
    border: 'border-rose-500/40',
    dot: 'bg-rose-400 animate-ping',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/40 font-semibold',
    type: 'danger',
  },

  // --- Opportunity Tiers ---
  Standard: {
    label: 'Standard Tier (<6 LPA)',
    bg: 'bg-slate-500/10 dark:bg-slate-500/20',
    text: 'text-slate-300',
    border: 'border-slate-500/30',
    dot: 'bg-slate-400',
    badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
  },
  Core: {
    label: 'Core Tier (6-10 LPA)',
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-400 dark:text-blue-300',
    border: 'border-blue-500/30',
    dot: 'bg-blue-400',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  },
  Dream: {
    label: 'Dream Tier (10-20 LPA)',
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-400 dark:text-purple-300',
    border: 'border-purple-500/30',
    dot: 'bg-purple-400',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  },
  'Super Dream': {
    label: 'Super Dream Tier (>=20 LPA)',
    bg: 'bg-amber-500/15 dark:bg-amber-500/25',
    text: 'text-amber-300 dark:text-amber-200',
    border: 'border-amber-500/40',
    dot: 'bg-amber-400',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/40 font-bold',
  },
};

export function getStatusConfig(status) {
  if (!status) {
    return {
      label: 'Unknown',
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      border: 'border-slate-500/30',
      dot: 'bg-slate-400',
      badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    };
  }

  // Exact match
  if (STATUS_CONFIGS[status]) {
    return STATUS_CONFIGS[status];
  }

  // Case-insensitive match
  const lower = status.toLowerCase();
  for (const [key, config] of Object.entries(STATUS_CONFIGS)) {
    if (key.toLowerCase() === lower) {
      return config;
    }
  }

  // Default fallback
  return {
    label: status,
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
    dot: 'bg-slate-400',
    badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  };
}
