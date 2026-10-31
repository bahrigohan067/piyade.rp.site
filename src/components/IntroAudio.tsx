'use client';

import { useEffect, useRef } from 'react';

/**
 * Piyade RP - Başlangıç İntro Ses Oynatıcı
 * Sayfa ilk yüklenirken <head> içerisindeki yüksek öncelikli script tarafından
 * başlatılır. Bu bileşen, tarayıcı engeli durumunda ilk dokunuşta/tıklamada
 * sesin anında devreye girmesini ve çift ses çıkmamasını güvenceye alır.
 */
export default function IntroAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initializedRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (initializedRef.current) return;
    initializedRef.current = true;

    // <head> içindeki ilk script tarafından başlatılan ses örneğini devral
    const existingAudio = (window as unknown as { __piyadeIntro?: HTMLAudioElement }).__piyadeIntro;
    const audio = existingAudio || new Audio('/intro.wav');
    audioRef.current = audio;

    if (!existingAudio) {
      audio.preload = 'auto';
      audio.volume = 0.85;
      audio.loop = false;
      (window as unknown as { __piyadeIntro?: HTMLAudioElement }).__piyadeIntro = audio;
    }

    let isCleanedUp = false;

    const cleanupListeners = () => {
      ['click', 'pointerdown', 'keydown', 'touchstart'].forEach((event) => {
        window.removeEventListener(event, handleUserInteraction);
      });
    };

    const handleUserInteraction = () => {
      if (isCleanedUp) return;
      if (audio && audio.paused) {
        audio.play().catch(() => {});
      }
      cleanupListeners();
    };

    // Eğer ses henüz başlamamışsa veya engellenmişse tekrar çalmayı dene
    if (audio.paused) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          ['click', 'pointerdown', 'keydown', 'touchstart'].forEach((event) => {
            window.addEventListener(event, handleUserInteraction, { once: true, passive: true });
          });
        });
      }
    }

    return () => {
      isCleanedUp = true;
      cleanupListeners();
    };
  }, []);

  return null;
}
