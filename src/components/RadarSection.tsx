'use client';

import React from 'react';
import { Radio, ShieldAlert, MapPin, Zap } from 'lucide-react';
import { SAFEZONES } from '@/lib/constants';

interface RadarSectionProps {
  onOpenAdmin: () => void;
}

export default function RadarSection({ onOpenAdmin }: RadarSectionProps) {
  return (
    <section id="radar" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold tracking-wider uppercase mb-4">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Liberty County Canlı Güvenlik Ağı</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            ER:LC Canlı Radar & <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-amber-300">Safezone Takibi</span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg">
            Botumuzun Ray-Casting algoritmasıyla korunan 4 ana Safezone bölgesi ve anlık oyuncu hareketleri.
          </p>
        </div>

        {/* Radar Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {SAFEZONES.map((zone) => (
            <div 
              key={zone.id} 
              className="glass-card glass-card-hover p-6 rounded-2xl border-white/5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Korumalı
                </span>
              </div>

              <h4 className="text-base font-bold text-white mb-1">{zone.name}</h4>
              <p className="text-xs text-gray-400 font-mono mb-4">Posta Kodları: {zone.postal}</p>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                <span>Tür:</span>
                <span className="font-semibold text-gray-200">{zone.type}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Live Terminal Callout Card */}
        <div className="glass-card p-8 rounded-3xl border-red-500/20 relative overflow-hidden bg-gradient-to-r from-red-950/20 via-black/40 to-blue-950/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>Otomatik RDM & Safezone İhlal Algoritması</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Canlı Oyuncu ve İhlal Terminali</h3>
              <p className="text-sm text-gray-400 max-w-xl">
                Oyun içi katil ve kurban kayıtları, silah türleri, milimetrik X-Z koordinatları anlık olarak analiz edilir ve kurallara aykırı cinayetler doğrudan loglanır.
              </p>
            </div>

            <button
              onClick={onOpenAdmin}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 font-bold text-white text-sm shadow-xl shadow-red-600/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <Zap className="w-4 h-4" />
              <span>Radarı Canlı İzle (Yönetici)</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
