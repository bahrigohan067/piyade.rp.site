import { cookies } from 'next/headers';
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

export function getUserRoleLevel(roles: string[]) {
  const isKurucu = roles.includes(ROLES.KURUCU);
  const isUstYonetim = roles.includes(ROLES.UST_YONETIM);
  const isYonetici = roles.includes(ROLES.YONETICI);
  const isSeniorStaff = roles.includes(ROLES.SENIOR_STAFF);
  const isStaff = roles.includes(ROLES.STAFF);
  const isTrialStaff = roles.includes(ROLES.TRIAL_STAFF);
  const isWhitelist = roles.includes(ROLES.WHITELIST);
  const isIllegal = roles.includes(ROLES.ILLEGAL);

  const canViewOtherGuilds = isKurucu; // SADECE KURUCU GÖREBİLİR!
  const canIssueWarning = isKurucu || isUstYonetim || isYonetici || isSeniorStaff || isStaff; // Trial Staff veremez!
  const canViewAllMembers = isKurucu || isUstYonetim || isYonetici || isSeniorStaff || isStaff || isTrialStaff;
  const canAccessIllegalGang = isIllegal;

  let redirectPath = '/panel';
  if (isKurucu) {
    redirectPath = '/kurucu';
  } else if (isUstYonetim || isYonetici || isSeniorStaff || isStaff || isTrialStaff) {
    redirectPath = '/yetkili';
  } else if (isWhitelist) {
    redirectPath = '/panel';
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
