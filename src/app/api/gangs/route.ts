import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveGangs, getGangColors } from '@/lib/gangs';
import { GANG_ROLES, VALID_PARSELLER } from '@/lib/constants';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const [gangs, colors, session] = await Promise.all([
      fetchLiveGangs(),
      Promise.resolve(getGangColors()),
      getSession(),
    ]);

    let userGang = null;
    let isBoss = false;
    let isIllegal = false;

    if (session) {
      isIllegal = session.roles.includes(GANG_ROLES.ILLEGAL);
      isBoss = session.roles.includes(GANG_ROLES.BOSS);

      // Kullanıcının çetesi var mı kontrol et
      userGang = gangs.find((g) => g.boss === session.id || g.members.includes(session.id)) || null;
    }

    return NextResponse.json({
      success: true,
      gangs,
      colors: colors.slice(0, 100), // Popüler renkler
      allColorsCount: colors.length,
      parseller: VALID_PARSELLER,
      userGang,
      isBoss,
      isIllegal,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
