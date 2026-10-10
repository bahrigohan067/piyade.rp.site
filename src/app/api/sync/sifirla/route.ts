import { NextRequest, NextResponse } from 'next/server';
import { resetUserWarnings } from '@/lib/uyariStore';

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

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId zorunludur' }, { status: 400 });
    }

    resetUserWarnings(userId);
    return NextResponse.json({ success: true, message: `Kullanıcı ${userId} uyarıları sıfırlandı.` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
