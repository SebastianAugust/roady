import type { ComponentPropsWithRef } from 'react';
import './Chip.css';

interface Props extends Omit<ComponentPropsWithRef<'button'>, 'aria-pressed'> {
  /** Whether the chip is on. Exposed as aria-pressed, so it is a toggle button, not a link. */
  pressed: boolean;
}

/** A pill toggle for filters ("Merah", "Minggu ini"). The caller owns the state: flip `pressed` in onClick. */
export function Chip({ pressed, className, children, type = 'button', ...rest }: Props) {
  return (
    <button type={type} className={`chip${className ? ` ${className}` : ''}`} aria-pressed={pressed} {...rest}>
      {children}
    </button>
  );
}
