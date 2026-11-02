import { useCallback, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Props that make a whole table row open `to` on a click. The real link (an <a> in the row's first cell) stays the
 * keyboard and screen reader way in: a row with role="link" would stop being a table row for assistive technology.
 * A click on a link, button or field inside the row does its own thing and is not turned into a row click.
 */
export function useRowNavigate() {
  const navigate = useNavigate();
  return useCallback(
    (to: string) => ({
      className: 'is-clickable',
      onClick: (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest('a, button, input, select, textarea')) return;
        navigate(to);
      },
    }),
    [navigate],
  );
}
