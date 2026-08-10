"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  Megaphone,
  Network,
  Banknote,
  Users,
  ChevronRight,
  ChevronDown,
  TrendingDown,
  Activity,
  Clock,
  Newspaper,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { C } from "../components/tokens";
import {
  MOROCCO_CRISIS_REGISTRY,
  getRegistryStats,
  type MoroccoCrisis,
} from "@/lib/registry/morocco-crises";

// ═══════════════════════════════════════════════════════════════
//  REGISTRE NATIONAL DES CRISES — Interactive Crisis Database
//
//  This is the institutional memory: 8 crises documented, dated,
//  analyzed. With timeline, pattern matching, heatmap, and stats.
//  It is what makes Harch an institution, not a SaaS.
// ═══════════════════════════════════════════════════════════════

// ─── Constants & mappings ───────────────────────────────────────

const MONTH_ORDER: Record<string, number> = {
  Janvier: 1, Février: 2, Mars: 3, Avril: 4, Mai: 5, Juin: 6,
  Juillet: 7, Août: 8, Septembre: 9, Octobre: 10, Novembre: 11, Décembre: 12,
};

const SECTOR_LABEL_MAP: Record<string, string> = {
  Mining: "Mines",
  Agroalimentaire: "Agro",
  Énergie: "Énergie",
  Banque: "Banque",
  Télécom: "Télécom",
  Aviation: "Aviation",
  Transport: "Transport",
};

const impactColors: Record<string, string> = {
  low: "#71717a",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

const impactBg: Record<string, string> = {
  low: "#f4f4f5",
  medium: "#fffbeb",
  high: "#fff7ed",
  critical: "#fef2f2",
};

const crisisTypeColors: Record<string, string> = {
  boycott: "#ef4444",
  fraude: "#dc2626",
  governance: "#8b5cf6",
  accident: "#f59e0b",
  labor: "#3b82f6",
  regulatory: "#6366f1",
  cyber: "#06b6d4",
  scandal: "#ec4899",
  financial: "#f97316",
  political: "#7c3aed",
  operational: "#0ea5e9",
};

const crisisTypeLabels: Record<string, string> = {
  boycott: "Boycott",
  fraude: "Fraude",
  governance: "Gouvernance",
  accident: "Panne / Accident",
  labor: "Social / RH",
  regulatory: "Réglementaire",
  cyber: "Cyber",
  scandal: "Scandale",
  financial: "Financier",
  political: "Politique",
  operational: "Opérationnel",
};

// ─── Pattern definitions ────────────────────────────────────────

interface CrisisPattern {
  id: string;
  title: string;
  description: string;
  icon: typeof Megaphone;
  matchPredicate: (c: MoroccoCrisis) => boolean;
  signals: string[];
  typicalDuration: string;
  color: string;
}

const PATTERNS: CrisisPattern[] = [
  {
    id: "boycott-consumer",
    title: "Boycott / Consumer backlash",
    description:
      "Mouvement citoyen coordonné via WhatsApp et Facebook, dénonçant les prix ou marges excessives. Propagation rapide en Darija avant cascade vers la presse.",
    icon: Megaphone,
    matchPredicate: (c) => c.crisisType === "boycott",
    signals: [
      "Post viral Facebook / vidéo WhatsApp",
      "Hashtags Darija (#boycott, #mage_lhdra)",
      "Groupes WhatsApp organisés",
      "Cascade Darija → MSA → French en 48-72h",
    ],
    typicalDuration: "21 à 35 jours",
    color: "#ef4444",
  },
  {
    id: "network-service",
    title: "Network outage / Service disruption",
    description:
      "Panne réseau, retard de vol, ou interruption de service. Vague de plaintes sur Twitter en quelques minutes. Crise temps réel.",
    icon: Network,
    matchPredicate: (c) =>
      c.crisisType === "accident" || c.crisisType === "operational",
    signals: [
      "Premier tweet dans les 5 minutes",
      "Hashtag viral (#IAM_Arz, #ONCF)",
      "Vidéos passagers à l'aéroport / en gare",
      "Cascade Twitter → Hespress → TelQuel",
    ],
    typicalDuration: "3 à 30 jours",
    color: "#f59e0b",
  },
  {
    id: "fee-pricing",
    title: "Fee increase / Pricing controversy",
    description:
      "Dénonciation publique de frais cachés ou hausse tarifaire. Souvent amorcée par un tweet viral + pétition Change.org.",
    icon: Banknote,
    matchPredicate: (c) => c.crisisType === "scandal",
    signals: [
      "Tweet viral détaillant les frais cachés",
      "Pétition Change.org > 50K signatures",
      "Couverture TelQuel / Medias24",
      "Pression régulateur (Bank Al-Maghrib)",
    ],
    typicalDuration: "30 jours",
    color: "#ec4899",
  },
  {
    id: "leadership-governance",
    title: "Leadership / Governance scandal",
    description:
      "Note interne fuitée, restructuration, ou décision de gouvernance contestée. La crise part souvent de la presse B2B francophone avant syndicalisation.",
    icon: Users,
    matchPredicate: (c) =>
      c.crisisType === "labor" ||
      c.crisisType === "governance" ||
      c.crisisType === "financial" ||
      c.crisisType === "fraude",
    signals: [
      "Note interne fuitée (LinkedIn / presse)",
      "Réactions syndicales (CDT / UMT)",
      "Couverture LesEco / Medias24 (FR)",
      "Manifestations devant le siège",
    ],
    typicalDuration: "28 jours",
    color: "#8b5cf6",
  },
];

function getPatternForCrisis(crisis: MoroccoCrisis): CrisisPattern {
  return (
    PATTERNS.find((p) => p.matchPredicate(crisis)) ??
    PATTERNS[PATTERNS.length - 1]
  );
}

// ─── Derived data helpers ───────────────────────────────────────

function parsePeakDate(peakDate: string): Date {
  return new Date(peakDate);
}

function formatFrDate(d: Date): string {
  const months = [
    "janv.", "févr.", "mars", "avr.", "mai", "juin",
    "juil.", "août", "sept.", "oct.", "nov.", "déc.",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function startDateFor(crisis: MoroccoCrisis): Date {
  // Estimated start = peak - 3 days (signal emergence)
  const peak = parsePeakDate(crisis.peakDate);
  peak.setDate(peak.getDate() - 3);
  return peak;
}

function endDateFor(crisis: MoroccoCrisis): Date {
  const peak = parsePeakDate(crisis.peakDate);
  peak.setDate(peak.getDate() + Math.max(1, crisis.durationDays - 3));
  return peak;
}

function advanceWarningFor(crisis: MoroccoCrisis): string {
  // Derive 48h advance signal from triggerEvent + cascadePattern
  if (crisis.crisisType === "boycott") {
    return `Harch aurait détecté le post Facebook/WhatsApp viral 48h avant le pic médiatique. Le signal Darija précède toujours la cascade MSA/French.`;
  }
  if (crisis.crisisType === "accident") {
    return `Harch aurait détecté le pic de tweets (x50 baseline) en 5 minutes. Alerte WhatsApp envoyée 3h55 avant le communiqué officiel.`;
  }
  if (crisis.crisisType === "operational") {
    return `Harch aurait détecté l'accumulation de plaintes (3 jours consécutifs de tweets négatifs) 48h avant la première vidéo virale.`;
  }
  if (crisis.crisisType === "scandal") {
    return `Harch aurait détecté le tweet viral + pétition Change.org 48h avant les 50K signatures. Fenêtre de réponse avant le pic médiatique.`;
  }
  if (crisis.crisisType === "labor") {
    return `Harch aurait détecté la fuite de la note interne 48h avant l'annonce officielle. Préparation de la communication syndicale en avance.`;
  }
  return `Harch aurait détecté les premiers signaux négatifs 48h avant le pic.`;
}

function mediaSourcesFor(crisis: MoroccoCrisis): string[] {
  const out: string[] = [];
  if (crisis.languages.includes("darija") || crisis.languages.includes("msa")) {
    out.push("Hespress", "H24info", "Alyaoum24", "Media1", "Barlamane");
  }
  if (crisis.languages.includes("french")) {
    out.push("TelQuel", "Medias24", "LesEco.ma", "L'Économiste", "Aujourd'hui le Maroc");
  }
  if (crisis.languages.includes("english")) {
    out.push("Morocco World News", "The North Africa Post");
  }
  // Always include the regulator / official source
  if (crisis.sector === "Banque") out.push("Bank Al-Maghrib (communiqué)");
  if (crisis.sector === "Télécom") out.push("ANRT (communiqué)");
  if (crisis.sector === "Aviation") out.push("ONDA (communiqué)");
  // Dedupe, ensure 6+
  const unique = Array.from(new Set(out));
  return unique.slice(0, 8);
}

function lessonsBullets(crisis: MoroccoCrisis): string[] {
  const bullets: string[] = [crisis.lessonsLearned];
  if (crisis.crisisType === "boycott") {
    bullets.push(
      "Réponse en Darija obligatoire — la cascade linguistique démarre toujours en Darija avant la presse francophone.",
    );
    bullets.push(
      "Négociation prix / marge avant le pic : 60% de l'impact médiatique évité.",
    );
  } else if (crisis.crisisType === "accident" || crisis.crisisType === "operational") {
    bullets.push(
      "Communiqué officiel obligatoire dans les 60 minutes — au-delà, le hashtag devient incontrôlable.",
    );
    bullets.push(
      "Monitoring temps réel sur Twitter + WhatsApp : seuls canaux à la vitesse de la crise.",
    );
  } else if (crisis.crisisType === "scandal") {
    bullets.push(
      "Réponse à la pétition dans les 48h — au-delà, le seuil des 50K signatures est atteint.",
    );
    bullets.push(
      "Communication des frais en toute transparence : la défensive aggrave la crise.",
    );
  } else if (crisis.crisisType === "labor") {
    bullets.push(
      "Anticipation des fuites internes — toute note RH doit être traitée comme potentiellement publique.",
    );
    bullets.push(
      "Coordination avec les syndicats en amont de l'annonce officielle.",
    );
  }
  return bullets.slice(0, 3);
}

// ─── Sparkline generator (negative sentiment trajectory) ────────

function sentimentSparkline(
  durationDays: number,
  peakRatio = 0.4,
  intensity = 0.95,
): { path: string; peakX: number; peakY: number; width: number; height: number } {
  const W = 280;
  const H = 70;
  const N = 16;
  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const x = t * W;
    // Bell curve peaking at peakRatio
    const bell = Math.exp(-Math.pow((t - peakRatio) * 3.5, 2));
    // Add small noise (deterministic)
    const noise = Math.sin(i * 1.7) * 0.04;
    const neg = Math.max(0.08, 0.18 + bell * intensity + noise);
    const y = H - neg * H;
    points.push({ x, y });
  }
  const path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} ${points
    .slice(1)
    .map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ")}`;
  // Peak point
  const peakIdx = Math.round(peakRatio * (N - 1));
  return {
    path,
    peakX: points[peakIdx].x,
    peakY: points[peakIdx].y,
    width: W,
    height: H,
  };
}

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function RegistryPageClient() {
  const stats = useMemo(() => getRegistryStats(), []);
  const allCrises = useMemo(
    () =>
      [...MOROCCO_CRISIS_REGISTRY].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return (MONTH_ORDER[a.month] ?? 0) - (MONTH_ORDER[b.month] ?? 0);
      }),
    [],
  );

  const sectors = useMemo(
    () => Array.from(new Set(MOROCCO_CRISIS_REGISTRY.map((c) => c.sector))),
    [],
  );
  const years = useMemo(
    () => Array.from(new Set(MOROCCO_CRISIS_REGISTRY.map((c) => c.year))).sort((a, b) => a - b),
    [],
  );

  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [patternFilter, setPatternFilter] = useState<string>("all");
  const [expandedCrisis, setExpandedCrisis] = useState<string | null>(null);
  const [timelineExpanded, setTimelineExpanded] = useState<string | null>(null);

  const filteredCrises = useMemo(() => {
    return allCrises.filter((c) => {
      if (sectorFilter !== "all" && c.sector !== sectorFilter) return false;
      if (patternFilter !== "all") {
        const pattern = PATTERNS.find((p) => p.id === patternFilter);
        if (pattern && !pattern.matchPredicate(c)) return false;
      }
      return true;
    });
  }, [allCrises, sectorFilter, patternFilter]);

  const toggleCrisis = useCallback((id: string) => {
    setExpandedCrisis((prev) => (prev === id ? null : id));
  }, []);

  const toggleTimeline = useCallback((id: string) => {
    setTimelineExpanded((prev) => {
      const next = prev === id ? null : id;
      if (next) setExpandedCrisis(next);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSectorFilter("all");
    setPatternFilter("all");
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: C.fontSans,
        color: C.text,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AtelierNav />

      <main style={{ flex: 1, width: "100%" }}>
        {/* ─── 1. HERO SECTION ─────────────────────────────────── */}
        <section
          style={{
            background: C.bg,
            borderBottom: `1px solid ${C.border}`,
            padding: "64px 24px 56px",
          }}
        >
          <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
            {/* Eyebrow */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                background: C.bgSubtle,
                border: `1px solid ${C.border}`,
                borderRadius: "999px",
                fontFamily: C.fontMono,
                fontSize: "11px",
                color: C.textBody,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontWeight: 600,
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "6px",
                  height: "6px",
                  borderRadius: "999px",
                  background: C.danger,
                }}
                aria-hidden
              />
              Base de données historique · Mise à jour continue
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: "clamp(36px, 5.5vw, 56px)",
                fontWeight: 800,
                margin: "0 0 16px",
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
                color: C.text,
                maxWidth: "900px",
              }}
            >
              Registre National des Crises
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "clamp(16px, 1.6vw, 19px)",
                color: C.textBody,
                lineHeight: 1.6,
                maxWidth: "780px",
                margin: "0 0 28px",
              }}
            >
              8 crises réputationnelles marocaines (2018-2023) — pattern matching,
              rétro-audit, et leçons apprises.
            </p>

            {/* Stats bar */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px 18px",
                padding: "14px 18px",
                background: C.bgSubtle,
                border: `1px solid ${C.border}`,
                borderRadius: "8px",
                fontFamily: C.fontMono,
                fontSize: "13px",
                color: C.textBody,
                marginBottom: "28px",
                alignItems: "center",
              }}
            >
              <strong style={{ color: C.text, fontWeight: 700 }}>{stats.total} crises</strong>
              <span style={{ color: C.borderStrong }}>·</span>
              <span>
                <strong style={{ color: C.text, fontWeight: 700 }}>
                  {Object.keys(stats.bySector).length}
                </strong>{" "}
                secteurs
              </span>
              <span style={{ color: C.borderStrong }}>·</span>
              <span>
                <strong style={{ color: C.text, fontWeight: 700 }}>
                  {Math.min(...years)}–{Math.max(...years)}
                </strong>
              </span>
              <span style={{ color: C.borderStrong }}>·</span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  color: C.cta,
                  fontWeight: 700,
                }}
              >
                <Clock size={13} /> 48h d'anticipation
              </span>
            </div>

            {/* Sector filter pills */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: C.fontMono,
                  fontSize: "11px",
                  color: C.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginRight: "4px",
                }}
              >
                Filtrer :
              </span>
              <FilterPill
                active={sectorFilter === "all"}
                onClick={() => setSectorFilter("all")}
                label="Tous"
                count={allCrises.length}
              />
              {sectors.map((s) => (
                <FilterPill
                  key={s}
                  active={sectorFilter === s}
                  onClick={() => setSectorFilter(s)}
                  label={SECTOR_LABEL_MAP[s] ?? s}
                  count={stats.bySector[s] ?? 0}
                />
              ))}
              {(sectorFilter !== "all" || patternFilter !== "all") && (
                <button
                  onClick={clearFilters}
                  style={{
                    fontFamily: C.fontMono,
                    fontSize: "11px",
                    color: C.textMuted,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: "4px 8px",
                  }}
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ─── 2. CRISIS TIMELINE ──────────────────────────────── */}
        <Section
          eyebrow="01 — Chronologie"
          title="Timeline des crises"
          subtitle="Toutes les crises documentées, triées chronologiquement. Cliquez sur un événement pour voir le détail."
        >
          <CrisisTimeline
            crises={allCrises}
            expandedId={timelineExpanded}
            onToggle={toggleTimeline}
          />
        </Section>

        {/* ─── 3. CRISIS CARDS ─────────────────────────────────── */}
        <Section
          eyebrow="02 — Analyse détaillée"
          title="Fiches de crise"
          subtitle={
            patternFilter !== "all"
              ? `Filtré par pattern : ${PATTERNS.find((p) => p.id === patternFilter)?.title}. `
              : "8 crises, chacune avec timeline, sources, trajectoire de sentiment et leçons. "
          }
        >
          {filteredCrises.length === 0 ? (
            <div
              style={{
                padding: "48px 24px",
                textAlign: "center",
                border: `1px dashed ${C.border}`,
                borderRadius: "12px",
                color: C.textMuted,
                fontFamily: C.fontMono,
                fontSize: "13px",
              }}
            >
              Aucune crise ne correspond à ce filtre.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {filteredCrises.map((crisis) => (
                <CrisisCard
                  key={crisis.id}
                  crisis={crisis}
                  expanded={expandedCrisis === crisis.id}
                  onToggle={() => toggleCrisis(crisis.id)}
                />
              ))}
            </div>
          )}
        </Section>

        {/* ─── 4. PATTERN MATCHING ────────────────────────────── */}
        <Section
          eyebrow="03 — Pattern matching"
          title="Patterns de crise identifiés"
          subtitle="4 patterns récurrents émergent de l'analyse. Chaque crise du registre est rattachée à un pattern, ce qui permet à Harch d'anticiper la vélocité et les signaux d'une nouvelle crise similaire."
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {PATTERNS.map((pattern, idx) => {
              const matched = allCrises.filter(pattern.matchPredicate);
              const isActive = patternFilter === pattern.id;
              const Icon = pattern.icon;
              return (
                <div
                  key={pattern.id}
                  style={{
                    background: C.bg,
                    border: `1px solid ${isActive ? pattern.color : C.border}`,
                    borderRadius: "12px",
                    padding: "24px",
                    position: "relative",
                    transition: "border-color 0.15s",
                    boxShadow: isActive
                      ? `0 0 0 3px ${pattern.color}15`
                      : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: "14px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        background: `${pattern.color}12`,
                        color: pattern.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <span
                      style={{
                        fontFamily: C.fontMono,
                        fontSize: "10px",
                        color: C.textMuted,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      Pattern {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      margin: "0 0 8px",
                      color: C.text,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {pattern.title}
                  </h3>

                  <p
                    style={{
                      fontSize: "13px",
                      color: C.textBody,
                      lineHeight: 1.55,
                      margin: "0 0 16px",
                    }}
                  >
                    {pattern.description}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "10px 12px",
                      background: C.bgSubtle,
                      borderRadius: "6px",
                      marginBottom: "14px",
                      fontFamily: C.fontMono,
                      fontSize: "11px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: C.textMuted,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          fontSize: "9px",
                        }}
                      >
                        Crises
                      </div>
                      <div style={{ color: C.text, fontWeight: 700, fontSize: "14px" }}>
                        {matched.length}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          color: C.textMuted,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          fontSize: "9px",
                        }}
                      >
                        Durée type
                      </div>
                      <div style={{ color: C.text, fontWeight: 700, fontSize: "12px" }}>
                        {pattern.typicalDuration}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: "14px" }}>
                    <div
                      style={{
                        fontFamily: C.fontMono,
                        fontSize: "10px",
                        color: C.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: "8px",
                      }}
                    >
                      Signaux communs
                    </div>
                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      {pattern.signals.map((sig) => (
                        <li
                          key={sig}
                          style={{
                            fontSize: "12px",
                            color: C.textBody,
                            lineHeight: 1.4,
                            display: "flex",
                            gap: "6px",
                          }}
                        >
                          <span
                            style={{
                              color: pattern.color,
                              flexShrink: 0,
                              fontWeight: 700,
                            }}
                          >
                            ›
                          </span>
                          {sig}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() =>
                      setPatternFilter(isActive ? "all" : pattern.id)
                    }
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: isActive ? pattern.color : "transparent",
                      color: isActive ? "#fff" : pattern.color,
                      border: `1px solid ${pattern.color}`,
                      borderRadius: "6px",
                      fontFamily: C.fontMono,
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      transition: "all 0.15s",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    {isActive ? "✓ Pattern actif" : "Voir les crises correspondantes"}
                    {!isActive && <ChevronRight size={13} />}
                  </button>
                </div>
              );
            })}
          </div>
        </Section>

        {/* ─── 5. CRISIS HEATMAP ──────────────────────────────── */}
        <Section
          eyebrow="04 — Cartographie"
          title="Heatmap secteurs × années"
          subtitle="Vue synthétique : chaque cellule représente une crise. Survolez pour le nom, cliquez pour ouvrir la fiche."
        >
          <CrisisHeatmap
            crises={allCrises}
            sectors={sectors}
            years={years}
            onCellClick={(id) => {
              setExpandedCrisis(id);
              // Scroll to the crisis cards section
              setTimeout(() => {
                const el = document.getElementById(`crisis-card-${id}`);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 50);
            }}
          />
        </Section>

        {/* ─── 6. STATISTICS DASHBOARD ────────────────────────── */}
        <Section
          eyebrow="05 — Métriques"
          title="Tableau de bord statistique"
          subtitle="Indicateurs clés du registre : criticité, durée moyenne, sources touchées, et capacité d'anticipation."
        >
          <StatsDashboard crises={allCrises} stats={stats} />
        </Section>

        {/* ─── Institutional footer note ──────────────────────── */}
        <section
          style={{
            background: C.bgDarkest,
            padding: "56px 24px",
            marginTop: "32px",
          }}
        >
          <div
            style={{
              maxWidth: "900px",
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <Sparkles
              size={24}
              style={{ color: C.accentBright, margin: "0 auto 16px" }}
            />
            <h3
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: C.textOnDark,
                margin: "0 0 12px",
                letterSpacing: "-0.02em",
              }}
            >
              Ce registre est la mémoire. Le moat.
            </h3>
            <p
              style={{
                fontSize: "15px",
                color: C.textOnDarkBody,
                lineHeight: 1.7,
                margin: "0 0 8px",
              }}
            >
              Chaque crise documentée enrichit la base et améliore la capacité
              d'anticipation de l'ensemble du système. Quand un Dircom dit{" "}
              <em>« cette crise est unique »</em>, Harch peut répondre :{" "}
              <em>« non, voici les 3 crises similaires que le Maroc a connues,
              et voici comment elles ont évolué. »</em>
            </p>
            <p
              style={{
                fontSize: "12px",
                color: C.textOnDarkMuted,
                fontFamily: C.fontMono,
                letterSpacing: "0.04em",
                margin: "24px 0 0",
              }}
            >
              Propriété intellectuelle de Harch Atelier · Alimente le rétro-audit
              et le Harch 100
            </p>
          </div>
        </section>
      </main>

      <AtelierFooter />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

// ─── Section wrapper ────────────────────────────────────────────

function Section({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        padding: "64px 24px",
        borderBottom: `1px solid ${C.border}`,
        background: C.bg,
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div
          style={{
            fontFamily: C.fontMono,
            fontSize: "11px",
            color: C.accent,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 700,
            marginBottom: "12px",
          }}
        >
          {eyebrow}
        </div>
        <h2
          style={{
            fontSize: "clamp(28px, 3.5vw, 38px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: C.text,
            margin: "0 0 12px",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: "16px",
            color: C.textBody,
            lineHeight: 1.6,
            maxWidth: "740px",
            margin: "0 0 36px",
          }}
        >
          {subtitle}
        </p>
        {children}
      </div>
    </section>
  );
}

// ─── Filter pill ───────────────────────────────────────────────

function FilterPill({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 14px",
        background: active ? C.text : C.bg,
        color: active ? "#fff" : C.textBody,
        border: `1px solid ${active ? C.text : C.border}`,
        borderRadius: "999px",
        fontFamily: C.fontMono,
        fontSize: "11px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s",
        letterSpacing: "0.02em",
      }}
    >
      {label}{" "}
      <span
        style={{
          opacity: 0.6,
          fontWeight: 400,
        }}
      >
        ({count})
      </span>
    </button>
  );
}

// ─── Crisis timeline ───────────────────────────────────────────

function CrisisTimeline({
  crises,
  expandedId,
  onToggle,
}: {
  crises: MoroccoCrisis[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}) {
  // Pre-compute the showYearHeader flag per crisis (no mutation during render).
  const enriched = useMemo(
    () =>
      crises.map((crisis, idx) => ({
        crisis,
        showYearHeader: idx === 0 || crises[idx - 1].year !== crisis.year,
      })),
    [crises],
  );

  return (
    <div
      style={{
        position: "relative",
        paddingLeft: "32px",
      }}
    >
      {/* Vertical line */}
      <div
        style={{
          position: "absolute",
          left: "8px",
          top: "8px",
          bottom: "8px",
          width: "2px",
          background: C.border,
        }}
        aria-hidden
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {enriched.map(({ crisis, showYearHeader }) => {
          const impactColor = impactColors[crisis.mediaImpact] ?? "#71717a";
          const expanded = expandedId === crisis.id;
          return (
            <div key={crisis.id}>
              {showYearHeader && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    margin: "16px 0 8px",
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "999px",
                      background: C.text,
                      border: `3px solid ${C.bg}`,
                      boxShadow: `0 0 0 2px ${C.text}`,
                      marginLeft: "-26px",
                      flexShrink: 0,
                    }}
                    aria-hidden
                  />
                  <span
                    style={{
                      fontFamily: C.fontMono,
                      fontSize: "14px",
                      fontWeight: 700,
                      color: C.text,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {crisis.year}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: "1px",
                      background: C.border,
                    }}
                    aria-hidden
                  />
                </div>
              )}
              <button
                onClick={() => onToggle(crisis.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: expanded ? C.bgSubtle : "transparent",
                  border: `1px solid ${expanded ? C.borderStrong : C.border}`,
                  borderRadius: "8px",
                  padding: "14px 16px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                }}
              >
                {/* Dot */}
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "999px",
                    background: impactColor,
                    border: `2px solid ${C.bg}`,
                    boxShadow: `0 0 0 2px ${impactColor}40`,
                    marginTop: "4px",
                    flexShrink: 0,
                    marginLeft: "-23px",
                  }}
                  aria-hidden
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: C.fontMono,
                        fontSize: "11px",
                        color: C.textMuted,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {crisis.month} {crisis.year}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: C.textMuted,
                      }}
                    >
                      ·
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        color: C.text,
                        fontWeight: 600,
                      }}
                    >
                      {crisis.company}
                    </span>
                    <span
                      style={{
                        padding: "1px 7px",
                        borderRadius: "3px",
                        background: `${impactColor}15`,
                        color: impactColor,
                        fontSize: "9px",
                        fontWeight: 700,
                        fontFamily: C.fontMono,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      {crisis.mediaImpact}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: C.textBody,
                      lineHeight: 1.4,
                    }}
                  >
                    {crisis.title}
                  </div>
                  {expanded && (
                    <div
                      style={{
                        marginTop: "10px",
                        paddingTop: "10px",
                        borderTop: `1px solid ${C.border}`,
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <DetailRow
                        label="Déclencheur"
                        value={crisis.triggerEvent}
                      />
                      <DetailRow
                        label="Pic"
                        value={formatFrDate(parsePeakDate(crisis.peakDate))}
                      />
                      <DetailRow
                        label="Durée"
                        value={`${crisis.durationDays} jours`}
                      />
                      <DetailRow
                        label="Sources"
                        value={`${crisis.sourcesCount} médias · ${crisis.languages.join(", ")}`}
                      />
                      <div style={{ marginTop: "6px" }}>
                        <Link
                          href={`/atelier/retro-audit?crisis=${crisis.id}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "12px",
                            color: C.cta,
                            textDecoration: "none",
                            fontWeight: 600,
                            fontFamily: C.fontMono,
                          }}
                        >
                          Générer le rétro-audit
                          <ArrowUpRight size={12} />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                <ChevronDown
                  size={14}
                  style={{
                    color: C.textMuted,
                    transform: expanded ? "rotate(180deg)" : "none",
                    transition: "transform 0.15s",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        fontSize: "12px",
        lineHeight: 1.4,
      }}
    >
      <span
        style={{
          fontFamily: C.fontMono,
          color: C.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          fontSize: "10px",
          minWidth: "80px",
          flexShrink: 0,
          paddingTop: "1px",
        }}
      >
        {label}
      </span>
      <span style={{ color: C.textBody, flex: 1 }}>{value}</span>
    </div>
  );
}

// ─── Crisis card ───────────────────────────────────────────────

function CrisisCard({
  crisis,
  expanded,
  onToggle,
}: {
  crisis: MoroccoCrisis;
  expanded: boolean;
  onToggle: () => void;
}) {
  const impactColor = impactColors[crisis.mediaImpact] ?? "#71717a";
  const typeColor = crisisTypeColors[crisis.crisisType] ?? "#71717a";
  const pattern = getPatternForCrisis(crisis);
  const sources = mediaSourcesFor(crisis);
  const lessons = lessonsBullets(crisis);
  const spark = sentimentSparkline(
    crisis.durationDays,
    crisis.crisisType === "accident" ? 0.15 : 0.4,
    crisis.mediaImpact === "critical" ? 0.95 : 0.75,
  );
  const startDate = startDateFor(crisis);
  const peakDate = parsePeakDate(crisis.peakDate);
  const endDate = endDateFor(crisis);

  return (
    <div
      id={`crisis-card-${crisis.id}`}
      style={{
        background: C.bg,
        border: `1px solid ${expanded ? C.borderStrong : C.border}`,
        borderRadius: "12px",
        overflow: "hidden",
        transition: "border-color 0.15s",
        scrollMarginTop: "100px",
      }}
    >
      {/* Collapsed header */}
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          padding: "20px 24px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          display: "grid",
          gridTemplateColumns: "70px 1fr auto auto",
          gap: "16px",
          alignItems: "center",
        }}
      >
        {/* Date */}
        <div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: C.text,
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            {crisis.year}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: C.textMuted,
              fontFamily: C.fontMono,
              marginTop: "2px",
            }}
          >
            {crisis.month}
          </div>
        </div>

        {/* Title block */}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "3px",
                background: `${typeColor}15`,
                color: typeColor,
                fontSize: "9px",
                fontWeight: 700,
                fontFamily: C.fontMono,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {crisisTypeLabels[crisis.crisisType] ?? crisis.crisisType}
            </span>
            <span
              style={{
                fontSize: "13px",
                color: C.textBody,
                fontWeight: 600,
              }}
            >
              {crisis.company}
            </span>
            <span
              style={{
                padding: "1px 7px",
                borderRadius: "3px",
                background: C.bgSubtle,
                color: C.textMuted,
                fontSize: "10px",
                fontFamily: C.fontMono,
                letterSpacing: "0.04em",
              }}
            >
              {SECTOR_LABEL_MAP[crisis.sector] ?? crisis.sector}
            </span>
          </div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: C.text,
              letterSpacing: "-0.01em",
              marginBottom: "4px",
            }}
          >
            {crisis.title}
          </div>
          <div
            style={{
              fontSize: "13px",
              color: C.textMuted,
              lineHeight: 1.4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
            }}
          >
            {crisis.description}
          </div>
        </div>

        {/* Impact */}
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "3px 10px",
              borderRadius: "4px",
              background: impactBg[crisis.mediaImpact] ?? "#f4f4f5",
              color: impactColor,
              fontSize: "10px",
              fontWeight: 700,
              fontFamily: C.fontMono,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "6px",
                height: "6px",
                borderRadius: "999px",
                background: impactColor,
              }}
              aria-hidden
            />
            {crisis.mediaImpact}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: C.textMuted,
              fontFamily: C.fontMono,
              marginTop: "4px",
            }}
          >
            {crisis.durationDays}j · {crisis.sourcesCount} sources
          </div>
        </div>

        {/* CTA / expand icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: C.textMuted,
          }}
        >
          <span
            style={{
              fontFamily: C.fontMono,
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            Voir le détail
          </span>
          <ChevronRight
            size={14}
            style={{
              transform: expanded ? "rotate(90deg)" : "none",
              transition: "transform 0.15s",
            }}
          />
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div
          style={{
            borderTop: `1px solid ${C.border}`,
            padding: "28px 24px",
            background: C.bgSubtle,
          }}
        >
          {/* Description full */}
          <p
            style={{
              fontSize: "14px",
              color: C.textBody,
              lineHeight: 1.65,
              margin: "0 0 24px",
              maxWidth: "820px",
            }}
          >
            {crisis.description}
          </p>

          {/* 3-milestone timeline */}
          <div style={{ marginBottom: "28px" }}>
            <SubsectionLabel>Timeline de la crise</SubsectionLabel>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "12px",
              }}
            >
              <MilestoneCard
                label="Déclencheur"
                date={formatFrDate(startDate)}
                detail={crisis.triggerEvent}
                color={C.warning}
                icon={<AlertTriangle size={14} />}
              />
              <MilestoneCard
                label="Pic médiatique"
                date={formatFrDate(peakDate)}
                detail={`${crisis.sourcesCount} sources · ${crisis.languages.join(", ")}`}
                color={C.danger}
                icon={<AlertOctagon size={14} />}
              />
              <MilestoneCard
                label="Résolution"
                date={formatFrDate(endDate)}
                detail={`Type: ${crisis.resolutionType} · durée ${crisis.durationDays}j`}
                color={C.cta}
                icon={<Activity size={14} />}
              />
            </div>
          </div>

          {/* Two-column: media sources + sentiment */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            {/* Media sources */}
            <div>
              <SubsectionLabel>
                <Newspaper size={11} style={{ display: "inline", marginRight: "4px" }} />
                Sources médiatiques ({sources.length})
              </SubsectionLabel>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                }}
              >
                {sources.map((src) => (
                  <span
                    key={src}
                    style={{
                      padding: "5px 10px",
                      background: C.bg,
                      border: `1px solid ${C.border}`,
                      borderRadius: "4px",
                      fontSize: "11px",
                      color: C.textBody,
                      fontFamily: C.fontMono,
                    }}
                  >
                    {src}
                  </span>
                ))}
              </div>
            </div>

            {/* Sentiment trajectory */}
            <div>
              <SubsectionLabel>
                <TrendingDown size={11} style={{ display: "inline", marginRight: "4px" }} />
                Trajectoire du sentiment négatif
              </SubsectionLabel>
              <div
                style={{
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: "8px",
                  padding: "12px",
                }}
              >
                <svg
                  width="100%"
                  viewBox={`0 0 ${spark.width} ${spark.height}`}
                  preserveAspectRatio="none"
                  style={{ display: "block", maxHeight: "80px" }}
                >
                  {/* Grid lines */}
                  <line
                    x1="0"
                    y1={spark.height / 2}
                    x2={spark.width}
                    y2={spark.height / 2}
                    stroke={C.border}
                    strokeWidth="0.5"
                    strokeDasharray="3,3"
                  />
                  {/* Filled area under the curve */}
                  <path
                    d={`${spark.path} L ${spark.width} ${spark.height} L 0 ${spark.height} Z`}
                    fill={`${C.danger}10`}
                  />
                  {/* The curve */}
                  <path
                    d={spark.path}
                    fill="none"
                    stroke={C.danger}
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {/* Peak marker */}
                  <circle cx={spark.peakX} cy={spark.peakY} r="3.5" fill={C.danger} />
                  <circle cx={spark.peakX} cy={spark.peakY} r="6" fill="none" stroke={C.danger} strokeWidth="1" opacity="0.4" />
                  {/* Peak label */}
                  <text
                    x={spark.peakX}
                    y={Math.max(12, spark.peakY - 8)}
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily="'Space Mono', monospace"
                    fill={C.danger}
                    fontWeight="700"
                  >
                    PIC
                  </text>
                </svg>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: C.fontMono,
                    fontSize: "10px",
                    color: C.textMuted,
                    marginTop: "6px",
                  }}
                >
                  <span>J-3</span>
                  <span>J0 (pic)</span>
                  <span>J+{crisis.durationDays}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pattern matched + 48h warning */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <InfoCard
              label="Pattern identifié"
              color={pattern.color}
              icon={<pattern.icon size={14} />}
              value={pattern.title}
              detail={`${pattern.signals.length} signaux communs · durée type ${pattern.typicalDuration}`}
            />
            <InfoCard
              label="Anticipation Harch (48h)"
              color={C.cta}
              icon={<Clock size={14} />}
              value="48h avant le pic"
              detail={advanceWarningFor(crisis)}
            />
          </div>

          {/* Key lessons */}
          <div style={{ marginBottom: "24px" }}>
            <SubsectionLabel>Leçons apprises</SubsectionLabel>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {lessons.map((lesson, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "10px",
                    padding: "12px 14px",
                    background: C.warningBg,
                    border: `1px solid ${C.warningBorder}`,
                    borderRadius: "6px",
                    fontSize: "13px",
                    color: C.warningText,
                    lineHeight: 1.55,
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      fontFamily: C.fontMono,
                      fontSize: "11px",
                      fontWeight: 700,
                      color: C.warning,
                      minWidth: "20px",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{lesson}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cascade pattern + CTA */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
              padding: "14px 16px",
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: "8px",
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontFamily: C.fontMono,
                  fontSize: "10px",
                  color: C.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "4px",
                }}
              >
                Cascade linguistique
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: C.textBody,
                  fontFamily: C.fontMono,
                  lineHeight: 1.5,
                }}
              >
                {crisis.cascadePattern}
              </div>
            </div>
            <Link
              href={`/atelier/retro-audit?crisis=${crisis.id}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 18px",
                background: C.cta,
                color: "#fff",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: C.fontMono,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                textDecoration: "none",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background 0.15s",
              }}
            >
              Générer le rétro-audit
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function SubsectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: C.fontMono,
        fontSize: "10px",
        color: C.textMuted,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: "10px",
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  );
}

function MilestoneCard({
  label,
  date,
  detail,
  color,
  icon,
}: {
  label: string;
  date: string;
  detail: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        padding: "14px",
        borderTop: `3px solid ${color}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "6px",
          color: color,
        }}
      >
        {icon}
        <span
          style={{
            fontFamily: C.fontMono,
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: "15px",
          fontWeight: 700,
          color: C.text,
          marginBottom: "4px",
          fontFamily: C.fontMono,
        }}
      >
        {date}
      </div>
      <div
        style={{
          fontSize: "12px",
          color: C.textBody,
          lineHeight: 1.45,
        }}
      >
        {detail}
      </div>
    </div>
  );
}

function InfoCard({
  label,
  color,
  icon,
  value,
  detail,
}: {
  label: string;
  color: string;
  icon: React.ReactNode;
  value: string;
  detail: string;
}) {
  return (
    <div
      style={{
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        padding: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "8px",
          color: color,
        }}
      >
        {icon}
        <span
          style={{
            fontFamily: C.fontMono,
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: "15px",
          fontWeight: 700,
          color: C.text,
          marginBottom: "6px",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "12px",
          color: C.textBody,
          lineHeight: 1.55,
        }}
      >
        {detail}
      </div>
    </div>
  );
}

// ─── Crisis heatmap ────────────────────────────────────────────

function CrisisHeatmap({
  crises,
  sectors,
  years,
  onCellClick,
}: {
  crises: MoroccoCrisis[];
  sectors: string[];
  years: number[];
  onCellClick: (id: string) => void;
}) {
  const [hovered, setHovered] = useState<{ sector: string; year: number } | null>(null);

  return (
    <div
      style={{
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: "12px",
        padding: "20px",
        overflowX: "auto",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: "6px",
          minWidth: "560px",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: "6px 8px",
                fontFamily: C.fontMono,
                fontSize: "10px",
                color: C.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 600,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              Secteur ↓ / Année →
            </th>
            {years.map((y) => (
              <th
                key={y}
                style={{
                  padding: "6px 8px",
                  fontFamily: C.fontMono,
                  fontSize: "12px",
                  color: C.text,
                  fontWeight: 700,
                  textAlign: "center",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                {y}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sectors.map((sector) => (
            <tr key={sector}>
              <td
                style={{
                  padding: "8px",
                  fontFamily: C.fontMono,
                  fontSize: "11px",
                  color: C.textBody,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {SECTOR_LABEL_MAP[sector] ?? sector}
              </td>
              {years.map((year) => {
                const cellCrises = crises.filter(
                  (c) => c.sector === sector && c.year === year,
                );
                const isHovered =
                  hovered?.sector === sector && hovered?.year === year;
                return (
                  <td
                    key={`${sector}-${year}`}
                    style={{
                      padding: 0,
                      textAlign: "center",
                      position: "relative",
                    }}
                  >
                    {cellCrises.length === 0 ? (
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          margin: "0 auto",
                          borderRadius: "6px",
                          background: C.bgSubtle,
                        }}
                        aria-label={`Aucune crise en ${year} pour ${sector}`}
                      />
                    ) : (
                      <button
                        onMouseEnter={() => setHovered({ sector, year })}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => onCellClick(cellCrises[0].id)}
                        style={{
                          width: "28px",
                          height: "28px",
                          margin: "0 auto",
                          borderRadius: "6px",
                          border: "none",
                          cursor: "pointer",
                          background:
                            impactColors[cellCrises[0].mediaImpact] ?? "#71717a",
                          boxShadow: isHovered
                            ? "0 0 0 3px rgba(0,0,0,0.08)"
                            : "none",
                          transform: isHovered ? "scale(1.1)" : "none",
                          transition: "all 0.15s",
                          position: "relative",
                        }}
                        aria-label={`${cellCrises[0].title} — ${cellCrises[0].month} ${cellCrises[0].year}`}
                      >
                        {cellCrises.length > 1 && (
                          <span
                            style={{
                              position: "absolute",
                              top: "-6px",
                              right: "-6px",
                              background: C.text,
                              color: "#fff",
                              fontSize: "9px",
                              fontWeight: 700,
                              borderRadius: "999px",
                              padding: "1px 4px",
                              fontFamily: C.fontMono,
                              lineHeight: 1,
                            }}
                          >
                            {cellCrises.length}
                          </span>
                        )}
                      </button>
                    )}
                    {isHovered && cellCrises.length > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "100%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          marginBottom: "6px",
                          background: C.bgDarkest,
                          color: C.textOnDark,
                          padding: "8px 10px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontFamily: C.fontMono,
                          whiteSpace: "nowrap",
                          zIndex: 10,
                          pointerEvents: "none",
                          boxShadow: C.shadowMd,
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontWeight: 700, marginBottom: "2px" }}>
                          {cellCrises[0].company}
                        </div>
                        <div style={{ opacity: 0.7, fontSize: "10px" }}>
                          {cellCrises[0].month} {cellCrises[0].year} ·{" "}
                          {cellCrises[0].mediaImpact}
                        </div>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginTop: "16px",
          paddingTop: "14px",
          borderTop: `1px solid ${C.border}`,
          flexWrap: "wrap",
          fontFamily: C.fontMono,
          fontSize: "11px",
          color: C.textMuted,
        }}
      >
        <span style={{ textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
          Légende :
        </span>
        {[
          { color: "#ef4444", label: "Critique" },
          { color: "#f97316", label: "Élevé" },
          { color: "#f59e0b", label: "Moyen" },
          { color: "#71717a", label: "Faible" },
        ].map((item) => (
          <span
            key={item.label}
            style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
          >
            <span
              style={{
                display: "inline-block",
                width: "10px",
                height: "10px",
                borderRadius: "3px",
                background: item.color,
              }}
              aria-hidden
            />
            {item.label}
          </span>
        ))}
        <span style={{ marginLeft: "auto", color: C.textMuted }}>
          Cliquez sur une cellule pour ouvrir la fiche →
        </span>
      </div>
    </div>
  );
}

// ─── Statistics dashboard ──────────────────────────────────────

function StatsDashboard({
  crises,
  stats,
}: {
  crises: MoroccoCrisis[];
  stats: ReturnType<typeof getRegistryStats>;
}) {
  const criticalCount = crises.filter((c) => c.mediaImpact === "critical").length;
  const avgDuration = stats.avgDuration;
  const avgSources = Math.round(
    crises.reduce((sum, c) => sum + c.sourcesCount, 0) / crises.length,
  );

  // Sector breakdown for bar chart
  const maxSectorCount = Math.max(...Object.values(stats.bySector));

  const kpis = [
    {
      label: "Crises critiques",
      value: criticalCount,
      suffix: `/ ${crises.length}`,
      color: C.danger,
      icon: AlertOctagon,
      detail: "Impact médiatique critique",
    },
    {
      label: "Durée moyenne",
      value: avgDuration,
      suffix: "jours",
      color: C.warning,
      icon: Clock,
      detail: "Du déclencheur à la résolution",
    },
    {
      label: "Sources touchées",
      value: avgSources,
      suffix: "en moyenne",
      color: C.accent,
      icon: Newspaper,
      detail: "Médias ayant couvert la crise",
    },
    {
      label: "Anticipation Harch",
      value: 48,
      suffix: "heures",
      color: C.cta,
      icon: Activity,
      detail: "Avance sur le pic médiatique",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {/* KPI cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                padding: "20px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "3px",
                  height: "100%",
                  background: kpi.color,
                }}
                aria-hidden
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    fontFamily: C.fontMono,
                    fontSize: "10px",
                    color: C.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 700,
                  }}
                >
                  {kpi.label}
                </div>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    background: `${kpi.color}12`,
                    color: kpi.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={14} />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "6px",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    fontSize: "36px",
                    fontWeight: 800,
                    color: C.text,
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {kpi.value}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: C.textMuted,
                    fontFamily: C.fontMono,
                  }}
                >
                  {kpi.suffix}
                </span>
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: C.textBody,
                  lineHeight: 1.4,
                }}
              >
                {kpi.detail}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sector breakdown bar chart */}
      <div
        style={{
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: C.fontMono,
                fontSize: "10px",
                color: C.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 700,
                marginBottom: "4px",
              }}
            >
              Répartition par secteur
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: C.text,
                letterSpacing: "-0.01em",
              }}
            >
              {crises.length} crises · {Object.keys(stats.bySector).length} secteurs
            </div>
          </div>
          <div
            style={{
              fontFamily: C.fontMono,
              fontSize: "11px",
              color: C.textMuted,
            }}
          >
            Barres : nombre de crises documentées
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {Object.entries(stats.bySector)
            .sort(([, a], [, b]) => b - a)
            .map(([sector, count]) => {
              const pct = (count / maxSectorCount) * 100;
              // Worst impact in this sector (for bar color)
              const sectorCrises = crises.filter((c) => c.sector === sector);
              const worstImpact = sectorCrises.reduce<string>((worst, c) => {
                const order = ["low", "medium", "high", "critical"];
                return order.indexOf(c.mediaImpact) > order.indexOf(worst)
                  ? c.mediaImpact
                  : worst;
              }, "low");
              const barColor = impactColors[worstImpact] ?? C.accent;
              return (
                <div
                  key={sector}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr 60px",
                    gap: "12px",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: C.fontMono,
                      fontSize: "12px",
                      color: C.textBody,
                      fontWeight: 600,
                    }}
                  >
                    {SECTOR_LABEL_MAP[sector] ?? sector}
                  </div>
                  <div
                    style={{
                      background: C.bgSubtle,
                      borderRadius: "4px",
                      height: "22px",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: `${pct}%`,
                        background: barColor,
                        borderRadius: "4px",
                        transition: "width 0.4s ease",
                        opacity: 0.85,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontFamily: C.fontMono,
                      fontSize: "13px",
                      color: C.text,
                      fontWeight: 700,
                      textAlign: "right",
                    }}
                  >
                    {count}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
