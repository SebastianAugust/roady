import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { usePageTitle } from '../hooks/usePageTitle';
import { prefersReducedMotion } from '../lib/motion';
import { navItemsFor, pageTitleFor, ROUTES } from '../routes';
import { AppBackground } from './AppBackground';
import { PageSkeleton } from './PageSkeleton';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { CommandPalette, type CommandItem } from './ui';
import './AppLayout.css';

/** How long the skeleton stands in for a page that was just opened (skipped with reduced motion). */
const PAGE_SKELETON_MS = 600;

/**
 * The shell after login: side menu on the left, then a sticky top bar and the large glass panel with the page. Ctrl/Cmd+K opens the command palette with the pages of this role and "Keluar".
 * A page change first shows a skeleton for 600ms, then the page fades and rises in (motion.css).
 */
export function AppLayout() {
  const { pathname } = useLocation();
  usePageTitle(pageTitleFor(pathname));
  const { role, signOut } = useAuth();
  const navigate = useNavigate();
  const [paletteOpen, setPaletteOpen] = useState(false);

  const commands = useMemo<CommandItem[]>(
    () => [
      ...navItemsFor(role).map((i) => ({ id: i.to, title: `Buka ${i.label}`, label: 'Halaman', action: () => navigate(i.to) })),
      { id: ROUTES.akun, title: 'Buka Profil akun', label: 'Halaman', action: () => navigate(ROUTES.akun) },
      { id: 'keluar', title: 'Keluar', label: 'Akun', action: signOut },
    ],
    [role, navigate, signOut],
  );

  return (
    <div className="app-shell">
      <AppBackground />
      <Sidebar onOpenPalette={() => setPaletteOpen(true)} />
      <div className="app-col">
        <TopBar />
        <main className="app-main glass">
          <Page />
        </main>
      </div>
      <CommandPalette items={commands} open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}

/** The routed page, behind a short skeleton each time the path changes (not on the first load). */
function Page() {
  const { pathname } = useLocation();
  const [shownFor, setShownFor] = useState(pathname);

  useEffect(() => {
    if (shownFor === pathname) return;
    const timer = setTimeout(() => setShownFor(pathname), PAGE_SKELETON_MS);
    return () => clearTimeout(timer);
  }, [pathname, shownFor]);

  return shownFor === pathname || prefersReducedMotion() ? <Outlet /> : <PageSkeleton />;
}
