'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import RadarSection from '@/components/RadarSection';
import RulesSection from '@/components/RulesSection';
import Footer from '@/components/Footer';
import UserPanelModal from '@/components/UserPanelModal';
import StaffPanelModal from '@/components/StaffPanelModal';
import AdminPanelModal from '@/components/AdminPanelModal';

export default function Home() {
  const [activeModal, setActiveModal] = useState<'user' | 'staff' | 'admin' | null>(null);

  return (
    <main className="min-h-screen relative flex flex-col justify-between">
      {/* Top Navigation */}
      <Navbar 
        onOpenDemo={(type) => setActiveModal(type)}
        onOpenRules={() => {
          const el = document.getElementById('kurallar');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Content Sections */}
      <div>
        <Hero onOpenDemo={(type) => setActiveModal(type)} />
        <RadarSection onOpenAdmin={() => setActiveModal('admin')} />
        <RulesSection />
      </div>

      {/* Footer */}
      <Footer />

      {/* Interactive Modals */}
      <UserPanelModal 
        isOpen={activeModal === 'user'} 
        onClose={() => setActiveModal(null)} 
      />

      <StaffPanelModal 
        isOpen={activeModal === 'staff'} 
        onClose={() => setActiveModal(null)} 
      />

      <AdminPanelModal 
        isOpen={activeModal === 'admin'} 
        onClose={() => setActiveModal(null)} 
      />
    </main>
  );
}
