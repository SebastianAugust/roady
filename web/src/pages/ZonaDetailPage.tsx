import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { AccidentCard } from '../components/AccidentCard';
import { DetailHeader } from '../components/DetailHeader';
import { LoadState } from '../components/LoadState';
import { MiniMap } from '../components/MiniMap';
import { RiskBadge } from '../components/RiskBadge';
import { ScoreHistory } from '../components/ScoreHistory';
import { StatusPill } from '../components/StatusPill';
import { useApi } from '../hooks/useApi';
import { useRowNavigate } from '../hooks/useRowNavigate';
import { CUACA_LABEL, formatCoords, formatDate, formatDateTime, KATEGORI_LABEL, placeText } from '../lib/format';
import { RISK_LABEL } from '../lib/risk';
import { arsipDetail, laporanDetail, ROUTES } from '../routes';
import type { ZonaDetail } from '../types';
import '../components/DataTable.css';
import './ZonaDetailPage.css';

/**
 * Detail Zona (Dishub), opened from a row of the Statistik Zona table. There is no Figma frame for it, so it follows
 * the other detail pages: back button and header card, the map with coordinates and a summary card, then the score
 * history, the zone's official accidents and its crowd reports (no reporter identity, NFR-006).
 * Data: GET /api/dishub/zones/{zona_id} (usulan, docs/03).
 */
export function ZonaDetailPage() {
  const zonaId = Number(useParams().zonaId);
  const load = useCallback(() => api.getDishubZone(zonaId), [zonaId]);
  const { state, retry } = useApi(load);

  if (state.status === 'loading') return <LoadState state="loading" message="Memuat zona…" />;
  if (state.status === 'error') return <LoadState state="error" message={state.message} onRetry={retry} />;
  return <ZonaDetailView zone={state.data} />;
}

function ZonaDetailView({ zone: z }: { zone: ZonaDetail }) {
  const rowTo = useRowNavigate();
  const name = z.lokasi_teks ?? formatCoords(z.center_latitude, z.center_longitude);
  return (
    <article aria-labelledby="zona-title">
      <DetailHeader
        title={name}
        subtitle={`Zona ${z.zona_id} · diperbarui ${formatDateTime(z.last_updated)}`}
        backTo={ROUTES.statistik}
        aside={<RiskBadge kategori={z.kategori_risiko} />}
      />
      <div className="detail-body">
        <div>
          <MiniMap latitude={z.center_latitude} longitude={z.center_longitude} zoom={15} zone={z} pin={false} className="detail-map" />
          <p className="detail-coords">
            Latitude: {z.center_latitude}
            <br />
            Longitude: {z.center_longitude}
            <br />
            Radius zona: {z.radius_zona} m
          </p>
        </div>
        <div className="detail-cards">
          <section className="glass-in detail-card" aria-labelledby="ringkasan-title">
            <h2 id="ringkasan-title" className="detail-card-title">
              Ringkasan Zona
            </h2>
            <dl className="zona-summary">
              <div>
                <dt>Skor Risiko:</dt>
                <dd>
                  <span className="zona-score">{Math.round(z.skor_risiko)}</span>%
                </dd>
              </div>
              <div>
                <dt>Kategori Zona:</dt>
                <dd>
                  <RiskBadge kategori={z.kategori_risiko} /> <span className="muted">{RISK_LABEL[z.kategori_risiko]}</span>
                </dd>
              </div>
              <div>
                <dt>Jumlah Kejadian:</dt>
                <dd>{z.jumlah_kejadian}</dd>
              </div>
              <div>
                <dt>Terakhir diperbarui:</dt>
                <dd>{formatDateTime(z.last_updated)}</dd>
              </div>
              <div className="zona-summary-wide">
                <dt>Pengaruh cuaca:</dt>
                <dd>
                  {z.weather_dependent ? 'Bergantung cuaca' : 'Tidak bergantung cuaca'} · {Math.round(z.persentase_kejadian_saat_hujan)}% kejadian saat hujan
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      <div className="zona-sections">
        <section className="glass-in zona-section" aria-labelledby="riwayat-title">
          <h2 id="riwayat-title" className="zona-heading">
            Riwayat Skor
          </h2>
          {z.riwayat_skor.length ? (
            <ScoreHistory titik={z.riwayat_skor} label={`Riwayat skor Zona ${z.zona_id}`} />
          ) : (
            <LoadState state="empty" message="Belum ada riwayat skor untuk zona ini." />
          )}
        </section>

        <section aria-labelledby="resmi-title">
          <h2 id="resmi-title" className="zona-heading">
            Kejadian Resmi ({z.kecelakaan.length})
          </h2>
          {z.kecelakaan.length ? (
            <ul className="accident-grid">
              {z.kecelakaan.map((a) => (
                <li key={a.id_kejadian}>
                  <AccidentCard accident={a} to={arsipDetail(a.id_kejadian)} showInputter />
                </li>
              ))}
            </ul>
          ) : (
            <LoadState state="empty" message="Belum ada data kecelakaan resmi di zona ini." />
          )}
        </section>

        <section aria-labelledby="laporan-title">
          <h2 id="laporan-title" className="zona-heading">
            Laporan Warga ({z.laporan.length})
          </h2>
          {z.laporan.length ? (
            <div className="data-table-card glass">
              <table className="data-table">
                <caption className="visually-hidden">Laporan warga di zona ini, terbaru di atas; pilih baris untuk membuka detail</caption>
                <thead>
                  <tr>
                    <th scope="col">Lokasi</th>
                    <th scope="col">Kejadian</th>
                    <th scope="col">Cuaca</th>
                    <th scope="col">Tanggal</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {z.laporan.map((r) => (
                    <tr key={r.id_report} {...rowTo(laporanDetail(r.id_report))}>
                      <th scope="row">
                        <Link to={laporanDetail(r.id_report)}>{placeText(r)}</Link>
                        <span className="data-id">Laporan #{r.id_report}</span>
                      </th>
                      <td>{KATEGORI_LABEL[r.kategori]}</td>
                      <td>{CUACA_LABEL[r.kondisi_cuaca_saat_kejadian]}</td>
                      <td>{formatDate(r.tanggal_kejadian)}</td>
                      <td>
                        <StatusPill status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <LoadState state="empty" message="Belum ada laporan warga di zona ini." />
          )}
        </section>
      </div>
    </article>
  );
}
