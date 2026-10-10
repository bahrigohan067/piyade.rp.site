import { NextRequest, NextResponse } from 'next/server';
import { GUILD_ID } from '@/lib/constants';
import { getBaseUrl, getUserRoleLevel, signSessionToken } from '@/lib/auth';
import { saveOrUpdateUser } from '@/lib/userStore';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const baseUrl = getBaseUrl(request);

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', baseUrl));
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const redirectUri = `${baseUrl}/api/auth/callback/discord`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/?error=discord_credentials_missing', baseUrl));
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
      return NextResponse.redirect(new URL('/?error=token_failed', baseUrl));
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

    // 5. Save or update user in persistent userStore (saved to Railway volume /data/users.json)
    const storedUser = saveOrUpdateUser({
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
    });

    // 6. Set cryptographically signed, HTTP-Only session cookie (valid for 1 year!)
    const signedCookieValue = signSessionToken(storedUser.sessionToken);

    // Direct clean redirect without leaking tokens or IDs in URL
    const redirectUrl = new URL(roleLevel.redirectPath, baseUrl);

    const res = NextResponse.redirect(redirectUrl);
    res.cookies.set('piyade_session', signedCookieValue, {
      path: '/',
      httpOnly: true, // STRICT HTTP-ONLY: XSS protection
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 Full Year
    });

    // Clear any legacy client-accessible cookie
    res.cookies.set('piyade_token', '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      sameSite: 'lax',
    });

    return res;
  } catch (error) {
    console.error('OAuth callback exception:', error);
    return NextResponse.redirect(new URL('/?error=callback_error', baseUrl));
  }
}
