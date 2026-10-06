import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { REGISTRATION } from '@/lib/constants';
import { findRobloxUser } from '@/lib/roblox';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Başvuru yapabilmek için Discord ile giriş yapmalısınız.' }, { status: 401 });
  }

  // Rate Limiting: Max 5 submissions per 5 minutes per user
  const rl = checkRateLimit(`kayit_${session.id}`, { limit: 5, windowMs: 5 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Çok fazla kayıt denemesi yaptınız. Lütfen 5 dakika sonra tekrar deneyiniz.' },
      { status: 429 }
    );
  }

  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: 'Discord bot tokeni yapılandırılmadı.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    let { gercekAd, robloxLink, cinsiyet } = body;

    gercekAd = typeof gercekAd === 'string' ? gercekAd.trim().slice(0, 50) : '';
    robloxLink = typeof robloxLink === 'string' ? robloxLink.trim().slice(0, 200) : '';
    cinsiyet = typeof cinsiyet === 'string' ? cinsiyet.trim().toLowerCase() : '';

    if (!gercekAd) {
      return NextResponse.json({ error: 'Lütfen gerçek adınızı giriniz (en fazla 50 karakter).' }, { status: 400 });
    }

    if (!robloxLink) {
      return NextResponse.json({ error: 'Lütfen Roblox hesap adınızı, ID numaranızı veya profil linkinizi giriniz.' }, { status: 400 });
    }

    if (!['erkek', 'kız', 'kiz'].includes(cinsiyet)) {
      return NextResponse.json({ error: 'Lütfen cinsiyetinizi Erkek veya Kız olarak seçiniz.' }, { status: 400 });
    }

    // 1. Roblox API Doğrulaması (cogs/registration.py ile birebir)
    const roblox = await findRobloxUser(robloxLink);

    if (!roblox) {
      return NextResponse.json(
        {
          error:
            `❌ Girdiğiniz "${robloxLink}" bilgisi Roblox sistemlerinde bulunamadı.\n\n` +
            `• Görünen adınızı (Display Name) değil, asıl kullanıcı adınızı yazınız.\n` +
            `• Ya da doğrudan profil linkinizi kopyalayınız (Örn: https://www.roblox.com/users/12345/profile).`,
        },
        { status: 400 }
      );
    }

    const formattedCinsiyet = cinsiyet.toLowerCase().includes('k') ? 'Kız' : 'Erkek';

    // 2. Discord ONAY_KANAL_ID kanalına başvuruyu ilet
    const discordRes = await fetch(`https://discord.com/api/v10/channels/${REGISTRATION.ONAY_KANAL}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: `<@&${REGISTRATION.WHITELIST_YETKILISI_ROL}>`,
        embeds: [
          {
            title: '🆕 Yeni Kayıt Başvurusu',
            color: 0x5865f2, // Blurple
            fields: [
              { name: 'Discord Kullanıcı', value: `<@${session.id}> (\`${session.id}\`)`, inline: false },
              { name: 'Gerçek Adı', value: gercekAd.trim(), inline: true },
              { name: 'Cinsiyet', value: formattedCinsiyet, inline: true },
              { name: 'Roblox Adı (Doğrulandı ✅)', value: `**${roblox.username}**`, inline: false },
              {
                name: 'Roblox Profil Linki',
                value: `[${roblox.username} Profili](${roblox.profileUrl}) (ID: \`${roblox.userId}\`)`,
                inline: false,
              },
            ],
            thumbnail: roblox.avatarUrl ? { url: roblox.avatarUrl } : undefined,
            footer: { text: `Başvuran ID: ${session.id}` },
            timestamp: new Date().toISOString(),
          },
        ],
        components: [
          {
            type: 1, // ActionRow
            components: [
              {
                type: 2, // Button
                style: 3, // Success / Green
                label: 'ONAYLA',
                custom_id: `kayit_onayla_${session.id}`,
              },
              {
                type: 2, // Button
                style: 4, // Danger / Red
                label: 'REDDET',
                custom_id: `kayit_reddet_${session.id}`,
              },
            ],
          },
        ],
      }),
    });

    if (!discordRes.ok) {
      const errText = await discordRes.text();
      console.error('Discord registration message error:', errText);
      return NextResponse.json({ error: 'Discord onay kanalına mesaj gönderilemedi.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `✅ Roblox hesabınız başarıyla doğrulandı (**${roblox.username}**)! Kayıt başvurunuz yetkililere iletildi. Yetkili onayından sonra sunucu içi isminiz "${gercekAd.trim()} | ${roblox.username}" olarak güncellenecek ve Whitelist rolünüz verilecektir.`,
      roblox,
    });
  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json({ error: error.message || 'Kayıt sırasında bir hata oluştu.' }, { status: 500 });
  }
}
