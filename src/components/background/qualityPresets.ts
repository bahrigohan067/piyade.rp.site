import { QualityLevel } from './deviceProfile';
import type { AeroShardsProps } from '@/components/AeroShards';

export interface QualityConfig {
  count: number;
  dpr: number;
  depthOfField: number;
  glow: number;
  grain: number;
  holdToGather: boolean;
  pulseOnClick: boolean;
  mouseInteraction: boolean;
  parallax: number;
}

export function getQualityConfig(level: QualityLevel, isMobile: boolean): Partial<AeroShardsProps> {
  const baseConfig = {
    shardColor: '#896ABD',
    accentColor: '#A855F7',
    backgroundColor: '#07080c',
    material: 'glass' as const,
    placement: 'full' as const,
    markers: 'plus' as const,
    speed: 0.85,
    vignette: 0.35,
    scale: 1,
    shardSize: 1,
    spread: 1,
    twist: 1,
    billow: 1,
  };

  if (level === 'high' && !isMobile) {
    return {
      ...baseConfig,
      count: 1300,
      dpr: 2.0,
      depthOfField: 0.75,
      glow: 0.35,
      grain: 0.06,
      mouseInteraction: true,
      pulseOnClick: true,
      holdToGather: true,
      parallax: 0.5,
    };
  }

  if (level === 'medium' || (level === 'high' && isMobile)) {
    return {
      ...baseConfig,
      count: isMobile ? 600 : 800,
      dpr: isMobile ? 1.4 : 1.6,
      depthOfField: 0.5,
      glow: 0.28,
      grain: 0.04,
      mouseInteraction: true,
      pulseOnClick: !isMobile,
      holdToGather: !isMobile, // Disable hold-to-gather on mobile to avoid scroll gesture conflict
      parallax: isMobile ? 0.25 : 0.4,
    };
  }

  // Low quality (thermal/battery saving or budget devices)
  return {
    ...baseConfig,
    count: isMobile ? 350 : 450,
    dpr: 1.0,
    depthOfField: 0.25,
    glow: 0.15,
    grain: 0.0,
    mouseInteraction: !isMobile,
    pulseOnClick: false,
    holdToGather: false,
    parallax: 0.15,
  };
}
