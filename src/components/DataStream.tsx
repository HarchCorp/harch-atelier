'use client';

import { useEffect, useRef } from 'react';

interface DataStreamProps {
  className?: string;
  opacity?: number;
  speed?: number;
  count?: number;
}

export function DataStream({ className = '', opacity = 0.03, speed = 0.5, count = 25 }: DataStreamProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isVisible = true;
    let streams: { x: number; y: number; speed: number; chars: string[]; opacity: number }[] = [];

    const chars = '01HARCHCORP∞→↓▲█▓░/$MWGWKT'.split('');

    // IntersectionObserver — pause animation when offscreen
    const observer = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(canvas);

    // Reduced motion — skip animation entirely
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Draw one static frame and stop
      const resize = () => {
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      };
      resize();
      return () => observer.disconnect();
    }

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const initStreams = () => {
      streams = [];
      const w = canvas.offsetWidth;
      for (let i = 0; i < count; i++) {
        const len = Math.floor(Math.random() * 8) + 3;
        streams.push({
          x: Math.random() * w,
          y: Math.random() * -200,
          speed: (Math.random() * 0.3 + 0.1) * speed,
          chars: Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]),
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
    };

    const draw = () => {
      // Pause when offscreen to save GPU/CPU
      if (!isVisible) {
        animId = requestAnimationFrame(draw);
        return;
      }

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      ctx.font = '9px monospace';

      streams.forEach(stream => {
        stream.chars.forEach((char, i) => {
          const charOpacity = stream.opacity * (1 - i / stream.chars.length) * opacity;
          ctx.fillStyle = `rgba(255, 255, 255, ${charOpacity})`;
          ctx.fillText(char, stream.x, stream.y + i * 12);
        });

        stream.y += stream.speed;

        if (stream.y > h + 50) {
          stream.y = -stream.chars.length * 12;
          stream.x = Math.random() * w;
        }
      });

      animId = requestAnimationFrame(draw);
    };

    resize();
    initStreams();
    draw();

    window.addEventListener('resize', () => {
      resize();
      initStreams();
    });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, [opacity, speed, count]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 1 }}
    />
  );
}
