import { NextRequest, NextResponse } from 'next/server';
import { CHANNELS, GUILD_ID, PUNISHMENT_ROLES, RULES, STAFF_ROLE_TITLES, YETKILI_MADDELER } from '@/lib/constants';
import { getSession, getUserRoleLevel } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

function generateUyariId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 4; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function calculateTier(points: number): number {
  if (points >= 15) return 5;
  if (points >= 12) return 4;
  if (points >= 9) return 3;
  if (points >= 6) return 2;
  if (points >= 3) return 1;
  return 0;
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

  // Rate Limiting: Max 10 warnings per minute per staff member
  const rl = checkRateLimit(`uyari_${session.id}`, { limit: 10, windowMs: 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Çok hızlı işlem yapıyorsunuz. Lütfen 1 dakika bekleyiniz.' }, { status: 429 });
  }

  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: 'Bot token yapılandırılmadı.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { type, targetUserId, targetUsername, ruleId, reason, proofUrl } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'Lütfen uyarı verilecek üyeyi seçin.' }, { status: 400 });
    }

    // Yetkilinin unvanını belirle
    let staffTitle = 'Yetkili';
    for (const [rid, title] of Object.entries(STAFF_ROLE_TITLES)) {
      if (session.roles.includes(rid)) {
        staffTitle = title;
        break;
      }
    }

    const uyariId = generateUyariId();
    const now = new Date();
    const expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiryDateStr = expiryDate.toLocaleDateString('tr-TR');

    // ──────────────────────────────────────────────
    // 1. SÖZLÜ UYARI İŞLEMİ (Botun Sözlü Uyarı Formatı)
    // ──────────────────────────────────────────────
    if (type === 'sozlu') {
      const sozluReason = reason || 'Sözlü uyarı kurallarına riayet edilmesi istendi.';

      // Discord #uyarılar kanalına bildirim
      await fetch(`https://discord.com/api/v10/channels/${CHANNELS.UYARILAR}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: `<@${targetUserId}>`,
          embeds: [
            {
              title: '⚠️ Sözlü Uyarı!',
              color: 0xf39c12, // Turuncu
              fields: [
                { name: 'Uyarı Alan', value: `<@${targetUserId}>`, inline: true },
                { name: 'İşlem Yapan', value: `<@${session.id}>`, inline: true },
                { name: 'İhlal / Sebep', value: sozluReason, inline: false },
              ],
              footer: { text: '© 2026 PRP' },
              timestamp: now.toISOString(),
            },
          ],
        }),
      });

      // Discord #sicil-log kanalına bildirim
      await fetch(`https://discord.com/api/v10/channels/${CHANNELS.SICIL_LOG}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [
            {
              title: '📜 Sicil Kaydı — Sözlü Uyarı',
              color: 0xf39c12,
              fields: [
                { name: 'Kişi', value: `<@${targetUserId}>`, inline: true },
                { name: 'Yetkili', value: `<@${session.id}> | ${staffTitle}`, inline: true },
                { name: 'Sebep', value: sozluReason, inline: false },
              ],
              footer: { text: 'Piyade RP Web Paneli • © 2026 PRP' },
              timestamp: now.toISOString(),
            },
          ],
        }),
      });

      return NextResponse.json({
        success: true,
        message: `✅ #${uyariId} Sözlü Uyarı <@${targetUserId}> kişisine verildi ve Discord kanalına iletildi!`,
        uyariId,
      });
    }

    // ──────────────────────────────────────────────
    // 2. KURAL MADDESİ UYARISI (Bot ile Tam Senkron)
    // ──────────────────────────────────────────────
    const allRules = [...RULES, ...YETKILI_MADDELER.map((y) => ({ ...y, points: 0, category: 'yetkili' as const }))];
    const rule = allRules.find((r) => r.id === ruleId);
    if (!rule) {
      return NextResponse.json({ error: 'Geçersiz kural maddesi seçildi.' }, { status: 400 });
    }

    // Hedef kullanıcının mevcut rollerini çek
    const memberRes = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${targetUserId}`, {
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!memberRes.ok) {
      return NextResponse.json({ error: 'Kullanıcı Discord sunucusunda bulunamadı.' }, { status: 404 });
    }

    const memberData = await memberRes.json();
    const existingRoles: string[] = memberData.roles || [];

    // Mevcut ceza puanı ve kademe tespiti
    let oldTier = 0;
    if (existingRoles.includes(PUNISHMENT_ROLES.UYARI_5)) oldTier = 5;
    else if (existingRoles.includes(PUNISHMENT_ROLES.UYARI_4)) oldTier = 4;
    else if (existingRoles.includes(PUNISHMENT_ROLES.UYARI_3)) oldTier = 3;
    else if (existingRoles.includes(PUNISHMENT_ROLES.UYARI_2)) oldTier = 2;
    else if (existingRoles.includes(PUNISHMENT_ROLES.UYARI_1)) oldTier = 1;

    const oldPoints = oldTier * 3;
    const addedPoints = rule.points || 0;
    const newPoints = oldPoints + addedPoints;
    const newTier = calculateTier(newPoints);

    let sonucMetni = '';

    // Roller güncellemesi
    const allWarningRoles = [
      PUNISHMENT_ROLES.UYARI_1,
      PUNISHMENT_ROLES.UYARI_2,
      PUNISHMENT_ROLES.UYARI_3,
      PUNISHMENT_ROLES.UYARI_4,
      PUNISHMENT_ROLES.UYARI_5,
    ];

    // Eski kademe rollerini kaldır
    for (const rId of allWarningRoles) {
      if (existingRoles.includes(rId)) {
        await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${targetUserId}/roles/${rId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bot ${botToken}` },
        });
      }
    }

    // Yeni kademe rolünü ekle
    if (newTier > 0) {
      const tierRoleMap: Record<number, string> = {
        1: PUNISHMENT_ROLES.UYARI_1,
        2: PUNISHMENT_ROLES.UYARI_2,
        3: PUNISHMENT_ROLES.UYARI_3,
        4: PUNISHMENT_ROLES.UYARI_4,
        5: PUNISHMENT_ROLES.UYARI_5,
      };
      await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${targetUserId}/roles/${tierRoleMap[newTier]}`, {
        method: 'PUT',
        headers: { Authorization: `Bot ${botToken}` },
      });
      sonucMetni = `Uyarı ${newTier} rolü verildi.`;
    }

    // Özel durumlar ve ek cezalar (Bot ile birebir)
    if (newTier >= 5) {
      await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${targetUserId}/roles/${PUNISHMENT_ROLES.JAIL}`, {
        method: 'PUT',
        headers: { Authorization: `Bot ${botToken}` },
      });
      sonucMetni += ' + 1 Hafta Jail';
    }

    if (rule.id === 'M2') {
      // Kalıcı Ban
      await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/bans/${targetUserId}`, {
        method: 'PUT',
        headers: { Authorization: `Bot ${botToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: `${rule.id} - ${rule.description}` }),
      });
      sonucMetni = 'Kalıcı Yasak (Permanent Ban)';
    } else if (rule.id === 'M9') {
      // Doğrudan Yasaklı rolü
      await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${targetUserId}/roles/${PUNISHMENT_ROLES.YASAKLI}`, {
        method: 'PUT',
        headers: { Authorization: `Bot ${botToken}` },
      });
      sonucMetni = 'Doğrudan Yasaklı rolü verildi';
    } else if (rule.id === 'M4') {
      // 2 Gün Timeout
      const until = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
      await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${targetUserId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bot ${botToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ communication_disabled_until: until }),
      });
      sonucMetni = '2 Gün Timeout';
    } else if (rule.id === 'RM9') {
      // 4 Gün Timeout
      const until = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString();
      await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${targetUserId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bot ${botToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ communication_disabled_until: until }),
      });
      sonucMetni = '4 Gün Timeout';
    } else if (rule.id === 'M10' || rule.id === 'M11' || rule.id === 'M13') {
      // 1 Gün Timeout
      const until = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString();
      await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${targetUserId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bot ${botToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ communication_disabled_until: until }),
      });
      sonucMetni = '1 Gün Timeout';
    } else if (oldPoints < 10 && newPoints >= 10) {
      // 10 puan barajı: 3 gün timeout
      const until = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${targetUserId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bot ${botToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ communication_disabled_until: until }),
      });
      sonucMetni += ' + 3 Gün Timeout (10 Puan)';
    }

    const rolesMentionStr = existingRoles.length > 0 
      ? existingRoles.slice(0, 10).map((r) => `<@&${r}>`).join(', ') 
      : 'Rol yok';

    const puanMetni = addedPoints > 0
      ? `### 🚨 Verilen Uyarı Puanı:\n**+${addedPoints} Puan (Toplam: ${newPoints})**\n\n`
      : '';

    // Botun oluşturduğu description formatı ile birebir uyumlu metin
    const embedDesc = (
      `## 👤 Taraflar\n` +
      `**Ceza Yiyen Kişi:** <@${targetUserId}>\n` +
      `**Yetkili:** <@${session.id}> | ${staffTitle}\n\n` +
      `***\n\n` +
      `## 📌 Kayıt Özet\n` +
      `**Uyarı ID:** #${uyariId}\n` +
      `**Yetkili:** <@${session.id}> | ${staffTitle}\n` +
      `**Ceza Yiyen Kişi:** <@${targetUserId}>\n` +
      `**Uyarı Bitiş Tarihi:** ${expiryDateStr}\n` +
      `**Toplam Uyarı:** ${newTier > 0 ? newTier : '—'}\n\n` +
      `***\n\n` +
      `${puanMetni}` +
      `### 📝 Uyarı Sebebi:\n` +
      `**${rule.id} — ${rule.description}**\n\n` +
      `***\n\n` +
      `### 🏷️ Rolleri:\n` +
      `**${rolesMentionStr}**\n\n` +
      `***\n\n` +
      `📎 **Kanıt**\n` +
      `Görsel Kanıtı: ${proofUrl ? `[Resim](${proofUrl})` : '*Eklenmedi*'}`
    );

    // Discord #uyarılar kanalına master log mesajı gönder
    await fetch(`https://discord.com/api/v10/channels/${CHANNELS.UYARILAR}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: `<@${targetUserId}>`,
        embeds: [
          {
            title: '⚠️ Uyarı Var!!!',
            color: 0xe74c3c, // Kırmızı
            description: embedDesc,
            fields: [
              { name: '⚡ Uygulanan İşlem', value: `**${sonucMetni || 'Uyarı sicile kaydedildi.'}**`, inline: false },
            ],
            footer: { text: `Uyarı ID: #${uyariId} • © 2026 PRP` },
            timestamp: now.toISOString(),
            image: proofUrl ? { url: proofUrl } : undefined,
          },
        ],
      }),
    });

    // Discord #sicil-log kanalına kayıt gönder
    await fetch(`https://discord.com/api/v10/channels/${CHANNELS.SICIL_LOG}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [
          {
            title: `📜 Sicil Kaydı — #${uyariId}`,
            color: 0xe74c3c,
            fields: [
              { name: 'Ceza Alan Kişi', value: `<@${targetUserId}>`, inline: true },
              { name: 'Yetkili', value: `<@${session.id}> | ${staffTitle}`, inline: true },
              { name: 'Kural İhlali', value: `**${rule.id}** — ${rule.description}`, inline: false },
              { name: 'İşlem', value: `**${sonucMetni || 'Kayıt Yapıldı'}**`, inline: true },
              { name: 'Puan', value: `+${addedPoints} (Toplam: ${newPoints})`, inline: true },
            ],
            footer: { text: `Uyarı ID: #${uyariId} • © 2026 PRP` },
            timestamp: now.toISOString(),
          },
        ],
      }),
    });

    return NextResponse.json({
      success: true,
      message: `✅ <@${targetUserId}> kişisine **${rule.id}** uyarısı başarıyla verildi (+${addedPoints} puan → Toplam: ${newPoints}). ${sonucMetni}`,
      uyariId,
      newPoints,
      newTier,
    });
  } catch (error: any) {
    console.error('Error issuing warning:', error);
    return NextResponse.json({ error: error.message || 'Uyarı verilirken bir hata oluştu.' }, { status: 500 });
  }
}
