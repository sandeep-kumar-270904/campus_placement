import React from 'react';

/**
 * Enterprise Accessible Dark-First Tabs Component
 * Supports 'pills' and 'underline' variants with optional count badges.
 */
export function Tabs({
  tabs = [], // [{ id, label, icon: Icon, badge: count/text, disabled }]
  activeTab,
  onChange,
  variant = 'pills', // 'pills' | 'underline'
  size = 'md', // 'sm' | 'md'
  className = '',
}) {
  const isPills = variant === 'pills';

  return (
    <div
      role="tablist"
      className={`
        flex items-center overflow-x-auto scrollbar-none
        ${
          isPills
            ? 'p-1 bg-slate-900/90 border border-slate-800 rounded-xl gap-1'
            : 'border-b border-slate-800 gap-6'
        }
        ${className}
      `}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        if (isPills) {
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onChange(tab.id)}
              className={`
                flex items-center justify-center font-medium rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap
                ${size === 'sm' ? 'px-3 py-1 text-xs gap-1.5' : 'px-4 py-2 text-sm gap-2'}
                ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }
                ${tab.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
              `}
            >
              {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge !== null && (
                <span
                  className={`
                    px-1.5 py-0.2 rounded-full text-[10px] font-semibold
                    ${
                      isActive
                        ? 'bg-emerald-700/80 text-emerald-100'
                        : 'bg-slate-800 text-slate-300'
                    }
                  `}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        }

        // Underline variant
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={`
              relative flex items-center font-medium pb-3 transition-colors cursor-pointer whitespace-nowrap
              ${size === 'sm' ? 'text-xs gap-1.5' : 'text-sm gap-2'}
              ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }
              ${tab.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
            `}
          >
            {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge !== null && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {tab.badge}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
