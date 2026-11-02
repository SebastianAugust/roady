import { useId, useState } from 'react';
import { Button } from './Button';
import './Field.css';

interface Props {
  label: string;
  /** File name of the chosen photo, '' when none. */
  value: string;
  onChange: (fileName: string) => void;
  required?: boolean;
  hint?: string;
  error?: string;
}

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Photo attachment. It checks that the file is an image under 10 MB and keeps its name (the mock API has no storage, so
 * the file itself is not uploaded yet; the real API takes it as multipart, docs/05 open item 7).
 */
export function PhotoField({ label, value, onChange, required = false, hint, error }: Props) {
  const id = useId();
  // A file input cannot be cleared from outside, so changing the key remounts it.
  const [round, setRound] = useState(0);
  const [localError, setLocalError] = useState<string>();
  const shownError = error ?? localError;

  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
        {required ? null : <span className="field-optional"> (opsional)</span>}
      </label>
      <input
        key={round}
        id={id}
        type="file"
        accept="image/*"
        className="field-input photo-input"
        aria-invalid={shownError ? true : undefined}
        aria-describedby={`${id}-note`}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return onChange('');
          if (!file.type.startsWith('image/')) setLocalError('Berkas harus berupa gambar (JPG atau PNG).');
          else if (file.size > MAX_BYTES) setLocalError('Ukuran foto maksimal 10 MB.');
          else {
            setLocalError(undefined);
            return onChange(file.name);
          }
          setRound((n) => n + 1);
          onChange('');
        }}
      />
      {value ? (
        <p className="photo-chosen">
          <span>Terlampir: {value}</span>
          <Button
            variant="ghost"
            className="btn-sm"
            onClick={() => {
              setRound((n) => n + 1);
              setLocalError(undefined);
              onChange('');
            }}
          >
            Hapus foto
          </Button>
        </p>
      ) : null}
      <span id={`${id}-note`} className={shownError ? 'error-text' : 'field-hint'}>
        {shownError ?? hint}
      </span>
    </div>
  );
}
