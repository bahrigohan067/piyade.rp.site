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
    if (host) {
      const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
      const proto = request.headers.get('x-forwarded-proto') || (isLocal ? 'http' : 'https');
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

export function isSecureRequest(request?: NextRequest, baseUrl?: string): boolean {
  if (request) {
    const host = request.headers.get('host') || '';
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      return false;
    }
    const proto = request.headers.get('x-forwarded-proto') || request.nextUrl?.protocol;
    if (proto && proto.includes('https')) return true;
  }
  if (baseUrl) {
    if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
      return false;
    }
    if (baseUrl.startsWith('https://')) return true;
  }
  return process.env.NODE_ENV === 'production';
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str, 'utf-8').toString('base64url');
}

function base64UrlDecode(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf-8');
}

/**
 * Creates a cryptographically signed, tamper-proof JWT session token (HS256).
 * Self-contained so user sessions NEVER get lost across container restarts.
 * Excludes arbitrary discord guild objects to keep cookie tiny (<500B) and fast.
 */
export function createSessionToken(userSession: UserSession): string {
  const secret = getSessionSecret();
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      id: userSession.id,
      username: userSession.username,
      discriminator: userSession.discriminator || '0',
      global_name: userSession.global_name || null,
      avatar: userSession.avatar || null,
      roblox_username: userSession.roblox_username || userSession.username,
      roles: userSession.roles || [],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1 Full Year
    })
  );

  const dataToSign = `${header}.${payload}`;
  const signature = crypto.createHmac('sha256', secret).update(dataToSign).digest('base64url');

  return `${dataToSign}.${signature}`;
}

/**
 * Backwards compatible alias for signSessionToken
 */
export function signSessionToken(sessionToken: string): string {
  const secret = getSessionSecret();
  const signature = crypto.createHmac('sha256', secret).update(sessionToken).digest('base64url');
  return `${sessionToken}.${signature}`;
}

/**
 * Cryptographically verifies an HMAC-signed session cookie.
 * Returns the verified UserSession if authentic, or null if tampered/invalid.
 */
export function verifySessionToken(token: string): UserSession | null {
  if (!token || typeof token !== 'string') return null;

  let cleanToken = token.trim();
  if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
    cleanToken = cleanToken.slice(1, -1);
  }
  try {
    cleanToken = decodeURIComponent(cleanToken);
  } catch {}

  const parts = cleanToken.split('.');

  // 1. Standard 3-part JWT format: header.payload.signature
  if (parts.length === 3) {
    const [headerB64, payloadB64, signatureB64] = parts;
    const dataToVerify = `${headerB64}.${payloadB64}`;
    const secret = getSessionSecret();
    const expectedSignature = crypto.createHmac('sha256', secret).update(dataToVerify).digest('base64url');

    const sigBuf = Buffer.from(signatureB64);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

    try {
      const payloadStr = base64UrlDecode(payloadB64);
      const payload = JSON.parse(payloadStr);

      // Check expiration
      if (payload.exp && typeof payload.exp === 'number') {
        const nowSec = Math.floor(Date.now() / 1000);
        if (nowSec > payload.exp) return null;
      }

      if (!payload.id || !Array.isArray(payload.roles)) return null;

      return {
        id: payload.id,
        username: payload.username || 'User',
        discriminator: payload.discriminator || '0',
        global_name: payload.global_name || null,
        avatar: payload.avatar || null,
        roblox_username: payload.roblox_username || payload.username,
        roles: payload.roles || [],
        guilds: payload.guilds || [],
      };
    } catch {
      return null;
    }
  }

  // 2. Fallback: 2-part <token>.<signature> format
  if (parts.length === 2) {
    const [sessionToken, signature] = parts;
    if (!sessionToken || !signature || sessionToken.length < 32) return null;

    const secret = getSessionSecret();
    const expectedSignature = crypto.createHmac('sha256', secret).update(sessionToken).digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

    const stored = getUserBySessionToken(sessionToken);
    if (!stored) return null;

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

  return null;
}

export function verifySessionCookie(cookieValue: string): string | null {
  const session = verifySessionToken(cookieValue);
  return session ? session.id : null;
}

/**
 * Retrieves the current user session securely.
 * Authenticates EXCLUSIVELY via cryptographically verified, HTTP-Only session cookies.
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

  return verifySessionToken(cookieVal);
}
