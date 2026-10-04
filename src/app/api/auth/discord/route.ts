import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.NEXTAUTH_URL 
    ? `${process.env.NEXTAUTH_URL}/api/auth/callback/discord`
    : `${request.nextUrl.origin}/api/auth/callback/discord`;

  if (!clientId) {
    // Eğer henüz Client ID tanımlanmamışsa, kullanıcıyı demo/test seçim sayfasına yönlendir
    return NextResponse.redirect(new URL('/auth/select-role', request.url));
  }

  const scopes = ['identify', 'guilds', 'guilds.members.read'].join(' ');
  const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(scopes)}`;

  return NextResponse.redirect(discordAuthUrl);
}
