"use client";

/**
 * Harch Atelier — Live Alert Watcher (V13.1)
 *
 * Watches the signal-pulse `signals` stream and fires a sonner toast when:
 *  - a signal's severity is "critical" (always, once per signal id per session)
 *  - a signal's delta drops below -2.5 (sharp negative sentiment move)
 *
 * Mounted once at the page level so toasts fire regardless of which section
 * the user is viewing. Dedupes via a ref Set so the same signal doesn't
 * re-fire on every tick.
 *
 * SSR-safe: the hook is a no-op during SSR (no window); toasts only fire
 * client-side after the signal-pulse connects.
 */
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Bell, TrendingDown, AlertTriangle } from "lucide-react";
import type { WatchlistSignal } from "@/lib/mock-data";

/** Fire a toast for a qualifying signal. */
function fireAlertToast(s: WatchlistSignal, reason: "critical" | "sharp-drop"): void {
  const isCritical = reason === "critical";
  const title = isCritical
    ? `Critical signal · ${s.ticker}`
    : `Sharp sentiment drop · ${s.ticker}`;
  const description = `${s.signal} · Δ ${s.delta.toFixed(1)} · ${s.articles} articles`;

  if (isCritical) {
    toast.error(title, {
      description,
      icon: <AlertTriangle className="h-4 w-4" />,
      duration: 6000,
      action: {
        label: "View",
        onClick: () => {
          // Best-effort: open the watchlist section if the user clicks.
          const btn = document.querySelector<HTMLButtonElement>(
            'aside button[title="Watchlist"], aside button:has(span:contains("Watchlist"))',
          );
          btn?.click();
        },
      },
    });
  } else {
    toast.warning(title, {
      description,
      icon: <TrendingDown className="h-4 w-4" />,
      duration: 5000,
    });
  }
}

export function useAlertWatcher(signals: WatchlistSignal[], connected: boolean): void {
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!connected || signals.length === 0) return;

    for (const s of signals) {
      // Only fire once per signal id per session.
      if (firedRef.current.has(s.id)) continue;

      const isCritical = s.severity === "critical";
      const sharpDrop = s.delta <= -2.5;

      if (isCritical || sharpDrop) {
        firedRef.current.add(s.id);
        fireAlertToast(s, isCritical ? "critical" : "sharp-drop");
      }
    }
  }, [signals, connected]);

  // Reset fired set when the socket disconnects (so reconnection re-evaluates).
  useEffect(() => {
    if (!connected) {
      // Keep the set — we don't want to re-fire on reconnect for the same signals.
      // But cap it to avoid unbounded growth.
      if (firedRef.current.size > 200) {
        firedRef.current = new Set(Array.from(firedRef.current).slice(-100));
      }
    }
  }, [connected]);
}

/** Fire a one-off "system online" toast when the signal-pulse first connects. */
export function useConnectionToast(connected: boolean): void {
  const announcedRef = useRef(false);
  useEffect(() => {
    if (connected && !announcedRef.current) {
      announcedRef.current = true;
      toast.success("Live signal stream connected", {
        description: "GLM-4 pipeline · streaming watchlist signals in real time.",
        icon: <Bell className="h-4 w-4" />,
        duration: 4000,
      });
    }
  }, [connected]);
}
