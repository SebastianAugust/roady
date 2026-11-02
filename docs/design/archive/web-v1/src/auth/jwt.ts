import type { Role } from '../types';

/** The claims the web app reads. docs/03: the JWT carries the role. */
export interface TokenClaims {
  sub: number;
  role: Role;
  /** seconds since epoch */
  exp?: number;
}

const ROLES: readonly Role[] = ['pengemudi', 'dishub', 'admin'];

const b64urlDecode = (s: string) => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Uint8Array.from(atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4)), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export const b64urlEncode = (s: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(s)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

/**
 * Reads the payload without verifying the signature. That is fine for choosing which screens to show:
 * the server checks the signature and the role on every request (401/403), so a forged token gets no data.
 * Returns undefined for anything malformed or expired.
 */
export function decodeToken(token: string | undefined): TokenClaims | undefined {
  const payload = token?.split('.')[1];
  if (!payload) return undefined;
  try {
    const claims: unknown = JSON.parse(b64urlDecode(payload));
    if (typeof claims !== 'object' || claims === null) return undefined;
    const { sub, role, exp } = claims as Record<string, unknown>;
    if (!ROLES.includes(role as Role)) return undefined;
    if (typeof exp === 'number' && exp * 1000 < Date.now()) return undefined;
    return { sub: Number(sub), role: role as Role, exp: typeof exp === 'number' ? exp : undefined };
  } catch {
    return undefined;
  }
}

/** Roles that may use the web dashboard. Pengemudi uses the mobile app. */
export const WEB_ROLES: readonly Role[] = ['dishub', 'admin'];

export class RoleNotAllowedError extends Error {
  constructor() {
    super('Akun pengemudi tidak bisa masuk ke dashboard web. Gunakan aplikasi mobile.');
  }
}
