import { NextResponse } from 'next/server';
import { fetchGuildMembers } from '@/lib/discord';
import { getSession, getUserRoleLevel } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Giriş yapılmadı' }, { status: 401 });
  }

  const roleLevel = getUserRoleLevel(session.roles);
  if (!roleLevel.canViewAllMembers) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
  }

  const members = await fetchGuildMembers();
  return NextResponse.json({ members });
}
