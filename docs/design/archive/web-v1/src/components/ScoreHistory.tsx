import { formatDate } from '../lib/format';
import { RISK_LABEL } from '../lib/risk';
import type { RiwayatSkorPoint } from '../types';
import { ScoreHistoryChart } from './ScoreHistoryChart';
import './ScoreHistory.css';

/** The score line of one zone with its table alternative in a <details> (docs/05 #17). */
export function ScoreHistory({ titik, label }: { titik: RiwayatSkorPoint[]; label: string }) {
  return (
    <>
      <div className="score-chart">
        <ScoreHistoryChart titik={titik} label={label} />
      </div>
      <details className="score-table-toggle">
        <summary>Tampilkan sebagai tabel</summary>
        <table className="score-table">
          <thead>
            <tr>
              <th scope="col">Tanggal</th>
              <th scope="col">Skor</th>
              <th scope="col">Kategori</th>
              <th scope="col">Jumlah kejadian</th>
              <th scope="col">Saat hujan</th>
            </tr>
          </thead>
          <tbody>
            {titik.map((p) => (
              <tr key={p.last_updated}>
                <td>{formatDate(p.last_updated)}</td>
                <td>{Math.round(p.skor_risiko)}</td>
                <td>{RISK_LABEL[p.kategori_risiko]}</td>
                <td>{p.jumlah_kejadian}</td>
                <td>{Math.round(p.persentase_kejadian_saat_hujan)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </>
  );
}
