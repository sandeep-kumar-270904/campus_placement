import React, { forwardRef } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

/**
 * Enterprise Accessible Dark-First Select Component
 * Supports options array or children, dense mode, and error states.
 */
export const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    icon: Icon = null,
    dense = false,
    options = [],
    children,
    disabled = false,
    required = false,
    className = '',
    containerClassName = '',
    id,
    value,
    onChange,
    placeholder = 'Select an option...',
    ...props
  },
  ref
) {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  const densityStyles = dense
    ? 'h-8 px-2.5 py-1 text-xs rounded-md'
    : 'h-10 px-3.5 py-2 text-sm rounded-lg';

  const hasLeadingIcon = Boolean(Icon);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className={`font-medium text-slate-300 flex items-center justify-between ${
            dense ? 'text-xs' : 'text-sm'
          }`}
        >
          <span>
            {label}
            {required && <span className="text-rose-400 ml-1 font-bold">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center w-full">
        {hasLeadingIcon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-slate-400">
            <Icon className={dense ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          </div>
        )}

        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          value={value}
          onChange={onChange}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          className={`
            w-full transition-all duration-150 font-normal appearance-none cursor-pointer
            bg-slate-900/90 hover:bg-slate-900 text-slate-100
            border ${
              error
                ? 'border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40'
                : 'border-slate-700/80 hover:border-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40'
            }
            focus:outline-none
            disabled:opacity-50 disabled:bg-slate-950 disabled:cursor-not-allowed
            pr-9
            ${densityStyles}
            ${hasLeadingIcon ? (dense ? 'pl-8' : 'pl-9') : ''}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="bg-slate-900 text-slate-500">
              {placeholder}
            </option>
          )}

          {options && options.length > 0
            ? options.map((opt) => {
                if (typeof opt === 'string') {
                  return (
                    <option key={opt} value={opt} className="bg-slate-900 text-slate-100 py-1">
                      {opt}
                    </option>
                  );
                }
                return (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    className="bg-slate-900 text-slate-100 py-1"
                  >
                    {opt.label || opt.value}
                  </option>
                );
              })
            : children}
        </select>

        {/* Dropdown chevron */}
        <div className="absolute right-3 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className={dense ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        </div>
      </div>

      {error ? (
        <p id={`${selectId}-error`} className="text-xs text-rose-400 flex items-center gap-1 mt-0.5 animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p id={`${selectId}-helper`} className="text-xs text-slate-400 mt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});
