'use client';

import React from 'react';
import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 glass-card relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white">
                PİYADE<span className="text-blue-500">.RP</span>
              </span>
              <p className="text-xs text-gray-500">Roblox ER:LC Liberty County Taktik Rol Topluluğu</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-400 font-medium">
            <a href="#kurallar" className="hover:text-white transition-colors">Kurallar</a>
            <span className="text-gray-700">•</span>
            <a href="#radar" className="hover:text-white transition-colors">Canlı Radar</a>
            <span className="text-gray-700">•</span>
            <span className="text-gray-500">Discord Bot Entegreli</span>
          </div>

          <div className="text-xs text-gray-500 text-center md:text-right">
            © 2026 Piyade RP. Tüm hakları saklıdır.
          </div>

        </div>
      </div>
    </footer>
  );
}
