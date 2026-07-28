"use client";

/**
 * useSignalPulse — live watchlist signal stream for Harch Atelier V12.0.
 *
 * Connects to the signal-pulse mini-service (socket.io on port 3003) through
 * the Caddy gateway. The gateway requires the request URL to carry
 * ?XTransformPort=3003, so we always connect to "/?XTransformPort=3003" —
 * never to a direct localhost:3003 URL.
 *
 * Returned shape:
 *   { signals: WatchlistSignal[], kpis: PulseKpis | null, connected: boolean }
 *
 * The hook is SSR-safe: socket.io is only created inside useEffect so the
 * first server-rendered paint is deterministic and matches the mock-data
 * baseline.
 */

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { watchlistSignals, type WatchlistSignal } from "@/lib/mock-data";

export type { WatchlistSignal };

/** Shape of the periodic KPI tick (every 30s from the mini-service). */
export interface PulseKpis {
  riskIndex: number;
  negativeShare: number;
  activeAlerts: number;
  ts: string;
}

export interface UseSignalPulseResult {
  signals: WatchlistSignal[];
  kpis: PulseKpis | null;
  connected: boolean;
}

/**
 * Subscribe to the signal-pulse stream. Initial state seeds from the static
 * `watchlistSignals` baseline so SSR + first client paint render the same
 * markup; once the socket connects, the snapshot replaces the seed and
 * `signal:update` patches stream in thereafter.
 */
export function useSignalPulse(): UseSignalPulseResult {
  const [signals, setSignals] = useState<WatchlistSignal[]>(watchlistSignals);
  const [kpis, setKpis] = useState<PulseKpis | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    // Always go through the gateway — NEVER a direct localhost:3003 URL.
    const socket: Socket = io("/?XTransformPort=3003", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
    });

    const onConnect = (): void => setConnected(true);
    const onDisconnect = (): void => setConnected(false);

    const onSnapshot = (next: WatchlistSignal[]): void => {
      if (Array.isArray(next)) {
        setSignals(next);
      }
    };

    const onSignalUpdate = (updated: WatchlistSignal): void => {
      if (!updated || typeof updated.id !== "string") return;
      setSignals((prev) =>
        prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)),
      );
    };

    const onKpisTick = (next: PulseKpis): void => {
      if (!next || typeof next.ts !== "string") return;
      setKpis(next);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("signals:snapshot", onSnapshot);
    socket.on("signal:update", onSignalUpdate);
    socket.on("kpis:tick", onKpisTick);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("signals:snapshot", onSnapshot);
      socket.off("signal:update", onSignalUpdate);
      socket.off("kpis:tick", onKpisTick);
      socket.disconnect();
      setConnected(false);
    };
  }, []);

  return { signals, kpis, connected };
}

export default useSignalPulse;
