"use client";

// ═══════════════════════════════════════════════════════════════
//  EnterpriseDashboard.tsx
//
//  Renders the shared <Dashboard plan="enterprise" /> first, then
//  adds 5 advanced enterprise-grade modules below it:
//
//    1. DEFCON Crisis Readiness Panel
//    2. Multi-Team Dashboard (expandable)
//    3. API & Integrations Panel
//    4. Influencer Marketing Section
//    5. Executive Briefing Generator
//
//  All data fetched from real APIs. No mock data. French UI.
//  C tokens throughout. Mobile responsive.
//
//  Task: CRAZY-4-ENTERPRISE
// ═══════════════════════════════════════════════════════════════

import { CSSProperties, ReactNode, useCallback, useEffect, useState } from "react";
import { C } from "../../components/tokens";
import { Dashboard } from "../Dashboard";

// ─── Types ──────────────────────────────────────────────────────

interface CrisisAlert {
  id: string;
  severity: "critical" | "warning" | "watch";
  title: string;
  source: string;
  timestamp: number;
}

interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  role: string;
  accountType: string | null;
  status: string;
  lastLoginAt: string | null;
}

interface ApiKeyRow {
  id: string;
  name: string;
  keyPrefix: string | null;
  tier: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  revokedAt: string | null;
  status: "active" | "expired" | "revoked";
}

interface InfluencerRow {
  id: string;
  name: string;
  handle: string | null;
  platform: string;
  followers: number;
  influenceScore: number;
  engagementScore: number;
  reachScore: number;
  mentionCount: number;
  verified: boolean;
}

interface BriefingRow {
  id: string;
  date: string;
  title: string;
  summary: string;
  status: string;
  alertCount: number;
  createdAt: string;
}

// ─── DEFCON configuration ───────────────────────────────────────

type DefconLevel = 1 | 2 | 3 | 4 | 5;

const DEFCON_CONFIG: Record<DefconLevel, { color: string; label: string }> = {
  1: { color: "#ef4444", label: "Niveau 1 — Crise majeure" },
  2: { color: "#f97316", label: "Niveau 2 — Alertes critiques" },
  3: { color: "#f59e0b", label: "Niveau 3 — Surveillance accrue" },
  4: { color: "#3b82f6", label: "Niveau 4 — Vigilance" },
  5: { color: "#10b981", label: "Niveau 5 — Veille normale" },
};

// ─── Team mapping (department → accountType/role heuristics) ─────

interface TeamDef {
  id: string;
  name: string;
  accountTypes: string[];
  roles: string[];
}

const TEAMS: TeamDef[] = [
  { id: "marketing", name: "Marketing", accountTypes: ["market-competitor"], roles: [] },
  { id: "communication", name: "Communication", accountTypes: ["brand-monitor"], roles: [] },
  { id: "juridique", name: "Juridique", accountTypes: [], roles: [] },
  { id: "direction", name: "Direction", accountTypes: [], roles: ["company-admin", "admin"] },
  { id: "rp", name: "Relations Publiques", accountTypes: ["investment-bank"], roles: [] },
];

// ─── Shared styles ──────────────────────────────────────────────

const labelStyle: CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: C.textMuted,
  fontFamily: C.fontMono,
  fontWeight: 700,
  marginBottom: 10,
};

const btnSecondary: CSSProperties = {
  backgroundColor: C.bg,
  color: C.text,
  border: `1px solid ${C.borderStrong}`,
  padding: "8px 16px",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: C.fontMono,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const PULSE_CSS =
  "@keyframes harch-pulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.5)}50%{box-shadow:0 0 0 10px rgba(239,68,68,0)}}";

// ═══════════════════════════════════════════════════════════════
//  Main component
// ═══════════════════════════════════════════════════════════════

export function EnterpriseDashboard({
  userName,
  userEmail,
  companyName,
}: {
  userName?: string | null;
  userEmail?: string | null;
  companyName?: string;
}) {
  return (
    <>
      <Dashboard plan="enterprise" userName={userName} userEmail={userEmail} />
      <div className="lg:pl-[240px]" style={{ backgroundColor: C.bgSubtle }}>
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "32px 24px 64px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* Section banner */}
          <div style={{ padding: "16px 0 20px", borderBottom: `1px solid ${C.border}` }}>
            <div
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: C.accent,
                fontWeight: 700,
                fontFamily: C.fontMono,
                marginBottom: 6,
              }}
            >
              Modules Enterprise
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: C.fontSans }}>
              Conduite de crise, intégrations et intelligence exécutive
            </div>
            <div style={{ fontSize: 13, color: C.textMuted, marginTop: 6 }}>
              {companyName ? `${companyName} · ` : ""}Surveillance temps réel · 5 modules avancés · Plan Grandes Entreprises
            </div>
          </div>

          <DefconPanel />
          <MultiTeamDashboard />
          <ApiIntegrationsPanel />
          <InfluencerMarketing />
          <ExecutiveBriefingGenerator />
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Section wrapper
// ═══════════════════════════════════════════════════════════════

function SectionCard({
  title,
  subtitle,
  accent,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  accent?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      style={{
        backgroundColor: C.bg,
        borderRadius: 12,
        boxShadow: C.shadowSm,
        border: `1px solid ${C.border}`,
        overflow: "hidden",
      }}
    >
      <header
        style={{
          padding: "20px 24px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: accent || C.accent,
              fontWeight: 700,
              fontFamily: C.fontMono,
              marginBottom: 4,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 16, fontWeight: 600, color: C.text, fontFamily: C.fontSans }}>
              {subtitle}
            </div>
          )}
        </div>
        {action}
      </header>
      <div style={{ padding: 24 }}>{children}</div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
//  1. DEFCON Crisis Readiness Panel
// ═══════════════════════════════════════════════════════════════

function DefconPanel() {
  const [alerts, setAlerts] = useState<CrisisAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [crisisMode, setCrisisMode] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/console/crisis-alerts", {
          signal: ctrl.signal,
          credentials: "same-origin",
        });
        if (res.ok) {
          const d = await res.json();
          setAlerts(Array.isArray(d.alerts) ? d.alerts : []);
        }
      } catch {
        /* silent */
      }
      setLoading(false);
    })();
    return () => ctrl.abort();
  }, []);

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;
  const activeThreats = alerts.length;

  // Compute DEFCON level from real alert data.
  // Default to level 3 (Surveillance accrue) while loading.
  let defconLevel: DefconLevel = 3;
  if (!loading) {
    if (criticalCount >= 3) defconLevel = 1;
    else if (criticalCount >= 1) defconLevel = 2;
    else if (warningCount >= 3) defconLevel = 3;
    else if (warningCount >= 1 || activeThreats > 0) defconLevel = 4;
    else defconLevel = 5;
  }

  const config = DEFCON_CONFIG[defconLevel];
  const lastIncidentTs =
    alerts.length > 0 ? Math.max(...alerts.map((a) => a.timestamp)) : null;
  const lastIncident = lastIncidentTs
    ? new Date(lastIncidentTs).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <SectionCard
      title="DEFCON · Préparation crise"
      subtitle="Niveau de readiness et menaces actives"
      accent={config.color}
      action={
        <button
          onClick={() => setCrisisMode(!crisisMode)}
          style={{
            backgroundColor: crisisMode ? "#7f1d1d" : "#ef4444",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: C.fontMono,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            animation: crisisMode ? "none" : "harch-pulse 2s infinite",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#fff",
              display: "inline-block",
            }}
          />
          {crisisMode ? "Mode crise actif" : "Activer le mode crise"}
        </button>
      }
    >
      <style dangerouslySetInnerHTML={{ __html: PULSE_CSS }} />

      {/* DEFCON indicator + stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(200px, 260px) 1fr",
          gap: 24,
          alignItems: "stretch",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            backgroundColor: config.color,
            borderRadius: 12,
            padding: 24,
            color: "#fff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              opacity: 0.9,
              fontFamily: C.fontMono,
              marginBottom: 8,
              fontWeight: 700,
            }}
          >
            Niveau DEFCON
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, fontFamily: C.fontMono, lineHeight: 1 }}>
            {defconLevel}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8, opacity: 0.95 }}>
            {config.label}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12,
          }}
        >
          <StatBox label="Menaces actives" value={loading ? "—" : String(activeThreats)} color="#ef4444" />
          <StatBox label="Alertes critiques" value={loading ? "—" : String(criticalCount)} color="#f97316" />
          <StatBox label="Alertes modérées" value={loading ? "—" : String(warningCount)} color="#f59e0b" />
          <StatBox label="Dernier incident" value={lastIncident} color={C.accent} small />
        </div>
      </div>

      {/* DEFCON scale */}
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {([1, 2, 3, 4, 5] as DefconLevel[]).map((level) => {
          const isActive = level === defconLevel;
          const cfg = DEFCON_CONFIG[level];
          return (
            <div
              key={level}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                backgroundColor: isActive ? cfg.color : C.bgHover,
                transition: "background-color 0.2s",
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          fontFamily: C.fontMono,
          color: C.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        <span>D1 · Critique</span>
        <span>D2 · Élevé</span>
        <span>D3 · Modéré</span>
        <span>D4 · Faible</span>
        <span>D5 · Normal</span>
      </div>

      {/* Recent threats */}
      {alerts.length > 0 && (
        <div style={{ marginTop: 24, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
          <div
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: C.accent,
              fontWeight: 700,
              fontFamily: C.fontMono,
              marginBottom: 12,
            }}
          >
            Menaces récentes
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            {alerts.slice(0, 5).map((a) => (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  padding: "8px 12px",
                  backgroundColor: C.bgSubtle,
                  borderRadius: 8,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor:
                      a.severity === "critical"
                        ? "#ef4444"
                        : a.severity === "warning"
                        ? "#f59e0b"
                        : "#3b82f6",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    color: C.text,
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {a.title}
                </span>
                <span style={{ fontSize: 11, color: C.textMuted, fontFamily: C.fontMono, flexShrink: 0 }}>
                  {a.source}
                </span>
                <span style={{ fontSize: 11, color: C.textMuted, fontFamily: C.fontMono, flexShrink: 0 }}>
                  {new Date(a.timestamp).toLocaleString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ═══════════════════════════════════════════════════════════════
//  2. Multi-Team Dashboard
// ═══════════════════════════════════════════════════════════════

function MultiTeamDashboard() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [noAccess, setNoAccess] = useState(false);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/company/team", {
          signal: ctrl.signal,
          credentials: "same-origin",
        });
        if (res.status === 403) {
          setNoAccess(true);
        } else if (res.ok) {
          const d = await res.json();
          setMembers(Array.isArray(d.users) ? d.users : []);
        }
      } catch {
        /* silent */
      }
      setLoading(false);
    })();
    return () => ctrl.abort();
  }, []);

  const teamsWithData = TEAMS.map((team) => {
    const teamMembers = members.filter((m) => {
      if (team.roles.length > 0 && m.role && team.roles.includes(m.role)) return true;
      if (team.accountTypes.length > 0 && m.accountType && team.accountTypes.includes(m.accountType))
        return true;
      return false;
    });
    return { ...team, members: teamMembers, count: teamMembers.length };
  });

  return (
    <SectionCard
      title="Dashboard multi-équipes"
      subtitle="Vue agrégée par département"
      accent={C.accent}
      action={
        <div
          style={{
            fontSize: 11,
            color: C.textMuted,
            fontFamily: C.fontMono,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {loading ? "Chargement…" : noAccess ? "Accès admin requis" : `${members.length} membres au total`}
        </div>
      }
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 640 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.border}` }}>
              <Th>Équipe</Th>
              <Th align="right">Membres</Th>
              <Th align="right">Score réputation</Th>
              <Th align="center">Sentiment</Th>
              <Th align="right">Alertes</Th>
              <Th align="center">Statut</Th>
            </tr>
          </thead>
          <tbody>
            {teamsWithData.flatMap((team) => {
              const isExpanded = expandedTeam === team.id;
              const rows: ReactNode[] = [];
              rows.push(
                <tr
                  key={team.id}
                  onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                  style={{
                    cursor: "pointer",
                    borderBottom: `1px solid ${C.border}`,
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = C.bgSubtle;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <Td>
                    <span style={{ fontWeight: 600, color: C.text }}>{team.name}</span>
                    <span style={{ marginLeft: 8, fontSize: 11, color: C.textMuted }}>
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </Td>
                  <Td align="right" mono>
                    {loading ? "—" : String(team.count)}
                  </Td>
                  <Td align="right" mono>
                    <ScoreBadge score={null} />
                  </Td>
                  <Td align="center">—</Td>
                  <Td align="right" mono>
                    —
                  </Td>
                  <Td align="center">
                    <StatusPill active={team.count > 0} />
                  </Td>
                </tr>,
              );
              if (isExpanded) {
                rows.push(
                  <tr key={`${team.id}-detail`}>
                    <td
                      colSpan={6}
                      style={{
                        padding: "16px 24px",
                        backgroundColor: C.bgSubtle,
                        borderBottom: `1px solid ${C.border}`,
                      }}
                    >
                      {noAccess ? (
                        <div style={{ fontSize: 13, color: C.textMuted, fontStyle: "italic" }}>
                          Permissions admin requises pour voir les membres.
                        </div>
                      ) : team.members.length === 0 ? (
                        <div style={{ fontSize: 13, color: C.textMuted, fontStyle: "italic" }}>
                          Aucun membre dans cette équipe.
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {team.members.map((m) => (
                            <div
                              key={m.id}
                              style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}
                            >
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  backgroundColor: C.accent,
                                  color: "#fff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  fontFamily: C.fontMono,
                                  flexShrink: 0,
                                }}
                              >
                                {(m.name || m.email || "U").slice(0, 2).toUpperCase()}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: C.text,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {m.name || m.email}
                                </div>
                                <div style={{ fontSize: 11, color: C.textMuted, fontFamily: C.fontMono }}>
                                  {m.email}
                                </div>
                              </div>
                              <div
                                style={{
                                  fontSize: 10,
                                  color: C.textMuted,
                                  fontFamily: C.fontMono,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.06em",
                                  flexShrink: 0,
                                }}
                              >
                                {m.accountType || m.role}
                              </div>
                              <div
                                style={{
                                  fontSize: 10,
                                  color: m.status === "active" ? C.success : C.danger,
                                  fontFamily: C.fontMono,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.06em",
                                  flexShrink: 0,
                                }}
                              >
                                {m.status}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>,
                );
              }
              return rows;
            })}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 16, fontSize: 11, color: C.textMuted, fontFamily: C.fontMono }}>
        Scores de réputation et sentiment par équipe: données non disponibles. Cliquez sur une équipe pour voir les membres.
      </div>
    </SectionCard>
  );
}

// ═══════════════════════════════════════════════════════════════
//  3. API & Integrations Panel
// ═══════════════════════════════════════════════════════════════

function ApiIntegrationsPanel() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [webhookCount, setWebhookCount] = useState(0);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/api-keys", { credentials: "same-origin" });
      if (res.ok) {
        const d = await res.json();
        setKeys(Array.isArray(d.keys) ? d.keys : []);
      }
    } catch {
      /* silent */
    }
    setLoading(false);
  }, []);

  const fetchWebhooks = useCallback(async () => {
    try {
      const res = await fetch("/api/webhooks", { credentials: "same-origin" });
      if (res.ok) {
        const d = await res.json();
        const list = Array.isArray(d?.webhooks) ? d.webhooks : Array.isArray(d) ? d : [];
        setWebhookCount(list.length);
      }
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchKeys();
    fetchWebhooks();
  }, [fetchKeys, fetchWebhooks]);

  const activeKey = keys.find((k) => k.status === "active");
  const maskedKey = activeKey?.keyPrefix
    ? `harch_••••••••••${activeKey.keyPrefix.slice(-4)}`
    : "harch_••••••••••————";

  const handleCopy = async () => {
    try {
      if (newKey) {
        await navigator.clipboard.writeText(newKey);
      } else if (activeKey?.keyPrefix) {
        await navigator.clipboard.writeText(`harch_${activeKey.keyPrefix}`);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Enterprise-${new Date().toISOString().slice(0, 10)}` }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Échec");
      setNewKey(d.key);
      fetchKeys();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
    setRegenerating(false);
  };

  const integrations = [
    { name: "Power BI", connected: false, desc: "Connecteur streaming temps réel" },
    { name: "Tableau", connected: false, desc: "Hyper extractor + WDC" },
    { name: "Slack", connected: webhookCount > 0, desc: "Alertes canal #crisis" },
    { name: "Microsoft Teams", connected: false, desc: "Webhook entrant + bot" },
    { name: "Webhook", connected: webhookCount > 0, desc: `${webhookCount} webhook(s) configuré(s)` },
  ];

  return (
    <SectionCard
      title="API & intégrations"
      subtitle="Clés d'accès et connecteurs enterprise"
      accent={C.accent}
      action={
        <a
          href="/atelier/products/api-mcp"
          style={{
            fontSize: 12,
            color: C.accent,
            textDecoration: "none",
            fontWeight: 600,
            fontFamily: C.fontMono,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Documentation API →
        </a>
      }
    >
      {/* API Key + Usage */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 24 }}>
        <div
          style={{
            padding: 16,
            backgroundColor: C.bgSubtle,
            borderRadius: 8,
            border: `1px solid ${C.border}`,
          }}
        >
          <div style={labelStyle}>Clé API principale</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <code
              style={{
                fontFamily: C.fontMono,
                fontSize: 14,
                color: C.text,
                backgroundColor: C.bg,
                padding: "8px 12px",
                borderRadius: 6,
                border: `1px solid ${C.border}`,
                flex: 1,
                minWidth: 200,
                wordBreak: "break-all",
              }}
            >
              {loading ? "Chargement…" : newKey || maskedKey}
            </code>
            <button onClick={handleCopy} style={btnSecondary}>
              {copied ? "Copié ✓" : "Copier"}
            </button>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              style={{ ...btnSecondary, opacity: regenerating ? 0.6 : 1 }}
            >
              {regenerating ? "Génération…" : "Régénérer"}
            </button>
          </div>
          {newKey && (
            <div
              style={{
                marginTop: 8,
                padding: 8,
                backgroundColor: "#fef3c7",
                borderRadius: 6,
                fontSize: 12,
                color: "#92400e",
              }}
            >
              ⚠ Cette clé ne sera affichée qu'une seule fois. Copiez-la maintenant.
            </div>
          )}
          {error && (
            <div
              style={{
                marginTop: 8,
                padding: 8,
                backgroundColor: C.dangerBg,
                borderRadius: 6,
                fontSize: 12,
                color: C.danger,
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Usage bar */}
        <div
          style={{
            padding: 16,
            backgroundColor: C.bgSubtle,
            borderRadius: 8,
            border: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <span style={labelStyle}>Utilisation ce mois</span>
            <span style={{ fontSize: 12, fontFamily: C.fontMono, color: C.text }}>
              — / 50 000 appels
            </span>
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 4,
              backgroundColor: C.bgHover,
              overflow: "hidden",
            }}
          >
            <div style={{ width: "0%", height: "100%", backgroundColor: C.cta }} />
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 6, fontFamily: C.fontMono }}>
            Quota mensuel · Renouvellement le 1er · {loading ? "—" : `${keys.length} clé(s) au total`}
          </div>
        </div>
      </div>

      {/* Integration cards */}
      <div style={labelStyle}>Intégrations disponibles</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        {integrations.map((integ) => (
          <div
            key={integ.name}
            style={{
              padding: 16,
              backgroundColor: C.bg,
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{integ.name}</span>
              <span
                style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: 12,
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: C.fontMono,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  backgroundColor: integ.connected ? C.successBg : C.bgHover,
                  color: integ.connected ? C.success : C.textMuted,
                  whiteSpace: "nowrap",
                }}
              >
                {integ.connected ? "Connecté" : "Disponible"}
              </span>
            </div>
            <div style={{ fontSize: 12, color: C.textMuted, flex: 1 }}>{integ.desc}</div>
            <a
              href="#"
              style={{
                fontSize: 11,
                color: C.accent,
                textDecoration: "none",
                fontWeight: 600,
                fontFamily: C.fontMono,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Configurer →
            </a>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ═══════════════════════════════════════════════════════════════
//  4. Influencer Marketing Section
// ═══════════════════════════════════════════════════════════════

function InfluencerMarketing() {
  const [influencers, setInfluencers] = useState<InfluencerRow[]>([]);
  const [totalReach, setTotalReach] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [noAccess, setNoAccess] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/console/influencers-db?limit=5", {
          signal: ctrl.signal,
          credentials: "same-origin",
        });
        if (res.status === 403) {
          setNoAccess(true);
        } else if (res.ok) {
          const d = await res.json();
          const list: InfluencerRow[] = Array.isArray(d.influencers) ? d.influencers : [];
          setInfluencers(list);
          setTotalReach(list.reduce((s, i) => s + (i.followers || 0), 0));
        }
      } catch {
        /* silent */
      }
      setLoading(false);
    })();
    return () => ctrl.abort();
  }, []);

  return (
    <SectionCard
      title="Influencer marketing"
      subtitle="Identification et scoring d'influenceurs"
      accent={C.accent}
      action={
        <a
          href="/atelier/lab"
          style={{
            fontSize: 12,
            color: C.accent,
            textDecoration: "none",
            fontWeight: 600,
            fontFamily: C.fontMono,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Voir tous les influenceurs →
        </a>
      }
    >
      {/* KPI cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <KpiMini
          label="Influenceurs identifiés"
          value={loading ? "—" : noAccess ? "—" : String(influencers.length)}
          accent={C.cta}
        />
        <KpiMini label="Campagnes actives" value="—" accent="#f59e0b" />
        <KpiMini
          label="Reach total"
          value={loading || totalReach === null ? "—" : formatNumber(totalReach)}
          accent={C.accent}
        />
      </div>

      {/* Top 5 table */}
      <div style={labelStyle}>Top 5 influenceurs</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 560 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.border}` }}>
              <Th>Nom</Th>
              <Th>Plateforme</Th>
              <Th align="right">Followers</Th>
              <Th align="right">Engagement</Th>
              <Th align="center">Sentiment</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: 24, textAlign: "center", color: C.textMuted }}>
                  Chargement…
                </td>
              </tr>
            ) : noAccess ? (
              <tr>
                <td colSpan={5} style={{ padding: 24, textAlign: "center", color: C.textMuted }}>
                  Accès non autorisé — compte brand-monitor, market-competitor ou investment-bank requis.
                </td>
              </tr>
            ) : influencers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 24, textAlign: "center", color: C.textMuted }}>
                  Aucun influenceur identifié.
                </td>
              </tr>
            ) : (
              influencers.slice(0, 5).map((inf) => (
                <tr key={inf.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <Td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 600, color: C.text }}>{inf.name}</span>
                      {inf.verified && (
                        <span style={{ fontSize: 10, color: C.cta, fontWeight: 700 }}>✓</span>
                      )}
                    </div>
                    {inf.handle && (
                      <div style={{ fontSize: 11, color: C.textMuted, fontFamily: C.fontMono }}>
                        @{inf.handle}
                      </div>
                    )}
                  </Td>
                  <Td>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: C.fontMono,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: C.textBody,
                      }}
                    >
                      {inf.platform}
                    </span>
                  </Td>
                  <Td align="right" mono>
                    {formatNumber(inf.followers)}
                  </Td>
                  <Td align="right" mono>
                    <EngagementBar score={inf.engagementScore} />
                  </Td>
                  <Td align="center">—</Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
        <a
          href="/atelier/lab"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            borderRadius: 6,
            backgroundColor: C.cta,
            color: "#fff",
            textDecoration: "none",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: C.fontMono,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Lancer une recherche →
        </a>
      </div>
    </SectionCard>
  );
}

// ═══════════════════════════════════════════════════════════════
//  5. Executive Briefing Generator
// ═══════════════════════════════════════════════════════════════

function ExecutiveBriefingGenerator() {
  const [reportType, setReportType] = useState("trimestriel");
  const [period, setPeriod] = useState("Q1");
  const [sections, setSections] = useState<Record<string, boolean>>({
    resume: true,
    score: true,
    sentiment: true,
    benchmark: false,
    ai: true,
    crises: true,
    recommandations: true,
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [briefings, setBriefings] = useState<BriefingRow[]>([]);
  const [loadingBriefings, setLoadingBriefings] = useState(true);

  const fetchBriefings = useCallback(async () => {
    try {
      const res = await fetch("/api/console/briefing/list?limit=3", {
        credentials: "same-origin",
      });
      if (res.ok) {
        const d = await res.json();
        setBriefings(Array.isArray(d.briefings) ? d.briefings : []);
      }
    } catch {
      /* silent */
    }
    setLoadingBriefings(false);
  }, []);

  useEffect(() => {
    fetchBriefings();
  }, [fetchBriefings]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/console/briefing", {
        method: "POST",
        credentials: "same-origin",
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Échec de génération");
      setSuccess("Briefing généré avec succès.");
      await fetchBriefings();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
    setGenerating(false);
  };

  const reportTypes = [
    { id: "trimestriel", label: "Trimestriel" },
    { id: "crise", label: "Crise" },
    { id: "benchmark", label: "Benchmark" },
    { id: "esg", label: "ESG" },
    { id: "direction", label: "Direction" },
  ];

  const sectionOptions = [
    { id: "resume", label: "Résumé exécutif" },
    { id: "score", label: "Score de réputation" },
    { id: "sentiment", label: "Analyse sentiment" },
    { id: "benchmark", label: "Benchmark concurrents" },
    { id: "ai", label: "Visibilité IA" },
    { id: "crises", label: "Crises & incidents" },
    { id: "recommandations", label: "Recommandations" },
  ];

  return (
    <SectionCard
      title="Générateur de briefing exécutif"
      subtitle="Rapports board-ready générés par IA"
      accent={C.accent}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 24,
          marginBottom: 24,
        }}
      >
        {/* Report type */}
        <div>
          <div style={labelStyle}>Type de rapport</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {reportTypes.map((rt) => (
              <label
                key={rt.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                  backgroundColor: reportType === rt.id ? C.successBg : C.bgSubtle,
                  border: `1px solid ${reportType === rt.id ? C.success : C.border}`,
                  fontSize: 13,
                  color: C.text,
                  transition: "all 0.15s",
                }}
              >
                <input
                  type="radio"
                  name="reportType"
                  checked={reportType === rt.id}
                  onChange={() => setReportType(rt.id)}
                  style={{ accentColor: C.cta }}
                />
                {rt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Period */}
        <div>
          <div style={labelStyle}>Période</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
            {["Q1", "Q2", "Q3", "Q4"].map((q) => (
              <button
                key={q}
                onClick={() => setPeriod(q)}
                style={{
                  padding: "12px",
                  borderRadius: 6,
                  cursor: "pointer",
                  backgroundColor: period === q ? C.cta : C.bgSubtle,
                  color: period === q ? "#fff" : C.text,
                  border: `1px solid ${period === q ? C.cta : C.border}`,
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: C.fontMono,
                  transition: "all 0.15s",
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div>
          <div style={labelStyle}>Sections à inclure</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {sectionOptions.map((opt) => (
              <label
                key={opt.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 12px",
                  fontSize: 13,
                  color: C.text,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={!!sections[opt.id]}
                  onChange={() => setSections((s) => ({ ...s, [opt.id]: !s[opt.id] }))}
                  style={{ accentColor: C.cta }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Generate button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            backgroundColor: C.cta,
            color: "#fff",
            border: "none",
            padding: "12px 24px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            fontFamily: C.fontMono,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            cursor: generating ? "not-allowed" : "pointer",
            opacity: generating ? 0.7 : 1,
          }}
        >
          {generating ? "Génération en cours…" : "Générer le briefing"}
        </button>
        {error && (
          <span style={{ fontSize: 12, color: C.danger, fontFamily: C.fontMono }}>{error}</span>
        )}
        {success && (
          <span style={{ fontSize: 12, color: C.success, fontFamily: C.fontMono }}>{success}</span>
        )}
      </div>

      {/* Last 3 briefings */}
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
        <div style={labelStyle}>3 derniers briefings générés</div>
        {loadingBriefings ? (
          <div style={{ fontSize: 13, color: C.textMuted }}>Chargement…</div>
        ) : briefings.length === 0 ? (
          <div style={{ fontSize: 13, color: C.textMuted, fontStyle: "italic" }}>
            Aucun briefing généré pour le moment.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {briefings.map((b) => (
              <div
                key={b.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  backgroundColor: C.bgSubtle,
                  borderRadius: 8,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.text,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {b.title}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: C.textMuted,
                      fontFamily: C.fontMono,
                      marginTop: 2,
                    }}
                  >
                    {new Date(b.createdAt).toLocaleDateString("fr-FR")} · {b.alertCount} alertes · {b.status}
                  </div>
                </div>
                <a
                  href={`/api/console/briefing?date=${b.date}`}
                  style={{
                    fontSize: 11,
                    color: C.accent,
                    textDecoration: "none",
                    fontWeight: 600,
                    fontFamily: C.fontMono,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    whiteSpace: "nowrap",
                  }}
                >
                  Télécharger ↓
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Helper components
// ═══════════════════════════════════════════════════════════════

function StatBox({
  label,
  value,
  color,
  small,
}: {
  label: string;
  value: string;
  color: string;
  small?: boolean;
}) {
  return (
    <div
      style={{
        padding: 16,
        backgroundColor: C.bgSubtle,
        borderRadius: 8,
        border: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: C.textMuted,
          fontFamily: C.fontMono,
          marginBottom: 8,
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: small ? 14 : 24,
          fontWeight: 700,
          color: small ? C.text : color,
          fontFamily: small ? C.fontSans : C.fontMono,
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function KpiMini({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div
      style={{
        padding: 16,
        backgroundColor: C.bgSubtle,
        borderRadius: 8,
        border: `1px solid ${C.border}`,
        borderLeft: `3px solid ${accent}`,
      }}
    >
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: C.textMuted,
          fontFamily: C.fontMono,
          marginBottom: 8,
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: C.text, fontFamily: C.fontMono }}>
        {value}
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span style={{ color: C.textMuted }}>—</span>;
  const color = score > 70 ? C.success : score >= 40 ? C.warning : C.danger;
  const bg = score > 70 ? C.successBg : score >= 40 ? C.warningBg : C.dangerBg;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 6,
        backgroundColor: bg,
        color,
        fontSize: 12,
        fontWeight: 700,
        fontFamily: C.fontMono,
        minWidth: 40,
        textAlign: "center",
      }}
    >
      {score}
    </span>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 600,
        fontFamily: C.fontMono,
        backgroundColor: active ? C.successBg : C.bgHover,
        color: active ? C.success : C.textMuted,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {active ? "Actif" : "Inactif"}
    </span>
  );
}

function EngagementBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score || 0));
  const color = pct >= 70 ? C.success : pct >= 40 ? C.warning : C.danger;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
      <div
        style={{
          width: 60,
          height: 6,
          borderRadius: 3,
          backgroundColor: C.bgHover,
          overflow: "hidden",
        }}
      >
        <div style={{ width: `${pct}%`, height: "100%", backgroundColor: color }} />
      </div>
      <span
        style={{
          fontFamily: C.fontMono,
          fontSize: 12,
          color: C.text,
          minWidth: 30,
          textAlign: "right",
        }}
      >
        {pct}
      </span>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right" | "center";
}) {
  return (
    <th
      style={{
        padding: "10px 12px",
        textAlign: align,
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: C.textMuted,
        fontFamily: C.fontMono,
        fontWeight: 700,
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
  mono,
}: {
  children: ReactNode;
  align?: "left" | "right" | "center";
  mono?: boolean;
}) {
  return (
    <td
      style={{
        padding: "14px 12px",
        textAlign: align,
        color: C.text,
        fontFamily: mono ? C.fontMono : C.fontSans,
        fontSize: 13,
      }}
    >
      {children}
    </td>
  );
}

// ─── Utilities ──────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
