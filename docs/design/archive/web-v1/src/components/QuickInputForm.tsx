import { useEffect, useRef, useState, type AnimationEvent, type FormEvent } from 'react';
import { api, ApiError } from '../api';
import { useAuth } from '../auth/useAuth';
import { errorMessage } from '../hooks/useApi';
import { CUACA_LABEL, localDayKey } from '../lib/format';
import { distanceMeters } from '../lib/geo';
import {
  EMPTY_QUICK_INPUT,
  clearDraft,
  clockText,
  isEmptyInput,
  loadDraft,
  saveDraft,
  toCreateAccident,
  validateQuickInput,
  type QuickInputErrors,
  type QuickInputKey,
  type QuickInputValues,
} from '../lib/quickInput';
import type { Cuaca, KecelakaanResmi } from '../types';
import { Button } from './Button';
import { LocationPicker } from './LocationPicker';
import { SelectField, type Option } from './SelectField';
import { TextField } from './TextField';
import { useToast } from './ui';
import './QuickInputForm.css';

const CUACA_OPTIONS: Option<Cuaca>[] = (Object.keys(CUACA_LABEL) as Cuaca[]).map((c) => ({ value: c, label: CUACA_LABEL[c] }));
const DRAFT_DELAY_MS = 500;
/** API-010 field names -> the field of this form. */
const SERVER_FIELDS: Record<string, QuickInputKey> = {
  lokasi_deskripsi: 'lokasi',
  tanggal_waktu: 'tanggal',
  kondisi_cuaca: 'cuaca',
  jumlah_korban: 'korban',
  koordinat: 'lat',
};

const nowInput = () => {
  const d = new Date();
  return `${localDayKey(d)}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

interface Props {
  /** Called with the saved row after API-010 accepted it. */
  onSaved: (accident: KecelakaanResmi) => void;
}

/**
 * The quick entry of Arsip & Input: lokasi, tanggal, cuaca, jumlah korban and a point picked on the map (or typed).
 * Each field shows its own message under it once it was visited or a save was tried, and the form shakes when a save
 * fails. What is typed is kept as a draft in the browser ("Draf tersimpan 14:35") until the entry is saved. Dishub only
 * adds records here; the server takes the officer from the token (no input_by in the body).
 */
export function QuickInputForm({ onSaved }: Props) {
  const { signOut } = useAuth();
  const toast = useToast();
  // The draft is read once, when the form first appears.
  const [initial] = useState(loadDraft);
  const [values, setValues] = useState<QuickInputValues>(initial?.values ?? EMPTY_QUICK_INPUT);
  const [savedAt, setSavedAt] = useState(initial?.savedAt);
  const [touched, setTouched] = useState<ReadonlySet<QuickInputKey>>(new Set());
  const [serverErrors, setServerErrors] = useState<QuickInputErrors>({});
  const [formError, setFormError] = useState<string>();
  const [shaking, setShaking] = useState(false);
  const [busy, setBusy] = useState(false);

  // "Now" for the future-date check is read once per visit (a lazy initializer keeps render pure); a save checks again with the real time.
  const [openedAt] = useState(() => new Date());
  const errors = validateQuickInput(values, openedAt);
  const shown = (key: QuickInputKey) => serverErrors[key] || (touched.has(key) ? errors[key] : undefined);

  // Save the draft a moment after typing stops. The first run (nothing typed yet) and an empty form write nothing.
  const typed = useRef(false);
  useEffect(() => {
    if (!typed.current) return;
    const timer = setTimeout(() => {
      if (isEmptyInput(values)) {
        clearDraft();
        setSavedAt(undefined);
      } else {
        const now = new Date();
        saveDraft(values, now);
        setSavedAt(now.toISOString());
      }
    }, DRAFT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [values]);

  const set = (key: QuickInputKey, value: string) => {
    typed.current = true;
    setValues((v) => ({ ...v, [key]: value }));
    setServerErrors((e) => ({ ...e, [key]: undefined }));
    setFormError(undefined);
  };
  const touch = (key: QuickInputKey) => setTouched((t) => new Set(t).add(key));
  const blurProps = (key: QuickInputKey) => ({ onBlur: () => touch(key) });

  function pickPoint(lat: number, lng: number) {
    typed.current = true;
    setValues((v) => ({ ...v, lat: String(lat), lng: String(lng) }));
    setServerErrors((e) => ({ ...e, lat: undefined, lng: undefined }));
    setTouched((t) => new Set(t).add('lat').add('lng'));
    // No geocoding: an empty location takes the place name of the zone the point lies in; outside every zone it is typed.
    void api
      .getDishubZones()
      .then((zones) => {
        const zone = zones.find((z) => z.lokasi_teks && distanceMeters(lat, lng, z.center_latitude, z.center_longitude) <= z.radius_zona);
        if (zone?.lokasi_teks) setValues((v) => (v.lokasi.trim() ? v : { ...v, lokasi: zone.lokasi_teks ?? '' }));
      })
      .catch(() => undefined); // a convenience; a failure leaves the field for the officer
  }

  const fail = () => {
    setTouched(new Set(Object.keys(EMPTY_QUICK_INPUT) as QuickInputKey[]));
    setShaking(true);
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setFormError(undefined);
    if (Object.keys(validateQuickInput(values, new Date())).length) return fail();
    setBusy(true);
    try {
      const saved = await api.createAccident(toCreateAccident(values));
      clearDraft();
      typed.current = false;
      setValues(EMPTY_QUICK_INPUT);
      setSavedAt(undefined);
      setTouched(new Set());
      setServerErrors({});
      toast(`Data kecelakaan di ${saved.lokasi_deskripsi} tersimpan di Zona ${saved.zona_id}.`);
      onSaved(saved);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) signOut();
      else if (err instanceof ApiError && err.status === 422 && err.fieldErrors) {
        const mapped: QuickInputErrors = {};
        const rest: string[] = [];
        for (const [field, message] of Object.entries(err.fieldErrors)) {
          const key = SERVER_FIELDS[field];
          if (key) mapped[key] = message;
          else rest.push(message);
        }
        setServerErrors(mapped);
        setFormError(rest.join(' ') || undefined);
        setShaking(true);
      } else setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  // The class is dropped when the shake itself ends, so the next failure shakes again.
  const onAnimationEnd = (e: AnimationEvent) => {
    if (e.target === e.currentTarget) setShaking(false);
  };

  const lat = Number(values.lat);
  const lng = Number(values.lng);
  const point = values.lat.trim() && values.lng.trim() && Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined;

  return (
    <form className={`quick-form glass-in${shaking ? ' shake' : ''}`} onSubmit={submit} onAnimationEnd={onAnimationEnd} noValidate aria-labelledby="quick-form-title">
      <div className="quick-form-head">
        <h2 id="quick-form-title" className="quick-form-title">
          Input data baru
        </h2>
        <p className="quick-form-draft" role="status" aria-live="polite">
          {savedAt ? `Draf tersimpan ${clockText(savedAt)}` : ''}
        </p>
      </div>

      <div className="quick-form-grid">
        <TextField
          label="Lokasi"
          className="quick-full"
          placeholder="Jl. Ir. H. Juanda No. 12, Dago, Kota Bandung"
          autoComplete="off"
          value={values.lokasi}
          onChange={(e) => set('lokasi', e.target.value)}
          error={shown('lokasi')}
          {...blurProps('lokasi')}
        />
        <TextField
          label="Tanggal dan jam kejadian"
          type="datetime-local"
          max={nowInput()}
          value={values.tanggal}
          onChange={(e) => set('tanggal', e.target.value)}
          error={shown('tanggal')}
          {...blurProps('tanggal')}
        />
        <SelectField
          label="Cuaca"
          placeholder="Pilih cuaca"
          value={values.cuaca}
          options={CUACA_OPTIONS}
          onChange={(v) => set('cuaca', v)}
          error={shown('cuaca')}
          onBlur={() => touch('cuaca')}
        />
        <TextField
          label="Jumlah korban"
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          placeholder="0"
          value={values.korban}
          onChange={(e) => set('korban', e.target.value)}
          error={shown('korban')}
          {...blurProps('korban')}
        />
        <TextField
          label="Latitude"
          inputMode="decimal"
          placeholder="-6.939305"
          value={values.lat}
          onChange={(e) => set('lat', e.target.value)}
          error={shown('lat')}
          {...blurProps('lat')}
        />
        <TextField
          label="Longitude"
          inputMode="decimal"
          placeholder="107.661631"
          value={values.lng}
          onChange={(e) => set('lng', e.target.value)}
          error={shown('lng')}
          {...blurProps('lng')}
        />
        <div className="quick-full">
          <LocationPicker value={point} onPick={pickPoint} />
        </div>
      </div>

      {formError ? (
        <p className="error-text" role="alert">
          {formError}
        </p>
      ) : null}
      <div className="quick-form-actions">
        <Button type="submit" busy={busy}>
          {busy ? 'Menyimpan' : 'SIMPAN DATA'}
        </Button>
      </div>
    </form>
  );
}
