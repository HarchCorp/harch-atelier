'use client';

import { useEffect, useRef, useState } from 'react';

export function CursorGlow() {
  const [mounted, setMounted] = useState(false);
  const glowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const rafRef = useRef<number | undefined>(undefined);
  const targetRef = useRef({ x: -100, y: -100 });
  const currentRef = useRef({ x: -100, y: -100 });
  const trailData = useRef<{ x: number; y: number }[]>([
    { x: -100, y: -100 },
    { x: -100, y: -100 },
    { x: -100, y: -100 },
  ]);
  const visibleRef = useRef(false);

  useEffect(() => {
    // Skip entirely on touch devices — no mouse cursor to follow
    const hasHover = window.matchMedia('(hover: hover)').matches;
    if (!hasHover) return;

    setMounted(true);

    const handleMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      if (!visibleRef.current) {
        visibleRef.current = true;
        if (glowRef.current) glowRef.current.style.opacity = '1';
        if (dotRef.current) dotRef.current.style.opacity = '1';
        trailRefs.current.forEach(el => { if (el) el.style.opacity = '1'; });
      }
    };

    const handleLeave = () => {
      visibleRef.current = false;
      if (glowRef.current) glowRef.current.style.opacity = '0';
      if (dotRef.current) dotRef.current.style.opacity = '0';
      trailRefs.current.forEach(el => { if (el) el.style.opacity = '0'; });
    };

    // Smooth follow with lerp for main dot + trail — direct DOM manipulation
    const animate = () => {
      // Main dot - fast follow
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.12;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.12;

      // Trail dots - progressively slower
      trailData.current[0].x += (currentRef.current.x - trailData.current[0].x) * 0.06;
      trailData.current[0].y += (currentRef.current.y - trailData.current[0].y) * 0.06;

      trailData.current[1].x += (trailData.current[0].x - trailData.current[1].x) * 0.04;
      trailData.current[1].y += (trailData.current[0].y - trailData.current[1].y) * 0.04;

      trailData.current[2].x += (trailData.current[1].x - trailData.current[2].x) * 0.03;
      trailData.current[2].y += (trailData.current[1].y - trailData.current[2].y) * 0.03;

      // Direct DOM updates — no React state
      const cx = currentRef.current.x;
      const cy = currentRef.current.y;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${cx - 150}px, ${cy - 150}px)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${cx - 4}px, ${cy - 4}px)`;
      }
      if (trailRefs.current[0]) {
        trailRefs.current[0].style.transform = `translate(${trailData.current[0].x - 3}px, ${trailData.current[0].y - 3}px)`;
      }
      if (trailRefs.current[1]) {
        trailRefs.current[1].style.transform = `translate(${trailData.current[1].x - 2}px, ${trailData.current[1].y - 2}px)`;
      }
      if (trailRefs.current[2]) {
        trailRefs.current[2].style.transform = `translate(${trailData.current[2].x - 1}px, ${trailData.current[2].y - 1}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseleave', handleLeave);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Don't render on touch devices (not mounted means no hover)
  if (!mounted) return null;

  return (
    <div className="fixed pointer-events-none z-[9999] inset-0">
      {/* Main radial glow */}
      <div
        ref={glowRef}
        className="absolute w-[300px] h-[300px] rounded-full"
        style={{
          left: 0,
          top: 0,
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 30%, transparent 70%)',
          transition: 'opacity 0.3s ease',
          opacity: 0,
          willChange: 'transform',
        }}
      />
      {/* Bright dot at cursor */}
      <div
        ref={dotRef}
        className="absolute w-2 h-2 rounded-full"
        style={{
          left: 0,
          top: 0,
          background: 'rgba(255,255,255,0.15)',
          boxShadow: '0 0 6px rgba(255,255,255,0.1)',
          opacity: 0,
          willChange: 'transform',
        }}
      />
      {/* Trail dot 1 */}
      <div
        ref={(el) => { trailRefs.current[0] = el; }}
        className="absolute w-1.5 h-1.5 rounded-full"
        style={{
          left: 0,
          top: 0,
          background: 'rgba(255,255,255,0.08)',
          opacity: 0,
          willChange: 'transform',
        }}
      />
      {/* Trail dot 2 */}
      <div
        ref={(el) => { trailRefs.current[1] = el; }}
        className="absolute w-1 h-1 rounded-full"
        style={{
          left: 0,
          top: 0,
          background: 'rgba(255,255,255,0.05)',
          opacity: 0,
          willChange: 'transform',
        }}
      />
      {/* Trail dot 3 */}
      <div
        ref={(el) => { trailRefs.current[2] = el; }}
        className="absolute w-0.5 h-0.5 rounded-full"
        style={{
          left: 0,
          top: 0,
          background: 'rgba(255,255,255,0.03)',
          opacity: 0,
          willChange: 'transform',
        }}
      />
    </div>
  );
}
