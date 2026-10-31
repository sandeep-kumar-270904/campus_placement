import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, X, AlertCircle } from 'lucide-react';

/**
 * Enterprise Accessible Dark-First Input Component
 * Supports dense mode, icons, clear button, password visibility toggle, and error states.
 */
export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon = null,
    iconRight: IconRight = null,
    clearable = false,
    onClear,
    dense = false,
    type = 'text',
    disabled = false,
    required = false,
    className = '',
    containerClassName = '',
    id,
    value,
    onChange,
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const densityStyles = dense
    ? 'h-8 px-2.5 py-1 text-xs rounded-md'
    : 'h-10 px-3.5 py-2 text-sm rounded-lg';

  const hasLeadingIcon = Boolean(Icon);
  const hasTrailingIcon = Boolean(IconRight) || isPassword || (clearable && value);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
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

        <input
          ref={ref}
          id={inputId}
          type={effectiveType}
          disabled={disabled}
          required={required}
          value={value}
          onChange={onChange}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={`
            w-full transition-all duration-150 font-normal
            bg-slate-900/90 hover:bg-slate-900 text-slate-100 placeholder-slate-500
            border ${
              error
                ? 'border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40'
                : 'border-slate-700/80 hover:border-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40'
            }
            focus:outline-none
            disabled:opacity-50 disabled:bg-slate-950 disabled:cursor-not-allowed
            ${densityStyles}
            ${hasLeadingIcon ? (dense ? 'pl-8' : 'pl-9') : ''}
            ${hasTrailingIcon ? (dense ? 'pr-8' : 'pr-10') : ''}
            ${className}
          `}
          {...props}
        />

        {/* Trailing action icons */}
        <div className="absolute right-2.5 flex items-center gap-1">
          {clearable && value && !disabled && (
            <button
              type="button"
              onClick={onClear}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Clear input"
            >
              <X className={dense ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
            </button>
          )}

          {isPassword && !disabled && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className={dense ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
              ) : (
                <Eye className={dense ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
              )}
            </button>
          )}

          {!isPassword && IconRight && (
            <span className="text-slate-400 pointer-events-none">
              <IconRight className={dense ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
            </span>
          )}
        </div>
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-rose-400 flex items-center gap-1 mt-0.5 animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="text-xs text-slate-400 mt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});
