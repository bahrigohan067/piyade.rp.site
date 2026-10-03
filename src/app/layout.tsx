import type { Metadata } from 'next';
import './globals.css';
import AnimatedBackground from '@/components/AnimatedBackground';

export const metadata: Metadata = {
  title: 'Piyade RP • Roblox ER:LC Resmi Web Portalı & Yönetim Paneli',
  description: 'Piyade Roleplay resmi web sitesi. Sunucu kuralları, canlı ER:LC oyuncu radarı, oyuncu sicil kartı ve yetkili ceza yönetim masası.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark scroll-smooth">
      <body className="bg-[#07080c] text-white min-h-screen antialiased selection:bg-blue-500/30 selection:text-blue-200">
        <AnimatedBackground />
        {children}
      </body>
    </html>
  );
}
