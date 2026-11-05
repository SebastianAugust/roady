import { ApiClient, ApiError } from './types';
import type { CreateReportRequest } from '../types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

let token: string | undefined;
export const setAuthToken = (t: string | undefined) => {
  token = t;
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      // FormData sets its own multipart boundary.
      ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.message ?? 'Terjadi kesalahan.', data.errors);
  return data as T;
}

const post = <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) });

// ponytail: API-005 body is not fixed in docs/03; multipart (fields + optional `foto` file) until the photo storage is chosen.
function reportForm({ fotoUri, ...fields }: CreateReportRequest) {
  const form = new FormData();
  // null/undefined (e.g. alamat_teks when the lookup failed) are left out instead of being sent as the string "null".
  Object.entries(fields).forEach(([k, v]) => v != null && form.append(k, String(v)));
  // React Native's FormData accepts a { uri, name, type } file descriptor, which the DOM typings do not model.
  if (fotoUri) form.append('foto', { uri: fotoUri, name: 'foto.jpg', type: 'image/jpeg' } as unknown as Blob);
  return form;
}

export const realApi: ApiClient = {
  login: (body) => post('/api/auth/login', body),
  register: (body) => post('/api/auth/register', body),
  getMe: () => request('/api/users/me'),
  updateMe: (body) => request('/api/users/me', { method: 'PATCH', body: JSON.stringify(body) }),
  getZones: ({ lat, lng, radius }) => request(`/api/zones?lat=${lat}&lng=${lng}&radius=${radius}`),
  getZone: (zonaId) => request(`/api/zones/${zonaId}`),
  getMyReports: () => request('/api/reports/me'),
  createReport: (body) => request('/api/reports', { method: 'POST', body: reportForm(body) }),
};
