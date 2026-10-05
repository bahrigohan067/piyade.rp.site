import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/auth';
import { removeSessionToken } from '@/lib/userStore';

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const sessionCookie = request.cookies.get('piyade_session');

  if (sessionCookie?.value) {
    try {
      const parsed = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));
      if (parsed?.sessionToken) {
        removeSessionToken(parsed.sessionToken);
      }
    } catch {}
  }

  const res = NextResponse.redirect(new URL('/', baseUrl));
  res.cookies.set('piyade_session', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'lax',
  });
  return res;
}
