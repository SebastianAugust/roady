const TOKEN_KEY = 'roady.token';

// localStorage can throw (private mode, blocked storage); the session then simply does not survive a reload.
export function loadToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export function saveToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignored, see above
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignored, see above
  }
}
