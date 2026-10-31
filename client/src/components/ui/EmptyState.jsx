import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

/**
 * Enterprise Accessible Dark-First Empty State Component
 */
export function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no records to display matching your criteria.',
  actionLabel,
  onAction,
  actionIcon,
  secondaryActionLabel,
  onSecondaryAction,
  compact = false,
  className = '',
  children,
}) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center
        border border-dashed border-slate-800 rounded-2xl
        bg-slate-900/30 backdrop-blur-xs
        ${compact ? 'py-8 px-4' : 'py-14 px-6'}
        ${className}
      `}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>

      <h4 className="text-base font-semibold text-slate-200 mb-1 max-w-md">
        {title}
      </h4>

      {description && (
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mb-5">
          {description}
        </p>
      )}

      {children}

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actionLabel && (
            <Button
              variant="primary"
              size={compact ? 'sm' : 'md'}
              icon={actionIcon}
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          )}

          {secondaryActionLabel && (
            <Button
              variant="outline"
              size={compact ? 'sm' : 'md'}
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
