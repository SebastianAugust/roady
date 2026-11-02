import { Skeleton } from './Skeleton';
import './TableSkeleton.css';

interface Props {
  rows?: number;
  columns?: number;
  /** Announced to screen readers. */
  label?: string;
}

/** Placeholder for a table card while its rows load: a header line, then `rows` lines of `columns` cells. */
export function TableSkeleton({ rows = 5, columns = 4, label = 'Memuat data…' }: Props) {
  return (
    <div className="table-skeleton glass" role="status" aria-label={label}>
      {Array.from({ length: rows + 1 }, (_, r) => (
        <div key={r} className="table-skeleton-row" style={{ gridTemplateColumns: `2fr repeat(${columns - 1}, 1fr)` }}>
          {Array.from({ length: columns }, (_, c) => (
            <Skeleton key={c} width={r === 0 ? '50%' : c === 0 ? '80%' : '60%'} height={r === 0 ? 20 : 14} />
          ))}
        </div>
      ))}
      <span className="visually-hidden">{label}</span>
    </div>
  );
}
