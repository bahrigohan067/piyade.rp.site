'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ExternalLink } from 'lucide-react';
import { DISCORD_INVITE_URL } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 glass-card relative z-10" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                title="Piyade RP Discord Sunucusu"
                className="font-extrabold text-lg text-white hover:text-blue-400 transition-colors inline-flex items-center gap-1.5"
              >
                <span>PİYADE<span className="text-blue-500">.RP</span></span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
              </a>
              <p className="text-xs text-gray-500">Roblox ER:LC Liberty County Taktik Rol Topluluğu</p>
            </div>
          </div>

          {/* Links */}
          <nav aria-label="Footer Navigasyon" className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-gray-400 font-medium">
            <a href="#kurallar" className="hover:text-white transition-colors">Kurallar</a>
            <span className="text-gray-700">•</span>
            <a href="#terimler" className="hover:text-white transition-colors">RP Terimleri</a>
            <span className="text-gray-700">•</span>
            <a href="#sss" className="hover:text-white transition-colors">S.S.S.</a>
            <span className="text-gray-700">•</span>
            <Link href="/gizlilik-politikasi" className="hover:text-white transition-colors">Gizlilik Politikası</Link>
            <span className="text-gray-700">•</span>
            <Link href="/kullanim-sartlari" className="hover:text-white transition-colors">Kullanım Şartları</Link>
          </nav>

          {/* Copyright */}
          <div className="text-xs text-gray-500 text-center md:text-right space-y-1">
            <p>© 2026 Piyade RP. Tüm hakları saklıdır.</p>
            <p className="text-[10px] text-gray-600">Discord Bot & ER:LC Live Sync</p>
          </div>

        </div>
      </div>
    </footer>
  );
}
