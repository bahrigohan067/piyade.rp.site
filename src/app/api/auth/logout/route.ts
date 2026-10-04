import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const res = NextResponse.redirect(new URL('/', request.nextUrl.origin));
  res.cookies.delete('piyade_session');
  return res;
}
