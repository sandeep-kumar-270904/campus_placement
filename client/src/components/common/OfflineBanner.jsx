import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';
import { useTranslation } from '../../context/I18nContext';

export default function OfflineBanner() {
  const { isOnline } = useNetwork();
  const { t } = useTranslation();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-50 w-full bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md transition-all duration-300 animate-in slide-in-from-top"
    >
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0 text-slate-950" />
          <span>
            {t(
              'common.offlineNotice',
              'You are currently offline. Cached data is available; actions will sync when reconnected.'
            )}
          </span>
        </div>
        <button
          onClick={() => window.location.reload()}
          type="button"
          className="px-2.5 py-1 rounded bg-slate-950 text-white text-[11px] font-bold flex items-center gap-1 hover:bg-slate-900 transition cursor-pointer"
          aria-label="Retry network connection"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      </div>
    </div>
  );
}
