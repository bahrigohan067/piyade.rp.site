'use client';

import React, { useEffect, useRef } from 'react';

interface LiteShardsProps {
  className?: string;
  count?: number;
}

interface Shard2D {
  x: number;
  y: number;
  depth: number; // 0 (far) to 1 (near)
  size: number;
  rot: number;
  rotSpeed: number;
  vx: number;
  vy: number;
  points: [number, number][];
  color: string;
  strokeColor: string;
  opacity: number;
}

/**
 * Kat 2: Canvas 2D LiteShards
 * WebGPU desteklemeyen veya eskiyen cihazlar için yüksek performanslı,
 * 60 FPS garantili 2D cam parçacığı motoru.
 */
export default function LiteShards({ className = '', count = 75 }: LiteShardsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let rafId = 0;
    let isDisposed = false;
    let isVisible = true;

    // Palette: Amethyst / Glass purple hues
    const colors = [
      'rgba(137, 106, 189, ', // #896ABD
      'rgba(168, 85, 247, ',  // #A855F7
      'rgba(192, 132, 252, ', // #C084FC
      'rgba(126, 34, 206, ',  // #7E22CE
    ];

    const generatePolygon = (sides: number, radius: number): [number, number][] => {
      const points: [number, number][] = [];
      const angleStep = (Math.PI * 2) / sides;
      const stretchY = 0.5 + Math.random() * 0.4;
      for (let i = 0; i < sides; i++) {
        const a = i * angleStep + (Math.random() - 0.5) * 0.3;
        const r = radius * (0.8 + Math.random() * 0.4);
        points.push([Math.cos(a) * r, Math.sin(a) * r * stretchY]);
      }
      return points;
    };

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const actualCount = window.innerWidth < 768 ? Math.min(count, 45) : count;

    // Initialize shards
    const shards: Shard2D[] = Array.from({ length: actualCount }, () => {
      const depth = Math.random();
      const sides = Math.random() > 0.4 ? 4 : 3;
      const size = (12 + Math.random() * 28) * (0.6 + depth * 0.8);
      const colorBase = colors[Math.floor(Math.random() * colors.length)];
      const baseAlpha = (0.15 + depth * 0.3).toFixed(2);
      const strokeAlpha = (0.3 + depth * 0.4).toFixed(2);

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        depth,
        size,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.015,
        vx: (-0.3 - depth * 0.6) * 0.8,
        vy: (0.15 + depth * 0.25) * 0.8,
        points: generatePolygon(sides, size),
        color: `${colorBase}${baseAlpha})`,
        strokeColor: `rgba(255, 255, 255, ${strokeAlpha})`,
        opacity: Number(baseAlpha),
      };
    });

    const resize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Pause rendering when tab is inactive
    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Main animation loop
    const render = () => {
      if (isDisposed) return;
      rafId = requestAnimationFrame(render);

      if (!isVisible) return;

      ctx.clearRect(0, 0, width, height);

      // Render each shard
      for (let i = 0; i < shards.length; i++) {
        const s = shards[i];

        // Update position
        s.x += s.vx;
        s.y += s.vy;
        s.rot += s.rotSpeed;

        // Wrap around screen boundaries with margin
        const margin = s.size * 2;
        if (s.x < -margin) s.x = width + margin;
        if (s.x > width + margin) s.x = -margin;
        if (s.y > height + margin) s.y = -margin;
        if (s.y < -margin) s.y = height + margin;

        // Draw shard polygon
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rot);

        ctx.beginPath();
        const pts = s.points;
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let p = 1; p < pts.length; p++) {
          ctx.lineTo(pts[p][0], pts[p][1]);
        }
        ctx.closePath();

        // Shard glass fill
        ctx.fillStyle = s.color;
        ctx.fill();

        // Crystal facet reflection edge
        ctx.strokeStyle = s.strokeColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      }
    };

    rafId = requestAnimationFrame(render);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none -z-10 w-full h-full ${className}`}
      style={{ height: '100lvh' }}
    />
  );
}
