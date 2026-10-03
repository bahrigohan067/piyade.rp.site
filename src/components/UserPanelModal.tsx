'use client';

import React from 'react';
import { X, Shield, AlertTriangle, UserCheck, ExternalLink, Hash, Clock, FileText } from 'lucide-react';

interface UserPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserPanelModal({ isOpen, onClose }: UserPanelModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl glass-card rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">Oyuncu Profili & Sicil Kartı</h3>
            <p className="text-xs sm:text-sm text-gray-400">Discord hesabınız ve Roblox ER:LC verileriniz anlık senkronize</p>
          </div>
        </div>

        {/* User Top Cards: Discord & Roblox Sync */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          
          {/* Discord Card */}
          <div className="glass-card p-5 rounded-2xl border-white/5 bg-gradient-to-br from-blue-950/20 to-transparent">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-2">Discord Hesabı</div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-lg font-bold text-white">
                PR
              </div>
              <div>
                <h4 className="font-bold text-white text-base">PiyadeOyuncu</h4>
                <p className="text-xs text-gray-400">ID: 153283158275312</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-gray-300 font-medium">Whitelist Onaylı Üye</span>
            </div>
          </div>

          {/* Roblox Card */}
          <div className="glass-card p-5 rounded-2xl border-white/5 bg-gradient-to-br from-purple-950/20 to-transparent">
            <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 mb-2">Roblox Hesabı</div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-lg font-bold text-white">
                RB
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Ahmet | TurkishPolice</h4>
                <p className="text-xs text-gray-400">Roblox ID: 8941203</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-gray-400">Doğrulandı ✅</span>
              <a href="https://roblox.com" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline flex items-center gap-1">
                <span>Profil</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Gang Card */}
          <div className="glass-card p-5 rounded-2xl border-white/5 bg-gradient-to-br from-indigo-950/20 to-transparent">
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-2">Çete / İllegal Mülk</div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-lg font-bold text-indigo-300">
                #701
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Vagos Syndicate</h4>
                <p className="text-xs text-gray-400">Rütbe: Underboss</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-gray-400">Parsel: No: 701</span>
              <span className="text-indigo-400 font-mono">Telsiz: 📻 482</span>
            </div>
          </div>

        </div>

        {/* Warning & Penalty Status Card */}
        <div className="glass-card p-6 rounded-2xl border-white/5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Ceza & Sicil Durumu</span>
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">Mevcut ceza puanınız ve aktif uyarı kademeniz</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-sm">
                Toplam Ceza: 3 Puan
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-sm">
                Kademe 1 (Uyarı 1 Rolü)
              </div>
            </div>
          </div>

          {/* Progress bar to Jail */}
          <div className="space-y-1.5 mb-6">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Jail Sınırı (15 Puan)</span>
              <span className="text-amber-400 font-semibold">%20 (3/15 Puan)</span>
            </div>
            <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500" 
                style={{ width: '20%' }}
              />
            </div>
          </div>

          {/* Warning History Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-gray-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">ID</th>
                  <th className="py-2.5 px-3">İhlal Edilen Kural</th>
                  <th className="py-2.5 px-3">Ceza Puanı</th>
                  <th className="py-2.5 px-3">İşlem Yapan Yetkili</th>
                  <th className="py-2.5 px-3">Tarih</th>
                  <th className="py-2.5 px-3 rounded-r-lg">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-blue-400">#4A9C</td>
                  <td className="py-3 px-3 font-medium">RM14 - Random Death Match (RDM)</td>
                  <td className="py-3 px-3 font-bold text-amber-400">+3 Puan</td>
                  <td className="py-3 px-3">Senior Staff | Emre</td>
                  <td className="py-3 px-3 text-gray-400">02.10.2026 - 21:40</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                      Aktif
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3">
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
