import React from 'react';
import { ShieldCheck, ChevronRight, User, GraduationCap, Briefcase } from 'lucide-react';
import { StatusPill } from './StatusPill';
import { Badge } from './Badge';

/**
 * Enterprise Accessible Dark-First Kanban Card Component
 * Ideal for recruitment pipeline round progression, applicant tracking, and drive cards.
 */
export function KanbanCard({
  title, // e.g. Student name or Drive company
  subtitle, // e.g. USN or Role
  department, // e.g. CSE, ECE
  cgpa, // e.g. 9.12
  ctc, // e.g. "18.5 LPA"
  status, // stage or status
  tier, // 'Standard' | 'Core' | 'Dream' | 'Super Dream'
  verified = false,
  avatarUrl,
  tags = [],
  onClick,
  actions,
  className = '',
}) {
  const isClickable = Boolean(onClick);

  const getTierVariant = (t) => {
    switch (t) {
      case 'Super Dream':
        return 'purple';
      case 'Dream':
        return 'info';
      case 'Core':
        return 'primary';
      default:
        return 'neutral';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        group relative p-4 rounded-xl border border-slate-800/80
        bg-slate-900/80 hover:bg-slate-850/90
        shadow-sm hover:shadow-md transition-all duration-150
        flex flex-col gap-3
        ${isClickable ? 'cursor-pointer hover:border-slate-700' : ''}
        ${className}
      `}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300 font-semibold text-xs overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              title ? title.charAt(0).toUpperCase() : <User className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-semibold text-sm text-slate-100 truncate group-hover:text-emerald-300 transition-colors">
                {title}
              </h4>
              {verified && (
                <span title="Cryptographically Verified Student Record">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-400 truncate font-mono">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {status && <StatusPill status={status} size="xs" />}
      </div>

      {/* Details Row */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        {department && (
          <span className="flex items-center gap-1 bg-slate-800/60 px-2 py-0.5 rounded text-slate-300 font-mono">
            <GraduationCap className="w-3 h-3 text-slate-400" />
            {department}
          </span>
        )}

        {cgpa && (
          <span className="bg-slate-800/60 px-2 py-0.5 rounded text-slate-300 font-mono">
            CGPA: <strong className="text-emerald-400">{cgpa}</strong>
          </span>
        )}

        {ctc && (
          <span className="flex items-center gap-1 bg-slate-800/60 px-2 py-0.5 rounded text-slate-300 font-mono">
            <Briefcase className="w-3 h-3 text-slate-400" />
            {ctc}
          </span>
        )}

        {tier && (
          <Badge variant={getTierVariant(tier)} size="xs">
            {tier}
          </Badge>
        )}
      </div>

      {/* Tags row */}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-400 border border-slate-750"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer Actions */}
      {actions && (
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
