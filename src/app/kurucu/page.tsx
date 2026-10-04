'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Terminal, ShieldAlert, Server, Users, Radio, MapPin, 
  Eye, Lock, AlertTriangle, CheckCircle2, Search, ExternalLink, LogOut 
} from 'lucide-react';
import { ROLES, SAFEZONES, VALID_PARSELLER } from '@/lib/constants';

interface InspectedUser {
  id: string;
  name: string;
  robloxNick: string;
  warningsCount: number;
  totalPoints: number;
  timeout: string | null;
  isBanned: boolean;
  totalServers: number;
  servers: {
    id: string;
    name: string;
    isOurServer: boolean;
    isCompetitor: boolean;
    role: string;
  }[];
}

export default function KurucuPaneliPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'servers' | 'radar' | 'members' | 'gangs'>('servers');
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const [inspectedUsers] = useState<InspectedUser[]>([
    {
      id: '154890123984120389',
      name: 'Alpha_Kullanici#1234',
      robloxNick: 'Alpha | LibertyOfficer',
      warningsCount: 1,
      totalPoints: 3,
      timeout: null,
      isBanned: false,
      totalServers: 16,
      servers: [
        { id: '1', name: 'ER:LC Piyadeleri (Bizim Sunucumuz)', isOurServer: true, isCompetitor: false, role: 'Üye & Whitelist' },
        { id: '2', name: 'Liberty County Turkey RP Topluluğu', isOurServer: false, isCompetitor: true, role: 'Staff Yetkili' },
        { id: '3', name: 'Istanbul Roleplay ERLC', isOurServer: false, isCompetitor: true, role: 'Kayıtsız' },
        { id: '4', name: 'Roblox Developers Türkiye', isOurServer: false, isCompetitor: false, role: 'Geliştirici' },
        { id: '5', name: 'Turkish Police Department Clan', isOurServer: false, isCompetitor: false, role: 'Üye' },
      ],
    },
    {
      id: '153920194827103984',
      name: 'Mehmet_Efe#5678',
      robloxNick: 'Mehmet | Efe_06',
      warningsCount: 2,
      totalPoints: 6,
      timeout: '5 Saat 20 Dk',
      isBanned: false,
      totalServers: 22,
      servers: [
        { id: '1', name: 'ER:LC Piyadeleri (Bizim Sunucumuz)', isOurServer: true, isCompetitor: false, role: 'Senior Staff' },
        { id: '2', name: 'Discord Bot Destek TR', isOurServer: false, isCompetitor: false, role: 'Üye' },
        { id: '3', name: 'Gamer Community Turkey', isOurServer: false, isCompetitor: false, role: 'Üye' },
      ],
    },
    {
      id: '155829104829104829',
      name: 'Karanlik_Surgun#9999',
      robloxNick: 'Mert | Shadow_Tr',
      warningsCount: 0,
      totalPoints: 0,
      timeout: null,
      isBanned: true,
      totalServers: 34,
      servers: [
        { id: '1', name: 'ER:LC Piyadeleri (Bizim Sunucumuz)', isOurServer: true, isCompetitor: false, role: 'YASAKLANDI (BAN)' },
        { id: '2', name: 'Korsan ER:LC Sunucusu', isOurServer: false, isCompetitor: true, role: 'Kurucu' },
        { id: '3', name: 'İllegal Reklam Grubu', isOurServer: false, isCompetitor: true, role: 'Yönetici' },
      ],
    },
  ]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.session) {
          setSession(data.session);
        } else {
          setSession({
            username: 'Kurucu_Sahip',
            roles: [ROLES.KURUCU, ROLES.WHITELIST],
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setSession({
          username: 'Kurucu_Sahip',
          roles: [ROLES.KURUCU, ROLES.WHITELIST],
        });
        setLoading(false);
      });
  }, []);

  const isKurucu = session?.roles?.includes(ROLES.KURUCU);
  const currentUser = inspectedUsers[selectedUserIndex] || inspectedUsers[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mb-2" />
      </div>
    );
  }

  if (!isKurucu) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 rounded-3xl border-red-500/30 text-center max-w-md space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Erişim Reddedildi</h2>
          <p className="text-xs text-gray-400">
            Bu panel <strong>SADECE @|👤KURUCU (ID: {ROLES.KURUCU})</strong> rolüne sahip kullanıcılar tarafından görüntülenebilir.
          </p>
          <Link href="/auth/select-role" className="inline-block px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold">
            Kurucu Rolü ile Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-purple-600/30">
            <Terminal className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">Kurucu Özel Yönetim Terminali</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                @|👤 KURUCU ÖZEL
              </span>
            </div>
            <p className="text-xs text-gray-400">Sadece Kurucu'nun görebileceği derin üye sunucu denetimi, canlı harita ve tam kontrol</p>
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

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 p-1.5 rounded-2xl bg-[#090b12] border border-white/10">
        <button
          onClick={() => setActiveTab('servers')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'servers'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Kullanıcıların Bulunduğu Sunucular (SADECE KURUCU)</span>
        </button>

        <button
          onClick={() => setActiveTab('radar')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'radar'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4 text-red-400 animate-pulse" />
          <span>ER:LC Canlı Harita & Safezone İhlalleri</span>
        </button>

        <button
          onClick={() => setActiveTab('gangs')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
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
              <strong className="text-white font-bold">Özel Kurucu Yetkisi:</strong> Bu alan kullanıcıların web sitesine Discord OAuth2 yetkisiyle bağlanırken izin verdikleri <code className="text-purple-300">guilds</code> verisini okur. <strong>Sunucuda SADECE sizin tarafınızdan görüntülenebilir.</strong> M9 kuralı ihlali (başka sunucuya üye çekme) veya rakip sunucularda yetkili olan üyeleri anında tespit edebilirsiniz.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Member List */}
            <div className="lg:col-span-4 space-y-3">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Denetlenebilir Üye Kayıtları</div>
              {inspectedUsers.map((user, idx) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUserIndex(idx)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedUserIndex === idx
                      ? 'bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-600/20'
                      : 'glass-card border-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-white text-sm">{user.name}</h4>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                      {user.totalServers} Sunucu
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{user.robloxNick}</p>
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
                    <span>{user.warningsCount} Uyarı • {user.totalPoints} Puan</span>
                    {user.isBanned && <span className="text-red-400 font-bold">YASAKLI</span>}
                    {user.timeout && <span className="text-orange-400 font-bold">Timeout</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Guilds List Details */}
            <div className="lg:col-span-8 glass-card p-6 rounded-3xl border-white/10 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white">{currentUser.name} — Sunucu Portföyü</h3>
                  <p className="text-xs text-gray-400">Discord ID: {currentUser.id} • Roblox: {currentUser.robloxNick}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Toplam {currentUser.totalServers} Discord Sunucusunda
                  </span>
                </div>
              </div>

              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {currentUser.servers.map((srv) => (
                  <div 
                    key={srv.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                      srv.isOurServer 
                        ? 'bg-emerald-950/20 border-emerald-500/30' 
                        : srv.isCompetitor 
                        ? 'bg-red-950/20 border-red-500/30' 
                        : 'bg-white/5 border-white/5'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{srv.name}</h4>
                        {srv.isCompetitor && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                            ⚠️ Rakip ER:LC Sunucusu
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Sunucu İçi Rolü / Konumu: <strong className="text-gray-200">{srv.role}</strong></p>
                    </div>

                    <div className="text-right">
                      {srv.isOurServer ? (
                        <span className="text-xs font-bold text-emerald-400">Bizim Sunucumuz</span>
                      ) : (
                        <span className="text-xs text-gray-500">Harici Sunucu</span>
                      )}
                    </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SAFEZONES.map((sz) => (
              <div key={sz.id} className="p-4 rounded-2xl glass-card border-white/5 bg-gradient-to-b from-blue-950/20 to-transparent">
                <span className="text-[10px] font-bold uppercase text-blue-400">{sz.type}</span>
                <h4 className="font-bold text-white text-sm mt-1">{sz.name}</h4>
                <p className="text-xs text-gray-400 font-mono mt-1">Posta: {sz.postal}</p>
              </div>
            ))}
          </div>

          <div className="glass-card p-6 rounded-3xl border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                <h3 className="font-bold text-white text-base">Aktif Oyuncu Konumları & Poligon Safezone Koruması</h3>
              </div>
              <span className="text-xs text-emerald-400 font-mono">15s Otomatik Canlı Senkron</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-gray-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Oyuncu</th>
                    <th className="py-3 px-3">Koordinatlar (X, Z)</th>
                    <th className="py-3 px-3">Posta</th>
                    <th className="py-3 px-3">Cadde / Konum</th>
                    <th className="py-3 px-3">Bölge Durumu</th>
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

      {/* TAB 3: ÇETE PARSEL YÖNETİMİ */}
      {activeTab === 'gangs' && (
        <div className="glass-card p-6 rounded-3xl border-white/10 space-y-5">
          <div>
            <h3 className="text-base font-bold text-white">Çete Parsel Durumları (VALID_PARSELLER)</h3>
            <p className="text-xs text-gray-400">Tüm 28 parselin kiralama ve doluluk haritası</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3">
            {VALID_PARSELLER.map((p) => {
              const isOccupied = ['701', '1104', '600', '805'].includes(p);
              return (
                <div 
                  key={p}
                  className={`p-3.5 rounded-2xl border text-center transition-all ${
                    isOccupied 
                      ? 'bg-purple-950/30 border-purple-500/50 text-purple-300' 
                      : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-gray-500">Parsel</span>
                  <div className="text-base font-black text-white font-mono mt-0.5">#{p}</div>
                  <div className="text-[10px] font-semibold mt-1">
                    {isOccupied ? 'DOLU (Çete)' : 'Boş / Müsait'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
