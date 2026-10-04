import { CHANNELS, GUILD_ID, PUNISHMENT_ROLES, ROLES, RULES, STAFF_ROLE_TITLES } from './constants';

export interface DiscordMemberInfo {
  id: string;
  username: string;
  discriminator: string;
  globalName: string | null;
  avatarUrl: string;
  nickname: string;
  name: string;
  robloxName: string;
  roles: string[];
  staffTitle: string | null;
  warningCount: number;
  totalPoints: number;
  warningTier: number;
  hasJail: boolean;
  hasYasakli: boolean;
  timeoutRemaining: string | null;
  timeoutUntil: string | null;
  isBanned: boolean;
}

export interface DiscordWarningRecord {
  id: string;
  targetId: string;
  targetName: string;
  staffId: string;
  staffName: string;
  ruleId: string;
  ruleTitle: string;
  points: number;
  totalPoints?: number;
  special: string | null;
  reason: string;
  action?: string | null;
  expiryDate?: string | null;
  proofUrl: string | null;
  timestamp: string;
  isVerbal: boolean;
}

const DISCORD_API_BASE = 'https://discord.com/api/v10';

function getBotHeaders() {
  const token = process.env.DISCORD_BOT_TOKEN;
  return {
    Authorization: `Bot ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchWarningHistory(): Promise<DiscordWarningRecord[]> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return [];

  try {
    const res = await fetch(`${DISCORD_API_BASE}/channels/${CHANNELS.UYARILAR}/messages?limit=100`, {
      headers: getBotHeaders(),
      next: { revalidate: 5 },
    });

    if (!res.ok) return [];
    const messages = await res.json();
    const records: DiscordWarningRecord[] = [];

    for (const msg of messages) {
      if (!msg.embeds || msg.embeds.length === 0) continue;
      const embed = msg.embeds[0];
      const title = embed.title || '';
      const desc = embed.description || '';
      const content = msg.content || '';

      const isVerbal = title.includes('Sözlü') || title.includes('Sozlu') || title.includes('SÖZLÜ');

      let targetId = '';
      let targetName = 'Kullanıcı';
      let staffId = '';
      let staffName = 'Yetkili';
      let ruleId = isVerbal ? 'SÖZLÜ' : 'KURAL';
      let ruleTitle = isVerbal ? 'Sözlü Uyarı' : '';
      let points = 0;
      let totalPoints = 0;
      let special: string | null = null;
      let reason = '';
      let action: string | null = null;
      let expiryDate: string | null = null;
      let proofUrl: string | null = embed.image?.url || null;

      // 1. Hedef ID Tespiti (content, desc veya fields)
      const contentMatch = content.match(/<@!?(\d{15,22})>/);
      if (contentMatch) targetId = contentMatch[1];

      if (!targetId) {
        const descTargetMatch = desc.match(/Ceza Yiyen Kişi:\*\*\s*<@!?(\d{15,22})>/);
        if (descTargetMatch) targetId = descTargetMatch[1];
      }

      // 2. Yetkili Tespiti
      const descStaffMatch = desc.match(/Yetkili:\*\*\s*<@!?(\d{15,22})>(?:\s*\|\s*([^\n\*]+))?/);
      if (descStaffMatch) {
        staffId = descStaffMatch[1];
        if (descStaffMatch[2]) staffName = descStaffMatch[2].trim();
      }

      // 3. Uyarı ID
      let recordId = msg.id.slice(-4).toUpperCase();
      const idMatch = desc.match(/Uyarı ID:\*\*\s*#?([A-Z0-9]{4})/i) || embed.footer?.text?.match(/Uyarı ID:\s*#?([A-Z0-9]{4})/i);
      if (idMatch) recordId = idMatch[1];

      // 4. Bitiş Tarihi
      const expMatch = desc.match(/Uyarı Bitiş Tarihi:\*\*\s*([^\n\*]+)/);
      if (expMatch) expiryDate = expMatch[1].trim();

      // 5. Puan
      const pointMatch = desc.match(/\+(\d+)\s*Puan/i);
      if (pointMatch) points = parseInt(pointMatch[1], 10);

      const totMatch = desc.match(/Toplam:\s*(\d+)/i);
      if (totMatch) totalPoints = parseInt(totMatch[1], 10);

      // 6. Kural ve Sebep
      const ruleMatch = desc.match(/### 📝 Uyarı Sebebi:\s*\n\*\*([A-Z0-9]+)\s*—\s*([^\*]+)\*\*/i);
      if (ruleMatch) {
        ruleId = ruleMatch[1].toUpperCase();
        ruleTitle = ruleMatch[2].trim();
        reason = ruleTitle;
      }

      // 7. Kanıt
      if (!proofUrl) {
        const proofMatch = desc.match(/Görsel Kanıtı:\s*\[Resim\]\((https?:\/\/[^\)]+)\)/);
        if (proofMatch) proofUrl = proofMatch[1];
      }

      // 8. Embed Fields Kontrolü (Sözlü veya Web Formats)
      if (embed.fields) {
        for (const f of embed.fields) {
          const fname = f.name?.toLowerCase() || '';
          const fval = f.value || '';

          if (fname.includes('uyarı alan') || fname.includes('ceza alan') || fname.includes('üye')) {
            const m = fval.match(/\d{15,22}/);
            if (m && !targetId) targetId = m[0];
            targetName = fval.replace(/<@!?\d+>/g, '').replace(/[()]/g, '').trim() || targetName;
          } else if (fname.includes('işlem yapan') || fname.includes('yetkili')) {
            const m = fval.match(/\d{15,22}/);
            if (m && !staffId) staffId = m[0];
            staffName = fval.replace(/<@!?\d+>/g, '').replace(/[()]/g, '').trim() || staffName;
          } else if (fname.includes('ihlal') || fname.includes('sebep')) {
            reason = fval;
            if (isVerbal) ruleTitle = fval;
          } else if (fname.includes('işlem') || fname.includes('sonuç') || fname.includes('yaptırım')) {
            action = fval.replace(/\*\*/g, '').trim();
          } else if (fname.includes('kanıt') || fname.includes('link')) {
            const urlM = fval.match(/https?:\/\/[^\s\)]+/);
            if (urlM && !proofUrl) proofUrl = urlM[0];
          }
        }
      }

      records.push({
        id: recordId,
        targetId: targetId || msg.id,
        targetName,
        staffId,
        staffName,
        ruleId,
        ruleTitle: ruleTitle || ruleId,
        points,
        totalPoints,
        special,
        reason: reason || 'Belirtilmedi',
        action,
        expiryDate,
        proofUrl,
        timestamp: msg.timestamp || new Date().toISOString(),
        isVerbal,
      });
    }

    return records;
  } catch (error) {
    console.error('Error fetching warning channel messages from Discord:', error);
    return [];
  }
}

export async function fetchGuildMembers(): Promise<DiscordMemberInfo[]> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return [];

  try {
    const [membersRes, bansRes, warnings] = await Promise.all([
      fetch(`${DISCORD_API_BASE}/guilds/${GUILD_ID}/members?limit=1000`, {
        headers: getBotHeaders(),
        next: { revalidate: 10 },
      }),
      fetch(`${DISCORD_API_BASE}/guilds/${GUILD_ID}/bans?limit=1000`, {
        headers: getBotHeaders(),
        next: { revalidate: 30 },
      }),
      fetchWarningHistory(),
    ]);

    const rawMembers = membersRes.ok ? await membersRes.json() : [];
    const rawBans = bansRes.ok ? await bansRes.json() : [];
    const bannedIds = new Set(rawBans.map((b: any) => b.user?.id));

    // Üye başına uyarı geçmişi haritası
    const warningMap: Record<string, { count: number; points: number }> = {};
    for (const w of warnings) {
      if (!w.targetId) continue;
      if (!warningMap[w.targetId]) {
        warningMap[w.targetId] = { count: 0, points: 0 };
      }
      warningMap[w.targetId].count += 1;
      warningMap[w.targetId].points += w.points || 0;
    }

    return rawMembers.map((m: any) => {
      const user = m.user || {};
      const nick = m.nick || user.global_name || user.username || 'Kullanıcı';
      let name = nick;
      let robloxName = nick;

      if (nick.includes('|')) {
        const parts = nick.split('|');
        name = parts[0].trim();
        robloxName = parts[1].trim();
      }

      const roles: string[] = m.roles || [];
      const hasU1 = roles.includes(PUNISHMENT_ROLES.UYARI_1);
      const hasU2 = roles.includes(PUNISHMENT_ROLES.UYARI_2);
      const hasU3 = roles.includes(PUNISHMENT_ROLES.UYARI_3);
      const hasU4 = roles.includes(PUNISHMENT_ROLES.UYARI_4);
      const hasU5 = roles.includes(PUNISHMENT_ROLES.UYARI_5);
      const hasJail = roles.includes(PUNISHMENT_ROLES.JAIL);
      const hasYasakli = roles.includes(PUNISHMENT_ROLES.YASAKLI);

      let roleWarningTier = 0;
      let rolePoints = 0;

      if (hasU5) {
        roleWarningTier = 5;
        rolePoints = 15;
      } else if (hasU4) {
        roleWarningTier = 4;
        rolePoints = 12;
      } else if (hasU3) {
        roleWarningTier = 3;
        rolePoints = 9;
      } else if (hasU2) {
        roleWarningTier = 2;
        rolePoints = 6;
      } else if (hasU1) {
        roleWarningTier = 1;
        rolePoints = 3;
      }

      const memberWarnings = warningMap[user.id] || { count: 0, points: 0 };
      const finalPoints = Math.max(rolePoints, memberWarnings.points);
      const warningCount = Math.max(roleWarningTier, memberWarnings.count);
      
      let warningTier = roleWarningTier;
      if (warningTier === 0) {
        if (finalPoints >= 15) warningTier = 5;
        else if (finalPoints >= 12) warningTier = 4;
        else if (finalPoints >= 9) warningTier = 3;
        else if (finalPoints >= 6) warningTier = 2;
        else if (finalPoints >= 3) warningTier = 1;
      }

      // En yüksek yetkili rütbesini bul
      let staffTitle: string | null = null;
      for (const [rid, title] of Object.entries(STAFF_ROLE_TITLES)) {
        if (roles.includes(rid)) {
          staffTitle = title;
          break;
        }
      }

      // Timeout (communication_disabled_until) hesaplama
      let timeoutRemaining: string | null = null;
      if (m.communication_disabled_until) {
        const untilMs = new Date(m.communication_disabled_until).getTime();
        const diffMs = untilMs - Date.now();
        if (diffMs > 0) {
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          if (hours >= 24) {
            const days = Math.floor(hours / 24);
            const remHours = hours % 24;
            timeoutRemaining = `${days} Gün ${remHours} Saat`;
          } else if (hours > 0) {
            timeoutRemaining = `${hours} Saat ${mins} Dk`;
          } else {
            timeoutRemaining = `${mins} Dakika`;
          }
        }
      }

      const avatarUrl = user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';

      return {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        globalName: user.global_name,
        avatarUrl,
        nickname: nick,
        name,
        robloxName,
        roles,
        staffTitle,
        warningCount,
        totalPoints: finalPoints,
        warningTier,
        hasJail,
        hasYasakli,
        timeoutRemaining,
        timeoutUntil: m.communication_disabled_until,
        isBanned: bannedIds.has(user.id),
      };
    });
  } catch (error) {
    console.error('Error fetching guild members from Discord:', error);
    return [];
  }
}

export async function fetchLiveRpStatus(): Promise<{ active: boolean; notice: string }> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return { active: false, notice: 'Bot token yapılandırılmadı' };

  try {
    // Hem duyuru kanalını hem oylama panel kanalını tara
    const [duyuruRes, panelRes] = await Promise.all([
      fetch(`${DISCORD_API_BASE}/channels/${CHANNELS.DUYURU}/messages?limit=5`, {
        headers: getBotHeaders(),
        next: { revalidate: 5 },
      }),
      fetch(`${DISCORD_API_BASE}/channels/${CHANNELS.PANEL}/messages?limit=5`, {
        headers: getBotHeaders(),
        next: { revalidate: 5 },
      }),
    ]);

    const duyuruMessages = duyuruRes.ok ? await duyuruRes.json() : [];
    const panelMessages = panelRes.ok ? await panelRes.json() : [];
    const allMessages = [...duyuruMessages, ...panelMessages];

    for (const msg of allMessages) {
      const embeds = msg.embeds || [];
      for (const embed of embeds) {
        const title = embed.title || '';
        const desc = embed.description || '';

        // 1. Rol Başladı Tespiti (Botun kesin başlıkları)
        if (title.includes('ROL RESMEN BAŞLADI') || title.includes('ROL RESMEN BAŞLAMIŞTIR')) {
          return {
            active: true,
            notice: '🚨 DİKKAT: ROL RESMEN BAŞLADI! (Aktif Roleplay Açık)',
          };
        }

        // 2. Gece Dinlenme Modu Tespiti
        if (title.includes('ŞEHİR DİNLENME MODUNDA')) {
          return {
            active: false,
            notice: 'Los Angeles sokakları dinlenme modunda (01:00 - 12:00)',
          };
        }

        // 3. Oylama Modu Tespiti
        if (title.includes('GÜNLÜK ROL OYLAMASI')) {
          return {
            active: false,
            notice: 'Günlük rol oylaması devam ediyor (Yeterli oy bekleniyor)',
          };
        }
      }

      const content = msg.content || '';
      if (content.includes('ROL RESMEN BAŞLADI') || content.includes('RP Başlamıştır')) {
        return {
          active: true,
          notice: '🚨 DİKKAT: ROL RESMEN BAŞLADI! (Aktif Roleplay Açık)',
        };
      }
    }

    return {
      active: false,
      notice: 'Şu anda oylama veya bekleme aşamasında.',
    };
  } catch {
    return {
      active: false,
      notice: 'Sunucu durumu kontrol ediliyor...',
    };
  }
}
