import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const res = NextResponse.redirect(new URL('/', baseUrl));
  res.cookies.delete('piyade_session');
  return res;
}
