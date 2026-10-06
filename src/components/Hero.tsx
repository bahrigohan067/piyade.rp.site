'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, LogIn, BookOpen, Sparkles, Radio, AlertTriangle } from 'lucide-react';

export default function Hero() {
  const [rpStatus, setRpStatus] = React.useState<{ active: boolean; label: string }>({
    active: false,
    label: 'ROL PASİF (BEKLEMEDE)',
  });

  React.useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.rpStatus) {
          setRpStatus({
            active: data.rpStatus.active,
            label: data.rpStatus.active ? 'ROL RESMEN BAŞLADI' : 'ROL PASİF (BEKLEMEDE)',
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative pt-36 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Announcement Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-blue-500/30 text-xs sm:text-sm text-gray-300 shadow-lg shadow-blue-500/10">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
            <span className="font-semibold text-white">Piyade Roleplay Web Portalı</span>
            <span className="text-gray-500">|</span>
            <span className="text-blue-400 font-medium flex items-center gap-1">
              Yetkili & Oyuncu Senkronu
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            </span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Liberty County'nin <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-500 text-glow-blue">
              En Prestijli & Düzenli
            </span> <br />
            Roleplay Sistemi
          </h1>
          <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Discord botumuz ve oyun sunucumuzla birebir senkronize çalışan, şeffaf sicil takipli, canlı radarlı ve güvenli roleplay merkezi.
          </p>
        </div>

        {/* Primary Action Button: ONLY Discord Giriş & Kurallar */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            href="/api/auth/discord"
            className="px-8 sm:px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-base shadow-2xl shadow-blue-600/30 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
          >
            <LogIn className="w-5 h-5 text-blue-200" />
            <span>Discord ile Giriş Yap</span>
          </Link>

          <a
            href="#kurallar"
            className="px-7 py-4 rounded-2xl glass-card hover:bg-white/10 text-gray-200 font-bold text-base border border-white/10 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95"
          >
            <BookOpen className="w-5 h-5 text-blue-400" />
            <span>Sunucu Kuralları</span>
          </a>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
          
          <div className="glass-card glass-card-hover p-5 sm:p-6 rounded-2xl border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sunucu Durumu</span>
              <span className={`w-2.5 h-2.5 rounded-full ${rpStatus.active ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
            </div>
            <div className={`text-xl sm:text-2xl font-black font-mono ${rpStatus.active ? 'text-emerald-400' : 'text-gray-400'}`}>
              {rpStatus.active ? 'ÇEVRİMİÇİ' : 'PASİF'}
            </div>
            <p className={`text-xs mt-1 font-medium ${rpStatus.active ? 'text-emerald-400' : 'text-gray-500'}`}>
              {rpStatus.label}
            </p>
          </div>

          <div className="glass-card glass-card-hover p-5 sm:p-6 rounded-2xl border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Safezone Koruması</span>
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">4 BÖLGE</div>
            <p className="text-xs text-blue-400 mt-1 font-medium">Milimetrik Poligon Radar</p>
          </div>

          <div className="glass-card glass-card-hover p-5 sm:p-6 rounded-2xl border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ceza Sistemi</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">5 KADEME</div>
            <p className="text-xs text-amber-400 mt-1 font-medium">Otomatik Puan & Rol</p>
          </div>

          <div className="glass-card glass-card-hover p-5 sm:p-6 rounded-2xl border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mülkiyet</span>
              <Radio className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">28 PARSEL</div>
            <p className="text-xs text-purple-400 mt-1 font-medium">Bölge & Şehir Hakimiyeti</p>
          </div>

        </div>

      </div>
    </section>
  );
}
