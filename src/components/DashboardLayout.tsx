'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Shield, ExternalLink } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';
import { DISCORD_INVITE_URL } from '@/lib/constants';

interface DashboardLayoutProps {
  session: any;
  children: React.ReactNode;
}

export default function DashboardLayout({ session, children }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07090e] text-gray-100 flex flex-col lg:flex-row">
      
      {/* 1. Desktop Sabit Sol Menü */}
      <div className="hidden lg:flex fixed inset-y-0 left-0 w-72 z-50">
        <DashboardSidebar session={session} />
      </div>

      {/* 2. Mobil Üst Çubuk (Mobile Header) */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0a0c14]/95 border-b border-white/10 backdrop-blur-xl">
        <a
          href={DISCORD_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <span className="font-extrabold text-sm tracking-wider text-white">
            PİYADE<span className="text-blue-500">.RP</span>
          </span>
        </a>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* 3. Mobil Sol Menü Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer Content */}
          <div className="relative z-10 w-72 h-full shadow-2xl">
            <DashboardSidebar session={session} onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* 4. Ana Sayfa İçerik Alanı (Desktop'ta Sol Menünün Genişliği Kadar Padding Bırakır) */}
      <main className="flex-1 lg:pl-72 flex flex-col min-h-screen w-full">
        {children}
      </main>

    </div>
  );
}
