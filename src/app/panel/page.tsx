'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, AlertTriangle, Users, LogOut, ExternalLink } from 'lucide-react';
import { ROLES } from '@/lib/constants';
import DashboardLayout from '@/components/DashboardLayout';

import { getCachedSession, syncSession, getAuthHeaders } from '@/lib/clientAuth';

export default function OyuncuPaneliPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Real-time server and warning data
  const [rpStatus, setRpStatus] = useState<{ active: boolean; label: string; notice: string }>({
    active: false,
    label: 'Yükleniyor...',
    notice: 'Kontrol ediliyor...',
  });
  const [erlcInfo, setErlcInfo] = useState<string>('0/0 Oyuncu');
  const [myWarnings, setMyWarnings] = useState<any[]>([]);

  useEffect(() => {
    // 1. Instant optimistic load from cache if available
    const cached = getCachedSession();
    if (cached) {
      setSession(cached);
      setLoading(false);
    }

    // 2. Sync session with server & discord
    syncSession()
      .then((sess) => {
        const active = sess || cached;
        if (active) {
          const userRoles: string[] = active.roles || [];
          const isStaff = userRoles.some((r) => [
            ROLES.KURUCU, ROLES.UST_YONETIM, ROLES.YONETICI, 
            ROLES.SENIOR_STAFF, ROLES.STAFF, ROLES.TRIAL_STAFF
          ].includes(r));
          const isWhitelist = userRoles.includes(ROLES.WHITELIST);
          const isKayitsiz = userRoles.includes(ROLES.KAYITSIZ) || (!isWhitelist && !isStaff);

          // Kayıtsız veya yetkisiz üyeler SADECE kayıt masasını görebilir
          if (isKayitsiz && !isWhitelist && !isStaff) {
            window.location.href = '/kayit';
            return;
          }

          setSession(active);
          setLoading(false);

          // Fetch warnings for this specific user
          fetch('/api/uyarilar', { headers: getAuthHeaders(), credentials: 'include' })
            .then((r) => r.json())
            .then((wData) => {
              if (wData && wData.warnings) {
                const filtered = wData.warnings.filter((w: any) => w.targetId === active.id);
                setMyWarnings(filtered);
              }
            })
            .catch(() => {});
        } else {
          window.location.href = '/api/auth/discord';
        }
      })
      .catch(() => {
        if (!cached) {
          window.location.href = '/api/auth/discord';
        }
      });

    // 2. Fetch live RP and ER:LC status
    fetch('/api/status')
      .then((res) => res.json())
      .then((sData) => {
        if (sData) {
          setRpStatus({
            active: sData.rpStatus?.active ?? false,
            label: sData.rpStatus?.label || 'ROL PASİF (BEKLEMEDE)',
            notice: sData.rpStatus?.notice || 'Oylama bekleniyor.',
          });
          setErlcInfo(sData.erlc?.statusText || '0 Oyuncu');
        }
      })
      .catch(() => {});
  }, []);

  const hasIllegalRole = session?.roles?.includes(ROLES.ILLEGAL);

  // Total points calculation from actual Discord roles or warning history
  const warningRoles = [
    { roleId: '1553055210073497710', points: 15, tier: 'Kademe 5 (JAIL)' },
    { roleId: '1553054768388374620', points: 12, tier: 'Kademe 4' },
    { roleId: '1534715488716853278', points: 9, tier: 'Kademe 3' },
    { roleId: '1534715383507058749', points: 6, tier: 'Kademe 2' },
    { roleId: '1534715251323572315', points: 3, tier: 'Kademe 1' },
  ];

  let currentPoints = 0;
  let currentTierName = 'Sicil Temiz';
  for (const wr of warningRoles) {
    if (session?.roles?.includes(wr.roleId)) {
      currentPoints = wr.points;
      currentTierName = wr.tier;
      break;
    }
  }

  // Also sum points from real warning history
  const historyPoints = myWarnings.reduce((acc, curr) => acc + (curr.points || 0), 0);
  const totalScore = Math.max(currentPoints, historyPoints);
  const jailPercentage = Math.min(100, Math.round((totalScore / 15) * 100));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-2" />
      </div>
    );
  }

  return (
    <DashboardLayout session={session}>
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">Oyuncu Paneli</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                  @| Whitelist Üye
                </span>
              </div>
              <p className="text-xs text-gray-400">Canlı sunucu durumu, kişisel siciliniz ve rolleriniz</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/api/auth/logout"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Çıkış Yap</span>
            </Link>
          </div>
        </div>

        {/* Sunucu Durumu (RP Aktif / Pasif - Canlı Discord Duyuru Okuması) */}
        <div className={`glass-card p-5 rounded-2xl border mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
          rpStatus.active 
            ? 'border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 to-transparent' 
            : 'border-gray-800 bg-gradient-to-r from-gray-900/30 to-transparent'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${
              rpStatus.active ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'
            }`} />
            <div>
              <div className={`text-xs uppercase font-bold tracking-wider ${
                rpStatus.active ? 'text-emerald-400' : 'text-gray-400'
              }`}>
                Sunucu Durumu: {rpStatus.label}
              </div>
              <p className="text-sm font-bold text-white mt-0.5">{rpStatus.notice}</p>
            </div>
          </div>
          <div className="text-xs text-gray-400 font-mono bg-black/40 px-3.5 py-1.5 rounded-xl border border-white/5">
            ER:LC: {erlcInfo}
          </div>
        </div>

        {/* Profile & Roles Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          
          {/* Discord Profile */}
          <div className="glass-card p-5 rounded-2xl border-white/5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-2">Discord Profiliniz</div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center font-bold text-lg text-white">
                {session.username?.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-white text-base">{session.username}</h4>
                <p className="text-xs text-gray-400 font-mono">ID: {session.id}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 text-xs text-emerald-400 font-medium">
              ✅ Discord Bağlandı
            </div>
          </div>

          {/* Roblox Profile */}
          <div className="glass-card p-5 rounded-2xl border-white/5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 mb-2">Roblox Hesabınız</div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center font-bold text-lg text-white">
                RB
              </div>
              <div>
                <h4 className="font-bold text-white text-base">{session.roblox_username || session.username}</h4>
                <p className="text-xs text-gray-400 font-mono">Doğrulandı ✅</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-purple-400">
              <span>ER:LC Entegre</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* User Roles */}
          <div className="glass-card p-5 rounded-2xl border-white/5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2">Sunucu İçi Rolleriniz</div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                @| Whitelist
              </span>
              {hasIllegalRole && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  @| İllegal
                </span>
              )}
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                @| Üye
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-3 pt-3 border-t border-white/5">
              Yalnızca size ait yetki ve roller listelenir.
            </p>
          </div>

        </div>

        {/* SADECE KENDİSİNE AİT UYARISI & CEZA SİCİLİ */}
        <div className="glass-card p-6 rounded-3xl border-white/5 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Kişisel Ceza & Sicil Durumunuz</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Sadece size ait olan ihlaller ve ceza puanları görüntülenir.</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Toplam Ceza: {totalScore} Puan
              </span>
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {currentTierName}
              </span>
            </div>
          </div>

          {/* Progress bar to Jail (15 Puan) */}
          <div className="space-y-1.5 mb-6">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Jail Ceza Sınırı (15 Puan)</span>
              <span className="text-amber-400 font-semibold">%{jailPercentage} ({totalScore} / 15 Puan)</span>
            </div>
            <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  totalScore >= 12 ? 'bg-red-500' : totalScore >= 6 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${jailPercentage}%` }} 
              />
            </div>
          </div>

          {/* Warning History Table */}
          {myWarnings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-gray-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 rounded-l-lg">ID</th>
                    <th className="py-2.5 px-3">İhlal Edilen Kural</th>
                    <th className="py-2.5 px-3">Ceza Puanı</th>
                    <th className="py-2.5 px-3">İşlem Yapan Yetkili</th>
                    <th className="py-2.5 px-3">Tarih</th>
                    <th className="py-2.5 px-3 rounded-r-lg">Gerekçe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {myWarnings.map((w) => (
                    <tr key={w.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-blue-400">#{w.id}</td>
                      <td className="py-3 px-3 font-medium">{w.ruleTitle || w.ruleId}</td>
                      <td className="py-3 px-3 font-bold text-amber-400">
                        {w.points > 0 ? `+${w.points} Puan` : w.special || 'Sözlü'}
                      </td>
                      <td className="py-3 px-3">{w.staffName}</td>
                      <td className="py-3 px-3 text-gray-400">{new Date(w.timestamp).toLocaleDateString('tr-TR')}</td>
                      <td className="py-3 px-3 text-gray-400 max-w-xs truncate">{w.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center text-xs text-gray-400">
              🎉 Harika! Discord sicilinizde adınıza kayıtlı herhangi bir aktif ceza veya kural ihlali bulunmamaktadır.
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
