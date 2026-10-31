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
    default: 'Piyade RP — Roblox ER:LC Resmi Web Portalı & Whitelist Kayıt',
    template: '%s | Piyade RP',
  },
  description:
    'Piyade RP (Piyade Roleplay) resmi web sitesi. Roblox Emergency Response: Liberty County (ER:LC) Türkiye topluluğu, whitelist başvuru masası, kurallar ve canlı oyuncu radarı.',
  keywords: [
    'Piyade RP',
    'Piyade Roleplay',
    'Piyade RP Roblox',
    'Piyade RP ERLC',
    'Piyade RP Discord',
    'Piyade RP Whitelist',
    'Piyade RP Kayıt',
    'Roblox Piyade RP',
    'piyade rp site',
    'piyade rp up railway app',
    'Roblox ER:LC Türkiye',
    'Emergency Response Liberty County Türkçe',
    'Roblox Roleplay Türkiye',
    'Piyade Polis Roleplay',
  ],
  authors: [{ name: 'Piyade RP Yönetimi', url: 'https://discord.gg/9QGAZB54Br' }],
  creator: 'Piyade Roleplay Team',
  publisher: 'Piyade RP',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Piyade RP — Roblox ER:LC Resmi Web Portalı & Whitelist Kayıt',
    description:
      'Piyade RP resmi web sitesi. Roblox ER:LC Türkiye sunucu kuralları, canlı radar, oyuncu sicil takibi ve Whitelist kayıt masası.',
    url: 'https://piyade-rp.up.railway.app',
    siteName: 'Piyade RP',
    images: [
      {
        url: '/banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Piyade RP Roblox ERLC Topluluğu',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Piyade RP — Roblox ER:LC Resmi Web Portalı',
    description: 'Piyade RP resmi web sitesi, whitelist başvuru masası ve canlı oyuncu radarı.',
    images: ['/banner.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-256.png', sizes: '256x256', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'Lc7u2cS7YV48ucaNdewXH84pjA6wDGJ6G6h0LAJhNZM',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://piyade-rp.up.railway.app/#website',
      url: 'https://piyade-rp.up.railway.app',
      name: 'Piyade RP',
      alternateName: ['Piyade Roleplay', 'PiyadeRP', 'Piyade RP Roblox', 'Piyade RP ERLC'],
      description: 'Piyade Roleplay (Piyade RP) resmi web portalı ve Roblox ER:LC sunucu yönetim merkezi.',
      inLanguage: 'tr-TR',
    },
    {
      '@type': 'Organization',
      '@id': 'https://piyade-rp.up.railway.app/#organization',
      name: 'Piyade RP',
      url: 'https://piyade-rp.up.railway.app',
      logo: 'https://piyade-rp.up.railway.app/icon-256.png',
      sameAs: [
        'https://discord.gg/9QGAZB54Br',
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark scroll-smooth">
      <head>
        <meta name="google-site-verification" content="Lc7u2cS7YV48ucaNdewXH84pjA6wDGJ6G6h0LAJhNZM" />
        <link rel="preload" href="/intro.wav" as="audio" type="audio/wav" fetchPriority="high" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (window.location.pathname === '/' || window.location.pathname === '') {
                    var audio = new Audio('/intro.wav');
                    audio.preload = 'auto';
                    audio.volume = 0.85;
                    audio.loop = false;
                    window.__piyadeIntro = audio;
                    var p = audio.play();
                    if (p && p.catch) {
                      p.catch(function() {
                        var playOnInteraction = function() {
                          if (window.__piyadeIntro && window.__piyadeIntro.paused) {
                            window.__piyadeIntro.play().catch(function() {});
                          }
                          ['click', 'pointerdown', 'touchstart', 'keydown'].forEach(function(ev) {
                            window.removeEventListener(ev, playOnInteraction);
                          });
                        };
                        ['click', 'pointerdown', 'touchstart', 'keydown'].forEach(function(ev) {
                          window.addEventListener(ev, playOnInteraction, { once: true, passive: true });
                        });
                      });
                    }
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#07080c] text-white min-h-screen antialiased selection:bg-blue-500/30 selection:text-blue-200">
        <AnimatedBackground />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
