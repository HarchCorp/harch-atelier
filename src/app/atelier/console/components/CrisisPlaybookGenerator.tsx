"use client";

// ═══════════════════════════════════════════════════════════════
//  CrisisPlaybookGenerator
//
//  Skill 17 — Playbook de Crise.
//
//  Builds a structured crisis response playbook from one of five
//  crisis archetypes (boycott / product / executive / regulatory /
//  cybersecurity). The Dircom opens the popup, picks a crisis type,
//  and the route returns a 4-phase playbook (Détection & Confinement
//  → Communication Publique → Remédiation & Action → Sortie &
//  Apprentissage) with action items + ready-to-use communication
//  templates.
//
//  Same popup pattern as BriefingGenerator (fixed overlay, scale
//  entrance, sections fade-in one by one with framer-motion).
//  White / sage / charcoal palette. Space Mono for meta + Inter
//  for body. Lucide icons only, no emojis.
//
//  Layout:
//    a. Header bar — "Playbook de Crise" + status + actions
//    b. Selector screen — 5 crisis type cards (icon / label / blurb)
//    c. Playbook screen:
//       • Document header (crisis label + date + blurb)
//       • Vertical timeline — 4 phases (left gutter rail + dot)
//         For each phase:
//           - Name + timeline badge
//           - Action items (checkbox + title + owner chip +
//             priority badge + description)
//           - Communication templates (collapsible text blocks
//             with copy button)
//    d. Footer actions — Personnaliser / Exporter PDF / Réinitialiser
//
//  "Personnaliser" mode swaps the read-only action + template fields
//  for inputs/textareas so the Dircom can tailor the playbook before
//  exporting. Edits live in local state only (no persistence) — they
//  ship to the PDF on export.
//
//  Print CSS isolates #crisis-playbook-document for window.print().
//
//  Skill ID: SKILL-17-CRISIS-PLAYBOOK
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle, RefreshCw, Copy, Check,
  ShieldAlert, Megaphone, PackageX, UserCog, Scale, Lock,
  Pencil, ChevronDown, ChevronRight, Clock, UserSquare2,
  FileText, ArrowLeft, CircleAlert,
} from "lucide-react";

// ─── Design tokens (NON-NEGOTIABLE per spec) ───────────────────
const WHITE = "#FFFFFF";
const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const SAGE_BG_STRONG = "rgba(74,123,95,0.14)";
const SAGE_BORDER = "rgba(74,123,95,0.25)";
const CHARCOAL = "#0A0A0A";
const CHARCOAL_BG = "rgba(10,10,10,0.04)";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const AMBER = "#F59E0B";
const AMBER_BG = "rgba(245,158,11,0.12)";
const AMBER_BORDER = "rgba(245,158,11,0.30)";
const RED = "#DC2626";
const RED_BG = "rgba(220,38,38,0.10)";
const RED_BORDER = "rgba(220,38,38,0.28)";

const MONO = "'Space Mono', monospace";
const SANS = "'Inter', system-ui, sans-serif";

// ─── Types — mirrors CrisisPlaybookResponse from route.ts ──────

type CrisisType =
  | "boycott"
  | "product"
  | "executive"
  | "regulatory"
  | "cybersecurity";

type ActionPriority = "critical" | "high" | "medium";

interface PlaybookAction {
  title: string;
  owner: string;
  priority: ActionPriority;
  description: string;
}

interface PlaybookTemplate {
  name: string;
  content: string;
}

interface PlaybookPhase {
  name: string;
  timeline: string;
  actions: PlaybookAction[];
  templates: PlaybookTemplate[];
}

interface Playbook {
  type: CrisisType;
  label: string;
  generatedAt: string;
  phases: PlaybookPhase[];
}

// ─── Crisis type catalogue (mirrors route CRISIS_TYPES) ────────
//
// `icon` carries the Lucide component reference (stable module-
// scope mapping, never created per-render). The blurb is the short
// context line shown under the label on the selector cards.

interface CrisisTypeMeta {
  type: CrisisType;
  label: string;
  blurb: string;
  icon: typeof ShieldAlert;
}

const CRISIS_TYPES: CrisisTypeMeta[] = [
  {
    type: "boycott",
    label: "Boycott consommateur",
    blurb:
      "Appel au boycott diffusé sur les réseaux ou relayé par des associations.",
    icon: Megaphone,
  },
  {
    type: "product",
    label: "Défaut produit",
    blurb:
      "Défaut, contamination ou rappel portant atteinte à la sécurité des clients.",
    icon: PackageX,
  },
  {
    type: "executive",
    label: "Scandale dirigeant",
    blurb:
      "Conduite, déclaration ou conflit d'intérêts impliquant la direction.",
    icon: UserCog,
  },
  {
    type: "regulatory",
    label: "Action réglementaire",
    blurb:
      "Enquête, inspection, sanction ou notification d'un régulateur.",
    icon: Scale,
  },
  {
    type: "cybersecurity",
    label: "Incident cyber",
    blurb:
      "Compromission de données, ransomware ou intrusion des systèmes.",
    icon: Lock,
  },
];

// ─── Priority catalogue ────────────────────────────────────────

interface PriorityMeta {
  label: string;
  fg: string;
  bg: string;
  border: string;
}

const PRIORITY: Record<ActionPriority, PriorityMeta> = {
  critical: { label: "Critique", fg: RED, bg: RED_BG, border: RED_BORDER },
  high: { label: "Élevé", fg: AMBER, bg: AMBER_BG, border: AMBER_BORDER },
  medium: { label: "Modéré", fg: SAGE, bg: SAGE_BG, border: SAGE_BORDER },
};

const PRIORITY_ORDER: ActionPriority[] = ["critical", "high", "medium"];

// ─── Sections reveal cadence (BriefingGenerator pattern) ──────
//
// One entry per phase (4) + the header — phases fade-in 220ms apart
// so the vertical timeline reads top-to-bottom.

const SECTIONS = [
  { id: "header", delay: 200 },
  { id: "phase-0", delay: 400 },
  { id: "phase-1", delay: 620 },
  { id: "phase-2", delay: 840 },
  { id: "phase-3", delay: 1060 },
  { id: "actions", delay: 1280 },
];

// ─── Stable components (avoid react-hooks/static-components rule)
//
// Capitalised variables assigned inside a function body trigger the
// lint rule. We declare stable components at module scope instead.

interface IconProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

function CrisisTypeIcon({
  type, size, color, style,
}: { type: CrisisType } & IconProps) {
  const meta = CRISIS_TYPES.find((c) => c.type === type);
  const Icon = meta?.icon ?? ShieldAlert;
  return <Icon size={size} color={color} style={style} />;
}

// ─── Component ─────────────────────────────────────────────────

export function CrisisPlaybookGenerator({ onClose }: { onClose: () => void }) {
  const [crisisType, setCrisisType] = useState<CrisisType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set(),
  );
  const [generating, setGenerating] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [doneActions, setDoneActions] = useState<Set<string>>(new Set());
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(
    new Set(),
  );

  // ─── Fetch the playbook for a given crisis type ─────────────
  const generate = useCallback(async (type: CrisisType) => {
    setLoading(true);
    setError(null);
    setPlaybook(null);
    setCustomize(false);
    setCopied(null);
    setDoneActions(new Set());
    setExpandedTemplates(new Set());
    setVisibleSections(new Set());
    setGenerating(true);
    try {
      const res = await fetch("/api/console/crisis-playbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crisisType: type }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { playbook: Playbook };
      setPlaybook(json.playbook);
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

  // Auto-fetch when crisisType changes (after a card click).
  useEffect(() => {
    if (crisisType) void generate(crisisType);
  }, [crisisType, generate]);

  // ─── Helpers ────────────────────────────────────────────────

  function resetToSelector() {
    setCrisisType(null);
    setPlaybook(null);
    setError(null);
    setLoading(false);
    setGenerating(false);
    setCustomize(false);
    setCopied(null);
    setDoneActions(new Set());
    setExpandedTemplates(new Set());
    setVisibleSections(new Set());
  }

  function toggleActionDone(key: string) {
    setDoneActions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleTemplate(key: string) {
    setExpandedTemplates((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function copyTemplate(content: string, key: string) {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      // Clipboard may be blocked — silent fallback
    }
  }

  // ─── Edit-mode mutation helpers ────────────────────────────
  //
  // The "Personnaliser" mode edits the local `playbook` state in
  // place. We deep-clone the playbook on entering edit mode so the
  // Dircom can cancel without persisting unwanted changes. (In the
  // current flow we don't expose a cancel button — once edited the
  // changes stay until "Réinitialiser". A future iteration can add
  // a "Annuler" button that re-fetches the original.)

  function editAction(
    phaseIdx: number,
    actionIdx: number,
    field: keyof PlaybookAction,
    value: string,
  ) {
    setPlaybook((prev) => {
      if (!prev) return prev;
      const next: Playbook = {
        ...prev,
        phases: prev.phases.map((p, i) => {
          if (i !== phaseIdx) return p;
          return {
            ...p,
            actions: p.actions.map((a, j) => {
              if (j !== actionIdx) return a;
              return { ...a, [field]: value };
            }),
          };
        }),
      };
      return next;
    });
  }

  function editTemplate(
    phaseIdx: number,
    tplIdx: number,
    field: keyof PlaybookTemplate,
    value: string,
  ) {
    setPlaybook((prev) => {
      if (!prev) return prev;
      const next: Playbook = {
        ...prev,
        phases: prev.phases.map((p, i) => {
          if (i !== phaseIdx) return p;
          return {
            ...p,
            templates: p.templates.map((t, j) => {
              if (j !== tplIdx) return t;
              return { ...t, [field]: value };
            }),
          };
        }),
      };
      return next;
    });
  }

  function cyclePriority(phaseIdx: number, actionIdx: number) {
    setPlaybook((prev) => {
      if (!prev) return prev;
      const next: Playbook = {
        ...prev,
        phases: prev.phases.map((p, i) => {
          if (i !== phaseIdx) return p;
          return {
            ...p,
            actions: p.actions.map((a, j) => {
              if (j !== actionIdx) return a;
              const currentIdx = PRIORITY_ORDER.indexOf(a.priority);
              const nextIdx = (currentIdx + 1) % PRIORITY_ORDER.length;
              return { ...a, priority: PRIORITY_ORDER[nextIdx] };
            }),
          };
        }),
      };
      return next;
    });
  }

  // ─── Render ────────────────────────────────────────────────

  const headerStatus = loading
    ? "Génération…"
    : generating
      ? "Mise en page…"
      : playbook
        ? "Prêt"
        : "Sélection du type";

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
          width: "100%", maxWidth: 920, maxHeight: "92vh",
          background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header bar ─── */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", borderBottom: `1px solid ${BORDER}`,
            background: "#FAFAFA",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldAlert size={18} style={{ color: SAGE }} />
            <span
              style={{
                fontSize: 14, fontWeight: 700, color: CHARCOAL,
                fontFamily: MONO,
              }}
            >
              Playbook de Crise
            </span>
            {(loading || generating) && (
              <span
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  fontSize: 11, color: SAGE, fontFamily: MONO,
                }}
              >
                <Loader2 size={11} className="animate-spin" /> {headerStatus}
              </span>
            )}
            {!loading && !generating && (
              <span
                style={{
                  fontSize: 11, color: TEXT_MUTED, fontFamily: MONO,
                }}
              >
                {headerStatus}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {playbook && (
              <>
                <button
                  onClick={() => setCustomize((v) => !v)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px",
                    background: customize ? SAGE_BG : "transparent",
                    color: customize ? SAGE : CHARCOAL,
                    border: `1px solid ${customize ? SAGE_BORDER : BORDER}`,
                    borderRadius: 6, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", fontFamily: SANS,
                  }}
                >
                  <Pencil size={13} /> {customize ? "Aperçu" : "Personnaliser"}
                </button>
                <button
                  onClick={() => window.print()}
                  disabled={generating}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px",
                    background: generating ? BORDER : CHARCOAL,
                    color: generating ? TEXT_MUTED : "#FFFFFF",
                    border: "none", borderRadius: 6, fontSize: 12,
                    fontWeight: 600, cursor: generating ? "not-allowed" : "pointer",
                    fontFamily: SANS,
                  }}
                >
                  <Download size={13} /> PDF
                </button>
                <button
                  onClick={resetToSelector}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", background: "transparent",
                    color: TEXT_BODY, border: `1px solid ${BORDER}`,
                    borderRadius: 6, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", fontFamily: SANS,
                  }}
                >
                  <ArrowLeft size={13} /> Changer
                </button>
              </>
            )}
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, display: "flex",
                alignItems: "center", justifyContent: "center",
                background: "transparent", border: "none", cursor: "pointer",
                color: TEXT_MUTED,
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── Body ─── */}
        <div
          style={{
            flex: 1, overflowY: "auto", padding: "32px 40px",
            fontFamily: SANS, color: CHARCOAL,
          }}
        >
          {/* ─── Selector screen (initial) ─── */}
          {!crisisType && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: 10, fontFamily: MONO, color: SAGE,
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    marginBottom: 8, fontWeight: 700,
                  }}
                >
                  Étape 1 — Choix du scénario
                </div>
                <h1
                  style={{
                    fontSize: 24, fontWeight: 700, margin: 0,
                    color: CHARCOAL, letterSpacing: "-0.02em",
                  }}
                >
                  Quel type de crise souhaitez-vous traiter ?
                </h1>
                <p
                  style={{
                    fontSize: 13, color: TEXT_MUTED, marginTop: 6,
                    maxWidth: 640, lineHeight: 1.5,
                  }}
                >
                  Le playbook s'articule en 4 phases — Détection &
                  Confinement, Communication Publique, Remédiation & Action,
                  Sortie & Apprentissage — avec actions assignées et modèles
                  de communication prêts à l'emploi.
                </p>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: 12,
                }}
              >
                {CRISIS_TYPES.map((meta) => {
                  const Icon = meta.icon;
                  return (
                    <motion.button
                      key={meta.type}
                      onClick={() => setCrisisType(meta.type)}
                      whileHover={{ y: -2 }}
                      style={{
                        display: "flex", flexDirection: "column",
                        alignItems: "flex-start", gap: 10,
                        padding: 18, background: WHITE,
                        border: `1px solid ${BORDER}`, borderRadius: 10,
                        cursor: "pointer", textAlign: "left",
                        fontFamily: SANS,
                        transition: "border-color 0.15s, box-shadow 0.15s",
                      }}
                    >
                      <div
                        style={{
                          width: 36, height: 36, borderRadius: 8,
                          background: SAGE_BG,
                          display: "flex", alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon size={18} style={{ color: SAGE }} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 14, fontWeight: 700, color: CHARCOAL,
                            marginBottom: 4,
                          }}
                        >
                          {meta.label}
                        </div>
                        <div
                          style={{
                            fontSize: 12, color: TEXT_MUTED, lineHeight: 1.5,
                          }}
                        >
                          {meta.blurb}
                        </div>
                      </div>
                      <div
                        style={{
                          marginTop: 4, display: "flex", alignItems: "center",
                          gap: 4, fontSize: 11, color: SAGE, fontFamily: MONO,
                        }}
                      >
                        Générer le playbook
                        <ChevronRight size={12} />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ─── Loading state ─── */}
          {crisisType && loading && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Loader2
                size={32}
                style={{ color: SAGE, animation: "spin 1s linear infinite" }}
              />
              <p
                style={{
                  marginTop: 16, fontSize: 14, color: TEXT_MUTED,
                  fontFamily: SANS,
                }}
              >
                Construction du playbook « {CRISIS_TYPES.find((c) => c.type === crisisType)?.label} »…
              </p>
            </div>
          )}

          {/* ─── Error state ─── */}
          {error && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <AlertTriangle size={32} style={{ color: RED }} />
              <p
                style={{
                  marginTop: 12, fontSize: 14, color: RED, fontFamily: SANS,
                }}
              >
                {error}
              </p>
              <button
                onClick={() => crisisType && generate(crisisType)}
                style={{
                  marginTop: 16, padding: "8px 16px",
                  background: CHARCOAL, color: "#FFFFFF",
                  border: "none", borderRadius: 6, fontSize: 13,
                  cursor: "pointer", fontFamily: SANS,
                }}
              >
                Réessayer
              </button>
            </div>
          )}

          {/* ─── Playbook document ─── */}
          {playbook && !loading && (
            <div id="crisis-playbook-document">
              <AnimatePresence>
                {visibleSections.has("header") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 32 }}
                  >
                    <div
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <Clock size={14} style={{ color: SAGE }} />
                      <span
                        style={{
                          fontSize: 11, fontFamily: MONO, color: SAGE,
                          textTransform: "uppercase", letterSpacing: "0.08em",
                        }}
                      >
                        {formatGeneratedAt(playbook.generatedAt)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 44, height: 44, borderRadius: 10,
                          background: SAGE_BG, display: "flex",
                          alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <CrisisTypeIcon
                          type={playbook.type}
                          size={22}
                          color={SAGE}
                        />
                      </div>
                      <div>
                        <h1
                          style={{
                            fontSize: 24, fontWeight: 700, margin: 0,
                            color: CHARCOAL, letterSpacing: "-0.02em",
                          }}
                        >
                          Playbook — {playbook.label}
                        </h1>
                        <p
                          style={{
                            fontSize: 13, color: TEXT_MUTED, marginTop: 2,
                          }}
                        >
                          4 phases · {totalActions(playbook)} actions ·{" "}
                          {totalTemplates(playbook)} modèles
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Vertical timeline ─── */}
              <div
                style={{
                  position: "relative", paddingLeft: 28,
                }}
              >
                {/* Vertical rail */}
                <div
                  style={{
                    position: "absolute", left: 7, top: 6, bottom: 6,
                    width: 2, background: BORDER,
                  }}
                />

                {playbook.phases.map((phase, phaseIdx) => {
                  const sectionId = `phase-${phaseIdx}`;
                  const visible = visibleSections.has(sectionId);
                  return (
                    <AnimatePresence key={phaseIdx}>
                      {visible && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{
                            position: "relative",
                            marginBottom: phaseIdx < playbook.phases.length - 1 ? 28 : 0,
                          }}
                        >
                          {/* Timeline dot */}
                          <div
                            style={{
                              position: "absolute", left: -28, top: 4,
                              width: 16, height: 16, borderRadius: "50%",
                              background: WHITE,
                              border: `3px solid ${phaseAccent(phaseIdx)}`,
                              boxShadow: `0 0 0 3px ${WHITE}`,
                              zIndex: 1,
                            }}
                          />

                          {/* Phase card */}
                          <div
                            style={{
                              padding: 18,
                              background: "#FAFAFA",
                              border: `1px solid ${BORDER}`,
                              borderRadius: 10,
                            }}
                          >
                            {/* Phase header */}
                            <div
                              style={{
                                display: "flex", alignItems: "flex-start",
                                justifyContent: "space-between",
                                marginBottom: 14, gap: 12,
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <div
                                  style={{
                                    display: "flex", alignItems: "center",
                                    gap: 6, marginBottom: 4,
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: 10, fontFamily: MONO,
                                      color: TEXT_MUTED, fontWeight: 700,
                                    }}
                                  >
                                    Phase {phaseIdx + 1}
                                  </span>
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center", gap: 4,
                                      padding: "2px 8px", borderRadius: 4,
                                      background: phaseAccentBg(phaseIdx),
                                      color: phaseAccent(phaseIdx),
                                      fontSize: 10, fontFamily: MONO,
                                      fontWeight: 700,
                                    }}
                                  >
                                    <Clock size={10} />
                                    {phase.timeline}
                                  </span>
                                </div>
                                <h3
                                  style={{
                                    fontSize: 16, fontWeight: 700,
                                    margin: 0, color: CHARCOAL,
                                  }}
                                >
                                  {phase.name}
                                </h3>
                              </div>
                              <div
                                style={{
                                  display: "flex", gap: 6, fontSize: 10,
                                  fontFamily: MONO, color: TEXT_MUTED,
                                }}
                              >
                                <span
                                  style={{
                                    padding: "3px 7px", background: WHITE,
                                    border: `1px solid ${BORDER}`,
                                    borderRadius: 4,
                                  }}
                                >
                                  {phase.actions.length} actions
                                </span>
                                <span
                                  style={{
                                    padding: "3px 7px", background: WHITE,
                                    border: `1px solid ${BORDER}`,
                                    borderRadius: 4,
                                  }}
                                >
                                  {phase.templates.length} modèles
                                </span>
                              </div>
                            </div>

                            {/* Action items */}
                            <div
                              style={{
                                fontSize: 10, fontFamily: MONO,
                                color: TEXT_MUTED, textTransform: "uppercase",
                                letterSpacing: "0.1em", marginBottom: 8,
                              }}
                            >
                              Actions
                            </div>
                            <div
                              style={{
                                display: "flex", flexDirection: "column",
                                gap: 8, marginBottom: phase.templates.length > 0 ? 18 : 0,
                              }}
                            >
                              {phase.actions.map((action, actionIdx) => {
                                const key = `${phaseIdx}-${actionIdx}`;
                                const done = doneActions.has(key);
                                return (
                                  <ActionRow
                                    key={actionIdx}
                                    action={action}
                                    done={done}
                                    customize={customize}
                                    onToggle={() => toggleActionDone(key)}
                                    onEdit={(field, value) =>
                                      editAction(phaseIdx, actionIdx, field, value)
                                    }
                                    onCyclePriority={() =>
                                      cyclePriority(phaseIdx, actionIdx)
                                    }
                                  />
                                );
                              })}
                            </div>

                            {/* Communication templates */}
                            {phase.templates.length > 0 && (
                              <>
                                <div
                                  style={{
                                    fontSize: 10, fontFamily: MONO,
                                    color: TEXT_MUTED, textTransform: "uppercase",
                                    letterSpacing: "0.1em", marginBottom: 8,
                                  }}
                                >
                                  Modèles de communication
                                </div>
                                <div
                                  style={{
                                    display: "flex", flexDirection: "column",
                                    gap: 8,
                                  }}
                                >
                                  {phase.templates.map((tpl, tplIdx) => {
                                    const key = `t-${phaseIdx}-${tplIdx}`;
                                    const expanded = expandedTemplates.has(key);
                                    const isCopied = copied === key;
                                    return (
                                      <TemplateBlock
                                        key={tplIdx}
                                        template={tpl}
                                        expanded={expanded}
                                        copied={isCopied}
                                        customize={customize}
                                        onToggle={() => toggleTemplate(key)}
                                        onCopy={() =>
                                          copyTemplate(tpl.content, key)
                                        }
                                        onEdit={(field, value) =>
                                          editTemplate(phaseIdx, tplIdx, field, value)
                                        }
                                      />
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  );
                })}
              </div>

              {/* ─── Footer actions ─── */}
              <AnimatePresence>
                {visibleSections.has("actions") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: "flex", gap: 8, flexWrap: "wrap",
                      paddingTop: 20, marginTop: 20,
                      borderTop: `1px solid ${BORDER}`,
                    }}
                  >
                    <button
                      onClick={() => window.print()}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "10px 20px", background: CHARCOAL,
                        color: "#FFFFFF", border: "none", borderRadius: 8,
                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                        fontFamily: SANS,
                      }}
                    >
                      <Download size={14} /> Exporter PDF
                    </button>
                    <button
                      onClick={() => setCustomize((v) => !v)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "10px 16px", background: customize ? SAGE_BG : "transparent",
                        color: customize ? SAGE : TEXT_BODY,
                        border: `1px solid ${customize ? SAGE_BORDER : BORDER}`,
                        borderRadius: 8, fontSize: 13, fontWeight: 600,
                        cursor: "pointer", fontFamily: SANS,
                      }}
                    >
                      <Pencil size={14} />
                      {customize ? "Quitter la personnalisation" : "Personnaliser"}
                    </button>
                    {crisisType && (
                      <button
                        onClick={() => generate(crisisType)}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "10px 16px", background: "transparent",
                          color: TEXT_BODY, border: `1px solid ${BORDER}`,
                          borderRadius: 8, fontSize: 13, fontWeight: 600,
                          cursor: "pointer", fontFamily: SANS,
                        }}
                      >
                        <RefreshCw size={14} /> Régénérer
                      </button>
                    )}
                    {customize && (
                      <div
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          marginLeft: "auto", padding: "8px 12px",
                          background: SAGE_BG, border: `1px solid ${SAGE_BORDER}`,
                          borderRadius: 8, fontSize: 11, color: SAGE,
                          fontFamily: MONO,
                        }}
                      >
                        <CircleAlert size={12} />
                        Mode édition actif
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {generating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, marginTop: 16,
                  }}
                >
                  <div
                    style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: SAGE, animation: "pulse 1s infinite",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11, color: SAGE, fontFamily: MONO,
                    }}
                  >
                    Mise en page du playbook…
                  </span>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media print {
          body * { visibility: hidden; }
          #crisis-playbook-document,
          #crisis-playbook-document * { visibility: visible; }
          #crisis-playbook-document {
            position: absolute; left: 0; top: 0; width: 100%;
            padding: 32px 40px;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Action row (stable component) ─────────────────────────────
//
// Read-only mode: checkbox + title + owner chip + priority badge +
// description. Customize mode: same skeleton but title / owner /
// description become input/textarea and the priority badge becomes
// a clickable cycle button.

interface ActionRowProps {
  action: PlaybookAction;
  done: boolean;
  customize: boolean;
  onToggle: () => void;
  onEdit: (field: keyof PlaybookAction, value: string) => void;
  onCyclePriority: () => void;
}

function ActionRow({
  action, done, customize, onToggle, onEdit, onCyclePriority,
}: ActionRowProps) {
  const pm = PRIORITY[action.priority];
  return (
    <div
      style={{
        display: "flex", gap: 10, alignItems: "flex-start",
        padding: "10px 12px", background: done ? CHARCOAL_BG : WHITE,
        border: `1px solid ${BORDER}`, borderRadius: 8,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        aria-label={done ? "Marquer non fait" : "Marquer fait"}
        style={{
          flexShrink: 0, width: 18, height: 18, marginTop: 1,
          borderRadius: 4, cursor: "pointer",
          background: done ? SAGE : WHITE,
          border: done ? `1px solid ${SAGE}` : `1px solid ${BORDER}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 0,
        }}
      >
        {done && <Check size={12} color={WHITE} strokeWidth={3} />}
      </button>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
            marginBottom: 4,
          }}
        >
          {customize ? (
            <input
              value={action.title}
              onChange={(e) => onEdit("title", e.target.value)}
              style={{
                flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600,
                color: CHARCOAL, fontFamily: SANS,
                background: WHITE, border: `1px solid ${BORDER}`,
                borderRadius: 4, padding: "4px 8px",
              }}
            />
          ) : (
            <span
              style={{
                fontSize: 13, fontWeight: 600, color: CHARCOAL,
                textDecoration: done ? "line-through" : "none",
                opacity: done ? 0.55 : 1,
              }}
            >
              {action.title}
            </span>
          )}

          {/* Owner chip */}
          {customize ? (
            <span
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 11, color: TEXT_MUTED,
              }}
            >
              <UserSquare2 size={11} />
              <input
                value={action.owner}
                onChange={(e) => onEdit("owner", e.target.value)}
                style={{
                  fontSize: 11, color: TEXT_BODY, fontFamily: SANS,
                  background: WHITE, border: `1px solid ${BORDER}`,
                  borderRadius: 4, padding: "2px 6px", width: 180,
                }}
              />
            </span>
          ) : (
            <span
              style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "2px 7px", background: WHITE,
                border: `1px solid ${BORDER}`, borderRadius: 4,
                fontSize: 11, color: TEXT_BODY,
              }}
            >
              <UserSquare2 size={11} style={{ color: TEXT_MUTED }} />
              {action.owner}
            </span>
          )}

          {/* Priority badge */}
          <button
            onClick={customize ? onCyclePriority : undefined}
            disabled={!customize}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "2px 8px", background: pm.bg,
              border: `1px solid ${pm.border}`, borderRadius: 4,
              fontSize: 10, fontFamily: MONO, fontWeight: 700,
              color: pm.fg, cursor: customize ? "pointer" : "default",
            }}
            title={customize ? "Cliquer pour changer la priorité" : undefined}
          >
            {pm.label}
          </button>
        </div>

        {customize ? (
          <textarea
            value={action.description}
            onChange={(e) => onEdit("description", e.target.value)}
            rows={3}
            style={{
              width: "100%", fontSize: 12, color: TEXT_BODY,
              fontFamily: SANS, lineHeight: 1.5, background: WHITE,
              border: `1px solid ${BORDER}`, borderRadius: 4,
              padding: "6px 8px", resize: "vertical",
            }}
          />
        ) : (
          <p
            style={{
              margin: 0, fontSize: 12, color: TEXT_BODY, lineHeight: 1.5,
              opacity: done ? 0.55 : 1,
            }}
          >
            {action.description}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Template block (stable component) ─────────────────────────
//
// Collapsible: header shows the template name + a chevron + a copy
// button. When expanded, the content is shown either as a pre block
// (read mode) or a textarea (customize mode).

interface TemplateBlockProps {
  template: PlaybookTemplate;
  expanded: boolean;
  copied: boolean;
  customize: boolean;
  onToggle: () => void;
  onCopy: () => void;
  onEdit: (field: keyof PlaybookTemplate, value: string) => void;
}

function TemplateBlock({
  template, expanded, copied, customize, onToggle, onCopy, onEdit,
}: TemplateBlockProps) {
  return (
    <div
      style={{
        border: `1px solid ${BORDER}`, borderRadius: 8,
        background: WHITE, overflow: "hidden",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 12px", borderBottom: expanded ? `1px solid ${BORDER}` : "none",
          background: expanded ? CHARCOAL_BG : WHITE,
        }}
      >
        <button
          onClick={onToggle}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "transparent", border: "none", cursor: "pointer",
            flex: 1, padding: 0, textAlign: "left",
          }}
        >
          <FileText size={13} style={{ color: SAGE, flexShrink: 0 }} />
          {customize ? (
            <input
              value={template.name}
              onChange={(e) => onEdit("name", e.target.value)}
              style={{
                flex: 1, fontSize: 12, fontWeight: 600, color: CHARCOAL,
                fontFamily: SANS, background: WHITE,
                border: `1px solid ${BORDER}`, borderRadius: 4,
                padding: "3px 6px",
              }}
            />
          ) : (
            <span
              style={{
                fontSize: 12, fontWeight: 600, color: CHARCOAL,
                fontFamily: SANS,
              }}
            >
              {template.name}
            </span>
          )}
          {expanded ? (
            <ChevronDown size={13} style={{ color: TEXT_MUTED, flexShrink: 0 }} />
          ) : (
            <ChevronRight size={13} style={{ color: TEXT_MUTED, flexShrink: 0 }} />
          )}
        </button>
        <button
          onClick={onCopy}
          disabled={customize}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "3px 8px", background: copied ? SAGE_BG : WHITE,
            color: copied ? SAGE : TEXT_BODY,
            border: `1px solid ${copied ? SAGE_BORDER : BORDER}`,
            borderRadius: 4, fontSize: 11, fontWeight: 600,
            cursor: customize ? "not-allowed" : "pointer",
            fontFamily: SANS, opacity: customize ? 0.5 : 1,
          }}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copié" : "Copier"}
        </button>
      </div>

      {/* Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            {customize ? (
              <textarea
                value={template.content}
                onChange={(e) => onEdit("content", e.target.value)}
                rows={Math.min(14, Math.max(6, Math.ceil(template.content.length / 60)))}
                style={{
                  width: "100%", fontSize: 12, color: CHARCOAL,
                  fontFamily: MONO, lineHeight: 1.55, background: "#FAFAFA",
                  border: "none", borderTop: `1px solid ${BORDER}`,
                  padding: "10px 12px", resize: "vertical",
                  outline: "none",
                }}
              />
            ) : (
              <pre
                style={{
                  margin: 0, padding: "10px 12px", fontSize: 12,
                  color: CHARCOAL, fontFamily: MONO, lineHeight: 1.55,
                  background: "#FAFAFA", whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {template.content}
              </pre>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────

function formatGeneratedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function totalActions(p: Playbook): number {
  return p.phases.reduce((n, ph) => n + ph.actions.length, 0);
}

function totalTemplates(p: Playbook): number {
  return p.phases.reduce((n, ph) => n + ph.templates.length, 0);
}

// Phase accent: cycle sage → amber → sage-dark → charcoal for
// visual rhythm along the timeline. All stay within the brand
// palette (no rogue colours).
function phaseAccent(idx: number): string {
  const palette = [SAGE, AMBER, SAGE, CHARCOAL];
  return palette[idx % palette.length];
}

function phaseAccentBg(idx: number): string {
  const palette = [SAGE_BG, AMBER_BG, SAGE_BG_STRONG, CHARCOAL_BG];
  return palette[idx % palette.length];
}
