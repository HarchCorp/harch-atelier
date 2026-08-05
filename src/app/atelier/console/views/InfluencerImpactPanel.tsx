"use client";

import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
//  INFLUENCER IMPACT PANEL
//
//  Inspired by Talkwalker + Meltwater influencer identification.
//  Shows the top accounts driving conversations about the brand,
//  with reach, sentiment, and authority score. The Dircom can
//  see WHO is amplifying (or attacking) the brand.
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

interface Influencer {
  handle: string;
  name: string;
  platform: "twitter" | "linkedin" | "tiktok" | "facebook" | "instagram";
  followers: number;
  mentions: number;
  sentiment: number;
  reach: number;
  authority: number; // 0-100
  verified: boolean;
}

const DEMO_INFLUENCERS: Influencer[] = [
  { handle: "@drissbasri", name: "Driss Basri", platform: "twitter", followers: 142000, mentions: 12, sentiment: -0.42, reach: 89000, authority: 78, verified: true },
  { handle: "@salma_dircom", name: "Salma El Fassi", platform: "linkedin", followers: 28000, mentions: 8, sentiment: 0.34, reach: 42000, authority: 65, verified: true },
  { handle: "@tiktok_eco", name: "EcoMaroc TT", platform: "tiktok", followers: 450000, mentions: 3, sentiment: -0.58, reach: 320000, authority: 82, verified: true },
  { handle: "@ahmed_journalist", name: "Ahmed Benani", platform: "twitter", followers: 67000, mentions: 15, sentiment: 0.12, reach: 51000, authority: 71, verified: false },
  { handle: "@finance_ma", name: "Finance Maroc", platform: "linkedin", followers: 95000, mentions: 6, sentiment: 0.21, reach: 78000, authority: 74, verified: true },
  { handle: "@boycott_ma", name: "Boycott Maroc", platform: "facebook", followers: 230000, mentions: 24, sentiment: -0.78, reach: 180000, authority: 69, verified: false },
];

const PLATFORM_META = {
  twitter: { icon: "𝕏", color: "#0A0A0A", label: "X" },
  linkedin: { icon: "in", color: "#0A66C2", label: "LinkedIn" },
  tiktok: { icon: "♪", color: "#000000", label: "TikTok" },
  facebook: { icon: "f", color: "#1877F2", label: "Facebook" },
  instagram: { icon: "📷", color: "#E4405F", label: "Instagram" },
};

function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toString();
}

export function InfluencerImpactPanel() {
  const [influencers, setInfluencers] = useState<Influencer[]>(DEMO_INFLUENCERS);
  const [sortBy, setSortBy] = useState<"reach" | "mentions" | "authority" | "sentiment">("reach");
  const [filter, setFilter] = useState<"all" | "positive" | "negative">("all");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/console/influencer-impact", { signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.influencers) setInfluencers(d.influencers); })
      .catch((e) => { if (!(e instanceof DOMException && e.name === "AbortError")) {} });
    return () => controller.abort();
  }, []);

  const filtered = influencers.filter((i) => {
    if (filter === "positive") return i.sentiment > 0;
    if (filter === "negative") return i.sentiment < 0;
    return true;
  }).sort((a, b) => {
    if (sortBy === "reach") return b.reach - a.reach;
    if (sortBy === "mentions") return b.mentions - a.mentions;
    if (sortBy === "authority") return b.authority - a.authority;
    return a.sentiment - b.sentiment; // most negative first
  });

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, color: C.text, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "4px" }}>
            Influencer Impact
          </div>
          <div style={{ fontSize: "13px", color: C.textSec }}>
            Top accounts driving the conversation · 30j
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "4px" }}>
          {(["all", "positive", "negative"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                border: `1px solid ${filter === f ? C.text : C.border}`,
                background: filter === f ? C.text : C.surface,
                color: filter === f ? "#fff" : C.textSec,
                fontFamily: C.fontMono,
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {f === "all" ? "All" : f === "positive" ? "↑ Positive" : "↓ Negative"}
            </button>
          ))}
        </div>
      </div>

      {/* Sort buttons */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
        <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, alignSelf: "center" }}>SORT BY:</span>
        {(["reach", "mentions", "authority", "sentiment"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            style={{
              padding: "3px 8px",
              borderRadius: "4px",
              background: sortBy === s ? C.surfaceAlt : "transparent",
              border: `1px solid ${sortBy === s ? C.accent : C.border}`,
              fontFamily: C.fontMono,
              fontSize: "10px",
              fontWeight: 600,
              color: sortBy === s ? C.accent : C.textMuted,
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Influencer cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.map((inf, i) => {
          const plat = PLATFORM_META[inf.platform];
          const sentimentColor = inf.sentiment > 0.1 ? C.cta : inf.sentiment < -0.1 ? C.danger : C.textMuted;
          return (
            <div
              key={inf.handle}
              style={{
                display: "grid",
                gridTemplateColumns: "32px 1fr auto",
                gap: "14px",
                alignItems: "center",
                padding: "12px 14px",
                background: C.surfaceAlt,
                borderRadius: "10px",
                border: `1px solid ${C.border}`,
                transition: "border-color 0.15s",
              }}
            >
              {/* Rank + platform icon */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted }}>#{i + 1}</span>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    background: plat.color,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  {plat.icon}
                </div>
              </div>

              {/* Name + handle */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>{inf.name}</span>
                  {inf.verified && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={C.info}>
                      <path d="M12 2l2.4 1.8 3 .2.9 2.9 2.2 2-1 2.8 1 2.8-2.2 2-.9 2.9-3 .2L12 22l-2.4-1.8-3-.2-.9-2.9-2.2-2 1-2.8-1-2.8 2.2-2 .9-2.9 3-.2L12 2zM10.6 14.6l-2.2-2.2-1.4 1.4 3.6 3.6 6-6-1.4-1.4-4.6 4.6z" />
                    </svg>
                  )}
                  <span style={{ fontFamily: C.fontMono, fontSize: "11px", color: C.textMuted }}>{inf.handle}</span>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted }}>
                    {formatNum(inf.followers)} followers
                  </span>
                  <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textSec }}>
                    {inf.mentions} mentions
                  </span>
                  {/* Authority bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontFamily: C.fontMono, fontSize: "9px", color: C.textMuted }}>AUTH</span>
                    <div style={{ width: "40px", height: "4px", background: C.border, borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${inf.authority}%`, background: inf.authority > 75 ? C.cta : inf.authority > 50 ? C.warning : C.danger, borderRadius: "2px" }} />
                    </div>
                    <span style={{ fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700, color: C.text }}>{inf.authority}</span>
                  </div>
                </div>
              </div>

              {/* Right: reach + sentiment */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: C.text }}>{formatNum(inf.reach)}</span>
                  <span style={{ fontFamily: C.fontMono, fontSize: "9px", color: C.textMuted }}>REACH</span>
                </div>
                <div style={{
                  fontFamily: C.fontMono,
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: sentimentColor + "15",
                  color: sentimentColor,
                }}>
                  {inf.sentiment > 0 ? "+" : ""}{inf.sentiment.toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer insight */}
      <div style={{ marginTop: "16px", padding: "10px 14px", background: C.surfaceAlt, borderRadius: "8px", display: "flex", gap: "8px", alignItems: "center" }}>
        <span style={{ fontSize: "14px" }}>🎯</span>
        <p style={{ margin: 0, fontSize: "12px", color: C.textSec, lineHeight: 1.5 }}>
          <strong>@boycott_ma</strong> et <strong>@tiktok_eco</strong> sont les amplificateurs négatifs principaux (reach combiné 500K, sentiment -0.68).
          Prioriser l'engagement avec <strong>@salma_dircom</strong> et <strong>@finance_ma</strong> pour contre-narrative positive.
        </p>
      </div>
    </div>
  );
}
