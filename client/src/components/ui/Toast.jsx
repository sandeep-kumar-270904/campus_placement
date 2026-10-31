import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { createPortal } from 'react-dom';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, message, type = 'info', duration = 4000 }) => {
      const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
      setToasts((prev) => [...prev, { id, title, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if rendered outside provider
    return {
      addToast: (toast) => console.log('Toast:', toast),
      removeToast: () => {},
    };
  }
  return context;
}

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  const content = (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(content, document.body)
    : content;
}

export function ToastItem({ toast, onDismiss, className = '' }) {
  const { title, message, type = 'info' } = toast;

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      border: 'border-emerald-500/40',
      bg: 'bg-slate-900/95',
      iconColor: 'text-emerald-400',
    },
    error: {
      icon: AlertCircle,
      border: 'border-rose-500/40',
      bg: 'bg-slate-900/95',
      iconColor: 'text-rose-400',
    },
    warning: {
      icon: AlertTriangle,
      border: 'border-amber-500/40',
      bg: 'bg-slate-900/95',
      iconColor: 'text-amber-400',
    },
    info: {
      icon: Info,
      border: 'border-sky-500/40',
      bg: 'bg-slate-900/95',
      iconColor: 'text-sky-400',
    },
  }[type] || {
    icon: Info,
    border: 'border-slate-700',
    bg: 'bg-slate-900/95',
    iconColor: 'text-slate-300',
  };

  const Icon = typeConfig.icon;

  return (
    <div
      role="status"
      className={`
        pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl
        backdrop-blur-md animate-slideLeft transition-all duration-150
        ${typeConfig.bg} ${typeConfig.border}
        ${className}
      `}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${typeConfig.iconColor}`} />

      <div className="flex-1 min-w-0">
        {title && <h5 className="text-sm font-semibold text-slate-100">{title}</h5>}
        {message && <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{message}</p>}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
