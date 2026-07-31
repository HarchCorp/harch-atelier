"use client";

// ═══════════════════════════════════════════════════════════════
//  HARCH ATELIER — WhatsApp Settings Modal
//
//  Renders a centered modal dialog with:
//    • Phone number input (E.164, placeholder +212600000000)
//    • Enable/disable toggle (whatsappAlerts)
//    • Severity threshold selector (low | medium | high | critical)
//    • Test button → POST /api/user/whatsapp/test
//    • Save button → PATCH /api/user/whatsapp
//
//  On mount, GETs /api/user/whatsapp to hydrate the form. The modal
//  is purely presentational — the parent owns the open/close state.
//
//  Styling: C tokens only, inline styles, light theme, English,
//  no emojis. Matches the ConsoleShell aesthetic (mono labels,
//  surface = bg, 4px radii, 1px borders).
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useState } from "react";
import { C as TOKENS } from "@/app/atelier/components/tokens";

// Mirror of the local C aliases used in ConsoleShell (kept private to
// this file so we don't reach into ConsoleShell internals).
const C = {
  ...TOKENS,
  surface: TOKENS.bg,
  surfaceAlt: TOKENS.bgHover,
  border: TOKENS.border,
  borderLight: TOKENS.border,
  textPrimary: TOKENS.text,
  textSecondary: TOKENS.textBody,
  textMuted: TOKENS.textMuted,
  accent: TOKENS.accent, // stone-500
  accentDark: TOKENS.accentHover, // stone-600
  red: TOKENS.danger,
  redBg: TOKENS.dangerBg,
  green: "#059669",
  greenBg: "rgba(5,150,105,0.10)",
  amber: "#d97706",
  amberBg: "rgba(217,119,6,0.10)",
};

const FONT = {
  sans: C.fontSans,
  mono: C.fontMono,
};

type Severity = "low" | "medium" | "high" | "critical";

interface WhatsAppSettings {
  whatsappNumber: string;
  whatsappAlerts: boolean;
  alertSeverityThreshold: Severity;
  twilioConfigured: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const E164_RE = /^\+\d{6,15}$/;

const SEVERITY_OPTIONS: Array<{
  value: Severity;
  label: string;
  description: string;
}> = [
  {
    value: "low",
    label: "Low",
    description: "All negative alerts — high noise, max awareness.",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Mild-to-strong negative sentiment only.",
  },
  {
    value: "high",
    label: "High",
    description: "Strong negative sentiment + high risk. Recommended.",
  },
  {
    value: "critical",
    label: "Critical",
    description: "Only critical-risk events. Quiet channel.",
  },
];

export function WhatsAppSettingsModal({ open, onClose }: Props) {
  // ── Form state ───────────────────────────────────────────────────
  const [number, setNumber] = useState<string>("");
  const [enabled, setEnabled] = useState<boolean>(false);
  const [threshold, setThreshold] = useState<Severity>("high");
  const [twilioConfigured, setTwilioConfigured] = useState<boolean>(true);

  // ── Lifecycle state ──────────────────────────────────────────────
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [dirty, setDirty] = useState<boolean>(false);

  // ── Hydrate from the API on open ─────────────────────────────────
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setInfo(null);
    setDirty(false);

    (async () => {
      try {
        const res = await fetch("/api/user/whatsapp", { cache: "no-store" });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            (err as { error?: string }).error ?? `HTTP ${res.status}`,
          );
        }
        const data = (await res.json()) as WhatsAppSettings;
        if (cancelled) return;
        setNumber(data.whatsappNumber ?? "");
        setEnabled(Boolean(data.whatsappAlerts));
        setThreshold(data.alertSeverityThreshold ?? "high");
        setTwilioConfigured(Boolean(data.twilioConfigured));
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load settings");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // ── Handlers ─────────────────────────────────────────────────────
  const onNumberChange = (v: string) => {
    setNumber(v);
    setDirty(true);
  };
  const onToggleEnabled = () => {
    setEnabled((v) => !v);
    setDirty(true);
  };
  const onThresholdChange = (v: Severity) => {
    setThreshold(v);
    setDirty(true);
  };

  const onSave = async () => {
    setError(null);
    setInfo(null);

    // Validate phone locally before hitting the API.
    const trimmed = number.trim();
    if (enabled && !trimmed) {
      setError("Phone number required when alerts are enabled.");
      return;
    }
    if (trimmed) {
      const cleaned = trimmed.replace(/[^\d+]/g, "");
      if (!E164_RE.test(cleaned)) {
        setError(
          "Invalid phone. Use E.164 format: +<country><number> (e.g. +212600000000).",
        );
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/whatsapp", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsappNumber: trimmed || null,
          whatsappAlerts: enabled,
          alertSeverityThreshold: threshold,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error ?? `HTTP ${res.status}`,
        );
      }
      const data = (await res.json()) as WhatsAppSettings;
      setNumber(data.whatsappNumber ?? "");
      setEnabled(Boolean(data.whatsappAlerts));
      setThreshold(data.alertSeverityThreshold ?? "high");
      setTwilioConfigured(Boolean(data.twilioConfigured));
      setDirty(false);
      setInfo("Settings saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onTest = async () => {
    setError(null);
    setInfo(null);

    const trimmed = number.trim();
    if (!trimmed) {
      setError("Enter a phone number first (you can save it after).");
      return;
    }
    const cleaned = trimmed.replace(/[^\d+]/g, "");
    if (!E164_RE.test(cleaned)) {
      setError("Invalid phone. Use E.164 format: +<country><number>.");
      return;
    }

    setTesting(true);
    try {
      // Send the test to the number currently in the input — even if
      // the user hasn't saved it yet, so they can verify reachability
      // before committing.
      const res = await fetch("/api/user/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappNumber: cleaned }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        sent?: boolean;
        reason?: string;
        error?: string;
      };
      if (data.sent) {
        setInfo(`Test message sent to ${cleaned}.`);
      } else if (data.reason === "TWILIO_NOT_CONFIGURED") {
        setInfo(
          "Twilio is not configured on the server. Add TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_WHATSAPP_FROM in production to enable sending.",
        );
      } else {
        setError(
          data.error ?? data.reason ?? "Test message failed to send.",
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Test failed");
    } finally {
      setTesting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-modal-title"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "480px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "8px",
          boxShadow: C.shadowMd,
          fontFamily: FONT.sans,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <WhatsAppIcon size={18} color={C.green} />
            <h2
              id="whatsapp-modal-title"
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: 700,
                color: C.textPrimary,
                letterSpacing: "0.01em",
              }}
            >
              WhatsApp Alerts
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: C.textMuted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }}>
          {loading ? (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                color: C.textMuted,
                fontSize: "12px",
                fontFamily: FONT.mono,
              }}
            >
              Loading settings…
            </div>
          ) : (
            <>
              {/* Demo-mode banner */}
              {!twilioConfigured && (
                <div
                  style={{
                    padding: "10px 12px",
                    marginBottom: "16px",
                    background: C.amberBg,
                    border: `1px solid ${C.amber}`,
                    borderRadius: "4px",
                    fontSize: "11px",
                    color: C.amber,
                    fontFamily: FONT.sans,
                    lineHeight: 1.5,
                  }}
                >
                  <strong>Demo mode.</strong> Twilio credentials are not set on
                  the server. You can configure your preferences, but messages
                  won't be sent until TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and
                  TWILIO_WHATSAPP_FROM are added in production.
                </div>
              )}

              {/* Phone number */}
              <label
                style={{
                  display: "block",
                  fontSize: "10px",
                  fontFamily: FONT.mono,
                  color: C.textMuted,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={number}
                onChange={(e) => onNumberChange(e.target.value)}
                placeholder="+212600000000"
                spellCheck={false}
                autoComplete="tel"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontFamily: FONT.mono,
                  color: C.textPrimary,
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = C.accent;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                }}
              />
              <p
                style={{
                  margin: "6px 0 0 0",
                  fontSize: "10px",
                  color: C.textMuted,
                  fontFamily: FONT.sans,
                }}
              >
                E.164 format: country code + number, no spaces. Example:
                +212600000000.
              </p>

              {/* Enable toggle */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "20px",
                  padding: "12px",
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                  borderRadius: "4px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: C.textPrimary,
                      fontFamily: FONT.sans,
                    }}
                  >
                    Enable WhatsApp alerts
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: C.textSecondary,
                      fontFamily: FONT.sans,
                      marginTop: "2px",
                    }}
                  >
                    When enabled, you'll receive a message for every alert at
                    or above your threshold.
                  </div>
                </div>
                <button
                  onClick={onToggleEnabled}
                  role="switch"
                  aria-checked={enabled}
                  aria-label="Toggle WhatsApp alerts"
                  style={{
                    position: "relative",
                    width: "36px",
                    height: "20px",
                    borderRadius: "10px",
                    background: enabled ? C.green : C.border,
                    border: "none",
                    cursor: "pointer",
                    transition: "background 0.15s",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      left: enabled ? "18px" : "2px",
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: "#ffffff",
                      transition: "left 0.15s",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                    }}
                  />
                </button>
              </div>

              {/* Severity threshold */}
              <label
                style={{
                  display: "block",
                  fontSize: "10px",
                  fontFamily: FONT.mono,
                  color: C.textMuted,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  margin: "20px 0 8px 0",
                }}
              >
                Severity Threshold
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))" as React.CSSProperties["gridTemplateColumns"],
                  gap: "6px",
                }}
              >
                {SEVERITY_OPTIONS.map((opt) => {
                  const active = threshold === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => onThresholdChange(opt.value)}
                      aria-pressed={active}
                      style={{
                        textAlign: "left",
                        padding: "10px",
                        background: active ? C.greenBg : C.surfaceAlt,
                        border: `1px solid ${active ? C.green : C.border}`,
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: active ? C.green : C.textPrimary,
                          fontFamily: FONT.sans,
                        }}
                      >
                        {opt.label}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          color: C.textSecondary,
                          fontFamily: FONT.sans,
                          lineHeight: 1.4,
                        }}
                      >
                        {opt.description}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Error / Info messages */}
              {error && (
                <div
                  role="alert"
                  style={{
                    marginTop: "16px",
                    padding: "10px 12px",
                    background: C.redBg,
                    border: `1px solid ${C.red}`,
                    borderRadius: "4px",
                    fontSize: "11px",
                    color: C.red,
                    fontFamily: FONT.sans,
                    lineHeight: 1.5,
                  }}
                >
                  {error}
                </div>
              )}
              {info && !error && (
                <div
                  role="status"
                  style={{
                    marginTop: "16px",
                    padding: "10px 12px",
                    background: C.greenBg,
                    border: `1px solid ${C.green}`,
                    borderRadius: "4px",
                    fontSize: "11px",
                    color: C.green,
                    fontFamily: FONT.sans,
                    lineHeight: 1.5,
                  }}
                >
                  {info}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer — Test + Save + Close */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "14px 20px",
            borderTop: `1px solid ${C.border}`,
            background: C.surfaceAlt,
            borderBottomLeftRadius: "8px",
            borderBottomRightRadius: "8px",
          }}
        >
          <button
            onClick={onTest}
            disabled={loading || testing || saving}
            style={{
              padding: "8px 14px",
              background: "transparent",
              border: `1px solid ${C.border}`,
              borderRadius: "4px",
              color: C.textSecondary,
              fontSize: "12px",
              fontWeight: 600,
              fontFamily: FONT.sans,
              cursor: loading || testing || saving ? "not-allowed" : "pointer",
              opacity: loading || testing || saving ? 0.6 : 1,
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!loading && !testing && !saving) {
                e.currentTarget.style.borderColor = C.accent;
                e.currentTarget.style.color = C.accent;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.color = C.textSecondary;
            }}
          >
            {testing ? "Sending…" : "Test"}
          </button>

          <div style={{ flex: 1 }} />

          <button
            onClick={onClose}
            style={{
              padding: "8px 14px",
              background: "transparent",
              border: `1px solid ${C.border}`,
              borderRadius: "4px",
              color: C.textSecondary,
              fontSize: "12px",
              fontWeight: 600,
              fontFamily: FONT.sans,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            Close
          </button>
          <button
            onClick={onSave}
            disabled={loading || saving || testing}
            style={{
              padding: "8px 16px",
              background: dirty ? C.accentDark : C.accent,
              border: "none",
              borderRadius: "4px",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 600,
              fontFamily: FONT.sans,
              cursor: loading || saving || testing ? "not-allowed" : "pointer",
              opacity: loading || saving || testing ? 0.7 : 1,
              transition: "background 0.15s",
            }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── WhatsApp glyph (filled bubble + handset) ──────────────────────
function WhatsAppIcon({
  size = 18,
  color = "#059669",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13c-1.52 0-3.01-.41-4.3-1.18l-.31-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.55-3.7 8.24-8.24 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  );
}
