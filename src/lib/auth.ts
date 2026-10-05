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

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('piyade_session');
  if (!sessionCookie) return null;

  try {
    const rawVal = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
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
    if (parsed.id && parsed.username) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}
