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
  companyId: string | null;
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
  companyId?: string | null;
  expiresAt: string;
}

// ─── Company selector (Task: company-dedup-enterprise-admin) ───────
interface CompanyListItem {
  id: string;
  name: string;
  slug: string;
  sector: string;
  iceNumber: string | null;
  rcNumber: string | null;
  website: string | null;
  parentId: string | null;
}

interface CreateCompanyResult {
  company: CompanyListItem;
  created: boolean;
  duplicates: {
    exactMatch: {
      id: string;
      name: string;
      slug: string;
      iceNumber: string | null;
    } | null;
    fuzzyMatches: Array<{
      id: string;
      name: string;
      slug: string;
      iceNumber: string | null;
      similarity: number;
    }>;
  } | null;
}

interface AdminStats {
  users: { total: number; "brand-monitor": number; "market-competitor": number; "investment-bank": number; "harch-alpha": number };
  requests: { pending: number; accepted: number };
  invitations: { active: number; used: number };
  data: { articles: number; companies: number; assets: number; portfolios: number; dossiers: number };
}

// ─── Data Sources tab types (Task: real-rss-scrapers) ─────────────
interface FeedStatus {
  name: string;
  url: string;
  language: "ar" | "fr" | "en";
  category: "news" | "business" | "tech";
  status: "ok" | "error" | "never";
  lastScrapeAt: string | null;
  lastDurationMs: number | null;
  lastArticlesFound: number;
  lastArticlesNew: number;
  lastError: string | null;
  articlesIngested: number;
  errorCount24h: number;
}

interface ScraperStatus {
  success: boolean;
  summary: {
    feedsActive: number;
    feedsError: number;
    feedsNever: number;
    totalFeeds: number;
    totalArticles: number;
    totalRealArticles: number;
    totalSeedArticles: number;
    newArticles24h: number;
  };
  feeds: FeedStatus[];
}

interface ScrapeSummary {
  success: boolean;
  feedsProcessed: number;
  articlesFound: number;
  articlesNew: number;
  articlesMatched: number;
  errors: { feed: string; message: string }[];
  startedAt: string;
  completedAt: string;
  durationMs: number;
  perFeed: Array<{
    name: string;
    url: string;
    found: number;
    new: number;
    matched: number;
    durationMs: number;
    error?: string;
  }>;
}

export function AdminDashboard() {
  const [tab, setTab] = useState<"requests" | "invitations" | "sources">("requests");
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdInvitation, setCreatedInvitation] = useState<CreatedInvitation | null>(null);
  const [copied, setCopied] = useState(false);

  // ─── Data Sources tab state (Task: real-rss-scrapers) ──────────
  const [scraperStatus, setScraperStatus] = useState<ScraperStatus | null>(null);
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<ScrapeSummary | null>(null);
  const [sourcesLoading, setSourcesLoading] = useState(false);

  // Form state
  const [formEmail, setFormEmail] = useState("");
  const [formName, setFormName] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formAccountType, setFormAccountType] = useState("brand-monitor");
  const [formRole, setFormRole] = useState<"user" | "admin" | "company-admin">("user");

  const [formPayment, setFormPayment] = useState("auto");
  const [formMessage, setFormMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ─── Company selector state (Task: company-dedup-enterprise-admin) ──
  // The admin can either pick an existing company from a dropdown
  // (searchable), or click "Create new" to fill an inline form with
  // ICE/RC. The selected companyId is sent to /api/admin/invitations
  // so the new user is attached to the company on activation.
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [companySearch, setCompanySearch] = useState("");
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: "",
    sector: "",
    iceNumber: "",
    rcNumber: "",
    website: "",
    headquarters: "",
  });
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [companyCreateError, setCompanyCreateError] = useState<string | null>(null);
  const [companyCreateInfo, setCompanyCreateInfo] = useState<string | null>(null);

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

  // ─── Data Sources tab — fetch status + trigger scrape ───────────
  const fetchScraperStatus = useCallback(async () => {
    setSourcesLoading(true);
    try {
      const res = await fetch("/api/admin/scraper-status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setScraperStatus(data);
      }
    } catch {
      // ignore
    }
    setSourcesLoading(false);
  }, []);

  useEffect(() => {
    if (tab === "sources") {
      fetchScraperStatus();
    }
  }, [tab, fetchScraperStatus]);

  const handleScrapeNow = async () => {
    if (scraping) return;
    if (!confirm("Run an RSS scrape now? This fetches all 10 feeds and may take 30-60 seconds.")) return;
    setScraping(true);
    setScrapeResult(null);
    try {
      const res = await fetch("/api/admin/scrape-now", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setScrapeResult(data);
        // Refresh the status panel so the new counts show
        fetchScraperStatus();
        // Also refresh the top-level stats (article count changed)
        fetchData();
      } else {
        alert(data.error || data.detail || "Scrape failed");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Network error");
    }
    setScraping(false);
  };

  const openCreateModal = (request?: AccessRequest) => {
    if (request) {
      setFormEmail(request.email);
      setFormName(request.name);
      setFormCompany(request.company || "");
      setFormAccountType("brand-monitor");
      setFormRole("user");

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
      setFormRole("user");

      setFormPayment("auto");
      setFormMessage("");
      setFormError(null);
      (openCreateModal as unknown as { _requestId?: string })._requestId = undefined;
    }
    // Reset company selector state on each open
    setSelectedCompanyId("");
    setCompanySearch("");
    setShowCreateCompany(false);
    setNewCompany({ name: "", sector: "", iceNumber: "", rcNumber: "", website: "", headquarters: "" });
    setCompanyCreateError(null);
    setCompanyCreateInfo(null);
    setShowCreateModal(true);
    // Pre-load companies for the dropdown
    fetchCompanies("");
  };

  // ─── Company dropdown loader (Task: company-dedup-enterprise-admin) ──
  const fetchCompanies = useCallback(async (search: string) => {
    setCompaniesLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50", sortBy: "name" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/company/list?${params.toString()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies || []);
      } else {
        setCompanies([]);
      }
    } catch {
      setCompanies([]);
    }
    setCompaniesLoading(false);
  }, []);

  // ─── Inline "create new company" handler ──────────────────────
  const handleCreateCompany = async () => {
    setCompanyCreateError(null);
    setCompanyCreateInfo(null);
    if (!newCompany.name.trim()) {
      setCompanyCreateError("Company name is required.");
      return;
    }
    setCreatingCompany(true);
    try {
      const res = await fetch("/api/company/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCompany.name.trim(),
          sector: newCompany.sector.trim() || undefined,
          iceNumber: newCompany.iceNumber.trim() || undefined,
          rcNumber: newCompany.rcNumber.trim() || undefined,
          website: newCompany.website.trim() || undefined,
          headquarters: newCompany.headquarters.trim() || undefined,
        }),
      });
      const data: CreateCompanyResult = await res.json();
      if (res.ok) {
        setSelectedCompanyId(data.company.id);
        setFormCompany(data.company.name);
        setShowCreateCompany(false);
        if (data.created) {
          setCompanyCreateInfo(`Created "${data.company.name}".`);
        } else if (data.duplicates?.exactMatch) {
          setCompanyCreateInfo(
            `Linked existing company "${data.duplicates.exactMatch.name}" (matched by ICE/slug).`
          );
        } else if (data.duplicates && data.duplicates.fuzzyMatches.length > 0) {
          setCompanyCreateInfo(
            `Linked similar company "${data.duplicates.fuzzyMatches[0].name}" (${(data.duplicates.fuzzyMatches[0].similarity * 100).toFixed(0)}% name match).`
          );
        } else {
          setCompanyCreateInfo(`Linked existing company "${data.company.name}".`);
        }
        setNewCompany({ name: "", sector: "", iceNumber: "", rcNumber: "", website: "", headquarters: "" });
        fetchCompanies("");
      } else {
        setCompanyCreateError((data as { error?: string }).error || "Failed to create company");
      }
    } catch {
      setCompanyCreateError("Network error");
    }
    setCreatingCompany(false);
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
          companyId: selectedCompanyId || undefined,
          role: formRole,
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
        <button onClick={() => setTab("sources")} style={tabStyle(tab === "sources")}>
          Data Sources
        </button>
      </div>

      {/* Content */}
      <main style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        {loading && tab !== "sources" ? (
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
        ) : tab === "invitations" ? (
          <div>
            {invitations.length === 0 ? (
              <EmptyState text="No invitations created yet." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {invitations.map((inv) => <InvitationCard key={inv.id} invitation={inv} />)}
              </div>
            )}
          </div>
        ) : (
          <DataSourcesPanel
            status={scraperStatus}
            loading={sourcesLoading}
            scraping={scraping}
            scrapeResult={scrapeResult}
            onScrapeNow={handleScrapeNow}
            onRefresh={fetchScraperStatus}
          />
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

              {/* Role selector (Task: company-dedup-enterprise-admin) */}
              <div>
                <label style={labelStyle}>Role *</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 120px), 1fr))", gap: "8px" }}>
                  {([
                    { value: "user", label: "User", desc: "Standard access" },
                    { value: "company-admin", label: "Team Admin", desc: "Invite teammates, manage company" },
                    { value: "admin", label: "Super-Admin", desc: "Full platform access" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFormRole(opt.value)}
                      style={{
                        padding: "10px",
                        background: formRole === opt.value ? C.bgSubtle : "transparent",
                        border: `1px solid ${formRole === opt.value ? C.accent : C.border}`,
                        borderRadius: "6px",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontSize: "12px", fontWeight: 600, color: formRole === opt.value ? C.accent : C.text }}>{opt.label}</div>
                      <div style={{ fontSize: "10px", color: C.textMuted, marginTop: "3px" }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Company selector (Task: company-dedup-enterprise-admin) */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Company</label>
                  <button
                    onClick={() => setShowCreateCompany(!showCreateCompany)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: C.accent,
                      fontFamily: C.fontMono,
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    {showCreateCompany ? "← Pick existing" : "+ Create new"}
                  </button>
                </div>

                {showCreateCompany ? (
                  <div style={{ padding: "14px", background: C.bgSubtle, border: `1px solid ${C.border}`, borderRadius: "6px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div>
                      <label style={{ ...labelStyle, fontSize: "10px" }}>Company name *</label>
                      <input type="text" value={newCompany.name} onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })} placeholder="Bank of Africa" style={inputStyle} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div>
                        <label style={{ ...labelStyle, fontSize: "10px" }}>ICE (Morocco tax id)</label>
                        <input type="text" value={newCompany.iceNumber} onChange={(e) => setNewCompany({ ...newCompany, iceNumber: e.target.value })} placeholder="001234567000045" style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, fontSize: "10px" }}>RC (Registre de Commerce)</label>
                        <input type="text" value={newCompany.rcNumber} onChange={(e) => setNewCompany({ ...newCompany, rcNumber: e.target.value })} placeholder="12345" style={inputStyle} />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div>
                        <label style={{ ...labelStyle, fontSize: "10px" }}>Sector</label>
                        <input type="text" value={newCompany.sector} onChange={(e) => setNewCompany({ ...newCompany, sector: e.target.value })} placeholder="Banking" style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, fontSize: "10px" }}>Website</label>
                        <input type="text" value={newCompany.website} onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })} placeholder="https://..." style={inputStyle} />
                      </div>
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: "10px" }}>Headquarters</label>
                      <input type="text" value={newCompany.headquarters} onChange={(e) => setNewCompany({ ...newCompany, headquarters: e.target.value })} placeholder="Casablanca" style={inputStyle} />
                    </div>
                    {companyCreateError && (
                      <div style={{ padding: "8px 10px", background: C.dangerBg, border: `1px solid ${C.danger}30`, borderRadius: "4px", fontSize: "12px", color: C.danger }}>
                        {companyCreateError}
                      </div>
                    )}
                    {companyCreateInfo && (
                      <div style={{ padding: "8px 10px", background: C.successBg, border: `1px solid ${C.cta}30`, borderRadius: "4px", fontSize: "12px", color: C.success }}>
                        {companyCreateInfo}
                      </div>
                    )}
                    <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono, lineHeight: 1.5 }}>
                      Dedup runs first (ICE then slug then fuzzy name above 0.92). If a match is found, the existing company is linked instead of creating a duplicate.
                    </div>
                    <button
                      onClick={handleCreateCompany}
                      disabled={creatingCompany}
                      style={{
                        padding: "8px 14px",
                        background: creatingCompany ? C.border : C.accent,
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: creatingCompany ? "not-allowed" : "pointer",
                        fontFamily: C.fontSans,
                      }}
                    >
                      {creatingCompany ? "Creating..." : "Create + link"}
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={companySearch}
                      onChange={(e) => {
                        setCompanySearch(e.target.value);
                        fetchCompanies(e.target.value);
                      }}
                      placeholder="Search companies by name, ICE, RC..."
                      style={inputStyle}
                    />
                    {companiesLoading && (
                      <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono, marginTop: "4px" }}>
                        Loading...
                      </div>
                    )}
                    {!companiesLoading && companies.length > 0 && (
                      <div style={{ marginTop: "6px", maxHeight: "180px", overflowY: "auto", border: `1px solid ${C.border}`, borderRadius: "4px", background: C.bg }}>
                        {companies.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedCompanyId(c.id);
                              setFormCompany(c.name);
                              setCompanySearch(c.name);
                            }}
                            style={{
                              display: "block",
                              width: "100%",
                              padding: "10px 12px",
                              background: selectedCompanyId === c.id ? `${C.cta}10` : "transparent",
                              border: "none",
                              borderBottom: `1px solid ${C.border}`,
                              textAlign: "left",
                              cursor: "pointer",
                              fontFamily: C.fontSans,
                            }}
                          >
                            <div style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>{c.name}</div>
                            <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono }}>
                              {c.sector}
                              {c.iceNumber ? " · ICE " + c.iceNumber : ""}
                              {c.rcNumber ? " · RC " + c.rcNumber : ""}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {selectedCompanyId && (
                      <div style={{ marginTop: "6px", padding: "8px 10px", background: C.successBg, border: `1px solid ${C.cta}30`, borderRadius: "4px", fontSize: "12px", color: C.success }}>
                        Selected: {formCompany} (id {selectedCompanyId.slice(-8)})
                      </div>
                    )}
                    <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono, marginTop: "4px", lineHeight: 1.5 }}>
                      Optional — leave empty for a standalone user. Selecting a company attaches the new user to it on activation. Required for the Team Admin role.
                    </div>
                  </>
                )}
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
    "brand-monitor": "Brand Monitor",
    "market-competitor": "Market & Competitor",
    "investment-bank": "Investment Bank",
    "harch-alpha": "Harch Alpha",
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

  const roleLabel: Record<string, string> = {
    user: "User",
    admin: "Super-Admin",
    "company-admin": "Team Admin",
  };

  return (
    <div style={{ padding: "16px 20px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: "6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>{invitation.name}</div>
          <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono }}>{invitation.email}</div>
          <div style={{ fontSize: "11px", color: C.textBody, fontFamily: C.fontMono, marginTop: "4px" }}>
            Type: {invitation.accountType} · Role: {roleLabel[invitation.role] || invitation.role} · Created: {new Date(invitation.createdAt).toLocaleDateString("en-US")}
          </div>
          {(invitation.company || invitation.companyId) && (
            <div style={{ fontSize: "11px", color: C.accent, fontFamily: C.fontMono, marginTop: "4px" }}>
              Company: {invitation.company || "—"}{invitation.companyId ? ` (id ${invitation.companyId.slice(-8)})` : ""}
            </div>
          )}
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

// ═══════════════════════════════════════════════════════════════
//  DATA SOURCES PANEL — Real RSS scraper monitoring
//
//  Shows per-feed status (last scrape, articles ingested, errors) and
//  a "Scrape now" button that triggers an immediate run across all
//  10 Moroccan media feeds.
//
//  Task ID: real-rss-scrapers
// ═══════════════════════════════════════════════════════════════

function fmtRelative(iso: string | null): string {
  if (!iso) return "never";
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

function fmtDuration(ms: number | null): string {
  if (ms == null) return "-";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

const STATUS_COLORS: Record<FeedStatus["status"], { bg: string; fg: string; label: string }> = {
  ok: { bg: `${C.cta}15`, fg: C.cta, label: "ACTIVE" },
  error: { bg: `${C.danger}15`, fg: C.danger, label: "ERROR" },
  never: { bg: `${C.textMuted}15`, fg: C.textMuted, label: "PENDING" },
};

const LANG_COLORS: Record<FeedStatus["language"], string> = {
  ar: "#9333ea", // purple for Arabic
  fr: "#0ea5e9", // sky for French
  en: "#10b981", // emerald for English
};

function DataSourcesPanel({
  status,
  loading,
  scraping,
  scrapeResult,
  onScrapeNow,
  onRefresh,
}: {
  status: ScraperStatus | null;
  loading: boolean;
  scraping: boolean;
  scrapeResult: ScrapeSummary | null;
  onScrapeNow: () => void;
  onRefresh: () => void;
}) {
  return (
    <div>
      {/* Header bar — title + actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
        <div>
          <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "4px" }}>
            Real RSS Pipeline
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: C.text, margin: 0 }}>
            Moroccan media feeds — 10 sources, every 30 min
          </h2>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={onRefresh}
            disabled={loading}
            style={{
              padding: "8px 14px",
              background: "transparent",
              border: `1px solid ${C.border}`,
              color: C.textBody,
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: C.fontSans,
            }}
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
          <button
            onClick={onScrapeNow}
            disabled={scraping}
            style={{
              padding: "8px 14px",
              background: scraping ? C.border : C.cta,
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: scraping ? "not-allowed" : "pointer",
              fontFamily: C.fontSans,
            }}
          >
            {scraping ? "Scraping…" : "Scrape now"}
          </button>
        </div>
      </div>

      {/* Summary KPI strip */}
      {status && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap: "1px", background: C.border, border: `1px solid ${C.border}`, borderRadius: "6px", overflow: "hidden", marginBottom: "24px" }}>
          <KpiCell label="Feeds active" value={status.summary.feedsActive} color={C.cta} />
          <KpiCell label="Feeds error" value={status.summary.feedsError} color={status.summary.feedsError > 0 ? C.danger : undefined} />
          <KpiCell label="Feeds pending" value={status.summary.feedsNever} color={C.textMuted} />
          <KpiCell label="Real articles" value={status.summary.totalRealArticles} color={C.cta} />
          <KpiCell label="Seed articles" value={status.summary.totalSeedArticles} color={C.textMuted} />
          <KpiCell label="Total articles" value={status.summary.totalArticles} />
          <KpiCell label="New (24h)" value={status.summary.newArticles24h} color={status.summary.newArticles24h > 0 ? C.cta : undefined} />
        </div>
      )}

      {/* Last scrape result (after a manual "Scrape now" run) */}
      {scrapeResult && (
        <div style={{ marginBottom: "24px", padding: "16px 20px", background: C.bgSubtle, border: `1px solid ${C.border}`, borderRadius: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
            <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.cta, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Last scrape result
            </div>
            <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted }}>
              {new Date(scrapeResult.completedAt).toLocaleString()} · {fmtDuration(scrapeResult.durationMs)}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 120px), 1fr))", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: C.fontMono, color: C.text }}>{scrapeResult.articlesFound}</div>
              <div style={{ fontSize: "9px", color: C.textMuted, fontFamily: C.fontMono, textTransform: "uppercase", letterSpacing: "0.1em" }}>Found</div>
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: C.fontMono, color: C.cta }}>{scrapeResult.articlesNew}</div>
              <div style={{ fontSize: "9px", color: C.textMuted, fontFamily: C.fontMono, textTransform: "uppercase", letterSpacing: "0.1em" }}>New</div>
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: C.fontMono, color: C.accent }}>{scrapeResult.articlesMatched}</div>
              <div style={{ fontSize: "9px", color: C.textMuted, fontFamily: C.fontMono, textTransform: "uppercase", letterSpacing: "0.1em" }}>Matched</div>
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: C.fontMono, color: scrapeResult.errors.length > 0 ? C.danger : C.textMuted }}>{scrapeResult.errors.length}</div>
              <div style={{ fontSize: "9px", color: C.textMuted, fontFamily: C.fontMono, textTransform: "uppercase", letterSpacing: "0.1em" }}>Errors</div>
            </div>
          </div>
          {scrapeResult.perFeed.some((f) => f.error) && (
            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${C.border}`, fontSize: "11px", color: C.danger, fontFamily: C.fontMono, lineHeight: 1.6 }}>
              {scrapeResult.perFeed.filter((f) => f.error).map((f) => (
                <div key={f.name}>· {f.name}: {f.error}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Per-feed table */}
      {!status ? (
        <EmptyState text={loading ? "Loading scraper status…" : "No scraper status available."} />
      ) : (
        <div style={{ border: `1px solid ${C.border}`, borderRadius: "6px", overflow: "hidden" }}>
          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(180px, 2fr) minmax(80px, 0.6fr) minmax(90px, 0.8fr) minmax(110px, 0.8fr) minmax(80px, 0.6fr) minmax(80px, 0.6fr) minmax(120px, 0.8fr)", gap: "1px", background: C.border, fontFamily: C.fontMono, fontSize: "9px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
            <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>Feed</div>
            <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>Lang</div>
            <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>Status</div>
            <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>Last scrape</div>
            <div style={{ background: C.bgSubtle, padding: "10px 14px", textAlign: "right" }}>Found</div>
            <div style={{ background: C.bgSubtle, padding: "10px 14px", textAlign: "right" }}>New</div>
            <div style={{ background: C.bgSubtle, padding: "10px 14px", textAlign: "right" }}>Ingested</div>
          </div>
          {/* Body rows */}
          {status.feeds.map((feed) => {
            const sc = STATUS_COLORS[feed.status];
            return (
              <div
                key={feed.name}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(180px, 2fr) minmax(80px, 0.6fr) minmax(90px, 0.8fr) minmax(110px, 0.8fr) minmax(80px, 0.6fr) minmax(80px, 0.6fr) minmax(120px, 0.8fr)",
                  gap: "1px",
                  background: C.border,
                  fontFamily: C.fontSans,
                  fontSize: "12px",
                  color: C.text,
                }}
              >
                <div style={{ background: C.bg, padding: "12px 14px" }}>
                  <div style={{ fontWeight: 600, color: C.text }}>{feed.name}</div>
                  <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {feed.url.replace(/^https?:\/\//, "")}
                  </div>
                  {feed.lastError && (
                    <div style={{ fontSize: "10px", color: C.danger, fontFamily: C.fontMono, marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {feed.lastError}
                    </div>
                  )}
                </div>
                <div style={{ background: C.bg, padding: "12px 14px" }}>
                  <span style={{ fontSize: "10px", fontFamily: C.fontMono, padding: "2px 8px", borderRadius: "2px", background: `${LANG_COLORS[feed.language]}15`, color: LANG_COLORS[feed.language], textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
                    {feed.language}
                  </span>
                </div>
                <div style={{ background: C.bg, padding: "12px 14px" }}>
                  <span style={{ fontSize: "10px", fontFamily: C.fontMono, padding: "2px 8px", borderRadius: "2px", background: sc.bg, color: sc.fg, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
                    {sc.label}
                  </span>
                  {feed.errorCount24h > 0 && (
                    <div style={{ fontSize: "9px", color: C.danger, fontFamily: C.fontMono, marginTop: "4px" }}>
                      {feed.errorCount24h} err/24h
                    </div>
                  )}
                </div>
                <div style={{ background: C.bg, padding: "12px 14px", fontFamily: C.fontMono, fontSize: "11px", color: C.textBody }}>
                  <div>{fmtRelative(feed.lastScrapeAt)}</div>
                  {feed.lastDurationMs != null && (
                    <div style={{ fontSize: "9px", color: C.textMuted, marginTop: "2px" }}>{fmtDuration(feed.lastDurationMs)}</div>
                  )}
                </div>
                <div style={{ background: C.bg, padding: "12px 14px", textAlign: "right", fontFamily: C.fontMono, fontSize: "12px", color: C.textBody }}>
                  {feed.lastArticlesFound}
                </div>
                <div style={{ background: C.bg, padding: "12px 14px", textAlign: "right", fontFamily: C.fontMono, fontSize: "12px", color: feed.lastArticlesNew > 0 ? C.cta : C.textBody, fontWeight: feed.lastArticlesNew > 0 ? 700 : 400 }}>
                  {feed.lastArticlesNew}
                </div>
                <div style={{ background: C.bg, padding: "12px 14px", textAlign: "right", fontFamily: C.fontMono, fontSize: "12px", color: feed.articlesIngested > 0 ? C.text : C.textMuted, fontWeight: feed.articlesIngested > 0 ? 700 : 400 }}>
                  {feed.articlesIngested}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footnote */}
      <div style={{ marginTop: "16px", fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono, lineHeight: 1.6 }}>
        Cron runs every 30 min (Vercel schedule <code style={{ background: C.bgSubtle, padding: "1px 4px", borderRadius: "2px" }}>*&#x2F;30 * * * *</code>).
        Each feed has a 15s timeout. Articles are deduped by SHA-256 URL hash.
        New articles run through the Darija NLP pipeline (detectLanguage + analyzeSentiment + extractEntities) and are matched against the Company table by name + aliases.
        Articles that mention no tracked company are still inserted (companyId = null) — they remain queryable in the news feed.
      </div>
    </div>
  );
}
