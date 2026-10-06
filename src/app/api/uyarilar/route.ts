import { NextRequest, NextResponse } from 'next/server';
import { fetchWarningHistory } from '@/lib/discord';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Giriş yapılmadı' }, { status: 401 });
  }

  const warnings = await fetchWarningHistory();
  return NextResponse.json({ warnings });
}
