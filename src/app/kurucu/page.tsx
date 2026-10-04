'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Terminal, ShieldAlert, Server, Users, Radio, MapPin, 
  Eye, Lock, AlertTriangle, CheckCircle2, Search, ExternalLink, LogOut, RefreshCw, Send, Shield
} from 'lucide-react';
import { ROLES, RULES, SAFEZONES, VALID_PARSELLER, STAFF_ROLE_TITLES } from '@/lib/constants';

interface MemberRecord {
  id: string;
  username: string;
  discriminator: string;
  globalName: string | null;
  avatarUrl: string;
  nickname: string;
  name: string;
  robloxName: string;
  roles: string[];
  staffTitle: string | null;
  warningCount: number;
  totalPoints: number;
  warningTier: number;
  hasJail: boolean;
  hasYasakli: boolean;
  timeoutRemaining: string | null;
  isBanned: boolean;
}

interface RadarPlayer {
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

interface GangRecord {
  id: string;
  name: string;
  boss: string;
  parsel: string;
  warnings: number;
}

export default function KurucuPaneliPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'servers' | 'radar' | 'members' | 'gangs'>('servers');
  const [searchQuery, setSearchQuery] = useState('');

  // Live Data States
  const [membersList, setMembersList] = useState<MemberRecord[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberRecord | null>(null);
  const [radarData, setRadarData] = useState<{ connected: boolean; currentPlayers: number; maxPlayers: number; players: RadarPlayer[] }>({
    connected: false,
    currentPlayers: 0,
    maxPlayers: 32,
    players: [],
  });
  const [gangsList, setGangsList] = useState<GangRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Warning Form in Kurucu
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warnMode, setWarnMode] = useState<'madde' | 'sozlu'>('madde');
  const [warnRuleId, setWarnRuleId] = useState('RM14');
  const [warnReason, setWarnReason] = useState('');
  const [warnProof, setWarnProof] = useState('');
  const [submittingWarn, setSubmittingWarn] = useState(false);
  const [warnSuccess, setWarnSuccess] = useState<string | null>(null);

  const loadAllData = async () => {
    setRefreshing(true);
    try {
      const [membersRes, radarRes, gangsRes] = await Promise.all([
        fetch('/api/members').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/radar').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/gangs').then((r) => (r.ok ? r.json() : null)),
      ]);

      if (membersRes && membersRes.members) {
        setMembersList(membersRes.members);
        if (!selectedMember && membersRes.members.length > 0) {
          setSelectedMember(membersRes.members[0]);
        } else if (selectedMember) {
          const updated = membersRes.members.find((m: MemberRecord) => m.id === selectedMember.id);
          if (updated) setSelectedMember(updated);
        }
      }

      if (radarRes) {
        setRadarData({
          connected: radarRes.connected || false,
          currentPlayers: radarRes.currentPlayers || 0,
          maxPlayers: radarRes.maxPlayers || 32,
          players: radarRes.players || [],
        });
      }

      if (gangsRes && gangsRes.gangs) {
        setGangsList(gangsRes.gangs);
      }
    } catch (e) {
      console.error('Error refreshing kurucu data:', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.session) {
          const roles: string[] = data.session.roles || [];
          const isKurucuRole = roles.includes(ROLES.KURUCU);

          if (!isKurucuRole) {
            const isStaff = roles.some((r) => [
              ROLES.UST_YONETIM, ROLES.YONETICI, 
              ROLES.SENIOR_STAFF, ROLES.STAFF, ROLES.TRIAL_STAFF
            ].includes(r));
            if (isStaff) {
              window.location.href = '/yetkili';
            } else if (roles.includes(ROLES.WHITELIST)) {
              window.location.href = '/panel';
            } else {
              window.location.href = '/kayit';
            }
            return;
          }
          setSession(data.session);
          setLoading(false);
        } else {
          window.location.href = '/api/auth/discord';
        }
      })
      .catch(() => {
        window.location.href = '/api/auth/discord';
      });

    loadAllData();
  }, []);

  const isKurucu = session?.roles?.includes(ROLES.KURUCU);

  const filteredMembers = membersList.filter(
    (m) =>
      m.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.robloxName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.includes(searchQuery)
  );

  const handleKurucuWarning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    setSubmittingWarn(true);

    try {
      const res = await fetch('/api/uyari', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: warnMode,
          targetUserId: selectedMember.id,
          targetUsername: selectedMember.nickname,
          ruleId: warnRuleId,
          reason: warnReason,
          proofUrl: warnProof,
        }),
      });

      const d = await res.json();
      if (res.ok) {
        setWarnSuccess(d.message || '✅ Uyarı başarıyla Discord botuna iletildi!');
        setWarnReason('');
        setWarnProof('');
        setShowWarningModal(false);
        loadAllData();
      } else {
        alert(d.error || 'Hata oluştu');
      }
    } catch {
      alert('İşlem sırasında hata oluştu.');
    } finally {
      setSubmittingWarn(false);
      setTimeout(() => setWarnSuccess(null), 6000);
    }
  };

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
            <p className="text-xs text-gray-400">Sadece Kurucu'nun görebileceği derin üye sunucu denetimi, canlı ER:LC radarı ve çete yönetimi</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all"
            title="Tüm Canlı Verileri Yenile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-purple-400' : ''}`} />
            <span>Yenile</span>
          </button>
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

      {warnSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-300 text-xs sm:text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-400" />
          <span>{warnSuccess}</span>
        </div>
      )}

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
          <span>Üye Sunucu & Sicil Denetimi (SADECE KURUCU)</span>
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
          <span>ER:LC Canlı Harita & Safezone Radarı</span>
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
          <span>Çete & Parsel Durumu ({gangsList.length})</span>
        </button>
      </div>

      {/* TAB 1: ÜYE SUNUCU VE SİCİL DENETİMİ (SADECE KURUCU) */}
      {activeTab === 'servers' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs sm:text-sm flex items-start gap-3">
            <Eye className="w-5 h-5 flex-shrink-0 text-purple-400 mt-0.5" />
            <div>
              <strong className="text-white font-bold">Özel Kurucu Yetkisi:</strong> Bu panelde sunucudaki her bir üyenin gerçek uyarı puanını, timeout süresini, ban durumunu ve OAuth2 ile bağlanan üyelerin diğer Discord sunucularını SADECE siz görüntüleyebilirsiniz.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sol Liste: Canlı Üyeler */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Canlı Üye Kayıtları ({filteredMembers.length})
                </span>
              </div>

              {/* Arama Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="İsim, Roblox veya ID ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="max-h-[580px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredMembers.map((user) => {
                  const isSelected = selectedMember?.id === user.id;
                  return (
                    <div
                      key={user.id}
                      onClick={() => setSelectedMember(user)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-600/20'
                          : 'glass-card border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatarUrl}
                          alt={user.nickname}
                          className="w-10 h-10 rounded-full border border-white/10 object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-white text-xs truncate">{user.nickname}</h4>
                            {user.isBanned ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                                YASAKLI
                              </span>
                            ) : user.timeoutRemaining ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                {user.timeoutRemaining}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-[11px] text-gray-400 truncate">Roblox: {user.robloxName}</p>
                          <div className="mt-1 flex items-center justify-between text-[10px] text-gray-400">
                            <span>ID: {user.id}</span>
                            <span className="font-semibold text-purple-300">
                              {user.warningCount} Uyarı • {user.totalPoints} Puan
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sağ Detay Kartı */}
            <div className="lg:col-span-7 space-y-6">
              {selectedMember ? (
                <>
                  <div className="glass-card p-6 rounded-3xl border-white/10 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                      <div className="flex items-center gap-4">
                        <img
                          src={selectedMember.avatarUrl}
                          alt={selectedMember.nickname}
                          className="w-14 h-14 rounded-2xl border-2 border-purple-500/40 object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-white">{selectedMember.nickname}</h3>
                            {selectedMember.staffTitle && (
                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                {selectedMember.staffTitle}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">
                            Kullanıcı Adı: <span className="text-gray-300">@{selectedMember.username}</span> • ID: <code className="text-purple-300">{selectedMember.id}</code>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowWarningModal(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500 transition-all shadow-lg shadow-red-600/30"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Uyarı / Ceza Ver</span>
                      </button>
                    </div>

                    {/* Stat Kutuları */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                        <span className="text-[10px] font-bold text-gray-400 block mb-1">UYARI KADEMESİ</span>
                        <span className="text-base font-black text-amber-400">
                          {selectedMember.warningTier > 0 ? `Kademe ${selectedMember.warningTier}` : 'Temiz (0)'}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                        <span className="text-[10px] font-bold text-gray-400 block mb-1">CEZA PUANI</span>
                        <span className="text-base font-black text-red-400">{selectedMember.totalPoints} / 15 Puan</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                        <span className="text-[10px] font-bold text-gray-400 block mb-1">TIMEOUT DURUMU</span>
                        <span className={`text-xs font-bold block mt-1 ${selectedMember.timeoutRemaining ? 'text-orange-400' : 'text-gray-400'}`}>
                          {selectedMember.timeoutRemaining || 'Yok (Aktif)'}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10">
                        <span className="text-[10px] font-bold text-gray-400 block mb-1">BAN DURUMU</span>
                        <span className={`text-xs font-bold block mt-1 ${selectedMember.isBanned ? 'text-red-400' : 'text-green-400'}`}>
                          {selectedMember.isBanned ? 'Yasaklı (Ban)' : 'Temiz'}
                        </span>
                      </div>
                    </div>

                    {/* Discord Rolleri */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                        Sahip Olduğu Discord Rolleri ({selectedMember.roles.length})
                      </h4>
                      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto custom-scrollbar">
                        {selectedMember.roles.map((rid) => (
                          <span
                            key={rid}
                            className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-[11px] font-mono"
                          >
                            &lt;@&amp;{rid}&gt;
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Sadece Kurucu'ya Özel: Kullanıcının Sunucuları */}
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Server className="w-3.5 h-3.5 text-purple-400" />
                          <span>Bağlı Olduğu Sunucular (Kurucuya Özel İnceleme)</span>
                        </h4>
                        <span className="text-[11px] text-gray-400">OAuth2 İzinli Kayıt</span>
                      </div>

                      <div className="space-y-2">
                        <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                              <span>Piyade Roleplay Topluluğu</span>
                              <span className="px-1.5 py-0.5 rounded bg-green-500/20 text-green-300 text-[9px] font-bold">
                                BİZİM SUNUCUMUZ
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400">ID: 1529545898294509589</span>
                          </div>
                          <span className="text-xs text-purple-300 font-semibold">
                            {selectedMember.staffTitle || 'Whitelist Üye'}
                          </span>
                        </div>

                        {selectedMember.id === session?.id && (
                          <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs text-gray-400">
                            <span>Giriş Yapan Kurucu Hesabı</span>
                            <span className="text-green-400 font-bold">Aktif Oturum Doğrulandı</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="glass-card p-12 text-center text-gray-400 rounded-3xl">
                  Lütfen soldaki listeden bir üye seçin.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ER:LC CANLI HARİTA & RADAR */}
      {activeTab === 'radar' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs sm:text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-400 animate-pulse" />
              <span>
                ER:LC Oyuncu Durumu: <strong>{radarData.players.length} Aktif Oyuncu</strong> (Maks: {radarData.maxPlayers})
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
              {radarData.connected ? 'Canlı Bağlantı Aktif' : 'Discord Radar Takibinde'}
            </span>
          </div>

          <div className="glass-card p-6 rounded-3xl border-white/10">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Şehirdeki Oyuncular & Koordinat Takibi ({radarData.players.length})
            </h3>

            {radarData.players.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {radarData.players.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">🟢 {p.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400">
                        Posta: {p.postal}
                      </span>
                    </div>

                    <div className="text-xs text-gray-400 font-mono">
                      📍 X: {p.x} | Z: {p.z}
                    </div>

                    <div className="text-xs font-semibold">
                      {p.safezone ? (
                        <span className="text-green-400 font-bold">🛡️ {p.safezone}</span>
                      ) : (
                        <span className="text-gray-300">{p.locationText || `${p.street} (No: ${p.building})`}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400 text-xs sm:text-sm">
                Şu anda ER:LC sunucusunda aktif oyuncu bulunmamaktadır veya şehir dinlenme modundadır.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ÇETE PARSEL YÖNETİMİ */}
      {activeTab === 'gangs' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs sm:text-sm">
            Sunucudaki onaylı çetelerin parsel tahsisleri, liderleri (Boss) ve uyarı durumları burada listelenir. 3 uyarı alan çeteler bot tarafından otomatik kapatılır.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gangsList.map((gang) => (
              <div key={gang.id} className="glass-card p-5 rounded-2xl border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white">{gang.name}</h4>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-mono font-bold">
                    Parsel: {gang.parsel}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  Lider (Boss): <span className="text-gray-200 font-semibold">&lt;@{gang.boss}&gt;</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                  <span className="text-gray-400">Uyarı Kademesi:</span>
                  <span className={`font-bold ${gang.warnings >= 2 ? 'text-red-400' : 'text-amber-400'}`}>
                    {gang.warnings} / 3 Uyarı
                  </span>
                </div>
              </div>
            ))}

            {gangsList.length === 0 && (
              <div className="col-span-full glass-card p-12 text-center text-gray-400">
                Şu anda sunucuda kayıtlı aktif çete bulunmuyor veya bot henüz çete oluşturmadı.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Uyarı Verme */}
      {showWarningModal && selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-3xl border-purple-500/30 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <span>Ceza / Uyarı Masası</span>
              </h3>
              <button
                onClick={() => setShowWarningModal(false)}
                className="text-gray-400 hover:text-white text-xs font-bold"
              >
                Kapat
              </button>
            </div>

            <p className="text-xs text-gray-300">
              Hedef: <strong>{selectedMember.nickname}</strong> (&lt;@{selectedMember.id}&gt;)
            </p>

            <form onSubmit={handleKurucuWarning} className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWarnMode('madde')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    warnMode === 'madde' ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  Kural Maddesi ile Uyarı
                </button>
                <button
                  type="button"
                  onClick={() => setWarnMode('sozlu')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    warnMode === 'sozlu' ? 'bg-amber-600 text-white' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  Sözlü Uyarı
                </button>
              </div>

              {warnMode === 'madde' && (
                <div>
                  <label className="text-[11px] font-bold text-gray-400 block mb-1">Kural Maddesi Seçin</label>
                  <select
                    value={warnRuleId}
                    onChange={(e) => setWarnRuleId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs"
                  >
                    {RULES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.id} — {r.description} ({r.points > 0 ? `+${r.points} Puan` : r.special})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-gray-400 block mb-1">Açıklama / Sebep</label>
                <textarea
                  rows={3}
                  value={warnReason}
                  onChange={(e) => setWarnReason(e.target.value)}
                  placeholder="İhlal detayını belirtiniz..."
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder:text-gray-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 block mb-1">Kanıt Linki (Opsiyonel)</label>
                <input
                  type="url"
                  value={warnProof}
                  onChange={(e) => setWarnProof(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder:text-gray-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWarningModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-gray-300 text-xs font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submittingWarn}
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 disabled:opacity-50"
                >
                  {submittingWarn ? 'İşleniyor...' : 'Discord Botuna Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
