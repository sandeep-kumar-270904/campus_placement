import React, { useState } from 'react';
import { BarChart3, WifiOff, Eye } from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';

/**
 * AdaptiveChart: Renders lightweight tabular view on slow connections / low-bandwidth mode
 * instead of rendering heavy Recharts DOM elements.
 */
export default function AdaptiveChart({
  children,
  fallbackData = [],
  dataKeys = [],
  title = 'Data Overview',
  height = '300px',
}) {
  const { isLowBandwidth } = useNetwork();
  const [forceShowChart, setForceShowChart] = useState(false);

  if (isLowBandwidth && !forceShowChart) {
    return (
      <div
        role="region"
        aria-label={`${title} (Lightweight Data Mode)`}
        className="w-full rounded-xl bg-slate-900/60 border border-slate-800 p-4 flex flex-col gap-3"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-500/20 text-amber-400">
              <WifiOff className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-semibold text-slate-300">
              Low-Bandwidth Mode Active: Showing Tabular Summary
            </span>
          </div>
          <button
            onClick={() => setForceShowChart(true)}
            type="button"
            className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            aria-label="Load interactive chart anyway"
          >
            <Eye className="w-3 h-3" />
            Load Chart
          </button>
        </div>

        {fallbackData && fallbackData.length > 0 ? (
          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-800/50">
                <tr>
                  {Object.keys(fallbackData[0]).map((key) => (
                    <th key={key} className="px-3 py-2 font-semibold">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {fallbackData.slice(0, 10).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    {Object.values(row).map((val, cIdx) => (
                      <td key={cIdx} className="px-3 py-1.5">
                        {String(val ?? '-')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-500">
            Chart data deferred to save bandwidth.
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: height }} className="w-full">
      {children}
    </div>
  );
}
