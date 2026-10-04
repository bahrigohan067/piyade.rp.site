import { NextRequest, NextResponse } from 'next/server';
import { GUILD_ID } from '@/lib/constants';
import { getUserRoleLevel, UserSession } from '@/lib/auth';

function getRedirectUri(request: NextRequest): string {
  if (process.env.NEXTAUTH_URL) {
    const base = process.env.NEXTAUTH_URL.replace(/\/$/, '');
    return `${base}/api/auth/callback/discord`;
  }
  
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host;
  const proto = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  
  return `${proto}://${host}/api/auth/callback/discord`;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const origin = request.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', origin));
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const redirectUri = getRedirectUri(request);

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/auth/select-role', origin));
  }

  try {
    // 1. Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/v10/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Discord token error:', await tokenResponse.text());
      return NextResponse.redirect(new URL('/?error=token_failed', origin));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch User Profile
    const userRes = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userData = await userRes.json();

    // 3. Fetch User's Guilds (for Kurucu inspection)
    let userGuilds = [];
    try {
      const guildsRes = await fetch('https://discord.com/api/v10/users/@me/guilds', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (guildsRes.ok) {
        userGuilds = await guildsRes.json();
      }
    } catch (e) {
      console.error('Guilds fetch error:', e);
    }

    // 4. Fetch Member roles in Piyade RP server using Bot Token
    let memberRoles: string[] = [];
    let robloxUsername = '';

    if (botToken) {
      try {
        const memberRes = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userData.id}`, {
          headers: { Authorization: `Bot ${botToken}` },
        });

        if (memberRes.ok) {
          const memberData = await memberRes.json();
          memberRoles = memberData.roles || [];
          const nick = memberData.nick || '';
          if (nick.includes('|')) {
            robloxUsername = nick.split('|')[1].trim();
          }
        }
      } catch (e) {
        console.error('Member fetch error:', e);
      }
    }

    const roleLevel = getUserRoleLevel(memberRoles);

    // 5. Create Session Object
    const session: UserSession = {
      id: userData.id,
      username: userData.username,
      discriminator: userData.discriminator,
      global_name: userData.global_name,
      avatar: userData.avatar,
      roblox_username: robloxUsername || userData.username,
      roles: memberRoles,
      guilds: userGuilds.map((g: any) => ({
        id: g.id,
        name: g.name,
        icon: g.icon,
        owner: g.owner,
        permissions: g.permissions,
      })),
    };

    const sessionCookieValue = Buffer.from(JSON.stringify(session)).toString('base64');

    const res = NextResponse.redirect(new URL(roleLevel.redirectPath, origin));
    res.cookies.set('piyade_session', sessionCookieValue, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error) {
    console.error('OAuth callback exception:', error);
    return NextResponse.redirect(new URL('/?error=callback_error', origin));
  }
}
