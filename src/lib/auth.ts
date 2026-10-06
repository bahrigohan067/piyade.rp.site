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
  let cookieVal: string | undefined;

  // 1. Try reading directly from NextRequest cookies
  if (request) {
    try {
      cookieVal = request.cookies.get('piyade_session')?.value;
    } catch {}
  }

  // 2. Fallback to next/headers cookies()
  if (!cookieVal) {
    try {
      const cookieStore = cookies();
      cookieVal = cookieStore.get('piyade_session')?.value;
    } catch {}
  }

  // 3. Fallback to request x-session-token or x-user-id header
  if (!cookieVal && request) {
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
    } catch {}
  }

  if (!cookieVal) return null;

  try {
    const rawVal = Buffer.from(cookieVal, 'base64').toString('utf-8');
    const parsed = JSON.parse(rawVal);

    // 1. Check userStore by sessionToken (Primary Persistent Storage)
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

    // 2. Check userStore by userId
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

    // 3. Fallback to direct cookie data
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
