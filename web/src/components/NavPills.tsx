import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { usePendingCount } from '../hooks/usePendingCount';
import { navItemsFor, ROUTES } from '../routes';
import { MenuIcon, type MenuIconName } from './icons';
import './NavPills.css';

const ICON_BY_PATH: Record<string, MenuIconName> = {
  [ROUTES.beranda]: 'beranda',
  [ROUTES.statistik]: 'statistik',
  [ROUTES.arsip]: 'input',
  [ROUTES.laporan]: 'laporan',
  [ROUTES.ekspor]: 'ekspor',
  [ROUTES.verifikasi]: 'verifikasi',
  [ROUTES.kecelakaan]: 'kecelakaan',
};

/**
 * The menu of the signed-in role as a sticky pill bar (docs/design/prototype-web-cards.html): the current page is a
 * solid white pill with navy text (aria-current="page"), the others are transparent and dimmed. Admin and Dishub share
 * nothing but Beranda (docs/05 #30). Under 760px only the icons show; each link keeps its name in aria-label.
 * Admin's "Verifikasi Laporan" carries the number of reports waiting for review.
 */
export function NavPills() {
  const { role } = useAuth();
  const items = navItemsFor(role);
  const pending = usePendingCount(role === 'admin');

  return (
    <nav aria-label="Menu utama" className="nav-pills">
      <ul>
        {items.map((i) => {
          const count = i.to === ROUTES.verifikasi && pending ? pending : undefined;
          return (
            <li key={i.to}>
              <NavLink
                to={i.to}
                end={i.to === ROUTES.beranda}
                className="nav-pill"
                aria-label={count ? `${i.label}, ${count} menunggu` : i.label}
                title={i.label}
              >
                <MenuIcon name={ICON_BY_PATH[i.to] ?? 'beranda'} size={20} />
                <span className="nav-pill-label">{i.label}</span>
                {count ? (
                  <span className="nav-pill-badge" aria-hidden="true">
                    {count}
                  </span>
                ) : null}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
