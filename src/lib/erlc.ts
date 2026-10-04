import { CHANNELS } from './constants';

export interface ErlcPlayerLocation {
  name: string;
  id: string;
  x: number | string;
  y: number | string;
  z: number | string;
  postal: string;
  street: string;
  building: string;
  safezone: string | null;
  locationText?: string;
}

export interface ErlcKillLog {
  id: string;
  killer: string;
  victim: string;
  weapon: string;
  safezoneViolation: boolean;
  safezoneName?: string | null;
  timestamp: number;
}

// Botun data/bolgeler.json ile birebir 4 Köşe Poligon Koordinatları
const TANIMLI_BOLGELER = {
  gun_shop: {
    name: "Gunshop Etkileşimli Bölge (Safezone)",
    postal_codes: ["227"],
    points: [
      { x: 1095.33, z: 3411.18 },
      { x: 1118.24, z: 3408.05 },
      { x: 1129.06, z: 3388.36 },
      { x: 1110.77, z: 3395.14 },
    ],
  },
  police_department: {
    name: "Polis Departmanı (Safezone)",
    postal_codes: ["310", "316", "317"],
    points: [
      { x: 2946.46, z: 3474.49 },
      { x: 2945.49, z: 3559.07 },
      { x: 2809.82, z: 3562.42 },
      { x: 2811.28, z: 3473.87 },
    ],
  },
  fire_department: {
    name: "Fire Departman (Safezone)",
    postal_codes: ["228", "229"],
    points: [
      { x: 1358.66, z: 3370.96 },
      { x: 1284.1, z: 3306.45 },
      { x: 1207.34, z: 3440.44 },
      { x: 1317.57, z: 3459.93 },
    ],
  },
  city_spawn: {
    name: "City Spawn (Safezone)",
    postal_codes: ["210", "211"],
    points: [
      { x: 1465.45, z: 3935.5 },
      { x: 1616.43, z: 3933.91 },
      { x: 1615.94, z: 3845.71 },
      { x: 1464.1, z: 3843.23 },
    ],
  },
};

export function pointInPolygon(x: number, z: number, polygon: { x: number; z: number }[]): boolean {
  if (!polygon || polygon.length < 3) return false;
  let inside = false;
  const n = polygon.length;
  let p1 = polygon[0];

  for (let i = 0; i <= n; i++) {
    const p2 = polygon[i % n];
    if (Math.min(p1.z, p2.z) < z && z <= Math.max(p1.z, p2.z)) {
      if (x <= Math.max(p1.x, p2.x)) {
        if (p1.z !== p2.z) {
          const xinters = ((z - p1.z) * (p2.x - p1.x)) / (p2.z - p1.z) + p1.x;
          if (p1.x === p2.x || x <= xinters) {
            inside = !inside;
          }
        }
      }
    }
    p1 = p2;
  }
  return inside;
}

export function checkSafezone(x: any, z: any): string | null {
  const numX = typeof x === 'number' ? x : parseFloat(x);
  const numZ = typeof z === 'number' ? z : parseFloat(z);
  if (isNaN(numX) || isNaN(numZ)) return null;

  for (const [, zone] of Object.entries(TANIMLI_BOLGELER)) {
    if (pointInPolygon(numX, numZ, zone.points)) {
      return zone.name;
    }
  }
  return null;
}

// Botun Discord #canlı-radar kanalından son veriyi okuma fonksiyonu
async function fetchDiscordRadarBackup() {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) return null;

  try {
    const res = await fetch(`https://discord.com/api/v10/channels/${CHANNELS.RADAR}/messages?limit=3`, {
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 10 },
    });

    if (!res.ok) return null;
    const messages = await res.json();
    for (const msg of messages) {
      if (!msg.embeds || msg.embeds.length === 0) continue;
      const embed = msg.embeds[0];
      if (!embed.title || !embed.title.includes('CANLI OYUNCU RADARI')) continue;

      const desc = embed.description || '';
      let currentPlayers = 0;
      let maxPlayers = 32;

      const playerMatch = desc.match(/Çevrimiçi Oyuncular:\*\*\s*`(\d+)`\s*\/\s*`(\d+)`/);
      if (playerMatch) {
        currentPlayers = parseInt(playerMatch[1], 10);
        maxPlayers = parseInt(playerMatch[2], 10);
      }

      const players: ErlcPlayerLocation[] = [];
      if (embed.fields) {
        for (const field of embed.fields) {
          if (!field.value) continue;
          const lines = field.value.split('\n\n');
          for (const block of lines) {
            const nameMatch = block.match(/🟢\s*\*\*([^\*]+)\*\*\s*(?:\[Posta:\s*`([^`]+)`\])?/);
            const coordMatch = block.match(/X:\s*([0-9\.\-]+)\s*\|\s*Z:\s*([0-9\.\-]+)/);
            if (nameMatch) {
              const name = nameMatch[1].trim();
              const postal = nameMatch[2] || '-';
              const x = coordMatch ? parseFloat(coordMatch[1]) : 0;
              const z = coordMatch ? parseFloat(coordMatch[2]) : 0;
              const safezone = checkSafezone(x, z);
              
              let locationText = `Posta: ${postal}`;
              if (safezone) {
                locationText = `🛡️ ${safezone}`;
              } else if (block.includes('🛣️')) {
                const streetMatch = block.match(/🛣️\s*([^\n]+)/);
                if (streetMatch) locationText = `🛣️ ${streetMatch[1].trim()}`;
              }

              players.push({
                name,
                id: '0',
                x,
                y: 0,
                z,
                postal,
                street: '-',
                building: '-',
                safezone,
                locationText,
              });
            }
          }
        }
      }

      return {
        connected: true,
        players,
        killLogs: [],
        currentPlayers: players.length || currentPlayers,
        maxPlayers,
        queue: 0,
      };
    }
  } catch (err) {
    console.error('Error fetching Discord radar backup:', err);
  }
  return null;
}

export async function fetchLiveRadarData() {
  const apiKey = process.env.ERLC_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch('https://api.erlc.gg/v2/server?Players=true&KillLogs=true', {
        headers: { 'Server-Key': apiKey },
        next: { revalidate: 10 },
      });

      if (res.ok) {
        const data = await res.json();
        const rawPlayers = data.Players || [];
        const rawKillLogs = data.KillLogs || [];

        const players: ErlcPlayerLocation[] = rawPlayers.map((p: any) => {
          const pStr = p.Player || '';
          const name = pStr.split(':')[0] || 'Oyuncu';
          const id = pStr.split(':')[1] || '0';
          const loc = p.Location || {};
          const x = loc.LocationX ?? loc.X ?? 0;
          const y = loc.LocationY ?? loc.Y ?? 0;
          const z = loc.LocationZ ?? loc.Z ?? 0;
          const postal = loc.PostalCode || '-';
          const street = loc.StreetName || '-';
          const building = loc.BuildingNumber || '-';
          const safezone = checkSafezone(x, z);

          const locationText = safezone
            ? `🛡️ ${safezone}`
            : (street !== '-' ? `🛣️ ${street} (No: ${building})` : `Posta: ${postal}`);

          return {
            name,
            id,
            x: typeof x === 'number' ? Math.round(x * 10) / 10 : x,
            y: typeof y === 'number' ? Math.round(y * 10) / 10 : y,
            z: typeof z === 'number' ? Math.round(z * 10) / 10 : z,
            postal,
            street,
            building,
            safezone,
            locationText,
          };
        });

        const killLogs: ErlcKillLog[] = rawKillLogs.slice(-20).map((k: any) => {
          const killerRaw = k.Killer || 'Bilinmiyor:0';
          const victimRaw = k.Killed || 'Bilinmiyor:0';
          const killerName = killerRaw.split(':')[0];
          const victimName = victimRaw.split(':')[0];

          return {
            id: `${killerRaw}_${victimRaw}_${k.Timestamp || Date.now()}`,
            killer: killerName,
            victim: victimName,
            weapon: k.Weapon || 'Bilinmiyor',
            safezoneViolation: false,
            timestamp: k.Timestamp || Date.now(),
          };
        });

        return {
          connected: true,
          players,
          killLogs,
          currentPlayers: data.CurrentPlayers ?? players.length,
          maxPlayers: data.MaxPlayers ?? 32,
          queue: data.Queue ?? 0,
        };
      }
    } catch (error) {
      console.error('ER:LC API radar fetch error:', error);
    }
  }

  // ER:LC API doğrudan çalışmıyorsa veya anahtar yoksa Discord #canlı-radar kanalını dinle!
  const backupData = await fetchDiscordRadarBackup();
  if (backupData) {
    return backupData;
  }

  return { connected: false, players: [], killLogs: [], currentPlayers: 0, maxPlayers: 32, queue: 0 };
}
