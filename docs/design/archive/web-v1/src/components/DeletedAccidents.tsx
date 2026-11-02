import { useCallback, useState } from 'react';
import { api } from '../api';
import { useApi } from '../hooks/useApi';
import { useDebounced } from '../hooks/useDebounced';
import { formatDateTime, formatWib } from '../lib/format';
import { LoadState } from './LoadState';
import { Pagination } from './Pagination';
import { SearchField } from './SearchField';
import './DataTable.css';

const PER_PAGE = 10;

/**
 * "Riwayat Penghapusan" tab: the soft-deleted official accidents (GET /api/admin/accidents/deleted, usulan) with who
 * deleted them (kode pengguna + nama), when and why. Read-only: there is no restore button (docs/05 #32).
 */
export function DeletedAccidents() {
  const [q, setQ] = useState('');
  const [halaman, setHalaman] = useState(1);
  const search = useDebounced(q.trim());
  const load = useCallback(() => api.getDeletedAccidents({ q: search || undefined, halaman, per_halaman: PER_PAGE }), [search, halaman]);
  const { state, retry } = useApi(load);

  return (
    <>
      <form className="accident-filters" role="search" onSubmit={(e) => e.preventDefault()}>
        <SearchField
          className="accident-search"
          aria-label="Cari lokasi, jenis kendaraan, atau kode penginput"
          placeholder="Cari lokasi, jenis kendaraan, atau kode penginput"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setHalaman(1);
          }}
        />
        <p className="accident-count" role="status" aria-live="polite">
          {state.status === 'ready' ? `${state.data.total} data terhapus${search ? ' sesuai pencarian' : ''}` : 'Memuat…'}
        </p>
      </form>
      {state.status === 'loading' ? <LoadState state="loading" message="Memuat riwayat penghapusan…" /> : null}
      {state.status === 'error' ? <LoadState state="error" message={state.message} onRetry={retry} /> : null}
      {state.status === 'ready' && state.data.data.length === 0 ? (
        <LoadState state="empty" message={search ? 'Tidak ada data terhapus yang cocok dengan pencarian.' : 'Belum ada data yang dihapus.'} />
      ) : null}
      {state.status === 'ready' && state.data.data.length ? (
        <>
          <div className="data-table-card glass">
            <table className="data-table">
              <caption className="visually-hidden">Data kecelakaan yang sudah dihapus, terbaru dihapus di atas</caption>
              <thead>
                <tr>
                  <th scope="col">Kejadian</th>
                  <th scope="col">Korban</th>
                  <th scope="col">Dihapus oleh</th>
                  <th scope="col">Waktu hapus</th>
                  <th scope="col">Alasan</th>
                </tr>
              </thead>
              <tbody>
                {state.data.data.map((a) => (
                  <tr key={a.id_kejadian}>
                    <th scope="row">
                      {a.lokasi_deskripsi}
                      <span className="data-id">
                        Data #{a.id_kejadian} · {formatWib(a.tanggal_waktu)}
                      </span>
                    </th>
                    <td>{a.jumlah_korban}</td>
                    <td>
                      <span className="data-who">{a.dihapus_oleh_kode}</span>
                      <span className="data-who-name">{a.dihapus_oleh_nama}</span>
                    </td>
                    <td>{formatDateTime(a.waktu_hapus)}</td>
                    <td className="data-wrap">{a.alasan_hapus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={state.data.halaman} pageCount={Math.ceil(state.data.total / state.data.per_halaman)} onChange={setHalaman} />
        </>
      ) : null}
    </>
  );
}
