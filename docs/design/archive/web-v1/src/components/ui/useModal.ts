import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Open modals, oldest first. Only the last one answers Escape and Tab, so a palette opened over a drawer closes alone. */
const stack: symbol[] = [];

/**
 * Behaviour shared by Drawer and CommandPalette while they are mounted: focus moves to `initialFocus` and returns to
 * whatever had it before (the trigger) on unmount, Tab stays inside `container`, Escape calls `onClose`, and the page
 * behind does not scroll.
 */
export function useModal(container: RefObject<HTMLElement | null>, initialFocus: RefObject<HTMLElement | null>, onClose: () => void) {
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const id = Symbol('modal');
    stack.push(id);
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const scroll = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    initialFocus.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== id) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab' || !container.current) return;
      const items = [...container.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (!container.current.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      stack.splice(stack.indexOf(id), 1);
      document.body.style.overflow = scroll;
      if (opener?.isConnected) opener.focus();
    };
  }, [container, initialFocus]);
}
