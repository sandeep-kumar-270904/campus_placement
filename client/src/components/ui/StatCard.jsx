import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Enterprise Accessible Dark-First Stat Card Component
 * Highlights key performance metrics, trends, and contextual sub-metrics.
 */
export function StatCard({
  title,
  value,
  trend, // { value: '+12%', isPositive: true/false, neutral: false, label: 'vs last month' }
  icon: Icon = null,
  iconColor = 'text-emerald-400',
  iconBg = 'bg-emerald-500/10 border-emerald-500/20',
  subtext,
  onClick,
  className = '',
}) {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`
        relative p-5 rounded-2xl border border-slate-800/80
        bg-slate-900/60 backdrop-blur-sm shadow-sm
        transition-all duration-200
        ${isClickable ? 'cursor-pointer hover:border-slate-700 hover:bg-slate-850/60 active:scale-[0.99]' : ''}
        ${className}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            {value}
          </h3>
        </div>

        {Icon && (
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${iconBg} ${iconColor}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(trend || subtext) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {trend && (
            <span
              className={`
                inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full
                ${
                  trend.neutral
                    ? 'bg-slate-800 text-slate-400'
                    : trend.isPositive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                }
              `}
            >
              {trend.neutral ? (
                <Minus className="w-3 h-3" />
              ) : trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{trend.value}</span>
            </span>
          )}

          {trend?.label && <span className="text-slate-400">{trend.label}</span>}
          {subtext && !trend && <span className="text-slate-400">{subtext}</span>}
        </div>
      )}
    </div>
  );
}
