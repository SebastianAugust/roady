import type { ChangeEvent } from 'react';
import './RadioCard.css';

interface Props {
  name: string;
  value: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  title: string;
  description?: string;
}

/**
 * Figma option card (Ekspor "Pilih Jenis Data", Input "Kondisi Cuaca"): a bordered box with a title, an optional
 * description and a round marker on the right. A real radio input inside a label, so arrows and Space work.
 */
export function RadioCard({ name, value, checked, onChange, title, description }: Props) {
  return (
    <label className={`radio-card${checked ? ' is-checked' : ''}`}>
      <span className="radio-card-text">
        <span className="radio-card-title">{title}</span>
        {description ? <span className="radio-card-desc">{description}</span> : null}
      </span>
      <input type="radio" className="radio-card-input" name={name} value={value} checked={checked} onChange={onChange} />
    </label>
  );
}
