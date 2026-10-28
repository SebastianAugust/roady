import { ApiError, type ApiClient } from './types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

let token: string | undefined;
export const setAuthToken = (t: string | undefined) => {
  token = t;
};

async function send(path: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data.message ?? 'Terjadi kesalahan.', data.errors);
  }
  return res;
}

const request = async <T>(path: string, init?: RequestInit) => (await (await send(path, init)).json()) as T;

/** ?a=1&b=2 without the keys whose value is undefined or empty. */
function query(params: object) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  return entries.length ? `?${new URLSearchParams(entries.map(([k, v]) => [k, String(v)]))}` : '';
}

/** Filename from Content-Disposition, falling back to `fallback`. */
const filenameOf = (res: Response, fallback: string) =>
  /filename="?([^";]+)"?/.exec(res.headers.get('Content-Disposition') ?? '')?.[1] ?? fallback;

export const realApi: ApiClient = {
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/api/users/me'),
  getZones: (q) => request(`/api/zones${query(q)}`),
  getZone: (id) => request(`/api/zones/${id}`),
  getStatistics: () => request('/api/dishub/statistics'),
  getDishubZones: () => request('/api/dishub/zones'),
  getDishubZone: (id) => request(`/api/dishub/zones/${id}`),
  getDishubReport: (id) => request(`/api/dishub/reports/${id}`),
  getDishubReports: (q) => request(`/api/dishub/reports${query(q)}`),
  async exportData(q) {
    const res = await send(`/api/dishub/export${query(q)}`);
    return { filename: filenameOf(res, `roady-${q.jenis}.csv`), content: await res.text() };
  },
  createAccident: (body) => request('/api/dishub/accidents', { method: 'POST', body: JSON.stringify(body) }),
  getDishubAccidents: (q) => request(`/api/dishub/accidents${query(q ?? {})}`),
  getDishubAccident: (id) => request(`/api/dishub/accidents/${id}`),
  getAdminReports: (q) => request(`/api/admin/reports${query(q)}`),
  verifyReport: (id, body) => request(`/api/admin/reports/${id}/verify`, { method: 'PATCH', body: JSON.stringify(body) }),
  getAccidents: (q) => request(`/api/admin/accidents${query(q ?? {})}`),
  getDeletedAccidents: (q) => request(`/api/admin/accidents/deleted${query(q ?? {})}`),
  getAccident: (id) => request(`/api/admin/accidents/${id}`),
  updateAccident: (id, body) => request(`/api/admin/accidents/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  async deleteAccident(id, body) {
    await send(`/api/admin/accidents/${id}`, { method: 'DELETE', body: JSON.stringify(body) });
  },
};
