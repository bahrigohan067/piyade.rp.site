import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { ROLES } from './constants';
import { getUserById, getUserBySessionToken } from './userStore';

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

export async function getSession(request?: NextRequest): Promise<UserSession | null> {
  // 1. Check request headers (x-session-token / x-user-id) first
  if (request) {
    try {
      const sessionTokenHeader = request.headers.get('x-session-token');
      if (sessionTokenHeader) {
        const stored = getUserBySessionToken(sessionTokenHeader);
        if (stored) {
          return {
            id: stored.id,
            username: stored.username,
            discriminator: stored.discriminator,
            global_name: stored.global_name,
            avatar: stored.avatar,
            roblox_username: stored.roblox_username,
            roles: stored.roles,
            guilds: stored.guilds,
            sessionToken: stored.sessionToken,
          };
        }
      }

      const userIdHeader = request.headers.get('x-user-id');
      if (userIdHeader) {
        const stored = getUserById(userIdHeader);
        if (stored) {
          return {
            id: stored.id,
            username: stored.username,
            discriminator: stored.discriminator,
            global_name: stored.global_name,
            avatar: stored.avatar,
            roblox_username: stored.roblox_username,
            roles: stored.roles,
            guilds: stored.guilds,
            sessionToken: stored.sessionToken,
          };
        }
      }

      // Check query parameters (?st= / ?uid=)
      const qToken = request.nextUrl?.searchParams?.get('st');
      if (qToken) {
        const stored = getUserBySessionToken(qToken);
        if (stored) return stored;
      }

      const qUid = request.nextUrl?.searchParams?.get('uid');
      if (qUid) {
        const stored = getUserById(qUid);
        if (stored) return stored;
      }
    } catch {}
  }

  // 2. Retrieve cookies (piyade_session or piyade_token)
  let cookieVal: string | undefined;
  let tokenCookieVal: string | undefined;

  if (request) {
    try {
      cookieVal = request.cookies.get('piyade_session')?.value;
      tokenCookieVal = request.cookies.get('piyade_token')?.value;
    } catch {}
  }

  if (!cookieVal) {
    try {
      const cookieStore = cookies();
      cookieVal = cookieStore.get('piyade_session')?.value;
      if (!tokenCookieVal) {
        tokenCookieVal = cookieStore.get('piyade_token')?.value;
      }
    } catch {}
  }

  // If token cookie is set, look up user directly
  if (tokenCookieVal) {
    const stored = getUserBySessionToken(tokenCookieVal);
    if (stored) return stored;
  }

  if (!cookieVal) return null;

  // Direct token check if cookie is just the raw token string
  if (cookieVal.startsWith('st_')) {
    const stored = getUserBySessionToken(cookieVal);
    if (stored) return stored;
  }

  // Direct user ID check
  if (/^\d{15,22}$/.test(cookieVal)) {
    const stored = getUserById(cookieVal);
    if (stored) return stored;
  }

  // 3. Parse Base64 session payload safely with decodeURIComponent
  try {
    let rawStr = cookieVal;
    try {
      rawStr = decodeURIComponent(cookieVal);
    } catch {}

    const decodedBuf = Buffer.from(rawStr, 'base64').toString('utf-8');
    const parsed = JSON.parse(decodedBuf);

    if (parsed.sessionToken) {
      const stored = getUserBySessionToken(parsed.sessionToken);
      if (stored) {
        return {
          id: stored.id,
          username: stored.username,
          discriminator: stored.discriminator,
          global_name: stored.global_name,
          avatar: stored.avatar,
          roblox_username: stored.roblox_username,
          roles: stored.roles,
          guilds: stored.guilds,
          sessionToken: stored.sessionToken,
        };
      }
    }

    if (parsed.id) {
      const stored = getUserById(parsed.id);
      if (stored) {
        return {
          id: stored.id,
          username: stored.username,
          discriminator: stored.discriminator,
          global_name: stored.global_name,
          avatar: stored.avatar,
          roblox_username: stored.roblox_username,
          roles: stored.roles,
          guilds: stored.guilds,
          sessionToken: stored.sessionToken,
        };
      }
    }

    if (parsed.id && (parsed.username || parsed.roles)) {
      return {
        id: parsed.id,
        username: parsed.username || 'User',
        discriminator: parsed.discriminator || '0',
        global_name: parsed.global_name || null,
        avatar: parsed.avatar || null,
        roblox_username: parsed.roblox_username,
        roles: parsed.roles || [],
        sessionToken: parsed.sessionToken,
      };
    }

    return null;
  } catch {
    return null;
  }
}
