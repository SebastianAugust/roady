import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRowNavigate } from '../hooks/useRowNavigate';
import { formatCoords } from '../lib/format';
import { RISK_ORDER } from '../lib/risk';
import { zonaDetail } from '../routes';
import type { ZonaTeratas } from '../types';
import { RiskBadge } from './RiskBadge';
import './ZoneTable.css';

type SortKey = 'lokasi' | 'kejadian' | 'skor' | 'kategori';
type SortDir = 'asc' | 'desc';

const placeOf = (z: ZonaTeratas) => z.lokasi_teks ?? formatCoords(z.center_latitude, z.center_longitude);

const COLUMNS: { key: SortKey; label: string; first: SortDir }[] = [
  { key: 'lokasi', label: 'Lokasi', first: 'asc' },
  { key: 'kejadian', label: 'Jumlah Kejadian', first: 'desc' },
  { key: 'skor', label: 'Skor Risiko', first: 'desc' },
  { key: 'kategori', label: 'Kategori Zona', first: 'desc' },
];

function compare(key: SortKey, a: ZonaTeratas, b: ZonaTeratas) {
  switch (key) {
    case 'lokasi':
      return placeOf(a).localeCompare(placeOf(b), 'id');
    case 'kejadian':
      return a.jumlah_kejadian - b.jumlah_kejadian;
    case 'skor':
      return a.skor_risiko - b.skor_risiko;
    // Merah is the highest category; ties by score so the order stays stable and meaningful.
    case 'kategori':
      return RISK_ORDER.indexOf(b.kategori_risiko) - RISK_ORDER.indexOf(a.kategori_risiko) || a.skor_risiko - b.skor_risiko;
  }
}

/**
 * Figma Statistik Zona table: Lokasi, Jumlah Kejadian, Skor Risiko, Kategori Zona, one divider per row. Each header is
 * a sort button (aria-sort on the th, first click per column in its natural direction, second click reverses), and each
 * row opens the Detail Zona page: the place name is the real link, a click on the rest of the row follows it.
 */
export function ZoneTable({ zones }: { zones: ZonaTeratas[] }) {
  const rowTo = useRowNavigate();
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'skor', dir: 'desc' });
  const sorted = useMemo(() => {
    const sign = sort.dir === 'asc' ? 1 : -1;
    return [...zones].sort((a, b) => sign * compare(sort.key, a, b) || a.zona_id - b.zona_id);
  }, [zones, sort]);

  const toggle = (key: SortKey, first: SortDir) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: first }));

  return (
    <div className="zone-table-card glass">
      <table className="zone-table">
        <caption className="visually-hidden">Daftar zona risiko; pilih judul kolom untuk mengurutkan, pilih baris untuk membuka detail zona</caption>
        <thead>
          <tr>
            {COLUMNS.map((c) => (
              <th key={c.key} scope="col" aria-sort={sort.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                <button type="button" className="sort-button" onClick={() => toggle(c.key, c.first)}>
                  {c.label}
                  <span className="sort-mark" aria-hidden="true">
                    {sort.key === c.key ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}
                  </span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((z) => (
            <tr key={z.zona_id} {...rowTo(zonaDetail(z.zona_id))}>
              <th scope="row">
                <Link to={zonaDetail(z.zona_id)}>{placeOf(z)}</Link>
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
