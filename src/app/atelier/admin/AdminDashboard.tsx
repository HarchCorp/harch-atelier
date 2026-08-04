"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { C } from "../components/tokens";
import { AuditLogViewer } from "./AuditLogViewer";
import {
  Inbox,
  Users,
  AlertTriangle,
  ScrollText,
  MessageSquare,
  Search,
  Plus,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  X,
  Sparkles,
  Loader2,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
//  ADMIN DASHBOARD — Ultra-complete founder control center
//
//  5 tabs (enterprise-grade, Stripe Dashboard + Linear inspired):
//    1. Requests    — access requests w/ status workflow
//    2. Accounts    — all users + Create Account modal (custom pricing)
//    3. Errors      — SystemLog viewer w/ level filter
//    4. Audit Trail — wraps the existing AuditLogViewer
//    5. WhatsApp    — paste conversation → GLM-4 → review form → create account
//
//  Task ID: ADMIN-1
// ═══════════════════════════════════════════════════════════════

// ─── TYPES ────────────────────────────────────────────────────────

type Tab = "requests" | "accounts" | "logs" | "audit" | "whatsapp";

type RequestStatus =
  | "pending"
  | "interested"
  | "not_interested"
  | "recontact_later"
  | "converted";

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

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  accountType: string;
  status: string;
  companyId: string | null;
  companyName: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  onboardingCompleted: boolean;
}

interface SystemLog {
  id: string;
  level: string;
  category: string;
  message: string;
  metadata: unknown;
  createdAt: string;
}

interface AdminStats {
  users: {
    total: number;
    "brand-monitor": number;
    "market-competitor": number;
    "investment-bank": number;
    "harch-alpha": number;
  };
  requests: { pending: number; accepted: number };
  invitations: { active: number; used: number };
  data: {
    articles: number;
    companies: number;
    assets: number;
    portfolios: number;
    dossiers: number;
  };
}

interface WhatsAppExtraction {
  company_name: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  plan_tier: "emergence" | "corporate" | "sovereign" | "custom" | null;
  pricing_mad: number | null;
  topics: string[];
  competitors: string[];
  use_case: string | null;
  notes: string | null;
}

interface CreatedAccount {
  success: true;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    accountType: string;
    status: string;
    companyId: string | null;
    temporaryPassword: string;
  };
  company: {
    id: string;
    name: string;
    slug: string;
    sector: string;
    created: boolean;
  };
  invitation: {
    id: string;
    token: string;
    url: string;
    expiresAt: string;
  };
  pricing: {
    planTier: string;
    customPriceMAD: number | null;
    expirationDays: number | null;
  };
}

// ─── SHARED STYLE CONSTANTS ───────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "10px",
  fontFamily: C.fontMono,
  color: C.textMuted,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  marginBottom: "6px",
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: `1px solid ${C.border}`,
  borderRadius: "5px",
  fontFamily: C.fontSans,
  fontSize: "13px",
  color: C.text,
  background: C.bg,
  boxSizing: "border-box",
  outline: "none",
  transition: "border-color 0.15s",
};

const monoInputStyle: React.CSSProperties = {
  ...inputStyle,
  fontFamily: C.fontMono,
  fontSize: "12px",
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("requests");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state — Create Account
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalSeed, setCreateModalSeed] = useState<Partial<WhatsAppExtraction> | null>(null);

  const fetchCore = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, invRes, statsRes] = await Promise.all([
        fetch("/api/admin/requests"),
        fetch("/api/admin/invitations"),
        fetch("/api/admin/stats"),
      ]);
      if (reqRes.ok) {
        const d = await reqRes.json();
        setRequests(d.requests || []);
      }
      if (invRes.ok) {
        const d = await invRes.json();
        setInvitations(d.invitations || []);
      }
      if (statsRes.ok) setStats(await statsRes.json());
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        setUsers(d.users || []);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchCore();
  }, [fetchCore]);

  useEffect(() => {
    if (tab === "accounts") fetchUsers();
  }, [tab, fetchUsers]);

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const interestedRequests = requests.filter((r) => r.status === "interested");
  const convertedRequests = requests.filter((r) => r.status === "converted");

  const openCreateModal = (seed?: Partial<WhatsAppExtraction>) => {
    setCreateModalSeed(seed ?? null);
    setShowCreateModal(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bgSubtle, fontFamily: C.fontSans, display: "flex" }}>
      {/* ═══ DARK SIDEBAR ═══ */}
      <aside
        style={{
          width: "248px",
          flexShrink: 0,
          background: C.bgDark,
          color: C.textOnDark,
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          borderRight: `1px solid ${C.borderDark}`,
        }}
      >
        {/* Brand */}
        <div style={{ padding: "22px 22px 18px", borderBottom: `1px solid ${C.borderDark}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                background: C.cta,
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={18} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "-0.01em" }}>
                HarchIQ
              </div>
              <div
                style={{
                  fontSize: "9px",
                  fontFamily: C.fontMono,
                  color: C.textOnDarkMuted,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  marginTop: "2px",
                }}
              >
                Admin Console
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 12px", overflowY: "auto" }}>
          <SidebarItem
            active={tab === "requests"}
            onClick={() => setTab("requests")}
            icon={<Inbox size={16} />}
            label="Requests"
            badge={pendingRequests.length > 0 ? pendingRequests.length : undefined}
          />
          <SidebarItem
            active={tab === "accounts"}
            onClick={() => setTab("accounts")}
            icon={<Users size={16} />}
            label="Accounts"
            badge={stats?.users.total}
          />
          <SidebarItem
            active={tab === "logs"}
            onClick={() => setTab("logs")}
            icon={<AlertTriangle size={16} />}
            label="Errors & Logs"
          />
          <SidebarItem
            active={tab === "audit"}
            onClick={() => setTab("audit")}
            icon={<ScrollText size={16} />}
            label="Audit Trail"
          />
          <SidebarItem
            active={tab === "whatsapp"}
            onClick={() => setTab("whatsapp")}
            icon={<MessageSquare size={16} />}
            label="WhatsApp Import"
            highlight
          />
        </nav>

        {/* Footer */}
        <div style={{ padding: "16px 22px", borderTop: `1px solid ${C.borderDark}` }}>
          <a
            href="/atelier/console"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: C.textOnDarkBody,
              textDecoration: "none",
              marginBottom: "10px",
            }}
          >
            <ArrowUpRight size={14} />
            Back to Console
          </a>
          <button
            onClick={() => {
              if (confirm("Sign out of admin?")) window.location.href = "/api/auth/signout";
            }}
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "transparent",
              border: `1px solid ${C.borderDark}`,
              color: C.textOnDarkBody,
              borderRadius: "5px",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: C.fontMono,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <header
          style={{
            background: C.bg,
            borderBottom: `1px solid ${C.border}`,
            padding: "16px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.01em" }}>
              {tabTitle(tab)}
            </h1>
            <div
              style={{
                fontSize: "11px",
                color: C.textMuted,
                fontFamily: C.fontMono,
                marginTop: "3px",
                letterSpacing: "0.04em",
              }}
            >
              {tabSubtitle(tab)}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={() => {
                fetchCore();
                if (tab === "accounts") fetchUsers();
              }}
              style={{
                padding: "8px 12px",
                background: "transparent",
                border: `1px solid ${C.border}`,
                color: C.textBody,
                borderRadius: "5px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <RefreshCw size={13} />
              Refresh
            </button>
            <button
              onClick={() => openCreateModal()}
              style={{
                padding: "8px 14px",
                background: C.cta,
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: `0 1px 2px ${C.cta}40`,
              }}
            >
              <Plus size={14} strokeWidth={2.5} />
              New Account
            </button>
          </div>
        </header>

        {/* KPI strip — always visible */}
        {stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
              gap: "1px",
              background: C.border,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <KpiCell label="Total users" value={stats.users.total} sub={`${stats.users["brand-monitor"]}BM · ${stats.users["market-competitor"]}MC · ${stats.users["investment-bank"]}IB · ${stats.users["harch-alpha"]}HA`} />
            <KpiCell label="Pending requests" value={pendingRequests.length} color={pendingRequests.length > 0 ? C.warning : undefined} />
            <KpiCell label="Interested" value={interestedRequests.length} color={interestedRequests.length > 0 ? C.cta : undefined} />
            <KpiCell label="Converted" value={convertedRequests.length} color={convertedRequests.length > 0 ? C.cta : undefined} />
            <KpiCell label="Active invites" value={stats.invitations.active} color={stats.invitations.active > 0 ? C.cta : undefined} />
            <KpiCell label="Companies" value={stats.data.companies} />
            <KpiCell label="Articles" value={stats.data.articles} />
          </div>
        )}

        {/* Tab content */}
        <main style={{ flex: 1, padding: "28px 32px 64px", maxWidth: "1440px", width: "100%" }}>
          {loading && tab !== "audit" && tab !== "logs" && tab !== "whatsapp" ? (
            <LoadingState />
          ) : tab === "requests" ? (
            <RequestsTab
              requests={requests}
              invitations={invitations}
              onStatusChanged={fetchCore}
              onAcceptRequest={(r) => openCreateModal({
                company_name: r.company,
                contact_name: r.name,
                email: r.email,
                phone: r.phone,
                use_case: r.useCase,
                notes: r.message,
              })}
            />
          ) : tab === "accounts" ? (
            <AccountsTab users={users} loading={loading} onCreate={() => openCreateModal()} />
          ) : tab === "logs" ? (
            <LogsTab />
          ) : tab === "audit" ? (
            <AuditLogViewer />
          ) : (
            <WhatsAppTab onCreateFromExtraction={(ext) => openCreateModal(ext)} />
          )}
        </main>
      </div>

      {/* ═══ CREATE ACCOUNT MODAL ═══ */}
      {showCreateModal && (
        <CreateAccountModal
          seed={createModalSeed}
          onClose={() => {
            setShowCreateModal(false);
            setCreateModalSeed(null);
          }}
          onCreated={() => {
            fetchCore();
            if (tab === "accounts") fetchUsers();
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SIDEBAR ITEM
// ═══════════════════════════════════════════════════════════════

function SidebarItem({
  active,
  onClick,
  icon,
  label,
  badge,
  highlight,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "9px 12px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: active ? "rgba(255,255,255,0.06)" : "transparent",
        border: "none",
        color: active ? C.textOnDark : C.textOnDarkBody,
        fontFamily: C.fontSans,
        fontSize: "13px",
        fontWeight: active ? 600 : 500,
        cursor: "pointer",
        borderRadius: "6px",
        marginBottom: "2px",
        transition: "all 0.15s",
        textAlign: "left",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      {active && (
        <span
          style={{
            position: "absolute",
            left: 0,
            top: "8px",
            bottom: "8px",
            width: "3px",
            background: highlight ? C.cta : C.textOnDark,
            borderRadius: "0 2px 2px 0",
          }}
        />
      )}
      <span style={{ opacity: active ? 1 : 0.7, display: "flex", flexShrink: 0 }}>
        {icon}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && badge > 0 && (
        <span
          style={{
            fontSize: "10px",
            fontFamily: C.fontMono,
            fontWeight: 700,
            padding: "1px 7px",
            borderRadius: "8px",
            background: highlight ? `${C.cta}25` : "rgba(255,255,255,0.1)",
            color: highlight ? C.ctaHover : C.textOnDark,
            minWidth: "20px",
            textAlign: "center",
          }}
        >
          {badge}
        </span>
      )}
      {highlight && (
        <Sparkles size={12} color={C.cta} style={{ flexShrink: 0 }} />
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
//  KPI CELL
// ═══════════════════════════════════════════════════════════════

function KpiCell({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: number | string;
  sub?: string;
  color?: string;
}) {
  return (
    <div style={{ background: C.bg, padding: "16px 20px" }}>
      <div
        style={{
          fontSize: "26px",
          fontWeight: 800,
          fontFamily: C.fontMono,
          color: color || C.text,
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "9px",
          color: C.textMuted,
          fontFamily: C.fontMono,
          marginTop: "7px",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      {sub && (
        <div
          style={{
            fontSize: "9px",
            color: C.textMuted,
            fontFamily: C.fontMono,
            marginTop: "3px",
            opacity: 0.8,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  REQUESTS TAB — table with status dropdown + expandable rows
// ═══════════════════════════════════════════════════════════════

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: C.warning, bg: C.warningBg },
  interested: { label: "Interested", color: C.cta, bg: C.successBg },
  not_interested: { label: "Not Interested", color: C.danger, bg: C.dangerBg },
  recontact_later: { label: "Recontact Later", color: "#9333ea", bg: "#faf5ff" },
  converted: { label: "Converted", color: C.cta, bg: C.successBg },
  accepted: { label: "Accepted", color: C.cta, bg: C.successBg },
  rejected: { label: "Rejected", color: C.danger, bg: C.dangerBg },
};

function RequestsTab({
  requests,
  invitations,
  onStatusChanged,
  onAcceptRequest,
}: {
  requests: AccessRequest[];
  invitations: Invitation[];
  onStatusChanged: () => void;
  onAcceptRequest: (r: AccessRequest) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          r.email.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          (r.company?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [requests, statusFilter, search]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of requests) {
      counts[r.status] = (counts[r.status] || 0) + 1;
    }
    return counts;
  }, [requests]);

  return (
    <div>
      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "16px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search
            size={14}
            color={C.textMuted}
            style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or company..."
            style={{ ...inputStyle, paddingLeft: "32px" }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ ...monoInputStyle, minWidth: "180px", cursor: "pointer" }}
        >
          <option value="all">All statuses ({requests.length})</option>
          <option value="pending">Pending ({statusCounts.pending || 0})</option>
          <option value="interested">Interested ({statusCounts.interested || 0})</option>
          <option value="not_interested">Not Interested ({statusCounts.not_interested || 0})</option>
          <option value="recontact_later">Recontact Later ({statusCounts.recontact_later || 0})</option>
          <option value="converted">Converted ({statusCounts.converted || 0})</option>
          <option value="accepted">Accepted — legacy ({statusCounts.accepted || 0})</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState text={requests.length === 0 ? "No access requests yet." : "No requests match your filter."} />
      ) : (
        <div
          style={{
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            overflow: "hidden",
            background: C.bg,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(180px, 2fr) minmax(140px, 1.4fr) minmax(120px, 1fr) minmax(140px, 1fr) 170px 40px",
              gap: "1px",
              background: C.border,
              fontFamily: C.fontMono,
              fontSize: "9px",
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              fontWeight: 700,
            }}
          >
            <div style={{ background: C.bgSubtle, padding: "10px 16px" }}>Contact</div>
            <div style={{ background: C.bgSubtle, padding: "10px 16px" }}>Company</div>
            <div style={{ background: C.bgSubtle, padding: "10px 16px" }}>Account type</div>
            <div style={{ background: C.bgSubtle, padding: "10px 16px" }}>Created</div>
            <div style={{ background: C.bgSubtle, padding: "10px 16px" }}>Status</div>
            <div style={{ background: C.bgSubtle, padding: "10px 16px" }}></div>
          </div>

          {filtered.map((r) => (
            <RequestRow
              key={r.id}
              request={r}
              expanded={expandedId === r.id}
              onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
              onStatusChanged={onStatusChanged}
              onAccept={() => onAcceptRequest(r)}
            />
          ))}
        </div>
      )}

      {/* Active invitations summary */}
      {invitations.length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <div
            style={{
              fontFamily: C.fontMono,
              fontSize: "10px",
              color: C.textMuted,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "12px",
              fontWeight: 600,
            }}
          >
            Active invitations ({invitations.filter((i) => !i.usedAt && new Date(i.expiresAt) > new Date()).length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {invitations.slice(0, 5).map((inv) => (
              <InvitationRow key={inv.id} invitation={inv} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RequestRow({
  request,
  expanded,
  onToggle,
  onStatusChanged,
  onAccept,
}: {
  request: AccessRequest;
  expanded: boolean;
  onToggle: () => void;
  onStatusChanged: () => void;
  onAccept: () => void;
}) {
  const [updating, setUpdating] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowStatusMenu(false);
      }
    }
    if (showStatusMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showStatusMenu]);

  const changeStatus = async (newStatus: string) => {
    setShowStatusMenu(false);
    if (newStatus === request.status) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        onStatusChanged();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error || "Failed to update status");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Network error");
    }
    setUpdating(false);
  };

  const meta = STATUS_META[request.status] || STATUS_META.pending;
  const typeLabel: Record<string, string> = {
    "brand-monitor": "Brand Monitor",
    "market-competitor": "Market & Competitor",
    "investment-bank": "Investment Bank",
    "harch-alpha": "Harch Alpha",
  };

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(180px, 2fr) minmax(140px, 1.4fr) minmax(120px, 1fr) minmax(140px, 1fr) 170px 40px",
          gap: "1px",
          background: C.border,
          fontFamily: C.fontSans,
          fontSize: "13px",
          cursor: "pointer",
          transition: "background 0.1s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = C.bgHover;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = C.bg;
        }}
        onClick={onToggle}
      >
        <div style={{ background: "inherit", padding: "12px 16px" }}>
          <div style={{ fontWeight: 600, color: C.text }}>{request.name}</div>
          <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono, marginTop: "2px" }}>
            {request.email}
          </div>
        </div>
        <div style={{ background: "inherit", padding: "12px 16px", color: C.textBody, fontSize: "12px" }}>
          {request.company || <span style={{ color: C.textMuted }}>—</span>}
        </div>
        <div style={{ background: "inherit", padding: "12px 16px" }}>
          {request.accountType ? (
            <span style={{ fontSize: "10px", fontFamily: C.fontMono, color: C.accent, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {typeLabel[request.accountType] || request.accountType}
            </span>
          ) : (
            <span style={{ color: C.textMuted }}>—</span>
          )}
        </div>
        <div style={{ background: "inherit", padding: "12px 16px", fontFamily: C.fontMono, fontSize: "11px", color: C.textBody }}>
          {new Date(request.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
        <div style={{ background: "inherit", padding: "10px 16px", position: "relative" }} ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowStatusMenu(!showStatusMenu);
            }}
            disabled={updating}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 9px",
              background: meta.bg,
              border: `1px solid ${meta.color}40`,
              color: meta.color,
              borderRadius: "12px",
              fontSize: "10px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: C.fontMono,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {updating ? <Loader2 size={11} className="animate-spin" /> : <ChevronDown size={11} />}
            {meta.label}
          </button>
          {showStatusMenu && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "0",
                marginTop: "4px",
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: "6px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                zIndex: 10,
                minWidth: "180px",
                padding: "4px",
              }}
            >
              {Object.entries(STATUS_META).filter(([k]) => k !== "accepted" && k !== "rejected").map(([key, m]) => (
                <button
                  key={key}
                  onClick={(e) => {
                    e.stopPropagation();
                    changeStatus(key);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "7px 10px",
                    background: "transparent",
                    border: "none",
                    color: request.status === key ? m.color : C.textBody,
                    fontFamily: C.fontSans,
                    fontSize: "12px",
                    cursor: "pointer",
                    textAlign: "left",
                    borderRadius: "4px",
                    fontWeight: request.status === key ? 600 : 400,
                  }}
                >
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: m.color, flexShrink: 0 }} />
                  {m.label}
                  {request.status === key && <Check size={12} style={{ marginLeft: "auto" }} />}
                </button>
              ))}
            </div>
          )}
        </div>
        <div
          style={{
            background: "inherit",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: C.textMuted,
          }}
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div
          style={{
            background: C.bgSubtle,
            borderBottom: `1px solid ${C.border}`,
            padding: "20px 24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
            gap: "20px",
          }}
        >
          <DetailGroup title="Contact">
            <DetailRow label="Email" value={request.email} mono />
            <DetailRow label="Phone" value={request.phone} mono />
            <DetailRow label="Country" value={request.country} />
            <DetailRow label="Role" value={request.role} />
            <DetailRow label="Referral" value={request.referralSource} />
          </DetailGroup>
          <DetailGroup title="Company">
            <DetailRow label="Company" value={request.company} />
            <DetailRow label="Size" value={sizeLabel(request.companySize)} />
            <DetailRow label="Account type" value={typeLabel[request.accountType || ""] || request.accountType} />
            <DetailRow label="Budget" value={request.budget} mono />
          </DetailGroup>
          <DetailGroup title="Use case & message">
            {request.useCase && (
              <div style={{ fontSize: "12px", color: C.textBody, lineHeight: 1.55, marginBottom: "10px" }}>
                <span style={{ fontSize: "9px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "4px", fontWeight: 600 }}>
                  Use case
                </span>
                {request.useCase}
              </div>
            )}
            {request.message && (
              <div style={{ fontSize: "12px", color: C.textBody, lineHeight: 1.55 }}>
                <span style={{ fontSize: "9px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "4px", fontWeight: 600 }}>
                  Message
                </span>
                {request.message}
              </div>
            )}
            {!request.useCase && !request.message && (
              <span style={{ color: C.textMuted, fontSize: "12px", fontFamily: C.fontMono }}>—</span>
            )}
          </DetailGroup>
          <DetailGroup title="Actions">
            {request.invitation ? (
              <div style={{ padding: "10px 12px", background: C.successBg, border: `1px solid ${C.cta}30`, borderRadius: "5px", fontSize: "12px", color: C.success, fontFamily: C.fontMono }}>
                ✓ Invitation sent
                <div style={{ fontSize: "10px", marginTop: "4px", color: C.textBody }}>
                  {request.invitation.usedAt ? "Used" : "Pending"}
                </div>
              </div>
            ) : (
              <button
                onClick={onAccept}
                style={{
                  padding: "9px 14px",
                  background: C.cta,
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <Plus size={13} strokeWidth={2.5} />
                Create Account
              </button>
            )}
          </DetailGroup>
        </div>
      )}
    </div>
  );
}

function InvitationRow({ invitation }: { invitation: Invitation }) {
  const [copied, setCopied] = useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://atelier.harchcorp.com";
  const url = `${baseUrl}/atelier/access?token=${invitation.token}`;

  const isExpired = new Date(invitation.expiresAt) < new Date();
  const isUsed = !!invitation.usedAt;

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
        gap: "12px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ minWidth: "200px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>{invitation.name}</div>
        <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono }}>{invitation.email}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span
          style={{
            fontSize: "10px",
            fontFamily: C.fontMono,
            padding: "3px 8px",
            borderRadius: "2px",
            background: isUsed ? C.successBg : isExpired ? C.dangerBg : C.warningBg,
            color: isUsed ? C.success : isExpired ? C.danger : C.warning,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 700,
          }}
        >
          {isUsed ? "Used" : isExpired ? "Expired" : "Active"}
        </span>
        {!isUsed && !isExpired && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            style={{
              padding: "5px 10px",
              background: "transparent",
              border: `1px solid ${C.border}`,
              color: C.textBody,
              borderRadius: "4px",
              fontSize: "11px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontFamily: C.fontMono,
            }}
          >
            {copied ? <Check size={11} color={C.success} /> : <Copy size={11} />}
            {copied ? "Copied" : "Copy link"}
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ACCOUNTS TAB — list of users + Create Account modal trigger
// ═══════════════════════════════════════════════════════════════

function AccountsTab({
  users,
  loading,
  onCreate,
}: {
  users: AdminUser[];
  loading: boolean;
  onCreate: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (filterType !== "all" && u.accountType !== filterType) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          u.email.toLowerCase().includes(q) ||
          (u.name?.toLowerCase().includes(q) ?? false) ||
          (u.companyName?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [users, search, filterType]);

  if (loading && users.length === 0) return <LoadingState />;

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search
            size={14}
            color={C.textMuted}
            style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email, or company..."
            style={{ ...inputStyle, paddingLeft: "32px" }}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ ...monoInputStyle, minWidth: "180px", cursor: "pointer" }}
        >
          <option value="all">All account types</option>
          <option value="brand-monitor">Brand Monitor</option>
          <option value="market-competitor">Market & Competitor</option>
          <option value="investment-bank">Investment Bank</option>
          <option value="harch-alpha">Harch Alpha</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState text={users.length === 0 ? "No users yet. Create the first one!" : "No users match your filter."} />
      ) : (
        <div style={{ border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden", background: C.bg }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(180px, 2fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(140px, 1.2fr) 100px 130px",
              gap: "1px",
              background: C.border,
              fontFamily: C.fontMono,
              fontSize: "9px",
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              fontWeight: 700,
            }}
          >
            <div style={{ background: C.bgSubtle, padding: "10px 16px" }}>User</div>
            <div style={{ background: C.bgSubtle, padding: "10px 16px" }}>Role</div>
            <div style={{ background: C.bgSubtle, padding: "10px 16px" }}>Account type</div>
            <div style={{ background: C.bgSubtle, padding: "10px 16px" }}>Company</div>
            <div style={{ background: C.bgSubtle, padding: "10px 16px" }}>Status</div>
            <div style={{ background: C.bgSubtle, padding: "10px 16px" }}>Last login</div>
          </div>
          <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {filtered.map((u) => (
              <UserRow key={u.id} user={u} />
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: "20px",
          fontSize: "11px",
          color: C.textMuted,
          fontFamily: C.fontMono,
        }}
      >
        Showing {filtered.length} of {users.length} users.
      </div>
    </div>
  );
}

function UserRow({ user }: { user: AdminUser }) {
  const typeLabel: Record<string, string> = {
    "brand-monitor": "Brand Monitor",
    "market-competitor": "Market & Comp.",
    "investment-bank": "Investment Bank",
    "harch-alpha": "Harch Alpha",
  };
  const roleLabel: Record<string, string> = {
    user: "User",
    admin: "Admin",
    "company-admin": "Team Admin",
  };
  const statusMeta: Record<string, { color: string; bg: string }> = {
    active: { color: C.cta, bg: C.successBg },
    suspended: { color: C.danger, bg: C.dangerBg },
    invited: { color: C.warning, bg: C.warningBg },
  };
  const sm = statusMeta[user.status] || statusMeta.active;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(180px, 2fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(140px, 1.2fr) 100px 130px",
        gap: "1px",
        background: C.border,
        fontFamily: C.fontSans,
        fontSize: "13px",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = C.bgHover;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = C.bg;
      }}
    >
      <div style={{ background: "inherit", padding: "12px 16px" }}>
        <div style={{ fontWeight: 600, color: C.text }}>{user.name || <span style={{ color: C.textMuted }}>—</span>}</div>
        <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono, marginTop: "2px" }}>{user.email}</div>
      </div>
      <div style={{ background: "inherit", padding: "12px 16px", fontSize: "12px", color: C.textBody }}>
        {roleLabel[user.role] || user.role}
      </div>
      <div style={{ background: "inherit", padding: "12px 16px" }}>
        <span style={{ fontSize: "10px", fontFamily: C.fontMono, color: C.accent, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {typeLabel[user.accountType] || user.accountType}
        </span>
      </div>
      <div style={{ background: "inherit", padding: "12px 16px", fontSize: "12px", color: C.textBody }}>
        {user.companyName || <span style={{ color: C.textMuted }}>—</span>}
      </div>
      <div style={{ background: "inherit", padding: "12px 16px" }}>
        <span
          style={{
            fontSize: "9px",
            fontFamily: C.fontMono,
            padding: "2px 7px",
            borderRadius: "2px",
            background: sm.bg,
            color: sm.color,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 700,
          }}
        >
          {user.status}
        </span>
      </div>
      <div style={{ background: "inherit", padding: "12px 16px", fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono }}>
        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  LOGS TAB — system logs viewer with level filter + expandable
// ═══════════════════════════════════════════════════════════════

function LogsTab() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [errors24h, setErrors24h] = useState<number | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (level !== "all") params.set("level", level);
      const res = await fetch(`/api/admin/logs?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      setLogs(d.data || []);
      setTotal(d.pagination?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLogs([]);
    }
    setLoading(false);
  }, [page, level]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Fetch error count for last 24h
  useEffect(() => {
    fetch("/api/admin/logs?level=error&limit=1&page=1", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setErrors24h(d.pagination?.total ?? null))
      .catch(() => setErrors24h(null));
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / 50));

  return (
    <div>
      {/* Stats strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
          gap: "1px",
          background: C.border,
          border: `1px solid ${C.border}`,
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <KpiCell
          label="Errors (24h)"
          value={errors24h ?? "—"}
          color={errors24h != null && errors24h > 0 ? C.danger : undefined}
        />
        <KpiCell label="Total logs (filtered)" value={total} />
        <KpiCell label="Current page" value={`${page}/${totalPages}`} />
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "center" }}>
        <select
          value={level}
          onChange={(e) => {
            setLevel(e.target.value);
            setPage(1);
          }}
          style={{ ...monoInputStyle, minWidth: "160px", cursor: "pointer" }}
        >
          <option value="all">All levels</option>
          <option value="error">Error</option>
          <option value="warn">Warning</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
          <option value="fatal">Fatal</option>
        </select>
        <button
          onClick={fetchLogs}
          disabled={loading}
          style={{
            padding: "8px 12px",
            background: "transparent",
            border: `1px solid ${C.border}`,
            color: C.textBody,
            borderRadius: "5px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: C.dangerBg,
            border: `1px solid ${C.danger}33`,
            borderRadius: "6px",
            color: C.danger,
            fontFamily: C.fontMono,
            fontSize: "12px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      {loading && logs.length === 0 ? (
        <LoadingState />
      ) : logs.length === 0 ? (
        <EmptyState text="No system logs match your filter." />
      ) : (
        <div style={{ border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden", background: C.bg }}>
          {logs.map((log) => (
            <LogRow
              key={log.id}
              log={log}
              expanded={expandedId === log.id}
              onToggle={() => setExpandedId(expandedId === log.id ? null : log.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "8px", marginTop: "16px", alignItems: "center", justifyContent: "center" }}>
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            style={{
              padding: "6px 12px",
              background: "transparent",
              border: `1px solid ${C.border}`,
              color: page <= 1 ? C.textMuted : C.textBody,
              borderRadius: "4px",
              fontSize: "12px",
              cursor: page <= 1 ? "not-allowed" : "pointer",
            }}
          >
            ← Prev
          </button>
          <span style={{ fontSize: "12px", fontFamily: C.fontMono, color: C.textMuted }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            style={{
              padding: "6px 12px",
              background: "transparent",
              border: `1px solid ${C.border}`,
              color: page >= totalPages ? C.textMuted : C.textBody,
              borderRadius: "4px",
              fontSize: "12px",
              cursor: page >= totalPages ? "not-allowed" : "pointer",
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function LogRow({
  log,
  expanded,
  onToggle,
}: {
  log: SystemLog;
  expanded: boolean;
  onToggle: () => void;
}) {
  const levelMeta: Record<string, { color: string; bg: string }> = {
    error: { color: C.danger, bg: C.dangerBg },
    fatal: { color: C.danger, bg: C.dangerBg },
    warn: { color: C.warning, bg: C.warningBg },
    info: { color: C.cta, bg: C.successBg },
    debug: { color: C.textMuted, bg: C.bgSubtle },
  };
  const m = levelMeta[log.level] || levelMeta.info;

  const metadata = log.metadata as Record<string, unknown> | null;
  const stackTrace =
    metadata && typeof metadata === "object" && "stack" in metadata
      ? String((metadata as Record<string, unknown>).stack)
      : metadata && typeof metadata === "object" && "err" in metadata
        ? String((metadata as Record<string, unknown>).err)
        : null;

  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>
      <div
        onClick={onToggle}
        style={{
          display: "grid",
          gridTemplateColumns: "90px 130px minmax(160px, 1fr) minmax(140px, 1fr) 30px",
          gap: "12px",
          padding: "12px 16px",
          cursor: "pointer",
          transition: "background 0.1s",
          alignItems: "center",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = C.bgHover;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        <span
          style={{
            fontSize: "9px",
            fontFamily: C.fontMono,
            padding: "3px 8px",
            borderRadius: "2px",
            background: m.bg,
            color: m.color,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 700,
            textAlign: "center",
            justifySelf: "start",
          }}
        >
          {log.level}
        </span>
        <span style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted }}>
          {new Date(log.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
        <span style={{ fontSize: "12px", color: C.textBody, fontFamily: C.fontSans, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {log.message}
        </span>
        <span style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.accent }}>
          {log.category}
        </span>
        <span style={{ color: C.textMuted, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </div>

      {expanded && (
        <div style={{ padding: "0 16px 16px 48px", background: C.bgSubtle }}>
          <div style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.textBody, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            <div style={{ marginBottom: "8px" }}>
              <span style={{ color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "9px", fontWeight: 600 }}>Full message:</span>
              <div style={{ marginTop: "4px" }}>{log.message}</div>
            </div>
            {metadata && Object.keys(metadata).length > 0 && (
              <div style={{ marginBottom: "8px" }}>
                <span style={{ color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "9px", fontWeight: 600 }}>Metadata:</span>
                <pre style={{ marginTop: "4px", padding: "10px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "4px", fontSize: "11px", overflowX: "auto" }}>
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              </div>
            )}
            {stackTrace && (
              <div>
                <span style={{ color: C.danger, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "9px", fontWeight: 600 }}>Stack trace:</span>
                <pre style={{ marginTop: "4px", padding: "10px", background: C.dangerBg, border: `1px solid ${C.danger}30`, borderRadius: "4px", fontSize: "11px", color: C.danger, overflowX: "auto", whiteSpace: "pre-wrap" }}>
                  {stackTrace}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  WHATSAPP IMPORT TAB — paste → AI extract → review → create
// ═══════════════════════════════════════════════════════════════

function WhatsAppTab({
  onCreateFromExtraction,
}: {
  onCreateFromExtraction: (ext: WhatsAppExtraction) => void;
}) {
  const [conversation, setConversation] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<WhatsAppExtraction | null>(null);
  const [meta, setMeta] = useState<{ chars: number; model: string; generatedAt: string } | null>(null);

  const analyze = async () => {
    if (conversation.trim().length < 30) {
      setError("Please paste at least 30 characters of conversation.");
      return;
    }
    setAnalyzing(true);
    setError(null);
    setExtraction(null);
    setMeta(null);
    try {
      const res = await fetch("/api/admin/whatsapp-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation }),
      });
      const d = await res.json();
      if (res.ok && d.success) {
        setExtraction(d.extraction);
        setMeta({
          chars: d.rawConversationChars,
          model: d.model,
          generatedAt: d.generatedAt,
        });
      } else {
        setError(d.error || "Extraction failed");
        if (d.detail) setError(`${d.error || "Extraction failed"} — ${d.detail}`);
        if (d.rawPreview) {
          console.warn("[whatsapp-import] Raw LLM preview:", d.rawPreview);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    }
    setAnalyzing(false);
  };

  const reset = () => {
    setConversation("");
    setExtraction(null);
    setMeta(null);
    setError(null);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
      {/* Hero */}
      <div
        style={{
          padding: "24px 28px",
          background: `linear-gradient(135deg, ${C.bgDark} 0%, #1f1f1f 100%)`,
          borderRadius: "10px",
          color: C.textOnDark,
          border: `1px solid ${C.borderDark}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <Sparkles size={18} color={C.cta} />
          <span style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.ctaHover, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700 }}>
            Killer Feature
          </span>
        </div>
        <h2 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.01em" }}>
          WhatsApp → AI → Account Creation
        </h2>
        <p style={{ fontSize: "13px", color: C.textOnDarkBody, margin: 0, lineHeight: 1.6, maxWidth: "640px" }}>
          Paste a WhatsApp conversation with a prospect. GLM-4 extracts the company name, contact, plan tier, pricing, topics, competitors, and use case — then you review & create the account in one click.
        </p>
      </div>

      {/* Two-column layout: paste on left, extraction on right */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "20px", alignItems: "start" }}>
        {/* LEFT — paste textarea */}
        <div
          style={{
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            padding: "20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>WhatsApp conversation</label>
            <span style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono }}>
              {conversation.length} chars
            </span>
          </div>
          <textarea
            value={conversation}
            onChange={(e) => setConversation(e.target.value)}
            placeholder={`Paste the WhatsApp conversation here.

Example:
[10:42] +212 6 12 34 56 78: Bonjour, on a vu votre deck sur la veille réputationnelle. On est chez Maroc Telecom, on cherche à surveiller notre image pendant le rebranding.
[10:43] Harch: Salim, ravi de vous lire. Quel budget mensuel?
[10:44] +212 6 12 34 56 78: On a pensé 50K MAD/mois. On veut suivre Attijariwafa et Bank of Africa comme concurrents. Surtout les sujets ESG et le risque de boycott.
[10:45] Harch: Parfait — ça correspond à notre plan Corporate. Je vous envoie une invitation?`}
            rows={18}
            style={{
              ...inputStyle,
              fontFamily: C.fontMono,
              fontSize: "12px",
              resize: "vertical",
              minHeight: "320px",
              lineHeight: 1.5,
            }}
          />
          <div style={{ display: "flex", gap: "8px", marginTop: "12px", alignItems: "center" }}>
            <button
              onClick={analyze}
              disabled={analyzing || conversation.trim().length < 30}
              style={{
                padding: "10px 18px",
                background: conversation.trim().length < 30 || analyzing ? C.border : C.cta,
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: conversation.trim().length < 30 || analyzing ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {analyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {analyzing ? "Analyzing with GLM-4..." : "Analyze with AI"}
            </button>
            {extraction && (
              <button
                onClick={reset}
                style={{
                  padding: "10px 14px",
                  background: "transparent",
                  border: `1px solid ${C.border}`,
                  color: C.textBody,
                  borderRadius: "5px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Reset
              </button>
            )}
          </div>
          {error && (
            <div
              style={{
                marginTop: "12px",
                padding: "10px 12px",
                background: C.dangerBg,
                border: `1px solid ${C.danger}33`,
                borderRadius: "5px",
                color: C.danger,
                fontFamily: C.fontMono,
                fontSize: "11px",
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* RIGHT — extraction review */}
        <div
          style={{
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            padding: "20px",
            minHeight: "400px",
          }}
        >
          {!extraction ? (
            <div
              style={{
                padding: "60px 20px",
                textAlign: "center",
                color: C.textMuted,
                fontFamily: C.fontMono,
                fontSize: "12px",
                lineHeight: 1.6,
              }}
            >
              <MessageSquare size={32} color={C.border} style={{ margin: "0 auto 12px" }} />
              <div>The extracted data will appear here.</div>
              <div style={{ marginTop: "4px", fontSize: "10px" }}>Paste a conversation on the left and click "Analyze with AI".</div>
            </div>
          ) : (
            <ExtractionReview
              extraction={extraction}
              meta={meta}
              onCreate={() => onCreateFromExtraction(extraction)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ExtractionReview({
  extraction,
  meta,
  onCreate,
}: {
  extraction: WhatsAppExtraction;
  meta: { chars: number; model: string; generatedAt: string } | null;
  onCreate: () => void;
}) {
  const planTierLabel: Record<string, string> = {
    emergence: "Émergence (~15K MAD/mo)",
    corporate: "Corporate (~40K MAD/mo)",
    sovereign: "Sovereign (~75K MAD/mo)",
    custom: "Custom pricing",
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <Check size={14} color={C.cta} />
        <span style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.cta, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>
          Extracted by GLM-4
        </span>
        {meta && (
          <span style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono, marginLeft: "auto" }}>
            {meta.chars} chars · {new Date(meta.generatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
        <ReviewField label="Company name" value={extraction.company_name} />
        <ReviewField label="Contact name" value={extraction.contact_name} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
        <ReviewField label="Email" value={extraction.email} mono />
        <ReviewField label="Phone" value={extraction.phone} mono />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
        <ReviewField label="Plan tier" value={extraction.plan_tier ? planTierLabel[extraction.plan_tier] || extraction.plan_tier : null} />
        <ReviewField
          label="Pricing (MAD/mo)"
          value={extraction.pricing_mad != null ? `${extraction.pricing_mad.toLocaleString()} MAD` : null}
          mono
          highlight={extraction.pricing_mad != null}
        />
      </div>

      {extraction.topics.length > 0 && (
        <ReviewChips label="Topics to monitor" items={extraction.topics} color={C.accent} />
      )}
      {extraction.competitors.length > 0 && (
        <ReviewChips label="Competitors to track" items={extraction.competitors} color="#9333ea" />
      )}

      {extraction.use_case && (
        <div style={{ marginBottom: "14px" }}>
          <label style={labelStyle}>Use case</label>
          <div style={{ fontSize: "12px", color: C.textBody, lineHeight: 1.55, padding: "10px 12px", background: C.bgSubtle, borderRadius: "5px" }}>
            {extraction.use_case}
          </div>
        </div>
      )}

      {extraction.notes && (
        <div style={{ marginBottom: "14px" }}>
          <label style={labelStyle}>Notes</label>
          <div style={{ fontSize: "12px", color: C.textBody, lineHeight: 1.55, padding: "10px 12px", background: C.warningBg, border: `1px solid ${C.warningBorder}40`, borderRadius: "5px" }}>
            {extraction.notes}
          </div>
        </div>
      )}

      <button
        onClick={onCreate}
        style={{
          width: "100%",
          padding: "12px 16px",
          background: C.cta,
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontSize: "13px",
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginTop: "8px",
          boxShadow: `0 1px 2px ${C.cta}40`,
        }}
      >
        <Plus size={15} strokeWidth={2.5} />
        Review & Create Account
      </button>
      <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono, textAlign: "center", marginTop: "8px" }}>
        Opens the Create Account modal pre-filled with this data. You can edit before creating.
      </div>
    </div>
  );
}

function ReviewField({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div
        style={{
          padding: "9px 12px",
          background: highlight ? C.successBg : C.bgSubtle,
          border: `1px solid ${highlight ? `${C.cta}40` : C.border}`,
          borderRadius: "5px",
          fontSize: "12px",
          fontFamily: mono ? C.fontMono : C.fontSans,
          color: value ? (highlight ? C.cta : C.text) : C.textMuted,
          minHeight: "36px",
          display: "flex",
          alignItems: "center",
        }}
      >
        {value || <span style={{ fontStyle: "italic", opacity: 0.6 }}>not extracted</span>}
      </div>
    </div>
  );
}

function ReviewChips({
  label,
  items,
  color,
}: {
  label: string;
  items: string[];
  color: string;
}) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={labelStyle}>{label} ({items.length})</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {items.map((item, i) => (
          <span
            key={i}
            style={{
              fontSize: "11px",
              fontFamily: C.fontSans,
              padding: "4px 10px",
              background: `${color}15`,
              color: color,
              borderRadius: "12px",
              fontWeight: 500,
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  CREATE ACCOUNT MODAL — custom pricing + expiration
// ═══════════════════════════════════════════════════════════════

const EXPIRATION_PRESETS = [
  { value: "7", label: "7 days (1 week)" },
  { value: "14", label: "14 days (2 weeks)" },
  { value: "28", label: "28 days (4 weeks)" },
  { value: "30", label: "1 month (30 days)" },
  { value: "60", label: "2 months (60 days)" },
  { value: "365", label: "1 year (365 days)" },
  { value: "730", label: "2 years (730 days)" },
  { value: "custom", label: "Custom date..." },
];

function CreateAccountModal({
  seed,
  onClose,
  onCreated,
}: {
  seed: Partial<WhatsAppExtraction> | null;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [email, setEmail] = useState(seed?.email || "");
  const [name, setName] = useState(seed?.contact_name || "");
  const [companyName, setCompanyName] = useState(seed?.company_name || "");
  const [phone, setPhone] = useState(seed?.phone || "");
  const [accountType, setAccountType] = useState("brand-monitor");
  const [planTier, setPlanTier] = useState<"emergence" | "corporate" | "sovereign" | "custom">(
    (seed?.plan_tier as "emergence" | "corporate" | "sovereign" | "custom") || "corporate",
  );
  const [customPrice, setCustomPrice] = useState<string>(
    seed?.pricing_mad != null ? String(seed.pricing_mad) : "",
  );
  const [expirationPreset, setExpirationPreset] = useState<string>("28");
  const [customDate, setCustomDate] = useState<string>("");
  const [topics, setTopics] = useState<string>((seed?.topics || []).join(", "));
  const [competitors, setCompetitors] = useState<string>((seed?.competitors || []).join(", "));
  const [useCase, setUseCase] = useState<string>(seed?.use_case || "");
  const [notes, setNotes] = useState<string>(seed?.notes || "");

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedAccount | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);
    if (!email.trim() || !email.includes("@")) {
      setError("A valid email is required.");
      return;
    }
    if (!name.trim()) {
      setError("A name is required.");
      return;
    }
    if (!companyName.trim()) {
      setError("A company name is required.");
      return;
    }

    let expirationDays: number | null = null;
    let expirationDate: string | null = null;
    if (expirationPreset === "custom") {
      if (!customDate) {
        setError("Pick a custom expiration date.");
        return;
      }
      expirationDate = customDate;
    } else {
      expirationDays = parseInt(expirationPreset, 10);
    }

    const parsedPrice = customPrice.trim()
      ? Number(customPrice.replace(/[,\s]/g, "").replace(/k$/i, "000"))
      : null;

    setCreating(true);
    try {
      const res = await fetch("/api/admin/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim(),
          companyName: companyName.trim(),
          planTier,
          customPriceMAD: parsedPrice,
          expirationDays,
          expirationDate,
          accountType,
          phone: phone.trim() || null,
          topics: topics.split(",").map((s) => s.trim()).filter(Boolean),
          competitors: competitors.split(",").map((s) => s.trim()).filter(Boolean),
          useCase: useCase.trim() || null,
          notes: notes.trim() || null,
        }),
      });
      const d = await res.json();
      if (res.ok && d.success) {
        setCreated(d as CreatedAccount);
        onCreated();
      } else {
        setError(d.error || "Failed to create account");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    }
    setCreating(false);
  };

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
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
          borderRadius: "10px",
          padding: "28px",
          maxWidth: "640px",
          width: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
        }}
      >
        {created ? (
          <CreatedAccountSummary
            account={created}
            copiedField={copiedField}
            onCopy={copy}
            onClose={onClose}
          />
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <div style={{ ...labelStyle, marginBottom: "4px" }}>
                  {seed ? "Review & create account" : "New account"}
                </div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.01em" }}>
                  {seed ? "From WhatsApp extraction" : "Create account with custom pricing"}
                </h2>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "transparent",
                  border: "none",
                  color: C.textMuted,
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@company.com" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Full name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" style={inputStyle} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Company name *</label>
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Bank of Africa" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Phone (optional)</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+212 6 12 34 56 78" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Account type *</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap: "8px" }}>
                  {[
                    { value: "brand-monitor", label: "Brand Monitor", desc: "Reputation" },
                    { value: "market-competitor", label: "Market & Comp.", desc: "Brand + competitors" },
                    { value: "investment-bank", label: "Investment Bank", desc: "DD + M&A" },
                    { value: "harch-alpha", label: "Harch Alpha", desc: "Trader / assets" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAccountType(opt.value)}
                      style={{
                        padding: "10px",
                        background: accountType === opt.value ? C.bgSubtle : "transparent",
                        border: `1px solid ${accountType === opt.value ? C.accent : C.border}`,
                        borderRadius: "5px",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontSize: "12px", fontWeight: 600, color: accountType === opt.value ? C.accent : C.text }}>{opt.label}</div>
                      <div style={{ fontSize: "10px", color: C.textMuted, marginTop: "2px" }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Plan tier *</label>
                  <select
                    value={planTier}
                    onChange={(e) => setPlanTier(e.target.value as typeof planTier)}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    <option value="emergence">Émergence (~15K MAD/mo)</option>
                    <option value="corporate">Corporate (~40K MAD/mo)</option>
                    <option value="sovereign">Sovereign (~75K MAD/mo)</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Custom price (MAD/mo)</label>
                  <input
                    type="text"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="50000 — type any number"
                    style={{ ...inputStyle, fontFamily: C.fontMono }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Expiration *</label>
                  <select
                    value={expirationPreset}
                    onChange={(e) => setExpirationPreset(e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    {EXPIRATION_PRESETS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                {expirationPreset === "custom" && (
                  <div>
                    <label style={labelStyle}>Custom date *</label>
                    <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} style={inputStyle} />
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Topics to monitor (comma-separated)</label>
                <input type="text" value={topics} onChange={(e) => setTopics(e.target.value)} placeholder="brand reputation, ESG narrative, boycott risk" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Competitors to track (comma-separated)</label>
                <input type="text" value={competitors} onChange={(e) => setCompetitors(e.target.value)} placeholder="Attijariwafa, Bank of Africa" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Use case (optional)</label>
                <textarea value={useCase} onChange={(e) => setUseCase(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} placeholder="What the prospect wants to achieve..." />
              </div>

              <div>
                <label style={labelStyle}>Notes (optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} placeholder="Decision-makers, timeline, constraints..." />
              </div>

              {error && (
                <div style={{ padding: "10px 12px", background: C.dangerBg, border: `1px solid ${C.danger}30`, borderRadius: "5px", fontSize: "12px", color: C.danger }}>
                  {error}
                </div>
              )}

              <div style={{ padding: "12px 14px", background: C.bgSubtle, borderRadius: "5px", fontSize: "11px", color: C.textBody, lineHeight: 1.5 }}>
                <strong style={{ color: C.text, fontFamily: C.fontMono, fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase" }}>What happens next:</strong>
                {" "}
                A User row (status=invited), Company (dedup by ICE/slug/name), CompanySettings (pricing encoded in alertThresholds), and Invitation are created. A temporary password is generated — share it with the user along with the access URL.
              </div>

              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "4px" }}>
                <button
                  onClick={onClose}
                  style={{
                    padding: "9px 16px",
                    background: "transparent",
                    border: `1px solid ${C.border}`,
                    color: C.textBody,
                    fontFamily: C.fontSans,
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    borderRadius: "5px",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  style={{
                    padding: "9px 18px",
                    background: creating ? C.border : C.cta,
                    color: "#fff",
                    border: "none",
                    fontFamily: C.fontSans,
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: creating ? "not-allowed" : "pointer",
                    borderRadius: "5px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} strokeWidth={2.5} />}
                  {creating ? "Creating..." : "Create account"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CreatedAccountSummary({
  account,
  copiedField,
  onCopy,
  onClose,
}: {
  account: CreatedAccount;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  onClose: () => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            background: C.successBg,
            border: `1px solid ${C.cta}40`,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Check size={18} color={C.cta} strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ ...labelStyle, marginBottom: "2px" }}>Account created</div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.01em" }}>
            {account.user.email}
          </h2>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <SummaryRow label="User ID" value={account.user.id} mono onCopy={() => onCopy(account.user.id, "userId")} copied={copiedField === "userId"} />
        <SummaryRow label="Name" value={account.user.name || "—"} />
        <SummaryRow label="Role" value={account.user.role} />
        <SummaryRow label="Account type" value={account.user.accountType} />
        <SummaryRow label="Status" value={account.user.status} highlight={account.user.status === "invited"} />
        <SummaryRow label="Company" value={`${account.company.name} ${account.company.created ? "(new)" : "(linked)"}`} />
        <SummaryRow
          label="Plan tier"
          value={account.pricing.planTier}
        />
        {account.pricing.customPriceMAD != null && (
          <SummaryRow
            label="Pricing"
            value={`${account.pricing.customPriceMAD.toLocaleString()} MAD/mo`}
            mono
            highlight
          />
        )}
        <SummaryRow
          label="Expires"
          value={new Date(account.invitation.expiresAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        />
        <SummaryRow
          label="Temporary password"
          value={account.user.temporaryPassword}
          mono
          highlight
          onCopy={() => onCopy(account.user.temporaryPassword, "pw")}
          copied={copiedField === "pw"}
        />
        <div>
          <label style={labelStyle}>Access URL</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              readOnly
              value={account.invitation.url}
              style={{
                flex: 1,
                padding: "9px 12px",
                border: `1px solid ${C.border}`,
                borderRadius: "5px",
                fontFamily: C.fontMono,
                fontSize: "11px",
                color: C.text,
                background: C.bgSubtle,
              }}
            />
            <button
              onClick={() => onCopy(account.invitation.url, "url")}
              style={{
                padding: "9px 12px",
                background: copiedField === "url" ? C.cta : C.text,
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              {copiedField === "url" ? <Check size={13} /> : <Copy size={13} />}
              {copiedField === "url" ? "Copied" : "Copy"}
            </button>
            <a
              href={account.invitation.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "9px 12px",
                background: "transparent",
                border: `1px solid ${C.border}`,
                color: C.textBody,
                borderRadius: "5px",
                fontSize: "12px",
                fontWeight: 600,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <ExternalLink size={13} />
              Open
            </a>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
        <button
          onClick={onClose}
          style={{
            padding: "9px 18px",
            background: C.cta,
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  mono,
  highlight,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{ width: "140px", flexShrink: 0, fontSize: "10px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
        {label}
      </div>
      <div
        style={{
          flex: 1,
          fontSize: "13px",
          fontFamily: mono ? C.fontMono : C.fontSans,
          color: highlight ? C.cta : C.text,
          padding: "6px 10px",
          background: highlight ? C.successBg : C.bgSubtle,
          border: `1px solid ${highlight ? `${C.cta}40` : C.border}`,
          borderRadius: "4px",
        }}
      >
        {value}
      </div>
      {onCopy && (
        <button
          onClick={onCopy}
          style={{
            padding: "6px 8px",
            background: "transparent",
            border: `1px solid ${C.border}`,
            color: copied ? C.cta : C.textMuted,
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════

function LoadingState() {
  return (
    <div style={{ padding: "60px 32px", textAlign: "center", color: C.textMuted, fontFamily: C.fontMono, fontSize: "12px" }}>
      <Loader2 size={20} className="animate-spin" style={{ margin: "0 auto 12px", color: C.accent }} />
      <div>Loading...</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: "48px 32px",
        border: `1px dashed ${C.border}`,
        borderRadius: "8px",
        textAlign: "center",
        color: C.textMuted,
        fontFamily: C.fontMono,
        fontSize: "12px",
        background: C.bg,
      }}
    >
      {text}
    </div>
  );
}

function DetailGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ ...labelStyle, marginBottom: "8px" }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>{children}</div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: "8px", fontSize: "12px", lineHeight: 1.5 }}>
      <span style={{ color: C.textMuted, minWidth: "70px", flexShrink: 0, fontFamily: C.fontMono, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
        {label}
      </span>
      <span style={{ color: value ? C.textBody : C.textMuted, fontFamily: mono ? C.fontMono : C.fontSans, wordBreak: "break-word" }}>
        {value || "—"}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

function tabTitle(tab: Tab): string {
  switch (tab) {
    case "requests": return "Access Requests";
    case "accounts": return "Accounts";
    case "logs": return "Errors & Logs";
    case "audit": return "Audit Trail";
    case "whatsapp": return "WhatsApp Import";
  }
}

function tabSubtitle(tab: Tab): string {
  switch (tab) {
    case "requests": return "Review and triage inbound access requests";
    case "accounts": return "All users in the system + custom account creation";
    case "logs": return "SystemLog — errors, warnings, info";
    case "audit": return "Loi 09-08 / CNDP — every sensitive action is recorded";
    case "whatsapp": return "Paste a conversation → GLM-4 extracts → create account";
  }
}

function sizeLabel(size: string | null | undefined): string | null {
  if (!size) return null;
  const labels: Record<string, string> = {
    startup: "Startup (1-10)",
    sme: "SME (11-50)",
    "mid-market": "Mid-market (51-500)",
    enterprise: "Enterprise (500+)",
  };
  return labels[size] || size;
}
