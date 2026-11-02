import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useModal } from './useModal';
import './Drawer.css';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Buttons pinned under the content. */
  footer?: ReactNode;
}

/**
 * A panel sliding in from the right (440px, full width on a phone) over a scrim. It is a modal dialog: focus goes to the
 * close button, stays inside while it is open and returns to the trigger on close; Escape or a click on the scrim closes it.
 * It renders into <body>, so the blurred glass panels of the app cannot trap it.
 */
export function Drawer({ open, title, onClose, children, footer }: Props) {
  return open
    ? createPortal(
        <DrawerPanel title={title} onClose={onClose} footer={footer}>
          {children}
        </DrawerPanel>,
        document.body,
      )
    : null;
}

function DrawerPanel({ title, onClose, children, footer }: Omit<Props, 'open'>) {
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  useModal(panelRef, closeRef, onClose);

  return (
    <>
      <div className="drawer-scrim" onClick={onClose} aria-hidden="true" />
      <aside ref={panelRef} className="drawer" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="drawer-head">
          <h2 id={titleId} className="drawer-title">
            {title}
          </h2>
          <button ref={closeRef} type="button" className="drawer-close" aria-label="Tutup" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="drawer-body">{children}</div>
        {footer ? <footer className="drawer-footer">{footer}</footer> : null}
      </aside>
    </>
  );
}
