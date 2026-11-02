import { useAuth } from '../auth/useAuth';
import { AdminHome } from './AdminHome';
import { DishubHome } from './DishubHome';

/** Beranda: the overview of the signed-in role (Admin or Dishub). Both are dashboards over the same simulated weather. */
export function HomePage() {
  const { role } = useAuth();
  return role === 'admin' ? <AdminHome /> : <DishubHome />;
}
