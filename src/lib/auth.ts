import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { ROLES } from './constants';
import { getUserBySessionToken } from './userStore';

export interface UserGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

export interface UserSession {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string | null;
  avatar: string | null;
  roblox_username?: string;
  roles: string[];
  guilds?: UserGuild[];
  sessionToken?: string;
  isDevSimulation?: boolean;
}

export function getBaseUrl(request?: NextRequest): string {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, '');
  }
  if (request) {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const host = forwardedHost || request.headers.get('host');
    if (host && !host.includes('localhost:8080') && !host.includes('127.0.0.1')) {
      const proto = request.headers.get('x-forwarded-proto') || 'https';
      return `${proto}://${host}`;
    }
  }
  return 'https://piyade-rp.up.railway.app';
}

export { getUserRoleLevel } from './roles';

function getSessionSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.DISCORD_CLIENT_SECRET ||
    process.env.DISCORD_BOT_TOKEN ||
    'piyade_rp_fallback_internal_secure_key_2026'
  );
}

/**
 * Signs a session token with HMAC-SHA256 producing `<token>.<signature>`
 */
export function signSessionToken(sessionToken: string): string {
  const secret = getSessionSecret();
  const signature = crypto.createHmac('sha256', secret).update(sessionToken).digest('base64url');
  return `${sessionToken}.${signature}`;
}

/**
 * Cryptographically verifies an HMAC-signed session cookie.
 * Returns the verified sessionToken if authentic, or null if tampered/invalid.
 */
export function verifySessionCookie(cookieValue: string): string | null {
  if (!cookieValue || typeof cookieValue !== 'string') return null;

  let cleanValue = cookieValue;
  try {
    cleanValue = decodeURIComponent(cookieValue);
  } catch {}

  const parts = cleanValue.split('.');
  if (parts.length !== 2) return null;

  const [sessionToken, signature] = parts;
  if (!sessionToken || !signature || sessionToken.length < 32) return null;

  const secret = getSessionSecret();
  const expectedSignature = crypto.createHmac('sha256', secret).update(sessionToken).digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);

  if (sigBuf.length !== expBuf.length) {
    return null;
  }

  try {
    if (crypto.timingSafeEqual(sigBuf, expBuf)) {
      return sessionToken;
    }
  } catch {}

  return null;
}

/**
 * Retrieves the current user session securely.
 * Authenticates EXCLUSIVELY via cryptographically verified, HTTP-Only session cookies.
 * Does NOT trust client-supplied headers (x-user-id), query parameters (?uid=),
 * or unsigned client-forged cookie payloads.
 */
export async function getSession(request?: NextRequest): Promise<UserSession | null> {
  let cookieVal: string | undefined;

  if (request) {
    try {
      cookieVal = request.cookies.get('piyade_session')?.value;
    } catch {}
  }

  if (!cookieVal) {
    try {
      const cookieStore = cookies();
      cookieVal = cookieStore.get('piyade_session')?.value;
    } catch {}
  }

  if (!cookieVal) return null;

  // 1. Cryptographic HMAC verification
  const validToken = verifySessionCookie(cookieVal);
  if (!validToken) {
    return null;
  }

  // 2. Strict server-side user lookup
  const stored = getUserBySessionToken(validToken);
  if (!stored) {
    return null;
  }

  // 3. Return strictly verified session
  return {
    id: stored.id,
    username: stored.username,
    discriminator: stored.discriminator,
    global_name: stored.global_name,
    avatar: stored.avatar,
    roblox_username: stored.roblox_username,
    roles: stored.roles,
    guilds: stored.guilds,
  };
}
