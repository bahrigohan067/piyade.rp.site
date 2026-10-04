import { NextResponse } from 'next/server';

export async function GET() {
  const erlcApiKey = process.env.ERLC_API_KEY;
  let currentPlayers = 24;
  let maxPlayers = 32;
  let queueCount = 3;
  let serverName = 'Piyade Roleplay • ER:LC';
  let isRpActive = true; // RP Durumu (Duyuru kanalında 🚨 DİKKAT: ROL RESMEN BAŞLADI! olduğunda aktif)

  if (erlcApiKey) {
    try {
      const res = await fetch('https://api.erlc.gg/v2/server?Players=true', {
        headers: { 'Server-Key': erlcApiKey },
        next: { revalidate: 15 },
      });
      if (res.ok) {
        const data = await res.json();
        currentPlayers = data.CurrentPlayers || (data.Players ? data.Players.length : 0);
        maxPlayers = data.MaxPlayers || 32;
        queueCount = data.Queue || 0;
        serverName = data.Name || serverName;
      }
    } catch (e) {
      console.error('ER:LC API error:', e);
    }
  }

  return NextResponse.json({
    online: true,
    erlc: {
      currentPlayers,
      maxPlayers,
      queueCount,
      serverName,
      statusText: `${currentPlayers}/${maxPlayers} Oyuncu • ${queueCount} Sırada`,
    },
    rpStatus: {
      active: isRpActive,
      label: isRpActive ? 'ROL AKTİF (RP BAŞLADI)' : 'ROL PASİF (BEKLEMEDE)',
      notice: isRpActive 
        ? '🚨 DİKKAT: ROL RESMEN BAŞLADI!' 
        : 'Şu anda oylama veya bekleme aşamasında.',
    },
  });
}
