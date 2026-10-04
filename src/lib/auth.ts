import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { ROLES } from './constants';

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

export function getUserRoleLevel(roles: string[]) {
  const isKurucu = roles.includes(ROLES.KURUCU);
  const isUstYonetim = roles.includes(ROLES.UST_YONETIM);
  const isYonetici = roles.includes(ROLES.YONETICI);
  const isSeniorStaff = roles.includes(ROLES.SENIOR_STAFF);
  const isStaff = roles.includes(ROLES.STAFF);
  const isTrialStaff = roles.includes(ROLES.TRIAL_STAFF);
  const isWhitelist = roles.includes(ROLES.WHITELIST);
  const isIllegal = roles.includes(ROLES.ILLEGAL);
  const isStaffAny = isKurucu || isUstYonetim || isYonetici || isSeniorStaff || isStaff || isTrialStaff;
  const isKayitsiz = roles.includes(ROLES.KAYITSIZ) || (!isWhitelist && !isStaffAny);

  const canViewOtherGuilds = isKurucu;
  const canIssueWarning = isKurucu || isUstYonetim || isYonetici || isSeniorStaff || isStaff;
  const canViewAllMembers = isStaffAny;
  const canAccessIllegalGang = isIllegal;
  const onlyRegistration = isKayitsiz && !isWhitelist && !isStaffAny;

  let redirectPath = '/kayit';
  if (isKurucu) {
    redirectPath = '/kurucu';
  } else if (isUstYonetim || isYonetici || isSeniorStaff || isStaff || isTrialStaff) {
    redirectPath = '/yetkili';
  } else if (isWhitelist) {
    redirectPath = '/panel';
  } else {
    redirectPath = '/kayit';
  }

  return {
    isKurucu,
    isUstYonetim,
    isYonetici,
    isSeniorStaff,
    isStaff,
    isTrialStaff,
    isWhitelist,
    isIllegal,
    isKayitsiz,
    onlyRegistration,
    canViewOtherGuilds,
    canIssueWarning,
    canViewAllMembers,
    canAccessIllegalGang,
    redirectPath,
  };
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('piyade_session');
  if (!sessionCookie) return null;

  try {
    const sessionData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));
    return sessionData;
  } catch {
    return null;
  }
}
