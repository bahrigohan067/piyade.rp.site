'use client';

export interface ClientSession {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string | null;
  avatar: string | null;
  roblox_username?: string;
  roles: string[];
  sessionToken?: string;
}

/**
 * Initializes client auth state by capturing ?st= and ?uid= tokens if redirected from Discord callback,
 * and saving them to localStorage.
 */
export function initClientSession(): { token: string | null; userId: string | null } {
  if (typeof window === 'undefined') return { token: null, userId: null };

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('st');
    const urlUid = urlParams.get('uid');

    if (urlToken) {
      localStorage.setItem('piyade_token', urlToken);
    }
    if (urlUid) {
      localStorage.setItem('piyade_user_id', urlUid);
    }

    // Clean sensitive tokens from URL without reloading
    if (urlToken || urlUid) {
      urlParams.delete('st');
      urlParams.delete('uid');
      const newQuery = urlParams.toString() ? `?${urlParams.toString()}` : '';
      const newUrl = `${window.location.pathname}${newQuery}${window.location.hash}`;
      window.history.replaceState({}, document.title, newUrl);
    }

    // Also check document.cookie for piyade_token
    let token = localStorage.getItem('piyade_token');
    let userId = localStorage.getItem('piyade_user_id');

    if (!token && typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|;\s*)piyade_token=([^;]+)/);
      if (match) {
        token = match[1];
        localStorage.setItem('piyade_token', token);
      }
    }

    return { token, userId };
  } catch {
    return { token: null, userId: null };
  }
}

/**
 * Retrieves cached session from localStorage for instant, zero-flicker UI rendering.
 */
export function getCachedSession(): ClientSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('piyade_session');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return null;
}

/**
 * Returns auth headers to pass to all internal API fetch calls.
 */
export function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const token = localStorage.getItem('piyade_token') || '';
    const userId = localStorage.getItem('piyade_user_id') || '';
    return {
      ...(token ? { 'x-session-token': token } : {}),
      ...(userId ? { 'x-user-id': userId } : {}),
    };
  } catch {
    return {};
  }
}

/**
 * Fetches current session from /api/auth/me with credentials and fallback headers.
 * Updates localStorage on success.
 */
export async function syncSession(): Promise<ClientSession | null> {
  initClientSession();

  try {
    const res = await fetch('/api/auth/me', {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.session) {
        try {
          localStorage.setItem('piyade_session', JSON.stringify(data.session));
          if (data.session.sessionToken) {
            localStorage.setItem('piyade_token', data.session.sessionToken);
          }
          if (data.session.id) {
            localStorage.setItem('piyade_user_id', data.session.id);
          }
        } catch {}
        return data.session;
      }
    }
  } catch (err) {
    console.warn('Session sync warning:', err);
  }

  // Fallback to cached session if network had temporary error
  return getCachedSession();
}
