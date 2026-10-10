'use client';

export interface ClientSession {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string | null;
  avatar: string | null;
  roblox_username?: string;
  roles: string[];
}

/**
 * Initializes client auth state and cleans any obsolete query tokens from URLs.
 */
export function initClientSession(): void {
  if (typeof window === 'undefined') return;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const hasSt = urlParams.has('st');
    const hasUid = urlParams.has('uid');

    if (hasSt || hasUid) {
      urlParams.delete('st');
      urlParams.delete('uid');
      const newQuery = urlParams.toString() ? `?${urlParams.toString()}` : '';
      const newUrl = `${window.location.pathname}${newQuery}${window.location.hash}`;
      window.history.replaceState({}, document.title, newUrl);
    }

    // Clean obsolete keys from localStorage
    localStorage.removeItem('piyade_token');
    localStorage.removeItem('piyade_user_id');
  } catch {}
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
 * Returns standard API request headers.
 * Authentication is handled securely via HTTP-Only cookies.
 */
export function getAuthHeaders(): Record<string, string> {
  return {};
}

/**
 * Fetches current session from /api/auth/me with HTTP-Only credentials.
 * Updates localStorage on success.
 */
export async function syncSession(): Promise<ClientSession | null> {
  initClientSession();

  try {
    const res = await fetch('/api/auth/me', {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.session) {
        try {
          localStorage.setItem('piyade_session', JSON.stringify(data.session));
        } catch {}
        return data.session;
      }
    } else if (res.status === 401) {
      // Session expired or invalid
      try {
        localStorage.removeItem('piyade_session');
      } catch {}
      return null;
    }
  } catch (err) {
    console.warn('Session sync warning:', err);
  }

  // Fallback to cached session if network had temporary error
  return getCachedSession();
}
