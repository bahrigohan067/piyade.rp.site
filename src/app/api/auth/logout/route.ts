import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
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
