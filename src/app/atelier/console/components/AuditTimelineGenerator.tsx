"use client";

// ═══════════════════════════════════════════════════════════════
//  AuditTimelineGenerator
//
//  Skill 19 — Journal d'Audit (Chronologie filtrable).
//  A vertical timeline of all governance actions performed by the
//  caller's team: logins, modifications, approvals, exports,
//  creations, deletions. Each entry shows a type icon, the acting
//  user's avatar (initials), a French action description, the
//  relative timestamp, and the originating IP.
//
//  Same popup pattern as BriefingGenerator (fixed overlay, scale
//  entrance, sections fade-in one by one with framer-motion).
//  White / sage / charcoal palette — this is a compliance tool,
//  not a crisis tool. NO emojis — Lucide icons only.
//
//  Layout:
//    a. Header bar — "Journal d'Audit" + entry count + CSV / PDF
//    b. Filters strip — search input + category dropdown + count
//    c. Vertical timeline — icon dot, avatar, label, meta, IP
//    d. Footer actions — Exporter CSV · Exporter PDF · Rafraîchir
//
//  Skill ID: SKILL-19-AUDIT-LOG
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle, RefreshCw, Search,
  LogIn, Edit3, CheckCheck, FileDown, PlusCircle, UserX,
  FileText, Filter, Shield,
} from "lucide-react";

// ─── Design tokens (NON-NEGOTIABLE per spec) ───────────────────
const WHITE = "#FFFFFF";
const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const SAGE_BORDER = "rgba(74,123,95,0.25)";
const CHARCOAL = "#0A0A0A";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const NEGATIVE = "#EF4444";
const AMBER = "#F59E0B";

// ─── Types — mirrors AuditEntry from route.ts ──────────────────
interface AuditEntry {
  id: string;
  action: string;
  resource: string;
  userId: string | null;
  userName: string;
  result: string;
  ipAddress: string | null;
  timestamp: string;
  metadata: Record<string, unknown> | null;
}

type AuditCategory =
  | "login"
  | "modification"
  | "approval"
  | "export"
  | "creation"
  | "deletion";

const CATEGORY_LABEL: Record<AuditCategory, string> = {
  login: "Connexions",
  modification: "Modifications",
  approval: "Approbations",
  export: "Exports",
  creation: "Créations",
  deletion: "Suppressions",
};

// Map raw AuditLog.action codes → governance category. Unmapped
// actions default to "creation" so the timeline never drops an
// entry silently.
const ACTION_TO_CATEGORY: Record<string, AuditCategory> = {
  login: "login",
  login_failed: "login",
  session_revoked: "login",
  invitation_accepted: "login",
  onboarding_complete: "login",
  company_settings_update: "modification",
  role_changed: "modification",
  request_annotated: "modification",
  whatsapp_import: "modification",
  master_code_activate: "modification",
  approval_requested: "approval",
  approval_approved: "approval",
  approval_rejected: "approval",
  report_export: "export",
  data_export_csv: "export",
  user_invite: "creation",
  agency_subclient_created: "creation",
  client_provisioned: "creation",
  employee_invited: "creation",
  commercial_created: "creation",
  master_code_generate: "creation",
  boss_bootstrap: "creation",
  demo_access: "creation",
  surgical_email_sent: "creation",
  briefing_generate: "creation",
  insights_generate: "creation",
  ai_probe: "creation",
  mcp_test: "creation",
  harchiq_ask: "creation",
  sanctions_screen: "creation",
  entity_graph_view: "creation",
  dossier_view: "creation",
  user_suspend: "deletion",
  master_code_failed: "deletion",
};

function categoryFor(action: string): AuditCategory {
  return ACTION_TO_CATEGORY[action] ?? "creation";
}

// French human-readable action descriptions.
const ACTION_LABEL: Record<string, string> = {
  login: "Connexion réussie",
  login_failed: "Échec de connexion",
  session_revoked: "Session révoquée",
  invitation_accepted: "Invitation acceptée",
  onboarding_complete: "Onboarding terminé",
  company_settings_update: "Paramètres modifiés",
  role_changed: "Rôle modifié",
  request_annotated: "Demande annotée",
  whatsapp_import: "Message WhatsApp importé",
  master_code_activate: "Code maître activé",
  master_code_generate: "Code maître généré",
  master_code_failed: "Échec code maître",
  approval_requested: "Approbation demandée",
  approval_approved: "Approbation accordée",
  approval_rejected: "Approbation refusée",
  report_export: "Rapport exporté",
  data_export_csv: "Données exportées (CSV)",
  user_invite: "Membre invité",
  user_suspend: "Utilisateur suspendu",
  agency_subclient_created: "Sous-client agence créé",
  client_provisioned: "Client provisionné",
  employee_invited: "Employé invité",
  commercial_created: "Commercial créé",
  boss_bootstrap: "Compte dirigeant initialisé",
  demo_access: "Accès démo accordé",
  surgical_email_sent: "Email chirurgical envoyé",
  briefing_generate: "Briefing généré",
  insights_generate: "Insights générés",
  ai_probe: "IA interrogée",
  mcp_test: "Test MCP effectué",
  harchiq_ask: "Question HarchIQ posée",
  sanctions_screen: "Screening sanctions effectué",
  entity_graph_view: "Graphe d'entités consulté",
  dossier_view: "Dossier consulté",
};

const CATEGORY_ICON: Record<AuditCategory, typeof LogIn> = {
  login: LogIn,
  modification: Edit3,
  approval: CheckCheck,
  export: FileDown,
  creation: PlusCircle,
  deletion: UserX,
};

// ─── Sections reveal cadence (BriefingGenerator pattern) ──────
const SECTIONS = [
  { id: "header", delay: 200 },
  { id: "filters", delay: 400 },
  { id: "timeline", delay: 600 },
  { id: "actions", delay: 800 },
];

// ─── Helpers ───────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const diff = Date.now() - t;
  if (diff < 0) return "à l'instant";
  const s = Math.floor(diff / 1000);
  if (s < 60) return `il y a ${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d} j`;
  const w = Math.floor(d / 7);
  if (w < 5) return `il y a ${w} sem`;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function fullDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function resultColor(result: string): string {
  if (result === "success") return SAGE;
  if (result === "denied") return AMBER;
  return NEGATIVE;
}

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsv(rows: AuditEntry[]): string {
  const header = ["Date", "Utilisateur", "Action", "Ressource", "Resultat", "Adresse IP"];
  const body = rows.map((e) => [
    fullDate(e.timestamp),
    e.userName,
    ACTION_LABEL[e.action] ?? e.action,
    e.resource,
    e.result,
    e.ipAddress ?? "—",
  ]);
  return [header, ...body]
    .map((r) => r.map(escapeCsv).join(","))
    .join("\n");
}

// ─── Component ─────────────────────────────────────────────────

export function AuditTimelineGenerator({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(true);
  const [filter, setFilter] = useState<AuditCategory | "all">("all");
  const [query, setQuery] = useState("");

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setEntries([]);
    setVisibleSections(new Set());
    setGenerating(true);
    try {
      const res = await fetch("/api/console/audit-timeline", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { entries: AuditEntry[] };
      setEntries(json.entries ?? []);
      setLoading(false);
      // Reveal sections one-by-one (BriefingGenerator pattern).
      for (const section of SECTIONS) {
        setTimeout(() => {
          setVisibleSections((prev) => new Set(prev).add(section.id));
          if (section.id === "actions") setGenerating(false);
        }, section.delay);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec");
      setLoading(false);
      setGenerating(false);
    }
  }, []);

  useEffect(() => {
    void generate();
  }, [generate]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (filter !== "all" && categoryFor(e.action) !== filter) return false;
      if (!q) return true;
      const label = ACTION_LABEL[e.action] ?? e.action;
      const hay =
        `${e.userName} ${e.action} ${label} ${e.resource} ${e.ipAddress ?? ""}`
          .toLowerCase();
      return hay.includes(q);
    });
  }, [entries, filter, query]);

  const categoryCounts = useMemo(() => {
    const counts: Record<AuditCategory, number> = {
      login: 0,
      modification: 0,
      approval: 0,
      export: 0,
      creation: 0,
      deletion: 0,
    };
    for (const e of entries) {
      counts[categoryFor(e.action)] += 1;
    }
    return counts;
  }, [entries]);

  async function exportCsv() {
    if (filtered.length === 0) return;
    const fileName = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    const csv = buildCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    // Best-effort: record the export in the audit log (Loi 09-08).
    try {
      await fetch("/api/console/export-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exportType: "audit-timeline",
          rowCount: filtered.length,
          fileName,
        }),
      });
    } catch {
      // Silent — audit logging is best-effort.
    }
  }

  function exportPdf() {
    window.print();
  }

  // ─── Render ────────────────────────────────────────────────
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(10,10,10,0.6)", backdropFilter: "blur(4px)",
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
          background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", borderBottom: `1px solid ${BORDER}`,
            background: "#FAFAFA",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Shield size={18} style={{ color: SAGE }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>
              Journal d'Audit
            </span>
            {generating && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: SAGE, fontFamily: "'Space Mono', monospace" }}>
                <Loader2 size={11} className="animate-spin" /> Collecte...
              </span>
            )}
            {!generating && entries.length > 0 && (
              <span style={{ fontSize: 11, color: TEXT_MUTED, fontFamily: "'Space Mono', monospace" }}>
                {entries.length} entrées
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={exportCsv}
              disabled={generating || entries.length === 0}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px",
                background: generating || entries.length === 0 ? BORDER : WHITE,
                color: generating || entries.length === 0 ? TEXT_MUTED : CHARCOAL,
                border: `1px solid ${BORDER}`, borderRadius: 6,
                fontSize: 12, fontWeight: 600,
                cursor: generating || entries.length === 0 ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              <Download size={13} /> CSV
            </button>
            <button
              onClick={exportPdf}
              disabled={generating || entries.length === 0}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px",
                background: generating || entries.length === 0 ? BORDER : CHARCOAL,
                color: generating || entries.length === 0 ? TEXT_MUTED : WHITE,
                border: "none", borderRadius: 6,
                fontSize: 12, fontWeight: 600,
                cursor: generating || entries.length === 0 ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              <FileText size={13} /> PDF
            </button>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent", border: "none", cursor: "pointer", color: TEXT_MUTED,
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1, overflowY: "auto", padding: "28px 32px",
            fontFamily: "'Inter', system-ui, sans-serif", color: CHARCOAL,
          }}
        >
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Loader2 size={32} style={{ color: SAGE, animation: "spin 1s linear infinite" }} />
              <p style={{ marginTop: 16, fontSize: 14, color: TEXT_MUTED }}>
                Collecte des actions de gouvernance...
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
                  background: CHARCOAL, color: WHITE, border: "none",
                  borderRadius: 6, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Réessayer
              </button>
            </div>
          )}

          {entries.length === 0 && !loading && !error && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Shield size={32} style={{ color: BORDER }} />
              <p style={{ marginTop: 12, fontSize: 14, color: TEXT_MUTED }}>
                Aucune action enregistrée pour le moment.
              </p>
            </div>
          )}

          {entries.length > 0 && !error && (
            <div id="audit-timeline-document">
              <AnimatePresence>
                {visibleSections.has("header") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 20 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <Shield size={14} style={{ color: SAGE }} />
                      <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: SAGE, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Conformité Loi 09-08
                      </span>
                    </div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: CHARCOAL, letterSpacing: "-0.02em" }}>
                      Journal d'Audit — Chronologie
                    </h1>
                    <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 4 }}>
                      100 dernières actions · toutes catégories confondues
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {visibleSections.has("filters") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 20, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}
                  >
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                      <Search size={13} style={{ position: "absolute", left: 10, color: TEXT_MUTED, pointerEvents: "none" }} />
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Rechercher (utilisateur, action, ressource, IP)..."
                        style={{
                          padding: "8px 12px 8px 30px", fontSize: 12,
                          border: `1px solid ${BORDER}`, borderRadius: 6,
                          outline: "none", width: 280, fontFamily: "inherit",
                          color: CHARCOAL, background: WHITE,
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", border: `1px solid ${BORDER}`, borderRadius: 6, background: WHITE }}>
                      <Filter size={12} style={{ color: TEXT_MUTED }} />
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as AuditCategory | "all")}
                        style={{
                          border: "none", outline: "none", fontSize: 12,
                          background: "transparent", color: CHARCOAL,
                          fontFamily: "inherit", cursor: "pointer", padding: 0,
                        }}
                      >
                        <option value="all">Toutes les catégories</option>
                        {(Object.keys(CATEGORY_LABEL) as AuditCategory[]).map((c) => (
                          <option key={c} value={c}>
                            {CATEGORY_LABEL[c]} ({categoryCounts[c]})
                          </option>
                        ))}
                      </select>
                    </div>
                    <span style={{ fontSize: 11, color: TEXT_MUTED, fontFamily: "'Space Mono', monospace", marginLeft: "auto" }}>
                      {filtered.length} / {entries.length}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {visibleSections.has("timeline") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ position: "relative", paddingTop: 4 }}
                  >
                    {/* vertical guide line */}
                    <div style={{ position: "absolute", left: 23, top: 8, bottom: 8, width: 1, background: BORDER }} />
                    {filtered.length === 0 && (
                      <div style={{ padding: "20px 0", textAlign: "center", fontSize: 12, color: TEXT_MUTED }}>
                        Aucune entrée ne correspond aux filtres.
                      </div>
                    )}
                    {filtered.map((entry, idx) => {
                      const cat = categoryFor(entry.action);
                      const Icon = CATEGORY_ICON[cat];
                      const label = ACTION_LABEL[entry.action] ?? entry.action;
                      const rc = resultColor(entry.result);
                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, delay: Math.min(idx * 0.02, 0.4) }}
                          style={{ display: "flex", gap: 14, padding: "10px 0", position: "relative" }}
                        >
                          {/* icon dot on the line */}
                          <div
                            style={{
                              width: 36, height: 36, borderRadius: "50%",
                              background: WHITE, border: `1.5px solid ${SAGE_BORDER}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0, zIndex: 1, position: "relative",
                            }}
                          >
                            <Icon size={15} style={{ color: SAGE }} />
                          </div>
                          {/* body */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <div
                                style={{
                                  width: 22, height: 22, borderRadius: "50%",
                                  background: SAGE_BG, color: SAGE,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 9, fontWeight: 700, flexShrink: 0,
                                  fontFamily: "'Space Mono', monospace",
                                }}
                              >
                                {initials(entry.userName)}
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 600, color: CHARCOAL }}>
                                {entry.userName}
                              </span>
                              <span
                                style={{
                                  display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                                  background: rc, flexShrink: 0,
                                }}
                                title={entry.result}
                              />
                              <span
                                style={{
                                  fontSize: 10, fontFamily: "'Space Mono', monospace",
                                  color: TEXT_MUTED, marginLeft: "auto", whiteSpace: "nowrap",
                                }}
                                title={fullDate(entry.timestamp)}
                              >
                                {relativeTime(entry.timestamp)}
                              </span>
                            </div>
                            <div style={{ fontSize: 13, color: CHARCOAL, lineHeight: 1.5 }}>
                              {label}
                            </div>
                            <div
                              style={{
                                display: "flex", gap: 10, marginTop: 4, fontSize: 10,
                                color: TEXT_MUTED, fontFamily: "'Space Mono', monospace",
                                flexWrap: "wrap",
                              }}
                            >
                              <span title="Ressource">ressource: {entry.resource || "—"}</span>
                              {entry.ipAddress && (
                                <span title="Adresse IP">ip: {entry.ipAddress}</span>
                              )}
                              <span title="Catégorie" style={{ color: SAGE }}>
                                {CATEGORY_LABEL[cat].toLowerCase()}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {visibleSections.has("actions") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: "flex", gap: 8, paddingTop: 20,
                      marginTop: 16, borderTop: `1px solid ${BORDER}`,
                    }}
                  >
                    <button
                      onClick={exportCsv}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "10px 20px", background: CHARCOAL, color: WHITE,
                        border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      <Download size={14} /> Exporter CSV
                    </button>
                    <button
                      onClick={exportPdf}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "10px 16px", background: "transparent", color: CHARCOAL,
                        border: `1px solid ${BORDER}`, borderRadius: 8,
                        fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      <FileText size={14} /> Exporter PDF
                    </button>
                    <button
                      onClick={generate}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "10px 16px", background: "transparent", color: TEXT_BODY,
                        border: `1px solid ${BORDER}`, borderRadius: 8,
                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                        fontFamily: "inherit", marginLeft: "auto",
                      }}
                    >
                      <RefreshCw size={14} /> Rafraîchir
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {generating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16 }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: SAGE, animation: "pulse 1s infinite" }} />
                  <span style={{ fontSize: 11, color: SAGE, fontFamily: "'Space Mono', monospace" }}>
                    Construction de la chronologie...
                  </span>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } } @media print { body * { visibility: hidden; } #audit-timeline-document, #audit-timeline-document * { visibility: visible; } #audit-timeline-document { position: absolute; left: 0; top: 0; width: 100%; padding: 32px; } }`}</style>
    </div>
  );
}
