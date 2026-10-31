import React from 'react';
import { Check } from 'lucide-react';

/**
 * Enterprise Accessible Dark-First Stepper Component
 * Ideal for multi-stage drive creation, student registration, and offer accept flows.
 */
export function Stepper({
  steps = [], // [{ id, label, description }]
  currentStep = 0, // 0-indexed or matching step id
  onStepClick,
  className = '',
}) {
  return (
    <nav aria-label="Progress" className={`w-full ${className}`}>
      <ol className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const stepIndex = typeof currentStep === 'number' ? index : steps.findIndex((s) => s.id === currentStep);
          const activeIndex = typeof currentStep === 'number' ? currentStep : stepIndex;

          const isCompleted = index < activeIndex;
          const isCurrent = index === activeIndex;
          const isUpcoming = index > activeIndex;

          return (
            <li
              key={step.id || index}
              className={`relative flex-1 ${
                index !== steps.length - 1 ? 'pr-4 sm:pr-8' : ''
              }`}
            >
              <div className="flex items-center">
                {/* Step Circle */}
                <button
                  type="button"
                  disabled={!onStepClick || isUpcoming}
                  onClick={() => onStepClick && onStepClick(index)}
                  className={`
                    w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm
                    transition-all duration-200 shrink-0
                    ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                        : isCurrent
                        ? 'bg-slate-900 border-2 border-emerald-500 text-emerald-400 ring-4 ring-emerald-500/15'
                        : 'bg-slate-900 border border-slate-700 text-slate-500'
                    }
                    ${onStepClick && !isUpcoming ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                  `}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </button>

                {/* Connecting Line */}
                {index !== steps.length - 1 && (
                  <div
                    className={`
                      ml-2 sm:ml-4 flex-1 h-0.5 rounded transition-colors duration-200
                      ${isCompleted ? 'bg-emerald-600' : 'bg-slate-800'}
                    `}
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Step Label */}
              <div className="mt-2 min-w-0">
                <span
                  className={`
                    block text-xs font-semibold truncate
                    ${isCurrent ? 'text-emerald-400' : isCompleted ? 'text-slate-200' : 'text-slate-500'}
                  `}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="hidden sm:block text-[11px] text-slate-500 truncate mt-0.5">
                    {step.description}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
