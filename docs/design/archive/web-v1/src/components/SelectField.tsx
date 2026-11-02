import { useId, type SelectHTMLAttributes } from 'react';
import './Field.css';

export interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  label: string;
  value: T | '';
  options: Option<T>[];
  onChange: (value: T | '') => void;
  /** Text of the empty option; omit to force a choice. */
  placeholder?: string;
  error?: string;
}

/** Native select styled like the Figma `d.*` dropdowns (keyboard and screen reader support come for free). */
export function SelectField<T extends string>({ label, value, options, onChange, placeholder, error, id, className, ...rest }: Props<T>) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className={`field${className ? ` ${className}` : ''}`}>
      <label htmlFor={selectId} className="field-label">
        {label}
      </label>
      <select
        id={selectId}
        className="field-input field-select"
        value={value}
        onChange={(e) => onChange(e.target.value as T | '')}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${selectId}-error` : undefined}
        {...rest}
      >
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? (
        <span id={`${selectId}-error`} className="error-text">
          {error}
        </span>
      ) : null}
    </div>
  );
}
