'use client';

import { motion, useInView, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import { useRef, useEffect, useState, useCallback, type ReactNode, type MouseEvent as ReactMouseEvent } from 'react';
import Link from 'next/link';

/* ═══════════════════════════════════════════════════════════════
   SHARED EASING & DURATION CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_OUT_QUART: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const DURATION_FAST = 0.2;
const DURATION_NORMAL = 0.4;
const DURATION_SLOW = 0.8;

/* ═══════════════════════════════════════════════════════════════
   1. FadeIn — Unified scroll-triggered fade-in
   ═══════════════════════════════════════════════════════════════ */

type FadeDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: FadeDirection;
  className?: string;
  duration?: number;
}

const DIRECTION_OFFSET = 40;

const directionMap: Record<FadeDirection, { x: number; y: number }> = {
  up: { y: DIRECTION_OFFSET, x: 0 },
  down: { y: -DIRECTION_OFFSET, x: 0 },
  left: { y: 0, x: DIRECTION_OFFSET },
  right: { y: 0, x: -DIRECTION_OFFSET },
  none: { y: 0, x: 0 },
};

export function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  className,
  duration = 0.7,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const prefersReducedMotion = useReducedMotion();

  const offset = directionMap[direction];

  // Skip animation entirely if user prefers reduced motion
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: offset.x, y: offset.y }}
      transition={{
        duration,
        delay,
        ease: EASE_OUT_EXPO,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. AnimatedCounter — Always shows target value; animation is
   purely a visual enhancement. NEVER shows "0" on initial render.
   Uses React state with requestAnimationFrame for reliable updates.
   ═══════════════════════════════════════════════════════════════ */

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
}

/** Format a number with optional decimals and locale */
function formatNumber(val: number, decimals: number): string {
  if (decimals > 0) {
    return val.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  return Math.round(val).toLocaleString();
}

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 2,
  decimals = 0,
}: AnimatedCounterProps) {
  // Start with the target value so SSR/initial render shows the correct value
  const [displayValue, setDisplayValue] = useState<number>(value);
  const spanRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(spanRef, { once: true, margin: '-50px' });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    let startTime: number | null = null;
    let rafId: number;
    const ms = duration * 1000;
    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / ms, 1);
      const eased = easeOutCubic(progress);
      setDisplayValue(eased * value);
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, value, duration]);

  const formatted = `${prefix}${formatNumber(displayValue, decimals)}${suffix}`;

  return (
    <span
      ref={spanRef}
      className="stat-mono"
      style={{ fontVariantNumeric: 'tabular-nums' }}
      aria-label={`${prefix}${formatNumber(value, decimals)}${suffix}`}
    >
      {formatted}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. StaggerContainer — Stagger children animations
   ═══════════════════════════════════════════════════════════════ */

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  stagger?: number;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  stagger,
}: StaggerContainerProps) {
  const actualDelay = stagger ?? staggerDelay;
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: prefersReducedMotion ? 0 : actualDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Use inside StaggerContainer children */
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: EASE_OUT_EXPO },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. MagneticButton — Button that follows the cursor subtly
   ═══════════════════════════════════════════════════════════════ */

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
}

export function MagneticButton({ children, className }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const maxDistance = 0.3; // subtle magnetic factor
      x.set((e.clientX - centerX) * maxDistance);
      y.set((e.clientY - centerY) * maxDistance);
    },
    [x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. TextReveal — Character-by-character text reveal on scroll
   ═══════════════════════════════════════════════════════════════ */

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  /**
   * Semantic element to render as. Defaults to 'div'. Use 'h2', 'h3', etc.
   * for proper heading hierarchy without changing visual design.
   */
  as?: 'div' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
}

export function TextReveal({ text, className, delay = 0, as = 'div' }: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const characters = text.split('');

  const spans = characters.map((char, i) => (
    <motion.span
      key={`${char}-${i}`}
      initial={{ opacity: 0, y: 8 }}
      animate={
        isInView
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 8 }
      }
      transition={{
        duration: 0.4,
        delay: delay + i * 0.03,
        ease: EASE_OUT_QUART,
      }}
      style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : undefined }}
      aria-hidden="true"
    >
      {char === ' ' ? '\u00A0' : char}
    </motion.span>
  ));

  const commonProps = {
    ref,
    className,
    'aria-label': text,
  };

  switch (as) {
    case 'h2':
      return <h2 {...commonProps}>{spans}</h2>;
    case 'h3':
      return <h3 {...commonProps}>{spans}</h3>;
    case 'h4':
      return <h4 {...commonProps}>{spans}</h4>;
    case 'p':
      return <p {...commonProps}>{spans}</p>;
    case 'span':
      return <span {...commonProps}>{spans}</span>;
    default:
      return <div {...commonProps}>{spans}</div>;
  }
}

/* ═══════════════════════════════════════════════════════════════
   6. ParallaxSection — Section with parallax scroll effect
   ═══════════════════════════════════════════════════════════════ */

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  offset?: number;
}

export function ParallaxSection({
  children,
  className,
  speed = 0.3,
  offset = 0,
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset * speed * 100]);

  // Disable parallax effect when user prefers reduced motion
  if (prefersReducedMotion) {
    return <div ref={ref} className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. CountUp — Always shows target value; animation is enhancement.
   NEVER shows "0" or the `from` value on initial render.
   Uses React state with requestAnimationFrame for reliable updates.
   ═══════════════════════════════════════════════════════════════ */

interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export function CountUp({
  from = 0,
  to,
  duration = 2,
  prefix = '',
  suffix = '',
  className,
  decimals = 0,
}: CountUpProps) {
  // Start with the target value so SSR/initial render shows the correct value
  const [displayValue, setDisplayValue] = useState<number>(to);
  const spanRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(spanRef, { once: true, margin: '-50px' });
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!isInView || hasStarted.current) return;
    hasStarted.current = true;

    let startTime: number | null = null;
    let rafId: number;
    const ms = duration * 1000;
    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / ms, 1);
      const eased = easeOutCubic(progress);
      setDisplayValue(from + eased * (to - from));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setDisplayValue(to);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, from, to, duration]);

  const formatted = `${prefix}${formatNumber(displayValue, decimals)}${suffix}`;

  return (
    <span
      ref={spanRef}
      className={className ?? 'stat-mono'}
      style={{ fontVariantNumeric: 'tabular-nums' }}
      aria-label={`${prefix}${formatNumber(to, decimals)}${suffix}`}
    >
      {formatted}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. SmoothLink — Link with hover animation
   ═══════════════════════════════════════════════════════════════ */

interface SmoothLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function SmoothLink({ href, children, className, style }: SmoothLinkProps) {
  return (
    <Link href={href} className={`group inline-flex items-center gap-1 ${className ?? ''}`} style={style}>
      <span className="relative">
        {children}
        <span
          className="absolute bottom-0 left-0 h-[1px] w-0 bg-current transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:w-full"
          aria-hidden="true"
        />
      </span>
      <motion.span
        className="inline-block"
        initial={{ x: 0, opacity: 0.5 }}
        whileHover={{ x: 4, opacity: 1 }}
        transition={{ duration: DURATION_FAST, ease: EASE_OUT_QUART }}
        aria-hidden="true"
      >
        &rarr;
      </motion.span>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════
   9. Card3D — Card with subtle 3D tilt on hover
   ═══════════════════════════════════════════════════════════════ */

interface Card3DProps {
  children: ReactNode;
  className?: string;
  glareEnabled?: boolean;
}

export function Card3D({ children, className, glareEnabled = false }: Card3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Very subtle tilt — max 4 degrees
      const maxTilt = 4;
      const rotateY = ((x - centerX) / centerX) * maxTilt;
      const rotateX = -((y - centerY) / centerY) * maxTilt;

      setTilt({ rotateX, rotateY });

      if (glareEnabled) {
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        setGlarePos({ x: glareX, y: glareY });
      }
    },
    [glareEnabled]
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setGlarePos({ x: 50, y: 50 });
  }, []);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 0.5,
      }}
      style={{
        perspective: 800,
        transformStyle: 'preserve-3d',
      }}
      className={`card relative overflow-hidden ${className ?? ''}`}
    >
      {children}
      {glareEnabled && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[12px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.06) 0%, transparent 60%)`,
          }}
          aria-hidden="true"
        />
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   10. SectionDivider — Animated horizontal line divider
   ═══════════════════════════════════════════════════════════════ */

interface SectionDividerProps {
  className?: string;
}

export function SectionDivider({ className }: SectionDividerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });

  return (
    <div
      ref={ref}
      className={`mx-auto h-[1px] bg-border ${className ?? ''}`}
    >
      <motion.div
        className="h-full bg-border"
        initial={{ width: '0%' }}
        animate={isInView ? { width: '100%' } : { width: '0%' }}
        transition={{
          duration: DURATION_SLOW,
          ease: EASE_OUT_EXPO,
        }}
      />
    </div>
  );
}
