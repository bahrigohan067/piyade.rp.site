'use client';

import React from 'react';

interface PosterLayerProps {
  animated?: boolean;
  className?: string;
}

/**
 * Kat 0 / Kat 1: Poster Layer
 * Bu katman sayfanın en altında HER ZAMAN mevcuttur.
 * HTML ile birlikte anında görüntü verir, siyah ekran riskini sıfırlar.
 * animated=true ise (Kat 1) hafif, GPU dostu CSS transform nefes alma hareketi uygular.
 */
export default function PosterLayer({ animated = false, className = '' }: PosterLayerProps) {
  return (
    <div
      className={`fixed inset-0 pointer-events-none -z-20 overflow-hidden bg-[#07080c] select-none ${className}`}
      style={{ height: '100lvh' }}
    >
      {/* Responsive Poster Image (WebP with JPEG fallback, Mobile / Desktop separation) */}
      <div
        className={`absolute inset-0 w-full h-full ${
          animated ? 'animate-poster-breathe' : ''
        }`}
        style={{ willChange: animated ? 'transform' : 'auto' }}
      >
        <picture>
          {/* Mobile vertical crop (< 768px) */}
          <source
            media="(max-width: 767px)"
            srcSet="/bg/aero-mobile.webp"
            type="image/webp"
          />
          <source
            media="(max-width: 767px)"
            srcSet="/bg/aero-mobile.jpg"
            type="image/jpeg"
          />
          {/* Desktop wide crop (>= 768px) */}
          <source
            srcSet="/bg/aero-desktop.webp"
            type="image/webp"
          />
          <img
            src="/bg/aero-desktop.jpg"
            alt=""
            aria-hidden="true"
            decoding="async"
            fetchPriority="high"
            className="w-full h-full object-cover object-center pointer-events-none select-none"
          />
        </picture>
      </div>

      {/* Subtle tactical ambient grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Deep purple/amethyst ambient glow (subtle aura) */}
      <div
        className="absolute -top-[10%] left-[20%] w-[500px] h-[500px] rounded-full opacity-20 blur-[130px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.6) 0%, transparent 70%)',
        }}
      />

      {/* Cinematic dark vignette for text and UI contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#07080c]/40 via-transparent to-[#07080c]/85 pointer-events-none" />
    </div>
  );
}
