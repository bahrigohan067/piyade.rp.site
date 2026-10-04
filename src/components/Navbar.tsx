'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, LogIn, ExternalLink, Menu, X, BookOpen, FileText } from 'lucide-react';
import { DISCORD_INVITE_URL } from '@/lib/constants';

interface NavbarProps {
  onOpenRules?: () => void;
}

export default function Navbar({ onOpenRules }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [erlcData, setErlcData] = useState<{
    players: string;
    rpActive: boolean;
    rpLabel: string;
  }>({
    players: '24/32 Oyuncu • 3 Sırada',
    rpActive: true,
    rpLabel: 'ROL AKTİF (RP BAŞLADI)',
  });

  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.erlc) {
          setErlcData({
            players: data.erlc.statusText || '24/32 Oyuncu • 3 Sırada',
            rpActive: data.rpStatus?.active ?? true,
            rpLabel: data.rpStatus?.label || 'ROL AKTİF (RP BAŞLADI)',
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand -> DIRECT LINK TO DISCORD SERVER */}
          <a 
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Piyade RP Resmi Discord Sunucusuna Katıl"
            className="flex items-center gap-3 group"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/50 transition-all duration-300">
              <div className="w-full h-full bg-[#0d0f17] rounded-[11px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-wider text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  PİYADE<span className="text-blue-500">.RP</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-400 transition-colors" />
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  ER:LC
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium tracking-tight">Discord Sunucusuna Doğrudan Bağlan</p>
            </div>
          </a>

          {/* Center Navigation: Only Public Information (Rules & Terms) */}
          <div className="hidden md:flex items-center gap-3">
            <a 
              href="#terimler" 
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <FileText className="w-4 h-4 text-purple-400" />
              <span>RP Terimleri</span>
            </a>

            <a 
              href="#kurallar" 
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Sunucu Kuralları</span>
            </a>
          </div>

          {/* Right Status Badges & Discord Login Button */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* ER:LC Canlı Oyuncu & Sıra Göstergesi */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>👥 {erlcData.players}</span>
            </div>

            {/* Sunucu Durumu (RP Aktif / Pasif) */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              erlcData.rpActive 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-gray-800/50 border-gray-700/50 text-gray-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                erlcData.rpActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'
              }`} />
              <span>{erlcData.rpLabel}</span>
            </div>

            {/* Discord ile Giriş Yap Butonu */}
            <Link
              href="/api/auth/discord"
              className="relative group overflow-hidden rounded-xl p-[1px] font-semibold text-sm transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-xl group-hover:opacity-100 opacity-80 blur-[2px] transition-opacity" />
              <div className="relative px-5 py-2.5 rounded-[11px] bg-[#0c0e17] text-white flex items-center gap-2 group-hover:bg-[#111422] transition-colors">
                <LogIn className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                <span>Discord ile Giriş Yap</span>
              </div>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card border-t border-white/10 px-4 pt-3 pb-6 space-y-3">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 font-semibold">
            👥 ER:LC: {erlcData.players}
          </div>
          <div className={`p-3 rounded-xl text-xs font-bold border ${
            erlcData.rpActive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-gray-800/50 border-gray-700/50 text-gray-400'
          }`}>
            {erlcData.rpLabel}
          </div>
          <a
            href="#terimler"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-white/5"
          >
            <FileText className="w-4 h-4 text-purple-400" />
            <span>RP Terimleri</span>
          </a>
          <a
            href="#kurallar"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-white/5"
          >
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>Sunucu Kuralları</span>
          </a>
          <div className="pt-2">
            <Link
              href="/api/auth/discord"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Discord ile Giriş Yap</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
