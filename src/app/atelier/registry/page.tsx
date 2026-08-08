"use client";

import { useState, useEffect } from "react";
import { C } from "../components/tokens";
import { BrandBadge } from "@/components/BrandBadge";
import {
  MOROCCO_CRISIS_REGISTRY,
  getRegistryStats,
  type MoroccoCrisis,
} from "@/lib/registry/morocco-crises";

// ═══════════════════════════════════════════════════════════════
//  REGISTRE NATIONAL — La mémoire institutionnelle
//
//  Cette page n'est pas marketing. C'est un registre.
//  Chaque crise est documentée, datée, analysée.
//  C'est ce qui fait de Harch une institution.
// ═══════════════════════════════════════════════════════════════

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
};

const impactColors: Record<string, string> = {
  low: "#71717a",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

export default function RegistryPage() {
  const [filter, setFilter] = useState<string>("all");
  const stats = getRegistryStats();

  const sectors = Array.from(new Set(MOROCCO_CRISIS_REGISTRY.map((c) => c.sector)));
  const filtered = filter === "all" ? MOROCCO_CRISIS_REGISTRY : MOROCCO_CRISIS_REGISTRY.filter((c) => c.sector === filter);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.fontSans, color: C.text }}>
      {/* Header — institutional, not marketing */}
      <header style={{
        padding: "20px 24px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: C.bg,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <BrandBadge subsidiary="Atelier" size="sm" theme="light" />
          <span style={{
            fontFamily: C.fontMono,
            fontSize: "10px",
            color: C.text,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            borderLeft: `1px solid ${C.border}`,
            paddingLeft: "10px",
            fontWeight: 700,
          }}>
            Registre National des Crises Réputationnelles
          </span>
        </div>
        <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted }}>
          {stats.total} crises documentées · depuis {Math.min(...Object.keys(stats.byYear).map(Number))}
        </span>
      </header>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Title — serious, institutional */}
        <h1 style={{
          fontSize: "32px",
          fontWeight: 800,
          margin: "0 0 12px",
          letterSpacing: "-0.03em",
          color: C.text,
        }}>
          La mémoire des crises réputationnelles du Maroc
        </h1>
        <p style={{
          fontSize: "16px",
          color: C.textBody,
          lineHeight: 1.7,
          maxWidth: "700px",
          marginBottom: "40px",
        }}>
          Chaque crise réputationnelle majeure qui a touché une entreprise marocaine est documentée ici :
          date, entreprise, cause, vélocité, impact médiatique, cascade linguistique, durée, résolution.
          Ce registre est la base de données historique que Harch Atelier utilise pour le pattern matching
          et l'analyse comparative. Aucun autre acteur ne dispose de cette vue historique du marché marocain.
        </p>

        {/* Stats bar */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}>
          <div style={{ padding: "20px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "8px" }}>
            <div style={{ fontSize: "32px", fontWeight: 800, color: C.text, lineHeight: 1 }}>{stats.total}</div>
            <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "4px" }}>Crises documentées</div>
          </div>
          <div style={{ padding: "20px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "8px" }}>
            <div style={{ fontSize: "32px", fontWeight: 800, color: C.text, lineHeight: 1 }}>{Object.keys(stats.bySector).length}</div>
            <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "4px" }}>Secteurs couverts</div>
          </div>
          <div style={{ padding: "20px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "8px" }}>
            <div style={{ fontSize: "32px", fontWeight: 800, color: C.text, lineHeight: 1 }}>{stats.avgDuration}j</div>
            <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "4px" }}>Durée moyenne</div>
          </div>
          <div style={{ padding: "20px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "8px" }}>
            <div style={{ fontSize: "32px", fontWeight: 800, color: C.text, lineHeight: 1 }}>{Object.keys(stats.byYear).length}</div>
            <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "4px" }}>Années couvertes</div>
          </div>
        </div>

        {/* Filter */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
          <button
            onClick={() => setFilter("all")}
            style={{
              padding: "6px 14px",
              background: filter === "all" ? C.text : C.bg,
              color: filter === "all" ? "#fff" : C.textBody,
              border: `1px solid ${filter === "all" ? C.text : C.border}`,
              borderRadius: "4px",
              fontFamily: C.fontMono,
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tous ({stats.total})
          </button>
          {sectors.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: "6px 14px",
                background: filter === s ? C.text : C.bg,
                color: filter === s ? "#fff" : C.textBody,
                border: `1px solid ${filter === s ? C.text : C.border}`,
                borderRadius: "4px",
                fontFamily: C.fontMono,
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {s} ({stats.bySector[s] ?? 0})
            </button>
          ))}
        </div>

        {/* Crisis cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filtered.map((crisis) => (
            <CrisisCard key={crisis.id} crisis={crisis} />
          ))}
        </div>

        {/* Footer — institutional */}
        <div style={{
          marginTop: "48px",
          padding: "24px",
          background: "#0a0a0a",
          borderRadius: "12px",
          textAlign: "center",
        }}>
          <p style={{
            fontSize: "14px",
            color: "#a1a1aa",
            lineHeight: 1.6,
            margin: 0,
          }}>
            Ce registre est la propriété intellectuelle de Harch Atelier.
            Il alimente le moteur de pattern matching du rétro-audit et du Harch 100.
            <br />
            Chaque nouvelle crise documentée enrichit la base et améliore la capacité
            d'anticipation de l'ensemble du système.
          </p>
        </div>
      </main>
    </div>
  );
}

function CrisisCard({ crisis }: { crisis: MoroccoCrisis }) {
  const [expanded, setExpanded] = useState(false);
  const typeColor = crisisTypeColors[crisis.crisisType] || "#71717a";
  const impactColor = impactColors[crisis.mediaImpact] || "#71717a";

  return (
    <div style={{
      background: C.bg,
      border: `1px solid ${C.border}`,
      borderRadius: "12px",
      overflow: "hidden",
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          padding: "20px 24px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          display: "grid",
          gridTemplateColumns: "60px 1fr auto auto",
          gap: "16px",
          alignItems: "center",
        }}
      >
        {/* Year + month */}
        <div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: C.text, lineHeight: 1 }}>{crisis.year}</div>
          <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono }}>{crisis.month}</div>
        </div>

        {/* Title + company */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{
              padding: "2px 8px",
              borderRadius: "3px",
              background: `${typeColor}15`,
              color: typeColor,
              fontSize: "9px",
              fontWeight: 700,
              fontFamily: C.fontMono,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}>
              {crisis.crisisType}
            </span>
            <span style={{ fontSize: "13px", color: C.textBody, fontWeight: 500 }}>{crisis.company}</span>
            <span style={{ fontSize: "11px", color: C.textMuted }}>· {crisis.sector}</span>
          </div>
          <div style={{ fontSize: "16px", fontWeight: 600, color: C.text }}>{crisis.title}</div>
        </div>

        {/* Impact */}
        <div style={{ textAlign: "right" }}>
          <div style={{
            display: "inline-block",
            padding: "3px 10px",
            borderRadius: "4px",
            background: `${impactColor}15`,
            color: impactColor,
            fontSize: "10px",
            fontWeight: 700,
            fontFamily: C.fontMono,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            {crisis.mediaImpact}
          </div>
          <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono, marginTop: "4px" }}>{crisis.durationDays}j</div>
        </div>

        {/* Expand icon */}
        <div style={{ fontSize: "14px", color: C.textMuted }}>{expanded ? "−" : "+"}</div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{
          padding: "0 24px 24px",
          borderTop: `1px solid ${C.border}`,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "20px" }}>
            <div>
              <div style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Description</div>
              <p style={{ fontSize: "14px", color: C.textBody, lineHeight: 1.6, margin: "0 0 16px 0" }}>{crisis.description}</p>

              <div style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Déclencheur</div>
              <p style={{ fontSize: "13px", color: C.textBody, lineHeight: 1.5, margin: "0 0 16px 0" }}>{crisis.triggerEvent}</p>

              <div style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Cascade linguistique</div>
              <p style={{ fontSize: "13px", color: C.textBody, lineHeight: 1.5, margin: 0 }}>{crisis.cascadePattern}</p>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Leçon apprise</div>
              <div style={{
                padding: "16px",
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: "8px",
                fontSize: "13px",
                color: "#92400e",
                lineHeight: 1.6,
                marginBottom: "16px",
              }}>
                {crisis.lessonsLearned}
              </div>

              <div style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Résolution</div>
              <p style={{ fontSize: "13px", color: C.textBody, lineHeight: 1.5, margin: "0 0 16px 0" }}>
                Type: <strong>{crisis.resolutionType}</strong> · Pic: {crisis.peakDate} · Sources: {crisis.sourcesCount}
              </p>

              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {crisis.languages.map((lang) => (
                  <span key={lang} style={{
                    padding: "3px 8px",
                    background: C.bgSubtle,
                    borderRadius: "3px",
                    fontSize: "11px",
                    color: C.textBody,
                    fontFamily: C.fontMono,
                  }}>
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
