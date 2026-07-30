"use client";

import { useState, useEffect, useCallback } from "react";
import { C } from "../components/tokens";

// ═══════════════════════════════════════════════════════════════
//  ADMIN DASHBOARD — Manage access requests + invitations
//
//  Two tabs:
//  1. Requests — people who filled the public form
//  2. Invitations — links you've created (active + used)
//
//  Create invitation modal lets admin choose:
//  - Email, Name, Company
//  - Account type (brand-monitor / market-competitor / investment-bank / harch-alpha)

//  - Payment status (auto / 1mo / 3mo / 12mo paid)
//
//  NO temporary password — user creates their own when they open
//  the invitation link.
// ═══════════════════════════════════════════════════════════════

interface AccessRequest {
  id: string;
  email: string;
  name: string;
  company: string | null;
  role: string | null;
  accountType: string | null;
  companySize: string | null;
  useCase: string | null;
  budget: string | null;
  phone: string | null;
  country: string | null;
  referralSource: string | null;
  message: string | null;
  status: string;
  createdAt: string;
  invitation: { id: string; token: string; usedAt: string | null } | null;
}

interface Invitation {
  id: string;
  token: string;
  email: string;
  name: string;
  accountType: string;
  role: string;
  company: string | null;
  message: string | null;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
}

interface CreatedInvitation {
  id: string;
  token: string;
  url: string;
  email: string;
  name: string;
  accountType: string;
  role: string;
  expiresAt: string;
}

interface AdminStats {
  users: { total: number; "brand-monitor": number; "market-competitor": number; "investment-bank": number; "harch-alpha": number };
  requests: { pending: number; accepted: number };
  invitations: { active: number; used: number };
  data: { articles: number; companies: number; assets: number; portfolios: number; dossiers: number };
}

export function AdminDashboard() {
  const [tab, setTab] = useState<"requests" | "invitations">("requests");
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdInvitation, setCreatedInvitation] = useState<CreatedInvitation | null>(null);
  const [copied, setCopied] = useState(false);

  // Form state
  const [formEmail, setFormEmail] = useState("");
  const [formName, setFormName] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formAccountType, setFormAccountType] = useState("brand-monitor");

  const [formPayment, setFormPayment] = useState("auto");
  const [formMessage, setFormMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, invRes, statsRes] = await Promise.all([
        fetch("/api/admin/requests"),
        fetch("/api/admin/invitations"),
        fetch("/api/admin/stats"),
      ]);
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData.requests || []);
      }
      if (invRes.ok) {
        const invData = await invRes.json();
        setInvitations(invData.invitations || []);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateModal = (request?: AccessRequest) => {
    if (request) {
      setFormEmail(request.email);
      setFormName(request.name);
      setFormCompany(request.company || "");
      setFormAccountType("brand-monitor");

      setFormPayment("auto");
      setFormMessage("");
      setFormError(null);
      // Store requestId to link after creation
      (openCreateModal as unknown as { _requestId?: string })._requestId = request.id;
    } else {
      setFormEmail("");
      setFormName("");
      setFormCompany("");
      setFormAccountType("brand-monitor");

      setFormPayment("auto");
      setFormMessage("");
      setFormError(null);
      (openCreateModal as unknown as { _requestId?: string })._requestId = undefined;
    }
    setShowCreateModal(true);
  };

  const handleCreate = async () => {
    setFormError(null);
    if (!formEmail.trim() || !formName.trim()) {
      setFormError("Email and name are required.");
      return;
    }

    setCreating(true);
    try {
      const requestId = (openCreateModal as unknown as { _requestId?: string })._requestId;
      const res = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formEmail,
          name: formName,
          company: formCompany || undefined,
          accountType: formAccountType,
          message: formMessage || undefined,
          requestId: requestId,
          paymentStatus: formPayment,  // stored in message for now (TODO: add field)
        }),
      });

      const data = await res.json();
      if (res.ok && data.invitation) {
        setCreatedInvitation(data.invitation);
        setShowCreateModal(false);
        fetchData();
      } else {
        setFormError(data.error || "Failed to create invitation");
      }
    } catch {
      setFormError("Network error");
    }
    setCreating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const acceptedRequests = requests.filter((r) => r.status === "accepted");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.fontSans }}>
      {/* Top bar */}
      <header style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", color: C.text, textTransform: "uppercase" }}>
            HarchIQ<span style={{ color: C.accent, marginLeft: "8px" }}>Admin</span>
          </span>
          <a href="/atelier/console" style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono, textDecoration: "none" }}>→ Console</a>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => openCreateModal()} style={{ padding: "8px 14px", background: C.cta, color: "#fff", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
            + New invitation
          </button>
          <button onClick={() => { if (confirm("Sign out?")) window.location.href = "/api/auth/signout"; }} style={{ padding: "8px 14px", background: "transparent", border: `1px solid ${C.border}`, color: C.textBody, borderRadius: "4px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
            Sign out
          </button>
        </div>
      </header>

      {/* KPI strip */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap: "1px", background: C.border, border: `1px solid ${C.border}`, margin: "0 24px", borderRadius: "6px", overflow: "hidden" }}>
          <KpiCell label="Total users" value={stats.users.total} sub={`${stats.users["brand-monitor"]}B · ${stats.users["market-competitor"]}M · ${stats.users["investment-bank"]}I · ${stats.users["harch-alpha"]}H`} />
          <KpiCell label="Pending requests" value={stats.requests.pending} color={stats.requests.pending > 0 ? C.warning : undefined} />
          <KpiCell label="Active invites" value={stats.invitations.active} color={stats.invitations.active > 0 ? C.cta : undefined} />
          <KpiCell label="Companies" value={stats.data.companies} />
          <KpiCell label="Articles" value={stats.data.articles} />
          <KpiCell label="Assets" value={stats.data.assets} />
          <KpiCell label="Portfolios" value={stats.data.portfolios} />
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", borderBottom: `1px solid ${C.border}`, padding: "0 24px" }}>
        <button onClick={() => setTab("requests")} style={tabStyle(tab === "requests")}>
          Requests {pendingRequests.length > 0 && <span style={{ marginLeft: "6px", fontSize: "10px", fontFamily: C.fontMono, padding: "2px 6px", borderRadius: "8px", background: C.danger, color: "#fff" }}>{pendingRequests.length}</span>}
        </button>
        <button onClick={() => setTab("invitations")} style={tabStyle(tab === "invitations")}>
          Invitations ({invitations.length})
        </button>
      </div>

      {/* Content */}
      <main style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        {loading ? (
          <div style={{ color: C.textMuted, fontFamily: C.fontMono, fontSize: "13px" }}>Loading...</div>
        ) : tab === "requests" ? (
          <div>
            {pendingRequests.length === 0 && acceptedRequests.length === 0 ? (
              <EmptyState text="No access requests yet." />
            ) : (
              <>
                {pendingRequests.length > 0 && (
                  <div style={{ marginBottom: "32px" }}>
                    <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
                      Pending ({pendingRequests.length})
                    </div>
                    {pendingRequests.map((r) => <RequestCard key={r.id} request={r} onAccept={() => openCreateModal(r)} />)}
                  </div>
                )}
                {acceptedRequests.length > 0 && (
                  <div>
                    <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
                      Accepted ({acceptedRequests.length})
                    </div>
                    {acceptedRequests.map((r) => <RequestCard key={r.id} request={r} onAccept={() => openCreateModal(r)} />)}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div>
            {invitations.length === 0 ? (
              <EmptyState text="No invitations created yet." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {invitations.map((inv) => <InvitationCard key={inv.id} invitation={inv} />)}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create invitation modal */}
      {showCreateModal && (
        <div onClick={() => setShowCreateModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "32px", maxWidth: "560px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "8px" }}>
              New invitation
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: C.text, margin: "0 0 24px" }}>
              Create access for a new user
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Email */}
              <div>
                <label style={labelStyle}>Email *</label>
                <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="user@company.com" style={inputStyle} />
              </div>

              {/* Name */}
              <div>
                <label style={labelStyle}>Full name *</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Jane Doe" style={inputStyle} />
              </div>

              {/* Company */}
              <div>
                <label style={labelStyle}>Company</label>
                <input type="text" value={formCompany} onChange={(e) => setFormCompany(e.target.value)} placeholder="Bank of Africa" style={inputStyle} />
              </div>

              {/* Account type */}
              <div>
                <label style={labelStyle}>Account type *</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap: "8px" }}>
                  {[
                    { value: "brand-monitor", label: "Brand Monitor", desc: "Monitor own reputation" },
                    { value: "market-competitor", label: "Market & Competitor", desc: "Brand + competitors + sector" },
                    { value: "investment-bank", label: "Investment Bank", desc: "DD + M&A + portfolio" },
                    { value: "harch-alpha", label: "Harch Alpha", desc: "Trader — assets/markets" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFormAccountType(opt.value)}
                      style={{
                        padding: "12px",
                        background: formAccountType === opt.value ? C.bgSubtle : "transparent",
                        border: `1px solid ${formAccountType === opt.value ? C.accent : C.border}`,
                        borderRadius: "6px",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontSize: "13px", fontWeight: 600, color: formAccountType === opt.value ? C.accent : C.text }}>{opt.label}</div>
                      <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "4px" }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div>
                <label style={labelStyle}>Payment status</label>
                <select value={formPayment} onChange={(e) => setFormPayment(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="auto">Auto-renew (monthly)</option>
                  <option value="1mo">1 month paid</option>
                  <option value="3mo">3 months paid</option>
                  <option value="12mo">12 months paid</option>
                  <option value="trial">Free trial (14 days)</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label style={labelStyle}>Personal message (optional)</label>
                <textarea value={formMessage} onChange={(e) => setFormMessage(e.target.value)} placeholder="Welcome to HarchIQ..." rows={2} style={{ ...inputStyle, resize: "vertical" }} />
              </div>

              {formError && (
                <div style={{ padding: "12px 14px", background: C.dangerBg, border: `1px solid ${C.danger}30`, borderRadius: "4px", fontSize: "13px", color: C.danger }}>
                  {formError}
                </div>
              )}

              <div style={{ padding: "12px 14px", background: C.bgSubtle, borderRadius: "4px", fontSize: "12px", color: C.textBody, lineHeight: 1.5 }}>
                <strong style={{ color: C.text, fontFamily: C.fontMono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Note:</strong> The user will create their own password when they open the invitation link. No temporary password is generated.
              </div>

              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button onClick={() => setShowCreateModal(false)} style={{ padding: "10px 16px", background: "transparent", border: `1px solid ${C.border}`, color: C.textBody, fontFamily: C.fontSans, fontSize: "13px", fontWeight: 500, cursor: "pointer", borderRadius: "4px" }}>
                  Cancel
                </button>
                <button onClick={handleCreate} disabled={creating} style={{ padding: "10px 16px", background: creating ? C.border : C.cta, color: "#fff", border: "none", fontFamily: C.fontSans, fontSize: "13px", fontWeight: 600, cursor: creating ? "not-allowed" : "pointer", borderRadius: "4px" }}>
                  {creating ? "Creating..." : "Create invitation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Created invitation modal — shows URL only (no password) */}
      {createdInvitation && (
        <div onClick={() => setCreatedInvitation(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "32px", maxWidth: "560px", width: "100%" }}>
            <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.cta, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "8px" }}>
              Invitation created
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: C.text, margin: "0 0 8px" }}>
              Send this link to {createdInvitation.name}
            </h2>
            <p style={{ fontSize: "13px", color: C.textBody, marginBottom: "24px", lineHeight: 1.5 }}>
              The user will open this link, see their account info, and create their own password. No temporary password needed.
            </p>

            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Access link</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input readOnly value={createdInvitation.url} style={{ flex: 1, padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: "4px", fontFamily: C.fontMono, fontSize: "12px", color: C.text, background: C.bgSubtle }} />
                <button onClick={() => copyToClipboard(createdInvitation.url)} style={{ padding: "10px 14px", background: C.text, color: "#fff", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div style={{ padding: "12px 14px", background: C.bgSubtle, borderRadius: "4px", fontSize: "12px", color: C.textBody, lineHeight: 1.5, marginBottom: "24px" }}>
              <strong style={{ color: C.text, fontFamily: C.fontMono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Account:</strong> {createdInvitation.accountType} · <strong style={{ color: C.text, fontFamily: C.fontMono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Expires:</strong> {new Date(createdInvitation.expiresAt).toLocaleDateString("en-US")}
            </div>

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button onClick={() => setCreatedInvitation(null)} style={{ padding: "10px 16px", background: C.cta, color: "#fff", border: "none", borderRadius: "4px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
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

function tabStyle(active: boolean): React.CSSProperties {
  return {
    padding: "12px 16px",
    background: "transparent",
    border: "none",
    borderBottom: active ? "2px solid #78716c" : "2px solid transparent",
    color: active ? "#0a0a0a" : "#737373",
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  };
}

function RequestCard({ request, onAccept }: { request: AccessRequest; onAccept: () => void }) {
  const sizeLabels: Record<string, string> = {
    startup: "Startup (1-10)",
    sme: "SME (11-50)",
    "mid-market": "Mid-market (51-500)",
    enterprise: "Enterprise (500+)",
  };
  const typeLabels: Record<string, string> = {
    enterprise: "Enterprise",
    trader: "Trader",
    investor: "Investor",
  };

  return (
    <div style={{ padding: "16px 20px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: "6px", marginBottom: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          {/* Name + email */}
          <div style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>{request.name}</div>
          <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono }}>{request.email}</div>

          {/* Tags row */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
            {request.accountType && (
              <span style={{ fontSize: "10px", fontFamily: C.fontMono, padding: "2px 8px", borderRadius: "2px", background: `${C.accent}15`, color: C.accent, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {typeLabels[request.accountType] || request.accountType}
              </span>
            )}
            {request.companySize && (
              <span style={{ fontSize: "10px", fontFamily: C.fontMono, padding: "2px 8px", borderRadius: "2px", background: C.bgSubtle, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {sizeLabels[request.companySize] || request.companySize}
              </span>
            )}
            {request.budget && (
              <span style={{ fontSize: "10px", fontFamily: C.fontMono, padding: "2px 8px", borderRadius: "2px", background: `${C.cta}15`, color: C.cta, letterSpacing: "0.1em" }}>
                {request.budget}
              </span>
            )}
          </div>

          {/* Details */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap: "8px", marginTop: "12px", fontSize: "12px" }}>
            {request.company && <div><span style={{ color: C.textMuted }}>Company:</span> <span style={{ color: C.textBody }}>{request.company}</span></div>}
            {request.role && <div><span style={{ color: C.textMuted }}>Role:</span> <span style={{ color: C.textBody }}>{request.role}</span></div>}
            {request.phone && <div><span style={{ color: C.textMuted }}>Phone:</span> <span style={{ color: C.textBody }}>{request.phone}</span></div>}
            {request.country && <div><span style={{ color: C.textMuted }}>Country:</span> <span style={{ color: C.textBody }}>{request.country}</span></div>}
            {request.referralSource && <div><span style={{ color: C.textMuted }}>Referral:</span> <span style={{ color: C.textBody }}>{request.referralSource}</span></div>}
          </div>

          {/* Use case */}
          {request.useCase && (
            <div style={{ fontSize: "13px", color: C.textBody, marginTop: "8px", lineHeight: 1.5, padding: "8px 12px", background: C.bgSubtle, borderRadius: "4px" }}>
              <span style={{ fontSize: "10px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Use case: </span>
              {request.useCase}
            </div>
          )}

          {/* Message */}
          {request.message && (
            <div style={{ fontSize: "13px", color: C.textBody, marginTop: "8px", lineHeight: 1.5, padding: "8px 12px", background: C.bgSubtle, borderRadius: "4px" }}>
              <span style={{ fontSize: "10px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Note: </span>
              {request.message}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          <span style={{ fontSize: "10px", fontFamily: C.fontMono, padding: "3px 8px", borderRadius: "2px", background: request.status === "pending" ? `${C.warning}15` : `${C.cta}15`, color: request.status === "pending" ? C.warning : C.cta, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {request.status}
          </span>
          {request.status === "pending" && (
            <button onClick={onAccept} style={{ padding: "8px 14px", background: C.cta, color: "#fff", border: "none", borderRadius: "4px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
              Create invitation
            </button>
          )}
          {request.invitation && (
            <span style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono }}>
              {request.invitation.usedAt ? "Used" : "Pending"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function InvitationCard({ invitation }: { invitation: Invitation }) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://atelier.harchcorp.com";
  const url = `${baseUrl}/atelier/access?token=${invitation.token}`;
  const [copied, setCopied] = useState(false);

  const isExpired = new Date(invitation.expiresAt) < new Date();
  const isUsed = !!invitation.usedAt;

  return (
    <div style={{ padding: "16px 20px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: "6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>{invitation.name}</div>
          <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono }}>{invitation.email}</div>
          <div style={{ fontSize: "11px", color: C.textBody, fontFamily: C.fontMono, marginTop: "4px" }}>
            Type: {invitation.accountType} · Created: {new Date(invitation.createdAt).toLocaleDateString("en-US")}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          <span style={{ fontSize: "10px", fontFamily: C.fontMono, padding: "3px 8px", borderRadius: "2px", background: isUsed ? `${C.cta}15` : isExpired ? `${C.danger}15` : `${C.warning}15`, color: isUsed ? C.cta : isExpired ? C.danger : C.warning, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {isUsed ? "Used" : isExpired ? "Expired" : "Active"}
          </span>
          {!isUsed && !isExpired && (
            <button onClick={() => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ padding: "6px 12px", background: C.text, color: "#fff", border: "none", borderRadius: "4px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
              {copied ? "Copied" : "Copy link"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ padding: "48px 32px", border: `1px dashed ${C.border}`, borderRadius: "8px", textAlign: "center", color: C.textMuted, fontFamily: C.fontMono, fontSize: "13px" }}>
      {text}
    </div>
  );
}

function KpiCell({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div style={{ background: C.bg, padding: "16px 20px" }}>
      <div style={{ fontSize: "24px", fontWeight: 800, fontFamily: C.fontMono, color: color || C.text, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: "9px", color: C.textMuted, fontFamily: C.fontMono, marginTop: "6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: "9px", color: C.textMuted, fontFamily: C.fontMono, marginTop: "2px" }}>{sub}</div>}
    </div>
  );
}
