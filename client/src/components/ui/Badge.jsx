import React from 'react';

/**
 * Enterprise Accessible Dark-First Badge Component
 */
export function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  dotColor,
  icon: Icon = null,
  className = '',
  ...props
}) {
  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-1',
    sm: 'px-2 py-0.5 text-xs gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1 text-sm gap-2',
  };

  const variantStyles = {
    neutral: 'bg-slate-800/80 text-slate-300 border-slate-700/80',
    primary: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    info: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    fuchsia: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30',
    outline: 'bg-transparent text-slate-300 border-slate-700',
  };

  const dotDefaultColors = {
    neutral: 'bg-slate-400',
    primary: 'bg-emerald-400',
    info: 'bg-sky-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    purple: 'bg-purple-400',
    indigo: 'bg-indigo-400',
    fuchsia: 'bg-fuchsia-400',
    outline: 'bg-slate-400',
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${sizeStyles[size] || sizeStyles.sm}
        ${variantStyles[variant] || variantStyles.neutral}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            dotColor || dotDefaultColors[variant] || 'bg-current'
          }`}
        />
      )}
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
