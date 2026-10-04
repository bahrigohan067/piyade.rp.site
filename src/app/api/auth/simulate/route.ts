import { NextRequest, NextResponse } from 'next/server';
import { ROLES } from '@/lib/constants';
import { getUserRoleLevel, UserSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const roleType = request.nextUrl.searchParams.get('role') || 'kurucu';
  const origin = request.nextUrl.origin;

  let assignedRoles: string[] = [];
  let username = 'TestKullanici';

  switch (roleType) {
    case 'kurucu':
      assignedRoles = [ROLES.KURUCU, ROLES.WHITELIST];
      username = 'Kurucu (Owner)';
      break;
    case 'ust_yonetim':
      assignedRoles = [ROLES.UST_YONETIM, ROLES.WHITELIST];
      username = 'UstYonetim_Uye';
      break;
    case 'yonetici':
      assignedRoles = [ROLES.YONETICI, ROLES.WHITELIST];
      username = 'Yonetici_Uye';
      break;
    case 'senior_staff':
      assignedRoles = [ROLES.SENIOR_STAFF, ROLES.WHITELIST];
      username = 'SeniorStaff_Uye';
      break;
    case 'staff':
      assignedRoles = [ROLES.STAFF, ROLES.WHITELIST];
      username = 'Staff_Uye';
      break;
    case 'trial_staff':
      assignedRoles = [ROLES.TRIAL_STAFF, ROLES.WHITELIST];
      username = 'TrialStaff_Uye';
      break;
    case 'illegal':
      assignedRoles = [ROLES.WHITELIST, ROLES.ILLEGAL];
      username = 'CeteUyesi_Ahmet';
      break;
    case 'whitelist':
    default:
      assignedRoles = [ROLES.WHITELIST];
      username = 'SivilOyuncu_Emre';
      break;
  }

  const roleLevel = getUserRoleLevel(assignedRoles);

  const mockSession: UserSession = {
    id: '1529546007635824680',
    username,
    discriminator: '0001',
    global_name: username,
    avatar: null,
    roblox_username: `${username}_Roblox`,
    roles: assignedRoles,
    isDevSimulation: true,
    guilds: [
      { id: '1529545898294509589', name: 'ER:LC Piyadeleri (Bizim Sunucu)', icon: null, owner: true, permissions: '8' },
      { id: '998877665544332211', name: 'Liberty County Turkey RP', icon: null, owner: false, permissions: '0' },
      { id: '887766554433221100', name: 'Istanbul Roleplay ERLC', icon: null, owner: false, permissions: '0' },
      { id: '776655443322110099', name: 'Turkish Police Department Clan', icon: null, owner: false, permissions: '0' },
      { id: '665544332211009988', name: 'Vagos Gang Community', icon: null, owner: false, permissions: '0' },
    ],
  };

  const sessionCookieValue = Buffer.from(JSON.stringify(mockSession)).toString('base64');

  const res = NextResponse.redirect(new URL(roleLevel.redirectPath, origin));
  res.cookies.set('piyade_session', sessionCookieValue, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
