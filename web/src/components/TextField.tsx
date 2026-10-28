import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import './Field.css';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  /** Control inside the right edge of the input (e.g. the show/hide password button). */
  endAdornment?: ReactNode;
}

/** Label above, input below, error text under it (announced through aria-describedby). */
export function TextField({ label, error, hint, endAdornment, id, className, ...rest }: Props) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = [error && `${inputId}-error`, hint && `${inputId}-hint`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field${className ? ` ${className}` : ''}`}>
      <label htmlFor={inputId} className="field-label">
        {label}
      </label>
      <div className="field-control">
        <input
          id={inputId}
          className={`field-input${endAdornment ? ' field-input-adorned' : ''}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {endAdornment ? <span className="field-adornment">{endAdornment}</span> : null}
      </div>
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
