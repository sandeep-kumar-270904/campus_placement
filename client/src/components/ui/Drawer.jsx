import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

/**
 * Enterprise Accessible Dark-First Drawer Component
 * Slides in from the edge (default right) with backdrop blur and keyboard escape dismiss.
 */
export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  side = 'right', // 'right' | 'left'
  width = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop = true,
  className = '',
}) {
  const drawerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  const sideAnimation =
    side === 'left' ? 'left-0 animate-slideRight' : 'right-0 animate-slideLeft';

  const drawerContent = (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'drawer-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Drawer Panel */}
      <div className={`fixed inset-y-0 ${sideAnimation} flex w-full max-w-full pointer-events-none`}>
        <div
          ref={drawerRef}
          className={`
            w-screen pointer-events-auto flex flex-col h-full
            bg-slate-900 border-l border-slate-800 shadow-2xl
            ${widthStyles[width] || widthStyles.md}
            ${className}
          `}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-slate-800 bg-slate-900/80 shrink-0">
            <div>
              {title && (
                <h3 id="drawer-title" className="text-lg font-semibold text-slate-100">
                  {title}
                </h3>
              )}
              {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-slate-200 space-y-4">
            {children}
          </div>

          {/* Optional Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 p-4 sm:px-6 border-t border-slate-800 bg-slate-900/60 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(drawerContent, document.body)
    : drawerContent;
}
