import { NextRequest, NextResponse } from 'next/server';
import {
  getUserUyariData,
  loadUyariDatabase,
  addWarning,
  addSicilRecord,
  saveUyariDatabase,
} from '@/lib/uyariStore';

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
  if (userId) {
    const data = getUserUyariData(userId);
    return NextResponse.json(data);
  }

  const allData = loadUyariDatabase();
  return NextResponse.json(allData);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, uyari, newPoints, newTier, jailBitis, sicilRecord } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId zorunludur' }, { status: 400 });
    }

    if (uyari) {
      addWarning(userId, uyari, newPoints, newTier, jailBitis);
    }

    if (sicilRecord) {
      addSicilRecord(userId, sicilRecord);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
