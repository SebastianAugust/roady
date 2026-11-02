import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { breadcrumbFor, NAV_ITEMS } from '../routes';
import { AccountMenu } from './AccountMenu';
import './TopBar.css';

/**
 * The sticky bar above every page: breadcrumb "Peran / Halaman" with the page title under it, and the account menu on
 * the right. On a detail page the page level links back to its list. The title is not a heading: each page has its own h1.
 */
export function TopBar() {
  const { role } = useAuth();
  const { pathname } = useLocation();
  const crumbs = breadcrumbFor(pathname, role);
  const title = crumbs[crumbs.length - 1];
  const listPath = role === 'dishub' || role === 'admin' ? NAV_ITEMS[role].find((i) => i.label === crumbs[1])?.to : undefined;

  return (
    <header className="topbar glass">
      <div className="topbar-text">
        <nav aria-label="Breadcrumb">
          <ol className="topbar-crumbs">
            {crumbs.map((c, i) => (
              <Fragment key={`${i}-${c}`}>
                {i > 0 ? (
                  <li className="topbar-sep" aria-hidden="true">
                    /
                  </li>
                ) : null}
                <li aria-current={i === crumbs.length - 1 ? 'page' : undefined}>
                  {i === 1 && crumbs.length > 2 && listPath ? <Link to={listPath}>{c}</Link> : c}
                </li>
              </Fragment>
            ))}
          </ol>
        </nav>
        <p className="topbar-title">{title}</p>
      </div>
      <AccountMenu />
    </header>
  );
}
