// Report templates shared by the web (Dishub: Arsip & Input) and the mobile report form (Lapor).
// One source for the three kinds of report, their fields, the choices, the example of a good entry and the validation,
// so both apps ask the same questions and apply the same rules. Plain TypeScript with no imports: copy or import it as is.
// All user-facing text is Bahasa Indonesia; identifiers are English or the column names of docs/02-database.md.

export type JenisLaporan = 'kecelakaan' | 'nyaris_celaka' | 'masalah_jalan';

export interface Choice {
  value: string;
  label: string;
}

export const JENIS_LAPORAN: readonly (Choice & { value: JenisLaporan; description: string })[] = [
  { value: 'kecelakaan', label: 'Kecelakaan', description: 'Kejadian yang sudah menimbulkan korban atau kerusakan.' },
  { value: 'nyaris_celaka', label: 'Nyaris celaka', description: 'Hampir terjadi kecelakaan, tetapi berhasil dihindari.' },
  { value: 'masalah_jalan', label: 'Masalah jalan', description: 'Kondisi jalan yang membahayakan, belum ada kecelakaan.' },
];

export const JENIS_LABEL: Record<JenisLaporan, string> = {
  kecelakaan: 'Kecelakaan',
  nyaris_celaka: 'Nyaris celaka',
  masalah_jalan: 'Masalah jalan',
};

// ---- Choices ----

export const KENDARAAN: readonly Choice[] = [
  { value: 'motor', label: 'Motor' },
  { value: 'mobil', label: 'Mobil' },
  { value: 'bus', label: 'Bus' },
  { value: 'truk', label: 'Truk' },
  { value: 'angkot', label: 'Angkot' },
  { value: 'sepeda', label: 'Sepeda' },
  { value: 'lainnya', label: 'Lainnya' },
];

/** Same values as Cuaca in docs/02 (cerah | hujan | lainnya). */
export const CUACA: readonly Choice[] = [
  { value: 'cerah', label: 'Cerah' },
  { value: 'hujan', label: 'Hujan' },
  { value: 'lainnya', label: 'Lainnya' },
];

export const KONDISI_JALAN: readonly Choice[] = [
  { value: 'kering_baik', label: 'Kering dan baik' },
  { value: 'basah_licin', label: 'Basah atau licin' },
  { value: 'berlubang', label: 'Berlubang atau rusak' },
  { value: 'berpasir', label: 'Berpasir atau berkerikil' },
  { value: 'tergenang', label: 'Tergenang air' },
];

export const DUGAAN_PENYEBAB: readonly Choice[] = [
  { value: 'kecepatan', label: 'Kecepatan berlebih' },
  { value: 'lengah', label: 'Lengah atau tidak fokus' },
  { value: 'langgar_rambu', label: 'Melanggar rambu atau lampu lalu lintas' },
  { value: 'jalan_licin_rusak', label: 'Jalan licin atau rusak' },
  { value: 'kendaraan_bermasalah', label: 'Kendaraan bermasalah (rem, ban)' },
  { value: 'pejalan_kaki', label: 'Pejalan kaki menyeberang mendadak' },
  { value: 'belum_diketahui', label: 'Belum diketahui' },
];

export const HAMPIR_TERJADI: readonly Choice[] = [
  { value: 'tabrakan_kendaraan', label: 'Tabrakan dengan kendaraan lain' },
  { value: 'tabrak_pejalan', label: 'Menabrak pejalan kaki' },
  { value: 'tergelincir', label: 'Tergelincir atau kehilangan kendali' },
  { value: 'keluar_jalur', label: 'Keluar dari jalur atau masuk jurang' },
  { value: 'lainnya', label: 'Lainnya' },
];

export const PENYEBAB_NYARIS: readonly Choice[] = [
  { value: 'pengemudi_lain', label: 'Pengemudi lain tidak memberi tanda atau melanggar' },
  { value: 'jalan_licin_rusak', label: 'Jalan licin atau rusak' },
  { value: 'pandangan_terhalang', label: 'Pandangan terhalang' },
  { value: 'kendaraan_bermasalah', label: 'Kendaraan bermasalah (rem, ban)' },
  { value: 'cuaca_buruk', label: 'Cuaca buruk' },
  { value: 'lainnya', label: 'Lainnya' },
];

export const JENIS_MASALAH: readonly Choice[] = [
  { value: 'lubang', label: 'Lubang' },
  { value: 'marka_pudar', label: 'Marka pudar' },
  { value: 'lampu_mati', label: 'Lampu mati' },
  { value: 'rambu_rusak', label: 'Rambu rusak' },
  { value: 'genangan', label: 'Genangan' },
  { value: 'lainnya', label: 'Lainnya' },
];

export const TINGKAT_BAHAYA: readonly Choice[] = [
  { value: 'rendah', label: 'Rendah' },
  { value: 'sedang', label: 'Sedang' },
  { value: 'tinggi', label: 'Tinggi' },
];

/** Minimum lengths of the free-text fields (characters, after trim). */
export const MIN_LENGTH = { kronologiKecelakaan: 30, kronologiNyaris: 20, deskripsiMasalah: 20 } as const;

// ---- Stored shape of a template answer (KECELAKAAN_RESMI.detail, a JSON column; docs/02 proposal) ----

export interface KecelakaanDetail {
  kendaraan: string[];
  korban_meninggal: number;
  korban_luka_berat: number;
  korban_luka_ringan: number;
  kondisi_jalan: string;
  dugaan_penyebab: string;
  kronologi: string;
}

export interface NyarisCelakaDetail {
  kendaraan: string[];
  hampir_terjadi: string;
  penyebab: string;
  kronologi: string;
}

export interface MasalahJalanDetail {
  jenis_masalah: string;
  tingkat_bahaya: string;
  deskripsi: string;
}

export type ReportDetail = KecelakaanDetail | NyarisCelakaDetail | MasalahJalanDetail;

// ---- Form structure ----

export type FieldKind = 'datetime' | 'location' | 'multiselect' | 'select' | 'count' | 'textarea' | 'photo';

export interface TemplateField {
  /**
   * Key of the answer. A 'location' field owns three answers: latitude, longitude and alamat_teks (see LOCATION_KEYS);
   * every other field owns the one answer under `key`.
   */
  key: string;
  label: string;
  kind: FieldKind;
  required: boolean;
  options?: readonly Choice[];
  /** Minimum characters for 'textarea'. */
  minLength?: number;
  /** For 'textarea': a complete example sentence, not a hint like "Ceritakan kejadian". */
  placeholder?: string;
  hint?: string;
}

/** Answers as typed in the form: text for most fields, a list of values for 'multiselect'. A photo is its file name ('' = none). */
export type ReportValues = Record<string, string | string[]>;

export interface ReportTemplate {
  jenis: JenisLaporan;
  label: string;
  intro: string;
  fields: readonly TemplateField[];
  /** One complete, good entry: shown beside the form and used by "Isi dengan contoh". */
  contoh: ReportValues;
}

export const LOCATION_KEYS = { latitude: 'latitude', longitude: 'longitude', alamat: 'alamat_teks' } as const;

const KRONOLOGI_KECELAKAAN =
  'Sekitar pukul 17.40 sebuah motor melaju dari arah barat dan menabrak bagian belakang truk yang berhenti mendadak di depan Summarecon. Pengendara motor terjatuh dan dibawa ke rumah sakit terdekat; arus lalu lintas tersendat sekitar 20 menit.';
const KRONOLOGI_NYARIS =
  'Mobil keluar dari gang tanpa memberi tanda saat saya melaju sekitar 40 km/jam. Saya mengerem mendadak dan motor oleng, tetapi tidak terjadi tabrakan.';
const DESKRIPSI_MASALAH =
  'Lubang sedalam kira-kira 15 cm di lajur kiri, tepat setelah lampu merah. Sudah dua motor hampir jatuh saat pagi hari karena lubang tertutup genangan.';

const WAKTU: TemplateField = { key: 'waktu_kejadian', label: 'Waktu kejadian', kind: 'datetime', required: true };
const LOKASI: TemplateField = {
  key: 'lokasi',
  label: 'Lokasi',
  kind: 'location',
  required: true,
  hint: 'Klik peta untuk menandai titik, lalu lengkapi alamat atau nama jalan.',
};

export const TEMPLATES: Record<JenisLaporan, ReportTemplate> = {
  kecelakaan: {
    jenis: 'kecelakaan',
    label: JENIS_LABEL.kecelakaan,
    intro: 'Catat kecelakaan yang sudah terjadi: kapan, di mana, siapa yang terlibat, korban, dan kronologinya.',
    fields: [
      WAKTU,
      LOKASI,
      { key: 'kendaraan', label: 'Jenis kendaraan yang terlibat', kind: 'multiselect', required: true, options: KENDARAAN, hint: 'Boleh lebih dari satu.' },
      { key: 'korban_meninggal', label: 'Korban meninggal', kind: 'count', required: true, hint: 'Isi 0 bila tidak ada.' },
      { key: 'korban_luka_berat', label: 'Korban luka berat', kind: 'count', required: true, hint: 'Isi 0 bila tidak ada.' },
      { key: 'korban_luka_ringan', label: 'Korban luka ringan', kind: 'count', required: true, hint: 'Isi 0 bila tidak ada.' },
      { key: 'cuaca', label: 'Kondisi cuaca', kind: 'select', required: true, options: CUACA },
      { key: 'kondisi_jalan', label: 'Kondisi jalan', kind: 'select', required: true, options: KONDISI_JALAN },
      { key: 'dugaan_penyebab', label: 'Dugaan penyebab', kind: 'select', required: true, options: DUGAAN_PENYEBAB },
      { key: 'kronologi', label: 'Kronologi', kind: 'textarea', required: true, minLength: MIN_LENGTH.kronologiKecelakaan, placeholder: KRONOLOGI_KECELAKAAN },
      { key: 'foto', label: 'Bukti foto', kind: 'photo', required: true, hint: 'Foto lokasi atau kendaraan setelah kejadian.' },
    ],
    contoh: {
      waktu_kejadian: '2026-10-24T17:40',
      latitude: '-6.9438',
      longitude: '107.6962',
      alamat_teks: 'Jl. Soekarno Hatta, Cisaranten Kidul, Kec. Gedebage, Kota Bandung',
      kendaraan: ['motor', 'truk'],
      korban_meninggal: '0',
      korban_luka_berat: '1',
      korban_luka_ringan: '1',
      cuaca: 'hujan',
      kondisi_jalan: 'basah_licin',
      dugaan_penyebab: 'kecepatan',
      kronologi: KRONOLOGI_KECELAKAAN,
      foto: 'foto-lokasi-kejadian.jpg',
    },
  },
  nyaris_celaka: {
    jenis: 'nyaris_celaka',
    label: JENIS_LABEL.nyaris_celaka,
    intro: 'Catat kejadian yang hampir menjadi kecelakaan, supaya titik rawan terlihat sebelum ada korban.',
    fields: [
      WAKTU,
      LOKASI,
      { key: 'kendaraan', label: 'Jenis kendaraan yang terlibat', kind: 'multiselect', required: true, options: KENDARAAN, hint: 'Boleh lebih dari satu.' },
      { key: 'hampir_terjadi', label: 'Hal yang hampir terjadi', kind: 'select', required: true, options: HAMPIR_TERJADI },
      { key: 'penyebab', label: 'Penyebab', kind: 'select', required: true, options: PENYEBAB_NYARIS },
      { key: 'kronologi', label: 'Kronologi singkat', kind: 'textarea', required: true, minLength: MIN_LENGTH.kronologiNyaris, placeholder: KRONOLOGI_NYARIS },
      { key: 'foto', label: 'Foto', kind: 'photo', required: false, hint: 'Opsional.' },
    ],
    contoh: {
      waktu_kejadian: '2026-10-23T08:15',
      latitude: '-6.9419',
      longitude: '107.6701',
      alamat_teks: 'Jl. Soekarno Hatta, Margasari, Kec. Buahbatu, Kota Bandung',
      kendaraan: ['motor', 'mobil'],
      hampir_terjadi: 'tabrakan_kendaraan',
      penyebab: 'pengemudi_lain',
      kronologi: KRONOLOGI_NYARIS,
      foto: '',
    },
  },
  masalah_jalan: {
    jenis: 'masalah_jalan',
    label: JENIS_LABEL.masalah_jalan,
    intro: 'Catat kondisi jalan yang membahayakan pengguna jalan, walau belum ada kecelakaan.',
    fields: [
      { key: 'jenis_masalah', label: 'Jenis masalah', kind: 'select', required: true, options: JENIS_MASALAH },
      { key: 'tingkat_bahaya', label: 'Tingkat bahaya', kind: 'select', required: true, options: TINGKAT_BAHAYA },
      LOKASI,
      { key: 'deskripsi', label: 'Deskripsi', kind: 'textarea', required: true, minLength: MIN_LENGTH.deskripsiMasalah, placeholder: DESKRIPSI_MASALAH },
      { key: 'foto', label: 'Foto', kind: 'photo', required: true, hint: 'Foto kondisi jalan yang dilaporkan.' },
    ],
    contoh: {
      jenis_masalah: 'lubang',
      tingkat_bahaya: 'tinggi',
      latitude: '-6.9183',
      longitude: '107.7256',
      alamat_teks: 'Jl. Raya Cibiru, Cipadung, Kec. Cibiru, Kota Bandung',
      deskripsi: DESKRIPSI_MASALAH,
      foto: 'lubang-jalan-cibiru.jpg',
    },
  },
};

// ---- Helpers ----

/** Empty answers for a template: '' for text, [] for multiselect. */
export function emptyValues(jenis: JenisLaporan): ReportValues {
  const values: ReportValues = {};
  for (const f of TEMPLATES[jenis].fields) {
    if (f.kind === 'location') {
      values[LOCATION_KEYS.latitude] = '';
      values[LOCATION_KEYS.longitude] = '';
      values[LOCATION_KEYS.alamat] = '';
    } else values[f.key] = f.kind === 'multiselect' ? [] : '';
  }
  return values;
}

export interface ValidationContext {
  /** Defaults to the current time. */
  now?: Date;
  /** The area a report may be in (Bandung Raya); omitted = no area check. */
  isInArea?: (latitude: number, longitude: number) => boolean;
}

const NUMBER = /^-?\d+(\.\d+)?$/;
const text = (v: string | string[] | undefined) => (typeof v === 'string' ? v.trim() : '');

/**
 * Errors of an answer set, keyed by answer key (a location field reports under latitude, longitude and alamat_teks).
 * Empty object = valid. Required fields say what to fill in; limits say the limit and where the entry stands.
 */
export function validateReport(jenis: JenisLaporan, values: ReportValues, ctx: ValidationContext = {}): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of TEMPLATES[jenis].fields) {
    const v = values[f.key];
    switch (f.kind) {
      case 'datetime': {
        const raw = text(v);
        if (!raw) errors[f.key] = `${f.label} wajib diisi.`;
        else {
          // No zone suffix: read as local time (WIB for the people using it).
          const when = new Date(raw);
          if (Number.isNaN(when.getTime())) errors[f.key] = `${f.label} tidak valid.`;
          else if (when > (ctx.now ?? new Date())) errors[f.key] = `${f.label} tidak boleh di masa depan.`;
        }
        break;
      }
      case 'location': {
        const lat = text(values[LOCATION_KEYS.latitude]);
        const lng = text(values[LOCATION_KEYS.longitude]);
        if (!lat) errors[LOCATION_KEYS.latitude] = 'Latitude wajib diisi, atau klik lokasi di peta.';
        else if (!NUMBER.test(lat)) errors[LOCATION_KEYS.latitude] = 'Latitude harus berupa angka, misalnya -6.939305.';
        if (!lng) errors[LOCATION_KEYS.longitude] = 'Longitude wajib diisi, atau klik lokasi di peta.';
        else if (!NUMBER.test(lng)) errors[LOCATION_KEYS.longitude] = 'Longitude harus berupa angka, misalnya 107.661631.';
        if (!errors[LOCATION_KEYS.latitude] && !errors[LOCATION_KEYS.longitude] && ctx.isInArea && !ctx.isInArea(Number(lat), Number(lng)))
          errors[LOCATION_KEYS.latitude] = 'Koordinat berada di luar wilayah Bandung Raya.';
        if (!text(values[LOCATION_KEYS.alamat])) errors[LOCATION_KEYS.alamat] = 'Alamat atau nama jalan wajib diisi.';
        break;
      }
      case 'multiselect':
        if (f.required && (!Array.isArray(v) || v.length === 0)) errors[f.key] = `Pilih minimal satu: ${f.label.toLowerCase()}.`;
        break;
      case 'select':
        if (f.required && !text(v)) errors[f.key] = `Pilih ${f.label.toLowerCase()}.`;
        break;
      case 'count': {
        const raw = text(v);
        if (!raw) errors[f.key] = `${f.label} wajib diisi (isi 0 bila tidak ada).`;
        else if (!/^\d+$/.test(raw)) errors[f.key] = `${f.label} harus bilangan bulat 0 atau lebih.`;
        break;
      }
      case 'textarea': {
        const n = text(v).length;
        if (f.required && n === 0) errors[f.key] = `${f.label} wajib diisi, minimal ${f.minLength ?? 1} karakter.`;
        else if (f.minLength && n > 0 && n < f.minLength) errors[f.key] = `${f.label} minimal ${f.minLength} karakter (baru ${n}). Ceritakan apa, di mana, dan bagaimana kejadiannya.`;
        break;
      }
      case 'photo':
        if (f.required && !text(v)) errors[f.key] = `${f.label} wajib dilampirkan.`;
        break;
    }
  }
  return errors;
}

/** Label of a choice value, or the value itself when it is not in the list. */
export const choiceLabel = (options: readonly Choice[], value: string) => options.find((o) => o.value === value)?.label ?? value;

/** Label/value rows of a stored detail, for read-only display (Admin and Dishub detail pages). */
export function detailRows(jenis: JenisLaporan, detail: ReportDetail): { label: string; value: string }[] {
  const d = detail as unknown as Record<string, string | number | string[]>;
  const list = (key: string, options: readonly Choice[]) =>
    (Array.isArray(d[key]) ? (d[key] as string[]) : []).map((v) => choiceLabel(options, v)).join(', ') || '-';
  const one = (key: string, options: readonly Choice[]) => choiceLabel(options, String(d[key] ?? '')) || '-';
  switch (jenis) {
    case 'kecelakaan':
      return [
        { label: 'Kendaraan terlibat', value: list('kendaraan', KENDARAAN) },
        { label: 'Korban meninggal', value: `${d.korban_meninggal ?? 0} orang` },
        { label: 'Korban luka berat', value: `${d.korban_luka_berat ?? 0} orang` },
        { label: 'Korban luka ringan', value: `${d.korban_luka_ringan ?? 0} orang` },
        { label: 'Kondisi jalan', value: one('kondisi_jalan', KONDISI_JALAN) },
        { label: 'Dugaan penyebab', value: one('dugaan_penyebab', DUGAAN_PENYEBAB) },
        { label: 'Kronologi', value: String(d.kronologi ?? '-') },
      ];
    case 'nyaris_celaka':
      return [
        { label: 'Kendaraan terlibat', value: list('kendaraan', KENDARAAN) },
        { label: 'Hal yang hampir terjadi', value: one('hampir_terjadi', HAMPIR_TERJADI) },
        { label: 'Penyebab', value: one('penyebab', PENYEBAB_NYARIS) },
        { label: 'Kronologi', value: String(d.kronologi ?? '-') },
      ];
    case 'masalah_jalan':
      return [
        { label: 'Jenis masalah', value: one('jenis_masalah', JENIS_MASALAH) },
        { label: 'Tingkat bahaya', value: one('tingkat_bahaya', TINGKAT_BAHAYA) },
        { label: 'Deskripsi', value: String(d.deskripsi ?? '-') },
      ];
  }
}
