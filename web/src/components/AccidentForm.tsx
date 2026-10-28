import { useState, type FormEvent } from 'react';
import { ApiError } from '../api';
import { useAuth } from '../auth/useAuth';
import { errorMessage } from '../hooks/useApi';
import { apiErrorsToForm, checkAccidentForm, type AccidentForm as FormValues } from '../lib/accidentForm';
import { CUACA_LABEL, todayIso } from '../lib/format';
import type { CreateAccidentRequest, Cuaca } from '../types';
import { Button } from './Button';
import { LocationPicker } from './LocationPicker';
import { RadioCard } from './RadioCard';
import { TextField } from './TextField';
import './AccidentForm.css';

// Figma offers Hujan and Cerah only (d.cuaca, docs/05 #11); kondisi_cuaca is optional in KECELAKAAN_RESMI.
const CUACA: Cuaca[] = ['hujan', 'cerah'];

type Errors = Partial<Record<keyof FormValues | 'form', string>>;

interface Props {
  initial: FormValues;
  submitLabel: string;
  /** Sends the checked body (API-010 POST or API-009 PUT). A 422 from it is mapped back onto the fields. */
  onSubmit: (body: CreateAccidentRequest) => Promise<void>;
}

/**
 * The official-accident form of Input Data Resmi (Figma form variant). Rules match the mock API-010 validation:
 * date and time required and not in the future, place required, victims an integer >= 0, Bandung Raya
 * coordinates. There is no input_by field: the server takes it from the token.
 */
export function AccidentForm({ initial, submitLabel, onSubmit }: Props) {
  const { signOut } = useAuth();
  const [form, setForm] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined, form: undefined }));
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const check = checkAccidentForm(form);
    if (!check.ok) {
      setErrors(check.errors);
      // Wait for the error state to render, then put the keyboard on the first field that needs fixing.
      requestAnimationFrame(() => formEl.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setBusy(true);
    setErrors({});
    try {
      await onSubmit(check.body);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) signOut();
      else if (err instanceof ApiError && err.status === 422 && err.fieldErrors) setErrors(apiErrorsToForm(err.fieldErrors));
      else setErrors({ form: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  const lat = Number(form.latitude);
  const lng = Number(form.longitude);
  const point = form.latitude.trim() && form.longitude.trim() && Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined;
  const cuacaOptions = form.kondisi_cuaca === 'lainnya' ? [...CUACA, 'lainnya' as const] : CUACA;

  return (
    <form className="accident-form" onSubmit={submit} noValidate>
      <div className="accident-col">
        <TextField
          label="Jumlah Korban"
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          placeholder="3"
          required
          value={form.jumlah_korban}
          onChange={(e) => set('jumlah_korban', e.target.value)}
          error={errors.jumlah_korban}
        />
        <TextField
          label="Tanggal Kejadian"
          type="date"
          max={todayIso()}
          required
          value={form.tanggal}
          onChange={(e) => set('tanggal', e.target.value)}
          error={errors.tanggal}
        />
        <TextField
          label="Waktu Kejadian (WIB)"
          type="time"
          required
          value={form.waktu}
          onChange={(e) => set('waktu', e.target.value)}
          error={errors.waktu}
        />
        <TextField
          label="Jenis Kendaraan yang Terlibat"
          placeholder="Mobil, Motor"
          hint="Opsional"
          value={form.jenis_kendaraan_terlibat}
          onChange={(e) => set('jenis_kendaraan_terlibat', e.target.value)}
        />
        <fieldset className="accident-cuaca">
          <legend className="field-label">
            Kondisi Cuaca <span className="accident-optional">(opsional)</span>
          </legend>
          <div className="accident-cuaca-options">
            {cuacaOptions.map((c) => (
              <RadioCard
                key={c}
                name="kondisi_cuaca"
                value={c}
                title={CUACA_LABEL[c]}
                checked={form.kondisi_cuaca === c}
                onChange={() => set('kondisi_cuaca', c)}
              />
            ))}
          </div>
          {form.kondisi_cuaca ? (
            <Button variant="ghost" className="accident-clear" onClick={() => set('kondisi_cuaca', '')}>
              Kosongkan pilihan cuaca
            </Button>
          ) : null}
        </fieldset>
      </div>

      <div className="accident-col">
        <label className="field">
          <span className="field-label">Deskripsi Lokasi</span>
          <textarea
            className="field-input"
            placeholder="Jl. Soekarno Hatta depan Summarecon, arah timur"
            required
            value={form.lokasi_deskripsi}
            aria-invalid={errors.lokasi_deskripsi ? true : undefined}
            aria-describedby={errors.lokasi_deskripsi ? 'lokasi-error' : undefined}
            onChange={(e) => set('lokasi_deskripsi', e.target.value)}
          />
          {errors.lokasi_deskripsi ? (
            <span id="lokasi-error" className="error-text">
              {errors.lokasi_deskripsi}
            </span>
          ) : null}
        </label>
        <TextField
          label="Latitude"
          inputMode="decimal"
          placeholder="-6.939305"
          required
          value={form.latitude}
          onChange={(e) => set('latitude', e.target.value)}
          error={errors.latitude}
        />
        <TextField
          label="Longitude"
          inputMode="decimal"
          placeholder="107.661631"
          required
          value={form.longitude}
          onChange={(e) => set('longitude', e.target.value)}
          error={errors.longitude}
        />
        <LocationPicker
          value={point}
          onPick={(pickedLat, pickedLng) => {
            set('latitude', String(pickedLat));
            set('longitude', String(pickedLng));
          }}
        />
      </div>

      {errors.form ? (
        <p className="error-text accident-form-error" role="alert">
          {errors.form}
        </p>
      ) : null}
      <Button type="submit" busy={busy} className="accident-submit">
        {busy ? 'MENYIMPAN…' : submitLabel}
      </Button>
    </form>
  );
}
