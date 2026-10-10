import { NextRequest, NextResponse } from 'next/server';
import { getSession, createSessionToken, isSecureRequest } from '@/lib/auth';
import { GUILD_ID } from '@/lib/constants';
import { updateUserRoles } from '@/lib/userStore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ session: null }, { status: 401 });
  }

  let rolesChanged = false;
  // Real-time server role sync using Bot Token (never prompts user to re-authorize!)
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (botToken && session.id) {
    try {
      const memberRes = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${session.id}`, {
        headers: { Authorization: `Bot ${botToken}` },
        cache: 'no-store',
      });
      if (memberRes.ok) {
        const memberData = await memberRes.json();
        const currentRoles: string[] = memberData.roles || [];
        session.roles = currentRoles;
        let robloxName = session.roblox_username;
        const nick = memberData.nick || '';
        if (nick.includes('|')) {
          robloxName = nick.split('|')[1].trim();
          session.roblox_username = robloxName;
        }
        rolesChanged = true;
        updateUserRoles(session.id, currentRoles, robloxName);
      }
    } catch {
      // Non-blocking fallback to stored roles
    }
  }

  const res = NextResponse.json({ session });

  // Silently refresh the signed JWT cookie when roles update
  if (rolesChanged) {
    const isSecure = isSecureRequest(request);
    const updatedCookie = createSessionToken(session);
    res.cookies.set('piyade_session', updatedCookie, {
      path: '/',
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return res;
}
