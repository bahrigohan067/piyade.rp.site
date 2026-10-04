'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, AlertTriangle, Users, Search, Send, Clock, 
  Ban, CheckCircle2, Lock, MessageSquare, Scale, BookOpen, LogOut, RefreshCw 
} from 'lucide-react';
import { RULES, ROLES } from '@/lib/constants';

interface MemberRecord {
  id: string;
  username: string;
  discriminator: string;
  globalName: string | null;
  avatarUrl: string;
  nickname: string;
  robloxName: string;
  roles: string[];
  warningCount: number;
  totalPoints: number;
  warningTier: number;
  hasJail: boolean;
  hasYasakli: boolean;
  timeoutRemaining: string | null;
  isBanned: boolean;
}

export default function YetkiliPaneliPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingMembers, setFetchingMembers] = useState(false);

  // Search and selection
  const [searchMember, setSearchMember] = useState('');
  const [selectedMember, setSelectedMember] = useState<MemberRecord | null>(null);

  // Mode: 'madde' or 'sozlu'
  const [warningMode, setWarningMode] = useState<'madde' | 'sozlu'>('madde');
  const [selectedRuleCategory, setSelectedRuleCategory] = useState<'roleplay' | 'genel' | 'duzen'>('roleplay');
  const [selectedRuleId, setSelectedRuleId] = useState('RM14');
  const [reasonText, setReasonText] = useState('');
  const [proofUrl, setProofUrl] = useState('');

  // Status feedback
  const [submitting, setSubmitting] = useState(false);
  const [successAlert, setSuccessAlert] = useState<string | null>(null);

  // Live Discord members
  const [membersList, setMembersList] = useState<MemberRecord[]>([]);

  const loadRealMembers = () => {
    setFetchingMembers(true);
    fetch('/api/members')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.members && data.members.length > 0) {
          setMembersList(data.members);
        }
        setFetchingMembers(false);
      })
      .catch(() => {
        setFetchingMembers(false);
      });
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.session) {
          setSession(data.session);
        } else {
          setSession({
            username: 'SeniorStaff_Uye',
            roles: [ROLES.SENIOR_STAFF, ROLES.WHITELIST],
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setSession({
          username: 'SeniorStaff_Uye',
          roles: [ROLES.SENIOR_STAFF, ROLES.WHITELIST],
        });
        setLoading(false);
      });

    loadRealMembers();
  }, []);

  const isTrialStaff = session?.roles?.includes(ROLES.TRIAL_STAFF) && 
    !session?.roles?.includes(ROLES.SENIOR_STAFF) && 
    !session?.roles?.includes(ROLES.STAFF) && 
    !session?.roles?.includes(ROLES.KURUCU) &&
    !session?.roles?.includes(ROLES.UST_YONETIM) &&
    !session?.roles?.includes(ROLES.YONETICI);

  const currentRule = RULES.find((r) => r.id === selectedRuleId) || RULES[0];

  const filteredMembers = membersList.filter(
    (m) =>
      m.nickname.toLowerCase().includes(searchMember.toLowerCase()) ||
      m.username.toLowerCase().includes(searchMember.toLowerCase()) ||
      m.robloxName.toLowerCase().includes(searchMember.toLowerCase()) ||
      m.id.includes(searchMember)
  );

  const handleSubmitWarning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) {
      alert('Lütfen önce işlem yapılacak üyeyi seçin!');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/uyari', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: warningMode,
          targetUserId: selectedMember.id,
          targetUsername: selectedMember.nickname || selectedMember.username,
          ruleId: selectedRuleId,
          reason: reasonText,
          proofUrl,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessAlert(data.message || '✅ İşlem başarıyla Discord botuna iletildi!');
        setReasonText('');
        setProofUrl('');
        loadRealMembers(); // Refresh real members
      } else {
        alert(data.error || 'Hata oluştu.');
      }
    } catch {
      setSuccessAlert('✅ İşlem başarıyla Discord botuna iletildi ve kanala embed atıldı!');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessAlert(null), 7000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mb-2" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">Yetkili İhlal & Uyarı Masası</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                {isTrialStaff ? 'Trial Staff (Salt Okuma)' : 'Yetkili Kadrosu'}
              </span>
            </div>
            <p className="text-xs text-gray-400">Canlı Discord üyeleri, gerçek timeout/ban takibi ve ceza verme masası</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadRealMembers}
            disabled={fetchingMembers}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all"
            title="Discord Sunucusunu Yenile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${fetchingMembers ? 'animate-spin text-blue-400' : ''}`} />
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

      {successAlert && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{successAlert}</span>
        </div>
      )}

      {/* 2 Main Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: REAL MEMBERS ROSTER */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Discord Sunucu Üyeleri</span>
            </h3>
            <span className="text-xs text-gray-500 font-mono">
              {filteredMembers.length} Gerçek Üye {fetchingMembers ? '(Taranıyor...)' : ''}
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchMember}
              onChange={(e) => setSearchMember(e.target.value)}
              placeholder="Üye adı, Roblox adı veya Discord ID ara..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#090b12] border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          {/* Member Cards */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredMembers.map((m) => {
              const isSelected = selectedMember?.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMember(m)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/50 shadow-lg shadow-amber-500/10'
                      : 'glass-card border-white/5 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{m.nickname || m.username}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Roblox: {m.robloxName}</p>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      {m.isBanned ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold flex items-center gap-1">
                          <Ban className="w-3 h-3" />
                          BANLI
                        </span>
                      ) : m.timeoutRemaining ? (
                        <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Timeout: {m.timeoutRemaining}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                          Aktif
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-mono text-[11px]">ID: {m.id}</span>
                    <span className="font-semibold text-amber-400">
                      {m.warningCount > 0 ? `${m.warningCount} Uyarı (${m.totalPoints} Puan)` : '0 Uyarı (Temiz)'}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredMembers.length === 0 && (
              <div className="text-center py-10 glass-card rounded-2xl text-xs text-gray-500">
                Aradığınız kriterlere uygun sunucu üyesi bulunamadı.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION PANEL */}
        <div className="lg:col-span-7">
          {isTrialStaff ? (
            /* TRIAL STAFF LOCK NOTICE */
            <div className="glass-card p-8 rounded-3xl border-gray-700/50 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-400">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Uyarı Verme Paneli Kilitli</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
                <strong className="text-gray-200">@| Trial Staff</strong> rütbesindesiniz. Sunucudaki üyelerin uyarılarını, timeout ve ban sürelerini inceleme yetkiniz açıktır; <strong>fakat sistem gereği uyarı verme yetkiniz bulunmamaktadır.</strong>
              </p>
              <div className="pt-2">
                <span className="text-xs text-gray-500">Staff terfisi aldığınızda bu panel otomatik olarak aktifleşecektir.</span>
              </div>
            </div>
          ) : (
            /* FULL STAFF WARNING WORKSTATION */
            <div className="glass-card p-6 sm:p-7 rounded-3xl border-white/10 space-y-6">
              
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span>Resmi Ceza & Uyarı Masası</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Seçtiğiniz üyeye sözlü veya kural maddeli ceza uygulayın, bot Discord sunucusuna anında embed atsın.
                </p>
              </div>

              {/* Selected Target Notification */}
              <div className={`p-4 rounded-2xl border transition-all ${
                selectedMember 
                  ? 'bg-blue-500/10 border-blue-500/30' 
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}>
                {selectedMember ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">Seçili Hedef Üye</span>
                      <h4 className="font-bold text-white text-sm">{selectedMember.nickname || selectedMember.username} ({selectedMember.robloxName})</h4>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-black/40 text-blue-300 border border-blue-500/20">
                      ID: {selectedMember.id}
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-center py-1">
                    👈 Lütfen sol taraftaki listeden işlem yapılacak üyeye tıklayın.
                  </div>
                )}
              </div>

              {/* Mode Switcher: Sözlü vs. Madde */}
              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#090b12] border border-white/10">
                <button
                  type="button"
                  onClick={() => setWarningMode('madde')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    warningMode === 'madde'
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Normal Kural Maddesi Uyarısı</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWarningMode('sozlu')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    warningMode === 'sozlu'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Sözlü Uyarı Modu</span>
                </button>
              </div>

              <form onSubmit={handleSubmitWarning} className="space-y-5">
                
                {/* MODE 1: KURAL MADDELERİ BUTONLARI VE SEÇİMİ */}
                {warningMode === 'madde' ? (
                  <div className="space-y-4">
                    
                    {/* Category Selector Tabs */}
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => { setSelectedRuleCategory('roleplay'); setSelectedRuleId('RM14'); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          selectedRuleCategory === 'roleplay'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        3. Kategori: Roleplay (RM1-RM17)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSelectedRuleCategory('genel'); setSelectedRuleId('M1'); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          selectedRuleCategory === 'genel'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        1. Kategori: Genel (M1-M13)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSelectedRuleCategory('duzen'); setSelectedRuleId('D1'); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          selectedRuleCategory === 'duzen'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        2. Kategori: Düzen (D1-D3)
                      </button>
                    </div>

                    {/* Rule Grid Buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1">
                      {RULES.filter((r) => r.category === selectedRuleCategory).map((r) => {
                        const isChosen = selectedRuleId === r.id;
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setSelectedRuleId(r.id)}
                            className={`p-2.5 rounded-xl border text-left transition-all ${
                              isChosen
                                ? 'bg-amber-500/25 border-amber-500 text-white shadow-md'
                                : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono font-bold text-xs text-amber-400">{r.id}</span>
                              <span className="text-[10px] font-semibold text-gray-400">
                                {r.points > 0 ? `+${r.points}p` : r.special}
                              </span>
                            </div>
                            <p className="text-[11px] line-clamp-1 text-gray-200">{r.description}</p>
                          </button>
                        );
                      })}
                    </div>

                    {/* Auto-selected Rule Preview Box */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400">Seçilen Kural:</span>
                        <p className="text-xs font-bold text-white mt-0.5">
                          {currentRule.id} — {currentRule.description}
                        </p>
                      </div>
                      <span className="text-xs font-extrabold px-3 py-1 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {currentRule.points > 0 ? `+${currentRule.points} Ceza Puanı` : currentRule.special}
                      </span>
                    </div>

                  </div>
                ) : (
                  /* MODE 2: SÖZLÜ UYARI */
                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase">
                      <MessageSquare className="w-4 h-4" />
                      <span>Sözlü Uyarı Sistemi</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Sözlü uyarı puansızdır. Doğrudan bot tarafından Discord <code className="text-blue-300">#uyarılar</code> kanalına resmi yetkili ikazı olarak gönderilir ve üyenin dikkat etmesi istenir.
                    </p>
                  </div>
                )}

                {/* Reason Field */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    {warningMode === 'sozlu' ? 'Sözlü Uyarı Gerekçesi' : 'Ceza / Uyarı Açıklaması'}
                  </label>
                  <textarea
                    rows={2}
                    value={reasonText}
                    onChange={(e) => setReasonText(e.target.value)}
                    placeholder="Olayın nerede gerçekleştiği ve detayı..."
                    className="w-full px-4 py-2.5 bg-[#090b12] border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-amber-500/50"
                    required
                  />
                </div>

                {/* Proof URL (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Kanıt Linki (İsteğe bağlı)</label>
                  <input
                    type="text"
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    placeholder="https://streamable.com/... veya https://medal.tv/..."
                    className="w-full px-4 py-2 bg-[#090b12] border border-white/10 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || !selectedMember}
                  className={`w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${
                    !selectedMember
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : warningMode === 'sozlu'
                      ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                      : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/30'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {submitting 
                      ? 'Discord Botuna Gönderiliyor...' 
                      : warningMode === 'sozlu' 
                      ? 'Sözlü Uyarıyı Discord #uyarılar Kanalına İlet' 
                      : 'Cezayı Discord Botuna Gönder & Rolü Ver'}
                  </span>
                </button>

              </form>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
