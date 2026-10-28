import { Outlet } from 'react-router-dom';
import { AppBackground } from './AppBackground';
import { Navbar } from './Navbar';
import './AppLayout.css';

/** Background, the navbar, and the large glass panel that holds the page content. */
export function AppLayout() {
  return (
    <div className="app-shell">
      <AppBackground />
      <Navbar />
      <main className="app-main glass">
        <Outlet />
      </main>
    </div>
  );
}
