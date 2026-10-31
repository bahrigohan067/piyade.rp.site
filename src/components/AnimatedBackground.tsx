'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import AeroShards from '@/components/AeroShards';

export default function AnimatedBackground() {
  const pathname = usePathname();
  const isHomepage = pathname === '/';
  const [webGpuFailed, setWebGpuFailed] = useState(false);

  // Homepage: WebGPU-powered Aero Shards background (React Bits)
  if (isHomepage && !webGpuFailed) {
    return (
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#07080c]">
        <AeroShards
          className="w-full h-full"
          shardColor="#896ABD"
          accentColor="#A855F7"
          material="glass"
          placement="full"
          markers="plus"
          count={1300}
          shardSize={1}
          spread={1}
          twist={1}
          billow={1}
          speed={0.9}
          scale={1}
          depthOfField={0.75}
          glow={0.35}
          grain={0.06}
          vignette={0.35}
          mouseInteraction={true}
          pulseOnClick={true}
          holdToGather={true}
          parallax={0.5}
          onError={(err) => {
            console.warn('AeroShards WebGPU fallback triggered:', err);
            setWebGpuFailed(true);
          }}
        />
        {/* Soft dark vignette & tactical overlay to maintain high contrast for typography and UI */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#07080c]/30 via-transparent to-[#07080c]/85 pointer-events-none" />
      </div>
    );
  }

  // Sub-pages or fallback for browsers without WebGPU support: tactical ambient gradient orbs
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#07080c]">
      {/* Subtle tactical grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.035]" 
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />

      {/* Floating Gradient Orb 1 - Tactical Blue (Top Left) */}
      <div 
        className="absolute -top-[15%] -left-[10%] w-[650px] h-[650px] rounded-full opacity-40 blur-[130px] mix-blend-screen animate-float-slow"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.4) 50%, transparent 75%)'
        }}
      />

      {/* Floating Gradient Orb 2 - Deep Purple / Gang Violet (Top Right) */}
      <div 
        className="absolute -top-[10%] -right-[15%] w-[600px] h-[600px] rounded-full opacity-35 blur-[140px] mix-blend-screen animate-float-reverse"
        style={{
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.85) 0%, rgba(126, 34, 206, 0.35) 50%, transparent 75%)'
        }}
      />

      {/* Floating Gradient Orb 3 - Police Alert Crimson Red (Center-Bottom) */}
      <div 
        className="absolute top-[45%] left-[25%] w-[700px] h-[700px] rounded-full opacity-25 blur-[150px] mix-blend-screen animate-gradient-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.75) 0%, rgba(185, 28, 28, 0.25) 50%, transparent 75%)'
        }}
      />

      {/* Floating Gradient Orb 4 - Cyan Glow (Bottom Right) */}
      <div 
        className="absolute -bottom-[20%] right-[10%] w-[550px] h-[550px] rounded-full opacity-30 blur-[120px] mix-blend-screen animate-float-slow"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.8) 0%, rgba(14, 116, 144, 0.3) 50%, transparent 75%)'
        }}
      />

      {/* Vignette dark edges for immersive cinema feel */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#07080c]/50 to-[#07080c]/90 pointer-events-none" />
    </div>
  );
}
