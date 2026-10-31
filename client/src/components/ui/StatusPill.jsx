import React from 'react';
import { getStatusConfig } from '../../utils/statusStyles';

/**
 * Enterprise Accessible Dark-First StatusPill Component
 * Automatically resolves canonical styling, border, dot color, and label based on status.
 */
export function StatusPill({
  status = 'Draft',
  label,
  size = 'sm',
  showDot = true,
  pulse = false,
  className = '',
  ...props
}) {
  const config = getStatusConfig(status);
  const displayLabel = label || config.label || status;

  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-1',
    sm: 'px-2 py-0.5 text-xs gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-2',
    lg: 'px-3 py-1 text-sm gap-2',
  };

  const isLive = pulse || status === 'In Progress' || status === 'Interview Scheduled' || status === 'Open';

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border transition-colors
        ${config.bg} ${config.text} ${config.border}
        ${sizeStyles[size] || sizeStyles.sm}
        ${className}
      `}
      title={displayLabel}
      {...props}
    >
      {showDot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {isLive && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                config.dot || 'bg-current'
              }`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dot || 'bg-current'}`} />
        </span>
      )}
      <span className="truncate">{displayLabel}</span>
    </span>
  );
}
