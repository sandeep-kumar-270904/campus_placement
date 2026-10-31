import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Enterprise Accessible Dark-First Button Component
 */
export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon: Icon = null,
    iconRight: IconRight = null,
    className = '',
    type = 'button',
    ...props
  },
  ref
) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50';

  const sizeStyles = {
    xs: 'px-2 py-1 text-xs gap-1.5 h-7',
    sm: 'px-3 py-1.5 text-xs gap-1.5 h-8',
    md: 'px-4 py-2 text-sm gap-2 h-10',
    lg: 'px-6 py-2.5 text-base gap-2.5 h-12',
    icon: 'p-2 h-10 w-10 flex items-center justify-center',
  };

  const variantStyles = {
    primary:
      'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm hover:shadow-emerald-500/20 active:bg-emerald-700',
    secondary:
      'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-slate-600 shadow-sm active:bg-slate-850',
    outline:
      'bg-transparent hover:bg-slate-800/60 text-slate-200 border border-slate-700 hover:border-slate-500 active:bg-slate-800',
    ghost:
      'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white active:bg-slate-800',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-sm hover:shadow-rose-500/20 active:bg-rose-700',
    success:
      'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 active:bg-emerald-500/40',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />}
      {!loading && Icon && <Icon className="w-4 h-4 shrink-0 text-current" />}
      <span>{children}</span>
      {!loading && IconRight && <IconRight className="w-4 h-4 shrink-0 text-current" />}
    </button>
  );
});

export default Button;
