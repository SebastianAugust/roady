import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { APP_NAME } from '../constants';
import { usePendingCount } from '../hooks/usePendingCount';
import { navItemsFor, ROUTES } from '../routes';
import { MenuIcon, type MenuIconName } from './icons';
import './Sidebar.css';

const ICON_BY_PATH: Record<string, MenuIconName> = {
  [ROUTES.beranda]: 'beranda',
  [ROUTES.statistik]: 'statistik',
  [ROUTES.arsip]: 'input',
  [ROUTES.laporan]: 'laporan',
  [ROUTES.ekspor]: 'ekspor',
  [ROUTES.verifikasi]: 'verifikasi',
  [ROUTES.kecelakaan]: 'kecelakaan',
};

const ROLE_LABEL = { dishub: 'Dishub', admin: 'Admin' } as const;

interface Props {
  /** Opens the command palette ("Cari cepat Ctrl K" at the bottom). */
  onOpenPalette: () => void;
}

/**
 * The side menu (240px, glass): wordmark, the role, then the menu of that role only (labels and order as in Figma;
 * Admin and Dishub share nothing but Beranda, docs/05 #30). The current page has a marker on its left edge
 * (aria-current="page"). Admin's "Verifikasi Laporan" carries the number of reports waiting for review.
 */
export function Sidebar({ onOpenPalette }: Props) {
  const { role } = useAuth();
  const items = navItemsFor(role);
  const pending = usePendingCount(role === 'admin');

  return (
    <aside className="sidebar glass">
      <Link to={ROUTES.beranda} className="sidebar-brand">
        {APP_NAME}
      </Link>
      {role === 'dishub' || role === 'admin' ? <p className="sidebar-role">{ROLE_LABEL[role]}</p> : null}
      <nav aria-label="Menu utama" className="sidebar-nav">
        <ul>
          {items.map((i) => (
            <li key={i.to}>
              {/* aria-label keeps the name when the label is hidden on phones (icons only); it also carries the waiting count. */}
              <NavLink
                to={i.to}
                end={i.to === ROUTES.beranda}
                className="sidebar-item"
                aria-label={i.to === ROUTES.verifikasi && pending ? `${i.label}, ${pending} menunggu` : i.label}
                title={i.label}
              >
                <MenuIcon name={ICON_BY_PATH[i.to] ?? 'beranda'} size={20} />
                <span className="sidebar-item-label">{i.label}</span>
                {i.to === ROUTES.verifikasi && pending ? (
                  <span className="sidebar-badge" aria-hidden="true">
                    {pending}
                  </span>
                ) : null}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <button type="button" className="sidebar-hint" onClick={onOpenPalette}>
        Cari cepat
        <span className="sidebar-keys" aria-hidden="true">
          <kbd>Ctrl</kbd>
          <kbd>K</kbd>
        </span>
        <span className="visually-hidden">(Ctrl K)</span>
      </button>
    </aside>
  );
}
