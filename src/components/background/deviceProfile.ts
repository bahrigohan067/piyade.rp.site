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
  reason: string;
}

const CACHE_KEY = 'piyade_bg_decision_v1';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Parses URL overrides for testing:
 * ?bg=0 (Poster only)
 * ?bg=1 (Poster + CSS motion)
 * ?bg=2 (Canvas 2D LiteShards)
 * ?bg=3 (Full WebGPU AeroShards)
 * &q=high|medium|low
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

/**
 * Checks cached decision from localStorage
 */
export function getCachedDecision(): { tier: BackgroundTier; quality: QualityLevel } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
      if ([0, 1, 2, 3].includes(parsed.tier)) {
        return {
          tier: parsed.tier as BackgroundTier,
          quality: (parsed.quality || 'medium') as QualityLevel,
        };
      }
    }
  } catch {
    // Cache miss or corrupted
  }
  return null;
}

/**
 * Persists decision to localStorage
 */
export function saveDecision(tier: BackgroundTier, quality: QualityLevel): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        tier,
        quality,
        timestamp: Date.now(),
      })
    );
  } catch {
    // Quota exceeded or private browsing
  }
}

/**
 * Evaluates hardware and browser capabilities to determine the optimal background tier
 */
export function evaluateDevice(): DeviceDecision {
  if (typeof window === 'undefined') {
    return {
      tier: 0,
      quality: 'medium',
      isMobile: false,
      isInAppBrowser: false,
      hasTouch: false,
      webGpuSupported: false,
      reason: 'SSR default',
    };
  }

  // 1. Check URL override first
  const override = getUrlOverride();
  if (override?.tier !== undefined) {
    return {
      tier: override.tier,
      quality: override.quality || (override.tier === 3 ? 'medium' : 'low'),
      isMobile: window.innerWidth < 768,
      isInAppBrowser: false,
      hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      webGpuSupported: typeof navigator !== 'undefined' && 'gpu' in navigator,
      reason: `URL override ?bg=${override.tier}`,
    };
  }

  const isMobile =
    window.innerWidth < 768 ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  const hasTouch =
    'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

  const isInAppBrowser = /Discord|Instagram|FBAN|FBAV|TikTok|Twitter|Snapchat/i.test(
    navigator.userAgent
  );

  // 2. Accessibility: prefers-reduced-motion
  const prefersReduced =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    return {
      tier: 0,
      quality: 'low',
      isMobile,
      isInAppBrowser,
      hasTouch,
      webGpuSupported: false,
      reason: 'prefers-reduced-motion: reduce',
    };
  }

  // 3. Network Save-Data
  const connection = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) {
    return {
      tier: 1,
      quality: 'low',
      isMobile,
      isInAppBrowser,
      hasTouch,
      webGpuSupported: false,
      reason: 'Save-Data enabled',
    };
  }

  // 4. Cached decision (if already evaluated on this device)
  const cached = getCachedDecision();
  if (cached) {
    return {
      tier: cached.tier,
      quality: cached.quality,
      isMobile,
      isInAppBrowser,
      hasTouch,
      webGpuSupported: cached.tier === 3,
      reason: 'Cached decision',
    };
  }

  // 5. In-App browser check (Discord, Instagram, etc. often have unstable WebGPU)
  if (isInAppBrowser) {
    return {
      tier: 2, // LiteShards (smooth Canvas 2D without crashing embedded webview)
      quality: 'low',
      isMobile,
      isInAppBrowser: true,
      hasTouch,
      webGpuSupported: false,
      reason: 'In-app webview safe fallback',
    };
  }

  // 6. WebGPU Support Check
  const webGpuSupported =
    typeof navigator !== 'undefined' &&
    'gpu' in navigator &&
    typeof (navigator as unknown as { gpu?: { requestAdapter?: unknown } }).gpu?.requestAdapter ===
      'function';

  if (!webGpuSupported) {
    // WebGPU not available: use Canvas 2D LiteShards (or Tier 1 if very old device)
    const cores = navigator.hardwareConcurrency || 4;
    return {
      tier: cores <= 2 ? 1 : 2,
      quality: 'low',
      isMobile,
      isInAppBrowser,
      hasTouch,
      webGpuSupported: false,
      reason: 'WebGPU unavailable -> Canvas 2D',
    };
  }

  // 7. Hardware Heuristics for WebGPU quality
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;

  let quality: QualityLevel = 'medium';
  if (isMobile) {
    // On mobile devices, cap at medium for thermal and battery efficiency
    quality = cores >= 8 && memory >= 6 ? 'medium' : 'low';
  } else {
    // Desktop / laptop
    if (cores >= 8 && memory >= 8) quality = 'high';
    else if (cores <= 4 || memory <= 4) quality = 'low';
    else quality = 'medium';
  }

  return {
    tier: 3,
    quality,
    isMobile,
    isInAppBrowser,
    hasTouch,
    webGpuSupported: true,
    reason: `WebGPU ready (quality: ${quality})`,
  };
}
