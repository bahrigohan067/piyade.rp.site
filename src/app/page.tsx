'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TermsSection from '@/components/TermsSection';
import RulesSection from '@/components/RulesSection';
import FaqSection from '@/components/FaqSection';
import Footer from '@/components/Footer';
import IntroAudio from '@/components/IntroAudio';

export default function Home() {
  return (
    <main className="min-h-screen relative flex flex-col justify-between">
      {/* Intro Sound (Sadece ana sayfada, 1 kez, girişte çalar) */}
      <IntroAudio />

      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <div>
        <Hero />
        <TermsSection />
        <RulesSection />
        <FaqSection />
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
