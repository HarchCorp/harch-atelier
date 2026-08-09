"use client";

import { useState, useEffect } from "react";
import { C } from "../components/tokens";
import { CommandPalette } from "./CommandPalette";

export type DashboardPlan = "essential" | "pro" | "enterprise" | "agency";

export interface DashboardProps {
  plan?: DashboardPlan;
  userName?: string | null;
  userEmail?: string | null;
  companyName?: string;
}

const PLAN_LABELS: Record<DashboardPlan, string> = {
  essential: "Essentiel",
  pro: "Pro",
  enterprise: "Grandes Entreprises",
  agency: "Agences",
};

export function Dashboard({ plan = "essential", userName, userEmail }: DashboardProps) {
  const [alertCount, setAlertCount] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [trend, setTrend] = useState<number | null>(null);
  const [mentions, setMentions] = useState<number | null>(null);
  const [aiCitations, setAiCitations] = useState<number | null>(null);
  const [topics, setTopics] = useState<Array<{ name: string; mentions: number; positivePct: number; negativePct: number }>>([]);
  const [llmRankings, setLlmRankings] = useState<Array<{ llm: string; position: number | null; delta: number | null }>>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = (userName || userEmail || "U").slice(0, 2).toUpperCase();

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/console/brand-health", { signal: ctrl.signal, credentials: "same-origin" });
        if (res.ok) {
          const d = await res.json();
          setScore(d.score ?? null);
          setTrend(d.trend ?? null);
          setMentions(d.mentionCount24h ?? d.mentionVelocity ?? null);
          const aiVis = Array.isArray(d.aiVisibility) ? d.aiVisibility.filter((a: { score?: number }) => (a.score ?? 0) > 0).length : null;
          setAiCitations(aiVis);
        }
      } catch { /* silent */ }
    })();
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/console/crisis-alerts", { signal: ctrl.signal, credentials: "same-origin" });
        if (res.ok) {
          const d = await res.json();
          setAlertCount(typeof d.count === "number" ? d.count : (Array.isArray(d.alerts) ? d.alerts.length : 0));
        }
      } catch { /* silent */ }
    })();
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/console/insights?type=topics&limit=5", { signal: ctrl.signal, credentials: "same-origin" });
        if (res.ok) {
          const d = await res.json();
          setTopics(Array.isArray(d.topics) ? d.topics.slice(0, 5) : []);
        }
      } catch { /* silent */ }
    })();
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/console/ai-visibility", { signal: ctrl.signal, credentials: "same-origin" });
        if (res.ok) {
          const d = await res.json();
          const platforms = Array.isArray(d.platforms) ? d.platforms : [];
          setLlmRankings(platforms.map((p: { platform: string; rank?: number; previousRank?: number }) => ({
            llm: p.platform,
            position: p.rank ?? null,
            delta: p.previousRank ? (p.previousRank - (p.rank ?? 0)) : null,
          })));
        }
      } catch { /* silent */ }
    })();
    return () => ctrl.abort();
  }, []);

  const navItems = [
    { label: "Monitoring", icon: "📊" },
    { label: "Sentiment", icon: "📈" },
    ...(plan !== "essential" ? [{ label: "Concurrents", icon: "🎯" }] : []),
    { label: "Alertes", icon: "🔔", badge: alertCount },
    ...(plan !== "essential" ? [{ label: "Rapports", icon: "📄" }] : []),
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: C.bgSubtle }}>
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={() => setSidebarOpen(false)}>
          <div className="absolute left-0 top-0 h-full" style={{ width: 240, backgroundColor: "#fff", borderRight: `1px solid ${C.border}` }} onClick={(e) => e.stopPropagation()}>
            <SidebarContent plan={plan} navItems={navItems} userName={userName} userEmail={userEmail} />
          </div>
        </div>
      )}
      <div className="hidden lg:block" style={{ width: 240, flexShrink: 0, position: "sticky", top: 0, height: "100vh", backgroundColor: "#fff", borderRight: `1px solid ${C.border}` }}>
        <SidebarContent plan={plan} navItems={navItems} userName={userName} userEmail={userEmail} />
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header style={{ height: 64, backgroundColor: "#fff", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 24px", gap: 16, position: "sticky", top: 0, zIndex: 30 }}>
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 20 }}>☰</button>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#0A0A0A" }}>HARCH <span style={{ color: "#71717A", fontWeight: 400 }}>| ATELIER</span></div>
          <div style={{ flex: 1, maxWidth: 400, margin: "0 auto" }}>
            <input type="text" placeholder="Rechercher mentions, sujets, concurrents…" style={{ width: "100%", height: 36, padding: "0 12px", backgroundColor: "#F4F4F5", border: "1px solid transparent", borderRadius: 8, fontSize: 13, outline: "none" }} />
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ fontSize: 18, cursor: "pointer" }}>🔔</span>
            {alertCount > 0 && (
              <span style={{ position: "absolute", top: -4, right: -4, backgroundColor: "#EF4444", color: "#fff", fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{alertCount > 99 ? "99+" : alertCount}</span>
            )}
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#4A7B5F", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{initials}</div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: 32, maxWidth: 1400, margin: "0 auto", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <KPICard label="SENTIMENT MOYEN" value={score !== null ? `${score}%` : "—"} trend={trend} />
              <KPICard label="MENTIONS / JOUR" value={mentions !== null ? String(mentions) : "—"} trend={null} />
              <KPICard label="CITATIONS IA" value={aiCitations !== null ? String(aiCitations) : "—"} trend={null} />
            </div>

            {/* Topics + AI Visibility */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
              {/* Topics */}
              <div style={{ backgroundColor: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#4A7B5F", fontWeight: 700, marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>TOP 5 SUJETS</div>
                {topics.length === 0 ? (
                  <div style={{ color: "#71717A", fontSize: 13 }}>Aucun sujet détecté.</div>
                ) : (
                  topics.map((t, i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 14, color: "#0A0A0A" }}>{i + 1}. {t.name}</span>
                        <span style={{ fontSize: 12, color: "#71717A", fontFamily: "'JetBrains Mono', monospace" }}>{t.mentions} mentions</span>
                      </div>
                      <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", backgroundColor: "#F4F4F5" }}>
                        <div style={{ width: `${t.positivePct}%`, backgroundColor: "#10B981" }} />
                        <div style={{ width: `${100 - t.positivePct - t.negativePct}%`, backgroundColor: "#9CA3AF" }} />
                        <div style={{ width: `${t.negativePct}%`, backgroundColor: "#EF4444" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                        <span style={{ color: "#10B981" }}>{t.positivePct}% pos</span>
                        <span style={{ color: "#EF4444" }}>{t.negativePct}% neg</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* AI Visibility */}
              <div style={{ backgroundColor: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#4A7B5F", fontWeight: 700, marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>VISIBILITÉ IA</div>
                {llmRankings.length === 0 ? (
                  <div style={{ color: "#71717A", fontSize: 13 }}>Aucune donnée de visibilité IA.</div>
                ) : (
                  llmRankings.map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < llmRankings.length - 1 ? `1px solid ${C.border}` : "none" }}>
                      <span style={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}>{r.llm}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{r.position ? `#${r.position}` : "—"}</span>
                        {r.delta !== null && r.delta > 0 && <span style={{ fontSize: 12, color: "#10B981" }}>↑ {r.delta}</span>}
                        {r.delta !== null && r.delta < 0 && <span style={{ fontSize: 12, color: "#EF4444" }}>↓ {Math.abs(r.delta)}</span>}
                        {r.delta !== null && r.delta === 0 && <span style={{ fontSize: 12, color: "#9CA3AF" }}>—</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* CommandPalette removed — uses different props, will be wired separately */}
    </div>
  );
}

function SidebarContent({ plan, navItems, userName, userEmail }: { plan: DashboardPlan; navItems: Array<{ label: string; icon: string; badge?: number }>; userName?: string | null; userEmail?: string | null }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: 16 }}>
      <div style={{ padding: "8px 0 16px", fontWeight: 700, fontSize: 16, color: "#0A0A0A" }}>HARCH <span style={{ color: "#71717A", fontWeight: 400 }}>| ATELIER</span></div>
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, cursor: "pointer", fontSize: 14, color: "#525252" }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && item.badge > 0 ? (
              <span style={{ marginLeft: "auto", backgroundColor: "#EF4444", color: "#fff", fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{item.badge}</span>
            ) : null}
          </div>
        ))}
      </nav>
      <div style={{ borderTop: "1px solid #E5E5E5", paddingTop: 16 }}>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#71717A", marginBottom: 4 }}>PLAN</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0A0A0A", marginBottom: 8 }}>{PLAN_LABELS[plan]}</div>
        <div style={{ fontSize: 12, color: "#525252" }}>{userName || userEmail || "Utilisateur"}</div>
      </div>
    </div>
  );
}

function KPICard({ label, value, trend }: { label: string; value: string; trend: number | null }) {
  return (
    <div style={{ backgroundColor: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#4A7B5F", fontWeight: 700, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 700, color: "#0A0A0A", fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
      {trend !== null && (
        <div style={{ fontSize: 12, marginTop: 4, fontFamily: "'JetBrains Mono', monospace", color: trend > 0 ? "#10B981" : "#EF4444" }}>
          {trend > 0 ? "↑" : "↓"} {trend > 0 ? `+${trend}` : trend}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
