import { filterErrors, hasFilters, NO_FILTERS, type AccidentFilters } from '../lib/accidentFilters';
import { CUACA_LABEL, todayIso } from '../lib/format';
import type { Cuaca, UrutKecelakaan } from '../types';
import { Button } from './Button';
import { SearchField } from './SearchField';
import { SelectField, type Option } from './SelectField';
import { TextField } from './TextField';
import './AccidentFilterBar.css';

// d.cuaca of Figma has Hujan and Cerah only (docs/05 #24); "lainnya" cannot be chosen there either.
const CUACA_OPTIONS: Option<Cuaca>[] = (['hujan', 'cerah'] as const).map((c) => ({ value: c, label: CUACA_LABEL[c] }));
const URUT_OPTIONS: Option<UrutKecelakaan>[] = [
  { value: 'terbaru', label: 'Terbaru' },
  { value: 'terlama', label: 'Terlama' },
  { value: 'korban_terbanyak', label: 'Korban terbanyak' },
  { value: 'korban_tersedikit', label: 'Korban tersedikit' },
];
const KENDARAAN_SUGGESTIONS = ['Motor', 'Mobil', 'Bus', 'Truk', 'Angkot'];

interface Props {
  filters: AccidentFilters;
  /** Changes some fields; the page goes back to 1 (done by the caller). */
  onChange: (patch: Partial<AccidentFilters>) => void;
  zoneOptions: Option<string>[];
  /** Who entered data: kode_pengguna as value, "kode · nama" as label. */
  inputterOptions: Option<string>[];
  /** Number of results, shown under the bar; undefined while loading. */
  total: number | undefined;
}

/**
 * Filters of Kelola Data Kecelakaan (docs/03 GET /api/admin/accidents): search box, date range, location text and
 * zone, cuaca, jenis kendaraan, victims range, who entered it, sort order, reset and the result count.
 */
export function AccidentFilterBar({ filters: f, onChange, zoneOptions, inputterOptions, total }: Props) {
  const errors = filterErrors(f);
  const active = hasFilters(f);
  return (
    <form className="accident-filters" role="search" aria-label="Filter data kecelakaan" onSubmit={(e) => e.preventDefault()}>
      <SearchField
        className="accident-search"
        aria-label="Cari lokasi, jenis kendaraan, atau kode penginput"
        placeholder="Cari lokasi, jenis kendaraan, atau kode penginput"
        value={f.q}
        onChange={(e) => onChange({ q: e.target.value })}
      />
      <div className="accident-filter-row">
        <TextField label="Dari tanggal" type="date" value={f.dari} max={f.sampai || todayIso()} onChange={(e) => onChange({ dari: e.target.value })} />
        <TextField
          label="Sampai tanggal"
          type="date"
          value={f.sampai}
          min={f.dari || undefined}
          max={todayIso()}
          onChange={(e) => onChange({ sampai: e.target.value })}
          error={errors.sampai}
        />
        <TextField label="Lokasi" placeholder="Nama jalan atau tempat" value={f.lokasi} onChange={(e) => onChange({ lokasi: e.target.value })} />
        <SelectField label="Zona" value={f.zona} onChange={(zona) => onChange({ zona })} options={zoneOptions} placeholder="Semua zona" />
        <SelectField label="Cuaca" value={f.cuaca} onChange={(cuaca) => onChange({ cuaca })} options={CUACA_OPTIONS} placeholder="Semua" />
        <div className="field">
          <TextField
            label="Jenis kendaraan"
            list="accident-kendaraan"
            placeholder="Mis. Motor"
            value={f.kendaraan}
            onChange={(e) => onChange({ kendaraan: e.target.value })}
          />
          <datalist id="accident-kendaraan">
            {KENDARAAN_SUGGESTIONS.map((k) => (
              <option key={k} value={k} />
            ))}
          </datalist>
        </div>
        <TextField
          label="Korban minimal"
          placeholder="0"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          value={f.korbanMin}
          onChange={(e) => onChange({ korbanMin: e.target.value })}
          error={errors.korbanMin}
        />
        <TextField
          label="Korban maksimal"
          placeholder="Tanpa batas"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          value={f.korbanMax}
          onChange={(e) => onChange({ korbanMax: e.target.value })}
          error={errors.korbanMax}
        />
        <SelectField label="Diinput oleh" value={f.oleh} onChange={(oleh) => onChange({ oleh })} options={inputterOptions} placeholder="Semua" />
        <SelectField
          label="Urutkan"
          value={f.urut}
          onChange={(urut) => onChange({ urut: urut || 'terbaru' })}
          options={URUT_OPTIONS}
        />
      </div>
      <div className="accident-filter-foot">
        <p className="accident-count" role="status" aria-live="polite">
          {total === undefined ? 'Memuat…' : `${total} data kecelakaan${active ? ' sesuai filter' : ''}`}
        </p>
        {active ? (
          <Button variant="ghost" className="accident-reset" onClick={() => onChange({ ...NO_FILTERS, urut: f.urut })}>
            Atur ulang filter
          </Button>
        ) : null}
      </div>
    </form>
  );
}
