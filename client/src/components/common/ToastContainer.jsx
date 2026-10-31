import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ICONS = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
  error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
  info: <Info className="w-4 h-4 text-cyan-400 shrink-0" />,
};

const BORDERS = {
  success: 'border-emerald-500/30 bg-slate-900/95 text-slate-100 shadow-emerald-950/40',
  error: 'border-rose-500/30 bg-slate-900/95 text-slate-100 shadow-rose-950/40',
  warning: 'border-amber-500/30 bg-slate-900/95 text-slate-100 shadow-amber-950/40',
  info: 'border-cyan-500/30 bg-slate-900/95 text-slate-100 shadow-cyan-950/40',
};

export default function ToastContainer({ toasts = [], onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          className={`pointer-events-auto p-3 rounded-xl border shadow-xl flex items-start gap-2.5 backdrop-blur-md animate-in slide-in-from-top-2 fade-in duration-200 ${
            BORDERS[toast.type] || BORDERS.info
          }`}
        >
          {ICONS[toast.type] || ICONS.info}
          <div className="flex-1 text-xs leading-relaxed font-medium pt-0.5">
            {toast.message}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white p-0.5 rounded transition cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
