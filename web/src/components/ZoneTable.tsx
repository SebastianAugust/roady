import { formatCoords } from '../lib/format';
import type { ZonaTeratas } from '../types';
import { RiskBadge } from './RiskBadge';
import './ZoneTable.css';

/** Figma Statistik Zona table: Lokasi, Jumlah Kejadian, Skor Risiko, Kategori Zona, one divider per row. */
export function ZoneTable({ zones }: { zones: ZonaTeratas[] }) {
  return (
    <div className="zone-table-card glass">
      <table className="zone-table">
        <caption className="visually-hidden">Zona dengan skor risiko tertinggi</caption>
        <thead>
          <tr>
            <th scope="col">Lokasi</th>
            <th scope="col">Jumlah Kejadian</th>
            <th scope="col">Skor Risiko</th>
            <th scope="col">Kategori Zona</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((z) => (
            <tr key={z.zona_id}>
              <th scope="row">
                {z.lokasi_teks ?? formatCoords(z.center_latitude, z.center_longitude)}
                <span className="zone-table-id">Zona {z.zona_id}</span>
              </th>
              <td>{z.jumlah_kejadian}</td>
              <td>{Math.round(z.skor_risiko)}%</td>
              <td>
                <RiskBadge kategori={z.kategori_risiko} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
