'use client';

import React, { useState } from 'react';
import { X, Terminal, Radio, Server, Users, MapPin, ShieldAlert, Activity, Eye, Search } from 'lucide-react';
import { SAFEZONES } from '@/lib/constants';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanelModal({ isOpen, onClose }: AdminPanelModalProps) {
  const [activeTab, setActiveTab] = useState<'servers' | 'radar' | 'gangs'>('servers');
  const [selectedUserForInspect, setSelectedUserForInspect] = useState<string>('Oyuncu_1');

  if (!isOpen) return null;

  // Mock mutual guild data (populated via Discord OAuth2 'guilds' scope)
  const usersWithGuilds = [
    {
      id: 'Oyuncu_1',
      discordName: 'Kullanici_Alpha#1234',
      discordId: '1548901239841203',
      robloxName: 'AlphaRP',
      roles: ['Üye', 'Whitelist', 'Kademe 1'],
      joinedDate: '15.08.2026',
      totalGuilds: 18,
      sharedOrSuspiciousGuilds: [
        { name: 'ER:LC Piyadeleri (Bizim Sunucu)', icon: '🛡️', role: 'Üye', isCurrent: true },
        { name: 'Liberty County Turkey RP', icon: '🚨', role: 'Üye', isCurrent: false },
        { name: 'Istanbul Roleplay ERLC', icon: '🏙️', role: 'Staff', isCurrent: false },
        { name: 'Turkish Police Department Clan', icon: '👮', role: 'Üye', isCurrent: false },
        { name: 'Vagos Gang Community', icon: '💀', role: 'Lider', isCurrent: false },
      ]
    },
    {
      id: 'Oyuncu_2',
      discordName: 'Mehmet_Efe#5678',
      discordId: '1539201948271039',
      robloxName: 'MehmetEfe_06',
      roles: ['Üye', 'Whitelist', 'Staff'],
      joinedDate: '01.07.2026',
      totalGuilds: 24,
      sharedOrSuspiciousGuilds: [
        { name: 'ER:LC Piyadeleri (Bizim Sunucu)', icon: '🛡️', role: 'Staff', isCurrent: true },
        { name: 'Roblox Developers TR', icon: '💻', role: 'Üye', isCurrent: false },
        { name: 'Discord Bot Destek', icon: '🤖', role: 'Üye', isCurrent: false },
      ]
    }
  ];

  const currentInspectedUser = usersWithGuilds.find(u => u.id === selectedUserForInspect) || usersWithGuilds[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl glass-card rounded-3xl border border-purple-500/20 p-5 sm:p-8 shadow-2xl shadow-purple-900/20 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Terminal className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">Kurucu Özel Yönetim Terminali</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold">
                Bana Özel Panel
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400">Üyelerin bulunduğu sunucular, ER:LC canlı radarı ve derin sunucu denetimi.</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 rounded-2xl bg-[#090b12] border border-white/10">
          <button
            onClick={() => setActiveTab('servers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'servers'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Kullanıcıların Bulunduğu Sunucular</span>
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'radar'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
            <span>ER:LC Canlı Harita & Safezone</span>
          </button>

          <button
            onClick={() => setActiveTab('gangs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'gangs'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4 text-indigo-400" />
            <span>Çete Parsel Yönetimi</span>
          </button>
        </div>

        {/* TAB 1: KULLANICILARIN BULUNDUĞU SUNUCULAR */}
        {activeTab === 'servers' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs sm:text-sm flex items-start gap-3">
              <Eye className="w-5 h-5 flex-shrink-0 text-purple-400 mt-0.5" />
              <div>
                <strong className="text-white">Discord OAuth2 Sunucu Denetimi:</strong> Kullanıcılar web sitemize Discord ile giriş yaptıklarında verdikleri izin sayesinde, üyesi oldukları diğer Discord sunucuları burada listelenir. Böylece kural ihlali (M9 - Başka sunucuya üye çekme) veya rakip sunucu denetimlerini kolayca yapabilirsiniz.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* User List Column */}
              <div className="md:col-span-5 space-y-2">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Denetlenecek Üyeler</div>
                {usersWithGuilds.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUserForInspect(u.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedUserForInspect === u.id
                        ? 'bg-purple-600/20 border-purple-500/50 shadow-lg shadow-purple-600/10'
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white text-sm">{u.discordName}</div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                        {u.totalGuilds} Sunucu
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Roblox: {u.robloxName} • ID: {u.discordId}</div>
                  </div>
                ))}
              </div>

              {/* Inspected User Guilds Detail */}
              <div className="md:col-span-7 glass-card p-5 rounded-2xl border-white/10">
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <div>
                    <h4 className="font-extrabold text-white text-base">{currentInspectedUser.discordName}</h4>
                    <p className="text-xs text-gray-400">Üyelik Tarihi: {currentInspectedUser.joinedDate}</p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300">
                    Toplam {currentInspectedUser.sharedOrSuspiciousGuilds.length} Ortak/Aktif Sunucu
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {currentInspectedUser.sharedOrSuspiciousGuilds.map((g, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{g.icon}</span>
                        <div>
                          <p className="font-semibold text-sm text-gray-200">{g.name}</p>
                          <span className="text-[11px] text-gray-400">Sunucu İçi Rolü: {g.role}</span>
                        </div>
                      </div>
                      {g.isCurrent ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Bizim Sunucumuz
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Harici Sunucu
                        </span>
                      )}
                    </div>
                  ))}
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 2: ER:LC CANLI HARİTA & SAFEZONE RADARI */}
        {activeTab === 'radar' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {SAFEZONES.map((sz) => (
                <div key={sz.id} className="p-4 rounded-2xl glass-card border-white/5 bg-gradient-to-b from-blue-950/20 to-transparent">
                  <div className="text-[11px] text-blue-400 font-bold uppercase">{sz.type}</div>
                  <h5 className="font-bold text-white text-sm mt-1">{sz.name}</h5>
                  <p className="text-xs text-gray-400 mt-1 font-mono">Posta: {sz.postal}</p>
                </div>
              ))}
            </div>

            {/* Simulated Live Radar Feed */}
            <div className="glass-card p-5 rounded-2xl border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                  <h4 className="font-bold text-white text-base">Aktif Oyuncu Konumları (ER:LC Canlı Radar)</h4>
                </div>
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  15s Senkron Aktif
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-gray-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Oyuncu</th>
                      <th className="py-2.5 px-3">Koordinatlar (X, Z)</th>
                      <th className="py-2.5 px-3">Posta Kodu</th>
                      <th className="py-2.5 px-3">Cadde / Konum</th>
                      <th className="py-2.5 px-3">Bölge Durumu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    <tr className="hover:bg-white/5">
                      <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        Ahmet_Yilmaz:12093
                      </td>
                      <td className="py-3 px-3 font-mono text-blue-400">X: 1105.2 | Z: 3402.1</td>
                      <td className="py-3 px-3 font-mono">227</td>
                      <td className="py-3 px-3">Curb (No: 2271)</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                          🛡️ Gunshop Safezone
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-white/5">
                      <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        Murat_Kaya:84912
                      </td>
                      <td className="py-3 px-3 font-mono text-blue-400">X: 2890.4 | Z: 3510.6</td>
                      <td className="py-3 px-3 font-mono">310</td>
                      <td className="py-3 px-3">Road (No: 3102)</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold">
                          🛡️ Polis Departmanı
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ÇETE PARSEL HARİTASI */}
        {activeTab === 'gangs' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl glass-card border-white/5">
              <h4 className="font-bold text-white text-base mb-1">Mülk & Parsel Durumu (VALID_PARSELLER)</h4>
              <p className="text-xs text-gray-400 mb-4">Sunucuda çetelerin kiraladığı ve kontrol ettiği parseller</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {['700', '701', '702', '703', '1104', '1108', '1101', '601', '602', '600', '805', '807'].map((parsel) => {
                  const isOccupied = ['701', '1104', '600'].includes(parsel);
                  return (
                    <div 
                      key={parsel}
                      className={`p-3 rounded-xl border text-center ${
                        isOccupied 
                          ? 'bg-purple-950/30 border-purple-500/40 text-purple-300' 
                          : 'bg-white/5 border-white/10 text-gray-400'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold text-gray-500">Parsel No</div>
                      <div className="text-base font-extrabold text-white mt-0.5 font-mono">#{parsel}</div>
                      <div className="text-[10px] mt-1 font-semibold">
                        {isOccupied ? 'Dolu (Çete Aktif)' : 'Boş / Satılık'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-colors"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
}
