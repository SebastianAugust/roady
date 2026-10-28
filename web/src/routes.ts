import type { Role } from './types';

export const ROUTES = {
  login: '/login',
  beranda: '/',
  akun: '/akun',
  // Dishub only
  statistik: '/statistik',
  arsip: '/arsip',
  arsipInput: '/arsip/input',
  laporan: '/laporan',
  ekspor: '/ekspor',
  // Admin only
  verifikasi: '/admin/verifikasi',
  kecelakaan: '/admin/kecelakaan',
} as const;

export const verifikasiDetail = (id: number) => `${ROUTES.verifikasi}/${id}`;
export const zonaDetail = (id: number) => `${ROUTES.statistik}/${id}`;
export const arsipDetail = (id: number) => `${ROUTES.arsip}/${id}`;
export const laporanDetail = (id: number) => `${ROUTES.laporan}/${id}`;
export const kecelakaanDetail = (id: number) => `${ROUTES.kecelakaan}/${id}`;

export interface NavItem {
  to: string;
  label: string;
}

/**
 * Navbar tabs per role, order and labels exactly as in Figma (docs/design/admin/Home.png, docs/design/dishub/Home.png).
 * Admin and Dishub are two separate apps with no cross access (docs/05 #30): Admin does not get the Dishub menu.
 */
export const NAV_ITEMS: Record<'dishub' | 'admin', NavItem[]> = {
  dishub: [
    { to: ROUTES.beranda, label: 'Beranda' },
    { to: ROUTES.statistik, label: 'Statistik Zona' },
    { to: ROUTES.arsip, label: 'Arsip & Input' },
    { to: ROUTES.laporan, label: 'Detail Laporan' },
    { to: ROUTES.ekspor, label: 'Ekspor Data' },
  ],
  admin: [
    { to: ROUTES.beranda, label: 'Beranda' },
    { to: ROUTES.verifikasi, label: 'Verifikasi Laporan' },
    { to: ROUTES.kecelakaan, label: 'Kelola Data Kecelakaan' },
  ],
};

export const navItemsFor = (role: Role | undefined) => (role === 'dishub' || role === 'admin' ? NAV_ITEMS[role] : []);

/** Whether `role` may open `path` (same split as the guards in App.tsx); used to pick where to go after signing in. */
export function canOpen(role: Role, path: string) {
  if (path === ROUTES.beranda || path === ROUTES.akun) return role === 'dishub' || role === 'admin';
  if (path.startsWith('/admin/')) return role === 'admin';
  return role === 'dishub' && [ROUTES.statistik, ROUTES.arsip, ROUTES.laporan, ROUTES.ekspor].some((p) => path === p || path.startsWith(`${p}/`));
}
