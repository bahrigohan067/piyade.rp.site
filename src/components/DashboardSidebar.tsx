'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Shield, Users, AlertTriangle, Terminal, UserPlus, 
  Radio, BookOpen, LogOut, ChevronRight, ExternalLink,
  Flame, Lock, Award, Activity, Compass, Menu, X, Sparkles, User
} from 'lucide-react';
import { DISCORD_INVITE_URL, ROLES } from '@/lib/constants';
import { getUserRoleLevel } from '@/lib/roles';

interface DashboardSidebarProps {
  session: any;
  currentPath?: string;
  onCloseMobile?: () => void;
}

export default function DashboardSidebar({ session, currentPath, onCloseMobile }: DashboardSidebarProps) {
  const pathname = usePathname() || currentPath || '';

  // Real-time server and RP status
  const [statusData, setStatusData] = useState<{
    erlcText: string;
    rpActive: boolean;
    rpLabel: string;
  }>({
    erlcText: 'Yükleniyor...',
    rpActive: false,
    rpLabel: 'ROL PASİF',
  });

  useEffect(() => {
    fetch('/api/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setStatusData({
            erlcText: data.erlc?.statusText || '24/32 Oyuncu',
            rpActive: data.rpStatus?.active ?? false,
            rpLabel: data.rpStatus?.label || 'ROL PASİF',
          });
        }
      })
      .catch(() => {});
  }, []);

  const roles: string[] = session?.roles || [];
  const roleLevel = getUserRoleLevel(roles);

  // Determine user title and styling
  let roleTitle = 'Kayıtsız Üye';
  let roleGradient = 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-300';
  let roleIcon = UserPlus;

  if (roleLevel.isKurucu) {
    roleTitle = '👑 Kurucu (Owner)';
    roleGradient = 'from-purple-500/20 to-indigo-500/10 border-purple-500/40 text-purple-300 shadow-lg shadow-purple-500/10';
    roleIcon = Terminal;
  } else if (roleLevel.isUstYonetim) {
    roleTitle = '👤 Üst Yönetim';
    roleGradient = 'from-red-500/20 to-orange-500/10 border-red-500/40 text-red-300';
    roleIcon = Shield;
  } else if (roleLevel.isYonetici) {
    roleTitle = '💎 Yönetici';
    roleGradient = 'from-blue-500/20 to-cyan-500/10 border-blue-500/40 text-blue-300';
    roleIcon = Shield;
  } else if (roleLevel.isSeniorStaff) {
    roleTitle = '⚡ Senior Staff';
    roleGradient = 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-300';
    roleIcon = AlertTriangle;
  } else if (roleLevel.isStaff) {
    roleTitle = '🛡️ Staff';
    roleGradient = 'from-amber-500/15 to-yellow-500/10 border-amber-500/30 text-amber-400';
    roleIcon = Shield;
  } else if (roleLevel.isTrialStaff) {
    roleTitle = '🔰 Trial Staff';
    roleGradient = 'from-gray-600/20 to-gray-700/10 border-gray-500/30 text-gray-300';
    roleIcon = Lock;
  } else if (roleLevel.isWhitelist) {
    roleTitle = '✅ Whitelist Oyuncu';
    roleGradient = 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300';
    roleIcon = Users;
  }

  const RoleIconComp = roleIcon;

  return (
    <aside className="w-72 h-full flex flex-col justify-between bg-[#0a0c14]/95 border-r border-white/10 text-gray-300 backdrop-blur-2xl">
      
      {/* 1. Üst Kısım: Sunucu Başlığı & Durum */}
      <div>
        {/* Brand Link to Discord */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Piyade RP Resmi Discord Sunucusuna Git"
            className="flex items-center gap-3 group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
              <div className="w-full h-full bg-[#0d0f17] rounded-[11px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-wider text-white group-hover:text-blue-400 transition-colors">
                  PİYADE<span className="text-blue-500">.RP</span>
                </span>
                <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-blue-400 transition-colors" />
              </div>
              <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Discord & Web Portalı</p>
            </div>
          </a>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Canlı Sunucu Durumu & ER:LC Oyuncu Barı */}
        <div className="px-4 py-3 mx-4 my-3 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          {/* RP Durumu */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 text-[11px]">Rol Durumu:</span>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold ${
              statusData.rpActive 
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                : 'bg-gray-800/60 border-gray-700/50 text-gray-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                statusData.rpActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'
              }`} />
              <span>{statusData.rpActive ? 'AKTİF (ROLDE)' : 'PASİF'}</span>
            </div>
          </div>

          {/* ER:LC Oyuncu Sayısı */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 text-[11px]">ER:LC Sunucu:</span>
            <span className="text-[11px] font-mono text-blue-300 font-semibold">{statusData.erlcText}</span>
          </div>
        </div>

        {/* Kullanıcı Kimlik Kartı */}
        <div className="px-4 py-3 mx-4 mb-4 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10">
          <div className="flex items-center gap-3">
            {session?.avatar ? (
              <img
                src={`https://cdn.discordapp.com/avatars/${session.id}/${session.avatar}.png?size=96`}
                alt={session.username}
                className="w-10 h-10 rounded-xl border border-white/15 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-white text-sm">
                {session?.username ? session.username.slice(0, 2).toUpperCase() : 'RP'}
              </div>
            )}
            <div className="overflow-hidden flex-1">
              <h4 className="font-bold text-white text-xs truncate">
                {session?.roblox_username || session?.username || 'Misafir Oyuncu'}
              </h4>
              <p className="text-[10px] text-gray-400 font-mono truncate">
                @{session?.username || 'discord'}
              </p>
            </div>
          </div>

          {/* En Yüksek Rol Rozeti */}
          <div className={`mt-2.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 ${roleGradient}`}>
            <RoleIconComp className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{roleTitle}</span>
          </div>
        </div>

        {/* 2. Orta Kısım: SADECE YETKİSİ OLAN KANALLAR / BUTONLAR */}
        <div className="px-3 space-y-5 overflow-y-auto max-h-[calc(100vh-380px)] custom-scrollbar">
          
          {/* A) KAYIT MASASI: Kayıtsız üye ise SADECE bu kategori görünür */}
          {roleLevel.onlyRegistration && (
            <div>
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-amber-400/80 block mb-1.5">
                Kayıt Masası
              </span>
              <Link
                href="/kayit"
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pathname.startsWith('/kayit')
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-600/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  <span>Kayıt & Başvuru Formu</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
              </Link>
            </div>
          )}

          {/* B) OYUNCU KANALLARI: Whitelist veya Staff ise görünür */}
          {!roleLevel.onlyRegistration && (roleLevel.isWhitelist || roleLevel.isStaffAny) && (
            <div>
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                Oyuncu Masası
              </span>
              <div className="space-y-1">
                <Link
                  href="/panel"
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/panel'
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-600/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-blue-400" />
                    <div>
                      <span>Oyuncu Paneli</span>
                      <p className="text-[10px] font-normal text-gray-400">Sicil, Ceza & Rollerim</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                </Link>
              </div>
            </div>
          )}

          {/* C) YETKİLİ MERKEZİ: SADECE Yetkili Rolüne Sahip Olanlar Görür */}
          {roleLevel.canViewAllMembers && (
            <div>
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1.5">
                Yetkili Masası
              </span>
              <div className="space-y-1">
                <Link
                  href="/yetkili"
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/yetkili'
                      ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-600/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <div>
                      <span>Yetkili Masası</span>
                      <p className="text-[10px] font-normal text-gray-400">Tüm Üyeler, Timeout, Ban</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                </Link>

                {/* SADECE UYARI VERME YETKİSİ OLANLAR (Trial Staff GÖREMEZ!) */}
                {roleLevel.canIssueWarning && (
                  <Link
                    href="/yetkili#uyari"
                    onClick={onCloseMobile}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-200 hover:text-white hover:bg-amber-500/10 border border-amber-500/20 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <div>
                        <span>Ceza & Uyarı Yaz</span>
                        <p className="text-[10px] font-normal text-amber-400/70">M1-M17 & Sözlü İhlal</p>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[9px] text-amber-300">Aktif</span>
                  </Link>
                )}

                {/* Canlı Radar (Yönetici, Üst Yönetim, Kurucu) */}
                {(roleLevel.isKurucu || roleLevel.isUstYonetim || roleLevel.isYonetici) && (
                  <Link
                    href={roleLevel.isKurucu ? '/kurucu#radar' : '/yetkili#radar'}
                    onClick={onCloseMobile}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-cyan-300 hover:text-white hover:bg-cyan-500/10 border border-cyan-500/20 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <div>
                        <span>Canlı Radar & Safezone</span>
                        <p className="text-[10px] font-normal text-cyan-400/70">Koordinat & Bölge</p>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-[9px] text-cyan-300">Live</span>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* D) KURUCU ÖZEL TERMİNALİ: SADECE @| Kurucu Rolüne Sahip Olan Görür! */}
          {roleLevel.isKurucu && (
            <div>
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-1.5">
                Kurucu Özel Masası
              </span>
              <Link
                href="/kurucu"
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pathname === '/kurucu'
                    ? 'bg-purple-600/25 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-600/20'
                    : 'text-purple-300/80 hover:text-purple-200 hover:bg-purple-500/10 border border-purple-500/20'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <div>
                    <span>Kurucu Terminali</span>
                    <p className="text-[10px] font-normal text-purple-400/70">Diğer Sunucular & Tam Yetki</p>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-purple-500/30 text-[9px] text-purple-200 font-extrabold">👑 SADECE KURUCU</span>
              </Link>
            </div>
          )}

        </div>
      </div>

      {/* 3. Alt Kısım: Genel Kurallar & Çıkış Yap */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          href="/#kurallar"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span>Sunucu Kuralları & Terimler</span>
        </Link>

        <Link
          href="/api/auth/logout"
          onClick={() => {
            try {
              localStorage.removeItem('piyade_session');
              localStorage.removeItem('piyade_token');
              localStorage.removeItem('piyade_user_id');
            } catch {}
            if (onCloseMobile) onCloseMobile();
          }}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span>Oturumu Kapat</span>
        </Link>
      </div>

    </aside>
  );
}
