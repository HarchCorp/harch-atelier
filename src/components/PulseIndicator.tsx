'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface PulseIndicatorProps {
  size?: number;
  color?: string;
  speed?: number;
  className?: string;
}

export function PulseIndicator({ size = 8, color = '#FFFFFF', speed = 2, className = '' }: PulseIndicatorProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Pulse rings */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ border: `1px solid ${color}` }}
        animate={{
          scale: [1, 2.5, 1],
          opacity: [0.4, 0, 0.4],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ border: `1px solid ${color}` }}
        animate={{
          scale: [1, 1.8, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: speed * 0.3,
        }}
      />
      {/* Core dot */}
      <div
        className="rounded-full"
        style={{
          width: size * 0.5,
          height: size * 0.5,
          backgroundColor: color,
          opacity: 0.9,
        }}
      />
    </div>
  );
}

/* ═══ Animated stat bar ═══ */
interface StatBarProps {
  value: number;
  max?: number;
  label?: string;
  className?: string;
}

export function StatBar({ value, max = 100, label, className = '' }: StatBarProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} className={`${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-[#666666] font-[family-name:var(--font-space-mono)]">
            {label}
          </span>
          <span className="text-[9px] text-[#999999] font-[family-name:var(--font-space-mono)]">{value}%</span>
        </div>
      )}
      <div className="h-[2px] bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-white/30 rounded-full"
          initial={{ width: 0 }}
          animate={isInView ? { width: `${(value / max) * 100}%` } : { width: 0 }}
          transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
    </div>
  );
}

/* ═══ Typing text effect ═══ */
interface TypingTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
}

export function TypingText({ text, speed = 40, delay = 0, className = '' }: TypingTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [isInView, delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [started, text, speed]);

  return (
    <span ref={ref} className={className}>
      {displayed}
      {started && displayed.length < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
}
