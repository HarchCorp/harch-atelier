"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { C as TOKENS } from "../components/tokens";

// ═══════════════════════════════════════════════════════════════
//  NOTIFICATION BELL (ConsoleShell top bar)
//
//  Replaces the static "3" badge bell in ConsoleShell with a real
//  notification system fed by /api/console/notifications.
//
//  Features:
//    • Bell icon with dynamic red unread-count badge (capped at 99+)
//    • Click → dropdown panel (320px, max-height 400px, scrollable)
//    • Each notification: type icon, title, body, time-ago, severity
//      colored left border
//    • "Mark all as read" button at the bottom
//    • Click notification → mark as read + navigate to `link`
//    • Empty state: "No notifications"
//    • Auto-refresh every 60 seconds (poll)
//    • Close on outside click / Escape
// ═══════════════════════════════════════════════════════════════

const POLL_INTERVAL_MS = 60_000;

// ─── DESIGN TOKENS ────────────────────────────────────────────────
const C = {
  ...TOKENS,
  surface: TOKENS.bg,
  surfaceAlt: TOKENS.bgHover,
  borderLight: TOKENS.border,
  textPrimary: TOKENS.text,
  textSecondary: TOKENS.textBody,
  textMuted: TOKENS.textMuted,
  textFaint: "#a3a3a3",
};

const FONT = {
  sans: C.fontSans,
  mono: C.fontMono,
};

const SEVERITY_COLOR: Record<string, string> = {
  info: "#737373",
  warning: C.warning,
  critical: C.danger,
};

// ─── TYPES ────────────────────────────────────────────────────────
export interface NotificationItem {
  id: string;
  type: string; // alert | report | system | threshold
  title: string;
  body: string;
  severity: string; // info | warning | critical
  read: boolean;
  link: string | null;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
  total: number;
}

interface NotificationBellProps {
  /** Optional override for the polling interval (mainly for tests). */
  pollIntervalMs?: number;
}

// ─── TIME-AGO HELPER ──────────────────────────────────────────────
function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const diff = Date.now() - then;
  if (diff < 0) return "just now";
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk}w ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(day / 365)}y ago`;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────
export function NotificationBell({ pollIntervalMs = POLL_INTERVAL_MS }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Fetch notifications from the API
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/console/notifications", { cache: "no-store" });
      if (!res.ok) {
        if (res.status !== 401) {
          setError(`Failed to load (${res.status})`);
        }
        return;
      }
      const data = (await res.json()) as NotificationsResponse;
      setItems(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + polling
  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, pollIntervalMs);
    return () => window.clearInterval(id);
  }, [refresh, pollIntervalMs]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Mark all as read
  const markAllRead = useCallback(async () => {
    if (unreadCount === 0) return;
    // Optimistic update
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await fetch("/api/console/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "all" }),
      });
    } catch {
      // ignore — best-effort
    }
  }, [unreadCount]);

  // Mark a single notification as read + navigate
  const handleNotificationClick = useCallback(async (n: NotificationItem) => {
    // Optimistic update for the clicked one
    if (!n.read) {
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await fetch("/api/console/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: n.id }),
        });
      } catch {
        // ignore — best-effort
      }
    }
    setOpen(false);
    if (n.link) {
      // Internal links start with "/" — same-tab navigation.
      // External links (http/https) open in a new tab.
      if (n.link.startsWith("/")) {
        window.location.href = n.link;
      } else {
        window.open(n.link, "_blank", "noopener,noreferrer");
      }
    }
  }, []);

  // Display value for the unread badge (cap at 99+)
  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "No new notifications"}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: C.textSecondary,
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = C.textPrimary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = C.textSecondary;
        }}
      >
        <BellGlyph size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              minWidth: "16px",
              height: "16px",
              padding: "0 4px",
              borderRadius: "8px",
              background: C.danger,
              color: "#ffffff",
              fontSize: "9px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT.mono,
              lineHeight: 1,
              boxShadow: "0 0 0 2px #ffffff",
            }}
          >
            {badgeLabel}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "320px",
            maxHeight: "400px",
            background: C.surface,
            border: `1px solid ${C.borderLight}`,
            borderRadius: "8px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 70,
            fontFamily: FONT.sans,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "10px 14px",
              borderBottom: `1px solid ${C.borderLight}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: C.surfaceAlt,
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontFamily: FONT.mono,
                color: C.textMuted,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Notifications
            </span>
            <span
              style={{
                fontSize: "10px",
                fontFamily: FONT.mono,
                color: unreadCount > 0 ? C.danger : C.textMuted,
                fontWeight: 600,
              }}
            >
              {unreadCount > 0 ? `${unreadCount} unread` : "all read"}
            </span>
          </div>

          {/* List (scrollable) */}
          <div
            ref={listRef}
            style={{
              flex: 1,
              overflowY: "auto",
              maxHeight: "300px",
            }}
          >
            {loading && items.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", fontFamily: FONT.mono, fontSize: "12px", color: C.textMuted }}>
                Loading…
              </div>
            ) : error ? (
              <div style={{ padding: "20px", textAlign: "center", fontFamily: FONT.mono, fontSize: "12px", color: C.danger }}>
                {error}
              </div>
            ) : items.length === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "13px", color: C.textSecondary, marginBottom: "4px", fontWeight: 500 }}>
                  No notifications
                </div>
                <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted }}>
                  You&apos;re all caught up
                </div>
              </div>
            ) : (
              items.map((n) => {
                const sevColor = SEVERITY_COLOR[n.severity] ?? SEVERITY_COLOR.info;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "12px 14px",
                      border: "none",
                      borderBottom: `1px solid #f4f4f5`,
                      borderLeft: `3px solid ${sevColor}`,
                      background: n.read ? "transparent" : "rgba(120,113,108,0.04)",
                      cursor: "pointer",
                      transition: "background 0.1s",
                      fontFamily: FONT.sans,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = n.read ? "transparent" : "rgba(120,113,108,0.04)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                      }}
                    >
                      <NotificationTypeIcon type={n.type} color={sevColor} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: n.read ? 500 : 600,
                            color: C.textPrimary,
                            lineHeight: 1.35,
                            marginBottom: "4px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {n.title}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: C.textSecondary,
                            lineHeight: 1.4,
                            marginBottom: "6px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {n.body}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "10px",
                              fontFamily: FONT.mono,
                              color: C.textMuted,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                            }}
                          >
                            {n.type}
                          </span>
                          <span
                            style={{
                              fontSize: "10px",
                              fontFamily: FONT.mono,
                              color: C.textFaint,
                            }}
                          >
                            {timeAgo(n.createdAt)}
                          </span>
                        </div>
                      </div>
                      {!n.read && (
                        <span
                          aria-hidden
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: C.danger,
                            flexShrink: 0,
                            marginTop: "4px",
                          }}
                        />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer — mark all as read */}
          {items.length > 0 && unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{
                padding: "10px 14px",
                borderTop: `1px solid ${C.borderLight}`,
                background: C.surfaceAlt,
                border: "none",
                cursor: "pointer",
                fontFamily: FONT.mono,
                fontSize: "11px",
                color: C.textSecondary,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = C.textPrimary;
                e.currentTarget.style.background = C.surface;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = C.textSecondary;
                e.currentTarget.style.background = C.surfaceAlt;
              }}
            >
              Mark all as read
            </button>
          )}

          {/* Custom scrollbar */}
          <style>{`
            .nb-scroll::-webkit-scrollbar { width: 6px; }
            .nb-scroll::-webkit-scrollbar-track { background: transparent; }
            .nb-scroll::-webkit-scrollbar-thumb { background: ${C.borderLight}; border-radius: 3px; }
            .nb-scroll::-webkit-scrollbar-thumb:hover { background: ${C.textMuted}; }
          `}</style>
        </div>
      )}
    </div>
  );
}

// ─── BELL GLYPH ───────────────────────────────────────────────────
function BellGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

// ─── TYPE ICONS ───────────────────────────────────────────────────
function NotificationTypeIcon({ type, color }: { type: string; color: string }) {
  // Pick a glyph per notification type
  //   alert     → bell
  //   report    → file
  //   threshold → triangle warning
  //   system    → info circle
  //   fallback  → dot
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (type === "alert") {
    return (
      <svg {...common} style={{ flexShrink: 0, marginTop: "1px" }}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    );
  }
  if (type === "report") {
    return (
      <svg {...common} style={{ flexShrink: 0, marginTop: "1px" }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    );
  }
  if (type === "threshold") {
    return (
      <svg {...common} style={{ flexShrink: 0, marginTop: "1px" }}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }
  if (type === "system") {
    return (
      <svg {...common} style={{ flexShrink: 0, marginTop: "1px" }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    );
  }
  return (
    <svg {...common} style={{ flexShrink: 0, marginTop: "1px" }}>
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

export default NotificationBell;
