'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TermsSection from '@/components/TermsSection';
import RulesSection from '@/components/RulesSection';
import FaqSection from '@/components/FaqSection';
import Footer from '@/components/Footer';

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
        <FaqSection />
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
