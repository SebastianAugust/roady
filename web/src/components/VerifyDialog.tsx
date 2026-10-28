import { useState } from 'react';
import { api, ApiError } from '../api';
import { useAuth } from '../auth/useAuth';
import { errorMessage } from '../hooks/useApi';
import { alasanError, QUICK_REJECT_REASONS } from '../lib/alasan';
import { KATEGORI_LABEL, placeText } from '../lib/format';
import type { KeputusanVerifikasi, Laporan, LaporanAdmin } from '../types';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { ReasonField } from './ReasonField';
import { useToast } from './toastContext';

interface Props {
  /** The report and the decision the Admin clicked; undefined keeps the dialog closed. */
  pending: { report: Laporan; keputusan: KeputusanVerifikasi } | undefined;
  onClose: () => void;
  /** Called after API-008 succeeded, with the updated report. */
  onDecided: (report: LaporanAdmin) => void;
}

const VERB: Record<KeputusanVerifikasi, string> = { approved: 'disetujui', rejected: 'ditolak' };

/**
 * Asks before API-008, because the decision notifies the reporter and cannot be undone from the web.
 * On success it shows a toast that includes the (simulated) notification; zone scores wait for the scheduler.
 */
export function VerifyDialog({ pending, onClose, onDecided }: Props) {
  const { signOut } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [alasan, setAlasan] = useState('');
  const [alasanMsg, setAlasanMsg] = useState<string>();

  const close = () => {
    setError(undefined);
    setAlasan('');
    setAlasanMsg(undefined);
    onClose();
  };

  async function confirm() {
    if (!pending) return;
    const { report, keputusan } = pending;
    // A rejection needs a written reason (min. 10 characters) before anything is sent.
    if (keputusan === 'rejected' && alasanError(alasan)) {
      setAlasanMsg(alasanError(alasan));
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      const { laporan, notifikasi_terkirim } = await api.verifyReport(report.id_report, keputusan === 'rejected' ? { keputusan, alasan: alasan.trim() } : { keputusan });
      toast(
        `Laporan #${laporan.id_report} ${VERB[keputusan]}.` +
          (notifikasi_terkirim ? ' Notifikasi dikirim ke pelapor (simulasi).' : ' Notifikasi ke pelapor gagal dikirim.'),
      );
      setAlasan('');
      onDecided(laporan);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) signOut();
      else if (err instanceof ApiError && err.fieldErrors?.alasan) setAlasanMsg(err.fieldErrors.alasan);
      else setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const approve = pending?.keputusan === 'approved';
  return (
    <Dialog
      open={pending !== undefined}
      title={approve ? 'Setujui laporan ini?' : 'Tolak laporan ini?'}
      onClose={close}
      actions={
        <>
          <Button variant="secondary" onClick={close} disabled={busy}>
            Batal
          </Button>
          <Button variant={approve ? 'primary' : 'danger'} onClick={confirm} busy={busy} disabled={!approve && alasanError(alasan) !== undefined}>
            {approve ? 'SETUJUI' : 'TOLAK'}
          </Button>
        </>
      }
    >
      {pending ? (
        <>
          <p>
            Laporan #{pending.report.id_report} · {KATEGORI_LABEL[pending.report.kategori]} · {placeText(pending.report)}
          </p>
          <p className="muted">
            {approve
              ? 'Laporan yang disetujui dihitung dengan bobot penuh pada perhitungan skor zona berikutnya.'
              : 'Laporan yang ditolak tidak dihitung pada skor zona.'}{' '}
            Pelapor akan menerima notifikasi{approve ? '' : ' beserta alasannya'}. Skor zona diperbarui oleh penjadwal, bukan seketika.
          </p>
          {approve ? null : (
            <ReasonField
              label="Alasan penolakan"
              value={alasan}
              error={alasanMsg}
              disabled={busy}
              quickReasons={QUICK_REJECT_REASONS}
              onChange={(v) => {
                setAlasan(v);
                setAlasanMsg(undefined);
              }}
            />
          )}
          {error ? (
            <p className="error-text" role="alert">
              {error}
            </p>
          ) : null}
        </>
      ) : null}
    </Dialog>
  );
}
