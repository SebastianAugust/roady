import { useId, type TextareaHTMLAttributes } from 'react';
import './Field.css';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  /** Shows "n/min karakter" under the field while the text is shorter than this. */
  minLength?: number;
}

/** Label above, textarea below, then the error, or the hint and the character count (error is announced through aria-describedby). */
export function TextAreaField({ label, error, hint, minLength, id, value, className, ...rest }: Props) {
  const autoId = useId();
  const textId = id ?? autoId;
  const length = String(value ?? '').trim().length;
  const note = [hint, minLength ? `${length}/${minLength} karakter` : undefined].filter(Boolean).join(' · ');
  return (
    <div className={`field${className ? ` ${className}` : ''}`}>
      <label htmlFor={textId} className="field-label">
        {label}
      </label>
      <textarea id={textId} className="field-input" rows={5} value={value} aria-invalid={error ? true : undefined} aria-describedby={`${textId}-note`} {...rest} />
      <span id={`${textId}-note`} className={error ? 'error-text' : 'field-hint'}>
        {error ?? note}
      </span>
    </div>
  );
}
