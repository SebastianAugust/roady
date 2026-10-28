import { useId } from 'react';
import { ALASAN_MIN_LENGTH } from '../lib/alasan';
import './Field.css';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  /** Ready-made reasons shown as buttons above the text; choosing one fills the text, which stays editable. */
  quickReasons?: readonly string[];
}

/** Required written reason (alasan_penolakan, alasan_hapus): optional quick reasons, a textarea and the minimum length as a hint. */
export function ReasonField({ label, value, onChange, error, disabled, quickReasons }: Props) {
  const id = useId();
  const length = value.trim().length;
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {quickReasons?.length ? (
        <div className="quick-reasons" role="group" aria-label="Alasan cepat">
          {quickReasons.map((r) => (
            <button key={r} type="button" className="quick-reason" aria-pressed={value.trim() === r} disabled={disabled} onClick={() => onChange(r)}>
              {r}
            </button>
          ))}
        </div>
      ) : null}
      <textarea
        id={id}
        className="field-input"
        rows={3}
        value={value}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-hint`}
        onChange={(e) => onChange(e.target.value)}
      />
      <span id={`${id}-hint`} className={error ? 'error-text' : 'field-hint'}>
        {error ?? `Minimal ${ALASAN_MIN_LENGTH} karakter (${length}/${ALASAN_MIN_LENGTH}).`}
      </span>
    </div>
  );
}
