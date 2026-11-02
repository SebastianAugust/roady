import { useId } from 'react';
import { composeAlasan } from '../lib/alasan';
import './Field.css';

interface Props {
  label: string;
  /** Ready-made reasons, shown as toggle buttons; choosing the chosen one again clears it. */
  presets: readonly string[];
  preset: string;
  onPresetChange: (preset: string) => void;
  note: string;
  onNoteChange: (note: string) => void;
  /** Minimum length of the preset and the note together. */
  min: number;
  error?: string;
  disabled?: boolean;
}

/**
 * A required written reason made of a ready-made choice and a free note (alasan_verifikasi). Either alone is enough as
 * long as together they reach `min` characters; the counter shows where the entry stands.
 */
export function PresetReasonField({ label, presets, preset, onPresetChange, note, onNoteChange, min, error, disabled }: Props) {
  const id = useId();
  const length = composeAlasan(preset, note).length;
  return (
    <div className="field">
      <span id={`${id}-label`} className="field-label">
        {label}
      </span>
      <div className="quick-reasons" role="group" aria-labelledby={`${id}-label`}>
        {presets.map((p) => (
          <button key={p} type="button" className="quick-reason" aria-pressed={preset === p} disabled={disabled} onClick={() => onPresetChange(preset === p ? '' : p)}>
            {p}
          </button>
        ))}
      </div>
      <label htmlFor={`${id}-note`} className="field-hint">
        Catatan tambahan (opsional bila alasan di atas sudah dipilih)
      </label>
      <textarea
        id={`${id}-note`}
        className="field-input"
        rows={3}
        value={note}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-hint`}
        onChange={(e) => onNoteChange(e.target.value)}
      />
      <span id={`${id}-hint`} className={error ? 'error-text' : 'field-hint'}>
        {error ?? `Alasan minimal ${min} karakter (${length}/${min}).`}
      </span>
    </div>
  );
}
