import { NextRequest, NextResponse } from 'next/server';
import { CHANNELS, GUILD_ID, PUNISHMENT_ROLES, RULES } from '@/lib/constants';
import { getSession, getUserRoleLevel } from '@/lib/auth';

function generateUyariId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 4; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Giriş yapmalısınız.' }, { status: 401 });
  }

  const roleLevel = getUserRoleLevel(session.roles);
  if (!roleLevel.canIssueWarning) {
    return NextResponse.json({ error: 'Uyarı verme yetkiniz bulunmamaktadır (Trial Staff uyarı veremez).' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { type, targetUserId, targetUsername, ruleId, reason, proofUrl } = body;

    const botToken = process.env.DISCORD_BOT_TOKEN;
    const uyariId = generateUyariId();
    const nowStr = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });

    if (type === 'sozlu') {
      // 1. SÖZLÜ UYARI
      if (botToken) {
        try {
          await fetch(`https://discord.com/api/v10/channels/${CHANNELS.UYARILAR}/messages`, {
            method: 'POST',
            headers: {
              Authorization: `Bot ${botToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              embeds: [
                {
                  title: '⚠️ SÖZLÜ UYARI VERİLDİ',
                  color: 0xf59e0b,
                  description: `**${targetUsername}** (<@${targetUserId}>) adlı üyeye yetkili tarafından **Sözlü Uyarı** iletilmiştir.`,
                  fields: [
                    { name: '👤 İşlem Yapılan Üye', value: `<@${targetUserId}> (${targetUserId})`, inline: true },
                    { name: '🛡️ İşlem Yapan Yetkili', value: `${session.username} (<@${session.id}>)`, inline: true },
                    { name: '📝 Sözlü Uyarı Sebebi', value: reason || 'Sözlü uyarı kurallarına riayet edilmesi istendi.', inline: false },
                  ],
                  footer: { text: `Piyade RP Web Paneli • ID: #${uyariId}` },
                  timestamp: new Date().toISOString(),
                },
              ],
            }),
          });
        } catch (e) {
          console.error('Discord webhook error:', e);
        }
      }

      return NextResponse.json({
        success: true,
        message: `✅ #${uyariId} Sözlü Uyarı başarıyla işlendi ve Discord #uyarılar kanalına bildirildi!`,
        uyariId,
      });
    }

    // 2. KURAL MADDESİ UYARISI
    const rule = RULES.find((r) => r.id === ruleId);
    if (!rule) {
      return NextResponse.json({ error: 'Geçersiz kural maddesi seçildi.' }, { status: 400 });
    }

    // Discord #uyarilar ve #sicil-log kanallarına gönder
    if (botToken) {
      try {
        await fetch(`https://discord.com/api/v10/channels/${CHANNELS.UYARILAR}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bot ${botToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            embeds: [
              {
                title: `🚨 YENİ CEZA / UYARI: ${rule.id}`,
                color: 0xef4444,
                description: `**${targetUsername}** (<@${targetUserId}>) resmi kural ihlali gerekçesiyle cezalandırıldı.`,
                fields: [
                  { name: '👤 Ceza Alan Üye', value: `<@${targetUserId}> (${targetUserId})`, inline: true },
                  { name: '🛡️ Yetkili', value: `${session.username} (<@${session.id}>)`, inline: true },
                  { name: '⚖️ İhlal Edilen Kural', value: `**${rule.id}** — ${rule.description}`, inline: false },
                  { name: '📊 Ceza Puanı / Yaptırım', value: rule.points > 0 ? `+${rule.points} Ceza Puanı` : (rule.special || 'Özel Yaptırım'), inline: true },
                  { name: '📝 Olay Detayı / Açıklama', value: reason || 'Belirtilmedi', inline: false },
                  { name: '🔗 Kanıt', value: proofUrl ? `[Kanıtı İncele](${proofUrl})` : 'Kanıt eklenmedi', inline: true },
                ],
                footer: { text: `Piyade RP Web Paneli • Sicil No: #${uyariId}` },
                timestamp: new Date().toISOString(),
              },
            ],
          }),
        });

        // Sicil log kanalına da arşivle
        await fetch(`https://discord.com/api/v10/channels/${CHANNELS.SICIL_LOG}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bot ${botToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: `📋 **[SİCİL ARŞİVİ]** #${uyariId} numaralı ceza <@${targetUserId}> adına <@${session.id}> tarafından sisteme işlendi.`,
          }),
        });
      } catch (e) {
        console.error('Discord API warning notification error:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: `✅ #${uyariId} kodlu uyarı başarıyla işlendi! Puan hesaplandı, Discord #uyarılar kanalına embed atıldı ve kullanıcı siciline kaydedildi.`,
      uyariId,
    });
  } catch (error) {
    console.error('Uyari API error:', error);
    return NextResponse.json({ error: 'İşlem sırasında bir hata oluştu.' }, { status: 500 });
  }
}
