import React from 'react';

export function SkeletonLoader({ className = '', ...props }) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={`animate-pulse bg-slate-800/60 rounded-lg ${className}`}
      {...props}
    />
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3 animate-pulse ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-slate-800" />
        <div className="w-16 h-5 rounded-full bg-slate-800" />
      </div>
      <div className="w-3/4 h-5 rounded bg-slate-800 mt-2" />
      <div className="w-1/2 h-4 rounded bg-slate-800/80" />
      <div className="w-full h-10 rounded-xl bg-slate-800 mt-3" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5, className = '' }) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={`w-full rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden animate-pulse ${className}`}
    >
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="w-36 h-5 rounded bg-slate-800" />
        <div className="w-24 h-8 rounded-lg bg-slate-800" />
      </div>
      <div className="p-4 flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center gap-4 py-2 border-b border-slate-800/40">
            {Array.from({ length: cols }).map((__, cIdx) => (
              <div
                key={cIdx}
                className="h-4 rounded bg-slate-800"
                style={{ width: `${Math.max(15, 100 / cols - 4)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonKpi({ count = 4, className = '' }) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${count} gap-4 animate-pulse ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="w-24 h-3.5 rounded bg-slate-800" />
            <div className="w-7 h-7 rounded-lg bg-slate-800" />
          </div>
          <div className="w-20 h-7 rounded bg-slate-800 mt-1" />
          <div className="w-32 h-3 rounded bg-slate-800/60 mt-1" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeletonLoader() {
  return (
    <div className="min-h-[70vh] p-6 max-w-7xl mx-auto flex flex-col gap-6 animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="w-48 h-7 rounded bg-slate-800" />
        <div className="w-80 h-4 rounded bg-slate-800/60" />
      </div>
      <SkeletonKpi count={4} />
      <SkeletonTable rows={6} cols={5} />
    </div>
  );
}

export default SkeletonLoader;
