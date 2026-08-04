"use client";

// ═══════════════════════════════════════════════════════════════
//  AGENCY DASHBOARD — Brick 8 — Tier 4 White-Label Engine
//
//  Master view for an agency admin. Renders:
//    • Header with agency name, commission %, plan-tier summary
//    • Grid of sub-client cards (displayName, company, status,
//      planTier, usage bars for apiRequests / whatsappAlerts)
//    • "Create sub-client" button → modal (company picker + plan tier
//      + subdomain)
//    • Per-card actions: View detail, Switch workspace
//
//  Switching workspace = POST /api/agency/switch → cookie set →
//  redirect to /atelier/console/brand-monitor (which now scopes
//  every query to the active sub-client's companyId via the
//  requireUserCompany() helper — see company-session.ts).
//
//  Founder directive: agencies are "canaux/prescripteurs, pas
//  acheteurs directs" — this dashboard is the reseller control plane,
//  not a customer-facing surface.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { C as TOKENS } from "../components/tokens";
import { toast } from "sonner";

// ─── Local tokens (mirror ConsoleShell) ─────────────────────────────
const C = {
  ...TOKENS,
  surface: TOKENS.bg,
  surfaceAlt: TOKENS.bgHover,
  borderLight: TOKENS.border,
  textPrimary: TOKENS.text,
  textSecondary: TOKENS.textBody,
  sage: TOKENS.accent,
  sageBright: TOKENS.accentBright,
};

interface Agency {
  id: string;
  name: string;
  slug: string;
  commissionPct: number;
  primaryColor: string | null;
  logoUrl: string | null;
  status: string;
}

interface SubClient {
  id: string;
  companyId: string;
  displayName: string;
  subdomain: string | null;
  customDomain: string | null;
  status: string;
  createdAt: string;
  company: { id: string; name: string; slug: string; sector: string };
  branding: {
    logoUrl: string | null;
    primaryColor: string | null;
    hideHarchBadge: boolean;
    loginTitle: string | null;
  } | null;
  quota: {
    planTier: string;
    monthlyPriceMAD: number;
    maxApiRequests: number;
    maxWhatsAppAlerts: number;
    maxKeywords: number;
    maxSources: number;
    maxUsers: number;
  } | null;
  usage: {
    period: string;
    apiRequests: number;
    whatsappAlerts: number;
    keywordsUsed: number;
    sourcesUsed: number;
    usersActive: number;
  };
  bars: {
    apiRequests: { used: number; max: number; pct: number };
    whatsappAlerts: { used: number; max: number; pct: number };
    keywords: { used: number; max: number; pct: number };
    sources: { used: number; max: number; pct: number };
    users: { used: number; max: number; pct: number };
  } | null;
}

interface CompanyOption {
  id: string;
  name: string;
  slug: string;
  sector: string;
}

interface Props {
  agency: Agency;
  userName: string;
  activeAgencyClientId: string | null;
}

// ─── Component ──────────────────────────────────────────────────────

export function AgencyDashboard({ agency, userName, activeAgencyClientId }: Props) {
  const router = useRouter();
  const [clients, setClients] = useState<SubClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showWhatsAppImport, setShowWhatsAppImport] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/agency/clients", { credentials: "same-origin" });
      if (!r.ok) {
        const j = await r.json().catch(() => ({ error: "Failed to load clients" }));
        throw new Error(j.error ?? `HTTP ${r.status}`);
      }
      const data = await r.json();
      setClients(data.clients ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSwitch = async (clientId: string, displayName: string) => {
    setSwitching(clientId);
    try {
      const r = await fetch("/api/agency/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencyClientId: clientId }),
        credentials: "same-origin",
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({ error: "Switch failed" }));
        throw new Error(j.error ?? `HTTP ${r.status}`);
      }
      toast.success(`Switched to ${displayName} workspace`);
      // Give the cookie a beat to settle, then redirect to the console
      // (now scoped to that sub-client's companyId via app-level RLS).
      setTimeout(() => router.push("/atelier/console/brand-monitor"), 400);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Switch failed");
      setSwitching(null);
    }
  };

  const totalMonthlyRevenue = clients.reduce(
    (sum, c) => sum + (c.quota?.monthlyPriceMAD ?? 0),
    0,
  );
  const agencyCommission = Math.round((totalMonthlyRevenue * agency.commissionPct) / 100);

  return (
    <>
      <AtelierNav />
      <main
        style={{
          minHeight: "calc(100vh - 64px)",
          background: C.bgSubtle,
          padding: "32px 16px",
          fontFamily: C.fontSans,
          color: C.text,
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {/* ─── Header ─────────────────────────────────────────── */}
          <header style={{ marginBottom: 32 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: C.textMuted,
                  fontFamily: C.fontMono,
                }}
              >
                AGENCY MASTER · {agency.slug.toUpperCase()}
              </span>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: C.successBg,
                  color: C.success,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {agency.status}
              </span>
            </div>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                margin: 0,
                color: C.text,
              }}
            >
              {agency.name}
              <span style={{ color: C.textMuted, fontWeight: 400, marginLeft: 8 }}>
                white-label control plane
              </span>
            </h1>
            <p style={{ color: C.textBody, marginTop: 8, fontSize: 15 }}>
              Welcome back, {userName}. Manage your sub-clients, branding, and quotas
              from here.
            </p>
          </header>

          {/* ─── KPI strip ──────────────────────────────────────── */}
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
              gap: 16,
              marginBottom: 32,
            }}
          >
            <KpiCard
              label="Active sub-clients"
              value={String(clients.filter((c) => c.status === "active").length)}
              sub={`${clients.length} total`}
            />
            <KpiCard
              label="Monthly revenue"
              value={`${totalMonthlyRevenue.toLocaleString()} MAD`}
              sub="across all sub-clients"
            />
            <KpiCard
              label="Your commission"
              value={`${agencyCommission.toLocaleString()} MAD`}
              sub={`${agency.commissionPct}% of revenue`}
              accent
            />
            <KpiCard
              label="Active workspace"
              value={
                activeAgencyClientId
                  ? clients.find((c) => c.id === activeAgencyClientId)?.displayName ?? "—"
                  : "Master view"
              }
              sub={
                activeAgencyClientId
                  ? "Switched into sub-client"
                  : "Not switched into any sub-client"
              }
            />
          </section>

          {/* ─── Toolbar ────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              Sub-clients ({clients.length})
            </h2>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setShowWhatsAppImport(true)}
                style={{
                  background: C.surface,
                  color: C.text,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "10px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: C.fontSans,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                💬 WhatsApp Import
              </button>
              <button
                onClick={() => setShowCreate(true)}
                style={{
                  background: C.cta,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: C.fontSans,
                }}
            >
              + Create sub-client
            </button>
          </div>

          {/* ─── Sub-client grid ────────────────────────────────── */}
          {loading ? (
            <div style={{ padding: 48, textAlign: "center", color: C.textMuted }}>
              Loading sub-clients…
            </div>
          ) : error ? (
            <div
              style={{
                padding: 24,
                background: C.dangerBg,
                color: C.danger,
                borderRadius: 8,
                border: `1px solid ${C.danger}40`,
              }}
            >
              {error}
            </div>
          ) : clients.length === 0 ? (
            <div
              style={{
                padding: 48,
                textAlign: "center",
                color: C.textMuted,
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 500, color: C.text, marginBottom: 4 }}>
                No sub-clients yet
              </div>
              <div style={{ fontSize: 14 }}>
                Click <strong>Create sub-client</strong> to onboard your first reseller customer.
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 360px), 1fr))",
                gap: 16,
              }}
            >
              {clients.map((c) => (
                <SubClientCard
                  key={c.id}
                  client={c}
                  isActive={c.id === activeAgencyClientId}
                  switching={switching === c.id}
                  onView={() => router.push(`/atelier/agency/clients/${c.id}`)}
                  onSwitch={() => handleSwitch(c.id, c.displayName)}
                />
              ))}
            </div>
          )}
        </div>
        </div>
      </main>
      <AtelierFooter />

      {showCreate && (
        <CreateClientModal
          agencyId={agency.id}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchClients();
          }}
        />
      )}

      {showWhatsAppImport && (
        <WhatsAppImportModal
          onClose={() => setShowWhatsAppImport(false)}
          onCreated={() => {
            setShowWhatsAppImport(false);
            fetchClients();
          }}
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  WHATSAPP IMPORT MODAL — Agency self-service onboarding
//
//  The killer B2B2B feature: agency pastes a WhatsApp conversation
//  with their client prospect → GLM-4 extracts structured data →
//  agency reviews → one click creates the sub-client workspace.
// ═══════════════════════════════════════════════════════════════

function WhatsAppImportModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [conversation, setConversation] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState<Record<string, unknown> | null>(null);
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const analyze = async () => {
    if (conversation.trim().length < 10) return;
    setLoading(true);
    setExtracted(null);
    try {
      const res = await fetch("/api/agency/whatsapp-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else if (data.extracted) {
        setExtracted(data.extracted);
      }
    } catch (e) {
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/agency/whatsapp-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation, createAccount: true }),
      });
      const data = await res.json();
      if (data.created) {
        toast.success(data.message || "Sub-client created successfully");
        setResult(data.message);
        setTimeout(() => onCreated(), 2000);
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error("Account creation failed");
    } finally {
      setCreating(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    fontSize: 14,
    fontFamily: C.fontSans,
    background: C.surface,
    color: C.text,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: C.surface,
          borderRadius: 16,
          maxWidth: 680,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          padding: 32,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>💬</span>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: C.text }}>
              WhatsApp Import → AI Account Creation
            </h2>
          </div>
          <p style={{ fontSize: 13, color: C.textBody, margin: 0, lineHeight: 1.5 }}>
            Paste a WhatsApp conversation with your client prospect. GLM-4 will extract the company name,
            contact, plan, pricing, and topics — then create the sub-client workspace automatically.
          </p>
        </div>

        {!extracted && !result && (
          <>
            <textarea
              value={conversation}
              onChange={(e) => setConversation(e.target.value)}
              placeholder="Paste the WhatsApp conversation here…&#10;&#10;Example:&#10;[10:14] Salma: Bonjour, on cherche un outil de veille pour Attijariwafa&#10;[10:15] Omocto: Parfait, on a Harch Atelier. Plan Corporate à 40K MAD/mois?&#10;[10:16] Salma: Oui, on veut suivre 'frais bancaires', 'service client', 'digitalisation'&#10;[10:17] Salma: Nos concurrents: BCP, Bank of Africa, CIH&#10;[10:18] Omocto: Je vous crée le compte tout de suite. Email?"
              style={{
                ...inputStyle,
                minHeight: 200,
                fontFamily: C.fontMono,
                fontSize: 12,
                resize: "vertical",
                lineHeight: 1.5,
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ padding: "10px 16px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, cursor: "pointer", fontFamily: C.fontSans, color: C.textBody }}>
                Cancel
              </button>
              <button
                onClick={analyze}
                disabled={loading || conversation.trim().length < 10}
                style={{
                  padding: "10px 20px",
                  background: loading ? C.border : C.cta,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: C.fontSans,
                }}
              >
                {loading ? "Analyzing with GLM-4…" : "✨ Analyze with AI"}
              </button>
            </div>
          </>
        )}

        {extracted && !result && (
          <div>
            <div style={{ padding: 12, background: C.successBg, borderRadius: 8, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: C.success, fontSize: 16 }}>✓</span>
              <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>AI extraction complete — review the data below</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Company</label>
                <input value={String(extracted.company_name || "")} readOnly style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Contact</label>
                <input value={String(extracted.contact_name || "")} readOnly style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Email</label>
                <input value={String(extracted.email || "")} readOnly style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Phone</label>
                <input value={String(extracted.phone || "")} readOnly style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Plan</label>
                <input value={String(extracted.plan_tier || "emergence")} readOnly style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 4 }}>Pricing (MAD/mo)</label>
                <input value={String(extracted.pricing_mad || "")} readOnly style={inputStyle} />
              </div>
            </div>

            {Array.isArray(extracted.topics) && extracted.topics.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, marginBottom: 4, display: "block" }}>Topics to monitor</label>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {extracted.topics.map((t: string, i: number) => (
                    <span key={i} style={{ padding: "3px 8px", background: C.bgHover, borderRadius: 4, fontSize: 11, fontFamily: C.fontMono, color: C.textBody }}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(extracted.competitors) && extracted.competitors.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, marginBottom: 4, display: "block" }}>Competitors to track</label>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {extracted.competitors.map((c: string, i: number) => (
                    <span key={i} style={{ padding: "3px 8px", background: C.bgHover, borderRadius: 4, fontSize: 11, fontFamily: C.fontMono, color: C.textBody }}>{c}</span>
                  ))}
                </div>
              </div>
            )}

            {Boolean(extracted.use_case) && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, marginBottom: 4, display: "block" }}>Use case</label>
                <p style={{ fontSize: 13, color: C.textBody, margin: 0, padding: 10, background: C.bgHover, borderRadius: 8 }}>{String(extracted.use_case)}</p>
              </div>
            )}

            {Boolean(extracted.notes) && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, marginBottom: 4, display: "block" }}>Notes</label>
                <p style={{ fontSize: 12, color: C.textMuted, margin: 0, padding: 10, background: C.bgHover, borderRadius: 8, fontStyle: "italic" }}>{String(extracted.notes)}</p>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setExtracted(null)} style={{ padding: "10px 16px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, cursor: "pointer", fontFamily: C.fontSans, color: C.textBody }}>
                ← Re-analyze
              </button>
              <button
                onClick={createAccount}
                disabled={creating}
                style={{
                  padding: "10px 20px",
                  background: creating ? C.border : C.cta,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: creating ? "not-allowed" : "pointer",
                  fontFamily: C.fontSans,
                }}
              >
                {creating ? "Creating sub-client…" : "✓ Create Sub-Client"}
              </button>
            </div>
          </div>
        )}

        {result && (
          <div style={{ textAlign: "center", padding: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <p style={{ fontSize: 15, color: C.text, fontWeight: 600, margin: "0 0 8px" }}>{result}</p>
            <p style={{ fontSize: 13, color: C.textMuted }}>Redirecting to dashboard…</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── KPI Card ───────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: accent ? C.text : C.surface,
        color: accent ? "#fff" : C.text,
        borderRadius: 12,
        padding: "16px 20px",
        border: `1px solid ${accent ? C.text : C.border}`,
        boxShadow: C.shadowSm,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: accent ? "rgba(255,255,255,0.7)" : C.textMuted,
          marginBottom: 6,
          fontFamily: C.fontMono,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          marginBottom: 4,
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontSize: 12,
            color: accent ? "rgba(255,255,255,0.6)" : C.textMuted,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── Sub-client card ────────────────────────────────────────────────

function SubClientCard({
  client,
  isActive,
  switching,
  onView,
  onSwitch,
}: {
  client: SubClient;
  isActive: boolean;
  switching: boolean;
  onView: () => void;
  onSwitch: () => void;
}) {
  const brand = client.branding;
  const q = client.quota;
  const bars = client.bars;
  const brandColor = brand?.primaryColor ?? client.company?.sector ? C.text : C.text;

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${isActive ? C.cta : C.border}`,
        borderRadius: 12,
        padding: 20,
        boxShadow: C.shadowSm,
        position: "relative",
      }}
    >
      {isActive && (
        <div
          style={{
            position: "absolute",
            top: -8,
            right: 16,
            background: C.cta,
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "2px 8px",
            borderRadius: 4,
          }}
        >
          Active workspace
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: brand?.primaryColor ?? brandColor,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            {client.displayName}
          </span>
        </div>
        <div style={{ fontSize: 13, color: C.textMuted }}>
          {client.company.name} · {client.company.sector}
        </div>
        <div
          style={{
            marginTop: 8,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <Tag>{q?.planTier ?? "no-plan"}</Tag>
          {client.subdomain && <Tag>iq.{client.subdomain}.harchcorp.com</Tag>}
          {client.customDomain && <Tag>{client.customDomain}</Tag>}
          <Tag>{q ? `${q.monthlyPriceMAD.toLocaleString()} MAD/mo` : "no-price"}</Tag>
          <Tag status={client.status}>{client.status}</Tag>
        </div>
      </div>

      {/* Usage bars */}
      {bars && (
        <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
          <UsageBar label="API requests" used={bars.apiRequests.used} max={bars.apiRequests.max} pct={bars.apiRequests.pct} />
          <UsageBar label="WhatsApp alerts" used={bars.whatsappAlerts.used} max={bars.whatsappAlerts.max} pct={bars.whatsappAlerts.pct} />
          <UsageBar label="Keywords" used={bars.keywords.used} max={bars.keywords.max} pct={bars.keywords.pct} />
          <UsageBar label="Sources" used={bars.sources.used} max={bars.sources.max} pct={bars.sources.pct} />
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onView}
          style={{
            flex: 1,
            background: "transparent",
            color: C.text,
            border: `1px solid ${C.borderStrong}`,
            borderRadius: 6,
            padding: "8px 12px",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: C.fontSans,
          }}
        >
          Configure
        </button>
        <button
          onClick={onSwitch}
          disabled={switching || isActive}
          style={{
            flex: 1,
            background: isActive ? C.bgHover : C.cta,
            color: isActive ? C.textMuted : "#fff",
            border: "none",
            borderRadius: 6,
            padding: "8px 12px",
            fontSize: 13,
            fontWeight: 600,
            cursor: switching || isActive ? "default" : "pointer",
            fontFamily: C.fontSans,
            opacity: switching ? 0.7 : 1,
          }}
        >
          {switching ? "Switching…" : isActive ? "In workspace" : "Switch workspace"}
        </button>
      </div>
    </div>
  );
}

function UsageBar({ label, used, max, pct }: { label: string; used: number; max: number; pct: number }) {
  const color =
    pct >= 90 ? C.danger : pct >= 75 ? C.warning : C.cta;
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: C.textMuted,
          marginBottom: 2,
          fontFamily: C.fontMono,
        }}
      >
        <span>{label}</span>
        <span>
          {used.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <div
        style={{
          height: 4,
          background: C.bgHover,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.min(100, pct)}%`,
            height: "100%",
            background: color,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

function Tag({ children, status }: { children: React.ReactNode; status?: string }) {
  const color =
    status === "active" ? C.cta :
    status === "suspended" ? C.warning :
    status === "terminated" ? C.danger :
    C.textMuted;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 6px",
        borderRadius: 4,
        background: status ? `${color}15` : C.bgHover,
        color: status ? color : C.textBody,
        fontFamily: C.fontMono,
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </span>
  );
}

// ─── Create modal ───────────────────────────────────────────────────

function CreateClientModal({
  agencyId,
  onClose,
  onCreated,
}: {
  agencyId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [companyId, setCompanyId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [planTier, setPlanTier] = useState<"emergence" | "corporate" | "sovereign">("corporate");

  useEffect(() => {
    fetch("/api/companies", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : { companies: [] }))
      .then((data) => {
        const list: CompanyOption[] = data.companies ?? data ?? [];
        setCompanies(list);
        if (list.length > 0) setCompanyId(list[0].id);
      })
      .catch(() => setCompanies([]))
      .finally(() => setLoadingCompanies(false));
  }, []);

  const handleSubmit = async () => {
    if (!companyId) {
      toast.error("Select a company first");
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/agency/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          displayName: displayName.trim() || undefined,
          subdomain: subdomain.trim() || undefined,
          planTier,
        }),
        credentials: "same-origin",
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({ error: "Create failed" }));
        throw new Error(j.error ?? `HTTP ${r.status}`);
      }
      toast.success("Sub-client created");
      onCreated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Create failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,10,10,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.surface,
          borderRadius: 12,
          padding: 24,
          maxWidth: 480,
          width: "100%",
          boxShadow: C.shadowMd,
          border: `1px solid ${C.border}`,
        }}
      >
        <h3 style={{ margin: 0, marginBottom: 16, fontSize: 18, fontWeight: 600 }}>
          Create sub-client
        </h3>

        <Field label="Company">
          {loadingCompanies ? (
            <div style={{ color: C.textMuted, fontSize: 13 }}>Loading companies…</div>
          ) : companies.length === 0 ? (
            <div style={{ color: C.danger, fontSize: 13 }}>
              No companies available. Seed companies first.
            </div>
          ) : (
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              style={inputStyle}
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.sector})
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field label="Display name (optional)" hint="Defaults to the company name">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Attijariwafa Bank — RP Team"
            style={inputStyle}
          />
        </Field>

        <Field label="Subdomain (optional)" hint="White-label URL: iq.{sub}.harchcorp.com">
          <input
            type="text"
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            placeholder="e.g. attijari"
            style={inputStyle}
          />
        </Field>

        <Field label="Plan tier">
          <select
            value={planTier}
            onChange={(e) => setPlanTier(e.target.value as any)}
            style={inputStyle}
          >
            <option value="emergence">Émergence — 15K MAD/mo</option>
            <option value="corporate">Corporate — 40K MAD/mo</option>
            <option value="sovereign">Sovereign — 75K MAD/mo</option>
          </select>
        </Field>

        <div style={{ display: "flex", gap: 8, marginTop: 24, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              color: C.text,
              border: `1px solid ${C.borderStrong}`,
              borderRadius: 6,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: C.fontSans,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !companyId}
            style={{
              background: C.cta,
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: submitting ? "default" : "pointer",
              fontFamily: C.fontSans,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Creating…" : "Create sub-client"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  fontSize: 14,
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  background: C.surface,
  color: C.text,
  fontFamily: C.fontSans,
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          color: C.textBody,
          marginBottom: 4,
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{hint}</div>
      )}
    </div>
  );
}
