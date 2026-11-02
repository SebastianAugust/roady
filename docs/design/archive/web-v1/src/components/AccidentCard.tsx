import { Link } from 'react-router-dom';
import { formatWib } from '../lib/format';
import { JENIS_LABEL } from '../lib/reportTemplates';
import type { KecelakaanResmi } from '../types';
import { MiniMap } from './MiniMap';
import './AccidentCard.css';

interface Props {
  accident: KecelakaanResmi;
  /** Detail page. The DETAIL button is the real link and its hit area covers the whole card. */
  to: string;
  /** Adds "Diinput oleh {kode}" (Dishub archive); the Admin grid stays as in Figma without it. */
  showInputter?: boolean;
}

/** One official accident as on the Figma archive grids: map with the pin, "9-10-2026 · 14.34 WIB", "10 korban", DETAIL. */
export function AccidentCard({ accident: a, to, showInputter = false }: Props) {
  return (
    <article className="accident-card glass-in" aria-label={`Kecelakaan ${formatWib(a.tanggal_waktu)}, ${a.lokasi_deskripsi}`}>
      <MiniMap latitude={a.latitude} longitude={a.longitude} still className="accident-card-map" />
      <div className="accident-card-foot">
        <div className="accident-card-text">
          <p className="accident-card-meta">{formatWib(a.tanggal_waktu)}</p>
          <p className="accident-card-meta">{a.jenis === 'kecelakaan' ? `${a.jumlah_korban} korban` : JENIS_LABEL[a.jenis]}</p>
          {showInputter ? <p className="accident-card-meta">Diinput oleh {a.input_by_kode}</p> : null}
        </div>
        <Link to={to} className="btn btn-primary btn-sm accident-card-link" aria-label={`Detail kecelakaan ${a.lokasi_deskripsi}`}>
          DETAIL
        </Link>
      </div>
    </article>
  );
}
