import { NextRequest, NextResponse } from 'next/server';
import { fetchWarningHistory, DiscordWarningRecord } from '@/lib/discord';
import { getSession } from '@/lib/auth';
import { loadUyariDatabase } from '@/lib/uyariStore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Giriş yapılmadı' }, { status: 401 });
  }

  const channelWarnings = await fetchWarningHistory();
  const db = loadUyariDatabase();

  const combinedWarnings: DiscordWarningRecord[] = [...channelWarnings];
  const existingIds = new Set(channelWarnings.map((w) => w.id));

  // Merge warnings from persistent uyari_data.json
  for (const [targetUserId, userData] of Object.entries(db)) {
    for (const u of userData.uyarilar || []) {
      if (!existingIds.has(u.id)) {
        combinedWarnings.push({
          id: u.id,
          targetId: targetUserId,
          targetName: 'Kullanıcı',
          staffId: String(u.yetkili_id),
          staffName: 'Yetkili',
          ruleId: u.madde,
          ruleTitle: u.aciklama,
          points: u.puan,
          totalPoints: userData.toplam_puan,
          special: null,
          reason: u.aciklama,
          action: `Uyarı Kademe ${userData.kademe}`,
          date: u.tarih,
          expiryDate: u.bitis_tarihi,
          proofUrl: u.kanit_url,
          isVerbal: u.madde === 'SÖZLÜ',
        });
        existingIds.add(u.id);
      }
    }
  }

  return NextResponse.json({ warnings: combinedWarnings });
}
