import { plural } from '../lib/format';
import type { PageMeta } from '../types';

interface PaginationProps {
  meta: PageMeta;
  shown: number;
  page: number;
  onPageChange: (page: number) => void;
}

// `page` is the one asked for, so the button changes at once; the range shows what's on screen.
export default function Pagination({ meta, shown, page, onPageChange }: PaginationProps) {
  if (meta.total === 0) return null;
  const from = (meta.page - 1) * meta.pageSize + 1;
  const to = from + shown - 1;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 text-[12.5px] text-pencil tabular-nums">
      <span>
        {from} à {to} sur {plural(meta.total, 'ticket')}
      </span>
      {meta.totalPages > 1 && (
        <nav aria-label="Pages" className="flex flex-wrap gap-1">
          {page > 1 && (
            <button type="button" className="pg" onClick={() => onPageChange(page - 1)}>
              Précédent
            </button>
          )}
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className="pg"
              aria-label={`Page ${n}`}
              aria-current={n === page ? 'page' : undefined}
              onClick={() => onPageChange(n)}
            >
              {n}
            </button>
          ))}
          {page < meta.totalPages && (
            <button type="button" className="pg" onClick={() => onPageChange(page + 1)}>
              Suivant
            </button>
          )}
        </nav>
      )}
    </div>
  );
}
