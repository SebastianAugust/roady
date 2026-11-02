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

/** Tab titles (shown as "<title> · Roady!"), most specific path first. "Zona" is Statistik Zona, "Review" is Verifikasi Laporan. */
const PAGE_TITLES: ReadonlyArray<readonly [prefix: string, title: string]> = [
  [ROUTES.arsipInput, 'Input Data'],
  [ROUTES.arsip, 'Arsip & Input'],
  [ROUTES.statistik, 'Zona'],
  [ROUTES.laporan, 'Detail Laporan'],
  [ROUTES.ekspor, 'Ekspor Data'],
  [ROUTES.verifikasi, 'Review'],
  [ROUTES.kecelakaan, 'Kelola Data Kecelakaan'],
  [ROUTES.akun, 'Akun'],
  [ROUTES.login, 'Masuk'],
];

export function pageTitleFor(pathname: string) {
  const hit = PAGE_TITLES.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return hit ? hit[1] : 'Beranda';
}

const ROLE_NAME: Record<'dishub' | 'admin', string> = { dishub: 'Dishub', admin: 'Admin' };

/**
 * Breadcrumb of the top bar: ["Dishub", "Statistik Zona"], and one more level on a detail page (["Dishub", "Statistik
 * Zona", "Detail"]). The last item is also the title.
 */
export function breadcrumbFor(pathname: string, role: Role | undefined): string[] {
  if (role !== 'dishub' && role !== 'admin') return [];
  const root = ROLE_NAME[role];
  if (pathname === ROUTES.akun) return [root, 'Profil Akun'];
  // The deepest menu item whose path is the start of this one ("/" only matches itself).
  const item = NAV_ITEMS[role]
    .filter((i) => (i.to === ROUTES.beranda ? pathname === i.to : pathname === i.to || pathname.startsWith(`${i.to}/`)))
    .sort((a, b) => b.to.length - a.to.length)[0];
  if (!item) return [root, 'Beranda'];
  // The Verifikasi split view also lives at /admin/verifikasi/:id (the report open on the right), so it has no "Detail" level.
  if (pathname === item.to || item.to === ROUTES.verifikasi) return [root, item.label];
  return [root, item.label, pathname === ROUTES.arsipInput ? 'Input Data' : 'Detail'];
}
