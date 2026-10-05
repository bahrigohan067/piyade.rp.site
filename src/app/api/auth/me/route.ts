import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { GUILD_ID } from '@/lib/constants';
import { updateUserRoles } from '@/lib/userStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ session: null }, { status: 401 });
  }

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
        updateUserRoles(session.id, currentRoles, robloxName);
      }
    } catch {
      // Non-blocking fallback to stored roles in data/users.json
    }
  }

  return NextResponse.json({ session });
}
