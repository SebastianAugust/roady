import { useId, type InputHTMLAttributes } from 'react';
import './Field.css';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

/** Label above, input below, error text under it (announced through aria-describedby). */
export function TextField({ label, error, hint, id, className, ...rest }: Props) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = [error && `${inputId}-error`, hint && `${inputId}-hint`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field${className ? ` ${className}` : ''}`}>
      <label htmlFor={inputId} className="field-label">
        {label}
      </label>
      <input id={inputId} className="field-input" aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...rest} />
      {hint ? (
        <span id={`${inputId}-hint`} className="field-hint">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={`${inputId}-error`} className="error-text">
          {error}
        </span>
      ) : null}
    </div>
  );
}
