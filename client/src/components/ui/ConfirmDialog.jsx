import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';

/**
 * Enterprise Accessible Dark-First Confirm Dialog Component
 * Supports mandatory reason input, custom action variant, and loading state.
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
  requireReason = false,
  reasonPlaceholder = 'Please enter a justification or reason...',
  loading = false,
}) {
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setReasonError('A valid reason is required to proceed');
      return;
    }
    setReasonError('');
    onConfirm(requireReason ? reason : undefined);
  };

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertCircle className="w-6 h-6 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-amber-400" />;
      default:
        return <HelpCircle className="w-6 h-6 text-emerald-400" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={null}
      showCloseButton={!loading}
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            loading={loading}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-3.5 pt-1">
        <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/80 shrink-0">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-slate-100">{title}</h4>
          {description && (
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
              {description}
            </p>
          )}

          {requireReason && (
            <div className="mt-4">
              <Input
                label="Reason / Audit Note"
                required
                dense
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (reasonError) setReasonError('');
                }}
                error={reasonError}
                placeholder={reasonPlaceholder}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
