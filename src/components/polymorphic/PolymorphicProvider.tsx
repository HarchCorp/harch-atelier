"use client";

import { useState, useEffect, useMemo, createContext, useContext, type ReactNode } from "react";
import {
  getBehaviorTracker,
  generateTokens,
  type PolymorphicTokens,
  type BehaviorSignals,
} from "@/lib/polymorphic/engine";

// ═══════════════════════════════════════════════════════════════
//  POLYMORPHIC PROVIDER — React context for dynamic UI tokens
//
//  Wrap any part of the app with <PolymorphicProvider> to make
//  all child <PolymorphicBox> components adapt to user behavior.
//
//  Usage:
//    <PolymorphicProvider>
//      <PolymorphicBox>Adapts to user behavior</PolymorphicBox>
//    </PolymorphicProvider>
//
//  The provider tracks behavior signals passively (clicks, scrolls,
//  dwell time) and re-computes tokens every 2 seconds. No data
//  leaves the browser.
// ═══════════════════════════════════════════════════════════════

interface PolymorphicContextValue {
  tokens: PolymorphicTokens;
  signals: BehaviorSignals;
}

const PolymorphicContext = createContext<PolymorphicContextValue | null>(null);

export function usePolymorphic(): PolymorphicContextValue | null {
  return useContext(PolymorphicContext);
}

export function PolymorphicProvider({ children }: { children: ReactNode }) {
  const [signals, setSignals] = useState<BehaviorSignals>({
    clickVelocity: 0,
    scrollVelocity: 0,
    dwellTime: 0,
    errorCount: 0,
    sessionDuration: 0,
    totalClicks: 0,
    totalScroll: 0,
  });

  useEffect(() => {
    const tracker = getBehaviorTracker();
    const update = () => setSignals(tracker.getSignals());
    update();
    const unsubscribe = tracker.subscribe(update);

    // Also update every 2s (session duration changes even without clicks)
    const interval = setInterval(update, 2000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const tokens = useMemo(() => generateTokens(signals), [signals]);

  return (
    <PolymorphicContext.Provider value={{ tokens, signals }}>
      {children}
    </PolymorphicContext.Provider>
  );
}

// ─── PolymorphicBox — a div that auto-adapts ─────────────────────

interface PolymorphicBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Override the tag (default: div). */
  as?: keyof JSX.IntrinsicElements;
}

/**
 * A box that automatically applies the polymorphic tokens:
 * - font-size scaled by baseFontSize
 * - line-height scaled by density
 * - transition speed scaled by animationSpeed
 * - background tinted by backgroundWarmth
 *
 * Pass any standard div props (style, className, onClick, etc.).
 */
export function PolymorphicBox({ children, as: Tag = "div", style, ...rest }: PolymorphicBoxProps) {
  const ctx = usePolymorphic();
  const tokens = ctx?.tokens;

  const adaptiveStyle: React.CSSProperties = tokens
    ? {
        fontSize: `${tokens.baseFontSize}px`,
        lineHeight: String(1.5 * tokens.density),
        transitionDuration: `${Math.round(200 / tokens.animationSpeed)}ms`,
        // Warmth: shift background slightly toward warm tones
        background: tokens.backgroundWarmth > 0
          ? `hsl(40, 20%, ${99 - tokens.backgroundWarmth * 3}%)`
          : undefined,
        // Contrast: scale opacity slightly for fatigue
        opacity: tokens.contrast,
      }
    : {};

  return (
    // @ts-expect-error — dynamic tag
    <Tag style={{ ...adaptiveStyle, ...style }} {...rest}>
      {children}
    </Tag>
  );
}

// ─── ArchetypeBadge — shows the current inferred archetype ────────

export function ArchetypeBadge() {
  const ctx = usePolymorphic();
  if (!ctx) return null;

  const { archetype, reason } = ctx.tokens;
  const colors: Record<string, string> = {
    beginner: "#3b82f6",
    standard: "#71717a",
    power: "#10b981",
    skimmer: "#f59e0b",
    reader: "#8b5cf6",
  };
  const color = colors[archetype] || "#71717a";

  return (
    <div
      title={reason}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "3px 8px",
        borderRadius: "4px",
        background: `${color}15`,
        color,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      <div style={{
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: color,
        animation: "pulse 2s infinite",
      }} />
      {archetype}
    </div>
  );
}
