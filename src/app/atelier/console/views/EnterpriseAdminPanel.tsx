"use client";

import { useState, useEffect, useCallback } from "react";
import { C } from "../../components/tokens";
import { ApiKeysPanel } from "./ApiKeysPanel";
import { WebhooksPanel } from "./WebhooksPanel";

// ═══════════════════════════════════════════════════════════════
//  ENTERPRISE ADMIN PANEL
//  Task: company-dedup-enterprise-admin
//
//  Self-service panel for the `company-admin` role. Lets a team
//  admin invite coworkers, manage their team, configure their
//  company's monitoring settings, and manage subsidiaries — all
//  scoped to THEIR OWN company.
//
//  Tabs:
//    • Team        — list users + invite form + suspend / role change
//    • Company     — editable company info (name, ICE, RC, website)
//    • Settings    — alert thresholds, topics, competitors, sources
//    • Hierarchy   — parent + subsidiaries, link/unlink
//
//  APIs consumed (all scoped to the caller's companyId by the
//  `requireCompanyAdmin()` helper on the server):
//    GET    /api/company/team
//    PATCH  /api/company/team
//    DELETE /api/company/team?userId=XXX
//    POST   /api/company/invite
//    GET    /api/company/invite
//    GET    /api/company/settings
//    PATCH  /api/company/settings
//    POST   /api/company/subsidiary
//    DELETE /api/company/subsidiary?subsidiaryId=XXX
//    PATCH  /api/company/subsidiary
// ═══════════════════════════════════════════════════════════════

interface CompanyInfo {
  id: string;
  name: string;
  slug: string;
  sector: string;
  website: string | null;
  headquarters: string | null;
  iceNumber: string | null;
  rcNumber: string | null;
  foundedYear: number | null;
  description: string | null;
  parentId: string | null;
  parent: {
    id: string;
    name: string;
    slug: string;
    iceNumber: string | null;
    sector: string;
  } | null;
  subsidiaries: Array<{
    id: string;
    name: string;
    slug: string;
    iceNumber: string | null;
    sector: string;
    createdAt: string;
  }>;
}

interface SettingsInfo {
  topics: string[];
  competitors: string[];
  monitoredSources: string[];
  alertThresholds: {
    sentimentDrop: number;
    riskLevel: string;
    minMentions: number;
    [k: string]: unknown;
  };
}

interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  role: string;
  accountType: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  whatsappAlerts: boolean;
  whatsappNumber: string | null;
}

interface InvitationInfo {
  id: string;
  token: string;
  email: string;
  name: string;
  accountType: string;
  role: string;
  message: string | null;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  acceptedById: string | null;
}

type Tab = "team" | "company" | "settings" | "hierarchy" | "api-keys" | "webhooks";

const TYPE_LABELS: Record<string, string> = {
  "brand-monitor": "Brand Monitor",
  "market-competitor": "Market & Competitor",
  "investment-bank": "Investment Bank",
  "harch-alpha": "Harch Alpha",
};

const ROLE_LABELS: Record<string, string> = {
  user: "User",
  admin: "Super-Admin",
  "company-admin": "Team Admin",
};

export function EnterpriseAdminPanel() {
  const [tab, setTab] = useState<Tab>("team");
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [settings, setSettings] = useState<SettingsInfo | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<InvitationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsRes, teamRes, invitesRes] = await Promise.all([
        fetch("/api/company/settings", { cache: "no-store" }),
        fetch("/api/company/team", { cache: "no-store" }),
        fetch("/api/company/invite", { cache: "no-store" }),
      ]);

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setCompany(data.company);
        setSettings(data.settings);
      } else if (settingsRes.status === 401 || settingsRes.status === 403) {
        const data = await settingsRes.json().catch(() => ({}));
        setError(data.error || "Access denied");
      }

      if (teamRes.ok) {
        const data = await teamRes.json();
        setTeam(data.users || []);
      }

      if (invitesRes.ok) {
        const data = await invitesRes.json();
        setInvitations(data.invitations || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ─── Top bar ──────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: C.fontSans,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <header
        style={{
          borderBottom: `1px solid ${C.border}`,
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span
            style={{
              fontFamily: C.fontMono,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              color: C.text,
              textTransform: "uppercase",
            }}
          >
            HarchIQ
            <span style={{ color: C.accent, marginLeft: "8px" }}>
              Sovereign
            </span>
          </span>
          <span
            style={{
              fontSize: "12px",
              color: C.textMuted,
              fontFamily: C.fontMono,
            }}
          >
            {company ? company.name : "Loading..."}
          </span>
          <a
            href="/atelier/console"
            style={{
              fontSize: "12px",
              color: C.textMuted,
              fontFamily: C.fontMono,
              textDecoration: "none",
            }}
          >
            Back to Console
          </a>
        </div>
        <button
          onClick={() => {
            if (confirm("Sign out?"))
              window.location.href = "/api/auth/signout";
          }}
          style={{
            padding: "8px 14px",
            background: "transparent",
            border: `1px solid ${C.border}`,
            color: C.textBody,
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </header>

      {error && (
        <div
          style={{
            margin: "16px 24px 0",
            padding: "12px 14px",
            background: C.dangerBg,
            border: `1px solid ${C.danger}30`,
            borderRadius: "4px",
            fontSize: "13px",
            color: C.danger,
          }}
        >
          {error}
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0",
          borderBottom: `1px solid ${C.border}`,
          padding: "0 24px",
        }}
      >
        {(
          [
            { id: "team", label: `Team (${team.length})` },
            { id: "company", label: "Company" },
            { id: "settings", label: "Settings" },
            { id: "hierarchy", label: "Hierarchy" },
            { id: "api-keys", label: "API Keys" },
            { id: "webhooks", label: "Webhooks" },
          ] as Array<{ id: Tab; label: string }>
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={tabStyle(tab === t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main
        style={{
          padding: "32px 24px",
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto",
          flex: 1,
        }}
      >
        {loading ? (
          <div
            style={{
              color: C.textMuted,
              fontFamily: C.fontMono,
              fontSize: "13px",
            }}
          >
            Loading...
          </div>
        ) : tab === "team" ? (
          <TeamTab
            team={team}
            invitations={invitations}
            companyId={company?.id}
            onChanged={fetchAll}
          />
        ) : tab === "company" ? (
          <CompanyTab company={company} onChanged={fetchAll} />
        ) : tab === "settings" ? (
          <SettingsTab
            settings={settings}
            companyId={company?.id}
            onChanged={fetchAll}
          />
        ) : tab === "hierarchy" ? (
          <HierarchyTab company={company} onChanged={fetchAll} />
        ) : tab === "api-keys" ? (
          <ApiKeysPanel />
        ) : (
          <WebhooksPanel />
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB: TEAM — invite + manage members
// ═══════════════════════════════════════════════════════════════

function TeamTab({
  team,
  invitations,
  companyId,
  onChanged,
}: {
  team: TeamMember[];
  invitations: InvitationInfo[];
  companyId?: string;
  onChanged: () => void;
}) {
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div>
      <SectionHeader
        eyebrow="Team Members"
        title={`${team.length} ${team.length === 1 ? "member" : "members"}`}
        action={
          <button
            onClick={() => setShowInvite(true)}
            style={primaryButtonStyle}
          >
            + Invite teammate
          </button>
        }
      />

      {/* Active members */}
      <div
        style={{
          border: `1px solid ${C.border}`,
          borderRadius: "6px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(180px, 2fr) minmax(180px, 1.5fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(140px, 1fr)",
            gap: "1px",
            background: C.border,
            fontFamily: C.fontMono,
            fontSize: "9px",
            color: C.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 700,
          }}
        >
          <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>
            Member
          </div>
          <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>
            Email
          </div>
          <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>
            Role
          </div>
          <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>
            Account type
          </div>
          <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>
            Status
          </div>
          <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>
            Last login
          </div>
        </div>
        {team.length === 0 ? (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              color: C.textMuted,
              fontFamily: C.fontMono,
              fontSize: "12px",
            }}
          >
            No team members yet. Invite your first teammate.
          </div>
        ) : (
          team.map((m) => (
            <TeamRow key={m.id} member={m} onChanged={onChanged} />
          ))
        )}
      </div>

      {/* Pending invitations */}
      {invitations.filter((i) => !i.usedAt).length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <SectionHeader
            eyebrow="Pending invitations"
            title={`${invitations.filter((i) => !i.usedAt).length} pending`}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {invitations
              .filter((i) => !i.usedAt)
              .map((inv) => (
                <InvitationRow key={inv.id} inv={inv} />
              ))}
          </div>
        </div>
      )}

      {showInvite && companyId && (
        <InviteModal
          companyId={companyId}
          onClose={() => setShowInvite(false)}
          onCreated={() => {
            setShowInvite(false);
            onChanged();
          }}
        />
      )}
    </div>
  );
}

function TeamRow({
  member,
  onChanged,
}: {
  member: TeamMember;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const handleUpdate = async (
    patch: Partial<Pick<TeamMember, "role" | "accountType" | "status">>,
  ) => {
    setBusy(true);
    try {
      const res = await fetch("/api/company/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: member.id, ...patch }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Update failed");
      } else {
        onChanged();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Network error");
    }
    setBusy(false);
  };

  const handleSuspend = async () => {
    if (member.status === "suspended") {
      if (!confirm("Reactivate this user?")) return;
      await handleUpdate({ status: "active" });
    } else {
      if (
        !confirm(
          `Suspend ${member.name || member.email}? They will not be able to sign in.`,
        )
      )
        return;
      try {
        setBusy(true);
        const res = await fetch(
          `/api/company/team?userId=${member.id}`,
          { method: "DELETE" },
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          alert(data.error || "Suspend failed");
        } else {
          onChanged();
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : "Network error");
      }
      setBusy(false);
    }
  };

  const isSuspended = member.status === "suspended";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "minmax(180px, 2fr) minmax(180px, 1.5fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(140px, 1fr)",
        gap: "1px",
        background: C.border,
        fontFamily: C.fontSans,
        fontSize: "12px",
        color: C.text,
      }}
    >
      <div style={{ background: C.bg, padding: "12px 14px", fontWeight: 600 }}>
        {member.name || "—"}
      </div>
      <div
        style={{
          background: C.bg,
          padding: "12px 14px",
          fontFamily: C.fontMono,
          fontSize: "11px",
          color: C.textMuted,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {member.email}
      </div>
      <div style={{ background: C.bg, padding: "12px 14px" }}>
        <select
          value={member.role}
          disabled={busy}
          onChange={(e) => handleUpdate({ role: e.target.value })}
          style={selectStyle}
        >
          <option value="user">User</option>
          <option value="company-admin">Team Admin</option>
        </select>
      </div>
      <div style={{ background: C.bg, padding: "12px 14px" }}>
        <select
          value={member.accountType}
          disabled={busy}
          onChange={(e) => handleUpdate({ accountType: e.target.value })}
          style={selectStyle}
        >
          <option value="brand-monitor">Brand Monitor</option>
          <option value="market-competitor">Market &amp; Competitor</option>
          <option value="investment-bank">Investment Bank</option>
          <option value="harch-alpha">Harch Alpha</option>
        </select>
      </div>
      <div style={{ background: C.bg, padding: "12px 14px" }}>
        <span
          style={{
            fontSize: "10px",
            fontFamily: C.fontMono,
            padding: "2px 8px",
            borderRadius: "2px",
            background: isSuspended ? `${C.danger}15` : `${C.cta}15`,
            color: isSuspended ? C.danger : C.cta,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 700,
          }}
        >
          {isSuspended ? "Suspended" : "Active"}
        </span>
      </div>
      <div
        style={{
          background: C.bg,
          padding: "12px 14px",
          fontFamily: C.fontMono,
          fontSize: "10px",
          color: C.textMuted,
        }}
      >
        {member.lastLoginAt
          ? new Date(member.lastLoginAt).toLocaleDateString("en-US")
          : "Never"}
        <button
          onClick={handleSuspend}
          disabled={busy}
          style={{
            display: "block",
            marginTop: "4px",
            padding: "2px 6px",
            background: "transparent",
            border: `1px solid ${isSuspended ? C.cta : C.danger}40`,
            color: isSuspended ? C.cta : C.danger,
            borderRadius: "2px",
            fontSize: "9px",
            fontFamily: C.fontMono,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            cursor: busy ? "not-allowed" : "pointer",
          }}
        >
          {isSuspended ? "Reactivate" : "Suspend"}
        </button>
      </div>
    </div>
  );
}

function InvitationRow({ inv }: { inv: InvitationInfo }) {
  const [copied, setCopied] = useState(false);
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://atelier.harchcorp.com";
  const url = `${baseUrl}/atelier/access?token=${inv.token}`;
  const isExpired = new Date(inv.expiresAt) < new Date();

  return (
    <div
      style={{
        padding: "12px 16px",
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: "6px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "8px",
      }}
    >
      <div>
        <div style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>
          {inv.name}
        </div>
        <div
          style={{
            fontSize: "11px",
            color: C.textMuted,
            fontFamily: C.fontMono,
          }}
        >
          {inv.email} · {TYPE_LABELS[inv.accountType] || inv.accountType} ·{" "}
          {ROLE_LABELS[inv.role] || inv.role}
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <span
          style={{
            fontSize: "10px",
            fontFamily: C.fontMono,
            padding: "3px 8px",
            borderRadius: "2px",
            background: isExpired ? `${C.danger}15` : `${C.warning}15`,
            color: isExpired ? C.danger : C.warning,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {isExpired ? "Expired" : "Pending"}
        </span>
        {!isExpired && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            style={{
              padding: "6px 12px",
              background: C.text,
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        )}
      </div>
    </div>
  );
}

function InviteModal({
  companyId,
  onClose,
  onCreated,
}: {
  companyId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState("brand-monitor");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [created, setCreated] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    setErr(null);
    if (!email.trim() || !name.trim()) {
      setErr("Email and name are required.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/company/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          accountType,
          role,
          message: message.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.invitation) {
        setCreated({
          url: data.invitation.url,
          name: data.invitation.name,
        });
      } else {
        setErr(data.error || "Failed to create invitation");
      }
    } catch {
      setErr("Network error");
    }
    setCreating(false);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: "8px",
          padding: "32px",
          maxWidth: "560px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {!created ? (
          <>
            <div style={eyebrowStyle}>Invite teammate</div>
            <h2 style={modalTitleStyle}>Add a member to your team</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <Field label="Email *">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@yourcompany.com"
                  style={inputStyle}
                />
              </Field>
              <Field label="Full name *">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  style={inputStyle}
                />
              </Field>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <Field label="Account type">
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    <option value="brand-monitor">Brand Monitor</option>
                    <option value="market-competitor">
                      Market &amp; Competitor
                    </option>
                    <option value="investment-bank">Investment Bank</option>
                    <option value="harch-alpha">Harch Alpha</option>
                  </select>
                </Field>
                <Field label="Role">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    <option value="user">User</option>
                    <option value="company-admin">Team Admin</option>
                  </select>
                </Field>
              </div>
              <Field label="Personal message (optional)">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Welcome to our team..."
                  rows={2}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </Field>
              {err && (
                <div
                  style={{
                    padding: "12px 14px",
                    background: C.dangerBg,
                    border: `1px solid ${C.danger}30`,
                    borderRadius: "4px",
                    fontSize: "13px",
                    color: C.danger,
                  }}
                >
                  {err}
                </div>
              )}
              <div style={noteStyle}>
                The new user will be automatically attached to your company (
                <strong>{companyId.slice(-8)}</strong>) when they activate
                their account.
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  justifyContent: "flex-end",
                }}
              >
                <button onClick={onClose} style={secondaryButtonStyle}>
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  style={primaryButtonStyle}
                >
                  {creating ? "Creating..." : "Create invitation"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                ...eyebrowStyle,
                color: C.cta,
              }}
            >
              Invitation created
            </div>
            <h2 style={modalTitleStyle}>Send this link to {created.name}</h2>
            <p
              style={{
                fontSize: "13px",
                color: C.textBody,
                marginBottom: "24px",
                lineHeight: 1.5,
              }}
            >
              The user will open this link, see their account info, and create
              their own password. No temporary password needed.
            </p>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Access link</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  readOnly
                  value={created.url}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: `1px solid ${C.border}`,
                    borderRadius: "4px",
                    fontFamily: C.fontMono,
                    fontSize: "12px",
                    color: C.text,
                    background: C.bgSubtle,
                  }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(created.url);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{
                    padding: "10px 14px",
                    background: C.text,
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <button onClick={onCreated} style={primaryButtonStyle}>
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB: COMPANY — editable company info
// ═══════════════════════════════════════════════════════════════

function CompanyTab({
  company,
  onChanged,
}: {
  company: CompanyInfo | null;
  onChanged: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    sector: "",
    iceNumber: "",
    rcNumber: "",
    website: "",
    headquarters: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name || "",
        sector: company.sector || "",
        iceNumber: company.iceNumber || "",
        rcNumber: company.rcNumber || "",
        website: company.website || "",
        headquarters: company.headquarters || "",
        description: company.description || "",
      });
    }
  }, [company]);

  const handleSave = async () => {
    setErr(null);
    setMsg(null);
    setSaving(true);
    try {
      const res = await fetch("/api/company/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: {
            name: form.name.trim(),
            sector: form.sector.trim() || "Other",
            iceNumber: form.iceNumber.trim() || null,
            rcNumber: form.rcNumber.trim() || null,
            website: form.website.trim() || null,
            headquarters: form.headquarters.trim() || null,
            description: form.description.trim() || null,
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Saved.");
        onChanged();
      } else {
        setErr(data.error || "Save failed");
      }
    } catch {
      setErr("Network error");
    }
    setSaving(false);
  };

  if (!company) {
    return (
      <div style={emptyStateStyle}>
        No company attached to your account. Ask a super-admin to attach you to a company.
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Company Information"
        title={company.name}
        sub={`Slug: ${company.slug}`}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: "16px",
          maxWidth: "800px",
        }}
      >
        <Field label="Company name *">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={inputStyle}
          />
        </Field>
        <Field label="Sector">
          <input
            value={form.sector}
            onChange={(e) => setForm({ ...form, sector: e.target.value })}
            placeholder="Banking, Telecommunications, Mining..."
            style={inputStyle}
          />
        </Field>
        <Field label="ICE number (Morocco tax id)">
          <input
            value={form.iceNumber}
            onChange={(e) => setForm({ ...form, iceNumber: e.target.value })}
            placeholder="001234567000045"
            style={inputStyle}
          />
        </Field>
        <Field label="RC number (Registre de Commerce)">
          <input
            value={form.rcNumber}
            onChange={(e) => setForm({ ...form, rcNumber: e.target.value })}
            placeholder="12345"
            style={inputStyle}
          />
        </Field>
        <Field label="Website">
          <input
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://..."
            style={inputStyle}
          />
        </Field>
        <Field label="Headquarters">
          <input
            value={form.headquarters}
            onChange={(e) =>
              setForm({ ...form, headquarters: e.target.value })
            }
            placeholder="Casablanca, Morocco"
            style={inputStyle}
          />
        </Field>
        <div style={{ gridColumn: "1 / -1" }}>
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </Field>
        </div>
      </div>

      {msg && (
        <div
          style={{
            ...noteStyle,
            background: C.successBg,
            color: C.success,
            marginTop: "16px",
          }}
        >
          {msg}
        </div>
      )}
      {err && (
        <div
          style={{
            ...noteStyle,
            background: C.dangerBg,
            color: C.danger,
            marginTop: "16px",
          }}
        >
          {err}
        </div>
      )}

      <div style={{ marginTop: "24px" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={primaryButtonStyle}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB: SETTINGS — alert thresholds, topics, competitors, sources
// ═══════════════════════════════════════════════════════════════

function SettingsTab({
  settings,
  onChanged,
}: {
  settings: SettingsInfo | null;
  companyId?: string;
  onChanged: () => void;
}) {
  const [topics, setTopics] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [sources, setSources] = useState("");
  const [sentimentDrop, setSentimentDrop] = useState("-0.3");
  const [riskLevel, setRiskLevel] = useState("high");
  const [minMentions, setMinMentions] = useState("5");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setTopics(settings.topics.join("\n"));
      setCompetitors(settings.competitors.join("\n"));
      setSources(settings.monitoredSources.join("\n"));
      setSentimentDrop(String(settings.alertThresholds.sentimentDrop ?? -0.3));
      setRiskLevel(settings.alertThresholds.riskLevel || "high");
      setMinMentions(
        String(settings.alertThresholds.minMentions ?? 5),
      );
    }
  }, [settings]);

  const handleSave = async () => {
    setErr(null);
    setMsg(null);
    setSaving(true);
    try {
      const res = await fetch("/api/company/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            topics: topics
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
            competitors: competitors
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
            monitoredSources: sources
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
            alertThresholds: {
              sentimentDrop: parseFloat(sentimentDrop) || -0.3,
              riskLevel,
              minMentions: parseInt(minMentions, 10) || 5,
            },
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Settings saved.");
        onChanged();
      } else {
        setErr(data.error || "Save failed");
      }
    } catch {
      setErr("Network error");
    }
    setSaving(false);
  };

  if (!settings) {
    return (
      <div style={emptyStateStyle}>No settings available.</div>
    );
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Company Settings"
        title="Monitoring configuration"
        sub="Thresholds and lists applied to your company's alerts and briefings."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: "24px",
          maxWidth: "900px",
        }}
      >
        <div>
          <Field label="Monitored topics (one per line)">
            <textarea
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              rows={6}
              placeholder={"OCP\nPhosphate prices\nESG"}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </Field>
        </div>
        <div>
          <Field label="Tracked competitors (one per line)">
            <textarea
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
              rows={6}
              placeholder={"Competitor A\nCompetitor B"}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </Field>
        </div>
        <div>
          <Field label="Monitored sources (domains, one per line)">
            <textarea
              value={sources}
              onChange={(e) => setSources(e.target.value)}
              rows={6}
              placeholder={"lematin.ma\nhespress.com"}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </Field>
        </div>
      </div>

      <div
        style={{
          marginTop: "32px",
          padding: "20px",
          border: `1px solid ${C.border}`,
          borderRadius: "6px",
          maxWidth: "900px",
          background: C.bgSubtle,
        }}
      >
        <div style={eyebrowStyle}>Alert thresholds</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            gap: "16px",
            marginTop: "12px",
          }}
        >
          <Field label="Sentiment drop (alert when 1d delta < this)">
            <input
              type="number"
              step="0.05"
              min="-1"
              max="0"
              value={sentimentDrop}
              onChange={(e) => setSentimentDrop(e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="Minimum risk level">
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </Field>
          <Field label="Min mentions per hour">
            <input
              type="number"
              min="1"
              value={minMentions}
              onChange={(e) => setMinMentions(e.target.value)}
              style={inputStyle}
            />
          </Field>
        </div>
      </div>

      {msg && (
        <div
          style={{
            ...noteStyle,
            background: C.successBg,
            color: C.success,
            marginTop: "16px",
            maxWidth: "900px",
          }}
        >
          {msg}
        </div>
      )}
      {err && (
        <div
          style={{
            ...noteStyle,
            background: C.dangerBg,
            color: C.danger,
            marginTop: "16px",
            maxWidth: "900px",
          }}
        >
          {err}
        </div>
      )}

      <div style={{ marginTop: "24px" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={primaryButtonStyle}
        >
          {saving ? "Saving..." : "Save settings"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB: HIERARCHY — parent + subsidiaries
// ═══════════════════════════════════════════════════════════════

function HierarchyTab({
  company,
  onChanged,
}: {
  company: CompanyInfo | null;
  onChanged: () => void;
}) {
  const [showAddSub, setShowAddSub] = useState(false);
  const [showLinkParent, setShowLinkParent] = useState(false);

  if (!company) {
    return <div style={emptyStateStyle}>No company attached.</div>;
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Company Hierarchy"
        title="Subsidiaries & parent"
        sub="Manage the parent/subsidiary structure of your company."
      />

      {/* Hierarchy tree (visual) */}
      <div
        style={{
          padding: "20px",
          border: `1px solid ${C.border}`,
          borderRadius: "6px",
          marginBottom: "32px",
          background: C.bgSubtle,
        }}
      >
        {company.parent ? (
          <>
            <HierarchyNode
              label={company.parent.name}
              meta={`Parent · ${company.parent.sector}${
                company.parent.iceNumber
                  ? " · ICE " + company.parent.iceNumber
                  : ""
              }`}
              depth={0}
            />
            <div
              style={{
                marginLeft: "20px",
                borderLeft: `2px solid ${C.border}`,
                paddingLeft: "12px",
              }}
            >
              <HierarchyNode
                label={company.name}
                meta="This company"
                depth={1}
                highlighted
              />
            </div>
          </>
        ) : (
          <HierarchyNode
            label={company.name}
            meta="This company (no parent)"
            depth={0}
            highlighted
          />
        )}

        {company.subsidiaries.length > 0 && (
          <div
            style={{
              marginLeft: company.parent ? "32px" : "0",
              borderLeft: `2px solid ${C.border}`,
              paddingLeft: "12px",
              marginTop: "8px",
            }}
          >
            {company.subsidiaries.map((s) => (
              <HierarchyNode
                key={s.id}
                label={s.name}
                meta={`Subsidiary · ${s.sector}${
                  s.iceNumber ? " · ICE " + s.iceNumber : ""
                }`}
                depth={company.parent ? 2 : 1}
                onUnlink={() => handleUnlinkSubsidiary(s.id, s.name, onChanged)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <button onClick={() => setShowAddSub(true)} style={primaryButtonStyle}>
          + Add subsidiary
        </button>
        {!company.parent && (
          <button
            onClick={() => setShowLinkParent(true)}
            style={secondaryButtonStyle}
          >
            Link to parent company
          </button>
        )}
      </div>

      {showAddSub && (
        <AddSubsidiaryModal
          onClose={() => setShowAddSub(false)}
          onDone={() => {
            setShowAddSub(false);
            onChanged();
          }}
        />
      )}

      {showLinkParent && (
        <LinkParentModal
          onClose={() => setShowLinkParent(false)}
          onDone={() => {
            setShowLinkParent(false);
            onChanged();
          }}
        />
      )}
    </div>
  );
}

function HierarchyNode({
  label,
  meta,
  depth,
  highlighted,
  onUnlink,
}: {
  label: string;
  meta: string;
  depth: number;
  highlighted?: boolean;
  onUnlink?: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 14px",
        background: highlighted ? `${C.cta}08` : C.bg,
        border: `1px solid ${highlighted ? `${C.cta}40` : C.border}`,
        borderRadius: "4px",
        marginBottom: "6px",
        marginLeft: depth > 0 ? "0" : "0",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: C.text,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "10px",
            color: C.textMuted,
            fontFamily: C.fontMono,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginTop: "2px",
          }}
        >
          {meta}
        </div>
      </div>
      {onUnlink && (
        <button
          onClick={onUnlink}
          style={{
            padding: "4px 10px",
            background: "transparent",
            border: `1px solid ${C.danger}40`,
            color: C.danger,
            borderRadius: "3px",
            fontSize: "10px",
            fontFamily: C.fontMono,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            cursor: "pointer",
          }}
        >
          Unlink
        </button>
      )}
    </div>
  );
}

async function handleUnlinkSubsidiary(
  subsidiaryId: string,
  name: string,
  onChanged: () => void,
) {
  if (!confirm(`Unlink "${name}" from your company?`)) return;
  try {
    const res = await fetch(
      `/api/company/subsidiary?subsidiaryId=${subsidiaryId}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Unlink failed");
    } else {
      onChanged();
    }
  } catch (err) {
    alert(err instanceof Error ? err.message : "Network error");
  }
}

function AddSubsidiaryModal({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: () => void;
}) {
  const [mode, setMode] = useState<"create" | "link">("create");
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [iceNumber, setIceNumber] = useState("");
  const [rcNumber, setRcNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [headquarters, setHeadquarters] = useState("");
  const [linkId, setLinkId] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string;
      name: string;
      sector: string;
      iceNumber: string | null;
    }>
  >([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const searchCompanies = async (q: string) => {
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/companies?limit=10&sortBy=name`);
      if (res.ok) {
        const data = await res.json();
        const filtered = (data.data || []).filter((c: { name: string }) =>
          c.name.toLowerCase().includes(q.toLowerCase()),
        );
        setSearchResults(
          filtered.map(
            (c: {
              id: string;
              name: string;
              sector: string;
              iceNumber: string | null;
            }) => ({
              id: c.id,
              name: c.name,
              sector: c.sector,
              iceNumber: c.iceNumber,
            }),
          ),
        );
      }
    } catch {
      /* ignore */
    }
  };

  const handleSubmit = async () => {
    setErr(null);
    setBusy(true);
    try {
      const body =
        mode === "create"
          ? {
              mode: "create",
              name: name.trim(),
              sector: sector.trim() || undefined,
              iceNumber: iceNumber.trim() || undefined,
              rcNumber: rcNumber.trim() || undefined,
              website: website.trim() || undefined,
              headquarters: headquarters.trim() || undefined,
            }
          : {
              mode: "link",
              subsidiaryId: linkId,
            };
      const res = await fetch("/api/company/subsidiary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        onDone();
      } else {
        setErr(data.error || "Failed");
      }
    } catch {
      setErr("Network error");
    }
    setBusy(false);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: "8px",
          padding: "32px",
          maxWidth: "560px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={eyebrowStyle}>Add subsidiary</div>
        <h2 style={modalTitleStyle}>Add a subsidiary to your company</h2>

        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "20px",
          }}
        >
          <button
            onClick={() => setMode("create")}
            style={mode === "create" ? tabButtonActive : tabButtonIdle}
          >
            Create new
          </button>
          <button
            onClick={() => setMode("link")}
            style={mode === "link" ? tabButtonActive : tabButtonIdle}
          >
            Link existing
          </button>
        </div>

        {mode === "create" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Field label="Subsidiary name *">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
              />
            </Field>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <Field label="ICE number">
                <input
                  value={iceNumber}
                  onChange={(e) => setIceNumber(e.target.value)}
                  style={inputStyle}
                />
              </Field>
              <Field label="RC number">
                <input
                  value={rcNumber}
                  onChange={(e) => setRcNumber(e.target.value)}
                  style={inputStyle}
                />
              </Field>
            </div>
            <Field label="Sector">
              <input
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Website">
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Headquarters">
              <input
                value={headquarters}
                onChange={(e) => setHeadquarters(e.target.value)}
                style={inputStyle}
              />
            </Field>
            <div style={noteStyle}>
              The dedup service checks ICE/slug/fuzzy-name before creating.
              If a match is found, the existing company is linked instead.
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Field label="Search existing company by name">
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  searchCompanies(e.target.value);
                }}
                placeholder="Type at least 2 characters..."
                style={inputStyle}
              />
            </Field>
            {searchResults.length > 0 && (
              <div
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: "4px",
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                {searchResults.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setLinkId(c.id);
                      setName(c.name);
                      setSearchResults([]);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "10px 12px",
                      background: "transparent",
                      border: "none",
                      borderBottom: `1px solid ${C.border}`,
                      textAlign: "left",
                      cursor: "pointer",
                      fontFamily: C.fontSans,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: C.text,
                      }}
                    >
                      {c.name}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: C.textMuted,
                        fontFamily: C.fontMono,
                      }}
                    >
                      {c.sector}
                      {c.iceNumber ? " · ICE " + c.iceNumber : ""}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {linkId && (
              <div style={noteStyle}>
                Selected company will be linked as a subsidiary.
              </div>
            )}
          </div>
        )}

        {err && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px 14px",
              background: C.dangerBg,
              border: `1px solid ${C.danger}30`,
              borderRadius: "4px",
              fontSize: "13px",
              color: C.danger,
            }}
          >
            {err}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "flex-end",
            marginTop: "24px",
          }}
        >
          <button onClick={onClose} style={secondaryButtonStyle}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              busy || (mode === "create" ? !name.trim() : !linkId)
            }
            style={primaryButtonStyle}
          >
            {busy ? "Working..." : mode === "create" ? "Create + link" : "Link"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LinkParentModal({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: () => void;
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<
    Array<{
      id: string;
      name: string;
      sector: string;
      iceNumber: string | null;
    }>
  >([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const runSearch = async (q: string) => {
    setSearch(q);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/companies?limit=20&sortBy=name`);
      if (res.ok) {
        const data = await res.json();
        const filtered = (data.data || []).filter((c: { name: string }) =>
          c.name.toLowerCase().includes(q.toLowerCase()),
        );
        setResults(
          filtered.map(
            (c: {
              id: string;
              name: string;
              sector: string;
              iceNumber: string | null;
            }) => ({
              id: c.id,
              name: c.name,
              sector: c.sector,
              iceNumber: c.iceNumber,
            }),
          ),
        );
      }
    } catch {
      /* ignore */
    }
  };

  const handleSubmit = async () => {
    if (!selected) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/company/subsidiary", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkToParentId: selected }),
      });
      const data = await res.json();
      if (res.ok) {
        onDone();
      } else {
        setErr(data.error || "Failed");
      }
    } catch {
      setErr("Network error");
    }
    setBusy(false);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: "8px",
          padding: "32px",
          maxWidth: "560px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={eyebrowStyle}>Link to parent</div>
        <h2 style={modalTitleStyle}>Set this company's parent</h2>

        <Field label="Search parent company by name">
          <input
            value={search}
            onChange={(e) => runSearch(e.target.value)}
            placeholder="Type at least 2 characters..."
            style={inputStyle}
          />
        </Field>

        {results.length > 0 && (
          <div
            style={{
              border: `1px solid ${C.border}`,
              borderRadius: "4px",
              maxHeight: "240px",
              overflowY: "auto",
              marginTop: "12px",
            }}
          >
            {results.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelected(c.id);
                  setSearch(c.name);
                  setResults([]);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 12px",
                  background:
                    selected === c.id ? `${C.cta}10` : "transparent",
                  border: "none",
                  borderBottom: `1px solid ${C.border}`,
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: C.fontSans,
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: C.text,
                  }}
                >
                  {c.name}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: C.textMuted,
                    fontFamily: C.fontMono,
                  }}
                >
                  {c.sector}
                  {c.iceNumber ? " · ICE " + c.iceNumber : ""}
                </div>
              </button>
            ))}
          </div>
        )}

        {err && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px 14px",
              background: C.dangerBg,
              border: `1px solid ${C.danger}30`,
              borderRadius: "4px",
              fontSize: "13px",
              color: C.danger,
            }}
          >
            {err}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "flex-end",
            marginTop: "24px",
          }}
        >
          <button onClick={onClose} style={secondaryButtonStyle}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={busy || !selected}
            style={primaryButtonStyle}
          >
            {busy ? "Linking..." : "Link as parent"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SHARED STYLES
// ═══════════════════════════════════════════════════════════════

function SectionHeader({
  eyebrow,
  title,
  sub,
  action,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: "12px",
        marginBottom: "24px",
      }}
    >
      <div>
        <div style={eyebrowStyle}>{eyebrow}</div>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: C.text,
            margin: "4px 0",
          }}
        >
          {title}
        </h2>
        {sub && (
          <div
            style={{
              fontSize: "12px",
              color: C.textMuted,
              fontFamily: C.fontMono,
            }}
          >
            {sub}
          </div>
        )}
      </div>
      {action}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontFamily: "'Space Mono', monospace",
  color: "#737373",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #e5e5e5",
  borderRadius: "4px",
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: "14px",
  color: "#0a0a0a",
  background: "#ffffff",
  boxSizing: "border-box",
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  padding: "6px 8px",
  border: `1px solid ${C.border}`,
  borderRadius: "3px",
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: "12px",
  color: C.text,
  background: C.bg,
  cursor: "pointer",
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: "10px",
  color: C.textMuted,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

const modalTitleStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
  color: C.text,
  margin: "4px 0 24px",
};

const noteStyle: React.CSSProperties = {
  padding: "12px 14px",
  background: C.bgSubtle,
  borderRadius: "4px",
  fontSize: "12px",
  color: C.textBody,
  lineHeight: 1.5,
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  background: C.cta,
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  background: "transparent",
  border: `1px solid ${C.border}`,
  color: C.textBody,
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
  borderRadius: "4px",
};

const tabButtonActive: React.CSSProperties = {
  padding: "8px 14px",
  background: C.text,
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  fontSize: "12px",
  fontFamily: "'Inter', system-ui, sans-serif",
  fontWeight: 600,
  cursor: "pointer",
};

const tabButtonIdle: React.CSSProperties = {
  padding: "8px 14px",
  background: "transparent",
  color: C.textBody,
  border: `1px solid ${C.border}`,
  borderRadius: "4px",
  fontSize: "12px",
  fontFamily: "'Inter', system-ui, sans-serif",
  fontWeight: 500,
  cursor: "pointer",
};

const emptyStateStyle: React.CSSProperties = {
  padding: "48px 32px",
  border: `1px dashed ${C.border}`,
  borderRadius: "8px",
  textAlign: "center",
  color: C.textMuted,
  fontFamily: C.fontMono,
  fontSize: "13px",
};

function tabStyle(active: boolean): React.CSSProperties {
  return {
    padding: "12px 16px",
    background: "transparent",
    border: "none",
    borderBottom: active ? `2px solid ${C.accent}` : "2px solid transparent",
    color: active ? C.text : C.textMuted,
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  };
}
