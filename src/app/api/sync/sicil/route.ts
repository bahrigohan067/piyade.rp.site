import { NextRequest, NextResponse } from 'next/server';
import { loadSicilDatabase, addSicilRecord } from '@/lib/uyariStore';

function isAuthorized(request: NextRequest): boolean {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) return false;

  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${botToken}`) return true;

  const tokenHeader = request.headers.get('x-bot-token');
  if (tokenHeader === botToken) return true;

  return false;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  const userId = request.nextUrl.searchParams.get('userId');
  const allSicil = loadSicilDatabase();

  if (userId) {
    const userRecords = allSicil[String(userId)] || [];
    return NextResponse.json({ records: userRecords });
  }

  return NextResponse.json(allSicil);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, record } = body;

    if (!userId || !record) {
      return NextResponse.json({ error: 'userId ve record zorunludur' }, { status: 400 });
    }

    addSicilRecord(userId, record);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
