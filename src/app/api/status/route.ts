import { NextResponse } from 'next/server';
import { fetchLiveRadarData } from '@/lib/erlc';
import { fetchLiveRpStatus } from '@/lib/discord';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [radar, rpStatus] = await Promise.all([
    fetchLiveRadarData(),
    fetchLiveRpStatus(),
  ]);

  const currentPlayers = radar.currentPlayers;
  const maxPlayers = radar.maxPlayers;
  const queueCount = radar.queue;

  return NextResponse.json({
    online: true,
    erlc: {
      connected: radar.connected,
      currentPlayers,
      maxPlayers,
      queueCount,
      statusText: `${currentPlayers}/${maxPlayers} Oyuncu • ${queueCount} Sırada`,
    },
    rpStatus: {
      active: rpStatus.active,
      label: rpStatus.active ? 'ROL AKTİF (RP BAŞLADI)' : 'ROL PASİF (BEKLEMEDE)',
      notice: rpStatus.notice,
    },
  });
}
