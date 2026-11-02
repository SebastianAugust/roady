import { Outlet, useLocation, useMatch } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { pageTitleFor, ROUTES } from '../routes';
import { AppBackground } from './AppBackground';
import { Header, Navbar } from './Navbar';
import './AppLayout.css';

/**
 * Background, header, the sticky navbar and the large glass panel that holds the page content. Beranda fits the screen
 * exactly (no scrolling); the profile page has no navbar, only the header and its card.
 */
export function AppLayout() {
  usePageTitle(pageTitleFor(useLocation().pathname));
  const isHome = useMatch(ROUTES.beranda) !== null;
  const isProfile = useMatch(ROUTES.akun) !== null;
  return (
    <div className={`app-shell${isHome ? ' app-shell-fit' : ''}`}>
      <AppBackground />
      <Header />
      {isProfile ? null : <Navbar />}
      <main className="app-main glass">
        <Outlet />
      </main>
    </div>
  );
}
