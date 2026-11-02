import { useCallback, useRef, useState, type ReactNode } from 'react';
import { ToastContext } from './toastContext';
import './Toast.css';

const VISIBLE_MS = 3000;
/** Matches the fade-out in motion.css (--dur-base). */
const LEAVE_MS = 200;

interface Toast {
  id: number;
  message: string;
  leaving: boolean;
}

/**
 * Stack of short confirmations (e.g. after verifying a report), top right. Each slides down, stays 3 seconds, fades out,
 * and can be closed with a click. The region is a polite live region, so screen readers read each message once.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const remove = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const dismiss = useCallback(
    (id: number) => {
      setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
      setTimeout(() => remove(id), LEAVE_MS);
    },
    [remove],
  );
  const show = useCallback(
    (message: string) => {
      const id = ++nextId.current;
      setToasts((t) => [...t, { id, message, leaving: false }]);
      setTimeout(() => dismiss(id), VISIBLE_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`toast${t.leaving ? ' toast-leaving' : ''}`}
            onClick={() => dismiss(t.id)}
            aria-label={`${t.message} (tutup)`}
          >
            {t.message}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
