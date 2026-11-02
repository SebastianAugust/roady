import { useState } from 'react';
import { api, ApiError } from '../api';
import { useAuth } from '../auth/useAuth';
import { errorMessage } from '../hooks/useApi';
import { ALASAN_VERIFIKASI_MIN_LENGTH, alasanError, composeAlasan, QUICK_APPROVE_REASONS, QUICK_REJECT_REASONS } from '../lib/alasan';
import { KATEGORI_LABEL, placeText } from '../lib/format';
import type { KeputusanVerifikasi, Laporan, LaporanAdmin } from '../types';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { PresetReasonField } from './PresetReasonField';
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
 * Asks before API-008, because the decision notifies the reporter and cannot be undone from the web. Approving and
 * rejecting both need a written reason (a ready-made one and/or a note, min. 15 characters together); it is kept with
 * who decided and when, and shown on the report's Peninjauan card. On success it shows a toast that includes the
 * (simulated) notification; zone scores wait for the scheduler.
 */
export function VerifyDialog({ pending, onClose, onDecided }: Props) {
  const { signOut } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [preset, setPreset] = useState('');
  const [note, setNote] = useState('');
  const [alasanMsg, setAlasanMsg] = useState<string>();

  const alasan = composeAlasan(preset, note);
  const invalid = alasanError(alasan, ALASAN_VERIFIKASI_MIN_LENGTH) !== undefined;

  const reset = () => {
    setError(undefined);
    setPreset('');
    setNote('');
    setAlasanMsg(undefined);
  };
  const close = () => {
    reset();
    onClose();
  };

  async function confirm() {
    if (!pending || invalid) return;
    const { report, keputusan } = pending;
    setBusy(true);
    setError(undefined);
    try {
      const { laporan, notifikasi_terkirim } = await api.verifyReport(report.id_report, { keputusan, alasan });
      toast(
        `Laporan #${laporan.id_report} ${VERB[keputusan]}.` +
          (notifikasi_terkirim ? ' Notifikasi dikirim ke pelapor (simulasi).' : ' Notifikasi ke pelapor gagal dikirim.'),
      );
      reset();
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
          <Button variant={approve ? 'primary' : 'danger'} onClick={confirm} busy={busy} disabled={invalid}>
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
            Pelapor akan menerima notifikasi beserta alasannya. Alasan, nama Anda, dan waktunya tersimpan di riwayat peninjauan. Skor zona diperbarui oleh penjadwal, bukan seketika.
          </p>
          <PresetReasonField
            label={approve ? 'Alasan persetujuan' : 'Alasan penolakan'}
            presets={approve ? QUICK_APPROVE_REASONS : QUICK_REJECT_REASONS}
            preset={preset}
            onPresetChange={(p) => {
              setPreset(p);
              setAlasanMsg(undefined);
            }}
            note={note}
            onNoteChange={(n) => {
              setNote(n);
              setAlasanMsg(undefined);
            }}
            min={ALASAN_VERIFIKASI_MIN_LENGTH}
            error={alasanMsg}
            disabled={busy}
          />
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
