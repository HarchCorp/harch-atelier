"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
//  usePriceStream — simulated real-time price feed via smart polling
//
//  Polls /api/trader/stream every `intervalMs` (default 3s) for the
//  requested tickers and exposes the latest snapshot as a
//  Record<ticker, PriceTick>. Designed for the Alpha Desk ticker
//  tape and the virtualized asset table.
//
//  V12 (real-bvc-prices): the stream API now returns an HONEST
//  data-source tag per ticker. We surface it as `source`:
//    • "live"        — a real price came back from Yahoo / Investing
//    • "cached"      — no live source, last DB price shown
//    • "unavailable" — no live source AND no DB history
//  The UI renders a small DATA SOURCE badge next to each price so
//  the trader knows whether they're seeing a real or a cached
//  number. This replaces the old random-walk simulation.
//
//  Smart polling details:
//   • `start()` is stable — it does not re-fire when `tickers`
//     changes. The current `tickers` array is read from a ref
//     inside the polling closure, so a ticker list change is
//     picked up on the NEXT poll without restarting the interval.
//   • `stop()` clears the interval and flips `isLive` to false.
//   • Network errors are swallowed so a transient 5xx / offline
//     blip does not kill the stream — the next tick retries.
//   • The hook does NOT auto-start. The caller decides when to go
//     live (Pause/Play button on the ticker tape).
//   • Unmount always calls `stop()` via the cleanup effect.
// ═══════════════════════════════════════════════════════════════

export interface PriceTick {
  ticker: string;
  price: number | null;
  change: number | null;
  sentiment: number | null;
  volume: number | null;
  source: "live" | "cached" | "unavailable";
  sourceEngine: "yahoo" | "investing" | null;
  exchange: string | null;
  currency: string;
  fetchedAt: string | null;
  timestamp: string;
}

interface StreamTicker {
  ticker: string;
  price: number | null;
  change: number | null;
  sentiment: number | null;
  volume: number | null;
  source: "live" | "cached" | "unavailable";
  sourceEngine: "yahoo" | "investing" | null;
  exchange: string | null;
  currency: string;
  fetchedAt: string | null;
}

interface StreamResponse {
  timestamp: string;
  tickers: StreamTicker[];
}

export function usePriceStream(tickers: string[], intervalMs = 3000) {
  const [ticks, setTicks] = useState<Record<string, PriceTick>>({});
  const [isLive, setIsLive] = useState(false);
  // Use ReturnType<typeof setInterval> so the type works in both
  // Node (Timer) and browser (number) runtimes without `any`.
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Latest tickers list — read inside the polling closure so the
  // interval keeps running across ticker-list changes.
  const tickersRef = useRef<string[]>(tickers);
  useEffect(() => {
    tickersRef.current = tickers;
  }, [tickers]);

  const poll = useCallback(async () => {
    const list = tickersRef.current;
    if (list.length === 0) return;
    try {
      const res = await fetch(
        `/api/trader/stream?tickers=${encodeURIComponent(list.join(","))}`,
        { cache: "no-store" },
      );
      if (!res.ok) return;
      const data = (await res.json()) as StreamResponse;
      const next: Record<string, PriceTick> = {};
      for (const t of data.tickers) {
        next[t.ticker] = { ...t, timestamp: data.timestamp };
      }
      setTicks(next);
    } catch {
      // Swallow transient network errors — keep polling on the
      // next tick. This is intentional for a simulated real-time
      // feed: a single 5xx or offline blip must not kill the tape.
    }
  }, []);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    setIsLive(true);
    void poll(); // immediate first poll — no need to wait `intervalMs`
    intervalRef.current = setInterval(() => {
      void poll();
    }, intervalMs);
  }, [poll, intervalMs]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsLive(false);
  }, []);

  // Always clean up on unmount — defensive against a caller that
  // forgets to call stop().
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return { ticks, isLive, start, stop };
}
