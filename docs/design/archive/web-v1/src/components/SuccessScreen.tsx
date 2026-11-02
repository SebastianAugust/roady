import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from './Button';
import './SuccessScreen.css';

interface Props {
  icon: ReactNode;
  message: string;
  /** Extra line under the message (e.g. the file name). */
  detail?: ReactNode;
  onDone: () => void;
}

/** Figma confirmation frames (ekspor 1053:8352, input 1053:7776): icon, one message, a full-width SELESAI button. */
export function SuccessScreen({ icon, message, detail, onDone }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Move focus here so screen readers announce the result and keyboard users are not left on a removed button.
  useEffect(() => headingRef.current?.focus(), []);

  return (
    <section className="success">
      <span className="success-icon" aria-hidden="true">
        {icon}
      </span>
      <h1 className="success-message" tabIndex={-1} ref={headingRef}>
        {message}
      </h1>
      {detail ? <p className="success-detail">{detail}</p> : null}
      <Button className="success-done" onClick={onDone}>
        SELESAI
      </Button>
    </section>
  );
}
