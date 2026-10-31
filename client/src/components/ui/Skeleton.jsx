import React from 'react';

/**
 * Enterprise Accessible Dark-First Skeleton Loader Components
 */
export function Skeleton({
  className = '',
  width,
  height,
  circle = false,
  ...props
}) {
  return (
    <div
      className={`
        animate-pulse bg-slate-800/70
        ${circle ? 'rounded-full' : 'rounded-lg'}
        ${className}
      `}
      style={{
        width,
        height,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 w-full ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="14px"
          className={i === lines - 1 ? 'w-3/5' : 'w-full'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={`p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <Skeleton circle width="40px" height="40px" />
        <div className="space-y-1.5 flex-1">
          <Skeleton height="16px" className="w-1/3" />
          <Skeleton height="12px" className="w-1/4" />
        </div>
      </div>
      <SkeletonText lines={2} />
      <div className="flex items-center justify-between pt-2">
        <Skeleton height="24px" className="w-20" />
        <Skeleton height="32px" className="w-24" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }) {
  return (
    <div className={`w-full border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50 ${className}`} aria-hidden="true">
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex gap-4">
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} height="16px" className="flex-1" />
        ))}
      </div>
      <div className="divide-y divide-slate-800/60">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-3 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} height="14px" className="flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
