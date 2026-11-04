'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PosterLayer from './PosterLayer';
import LiteShards from './LiteShards';
import {
  evaluateDevice,
  clearLegacyCache,
  type BackgroundTier,
} from './deviceProfile';
import { getQualityConfig } from './qualityPresets';

const AeroShards = dynamic(() => import('@/components/AeroShards'), {
  ssr: false,
});

/**
 * BackgroundManager — Universal AeroShards Controller
 *
 * Ensures EVERY device (Desktop, Mobile iOS/Android, Tablets, Discord/Instagram
 * in-app browsers, Safari, Firefox, Chrome, Edge) displays the exact
 * `aero-shards` 3D glass prism profile from:
 * https://www.reactbits.dev/tools/background-studio?bg=aero-shards
 *
 * - PosterLayer sits underneath at z-index -20 so the first millisecond is never black.
 * - AeroShards runs on top via Dual-Engine (WebGPU native + WebGL2 1:1 shader port).
 * - Soft dark vignette overlay preserves text readability on all UI cards.
 */
export default function BackgroundManager() {
  const [mounted, setMounted] = useState(false);
  const [tier, setTier] = useState<BackgroundTier>(3);
  const [isMobile, setIsMobile] = useState(false);
  const [aeroReady, setAeroReady] = useState(false);
  const [aeroFailed, setAeroFailed] = useState(false);

  useEffect(() => {
    clearLegacyCache();
    const decision = evaluateDevice();
    setIsMobile(decision.isMobile);
    setTier(decision.tier);
    setMounted(true);
  }, []);

  const handleAeroReady = () => {
    setAeroReady(true);
  };

  const handleAeroError = (error: Error) => {
    console.warn('[Piyade Background] Both WebGPU and WebGL2 failed:', error);
    setAeroFailed(true);
    setTier(2);
  };

  const aeroProps = getQualityConfig('high', isMobile);

  return (
    <>
      {/* Instant 0ms Poster Underlay: prevents any black flash while 3D shaders compile */}
      <PosterLayer animated={!aeroReady} />

      {/* Fallback Canvas 2D only if both WebGPU and WebGL2 are completely unavailable */}
      {mounted && (tier === 2 || aeroFailed) && <LiteShards />}

      {/* Universal 3D AeroShards Profile (WebGPU + WebGL2 1:1 Shader Engine) */}
      {mounted && tier === 3 && !aeroFailed && (
        <div
          className={`fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-opacity duration-500 ease-out ${
            aeroReady ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ height: '100lvh' }}
        >
          <AeroShards
            className="w-full h-full"
            {...aeroProps}
            onReady={handleAeroReady}
            onError={handleAeroError}
          />
          {/* Subtle top/bottom vignette to keep foreground text crisp */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#07080c]/25 via-transparent to-[#07080c]/80 pointer-events-none" />
        </div>
      )}
    </>
  );
}
