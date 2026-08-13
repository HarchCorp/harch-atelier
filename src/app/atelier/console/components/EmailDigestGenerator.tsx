"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle,
  Mail, Plus, Send, Calendar,
  Check, FileText, FileCode, Clock, Users,
} from "lucide-react";

// ─── Design tokens (white / sage / charcoal) ────────────────────
const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const SAGE_BORDER = "rgba(74,123,95,0.25)";
const CHARCOAL = "#0A0A0A";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const POSITIVE = "#10B981";
const NEGATIVE = "#EF4444";

type Schedule = "weekly" | "monthly" | "custom";
type Format = "pdf" | "html";

interface DigestResponse {
  success: boolean;
  recipients: string[];
  preview: string;
  scheduledNext: string;
  scheduledNextLabel: string;
  schedule: Schedule;
  format: Format;
  scheduleLabel: string;
  subject: string;
  source: "preview" | "resend";
  sent: boolean;
  sendError: string | null;
  sendId: string | null;
  mode: "preview" | "send";
  test: boolean;
  companyName: string;
  status: "nominal" | "limited" | "no_data";
}

interface Feedback {
  type: "success" | "error" | "info";
  message: string;
}

const SCHEDULES: Array<{ key: Schedule; label: string; sub: string }> = [
  { key: "weekly",  label: "Hebdomadaire",  sub: "Lundi · 08h00" },
  { key: "monthly", label: "Mensuel",       sub: "1er du mois · 08h00" },
  { key: "custom",  label: "Personnalisé",  sub: "À configurer" },
];

const FORMATS: Array<{ key: Format; label: string; sub: string; icon: typeof FileText }> = [
  { key: "html", label: "HTML en ligne",     sub: "Contenu dans le corps",  icon: FileCode },
  { key: "pdf",  label: "PDF pièce jointe",  sub: "Rapport en attachement", icon: FileText },
];

const REVEAL_STEPS = [
  { id: "preview",    delay: 200 },
  { id: "recipients", delay: 400 },
  { id: "schedule",   delay: 600 },
  { id: "format",     delay: 800 },
  { id: "actions",    delay: 1000 },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ─── Client-side scheduledNext (Africa/Casablanca 08h00) ─────────
//  Mirrors the server computation so the UI updates instantly when
//  the user toggles the cadence — no refetch needed.
function computeScheduledNext(schedule: Schedule): Date {
  const now = new Date();
  if (schedule === "monthly") {
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const firstOfThisMonth = new Date(Date.UTC(year, month, 1, 7, 0, 0, 0));
    if (now.getTime() < firstOfThisMonth.getTime()) return firstOfThisMonth;
    return new Date(Date.UTC(year, month + 1, 1, 7, 0, 0, 0));
  }
  // weekly / custom → next Monday 07:00 UTC = 08:00 Casablanca
  const day = now.getUTCDay();
  const daysUntilMonday = ((8 - day) % 7) || 7;
  const next = new Date(now);
  next.setUTCHours(7, 0, 0, 0);
  next.setUTCDate(now.getUTCDate() + daysUntilMonday);
  return next;
}

function formatScheduledLabel(d: Date): string {
  return d.toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Casablanca",
  });
}

export function EmailDigestGenerator({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DigestResponse | null>(null);
  const [visible, setVisible] = useState<Set<string>>(new Set());

  // Editable config (client-side; only sent to the route on test/schedule)
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newRecipient, setNewRecipient] = useState("");
  const [schedule, setSchedule] = useState<Schedule>("weekly");
  const [format, setFormat] = useState<Format>("html");

  const [sending, setSending] = useState<"test" | "schedule" | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [recipientError, setRecipientError] = useState<string | null>(null);

  // Live scheduled-next label (recomputed when cadence changes)
  const scheduledNextLabel = useMemo(
    () => formatScheduledLabel(computeScheduledNext(schedule)),
    [schedule],
  );

  // ─── Initial preview fetch (mode=preview, no actual send) ───────
  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setVisible(new Set());
    setFeedback(null);
    try {
      const res = await fetch("/api/console/email-digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: [],
          schedule: "weekly",
          format: "html",
          mode: "preview",
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload: DigestResponse = await res.json();
      setData(payload);
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
  }, []);

  useEffect(() => { void generate(); }, [generate]);

  // ─── Recipient list management ─────────────────────────────────
  const addRecipient = () => {
    const email = newRecipient.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      setRecipientError("Adresse email invalide.");
      return;
    }
    if (recipients.includes(email)) {
      setRecipientError("Déjà dans la liste.");
      return;
    }
    setRecipients([...recipients, email]);
    setNewRecipient("");
    setRecipientError(null);
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter((r) => r !== email));
  };

  // ─── Export PDF (open preview HTML in a new window, then print) ─
  const handleExportPdf = useCallback(() => {
    if (!data?.preview) return;
    const w = window.open("", "_blank", "width=720,height=900");
    if (!w) {
      // Popup blocked — fall back to in-page print
      window.print();
      return;
    }
    w.document.open();
    w.document.write(data.preview);
    w.document.close();
    w.focus();
    setTimeout(() => {
      try { w.print(); } catch { /* no-op */ }
    }, 400);
  }, [data]);

  // ─── Send (test or schedule) ───────────────────────────────────
  //  "test" → sends to the FIRST recipient only (with [TEST] subject
  //           prefix) so the user can verify rendering before the
  //           real blast goes out to the full list.
  //  "schedule" → sends to ALL recipients now AND confirms the next
  //               automated cadence (the cron itself is wired by the
  //               ops team via vercel.crons-pro.json).
  const handleSend = async (mode: "test" | "schedule") => {
    if (recipients.length === 0) {
      setFeedback({ type: "error", message: "Ajoutez au moins un destinataire avant l'envoi." });
      return;
    }
    const sendTo = mode === "test" ? recipients.slice(0, 1) : recipients;
    setSending(mode);
    setFeedback(null);
    try {
      const res = await fetch("/api/console/email-digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: sendTo,
          schedule,
          format,
          mode: "send",
          test: mode === "test",
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(errBody.error ?? `HTTP ${res.status}`);
      }
      const payload: DigestResponse = await res.json();
      setData(payload);
      if (payload.sent) {
        if (mode === "test") {
          setFeedback({
            type: "success",
            message: `Test envoyé à ${sendTo[0]}${payload.sendId ? ` · ID ${payload.sendId.slice(0, 12)}` : ""}.`,
          });
        } else {
          setFeedback({
            type: "success",
            message: `Email envoyé à ${sendTo.length} destinataire(s). Prochaine échéance : ${payload.scheduledNextLabel}.`,
          });
        }
      } else {
        setFeedback({
          type: "error",
          message: payload.sendError ?? "Envoi échoué. Vérifiez la configuration RESEND_API_KEY.",
        });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Échec de l'envoi.",
      });
    } finally {
      setSending(null);
      setTimeout(() => setFeedback(null), 6000);
    }
  };

  const canExport = !!data && !!data.preview;
  const canSend = recipients.length > 0 && !loading && !sending;

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
          width: "100%", maxWidth: 960, maxHeight: "92vh",
          background: "#FFFFFF", borderRadius: 12,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header bar ─── */}
        <div
          id="email-digest-header"
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${BORDER}`,
            background: "#FAFAFA",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Mail size={18} style={{ color: SAGE }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>
              Synthèse Email Hebdomadaire
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
                color: data.source === "resend" ? SAGE : TEXT_MUTED,
                textTransform: "uppercase", letterSpacing: "0.08em",
                padding: "2px 6px",
                background: data.source === "resend" ? SAGE_BG : BORDER,
                borderRadius: 3,
              }}>
                {data.source === "resend" ? "Envoyé" : "Aperçu"}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleExportPdf}
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
              <Download size={13} /> Export PDF
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

        {/* ─── Body ─── */}
        <div
          id="email-digest-document"
          style={{
            flex: 1, overflowY: "auto",
            display: "flex", flexDirection: "row",
          }}
        >
          {loading && (
            <div style={{ flex: 1, textAlign: "center", padding: "60px 0" }}>
              <Loader2 size={32} style={{ color: SAGE, animation: "spin 1s linear infinite" }} />
              <p style={{ marginTop: 16, fontSize: 14, color: TEXT_MUTED, fontFamily: "'Inter', sans-serif" }}>
                Génération de l'aperçu...
              </p>
            </div>
          )}
          {error && !loading && (
            <div style={{ flex: 1, textAlign: "center", padding: "40px 0" }}>
              <AlertTriangle size={32} style={{ color: NEGATIVE }} />
              <p style={{ marginTop: 12, fontSize: 14, color: NEGATIVE, fontFamily: "'Inter', sans-serif" }}>{error}</p>
              <button
                onClick={() => void generate()}
                style={{
                  marginTop: 16, padding: "8px 16px",
                  background: CHARCOAL, color: "#FFFFFF",
                  border: "none", borderRadius: 6,
                  fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Réessayer
              </button>
            </div>
          )}
          {data && !loading && !error && (
            <>
              {/* ─── Left: email preview ─── */}
              <div style={{
                flex: 1.4, padding: "24px 28px",
                borderRight: `1px solid ${BORDER}`,
                minWidth: 0,
                background: "#FFFFFF",
              }}>
                <AnimatePresence>
                  {visible.has("preview") && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div style={{
                        fontSize: 10, fontFamily: "'Space Mono', monospace",
                        color: TEXT_MUTED, textTransform: "uppercase",
                        letterSpacing: "0.1em", marginBottom: 8,
                      }}>
                        Aperçu de l'email
                      </div>
                      <div style={{
                        border: `1px solid ${BORDER}`,
                        borderRadius: 8, overflow: "hidden",
                        background: "#FFFFFF",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                      }}>
                        {/* Mock email client header */}
                        <div style={{
                          padding: "12px 16px",
                          borderBottom: `1px solid ${BORDER}`,
                          background: "#FAFAFA",
                        }}>
                          <div style={{
                            display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
                          }}>
                            <div style={{
                              width: 8, height: 8, borderRadius: "50%", background: SAGE,
                            }} />
                            <span style={{
                              fontSize: 11, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
                            }}>
                              De : Harch Atelier &lt;atelier@harchcorp.com&gt;
                            </span>
                          </div>
                          <div style={{
                            fontSize: 13, fontWeight: 700, color: CHARCOAL,
                            marginBottom: 4, fontFamily: "'Inter', sans-serif",
                          }}>
                            {data.subject}
                          </div>
                          <div style={{
                            display: "flex", gap: 8, flexWrap: "wrap",
                            fontSize: 10, color: TEXT_MUTED,
                            fontFamily: "'Space Mono', monospace",
                          }}>
                            <span>À : {recipients.length > 0 ? recipients.join(", ") : "aperçu@harchcorp.com"}</span>
                            <span>·</span>
                            <span>{format === "pdf" ? "PDF pièce jointe" : "HTML en ligne"}</span>
                            <span>·</span>
                            <span>{data.companyName}</span>
                          </div>
                        </div>
                        {/* HTML preview */}
                        <iframe
                          srcDoc={data.preview}
                          title="Aperçu email"
                          style={{
                            width: "100%", height: 480,
                            border: "none", display: "block",
                            background: "#FAFAFA",
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ─── Right: config panel ─── */}
              <div style={{
                flex: 1, padding: "24px 22px",
                background: "#FAFAFA", minWidth: 0,
              }}>
                {/* Recipients */}
                <AnimatePresence>
                  {visible.has("recipients") && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ marginBottom: 24 }}
                    >
                      <div style={{
                        display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
                      }}>
                        <Users size={12} style={{ color: SAGE }} />
                        <span style={{
                          fontSize: 10, fontFamily: "'Space Mono', monospace",
                          color: TEXT_MUTED, textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}>
                          Destinataires ({recipients.length})
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                        <input
                          type="email"
                          value={newRecipient}
                          onChange={(e) => setNewRecipient(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { e.preventDefault(); addRecipient(); }
                          }}
                          placeholder="email@exemple.com"
                          style={{
                            flex: 1, padding: "8px 10px",
                            border: `1px solid ${BORDER}`, borderRadius: 6,
                            fontSize: 12, fontFamily: "'Space Mono', monospace",
                            color: CHARCOAL, background: "#FFFFFF", outline: "none",
                          }}
                        />
                        <button
                          onClick={addRecipient}
                          disabled={!newRecipient.trim()}
                          style={{
                            padding: "0 12px",
                            background: newRecipient.trim() ? SAGE : BORDER,
                            color: "#FFFFFF",
                            border: "none", borderRadius: 6,
                            cursor: newRecipient.trim() ? "pointer" : "not-allowed",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      {recipientError && (
                        <div style={{ fontSize: 11, color: NEGATIVE, marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>
                          {recipientError}
                        </div>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {recipients.length === 0 && (
                          <div style={{
                            fontSize: 11, color: TEXT_MUTED, fontStyle: "italic",
                            fontFamily: "'Inter', sans-serif",
                          }}>
                            Aucun destinataire. Ajoutez au moins une adresse.
                          </div>
                        )}
                        {recipients.map((r) => (
                          <div
                            key={r}
                            style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              padding: "6px 10px",
                              background: "#FFFFFF",
                              border: `1px solid ${BORDER}`, borderRadius: 4,
                            }}
                          >
                            <span style={{
                              fontSize: 11, fontFamily: "'Space Mono', monospace",
                              color: TEXT_BODY,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>
                              {r}
                            </span>
                            <button
                              onClick={() => removeRecipient(r)}
                              style={{
                                background: "transparent", border: "none", cursor: "pointer",
                                color: TEXT_MUTED, padding: 0, display: "flex",
                              }}
                              aria-label={`Retirer ${r}`}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Schedule */}
                <AnimatePresence>
                  {visible.has("schedule") && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ marginBottom: 24 }}
                    >
                      <div style={{
                        display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
                      }}>
                        <Calendar size={12} style={{ color: SAGE }} />
                        <span style={{
                          fontSize: 10, fontFamily: "'Space Mono', monospace",
                          color: TEXT_MUTED, textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}>
                          Cadence
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {SCHEDULES.map((s) => {
                          const active = schedule === s.key;
                          return (
                            <button
                              key={s.key}
                              onClick={() => setSchedule(s.key)}
                              style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "10px 12px",
                                background: active ? SAGE_BG : "#FFFFFF",
                                border: `1px solid ${active ? SAGE_BORDER : BORDER}`,
                                borderRadius: 6,
                                cursor: "pointer", textAlign: "left",
                                fontFamily: "inherit",
                                transition: "all 120ms ease",
                              }}
                            >
                              <div>
                                <div style={{
                                  fontSize: 12, fontWeight: 600,
                                  color: active ? SAGE : CHARCOAL,
                                  fontFamily: "'Inter', sans-serif",
                                }}>
                                  {s.label}
                                </div>
                                <div style={{
                                  fontSize: 10, color: TEXT_MUTED,
                                  fontFamily: "'Space Mono', monospace",
                                }}>
                                  {s.sub}
                                </div>
                              </div>
                              {active && <Check size={14} style={{ color: SAGE }} />}
                            </button>
                          );
                        })}
                      </div>
                      <div style={{
                        marginTop: 8, padding: "8px 10px",
                        background: "#FFFFFF",
                        border: `1px solid ${BORDER}`, borderRadius: 4,
                        display: "flex", alignItems: "center", gap: 6,
                      }}>
                        <Clock size={11} style={{ color: TEXT_MUTED, flexShrink: 0 }} />
                        <span style={{
                          fontSize: 10, color: TEXT_MUTED,
                          fontFamily: "'Space Mono', monospace",
                        }}>
                          Prochaine échéance : {scheduledNextLabel}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Format */}
                <AnimatePresence>
                  {visible.has("format") && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ marginBottom: 24 }}
                    >
                      <div style={{
                        display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
                      }}>
                        <FileText size={12} style={{ color: SAGE }} />
                        <span style={{
                          fontSize: 10, fontFamily: "'Space Mono', monospace",
                          color: TEXT_MUTED, textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}>
                          Format
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {FORMATS.map((f) => {
                          const active = format === f.key;
                          const Icon = f.icon;
                          return (
                            <button
                              key={f.key}
                              onClick={() => setFormat(f.key)}
                              style={{
                                flex: 1, padding: "10px",
                                background: active ? SAGE_BG : "#FFFFFF",
                                border: `1px solid ${active ? SAGE_BORDER : BORDER}`,
                                borderRadius: 6,
                                cursor: "pointer", textAlign: "left",
                                fontFamily: "inherit",
                                transition: "all 120ms ease",
                              }}
                            >
                              <div style={{
                                display: "flex", alignItems: "center", gap: 6, marginBottom: 4,
                              }}>
                                <Icon size={12} style={{ color: active ? SAGE : TEXT_MUTED }} />
                                <span style={{
                                  fontSize: 11, fontWeight: 600,
                                  color: active ? SAGE : CHARCOAL,
                                  fontFamily: "'Inter', sans-serif",
                                }}>
                                  {f.label}
                                </span>
                              </div>
                              <div style={{
                                fontSize: 9, color: TEXT_MUTED,
                                fontFamily: "'Space Mono', monospace",
                              }}>
                                {f.sub}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <AnimatePresence>
                  {visible.has("actions") && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div style={{
                        fontSize: 10, fontFamily: "'Space Mono', monospace",
                        color: TEXT_MUTED, textTransform: "uppercase",
                        letterSpacing: "0.1em", marginBottom: 8,
                      }}>
                        Actions
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <button
                          onClick={() => void handleSend("test")}
                          disabled={!canSend}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                            padding: "10px 14px",
                            background: canSend ? "#FFFFFF" : BORDER,
                            color: canSend ? CHARCOAL : TEXT_MUTED,
                            border: `1px solid ${canSend ? SAGE_BORDER : BORDER}`,
                            borderRadius: 8,
                            fontSize: 12, fontWeight: 600,
                            cursor: canSend ? "pointer" : "not-allowed",
                            fontFamily: "inherit",
                          }}
                        >
                          {sending === "test" ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Send size={13} />
                          )}
                          Envoyer un test
                        </button>
                        <button
                          onClick={() => void handleSend("schedule")}
                          disabled={!canSend}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                            padding: "10px 14px",
                            background: canSend ? CHARCOAL : BORDER,
                            color: canSend ? "#FFFFFF" : TEXT_MUTED,
                            border: "none", borderRadius: 8,
                            fontSize: 12, fontWeight: 600,
                            cursor: canSend ? "pointer" : "not-allowed",
                            fontFamily: "inherit",
                          }}
                        >
                          {sending === "schedule" ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Calendar size={13} />
                          )}
                          Programmer
                        </button>
                      </div>
                      {feedback && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{
                            marginTop: 12, padding: "10px 12px",
                            background:
                              feedback.type === "success" ? "rgba(16,185,129,0.06)" :
                              feedback.type === "error"   ? "rgba(239,68,68,0.06)" :
                                                            SAGE_BG,
                            border: `1px solid ${
                              feedback.type === "success" ? "rgba(16,185,129,0.25)" :
                              feedback.type === "error"   ? "rgba(239,68,68,0.25)" :
                                                            SAGE_BORDER
                            }`,
                            borderRadius: 6,
                            display: "flex", alignItems: "start", gap: 8,
                          }}
                        >
                          {feedback.type === "success" ? (
                            <Check size={13} style={{ color: POSITIVE, marginTop: 1, flexShrink: 0 }} />
                          ) : feedback.type === "error" ? (
                            <AlertTriangle size={13} style={{ color: NEGATIVE, marginTop: 1, flexShrink: 0 }} />
                          ) : (
                            <Clock size={13} style={{ color: SAGE, marginTop: 1, flexShrink: 0 }} />
                          )}
                          <span style={{
                            fontSize: 11, color: CHARCOAL, lineHeight: 1.5,
                            fontFamily: "'Inter', sans-serif",
                          }}>
                            {feedback.message}
                          </span>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
