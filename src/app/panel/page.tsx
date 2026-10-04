'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, AlertTriangle, Users, LogOut, ExternalLink, CheckCircle2, Lock, Radio, MapPin, Send, HelpCircle } from 'lucide-react';
import { ROLES, VALID_PARSELLER } from '@/lib/constants';

export default function OyuncuPaneliPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gangSubmitted, setGangSubmitted] = useState(false);

  // Form states for gang application
  const [gangName, setGangName] = useState('');
  const [gangColor, setGangColor] = useState('Kırmızı (#FF0000)');
  const [gangParsel, setGangParsel] = useState('701');
  const [gangMembers, setGangMembers] = useState('');
  const [gangStory, setGangStory] = useState('');

  useEffect(() => {
    // Check if session cookie exists or fetch current session
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.session) {
          setSession(data.session);
        } else {
          // Fallback to default whitelist session for demo
          setSession({
            username: 'PiyadeUye',
            id: '1533908873772273715',
            roblox_username: 'Ahmet_TurkishPolice',
            roles: [ROLES.WHITELIST, ROLES.ILLEGAL], // Default demo
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setSession({
          username: 'PiyadeUye',
          id: '1533908873772273715',
          roblox_username: 'Ahmet_TurkishPolice',
          roles: [ROLES.WHITELIST, ROLES.ILLEGAL],
        });
        setLoading(false);
      });
  }, []);

  const hasIllegalRole = session?.roles?.includes(ROLES.ILLEGAL);

  const handleGangSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGangSubmitted(true);
    setTimeout(() => setGangSubmitted(false), 6000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-2" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-400" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">Oyuncu Paneli</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                @| Whitelist Üye
              </span>
            </div>
            <p className="text-xs text-gray-400">Sunucu durumu, kendi siciliniz ve rolleriniz</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/select-role"
            className="px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold hover:bg-purple-500/20"
          >
            Rol Değiştir
          </Link>
          <Link
            href="/api/auth/logout"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Çıkış Yap</span>
          </Link>
        </div>
      </div>

      {/* Sunucu Durumu Banner */}
      <div className="glass-card p-5 rounded-2xl border-emerald-500/20 mb-8 bg-gradient-to-r from-emerald-950/20 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-emerald-400">Sunucu Durumu (RP Aktif)</div>
            <p className="text-sm font-bold text-white mt-0.5">🚨 DİKKAT: ROL RESMEN BAŞLADI! (Aktif Roleplay Açık)</p>
          </div>
        </div>
        <div className="text-xs text-gray-400 font-mono bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
          ER:LC: 24/32 Oyuncu • 3 Sırada
        </div>
      </div>

      {/* Top 3 Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        
        {/* Discord Profile */}
        <div className="glass-card p-5 rounded-2xl border-white/5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-2">Discord Profiliniz</div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center font-bold text-lg text-white">
              {session.username?.substring(0, 2).toUpperCase() || 'DC'}
            </div>
            <div>
              <h4 className="font-bold text-white text-base">{session.username}</h4>
              <p className="text-xs text-gray-400 font-mono">ID: {session.id}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 text-xs text-emerald-400 font-medium">
            ✅ Whitelist Kayıtlı Üye
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
              <h4 className="font-bold text-white text-base">{session.roblox_username || 'Doğrulanmış Roblox'}</h4>
              <p className="text-xs text-gray-400 font-mono">Doğrulandı ✅</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-purple-400">
            <span>Oyun İçi Senkron</span>
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
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              @| Üye
            </span>
            {hasIllegalRole && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                @| İllegal
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-500 mt-3 pt-3 border-t border-white/5">
            Sadece size ait olan roller listelenir.
          </p>
        </div>

      </div>

      {/* SADECE KENDİ UYARISI & SİCİLİ */}
      <div className="glass-card p-6 rounded-3xl border-white/5 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Kişisel Ceza & Uyarı Siciliniz</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Sadece size ait olan ihlaller ve ceza puanları görüntülenir.</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Toplam Ceza: 0 Puan
            </span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Sicil Temiz
            </span>
          </div>
        </div>

        {/* Progress bar to Jail */}
        <div className="space-y-1.5 mb-6">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Jail Ceza Sınırı (15 Puan)</span>
            <span className="text-emerald-400 font-semibold">%0 (0 / 15 Puan)</span>
          </div>
          <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '0%' }} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center text-xs text-gray-400">
          🎉 Tebrikler! Sunucumuzda adınıza kayıtlı herhangi bir aktif ceza veya uyarı bulunmamaktadır.
        </div>
      </div>

      {/* SADECE @| İLLEGAL ROLÜ OLANLARA GÖZÜKEN ÇETE BÖLÜMÜ */}
      {hasIllegalRole ? (
        <div className="glass-card p-6 rounded-3xl border-purple-500/20 mb-8 bg-gradient-to-b from-purple-950/20 to-transparent">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">Çete & İllegal Mülkiyet Masası</h3>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                    @| İllegal Rolüne Özel
                  </span>
                </div>
                <p className="text-xs text-gray-400">Çete kurma başvurusu, parsel seçimi ve ekip yönetimi</p>
              </div>
            </div>
          </div>

          {gangSubmitted && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs sm:text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <span>Başvurunuz başarıyla alındı! Discord çete log kanalına iletildi ve yetkililerin onayına sunuldu.</span>
            </div>
          )}

          <form onSubmit={handleGangSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Çete Adı</label>
                <input
                  type="text"
                  value={gangName}
                  onChange={(e) => setGangName(e.target.value)}
                  placeholder="Örn: Vagos Syndicate, Shelby Clan"
                  className="w-full px-4 py-2.5 bg-[#090b12] border border-white/10 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-purple-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Talep Edilen Parsel No</label>
                <select
                  value={gangParsel}
                  onChange={(e) => setGangParsel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#090b12] border border-white/10 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-purple-500/50"
                >
                  {VALID_PARSELLER.map((p) => (
                    <option key={p} value={p}>Parsel No #{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Çete Rol Rengi</label>
                <input
                  type="text"
                  value={gangColor}
                  onChange={(e) => setGangColor(e.target.value)}
                  placeholder="Örn: Kırmızı (#FF0000) veya Mor"
                  className="w-full px-4 py-2.5 bg-[#090b12] border border-white/10 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-purple-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Davet Edilecek Üyeler (Discord ID veya Tag)</label>
                <input
                  type="text"
                  value={gangMembers}
                  onChange={(e) => setGangMembers(e.target.value)}
                  placeholder="1539201948..., 154820194..."
                  className="w-full px-4 py-2.5 bg-[#090b12] border border-white/10 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-purple-500/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Çete Hikayesi (Rol Geçmişi)</label>
              <textarea
                rows={3}
                value={gangStory}
                onChange={(e) => setGangStory(e.target.value)}
                placeholder="Liberty County sokaklarında çetenizin nasıl kurulduğu ve illegal faaliyet hedefleri..."
                className="w-full px-4 py-2 bg-[#090b12] border border-white/10 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-purple-500/50"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-white text-sm shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Çete Kurma Başvurusunu Bota Gönder</span>
            </button>
          </form>
        </div>
      ) : null}

    </div>
  );
}
