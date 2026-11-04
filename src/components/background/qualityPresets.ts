import { QualityLevel } from './deviceProfile';
import type { AeroShardsProps } from '@/components/AeroShards';

/**
 * Exact React Bits "aero-shards" Studio Profile:
 * https://www.reactbits.dev/tools/background-studio?bg=aero-shards
 *
 * Every device renders this identical visual profile (1300 3D glass prism shards,
 * #896ABD shard color, #A855F7 accent color, full ribbon placement, + markers,
 * 0.75 depth-of-field, 0.35 bloom glow, 0.06 grain, 0.3 vignette, mouse/touch
 * interaction, pulse rings on click/tap, hold-to-gather, and 0.5 camera parallax).
 */
export function getQualityConfig(_level: QualityLevel, isMobile: boolean): Partial<AeroShardsProps> {
  return {
    shardColor: '#896ABD',
    accentColor: '#A855F7',
    backgroundColor: '#07080c',
    lightMode: false,
    material: 'glass',
    placement: 'full',
    markers: 'plus',
    count: 1300,
    shardSize: 1,
    spread: 1,
    twist: 1,
    billow: 1,
    speed: 1,
    scale: 1,
    depthOfField: 0.75,
    glow: 0.35,
    grain: 0.06,
    vignette: 0.3,
    intro: true,
    mouseInteraction: true,
    mouseStrength: 0.6,
    pulseOnClick: true,
    holdToGather: true,
    parallax: 0.5,
    dpr: isMobile ? 1.5 : 2.0,
  };
}
