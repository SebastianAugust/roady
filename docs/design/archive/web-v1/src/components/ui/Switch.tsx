import type { ButtonHTMLAttributes } from 'react';
import './Switch.css';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'role' | 'aria-checked' | 'onChange'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

/**
 * An on/off switch (role="switch"). It has no text of its own: give it a name with aria-label, or point aria-labelledby
 * at the visible label next to it.
 */
export function Switch({ checked, onCheckedChange, className, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      role="switch"
      aria-checked={checked}
      className={`switch${className ? ` ${className}` : ''}`}
      onClick={() => onCheckedChange(!checked)}
      {...rest}
    />
  );
}
