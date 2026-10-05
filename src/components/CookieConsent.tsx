'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Cookie, X, Check } from 'lucide-react';

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    try {
      const consentGiven = localStorage.getItem('piyade_cookie_consent');
      if (!consentGiven) {
        setShowConsent(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('piyade_cookie_consent', 'accepted');
    } catch {}
    setShowConsent(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem('piyade_cookie_consent', 'essential_only');
    } catch {}
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div
      role="region"
      aria-label="Çerez Onayı Bildirimi"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="glass-card p-5 rounded-2xl border-blue-500/30 bg-[#0d0f17]/95 shadow-2xl backdrop-blur-xl text-xs space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Cookie className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span>Çerez ve Oturum Bildirimi</span>
          </div>
          <button
            onClick={handleDecline}
            aria-label="Çerez bildirimini kapat"
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-gray-300 leading-relaxed text-[11px]">
          Piyade Roleplay, yalnızca Discord hesabınızla güvenli oturum açabilmeniz ve yetki kontrollerinizi gerçekleştirebilmeniz için gerekli teknik çerezleri (<code className="text-blue-300 font-mono">piyade_session</code>) kullanır. Reklam ve izleme çerezi barındırmayız.{' '}
          <Link href="/gizlilik-politikasi" className="text-blue-400 underline hover:text-blue-300">
            Gizlilik Politikamızı inceleyin.
          </Link>
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleAccept}
            className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Kabul Et</span>
          </button>
          <button
            onClick={handleDecline}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-medium text-xs transition-colors"
          >
            Yalnızca Zorunlu
          </button>
        </div>
      </div>
    </div>
  );
}
