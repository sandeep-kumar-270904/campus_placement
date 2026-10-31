import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * useFocusTrap: WCAG 2.1 AA Focus Management Hook for Modals and Drawers
 * Traps Tab and Shift+Tab cycles, handles Escape to close, and restores focus upon exit.
 */
export function useFocusTrap({ isOpen, onClose }) {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save element that had focus before opening modal
    previousFocusRef.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return;

    // Focus the first focusable element inside the modal
    const focusableElements = container.querySelectorAll(FOCUSABLE_SELECTOR);
    if (focusableElements.length > 0) {
      setTimeout(() => {
        focusableElements[0].focus();
      }, 50);
    }

    const handleKeyDown = (e) => {
      // Escape key closes modal
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }

      // Tab trap
      if (e.key === 'Tab') {
        const elements = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
        if (elements.length === 0) return;

        const first = elements[0];
        const last = elements[elements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab: if on first element, wrap around to last
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          // Tab: if on last element, wrap around to first
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to original element
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  return containerRef;
}
