import type { CSSProperties } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { APP_NAME } from '../constants';
import { navItemsFor } from '../routes';
import { AccountMenu } from './AccountMenu';
import './Navbar.css';

/**
 * Header of the Figma web frames: wordmark left, account chip right (`Header`), then one row of tabs in a glass bar
 * (`Navbar`). The two are separate elements so the tab bar can be sticky inside the page shell. Admin has 3 tabs and
 * Dishub 5 (labels and order as in Figma); every tab has the same width and height (equal grid columns). Tabs follow
 * the JWT role; the routes are guarded as well.
 */
export function Header() {
  return (
    <header className="navbar-top">
      <span className="navbar-brand">{APP_NAME}</span>
      <AccountMenu />
    </header>
  );
}

export function Navbar() {
  const { role } = useAuth();
  const items = navItemsFor(role);
  return (
    <nav className="navbar-bar glass" aria-label="Menu utama" style={{ '--nav-count': items.length } as CSSProperties}>
      <ul className="navbar-list">
        {items.map((i) => (
          <li key={i.to}>
            <NavLink to={i.to} end={i.to === '/'} className="navbar-tab">
              {i.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
