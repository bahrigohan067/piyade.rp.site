import { NextRequest, NextResponse } from 'next/server';
import { findRobloxUser } from '@/lib/roblox';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  if (!query) {
    return NextResponse.json({ error: 'Sorgu parametresi eksik.' }, { status: 400 });
  }

  const user = await findRobloxUser(query);
  if (!user) {
    return NextResponse.json({ found: false, error: 'Roblox kullanıcısı bulunamadı.' }, { status: 404 });
  }

  return NextResponse.json({
    found: true,
    user,
  });
}
