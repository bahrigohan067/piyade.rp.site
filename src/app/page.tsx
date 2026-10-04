'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TermsSection from '@/components/TermsSection';
import RulesSection from '@/components/RulesSection';
import Footer from '@/components/Footer';
import { Key } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen relative flex flex-col justify-between">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <div>
        <Hero />
        <TermsSection />
        <RulesSection />
      </div>

      {/* Quick Role Tester / Switcher Bar at Bottom */}
      <div className="py-4 bg-[#0a0c14] border-t border-white/10 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Piyade RP 2.0 • Yetki ve Rol Tabanlı Panel Sistemi</span>
          </div>

          <Link
            href="/auth/select-role"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 font-bold transition-all"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Tüm Rol Panellerini Önizle & Test Et (Kurucu, Staff, Whitelist, İllegal) ➔</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
