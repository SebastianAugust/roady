import type { ReactNode } from 'react';
import { formatWib } from '../lib/format';
import type { KecelakaanResmi } from '../types';
import { MiniMap } from './MiniMap';
import './AccidentCard.css';

interface Props {
  accident: KecelakaanResmi;
  /** Bottom-right action (DETAIL on Kelola Data Kecelakaan); none on the Dishub archive. */
  action?: ReactNode;
}

/** One official accident as on the Figma archive grids: map with the pin, "9-10-2026 · 14.34 WIB", "10 korban". */
export function AccidentCard({ accident: a, action }: Props) {
  return (
    <article className="accident-card glass-in" aria-label={`Kecelakaan ${formatWib(a.tanggal_waktu)}, ${a.lokasi_deskripsi}`}>
      <MiniMap latitude={a.latitude} longitude={a.longitude} still className="accident-card-map" />
      <div className="accident-card-foot">
        <div className="accident-card-text">
          <p className="accident-card-meta">{formatWib(a.tanggal_waktu)}</p>
          <p className="accident-card-meta">{a.jumlah_korban} korban</p>
        </div>
        {action}
      </div>
    </article>
  );
}
