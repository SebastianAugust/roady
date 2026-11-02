import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * primary: white fill, navy text. secondary: surface fill with a hairline border. ghost: text only.
   * danger: destructive (Tolak, Hapus). danger-outline: white with red text, the TOLAK of the Verifikasi table rows.
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-outline';
  /** Disables the button (no double submit) and shows a small spinner before the label. */
  busy?: boolean;
}

export function Button({ variant = 'primary', busy = false, className, disabled, children, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      className={`btn btn-${variant}${className ? ` ${className}` : ''}`}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      {...rest}
    >
      {busy ? <span className="btn-spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
