"use client";

import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
//  REGULATORY FEED WIDGET
//
//  Shows the latest regulatory publications from BAM, AMMC, BVC.
//  The Dircom tracks regulatory changes that impact their brand.
//  Inspired by Meltwater's regulatory monitoring module.
// ═══════════════════════════════════════════════════════════════

const C = {
  surface: "#FFFFFF",
  surfaceAlt: "#F4F4F5",
  border: "#E5E5E5",
  text: "#0A0A0A",
  textSec: "#525252",
  textMuted: "#71717A",
  accent: "#78716c",
  cta: "#10b981",
  danger: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  fontSans: "'Inter', system-ui, sans-serif",
  fontMono: "'Space Mono', monospace",
};

interface RegulatoryItem {
  id: string;
  source: "BAM" | "AMMC" | "BVC" | "ONSSA" | "ANRT";
  title: string;
  type: "circular" | "decision" | "communique" | "listing";
  date: string;
  impact: "high" | "medium" | "low";
  summary: string;
}

const DEMO_ITEMS: RegulatoryItem[] = [
  { id: "r1", source: "BAM", title: "Circulaire n° 14/G/2026 sur les exigences de gouvernance interne", type: "circular", date: "2026-08-01", impact: "high", summary: "Renforcement des contrôles internes pour les établissements bancaires. Entrée en vigueur 1er octobre 2026." },
  { id: "r2", source: "AMMC", title: "Décision n° 02/AMMC/2026 — information financière", type: "decision", date: "2026-07-28", impact: "medium", summary: "Nouvelles règles de transparence pour les sociétés cotées. Publication des rapports trimestriels sous 45 jours." },
  { id: "r3", source: "BVC", title: "Avis de cotation — OCP Group", type: "listing", date: "2026-07-25", impact: "low", summary: "Ajustement du flottant suite à l'opération de rachat d'actions." },
  { id: "r4", source: "BAM", title: "Communiqué sur les taux directeurs", type: "communique", date: "2026-07-22", impact: "high", summary: "Maintien du taux directeur à 2,75%. Inflation projetée à 2,1% pour 2026." },
  { id: "r5", source: "ONSSA", title: "Réglementation sur l'étiquetage des produits alimentaires", type: "circular", date: "2026-07-18", impact: "medium", summary: "Nouvelles exigences d'information nutritionnelle pour les produits transformés." },
];

const SOURCE_META = {
  BAM: { color: "#1e3a5f", label: "Bank Al-Maghrib" },
  AMMC: { color: "#4a7b5f", label: "AMMC" },
  BVC: { color: "#8b6914", label: "Bourse de Casablanca" },
  ONSSA: { color: "#a0524b", label: "ONSSA" },
  ANRT: { color: "#78716c", label: "ANRT" },
};

const IMPACT_META = {
  high: { color: C.danger, label: "HIGH" },
  medium: { color: C.warning, label: "MED" },
  low: { color: C.textMuted, label: "LOW" },
};

export function RegulatoryFeedWidget() {
  const [items, setItems] = useState<RegulatoryItem[]>(DEMO_ITEMS);
  useEffect(() => { fetch("/api/console/regulatory-feed").then(r => r.ok ? r.json() : null).then(d => { if (d?.items) setItems(d.items); }).catch(() => {}); }, []);
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <div style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, color: C.text, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "4px" }}>
            Regulatory Feed
          </div>
          <div style={{ fontSize: "13px", color: C.textSec }}>
            BAM · AMMC · BVC · ONSSA · ANRT — dernières publications
          </div>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {Object.entries(SOURCE_META).map(([key, meta]) => (
            <span key={key} style={{ fontFamily: C.fontMono, fontSize: "9px", fontWeight: 700, padding: "2px 6px", borderRadius: "3px", background: meta.color + "15", color: meta.color }}>
              {key}
            </span>
          ))}
        </div>
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {items.map((item) => {
          const src = SOURCE_META[item.source];
          const impact = IMPACT_META[item.impact];
          return (
            <div
              key={item.id}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: "12px",
                padding: "12px 14px",
                background: C.surfaceAlt,
                borderRadius: "8px",
                border: `1px solid ${C.border}`,
                borderLeft: `3px solid ${src.color}`,
                alignItems: "start",
              }}
            >
              {/* Source badge */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", minWidth: "48px" }}>
                <span style={{ fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", background: src.color, color: "#fff" }}>
                  {item.source}
                </span>
                <span style={{ fontFamily: C.fontMono, fontSize: "9px", color: C.textMuted }}>{new Date(item.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</span>
              </div>

              {/* Content */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <span style={{ fontFamily: C.fontMono, fontSize: "9px", padding: "1px 5px", borderRadius: "3px", background: C.surface, color: C.textMuted, border: `1px solid ${C.border}`, textTransform: "uppercase" }}>
                    {item.type}
                  </span>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: C.text, lineHeight: 1.3, marginBottom: "4px" }}>
                  {item.title}
                </div>
                <p style={{ margin: 0, fontSize: "12px", color: C.textSec, lineHeight: 1.45 }}>
                  {item.summary}
                </p>
              </div>

              {/* Impact badge */}
              <div style={{ textAlign: "right" }}>
                <span style={{ fontFamily: C.fontMono, fontSize: "9px", fontWeight: 700, padding: "2px 6px", borderRadius: "3px", background: impact.color + "15", color: impact.color }}>
                  {impact.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted }}>
          Scraped daily at 06:00 UTC · /api/cron/scrape-regulatory
        </span>
        <button style={{ fontFamily: C.fontMono, fontSize: "11px", color: C.accent, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
          View all →
        </button>
      </div>
    </div>
  );
}
