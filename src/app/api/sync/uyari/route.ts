import { NextRequest, NextResponse } from 'next/server';
import {
  getUserUyariData,
  loadUyariDatabase,
  addWarning,
  addSicilRecord,
  removeWarning,
  removeSicilRecordByUyariOrMadde,
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

  // 1. Uyarı ID'sine göre arama (Örn: /api/sync/uyari?uyariId=A1B2)
  const uyariIdParam = request.nextUrl.searchParams.get('uyariId');
  if (uyariIdParam) {
    const cleanId = uyariIdParam.toUpperCase().replace('#', '').trim();
    const allData = loadUyariDatabase();
    for (const [uid, udata] of Object.entries(allData)) {
      const found = (udata.uyarilar || []).find((u) => u.id === cleanId);
      if (found) {
        return NextResponse.json({
          found: true,
          userId: uid,
          uyari: found,
          user: udata,
        });
      }
    }
    return NextResponse.json({ found: false }, { status: 404 });
  }

  // 2. Kullanıcı ID'sine göre arama
  const userId = request.nextUrl.searchParams.get('userId');
  if (userId) {
    const data = getUserUyariData(userId);
    return NextResponse.json(data);
  }

  // 3. Tüm veritabanı
  const allData = loadUyariDatabase();
  return NextResponse.json(allData);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, userId, uyariId, madde, uyari, newPoints, newTier, jailBitis, sicilRecord } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId zorunludur' }, { status: 400 });
    }

    // İptal İşlemi (Cancel / Remove)
    if (action === 'cancel' || uyariId) {
      const updatedUser = removeWarning(userId, uyariId || '', newPoints, newTier);
      removeSicilRecordByUyariOrMadde(userId, uyariId, madde);
      return NextResponse.json({
        success: true,
        message: `Uyarı #${uyariId} başarıyla iptal edildi.`,
        user: updatedUser,
      });
    }

    // Yeni Uyarı Ekleme
    if (uyari) {
      addWarning(userId, uyari, newPoints, newTier, jailBitis);
    }

    // Sicil Kaydı Ekleme
    if (sicilRecord) {
      addSicilRecord(userId, sicilRecord);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

