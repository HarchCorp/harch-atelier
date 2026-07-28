"use client";

import { useEffect, useState } from "react";
import type { WatchlistSignal } from "@/lib/mock-data";

export type { WatchlistSignal };

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

export function useSignalPulse(): UseSignalPulseResult {
  const [signals, setSignals] = useState<WatchlistSignal[]>([]);
  const [kpis, setKpis] = useState<PulseKpis | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    let socket: any = null;
    try {
      // Dynamic import to avoid crashing if socket.io-client isn't available
      import("socket.io-client").then(({ io }) => {
        try {
          socket = io("/?XTransformPort=3003", {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 3,
            timeout: 5000,
          });
          socket.on("connect", () => setConnected(true));
          socket.on("disconnect", () => setConnected(false));
          socket.on("signals:snapshot", (next: WatchlistSignal[]) => {
            if (Array.isArray(next)) setSignals(next);
          });
          socket.on("signal:update", (updated: WatchlistSignal) => {
            if (!updated || typeof updated.id !== "string") return;
            setSignals((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
          });
          socket.on("kpis:tick", (next: PulseKpis) => {
            if (!next || typeof next.ts !== "string") return;
            setKpis(next);
          });
        } catch {
          // Socket creation failed — dashboard works without live data
        }
      }).catch(() => {
        // socket.io-client not available — dashboard works without live data
      });
    } catch {
      // Import failed — dashboard works without live data
    }

    return () => {
      try {
        if (socket) {
          socket.disconnect();
        }
      } catch {}
      setConnected(false);
    };
  }, []);

  return { signals, kpis, connected };
}

export default useSignalPulse;
