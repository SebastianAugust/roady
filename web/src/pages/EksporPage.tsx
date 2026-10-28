import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, ApiError } from '../api';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/Button';
import { CloudDownloadIcon, DownloadIcon } from '../components/icons';
import { PageHeader } from '../components/PageHeader';
import { RadioCard } from '../components/RadioCard';
import { SuccessScreen } from '../components/SuccessScreen';
import { APP_NAME } from '../constants';
import { errorMessage } from '../hooks/useApi';
import { downloadText } from '../lib/download';
import './EksporPage.css';

const OPTIONS = [
  { value: 'zona', title: 'Data Zona', description: 'Data zona rawan kecelakaan.' },
  { value: 'laporan', title: 'Data Laporan', description: 'Laporan kejadian dari masyarakat, tanpa identitas pelapor.' },
];

/**
 * Figma "dishub - ekspor data" (1044:3413) and its confirmation (1053:8352), API-013.
 * `?jenis=` and `?format=` in the URL preselect the request (e.g. a link from another page); whatever they hold is
 * sent as-is, so an unknown jenis or format is rejected by the API (422) and its message is shown here.
 */
export function EksporPage() {
  const { signOut } = useAuth();
  const [params] = useSearchParams();
  const [jenis, setJenis] = useState(params.get('jenis') ?? '');
  const format = params.get('format') ?? 'csv';
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string>();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!jenis) {
      setErrors({ jenis: 'Pilih jenis data yang akan diekspor.' });
      return;
    }
    setBusy(true);
    setErrors({});
    try {
      const file = await api.exportData({ jenis, format });
      downloadText(file.filename, file.content);
      setDone(file.filename);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) signOut();
      else if (err instanceof ApiError && err.status === 422) setErrors(err.fieldErrors ?? { jenis: err.message });
      else setErrors({ form: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <SuccessScreen
        icon={<CloudDownloadIcon />}
        message="Data sudah diekspor!"
        detail={`File ${done} tersimpan di folder unduhan.`}
        onDone={() => setDone(undefined)}
      />
    );
  }

  const messages = Object.values(errors);
  return (
    <>
      <PageHeader title="Ekspor Data" subtitle={`Unduh data zona dan laporan ${APP_NAME} untuk kebutuhan laporan internal`} />
      <form className="ekspor-card glass-in" onSubmit={submit} noValidate>
        <fieldset className="ekspor-options" aria-describedby={messages.length ? 'ekspor-errors' : undefined}>
          <legend className="ekspor-legend">Pilih Jenis Data</legend>
          {OPTIONS.map((o) => (
            <RadioCard
              key={o.value}
              name="jenis"
              value={o.value}
              title={o.title}
              description={o.description}
              checked={jenis === o.value}
              onChange={() => {
                setJenis(o.value);
                setErrors({});
              }}
            />
          ))}
        </fieldset>
        <p className="ekspor-format">Format: {format.toUpperCase() || '-'}</p>
        {messages.length ? (
          <div id="ekspor-errors" className="ekspor-errors" role="alert">
            {messages.map((m) => (
              <p key={m} className="error-text">
                {m}
              </p>
            ))}
          </div>
        ) : null}
        <Button type="submit" busy={busy} className="ekspor-submit">
          {busy ? null : <DownloadIcon />}
          {busy ? 'MENYIAPKAN FILE…' : 'UNDUH FILE CSV'}
        </Button>
      </form>
    </>
  );
}
