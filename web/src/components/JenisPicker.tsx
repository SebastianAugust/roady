import { JENIS_LAPORAN, type JenisLaporan } from '../lib/reportTemplates';
import { RadioCard } from './RadioCard';

interface Props {
  value: JenisLaporan | undefined;
  onChange: (jenis: JenisLaporan) => void;
}

/** First step of the report form: Kecelakaan, Nyaris celaka or Masalah jalan. The form below follows the choice. */
export function JenisPicker({ value, onChange }: Props) {
  return (
    <fieldset className="jenis-picker">
      <legend className="field-label">Jenis laporan</legend>
      <div className="jenis-options">
        {JENIS_LAPORAN.map((j) => (
          <RadioCard key={j.value} name="jenis_laporan" value={j.value} title={j.label} description={j.description} checked={value === j.value} onChange={() => onChange(j.value)} />
        ))}
      </div>
    </fieldset>
  );
}
