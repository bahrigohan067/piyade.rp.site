'use client';

import React from 'react';
import BackgroundManager from './background/BackgroundManager';

/**
 * AnimatedBackground (Piyade RP 4-Katmanlı Arka Plan Motoru)
 *
 * Her cihazda (mobil, tablet, düşük sistem, eski tarayıcılar)
 * garantili çalışan, siyah ekran riski sıfır olan kademeli arka plan.
 */
export default function AnimatedBackground() {
  return <BackgroundManager />;
}
