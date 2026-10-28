import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * primary: white fill, navy text. secondary: surface fill with a hairline border. ghost: text only.
   * danger: destructive (Tolak, Hapus). danger-outline: white with red text, the TOLAK of the Verifikasi table rows.
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-outline';
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
      {children}
    </button>
  );
}
