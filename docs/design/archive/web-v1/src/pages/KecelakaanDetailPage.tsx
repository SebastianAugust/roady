import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../api';
import { useAuth } from '../auth/useAuth';
import { AccidentInfo } from '../components/AccidentInfo';
import { Button } from '../components/Button';
import { DetailHeader } from '../components/DetailHeader';
import { Dialog } from '../components/Dialog';
import { LoadState } from '../components/LoadState';
import { IncidentMap } from '../components/IncidentMap';
import { ReasonField } from '../components/ReasonField';
import { useToast } from '../components/toastContext';
import { errorMessage, useApi } from '../hooks/useApi';
import { alasanError } from '../lib/alasan';
import { formatWib } from '../lib/format';
import { ROUTES } from '../routes';

/**
 * Figma "detail - Kelola data kecelakaan" (docs/design/admin/detail - Kelola data kecelakaan.png): back button, header
 * with place and date · time WIB, map with coordinates, "Informasi Kejadian", and HAPUS DATA (always confirmed first).
 * The frame has no edit button, so there is no edit form (docs/05 #27). Admin only.
 */
export function KecelakaanDetailPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const toast = useToast();
  const { signOut } = useAuth();
  const load = useCallback(() => api.getAccident(id), [id]);
  const { state, retry } = useApi(load);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const [alasan, setAlasan] = useState('');
  const [alasanMsg, setAlasanMsg] = useState<string>();

  if (state.status === 'loading') return <LoadState state="loading" message="Memuat data kecelakaan…" />;
  if (state.status === 'error') return <LoadState state="error" message={state.message} onRetry={retry} />;
  const a = state.data;

  async function remove() {
    // Soft delete needs a written reason (min. 10 characters).
    if (alasanError(alasan)) {
      setAlasanMsg(alasanError(alasan));
      return;
    }
    setDeleting(true);
    setDeleteError(undefined);
    try {
      await api.deleteAccident(a.id_kejadian, { alasan: alasan.trim() });
      toast(`Data kecelakaan "${a.lokasi_deskripsi}" dihapus.`);
      navigate(ROUTES.kecelakaan, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) signOut();
      else if (err instanceof ApiError && err.fieldErrors?.alasan) setAlasanMsg(err.fieldErrors.alasan);
      else setDeleteError(errorMessage(err));
      setDeleting(false);
    }
  }

  const closeDialog = () => {
    setConfirming(false);
    setDeleteError(undefined);
    setAlasan('');
    setAlasanMsg(undefined);
  };

  return (
    <article>
      <DetailHeader title={a.lokasi_deskripsi} subtitle={formatWib(a.tanggal_waktu)} backTo={ROUTES.kecelakaan} />
      <div className="detail-body">
        <div>
          <IncidentMap latitude={a.latitude} longitude={a.longitude} zonaId={a.zona_id} className="detail-map" />
          <p className="detail-coords">
            Latitude: {a.latitude}
            <br />
            Longitude: {a.longitude}
          </p>
        </div>
        <div className="detail-cards">
          <AccidentInfo accident={a} />
          <div className="detail-actions">
            <Button variant="danger" onClick={() => setConfirming(true)}>
              HAPUS DATA
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={confirming}
        title="Hapus data kecelakaan ini?"
        onClose={closeDialog}
        actions={
          <>
            <Button variant="secondary" onClick={closeDialog} disabled={deleting}>
              Batal
            </Button>
            <Button variant="danger" onClick={remove} busy={deleting} disabled={alasanError(alasan) !== undefined}>
              HAPUS
            </Button>
          </>
        }
      >
        <p>
          {a.lokasi_deskripsi} · {formatWib(a.tanggal_waktu)} · {a.jumlah_korban} korban
        </p>
        <p className="muted">
          Data ini keluar dari perhitungan skor zona mulai perhitungan berikutnya dan tidak lagi muncul di daftar. Data tidak dibuang: penghapusan dicatat (siapa, kapan, dan alasannya) dan bisa dilihat di tab Riwayat Penghapusan.
        </p>
        <ReasonField
          label="Alasan penghapusan"
          value={alasan}
          error={alasanMsg}
          disabled={deleting}
          onChange={(v) => {
            setAlasan(v);
            setAlasanMsg(undefined);
          }}
        />
        {deleteError ? (
          <p className="error-text" role="alert">
            {deleteError}
          </p>
        ) : null}
      </Dialog>
    </article>
  );
}
