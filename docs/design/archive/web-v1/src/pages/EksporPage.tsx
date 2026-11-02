import { useCallback, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, ApiError } from '../api';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/Button';
import { DownloadIcon } from '../components/icons';
import { PageHeader } from '../components/PageHeader';
import { RadioCard } from '../components/RadioCard';
import { SelectField } from '../components/SelectField';
import { useToast } from '../components/toastContext';
import { Chip } from '../components/ui';
import { APP_NAME } from '../constants';
import { errorMessage, useApi } from '../hooks/useApi';
import { downloadBlob } from '../lib/download';
import { checkExport, FORMAT_EKSPOR } from '../lib/exportRules';
import { buildPdf, buildXlsx, parseCsv } from '../lib/exportFiles';
import { formatDateTime, localDayKey, todayIso } from '../lib/format';
import './EksporPage.css';

const OPTIONS = [
  { value: 'zona', title: 'Data Zona', description: 'Data zona rawan kecelakaan.' },
  { value: 'laporan', title: 'Data Laporan', description: 'Laporan kejadian dari masyarakat, tanpa identitas pelapor.' },
];

const TITLE: Record<string, string> = { zona: 'Data Zona', laporan: 'Data Laporan' };
const RANGES = [
  { value: '7', label: '7 hari terakhir' },
  { value: '30', label: '30 hari terakhir' },
  { value: '90', label: '90 hari terakhir' },
] as const;
type Range = (typeof RANGES)[number]['value'];

const MIME: Record<string, string> = {
  csv: 'text/csv;charset=utf-8',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** The last `days` days including today, as the dari/sampai filter of API-012. */
function rangeQuery(days: number) {
  return { dari: localDayKey(new Date(Date.now() - (days - 1) * 86_400_000)), sampai: todayIso() };
}

interface Ready {
  /** jenis|format|range the file was made for; a different choice on screen means this file is stale. */
  key: string;
  filename: string;
  blob: Blob;
  rows: number;
}

/**
 * Figma "dishub - ekspor data" (1044:3413), API-013, and the Ekspor panel of docs/design/prototype-web-v2.html:
 * format (CSV / XLSX / PDF), range (7 / 30 / 90 days), an estimate of the rows, a progress bar, "Siap diunduh" and a Toast.
 * The API answers CSV only; XLSX and PDF are written here from the same rows (lib/exportFiles.ts). The range filters
 * Data Laporan; zones have no date, so Data Zona is always the full list.
 * `?jenis=` and `?format=` in the URL preselect the request; whatever they hold is checked on submit, so an unknown
 * value is rejected with a message (jenis also by the API, 422).
 */
export function EksporPage() {
  const { signOut } = useAuth();
  const toast = useToast();
  const [params] = useSearchParams();
  const [jenis, setJenis] = useState(params.get('jenis') ?? '');
  const [format, setFormat] = useState(params.get('format') ?? 'csv');
  const [range, setRange] = useState<Range>('30');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState<number>();
  const [ready, setReady] = useState<Ready>();

  const busy = progress !== undefined;
  const days = Number(range);
  const key = `${jenis}|${format}|${jenis === 'laporan' ? range : '-'}`;
  const fileReady = ready?.key === key ? ready : undefined;

  const estimate = useApi(
    useCallback(async () => {
      if (jenis === 'zona') return (await api.getDishubZones()).length;
      if (jenis === 'laporan') return (await api.getDishubReports(rangeQuery(days))).length;
      return null;
    }, [jenis, days]),
  );
  const rows = estimate.state.status === 'ready' ? estimate.state.data : null;

  function change(apply: () => void) {
    apply();
    setErrors({});
  }

  async function build() {
    const check = checkExport(jenis, format, FORMAT_EKSPOR);
    if (!check.ok) {
      setErrors(check.errors);
      return;
    }
    setErrors({});
    setReady(undefined);
    setProgress(8);
    try {
      await sleep(150);
      const csv = await api.exportData({ jenis: check.jenis, format: 'csv', ...(check.jenis === 'laporan' ? rangeQuery(days) : {}) });
      setProgress(55);
      await sleep(200);
      const table = parseCsv(csv.content);
      const count = Math.max(table.length - 1, 0);
      const base = csv.filename.replace(/\.csv$/i, '');
      let blob: Blob;
      if (check.format === 'xlsx') blob = new Blob([buildXlsx(table, TITLE[check.jenis])], { type: MIME.xlsx });
      else if (check.format === 'pdf') {
        const subtitle = `${APP_NAME} · dibuat ${formatDateTime(new Date().toISOString())} · ${count} baris${check.jenis === 'laporan' ? ` · ${range} hari terakhir` : ''}`;
        blob = new Blob([buildPdf(`${TITLE[check.jenis]} ${APP_NAME}`, subtitle, table)], { type: MIME.pdf });
      } else blob = new Blob(['﻿', csv.content], { type: MIME.csv }); // BOM: Excel reads the CSV as UTF-8
      setProgress(85);
      await sleep(150);
      setProgress(100);
      await sleep(250);
      setReady({ key, filename: `${base}.${check.format}`, blob, rows: count });
      toast(`Ekspor ${check.format.toUpperCase()} siap diunduh.`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) signOut();
      else if (err instanceof ApiError && err.status === 422) setErrors(err.fieldErrors ?? { jenis: err.message });
      else setErrors({ form: errorMessage(err) });
    } finally {
      setProgress(undefined);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (fileReady) downloadBlob(fileReady.filename, fileReady.blob);
    else void build();
  }

  const messages = Object.values(errors);
  const empty = rows === 0;
  return (
    <>
      <PageHeader title="Ekspor Data" subtitle={`Unduh data zona dan laporan ${APP_NAME} untuk kebutuhan laporan internal`} />
      <form className="ekspor-card glass-in" onSubmit={submit} noValidate>
        <fieldset className="ekspor-options" disabled={busy} aria-describedby={messages.length ? 'ekspor-errors' : undefined}>
          <legend className="ekspor-legend">Pilih Jenis Data</legend>
          {OPTIONS.map((o) => (
            <RadioCard
              key={o.value}
              name="jenis"
              value={o.value}
              title={o.title}
              description={o.description}
              checked={jenis === o.value}
              onChange={() => change(() => setJenis(o.value))}
            />
          ))}
        </fieldset>

        <fieldset className="ekspor-group" disabled={busy}>
          <legend className="field-label">Format</legend>
          <div className="ekspor-chips">
            {FORMAT_EKSPOR.map((f) => (
              <Chip key={f} pressed={format === f} onClick={() => change(() => setFormat(f))}>
                {f.toUpperCase()}
              </Chip>
            ))}
          </div>
          {format === 'pdf' ? <span className="field-hint">PDF memotong teks yang panjang. Pakai CSV atau XLSX untuk teks lengkap.</span> : null}
        </fieldset>

        <SelectField
          label="Rentang waktu"
          value={range}
          options={[...RANGES]}
          onChange={(v) => v && change(() => setRange(v))}
          disabled={busy || jenis === 'zona'}
        />

        <p className="ekspor-estimate" aria-live="polite">
          {jenis === '' || (jenis !== 'zona' && jenis !== 'laporan')
            ? 'Pilih jenis data untuk melihat perkiraan jumlah baris.'
            : estimate.state.status === 'loading'
              ? 'Menghitung perkiraan…'
              : rows === null
                ? 'Perkiraan jumlah baris belum tersedia.'
                : empty
                  ? 'Tidak ada data pada rentang ini.'
                  : `Perkiraan: ${rows} baris, format ${format.toUpperCase() || '-'}.${jenis === 'zona' ? ' Rentang waktu tidak berlaku untuk Data Zona.' : ''}`}
        </p>

        {messages.length ? (
          <div id="ekspor-errors" className="ekspor-errors" role="alert">
            {messages.map((m) => (
              <p key={m} className="error-text">
                {m}
              </p>
            ))}
          </div>
        ) : null}

        {busy ? (
          <div className="ekspor-progress" role="progressbar" aria-label="Kemajuan ekspor" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <i style={{ width: `${progress}%` }} />
          </div>
        ) : null}
        <div aria-live="polite">
          {fileReady ? (
            <span className="ekspor-ready">
              Siap diunduh · {fileReady.filename} · {fileReady.rows} baris
            </span>
          ) : null}
        </div>

        <Button type="submit" busy={busy} disabled={empty && !fileReady} className="ekspor-submit">
          {busy ? null : <DownloadIcon />}
          {busy ? 'MENYIAPKAN FILE…' : fileReady ? `UNDUH FILE ${format.toUpperCase()}` : 'EKSPOR DATA'}
        </Button>
      </form>
    </>
  );
}
