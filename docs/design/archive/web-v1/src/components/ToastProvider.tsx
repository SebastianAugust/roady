import { useCallback, useRef, useState, type ReactNode } from 'react';
import { ToastContext, type ShowToast } from './toastContext';
import './Toast.css';

const VISIBLE_MS = 3000;
/** A toast with an undo button stays longer, so there is time to reach it. */
const VISIBLE_WITH_UNDO_MS = 6000;
/** Matches the fade-out in motion.css (--dur-base). */
const LEAVE_MS = 200;

interface Toast {
  id: number;
  message: string;
  undo?: () => void;
  leaving: boolean;
}

/**
 * Stack of short confirmations (e.g. after verifying a report), top right. Each slides down, stays 3 seconds (6 with an
 * "Urungkan" button), fades out, and can be closed with a click on its text. The region is a polite live region, so
 * screen readers read each message once.
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
  const show = useCallback<ShowToast>(
    (message, options) => {
      const id = ++nextId.current;
      setToasts((t) => [...t, { id, message, undo: options?.undo, leaving: false }]);
      setTimeout(() => dismiss(id), options?.undo ? VISIBLE_WITH_UNDO_MS : VISIBLE_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast${t.leaving ? ' toast-leaving' : ''}`}>
            <button type="button" className="toast-message" onClick={() => dismiss(t.id)} aria-label={`${t.message} (tutup)`}>
              {t.message}
            </button>
            {t.undo ? (
              <button
                type="button"
                className="toast-undo"
                onClick={() => {
                  t.undo?.();
                  dismiss(t.id);
                }}
              >
                Urungkan
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
