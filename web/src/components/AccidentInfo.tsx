import { Link } from 'react-router-dom';
import { CUACA_LABEL, formatWib } from '../lib/format';
import { zonaDetail } from '../routes';
import type { KecelakaanResmi } from '../types';
import './AccidentInfo.css';

interface Props {
  accident: KecelakaanResmi;
  /** Links the zone to its Detail Zona page (Dishub only; the Admin app has no zone pages, docs/05 #30). */
  zoneLink?: boolean;
}

/** Figma "Informasi Kejadian" card plus who entered it and when (read-only; the actions live on the page). */
export function AccidentInfo({ accident: a, zoneLink = false }: Props) {
  return (
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
        <div className="accident-info-wide">
          <dt>Jumlah Korban:</dt>
          <dd>
            <span className="accident-korban">{a.jumlah_korban}</span> orang
          </dd>
        </div>
      </dl>
    </section>
  );
}
