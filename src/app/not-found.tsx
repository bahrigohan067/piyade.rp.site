import React from 'react';
import Link from 'next/link';
import { Shield, Home, ExternalLink } from 'lucide-react';
import { DISCORD_INVITE_URL } from '@/lib/constants';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07080c] flex items-center justify-center p-4 selection:bg-blue-500/30 selection:text-blue-200">
      <div className="glass-card p-8 sm:p-12 rounded-3xl border-white/10 max-w-lg w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-600/20 blur-3xl rounded-full pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
          <Shield className="w-8 h-8" />
        </div>

        <div>
          <span className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            404
          </span>
          <h1 className="text-2xl font-black text-white mt-2">Sayfa Bulunamadı</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
            Aradığınız sayfa silinmiş, adı değiştirilmiş veya taşınmış olabilir. Piyade Roleplay ana sayfasına dönerek devam edebilirsiniz.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
          >
            <Home className="w-4 h-4" />
            <span>Ana Sayfaya Dön</span>
          </Link>

          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>Discord Sunucumuz</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
