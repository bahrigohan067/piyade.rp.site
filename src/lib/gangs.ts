import colorsJson from '@/data/colors.json';
import { CHANNELS, GANG_ROLES, GUILD_ID, VALID_PARSELLER } from './constants';

export interface GangColorItem {
  ID: string;
  Description: string;
  'Hex (Web RGB)': string;
  RGB: string;
}

export interface GangItem {
  id: string;
  name: string;
  colorId: string;
  hexColor?: string;
  boss: string;
  underbosses?: string[];
  members: string[];
  parsel: string;
  warnings: number;
  textChannel?: string;
  voiceChannel?: string;
  roleId?: string;
}

export function getGangColors(): GangColorItem[] {
  return (colorsJson as GangColorItem[]) || [];
}

export async function fetchLiveGangs(): Promise<GangItem[]> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) return [];

  const gangs: GangItem[] = [];

  try {
    // 1. Botun yetkili çete yönetim paneli mesajını oku
    const panelRes = await fetch(`https://discord.com/api/v10/channels/${CHANNELS.ADMIN_GANG_PANEL}/messages?limit=5`, {
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 10 },
    });

    if (panelRes.ok) {
      const messages = await panelRes.json();
      for (const msg of messages) {
        if (!msg.embeds || msg.embeds.length === 0) continue;
        const embed = msg.embeds[0];
        if (!embed.title || !embed.title.includes('Çete Yönetim Paneli')) continue;

        // Field "Aktif Çeteler"
        if (embed.fields) {
          for (const field of embed.fields) {
            if (field.name !== 'Aktif Çeteler' || !field.value) continue;
            // Metin formatı:
            // **Çete Adı**
            // Boss: <@12345> | Parsel: 700 | Üye Sayısı: 4 | Uyarılar: 0/3
            const blocks = field.value.split('\n\n');
            for (const block of blocks) {
              const nameMatch = block.match(/\*\*([^\*]+)\*\*/);
              const bossMatch = block.match(/Boss:\s*<@!?(\d+)>/);
              const parselMatch = block.match(/Parsel:\s*([^\s\|]+)/);
              const membersMatch = block.match(/Üye Sayısı:\s*(\d+)/);
              const warnMatch = block.match(/Uyarılar:\s*(\d+)\/3/);

              if (nameMatch && bossMatch) {
                gangs.push({
                  id: bossMatch[1],
                  name: nameMatch[1].trim(),
                  colorId: '0',
                  boss: bossMatch[1],
                  members: [],
                  parsel: parselMatch ? parselMatch[1] : '700',
                  warnings: warnMatch ? parseInt(warnMatch[1], 10) : 0,
                });
              }
            }
          }
        }
      }
    }

    // 2. Eğer panelde bulunamadıysa çete log kanalından son onaylanan çeteleri oku
    if (gangs.length === 0) {
      const logRes = await fetch(`https://discord.com/api/v10/channels/${CHANNELS.GANG_LOG}/messages?limit=25`, {
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 15 },
      });

      if (logRes.ok) {
        const logMsgs = await logRes.json();
        for (const m of logMsgs) {
          if (!m.embeds || m.embeds.length === 0) continue;
          const embed = m.embeds[0];
          const title = embed.title || '';
          if (!title.includes('ONAYLANDI') && !title.includes('Çete Başvurusu')) continue;

          let name = title.replace('✅ ONAYLANDI:', '').replace('Çete Başvurusu:', '').trim();
          let boss = '';
          let parsel = '700';
          let colorId = '0';

          if (embed.fields) {
            for (const f of embed.fields) {
              const fn = f.name.toLowerCase();
              if (fn.includes('boss')) {
                const bm = f.value.match(/\d{15,22}/);
                if (bm) boss = bm[0];
              } else if (fn.includes('parsel')) {
                parsel = f.value.trim();
              } else if (fn.includes('renk')) {
                colorId = f.value.trim();
              }
            }
          }

          if (name && boss && !gangs.some((g) => g.name.toLowerCase() === name.toLowerCase())) {
            gangs.push({
              id: boss,
              name,
              colorId,
              boss,
              members: [],
              parsel,
              warnings: 0,
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching live gangs from Discord:', error);
  }

  return gangs;
}

export async function submitGangApplication(params: {
  bossId: string;
  bossUsername: string;
  gangName: string;
  colorId: string;
  parsel: string;
  story: string;
  invitedMemberIds: string[];
}): Promise<{ success: boolean; message: string }> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) {
    return { success: false, message: 'Bot token yapılandırılmadı.' };
  }

  const { bossId, bossUsername, gangName, colorId, parsel, story, invitedMemberIds } = params;

  if (!VALID_PARSELLER.includes(parsel)) {
    return { success: false, message: `Geçersiz parsel kodu. Geçerli kodlar: ${VALID_PARSELLER.join(', ')}` };
  }

  if (invitedMemberIds.length < 3) {
    return { success: false, message: 'En az 3 başlangıç üyesi seçilmelidir.' };
  }

  try {
    // 1. Log kanalına başvuru mesajı gönder
    const logRes = await fetch(`https://discord.com/api/v10/channels/${CHANNELS.GANG_LOG}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [
          {
            title: `Çete Başvurusu: ${gangName}`,
            description: '⏳ Web panelinden başvuru iletildi, üyelerin onayı ve yetkili denetimi bekleniyor...',
            color: 0xf1c40f, // Sarı
            fields: [
              { name: 'Boss', value: `<@${bossId}> (${bossUsername})`, inline: false },
              { name: 'Çete Rengi (ID)', value: colorId, inline: true },
              { name: 'Parsel', value: parsel, inline: true },
              { name: 'Davet Edilen Üyeler', value: invitedMemberIds.map((id) => `<@${id}>`).join(' '), inline: false },
              { name: 'Hikaye', value: story.slice(0, 1020), inline: false },
            ],
            footer: { text: 'Piyade RP Web Paneli • Çete Başvuru Sistemi' },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });

    if (!logRes.ok) {
      const errText = await logRes.text();
      return { success: false, message: `Discord kanalına başvuru gönderilemedi: ${errText}` };
    }

    // 2. Çete bildirim kanalına davet bildirimleri ilet
    for (const uid of invitedMemberIds) {
      await fetch(`https://discord.com/api/v10/channels/${CHANNELS.GANG_BILDIRIM}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: `🔔 Merhaba <@${uid}>! **${gangName}** çetesi lideri <@${bossId}> sizi çetesine başlangıç üyesi olarak davet etti. (Discord üzerinden onaylayabilirsiniz)`,
        }),
      });
    }

    return { success: true, message: '✅ Çete başvurunuz başarıyla Discord yetkili ve log kanallarına iletildi!' };
  } catch (e: any) {
    return { success: false, message: `Hata oluştu: ${e.message}` };
  }
}
