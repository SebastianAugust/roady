import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { APP_NAME } from '../constants';
import { navItemsFor } from '../routes';
import { AccountMenu } from './AccountMenu';
import './Navbar.css';

/**
 * Header of the Figma web frames: wordmark left, account chip right, then one row of tabs in a glass bar.
 * Admin has 3 tabs and Dishub 5 (labels and order as in Figma); there is no shared menu. The row scrolls sideways on
 * narrow screens instead of wrapping or cutting labels. Tabs follow the JWT role; the routes are guarded as well.
 */
export function Navbar() {
  const { role } = useAuth();
  return (
    <header className="navbar">
      <div className="navbar-top">
        <span className="navbar-brand">{APP_NAME}</span>
        <AccountMenu />
      </div>
      <nav className="navbar-bar glass" aria-label="Menu utama">
        <ul className="navbar-list">
          {navItemsFor(role).map((i) => (
            <li key={i.to}>
              <NavLink to={i.to} end={i.to === '/'} className="navbar-tab">
                {i.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
