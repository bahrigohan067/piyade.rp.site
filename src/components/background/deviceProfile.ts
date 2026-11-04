'use client';

export type BackgroundTier = 0 | 1 | 2 | 3;
export type QualityLevel = 'high' | 'medium' | 'low';

export interface DeviceDecision {
  tier: BackgroundTier;
  quality: QualityLevel;
  isMobile: boolean;
  isInAppBrowser: boolean;
  hasTouch: boolean;
  webGpuSupported: boolean;
  webGl2Supported: boolean;
  reason: string;
}

const LEGACY_CACHE_KEY = 'piyade_bg_decision_v1';

/**
 * Parses URL overrides for testing:
 * ?bg=0 (Poster only)
 * ?bg=1 (Poster + CSS motion)
 * ?bg=2 (Canvas 2D LiteShards)
 * ?bg=3 (Full 3D AeroShards — WebGPU / WebGL2)
 */
export function getUrlOverride(): { tier?: BackgroundTier; quality?: QualityLevel } | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const bgParam = params.get('bg');
    const qParam = params.get('q') as QualityLevel | null;

    let tier: BackgroundTier | undefined;
    if (bgParam === '0') tier = 0;
    else if (bgParam === '1') tier = 1;
    else if (bgParam === '2') tier = 2;
    else if (bgParam === '3') tier = 3;

    let quality: QualityLevel | undefined;
    if (qParam === 'high' || qParam === 'medium' || qParam === 'low') {
      quality = qParam;
    }

    if (tier !== undefined || quality !== undefined) {
      return { tier, quality };
    }
  } catch {
    // Ignore URL parse errors
  }
  return null;
}

export function clearLegacyCache(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LEGACY_CACHE_KEY);
  } catch {
    // Ignore storage access errors
  }
}

export function saveDecision(_tier: BackgroundTier, _quality: QualityLevel): void {
  // No-op: we never lock a device into a lower tier in localStorage
  clearLegacyCache();
}

function hasWebGL2Support(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2');
    return Boolean(gl);
  } catch {
    return false;
  }
}

/**
 * Evaluates hardware and browser capabilities.
 * Because AeroShards now has a dual-engine architecture (WebGPU + WebGL2 1-to-1 shader port),
 * every device with WebGPU OR WebGL2 runs Tier 3 (the exact aero-shards 3D profile).
 */
export function evaluateDevice(): DeviceDecision {
  if (typeof window === 'undefined') {
    return {
      tier: 3,
      quality: 'high',
      isMobile: false,
      isInAppBrowser: false,
      hasTouch: false,
      webGpuSupported: false,
      webGl2Supported: true,
      reason: 'SSR default',
    };
  }

  clearLegacyCache();

  const isMobile =
    window.innerWidth < 768 ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  const hasTouch =
    'ontouchstart' in window || Boolean(navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

  const isInAppBrowser = /Discord|Instagram|FBAN|FBAV|TikTok|Twitter|Snapchat/i.test(
    navigator.userAgent
  );

  const webGpuSupported =
    typeof navigator !== 'undefined' &&
    'gpu' in navigator &&
    typeof (navigator as unknown as { gpu?: { requestAdapter?: unknown } }).gpu?.requestAdapter ===
      'function';

  const webGl2Supported = hasWebGL2Support();

  // Check explicit URL override for debugging (?bg=0, ?bg=1, ?bg=2, ?bg=3)
  const override = getUrlOverride();
  if (override?.tier !== undefined) {
    return {
      tier: override.tier,
      quality: override.quality || 'high',
      isMobile,
      isInAppBrowser,
      hasTouch,
      webGpuSupported,
      webGl2Supported,
      reason: `URL override ?bg=${override.tier}`,
    };
  }

  // Every device that supports either WebGPU or WebGL2 runs the exact 3D AeroShards profile
  if (webGpuSupported || webGl2Supported) {
    return {
      tier: 3,
      quality: 'high',
      isMobile,
      isInAppBrowser,
      hasTouch,
      webGpuSupported,
      webGl2Supported,
      reason: webGpuSupported ? 'AeroShards 3D (WebGPU)' : 'AeroShards 3D (WebGL2 Universal)',
    };
  }

  // Only if neither WebGPU nor WebGL2 exists at all on a legacy browser
  return {
    tier: 2,
    quality: 'low',
    isMobile,
    isInAppBrowser,
    hasTouch,
    webGpuSupported: false,
    webGl2Supported: false,
    reason: 'Legacy browser without WebGPU/WebGL2 -> Canvas 2D',
  };
}
