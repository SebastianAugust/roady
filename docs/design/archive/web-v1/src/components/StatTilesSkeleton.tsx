import { Skeleton } from './Skeleton';
import './StatTile.css';

/** Placeholder for a row of StatTiles while their numbers load. Announces "Memuat…" once. */
export function StatTilesSkeleton({ count = 4, label = 'Memuat ringkasan…' }: { count?: number; label?: string }) {
  return (
    <section className="stat-tiles" role="status" aria-label={label}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="stat-tile glass-in" style={{ gap: 'var(--space-sm)' }}>
          <Skeleton width="55%" height={18} />
          <Skeleton width={72} height={48} radius="var(--radius-field)" />
        </div>
      ))}
      <span className="visually-hidden">{label}</span>
    </section>
  );
}
