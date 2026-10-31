'use client';

import { useEffect, useRef } from 'react';

/**
 * Piyade RP - Başlangıç İntro Ses Oynatıcı
 * Sadece ana sayfaya (https://piyade-rp.up.railway.app/) girildiğinde,
 * 1 kez ve sadece girişte çalar. Arka planda döngüye (loop) girmez.
 */
export default function IntroAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasTriggeredRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    // Ses nesnesi oluştur
    const audio = new Audio('/intro.wav');
    audioRef.current = audio;
    audio.preload = 'auto';
    audio.volume = 0.75;
    audio.loop = false;

    let isCleanedUp = false;

    // Etkileşim dinleyicilerini temizleme fonksiyonu
    const cleanupInteractionListeners = () => {
      ['click', 'pointerdown', 'keydown', 'touchstart'].forEach((event) => {
        window.removeEventListener(event, handleUserInteraction);
      });
    };

    // Tarayıcı otomatik oynatmayı engellerse ilk kullanıcı etkileşiminde 1 kez çal
    const handleUserInteraction = () => {
      if (isCleanedUp) return;
      audio.play().catch(() => {});
      cleanupInteractionListeners();
    };

    // Doğrudan sayfaya girildiği an oynatmayı dene
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Tarayıcı güvenlik/otomatik oynatma politikası engellerse (Chrome/Safari),
        // kullanıcının ilk tıklama/dokunma hareketinde sesi tetikle
        ['click', 'pointerdown', 'keydown', 'touchstart'].forEach((event) => {
          window.addEventListener(event, handleUserInteraction, { once: true, passive: true });
        });
      });
    }

    return () => {
      isCleanedUp = true;
      cleanupInteractionListeners();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, []);

  return null;
}
