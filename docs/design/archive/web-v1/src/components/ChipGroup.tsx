import { useId } from 'react';
import type { Choice } from '../lib/reportTemplates';
import './Field.css';

interface Props {
  label: string;
  options: readonly Choice[];
  value: string[];
  onChange: (value: string[]) => void;
  hint?: string;
  error?: string;
}

/** A choice of several options as toggle buttons (aria-pressed), for "jenis kendaraan yang terlibat". */
export function ChipGroup({ label, options, value, onChange, hint, error }: Props) {
  const id = useId();
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <fieldset className="chip-group" aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}>
      <legend className="field-label">{label}</legend>
      <div className="quick-reasons">
        {options.map((o) => (
          <button key={o.value} type="button" className="quick-reason" aria-pressed={value.includes(o.value)} onClick={() => toggle(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
      {error ? (
        <span id={`${id}-error`} className="error-text">
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className="field-hint">
          {hint}
        </span>
      ) : null}
    </fieldset>
  );
}
