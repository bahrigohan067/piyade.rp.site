import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const baseUrl = getBaseUrl(request);
  const redirectUri = `${baseUrl}/api/auth/callback/discord`;

  if (!clientId) {
    return NextResponse.redirect(new URL('/?error=discord_client_id_missing', baseUrl));
  }

  const scopes = ['identify', 'guilds', 'guilds.members.read'].join(' ');
  const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(scopes)}`;

  return NextResponse.redirect(discordAuthUrl);
}
