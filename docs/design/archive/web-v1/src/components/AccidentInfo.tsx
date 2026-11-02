import { Link } from 'react-router-dom';
import { CUACA_LABEL, formatWib } from '../lib/format';
import { detailRows, JENIS_LABEL } from '../lib/reportTemplates';
import { zonaDetail } from '../routes';
import type { KecelakaanResmi } from '../types';
import './AccidentInfo.css';

interface Props {
  accident: KecelakaanResmi;
  /** Links the zone to its Detail Zona page (Dishub only; the Admin app has no zone pages, docs/05 #30). */
  zoneLink?: boolean;
}

/**
 * Figma "Informasi Kejadian" card plus the kind of entry, who entered it and when, and (for entries made with the
 * Dishub templates) the template answers and the photo. Read-only; the actions live on the page.
 */
export function AccidentInfo({ accident: a, zoneLink = false }: Props) {
  // Vehicles are already shown above as text; the rest of the template answers follow in the wide rows.
  const rows = a.detail ? detailRows(a.jenis, a.detail).filter((r) => r.label !== 'Kendaraan terlibat') : [];
  const isKecelakaan = a.jenis === 'kecelakaan';
  return (
    <section className="glass-in detail-card" aria-labelledby="info-title">
      <h2 id="info-title" className="detail-card-title">
        Informasi Kejadian
      </h2>
      <dl className="accident-info">
        <div>
          <dt>Jenis Laporan:</dt>
          <dd>{JENIS_LABEL[a.jenis]}</dd>
        </div>
        <div>
          <dt>Jenis Kendaraan Terlibat:</dt>
          <dd>{a.jenis_kendaraan_terlibat || '-'}</dd>
        </div>
        <div>
          <dt>Kondisi Cuaca:</dt>
          <dd>{a.kondisi_cuaca ? CUACA_LABEL[a.kondisi_cuaca] : '-'}</dd>
        </div>
        <div>
          <dt>Foto:</dt>
          <dd>
            {a.foto_url ? (
              <a href={a.foto_url} target="_blank" rel="noreferrer">
                Lihat foto
              </a>
            ) : (
              'Tidak ada'
            )}
          </dd>
        </div>
        <div>
          <dt>Diinput oleh:</dt>
          <dd>
            {a.input_by_kode} · {a.input_by_nama}
          </dd>
        </div>
        <div>
          <dt>Waktu input:</dt>
          <dd>{formatWib(a.waktu_pelaporan)}</dd>
        </div>
        {zoneLink ? (
          <div>
            <dt>Zona:</dt>
            <dd>
              <Link to={zonaDetail(a.zona_id)}>Zona {a.zona_id}</Link>
            </dd>
          </div>
        ) : null}
        {rows.map((r) => (
          <div key={r.label} className={r.label === 'Kronologi' || r.label === 'Deskripsi' ? 'accident-info-wide' : undefined}>
            <dt>{r.label}:</dt>
            <dd className="accident-info-text">{r.value}</dd>
          </div>
        ))}
        {isKecelakaan ? (
          <div className="accident-info-wide">
            <dt>Jumlah Korban:</dt>
            <dd>
              <span className="accident-korban">{a.jumlah_korban}</span> orang
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
