"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle,
  MessageSquare, Phone, Send, Check, Bell,
  AlertOctagon, Calendar, CalendarDays,
} from "lucide-react";

const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const CHARCOAL = "#0A0A0A";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const NEGATIVE = "#EF4444";
const AMBER = "#F59E0B";
const INFO = "#3B82F6";

type AlertType = "crisis" | "daily" | "weekly";
type Severity = "critical" | "warning" | "info";

interface AlertItem {
  type: AlertType;
  message: string;
  timestamp: string;
  severity: Severity;
}

interface PreviewConfig {
  phoneNumber: string;
  alertTypes: { crisis: boolean; daily: boolean; weekly: boolean };
  enabled: boolean;
}

interface PreviewData {
  alerts: AlertItem[];
  config: PreviewConfig;
  source: "neon" | "demo";
  companyName: string;
}

const SEVERITY_COLOR: Record<Severity, string> = {
  critical: NEGATIVE,
  warning: AMBER,
  info: INFO,
};

const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "Critique",
  warning: "Veille",
  info: "Info",
};

const TYPE_META: Record<AlertType, { label: string; description: string; icon: typeof Bell }> = {
  crisis: {
    label: "Crise",
    description: "Déclenchée dès 5 mentions négatives en 24h. Notification immédiate.",
    icon: AlertOctagon,
  },
  daily: {
    label: "Quotidien",
    description: "Briefing matinal à 07h00. Score, mentions, top article.",
    icon: Calendar,
  },
  weekly: {
    label: "Hebdomadaire",
    description: "Synthèse du lundi à 08h00. Tendances sur 7 jours.",
    icon: CalendarDays,
  },
};

const REVEAL_STEPS = [
  { id: "phone", delay: 150 },
  { id: "bubbles", delay: 350 },
  { id: "config", delay: 500 },
  { id: "cards", delay: 700 },
  { id: "actions", delay: 900 },
];

export function WhatsappPreviewGenerator({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PreviewData | null>(null);

  // Local config state — mirrors server config but lets the user tweak
  // before hitting "Tester".
  const [phoneNumber, setPhoneNumber] = useState("");
  const [alertTypes, setAlertTypes] = useState({ crisis: true, daily: true, weekly: true });
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "sent" | "failed">("idle");
  const [visible, setVisible] = useState<Set<string>>(new Set());

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setVisible(new Set());
    setTestStatus("idle");
    try {
      const res = await fetch("/api/console/whatsapp-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phoneNumber || undefined, alertTypes }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload: PreviewData = await res.json();
      setData(payload);
      // Sync local config to server response (e.g. default phone)
      if (payload.config.phoneNumber && !phoneNumber) {
        setPhoneNumber(payload.config.phoneNumber);
      }
      setAlertTypes(payload.config.alertTypes);
      setLoading(false);
      for (const step of REVEAL_STEPS) {
        setTimeout(() => {
          setVisible((prev) => new Set(prev).add(step.id));
        }, step.delay);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec");
      setLoading(false);
    }
  }, [phoneNumber, alertTypes]);

  useEffect(() => { void generate(); }, [generate]);

  const handleTest = async () => {
    setTesting(true);
    setTestStatus("idle");
    try {
      const res = await fetch("/api/console/whatsapp-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phoneNumber || undefined, alertTypes }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload: PreviewData = await res.json();
      setData(payload);
      setTestStatus("sent");
    } catch {
      setTestStatus("failed");
    } finally {
      setTesting(false);
      setTimeout(() => setTestStatus("idle"), 3000);
    }
  };

  const toggleType = (key: keyof typeof alertTypes) => {
    setAlertTypes((prev) => ({ ...prev, [key]: !prev[key] }));
    setTestStatus("idle");
  };

  const canExport = !!data && data.alerts.length > 0;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(10,10,10,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          width: "100%", maxWidth: 880, maxHeight: "92vh",
          background: "#FFFFFF", borderRadius: 12,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div
          id="whatsapp-preview-header"
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${BORDER}`,
            background: "#FAFAFA",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MessageSquare size={18} style={{ color: SAGE }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>
              Aperçu Alerte WhatsApp
            </span>
            {loading && (
              <span style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 11, color: SAGE, fontFamily: "'Space Mono', monospace",
              }}>
                <Loader2 size={11} className="animate-spin" /> Génération...
              </span>
            )}
            {data && !loading && (
              <span style={{
                fontSize: 10, fontFamily: "'Space Mono', monospace",
                color: data.source === "neon" ? SAGE : TEXT_MUTED,
                textTransform: "uppercase", letterSpacing: "0.08em",
                padding: "2px 6px", background: SAGE_BG, borderRadius: 3,
              }}>
                {data.source === "neon" ? "Live" : "Démo"}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => window.print()}
              disabled={!canExport}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px",
                background: canExport ? CHARCOAL : BORDER,
                color: canExport ? "#FFFFFF" : TEXT_MUTED,
                border: "none", borderRadius: 6,
                fontSize: 12, fontWeight: 600, fontFamily: "inherit",
                cursor: canExport ? "pointer" : "not-allowed",
              }}
            >
              <Download size={13} /> PDF
            </button>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent", border: "none",
                cursor: "pointer", color: TEXT_MUTED,
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          id="whatsapp-preview-document"
          style={{
            flex: 1, overflowY: "auto", padding: "28px 32px",
            fontFamily: "'Inter', system-ui, sans-serif", color: CHARCOAL,
          }}
        >
          {loading && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <Loader2 size={32} style={{ color: SAGE, animation: "spin 1s linear infinite" }} />
              <p style={{ marginTop: 16, fontSize: 14, color: TEXT_MUTED }}>
                Préparation de l'aperçu...
              </p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <AlertTriangle size={32} style={{ color: NEGATIVE }} />
              <p style={{ marginTop: 12, fontSize: 14, color: NEGATIVE }}>{error}</p>
              <button
                onClick={generate}
                style={{
                  marginTop: 16, padding: "8px 16px",
                  background: CHARCOAL, color: "#FFFFFF",
                  border: "none", borderRadius: 6, fontSize: 13,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Réessayer
              </button>
            </div>
          )}

          {data && !loading && (
            <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 32, alignItems: "start" }}>

              {/* ───────── PHONE MOCKUP ───────── */}
              <AnimatePresence>
                {visible.has("phone") && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    <PhoneMockup alerts={data.alerts} companyName={data.companyName} bubblesVisible={visible.has("bubbles")} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ───────── RIGHT COLUMN: CONFIG + CARDS ───────── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Config panel */}
                <AnimatePresence>
                  {visible.has("config") && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: 20,
                        background: "#FAFAFA",
                        borderRadius: 8,
                        border: `1px solid ${BORDER}`,
                      }}
                    >
                      <div style={{
                        fontSize: 10, fontFamily: "'Space Mono', monospace",
                        color: TEXT_MUTED, textTransform: "uppercase",
                        letterSpacing: "0.1em", marginBottom: 12, fontWeight: 700,
                      }}>
                        Configuration
                      </div>

                      {/* Phone number input */}
                      <label style={{
                        display: "block", fontSize: 12, fontWeight: 600,
                        color: TEXT_BODY, marginBottom: 6,
                      }}>
                        Numéro destinataire
                      </label>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 12px", background: "#FFFFFF",
                        border: `1px solid ${BORDER}`, borderRadius: 6,
                        marginBottom: 16,
                      }}>
                        <Phone size={14} style={{ color: SAGE, flexShrink: 0 }} />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => { setPhoneNumber(e.target.value); setTestStatus("idle"); }}
                          placeholder="+212 6 00 00 00 00"
                          style={{
                            flex: 1, border: "none", outline: "none",
                            fontSize: 13, color: CHARCOAL,
                            fontFamily: "'Space Mono', monospace", background: "transparent",
                          }}
                        />
                      </div>

                      {/* Toggles */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                        {(["crisis", "daily", "weekly"] as AlertType[]).map((key) => (
                          <ToggleRow
                            key={key}
                            type={key}
                            checked={alertTypes[key]}
                            onToggle={() => toggleType(key)}
                          />
                        ))}
                      </div>

                      {/* Tester button */}
                      <button
                        onClick={handleTest}
                        disabled={testing || !data.config.enabled && !alertTypes.crisis && !alertTypes.daily && !alertTypes.weekly}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          width: "100%", padding: "10px 16px",
                          background: testing ? BORDER : SAGE,
                          color: testing ? TEXT_MUTED : "#FFFFFF",
                          border: "none", borderRadius: 6,
                          fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                          cursor: testing ? "not-allowed" : "pointer",
                          transition: "background 0.2s",
                        }}
                      >
                        {testing ? (
                          <><Loader2 size={14} className="animate-spin" /> Envoi...</>
                        ) : testStatus === "sent" ? (
                          <><Check size={14} /> Envoyé</>
                        ) : testStatus === "failed" ? (
                          <><AlertTriangle size={14} /> Échec</>
                        ) : (
                          <><Send size={14} /> Tester l'envoi</>
                        )}
                      </button>
                      <p style={{
                        fontSize: 11, color: TEXT_MUTED, marginTop: 8, lineHeight: 1.4,
                      }}>
                        Un message WhatsApp de test sera envoyé au numéro configuré. Désactivez les types d'alerte que vous ne souhaitez pas recevoir.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Alert type cards */}
                <AnimatePresence>
                  {visible.has("cards") && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div style={{
                        fontSize: 10, fontFamily: "'Space Mono', monospace",
                        color: TEXT_MUTED, textTransform: "uppercase",
                        letterSpacing: "0.1em", marginBottom: 10, fontWeight: 700,
                      }}>
                        Types d'alerte
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {(["crisis", "daily", "weekly"] as AlertType[]).map((key) => (
                          <AlertTypeCard
                            key={key}
                            type={key}
                            enabled={alertTypes[key]}
                            count={data.alerts.filter(a => a.type === key).length}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer actions */}
                <AnimatePresence>
                  {visible.has("actions") && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        display: "flex", gap: 8, paddingTop: 8,
                        borderTop: `1px solid ${BORDER}`,
                      }}
                    >
                      <button
                        onClick={() => window.print()}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "10px 20px",
                          background: CHARCOAL, color: "#FFFFFF",
                          border: "none", borderRadius: 8,
                          fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                          cursor: "pointer",
                        }}
                      >
                        <Download size={14} /> Exporter PDF
                      </button>
                      <button
                        onClick={generate}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "10px 16px",
                          background: "transparent", color: TEXT_BODY,
                          border: `1px solid ${BORDER}`, borderRadius: 8,
                          fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                          cursor: "pointer",
                        }}
                      >
                        <MessageSquare size={14} /> Régénérer
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
          )}
        </div>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
          body * { visibility: hidden; }
          #whatsapp-preview-document, #whatsapp-preview-document * { visibility: visible; }
          #whatsapp-preview-document { position: absolute; left: 0; top: 0; width: 100%; padding: 32px; }
          #whatsapp-preview-header { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
//  Phone mockup — 320×600 sage bezel, notch, WhatsApp chat
// ───────────────────────────────────────────────────────────────

function PhoneMockup({ alerts, companyName, bubblesVisible }: {
  alerts: AlertItem[];
  companyName: string;
  bubblesVisible: boolean;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: 320, height: 600,
        background: SAGE,
        borderRadius: 36,
        padding: 12,
        boxShadow: "0 12px 32px rgba(74,123,95,0.25), inset 0 0 0 2px rgba(255,255,255,0.08)",
      }}
    >
      {/* Notch */}
      <div style={{
        position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
        width: 90, height: 18, background: CHARCOAL,
        borderRadius: 12, zIndex: 5,
      }} />

      {/* Screen */}
      <div style={{
        width: "100%", height: "100%",
        background: "#EFEAE2",
        borderRadius: 26,
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        position: "relative",
      }}>

        {/* WhatsApp chat header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 12px",
          background: SAGE,
          color: "#FFFFFF",
          paddingTop: 28, // notch clearance
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Bell size={14} style={{ color: "#FFFFFF" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 700,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              HarchIQ
            </div>
            <div style={{
              fontSize: 10, opacity: 0.85,
              fontFamily: "'Space Mono', monospace",
            }}>
              en ligne
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "12px 10px",
          display: "flex", flexDirection: "column", gap: 8,
          background: "#EFEAE2",
          backgroundImage: "radial-gradient(rgba(74,123,95,0.04) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}>
          {alerts.length === 0 && (
            <div style={{
              textAlign: "center", padding: "40px 12px",
              fontSize: 11, color: TEXT_MUTED, fontFamily: "'Space Mono', monospace",
            }}>
              Aucune alerte active.
              <br />
              Activez au moins un type ci-contre.
            </div>
          )}

          <AnimatePresence>
            {bubblesVisible && alerts.map((alert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.15, duration: 0.3 }}
              >
                <ChatBubble alert={alert} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input bar (decorative) */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 10px",
          background: "#F0F0F0",
          borderTop: `1px solid ${BORDER}`,
        }}>
          <div style={{
            flex: 1, height: 28, borderRadius: 14,
            background: "#FFFFFF", border: `1px solid ${BORDER}`,
          }} />
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: SAGE,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Send size={13} style={{ color: "#FFFFFF" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ alert }: { alert: AlertItem }) {
  const sevColor = SEVERITY_COLOR[alert.severity];
  const time = new Date(alert.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{
      alignSelf: "flex-start",
      maxWidth: "88%",
      background: "#FFFFFF",
      borderRadius: 8,
      borderTopLeftRadius: 2,
      boxShadow: "0 1px 1px rgba(0,0,0,0.08)",
      overflow: "hidden",
      borderLeft: `3px solid ${sevColor}`,
    }}>
      {/* Type label */}
      <div style={{
        display: "flex", alignItems: "center", gap: 4,
        padding: "6px 10px 0",
        fontSize: 9, fontWeight: 700,
        color: sevColor,
        textTransform: "uppercase", letterSpacing: "0.08em",
        fontFamily: "'Space Mono', monospace",
      }}>
        {TYPE_META[alert.type].label} · {SEVERITY_LABEL[alert.severity]}
      </div>

      {/* Message body */}
      <div style={{
        padding: "4px 10px 6px",
        fontSize: 11.5,
        lineHeight: 1.45,
        color: CHARCOAL,
        fontFamily: "'Space Mono', monospace",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}>
        {alert.message}
      </div>

      {/* Timestamp + checks */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3,
        padding: "0 10px 5px",
        fontSize: 9, color: TEXT_MUTED,
      }}>
        <span>{time}</span>
        <Check size={10} style={{ color: "#34B7F1" }} />
        <Check size={10} style={{ color: "#34B7F1", marginLeft: -4 }} />
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
//  Toggle row
// ───────────────────────────────────────────────────────────────

function ToggleRow({ type, checked, onToggle }: {
  type: AlertType;
  checked: boolean;
  onToggle: () => void;
}) {
  const Icon = TYPE_META[type].icon;
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 10px",
      background: "#FFFFFF",
      border: `1px solid ${BORDER}`,
      borderRadius: 6,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon size={14} style={{ color: checked ? SAGE : TEXT_MUTED }} />
        <span style={{
          fontSize: 12, fontWeight: 600,
          color: checked ? CHARCOAL : TEXT_MUTED,
        }}>
          {TYPE_META[type].label}
        </span>
      </div>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={checked}
        aria-label={`Activer alerte ${TYPE_META[type].label}`}
        style={{
          width: 32, height: 18, borderRadius: 9,
          background: checked ? SAGE : "#D4D4D8",
          border: "none", cursor: "pointer",
          position: "relative", padding: 0,
          transition: "background 0.2s",
        }}
      >
        <span style={{
          position: "absolute", top: 2,
          left: checked ? 16 : 2,
          width: 14, height: 14, borderRadius: "50%",
          background: "#FFFFFF",
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
          transition: "left 0.2s",
        }} />
      </button>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
//  Alert type card
// ───────────────────────────────────────────────────────────────

function AlertTypeCard({ type, enabled, count }: {
  type: AlertType;
  enabled: boolean;
  count: number;
}) {
  const Icon = TYPE_META[type].icon;
  const meta = TYPE_META[type];
  return (
    <div style={{
      display: "flex", alignItems: "start", gap: 10,
      padding: "12px 14px",
      background: "#FFFFFF",
      border: `1px solid ${BORDER}`,
      borderRadius: 6,
      opacity: enabled ? 1 : 0.55,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 6,
        background: enabled ? SAGE_BG : "#FAFAFA",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={16} style={{ color: enabled ? SAGE : TEXT_MUTED }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
        }}>
          <span style={{
            fontSize: 13, fontWeight: 700, color: CHARCOAL,
          }}>
            {meta.label}
          </span>
          <span style={{
            fontSize: 10, fontFamily: "'Space Mono', monospace",
            color: enabled ? SAGE : TEXT_MUTED,
            padding: "1px 6px",
            background: enabled ? SAGE_BG : "#FAFAFA",
            borderRadius: 3,
          }}>
            {count} actif{count > 1 ? "s" : ""}
          </span>
        </div>
        <p style={{
          fontSize: 11, color: TEXT_MUTED,
          margin: "4px 0 0", lineHeight: 1.45,
        }}>
          {meta.description}
        </p>
      </div>
    </div>
  );
}
