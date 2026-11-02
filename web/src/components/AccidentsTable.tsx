import { Link } from 'react-router-dom';
import { CUACA_LABEL, formatWib, sumberOf } from '../lib/format';
import { kecelakaanDetail } from '../routes';
import type { KecelakaanResmi } from '../types';
import { Button } from './Button';
import './DataTable.css';

interface Props {
  rows: KecelakaanResmi[];
  /** Without both handlers the Aksi column is left out (the read-only archive of Dishub). */
  onEdit?: (accident: KecelakaanResmi) => void;
  onDelete?: (accident: KecelakaanResmi) => void;
  /** Where the location links to; the Admin detail by default. */
  detailTo?: (id: number) => string;
}

/**
 * The official accidents as a table: tanggal, lokasi (a link to the detail), cuaca, korban, sumber (who entered it) and
 * the two actions. The rows rise in one after another (motion.css, .rise-rows).
 */
export function AccidentsTable({ rows, onEdit, onDelete, detailTo = kecelakaanDetail }: Props) {
  const actions = onEdit && onDelete ? { onEdit, onDelete } : undefined;
  return (
    <div className="data-table-card glass">
      <table className="data-table">
        <caption className="visually-hidden">Data kecelakaan resmi, terbaru di atas menurut urutan yang dipilih</caption>
        <thead>
          <tr>
            <th scope="col">Tanggal</th>
            <th scope="col">Lokasi</th>
            <th scope="col">Cuaca</th>
            <th scope="col">Korban</th>
            <th scope="col">Sumber</th>
            {actions ? <th scope="col">Aksi</th> : null}
          </tr>
        </thead>
        <tbody className="rise-rows">
          {rows.map((a) => (
            <tr key={a.id_kejadian}>
              <td>{formatWib(a.tanggal_waktu)}</td>
              <th scope="row">
                <Link to={detailTo(a.id_kejadian)}>{a.lokasi_deskripsi}</Link>
              </th>
              <td>{a.kondisi_cuaca ? CUACA_LABEL[a.kondisi_cuaca] : '-'}</td>
              <td>{a.jumlah_korban}</td>
              <td>
                <span className="data-who">{sumberOf(a.input_by_kode)}</span>
                <span className="data-who-name">{a.input_by_kode}</span>
              </td>
              {actions ? (
                <td>
                  <div className="row-actions">
                    <Button variant="secondary" className="btn-sm" onClick={() => actions.onEdit(a)} aria-label={`Ubah ${a.lokasi_deskripsi}`}>
                      Ubah
                    </Button>
                    <Button variant="danger-outline" className="btn-sm" onClick={() => actions.onDelete(a)} aria-label={`Hapus ${a.lokasi_deskripsi}`}>
                      Hapus
                    </Button>
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
