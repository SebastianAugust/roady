import { useCallback, useRef, useState, type ReactNode } from 'react';
import { ToastContext } from './toastContext';
import './Toast.css';

const VISIBLE_MS = 6000;

interface Toast {
  id: number;
  message: string;
}

/** Stack of short confirmations (e.g. after verifying a report). Each disappears after a few seconds or on click. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const show = useCallback(
    (message: string) => {
      const id = ++nextId.current;
      setToasts((t) => [...t, { id, message }]);
      setTimeout(() => dismiss(id), VISIBLE_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <button key={t.id} type="button" className="toast" onClick={() => dismiss(t.id)} aria-label={`${t.message} (tutup)`}>
            {t.message}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
