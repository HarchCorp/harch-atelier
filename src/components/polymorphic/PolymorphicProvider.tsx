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
    totalScroll: 0, botDetected: false,
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
  as?: string;
}

/**
 * A box that automatically applies the polymorphic tokens:
 * - font-size scaled by baseFontSize (clamped 10-24px — NEMESIS defense)
 * - line-height scaled by density (clamped 0.7-1.3)
 * - transition speed scaled by animationSpeed (clamped 0.3-2.0)
 * - background tinted by backgroundWarmth (clamped 0-1)
 * - opacity scaled by contrast (clamped 0.7-1.0)
 *
 * NEMESIS defense: even if the context is hijacked with absurd values
 * (baseFontSize: -50, backgroundWarmth: NaN), the clamp prevents the
 * UI from becoming invisible or unusable. Number.isFinite guards
 * against NaN/Infinity injection.
 */
function safeClamp(v: number | undefined, min: number, max: number, fallback: number): number {
  if (v === undefined || !Number.isFinite(v)) return fallback;
  return Math.max(min, Math.min(max, v));
}

export function PolymorphicBox({ children, as: Tag = "div", style, ...rest }: PolymorphicBoxProps) {
  const ctx = usePolymorphic();
  const tokens = ctx?.tokens;

  const adaptiveStyle: React.CSSProperties = tokens
    ? {
        // NEMESIS defense: clamp every value — no matter what the context says,
        // font size stays between 10 and 24px. Text can never disappear.
        fontSize: `${safeClamp(tokens.baseFontSize, 10, 24, 15)}px`,
        lineHeight: String(safeClamp(1.5 * tokens.density, 1.0, 2.0, 1.5)),
        transitionDuration: `${Math.round(200 / safeClamp(tokens.animationSpeed, 0.3, 2.0, 1.0))}ms`,
        background: tokens.backgroundWarmth > 0
          ? `hsl(40, 20%, ${Math.max(90, 99 - safeClamp(tokens.backgroundWarmth, 0, 1, 0) * 3)}%)`
          : undefined,
        opacity: safeClamp(tokens.contrast, 0.7, 1.0, 1.0),
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
