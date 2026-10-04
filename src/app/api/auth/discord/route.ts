import { NextRequest, NextResponse } from 'next/server';

function getRedirectUri(request: NextRequest): string {
  if (process.env.NEXTAUTH_URL) {
    const base = process.env.NEXTAUTH_URL.replace(/\/$/, '');
    return `${base}/api/auth/callback/discord`;
  }
  
  // Railway proxy headers kontrolü (SSL https zorlaması)
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host;
  const proto = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  
  return `${proto}://${host}/api/auth/callback/discord`;
}

export async function GET(request: NextRequest) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = getRedirectUri(request);

  if (!clientId) {
    // Eğer henüz Client ID girilmemişse rol seçim / simülasyon ekranına yönlendir
    return NextResponse.redirect(new URL('/auth/select-role', request.url));
  }

  const scopes = ['identify', 'guilds', 'guilds.members.read'].join(' ');
  const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(scopes)}`;

  return NextResponse.redirect(discordAuthUrl);
}
