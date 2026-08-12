"use client";

// ═══════════════════════════════════════════════════════════════
//  AGENCY CLIENT DETAIL — Brick 8
//
//  Three tabs:
//    Branding — edit logoUrl, primaryColor, accentColor, fontFamily,
//               faviconUrl, loginTitle, loginSubtitle, footerText,
//               hideHarchBadge. Live preview panel on the right.
//    Quota    — edit max limits + planTier + monthlyPriceMAD. Current
//               usage bars (read-only).
//    Usage    — table of historical AgencyUsage rows by month.
//
//  Switch button at the top — POST /api/agency/switch → redirect to
//  /atelier/console/brand-monitor.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AtelierNav } from "../../../components/AtelierNav";
import { AtelierFooter } from "../../../components/AtelierFooter";
import { C as TOKENS } from "../../../components/tokens";
import { toast } from "sonner";

const C = {
  ...TOKENS,
  surface: TOKENS.bg,
  surfaceAlt: TOKENS.bgHover,
  borderLight: TOKENS.border,
  textPrimary: TOKENS.text,
  textSecondary: TOKENS.textBody,
  sage: TOKENS.accent,
};

interface InitialClient {
  id: string;
  displayName: string;
  subdomain: string | null;
  customDomain: string | null;
  status: string;
  company: { id: string; name: string; slug: string; sector: string };
}

interface ClientDetail {
  id: string;
  displayName: string;
  subdomain: string | null;
  customDomain: string | null;
  status: string;
  createdAt: string;
  company: { id: string; name: string; slug: string; sector: string; ticker: string | null };
  branding: {
    id: string;
    logoUrl: string | null;
    primaryColor: string | null;
    accentColor: string | null;
    fontFamily: string | null;
    faviconUrl: string | null;
    loginTitle: string | null;
    loginSubtitle: string | null;
    footerText: string | null;
    hideHarchBadge: boolean;
  } | null;
  quota: {
    id: string;
    maxApiRequests: number;
    maxWhatsAppAlerts: number;
    maxKeywords: number;
    maxSources: number;
    maxUsers: number;
    planTier: string;
    monthlyPriceMAD: number;
  } | null;
}

interface UsageStats {
  quota: ClientDetail["quota"];
  currentPeriod: string;
  currentUsage: {
    period: string;
    apiRequests: number;
    whatsappAlerts: number;
    keywordsUsed: number;
    sourcesUsed: number;
    usersActive: number;
  } | null;
  history: Array<{
    period: string;
    apiRequests: number;
    whatsappAlerts: number;
    keywordsUsed: number;
    sourcesUsed: number;
    usersActive: number;
  }>;
  bars: {
    apiRequests: { used: number; max: number; pct: number };
    whatsappAlerts: { used: number; max: number; pct: number };
    keywords: { used: number; max: number; pct: number };
    sources: { used: number; max: number; pct: number };
    users: { used: number; max: number; pct: number };
  };
}

type Tab = "branding" | "quota" | "usage";

interface Props {
  clientId: string;
  initialClient: InitialClient;
}

export function AgencyClientDetail({ clientId, initialClient }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("branding");
  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/agency/clients/${clientId}`, { credentials: "same-origin" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setDetail(data.client);
      setStats(data.stats);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load sub-client");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleSwitch = async () => {
    setSwitching(true);
    try {
      const r = await fetch("/api/agency/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencyClientId: clientId }),
        credentials: "same-origin",
      });
      if (!r.ok) throw new Error("Switch failed");
      toast.success("Workspace switched");
      setTimeout(() => router.push("/atelier/console"), 400);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Switch failed");
      setSwitching(false);
    }
  };

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
          {/* Breadcrumb */}
          <div style={{ marginBottom: 16, fontSize: 13, color: C.textMuted }}>
            <Link href="/atelier/agency" style={{ color: C.textMuted, textDecoration: "none" }}>
              Agency
            </Link>
            <span style={{ margin: "0 6px" }}>/</span>
            <span style={{ color: C.text }}>{initialClient.displayName}</span>
          </div>

          {/* Header */}
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 24,
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                {initialClient.displayName}
              </h1>
              <p style={{ color: C.textBody, marginTop: 4, fontSize: 14 }}>
                {initialClient.company.name} · {initialClient.company.sector}
                {initialClient.subdomain && (
                  <> · <code style={{ fontSize: 12 }}>iq.{initialClient.subdomain}.harchcorp.com</code></>
                )}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleSwitch}
                disabled={switching}
                style={{
                  background: C.cta,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: switching ? "default" : "pointer",
                  fontFamily: C.fontSans,
                  opacity: switching ? 0.7 : 1,
                }}
              >
                {switching ? "Switching…" : "Switch workspace →"}
              </button>
            </div>
          </header>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: 4,
              borderBottom: `1px solid ${C.border}`,
              marginBottom: 24,
            }}
          >
            {(["branding", "quota", "usage"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  background: "transparent",
                  color: tab === t ? C.text : C.textMuted,
                  border: "none",
                  borderBottom: tab === t ? `2px solid ${C.text}` : "2px solid transparent",
                  padding: "10px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: C.fontSans,
                  marginBottom: -1,
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: 48, textAlign: "center", color: C.textMuted }}>
              Loading…
            </div>
          ) : !detail ? (
            <div style={{ padding: 24, color: C.danger }}>
              Failed to load sub-client detail.
            </div>
          ) : (
            <>
              {tab === "branding" && (
                <BrandingTab
                  clientId={clientId}
                  branding={detail.branding}
                  onSaved={fetchDetail}
                  displayName={detail.displayName}
                />
              )}
              {tab === "quota" && (
                <QuotaTab
                  clientId={clientId}
                  quota={detail.quota}
                  stats={stats}
                  onSaved={fetchDetail}
                />
              )}
              {tab === "usage" && <UsageTab stats={stats} />}
            </>
          )}
        </div>
      </main>
      <AtelierFooter />
    </>
  );
}

// ─── Branding tab ───────────────────────────────────────────────────

function BrandingTab({
  clientId,
  branding,
  onSaved,
  displayName,
}: {
  clientId: string;
  branding: ClientDetail["branding"];
  onSaved: () => void;
  displayName: string;
}) {
  const [form, setForm] = useState({
    logoUrl: branding?.logoUrl ?? "",
    primaryColor: branding?.primaryColor ?? "#0A0A0A",
    accentColor: branding?.accentColor ?? "#10b981",
    fontFamily: branding?.fontFamily ?? "'Inter', system-ui, sans-serif",
    faviconUrl: branding?.faviconUrl ?? "",
    loginTitle: branding?.loginTitle ?? "",
    loginSubtitle: branding?.loginSubtitle ?? "",
    footerText: branding?.footerText ?? "",
    hideHarchBadge: branding?.hideHarchBadge ?? false,
  });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch(`/api/agency/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branding: {
            logoUrl: form.logoUrl || null,
            primaryColor: form.primaryColor || null,
            accentColor: form.accentColor || null,
            fontFamily: form.fontFamily || null,
            faviconUrl: form.faviconUrl || null,
            loginTitle: form.loginTitle || null,
            loginSubtitle: form.loginSubtitle || null,
            footerText: form.footerText || null,
            hideHarchBadge: form.hideHarchBadge,
          },
        }),
        credentials: "same-origin",
      });
      if (!r.ok) throw new Error("Save failed");
      toast.success("Branding updated");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      {/* Form */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 20,
        }}
      >
        <Field label="Logo URL">
          <input style={inputStyle} value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} placeholder="https://…" />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Primary color">
            <input type="color" style={{ ...inputStyle, padding: 4, height: 40 }} value={form.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} />
          </Field>
          <Field label="Accent color">
            <input type="color" style={{ ...inputStyle, padding: 4, height: 40 }} value={form.accentColor} onChange={(e) => set("accentColor", e.target.value)} />
          </Field>
        </div>
        <Field label="Font family">
          <input style={inputStyle} value={form.fontFamily} onChange={(e) => set("fontFamily", e.target.value)} />
        </Field>
        <Field label="Favicon URL">
          <input style={inputStyle} value={form.faviconUrl} onChange={(e) => set("faviconUrl", e.target.value)} placeholder="https://…" />
        </Field>
        <Field label="Login title">
          <input style={inputStyle} value={form.loginTitle} onChange={(e) => set("loginTitle", e.target.value)} placeholder="HarchIQ Console" />
        </Field>
        <Field label="Login subtitle">
          <input style={inputStyle} value={form.loginSubtitle} onChange={(e) => set("loginSubtitle", e.target.value)} placeholder="Sign in to your workspace" />
        </Field>
        <Field label="Footer text">
          <input style={inputStyle} value={form.footerText} onChange={(e) => set("footerText", e.target.value)} />
        </Field>
        <Field label="Hide Harch badge">
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.textBody }}>
            <input
              type="checkbox"
              checked={form.hideHarchBadge}
              onChange={(e) => set("hideHarchBadge", e.target.checked)}
            />
            Strip "Powered by Harch" attribution from the white-label console
          </label>
        </Field>
        <button
          onClick={save}
          disabled={saving}
          style={{
            marginTop: 16,
            background: C.cta,
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 600,
            cursor: saving ? "default" : "pointer",
            fontFamily: C.fontSans,
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Saving…" : "Save branding"}
        </button>
      </div>

      {/* Live preview */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 20,
          position: "sticky",
          top: 16,
          height: "fit-content",
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, marginBottom: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Live preview
        </div>
        <div
          style={{
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            overflow: "hidden",
            fontFamily: form.fontFamily,
          }}
        >
          <div
            style={{
              background: form.primaryColor,
              color: "#fff",
              padding: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {form.logoUrl ? (
              <img src={form.logoUrl} alt="" style={{ height: 28, width: "auto" }} />
            ) : (
              <div
                style={{
                  height: 28,
                  width: 28,
                  background: form.accentColor,
                  borderRadius: 6,
                }}
              />
            )}
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {form.loginTitle || "HarchIQ Console"}
            </span>
          </div>
          <div style={{ padding: 24 }}>
            <div style={{ fontSize: 14, color: C.textBody, marginBottom: 8 }}>
              {form.loginSubtitle || "Sign in to your reputation intelligence workspace."}
            </div>
            <div style={{ display: "grid", gap: 8, maxWidth: 280 }}>
              <div style={{ padding: 10, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, color: C.textMuted }}>
                email@{displayName.toLowerCase().replace(/\s+/g, "")}.com
              </div>
              <div style={{ padding: 10, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, color: C.textMuted }}>
                ••••••••
              </div>
              <button
                style={{
                  background: form.accentColor,
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "10px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "default",
                  fontFamily: form.fontFamily,
                }}
              >
                Sign in
              </button>
            </div>
            {!form.hideHarchBadge && (
              <div style={{ marginTop: 16, fontSize: 11, color: C.textMuted }}>
                Powered by <strong>Harch</strong>
              </div>
            )}
            {form.footerText && (
              <div style={{ marginTop: 12, fontSize: 11, color: C.textMuted }}>
                {form.footerText}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quota tab ──────────────────────────────────────────────────────

function QuotaTab({
  clientId,
  quota,
  stats,
  onSaved,
}: {
  clientId: string;
  quota: ClientDetail["quota"];
  stats: UsageStats | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    maxApiRequests: String(quota?.maxApiRequests ?? 10000),
    maxWhatsAppAlerts: String(quota?.maxWhatsAppAlerts ?? 100),
    maxKeywords: String(quota?.maxKeywords ?? 50),
    maxSources: String(quota?.maxSources ?? 30),
    maxUsers: String(quota?.maxUsers ?? 5),
    planTier: quota?.planTier ?? "emergence",
    monthlyPriceMAD: String(quota?.monthlyPriceMAD ?? 15000),
  });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch(`/api/agency/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quota: {
            maxApiRequests: parseInt(form.maxApiRequests, 10) || 0,
            maxWhatsAppAlerts: parseInt(form.maxWhatsAppAlerts, 10) || 0,
            maxKeywords: parseInt(form.maxKeywords, 10) || 0,
            maxSources: parseInt(form.maxSources, 10) || 0,
            maxUsers: parseInt(form.maxUsers, 10) || 0,
            planTier: form.planTier,
            monthlyPriceMAD: parseInt(form.monthlyPriceMAD, 10) || 0,
          },
        }),
        credentials: "same-origin",
      });
      if (!r.ok) throw new Error("Save failed");
      toast.success("Quota updated");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 20,
        }}
      >
        <Field label="Plan tier">
          <select style={inputStyle} value={form.planTier} onChange={(e) => set("planTier", e.target.value)}>
            <option value="emergence">Émergence</option>
            <option value="corporate">Corporate</option>
            <option value="sovereign">Sovereign</option>
          </select>
        </Field>
        <Field label="Monthly price (MAD)">
          <input type="number" style={inputStyle} value={form.monthlyPriceMAD} onChange={(e) => set("monthlyPriceMAD", e.target.value)} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Max API requests / mo">
            <input type="number" style={inputStyle} value={form.maxApiRequests} onChange={(e) => set("maxApiRequests", e.target.value)} />
          </Field>
          <Field label="Max WhatsApp alerts / mo">
            <input type="number" style={inputStyle} value={form.maxWhatsAppAlerts} onChange={(e) => set("maxWhatsAppAlerts", e.target.value)} />
          </Field>
          <Field label="Max keywords">
            <input type="number" style={inputStyle} value={form.maxKeywords} onChange={(e) => set("maxKeywords", e.target.value)} />
          </Field>
          <Field label="Max sources">
            <input type="number" style={inputStyle} value={form.maxSources} onChange={(e) => set("maxSources", e.target.value)} />
          </Field>
          <Field label="Max users (seats)">
            <input type="number" style={inputStyle} value={form.maxUsers} onChange={(e) => set("maxUsers", e.target.value)} />
          </Field>
        </div>
        <button
          onClick={save}
          disabled={saving}
          style={{
            marginTop: 16,
            background: C.cta,
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 600,
            cursor: saving ? "default" : "pointer",
            fontFamily: C.fontSans,
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Saving…" : "Save quota"}
        </button>
      </div>

      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 20,
          height: "fit-content",
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, marginBottom: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Current period usage
        </div>
        {stats ? (
          <div style={{ display: "grid", gap: 12 }}>
            <UsageBar label="API requests" used={stats.bars.apiRequests.used} max={stats.bars.apiRequests.max} pct={stats.bars.apiRequests.pct} />
            <UsageBar label="WhatsApp alerts" used={stats.bars.whatsappAlerts.used} max={stats.bars.whatsappAlerts.max} pct={stats.bars.whatsappAlerts.pct} />
            <UsageBar label="Keywords" used={stats.bars.keywords.used} max={stats.bars.keywords.max} pct={stats.bars.keywords.pct} />
            <UsageBar label="Sources" used={stats.bars.sources.used} max={stats.bars.sources.max} pct={stats.bars.sources.pct} />
            <UsageBar label="Users" used={stats.bars.users.used} max={stats.bars.users.max} pct={stats.bars.users.pct} />
          </div>
        ) : (
          <div style={{ color: C.textMuted, fontSize: 13 }}>No usage data yet.</div>
        )}
      </div>
    </div>
  );
}

// ─── Usage tab ──────────────────────────────────────────────────────

function UsageTab({ stats }: { stats: UsageStats | null }) {
  if (!stats || stats.history.length === 0) {
    return (
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 32,
          textAlign: "center",
          color: C.textMuted,
        }}
      >
        No historical usage data yet. Usage rows are created automatically
        each month as the sub-client consumes resources.
      </div>
    );
  }

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: C.bgHover, borderBottom: `1px solid ${C.border}` }}>
            <Th>Period</Th>
            <Th>API requests</Th>
            <Th>WhatsApp alerts</Th>
            <Th>Keywords</Th>
            <Th>Sources</Th>
            <Th>Users</Th>
          </tr>
        </thead>
        <tbody>
          {stats.history.map((row) => (
            <tr key={row.period} style={{ borderBottom: `1px solid ${C.border}` }}>
              <Td><code style={{ fontFamily: C.fontMono, fontSize: 12 }}>{row.period}</code></Td>
              <Td>{row.apiRequests.toLocaleString()}</Td>
              <Td>{row.whatsappAlerts.toLocaleString()}</Td>
              <Td>{row.keywordsUsed.toLocaleString()}</Td>
              <Td>{row.sourcesUsed.toLocaleString()}</Td>
              <Td>{row.usersActive.toLocaleString()}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "10px 16px",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: C.textMuted,
        fontFamily: C.fontMono,
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: "10px 16px", color: C.textBody }}>{children}</td>;
}

function UsageBar({ label, used, max, pct }: { label: string; used: number; max: number; pct: number }) {
  const color = pct >= 90 ? C.danger : pct >= 75 ? C.warning : C.cta;
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: C.textMuted,
          marginBottom: 4,
          fontFamily: C.fontMono,
        }}
      >
        <span>{label}</span>
        <span>
          {used.toLocaleString()} / {max.toLocaleString()} ({pct}%)
        </span>
      </div>
      <div style={{ height: 6, background: C.bgHover, borderRadius: 3, overflow: "hidden" }}>
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
  children,
}: {
  label: string;
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
    </div>
  );
}
