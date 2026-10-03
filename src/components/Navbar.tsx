'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Radio, Terminal, Users, LogIn, Menu, X, BookOpen, AlertTriangle } from 'lucide-react';

interface NavbarProps {
  onOpenRules?: () => void;
  onOpenDemo?: (type: 'user' | 'staff' | 'admin') => void;
}

export default function Navbar({ onOpenRules, onOpenDemo }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
              <div className="w-full h-full bg-[#0d0f17] rounded-[11px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-wider text-white group-hover:text-blue-400 transition-colors">
                  PİYADE<span className="text-blue-500">.RP</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  ER:LC
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium tracking-tight">Liberty County Taktik Rol Sunucusu</p>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <a 
              href="#kurallar" 
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Kurallar</span>
            </a>

            <button 
              onClick={() => onOpenDemo && onOpenDemo('user')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Oyuncu Paneli</span>
            </button>

            <button 
              onClick={() => onOpenDemo && onOpenDemo('staff')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Yetkili Paneli</span>
            </button>

            <button 
              onClick={() => onOpenDemo && onOpenDemo('admin')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>Özel Yönetim</span>
            </button>

            <a 
              href="#radar" 
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <Radio className="w-4 h-4 text-red-400 animate-pulse" />
              <span>Canlı Radar</span>
            </a>
          </div>

          {/* Live Status Pill & Login Button */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>ER:LC Canlı</span>
            </div>

            <button 
              onClick={() => onOpenDemo && onOpenDemo('user')}
              className="relative group overflow-hidden rounded-xl p-[1px] font-semibold text-sm transition-all duration-300"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-xl group-hover:opacity-100 opacity-80 blur-[2px] transition-opacity" />
              <div className="relative px-5 py-2.5 rounded-[11px] bg-[#0c0e17] text-white flex items-center gap-2 group-hover:bg-[#111422] transition-colors">
                <LogIn className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                <span>Discord ile Giriş</span>
              </div>
            </button>
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
        <div className="md:hidden glass-card border-t border-white/10 px-4 pt-3 pb-6 space-y-2">
          <a
            href="#kurallar"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-200 hover:bg-white/5"
          >
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>Kurallar</span>
          </a>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenDemo && onOpenDemo('user'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-200 hover:bg-white/5 text-left"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Oyuncu Paneli</span>
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenDemo && onOpenDemo('staff'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-200 hover:bg-white/5 text-left"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Yetkili Paneli (Uyarı Gir)</span>
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenDemo && onOpenDemo('admin'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-200 hover:bg-white/5 text-left"
          >
            <Terminal className="w-4 h-4 text-purple-400" />
            <span>Özel Yönetim Paneli</span>
          </button>
          <a
            href="#radar"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-200 hover:bg-white/5"
          >
            <Radio className="w-4 h-4 text-red-400" />
            <span>Canlı Radar</span>
          </a>
          <div className="pt-2">
            <button
              onClick={() => { setMobileMenuOpen(false); onOpenDemo && onOpenDemo('user'); }}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Discord ile Giriş Yap</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
