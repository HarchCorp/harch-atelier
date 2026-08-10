"use client";

// ═══════════════════════════════════════════════════════════════
//  HARCH 100 — Le classement mensuel des 100 entreprises
//  marocaines les mieux perçues.
//
//  Source de données : /api/harch100/latest (snapshot mensuel publié).
//  Si aucun snapshot n'est publié → empty state honnête.
//  Aucune donnée mockée.
//
//  Sections :
//    1. Hero (titre + période + dernière mise à jour)
//    2. Top 3 podium (sage / charcoal / amber)
//    3. Répartition par secteur (donut cliquable)
//    4. Distribution des scores (histogramme)
//    5. Tableau complet (tri, recherche, filtres, pagination)
//    6. Méthodologie (5 piliers)
//    7. Évolution mensuelle (placeholder — nécessite plusieurs snapshots)
// ═══════════════════════════════════════════════════════════════

import React, { useState, useMemo, useEffect, useCallback, useSyncExternalStore } from "react";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import {
  ScrollProgress,
  CursorGlow,
  BackToTop,
  PhaseDisclaimer,
} from "../components/shared";

// ─── DESIGN TOKENS (C) ──────────────────────────────────────────
// Palette: white bg + sage green accents (Harch signature) +
// charcoal pour #2 + amber pour #3. Cohérent avec Charts.tsx.
const C = {
  bg: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceAlt: "#F4F4F5",
  border: "#E5E5E5",
  borderLight: "#F0F0F0",
  borderStrong: "#D4D4D4",
  text: "#0A0A0A",
  textSec: "#525252",
  textMuted: "#71717A",
  accent: "#4A5D6E", // charcoal
  accentDark: "#3A4A57",
  sage: "#4A7B5F", // sage green — primary accent
  sageBright: "#6FA386",
  sageLight: "#E8F0EB",
  sageBg: "rgba(74, 123, 95, 0.08)",
  charcoal: "#1F2937",
  charcoalLight: "#E5E7EB",
  amber: "#B45309", // amber-700 (text)
  amberBright: "#D97706", // amber-500 (badge)
  amberLight: "#FEF3C7",
  amberBg: "#FFFBEB",
  red: "#DC2626",
  redLight: "#FEE2E2",
  emerald: "#10B981",
  fontSans: "'Inter', system-ui, sans-serif",
  fontMono: "'Space Mono', 'JetBrains Mono', monospace",
  shadowSm: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 6px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.05)",
} as const;

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

// ─── TYPES ──────────────────────────────────────────────────────
interface RankingEntry {
  rank: number;
  companyName?: string;
  companySlug?: string;
  sector?: string;
  reputationScore?: number;
  totalArticles?: number;
  negativeCount?: number;
  positiveCount?: number;
  avgSentiment?: number;
  uniqueSources?: number;
  // Backwards-compat field aliases (older snapshots)
  name?: string;
  slug?: string;
  score?: number;
  articles?: number;
  sector_name?: string;
}

interface Snapshot {
  id: string;
  period: string; // "YYYY-MM"
  rankings: RankingEntry[];
  generatedAt: string;
  publishedAt: string | null;
}

// Normalized row used internally by the UI.
interface Row {
  rank: number;
  name: string;
  slug: string | null;
  sector: string;
  score: number;
  articles: number;
  positive: number;
  negative: number;
  avgSentiment: number;
  uniqueSources: number;
  trend: "up" | "down" | "stable";
  change: number; // numeric delta (positive - negative normalized)
  aiVisibility: number; // 0-100 derived from uniqueSources
}

// ─── HELPERS ────────────────────────────────────────────────────
function normalizeRow(entry: RankingEntry, maxSources: number): Row {
  const name = entry.companyName ?? entry.name ?? "—";
  const slug = entry.companySlug ?? entry.slug ?? null;
  const sector = entry.sector ?? entry.sector_name ?? "Autre";
  const score = Math.round(entry.reputationScore ?? entry.score ?? 0);
  const articles = entry.totalArticles ?? entry.articles ?? 0;
  const positive = entry.positiveCount ?? 0;
  const negative = entry.negativeCount ?? 0;
  const avgSentiment = entry.avgSentiment ?? 0;
  const uniqueSources = entry.uniqueSources ?? 0;

  // Trend is derived from sentiment direction because we only have
  // one snapshot per period. Positive net sentiment ⇒ ↑, negative ⇒ ↓,
  // otherwise stable.
  const net = positive - negative;
  const denom = Math.max(1, positive + negative);
  const netRatio = net / denom;
  let trend: Row["trend"] = "stable";
  if (netRatio > 0.08) trend = "up";
  else if (netRatio < -0.08) trend = "down";

  // AI Visibility — proxy: unique sources normalized to a 0-100 scale
  // against the snapshot max (capped). If 0 sources, 0.
  const aiVisibility =
    maxSources > 0
      ? Math.min(100, Math.round((uniqueSources / maxSources) * 100))
      : 0;

  return {
    rank: entry.rank,
    name,
    slug,
    sector,
    score,
    articles,
    positive,
    negative,
    avgSentiment,
    uniqueSources,
    trend,
    change: net,
    aiVisibility,
  };
}

function formatPeriod(period: string): string {
  // "2026-08" → "Août 2026"
  const m = /^(\d{4})-(\d{2})$/.exec(period);
  if (!m) return period;
  const year = Number(m[1]);
  const monthIdx = Number(m[2]) - 1;
  if (monthIdx < 0 || monthIdx > 11) return period;
  return `${MONTHS_FR[monthIdx]} ${year}`;
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return `${d.getUTCDate()} ${MONTHS_FR[d.getUTCMonth()]} ${d.getUTCFullYear()} à ${String(d.getUTCHours()).padStart(2, "0")}h${String(d.getUTCMinutes()).padStart(2, "0")} UTC`;
  } catch {
    return "—";
  }
}

function getInitials(name: string): string {
  if (!name) return "?";
  const words = name.trim().split(/\s+/).slice(0, 2);
  return words.map((w) => w.charAt(0).toUpperCase()).join("");
}

// Hook: media query — uses useSyncExternalStore for SSR-safe hydration
function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    () => window.matchMedia(query).matches,
    () => false, // SSR snapshot — assume mobile to keep SSR/CSR markup stable
  );
}

// ─── SECTOR COLOR PALETTE ───────────────────────────────────────
const SECTOR_COLORS = [
  C.sage,
  C.accent,
  C.amberBright,
  C.charcoal,
  "#8B5CF6",
  "#0EA5E9",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#84CC16",
];

function colorForSector(sector: string, sectors: string[]): string {
  const idx = sectors.indexOf(sector);
  if (idx === -1) return C.textMuted;
  return SECTOR_COLORS[idx % SECTOR_COLORS.length];
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function Harch100Page() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/harch100/latest", {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (cancelled) return;
        if (res.status === 404) {
          setSnapshot(null);
          setLoading(false);
          return;
        }
        if (!res.ok) {
          setFetchError(`HTTP ${res.status}`);
          setLoading(false);
          return;
        }
        const json = await res.json();
        if (cancelled) return;
        if (!json.published || !json.snapshot) {
          setSnapshot(null);
          setLoading(false);
          return;
        }
        setSnapshot(json.snapshot as Snapshot);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setFetchError(err instanceof Error ? err.message : "unknown");
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        fontFamily: C.fontSans,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ScrollProgress />
      <CursorGlow />
      <PhaseDisclaimer variant="data" />
      <AtelierNav />
      <main style={{ flex: 1, position: "relative", zIndex: 1 }}>
        {loading ? <LoadingState /> : snapshot && snapshot.rankings.length > 0
          ? <Harch100Content snapshot={snapshot} isDesktop={isDesktop} />
          : <EmptyState error={fetchError} />}
      </main>
      <AtelierFooter />
      <BackToTop />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  LOADING STATE
// ═══════════════════════════════════════════════════════════════
function LoadingState() {
  return (
    <div
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "120px 32px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          margin: "0 auto 24px",
          border: `3px solid ${C.border}`,
          borderTopColor: C.sage,
          borderRadius: "50%",
          animation: "harch-spin 0.9s linear infinite",
        }}
      />
      <style>{`@keyframes harch-spin { to { transform: rotate(360deg); } }`}</style>
      <div
        style={{
          fontFamily: C.fontMono,
          fontSize: "12px",
          color: C.textMuted,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        Chargement du classement…
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  EMPTY STATE — first snapshot not yet published
// ═══════════════════════════════════════════════════════════════
function EmptyState({ error }: { error: string | null }) {
  return (
    <div
      style={{
        maxWidth: "880px",
        margin: "0 auto",
        padding: "80px 32px 120px",
        textAlign: "center",
      }}
    >
      {/* Eyebrow */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 14px",
          background: C.sageBg,
          border: `1px solid ${C.sage}30`,
          borderRadius: "999px",
          marginBottom: "32px",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: C.sage,
            animation: "harch-pulse 2s infinite",
          }}
        />
        <span
          style={{
            fontFamily: C.fontMono,
            fontSize: "11px",
            color: C.sage,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          En attente du premier classement
        </span>
        <style>{`@keyframes harch-pulse { 0%,100% { opacity:1; } 50% { opacity:0.35; } }`}</style>
      </div>

      <h1
        style={{
          fontSize: "clamp(40px, 7vw, 72px)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1.02,
          margin: "0 0 24px",
          color: C.text,
        }}
      >
        Harch 100
      </h1>
      <p
        style={{
          fontSize: "19px",
          color: C.textSec,
          lineHeight: 1.55,
          maxWidth: "640px",
          margin: "0 auto 40px",
        }}
      >
        Le classement mensuel des 100 entreprises marocaines les mieux perçues.
      </p>

      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "16px",
          padding: "48px 32px",
          boxShadow: C.shadowSm,
          textAlign: "center",
        }}
      >
        {/* Calendar icon */}
        <div
          style={{
            width: "64px",
            height: "64px",
            margin: "0 auto 24px",
            background: C.sageBg,
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke={C.sage}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <circle cx="12" cy="15" r="2" fill={C.sage} />
          </svg>
        </div>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: C.text,
            margin: "0 0 12px",
            letterSpacing: "-0.01em",
          }}
        >
          Le premier classement Harch 100 sera publié le 1er du mois prochain.
        </h2>
        <p
          style={{
            fontSize: "15px",
            color: C.textSec,
            lineHeight: 1.6,
            maxWidth: "540px",
            margin: "0 auto",
          }}
        >
          Le score est calculé à partir de 30+ sources médias marocaines et
          africaines, de l'analyse de sentiment en Darija/FR/AR, et de la
          visibilité sur 9 moteurs IA. Le classement est publié mensuellement.
        </p>

        {error && (
          <div
            style={{
              marginTop: "24px",
              padding: "8px 14px",
              background: C.redLight,
              border: `1px solid ${C.red}30`,
              borderRadius: "8px",
              fontSize: "12px",
              color: C.red,
              fontFamily: C.fontMono,
              display: "inline-block",
            }}
          >
            Détail technique : {error}
          </div>
        )}

        <div
          style={{
            marginTop: "32px",
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href="/atelier/method"
            style={{
              padding: "12px 24px",
              background: C.sage,
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              borderRadius: "6px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.sageBright)}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.sage)}
          >
            Voir la méthodologie
          </a>
          <a
            href="/atelier/audit"
            style={{
              padding: "12px 24px",
              background: "transparent",
              color: C.text,
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
              borderRadius: "6px",
              border: `1px solid ${C.borderStrong}`,
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceAlt)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Demander un audit gratuit
          </a>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  CONTENT — full ranking experience
// ═══════════════════════════════════════════════════════════════
function Harch100Content({
  snapshot,
  isDesktop,
}: {
  snapshot: Snapshot;
  isDesktop: boolean;
}) {
  // Normalize rankings → Rows.
  const rows: Row[] = useMemo(() => {
    const raw = snapshot.rankings as RankingEntry[];
    const maxSources = raw.reduce(
      (m, r) => Math.max(m, r.uniqueSources ?? 0),
      0,
    );
    return raw.map((r) => normalizeRow(r, maxSources));
  }, [snapshot]);

  // Build sector list (sorted by company count desc, capped at 7 for filter).
  const sectorList = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) {
      counts.set(r.sector, (counts.get(r.sector) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([s]) => s);
  }, [rows]);

  // ── FILTER / SEARCH / SORT STATE ──────────────────────────────
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [scoreRange, setScoreRange] = useState<"all" | "high" | "mid" | "low">(
    "all",
  );
  const [sortKey, setSortKey] = useState<
    "rank" | "name" | "sector" | "score" | "aiVisibility" | "articles"
  >("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0); // 0-indexed
  const pageSize = 20;

  // Apply sector filter from donut click.
  const handleSectorClick = useCallback((sector: string) => {
    setSectorFilter(sector);
    setPage(0);
    // Scroll to ranking table.
    if (typeof document !== "undefined") {
      const el = document.getElementById("harch100-ranking-table");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Filtered + sorted rows.
  const filtered: Row[] = useMemo(() => {
    let out = rows;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter((r) => r.name.toLowerCase().includes(q));
    }
    if (sectorFilter !== "all") {
      out = out.filter((r) => r.sector === sectorFilter);
    }
    if (scoreRange !== "all") {
      out = out.filter((r) => {
        if (scoreRange === "high") return r.score > 80;
        if (scoreRange === "mid") return r.score >= 60 && r.score <= 80;
        return r.score < 60;
      });
    }
    const sorted = [...out].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "rank":
          cmp = a.rank - b.rank;
          break;
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "sector":
          cmp = a.sector.localeCompare(b.sector);
          break;
        case "score":
          cmp = a.score - b.score;
          break;
        case "aiVisibility":
          cmp = a.aiVisibility - b.aiVisibility;
          break;
        case "articles":
          cmp = a.articles - b.articles;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [rows, search, sectorFilter, scoreRange, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize,
  );

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "rank" || key === "name" || key === "sector"
        ? "asc"
        : "desc");
    }
    setPage(0);
  };

  // Top 3 for podium (use original rank, not filtered).
  const top3 = useMemo(
    () => [...rows].sort((a, b) => a.rank - b.rank).slice(0, 3),
    [rows],
  );

  // Sector stats for donut.
  const sectorStats = useMemo(() => {
    const map = new Map<
      string,
      { count: number; totalScore: number; totalArticles: number }
    >();
    for (const r of rows) {
      const e = map.get(r.sector) ?? { count: 0, totalScore: 0, totalArticles: 0 };
      e.count += 1;
      e.totalScore += r.score;
      e.totalArticles += r.articles;
      map.set(r.sector, e);
    }
    return Array.from(map.entries())
      .map(([sector, v]) => ({
        sector,
        count: v.count,
        avgScore: Math.round(v.totalScore / Math.max(1, v.count)),
        totalArticles: v.totalArticles,
        pct: 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [rows]);

  const total = rows.length || 1;
  sectorStats.forEach((s) => (s.pct = (s.count / total) * 100));

  // Score distribution histogram.
  const scoreBuckets = useMemo(() => {
    const buckets = [
      { label: "0–20", min: 0, max: 20, count: 0, color: C.red },
      { label: "20–40", min: 20, max: 40, count: 0, color: "#F97316" },
      { label: "40–60", min: 40, max: 60, count: 0, color: C.amberBright },
      { label: "60–80", min: 60, max: 80, count: 0, color: C.sageBright },
      { label: "80–100", min: 80, max: 101, count: 0, color: C.sage },
    ];
    for (const r of rows) {
      for (const b of buckets) {
        if (r.score >= b.min && r.score < b.max) {
          b.count += 1;
          break;
        }
      }
    }
    return buckets;
  }, [rows]);

  const publishedAt = snapshot.publishedAt ?? snapshot.generatedAt;

  return (
    <>
      {/* ─── 1. HERO ──────────────────────────────────────────── */}
      <Hero
        period={snapshot.period}
        publishedAt={publishedAt}
        totalCompanies={rows.length}
      />

      {/* ─── 2. TOP 3 PODIUM ──────────────────────────────────── */}
      <section
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 32px 80px",
        }}
      >
        <SectionHeading
          eyebrow="Podium"
          title="Le Top 3 de la période"
          subhead="Les trois entreprises marocaines les mieux perçues ce mois-ci, selon le score de réputation Harch."
        />
        <Podium top3={top3} sectors={sectorList} isDesktop={isDesktop} />
      </section>

      {/* ─── 3 + 4. SECTOR BREAKDOWN + SCORE DISTRIBUTION ─────── */}
      <section
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 32px 80px",
          borderTop: `1px solid ${C.border}`,
          paddingTop: "80px",
        }}
      >
        <SectionHeading
          eyebrow="Analyse"
          title="Répartition par secteur & distribution des scores"
          subhead="Cliquez sur un secteur pour filtrer le classement ci-dessous."
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop
              ? "1fr 1fr"
              : "1fr",
            gap: "24px",
          }}
        >
          <SectorBreakdown
            stats={sectorStats}
            sectors={sectorList}
            activeSector={sectorFilter}
            onSectorClick={handleSectorClick}
          />
          <ScoreDistribution buckets={scoreBuckets} />
        </div>
      </section>

      {/* ─── 5. FULL RANKING TABLE ────────────────────────────── */}
      <section
        id="harch100-ranking-table"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 32px 80px",
          borderTop: `1px solid ${C.border}`,
          paddingTop: "80px",
          scrollMarginTop: "80px",
        }}
      >
        <SectionHeading
          eyebrow="Classement complet"
          title={`Les ${rows.length} entreprises classées`}
          subhead="Tri, recherche et filtres disponibles. Cliquez sur une entreprise pour voir son profil complet."
        />

        {/* Filter bar */}
        <FilterBar
          search={search}
          onSearch={(v) => {
            setSearch(v);
            setPage(0);
          }}
          sectorFilter={sectorFilter}
          onSector={(v) => {
            setSectorFilter(v);
            setPage(0);
          }}
          sectors={sectorList}
          scoreRange={scoreRange}
          onScoreRange={(v) => {
            setScoreRange(v);
            setPage(0);
          }}
          resultCount={filtered.length}
          total={rows.length}
        />

        {/* Table (desktop) or cards (mobile) */}
        {isDesktop ? (
          <RankingTable
            rows={pageRows}
            sectors={sectorList}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={toggleSort}
          />
        ) : (
          <RankingCards rows={pageRows} sectors={sectorList} />
        )}

        {/* Pagination */}
        <Pagination
          page={safePage}
          totalPages={totalPages}
          pageSize={pageSize}
          total={filtered.length}
          onPage={setPage}
        />
      </section>

      {/* ─── 6. METHODOLOGY ──────────────────────────────────── */}
      <section
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 32px 80px",
          borderTop: `1px solid ${C.border}`,
          paddingTop: "80px",
        }}
      >
        <SectionHeading
          eyebrow="Méthodologie"
          title="Comment nous calculons le score"
          subhead="Le score Harch 100 repose sur 5 piliers pondérés, calculés à partir de 30+ sources médias et 9 moteurs IA."
        />
        <Methodology />
      </section>

      {/* ─── 7. TREND COMPARISON ─────────────────────────────── */}
      <section
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 32px 80px",
          borderTop: `1px solid ${C.border}`,
          paddingTop: "80px",
        }}
      >
        <SectionHeading
          eyebrow="Évolution mensuelle"
          title="Tendance des scores"
          subhead="Comparaison du top 10, du bottom 10 et de la moyenne globale sur les 6 derniers mois."
        />
        <TrendComparison rows={rows} currentPeriod={snapshot.period} />
      </section>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  HERO
// ═══════════════════════════════════════════════════════════════
function Hero({
  period,
  publishedAt,
  totalCompanies,
}: {
  period: string;
  publishedAt: string;
  totalCompanies: number;
}) {
  return (
    <section
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "64px 32px 80px",
        position: "relative",
      }}
    >
      {/* Eyebrow badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          padding: "8px 16px",
          background: C.sageBg,
          border: `1px solid ${C.sage}30`,
          borderRadius: "999px",
          marginBottom: "32px",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: C.sage,
            animation: "harch-hero-pulse 2s infinite",
          }}
        />
        <span
          style={{
            fontFamily: C.fontMono,
            fontSize: "11px",
            color: C.sage,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          Période : {formatPeriod(period)}
        </span>
        <style>{`@keyframes harch-hero-pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }`}</style>
      </div>

      <h1
        style={{
          fontSize: "clamp(48px, 8vw, 96px)",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 0.98,
          margin: "0 0 24px",
          color: C.text,
        }}
      >
        Harch 100
      </h1>

      <p
        style={{
          fontSize: "clamp(18px, 2.4vw, 24px)",
          color: C.textSec,
          lineHeight: 1.4,
          maxWidth: "780px",
          margin: "0 0 40px",
          fontWeight: 400,
        }}
      >
        Le classement mensuel des 100 entreprises marocaines les mieux perçues.
      </p>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
          gap: "16px",
          maxWidth: "820px",
        }}
      >
        <HeroStat
          label="Entreprises classées"
          value={String(totalCompanies)}
          accent={C.sage}
        />
        <HeroStat
          label="Dernière mise à jour"
          value={formatTimestamp(publishedAt)}
          accent={C.accent}
          small
        />
        <HeroStat
          label="Périodicité"
          value="Mensuelle"
          accent={C.amberBright}
        />
      </div>
    </section>
  );
}

function HeroStat({
  label,
  value,
  accent,
  small = false,
}: {
  label: string;
  value: string;
  accent: string;
  small?: boolean;
}) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "12px",
        padding: "18px 20px",
        boxShadow: C.shadowSm,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: accent,
          }}
        />
        <span
          style={{
            fontFamily: C.fontMono,
            fontSize: "10px",
            color: C.textMuted,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: small ? "13px" : "20px",
          fontWeight: 700,
          color: C.text,
          letterSpacing: "-0.01em",
          lineHeight: 1.3,
          fontFamily: small ? C.fontSans : C.fontMono,
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION HEADING
// ═══════════════════════════════════════════════════════════════
function SectionHeading({
  eyebrow,
  title,
  subhead,
}: {
  eyebrow: string;
  title: string;
  subhead: string;
}) {
  return (
    <div style={{ marginBottom: "48px", maxWidth: "820px" }}>
      <div
        style={{
          fontFamily: C.fontMono,
          fontSize: "12px",
          color: C.sage,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontWeight: 700,
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {eyebrow}
        <span
          style={{
            width: "40px",
            height: "1px",
            background: `linear-gradient(to right, ${C.sage}, transparent)`,
          }}
        />
      </div>
      <h2
        style={{
          fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1.08,
          margin: "0 0 16px",
          color: C.text,
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: "17px",
          color: C.textSec,
          lineHeight: 1.55,
          maxWidth: "680px",
        }}
      >
        {subhead}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TOP 3 PODIUM
// ═══════════════════════════════════════════════════════════════
function Podium({
  top3,
  sectors,
  isDesktop,
}: {
  top3: Row[];
  sectors: string[];
  isDesktop: boolean;
}) {
  if (top3.length === 0) return null;

  // Podium layout: #1 large center, #2 left, #3 right (desktop)
  // Mobile: stack #1, #2, #3.
  const [first, second, third] = [
    top3[0],
    top3[1] ?? null,
    top3[2] ?? null,
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isDesktop ? "1fr 1.4fr 1fr" : "1fr",
        gap: "20px",
        alignItems: "stretch",
      }}
    >
      {second && (
        <PodiumCard
          row={second}
          place={2}
          accent={C.charcoal}
          sectors={sectors}
          compact
        />
      )}
      {first && (
        <PodiumCard
          row={first}
          place={1}
          accent={C.sage}
          sectors={sectors}
          featured
        />
      )}
      {third && (
        <PodiumCard
          row={third}
          place={3}
          accent={C.amberBright}
          sectors={sectors}
          compact
        />
      )}
    </div>
  );
}

function PodiumCard({
  row,
  place,
  accent,
  sectors,
  featured = false,
  compact = false,
}: {
  row: Row;
  place: 1 | 2 | 3;
  accent: string;
  sectors: string[];
  featured?: boolean;
  compact?: boolean;
}) {
  const sectorColor = colorForSector(row.sector, sectors);
  const initials = getInitials(row.name);
  const trendIcon =
    row.trend === "up" ? "↑" : row.trend === "down" ? "↓" : "→";
  const trendColor =
    row.trend === "up" ? C.sage : row.trend === "down" ? C.red : C.textMuted;
  const href = row.slug
    ? `/atelier/companies/${row.slug}`
    : "/atelier/harch-100";

  return (
    <a
      href={href}
      style={{
        display: "flex",
        flexDirection: "column",
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderTop: `4px solid ${accent}`,
        borderRadius: "16px",
        padding: featured ? "32px" : "24px",
        boxShadow: featured ? "0 8px 24px rgba(74,123,95,0.12)" : C.shadowSm,
        textDecoration: "none",
        color: "inherit",
        position: "relative",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        minHeight: featured ? "320px" : "260px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = featured
          ? "0 12px 32px rgba(74,123,95,0.18)"
          : "0 6px 20px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = featured
          ? "0 8px 24px rgba(74,123,95,0.12)"
          : C.shadowSm;
      }}
    >
      {/* Place badge */}
      <div
        style={{
          position: "absolute",
          top: featured ? "24px" : "20px",
          right: featured ? "24px" : "20px",
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          background: accent,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          fontWeight: 800,
          fontFamily: C.fontMono,
        }}
      >
        #{place}
      </div>

      {/* Logo / initials circle */}
      <div
        style={{
          width: featured ? "80px" : "64px",
          height: featured ? "80px" : "64px",
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${accent}, ${sectorColor})`,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: featured ? "28px" : "22px",
          fontWeight: 800,
          fontFamily: C.fontMono,
          marginBottom: "20px",
          boxShadow: `0 4px 12px ${accent}40`,
        }}
      >
        {initials}
      </div>

      {/* Company name */}
      <h3
        style={{
          fontSize: featured ? "26px" : "20px",
          fontWeight: 800,
          color: C.text,
          margin: "0 0 8px",
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
          paddingRight: "56px",
        }}
      >
        {row.name}
      </h3>

      {/* Sector badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 10px",
          background: `${sectorColor}15`,
          border: `1px solid ${sectorColor}30`,
          borderRadius: "999px",
          fontSize: "11px",
          fontWeight: 600,
          color: sectorColor,
          fontFamily: C.fontMono,
          marginBottom: "20px",
          alignSelf: "flex-start",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: sectorColor,
          }}
        />
        {row.sector}
      </div>

      {/* Score block */}
      <div style={{ marginTop: "auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              fontSize: featured ? "56px" : "44px",
              fontWeight: 800,
              color: C.text,
              fontFamily: C.fontMono,
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            {row.score}
          </span>
          <span
            style={{
              fontSize: "13px",
              color: C.textMuted,
              fontFamily: C.fontMono,
            }}
          >
            /100
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: "20px",
              color: trendColor,
              fontWeight: 700,
            }}
            title={`Tendance : ${row.trend}`}
          >
            {trendIcon}
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: "6px",
            background: C.surfaceAlt,
            borderRadius: "3px",
            overflow: "hidden",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: `${row.score}%`,
              height: "100%",
              background: `linear-gradient(to right, ${accent}, ${sectorColor})`,
              borderRadius: "3px",
              transition: "width 0.6s ease",
            }}
          />
        </div>

        {/* Footer row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "13px",
            color: C.textSec,
            fontFamily: C.fontSans,
          }}
        >
          <span>
            <strong style={{ color: C.text, fontFamily: C.fontMono }}>
              {row.articles}
            </strong>{" "}
            articles
          </span>
          <span
            style={{
              color: accent,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            Voir le profil →
          </span>
        </div>
      </div>
    </a>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTOR BREAKDOWN — donut + sector list
// ═══════════════════════════════════════════════════════════════
function SectorBreakdown({
  stats,
  sectors,
  activeSector,
  onSectorClick,
}: {
  stats: {
    sector: string;
    count: number;
    avgScore: number;
    totalArticles: number;
    pct: number;
  }[];
  sectors: string[];
  activeSector: string;
  onSectorClick: (sector: string) => void;
}) {
  const donutData = stats.map((s, i) => ({
    label: s.sector,
    value: s.count,
    color: SECTOR_COLORS[i % SECTOR_COLORS.length],
  }));

  const total = stats.reduce((sum, s) => sum + s.count, 0) || 1;
  const avgOverall = Math.round(
    stats.reduce((sum, s) => sum + s.avgScore * s.count, 0) / total,
  );

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "16px",
        padding: "28px",
        boxShadow: C.shadowSm,
      }}
    >
      <div
        style={{
          fontFamily: C.fontMono,
          fontSize: "11px",
          color: C.textMuted,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontWeight: 700,
          marginBottom: "8px",
        }}
      >
        Par secteur
      </div>
      <h3
        style={{
          fontSize: "20px",
          fontWeight: 800,
          color: C.text,
          margin: "0 0 24px",
          letterSpacing: "-0.02em",
        }}
      >
        Répartition des entreprises
      </h3>

      {/* Donut SVG */}
      <Donut
        data={donutData}
        size={200}
        thickness={28}
        centerValue={String(total)}
        centerLabel="entreprises"
      />

      {/* Sector list — clickable */}
      <div
        style={{
          marginTop: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          maxHeight: "320px",
          overflowY: "auto",
          paddingRight: "4px",
        }}
      >
        {stats.map((s, i) => {
          const color = SECTOR_COLORS[i % SECTOR_COLORS.length];
          const isActive = activeSector === s.sector;
          return (
            <button
              key={s.sector}
              onClick={() => onSectorClick(s.sector)}
              style={{
                display: "grid",
                gridTemplateColumns: "12px 1fr auto auto",
                gap: "12px",
                alignItems: "center",
                padding: "12px 14px",
                background: isActive ? `${color}10` : "transparent",
                border: `1px solid ${isActive ? color : C.borderLight}`,
                borderRadius: "8px",
                cursor: "pointer",
                textAlign: "left",
                transition: "background-color 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  e.currentTarget.style.background = C.surfaceAlt;
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "2px",
                  background: color,
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: C.text,
                  }}
                >
                  {s.sector}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: C.textMuted,
                    fontFamily: C.fontMono,
                  }}
                >
                  score moyen {s.avgScore}/100 · {s.totalArticles} articles
                </div>
              </div>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: C.text,
                  fontFamily: C.fontMono,
                  minWidth: "32px",
                  textAlign: "right",
                }}
              >
                {s.count}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: C.textMuted,
                  fontFamily: C.fontMono,
                  minWidth: "44px",
                  textAlign: "right",
                }}
              >
                {Math.round(s.pct)}%
              </span>
            </button>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "20px",
          paddingTop: "16px",
          borderTop: `1px solid ${C.borderLight}`,
          display: "flex",
          justifyContent: "space-between",
          fontSize: "12px",
          color: C.textMuted,
          fontFamily: C.fontMono,
        }}
      >
        <span>Score moyen global</span>
        <span style={{ color: C.sage, fontWeight: 700 }}>{avgOverall}/100</span>
      </div>
    </div>
  );
}

// ─── DONUT CHART (pure SVG) ────────────────────────────────────
function Donut({
  data,
  size = 200,
  thickness = 28,
  centerValue,
  centerLabel,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerValue?: string;
  centerLabel?: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Pre-compute segments + cumulative offsets inside useMemo so we don't
  // mutate any render-scope variables (satisfies react-hooks/immutability).
  const segments = useMemo(
    () =>
      data.reduce<{
        items: {
          label: string;
          value: number;
          color: string;
          dash: number;
          offset: number;
        }[];
        cumulative: number;
      }>(
        (acc, d) => {
          const dash = (d.value / total) * circumference;
          acc.items.push({
            label: d.label,
            value: d.value,
            color: d.color,
            dash,
            offset: acc.cumulative,
          });
          acc.cumulative += dash;
          return acc;
        },
        { items: [], cumulative: 0 },
      ).items,
    [data, total, circumference],
  );

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        alignItems: "center",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        <svg
          width={size}
          height={size}
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={C.surfaceAlt}
            strokeWidth={thickness}
          />
          {segments.map((s, i) => {
            const dash = s.dash;
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-s.offset}
                style={{ transition: "stroke-dasharray 0.6s ease" }}
              >
                <title>
                  {s.label} : {s.value} ({Math.round((s.value / total) * 100)}%)
                </title>
              </circle>
            );
          })}
        </svg>
        {(centerValue || centerLabel) && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {centerValue && (
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  color: C.text,
                  fontFamily: C.fontMono,
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                }}
              >
                {centerValue}
              </div>
            )}
            {centerLabel && (
              <div
                style={{
                  fontSize: "10px",
                  color: C.textMuted,
                  fontFamily: C.fontMono,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginTop: "4px",
                }}
              >
                {centerLabel}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          minWidth: "180px",
        }}
      >
        {data.map((d, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
            }}
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                background: d.color,
                borderRadius: "2px",
              }}
            />
            <span style={{ color: C.textSec, flex: 1 }}>{d.label}</span>
            <span
              style={{
                fontWeight: 700,
                color: C.text,
                fontFamily: C.fontMono,
              }}
            >
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SCORE DISTRIBUTION — histogram
// ═══════════════════════════════════════════════════════════════
function ScoreDistribution({
  buckets,
}: {
  buckets: {
    label: string;
    min: number;
    max: number;
    count: number;
    color: string;
  }[];
}) {
  const maxCount = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "16px",
        padding: "28px",
        boxShadow: C.shadowSm,
      }}
    >
      <div
        style={{
          fontFamily: C.fontMono,
          fontSize: "11px",
          color: C.textMuted,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontWeight: 700,
          marginBottom: "8px",
        }}
      >
        Distribution
      </div>
      <h3
        style={{
          fontSize: "20px",
          fontWeight: 800,
          color: C.text,
          margin: "0 0 24px",
          letterSpacing: "-0.02em",
        }}
      >
        Répartition des scores
      </h3>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "12px",
          height: "220px",
          padding: "0 4px",
        }}
      >
        {buckets.map((b, i) => {
          const barHeight = (b.count / maxCount) * (220 - 56);
          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "100%",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: C.text,
                  fontFamily: C.fontMono,
                  marginBottom: "6px",
                }}
              >
                {b.count}
              </div>
              <div
                style={{
                  width: "100%",
                  maxWidth: "72px",
                  height: `${barHeight}px`,
                  background: b.color,
                  borderRadius: "6px 6px 0 0",
                  transition: "height 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                  position: "relative",
                }}
                title={`${b.label} : ${b.count} entreprises`}
              />
              <div
                style={{
                  fontSize: "11px",
                  color: C.textMuted,
                  fontFamily: C.fontMono,
                  marginTop: "8px",
                  textAlign: "center",
                }}
              >
                {b.label}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "20px",
          paddingTop: "16px",
          borderTop: `1px solid ${C.borderLight}`,
          display: "flex",
          justifyContent: "space-between",
          fontSize: "12px",
          color: C.textMuted,
          fontFamily: C.fontMono,
        }}
      >
        <span>Score minimum</span>
        <span style={{ color: C.red, fontWeight: 700 }}>0</span>
        <span style={{ marginLeft: "auto" }}>Score maximum</span>
        <span style={{ color: C.sage, fontWeight: 700 }}>100</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  FILTER BAR
// ═══════════════════════════════════════════════════════════════
function FilterBar({
  search,
  onSearch,
  sectorFilter,
  onSector,
  sectors,
  scoreRange,
  onScoreRange,
  resultCount,
  total,
}: {
  search: string;
  onSearch: (v: string) => void;
  sectorFilter: string;
  onSector: (v: string) => void;
  sectors: string[];
  scoreRange: "all" | "high" | "mid" | "low";
  onScoreRange: (v: "all" | "high" | "mid" | "low") => void;
  resultCount: number;
  total: number;
}) {
  const selectStyle: React.CSSProperties = {
    padding: "12px 14px",
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: "8px",
    fontSize: "13px",
    color: C.text,
    fontFamily: C.fontSans,
    cursor: "pointer",
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
    backgroundImage:
      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' stroke='%2371717A' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    paddingRight: "32px",
  };

  return (
    <div
      style={{
        marginBottom: "24px",
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "12px",
      }}
    >
      {/* Search */}
      <div style={{ position: "relative" }}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={C.textMuted}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Rechercher une entreprise…"
          style={{
            width: "100%",
            padding: "12px 14px 12px 42px",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            fontSize: "14px",
            color: C.text,
            fontFamily: C.fontSans,
            outline: "none",
          }}
          aria-label="Rechercher une entreprise"
        />
      </div>

      {/* Selects row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
          gap: "12px",
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span
            style={{
              fontSize: "10px",
              fontFamily: C.fontMono,
              color: C.textMuted,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Secteur
          </span>
          <select
            value={sectorFilter}
            onChange={(e) => onSector(e.target.value)}
            style={selectStyle}
          >
            <option value="all">Tous les secteurs</option>
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span
            style={{
              fontSize: "10px",
              fontFamily: C.fontMono,
              color: C.textMuted,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Score
          </span>
          <select
            value={scoreRange}
            onChange={(e) =>
              onScoreRange(e.target.value as "all" | "high" | "mid" | "low")
            }
            style={selectStyle}
          >
            <option value="all">Tous les scores</option>
            <option value="high">&gt; 80 (excellent)</option>
            <option value="mid">60 – 80 (solide)</option>
            <option value="low">&lt; 60 (à améliorer)</option>
          </select>
        </label>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            justifyContent: "flex-end",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontFamily: C.fontMono,
              color: C.textMuted,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Résultats
          </span>
          <div
            style={{
              padding: "12px 14px",
              background: C.surfaceAlt,
              border: `1px solid ${C.borderLight}`,
              borderRadius: "8px",
              fontSize: "13px",
              color: C.textSec,
              fontFamily: C.fontMono,
            }}
          >
            <strong style={{ color: C.text }}>{resultCount}</strong> / {total}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  RANKING TABLE (desktop)
// ═══════════════════════════════════════════════════════════════

type SortField =
  | "rank"
  | "name"
  | "sector"
  | "score"
  | "aiVisibility"
  | "articles";

const sortableTHBase: React.CSSProperties = {
  padding: "14px 12px",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  fontFamily: "'Space Mono', 'JetBrains Mono', monospace",
  borderBottom: `1px solid ${C.border}`,
  whiteSpace: "nowrap",
};

function SortableTH({
  label,
  field,
  align = "left",
  sortKey,
  sortDir,
  onSort,
}: {
  label: string;
  field: SortField;
  align?: "left" | "right" | "center";
  sortKey: SortField;
  sortDir: "asc" | "desc";
  onSort: (key: SortField) => void;
}) {
  const isActive = sortKey === field;
  return (
    <th
      style={{
        ...sortableTHBase,
        cursor: "pointer",
        color: isActive ? C.sage : C.textMuted,
        textAlign: align,
        userSelect: "none",
      }}
      onClick={() => onSort(field)}
      title={`Trier par ${label.toLowerCase()}`}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          justifyContent: align === "right" ? "flex-end" : "flex-start",
        }}
      >
        {label}
        <span style={{ fontSize: "12px", color: isActive ? C.sage : C.borderStrong }}>
          {isActive ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </span>
    </th>
  );
}
function RankingTable({
  rows,
  sectors,
  sortKey,
  sortDir,
  onSort,
}: {
  rows: Row[];
  sectors: string[];
  sortKey: SortField;
  sortDir: "asc" | "desc";
  onSort: (key: SortField) => void;
}) {
  const thBase: React.CSSProperties = {
    padding: "14px 12px",
    textAlign: "left",
    fontSize: "10px",
    fontWeight: 700,
    color: C.textMuted,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    fontFamily: C.fontMono,
    borderBottom: `1px solid ${C.border}`,
    whiteSpace: "nowrap",
  };

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: C.shadowSm,
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
            minWidth: "960px",
          }}
        >
          <thead>
            <tr style={{ background: C.surfaceAlt }}>
              <SortableTH label="Rang" field="rank" align="center" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <SortableTH label="Entreprise" field="name" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <SortableTH label="Secteur" field="sector" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <SortableTH label="Score" field="score" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <th style={thBase}>Tendance</th>
              <SortableTH label="Visibilité IA" field="aiVisibility" align="center" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <SortableTH label="Articles" field="articles" align="right" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <th style={thBase} />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: "48px 24px",
                    textAlign: "center",
                    color: C.textMuted,
                    fontSize: "14px",
                  }}
                >
                  Aucune entreprise ne correspond à vos filtres.
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const sectorColor = colorForSector(r.sector, sectors);
                const trendIcon =
                  r.trend === "up" ? "↑" : r.trend === "down" ? "↓" : "→";
                const trendColor =
                  r.trend === "up"
                    ? C.sage
                    : r.trend === "down"
                      ? C.red
                      : C.textMuted;
                const href = r.slug
                  ? `/atelier/companies/${r.slug}`
                  : "/atelier/harch-100";

                return (
                  <tr
                    key={`${r.rank}-${r.name}`}
                    style={{
                      borderBottom: `1px solid ${C.borderLight}`,
                      transition: "background-color 0.15s",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.location.href = href;
                      }
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = C.surfaceAlt)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {/* Rank */}
                    <td
                      style={{
                        padding: "14px 12px",
                        fontFamily: C.fontMono,
                        fontWeight: 700,
                        color: C.textMuted,
                        textAlign: "center",
                        fontSize: "14px",
                      }}
                    >
                      #{r.rank}
                    </td>
                    {/* Company */}
                    <td style={{ padding: "14px 12px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${sectorColor}, ${C.accent})`,
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "13px",
                            fontWeight: 700,
                            fontFamily: C.fontMono,
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(r.name)}
                        </div>
                        <span
                          style={{
                            fontWeight: 600,
                            color: C.text,
                            fontSize: "14px",
                          }}
                        >
                          {r.name}
                        </span>
                      </div>
                    </td>
                    {/* Sector */}
                    <td style={{ padding: "14px 12px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "3px 10px",
                          background: `${sectorColor}15`,
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: sectorColor,
                          fontFamily: C.fontMono,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: sectorColor,
                          }}
                        />
                        {r.sector}
                      </span>
                    </td>
                    {/* Score */}
                    <td style={{ padding: "14px 12px", minWidth: "140px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: C.fontMono,
                            fontWeight: 800,
                            color: C.text,
                            minWidth: "28px",
                            fontSize: "14px",
                          }}
                        >
                          {r.score}
                        </span>
                        <div
                          style={{
                            flex: 1,
                            height: "5px",
                            background: C.surfaceAlt,
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${r.score}%`,
                              height: "100%",
                              background:
                                r.score >= 80
                                  ? C.sage
                                  : r.score >= 60
                                    ? C.sageBright
                                    : r.score >= 40
                                      ? C.amberBright
                                      : C.red,
                              borderRadius: "3px",
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    {/* Trend */}
                    <td
                      style={{
                        padding: "14px 12px",
                        fontSize: "16px",
                        color: trendColor,
                        fontWeight: 700,
                        textAlign: "center",
                      }}
                    >
                      {trendIcon}
                    </td>
                    {/* AI Visibility */}
                    <td
                      style={{
                        padding: "14px 12px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "48px",
                            height: "5px",
                            background: C.surfaceAlt,
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${r.aiVisibility}%`,
                              height: "100%",
                              background: C.accent,
                              borderRadius: "3px",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontFamily: C.fontMono,
                            fontWeight: 700,
                            color: C.textSec,
                            fontSize: "12px",
                            minWidth: "32px",
                          }}
                        >
                          {r.aiVisibility}%
                        </span>
                      </div>
                    </td>
                    {/* Articles */}
                    <td
                      style={{
                        padding: "14px 12px",
                        fontFamily: C.fontMono,
                        color: C.textSec,
                        textAlign: "right",
                        fontSize: "13px",
                      }}
                    >
                      {r.articles.toLocaleString("fr-FR")}
                    </td>
                    {/* Action */}
                    <td
                      style={{
                        padding: "14px 12px",
                        textAlign: "right",
                      }}
                    >
                      <span
                        style={{
                          color: C.sage,
                          fontWeight: 600,
                          fontSize: "12px",
                        }}
                      >
                        Profil →
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  RANKING CARDS (mobile)
// ═══════════════════════════════════════════════════════════════
function RankingCards({
  rows,
  sectors,
}: {
  rows: Row[];
  sectors: string[];
}) {
  if (rows.length === 0) {
    return (
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          padding: "32px 20px",
          textAlign: "center",
          color: C.textMuted,
          fontSize: "14px",
        }}
      >
        Aucune entreprise ne correspond à vos filtres.
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {rows.map((r) => {
        const sectorColor = colorForSector(r.sector, sectors);
        const trendIcon =
          r.trend === "up" ? "↑" : r.trend === "down" ? "↓" : "→";
        const trendColor =
          r.trend === "up"
            ? C.sage
            : r.trend === "down"
              ? C.red
              : C.textMuted;
        const href = r.slug
          ? `/atelier/companies/${r.slug}`
          : "/atelier/harch-100";
        return (
          <a
            key={`${r.rank}-${r.name}`}
            href={href}
            style={{
              display: "grid",
              gridTemplateColumns: "36px 1fr auto",
              gap: "12px",
              alignItems: "center",
              padding: "16px",
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "12px",
              textDecoration: "none",
              color: "inherit",
              boxShadow: C.shadowSm,
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = C.shadowMd;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = C.shadowSm;
            }}
          >
            <div
              style={{
                fontFamily: C.fontMono,
                fontWeight: 800,
                color: C.textMuted,
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              #{r.rank}
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: C.text,
                  }}
                >
                  {r.name}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "2px 8px",
                    background: `${sectorColor}15`,
                    borderRadius: "999px",
                    fontSize: "10px",
                    fontWeight: 600,
                    color: sectorColor,
                    fontFamily: C.fontMono,
                  }}
                >
                  <span
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: sectorColor,
                    }}
                  />
                  {r.sector}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: C.textMuted,
                    fontFamily: C.fontMono,
                  }}
                >
                  {r.articles} articles · IA {r.aiVisibility}%
                </span>
              </div>
            </div>
            <div
              style={{
                textAlign: "right",
              }}
            >
              <div
                style={{
                  fontFamily: C.fontMono,
                  fontWeight: 800,
                  color: C.text,
                  fontSize: "20px",
                  lineHeight: 1,
                }}
              >
                {r.score}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: trendColor,
                  fontWeight: 700,
                  marginTop: "4px",
                }}
              >
                {trendIcon}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PAGINATION
// ═══════════════════════════════════════════════════════════════
function Pagination({
  page,
  totalPages,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  totalPages: number;
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
}) {
  if (total === 0) return null;
  const from = page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);

  // Pages to show: capped at 7 with ellipsis.
  const pages: (number | "…")[] = [];
  const add = (n: number | "…") => pages.push(n);
  if (totalPages <= 7) {
    for (let i = 0; i < totalPages; i++) add(i);
  } else {
    add(0);
    if (page > 2) add("…");
    const start = Math.max(1, page - 1);
    const end = Math.min(totalPages - 2, page + 1);
    for (let i = start; i <= end; i++) add(i);
    if (page < totalPages - 3) add("…");
    add(totalPages - 1);
  }

  const btnStyle = (active: boolean): React.CSSProperties => ({
    minWidth: "36px",
    height: "36px",
    padding: "0 10px",
    background: active ? C.sage : C.surface,
    color: active ? "#fff" : C.textSec,
    border: `1px solid ${active ? C.sage : C.border}`,
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: active ? 700 : 500,
    fontFamily: C.fontMono,
    cursor: "pointer",
    transition: "background-color 0.15s, color 0.15s, border-color 0.15s",
  });

  return (
    <div
      style={{
        marginTop: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: C.textMuted,
          fontFamily: C.fontMono,
        }}
      >
        Affichage{" "}
        <strong style={{ color: C.text }}>{from}</strong>–
        <strong style={{ color: C.text }}>{to}</strong> sur{" "}
        <strong style={{ color: C.text }}>{total}</strong>
      </div>

      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <button
          onClick={() => onPage(Math.max(0, page - 1))}
          disabled={page === 0}
          style={{
            ...btnStyle(false),
            opacity: page === 0 ? 0.4 : 1,
            cursor: page === 0 ? "not-allowed" : "pointer",
          }}
          aria-label="Page précédente"
        >
          ←
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              style={{
                minWidth: "36px",
                textAlign: "center",
                color: C.textMuted,
                fontFamily: C.fontMono,
                fontSize: "13px",
              }}
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
              style={btnStyle(p === page)}
              aria-current={p === page ? "page" : undefined}
            >
              {p + 1}
            </button>
          ),
        )}
        <button
          onClick={() => onPage(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
          style={{
            ...btnStyle(false),
            opacity: page >= totalPages - 1 ? 0.4 : 1,
            cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
          }}
          aria-label="Page suivante"
        >
          →
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  METHODOLOGY
// ═══════════════════════════════════════════════════════════════
const PILLARS = [
  {
    name: "Réputation",
    weight: 30,
    color: C.sage,
    icon: "shield",
    desc: "Score de mention et sentiment agrégé sur 30+ sources médias marocaines et africaines.",
  },
  {
    name: "Sentiment",
    weight: 25,
    color: C.accent,
    icon: "chat",
    desc: "Analyse linguistique Darija / Français / Arabe — positif, neutre, négatif par entité.",
  },
  {
    name: "Visibilité IA",
    weight: 20,
    color: C.amberBright,
    icon: "cpu",
    desc: "9 LLM testés (ChatGPT, Claude, Gemini, Perplexity, Copilot, Mistral, Grok, etc.).",
  },
  {
    name: "Diversité médias",
    weight: 15,
    color: C.charcoal,
    icon: "newspaper",
    desc: "Couverture mesurée sur 20+ sources indépendantes — presse, blogs, réseaux sociaux.",
  },
  {
    name: "Résilience crises",
    weight: 10,
    color: C.red,
    icon: "alert",
    desc: "Historique de gestion des crises et capacité de récupération sur 12 mois.",
  },
] as const;

function PillarIcon({ name, color }: { name: string; color: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 2L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "cpu":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="2" x2="9" y2="4" />
          <line x1="15" y1="2" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="22" />
          <line x1="15" y1="20" x2="15" y2="22" />
          <line x1="20" y1="9" x2="22" y2="9" />
          <line x1="20" y1="14" x2="22" y2="14" />
          <line x1="2" y1="9" x2="4" y2="9" />
          <line x1="2" y1="14" x2="4" y2="14" />
        </svg>
      );
    case "newspaper":
      return (
        <svg {...common}>
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
          <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6z" />
        </svg>
      );
    case "alert":
      return (
        <svg {...common}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    default:
      return null;
  }
}

function Methodology() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
        gap: "16px",
      }}
    >
      {PILLARS.map((p) => (
        <div
          key={p.name}
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
            padding: "24px",
            boxShadow: C.shadowSm,
            borderTop: `3px solid ${p.color}`,
            position: "relative",
          }}
        >
          {/* Weight badge */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              padding: "4px 10px",
              background: `${p.color}15`,
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 700,
              color: p.color,
              fontFamily: C.fontMono,
            }}
          >
            {p.weight}%
          </div>

          {/* Icon */}
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: `${p.color}12`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <PillarIcon name={p.icon} color={p.color} />
          </div>

          <h4
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: C.text,
              margin: "0 0 8px",
              letterSpacing: "-0.01em",
            }}
          >
            {p.name}
          </h4>
          <p
            style={{
              fontSize: "13px",
              color: C.textSec,
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            {p.desc}
          </p>

          {/* Weight bar */}
          <div
            style={{
              marginTop: "16px",
              height: "4px",
              background: C.surfaceAlt,
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${p.weight * 3.33}%`,
                height: "100%",
                background: p.color,
                borderRadius: "2px",
              }}
            />
          </div>
        </div>
      ))}

      {/* Total */}
      <div
        style={{
          background: C.sageBg,
          border: `1px solid ${C.sage}30`,
          borderRadius: "12px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "32px",
            fontWeight: 800,
            color: C.sage,
            fontFamily: C.fontMono,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            marginBottom: "8px",
          }}
        >
          100%
        </div>
        <div
          style={{
            fontSize: "11px",
            color: C.sage,
            fontFamily: C.fontMono,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 700,
            marginBottom: "12px",
          }}
        >
          Score total
        </div>
        <p
          style={{
            fontSize: "12px",
            color: C.textSec,
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Le score Harch 100 est la somme pondérée des 5 piliers, normalisée sur
          100.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TREND COMPARISON — line chart (top 10 vs bottom 10 vs overall)
// ═══════════════════════════════════════════════════════════════
function TrendComparison({
  rows,
  currentPeriod,
}: {
  rows: Row[];
  currentPeriod: string;
}) {
  // We only have the latest snapshot — historical data will populate as
  // more monthly snapshots are published. Show the current snapshot's
  // top 10 / bottom 10 / overall averages as a single data point, with
  // an honest placeholder for months without data.
  const sorted = [...rows].sort((a, b) => b.score - a.score);
  const top10 = sorted.slice(0, Math.min(10, sorted.length));
  const bottom10 = sorted
    .slice(-Math.min(10, sorted.length))
    .reverse();
  const overallAvg = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length)
    : 0;
  const top10Avg = top10.length
    ? Math.round(top10.reduce((s, r) => s + r.score, 0) / top10.length)
    : 0;
  const bottom10Avg = bottom10.length
    ? Math.round(bottom10.reduce((s, r) => s + r.score, 0) / bottom10.length)
    : 0;

  // Generate 6 month labels ending at currentPeriod.
  const months = useMemo(() => {
    const m = /^(\d{4})-(\d{2})$/.exec(currentPeriod);
    if (!m) return [] as string[];
    let year = Number(m[1]);
    let monthIdx = Number(m[2]) - 1;
    const out: { label: string; full: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(year, monthIdx - i, 1));
      const lbl = `${MONTHS_FR[d.getUTCMonth()].slice(0, 3)} ${String(d.getUTCFullYear()).slice(-2)}`;
      const full = `${MONTHS_FR[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
      out.push({ label: lbl, full });
    }
    return out;
  }, [currentPeriod]);

  // Build series: top 10 / bottom 10 / overall.
  // Only the last point has data; earlier months are null → rendered as gaps.
  const topSeries = months.map((_, i) => (i === months.length - 1 ? top10Avg : 0));
  const bottomSeries = months.map((_, i) => (i === months.length - 1 ? bottom10Avg : 0));
  const overallSeries = months.map((_, i) => (i === months.length - 1 ? overallAvg : 0));

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "16px",
        padding: "28px",
        boxShadow: C.shadowSm,
      }}
    >
      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <LegendItem color={C.sage} label="Top 10" value={top10Avg} />
        <LegendItem color={C.accent} label="Moyenne globale" value={overallAvg} />
        <LegendItem color={C.red} label="Bottom 10" value={bottom10Avg} />
      </div>

      {/* Chart */}
      <TrendLineChart
        series={[
          { name: "Top 10", color: C.sage, points: topSeries },
          { name: "Moyenne", color: C.accent, points: overallSeries },
          { name: "Bottom 10", color: C.red, points: bottomSeries },
        ]}
        xLabels={months.map((m) => m.label)}
        height={260}
      />

      {/* Notice */}
      <div
        style={{
          marginTop: "24px",
          padding: "14px 16px",
          background: C.amberBg,
          border: `1px solid ${C.amberBright}30`,
          borderRadius: "10px",
          display: "flex",
          gap: "12px",
          alignItems: "flex-start",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={C.amber}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0, marginTop: "1px" }}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div style={{ fontSize: "13px", color: C.textSec, lineHeight: 1.5 }}>
          <strong style={{ color: C.text }}>
            Historique en cours de constitution.
          </strong>{" "}
          L'évolution mensuelle sera pleinement visible à partir du 2ᵉ classement
          (mois prochain). Actuellement, seul le point le plus récent est
          renseigné.
        </div>
      </div>

      {/* Stats grid */}
      <div
        style={{
          marginTop: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
          gap: "12px",
        }}
      >
        <StatBox
          label="Écart Top 10 vs Bottom 10"
          value={`${top10Avg - bottom10Avg} pts`}
          color={C.sage}
        />
        <StatBox
          label="Top 10 vs Moyenne"
          value={`+${top10Avg - overallAvg} pts`}
          color={C.accent}
        />
        <StatBox
          label="Moyenne vs Bottom 10"
          value={`+${overallAvg - bottom10Avg} pts`}
          color={C.amberBright}
        />
      </div>
    </div>
  );
}

function LegendItem({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span
        style={{
          width: "12px",
          height: "12px",
          background: color,
          borderRadius: "3px",
        }}
      />
      <div>
        <div
          style={{
            fontSize: "11px",
            color: C.textMuted,
            fontFamily: C.fontMono,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "18px",
            fontWeight: 800,
            color: C.text,
            fontFamily: C.fontMono,
            lineHeight: 1.1,
          }}
        >
          {value}
          <span style={{ fontSize: "11px", color: C.textMuted, fontWeight: 500 }}>
            /100
          </span>
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      style={{
        padding: "14px 16px",
        background: C.surfaceAlt,
        border: `1px solid ${C.borderLight}`,
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          color: C.textMuted,
          fontFamily: C.fontMono,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontWeight: 700,
          marginBottom: "6px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "18px",
          fontWeight: 800,
          color,
          fontFamily: C.fontMono,
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ─── LINE CHART (pure SVG, supports sparse points) ─────────────
function TrendLineChart({
  series,
  xLabels,
  height = 240,
}: {
  series: { name: string; color: string; points: number[] }[];
  xLabels: string[];
  height?: number;
}) {
  const width = 720;
  const padding = { top: 20, right: 24, bottom: 36, left: 44 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Y axis: 0-100 fixed (scores).
  const yMax = 100;
  const yMin = 0;
  const range = yMax - yMin;

  const xStep = xLabels.length > 1 ? chartW / (xLabels.length - 1) : 0;

  return (
    <div style={{ width: "100%" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", height: "auto" }}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const y = padding.top + chartH * (1 - p);
          const val = Math.round(yMin + range * p);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke={C.borderLight}
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                fontSize="10"
                fill={C.textMuted}
                fontFamily={C.fontMono}
                textAnchor="end"
                fontWeight={700}
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* X labels */}
        {xLabels.map((label, i) => {
          const x = padding.left + i * xStep;
          return (
            <text
              key={i}
              x={x}
              y={height - 12}
              fontSize="10"
              fill={C.textMuted}
              fontFamily={C.fontMono}
              textAnchor="middle"
              fontWeight={600}
            >
              {label}
            </text>
          );
        })}

        {/* Series — render only segments where consecutive points are
            both non-zero. Zero values represent months with no data. */}
        {series.map((s, si) => {
          // Collect contiguous segments of non-zero points.
          const segments: number[][] = [];
          let current: { idx: number; val: number }[] = [];
          s.points.forEach((p, i) => {
            if (p > 0) {
              current.push({ idx: i, val: p });
            } else if (current.length > 0) {
              segments.push(current.map((c) => c.val));
              current = [];
            }
          });
          if (current.length > 0) segments.push(current.map((c) => c.val));

          return (
            <g key={si}>
              {segments.map((seg, segIdx) => {
                // Need to know the starting x index for this segment.
                let startIdx = 0;
                let acc = 0;
                for (let k = 0; k < segIdx; k++) {
                  acc += segments[k].length;
                  // Skip the gap.
                }
                // Recompute properly: find startIdx by scanning original points.
                let segStart = -1;
                let count = 0;
                for (let i = 0; i < s.points.length; i++) {
                  if (s.points[i] > 0) {
                    if (count === acc) {
                      segStart = i;
                      break;
                    }
                    count++;
                  }
                }
                if (segStart === -1) return null;

                const path = seg
                  .map((val, i) => {
                    const x = padding.left + (segStart + i) * xStep;
                    const y =
                      padding.top + chartH * (1 - (val - yMin) / range);
                    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                  })
                  .join(" ");

                return (
                  <g key={`seg-${segIdx}`}>
                    <path
                      d={path}
                      fill="none"
                      stroke={s.color}
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    {seg.map((val, i) => {
                      const x = padding.left + (segStart + i) * xStep;
                      const y =
                        padding.top + chartH * (1 - (val - yMin) / range);
                      return (
                        <g key={`dot-${i}`}>
                          <circle cx={x} cy={y} r="4" fill={s.color} />
                          <circle
                            cx={x}
                            cy={y}
                            r="4"
                            fill="none"
                            stroke="#fff"
                            strokeWidth="1.5"
                          />
                          <text
                            x={x}
                            y={y - 10}
                            fontSize="11"
                            fill={s.color}
                            fontFamily={C.fontMono}
                            textAnchor="middle"
                            fontWeight={700}
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
