import type { Metadata, Viewport } from 'next';
import './globals.css';
import AnimatedBackground from '@/components/AnimatedBackground';
import CookieConsent from '@/components/CookieConsent';

export const viewport: Viewport = {
  themeColor: '#07080c',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://piyade-rp.up.railway.app'),
  title: {
    default: 'Piyade RP • Roblox ER:LC Resmi Web Portalı & Yönetim Paneli',
    template: '%s | Piyade RP',
  },
  description:
    'Piyade Roleplay resmi web sitesi. Sunucu kuralları, canlı ER:LC oyuncu radarı, oyuncu sicil kartı, kayıt masası ve Discord yetkili yönetim merkezi.',
  keywords: [
    'Piyade RP',
    'Roblox ER:LC',
    'ERLC Türkiye',
    'Roblox Roleplay',
    'Liberty County',
    'Discord Roleplay',
    'Piyade Roleplay Panel',
    'Whitelist Kayıt',
  ],
  authors: [{ name: 'Piyade RP Yönetimi', url: 'https://discord.gg/9QGAZB54Br' }],
  creator: 'Piyade Roleplay Team',
  publisher: 'Piyade RP',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Piyade RP • Roblox ER:LC Resmi Web Portalı & Yönetim Paneli',
    description:
      'Piyade Roleplay resmi web sitesi. Sunucu kuralları, canlı ER:LC oyuncu radarı, oyuncu sicil kartı ve yetkili ceza yönetim masası.',
    url: 'https://piyade-rp.up.railway.app',
    siteName: 'Piyade RP',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Piyade RP • Roblox ER:LC Web Portalı',
    description: 'Piyade Roleplay resmi web sitesi, kayıt masası ve canlı sunucu durumu.',
  },
  icons: {
    icon: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
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
        <CookieConsent />
      </body>
    </html>
  );
}
