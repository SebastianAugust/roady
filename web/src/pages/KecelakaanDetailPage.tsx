import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../api';
import { useAuth } from '../auth/useAuth';
import { Button } from '../components/Button';
import { DetailHeader } from '../components/DetailHeader';
import { Dialog } from '../components/Dialog';
import { LoadState } from '../components/LoadState';
import { MiniMap } from '../components/MiniMap';
import { useToast } from '../components/toastContext';
import { errorMessage, useApi } from '../hooks/useApi';
import { CUACA_LABEL, formatWib } from '../lib/format';
import { ROUTES } from '../routes';
import './KecelakaanDetailPage.css';

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

  if (state.status === 'loading') return <LoadState state="loading" message="Memuat data kecelakaan…" />;
  if (state.status === 'error') return <LoadState state="error" message={state.message} onRetry={retry} />;
  const a = state.data;

  async function remove() {
    setDeleting(true);
    setDeleteError(undefined);
    try {
      await api.deleteAccident(a.id_kejadian);
      toast(`Data kecelakaan "${a.lokasi_deskripsi}" dihapus.`);
      navigate(ROUTES.kecelakaan, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) signOut();
      else setDeleteError(errorMessage(err));
      setDeleting(false);
    }
  }

  const closeDialog = () => {
    setConfirming(false);
    setDeleteError(undefined);
  };

  return (
    <article>
      <DetailHeader title={a.lokasi_deskripsi} subtitle={formatWib(a.tanggal_waktu)} backTo={ROUTES.kecelakaan} />
      <div className="detail-body">
        <div>
          <MiniMap latitude={a.latitude} longitude={a.longitude} className="detail-map" />
          <p className="detail-coords">
            Latitude: {a.latitude}
            <br />
            Longitude: {a.longitude}
          </p>
        </div>
        <div className="detail-cards">
          <section className="glass-in detail-card" aria-labelledby="info-title">
            <h2 id="info-title" className="detail-card-title">
              Informasi Kejadian
            </h2>
            <dl className="accident-info">
              <div>
                <dt>Jenis Kendaraan Terlibat:</dt>
                <dd>{a.jenis_kendaraan_terlibat || '-'}</dd>
              </div>
              <div>
                <dt>Kondisi Cuaca:</dt>
                <dd>{a.kondisi_cuaca ? CUACA_LABEL[a.kondisi_cuaca] : '-'}</dd>
              </div>
              <div className="accident-info-wide">
                <dt>Jumlah Korban:</dt>
                <dd>
                  <span className="accident-korban">{a.jumlah_korban}</span> orang
                </dd>
              </div>
            </dl>
          </section>
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
            <Button variant="danger" onClick={remove} busy={deleting}>
              HAPUS
            </Button>
          </>
        }
      >
        <p>
          {a.lokasi_deskripsi} · {formatWib(a.tanggal_waktu)} · {a.jumlah_korban} korban
        </p>
        <p className="muted">Data yang dihapus tidak bisa dikembalikan. Skor zona diperbarui oleh penjadwal pada perhitungan berikutnya.</p>
        {deleteError ? (
          <p className="error-text" role="alert">
            {deleteError}
          </p>
        ) : null}
      </Dialog>
    </article>
  );
}
