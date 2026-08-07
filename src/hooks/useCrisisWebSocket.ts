"use client";

import { useState, useEffect, useCallback } from "react";
import { io, type Socket } from "socket.io-client";

// ═══════════════════════════════════════════════════════════════
//  useCrisisWebSocket — real-time crisis alert hook
//
//  Connects to the crisis-ws mini-service (port 3003) via the
//  gateway: io("/?XTransformPort=3003")
//
//  Returns:
//    - liveAlerts: new alerts pushed since connection
//    - connected: boolean — is the WebSocket alive?
//    - acknowledge: (alertId) → notify other clients
//
//  N(47,50,40) — Real-time Crisis WebSocket
// ═══════════════════════════════════════════════════════════════

export interface LiveAlert {
  id: string;
  title: string;
  source: string;
  url?: string | null;
  sentimentScore: number | null;
  publishedAt: string | null;
  language?: string | null;
  severity: "critical" | "warning" | "watch" | "info";
}

export function useCrisisWebSocket(companyId: string | null | undefined) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [liveAlerts, setLiveAlerts] = useState<LiveAlert[]>([]);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!companyId) return;

    // Connect via the gateway (XTransformPort routes to port 3003)
    const s = io("/?XTransformPort=3003", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    });

    setSocket(s);

    s.on("connect", () => {
      setConnected(true);
      s.emit("crisis:subscribe", { companyId });
    });

    s.on("disconnect", () => {
      setConnected(false);
    });

    s.on("crisis:alert", (data: { alerts: LiveAlert[]; count: number; timestamp: string }) => {
      setLiveAlerts((prev) => {
        // Deduplicate by alert ID
        const existingIds = new Set(prev.map((a) => a.id));
        const newOnes = data.alerts.filter((a) => !existingIds.has(a.id));
        return [...newOnes, ...prev].slice(0, 50); // cap at 50
      });
    });

    s.on("crisis:acknowledged", (data: { alertId: string; acknowledgedBy: string }) => {
      setAcknowledgedAlerts((prev) => new Set(prev).add(data.alertId));
    });

    return () => {
      s.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [companyId]);

  const acknowledge = useCallback(
    (alertId: string) => {
      socket?.emit("crisis:acknowledge", { alertId });
      setAcknowledgedAlerts((prev) => new Set(prev).add(alertId));
    },
    [socket],
  );

  const clearAlerts = useCallback(() => {
    setLiveAlerts([]);
  }, []);

  return {
    connected,
    liveAlerts,
    acknowledgedAlerts,
    acknowledge,
    clearAlerts,
  };
}
