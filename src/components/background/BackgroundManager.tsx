'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import PosterLayer from './PosterLayer';
import LiteShards from './LiteShards';
import {
  evaluateDevice,
  saveDecision,
  getUrlOverride,
  type BackgroundTier,
  type QualityLevel,
} from './deviceProfile';
import { getQualityConfig } from './qualityPresets';

// Lazy-load the heavy 2200-line WebGPU engine only when Tier 3 is actually needed!
const AeroShards = dynamic(() => import('@/components/AeroShards'), {
  ssr: false,
});

/**
 * BackgroundManager (4-Tier Progressive Enhancement Controller)
 *
 * Kat 0: Statik Poster (Her cihazda kesin görünür, sıfır JS gecikmesi)
 * Kat 1: Hafif CSS Hareketi (Nefes alma / yavaş süzülme)
 * Kat 2: Canvas 2D LiteShards (WebGPU olmayan cihazlar için akıcı cam parçacıkları)
 * Kat 3: WebGPU AeroShards (Yüksek / Orta / Düşük kalite profilli tam efekt)
 */
export default function BackgroundManager() {
  const pathname = usePathname();
  const isHomepage = pathname === '/';

  // Mount flag
  const [mounted, setMounted] = useState(false);

  // Active tiers and quality
  const [tier, setTier] = useState<BackgroundTier>(0);
  const [quality, setQuality] = useState<QualityLevel>('medium');
  const [isMobile, setIsMobile] = useState(false);

  // WebGPU lifecycle status
  const [webGpuReady, setWebGpuReady] = useState(false);
  const [webGpuFailed, setWebGpuFailed] = useState(false);

  // Performance tracking
  const lowFpsCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);

    const decision = evaluateDevice();
    setIsMobile(decision.isMobile);
    setQuality(decision.quality);
    setTier(decision.tier);

    // If Tier 3 (WebGPU) was chosen, set a 3.5s fallback safety timer.
    // If WebGPU doesn't produce a verified rendered frame within 3.5 seconds,
    // seamlessly downgrade to Kat 2 (Canvas 2D) so the screen NEVER goes black.
    if (decision.tier === 3) {
      timeoutRef.current = setTimeout(() => {
        setWebGpuReady((ready) => {
          if (!ready) {
            console.warn('[Piyade Background] WebGPU timeout (3.5s). Falling back to Tier 2.');
            setWebGpuFailed(true);
            setTier(2);
            saveDecision(2, 'low');
          }
          return ready;
        });
      }, 3500);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // WebGPU successful first-frame signal
  const handleWebGpuReady = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setWebGpuReady(true);
    saveDecision(3, quality);
  };

  // WebGPU runtime error handler
  const handleWebGpuError = (error: Error) => {
    console.warn('[Piyade Background] WebGPU runtime error:', error);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setWebGpuFailed(true);
    setTier(2);
    saveDecision(2, 'low');
  };

  // Dynamic FPS feedback
  const handleStats = (fps: number) => {
    if (fps < 28) {
      lowFpsCountRef.current += 1;
      if (lowFpsCountRef.current >= 2) {
        // Sustained low FPS detected: step down quality
        lowFpsCountRef.current = 0;
        if (quality === 'high') {
          setQuality('medium');
          saveDecision(3, 'medium');
        } else if (quality === 'medium') {
          setQuality('low');
          saveDecision(3, 'low');
        } else {
          // Low quality still stuttering -> switch to lightweight Canvas 2D
          setTier(2);
          saveDecision(2, 'low');
        }
      }
    } else {
      lowFpsCountRef.current = 0;
    }
  };

  // Subpages (/panel, /yetkili, /kurucu, /kayit):
  // Use Kat 0 + Kat 1 (Amethyst poster with gentle CSS motion).
  // Zero CPU load, matches brand theme, keeps tables and forms blazing fast.
  if (!isHomepage) {
    return <PosterLayer animated={true} />;
  }

  const aeroProps = getQualityConfig(quality, isMobile);

  return (
    <>
      {/* KAT 0 & KAT 1: Base Poster Layer (ALWAYS rendered underneath; guarantees zero black-screen) */}
      <PosterLayer animated={tier >= 1} />

      {/* KAT 2: Canvas 2D LiteShards (When WebGPU is unsupported or throttled) */}
      {mounted && tier === 2 && <LiteShards />}

      {/* KAT 3: Full WebGPU AeroShards (When device is capable) */}
      {mounted && tier === 3 && !webGpuFailed && (
        <div
          className={`fixed inset-0 pointer-events-none -z-10 transition-opacity duration-700 ease-in-out ${
            webGpuReady ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ height: '100lvh' }}
        >
          <AeroShards
            className="w-full h-full"
            {...aeroProps}
            onReady={handleWebGpuReady}
            onError={handleWebGpuError}
            onStats={handleStats}
          />
        </div>
      )}
    </>
  );
}
