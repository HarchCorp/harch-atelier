"use client";

// ════════════════════════════════════════════════════════════════
//  Dashboard.tsx — Harch Atelier post-login shared dashboard
//
//  Used by:
//    • /atelier/console/agency        (plan="agency")
//    • /atelier/console/enterprise    (plan="enterprise", via wrapper)
//
//  UX principles:
//    • WHITE surfaces, sage green (#4A7B5F) accents, charcoal text
//    • Frosted-glass header (backdrop-blur 12px)
//    • Plan-aware sidebar (Concurrents + Rapports = Pro+ only)
//    • 3 KPI cards with hover lift
//    • Pure SVG sentiment area chart (7j / 30j / 90j)
//    • Top-5 topics card + AI visibility card
//    • Mobile-first: sidebar → overlay drawer < lg, cards stack
//    • French throughout, no mock data ("—" when empty)
//
//  Data sources:
//    • /api/console/brand-health      (score, trend, mentions, AI score)
//    • /api/console/crisis-alerts     (alert count → bell badge)
//    • /api/console/topics            (top 5 topics)
//    • /api/console/ai-visibility     (LLM rankings)
//    • /api/console/sentiment-trend   (chart time-series)
//
//  Task ID: POSTLOGIN-2-DASH
// ════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutGrid,
  TrendingUp,
  Users,
  Bell,
  FileText,
  Search,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { C } from "../components/tokens";

// ─── Types ────────────────────────────────────────────────────────

export type DashboardPlan = "essential" | "pro" | "enterprise" | "agency";

export interface DashboardProps {
  plan?: DashboardPlan;
  userName?: string | null;
  userEmail?: string | null;
  companyName?: string;
}

type RangeKey = "7j" | "30j" | "90j";

interface NavItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  badge?: number;
  planRestricted?: boolean;
}

interface Topic {
  label: string;
  count: number;
  type: "source" | "risk";
}

interface AIPlatform {
  platform: string;
  cited: boolean;
  position: number | null;
  sentiment: string | null;
}

interface SentimentPoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

// ─── Constants ────────────────────────────────────────────────────

const PLAN_LABELS: Record<DashboardPlan, string> = {
  essential: "Essentiel",
  pro: "Pro",
  enterprise: "Grandes Entreprises",
  agency: "Agences",
};

const PLAN_STATUS: Record<DashboardPlan, string> = {
  essential: "Actif",
  pro: "Actif",
  enterprise: "Actif",
  agency: "Actif",
};

const RANGE_TO_API: Record<RangeKey, string> = {
  "7j": "7d",
  "30j": "30d",
  "90j": "365d", // API only has 7d/30d/365d — slice to 90 entries client-side
};

const RANGE_SLICE: Record<RangeKey, number> = {
  "7j": 7,
  "30j": 30,
  "90j": 90,
};

// Chart colors
const COLOR_POSITIVE = "#10B981"; // emerald-500
const COLOR_NEUTRAL = "#9CA3AF"; // gray-400
const COLOR_NEGATIVE = "#EF4444"; // red-500

const SAGE = "#4A7B5F";
const SAGE_SOFT = "rgba(74, 123, 95, 0.06)";
const CHARCOAL = "#0A0A0A";
const BORDER = "#F0F0F0";
const PAGE_BG = "#FAFAFA";
const INPUT_BG = "#F4F4F5";

const FONT_SANS = C.fontSans;
const FONT_MONO = C.fontMono;

// ─── Component ────────────────────────────────────────────────────

export function Dashboard({
  plan = "essential",
  userName,
  userEmail,
}: DashboardProps) {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [range, setRange] = useState<RangeKey>("7j");

  // Data state — null = "loading / unknown", show "—"
  const [score, setScore] = useState<number | null>(null);
  const [trend, setTrend] = useState<number | null>(null);
  const [mentions, setMentions] = useState<number | null>(null);
  const [aiCitations, setAiCitations] = useState<number | null>(null);
  const [sentimentSplit, setSentimentSplit] = useState<{
    positive: number;
    neutral: number;
    negative: number;
  } | null>(null);
  const [alertCount, setAlertCount] = useState(0);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [platforms, setPlatforms] = useState<AIPlatform[]>([]);
  const [trendData, setTrendData] = useState<SentimentPoint[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);

  const firstName = useMemo(() => {
    const name = userName?.trim();
    if (!name) return null;
    return name.split(/\s+/)[0];
  }, [userName]);

  const initials = useMemo(() => {
    const name = userName?.trim();
    if (name) {
      const parts = name.split(/\s+/);
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (userEmail) return userEmail.slice(0, 2).toUpperCase();
    return "U";
  }, [userName, userEmail]);

  // ── Fetch brand-health ──────────────────────────────────────────
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/console/brand-health", {
          signal: ctrl.signal,
          credentials: "same-origin",
        });
        if (!res.ok) return;
        const d = await res.json();
        setScore(typeof d.score === "number" ? d.score : null);
        setTrend(typeof d.trend === "number" ? d.trend : null);
        setMentions(
          typeof d.mentionCount24h === "number"
            ? d.mentionCount24h
            : typeof d.mentionVelocity === "number"
            ? d.mentionVelocity
            : null,
        );
        if (d.sentiment && typeof d.sentiment.positive === "number") {
          setSentimentSplit({
            positive: d.sentiment.positive,
            neutral: d.sentiment.neutral,
            negative: d.sentiment.negative,
          });
        }
        if (Array.isArray(d.aiVisibility)) {
          const cited = d.aiVisibility.filter(
            (a: { score?: number; engine?: string }) => (a.score ?? 0) > 0,
          ).length;
          setAiCitations(cited);
        }
      } catch {
        /* silent — keep null states */
      }
    })();
    return () => ctrl.abort();
  }, []);

  // ── Fetch crisis-alerts (bell badge) ────────────────────────────
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/console/crisis-alerts", {
          signal: ctrl.signal,
          credentials: "same-origin",
        });
        if (!res.ok) return;
        const d = await res.json();
        setAlertCount(
          typeof d.count === "number"
            ? d.count
            : Array.isArray(d.alerts)
            ? d.alerts.length
            : 0,
        );
      } catch {
        /* silent */
      }
    })();
    return () => ctrl.abort();
  }, []);

  // ── Fetch topics ────────────────────────────────────────────────
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/console/topics?limit=5", {
          signal: ctrl.signal,
          credentials: "same-origin",
        });
        if (!res.ok) return;
        const d = await res.json();
        const list: Topic[] = Array.isArray(d.topics)
          ? d.topics.slice(0, 5).map((t: { label?: string; name?: string; count?: number; type?: "source" | "risk" }) => ({
              label: t.label || t.name || "—",
              count: typeof t.count === "number" ? t.count : 0,
              type: t.type || "source",
            }))
          : [];
        setTopics(list);
      } catch {
        /* silent */
      }
    })();
    return () => ctrl.abort();
  }, []);

  // ── Fetch AI visibility ─────────────────────────────────────────
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/console/ai-visibility", {
          signal: ctrl.signal,
          credentials: "same-origin",
        });
        if (!res.ok) return;
        const d = await res.json();
        const list: AIPlatform[] = Array.isArray(d.platforms)
          ? d.platforms.map((p: { platform: string; cited?: boolean; position?: number | null; sentiment?: string | null }) => ({
              platform: p.platform,
              cited: p.cited ?? false,
              position: typeof p.position === "number" ? p.position : null,
              sentiment: p.sentiment ?? null,
            }))
          : [];
        setPlatforms(list);
      } catch {
        /* silent */
      }
    })();
    return () => ctrl.abort();
  }, []);

  // ── Fetch sentiment-trend (range-dependent) ─────────────────────
  useEffect(() => {
    const ctrl = new AbortController();
    setTrendLoading(true);
    (async () => {
      try {
        const res = await fetch(
          `/api/console/sentiment-trend?range=${RANGE_TO_API[range]}`,
          { signal: ctrl.signal, credentials: "same-origin" },
        );
        if (!res.ok) {
          setTrendData([]);
          return;
        }
        const d = await res.json();
        const all: SentimentPoint[] = Array.isArray(d.data)
          ? d.data.map((p: { date: string; positive: number; neutral: number; negative: number }) => ({
              date: p.date,
              positive: p.positive || 0,
              neutral: p.neutral || 0,
              negative: p.negative || 0,
            }))
          : [];
        // Slice to the requested window (90j → last 90 entries)
        const sliceN = RANGE_SLICE[range];
        setTrendData(all.slice(-sliceN));
      } catch {
        setTrendData([]);
      } finally {
        setTrendLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [range]);

  // ── Nav items (plan-aware) ──────────────────────────────────────
  const navItems: NavItem[] = useMemo(() => {
    const isProPlus = plan !== "essential";
    return [
      { key: "dashboard", label: "Tableau de bord", icon: LayoutGrid },
      { key: "sentiment", label: "Sentiment", icon: TrendingUp },
      ...(isProPlus
        ? [{ key: "competitors", label: "Concurrents", icon: Users, planRestricted: true }]
        : []),
      { key: "alerts", label: "Alertes", icon: Bell, badge: alertCount },
      ...(isProPlus
        ? [{ key: "reports", label: "Rapports", icon: FileText, planRestricted: true }]
        : []),
    ];
  }, [plan, alertCount]);

  const todayLabel = useMemo(() => {
    try {
      return new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }, []);

  const sidebarContent = (
    <SidebarContent
      plan={plan}
      navItems={navItems}
      activeNav={activeNav}
      onNavClick={(key) => {
        setActiveNav(key);
        setSidebarOpen(false);
      }}
      userName={userName}
      userEmail={userEmail}
      initials={initials}
      onSignOut={() => signOut({ callbackUrl: "/atelier/login", redirect: true })}
    />
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: PAGE_BG, fontFamily: FONT_SANS }}>
      {/* ── Sidebar (desktop) ─────────────────────────────────────── */}
      <aside
        className="hidden lg:flex"
        style={{
          width: 240,
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          backgroundColor: "#FFFFFF",
          borderRight: `1px solid ${BORDER}`,
          flexDirection: "column",
        }}
      >
        {sidebarContent}
      </aside>

      {/* ── Sidebar (mobile drawer) ───────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 h-full"
            style={{
              width: 280,
              maxWidth: "85vw",
              backgroundColor: "#FFFFFF",
              borderRight: `1px solid ${BORDER}`,
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Fermer le menu"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                border: "none",
                background: "none",
                cursor: "pointer",
                color: "#71717A",
                padding: 4,
              }}
            >
              <X size={20} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* ── Main column ───────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* ── Header (frosted glass) ──────────────────────────────── */}
        <header
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "0 20px",
            position: "sticky",
            top: 0,
            zIndex: 30,
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
          }}
        >
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Ouvrir le menu"
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              color: CHARCOAL,
              padding: 4,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Menu size={22} />
          </button>

          {/* Logo */}
          <div
            className="hidden sm:block"
            style={{ fontWeight: 700, fontSize: 16, color: CHARCOAL, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}
          >
            HARCH <span style={{ color: "#9CA3AF", fontWeight: 400 }}>| ATELIER</span>
          </div>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 440, margin: "0 auto" }}>
            <SearchInput />
          </div>

          {/* Bell */}
          <button
            aria-label="Notifications"
            style={{
              position: "relative",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "#525252",
              padding: 6,
              display: "flex",
              alignItems: "center",
              borderRadius: 8,
              transition: "background 150ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F4F4F5")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <Bell size={20} strokeWidth={1.75} />
            {alertCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  backgroundColor: "#EF4444",
                  color: "#FFFFFF",
                  fontSize: 10,
                  fontWeight: 700,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                  fontFamily: FONT_MONO,
                }}
              >
                {alertCount > 99 ? "99+" : alertCount}
              </span>
            )}
          </button>

          {/* Avatar */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              backgroundColor: SAGE,
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: FONT_MONO,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
        </header>

        {/* ── Main content ────────────────────────────────────────── */}
        <main
          style={{
            flex: 1,
            padding: "24px 20px",
            maxWidth: 1400,
            margin: "0 auto",
            width: "100%",
          }}
        >
          {/* Greeting */}
          <section
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 28,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: CHARCOAL, margin: 0, letterSpacing: "-0.02em" }}>
                {firstName ? `Bonjour, ${firstName}` : "Bonjour"}
              </h1>
              <p style={{ fontSize: 14, color: "#71717A", margin: "4px 0 0 0" }}>
                Voici votre réputation en temps réel.
              </p>
            </div>
            {todayLabel && (
              <span
                style={{
                  fontSize: 12,
                  color: "#9CA3AF",
                  fontFamily: FONT_MONO,
                  whiteSpace: "nowrap",
                  paddingTop: 6,
                }}
              >
                {todayLabel}
              </span>
            )}
          </section>

          {/* KPI cards */}
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <KPICard
              label="SENTIMENT MOYEN"
              value={score !== null ? `${score}%` : "—"}
              trend={trend}
            />
            <KPICard
              label="MENTIONS / 24H"
              value={mentions !== null ? formatNumber(mentions) : "—"}
              trend={null}
            />
            <KPICard
              label="CITATIONS IA"
              value={aiCitations !== null ? String(aiCitations) : "—"}
              trend={null}
            />
          </section>

          {/* Sentiment chart */}
          <Card style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: CHARCOAL, margin: 0, letterSpacing: "-0.01em" }}>
                  Analyse de sentiment
                </h2>
                <p style={{ fontSize: 13, color: "#71717A", margin: "4px 0 0 0" }}>
                  Répartition des mentions sur la période sélectionnée
                </p>
              </div>
              <RangeToggle range={range} onChange={setRange} />
            </div>
            <SentimentChart data={trendData} loading={trendLoading} />
            {/* Legend */}
            <div
              style={{
                display: "flex",
                gap: 20,
                marginTop: 16,
                flexWrap: "wrap",
                fontSize: 12,
                fontFamily: FONT_MONO,
              }}
            >
              <LegendDot color={COLOR_POSITIVE} label="Positif" />
              <LegendDot color={COLOR_NEUTRAL} label="Neutre" />
              <LegendDot color={COLOR_NEGATIVE} label="Négatif" />
            </div>
          </Card>

          {/* Two-column: Topics + AI Visibility */}
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 24,
            }}
          >
            {/* Topics */}
            <Card>
              <CardLabel>TOP 5 SUJETS</CardLabel>
              {topics.length === 0 ? (
                <EmptyState text="Aucun sujet détecté pour le moment." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {topics.map((t, i) => (
                    <TopicRow
                      key={`${t.label}-${i}`}
                      index={i + 1}
                      label={t.label}
                      count={t.count}
                      split={sentimentSplit}
                      maxCount={Math.max(...topics.map((x) => x.count), 1)}
                    />
                  ))}
                </div>
              )}
            </Card>

            {/* AI Visibility */}
            <Card>
              <CardLabel>VISIBILITÉ IA</CardLabel>
              {platforms.length === 0 ? (
                <EmptyState text="Aucune donnée de visibilité IA." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {platforms.map((p, i) => (
                    <AIRow
                      key={`${p.platform}-${i}`}
                      platform={p.platform}
                      cited={p.cited}
                      position={p.position}
                      last={i === platforms.length - 1}
                    />
                  ))}
                </div>
              )}
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────

function SidebarContent({
  plan,
  navItems,
  activeNav,
  onNavClick,
  userName,
  userEmail,
  initials,
  onSignOut,
}: {
  plan: DashboardPlan;
  navItems: NavItem[];
  activeNav: string;
  onNavClick: (key: string) => void;
  userName?: string | null;
  userEmail?: string | null;
  initials: string;
  onSignOut: () => void;
}) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 16,
      }}
    >
      {/* Logo (mobile drawer shows it; desktop aside has its own sticky header area) */}
      <div
        className="lg:hidden"
        style={{
          padding: "8px 4px 20px",
          fontWeight: 700,
          fontSize: 16,
          color: CHARCOAL,
          letterSpacing: "-0.01em",
        }}
      >
        HARCH <span style={{ color: "#9CA3AF", fontWeight: 400 }}>| ATELIER</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, paddingTop: 8 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeNav === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavClick(item.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
                fontFamily: FONT_SANS,
                border: "none",
                borderLeft: active ? `3px solid ${SAGE}` : "3px solid transparent",
                background: active ? SAGE_SOFT : "transparent",
                color: active ? SAGE : "#525252",
                fontWeight: active ? 600 : 500,
                transition: "background 150ms ease, color 150ms ease",
                textAlign: "left",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "#FAFAFA";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              <Icon size={18} strokeWidth={active ? 2.25 : 1.75} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 ? (
                <span
                  style={{
                    backgroundColor: "#EF4444",
                    color: "#FFFFFF",
                    fontSize: 10,
                    fontWeight: 700,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                    fontFamily: FONT_MONO,
                  }}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Plan section */}
      <div style={{ padding: "16px 4px 12px", borderTop: `1px solid ${BORDER}` }}>
        <div
          style={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#9CA3AF",
            fontFamily: FONT_MONO,
            marginBottom: 6,
          }}
        >
          PLAN
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL, marginBottom: 2 }}>
          {PLAN_LABELS[plan]}
        </div>
        <div style={{ fontSize: 12, color: "#71717A" }}>{PLAN_STATUS[plan]}</div>
      </div>

      {/* User section */}
      <div
        style={{
          padding: "12px 4px 4px",
          borderTop: `1px solid ${BORDER}`,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor: SAGE,
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: FONT_MONO,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: CHARCOAL,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {userName || "Utilisateur"}
            </div>
            {userEmail && (
              <div
                style={{
                  fontSize: 11,
                  color: "#71717A",
                  fontFamily: FONT_MONO,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {userEmail}
              </div>
            )}
          </div>
        </div>

        <SidebarLink icon={Settings} label="Paramètres" href="/atelier/console/settings/security" color="#525252" />
        <SidebarLink icon={LogOut} label="Déconnexion" onClick={onSignOut} color="#EF4444" />
      </div>
    </div>
  );
}

function SidebarLink({
  icon: Icon,
  label,
  href,
  onClick,
  color,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  href?: string;
  onClick?: () => void;
  color: string;
}) {
  const style: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 4px",
    fontSize: 12,
    fontFamily: FONT_SANS,
    color,
    background: "none",
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
    borderRadius: 6,
    transition: "background 150ms ease",
    width: "100%",
    textAlign: "left",
  };
  const hoverHandlers = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.background = "#FAFAFA";
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.background = "transparent";
    },
  };
  if (href) {
    return (
      <a href={href} style={style} {...hoverHandlers}>
        <Icon size={14} strokeWidth={1.75} />
        {label}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} style={style} {...hoverHandlers}>
      <Icon size={14} strokeWidth={1.75} />
      {label}
    </button>
  );
}

// ─── Search input ─────────────────────────────────────────────────

function SearchInput() {
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <Search
        size={16}
        strokeWidth={1.75}
        style={{
          position: "absolute",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          color: "#9CA3AF",
          pointerEvents: "none",
        }}
      />
      <input
        type="text"
        placeholder="Rechercher mentions, sujets…"
        aria-label="Rechercher"
        style={{
          width: "100%",
          height: 36,
          padding: "0 12px 0 34px",
          backgroundColor: INPUT_BG,
          border: "1px solid transparent",
          borderRadius: 10,
          fontSize: 13,
          fontFamily: FONT_SANS,
          color: CHARCOAL,
          outline: "none",
          transition: "border 150ms ease, background 150ms ease",
        }}
        onFocus={(e) => {
          e.currentTarget.style.border = `1px solid ${SAGE}`;
          e.currentTarget.style.background = "#FFFFFF";
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = "1px solid transparent";
          e.currentTarget.style.background = INPUT_BG;
        }}
      />
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────

function KPICard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: number | null;
}) {
  const trendPositive = trend !== null && trend > 0;
  const trendNegative = trend !== null && trend < 0;
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 20,
        border: `1px solid ${BORDER}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        transition: "box-shadow 150ms ease, transform 150ms ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.04)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: SAGE,
          fontWeight: 700,
          marginBottom: 8,
          fontFamily: FONT_MONO,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: CHARCOAL,
          fontFamily: FONT_MONO,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      {trend !== null && (
        <div
          style={{
            fontSize: 12,
            marginTop: 6,
            fontFamily: FONT_MONO,
            color: trendPositive ? "#10B981" : trendNegative ? "#EF4444" : "#9CA3AF",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>{trendPositive ? "↑" : trendNegative ? "↓" : "→"}</span>
          <span>
            {trendPositive ? `+${trend}` : trend}
            {trendPositive ? "" : ""}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Card primitives ──────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 24,
        border: `1px solid ${BORDER}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: SAGE,
        fontWeight: 700,
        marginBottom: 16,
        fontFamily: FONT_MONO,
      }}
    >
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ color: "#71717A", fontSize: 13, padding: "8px 0" }}>{text}</div>
  );
}

// ─── Range toggle ─────────────────────────────────────────────────

function RangeToggle({
  range,
  onChange,
}: {
  range: RangeKey;
  onChange: (r: RangeKey) => void;
}) {
  const options: RangeKey[] = ["7j", "30j", "90j"];
  return (
    <div
      style={{
        display: "inline-flex",
        backgroundColor: INPUT_BG,
        borderRadius: 10,
        padding: 3,
        gap: 2,
      }}
    >
      {options.map((opt) => {
        const active = range === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              border: "none",
              background: active ? CHARCOAL : "transparent",
              color: active ? "#FFFFFF" : "#525252",
              fontSize: 12,
              fontFamily: FONT_MONO,
              fontWeight: active ? 600 : 500,
              padding: "6px 12px",
              borderRadius: 8,
              cursor: "pointer",
              transition: "background 150ms ease, color 150ms ease",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── Sentiment chart (pure SVG) ───────────────────────────────────

function SentimentChart({
  data,
  loading,
}: {
  data: SentimentPoint[];
  loading: boolean;
}) {
  const WIDTH = 800;
  const HEIGHT = 240;
  const PAD_L = 8;
  const PAD_R = 8;
  const PAD_T = 12;
  const PAD_B = 8;
  const plotW = WIDTH - PAD_L - PAD_R;
  const plotH = HEIGHT - PAD_T - PAD_B;

  const { paths, maxVal } = useMemo(() => {
    if (data.length === 0) {
      return { paths: null, maxVal: 0 };
    }
    const maxVal = Math.max(
      1,
      ...data.map((d) => Math.max(d.positive, d.neutral, d.negative)),
    );
    const n = data.length;
    const x = (i: number) => PAD_L + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
    const y = (v: number) => PAD_T + plotH - (v / maxVal) * plotH;

    const buildPath = (key: "positive" | "neutral" | "negative") => {
      const pts = data.map((d, i) => `${x(i)},${y(d[key])}`);
      const line = `M ${pts.join(" L ")}`;
      // Area: line + close to bottom
      const area = `${line} L ${x(n - 1)},${PAD_T + plotH} L ${x(0)},${PAD_T + plotH} Z`;
      return { line, area };
    };

    return {
      paths: {
        positive: buildPath("positive"),
        neutral: buildPath("neutral"),
        negative: buildPath("negative"),
      },
      maxVal,
    };
  }, [data, plotW, plotH]);

  if (loading && data.length === 0) {
    return (
      <div
        style={{
          height: HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9CA3AF",
          fontSize: 13,
          fontFamily: FONT_MONO,
        }}
      >
        Chargement…
      </div>
    );
  }

  if (!paths || data.length === 0) {
    return (
      <div
        style={{
          height: HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9CA3AF",
          fontSize: 13,
        }}
      >
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      height={HEIGHT}
      preserveAspectRatio="none"
      style={{ display: "block", overflow: "visible" }}
      role="img"
      aria-label="Graphique de sentiment dans le temps"
    >
      <defs>
        <linearGradient id="grad-pos" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLOR_POSITIVE} stopOpacity="0.22" />
          <stop offset="100%" stopColor={COLOR_POSITIVE} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="grad-neu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLOR_NEUTRAL} stopOpacity="0.18" />
          <stop offset="100%" stopColor={COLOR_NEUTRAL} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="grad-neg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLOR_NEGATIVE} stopOpacity="0.20" />
          <stop offset="100%" stopColor={COLOR_NEGATIVE} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Baseline */}
      <line
        x1={PAD_L}
        y1={PAD_T + plotH}
        x2={WIDTH - PAD_R}
        y2={PAD_T + plotH}
        stroke="#F0F0F0"
        strokeWidth="1"
      />

      {/* Areas + lines */}
      <path d={paths.positive.area} fill="url(#grad-pos)" stroke="none" />
      <path d={paths.positive.line} fill="none" stroke={COLOR_POSITIVE} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      <path d={paths.neutral.area} fill="url(#grad-neu)" stroke="none" />
      <path d={paths.neutral.line} fill="none" stroke={COLOR_NEUTRAL} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      <path d={paths.negative.area} fill="url(#grad-neg)" stroke="none" />
      <path d={paths.negative.line} fill="none" stroke={COLOR_NEGATIVE} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {/* X-axis labels (first / middle / last) */}
      {data.length > 1 && (
        <>
          <ChartXLabel value={data[0].date} x={PAD_L} y={HEIGHT - 2} align="start" />
          <ChartXLabel
            value={data[Math.floor(data.length / 2)].date}
            x={PAD_L + plotW / 2}
            y={HEIGHT - 2}
            align="middle"
          />
          <ChartXLabel value={data[data.length - 1].date} x={WIDTH - PAD_R} y={HEIGHT - 2} align="end" />
        </>
      )}
    </svg>
  );
}

function ChartXLabel({
  value,
  x,
  y,
  align,
}: {
  value: string;
  x: number;
  y: number;
  align: "start" | "middle" | "end";
}) {
  const label = formatDateShort(value);
  return (
    <text
      x={x}
      y={y}
      textAnchor={align}
      style={{
        fontSize: 10,
        fill: "#9CA3AF",
        fontFamily: FONT_MONO,
      }}
    >
      {label}
    </text>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: color,
          display: "inline-block",
        }}
      />
      <span style={{ color: "#525252" }}>{label}</span>
    </div>
  );
}

// ─── Topic row ────────────────────────────────────────────────────

function TopicRow({
  index,
  label,
  count,
  split,
  maxCount,
}: {
  index: number;
  label: string;
  count: number;
  split: { positive: number; neutral: number; negative: number } | null;
  maxCount: number;
}) {
  // Derive proportional sentiment bar from the brand-wide split
  const posPct = split ? split.positive : 0;
  const neuPct = split ? split.neutral : 100;
  const negPct = split ? split.negative : 0;
  const barWidth = Math.max(4, Math.round((count / maxCount) * 100));

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 6,
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 14,
            color: CHARCOAL,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "#9CA3AF", fontFamily: FONT_MONO, marginRight: 6 }}>{index}.</span>
          {label}
        </span>
        <span
          style={{
            fontSize: 12,
            color: "#71717A",
            fontFamily: FONT_MONO,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {count} mentions
        </span>
      </div>
      <div
        style={{
          display: "flex",
          height: 6,
          borderRadius: 3,
          overflow: "hidden",
          backgroundColor: "#F4F4F5",
          width: `${barWidth}%`,
        }}
      >
        <div style={{ width: `${posPct}%`, backgroundColor: COLOR_POSITIVE }} />
        <div style={{ width: `${neuPct}%`, backgroundColor: COLOR_NEUTRAL }} />
        <div style={{ width: `${negPct}%`, backgroundColor: COLOR_NEGATIVE }} />
      </div>
    </div>
  );
}

// ─── AI visibility row ────────────────────────────────────────────

function AIRow({
  platform,
  cited,
  position,
  last,
}: {
  platform: string;
  cited: boolean;
  position: number | null;
  last: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: last ? "none" : `1px solid ${BORDER}`,
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <span
          style={{
            fontSize: 14,
            fontFamily: FONT_MONO,
            color: CHARCOAL,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {platform}
        </span>
        {cited && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: SAGE,
              backgroundColor: SAGE_SOFT,
              padding: "2px 6px",
              borderRadius: 4,
              fontFamily: FONT_MONO,
              whiteSpace: "nowrap",
            }}
          >
            Cité
          </span>
        )}
      </div>
      <span
        style={{
          fontSize: 18,
          fontWeight: 700,
          fontFamily: FONT_MONO,
          color: position !== null ? CHARCOAL : "#9CA3AF",
          whiteSpace: "nowrap",
        }}
      >
        {position !== null ? `#${position}` : "—"}
      </span>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}k`.replace(".0k", "k");
  }
  return String(n);
}

function formatDateShort(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  } catch {
    return iso;
  }
}

export default Dashboard;
