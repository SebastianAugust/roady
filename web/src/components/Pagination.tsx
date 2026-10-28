import './Pagination.css';

interface Props {
  /** 1-based current page. */
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}

/** Page numbers around the current one (at most 5), with Sebelumnya / Berikutnya; nothing when there is one page. */
export function Pagination({ page, pageCount, onChange }: Props) {
  if (pageCount <= 1) return null;
  const first = Math.max(1, Math.min(page - 2, pageCount - 4));
  const pages = Array.from({ length: Math.min(5, pageCount) }, (_, i) => first + i);
  return (
    <nav className="pagination" aria-label="Halaman">
      <button type="button" className="pagination-step" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Sebelumnya
      </button>
      <ul className="pagination-pages">
        {pages.map((p) => (
          <li key={p}>
            <button
              type="button"
              className="pagination-page"
              aria-current={p === page ? 'page' : undefined}
              aria-label={`Halaman ${p}`}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="pagination-step" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
        Berikutnya
      </button>
    </nav>
  );
}
