import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from './Button';
import './Dialog.css';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Buttons at the bottom; a "Tutup" button is used when omitted. */
  actions?: ReactNode;
}

/** Modal on the native <dialog>: focus is trapped, Escape closes, focus returns to the opener. */
export function Dialog({ open, title, onClose, children, actions }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="dialog glass"
      aria-labelledby={titleId}
      onClose={onClose}
      // A click on the backdrop lands on the <dialog> itself.
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="dialog-body">
        <h2 id={titleId} className="dialog-title">
          {title}
        </h2>
        {children}
        <div className="dialog-actions">{actions ?? <Button onClick={onClose}>Tutup</Button>}</div>
      </div>
    </dialog>
  );
}
