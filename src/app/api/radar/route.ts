import { NextResponse } from 'next/server';
import { fetchLiveRadarData } from '@/lib/erlc';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await fetchLiveRadarData();
  return NextResponse.json(data);
}
