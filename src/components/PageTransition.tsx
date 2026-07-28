'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState, useCallback, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

/** Total duration for the wipe-in phase (ms) */
const WIPE_IN_DURATION = 0.2;

/** Total duration for the wipe-out phase (ms) */
const WIPE_OUT_DURATION = 0.15;

/** Pause between wipe-in completing and wipe-out starting (ms) */
const CONTENT_SWAP_DELAY = 50;

/** Subtle rotation angle in degrees applied during the wipe */
const WIPE_ROTATION = 2.5;

/** Easing curve — smooth deceleration for cinematic feel */
const WIPE_EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];

/* ═══════════════════════════════════════════════════════════════
   HOOK: useReducedMotion
   Respects the user's prefers-reduced-motion setting.
   ═══════════════════════════════════════════════════════════════ */

function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mql.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}

/* ═══════════════════════════════════════════════════════════════
   TRANSITION OVERLAY — Diagonal wipe with centered "H" logo pulse
   ═══════════════════════════════════════════════════════════════ */

type OverlayPhase = 'idle' | 'wiping-in' | 'wiping-out';

interface TransitionOverlayProps {
  phase: OverlayPhase;
}

function TransitionOverlay({ phase }: TransitionOverlayProps) {
  const isWipingIn = phase === 'wiping-in';
  const isWipingOut = phase === 'wiping-out';
  const isActive = isWipingIn || isWipingOut;

  return (
    <motion.div
      className="fixed inset-0 z-[9998] pointer-events-none"
      initial={false}
      animate={{
        clipPath: isWipingIn
          ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
          : isWipingOut
            ? 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)'
            : 'polygon(0 0, 0 0, 0 0)',
        rotate: isWipingIn
          ? WIPE_ROTATION
          : isWipingOut
            ? WIPE_ROTATION
            : 0,
      }}
      transition={{
        clipPath: {
          duration: isWipingIn ? WIPE_IN_DURATION : WIPE_OUT_DURATION,
          ease: WIPE_EASE,
        },
        rotate: {
          duration: isWipingIn ? WIPE_IN_DURATION : WIPE_OUT_DURATION,
          ease: WIPE_EASE,
        },
      }}
      style={{
        background: '#1A1A1A',
        transformOrigin: 'top left',
      }}
      aria-hidden="true"
    >
      {/* Centered pulsing "H" logo — visible only while overlay is active */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.span
          className="text-5xl font-bold tracking-[0.25em] text-white select-none"
          animate={
            isActive
              ? {
                  scale: [1, 1.08, 1],
                  opacity: [0.6, 1, 0.6],
                }
              : { scale: 1, opacity: 0 }
          }
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          H
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROGRESS BAR — Top-of-page loading indicator (NProgress-style)
   ═══════════════════════════════════════════════════════════════ */

interface ProgressBarProps {
  isLoading: boolean;
}

function ProgressBar({ isLoading }: ProgressBarProps) {
  return (
    <motion.div
      className="fixed top-0 left-0 h-[2px] z-[9999]"
      style={{ background: '#8B9DAF', transformOrigin: 'left' }}
      initial={{ scaleX: 0 }}
      animate={{
        scaleX: isLoading ? 1 : 0,
      }}
      transition={{
        scaleX: {
          duration: isLoading ? 0.8 : 0.3,
          ease: isLoading ? [0.22, 0.61, 0.36, 1] : [0.55, 0.06, 0.68, 0.19],
        },
      }}
      // We use width: 100% + scaleX instead of width animation
      // for better GPU compositing performance
      aria-hidden="true"
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE CONTENT — Animated content wrapper for AnimatePresence
   ═══════════════════════════════════════════════════════════════ */

interface PageContentProps {
  children: ReactNode;
  pathname: string;
  isTransitioning: boolean;
}

function PageContent({ children, pathname, isTransitioning }: PageContentProps) {
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.15,
        ease: 'easeOut',
      }}
      style={{
        // Prevent scroll jitter during transition
        overflow: isTransitioning ? 'hidden' : undefined,
      }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN: PageTransition
   Wraps children and orchestrates cinematic diagonal wipe transitions
   on route changes.
   ═══════════════════════════════════════════════════════════════ */

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  // Track the transition lifecycle
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [overlayPhase, setOverlayPhase] = useState<OverlayPhase>('idle');
  const [isLoading, setIsLoading] = useState(false);

  // We store the "displayed" pathname separately so we can delay
  // swapping the content until the wipe-in has completed.
  const [displayPathname, setDisplayPathname] = useState(pathname);

  // Ref to hold the timeout IDs for cleanup
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (swapTimeoutRef.current) clearTimeout(swapTimeoutRef.current);
    };
  }, []);

  // Detect pathname changes and trigger the transition sequence
  const prevPathnameRef = useRef(pathname);

  const startTransition = useCallback(
    (newPathname: string) => {
      // If reduced motion is preferred, swap immediately without animation
      if (prefersReducedMotion) {
        setDisplayPathname(newPathname);
        return;
      }

      // Don't restart if already transitioning
      if (isTransitioning) {
        setDisplayPathname(newPathname);
        return;
      }

      setIsTransitioning(true);
      setIsLoading(true);

      // Phase 1: Wipe in (cover the screen)
      setOverlayPhase('wiping-in');

      // After the wipe-in animation completes, swap the content
      const wipeInMs = WIPE_IN_DURATION * 1000;
      swapTimeoutRef.current = setTimeout(() => {
        setDisplayPathname(newPathname);

        // Brief pause to let the new content render
        timeoutRef.current = setTimeout(() => {
          // Phase 2: Wipe out (reveal new content)
          setOverlayPhase('wiping-out');

          // After wipe-out completes, clean up
          const wipeOutMs = WIPE_OUT_DURATION * 1000;
          timeoutRef.current = setTimeout(() => {
            setOverlayPhase('idle');
            setIsTransitioning(false);
            setIsLoading(false);
          }, wipeOutMs + 50);
        }, CONTENT_SWAP_DELAY);
      }, wipeInMs);
    },
    [prefersReducedMotion, isTransitioning]
  );

  useEffect(() => {
    // Skip the initial mount — only trigger on subsequent route changes
    if (prevPathnameRef.current === pathname) return;

    const prevPathname = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    // Don't animate if the pathname hasn't actually changed meaningfully
    if (prevPathname === pathname) return;

    startTransition(pathname);
  }, [pathname, startTransition]);

  return (
    <>
      {/* Progress bar at the top of the viewport */}
      <ProgressBar isLoading={isLoading} />

      {/* Diagonal wipe overlay */}
      <TransitionOverlay phase={overlayPhase} />

      {/* Page content with AnimatePresence for exit/enter animations */}
      <AnimatePresence mode="wait">
        <PageContent
          key={displayPathname}
          pathname={displayPathname}
          isTransitioning={isTransitioning}
        >
          {children}
        </PageContent>
      </AnimatePresence>
    </>
  );
}
