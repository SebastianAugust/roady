import * as SecureStore from 'expo-secure-store';
import type { LoginResponse, Role } from '../types';

const SESSION_KEY = 'roady.session';
const PREFS_KEY = 'roady.notificationPrefs';
const ROLES: Role[] = ['pengemudi', 'dishub', 'admin'];

// SecureStore throws on platforms without a keystore (web) or when the keystore fails. The app then still works, the session just does not persist.
async function read(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function write(key: string, value: string) {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // Not persisted; see above.
  }
}

async function remove(key: string) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Nothing stored or no keystore.
  }
}

export async function loadSession(): Promise<LoginResponse | undefined> {
  const raw = await read(SESSION_KEY);
  if (!raw) return undefined;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data === 'object' && data !== null && 'token' in data && 'role' in data) {
      const { token, role } = data;
      if (typeof token === 'string' && token && ROLES.includes(role as Role)) return { token, role: role as Role };
    }
  } catch {
    // Corrupt value: treated as signed out.
  }
  return undefined;
}

export const saveSession = (session: LoginResponse) => write(SESSION_KEY, JSON.stringify(session));
export const clearSession = () => remove(SESSION_KEY);

export interface NotificationPrefs {
  push: boolean;
  email: boolean;
}

// Figma Pengaturan (1032:3758) draws both switches in their off position.
export const DEFAULT_PREFS: NotificationPrefs = { push: false, email: false };

export async function loadNotificationPrefs(): Promise<NotificationPrefs> {
  const raw = await read(PREFS_KEY);
  if (!raw) return DEFAULT_PREFS;
  try {
    const data: Partial<NotificationPrefs> = JSON.parse(raw);
    return { push: data.push === true, email: data.email === true };
  } catch {
    return DEFAULT_PREFS;
  }
}

export const saveNotificationPrefs = (prefs: NotificationPrefs) => write(PREFS_KEY, JSON.stringify(prefs));

const ONBOARDING_KEY = 'roady.onboardingSeen';
const LOCATION_PROMPT_KEY = 'roady.locationPromptSeen';

export interface FirstRun {
  /** The three onboarding screens were finished or skipped. */
  onboardingSeen: boolean;
  /** The location permission screen was completed (granted, or the user chose to go on without it). */
  locationPromptSeen: boolean;
}

export async function loadFirstRun(): Promise<FirstRun> {
  const [onboarding, location] = await Promise.all([read(ONBOARDING_KEY), read(LOCATION_PROMPT_KEY)]);
  return { onboardingSeen: onboarding === '1', locationPromptSeen: location === '1' };
}

export const markOnboardingSeen = () => write(ONBOARDING_KEY, '1');
export const markLocationPromptSeen = () => write(LOCATION_PROMPT_KEY, '1');

const NOTIFICATION_PROMPT_KEY = 'roady.notificationPromptAsked';

/** The system notification dialog was already shown once (the OS will not show it again after a refusal). */
export const loadNotificationPromptAsked = async () => (await read(NOTIFICATION_PROMPT_KEY)) === '1';
export const markNotificationPromptAsked = () => write(NOTIFICATION_PROMPT_KEY, '1');
