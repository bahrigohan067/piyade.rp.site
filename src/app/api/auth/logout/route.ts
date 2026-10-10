import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl, verifySessionCookie } from '@/lib/auth';
import { removeSessionToken } from '@/lib/userStore';

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const sessionCookie = request.cookies.get('piyade_session')?.value;

  if (sessionCookie) {
    try {
      const sessionToken = verifySessionCookie(sessionCookie);
      if (sessionToken) {
        removeSessionToken(sessionToken);
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
  res.cookies.set('piyade_token', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'lax',
  });
  return res;
}
