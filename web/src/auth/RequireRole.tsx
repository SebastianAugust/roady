import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '../routes';
import type { Role } from '../types';
import { WEB_ROLES } from './jwt';
import { useAuth } from './useAuth';
import { ForbiddenPage } from '../pages/ForbiddenPage';

/**
 * Route guard: no token → Login (and back here after signing in). A Dishub or Admin account on a page of the other role
 * is sent to the Beranda of its own role (no cross access, docs/05 #30 and #38); any other role gets the 403 page.
 */
export function RequireRole({ roles }: { roles: readonly Role[] }) {
  const { role } = useAuth();
  const location = useLocation();
  if (!role) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!roles.includes(role)) return WEB_ROLES.includes(role) ? <Navigate to={ROUTES.beranda} replace /> : <ForbiddenPage />;
  return <Outlet />;
}
