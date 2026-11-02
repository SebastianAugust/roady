import { isInBandungRaya } from '../config';
import type { CreateAccidentRequest, Cuaca } from '../types';

/** The fields of the quick entry form of Arsip & Input, all as typed (strings), so a draft can hold half-finished text. */
export interface QuickInputValues {
  lokasi: string;
  /** datetime-local value, local time: 2026-11-02T14:30 */
  tanggal: string;
  cuaca: Cuaca | '';
  korban: string;
  lat: string;
  lng: string;
}

export const EMPTY_QUICK_INPUT: QuickInputValues = { lokasi: '', tanggal: '', cuaca: '', korban: '', lat: '', lng: '' };

export type QuickInputKey = keyof QuickInputValues;
export type QuickInputErrors = Partial<Record<QuickInputKey, string>>;

const CUACA: readonly string[] = ['cerah', 'hujan', 'lainnya'];

/** One message per invalid field, none for a valid one. `now` is passed in so the check stays pure. */
export function validateQuickInput(v: QuickInputValues, now: Date): QuickInputErrors {
  const errors: QuickInputErrors = {};
  if (v.lokasi.trim().length < 5) errors.lokasi = 'Isi lokasi kejadian, minimal 5 karakter.';

  const when = v.tanggal ? new Date(v.tanggal) : undefined;
  if (!when || Number.isNaN(when.getTime())) errors.tanggal = 'Isi tanggal dan jam kejadian.';
  else if (when.getTime() > now.getTime()) errors.tanggal = 'Tanggal kejadian tidak boleh di masa depan.';

  if (!CUACA.includes(v.cuaca)) errors.cuaca = 'Pilih kondisi cuaca.';

  if (!/^\d+$/.test(v.korban.trim())) errors.korban = 'Jumlah korban harus bilangan bulat 0 atau lebih.';

  const lat = Number(v.lat);
  const lng = Number(v.lng);
  if (v.lat.trim() === '' || !Number.isFinite(lat)) errors.lat = 'Isi latitude, atau klik peta.';
  if (v.lng.trim() === '' || !Number.isFinite(lng)) errors.lng = 'Isi longitude, atau klik peta.';
  if (!errors.lat && !errors.lng && !isInBandungRaya(lat, lng)) errors.lat = 'Titik berada di luar wilayah Bandung Raya.';
  return errors;
}

/** API-010 body of a valid form (a plain kecelakaan, as before templates existed). */
export function toCreateAccident(v: QuickInputValues): CreateAccidentRequest {
  return {
    tanggal_waktu: new Date(v.tanggal).toISOString(),
    lokasi_deskripsi: v.lokasi.trim(),
    latitude: Number(v.lat),
    longitude: Number(v.lng),
    jumlah_korban: Number(v.korban),
    kondisi_cuaca: v.cuaca === '' ? null : v.cuaca,
  };
}

// ---- Draft (kept in the browser until the entry is saved) ----

const DRAFT_KEY = 'roady.draft.arsip';

export interface Draft {
  values: QuickInputValues;
  /** When it was last saved, ISO. */
  savedAt: string;
}

export function loadDraft(): Draft | undefined {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    const draft = raw ? (JSON.parse(raw) as Draft) : undefined;
    return draft && typeof draft.savedAt === 'string' && typeof draft.values?.lokasi === 'string' ? { values: { ...EMPTY_QUICK_INPUT, ...draft.values }, savedAt: draft.savedAt } : undefined;
  } catch {
    return undefined;
  }
}

export function saveDraft(values: QuickInputValues, now: Date) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ values, savedAt: now.toISOString() } satisfies Draft));
  } catch {
    // storage blocked or full: the form keeps working, it just has no draft
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // see saveDraft
  }
}

export const isEmptyInput = (v: QuickInputValues) => (Object.keys(EMPTY_QUICK_INPUT) as QuickInputKey[]).every((k) => v[k] === EMPTY_QUICK_INPUT[k]);

/** "14:35" for a draft saved at 14:35 (HH:MM). */
export function clockText(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
