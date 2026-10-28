import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { Role } from '../types';
import { useAuth } from './useAuth';
import { ForbiddenPage } from '../pages/ForbiddenPage';

/** Route guard: no token → Login (and back here after signing in); a role outside `roles` → 403 page. */
export function RequireRole({ roles }: { roles: readonly Role[] }) {
  const { role } = useAuth();
  const location = useLocation();
  if (!role) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!roles.includes(role)) return <ForbiddenPage />;
  return <Outlet />;
}
