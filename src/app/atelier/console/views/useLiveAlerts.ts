"use client";

// ═══════════════════════════════════════════════════════════════
//  useLiveAlerts — real-time alert feed hook
//
//  Connects to the Harch alert-service WebSocket (port 3003 via
//  Caddy's XTransformPort query param) and exposes a live stream
//  of crisis alerts to every console dashboard.
//
//  Behaviour:
//   1. On mount, fetches the initial feed from /api/console/alerts
//      (REST) — gives the user immediate content while the WS
//      handshake completes.
//   2. Opens a WebSocket to `/?XTransformPort=3003` (wss in prod).
//   3. Sends `{type:"auth", token:"<opaque>"}` then subscribes to
//      the "alerts" channel.
//   4. Incoming `{type:"alert", alert:{...}}` frames are merged into
//      the head of the alerts array (newest first). The hook returns
//      a `flashIds` set so dashboards can highlight fresh rows.
//   5. Heartbeat ping every 20s. If the socket drops, exponential
//      backoff reconnect (1s → 2s → 4s → 8s → 15s cap).
//   6. If WebSocket fails after 3 reconnect attempts OR is not
//      supported (SSR / very old browsers), falls back to 15-second
//      polling of /api/console/alerts.
//
//  Returns:
//    {
//      alerts: Alert[],
//      isLive: boolean,           // true iff WS is open + authed
//      transport: "ws" | "poll",
//      lastUpdate: Date,
//      flashIds: Set<string>,     // ids of alerts received in the
//                                 // last 4 seconds — for highlight
//      reconnecting: boolean,
//    }
//
//  Task ID: dataminr-realtime-crisis
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from "react";

export interface LiveAlert {
  id: string;
  type: "negative_article" | "risk_assessment" | "regulatory" | "signal";
  title: string;
  source: string;
  url?: string | null;
  sentiment?: "positive" | "neutral" | "negative" | null;
  sentimentScore?: number | null;
  severity: "critical" | "high" | "medium" | "low";
  timestamp: string;
  detectedAt?: string | null; // alias for timestamp, kept for
                              // backward-compat with existing dashboards
  details?: string;
  companyId?: string;
  companySlug?: string;
}

export interface UseLiveAlertsResult {
  alerts: LiveAlert[];
  isLive: boolean;
  transport: "ws" | "poll" | "init";
  lastUpdate: Date;
  flashIds: Set<string>;
  reconnecting: boolean;
  refresh: () => void;
}

const ALERT_SERVICE_PORT = 3003;
const POLL_INTERVAL_MS = 15_000;
const HEARTBEAT_INTERVAL_MS = 20_000;
const FLASH_TTL_MS = 4_000;
const MAX_ALERTS = 200;

function buildWsUrl(): string {
  if (typeof window === "undefined") return "";
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/?XTransformPort=${ALERT_SERVICE_PORT}`;
}

function getAuthToken(): string {
  if (typeof window === "undefined") return "ssr";
  // Prefer an explicit token if the host page stamped one. Otherwise
  // synthesise an opaque marker — the dev-mode WS server accepts any
  // non-empty token; the prod-mode server would validate against
  // ALERT_AUTH_TOKEN (set in the mini-service env).
  const stamped =
    (window as unknown as { __HARCH_ALERT_TOKEN__?: string }).__HARCH_ALERT_TOKEN__;
  if (stamped) return stamped;
  // Read the next-auth session cookie if present — opaque to us but
  // identifies the user. (We don't validate it server-side here; the
  // mini-service treats it as a bearer.)
  const m = document.cookie.match(/next-auth\.session-token=([^;]+)/);
  if (m) return m[1];
  return "harch_anonymous_live";
}

function normaliseAlert(raw: LiveAlert): LiveAlert {
  const ts = raw.timestamp ?? raw.detectedAt ?? new Date().toISOString();
  return {
    ...raw,
    timestamp: ts,
    detectedAt: ts,
    severity: raw.severity ?? "medium",
    type: raw.type ?? "negative_article",
    sentiment: raw.sentiment ?? "negative",
  };
}

export function useLiveAlerts(opts?: {
  enabled?: boolean;
  initialAlerts?: LiveAlert[];
}): UseLiveAlertsResult {
  const enabled = opts?.enabled ?? true;

  const [alerts, setAlerts] = useState<LiveAlert[]>(opts?.initialAlerts ?? []);
  const [isLive, setIsLive] = useState(false);
  const [transport, setTransport] = useState<"ws" | "poll" | "init">("init");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());
  const [reconnecting, setReconnecting] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const failedWsAttemptsRef = useRef(0);
  const fallbackToPollRef = useRef(false);
  const mountedRef = useRef(true);

  // ─── REST fetch (initial load + polling fallback) ────────────
  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/console/alerts", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { alerts?: LiveAlert[] };
      if (!data.alerts) return;
      const normalised = data.alerts.slice(0, MAX_ALERTS).map(normaliseAlert);
      if (!mountedRef.current) return;
      setAlerts(normalised);
      setLastUpdate(new Date());
    } catch {
      /* swallow — polling will retry */
    }
  }, []);

  // ─── Flash helper ────────────────────────────────────────────
  const flash = useCallback((id: string) => {
    setFlashIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    // Auto-clear after FLASH_TTL_MS
    const existing = flashTimersRef.current.get(id);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      setFlashIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      flashTimersRef.current.delete(id);
    }, FLASH_TTL_MS);
    flashTimersRef.current.set(id, timer);
  }, []);

  // ─── Merge new alert at the head, dedup by id ────────────────
  const mergeAlert = useCallback(
    (incoming: LiveAlert) => {
      const a = normaliseAlert(incoming);
      setAlerts((prev) => {
        const filtered = prev.filter((x) => x.id !== a.id);
        return [a, ...filtered].slice(0, MAX_ALERTS);
      });
      setLastUpdate(new Date());
      flash(a.id);
    },
    [flash],
  );

  // ─── Polling fallback ────────────────────────────────────────
  const startPolling = useCallback(() => {
    if (pollTimerRef.current) return;
    setTransport("poll");
    setIsLive(false);
    fetchAlerts();
    pollTimerRef.current = setInterval(fetchAlerts, POLL_INTERVAL_MS);
  }, [fetchAlerts]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  // ─── WebSocket connect ───────────────────────────────────────
  const connectWs = useCallback(() => {
    if (!mountedRef.current) return;
    if (fallbackToPollRef.current) return;
    if (typeof window === "undefined") return;
    if (typeof WebSocket === "undefined") {
      fallbackToPollRef.current = true;
      startPolling();
      return;
    }

    // Close any existing socket
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        /* ignore */
      }
      wsRef.current = null;
    }

    let ws: WebSocket;
    try {
      ws = new WebSocket(buildWsUrl());
    } catch {
      failedWsAttemptsRef.current += 1;
      if (failedWsAttemptsRef.current >= 3) {
        fallbackToPollRef.current = true;
        startPolling();
      } else {
        scheduleReconnect();
      }
      return;
    }
    wsRef.current = ws;
    if (reconnectAttemptRef.current > 0) setReconnecting(true);

    ws.onopen = () => {
      failedWsAttemptsRef.current = 0;
      reconnectAttemptRef.current = 0;
      setReconnecting(false);
      // Send auth immediately
      try {
        ws.send(JSON.stringify({ type: "auth", token: getAuthToken() }));
      } catch {
        /* ignore */
      }
      // Start heartbeat
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(JSON.stringify({ type: "ping" }));
          } catch {
            /* ignore */
          }
        }
      }, HEARTBEAT_INTERVAL_MS);
    };

    ws.onmessage = (ev) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(typeof ev.data === "string" ? ev.data : "") as Record<string, unknown>;
      } catch {
        return;
      }
      switch (msg.type) {
        case "auth_ok":
          setTransport("ws");
          setIsLive(true);
          stopPolling();
          try {
            ws.send(JSON.stringify({ type: "subscribe", channel: "alerts" }));
          } catch {
            /* ignore */
          }
          // Refresh the historical feed once on connect so the user
          // sees any alerts that arrived between page load and WS open.
          fetchAlerts();
          break;
        case "auth_failed":
          // WS auth rejected — drop to polling.
          fallbackToPollRef.current = true;
          try {
            ws.close();
          } catch {
            /* ignore */
          }
          startPolling();
          break;
        case "alert":
          if (msg.alert && typeof msg.alert === "object") {
            mergeAlert(msg.alert as LiveAlert);
          }
          break;
        case "subscribed":
        case "unsubscribed":
        case "pong":
        case "heartbeat":
          // No-op; these keep the channel alive.
          break;
        default:
          break;
      }
    };

    ws.onerror = () => {
      // The close handler will fire next; trigger reconnect there.
    };

    ws.onclose = () => {
      setIsLive(false);
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
      wsRef.current = null;
      if (!mountedRef.current) return;
      if (fallbackToPollRef.current) {
        startPolling();
        return;
      }
      failedWsAttemptsRef.current += 1;
      if (failedWsAttemptsRef.current >= 3) {
        fallbackToPollRef.current = true;
        startPolling();
      } else {
        scheduleReconnect();
      }
    };
  }, [fetchAlerts, mergeAlert, startPolling, stopPolling]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current) return;
    reconnectAttemptRef.current += 1;
    const attempt = reconnectAttemptRef.current;
    // Exponential backoff capped at 15s
    const delay = Math.min(1000 * 2 ** (attempt - 1), 15_000);
    setReconnecting(true);
    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null;
      connectWs();
    }, delay);
  }, [connectWs]);

  // ─── Lifecycle ───────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    if (!enabled) {
      return;
    }
    // Initial REST fetch so the feed has content immediately.
    fetchAlerts();
    // Then try the WebSocket.
    connectWs();

    return () => {
      mountedRef.current = false;
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {
          /* ignore */
        }
        wsRef.current = null;
      }
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      for (const t of flashTimersRef.current.values()) clearTimeout(t);
      flashTimersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const refresh = useCallback(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    isLive,
    transport,
    lastUpdate,
    flashIds,
    reconnecting,
    refresh,
  };
}
