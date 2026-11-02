import { Skeleton } from './Skeleton';
import { StatTilesSkeleton } from './StatTilesSkeleton';
import { TableSkeleton } from './TableSkeleton';

/** What the page panel shows for a moment while the next page is on its way: a title line, four counters and a table. */
export function PageSkeleton() {
  return (
    <div role="status" aria-label="Memuat halaman…">
      <div style={{ display: 'grid', gap: 'var(--space-xs)', marginBottom: 'var(--space-lg)' }}>
        <Skeleton width="min(320px, 60%)" height={32} />
        <Skeleton width="min(520px, 90%)" height={14} />
      </div>
      <StatTilesSkeleton />
      <TableSkeleton />
    </div>
  );
}
