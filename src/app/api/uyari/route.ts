import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { CHANNELS, GUILD_ID, PUNISHMENT_ROLES, RULES, STAFF_ROLE_TITLES, YETKILI_MADDELER } from '@/lib/constants';
import { getBaseUrl, getSession, getUserRoleLevel } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { getUserUyariData, addWarning, addSicilRecord, hesaplaKademe } from '@/lib/uyariStore';

function generateUyariId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 4; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Sends Discord embed with uyari_logo.png thumbnail (matches Discord bot _uyari_log_gonder 1:1)
 */
async function sendDiscordEmbedWithLogo(
  channelId: string,
  botToken: string,
  content: string | undefined,
  embed: any,
  baseUrl: string
): Promise<{ ok: boolean; messageId?: string }> {
  const logoPath = path.join(process.cwd(), 'public', 'uyari_logo.png');
  let logoBuffer: Buffer | null = null;
  try {
    if (fs.existsSync(logoPath)) {
      logoBuffer = fs.readFileSync(logoPath);
    }
  } catch (e) {
    console.error('Error reading uyari_logo.png:', e);
  }

  // 1. Primary: Attach uyari_logo.png via multipart/form-data with attachment://uyari_logo.png thumbnail
  if (logoBuffer) {
    try {
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(logoBuffer)], { type: 'image/png' });
      formData.append('files[0]', blob, 'uyari_logo.png');

      const payload = {
        content: content || '',
        embeds: [
          {
            ...embed,
            thumbnail: { url: 'attachment://uyari_logo.png' },
          },
        ],
        attachments: [
          {
            id: 0,
            filename: 'uyari_logo.png',
          },
        ],
      };

      formData.append('payload_json', JSON.stringify(payload));

      const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${botToken}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        return { ok: true, messageId: data?.id };
      }
      console.warn('Multipart Discord upload failed, attempting fallback JSON:', await res.text());
    } catch (err) {
      console.error('Error sending multipart message to Discord:', err);
    }
  }

  // 2. Fallback: JSON with public URL thumbnail
  const fallbackPayload = {
    content: content || '',
    embeds: [
      {
        ...embed,
        thumbnail: { url: `${baseUrl}/uyari_logo.png` },
      },
    ],
  };

  try {
    const fallbackRes = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fallbackPayload),
    });

    if (fallbackRes.ok) {
      const data = await fallbackRes.json().catch(() => null);
      return { ok: true, messageId: data?.id };
    }
  } catch (err) {
    console.error('Error sending fallback message to Discord:', err);
  }

  return { ok: false };
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
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

    const baseUrl = getBaseUrl(request);

    // ──────────────────────────────────────────────
    // 1. SÖZLÜ UYARI İŞLEMİ (Botun Sözlü Uyarı Formatı)
    // ──────────────────────────────────────────────
    if (type === 'sozlu') {
      const sozluReason = reason || 'Sözlü uyarı kurallarına riayet edilmesi istendi.';

      // Discord #uyarılar kanalına bildirim (uyari_logo.png ile)
      const sozluEmbed = {
        title: '⚠️ Sözlü Uyarı!',
        color: 0xf39c12, // Turuncu
        fields: [
          { name: 'Uyarı Alan', value: `<@${targetUserId}>`, inline: true },
          { name: 'İşlem Yapan', value: `<@${session.id}>`, inline: true },
          { name: 'İhlal / Sebep', value: sozluReason, inline: false },
        ],
        footer: { text: '© 2026 PRP' },
        timestamp: now.toISOString(),
      };
      await sendDiscordEmbedWithLogo(CHANNELS.UYARILAR, botToken, `<@${targetUserId}>`, sozluEmbed, baseUrl);

      // Discord #sicil-log kanalına bildirim
      const sicilEmbed = {
        title: '📜 Sicil Kaydı — Sözlü Uyarı',
        color: 0xf39c12,
        fields: [
          { name: 'Kişi', value: `<@${targetUserId}>`, inline: true },
          { name: 'Yetkili', value: `<@${session.id}> | ${staffTitle}`, inline: true },
          { name: 'Sebep', value: sozluReason, inline: false },
        ],
        footer: { text: 'Piyade RP Web Paneli • © 2026 PRP' },
        timestamp: now.toISOString(),
      };
      await sendDiscordEmbedWithLogo(CHANNELS.SICIL_LOG, botToken, undefined, sicilEmbed, baseUrl);

      // Sicile sözlü uyarıyı kaydet
      const pad = (n: number) => String(n).padStart(2, '0');
      const sqlTarih = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      addSicilRecord(targetUserId, {
        tarih: sqlTarih,
        madde: 'SÖZLÜ',
        aciklama: sozluReason,
        yetkili_id: session.id,
        sonuc: 'Sözlü Uyarı Verildi',
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

    // Mevcut ceza puanı ve kademe tespiti (uyariStore + rol senkronizasyonu)
    const userUyariData = getUserUyariData(targetUserId);
    const dbPoints = userUyariData.toplam_puan || 0;

    let roleTier = 0;
    if (existingRoles.includes(PUNISHMENT_ROLES.UYARI_5)) roleTier = 5;
    else if (existingRoles.includes(PUNISHMENT_ROLES.UYARI_4)) roleTier = 4;
    else if (existingRoles.includes(PUNISHMENT_ROLES.UYARI_3)) roleTier = 3;
    else if (existingRoles.includes(PUNISHMENT_ROLES.UYARI_2)) roleTier = 2;
    else if (existingRoles.includes(PUNISHMENT_ROLES.UYARI_1)) roleTier = 1;

    const oldPoints = Math.max(dbPoints, roleTier * 3);
    const addedPoints = rule.points || 0;
    const newPoints = oldPoints + addedPoints;
    const newTier = hesaplaKademe(newPoints);

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

    // Discord #uyarılar kanalına master log mesajı gönder (uyari_logo.png thumbnail ile)
    const masterEmbed = {
      title: '⚠️ Uyarı Var!!!',
      color: 0xe74c3c, // Kırmızı
      description: embedDesc,
      fields: [
        { name: '⚡ Uygulanan İşlem', value: `**${sonucMetni || 'Uyarı sicile kaydedildi.'}**`, inline: false },
      ],
      footer: { text: `Uyarı ID: #${uyariId} • © 2026 PRP` },
      timestamp: now.toISOString(),
      image: proofUrl ? { url: proofUrl } : undefined,
    };

    const logRes = await sendDiscordEmbedWithLogo(CHANNELS.UYARILAR, botToken, `<@${targetUserId}>`, masterEmbed, baseUrl);

    // Discord #sicil-log kanalına kayıt gönder (uyari_logo.png thumbnail ile)
    const sicilEmbed = {
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
    };

    await sendDiscordEmbedWithLogo(CHANNELS.SICIL_LOG, botToken, undefined, sicilEmbed, baseUrl);

    // Bot ile tam senkron uyari_data.json ve sicil_data.json kayıtlarını yaz
    const pad = (n: number) => String(n).padStart(2, '0');
    const tarihStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const bitisStr = `${pad(expiryDate.getDate())}/${pad(expiryDate.getMonth() + 1)}/${expiryDate.getFullYear()}`;
    const sqlTarihStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    addWarning(
      targetUserId,
      {
        id: uyariId,
        madde: rule.id,
        puan: addedPoints,
        aciklama: rule.description,
        yetkili_id: session.id,
        tarih: tarihStr,
        bitis_tarihi: bitisStr,
        kanit_url: proofUrl || null,
        aktif: true,
        log_msg_id: logRes.messageId || null,
      },
      newPoints,
      newTier,
      newTier >= 5 ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() : null
    );

    addSicilRecord(targetUserId, {
      tarih: sqlTarihStr,
      madde: rule.id,
      aciklama: rule.description,
      yetkili_id: session.id,
      sonuc: sonucMetni || `Uyarı ${newTier} rolü verildi.`,
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
