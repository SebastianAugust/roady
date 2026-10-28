import { useMemo, useState, type FormEvent } from 'react';
import { ApiError } from '../api';
import { useAuth } from '../auth/useAuth';
import { isInBandungRaya } from '../config';
import { errorMessage } from '../hooks/useApi';
import { reverseGeocode } from '../lib/reverseGeocode';
import { buildAccidentRequest, serverErrorsToForm } from '../lib/reportRequest';
import { emptyValues, LOCATION_KEYS, TEMPLATES, validateReport, type JenisLaporan, type ReportValues, type TemplateField } from '../lib/reportTemplates';
import type { CreateAccidentRequest } from '../types';
import { Button } from './Button';
import { ChipGroup } from './ChipGroup';
import { JenisPicker } from './JenisPicker';
import { LocationPicker } from './LocationPicker';
import { PhotoField } from './PhotoField';
import { ReportExample } from './ReportExample';
import { SelectField } from './SelectField';
import { TextAreaField } from './TextAreaField';
import { TextField } from './TextField';
import './ReportTemplateForm.css';

interface Props {
  /** Sends the checked body (API-010). A 422 from it is mapped back onto the fields. */
  onSubmit: (body: CreateAccidentRequest) => Promise<void>;
}

const pad = (n: number) => String(n).padStart(2, '0');
/** Now as the value of a datetime-local input (local time), the latest time that may be entered. */
const nowInput = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const keysOf = (f: TemplateField) => (f.kind === 'location' ? Object.values(LOCATION_KEYS) : [f.key]);
const text = (v: string | string[] | undefined) => (typeof v === 'string' ? v : '');

/**
 * Dishub's "Input Data" form (Arsip & Input): pick the kind of report first, then fill the structured form of that kind.
 * The structure, choices, example and rules come from shared/reportTemplates.ts, the same file the mobile form uses.
 * Errors show per field once it was visited; the send button stays disabled until every rule passes, and says what is
 * still missing. There is no input_by: the server takes it from the token.
 */
export function ReportTemplateForm({ onSubmit }: Props) {
  const { signOut } = useAuth();
  const [jenis, setJenis] = useState<JenisLaporan>();
  const [values, setValues] = useState<ReportValues>({});
  const [touched, setTouched] = useState<ReadonlySet<string>>(new Set());
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const template = jenis ? TEMPLATES[jenis] : undefined;
  const errors = useMemo(() => (jenis ? validateReport(jenis, values, { isInArea: isInBandungRaya }) : {}), [jenis, values]);
  const valid = jenis !== undefined && Object.keys(errors).length === 0;

  const touch = (keys: string[]) => setTouched((t) => new Set([...t, ...keys]));
  const set = (key: string, value: string | string[]) => {
    setValues((v) => ({ ...v, [key]: value }));
    touch([key]);
    setServerErrors((e) => ({ ...e, [key]: '' }));
    setFormError(undefined);
  };
  const errorOf = (key: string) => serverErrors[key] || (touched.has(key) ? errors[key] : undefined) || undefined;

  const choose = (j: JenisLaporan) => {
    if (j === jenis) return;
    setJenis(j);
    setValues(emptyValues(j));
    setTouched(new Set());
    setServerErrors({});
    setFormError(undefined);
  };

  const useExample = () => {
    if (!jenis) return;
    setValues({ ...emptyValues(jenis), ...TEMPLATES[jenis].contoh });
    touch(template ? template.fields.flatMap(keysOf) : []);
    setServerErrors({});
  };

  // The labels of what is still missing, once per field, in form order.
  const missing = template ? template.fields.filter((f) => keysOf(f).some((k) => errors[k])).map((f) => f.label) : [];

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!jenis || !valid) return;
    setBusy(true);
    setFormError(undefined);
    try {
      await onSubmit(buildAccidentRequest(jenis, values));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) signOut();
      else if (err instanceof ApiError && err.status === 422 && err.fieldErrors) {
        const { fields, rest } = serverErrorsToForm(err.fieldErrors);
        setServerErrors(fields);
        setFormError(rest.join(' ') || undefined);
      } else setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function pickPoint(lat: number, lng: number) {
    set(LOCATION_KEYS.latitude, String(lat));
    set(LOCATION_KEYS.longitude, String(lng));
    // Fill the address from the point when it is still empty (needs the Google key; without it the officer types it).
    void reverseGeocode(lat, lng).then((address) => {
      if (address) setValues((v) => (text(v[LOCATION_KEYS.alamat]).trim() ? v : { ...v, [LOCATION_KEYS.alamat]: address }));
    });
  }

  function renderField(f: TemplateField) {
    switch (f.kind) {
      case 'datetime':
        return (
          <TextField
            label={f.label}
            type="datetime-local"
            max={nowInput()}
            required={f.required}
            value={text(values[f.key])}
            onChange={(e) => set(f.key, e.target.value)}
            error={errorOf(f.key)}
            hint={f.hint}
          />
        );
      case 'location': {
        const lat = Number(text(values[LOCATION_KEYS.latitude]));
        const lng = Number(text(values[LOCATION_KEYS.longitude]));
        const hasPoint = text(values[LOCATION_KEYS.latitude]).trim() !== '' && text(values[LOCATION_KEYS.longitude]).trim() !== '' && Number.isFinite(lat) && Number.isFinite(lng);
        return (
          <fieldset className="report-location">
            <legend className="field-label">{f.label}</legend>
            <TextField
              label="Alamat atau nama jalan"
              placeholder="Jl. Ir. H. Juanda No. 12, Dago, Kec. Coblong, Kota Bandung"
              autoComplete="off"
              required
              value={text(values[LOCATION_KEYS.alamat])}
              onChange={(e) => set(LOCATION_KEYS.alamat, e.target.value)}
              error={errorOf(LOCATION_KEYS.alamat)}
            />
            <div className="report-coords">
              <TextField
                label="Latitude"
                inputMode="decimal"
                placeholder="-6.939305"
                required
                value={text(values[LOCATION_KEYS.latitude])}
                onChange={(e) => set(LOCATION_KEYS.latitude, e.target.value)}
                error={errorOf(LOCATION_KEYS.latitude)}
              />
              <TextField
                label="Longitude"
                inputMode="decimal"
                placeholder="107.661631"
                required
                value={text(values[LOCATION_KEYS.longitude])}
                onChange={(e) => set(LOCATION_KEYS.longitude, e.target.value)}
                error={errorOf(LOCATION_KEYS.longitude)}
              />
            </div>
            <LocationPicker value={hasPoint ? { lat, lng } : undefined} onPick={pickPoint} />
          </fieldset>
        );
      }
      case 'multiselect':
        return <ChipGroup label={f.label} options={f.options ?? []} value={Array.isArray(values[f.key]) ? (values[f.key] as string[]) : []} onChange={(v) => set(f.key, v)} hint={f.hint} error={errorOf(f.key)} />;
      case 'select':
        return <SelectField label={f.label} placeholder="Pilih…" options={[...(f.options ?? [])]} value={text(values[f.key])} onChange={(v) => set(f.key, v)} error={errorOf(f.key)} required={f.required} />;
      case 'count':
        return (
          <TextField
            label={f.label}
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            placeholder="0"
            required={f.required}
            value={text(values[f.key])}
            onChange={(e) => set(f.key, e.target.value)}
            error={errorOf(f.key)}
            hint={f.hint}
          />
        );
      case 'textarea':
        return (
          <TextAreaField
            label={f.label}
            placeholder={f.placeholder}
            required={f.required}
            minLength={f.minLength}
            value={text(values[f.key])}
            onChange={(e) => set(f.key, e.target.value)}
            error={errorOf(f.key)}
            hint={f.hint}
          />
        );
      case 'photo':
        return <PhotoField label={f.label} value={text(values[f.key])} required={f.required} hint={f.hint} error={errorOf(f.key)} onChange={(name) => set(f.key, name)} />;
    }
  }

  return (
    <div className="report-form-wrap">
      <JenisPicker value={jenis} onChange={choose} />
      {template ? (
        <>
          <p className="report-intro">{template.intro}</p>
          <ReportExample key={template.jenis} jenis={template.jenis} onUse={useExample} />
          <form className="report-form" onSubmit={submit} noValidate aria-label={`Formulir ${template.label}`}>
            {template.fields.map((f) => (
              <div key={f.key} className={`report-field report-field-${f.kind}`} onBlur={() => touch(keysOf(f))}>
                {renderField(f)}
              </div>
            ))}
            {formError ? (
              <p className="error-text report-form-error" role="alert">
                {formError}
              </p>
            ) : null}
            <div className="report-submit">
              <Button type="submit" busy={busy} disabled={!valid} className="report-submit-button">
                {busy ? 'MENYIMPAN…' : 'KIRIM'}
              </Button>
              <p className="report-missing" role="status" aria-live="polite">
                {valid ? 'Semua isian wajib sudah lengkap.' : `Belum lengkap: ${missing.join(', ')}.`}
              </p>
            </div>
          </form>
        </>
      ) : (
        <p className="muted">Pilih jenis laporan untuk menampilkan formulirnya.</p>
      )}
    </div>
  );
}
