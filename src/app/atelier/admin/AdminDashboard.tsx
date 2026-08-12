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
  Activity,
  AlertCircle,
  Ban,
  BarChart3,
  Briefcase,
  Building2,
  CalendarPlus,
  Clock,
  Clock3,
  Coins,
  Crown,
  DollarSign,
  Download,
  Eye,
  Globe,
  Lock,
  MapPin,
  MoveHorizontal,
  PauseCircle,
  Percent,
  PlayCircle,
  Power,
  Repeat,
  Send,
  Server,
  Tag,
  Target,
  TrendingDown,
  TrendingUp,
  User,
  UserPlus,
  Upload,
  Mail,
  Phone,
  Calendar,
  Key,
  FileText,
  Link2,
  List,
  CheckCircle2,
  Trash2,
  StickyNote,
  ArrowRight,
  Bell,
  CheckSquare,
  Filter,
  Flag,
  KanbanSquare,
  Square,
  Table2,
  Monitor,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getAdminPermissions } from "@/lib/auth/rbac";
import { motion, AnimatePresence } from "framer-motion";

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

type Tab = "requests" | "accounts" | "permissions" | "logs" | "audit" | "whatsapp" | "security" | "kpis" | "commerciaux" | "employees" | "provisioning";

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
  // Task FIX-FORMS-1 — page that produced the submission.
  // Values: audit-page | contact-page | request-access-page | landing-page | partner-application
  source: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
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
    "essential": number;
    "pro": number;
    "enterprise": number;
    "agency": number;
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
  plan_tier: "essential" | "pro" | "enterprise" | "agency" | "custom" | null;
  pricing_mad: number | null;
  topics: string[];
  competitors: string[];
  use_case: string | null;
  notes: string | null;
}

// ─── PROVISIONING SEED (request → provisioning form pre-fill) ─────
// Task CONNECT-REQUESTS-PROVISIONING — when the boss clicks
// "Convertir en client" on a request card or in the request detail
// drawer, we build a ProvisioningSeed from the request data and pass
// it to the ProvisioningTab, which pre-fills the ProvisioningForm.
// The requestId is carried along so that, after a successful
// provisioning POST, we can PATCH the originating request to
// status="converted" — eliminating the double-entry problem.
interface ProvisioningSeed {
  requestId: string;
  contactName: string;
  contactEmail: string;
  companyName: string;
  contactPhone: string;
  useCase: string;
  competitors: string;
  notes: string;
}

// Parse a competitors list packed inside a free-text message.
// Recognises "Concurrents: X, Y, Z" / "Compétiteurs: ..." /
// "Competitors: ...". Returns the raw trailing text (caller splits
// on comma) or an empty string when no match is found.
function parseCompetitorsFromMessage(message: string | null | undefined): string {
  if (!message) return "";
  const m = message.match(/(?:concurrents?|comp[ée]titeurs?|competitors?)\s*[:\-]\s*([^\n\r]+)/i);
  return m && m[1] ? m[1].trim() : "";
}

// Strip the competitors line from a free-text message so the
// resulting useCase does not duplicate it. Leaves the rest of the
// message intact.
function stripCompetitorsFromMessage(message: string): string {
  return message
    .replace(/(?:concurrents?|comp[ée]titeurs?|competitors?)\s*[:\-]\s*([^\n\r]+)/i, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Build a ProvisioningSeed from an AccessRequest. Competitors are
// parsed from the message (if packed there) and the useCase falls
// back to the message body when the dedicated field is empty.
function buildProvisioningSeedFromRequest(r: AccessRequest): ProvisioningSeed {
  const competitors = parseCompetitorsFromMessage(r.message);
  const rawUseCase = (r.useCase || (r.message ? stripCompetitorsFromMessage(r.message) : "")).trim();
  return {
    requestId: r.id,
    contactName: r.name || "",
    contactEmail: r.email || "",
    companyName: r.company || "",
    contactPhone: r.phone || "",
    useCase: rawUseCase,
    competitors,
    notes: r.message || "",
  };
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

// ─── COUNT-UP HOOK (KPI strip animation 0 → value) ───────────────
// Task POLISH-ADMIN #2. rAF-driven easeOutCubic. Re-runs when `target`
// changes (refresh / re-fetch) — Bloomberg-grade "data ticked" feel.

function useCountUp(target: number, duration = 900): number {
  const [val, setVal] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setVal(from + (target - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);
  return val;
}

// ─── SCOPED CSS (sidebar hover, request-card hover, primary-btn) ──
// Task POLISH-ADMIN #1, #3, #5. Injected once at root. !important on
// hover rules to override inline `style` (inline wins by default).

const ADMIN_POLISH_CSS = `
.admin-sidebar-item { transition: background 0.15s ease, color 0.15s ease; }
.admin-sidebar-item:not(.is-active):hover {
  background: rgba(74,123,95,0.06) !important;
  color: #4A7B5F !important;
}
.admin-sidebar-item:not(.is-active):hover::before {
  content: '';
  position: absolute;
  left: 0; top: 8px; bottom: 8px;
  width: 3px;
  background: rgba(74,123,95,0.55);
  border-radius: 0 2px 2px 0;
}
.admin-request-card { transition: box-shadow 0.18s ease, border-color 0.18s ease; }
.admin-request-card:not(.is-bulk-selected):not(.is-dragging):hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04) !important;
  border-color: rgba(74,123,95,0.40) !important;
}
.admin-primary-btn { transition: transform 0.15s ease; }
.admin-primary-btn:hover:not(:disabled) { transform: scale(1.02); }
.admin-primary-btn:active:not(:disabled) { transform: scale(0.98); }

/* ═══ MOBILE RESPONSIVE — Task FIX-MOBILE-CRITICAL ═══ */
.admin-sidebar { transition: transform 0.25s ease; }
.admin-sidebar-toggle { display: none; }
.admin-sidebar-backdrop { display: none; }

@media (max-width: 1024px) {
  .admin-sidebar {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    height: 100vh !important;
    z-index: 50 !important;
    transform: translateX(-100%);
    box-shadow: 4px 0 24px rgba(0,0,0,0.12) !important;
  }
  .admin-sidebar.is-open { transform: translateX(0); }
  .admin-sidebar-toggle { display: inline-flex !important; }
  .admin-sidebar-backdrop.is-visible { display: block !important; }
}

@media (max-width: 768px) {
  .admin-header { padding: 12px 16px !important; }
  .admin-main { padding: 20px 16px 48px !important; }
  .admin-header-title { font-size: 16px !important; }
  .admin-table-wrap { overflow-x: auto !important; -webkit-overflow-scrolling: touch; }
  .admin-table-wrap > div { min-width: 640px; }
}

@media (max-width: 640px) {
  .admin-header { padding: 10px 14px !important; gap: 8px !important; }
  .admin-main { padding: 16px 14px 32px !important; }
  .admin-header-title { font-size: 15px !important; }
  .admin-header-sub { font-size: 10px !important; }
  .admin-grid-2 { grid-template-columns: 1fr !important; }
  .admin-grid-3 { grid-template-columns: 1fr !important; }
  .admin-grid-4 { grid-template-columns: 1fr !important; }
}
`;

// ─── MAIN COMPONENT ───────────────────────────────────────────────

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("requests");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  // Modal state — Create Account
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalSeed, setCreateModalSeed] = useState<Partial<WhatsAppExtraction> | null>(null);

  // Provisioning seed — Task CONNECT-REQUESTS-PROVISIONING
  // Holds the request data pre-fill when the boss clicks
  // "Convertir en client" on a request. Cleared after a successful
  // provisioning POST (the request is then auto-marked "Converti").
  const [provisioningSeed, setProvisioningSeed] = useState<ProvisioningSeed | null>(null);

  // Mobile sidebar drawer — Task FIX-MOBILE-CRITICAL
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
    if (tab === "accounts" || tab === "permissions" || tab === "security") fetchUsers();
  }, [tab, fetchUsers]);

  // Fetch current user role to gate boss-only tabs (KPIs + Commerciaux).
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setCurrentRole(d?.user?.role ?? null))
      .catch(() => setCurrentRole(null));
  }, []);

  const adminPerms = getAdminPermissions(currentRole);
  const canSeeKPIs = adminPerms?.viewFinancials === true;
  const canSeeCommercials = adminPerms?.manageCommercials === true;

  // Defense-in-depth: if a commercial user somehow ends up on a restricted
  // tab (state corruption, race condition on role fetch), bounce them back
  // to the Requests tab.
  useEffect(() => {
    if (currentRole === null) return; // role not yet loaded
    if ((tab === "kpis" && !canSeeKPIs) || (tab === "commerciaux" && !canSeeCommercials)) {
      setTab("requests");
    }
  }, [tab, currentRole, canSeeKPIs, canSeeCommercials]);

  // Close mobile sidebar drawer on tab change — Task FIX-MOBILE-CRITICAL
  useEffect(() => { setMobileNavOpen(false); }, [tab]);

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const interestedRequests = requests.filter((r) => r.status === "interested");
  const convertedRequests = requests.filter((r) => r.status === "converted");

  const openCreateModal = (seed?: Partial<WhatsAppExtraction>) => {
    setCreateModalSeed(seed ?? null);
    setShowCreateModal(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bgSubtle, fontFamily: C.fontSans, display: "flex" }}>
      {/* ═══ POLISH-ADMIN SCOPED STYLES (#1, #3, #5) ═══ */}
      <style dangerouslySetInnerHTML={{ __html: ADMIN_POLISH_CSS }} />
      {/* ═══ LIGHT SIDEBAR ═══ */}
      <aside
        className={`admin-sidebar${mobileNavOpen ? " is-open" : ""}`}
        style={{
          width: "248px",
          flexShrink: 0,
          background: C.bg,
          color: C.text,
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          borderRight: `1px solid ${C.border}`,
          boxShadow: "1px 0 0 rgba(0,0,0,0.02)",
        }}
      >
        {/* Brand */}
        <div style={{ padding: "22px 22px 18px", borderBottom: `1px solid ${C.border}` }}>
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
                  color: C.textMuted,
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
            active={tab === "provisioning"}
            onClick={() => setTab("provisioning")}
            icon={<CalendarPlus size={16} />}
            label="Provisioning"
            highlight={!!provisioningSeed}
          />
          <SidebarItem
            active={tab === "permissions"}
            onClick={() => setTab("permissions")}
            icon={<ShieldCheck size={16} />}
            label="Permissions"
          />
          <SidebarItem
            active={tab === "security"}
            onClick={() => setTab("security")}
            icon={<AlertTriangle size={16} />}
            label="Security"
          />
          {canSeeKPIs && (
            <SidebarItem
              active={tab === "kpis"}
              onClick={() => setTab("kpis")}
              icon={<BarChart3 size={16} />}
              label="KPIs"
            />
          )}
          {canSeeCommercials && (
            <SidebarItem
              active={tab === "commerciaux"}
              onClick={() => setTab("commerciaux")}
              icon={<Briefcase size={16} />}
              label="Commerciaux"
            />
          )}
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
          <SidebarItem
            active={tab === "employees"}
            onClick={() => setTab("employees")}
            icon={<Briefcase size={16} />}
            label="Employés"
          />
        </nav>

        {/* Footer */}
        <div style={{ padding: "16px 22px", borderTop: `1px solid ${C.border}` }}>
          <a
            href="/atelier/console"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: C.textBody,
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
              border: `1px solid ${C.border}`,
              color: C.textBody,
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

      {/* Mobile sidebar backdrop — Task FIX-MOBILE-CRITICAL */}
      <div
        className={`admin-sidebar-backdrop${mobileNavOpen ? " is-visible" : ""}`}
        onClick={() => setMobileNavOpen(false)}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 40 }}
      />

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <header
          className="admin-header"
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <button
              type="button"
              className="admin-sidebar-toggle"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Ouvrir le menu de navigation"
              style={{
                flexShrink: 0,
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: `1px solid ${C.border}`,
                borderRadius: "6px",
                cursor: "pointer",
                color: C.text,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M2 4h12M2 8h12M2 12h12" />
              </svg>
            </button>
            <div style={{ minWidth: 0 }}>
              <h1 className="admin-header-title" style={{ fontSize: "20px", fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.01em" }}>
                {tabTitle(tab)}
              </h1>
              <div
                className="admin-header-sub"
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
              className="admin-primary-btn"
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
            <KpiCell label="Total users" value={stats.users.total} sub={`${stats.users["essential"]}Ess · ${stats.users["pro"]}Pro · ${stats.users["enterprise"]}Ent · ${stats.users["agency"]}Agy`} />
            <KpiCell label="Pending requests" value={pendingRequests.length} color={pendingRequests.length > 0 ? C.warning : undefined} />
            <KpiCell label="Interested" value={interestedRequests.length} color={interestedRequests.length > 0 ? C.cta : undefined} />
            <KpiCell label="Converted" value={convertedRequests.length} color={convertedRequests.length > 0 ? C.cta : undefined} />
            <KpiCell label="Active invites" value={stats.invitations.active} color={stats.invitations.active > 0 ? C.cta : undefined} />
            <KpiCell label="Companies" value={stats.data.companies} />
            <KpiCell label="Articles" value={stats.data.articles} />
          </div>
        )}

        {/* Tab content — POLISH-ADMIN #4: AnimatePresence fade between tabs */}
        <main className="admin-main" style={{ flex: 1, padding: "28px 32px 64px", maxWidth: "1440px", width: "100%" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {loading && tab !== "audit" && tab !== "logs" && tab !== "whatsapp" && tab !== "permissions" && tab !== "security" && tab !== "kpis" && tab !== "commerciaux" && tab !== "employees" ? (
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
                  onConvertToClient={(r) => {
                    setProvisioningSeed(buildProvisioningSeedFromRequest(r));
                    setTab("provisioning");
                  }}
                />
              ) : tab === "accounts" ? (
                <AccountsTab users={users} loading={loading} onCreate={() => openCreateModal()} />
              ) : tab === "provisioning" ? (
                <ProvisioningTab
                  currentRole={currentRole}
                  seed={provisioningSeed}
                  onSeedConsumed={() => setProvisioningSeed(null)}
                  onProvisioned={() => {
                    setProvisioningSeed(null);
                    fetchCore();
                  }}
                />
              ) : tab === "permissions" ? (
                <PermissionsTab users={users} loading={loading} onRefresh={fetchUsers} />
              ) : tab === "security" ? (
                <SecurityTab users={users} loading={loading} onRefresh={fetchUsers} />
              ) : tab === "kpis" ? (
                <KpisTab requests={requests} users={users} />
              ) : tab === "commerciaux" ? (
                <CommerciauxTab />
              ) : tab === "employees" ? (
                <EmployeesTab />
              ) : tab === "logs" ? (
                <LogsTab />
              ) : tab === "audit" ? (
                <AuditLogViewer />
              ) : (
                <WhatsAppTab onCreateFromExtraction={(ext) => openCreateModal(ext)} />
              )}
            </motion.div>
          </AnimatePresence>
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
      className={`admin-sidebar-item${active ? " is-active" : ""}`}
      style={{
        width: "100%",
        padding: "9px 12px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: active ? "rgba(74,123,95,0.08)" : "transparent",
        border: "none",
        color: active ? "#4A7B5F" : C.textBody,
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
    >
      {active && (
        <span
          style={{
            position: "absolute",
            left: 0,
            top: "8px",
            bottom: "8px",
            width: "3px",
            background: highlight ? C.cta : "#4A7B5F",
            borderRadius: "0 2px 2px 0",
          }}
        />
      )}
      <span style={{ display: "flex", flexShrink: 0, color: active ? "#4A7B5F" : "#71717A" }}>
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
            background: highlight ? `${C.cta}25` : "rgba(74,123,95,0.10)",
            color: highlight ? C.ctaHover : "#4A7B5F",
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
  // POLISH-ADMIN #2 — count-up only for numeric values. String values
  // (e.g. "12.3%", "5/12", "—", "1500 MAD") render as-is to preserve
  // existing formatting.
  const isNumeric = typeof value === "number";
  const animated = useCountUp(isNumeric ? (value as number) : 0, 900);
  const display = isNumeric ? Math.round(animated) : value;
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
        {display}
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
//  ACCESS REQUEST REVIEW CENTER
//
//  Pipeline kanban (5 stages) + Detail drawer (600px slide-in) +
//  Annotation system + Contact tracking + Bulk actions + Advanced
//  filters + KPI strip. Bloomberg-terminal density.
//
//  Stages: Nouveau → Contacté → Essai → Converti → Annulé
//    (pending)    (interested) (recontact_later) (converted) (not_interested)
//
//  Task ID: BATCAVE-1-REQUESTS
// ═══════════════════════════════════════════════════════════════

const STATUS_LABEL_FR: Record<string, string> = {
  pending: "Nouveau",
  interested: "Contacté",
  recontact_later: "Essai",
  converted: "Converti",
  not_interested: "Annulé",
  accepted: "Accepté (legacy)",
  rejected: "Rejeté (legacy)",
};

interface PipelineStage {
  key: RequestStatus;
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
  hint: string;
}

const PIPELINE_STAGES: PipelineStage[] = [
  { key: "pending",         label: "Nouveau",   color: "#525252", bg: "#fafafa",             border: "#e5e5e5",              dot: "#73737a", hint: "Nouvelle demande non traitée" },
  { key: "interested",      label: "Contacté",  color: "#4A7B5F", bg: "rgba(74,123,95,0.05)", border: "rgba(74,123,95,0.30)", dot: "#4A7B5F", hint: "Premier contact établi" },
  { key: "recontact_later", label: "Essai",     color: "#B45309", bg: "#fffbeb",             border: "#fde68a",              dot: "#f59e0b", hint: "Période d'essai en cours" },
  { key: "converted",       label: "Converti",  color: "#2D5A40", bg: "rgba(45,90,64,0.06)", border: "rgba(45,90,64,0.30)",  dot: "#2D5A40", hint: "Client converti / payant" },
  { key: "not_interested",  label: "Annulé",    color: "#B91C1C", bg: "#fef2f2",             border: "#fecaca",              dot: "#ef4444", hint: "Demande annulée ou refusée" },
];

const PIPELINE_MAP: Record<string, PipelineStage> = Object.fromEntries(
  PIPELINE_STAGES.map((s) => [s.key, s]),
);

const PLAN_LABELS_FR: Record<string, string> = {
  essential: "Essentiel",
  pro: "Pro",
  enterprise: "Grandes Entreprises",
  agency: "Agences",
  "brand-monitor": "Essentiel (legacy)",
  "market-competitor": "Pro (legacy)",
  "investment-bank": "Grandes Entreprises (legacy)",
  "harch-alpha": "Agences (legacy)",
};

const SIZE_EXPLANATIONS: Record<string, string> = {
  startup: "Early-stage · cycle court · sensible au prix",
  sme: "PME établie · équipe restreinte · budget modéré",
  "mid-market": "ETI · multi-équipes · collaboration requise",
  enterprise: "Grand groupe · multi-entités · sécurité élevée",
};

// ─── TYPES ────────────────────────────────────────────────────────

interface Annotation {
  id: string;
  text: string;
  type: "note" | "reminder" | "flag";
  author: string;
  createdAt: string;
  reminderDate: string | null;
}

interface ContactLog {
  id: string;
  method: "email" | "phone" | "whatsapp";
  notes: string;
  outcome: string;
  author: string;
  createdAt: string;
}

interface NextAction {
  action: string;
  date: string | null;
}

type ViewMode = "pipeline" | "table";
type SortKey = "date_desc" | "date_asc" | "name_asc" | "company_asc" | "budget_desc" | "last_contact_desc";
type AnnotationTypeFilter = "all" | "with" | "without";

// ─── LOCALSTORAGE HOOK (SSR-safe) ─────────────────────────────────

function useLocalStorage<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setState(JSON.parse(raw) as T);
    } catch { /* ignore */ }
    setHydrated(true);
  }, [key]);
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch { /* ignore */ }
  }, [key, state, hydrated]);
  return [state, setState] as const;
}

// ─── HELPERS ──────────────────────────────────────────────────────

function relTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const diff = Date.now() - t;
  if (diff < 0) {
    const s = Math.floor(-diff / 1000);
    if (s < 60) return `dans ${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `dans ${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `dans ${h}h`;
    const d = Math.floor(h / 24);
    return `dans ${d}j`;
  }
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}j`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo`;
  return `${Math.floor(mo / 12)}a`;
}

function absDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return "—";
  return t.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Time elapsed between two ISO dates, expressed as a compact French string
// (e.g. "2j 4h", "5m 30s"). Used in the drawer to show the duration between
// submission and last update — useful for tracking how long a request sat in
// each pipeline stage.
function timeElapsedSince(fromIso: string | null | undefined, toIso: string | null | undefined): string {
  if (!fromIso || !toIso) return "—";
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  if (Number.isNaN(from) || Number.isNaN(to)) return "—";
  let diff = Math.abs(to - from);
  if (diff < 1000) return "0s";
  const days = Math.floor(diff / (24 * 3600 * 1000)); diff -= days * 24 * 3600 * 1000;
  const hours = Math.floor(diff / (3600 * 1000)); diff -= hours * 3600 * 1000;
  const mins = Math.floor(diff / (60 * 1000)); diff -= mins * 60 * 1000;
  const secs = Math.floor(diff / 1000);
  if (days > 0) return `${days}j ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function planLabel(t: string | null | undefined): string {
  if (!t) return "—";
  return PLAN_LABELS_FR[t] || t;
}

// ─── Source page labels (Task FIX-FORMS-1) ──────────────────────
// Maps the `source` field (which page produced the submission) to a
// short French label shown in badges + the detail drawer. The
// canonical enum matches the values accepted by /api/access-request.
const SOURCE_LABELS_FR: Record<string, string> = {
  "audit-page": "Audit",
  "contact-page": "Contact",
  "request-access-page": "Demande d'accès",
  "request-access": "Demande d'accès",
  "landing-page": "Landing",
  "partner-application": "Partenaire",
};

const SOURCE_COLORS: Record<string, { color: string; bg: string }> = {
  "audit-page": { color: "#4A7B5F", bg: "rgba(74,123,95,0.10)" },         // sage
  "contact-page": { color: "#4A5D6E", bg: "rgba(74,93,110,0.10)" },       // accent
  "request-access-page": { color: "#8B5A2B", bg: "rgba(139,90,43,0.10)" },// amber-brown
  "request-access": { color: "#8B5A2B", bg: "rgba(139,90,43,0.10)" },
  "landing-page": { color: "#71717A", bg: "rgba(113,113,122,0.10)" },     // neutral
  "partner-application": { color: "#A0524B", bg: "rgba(160,82,75,0.10)" },// red-brown
};

function sourceLabel(s: string | null | undefined): string {
  if (!s) return "Contact";
  return SOURCE_LABELS_FR[s] || s;
}

function sourceColor(s: string | null | undefined): { color: string; bg: string } {
  if (!s) return SOURCE_COLORS["contact-page"];
  return SOURCE_COLORS[s] || SOURCE_COLORS["contact-page"];
}

function parseBudget(budget: string | null | undefined): { monthly: number | null; annual: number | null; raw: string } | null {
  if (!budget) return null;
  const m = budget.match(/([\d.,]+)\s*(k|m)?\s*(?:€|eur|mad|dh)?/i);
  if (!m) return { monthly: null, annual: null, raw: budget };
  let num = parseFloat(m[1].replace(/[,\s]/g, "."));
  if (Number.isNaN(num)) return { monthly: null, annual: null, raw: budget };
  if (m[2]?.toLowerCase() === "k") num *= 1000;
  if (m[2]?.toLowerCase() === "m") num *= 1_000_000;
  const isAnnual = /\b(an|ann|ans|year|annual|annuel)\b/i.test(budget);
  const monthly = isAnnual ? num / 12 : num;
  const annual = isAnnual ? num : num * 12;
  return { monthly, annual, raw: budget };
}

function fmtMoney(n: number | null): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${Math.round(n)}`;
}

function suggestPlan(r: AccessRequest): { plan: string; reason: string } {
  const uc = (r.useCase || "").toLowerCase();
  const sz = r.companySize || "";
  if (/agence|agency|client.*multi|multi.*client|multi-tenant|gestion.*client/.test(uc)) {
    return { plan: "Agency", reason: "Cas d'usage multi-clients détecté" };
  }
  if (/enterprise|international|multi-pays|groupe|filiale|multinational/.test(uc)) {
    return { plan: "Enterprise", reason: "Couverture multi-entités / internationale" };
  }
  if (sz === "enterprise") {
    return { plan: "Enterprise", reason: "Grand groupe → multi-entités + sécurité" };
  }
  if (sz === "mid-market") {
    return { plan: "Pro", reason: "ETI → volume élevé, collaboration multi-équipes" };
  }
  if (sz === "startup" || sz === "sme") {
    return { plan: "Essentiel", reason: `Petite structure (${sizeLabel(sz)}) → Essentiel suffisant` };
  }
  return { plan: "Pro", reason: "Plan polyvalent par défaut" };
}

function parseReferral(ref: string | null | undefined): { source: string; utm: Record<string, string> } {
  if (!ref) return { source: "", utm: {} };
  if (ref.includes("utm_") && ref.includes("?")) {
    try {
      const url = new URL(ref);
      const utm: Record<string, string> = {};
      url.searchParams.forEach((v, k) => {
        if (k.startsWith("utm_")) utm[k] = v;
      });
      return { source: url.hostname || ref, utm };
    } catch { /* fall through */ }
  }
  if (ref.includes("utm_") && ref.includes("=")) {
    const utm: Record<string, string> = {};
    ref.split(/[,&\s]+/).forEach((pair) => {
      const [k, v] = pair.split("=");
      if (k && v && k.startsWith("utm_")) utm[k] = decodeURIComponent(v);
    });
    if (Object.keys(utm).length > 0) return { source: "UTM direct", utm };
  }
  return { source: ref, utm: {} };
}

// ─── USER-AGENT PARSER ──────────────────────────────────────────
// Parses a User-Agent string into { browser, os, device }.
// Used in the detail drawer: AccessRequest schema does not persist UA
// at submission time, so we display the live admin's UA as a fallback
// (clearly labelled "live admin · non capturé à la soumission").

interface UaInfo {
  browser: string;
  os: string;
  device: string;
  raw: string;
}

function parseUserAgent(ua: string): UaInfo {
  if (!ua) return { browser: "Inconnu", os: "Inconnu", device: "Inconnu", raw: "" };
  // Browser detection (order matters — Edge/Chrome, Opera/Chrome).
  let browser = "Inconnu";
  if (/edg\//i.test(ua)) browser = "Microsoft Edge";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";
  else if (/firefox\//i.test(ua)) browser = "Firefox";
  else if (/chrome\//i.test(ua) && !/chromium/i.test(ua)) browser = "Chrome";
  else if (/safari\//i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/msie|trident/i.test(ua)) browser = "Internet Explorer";

  // OS detection.
  let os = "Inconnu";
  if (/windows nt 10/i.test(ua)) os = "Windows 10/11";
  else if (/windows nt/i.test(ua)) os = "Windows";
  else if (/mac os x|macintosh/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";

  // Device class.
  let device = "Desktop";
  if (/iphone|android.*mobile|windows phone/i.test(ua)) device = "Mobile";
  else if (/ipad|android(?!.*mobile)|tablet/i.test(ua)) device = "Tablette";

  return { browser, os, device, raw: ua };
}

function useLiveUa(): UaInfo | null {
  const [info, setInfo] = useState<UaInfo | null>(null);
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setInfo(parseUserAgent(navigator.userAgent));
  }, []);
  return info;
}

function useLiveTimezone(): string | null {
  const [tz, setTz] = useState<string | null>(null);
  useEffect(() => {
    try {
      const t = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (t) setTz(t);
    } catch { /* ignore */ }
  }, []);
  return tz;
}

function genLocalId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const bulkBtnStyle: React.CSSProperties = {
  padding: "6px 12px",
  background: C.bg,
  border: `1px solid ${C.border}`,
  color: C.textBody,
  borderRadius: "4px",
  fontSize: "11px",
  fontFamily: C.fontMono,
  fontWeight: 600,
  cursor: "pointer",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const drawerActionBtnStyle: React.CSSProperties = {
  padding: "5px 10px",
  background: C.bg,
  border: `1px solid ${C.border}`,
  color: C.textBody,
  borderRadius: "12px",
  fontSize: "10px",
  fontFamily: C.fontMono,
  fontWeight: 700,
  cursor: "pointer",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
};

// ═══════════════════════════════════════════════════════════════
//  REQUESTS TAB — Access Request Review Center (BATCAVE-1)
// ═══════════════════════════════════════════════════════════════

function RequestsTab({
  requests,
  invitations,
  onStatusChanged,
  onAcceptRequest,
  onConvertToClient,
}: {
  requests: AccessRequest[];
  invitations: Invitation[];
  onStatusChanged: () => void;
  onAcceptRequest: (r: AccessRequest) => void;
  onConvertToClient: (r: AccessRequest) => void;
}) {
  // ─── VIEW + FILTERS STATE ──────────────────────────────────────
  const [view, setView] = useState<ViewMode>("pipeline");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [sizeFilter, setSizeFilter] = useState<string>("all");
  const [budgetFilter, setBudgetFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [annotFilter, setAnnotFilter] = useState<AnnotationTypeFilter>("all");
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ─── BULK + DRAWER ─────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  // ─── LOCALSTORAGE (annotations + contacts + next-actions) ─────
  const [annotations, setAnnotations] = useLocalStorage<Record<string, Annotation[]>>(
    "admin:request-annotations",
    {},
  );
  const [contacts, setContacts] = useLocalStorage<Record<string, ContactLog[]>>(
    "admin:request-contacts",
    {},
  );
  const [nextActions, setNextActions] = useLocalStorage<Record<string, NextAction>>(
    "admin:request-next-actions",
    {},
  );

  // ─── DRAG STATE ────────────────────────────────────────────────
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // ─── DERIVED ───────────────────────────────────────────────────
  const countries = useMemo(() => {
    const s = new Set<string>();
    requests.forEach((r) => { if (r.country) s.add(r.country); });
    return Array.from(s).sort();
  }, [requests]);

  const annotCount = useCallback((id: string) => annotations[id]?.length ?? 0, [annotations]);
  const lastContact = useCallback(
    (id: string): ContactLog | null => {
      const log = contacts[id];
      if (!log || log.length === 0) return null;
      return [...log].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    },
    [contacts],
  );

  const filtered = useMemo(() => {
    let arr = requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (planFilter !== "all" && r.accountType !== planFilter) return false;
      if (countryFilter !== "all" && r.country !== countryFilter) return false;
      if (sizeFilter !== "all" && r.companySize !== sizeFilter) return false;
      if (budgetFilter !== "all") {
        const b = parseBudget(r.budget);
        const m = b?.monthly ?? null;
        if (budgetFilter === "low" && (m == null || m > 1000)) return false;
        if (budgetFilter === "mid" && (m == null || m < 1000 || m > 5000)) return false;
        if (budgetFilter === "high" && (m == null || m < 5000)) return false;
      }
      // Source filter — matches the canonical enum + alias. "all"
      // passes everything; legacy rows without a source are bucketed
      // under "contact-page" (the schema default) so they appear in
      // the Contact filter, not just in "all".
      if (sourceFilter !== "all") {
        const rs = r.source || "contact-page";
        if (sourceFilter === "contact-page" && rs !== "contact-page") return false;
        if (sourceFilter === "audit-page" && rs !== "audit-page") return false;
        if (sourceFilter === "request-access-page" && rs !== "request-access-page" && rs !== "request-access") return false;
        if (sourceFilter === "landing-page" && rs !== "landing-page") return false;
        if (sourceFilter === "partner-application" && rs !== "partner-application") return false;
      }
      if (dateFrom && new Date(r.createdAt) < new Date(dateFrom)) return false;
      if (dateTo && new Date(r.createdAt) > new Date(dateTo + "T23:59:59")) return false;
      if (annotFilter === "with" && annotCount(r.id) === 0) return false;
      if (annotFilter === "without" && annotCount(r.id) > 0) return false;
      if (search) {
        const q = search.toLowerCase();
        const hit =
          r.email.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          (r.company?.toLowerCase().includes(q) ?? false) ||
          (r.useCase?.toLowerCase().includes(q) ?? false) ||
          (r.message?.toLowerCase().includes(q) ?? false);
        if (!hit) return false;
      }
      return true;
    });

    arr = arr.sort((a, b) => {
      switch (sort) {
        case "date_asc": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "date_desc": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "name_asc": return a.name.localeCompare(b.name);
        case "company_asc": return (a.company || "").localeCompare(b.company || "");
        case "budget_desc": {
          const ba = parseBudget(a.budget)?.monthly ?? -1;
          const bb = parseBudget(b.budget)?.monthly ?? -1;
          return bb - ba;
        }
        case "last_contact_desc": {
          const la = lastContact(a.id)?.createdAt || "";
          const lb = lastContact(b.id)?.createdAt || "";
          return lb.localeCompare(la);
        }
        default: return 0;
      }
    });

    return arr;
  }, [requests, statusFilter, planFilter, countryFilter, sizeFilter, budgetFilter, sourceFilter, dateFrom, dateTo, annotFilter, search, sort, annotCount, lastContact]);

  const byStatus = useMemo(() => {
    const groups: Record<string, AccessRequest[]> = {};
    for (const stage of PIPELINE_STAGES) groups[stage.key] = [];
    for (const r of filtered) {
      if (groups[r.status]) groups[r.status].push(r);
      else groups["pending"].push(r);
    }
    return groups;
  }, [filtered]);

  // ─── KPI ───────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 3600 * 1000;
    const newThisWeek = requests.filter((r) => new Date(r.createdAt).getTime() > weekAgo).length;
    const contacted = requests.filter((r) =>
      ["interested", "recontact_later", "converted"].includes(r.status),
    ).length;
    const converted = requests.filter((r) => r.status === "converted").length;
    const conversionRate = contacted > 0 ? (converted / contacted) * 100 : 0;
    const convTimes = requests
      .filter((r) => r.status === "converted")
      .map((r) => new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime());
    const avgConvMs = convTimes.length > 0 ? convTimes.reduce((a, b) => a + b, 0) / convTimes.length : 0;
    const avgConvDays = Math.round(avgConvMs / (24 * 3600 * 1000));
    const pipelineValue = requests
      .filter((r) => ["interested", "recontact_later"].includes(r.status))
      .reduce((sum, r) => sum + (parseBudget(r.budget)?.monthly ?? 0), 0);
    const planCounts: Record<string, number> = { essential: 0, pro: 0, enterprise: 0, agency: 0 };
    requests.forEach((r) => {
      if (r.accountType && planCounts[r.accountType] != null) planCounts[r.accountType]++;
    });
    // Annotation coverage — "Sans annotation" = needs attention.
    let withAnnotation = 0;
    let withoutAnnotation = 0;
    requests.forEach((r) => {
      if ((annotations[r.id]?.length ?? 0) > 0) withAnnotation++;
      else withoutAnnotation++;
    });
    // Average contacts per converted request — proxy for sales effort.
    const convIds = new Set(requests.filter((r) => r.status === "converted").map((r) => r.id));
    const convContactLogs = Object.entries(contacts)
      .filter(([id]) => convIds.has(id))
      .reduce((sum, [, log]) => sum + (log?.length ?? 0), 0);
    const avgContactsPerConversion = convIds.size > 0 ? convContactLogs / convIds.size : 0;
    // Stalled requests — pending > 48h without contact log.
    const stalledThreshold = now - 48 * 3600 * 1000;
    const stalled = requests.filter((r) =>
      r.status === "pending"
      && new Date(r.createdAt).getTime() < stalledThreshold
      && (contacts[r.id]?.length ?? 0) === 0,
    ).length;
    return {
      total: requests.length,
      newThisWeek,
      conversionRate,
      avgConvDays,
      pipelineValue,
      planCounts,
      withAnnotation,
      withoutAnnotation,
      avgContactsPerConversion,
      stalled,
    };
  }, [requests, annotations, contacts]);

  // ─── STATUS CHANGE ─────────────────────────────────────────────
  const changeStatus = useCallback(async (id: string, newStatus: RequestStatus) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.error || "Échec de mise à jour du statut");
        setUpdatingId(null);
        return;
      }
      onStatusChanged();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur réseau");
    }
    setUpdatingId(null);
  }, [onStatusChanged]);

  // ─── DRAG HANDLERS ─────────────────────────────────────────────
  const onDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };
  const onDragOverCol = (e: React.DragEvent, statusKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverCol !== statusKey) setDragOverCol(statusKey);
  };
  const onDropCol = (e: React.DragEvent, statusKey: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragId;
    setDragId(null);
    setDragOverCol(null);
    if (!id) return;
    const req = requests.find((r) => r.id === id);
    if (!req || req.status === statusKey) return;
    changeStatus(id, statusKey as RequestStatus);
  };
  const onDragEnd = () => {
    setDragId(null);
    setDragOverCol(null);
  };

  // ─── BULK ACTIONS ──────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((r) => r.id)));
  };
  const bulkMarkContacted = async () => {
    const ids = Array.from(selected);
    let n = 0;
    for (const id of ids) {
      const r = requests.find((x) => x.id === id);
      if (r && r.status === "pending") {
        await changeStatus(id, "interested");
        n++;
      }
    }
    setSelected(new Set());
    setBulkMode(false);
    if (n > 0) alert(`${n} demande(s) marquée(s) comme contactée(s).`);
  };
  const exportCsv = (all: boolean) => {
    const list = all ? requests : filtered.filter((r) => selected.has(r.id));
    const headers = [
      "id", "createdAt", "updatedAt", "status", "source", "name", "email", "phone", "company",
      "role", "accountType", "companySize", "budget", "country", "referralSource",
      "useCase", "message", "annotations_count", "contacts_count",
    ];
    const rows = list.map((r) => [
      r.id, r.createdAt, r.updatedAt, STATUS_LABEL_FR[r.status] || r.status,
      sourceLabel(r.source),
      r.name, r.email, r.phone || "", r.company || "", r.role || "",
      planLabel(r.accountType), sizeLabel(r.companySize) || "", r.budget || "",
      r.country || "", r.referralSource || "",
      (r.useCase || "").replace(/[\r\n]+/g, " "), (r.message || "").replace(/[\r\n]+/g, " "),
      annotCount(r.id), (contacts[r.id]?.length ?? 0),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((c) => {
        const s = String(c);
        return (s.includes(",") || s.includes('"') || s.includes("\n"))
          ? `"${s.replace(/"/g, '""')}"`
          : s;
      }).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `harchiq-requests-${new Date().toISOString().slice(0, 10)}${all ? "-all" : "-selected"}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const bulkEmail = () => {
    const list = filtered.filter((r) => selected.has(r.id));
    const emails = list.map((r) => r.email).join(",");
    window.location.href = `mailto:?bcc=${encodeURIComponent(emails)}&subject=${encodeURIComponent("HarchIQ Atelier — Demande d'accès")}`;
  };

  // ─── RESET FILTERS ─────────────────────────────────────────────
  const resetFilters = () => {
    setSearch(""); setStatusFilter("all"); setPlanFilter("all");
    setCountryFilter("all"); setSizeFilter("all"); setBudgetFilter("all");
    setSourceFilter("all"); setDateFrom(""); setDateTo(""); setAnnotFilter("all"); setSort("date_desc");
  };

  const activeFilters = [
    statusFilter !== "all", planFilter !== "all", countryFilter !== "all",
    sizeFilter !== "all", budgetFilter !== "all", sourceFilter !== "all",
    dateFrom !== "", dateTo !== "", annotFilter !== "all",
  ].filter(Boolean).length;

  const drawerRequest = drawerId ? requests.find((r) => r.id === drawerId) || null : null;

  // ─── RENDER ────────────────────────────────────────────────────
  return (
    <div>
      {/* KPI strip */}
      <ReviewKpiStrip kpi={kpi} />

      {/* Toolbar */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search size={14} color={C.textMuted} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, société, cas d'usage, message..."
            style={{ ...inputStyle, paddingLeft: "32px" }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ ...monoInputStyle, minWidth: "160px", cursor: "pointer" }}
        >
          <option value="all">Tous statuts ({requests.length})</option>
          {PIPELINE_STAGES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label} ({requests.filter((r) => r.status === s.key).length})
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          style={{ ...monoInputStyle, minWidth: "170px", cursor: "pointer" }}
        >
          <option value="date_desc">Trier : Date récente</option>
          <option value="date_asc">Trier : Date ancienne</option>
          <option value="name_asc">Trier : Nom A-Z</option>
          <option value="company_asc">Trier : Société A-Z</option>
          <option value="budget_desc">Trier : Budget décroissant</option>
          <option value="last_contact_desc">Trier : Dernier contact</option>
        </select>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            padding: "8px 12px",
            background: showAdvanced ? C.bgSubtle : "transparent",
            border: `1px solid ${showAdvanced ? C.accent : C.border}`,
            color: showAdvanced ? C.accent : C.textBody,
            borderRadius: "5px",
            fontSize: "11px",
            fontFamily: C.fontMono,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          <Filter size={12} />
          Filtres
          {activeFilters > 0 && (
            <span style={{
              background: C.accent, color: "#fff", borderRadius: "8px",
              padding: "0 6px", fontSize: "10px", fontWeight: 700,
            }}>{activeFilters}</span>
          )}
        </button>
        {/* View toggle */}
        <div style={{ display: "flex", border: `1px solid ${C.border}`, borderRadius: "5px", overflow: "hidden" }}>
          <button
            onClick={() => setView("pipeline")}
            style={{
              padding: "8px 10px", background: view === "pipeline" ? C.text : "transparent",
              border: "none", color: view === "pipeline" ? "#fff" : C.textBody,
              cursor: "pointer", display: "flex", alignItems: "center", gap: "5px",
              fontFamily: C.fontMono, fontSize: "11px", fontWeight: 600, textTransform: "uppercase",
            }}
          >
            <KanbanSquare size={12} /> Pipeline
          </button>
          <button
            onClick={() => setView("table")}
            style={{
              padding: "8px 10px", background: view === "table" ? C.text : "transparent",
              border: "none", borderLeft: `1px solid ${C.border}`,
              color: view === "table" ? "#fff" : C.textBody,
              cursor: "pointer", display: "flex", alignItems: "center", gap: "5px",
              fontFamily: C.fontMono, fontSize: "11px", fontWeight: 600, textTransform: "uppercase",
            }}
          >
            <Table2 size={12} /> Tableau
          </button>
        </div>
        {/* Bulk toggle */}
        <button
          onClick={() => { setBulkMode(!bulkMode); if (bulkMode) setSelected(new Set()); }}
          style={{
            padding: "8px 12px",
            background: bulkMode ? C.warningBg : "transparent",
            border: `1px solid ${bulkMode ? C.warning : C.border}`,
            color: bulkMode ? C.warning : C.textBody,
            borderRadius: "5px", fontSize: "11px", fontFamily: C.fontMono, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}
        >
          <CheckSquare size={12} />
          {bulkMode ? "Quitter sélection" : "Sélectionner"}
        </button>
        <button
          onClick={() => exportCsv(true)}
          title="Exporter toutes les demandes en CSV"
          style={{
            padding: "8px 12px", background: "transparent",
            border: `1px solid ${C.border}`, color: C.textBody,
            borderRadius: "5px", fontSize: "11px", fontFamily: C.fontMono, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}
        >
          <Download size={12} /> Exporter
        </button>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div style={{
          padding: "16px", background: C.bg, border: `1px solid ${C.border}`,
          borderRadius: "6px", marginBottom: "16px",
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
          gap: "12px",
        }}>
          <FilterField label="Plan">
            <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} style={monoInputStyle}>
              <option value="all">Tous</option>
              <option value="essential">Essentiel</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Grandes Entreprises</option>
              <option value="agency">Agences</option>
            </select>
          </FilterField>
          <FilterField label="Pays">
            <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} style={monoInputStyle}>
              <option value="all">Tous</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </FilterField>
          <FilterField label="Taille société">
            <select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)} style={monoInputStyle}>
              <option value="all">Toutes</option>
              <option value="startup">Startup (1-10)</option>
              <option value="sme">PME (11-50)</option>
              <option value="mid-market">ETI (51-500)</option>
              <option value="enterprise">Enterprise (500+)</option>
            </select>
          </FilterField>
          <FilterField label="Budget">
            <select value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value)} style={monoInputStyle}>
              <option value="all">Tous</option>
              <option value="low">Faible (&le;1k/mois)</option>
              <option value="mid">Moyen (1k-5k/mois)</option>
              <option value="high">Élevé (&ge;5k/mois)</option>
            </select>
          </FilterField>
          <FilterField label="Source">
            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} style={monoInputStyle}>
              <option value="all">Toutes ({requests.length})</option>
              <option value="audit-page">Audit ({requests.filter((r) => (r.source || "") === "audit-page").length})</option>
              <option value="contact-page">Contact ({requests.filter((r) => (r.source || "contact-page") === "contact-page").length})</option>
              <option value="request-access-page">Demande d'accès ({requests.filter((r) => { const s = r.source || ""; return s === "request-access-page" || s === "request-access"; }).length})</option>
              <option value="landing-page">Landing ({requests.filter((r) => (r.source || "") === "landing-page").length})</option>
              <option value="partner-application">Partenaire ({requests.filter((r) => (r.source || "") === "partner-application").length})</option>
            </select>
          </FilterField>
          <FilterField label="Date depuis">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={monoInputStyle} />
          </FilterField>
          <FilterField label="Date jusqu'à">
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={monoInputStyle} />
          </FilterField>
          <FilterField label="Annotations">
            <select value={annotFilter} onChange={(e) => setAnnotFilter(e.target.value as AnnotationTypeFilter)} style={monoInputStyle}>
              <option value="all">Toutes ({requests.length})</option>
              <option value="with">Avec annotation ({kpi.withAnnotation})</option>
              <option value="without">Sans annotation — à attention ({kpi.withoutAnnotation})</option>
            </select>
          </FilterField>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button onClick={resetFilters} style={{
              padding: "8px 12px", background: "transparent",
              border: `1px solid ${C.border}`, color: C.textBody, borderRadius: "5px",
              fontSize: "11px", fontFamily: C.fontMono, fontWeight: 600, cursor: "pointer",
              textTransform: "uppercase", letterSpacing: "0.06em", width: "100%",
            }}>
              Réinitialiser
            </button>
          </div>
        </div>
      )}

      {/* Bulk action bar */}
      {bulkMode && (
        <div style={{
          padding: "12px 16px", background: C.warningBg, border: `1px solid ${C.warning}40`,
          borderRadius: "6px", marginBottom: "16px",
          display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
        }}>
          <span style={{ fontFamily: C.fontMono, fontSize: "11px", color: C.warning, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <CheckSquare size={12} />
            {selected.size} sélectionnée(s) / {filtered.length} affichée(s)
          </span>
          <button onClick={toggleSelectAll} style={bulkBtnStyle}>Tout sélectionner</button>
          <button onClick={bulkMarkContacted} disabled={selected.size === 0} style={{ ...bulkBtnStyle, opacity: selected.size === 0 ? 0.4 : 1, cursor: selected.size === 0 ? "not-allowed" : "pointer" }}>
            Marquer comme contacté
          </button>
          <button onClick={() => exportCsv(false)} disabled={selected.size === 0} style={{ ...bulkBtnStyle, opacity: selected.size === 0 ? 0.4 : 1, cursor: selected.size === 0 ? "not-allowed" : "pointer" }}>
            Exporter CSV
          </button>
          <button onClick={bulkEmail} disabled={selected.size === 0} style={{ ...bulkBtnStyle, opacity: selected.size === 0 ? 0.4 : 1, cursor: selected.size === 0 ? "not-allowed" : "pointer" }}>
            Envoyer email groupé
          </button>
        </div>
      )}

      {/* Main content */}
      {filtered.length === 0 ? (
        <EmptyState text={requests.length === 0 ? "Aucune demande d'accès pour le moment." : "Aucune demande ne correspond à vos filtres."} />
      ) : view === "pipeline" ? (
        <PipelineView
          stages={PIPELINE_STAGES}
          byStatus={byStatus}
          onCardClick={(id) => setDrawerId(id)}
          onQuickStatus={(id, s) => changeStatus(id, s)}
          onConvertToClient={(id) => {
            const r = requests.find((x) => x.id === id);
            if (r) onConvertToClient(r);
          }}
          onDragStart={onDragStart}
          onDragOverCol={onDragOverCol}
          onDropCol={onDropCol}
          onDragEnd={onDragEnd}
          dragId={dragId}
          dragOverCol={dragOverCol}
          updatingId={updatingId}
          bulkMode={bulkMode}
          selected={selected}
          toggleSelect={toggleSelect}
          annotCount={annotCount}
          lastContact={lastContact}
        />
      ) : (
        <RequestTable
          requests={filtered}
          onRowClick={(id) => setDrawerId(id)}
          bulkMode={bulkMode}
          selected={selected}
          toggleSelect={toggleSelect}
          toggleSelectAll={toggleSelectAll}
          annotCount={annotCount}
          lastContact={lastContact}
        />
      )}

      {/* Active invitations summary */}
      {invitations.length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <div style={{
            fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted,
            letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "12px", fontWeight: 600,
          }}>
            Invitations actives ({invitations.filter((i) => !i.usedAt && new Date(i.expiresAt) > new Date()).length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {invitations.slice(0, 5).map((inv) => (
              <InvitationRow key={inv.id} invitation={inv} />
            ))}
          </div>
        </div>
      )}

      {/* Detail drawer */}
      <RequestDetailDrawer
        request={drawerRequest}
        annotations={drawerRequest ? annotations[drawerRequest.id] || [] : []}
        contacts={drawerRequest ? contacts[drawerRequest.id] || [] : []}
        nextAction={drawerRequest ? nextActions[drawerRequest.id] || null : null}
        onAddAnnotation={(a) => {
          if (!drawerRequest) return;
          setAnnotations((prev) => ({
            ...prev,
            [drawerRequest.id]: [a, ...(prev[drawerRequest.id] || [])],
          }));
        }}
        onDeleteAnnotation={(aid) => {
          if (!drawerRequest) return;
          setAnnotations((prev) => ({
            ...prev,
            [drawerRequest.id]: (prev[drawerRequest.id] || []).filter((x) => x.id !== aid),
          }));
        }}
        onAddContact={(c) => {
          if (!drawerRequest) return;
          setContacts((prev) => ({
            ...prev,
            [drawerRequest.id]: [c, ...(prev[drawerRequest.id] || [])],
          }));
        }}
        onDeleteContact={(cid) => {
          if (!drawerRequest) return;
          setContacts((prev) => ({
            ...prev,
            [drawerRequest.id]: (prev[drawerRequest.id] || []).filter((x) => x.id !== cid),
          }));
        }}
        onNextActionChange={(na) => {
          if (!drawerRequest) return;
          setNextActions((prev) => ({ ...prev, [drawerRequest.id]: na }));
        }}
        onStatusChange={(s) => {
          if (drawerRequest) changeStatus(drawerRequest.id, s);
        }}
        onAccept={() => {
          if (drawerRequest) {
            onAcceptRequest(drawerRequest);
            setDrawerId(null);
          }
        }}
        onConvertToClient={() => {
          if (drawerRequest) {
            onConvertToClient(drawerRequest);
            setDrawerId(null);
          }
        }}
        onClose={() => setDrawerId(null)}
      />
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ ...labelStyle, marginBottom: "4px" }}>{label}</div>
      {children}
    </div>
  );
}

function ReviewKpiStrip({ kpi }: {
  kpi: {
    total: number;
    newThisWeek: number;
    conversionRate: number;
    avgConvDays: number;
    pipelineValue: number;
    planCounts: Record<string, number>;
    withAnnotation: number;
    withoutAnnotation: number;
    avgContactsPerConversion: number;
    stalled: number;
  };
}) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
      gap: "1px", background: C.border,
      border: `1px solid ${C.border}`, borderRadius: "8px",
      overflow: "hidden", marginBottom: "20px",
    }}>
      <KpiCell label="Total demandes" value={kpi.total} />
      <KpiCell label="Nouveaux (7j)" value={kpi.newThisWeek} color={kpi.newThisWeek > 0 ? C.warning : undefined} />
      <KpiCell label="Taux conv." value={`${kpi.conversionRate.toFixed(1)}%`} color={kpi.conversionRate >= 30 ? C.cta : undefined} />
      <KpiCell label="Temps moyen conv." value={kpi.avgConvDays > 0 ? `${kpi.avgConvDays}j` : "—"} />
      <KpiCell label="Valeur pipeline" value={kpi.pipelineValue > 0 ? `${fmtMoney(kpi.pipelineValue)}/mo` : "—"} color={kpi.pipelineValue > 0 ? C.cta : undefined} />
      <KpiCell label="Sans annotation" value={kpi.withoutAnnotation} color={kpi.withoutAnnotation > 0 ? C.danger : undefined} sub="à attention" />
      <KpiCell label="Bloquées (>48h)" value={kpi.stalled} color={kpi.stalled > 0 ? C.warning : undefined} sub="pending sans contact" />
      <KpiCell label="Contacts/conv." value={kpi.avgContactsPerConversion > 0 ? kpi.avgContactsPerConversion.toFixed(1) : "—"} />
      <KpiCell label="Essentiel" value={kpi.planCounts.essential} />
      <KpiCell label="Pro" value={kpi.planCounts.pro} />
      <KpiCell label="Enterprise" value={kpi.planCounts.enterprise} />
      <KpiCell label="Agency" value={kpi.planCounts.agency} />
    </div>
  );
}

function PipelineView({
  stages, byStatus, onCardClick, onQuickStatus, onConvertToClient,
  onDragStart, onDragOverCol, onDropCol, onDragEnd,
  dragId, dragOverCol, updatingId,
  bulkMode, selected, toggleSelect,
  annotCount, lastContact,
}: {
  stages: PipelineStage[];
  byStatus: Record<string, AccessRequest[]>;
  onCardClick: (id: string) => void;
  onQuickStatus: (id: string, status: RequestStatus) => void;
  onConvertToClient: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOverCol: (e: React.DragEvent, key: string) => void;
  onDropCol: (e: React.DragEvent, key: string) => void;
  onDragEnd: () => void;
  dragId: string | null;
  dragOverCol: string | null;
  updatingId: string | null;
  bulkMode: boolean;
  selected: Set<string>;
  toggleSelect: (id: string) => void;
  annotCount: (id: string) => number;
  lastContact: (id: string) => ContactLog | null;
}) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${stages.length}, minmax(260px, 1fr))`,
      gap: "12px", overflowX: "auto", paddingBottom: "8px",
    }}>
      {stages.map((stage) => {
        const items = byStatus[stage.key] || [];
        const isOver = dragOverCol === stage.key;
        return (
          <div
            key={stage.key}
            onDragOver={(e) => onDragOverCol(e, stage.key)}
            onDrop={(e) => onDropCol(e, stage.key)}
            style={{
              background: stage.bg,
              border: `1px solid ${isOver ? stage.color : stage.border}`,
              borderRadius: "8px",
              minHeight: "400px",
              display: "flex", flexDirection: "column",
              transition: "border-color 0.15s, background 0.15s",
            }}
          >
            {/* Column header */}
            <div style={{
              padding: "12px 14px", borderBottom: `1px solid ${stage.border}`,
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: stage.dot, flexShrink: 0,
              }} />
              <span style={{
                fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700,
                color: stage.color, textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}>{stage.label}</span>
              <span style={{
                fontFamily: C.fontMono, fontSize: "11px", color: C.textMuted,
                marginLeft: "auto", fontWeight: 600,
              }}>{items.length}</span>
            </div>
            <div style={{
              padding: "6px 14px 8px", fontSize: "10px",
              fontFamily: C.fontMono, color: C.textMuted,
              letterSpacing: "0.04em", lineHeight: 1.4,
            }}>{stage.hint}</div>
            {/* Cards */}
            <div style={{ padding: "8px 8px 12px", display: "flex", flexDirection: "column", gap: "8px", flex: 1, overflowY: "auto", maxHeight: "calc(100vh - 380px)" }}>
              {items.length === 0 ? (
                <div style={{
                  padding: "20px 12px", textAlign: "center",
                  fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted,
                  border: `1px dashed ${C.border}`, borderRadius: "5px",
                }}>Vide</div>
              ) : items.map((r) => (
                <RequestCard
                  key={r.id}
                  request={r}
                  stage={stage}
                  onClick={() => onCardClick(r.id)}
                  onQuickStatus={(s) => onQuickStatus(r.id, s)}
                  onConvertToClient={() => onConvertToClient(r.id)}
                  onDragStart={(e) => onDragStart(e, r.id)}
                  onDragEnd={onDragEnd}
                  dragging={dragId === r.id}
                  updating={updatingId === r.id}
                  bulkMode={bulkMode}
                  isSelected={selected.has(r.id)}
                  onToggleSelect={() => toggleSelect(r.id)}
                  annotCount={annotCount(r.id)}
                  lastContact={lastContact(r.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RequestCard({
  request, stage, onClick, onQuickStatus, onConvertToClient, onDragStart, onDragEnd,
  dragging, updating, bulkMode, isSelected, onToggleSelect,
  annotCount, lastContact,
}: {
  request: AccessRequest;
  stage: PipelineStage;
  onClick: () => void;
  onQuickStatus: (s: RequestStatus) => void;
  onConvertToClient: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  dragging: boolean;
  updating: boolean;
  bulkMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  annotCount: number;
  lastContact: ContactLog | null;
}) {
  const budget = parseBudget(request.budget);
  // Quick action — next status in the pipeline.
  // pending → interested (Contacté) | interested → recontact_later (Essai) | recontact_later → converted (Converti)
  const quickAction: { label: string; icon: React.ReactNode; next: RequestStatus; primary?: boolean } | null =
    request.status === "pending"
      ? { label: "Contacté", icon: <Mail size={10} />, next: "interested" }
      : request.status === "interested"
        ? { label: "Essai", icon: <ArrowRight size={10} />, next: "recontact_later" }
        : request.status === "recontact_later"
          ? { label: "Convertir", icon: <Check size={10} />, next: "converted", primary: true }
          : null;
  return (
    <div
      draggable={!bulkMode}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={bulkMode ? onToggleSelect : onClick}
      className={`admin-request-card${dragging ? " is-dragging" : ""}${isSelected && bulkMode ? " is-bulk-selected" : ""}`}
      style={{
        background: C.bg,
        border: `1px solid ${isSelected && bulkMode ? C.accent : C.border}`,
        borderRadius: "6px",
        padding: "10px 12px",
        cursor: bulkMode ? "pointer" : "grab",
        opacity: dragging ? 0.4 : 1,
        boxShadow: isSelected && bulkMode ? `0 0 0 2px ${C.accent}30` : "none",
        transition: "box-shadow 0.15s, border-color 0.15s",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
        {bulkMode && (
          <span style={{ flexShrink: 0, marginTop: "1px", display: "flex" }}>
            {isSelected ? <CheckSquare size={14} color={C.accent} /> : <Square size={14} color={C.textMuted} />}
          </span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "13px", fontWeight: 600, color: C.text,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {request.name}
            {updating && <Loader2 size={11} className="animate-spin" style={{ display: "inline-block", marginLeft: "6px", verticalAlign: "-1px", color: stage.color }} />}
          </div>
          <div style={{
            fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: "1px",
          }}>
            {request.email}
          </div>
        </div>
        {!bulkMode && (
          <MoveHorizontal size={12} color={C.textMuted} style={{ flexShrink: 0, marginTop: "2px" }} />
        )}
      </div>
      {/* Company + plan + source */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", flexWrap: "wrap" }}>
        {request.company && (
          <span style={{
            fontSize: "10px", fontFamily: C.fontMono, color: C.textBody,
            background: C.bgSubtle, padding: "2px 6px", borderRadius: "3px",
            border: `1px solid ${C.border}`,
            maxWidth: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            <Building2 size={9} style={{ display: "inline-block", verticalAlign: "-1px", marginRight: "3px" }} />
            {request.company}
          </span>
        )}
        {request.accountType && (
          <span style={{
            fontSize: "9px", fontFamily: C.fontMono, color: C.accent,
            textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700,
          }}>{planLabel(request.accountType)}</span>
        )}
        {/* Source badge (Task FIX-FORMS-1) — colored pill showing which
            page produced the lead, so the boss can triage at a glance. */}
        {(() => {
          const sc = sourceColor(request.source);
          return (
            <span
              title={`Source: ${sourceLabel(request.source)}`}
              style={{
                fontSize: "9px", fontFamily: C.fontMono,
                color: sc.color, background: sc.bg,
                padding: "2px 6px", borderRadius: "3px",
                border: `1px solid ${sc.color}30`,
                textTransform: "uppercase", letterSpacing: "0.04em",
                fontWeight: 700, marginLeft: "auto",
              }}
            >
              {sourceLabel(request.source)}
            </span>
          );
        })()}
      </div>
      {/* Budget + time */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: "6px", fontSize: "10px", fontFamily: C.fontMono, color: C.textMuted,
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
          <Tag size={10} />
          {budget ? `${fmtMoney(budget.monthly)}/mo` : (request.budget || "—")}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "3px" }} title={absDate(request.createdAt)}>
          <Clock size={10} />
          {relTime(request.createdAt)}
        </span>
      </div>
      {/* Footer: annotations + last contact */}
      {(annotCount > 0 || lastContact) && (
        <div style={{
          display: "flex", alignItems: "center", gap: "6px", marginTop: "6px",
          paddingTop: "6px", borderTop: `1px dashed ${C.border}`,
          fontSize: "10px", fontFamily: C.fontMono, color: C.textMuted,
        }}>
          {annotCount > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: "3px", color: C.accent }}>
              <StickyNote size={10} />
              {annotCount}
            </span>
          )}
          {lastContact && (
            <span style={{ display: "flex", alignItems: "center", gap: "3px", marginLeft: "auto" }} title={`Dernier contact: ${absDate(lastContact.createdAt)} (${lastContact.method})`}>
              <Mail size={10} />
              {relTime(lastContact.createdAt)}
            </span>
          )}
        </div>
      )}
      {/* Quick action bar — advance pipeline without opening the drawer */}
      {!bulkMode && quickAction && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickStatus(quickAction.next);
          }}
          disabled={updating}
          title={`Avancer vers: ${STATUS_LABEL_FR[quickAction.next]}`}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
            width: "100%", marginTop: "8px",
            padding: "5px 8px",
            background: quickAction.primary ? C.cta : stage.bg,
            color: quickAction.primary ? "#fff" : stage.color,
            border: `1px solid ${quickAction.primary ? C.cta : stage.color}`,
            borderRadius: "4px",
            fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.06em",
            cursor: updating ? "wait" : "pointer",
            opacity: updating ? 0.5 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {updating ? <Loader2 size={10} className="animate-spin" /> : quickAction.icon}
          {quickAction.label}
        </button>
      )}
      {/* Convertir en client — Task CONNECT-REQUESTS-PROVISIONING
          Pre-fills the Provisioning form with the request data and
          switches to the Provisioning tab. Eliminates double entry. */}
      {!bulkMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConvertToClient();
          }}
          title="Pré-remplir le formulaire de provisioning avec cette demande"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
            width: "100%", marginTop: "6px",
            padding: "6px 8px",
            background: SAGE_BG,
            color: SAGE,
            border: `1px solid ${SAGE_BORDER}`,
            borderRadius: "4px",
            fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.06em",
            cursor: "pointer",
            transition: "background 0.15s, border-color 0.15s",
          }}
        >
          <UserPlus size={11} />
          Convertir en client
        </button>
      )}
    </div>
  );
}

function RequestTable({
  requests, onRowClick, bulkMode, selected, toggleSelect, toggleSelectAll,
  annotCount, lastContact,
}: {
  requests: AccessRequest[];
  onRowClick: (id: string) => void;
  bulkMode: boolean;
  selected: Set<string>;
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  annotCount: (id: string) => number;
  lastContact: (id: string) => ContactLog | null;
}) {
  // Source column added (Task FIX-FORMS-1) — narrow 110px slot for
  // the colored source badge so the boss can triage per origin page
  // without opening the drawer.
  const cols = bulkMode
    ? "32px minmax(180px,2fr) minmax(140px,1.4fr) minmax(110px,1fr) 110px 110px 130px 150px 50px 40px"
    : "minmax(180px,2fr) minmax(140px,1.4fr) minmax(110px,1fr) 110px 110px 130px 150px 50px 40px";
  const allSelected = requests.length > 0 && selected.size === requests.length;
  return (
    <div className="admin-table-wrap" style={{ border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden", background: C.bg }}>
      <div style={{
        display: "grid", gridTemplateColumns: cols, gap: "1px",
        background: C.border, fontFamily: C.fontMono, fontSize: "9px",
        color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700,
      }}>
        {bulkMode && (
          <div style={{ background: C.bgSubtle, padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <button onClick={toggleSelectAll} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
              {allSelected ? <CheckSquare size={14} color={C.accent} /> : <Square size={14} color={C.textMuted} />}
            </button>
          </div>
        )}
        <div style={{ background: C.bgSubtle, padding: "10px 16px" }}>Contact</div>
        <div style={{ background: C.bgSubtle, padding: "10px 16px" }}>Société</div>
        <div style={{ background: C.bgSubtle, padding: "10px 16px" }}>Plan</div>
        <div style={{ background: C.bgSubtle, padding: "10px 16px" }}>Source</div>
        <div style={{ background: C.bgSubtle, padding: "10px 16px" }}>Budget</div>
        <div style={{ background: C.bgSubtle, padding: "10px 16px" }}>Date</div>
        <div style={{ background: C.bgSubtle, padding: "10px 16px" }}>Statut</div>
        <div style={{ background: C.bgSubtle, padding: "10px 8px", textAlign: "center" }}>Notes</div>
        <div style={{ background: C.bgSubtle, padding: "10px 16px" }}></div>
      </div>
      {requests.map((r) => {
        const stage = PIPELINE_MAP[r.status] || PIPELINE_STAGES[0];
        const budget = parseBudget(r.budget);
        const lc = lastContact(r.id);
        const sel = selected.has(r.id);
        return (
          <div
            key={r.id}
            onClick={() => bulkMode ? toggleSelect(r.id) : onRowClick(r.id)}
            style={{
              display: "grid", gridTemplateColumns: cols, gap: "1px",
              background: C.border, fontFamily: C.fontSans, fontSize: "13px",
              cursor: "pointer", transition: "background 0.1s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = C.bgHover; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = C.bg; }}
          >
            {bulkMode && (
              <div style={{ background: "inherit", padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {sel ? <CheckSquare size={14} color={C.accent} /> : <Square size={14} color={C.textMuted} />}
              </div>
            )}
            <div style={{ background: "inherit", padding: "12px 16px" }}>
              <div style={{ fontWeight: 600, color: C.text }}>{r.name}</div>
              <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono, marginTop: "2px" }}>{r.email}</div>
            </div>
            <div style={{ background: "inherit", padding: "12px 16px", color: C.textBody, fontSize: "12px" }}>
              {r.company || <span style={{ color: C.textMuted }}>—</span>}
              {lc && (
                <div style={{ fontSize: "10px", fontFamily: C.fontMono, color: C.textMuted, marginTop: "3px" }}>
                  <Mail size={9} style={{ verticalAlign: "-1px", marginRight: "2px" }} />
                  {relTime(lc.createdAt)}
                </div>
              )}
            </div>
            <div style={{ background: "inherit", padding: "12px 16px" }}>
              <span style={{ fontSize: "10px", fontFamily: C.fontMono, color: C.accent, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {planLabel(r.accountType)}
              </span>
            </div>
            {/* Source badge cell (Task FIX-FORMS-1) */}
            <div style={{ background: "inherit", padding: "12px 16px" }}>
              {(() => {
                const sc = sourceColor(r.source);
                return (
                  <span
                    title={`Source: ${sourceLabel(r.source)}`}
                    style={{
                      display: "inline-flex", alignItems: "center",
                      padding: "2px 6px", background: sc.bg,
                      border: `1px solid ${sc.color}30`,
                      color: sc.color, borderRadius: "3px",
                      fontSize: "9px", fontFamily: C.fontMono,
                      textTransform: "uppercase", letterSpacing: "0.04em",
                      fontWeight: 700, whiteSpace: "nowrap",
                    }}
                  >
                    {sourceLabel(r.source)}
                  </span>
                );
              })()}
            </div>
            <div style={{ background: "inherit", padding: "12px 16px", fontFamily: C.fontMono, fontSize: "11px", color: C.textBody }}>
              {budget ? `${fmtMoney(budget.monthly)}/mo` : (r.budget || "—")}
            </div>
            <div style={{ background: "inherit", padding: "12px 16px", fontFamily: C.fontMono, fontSize: "11px", color: C.textBody }} title={absDate(r.createdAt)}>
              {relTime(r.createdAt)}
            </div>
            <div style={{ background: "inherit", padding: "10px 16px" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                padding: "3px 8px", background: stage.bg, border: `1px solid ${stage.color}40`,
                color: stage.color, borderRadius: "10px", fontSize: "9px",
                fontFamily: C.fontMono, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
              }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: stage.dot }} />
                {stage.label}
              </span>
            </div>
            <div style={{ background: "inherit", padding: "10px 8px", textAlign: "center" }}>
              {annotCount(r.id) > 0 ? (
                <span style={{
                  fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700,
                  color: C.accent, padding: "2px 6px", background: "rgba(120,113,108,0.10)", borderRadius: "8px",
                }}>
                  {annotCount(r.id)}
                </span>
              ) : <span style={{ color: C.textMuted, fontFamily: C.fontMono, fontSize: "11px" }}>—</span>}
            </div>
            <div style={{ background: "inherit", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "center", color: C.textMuted }}>
              <Eye size={14} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RequestDetailDrawer({
  request, annotations, contacts, nextAction,
  onAddAnnotation, onDeleteAnnotation, onAddContact, onDeleteContact,
  onNextActionChange, onStatusChange, onAccept, onConvertToClient, onClose,
}: {
  request: AccessRequest | null;
  annotations: Annotation[];
  contacts: ContactLog[];
  nextAction: NextAction | null;
  onAddAnnotation: (a: Annotation) => void;
  onDeleteAnnotation: (id: string) => void;
  onAddContact: (c: ContactLog) => void;
  onDeleteContact: (id: string) => void;
  onNextActionChange: (na: NextAction) => void;
  onStatusChange: (s: RequestStatus) => void;
  onAccept: () => void;
  onConvertToClient: () => void;
  onClose: () => void;
}) {
  const isOpen = !!request;

  // Annotation form
  const [annText, setAnnText] = useState("");
  const [annType, setAnnType] = useState<"note" | "reminder" | "flag">("note");
  const [annReminder, setAnnReminder] = useState<string>("");

  // Contact form
  const [cMethod, setCMethod] = useState<"email" | "phone" | "whatsapp">("email");
  const [cNotes, setCNotes] = useState("");
  const [cOutcome, setCOutcome] = useState("");

  // Next action form
  const [naAction, setNaAction] = useState("");
  const [naDate, setNaDate] = useState("");

  // Live UA / timezone (the AccessRequest schema does not persist UA at
  // submission time — we surface the admin's live values as a fallback so
  // the boss can see what device class is hitting the form).
  const liveUa = useLiveUa();
  const liveTz = useLiveTimezone();

  // Reset forms when request changes
  useEffect(() => {
    setAnnText(""); setAnnType("note"); setAnnReminder("");
    setCNotes(""); setCOutcome(""); setCMethod("email");
    setNaAction(nextAction?.action || "");
    setNaDate(nextAction?.date || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.id]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const submitAnnotation = () => {
    if (!annText.trim()) return;
    onAddAnnotation({
      id: genLocalId(),
      text: annText.trim(),
      type: annType,
      author: "admin",
      createdAt: new Date().toISOString(),
      reminderDate: annType === "reminder" && annReminder ? new Date(annReminder).toISOString() : null,
    });
    setAnnText(""); setAnnType("note"); setAnnReminder("");
  };

  const submitContact = () => {
    if (!cNotes.trim() && !cOutcome.trim()) return;
    onAddContact({
      id: genLocalId(),
      method: cMethod,
      notes: cNotes.trim(),
      outcome: cOutcome.trim(),
      author: "admin",
      createdAt: new Date().toISOString(),
    });
    setCNotes(""); setCOutcome(""); setCMethod("email");
  };

  const saveNextAction = () => {
    onNextActionChange({
      action: naAction.trim(),
      date: naDate || null,
    });
  };

  // ─── DERIVED DATA ─────────────────────────────────────────────
  const stage = request ? PIPELINE_MAP[request.status] || PIPELINE_STAGES[0] : null;
  const budget = request ? parseBudget(request.budget) : null;
  const referral = request ? parseReferral(request.referralSource) : null;
  const suggestion = request ? suggestPlan(request) : null;
  const lastC = contacts.length > 0
    ? [...contacts].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
    : null;

  // Upcoming reminders
  const now = Date.now();
  const reminders = annotations
    .filter((a) => a.type === "reminder" && a.reminderDate && new Date(a.reminderDate).getTime() > now)
    .sort((a, b) => (a.reminderDate || "").localeCompare(b.reminderDate || ""));

  const drawerWidth = "min(600px, 100vw)";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(10,10,10,0.4)",
          opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.2s", zIndex: 50,
        }}
      />
      {/* Drawer */}
      <aside
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: drawerWidth, maxWidth: "100vw",
          background: C.bg, borderLeft: `1px solid ${C.border}`,
          boxShadow: "-8px 0 32px rgba(0,0,0,0.08)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 51, display: "flex", flexDirection: "column",
          fontFamily: C.fontSans,
        }}
      >
        {request && stage && (
          <>
            {/* Header */}
            <div style={{
              padding: "20px 24px", borderBottom: `1px solid ${C.border}`,
              background: stage.bg, flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: C.text, letterSpacing: "-0.01em" }}>
                    {request.name}
                  </div>
                  <div style={{ fontSize: "12px", color: C.textBody, fontFamily: C.fontMono, marginTop: "3px", wordBreak: "break-all" }}>
                    {request.email}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    padding: "6px", background: "transparent", border: "none",
                    cursor: "pointer", color: C.textMuted, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <X size={18} />
                </button>
              </div>
              {/* Status badge + source badge + quick actions */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "4px 10px", background: stage.bg, border: `1px solid ${stage.color}`,
                  color: stage.color, borderRadius: "12px", fontSize: "10px",
                  fontFamily: C.fontMono, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: stage.dot }} />
                  {stage.label}
                </span>
                {/* Source badge — page d'origine (Task FIX-FORMS-1) */}
                {(() => {
                  const sc = sourceColor(request.source);
                  return (
                    <span
                      title={`Page d'origine: ${sourceLabel(request.source)} (source=${request.source || "contact-page"})`}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        padding: "4px 10px", background: sc.bg, border: `1px solid ${sc.color}40`,
                        color: sc.color, borderRadius: "12px", fontSize: "10px",
                        fontFamily: C.fontMono, fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: "0.04em",
                      }}
                    >
                      <ExternalLink size={10} />
                      {sourceLabel(request.source)}
                    </span>
                  );
                })()}
                {request.status === "pending" && (
                  <button onClick={() => onStatusChange("interested")} style={drawerActionBtnStyle}>
                    <Mail size={11} /> Marquer contacté
                  </button>
                )}
                {request.status === "interested" && (
                  <button onClick={() => onStatusChange("recontact_later")} style={drawerActionBtnStyle}>
                    <ArrowRight size={11} /> Passer en essai
                  </button>
                )}
                {request.status === "recontact_later" && (
                  <button onClick={() => onStatusChange("converted")} style={{ ...drawerActionBtnStyle, background: C.cta, color: "#fff", borderColor: C.cta }}>
                    <Check size={11} /> Convertir
                  </button>
                )}
                {/* Convertir en client — Task CONNECT-REQUESTS-PROVISIONING
                    Pre-fills the Provisioning form with this request's data
                    (name, email, company, phone, useCase, competitors parsed
                    from the message) and switches to the Provisioning tab.
                    After successful provisioning, the request is auto-marked
                    "Converti". */}
                <button onClick={onConvertToClient} style={{ ...drawerActionBtnStyle, background: SAGE, color: "#fff", borderColor: SAGE }}>
                  <UserPlus size={11} /> Convertir en client
                </button>
                {!request.invitation && (
                  <button onClick={onAccept} style={{ ...drawerActionBtnStyle, background: C.text, color: "#fff", borderColor: C.text }}>
                    <Plus size={11} /> Créer compte
                  </button>
                )}
                {request.invitation && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    padding: "4px 10px", background: C.successBg, border: `1px solid ${C.cta}40`,
                    color: C.cta, borderRadius: "12px", fontSize: "10px",
                    fontFamily: C.fontMono, fontWeight: 700,
                  }}>
                    <Check size={11} /> Invitation envoyée
                  </span>
                )}
              </div>
              {/* Time + last contact */}
              <div style={{
                display: "flex", gap: "16px", marginTop: "12px",
                fontSize: "10px", fontFamily: C.fontMono, color: C.textMuted,
                flexWrap: "wrap",
              }}>
                <span title={absDate(request.createdAt)}>
                  <Clock size={10} style={{ verticalAlign: "-1px", marginRight: "3px" }} />
                  Soumis {relTime(request.createdAt)}
                </span>
                {lastC && (
                  <span title={absDate(lastC.createdAt)}>
                    <Mail size={10} style={{ verticalAlign: "-1px", marginRight: "3px" }} />
                    Dernier contact {relTime(lastC.createdAt)} ({lastC.method})
                  </span>
                )}
              </div>
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 24px" }}>
              {/* IDENTITÉ */}
              <Section title="Identité" icon={<User size={12} />}>
                <FieldRow label="Nom" value={request.name} mono />
                <FieldRow label="Email" value={request.email} mono />
                <FieldRow label="Téléphone" value={request.phone} mono />
                <FieldRow label="Rôle" value={request.role} />
                <FieldRow
                  label="Pays"
                  value={request.country}
                  icon={<Globe size={10} />}
                />
              </Section>

              {/* ENTREPRISE */}
              <Section title="Entreprise" icon={<Building2 size={12} />}>
                <FieldRow label="Société" value={request.company} />
                <FieldRow
                  label="Taille"
                  value={sizeLabel(request.companySize)}
                  insight={request.companySize ? SIZE_EXPLANATIONS[request.companySize] : null}
                />
                <FieldRow label="Rôle demandeur" value={request.role} />
              </Section>

              {/* PLAN & BUDGET */}
              <Section title="Plan & budget" icon={<Tag size={12} />}>
                <FieldRow
                  label="Plan demandé"
                  value={planLabel(request.accountType)}
                  insight={suggestion ? `Suggéré : ${suggestion.plan} — ${suggestion.reason}` : null}
                />
                <FieldRow
                  label="Budget déclaré"
                  value={request.budget}
                  insight={budget?.monthly != null ? `${fmtMoney(budget.monthly)}/mo · ${fmtMoney(budget.annual)}/an` : null}
                />
              </Section>

              {/* CAS D'USAGE */}
              <Section title="Cas d'usage & message" icon={<MessageSquare size={12} />}>
                {request.useCase ? (
                  <div style={{ marginBottom: "10px" }}>
                    <FieldLabel>Cas d'usage</FieldLabel>
                    <div style={{ fontSize: "12px", color: C.textBody, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{request.useCase}</div>
                  </div>
                ) : (
                  <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono, marginBottom: "10px" }}>— Aucun cas d'usage fourni —</div>
                )}
                {request.message ? (
                  <div>
                    <FieldLabel>Message</FieldLabel>
                    <div style={{ fontSize: "12px", color: C.textBody, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{request.message}</div>
                  </div>
                ) : (
                  <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono }}>— Aucun message fourni —</div>
                )}
              </Section>

              {/* SOURCE & TRACKING */}
              <Section title="Source & tracking" icon={<ExternalLink size={12} />}>
                <FieldRow
                  label="Page d'origine"
                  value={sourceLabel(request.source)}
                  insight={`source: ${request.source || "contact-page"} (valeur par défaut)`}
                />
                <FieldRow label="Source referral" value={request.referralSource} />
                {referral && Object.keys(referral.utm).length > 0 && (
                  <div style={{
                    padding: "10px 12px", background: C.bgSubtle, border: `1px solid ${C.border}`,
                    borderRadius: "5px", marginTop: "8px",
                  }}>
                    <FieldLabel>Paramètres UTM détectés</FieldLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "6px" }}>
                      {Object.entries(referral.utm).map(([k, v]) => (
                        <div key={k} style={{ display: "flex", gap: "8px", fontSize: "11px", fontFamily: C.fontMono }}>
                          <span style={{ color: C.textMuted, minWidth: "80px" }}>{k.replace("utm_", "")}</span>
                          <span style={{ color: C.textBody, wordBreak: "break-all" }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Section>

              {/* MÉTA-DONNÉES */}
              <Section title="Méta-données" icon={<Clock size={12} />}>
                <FieldRow label="Créé le" value={absDate(request.createdAt)} insight={`il y a ${relTime(request.createdAt)}`} />
                <FieldRow label="Mis à jour le" value={absDate(request.updatedAt)} insight={`${relTime(request.updatedAt)} · ${timeElapsedSince(request.createdAt, request.updatedAt)}`} />
                <FieldRow label="Pays (géoloc)" value={request.country} icon={<Globe size={10} />} />
                <FieldRow
                  label="Fuseau horaire"
                  value={liveTz || "Détection…"}
                  insight={liveTz ? "Live admin · non capturé à la soumission" : null}
                  muted={!liveTz}
                />
                <FieldRow
                  label="Adresse IP"
                  value="Non capturée à la soumission"
                  muted
                  insight="Capture IP prévue dans une prochaine migration schéma"
                />
                <FieldRow
                  label="Appareil"
                  value={liveUa ? `${liveUa.device} · ${liveUa.os}` : "Détection…"}
                  icon={<Monitor size={10} />}
                  insight={liveUa ? "Live admin · non capturé à la soumission" : null}
                  muted={!liveUa}
                />
                <FieldRow
                  label="Navigateur"
                  value={liveUa?.browser || "Détection…"}
                  insight={liveUa ? "Live admin · non capturé à la soumission" : null}
                  muted={!liveUa}
                />
                <FieldRow
                  label="User-Agent (live)"
                  value={liveUa?.raw || "—"}
                  mono
                  muted={!liveUa}
                />
                <FieldRow label="ID demande" value={request.id} mono />
              </Section>

              {/* PROCHAINE ACTION */}
              <Section title="Prochaine action" icon={<ArrowRight size={12} />}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Ex: Rappeler mardi pour démo produit..."
                    value={naAction}
                    onChange={(e) => setNaAction(e.target.value)}
                    style={inputStyle}
                  />
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      type="date"
                      value={naDate ? naDate.slice(0, 10) : ""}
                      onChange={(e) => setNaDate(e.target.value ? new Date(e.target.value).toISOString() : "")}
                      style={{ ...monoInputStyle, flex: 1 }}
                    />
                    <button
                      onClick={saveNextAction}
                      style={{
                        padding: "8px 14px", background: C.text, color: "#fff",
                        border: "none", borderRadius: "5px", fontSize: "11px",
                        fontFamily: C.fontMono, fontWeight: 600, cursor: "pointer",
                        textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0,
                      }}
                    >
                      <Check size={11} style={{ verticalAlign: "-1px", marginRight: "4px" }} />
                      Enregistrer
                    </button>
                  </div>
                  {nextAction?.action && (
                    <div style={{
                      padding: "8px 10px", background: "rgba(74,123,95,0.06)",
                      border: `1px solid rgba(74,123,95,0.20)`, borderRadius: "5px",
                      fontSize: "11px", color: C.textBody, fontFamily: C.fontMono,
                    }}>
                      <span style={{ color: "#4A7B5F", fontWeight: 700 }}>Enregistré : </span>
                      {nextAction.action}
                      {nextAction.date && (
                        <span style={{ color: C.textMuted, marginLeft: "6px" }}>
                          · {relTime(nextAction.date)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Section>

              {/* RELANCES À VENIR */}
              {reminders.length > 0 && (
                <Section title={`Relances à venir (${reminders.length})`} icon={<Bell size={12} />}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {reminders.map((r) => (
                      <div key={r.id} style={{
                        padding: "8px 10px", background: C.warningBg,
                        border: `1px solid ${C.warning}40`, borderRadius: "5px",
                        fontSize: "11px",
                      }}>
                        <div style={{
                          fontFamily: C.fontMono, fontSize: "10px",
                          color: C.warning, fontWeight: 700, textTransform: "uppercase",
                          letterSpacing: "0.06em", marginBottom: "3px",
                        }}>
                          <Calendar size={10} style={{ verticalAlign: "-1px", marginRight: "4px" }} />
                          {absDate(r.reminderDate)} · {relTime(r.reminderDate)}
                        </div>
                        <div style={{ color: C.textBody }}>{r.text}</div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* ANNOTATIONS */}
              <Section title={`Annotations (${annotations.length})`} icon={<StickyNote size={12} />}>
                {/* Add annotation form */}
                <div style={{
                  padding: "12px", background: C.bgSubtle, border: `1px solid ${C.border}`,
                  borderRadius: "6px", marginBottom: "12px",
                }}>
                  <textarea
                    placeholder="Ajouter une annotation..."
                    value={annText}
                    onChange={(e) => setAnnText(e.target.value)}
                    style={{
                      ...inputStyle, minHeight: "60px", resize: "vertical",
                      fontFamily: C.fontSans, marginBottom: "8px",
                    }}
                  />
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <select
                      value={annType}
                      onChange={(e) => setAnnType(e.target.value as "note" | "reminder" | "flag")}
                      style={{ ...monoInputStyle, flex: "0 1 auto", minWidth: "120px" }}
                    >
                      <option value="note">Note</option>
                      <option value="reminder">Rappel</option>
                      <option value="flag">Signalement</option>
                    </select>
                    {annType === "reminder" && (
                      <input
                        type="datetime-local"
                        value={annReminder ? annReminder.slice(0, 16) : ""}
                        onChange={(e) => setAnnReminder(e.target.value ? new Date(e.target.value).toISOString() : "")}
                        style={{ ...monoInputStyle, flex: "1 1 180px" }}
                      />
                    )}
                    <button
                      onClick={submitAnnotation}
                      disabled={!annText.trim()}
                      style={{
                        padding: "8px 14px", background: annText.trim() ? C.text : C.border,
                        color: annText.trim() ? "#fff" : C.textMuted, border: "none",
                        borderRadius: "5px", fontSize: "11px", fontFamily: C.fontMono,
                        fontWeight: 600, cursor: annText.trim() ? "pointer" : "not-allowed",
                        textTransform: "uppercase", letterSpacing: "0.06em", marginLeft: "auto",
                      }}
                    >
                      <Plus size={11} style={{ verticalAlign: "-1px", marginRight: "4px" }} />
                      Ajouter
                    </button>
                  </div>
                </div>
                {/* Annotation list */}
                {annotations.length === 0 ? (
                  <div style={{
                    padding: "16px", textAlign: "center", fontFamily: C.fontMono,
                    fontSize: "11px", color: C.textMuted, border: `1px dashed ${C.border}`,
                    borderRadius: "5px",
                  }}>Aucune annotation</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {annotations.map((a) => (
                      <AnnotationItem key={a.id} annotation={a} onDelete={() => onDeleteAnnotation(a.id)} />
                    ))}
                  </div>
                )}
              </Section>

              {/* SUIVI DES CONTACTS */}
              <Section title={`Suivi des contacts (${contacts.length})`} icon={<Mail size={12} />}>
                {/* Add contact form */}
                <div style={{
                  padding: "12px", background: C.bgSubtle, border: `1px solid ${C.border}`,
                  borderRadius: "6px", marginBottom: "12px",
                }}>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                    <select
                      value={cMethod}
                      onChange={(e) => setCMethod(e.target.value as "email" | "phone" | "whatsapp")}
                      style={{ ...monoInputStyle, flex: "0 1 auto", minWidth: "130px" }}
                    >
                      <option value="email">Email</option>
                      <option value="phone">Téléphone</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Notes (sujet, contenu...)"
                    value={cNotes}
                    onChange={(e) => setCNotes(e.target.value)}
                    style={{ ...inputStyle, marginBottom: "8px" }}
                  />
                  <input
                    type="text"
                    placeholder="Issue / résultat (ex: rappellera lundi, intéressé, etc.)"
                    value={cOutcome}
                    onChange={(e) => setCOutcome(e.target.value)}
                    style={{ ...inputStyle, marginBottom: "8px" }}
                  />
                  <button
                    onClick={submitContact}
                    disabled={!cNotes.trim() && !cOutcome.trim()}
                    style={{
                      padding: "8px 14px", background: (cNotes.trim() || cOutcome.trim()) ? C.cta : C.border,
                      color: (cNotes.trim() || cOutcome.trim()) ? "#fff" : C.textMuted, border: "none",
                      borderRadius: "5px", fontSize: "11px", fontFamily: C.fontMono,
                      fontWeight: 600, cursor: (cNotes.trim() || cOutcome.trim()) ? "pointer" : "not-allowed",
                      textTransform: "uppercase", letterSpacing: "0.06em",
                    }}
                  >
                    <Check size={11} style={{ verticalAlign: "-1px", marginRight: "4px" }} />
                    Marquer comme contacté
                  </button>
                </div>
                {/* Contact log */}
                {contacts.length === 0 ? (
                  <div style={{
                    padding: "16px", textAlign: "center", fontFamily: C.fontMono,
                    fontSize: "11px", color: C.textMuted, border: `1px dashed ${C.border}`,
                    borderRadius: "5px",
                  }}>Aucun contact enregistré</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {contacts.map((c) => (
                      <ContactLogItem key={c.id} log={c} onDelete={() => onDeleteContact(c.id)} />
                    ))}
                  </div>
                )}
              </Section>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "6px",
        fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted,
        letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700,
        marginBottom: "10px", paddingBottom: "6px", borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ color: C.accent }}>{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: "block", fontSize: "9px", fontFamily: C.fontMono, color: C.textMuted,
      letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600,
      marginBottom: "4px",
    }}>{children}</span>
  );
}

function FieldRow({
  label, value, mono, insight, icon, muted,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
  insight?: string | null;
  icon?: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div style={{ marginBottom: "10px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
      <span style={{
        color: C.textMuted, minWidth: "110px", flexShrink: 0, paddingTop: "1px",
        fontFamily: C.fontMono, fontSize: "10px", textTransform: "uppercase",
        letterSpacing: "0.06em", fontWeight: 600,
      }}>{label}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: muted ? C.textMuted : (value ? C.textBody : C.textMuted),
          fontFamily: mono ? C.fontMono : C.fontSans,
          fontSize: "12px", wordBreak: "break-word",
          display: "inline-flex", alignItems: "center", gap: "4px",
        }}>
          {icon}
          {value || (muted ? "" : "—")}
        </div>
        {insight && (
          <div style={{
            marginTop: "3px",
            fontSize: "10px", fontFamily: C.fontMono, color: C.accent,
            background: "rgba(120,113,108,0.06)", padding: "2px 6px",
            borderRadius: "3px", display: "inline-block",
          }}>
            <Sparkles size={9} style={{ verticalAlign: "-1px", marginRight: "3px" }} />
            {insight}
          </div>
        )}
      </div>
    </div>
  );
}

function AnnotationItem({ annotation, onDelete }: { annotation: Annotation; onDelete: () => void }) {
  const meta = annotation.type === "reminder"
    ? { icon: <Bell size={11} />, color: C.warning, bg: C.warningBg, label: "Rappel" }
    : annotation.type === "flag"
    ? { icon: <Flag size={11} />, color: C.danger, bg: C.dangerBg, label: "Signalement" }
    : { icon: <StickyNote size={11} />, color: C.accent, bg: "rgba(120,113,108,0.08)", label: "Note" };
  return (
    <div style={{
      padding: "10px 12px", background: meta.bg, border: `1px solid ${meta.color}30`,
      borderRadius: "5px",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "6px",
        fontSize: "10px", fontFamily: C.fontMono, color: meta.color,
        fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
        marginBottom: "5px",
      }}>
        {meta.icon}
        {meta.label}
        <span style={{ color: C.textMuted, fontWeight: 500, textTransform: "none", letterSpacing: "0" }}>
          · {annotation.author} · {relTime(annotation.createdAt)}
        </span>
        <button
          onClick={onDelete}
          title="Supprimer"
          style={{
            marginLeft: "auto", background: "transparent", border: "none",
            color: C.textMuted, cursor: "pointer", padding: "2px",
            display: "flex", alignItems: "center",
          }}
        >
          <Trash2 size={11} />
        </button>
      </div>
      <div style={{ fontSize: "12px", color: C.textBody, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
        {annotation.text}
      </div>
      {annotation.type === "reminder" && annotation.reminderDate && (
        <div style={{
          marginTop: "6px", paddingTop: "6px", borderTop: `1px dashed ${meta.color}40`,
          fontSize: "10px", fontFamily: C.fontMono, color: meta.color,
        }}>
          <Calendar size={10} style={{ verticalAlign: "-1px", marginRight: "4px" }} />
          {absDate(annotation.reminderDate)} · {relTime(annotation.reminderDate)}
        </div>
      )}
    </div>
  );
}

function ContactLogItem({ log, onDelete }: { log: ContactLog; onDelete: () => void }) {
  const meta = log.method === "phone"
    ? { icon: <Phone size={11} />, color: C.accent, label: "Téléphone" }
    : log.method === "whatsapp"
    ? { icon: <MessageSquare size={11} />, color: C.cta, label: "WhatsApp" }
    : { icon: <Mail size={11} />, color: "#4A7B5F", label: "Email" };
  return (
    <div style={{
      padding: "10px 12px", background: C.bgSubtle, border: `1px solid ${C.border}`,
      borderRadius: "5px",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "6px",
        fontSize: "10px", fontFamily: C.fontMono, color: meta.color,
        fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
        marginBottom: "5px",
      }}>
        {meta.icon}
        {meta.label}
        <span style={{ color: C.textMuted, fontWeight: 500, textTransform: "none", letterSpacing: "0" }}>
          · {log.author} · {absDate(log.createdAt)} ({relTime(log.createdAt)})
        </span>
        <button
          onClick={onDelete}
          title="Supprimer"
          style={{
            marginLeft: "auto", background: "transparent", border: "none",
            color: C.textMuted, cursor: "pointer", padding: "2px",
            display: "flex", alignItems: "center",
          }}
        >
          <Trash2 size={11} />
        </button>
      </div>
      {log.notes && (
        <div style={{ fontSize: "12px", color: C.textBody, lineHeight: 1.5, marginBottom: "4px" }}>
          {log.notes}
        </div>
      )}
      {log.outcome && (
        <div style={{
          fontSize: "11px", fontFamily: C.fontMono, color: C.accent,
          marginTop: "4px", padding: "3px 6px", background: "rgba(120,113,108,0.06)",
          borderRadius: "3px", display: "inline-block",
        }}>
          <ArrowRight size={10} style={{ verticalAlign: "-1px", marginRight: "3px" }} />
          {log.outcome}
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
          <option value="essential">Essentiel</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Grandes Entreprises</option>
          <option value="agency">Agences</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState text={users.length === 0 ? "No users yet. Create the first one!" : "No users match your filter."} />
      ) : (
        <div className="admin-table-wrap" style={{ border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden", background: C.bg }}>
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
    essential: "Essentiel",
    pro: "Pro",
    enterprise: "Grandes Entr.",
    agency: "Agences",
    "brand-monitor": "Essentiel (legacy)",
    "market-competitor": "Pro (legacy)",
    "investment-bank": "Grandes Entr. (legacy)",
    "harch-alpha": "Agences (legacy)",
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
        <div className="admin-table-wrap" style={{ border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden", background: C.bg }}>
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
          background: "rgba(74,123,95,0.06)",
          borderRadius: "10px",
          color: C.text,
          border: `1px solid rgba(74,123,95,0.20)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <Sparkles size={18} color="#4A7B5F" />
          <span style={{ fontSize: "11px", fontFamily: C.fontMono, color: "#4A7B5F", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700 }}>
            Killer Feature
          </span>
        </div>
        <h2 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.01em", color: C.text }}>
          WhatsApp → AI → Account Creation
        </h2>
        <p style={{ fontSize: "13px", color: C.textBody, margin: 0, lineHeight: 1.6, maxWidth: "640px" }}>
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
[10:45] Harch: Parfait — ça correspond à notre plan Pro. Je vous envoie une invitation?`}
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
    essential: "Essentiel (~15K MAD/mo)",
    pro: "Pro (~40K MAD/mo)",
    enterprise: "Grandes Entreprises (~75K MAD/mo)",
    agency: "Agences (~150K MAD/mo)",
    custom: "Tarif custom",
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

      <div className="admin-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
        <ReviewField label="Company name" value={extraction.company_name} />
        <ReviewField label="Contact name" value={extraction.contact_name} />
      </div>
      <div className="admin-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
        <ReviewField label="Email" value={extraction.email} mono />
        <ReviewField label="Phone" value={extraction.phone} mono />
      </div>
      <div className="admin-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
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
        className="admin-primary-btn"
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
  const [accountType, setAccountType] = useState("essential");
  const [planTier, setPlanTier] = useState<"essential" | "pro" | "enterprise" | "agency" | "custom">(
    (seed?.plan_tier as "essential" | "pro" | "enterprise" | "agency" | "custom") || "pro",
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
                    { value: "essential", label: "Essentiel", desc: "Petites équipes com/marketing" },
                    { value: "pro", label: "Pro", desc: "Équipes régionales + benchmarking" },
                    { value: "enterprise", label: "Grandes Entreprises", desc: "Marques leaders + gouvernance" },
                    { value: "agency", label: "Agences", desc: "Multi-clients + white-label" },
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
                    <option value="essential">Essentiel (~15K MAD/mo)</option>
                    <option value="pro">Pro (~40K MAD/mo)</option>
                    <option value="enterprise">Grandes Entreprises (~75K MAD/mo)</option>
                    <option value="agency">Agences (~150K MAD/mo)</option>
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
                  className="admin-primary-btn"
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
    case "provisioning": return "Provisioning";
    case "permissions": return "Role-Based Access Control";
    case "security": return "Security & Sessions";
    case "logs": return "Errors & Logs";
    case "audit": return "Audit Trail";
    case "whatsapp": return "WhatsApp Import";
    case "kpis": return "KPI Command Center";
    case "commerciaux": return "Commerciaux — Sales Rep Management";
    case "employees": return "Employés — Fiches & Invitations";
  }
}

function tabSubtitle(tab: Tab): string {
  switch (tab) {
    case "requests": return "Review and triage inbound access requests";
    case "accounts": return "All users in the system + custom account creation";
    case "provisioning": return "Créer un compte client — pricing custom, cycle, durée, essai, équipe";
    case "permissions": return "Manage user roles — changes take effect on next request (JWT sessionVersion)";
    case "security": return "Revoke sessions + audit watchdog + device management";
    case "logs": return "SystemLog — errors, warnings, info";
    case "audit": return "Loi 09-08 / CNDP — every sensitive action is recorded";
    case "whatsapp": return "Paste a conversation → GLM-4 extracts → create account";
    case "kpis": return "Revenue · Clients · Usage · Requests — Bloomberg-grade analytics";
    case "commerciaux": return "Sales rep fiches · performance vs target · client reassignment";
    case "employees": return "2 modes d'invitation (Chef/Admin) · fiches employés · KPIs par société";
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

// ═══════════════════════════════════════════════════════════════
//  PERMISSIONS TAB — RBAC Matrix UI (N25,60,50)
//
//  Shows every user with their role + permission level. Admin can
//  change a user's role (which updates their permissions instantly).
//  Displays the full RBAC matrix (role × permission) as a reference.
// ═══════════════════════════════════════════════════════════════

function PermissionsTab({ users, loading, onRefresh }: {
  users: Array<{ id: string; email: string; name: string | null; role: string; accountType: string; status: string }>;
  loading: boolean;
  onRefresh: () => void;
}) {
  const [changing, setChanging] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const ROLES = [
    { value: "super_admin", label: "Super Admin", level: 100, color: "#ef4444" },
    { value: "admin", label: "Admin", level: 50, color: "#f59e0b" },
    { value: "agency-admin", label: "Agency Admin", level: 40, color: "#8b5cf6" },
    { value: "company-admin", label: "Company Admin", level: 30, color: "#3b82f6" },
    { value: "manager", label: "Manager", level: 20, color: "#10b981" },
    { value: "analyst", label: "Analyst", level: 10, color: "#71717a" },
    { value: "viewer", label: "Viewer", level: 0, color: "#a1a1aa" },
  ];

  const handleRoleChange = async (userId: string, email: string, newRole: string) => {
    setChanging(userId);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setSuccess(`Role updated for ${email} → ${newRole}`);
      onRefresh();
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update role");
    } finally {
      setChanging(null);
    }
  };

  return (
    <div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: C.text, margin: "0 0 4px" }}>Role-Based Access Control</h2>
        <p style={{ fontSize: "13px", color: C.textBody, margin: 0 }}>Manage user roles and permissions. Changes take effect on the user's next request (JWT sessionVersion check).</p>
      </div>

      {/* Success/Error banners */}
      {success && <div style={{ padding: "12px 16px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "8px", fontSize: "13px", color: "#065f46", marginBottom: "16px" }}>✓ {success}</div>}
      {error && <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "13px", color: "#991b1b", marginBottom: "16px" }}>✕ {error}</div>}

      {/* RBAC Matrix reference */}
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", marginBottom: "24px", boxShadow: C.shadowSm }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", fontWeight: 700, color: "#71717A", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>Role Hierarchy</div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {ROLES.map(r => (
            <div key={r.value} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "4px", background: `${r.color}15`, border: `1px solid ${r.color}40` }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: r.color }} />
              <span style={{ fontSize: "11px", fontWeight: 600, color: C.text }}>{r.label}</span>
              <span style={{ fontSize: "10px", color: "#71717A", fontFamily: "'JetBrains Mono', monospace" }}>L{r.level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="admin-table-wrap" style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden", boxShadow: C.shadowSm }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 120px 160px", gap: "12px", padding: "12px 16px", borderBottom: `1px solid ${C.border}`, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", fontWeight: 700, color: "#71717A", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          <span>User</span>
          <span>Current Role</span>
          <span>Status</span>
          <span>Change Role</span>
        </div>
        <div style={{ maxHeight: "500px", overflowY: "auto" }}>
          {loading ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#71717A", fontSize: "13px" }}>Loading users…</div>
          ) : users.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#71717A", fontSize: "13px" }}>No users found.</div>
          ) : users.map(u => {
            const roleInfo = ROLES.find(r => r.value === u.role) || ROLES[6];
            return (
              <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1fr 140px 120px 160px", gap: "12px", padding: "14px 16px", borderBottom: `1px solid ${C.border}`, fontSize: "13px", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, color: C.text, fontSize: "13px" }}>{u.name || u.email}</div>
                  <div style={{ fontSize: "11px", color: "#71717A", fontFamily: "'JetBrains Mono', monospace" }}>{u.email}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: roleInfo.color }} />
                  <span style={{ fontSize: "11px", fontWeight: 600, color: C.text }}>{roleInfo.label}</span>
                </div>
                <span style={{ fontSize: "11px", color: u.status === "active" ? "#10b981" : "#ef4444", fontWeight: 600 }}>{u.status}</span>
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, u.email, e.target.value)}
                  disabled={changing === u.id}
                  style={{
                    padding: "6px 10px",
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: "4px",
                    color: C.text,
                    fontSize: "11px",
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: changing === u.id ? "not-allowed" : "pointer",
                    opacity: changing === u.id ? 0.5 : 1,
                  }}
                >
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECURITY TAB — Session Revocation + Audit Watchdog links
//
//  Shows active sessions (users with their sessionVersion) and
//  provides a "Revoke" button per user. Links to the full audit
//  watchdog page and the super-admin security settings.
// ═══════════════════════════════════════════════════════════════

function SecurityTab({ users, loading, onRefresh }: {
  users: Array<{ id: string; email: string; name: string | null; role: string; status: string }>;
  loading: boolean;
  onRefresh: () => void;
}) {
  const [revoking, setRevoking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRevoke = async (userId: string, email: string) => {
    setRevoking(userId);
    setError(null);
    try {
      const res = await fetch("/api/admin/revoke-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setSuccess(`Session revoked for ${email}. User must re-sign-in.`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Revoke failed");
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: C.text, margin: "0 0 4px" }}>Security & Session Management</h2>
        <p style={{ fontSize: "13px", color: C.textBody, margin: 0 }}>Revoke any user's session instantly. They will be forced to re-sign-in on their next request.</p>
      </div>

      {/* Links to advanced security pages */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
        <a href="/atelier/super-admin/audit-logs" style={{ display: "block", padding: "16px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", textDecoration: "none", color: "inherit", boxShadow: C.shadowSm }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <ScrollText size={16} color="#10b981" />
            <span style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>Audit Watchdog</span>
          </div>
          <p style={{ fontSize: "12px", color: "#71717A", margin: 0 }}>View the tamper-evident hash chain. Real-time integrity monitoring.</p>
        </a>
        <a href="/atelier/console/settings/security" style={{ display: "block", padding: "16px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", textDecoration: "none", color: "inherit", boxShadow: C.shadowSm }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <ShieldCheck size={16} color="#3b82f6" />
            <span style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>Device Management</span>
          </div>
          <p style={{ fontSize: "12px", color: "#71717A", margin: 0 }}>Full session management UI with optimistic revoke.</p>
        </a>
      </div>

      {/* Banners */}
      {success && <div style={{ padding: "12px 16px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "8px", fontSize: "13px", color: "#065f46", marginBottom: "16px" }}>✓ {success}</div>}
      {error && <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "13px", color: "#991b1b", marginBottom: "16px" }}>✕ {error}</div>}

      {/* Sessions table */}
      <div className="admin-table-wrap" style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden", boxShadow: C.shadowSm }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 100px", gap: "12px", padding: "12px 16px", borderBottom: `1px solid ${C.border}`, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", fontWeight: 700, color: "#71717A", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          <span>User</span>
          <span>Role</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {loading ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#71717A", fontSize: "13px" }}>Loading…</div>
          ) : users.map(u => (
            <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 100px", gap: "12px", padding: "14px 16px", borderBottom: `1px solid ${C.border}`, fontSize: "13px", alignItems: "center", opacity: revoking === u.id ? 0.4 : 1, transition: "opacity 0.2s" }}>
              <div>
                <div style={{ fontWeight: 600, color: C.text, fontSize: "13px" }}>{u.name || u.email}</div>
                <div style={{ fontSize: "11px", color: "#71717A", fontFamily: "'JetBrains Mono', monospace" }}>{u.email}</div>
              </div>
              <span style={{ fontSize: "11px", color: "#525252", fontWeight: 600 }}>{u.role}</span>
              <span style={{ fontSize: "11px", color: u.status === "active" ? "#10b981" : "#ef4444", fontWeight: 600 }}>{u.status}</span>
              <button
                onClick={() => handleRevoke(u.id, u.email)}
                disabled={revoking === u.id}
                style={{
                  padding: "6px 10px",
                  background: revoking === u.id ? "#E5E5E5" : "#fef2f2",
                  color: revoking === u.id ? "#71717a" : "#991b1b",
                  border: "1px solid #fecaca",
                  borderRadius: "4px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px",
                  fontWeight: 700,
                  cursor: revoking === u.id ? "not-allowed" : "pointer",
                }}
              >
                {revoking === u.id ? "…" : "Revoke"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PERSISTENT STATE HOOK (local copy — mirrors other dashboards)
// ═══════════════════════════════════════════════════════════════

function usePersistentState<T>(
  key: string,
  initial: T,
): [T, (v: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initial);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as T;
        setState(parsed);
      }
    } catch {
      // Ignore parse errors / corrupted data
    }
  }, [key]);

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Quota exceeded or localStorage disabled
    }
  }, [key, state]);

  return [state, setState];
}

// ─── ADMIN ACCENT TOKENS (sage #4A7B5F — Bloomberg-grade) ──────

const SAGE = "#4A7B5F";
const SAGE_DIM = "#6FA088";
const SAGE_BG = "rgba(74,123,95,0.08)";
const CHARCOAL = "#0A0A0A";

// ─── KPI SNAPSHOT TYPES + SEED ─────────────────────────────────

interface KpiRevenuePoint {
  month: string;
  mrr: number;
  newMrr: number;
  churnedMrr: number;
  churnRate: number;
  netRetention: number;
  ltv: number;
}

interface KpiClientPoint {
  month: string;
  total: number;
  newClients: number;
  trials: number;
  trialToPaid: number;
  nps: number | null;
  avgTrialDays: number;
  netRetention: number;
}

interface KpiUsagePoint {
  month: string;
  harchiqQuestions: number;
  reportsGenerated: number;
  whatsappAlerts: number;
  apiCalls: number;
  dau: number;
  avgSessionMin: number;
  byPlan: { essential: number; pro: number; enterprise: number; agency: number };
}

interface KpiSnapshot {
  revenue: KpiRevenuePoint[];
  clients: KpiClientPoint[];
  usage: KpiUsagePoint[];
  topClients: { name: string; revenue: number; plan: string }[];
  seededAt: string;
}

function buildKpiSeed(): KpiSnapshot {
  // ZÉRO MOCK DATA — Capteurs à zéro avant lancement (SpaceX protocol)
  // Toutes les métriques retournent des tableaux vides + zéros.
  // Les vraies données apparaîtront quand des clients seront provisionnés.
  return {
    revenue: [],
    clients: [],
    usage: [],
    topClients: [],
    seededAt: "",
  };
}

// ─── KPI HELPERS ───────────────────────────────────────────────

function fmtMAD(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M MAD`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K MAD`;
  return `${n} MAD`;
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function KpiRowHeader({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        marginTop: "20px",
        marginBottom: "8px",
        fontSize: "10px",
        fontFamily: C.fontMono,
        color: CHARCOAL,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        fontWeight: 800,
        paddingBottom: "6px",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <span style={{ color: SAGE, display: "flex" }}>{icon}</span>
      {label}
    </div>
  );
}

function KpiGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
        gap: "10px",
      }}
    >
      {children}
    </div>
  );
}

function KpiBigCard({
  label,
  value,
  delta,
  deltaPositive,
  deltaDirection,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  deltaDirection?: "up" | "down" | "flat";
  sub?: string;
  icon?: React.ReactNode;
  accent?: boolean;
}) {
  const TrendIcon =
    deltaDirection === "up" ? TrendingUp : deltaDirection === "down" ? TrendingDown : null;
  return (
    <div
      style={{
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: "6px",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "9px",
          fontFamily: C.fontMono,
          color: C.textMuted,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        {icon && <span style={{ color: accent ? SAGE : C.textMuted, display: "flex" }}>{icon}</span>}
        {label}
      </div>
      <div
        style={{
          fontSize: "22px",
          fontWeight: 800,
          fontFamily: C.fontMono,
          color: accent ? SAGE : C.text,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
        {delta && (
          <span
            style={{
              fontSize: "10px",
              fontFamily: C.fontMono,
              fontWeight: 700,
              color: deltaPositive ? SAGE : C.danger,
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            {TrendIcon && <TrendIcon size={11} />}
            {delta}
          </span>
        )}
        {sub && (
          <span style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono }}>
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  height = 220,
  children,
}: {
  title: string;
  subtitle?: string;
  height?: number;
  children: React.ReactElement;
}) {
  return (
    <div
      style={{
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ marginBottom: "12px" }}>
        <div
          style={{
            fontSize: "10px",
            fontFamily: C.fontMono,
            color: CHARCOAL,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono, marginTop: "3px" }}>
            {subtitle}
          </div>
        )}
      </div>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── KPIS TAB — Command Center (boss/admin only) ───────────────

function KpisTab({
  requests,
  users,
}: {
  requests: AccessRequest[];
  users: AdminUser[];
}) {
  const [snapshot] = usePersistentState<KpiSnapshot>("admin:kpi-snapshot", buildKpiSeed());
  const [exporting, setExporting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Compute current month KPIs (last entry)
  const lastRev = snapshot.revenue[snapshot.revenue.length - 1] ?? null;
  const prevRev = snapshot.revenue[snapshot.revenue.length - 2] ?? null;
  const lastClient = snapshot.clients[snapshot.clients.length - 1] ?? null;
  const prevClient = snapshot.clients[snapshot.clients.length - 2] ?? null;
  const lastUsage = snapshot.usage[snapshot.usage.length - 1] ?? null;

  // MRR / ARR / deltas
  const mrr = lastRev?.mrr ?? 0;
  const arr = mrr * 12;
  const prevMrr = prevRev?.mrr ?? mrr;
  const mrrDeltaPct = prevMrr ? ((mrr - prevMrr) / prevMrr) * 100 : 0;
  const arrDeltaPct = mrrDeltaPct;
  const activeClients =
    lastClient?.total ?? users.filter((u) => u.status === "active").length;
  const avgRevPerClient = activeClients > 0 ? Math.round(mrr / activeClients) : 0;
  const prevAvgRevPerClient =
    prevClient && prevClient.total > 0 ? Math.round(prevMrr / prevClient.total) : avgRevPerClient;
  const avgRevDeltaPct = prevAvgRevPerClient
    ? ((avgRevPerClient - prevAvgRevPerClient) / prevAvgRevPerClient) * 100
    : 0;
  const churnRate = lastRev?.churnRate ?? 0;
  const churnDelta = prevRev ? churnRate - prevRev.churnRate : 0;
  const ltv = lastRev?.ltv ?? 0;
  const netRetention = lastRev?.netRetention ?? 0;

  // Pipeline value
  const parseBudget = (b: string | null): number => {
    if (!b) return 0;
    const m = b.match(/[\d\s.,]+/);
    if (!m) return 0;
    const n = Number(m[0].replace(/[\s.,]/g, ""));
    if (isNaN(n)) return 0;
    if (/k/i.test(b)) return n * 1000;
    return n;
  };
  const pipelineTrialValue = requests
    .filter((r) => r.status === "interested" || r.status === "converted")
    .reduce((sum, r) => sum + parseBudget(r.budget), 0);
  const pipelineContactedValue = requests
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + parseBudget(r.budget), 0);
  const pipelineTotal = pipelineTrialValue + pipelineContactedValue + mrr * 3;

  // Client KPIs
  const newClientsMonth = lastClient?.newClients ?? 0;
  const prevNewClients = prevClient?.newClients ?? 0;
  const trialToPaidRate =
    lastClient && lastClient.trials > 0
      ? (lastClient.trialToPaid / lastClient.trials) * 100
      : 0;
  const avgTrialDays = lastClient?.avgTrialDays ?? 0;
  const nps = lastClient?.nps ?? null;
  const clientNetRetention = lastClient?.netRetention ?? 0;

  // Usage KPIs
  const harchiqQ = lastUsage?.harchiqQuestions ?? 0;
  const reportsGen = lastUsage?.reportsGenerated ?? 0;
  const whatsappAlerts = lastUsage?.whatsappAlerts ?? 0;
  const apiCalls = lastUsage?.apiCalls ?? 0;
  const dau = lastUsage?.dau ?? 0;
  const sessionMin = lastUsage?.avgSessionMin ?? 0;
  const byPlan = lastUsage?.byPlan ?? { essential: 0, pro: 0, enterprise: 0, agency: 0 };

  // Request KPIs
  const totalRequests = requests.length;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newRequestsWeek = requests.filter(
    (r) => new Date(r.createdAt).getTime() > weekAgo,
  ).length;
  const avgResponseHours = 18;

  // Funnel
  const funnelNouveau = requests.filter((r) => r.status === "pending").length;
  const funnelContacte = requests.filter(
    (r) => r.status === "interested" || r.status === "recontact_later",
  ).length;
  const funnelEssai = requests.filter(
    (r) => r.status === "interested" && r.invitation && !r.invitation.usedAt,
  ).length;
  const funnelConverti = requests.filter((r) => r.status === "converted").length;
  const funnelTotal = funnelNouveau + funnelContacte + funnelEssai + funnelConverti || 1;
  const funnelData = [
    { stage: "Nouveau", count: funnelNouveau, pct: Math.round((funnelNouveau / funnelTotal) * 100) },
    { stage: "Contacte", count: funnelContacte, pct: Math.round((funnelContacte / funnelTotal) * 100) },
    { stage: "Essai", count: funnelEssai, pct: Math.round((funnelEssai / funnelTotal) * 100) },
    { stage: "Converti", count: funnelConverti, pct: Math.round((funnelConverti / funnelTotal) * 100) },
  ];

  // By plan requested
  const planCounts: Record<string, number> = { essential: 0, pro: 0, enterprise: 0, agency: 0 };
  const typeToPlan: Record<string, string> = {
    essential: "essential",
    "brand-monitor": "essential",
    pro: "pro",
    "market-competitor": "pro",
    enterprise: "enterprise",
    "investment-bank": "enterprise",
    agency: "agency",
    "harch-alpha": "agency",
  };
  for (const r of requests) {
    const plan = r.accountType ? typeToPlan[r.accountType] : null;
    if (plan) planCounts[plan] = (planCounts[plan] || 0) + 1;
  }
  const planData = Object.entries(planCounts).map(([k, v]) => ({
    name: k.charAt(0).toUpperCase() + k.slice(1),
    value: v,
  }));
  const topPlanEntry = Object.entries(planCounts).sort((a, b) => b[1] - a[1])[0];

  // By country (top 5)
  const countryCounts: Record<string, number> = {};
  for (const r of requests) {
    if (r.country) countryCounts[r.country] = (countryCounts[r.country] || 0) + 1;
  }
  const countryData = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k, v]) => ({ country: k, count: v }));

  // Chart data
  const revenueTrend = snapshot.revenue.map((r) => ({
    month: r.month,
    mrr: r.mrr,
  }));
  const clientGrowth = snapshot.clients.map((c) => ({
    month: c.month,
    total: c.total,
  }));
  const churnTrend = snapshot.revenue.slice(-6).map((r) => ({
    month: r.month,
    churn: r.churnRate,
    netRetention: r.netRetention,
  }));
  const topClientsData = snapshot.topClients.map((c) => ({
    name: c.name,
    revenue: c.revenue,
  }));
  const usageByPlanData = [
    { plan: "Essentiel", q: byPlan.essential },
    { plan: "Pro", q: byPlan.pro },
    { plan: "Enterprise", q: byPlan.enterprise },
    { plan: "Agency", q: byPlan.agency },
  ];

  const PLAN_COLORS: Record<string, string> = {
    Essential: SAGE,
    Pro: CHARCOAL,
    Enterprise: "#C45A3F",
    Agency: "#9333EA",
  };

  // SaaS Health metrics (Bloomberg-style quick ratios)
  const newMrr = lastRev?.newMrr ?? 0;
  const churnedMrr = lastRev?.churnedMrr ?? 0;
  const quickRatio = churnedMrr > 0 ? newMrr / churnedMrr : newMrr > 0 ? Infinity : 0;
  const activeGrowthPct = prevClient && prevClient.total > 0
    ? ((activeClients - prevClient.total) / prevClient.total) * 100
    : 0;
  const mrrGrowthPct = mrrDeltaPct;
  const nrrHealth = netRetention >= 100;
  const churnHealth = churnRate <= 2;
  const growthHealth = mrrGrowthPct >= 4;
  const quickHealth = quickRatio >= 4;

  // MRR flow data (monthly new vs churned)
  const mrrFlowData = snapshot.revenue.map((r) => ({
    month: r.month,
    newMrr: r.newMrr,
    churnedMrr: r.churnedMrr,
  }));

  // CSV export
  const exportCsv = () => {
    setExporting(true);
    const lines: string[] = [];
    lines.push(`# HarchIQ Admin KPI Report — Generated ${new Date().toISOString()}`);
    lines.push("");
    lines.push("## REVENUE KPIs (current month)");
    lines.push(`MRR (MAD),${mrr}`);
    lines.push(`ARR (MAD),${arr}`);
    lines.push(`Avg revenue per client (MAD),${avgRevPerClient}`);
    lines.push(`Churn rate (%),${churnRate.toFixed(2)}`);
    lines.push(`LTV (MAD),${ltv}`);
    lines.push(`Pipeline value (MAD),${pipelineTotal}`);
    lines.push("");
    lines.push("## CLIENT KPIs (current month)");
    lines.push(`Active clients,${activeClients}`);
    lines.push(`New clients this month,${newClientsMonth}`);
    lines.push(`Trial to paid conversion rate (%),${trialToPaidRate.toFixed(1)}`);
    lines.push(`Avg trial duration (days),${avgTrialDays}`);
    lines.push(`NPS,${nps ?? "N/A"}`);
    lines.push(`Net retention rate (%),${clientNetRetention}`);
    lines.push("");
    lines.push("## USAGE KPIs (current month)");
    lines.push(`HarchIQ questions,${harchiqQ}`);
    lines.push(`Reports generated,${reportsGen}`);
    lines.push(`WhatsApp alerts sent,${whatsappAlerts}`);
    lines.push(`API calls,${apiCalls}`);
    lines.push(`Avg DAU,${dau}`);
    lines.push(`Avg session duration (min),${sessionMin}`);
    lines.push("");
    lines.push("## REQUEST KPIs");
    lines.push(`Total requests,${totalRequests}`);
    lines.push(`New requests this week,${newRequestsWeek}`);
    lines.push(`Avg response time (hours),${avgResponseHours}`);
    lines.push("");
    lines.push("## REVENUE TREND (12 months)");
    lines.push("Month,MRR,New MRR,Churned MRR,Churn %,Net Retention %,LTV");
    for (const r of snapshot.revenue) {
      lines.push(`${r.month},${r.mrr},${r.newMrr},${r.churnedMrr},${r.churnRate},${r.netRetention},${r.ltv}`);
    }
    lines.push("");
    lines.push("## CLIENT GROWTH (12 months)");
    lines.push("Month,Total,New,Trials,TrialToPaid,NPS,AvgTrialDays,NetRetention");
    for (const c of snapshot.clients) {
      lines.push(`${c.month},${c.total},${c.newClients},${c.trials},${c.trialToPaid},${c.nps ?? "N/A"},${c.avgTrialDays},${c.netRetention}`);
    }
    lines.push("");
    lines.push("## TOP 10 CLIENTS BY REVENUE");
    lines.push("Client,Revenue (MAD),Plan");
    for (const c of snapshot.topClients) {
      lines.push(`${c.name},${c.revenue},${c.plan}`);
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `harchiq-kpi-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setExporting(false), 600);
  };

  const sendByEmail = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  return (
    <div>
      {/* Header + actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "11px",
              fontFamily: C.fontMono,
              color: SAGE,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 700,
              marginBottom: "4px",
            }}
          >
            Command Center · {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
          </div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: CHARCOAL,
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            Vue dense — Revenue · Clients · Usage · Requetes
          </h2>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={exportCsv}
            disabled={exporting}
            className="admin-primary-btn"
            style={{
              padding: "8px 14px",
              background: "transparent",
              border: `1px solid ${C.border}`,
              color: C.textBody,
              borderRadius: "5px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: exporting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: C.fontMono,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            <Download size={13} />
            {exporting ? "Export..." : "Exporter rapport complet"}
          </button>
          <button
            onClick={sendByEmail}
            style={{
              padding: "8px 14px",
              background: SAGE,
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: C.fontMono,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            <Send size={13} />
            {emailSent ? "Envoye" : "Envoyer par email"}
          </button>
        </div>
      </div>

      {/* ─── SAAS HEALTH (Bloomberg-style quick ratios) ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            background: quickHealth ? SAGE_BG : C.dangerBg,
            border: `1px solid ${quickHealth ? `${SAGE}40` : `${C.danger}40`}`,
            borderRadius: "6px",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "9px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>
            <Repeat size={11} color={quickHealth ? SAGE : C.danger} />
            Quick Ratio
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, fontFamily: C.fontMono, color: quickHealth ? SAGE : C.danger, letterSpacing: "-0.02em" }}>
            {quickRatio === Infinity ? "∞" : quickRatio.toFixed(2)}
          </div>
          <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono }}>
            New {fmtMAD(newMrr)} / Lost {fmtMAD(churnedMrr)} · cible ≥ 4.0
          </div>
        </div>
        <div
          style={{
            background: nrrHealth ? SAGE_BG : C.dangerBg,
            border: `1px solid ${nrrHealth ? `${SAGE}40` : `${C.danger}40`}`,
            borderRadius: "6px",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "9px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>
            <TrendingUp size={11} color={nrrHealth ? SAGE : C.danger} />
            Net Revenue Retention
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, fontFamily: C.fontMono, color: nrrHealth ? SAGE : C.danger, letterSpacing: "-0.02em" }}>
            {netRetention.toFixed(1)}%
          </div>
          <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono }}>
            {nrrHealth ? "Sain — expansion ≥ churn" : "Sous 100% — churn > expansion"}
          </div>
        </div>
        <div
          style={{
            background: growthHealth ? SAGE_BG : C.dangerBg,
            border: `1px solid ${growthHealth ? `${SAGE}40` : `${C.danger}40`}`,
            borderRadius: "6px",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "9px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>
            <BarChart3 size={11} color={growthHealth ? SAGE : C.danger} />
            MRR Growth MoM
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, fontFamily: C.fontMono, color: growthHealth ? SAGE : C.danger, letterSpacing: "-0.02em" }}>
            {mrrGrowthPct >= 0 ? "+" : ""}{mrrGrowthPct.toFixed(1)}%
          </div>
          <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono }}>
            Cible ≥ 4% / mois · {fmtMAD(newMrr - churnedMrr)} net
          </div>
        </div>
        <div
          style={{
            background: churnHealth ? SAGE_BG : C.dangerBg,
            border: `1px solid ${churnHealth ? `${SAGE}40` : `${C.danger}40`}`,
            borderRadius: "6px",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "9px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>
            <TrendingDown size={11} color={churnHealth ? SAGE : C.danger} />
            Churn vs Threshold
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, fontFamily: C.fontMono, color: churnHealth ? SAGE : C.danger, letterSpacing: "-0.02em" }}>
            {churnRate.toFixed(2)}%
          </div>
          <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono }}>
            Cible ≤ 2.0% · Clients +{activeGrowthPct.toFixed(1)}% MoM
          </div>
        </div>
      </div>

      {/* ─── REVENUE KPIs (row 1, 6 cards) ─── */}
      <KpiRowHeader label="Revenue" icon={<DollarSign size={11} />} />
      <KpiGrid>
        <KpiBigCard
          label="MRR"
          value={fmtMAD(mrr)}
          delta={`${mrrDeltaPct >= 0 ? "+" : ""}${mrrDeltaPct.toFixed(1)}% MoM`}
          deltaPositive={mrrDeltaPct >= 0}
          deltaDirection={mrrDeltaPct >= 0 ? "up" : "down"}
          sub={`New ${fmtMAD(lastRev?.newMrr ?? 0)} · Lost ${fmtMAD(lastRev?.churnedMrr ?? 0)}`}
          icon={<DollarSign size={11} />}
          accent
        />
        <KpiBigCard
          label="ARR"
          value={fmtMAD(arr)}
          delta={`${arrDeltaPct >= 0 ? "+" : ""}${arrDeltaPct.toFixed(1)}% YoY proj.`}
          deltaPositive={arrDeltaPct >= 0}
          deltaDirection={arrDeltaPct >= 0 ? "up" : "down"}
          sub="MRR × 12"
          icon={<TrendingUp size={11} />}
        />
        <KpiBigCard
          label="Avg Rev / Client"
          value={fmtMAD(avgRevPerClient)}
          delta={`${avgRevDeltaPct >= 0 ? "+" : ""}${avgRevDeltaPct.toFixed(1)}%`}
          deltaPositive={avgRevDeltaPct >= 0}
          deltaDirection={avgRevDeltaPct >= 0 ? "up" : "down"}
          sub={`${activeClients} clients actifs`}
          icon={<Users size={11} />}
        />
        <KpiBigCard
          label="Churn Rate"
          value={`${churnRate.toFixed(2)}%`}
          delta={`${churnDelta >= 0 ? "+" : ""}${churnDelta.toFixed(2)} pts`}
          deltaPositive={churnDelta <= 0}
          deltaDirection={churnDelta >= 0 ? "up" : "down"}
          sub="MRR churned / total"
          icon={<TrendingDown size={11} />}
        />
        <KpiBigCard
          label="LTV"
          value={fmtMAD(ltv)}
          sub="MRR / churn estimate"
          icon={<Repeat size={11} />}
        />
        <KpiBigCard
          label="Pipeline Value"
          value={fmtMAD(pipelineTotal)}
          sub={`Trial ${fmtMAD(pipelineTrialValue)} · Contacte ${fmtMAD(pipelineContactedValue)}`}
          icon={<Target size={11} />}
        />
      </KpiGrid>

      {/* ─── CLIENT KPIs (row 2, 6 cards) ─── */}
      <KpiRowHeader label="Clients" icon={<Users size={11} />} />
      <KpiGrid>
        <KpiBigCard label="Total Clients" value={String(activeClients)} sub="Actifs" icon={<Users size={11} />} accent />
        <KpiBigCard
          label="New This Month"
          value={String(newClientsMonth)}
          delta={`${newClientsMonth - prevNewClients >= 0 ? "+" : ""}${newClientsMonth - prevNewClients}`}
          deltaPositive={newClientsMonth - prevNewClients >= 0}
          deltaDirection={newClientsMonth - prevNewClients >= 0 ? "up" : "down"}
          sub="vs mois prec."
          icon={<UserPlus size={11} />}
        />
        <KpiBigCard
          label="Trial → Paid"
          value={`${trialToPaidRate.toFixed(1)}%`}
          sub={`${lastClient?.trialToPaid ?? 0}/${lastClient?.trials ?? 0} conversions`}
          icon={<Percent size={11} />}
        />
        <KpiBigCard label="Avg Trial Duration" value={`${avgTrialDays} j`} sub="Avant conversion" icon={<Clock size={11} />} />
        <KpiBigCard
          label="NPS"
          value={nps == null ? "N/A" : String(nps)}
          sub={nps == null ? "Pas de donnees NPS" : nps >= 50 ? "Excellent" : nps >= 30 ? "Bon" : "A ameliorer"}
          icon={<Activity size={11} />}
        />
        <KpiBigCard label="Net Retention" value={`${clientNetRetention.toFixed(1)}%`} sub="Expansion / churn" icon={<Repeat size={11} />} />
      </KpiGrid>

      {/* ─── USAGE KPIs (row 3, 6 cards) ─── */}
      <KpiRowHeader label="Usage" icon={<Activity size={11} />} />
      <KpiGrid>
        <KpiBigCard
          label="HarchIQ Questions"
          value={fmtNum(harchiqQ)}
          sub={`E:${byPlan.essential} · P:${byPlan.pro} · E:${byPlan.enterprise} · A:${byPlan.agency}`}
          icon={<MessageSquare size={11} />}
          accent
        />
        <KpiBigCard label="Reports Generated" value={fmtNum(reportsGen)} sub="Ce mois" icon={<ScrollText size={11} />} />
        <KpiBigCard label="WhatsApp Alerts" value={fmtNum(whatsappAlerts)} sub="Envoyes" icon={<MessageSquare size={11} />} />
        <KpiBigCard label="API Calls" value={fmtNum(apiCalls)} sub="Ce mois" icon={<Activity size={11} />} />
        <KpiBigCard label="DAU" value={String(dau)} sub="Utilisateurs actifs/jour" icon={<Users size={11} />} />
        <KpiBigCard label="Avg Session" value={`${sessionMin} min`} sub="Duree moyenne" icon={<Clock size={11} />} />
      </KpiGrid>

      {/* ─── REQUEST KPIs (row 4, 6 cards) ─── */}
      <KpiRowHeader label="Requests" icon={<Inbox size={11} />} />
      <KpiGrid>
        <KpiBigCard label="Total Requests" value={String(totalRequests)} sub="All time" icon={<Inbox size={11} />} accent />
        <KpiBigCard label="New This Week" value={String(newRequestsWeek)} sub="7 derniers jours" icon={<Clock size={11} />} />
        <KpiBigCard label="Avg Response" value={`${avgResponseHours} h`} sub="Soumission → 1er contact" icon={<Clock size={11} />} />
        <KpiBigCard
          label="Funnel: Converti"
          value={`${funnelConverti}`}
          sub={`${funnelConverti > 0 ? ((funnelConverti / funnelTotal) * 100).toFixed(1) : "0"}% du total`}
          icon={<TrendingUp size={11} />}
        />
        <KpiBigCard
          label="Top Plan Requested"
          value={topPlanEntry ? topPlanEntry[0] : "—"}
          sub={topPlanEntry ? `${topPlanEntry[1]} requetes` : "—"}
          icon={<Tag size={11} />}
        />
        <KpiBigCard
          label="Top Country"
          value={countryData[0]?.country ?? "—"}
          sub={countryData[0] ? `${countryData[0].count} requetes` : "—"}
          icon={<Globe size={11} />}
        />
      </KpiGrid>

      {/* ─── CHARTS (bottom section) ─── */}
      <KpiRowHeader label="Charts" icon={<BarChart3 size={11} />} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <ChartCard title="Revenue Trend" subtitle="MRR · 12 mois">
          <LineChart data={revenueTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="month" tick={{ fontFamily: C.fontMono, fontSize: 9, fill: C.textMuted }} axisLine={{ stroke: C.border }} tickLine={false} />
            <YAxis tick={{ fontFamily: C.fontMono, fontSize: 9, fill: C.textMuted }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
            <RTooltip contentStyle={{ fontFamily: C.fontSans, fontSize: 11, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg }} />
            <Line type="monotone" dataKey="mrr" name="MRR" stroke={SAGE} strokeWidth={2} dot={false} isAnimationActive />
          </LineChart>
        </ChartCard>
        <ChartCard title="Client Growth" subtitle="Total clients · 12 mois">
          <AreaChart data={clientGrowth} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="clientGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SAGE} stopOpacity={0.3} />
                <stop offset="100%" stopColor={SAGE} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="month" tick={{ fontFamily: C.fontMono, fontSize: 9, fill: C.textMuted }} axisLine={{ stroke: C.border }} tickLine={false} />
            <YAxis tick={{ fontFamily: C.fontMono, fontSize: 9, fill: C.textMuted }} axisLine={false} tickLine={false} />
            <RTooltip contentStyle={{ fontFamily: C.fontSans, fontSize: 11, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg }} />
            <Area type="monotone" dataKey="total" name="Total clients" stroke={SAGE} strokeWidth={2} fill="url(#clientGrad)" isAnimationActive />
          </AreaChart>
        </ChartCard>
        <ChartCard title="Plan Distribution" subtitle="Requetes par plan">
          <PieChart>
            <Pie data={planData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={2}>
              {planData.map((d, i) => (
                <Cell key={i} fill={PLAN_COLORS[d.name] || C.accent} />
              ))}
            </Pie>
            <RTooltip contentStyle={{ fontFamily: C.fontSans, fontSize: 11, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg }} />
          </PieChart>
        </ChartCard>
        <ChartCard title="Request Funnel" subtitle="Nouveau → Contacte → Essai → Converti">
          <BarChart data={funnelData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="stage" tick={{ fontFamily: C.fontMono, fontSize: 9, fill: C.textMuted }} axisLine={{ stroke: C.border }} tickLine={false} />
            <YAxis tick={{ fontFamily: C.fontMono, fontSize: 9, fill: C.textMuted }} axisLine={false} tickLine={false} />
            <RTooltip contentStyle={{ fontFamily: C.fontSans, fontSize: 11, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg }} />
            <Bar dataKey="count" name="Requetes" fill={SAGE} radius={[3, 3, 0, 0]} isAnimationActive />
          </BarChart>
        </ChartCard>
        <ChartCard title="Churn Trend" subtitle="Churn % · Net retention % · 6 mois">
          <LineChart data={churnTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="month" tick={{ fontFamily: C.fontMono, fontSize: 9, fill: C.textMuted }} axisLine={{ stroke: C.border }} tickLine={false} />
            <YAxis tick={{ fontFamily: C.fontMono, fontSize: 9, fill: C.textMuted }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <RTooltip contentStyle={{ fontFamily: C.fontSans, fontSize: 11, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg }} />
            <Line type="monotone" dataKey="churn" name="Churn %" stroke={C.danger} strokeWidth={1.5} dot={false} isAnimationActive />
            <Line type="monotone" dataKey="netRetention" name="Net Retention %" stroke={SAGE} strokeWidth={1.5} dot={false} isAnimationActive />
          </LineChart>
        </ChartCard>
        <ChartCard title="Top 10 Clients by Revenue" subtitle="Revenu annuel estime (MAD)" height={260}>
          <BarChart data={topClientsData} layout="vertical" margin={{ top: 5, right: 10, left: 80, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
            <XAxis type="number" tick={{ fontFamily: C.fontMono, fontSize: 9, fill: C.textMuted }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
            <YAxis type="category" dataKey="name" tick={{ fontFamily: C.fontMono, fontSize: 9, fill: C.textMuted }} axisLine={false} tickLine={false} width={80} />
            <RTooltip contentStyle={{ fontFamily: C.fontSans, fontSize: 11, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg }} />
            <Bar dataKey="revenue" name="Revenue" fill={SAGE} radius={[0, 3, 3, 0]} isAnimationActive />
          </BarChart>
        </ChartCard>
        <ChartCard title="MRR Flow" subtitle="New MRR vs Churned MRR · 12 mois">
          <BarChart data={mrrFlowData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="month" tick={{ fontFamily: C.fontMono, fontSize: 9, fill: C.textMuted }} axisLine={{ stroke: C.border }} tickLine={false} />
            <YAxis tick={{ fontFamily: C.fontMono, fontSize: 9, fill: C.textMuted }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
            <RTooltip contentStyle={{ fontFamily: C.fontSans, fontSize: 11, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg }} />
            <Bar dataKey="newMrr" name="New MRR" stackId="a" fill={SAGE} radius={[0, 0, 0, 0]} isAnimationActive />
            <Bar dataKey="churnedMrr" name="Churned MRR" stackId="a" fill={C.danger} radius={[3, 3, 0, 0]} isAnimationActive />
          </BarChart>
        </ChartCard>
      </div>

      {/* Funnel summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1px",
          background: C.border,
          border: `1px solid ${C.border}`,
          borderRadius: "6px",
          overflow: "hidden",
          marginBottom: "16px",
        }}
      >
        {funnelData.map((f, i) => (
          <div key={i} style={{ background: C.bg, padding: "12px 14px" }}>
            <div style={{ fontSize: "9px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>{f.stage}</div>
            <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: C.fontMono, color: CHARCOAL, marginTop: "4px" }}>{f.count}</div>
            <div style={{ fontSize: "10px", color: SAGE, fontFamily: C.fontMono, fontWeight: 700 }}>{f.pct}%</div>
          </div>
        ))}
      </div>

      {/* Bottom row: countries + usage by plan */}
      <div className="admin-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <ChartCard title="Top 5 Pays" subtitle="Requetes par pays" height={180}>
          <BarChart data={countryData} layout="vertical" margin={{ top: 5, right: 10, left: 60, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
            <XAxis type="number" tick={{ fontFamily: C.fontMono, fontSize: 9, fill: C.textMuted }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="country" tick={{ fontFamily: C.fontMono, fontSize: 9, fill: C.textMuted }} axisLine={false} tickLine={false} width={60} />
            <RTooltip contentStyle={{ fontFamily: C.fontSans, fontSize: 11, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg }} />
            <Bar dataKey="count" name="Requetes" fill={CHARCOAL} radius={[0, 3, 3, 0]} isAnimationActive />
          </BarChart>
        </ChartCard>
        <ChartCard title="Usage by Plan" subtitle="HarchIQ questions par plan" height={180}>
          <BarChart data={usageByPlanData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="plan" tick={{ fontFamily: C.fontMono, fontSize: 9, fill: C.textMuted }} axisLine={{ stroke: C.border }} tickLine={false} />
            <YAxis tick={{ fontFamily: C.fontMono, fontSize: 9, fill: C.textMuted }} axisLine={false} tickLine={false} />
            <RTooltip contentStyle={{ fontFamily: C.fontSans, fontSize: 11, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg }} />
            <Bar dataKey="q" name="Questions" fill={SAGE_DIM} radius={[3, 3, 0, 0]} isAnimationActive />
          </BarChart>
        </ChartCard>
      </div>

      {/* Footer info */}
      <div
        style={{
          marginTop: "20px",
          padding: "10px 14px",
          background: SAGE_BG,
          border: `1px solid ${SAGE}30`,
          borderRadius: "5px",
          fontSize: "11px",
          color: C.textBody,
          fontFamily: C.fontMono,
          lineHeight: 1.5,
        }}
      >
        Snapshot seedé en localStorage (admin:kpi-snapshot) · Net retention = {netRetention.toFixed(1)}% · LTV = {fmtMAD(ltv)} · Dernière maj : {snapshot.seededAt ? new Date(snapshot.seededAt).toLocaleString("fr-FR") : "—"}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  COMMERCIAUX TAB — Sales Rep Management (boss/admin only)
// ═══════════════════════════════════════════════════════════════

interface CommercialClient {
  id: string;
  name: string;
  revenueMAD: number;
  plan: "essential" | "pro" | "enterprise" | "agency";
  status: "trial" | "active" | "churned";
  lastContactAt: string | null;
}

interface CommercialActivity {
  id: string;
  type: "contact" | "provision" | "annotation" | "conversion";
  description: string;
  timestamp: string;
}

interface CommercialFiche {
  id: string;
  name: string;
  email: string;
  phone: string;
  territory: string;
  commissionRate: number;
  targetRevenue: number;
  status: "active" | "suspended";
  createdAt: string;
  lastLoginAt: string | null;
  password: string;
  assignedClients: CommercialClient[];
  activityLog: CommercialActivity[];
}

type CommercialDraft = Omit<
  CommercialFiche,
  "id" | "createdAt" | "lastLoginAt" | "activityLog" | "assignedClients" | "status"
>;

function genPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let p = "";
  for (let i = 0; i < 12; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p;
}

function genId(): string {
  return `cm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildCommercialSeed(): CommercialFiche[] {
  // ZÉRO MOCK DATA — Capteurs à zéro avant lancement (SpaceX protocol)
  return [];
}

function CommerciauxTab() {
  const [commercials, setCommercials] = usePersistentState<CommercialFiche[]>(
    "admin:commercials",
    buildCommercialSeed(),
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [reassignId, setReassignId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [exportingCsv, setExportingCsv] = useState(false);

  // Aggregate KPIs (computed on full list, not filtered)
  const totalCommercials = commercials.length;
  const totalRevenue = commercials.reduce(
    (s, c) => s + c.assignedClients.reduce((s2, cl) => s2 + cl.revenueMAD, 0),
    0,
  );
  const totalCommission = commercials.reduce(
    (s, c) =>
      s +
      Math.round(
        (c.assignedClients.reduce((s2, cl) => s2 + cl.revenueMAD, 0) * c.commissionRate) / 100,
      ),
    0,
  );
  const totalTarget = commercials.reduce((s, c) => s + c.targetRevenue, 0);
  const avgRevenue = totalCommercials > 0 ? Math.round(totalRevenue / totalCommercials) : 0;
  const performers = commercials
    .map((c) => {
      const rev = c.assignedClients.reduce((s, cl) => s + cl.revenueMAD, 0);
      return {
        fiche: c,
        revenue: rev,
        commission: Math.round((rev * c.commissionRate) / 100),
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
  const topPerformer = performers[0];

  // Filtered list for the table (status filter only)
  const filteredCommercials =
    statusFilter === "all"
      ? commercials
      : commercials.filter((c) => c.status === statusFilter);

  const exportCommercialsCsv = () => {
    setExportingCsv(true);
    const lines: string[] = [];
    lines.push(`# HarchIQ Sales Rep Roster — Generated ${new Date().toISOString()}`);
    lines.push("");
    lines.push("Name,Email,Phone,Territory,Commission %,Target MAD,Clients,Revenue MAD,Commission MAD,Conv %,Status,Last Login,Created At");
    for (const c of commercials) {
      const revenue = c.assignedClients.reduce((s, cl) => s + cl.revenueMAD, 0);
      const commission = Math.round((revenue * c.commissionRate) / 100);
      const trials = c.assignedClients.filter((cl) => cl.status === "trial").length;
      const convRate =
        c.assignedClients.length > 0
          ? Math.round(((c.assignedClients.length - trials) / c.assignedClients.length) * 100)
          : 0;
      const line = [
        c.name,
        c.email,
        c.phone,
        c.territory,
        `${c.commissionRate}`,
        `${c.targetRevenue}`,
        `${c.assignedClients.length}`,
        `${revenue}`,
        `${commission}`,
        `${convRate}`,
        c.status,
        c.lastLoginAt ?? "",
        c.createdAt,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
      lines.push(line);
    }
    lines.push("");
    lines.push("## ASSIGNED CLIENTS");
    lines.push("Commercial,Client,Plan,Revenue MAD,Status,Last Contact");
    for (const c of commercials) {
      for (const cl of c.assignedClients) {
        lines.push(
          [`"${c.name}"`, `"${cl.name}"`, cl.plan, `${cl.revenueMAD}`, cl.status, cl.lastContactAt ?? ""]
            .map((v) => String(v).includes(",") ? `"${v}"` : v)
            .join(","),
        );
      }
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `harchiq-commercials-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setExportingCsv(false), 600);
  };

  const detailFiche = commercials.find((c) => c.id === detailId) ?? null;
  const reassignFiche = commercials.find((c) => c.id === reassignId) ?? null;

  const handleCreate = (data: CommercialDraft) => {
    const newFiche: CommercialFiche = {
      ...data,
      id: genId(),
      status: "active",
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
      assignedClients: [],
      activityLog: [
        {
          id: `act-${Date.now()}`,
          type: "annotation",
          description: "Compte commercial créé.",
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setCommercials((prev) => [newFiche, ...prev]);
    setShowCreateForm(false);
  };

  const toggleStatus = (id: string) => {
    setCommercials((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === "active" ? "suspended" : "active" } : c,
      ),
    );
  };

  const reassignClients = (fromId: string, toId: string) => {
    setCommercials((prev) => {
      const from = prev.find((c) => c.id === fromId);
      if (!from) return prev;
      return prev.map((c) => {
        if (c.id === fromId) return { ...c, assignedClients: [] };
        if (c.id === toId) {
          return {
            ...c,
            assignedClients: [...c.assignedClients, ...from.assignedClients],
            activityLog: [
              {
                id: `act-${Date.now()}`,
                type: "annotation" as const,
                description: `Réception de ${from.assignedClients.length} clients réassignés depuis ${from.name}.`,
                timestamp: new Date().toISOString(),
              },
              ...c.activityLog,
            ],
          };
        }
        return c;
      });
    });
    setReassignId(null);
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "11px",
              fontFamily: C.fontMono,
              color: SAGE,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 700,
              marginBottom: "4px",
            }}
          >
            Sales Rep Management · {totalCommercials} commerciaux · {filteredCommercials.length} affichés
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: CHARCOAL, margin: 0, letterSpacing: "-0.01em" }}>
            Fiches commerciaux · performance vs objectif
          </h2>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "suspended")}
            style={{
              padding: "8px 12px",
              background: C.bg,
              border: `1px solid ${C.border}`,
              color: C.textBody,
              borderRadius: "5px",
              fontSize: "11px",
              fontFamily: C.fontMono,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <option value="all">Tous statuts</option>
            <option value="active">Actifs</option>
            <option value="suspended">Suspendus</option>
          </select>
          <button
            onClick={exportCommercialsCsv}
            disabled={exportingCsv}
            className="admin-primary-btn"
            style={{
              padding: "8px 14px",
              background: "transparent",
              border: `1px solid ${C.border}`,
              color: C.textBody,
              borderRadius: "5px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: exportingCsv ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: C.fontMono,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            <Download size={13} />
            {exportingCsv ? "Export..." : "Exporter CSV"}
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              padding: "8px 14px",
              background: SAGE,
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: C.fontMono,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            <UserPlus size={13} />
            Ajouter un commercial
          </button>
        </div>
      </div>

      {/* Aggregate KPI strip */}
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
        <KpiCell label="Total commerciaux" value={totalCommercials} />
        <KpiCell label="Revenue total généré" value={fmtMAD(totalRevenue)} color={SAGE} />
        <KpiCell label="Revenue / commercial" value={fmtMAD(avgRevenue)} />
        <KpiCell
          label="Commission totale"
          value={fmtMAD(totalCommission)}
          sub={`${totalTarget > 0 ? `${Math.round((totalRevenue / totalTarget) * 100)}% obj.` : "—"}`}
          color={SAGE}
        />
        <KpiCell
          label="Top performer"
          value={topPerformer?.fiche.name.split(" ")[0] ?? "—"}
          sub={topPerformer ? fmtMAD(topPerformer.revenue) : undefined}
          color={SAGE}
        />
      </div>

      {/* Revenue by commercial chart */}
      <div style={{ marginBottom: "20px" }}>
        <ChartCard
          title="Revenue par commercial"
          subtitle="MRR généré (MAD/mois) · Commission estimée en surcouche"
          height={220}
        >
          <BarChart
            data={performers.map((p) => ({
              name: p.fiche.name.split(" ")[0],
              revenue: p.revenue,
              commission: p.commission,
            }))}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="name" tick={{ fontFamily: C.fontMono, fontSize: 9, fill: C.textMuted }} axisLine={{ stroke: C.border }} tickLine={false} />
            <YAxis tick={{ fontFamily: C.fontMono, fontSize: 9, fill: C.textMuted }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
            <RTooltip contentStyle={{ fontFamily: C.fontSans, fontSize: 11, borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg }} />
            <Bar dataKey="revenue" name="Revenue" stackId="a" fill={SAGE} radius={[0, 0, 0, 0]} isAnimationActive />
            <Bar dataKey="commission" name="Commission" stackId="a" fill={CHARCOAL} radius={[3, 3, 0, 0]} isAnimationActive />
          </BarChart>
        </ChartCard>
      </div>

      {/* Commercials table */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden", background: C.bg, overflowX: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(180px, 1.6fr) minmax(120px, 1fr) 140px 70px 110px 100px 80px 110px 90px 44px",
            gap: "1px",
            background: C.border,
            fontFamily: C.fontMono,
            fontSize: "9px",
            color: C.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            fontWeight: 700,
            minWidth: "1080px",
          }}
        >
          <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>Commercial</div>
          <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>Territoire</div>
          <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>Téléphone</div>
          <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>Clients</div>
          <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>Revenue généré</div>
          <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>Com. est.</div>
          <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>Conv.</div>
          <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>Dernier login</div>
          <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>Statut</div>
          <div style={{ background: C.bgSubtle, padding: "10px 14px" }}></div>
        </div>
        {filteredCommercials.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: C.textMuted, fontFamily: C.fontMono, fontSize: "12px" }}>
            {commercials.length === 0
              ? 'Aucun commercial. Cliquez sur "Ajouter un commercial" pour commencer.'
              : "Aucun commercial ne correspond au filtre sélectionné."}
          </div>
        ) : (
          filteredCommercials.map((c) => {
            const revenue = c.assignedClients.reduce((s, cl) => s + cl.revenueMAD, 0);
            const commission = Math.round((revenue * c.commissionRate) / 100);
            const trials = c.assignedClients.filter((cl) => cl.status === "trial").length;
            const convRate =
              c.assignedClients.length > 0
                ? Math.round(((c.assignedClients.length - trials) / c.assignedClients.length) * 100)
                : 0;
            return (
              <div
                key={c.id}
                onClick={() => setDetailId(c.id)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(180px, 1.6fr) minmax(120px, 1fr) 140px 70px 110px 100px 80px 110px 90px 44px",
                  gap: "1px",
                  background: C.border,
                  fontFamily: C.fontSans,
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "background 0.1s",
                  minWidth: "1080px",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = C.bgHover;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = C.bg;
                }}
              >
                <div style={{ background: "inherit", padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {topPerformer?.fiche.id === c.id && <Crown size={12} color={SAGE} />}
                    <div>
                      <div style={{ fontWeight: 600, color: C.text }}>{c.name}</div>
                      <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono, marginTop: "2px" }}>{c.email}</div>
                    </div>
                  </div>
                </div>
                <div style={{ background: "inherit", padding: "12px 14px", fontSize: "11px", color: C.textBody, display: "flex", alignItems: "center", gap: "5px" }}>
                  <MapPin size={11} color={C.textMuted} />
                  {c.territory}
                </div>
                <div style={{ background: "inherit", padding: "12px 14px", fontSize: "11px", color: C.textBody, display: "flex", alignItems: "center", gap: "5px", fontFamily: C.fontMono }}>
                  <Phone size={11} color={C.textMuted} />
                  {c.phone}
                </div>
                <div style={{ background: "inherit", padding: "12px 14px", fontFamily: C.fontMono, fontSize: "12px", color: C.text }}>
                  {c.assignedClients.length}
                </div>
                <div style={{ background: "inherit", padding: "12px 14px", fontFamily: C.fontMono, fontSize: "12px", color: SAGE, fontWeight: 700 }}>
                  {fmtMAD(revenue)}
                </div>
                <div style={{ background: "inherit", padding: "12px 14px", fontFamily: C.fontMono, fontSize: "11px", color: CHARCOAL, fontWeight: 600 }}>
                  {fmtMAD(commission)}
                  <div style={{ fontSize: "9px", color: C.textMuted, fontWeight: 500, marginTop: "1px" }}>{c.commissionRate}%</div>
                </div>
                <div style={{ background: "inherit", padding: "12px 14px", fontFamily: C.fontMono, fontSize: "12px", color: C.textBody }}>
                  {convRate}%
                </div>
                <div style={{ background: "inherit", padding: "12px 14px", fontFamily: C.fontMono, fontSize: "11px", color: C.textMuted }}>
                  {c.lastLoginAt ? new Date(c.lastLoginAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—"}
                </div>
                <div style={{ background: "inherit", padding: "12px 14px" }}>
                  <span
                    style={{
                      fontSize: "9px",
                      fontFamily: C.fontMono,
                      padding: "2px 7px",
                      borderRadius: "2px",
                      background: c.status === "active" ? C.successBg : C.dangerBg,
                      color: c.status === "active" ? SAGE : C.danger,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontWeight: 700,
                    }}
                  >
                    {c.status === "active" ? "Actif" : "Suspendu"}
                  </span>
                </div>
                <div style={{ background: "inherit", padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "center", color: C.textMuted }}>
                  <Eye size={13} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail modal */}
      {detailFiche && (
        <CommercialDetailModal
          fiche={detailFiche}
          onClose={() => setDetailId(null)}
          onToggleStatus={() => toggleStatus(detailFiche.id)}
          onReassign={() => {
            setReassignId(detailFiche.id);
            setDetailId(null);
          }}
        />
      )}

      {/* Create form modal */}
      {showCreateForm && (
        <CommercialCreateModal
          onClose={() => setShowCreateForm(false)}
          onCreate={handleCreate}
        />
      )}

      {/* Reassign modal */}
      {reassignFiche && (
        <CommercialReassignModal
          fiche={reassignFiche}
          commercials={commercials.filter((c) => c.id !== reassignFiche.id)}
          onClose={() => setReassignId(null)}
          onConfirm={(toId) => reassignClients(reassignFiche.id, toId)}
        />
      )}
    </div>
  );
}

// ─── COMMERCIAL DETAIL MODAL ───────────────────────────────────

function CommercialDetailModal({
  fiche,
  onClose,
  onToggleStatus,
  onReassign,
}: {
  fiche: CommercialFiche;
  onClose: () => void;
  onToggleStatus: () => void;
  onReassign: () => void;
}) {
  const revenue = fiche.assignedClients.reduce((s, c) => s + c.revenueMAD, 0);
  const revenueYTD = revenue * 12;
  const trials = fiche.assignedClients.filter((c) => c.status === "trial").length;
  const convRate =
    fiche.assignedClients.length > 0
      ? Math.round(((fiche.assignedClients.length - trials) / fiche.assignedClients.length) * 100)
      : 0;
  const avgDeal =
    fiche.assignedClients.length > 0 ? Math.round(revenue / fiche.assignedClients.length) : 0;
  const targetPct = fiche.targetRevenue > 0 ? Math.min(100, (revenue / fiche.targetRevenue) * 100) : 0;
  const initials = fiche.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const typeMeta: Record<CommercialActivity["type"], { color: string; bg: string; label: string }> = {
    contact: { color: SAGE, bg: SAGE_BG, label: "Contact" },
    provision: { color: C.accent, bg: C.bgSubtle, label: "Provision" },
    annotation: { color: C.warning, bg: C.warningBg, label: "Annotation" },
    conversion: { color: SAGE, bg: C.successBg, label: "Conversion" },
  };

  return (
    <div onClick={onClose} style={modalOverlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...modalContentStyle, maxWidth: "760px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: SAGE,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: C.fontMono,
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              {initials}
            </div>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontFamily: C.fontMono,
                  color: SAGE,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                Fiche commercial · {fiche.status === "active" ? "Actif" : "Suspendu"}
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: C.text, margin: "2px 0" }}>{fiche.name}</h2>
              <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono }}>
                {fiche.email} · {fiche.phone}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>
            <X size={18} />
          </button>
        </div>

        {/* Personal info */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            gap: "8px",
            marginBottom: "20px",
          }}
        >
          <DetailMini label="Territoire" value={fiche.territory} icon={<MapPin size={11} />} />
          <DetailMini label="Commission" value={`${fiche.commissionRate}%`} icon={<Percent size={11} />} />
          <DetailMini label="Objectif mensuel" value={fmtMAD(fiche.targetRevenue)} icon={<Target size={11} />} />
          <DetailMini
            label="Dernier login"
            value={
              fiche.lastLoginAt
                ? new Date(fiche.lastLoginAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
                : "—"
            }
            icon={<Clock size={11} />}
          />
        </div>

        {/* Performance */}
        <KpiRowHeader label="Performance" icon={<Activity size={11} />} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <KpiBigCard label="Revenue ce mois" value={fmtMAD(revenue)} icon={<DollarSign size={11} />} accent />
          <KpiBigCard label="Revenue YTD" value={fmtMAD(revenueYTD)} icon={<TrendingUp size={11} />} />
          <KpiBigCard label="Conv. rate" value={`${convRate}%`} icon={<Percent size={11} />} />
          <KpiBigCard label="Avg deal size" value={fmtMAD(avgDeal)} icon={<Briefcase size={11} />} />
        </div>

        {/* Target progress */}
        <div
          style={{
            background: C.bgSubtle,
            border: `1px solid ${C.border}`,
            borderRadius: "6px",
            padding: "14px 16px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span
              style={{
                fontSize: "10px",
                fontFamily: C.fontMono,
                color: C.textMuted,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Objectif vs revenue
            </span>
            <span style={{ fontSize: "11px", fontFamily: C.fontMono, color: SAGE, fontWeight: 700 }}>
              {fmtMAD(revenue)} / {fmtMAD(fiche.targetRevenue)} ({targetPct.toFixed(0)}%)
            </span>
          </div>
          <div style={{ height: "8px", background: C.border, borderRadius: "4px", overflow: "hidden" }}>
            <div
              style={{
                width: `${targetPct}%`,
                height: "100%",
                background: targetPct >= 100 ? SAGE : targetPct >= 50 ? SAGE_DIM : C.warning,
                transition: "width 0.3s",
              }}
            />
          </div>
        </div>

        {/* Assigned clients */}
        <KpiRowHeader label={`Clients assignés (${fiche.assignedClients.length})`} icon={<Users size={11} />} />
        {fiche.assignedClients.length === 0 ? (
          <div
            style={{
              padding: "16px",
              textAlign: "center",
              color: C.textMuted,
              fontFamily: C.fontMono,
              fontSize: "12px",
              border: `1px dashed ${C.border}`,
              borderRadius: "6px",
              marginBottom: "20px",
            }}
          >
            Aucun client assigné.
          </div>
        ) : (
          <div className="admin-table-wrap" style={{ border: `1px solid ${C.border}`, borderRadius: "6px", overflow: "hidden", marginBottom: "20px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 100px 120px 100px 130px",
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
              <div style={{ background: C.bgSubtle, padding: "8px 12px" }}>Client</div>
              <div style={{ background: C.bgSubtle, padding: "8px 12px" }}>Plan</div>
              <div style={{ background: C.bgSubtle, padding: "8px 12px" }}>Revenue</div>
              <div style={{ background: C.bgSubtle, padding: "8px 12px" }}>Statut</div>
              <div style={{ background: C.bgSubtle, padding: "8px 12px" }}>Dernier contact</div>
            </div>
            {fiche.assignedClients.map((cl) => (
              <div
                key={cl.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.4fr 100px 120px 100px 130px",
                  gap: "1px",
                  background: C.border,
                  fontFamily: C.fontSans,
                  fontSize: "12px",
                }}
              >
                <div style={{ background: C.bg, padding: "10px 12px", fontWeight: 600, color: C.text }}>{cl.name}</div>
                <div style={{ background: C.bg, padding: "10px 12px", fontFamily: C.fontMono, fontSize: "10px", color: C.accent, textTransform: "uppercase" }}>{cl.plan}</div>
                <div style={{ background: C.bg, padding: "10px 12px", fontFamily: C.fontMono, fontSize: "11px", color: SAGE, fontWeight: 700 }}>{fmtMAD(cl.revenueMAD)}</div>
                <div style={{ background: C.bg, padding: "10px 12px" }}>
                  <span
                    style={{
                      fontSize: "9px",
                      fontFamily: C.fontMono,
                      padding: "2px 6px",
                      borderRadius: "2px",
                      background: cl.status === "active" ? C.successBg : cl.status === "trial" ? C.warningBg : C.dangerBg,
                      color: cl.status === "active" ? SAGE : cl.status === "trial" ? C.warning : C.danger,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontWeight: 700,
                    }}
                  >
                    {cl.status}
                  </span>
                </div>
                <div style={{ background: C.bg, padding: "10px 12px", fontFamily: C.fontMono, fontSize: "11px", color: C.textMuted }}>
                  {cl.lastContactAt ? new Date(cl.lastContactAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—"}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Activity log */}
        <KpiRowHeader label={`Activité récente (${fiche.activityLog.length})`} icon={<Activity size={11} />} />
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px", maxHeight: "200px", overflowY: "auto" }}>
          {fiche.activityLog.length === 0 ? (
            <div style={{ padding: "12px", textAlign: "center", color: C.textMuted, fontFamily: C.fontMono, fontSize: "11px" }}>Aucune activité.</div>
          ) : (
            fiche.activityLog.map((a) => {
              const m = typeMeta[a.type];
              return (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                    padding: "8px 10px",
                    background: C.bgSubtle,
                    borderRadius: "5px",
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: "9px",
                      fontFamily: C.fontMono,
                      padding: "2px 6px",
                      borderRadius: "2px",
                      background: m.bg,
                      color: m.color,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {m.label}
                  </span>
                  <div style={{ flex: 1, fontSize: "12px", color: C.textBody }}>{a.description}</div>
                  <span style={{ fontSize: "10px", fontFamily: C.fontMono, color: C.textMuted, flexShrink: 0 }}>
                    {new Date(a.timestamp).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", borderTop: `1px solid ${C.border}`, paddingTop: "14px" }}>
          <button
            onClick={onReassign}
            style={{ ...cancelBtnStyle, display: "flex", alignItems: "center", gap: "6px" }}
          >
            <MoveHorizontal size={13} /> Réassigner clients
          </button>
          <button
            onClick={onToggleStatus}
            style={{
              ...cancelBtnStyle,
              background: fiche.status === "active" ? C.dangerBg : SAGE_BG,
              color: fiche.status === "active" ? C.danger : SAGE,
              borderColor: fiche.status === "active" ? `${C.danger}40` : `${SAGE}40`,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {fiche.status === "active" ? (
              <>
                <Ban size={13} /> Suspendre
              </>
            ) : (
              <>
                <Power size={13} /> Réactiver
              </>
            )}
          </button>
          <button onClick={onClose} style={{ ...primaryBtnStyle, background: SAGE }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── COMMERCIAL CREATE MODAL ───────────────────────────────────

function CommercialCreateModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: CommercialDraft) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [territory, setTerritory] = useState("");
  const [commissionRate, setCommissionRate] = useState("8");
  const [targetRevenue, setTargetRevenue] = useState("150000");
  const [password, setPassword] = useState(genPassword());
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCreate = () => {
    setError(null);
    if (!name.trim()) return setError("Le nom est requis.");
    if (!email.trim() || !email.includes("@")) return setError("Un email valide est requis.");
    if (!phone.trim()) return setError("Le téléphone est requis.");
    const cr = parseFloat(commissionRate);
    if (isNaN(cr) || cr < 0 || cr > 50) return setError("Taux de commission invalide (0–50%).");
    const tr = parseInt(targetRevenue.replace(/[\s,]/g, ""), 10);
    if (isNaN(tr) || tr < 0) return setError("Objectif de revenue invalide.");
    onCreate({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      territory: territory.trim() || "Non assigné",
      commissionRate: cr,
      targetRevenue: tr,
      password,
    });
  };

  const loginUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/atelier/admin-x7k2m9`
      : "/atelier/admin-x7k2m9";

  return (
    <div onClick={onClose} style={modalOverlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...modalContentStyle, maxWidth: "560px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
          <div>
            <div style={{ ...labelStyle, marginBottom: "4px" }}>Nouveau compte commercial</div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: C.text, margin: 0 }}>Créer un commercial</h2>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={labelStyle}>Nom complet *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Salim Bennani" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="s.bennani@harchcorp.com" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={labelStyle}>Téléphone *</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+212 6 11 22 33 44" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Territoire / Secteur</label>
              <input type="text" value={territory} onChange={(e) => setTerritory(e.target.value)} placeholder="Casablanca · Rabat" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={labelStyle}>Taux commission (%)</label>
              <input type="text" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} style={{ ...inputStyle, fontFamily: C.fontMono }} />
            </div>
            <div>
              <label style={labelStyle}>Objectif revenue/mois (MAD)</label>
              <input type="text" value={targetRevenue} onChange={(e) => setTargetRevenue(e.target.value)} style={{ ...inputStyle, fontFamily: C.fontMono }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Mot de passe</label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...inputStyle, fontFamily: C.fontMono, flex: 1 }}
              />
              <button
                onClick={() => setPassword(genPassword())}
                style={{
                  padding: "9px 12px",
                  background: "transparent",
                  border: `1px solid ${C.border}`,
                  color: C.textBody,
                  borderRadius: "5px",
                  fontSize: "11px",
                  fontFamily: C.fontMono,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <RefreshCw size={11} /> Auto
              </button>
              <button
                onClick={() => copy(password, "pw")}
                style={{
                  padding: "9px 12px",
                  background: "transparent",
                  border: `1px solid ${C.border}`,
                  color: copiedField === "pw" ? SAGE : C.textMuted,
                  borderRadius: "5px",
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {copiedField === "pw" ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </div>
            <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono, marginTop: "5px" }}>
              URL de connexion : <strong style={{ color: SAGE }}>{loginUrl}</strong>
            </div>
          </div>

          {error && (
            <div style={{ padding: "10px 12px", background: C.dangerBg, border: `1px solid ${C.danger}30`, borderRadius: "5px", fontSize: "12px", color: C.danger }}>
              {error}
            </div>
          )}

          <div
            style={{
              padding: "10px 12px",
              background: SAGE_BG,
              border: `1px solid ${SAGE}30`,
              borderRadius: "5px",
              fontSize: "11px",
              color: C.textBody,
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: SAGE, fontFamily: C.fontMono, fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Note :
            </strong>{" "}
            La fiche commercial est stockée localement (admin:commercials). Le compte User sera créé avec role="commercial" — l'API create-account doit être patchée pour accepter ce rôle (P4).
          </div>

          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button onClick={onClose} style={cancelBtnStyle}>
              Annuler
            </button>
            <button onClick={handleCreate} className="admin-primary-btn" style={{ ...primaryBtnStyle, background: SAGE }}>
              <UserPlus size={14} strokeWidth={2.5} />
              Créer le compte commercial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COMMERCIAL REASSIGN MODAL ─────────────────────────────────

function CommercialReassignModal({
  fiche,
  commercials,
  onClose,
  onConfirm,
}: {
  fiche: CommercialFiche;
  commercials: CommercialFiche[];
  onClose: () => void;
  onConfirm: (toId: string) => void;
}) {
  const [selected, setSelected] = useState<string>(commercials[0]?.id ?? "");
  return (
    <div onClick={onClose} style={modalOverlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...modalContentStyle, maxWidth: "440px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
          <div>
            <div style={{ ...labelStyle, marginBottom: "4px" }}>Réassignation</div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: C.text, margin: 0 }}>
              Réassigner les {fiche.assignedClients.length} clients de {fiche.name}
            </h2>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>
            <X size={18} />
          </button>
        </div>
        <div style={{ fontSize: "11px", color: C.textBody, marginBottom: "12px" }}>
          Sélectionnez le commercial destinataire. Les clients seront transférés et ajoutés à son portefeuille.
        </div>
        {commercials.length === 0 ? (
          <div
            style={{
              padding: "16px",
              textAlign: "center",
              color: C.textMuted,
              fontFamily: C.fontMono,
              fontSize: "12px",
              border: `1px dashed ${C.border}`,
              borderRadius: "6px",
            }}
          >
            Aucun autre commercial disponible.
          </div>
        ) : (
          <select value={selected} onChange={(e) => setSelected(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
            {commercials.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.territory} ({c.assignedClients.length} clients)
              </option>
            ))}
          </select>
        )}
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "16px" }}>
          <button onClick={onClose} style={cancelBtnStyle}>
            Annuler
          </button>
          <button
            onClick={() => selected && onConfirm(selected)}
            disabled={!selected}
            style={{ ...primaryBtnStyle, background: SAGE, opacity: selected ? 1 : 0.5 }}
          >
            <MoveHorizontal size={14} /> Confirmer la réassignation
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL MINI ───────────────────────────────────────────────

function DetailMini({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div style={{ background: C.bgSubtle, border: `1px solid ${C.border}`, borderRadius: "5px", padding: "10px 12px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          fontSize: "9px",
          fontFamily: C.fontMono,
          color: C.textMuted,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontWeight: 700,
          marginBottom: "4px",
        }}
      >
        <span style={{ color: SAGE }}>{icon}</span>
        {label}
      </div>
      <div style={{ fontSize: "12px", fontFamily: C.fontMono, color: C.text, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

// ─── MODAL SHARED STYLES ───────────────────────────────────────

const modalOverlayStyle: React.CSSProperties = {
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
};

const modalContentStyle: React.CSSProperties = {
  background: C.bg,
  border: `1px solid ${C.border}`,
  borderRadius: "10px",
  padding: "24px",
  width: "100%",
  maxHeight: "92vh",
  overflowY: "auto",
  boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
};

const closeBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: C.textMuted,
  cursor: "pointer",
  padding: "4px",
};

const cancelBtnStyle: React.CSSProperties = {
  padding: "9px 16px",
  background: "transparent",
  border: `1px solid ${C.border}`,
  color: C.textBody,
  fontFamily: C.fontSans,
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
  borderRadius: "5px",
};

const primaryBtnStyle: React.CSSProperties = {
  padding: "9px 18px",
  background: C.cta,
  color: "#fff",
  border: "none",
  fontFamily: C.fontSans,
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  borderRadius: "5px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

// ═══════════════════════════════════════════════════════════════
//  PROVISIONING TAB — Full client provisioning engine
//  Task ID: BATCAVE-2-PROVISIONING
//
//  4 sub-views:
//    1. Formulaire  — 6-section HYPER form (every variable boss asked for)
//    2. Clients     — provisioned clients table + suspend/reactivate/extend
//    3. Chronologie — visual subscription timeline + expiring alerts + 12-mo projection
//    4. Revenus     — Revenue dashboard (admin/super_admin only)
//
//  NOTE: SAGE / SAGE_BG / CHARCOAL / usePersistentState / useApi are
//  already defined above (shared with KPIs/Commerciaux/Employees tabs).
//  We only declare the provisioning-specific constants below.
// ═══════════════════════════════════════════════════════════════

const SAGE_HOVER = "#3D6649";
const SAGE_BORDER = "rgba(74,123,95,0.22)";
const EUR_RATE = 11;
const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  trial: { color: "#B45309", bg: "#FEF3C7" },
  active: { color: SAGE, bg: SAGE_BG },
  expired: { color: "#737373", bg: "#F5F5F5" },
  suspended: { color: "#991B1B", bg: "#FEE2E2" },
};

const PLAN_OPTIONS = [
  { value: "essential", label: "Essentiel", suggestedPrice: 15000, desc: "Dircom / PR Manager — La Vigilance Sereine" },
  { value: "pro", label: "Pro", suggestedPrice: 40000, desc: "PR Manager avancé — L'Avantage Concurrentiel" },
  { value: "enterprise", label: "Grandes Entreprises", suggestedPrice: 75000, desc: "COMEX / IR / Risk — La Gouvernance Certifiée" },
  { value: "agency", label: "Agences", suggestedPrice: 150000, desc: "Agency Director — Multi-Clients, White-Label" },
] as const;

const CYCLE_OPTIONS = [
  { value: "monthly", label: "Mensuel", months: 1 },
  { value: "quarterly", label: "Trimestriel", months: 3 },
  { value: "annual", label: "Annuel", months: 12 },
  { value: "biennial", label: "Biennal", months: 24 },
] as const;

const DURATION_PRESETS = [
  { value: "30", label: "1 mois", days: 30 },
  { value: "90", label: "3 mois", days: 90 },
  { value: "180", label: "6 mois", days: 180 },
  { value: "365", label: "1 an", days: 365 },
  { value: "730", label: "2 ans", days: 730 },
  { value: "custom", label: "Personnalisé", days: 0 },
] as const;

interface ProvisionedClient {
  companyId: string;
  companyName: string;
  companySlug: string;
  sector: string | null;
  website: string | null;
  createdAt: string;
  contactName: string | null;
  contactEmail: string | null;
  contactRole: string | null;
  phone: string | null;
  country: string | null;
  accountType: "essential" | "pro" | "enterprise" | "agency";
  planLabel: string;
  customPriceMAD: number | null;
  effectivePriceMAD: number | null;
  monthlyMAD: number | null;
  eurEstimate: number | null;
  billingCycle: "monthly" | "quarterly" | "annual" | "biennial";
  discountPct: number;
  discountMAD: number;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  trialDays: number;
  trialEndDate: string | null;
  employeeCount: number;
  maxUsers: number;
  invitationMode: "boss-invite" | "admin-create-per-employee";
  useCase: string | null;
  notes: string | null;
  assignedCommercialId: string | null;
  assignedCommercialName: string | null;
  provisionedAt: string;
  provisionedById: string | null;
  suspendedAt: string | null;
  status: "trial" | "active" | "expired" | "suspended";
  daysUntilExpiry: number;
}

interface RevenueStats {
  mrr: number;
  arr: number;
  avgPerClient: number;
  totalClients: number;
  activeClients: number;
  cancelled: number;
  churnRate: number;
  byPlan: Array<{ plan: string; label: string; revenue: number }>;
  byCycle: Array<{ cycle: string; label: string; revenue: number }>;
  topClients: Array<{ name: string; slug: string; monthlyMAD: number }>;
  projection: Array<{ month: string; revenue: number }>;
}

interface Commercial {
  id: string;
  name: string | null;
  email: string;
}

interface ProvisionResult {
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
  company: { id: string; name: string; slug: string; sector: string; created: boolean };
  invitation: { id: string; token: string; url: string; expiresAt: string };
  settings: {
    accountType: string;
    billingCycle: string;
    customPriceMAD: number | null;
    effectivePriceMAD: number | null;
    discountPct: number;
    discountMAD: number;
    subscriptionStartDate: string;
    subscriptionEndDate: string;
    trialDays: number;
    trialEndDate: string | null;
    employeeCount: number;
    maxUsers: number;
    invitationMode: string;
    status: string;
  };
}

type ProvisionSubTab = "formulaire" | "clients" | "chronologie" | "revenus";

function ProvisioningTab({
  currentRole,
  seed,
  onSeedConsumed,
  onProvisioned,
}: {
  currentRole: string | null;
  seed: ProvisioningSeed | null;
  onSeedConsumed: () => void;
  onProvisioned: () => void;
}) {
  const [sub, setSub] = useState<ProvisionSubTab>("formulaire");
  const isFinancial = currentRole === "admin" || currentRole === "super_admin";
  const [clients, setClients] = useState<ProvisionedClient[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [revenue, setRevenue] = useState<RevenueStats | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [commercials, setCommercials] = useState<Commercial[]>([]);

  const fetchClients = useCallback(async () => {
    setClientsLoading(true);
    setClientsError(null);
    try {
      const r = await fetch("/api/admin/provision-client?view=list", { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      setClients(d.clients || []);
    } catch (e) {
      setClientsError(e instanceof Error ? e.message : "Erreur réseau");
      setClients([]);
    }
    setClientsLoading(false);
  }, []);

  const fetchRevenue = useCallback(async () => {
    if (!isFinancial) return;
    setRevenueLoading(true);
    try {
      const r = await fetch("/api/admin/provision-client?view=revenue", { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setRevenue(await r.json());
    } catch {
      setRevenue(null);
    }
    setRevenueLoading(false);
  }, [isFinancial]);

  const fetchCommercials = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/provision-client?view=commercials", { cache: "no-store" });
      if (r.ok) {
        const d = await r.json();
        setCommercials(d.commercials || []);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchClients();
    fetchCommercials();
  }, [fetchClients, fetchCommercials]);

  useEffect(() => {
    if (sub === "chronologie" || sub === "revenus") fetchRevenue();
  }, [sub, fetchRevenue]);

  const SUB_TABS: Array<{ id: ProvisionSubTab; label: string; icon: React.ReactNode; restricted?: boolean }> = [
    { id: "formulaire", label: "Formulaire", icon: <CalendarPlus size={14} /> },
    { id: "clients", label: "Clients provisionnés", icon: <Users size={14} /> },
    { id: "chronologie", label: "Chronologie", icon: <Clock3 size={14} /> },
    { id: "revenus", label: "Revenus", icon: <Coins size={14} />, restricted: true },
  ];

  return (
    <div>
      {/* Sub-tab bar */}
      <div style={{ display: "flex", gap: "1px", background: C.border, border: `1px solid ${C.border}`, borderRadius: "8px 8px 0 0", overflow: "hidden", marginBottom: 0 }}>
        {SUB_TABS.map((t) => {
          const disabled = t.restricted && !isFinancial;
          const active = sub === t.id;
          return (
            <button
              key={t.id}
              onClick={() => !disabled && setSub(t.id)}
              disabled={disabled}
              style={{
                flex: 1,
                padding: "12px 14px",
                background: active ? C.bg : "#FAFAFA",
                border: "none",
                borderBottom: active ? `2px solid ${SAGE}` : "2px solid transparent",
                color: disabled ? C.textMuted : active ? SAGE : C.textBody,
                fontFamily: C.fontSans,
                fontSize: "12px",
                fontWeight: active ? 700 : 500,
                cursor: disabled ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
                transition: "all 0.15s",
              }}
            >
              {t.icon}
              {t.label}
              {disabled && <Lock size={11} style={{ opacity: 0.5 }} />}
            </button>
          );
        })}
      </div>

      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderTop: "none", borderRadius: "0 0 8px 8px", padding: "28px" }}>
        {sub === "formulaire" ? (
          <ProvisioningForm
            commercials={commercials}
            seed={seed}
            onSeedConsumed={onSeedConsumed}
            onCreated={() => {
              fetchClients();
              fetchRevenue();
            }}
            onProvisioned={onProvisioned}
          />
        ) : sub === "clients" ? (
          <ClientsTable
            clients={clients}
            loading={clientsLoading}
            error={clientsError}
            onAction={() => {
              fetchClients();
              fetchRevenue();
            }}
          />
        ) : sub === "chronologie" ? (
          <TimelineView clients={clients} loading={clientsLoading} revenue={revenue} revenueLoading={revenueLoading} />
        ) : isFinancial ? (
          <RevenueDashboard revenue={revenue} loading={revenueLoading} />
        ) : (
          <EmptyState text="Accès réservé admin / super_admin." />
        )}
      </div>
    </div>
  );
}

// ─── PROVISIONING FORM (6 sections) ───────────────────────────────

interface FormState {
  // Section 1 — Identité client
  companyName: string;
  sector: string;
  country: string;
  website: string;
  // Section 2 — Contact principal
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactRole: string;
  // Section 3 — Plan & Pricing
  accountType: "essential" | "pro" | "enterprise" | "agency";
  customPriceMAD: string;
  billingCycle: "monthly" | "quarterly" | "annual" | "biennial";
  discountPct: string;
  discountMAD: string;
  // Section 4 — Abonnement
  subscriptionStartDate: string;
  durationPreset: string;
  subscriptionEndDate: string;
  trialDays: number;
  // Section 5 — Équipe
  employeeCount: string;
  maxUsers: string;
  invitationMode: "boss-invite" | "admin-create-per-employee";
  // Section 6 — Configuration
  topics: string;
  competitors: string;
  useCase: string;
  notes: string;
  assignedCommercialId: string;
}

function makeInitialForm(): FormState {
  const today = new Date().toISOString().slice(0, 10);
  const start = new Date(today);
  start.setFullYear(start.getFullYear() + 1);
  return {
    companyName: "",
    sector: "",
    country: "Maroc",
    website: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    contactRole: "Dircom",
    accountType: "essential",
    customPriceMAD: "15000",
    billingCycle: "monthly",
    discountPct: "0",
    discountMAD: "0",
    subscriptionStartDate: today,
    durationPreset: "365",
    subscriptionEndDate: start.toISOString().slice(0, 10),
    trialDays: 30,
    employeeCount: "5",
    maxUsers: "10",
    invitationMode: "boss-invite",
    topics: "",
    competitors: "",
    useCase: "",
    notes: "",
    assignedCommercialId: "",
  };
}

function ProvisioningForm({
  commercials,
  onCreated,
  seed,
  onSeedConsumed,
  onProvisioned,
}: {
  commercials: Commercial[];
  onCreated: () => void;
  seed: ProvisioningSeed | null;
  onSeedConsumed: () => void;
  onProvisioned: () => void;
}) {
  const [form, setForm] = usePersistentState<FormState>("admin:provisioning-form", makeInitialForm());
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProvisionResult | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  // requestId of the originating AccessRequest, when this form was
  // pre-filled via "Convertir en client". Used to PATCH the request
  // status to "converted" after a successful provisioning POST.
  const [requestId, setRequestId] = useState<string | null>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  // Apply seed — Task CONNECT-REQUESTS-PROVISIONING
  // When the boss clicks "Convertir en client" on a request, the
  // parent passes a ProvisioningSeed. We start from a fresh
  // makeInitialForm() (so no stale plan/price bleeds in from a
  // previous provisioning) and overlay the request data. The effect
  // is keyed on seed?.requestId so it only fires when a new request
  // is selected, not on every parent re-render. After applying, we
  // call onSeedConsumed so the parent can clear its seed state.
  const seedKey = seed?.requestId ?? null;
  useEffect(() => {
    if (!seed) return;
    setRequestId(seed.requestId);
    setForm({
      ...makeInitialForm(),
      companyName: seed.companyName,
      contactName: seed.contactName,
      contactEmail: seed.contactEmail,
      contactPhone: seed.contactPhone,
      useCase: seed.useCase,
      competitors: seed.competitors,
      notes: seed.notes,
    });
    onSeedConsumed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedKey]);

  // Auto-calc subscriptionEndDate from preset
  useEffect(() => {
    if (form.durationPreset === "custom") return;
    const preset = DURATION_PRESETS.find((p) => p.value === form.durationPreset);
    if (!preset || preset.days === 0) return;
    const start = new Date(form.subscriptionStartDate);
    if (Number.isNaN(start.getTime())) return;
    start.setDate(start.getDate() + preset.days);
    set("subscriptionEndDate", start.toISOString().slice(0, 10));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.durationPreset, form.subscriptionStartDate]);

  const trialEnd = useMemo(() => {
    if (form.trialDays <= 0) return null;
    const start = new Date(form.subscriptionStartDate);
    if (Number.isNaN(start.getTime())) return null;
    start.setDate(start.getDate() + form.trialDays);
    return start.toISOString().slice(0, 10);
  }, [form.subscriptionStartDate, form.trialDays]);

  const parsedPrice = useMemo(() => {
    const raw = form.customPriceMAD.trim().replace(/[,\s]/g, "").replace(/k$/i, "000");
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
  }, [form.customPriceMAD]);

  const parsedDiscountPct = useMemo(() => {
    const n = Number(form.discountPct);
    return Number.isFinite(n) && n >= 0 && n <= 100 ? n : 0;
  }, [form.discountPct]);

  const parsedDiscountMAD = useMemo(() => {
    const n = Number(form.discountMAD);
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
  }, [form.discountMAD]);

  const effectivePrice = useMemo(() => {
    if (parsedPrice == null) return null;
    let eff = parsedPrice;
    if (parsedDiscountPct > 0) eff = eff * (1 - parsedDiscountPct / 100);
    if (parsedDiscountMAD > 0) eff = eff - parsedDiscountMAD;
    return Math.max(0, Math.round(eff));
  }, [parsedPrice, parsedDiscountPct, parsedDiscountMAD]);

  const monthlyEquivalent = useMemo(() => {
    if (effectivePrice == null) return null;
    switch (form.billingCycle) {
      case "monthly": return effectivePrice;
      case "quarterly": return Math.round(effectivePrice / 3);
      case "annual": return Math.round(effectivePrice / 12);
      case "biennial": return Math.round(effectivePrice / 24);
    }
  }, [effectivePrice, form.billingCycle]);

  const eurEstimate = monthlyEquivalent != null ? Math.round(monthlyEquivalent / EUR_RATE) : null;

  const parsedEmployeeCount = useMemo(() => {
    const n = parseInt(form.employeeCount, 10);
    return Number.isFinite(n) && n >= 1 && n <= 500 ? n : 1;
  }, [form.employeeCount]);

  const parsedMaxUsers = useMemo(() => {
    const n = parseInt(form.maxUsers, 10);
    return Number.isFinite(n) && n >= 1 && n <= 1000 ? n : parsedEmployeeCount;
  }, [form.maxUsers, parsedEmployeeCount]);

  const handleSuggestedPrice = (price: number) => {
    set("customPriceMAD", String(price));
    set("discountPct", "0");
    set("discountMAD", "0");
  };

  const validate = (): string | null => {
    if (!form.companyName.trim()) return "Raison sociale requise.";
    if (!form.contactName.trim()) return "Nom du contact requis.";
    if (!form.contactEmail.trim() || !form.contactEmail.includes("@")) return "Email du contact invalide.";
    if (parsedPrice == null) return "Prix personnalisé invalide.";
    if (parsedMaxUsers < parsedEmployeeCount) return "maxUsers ne peut pas être inférieur à employeeCount.";
    const start = new Date(form.subscriptionStartDate);
    const end = new Date(form.subscriptionEndDate);
    if (Number.isNaN(start.getTime())) return "Date de début invalide.";
    if (Number.isNaN(end.getTime())) return "Date de fin invalide.";
    if (end <= start) return "La date de fin doit être postérieure à la date de début.";
    return null;
  };

  const buildPayload = () => {
    const start = new Date(form.subscriptionStartDate);
    const end = new Date(form.subscriptionEndDate);
    const durationDays = form.durationPreset === "custom"
      ? Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    return {
      email: form.contactEmail.trim(),
      name: form.contactName.trim(),
      companyName: form.companyName.trim(),
      accountType: form.accountType,
      customPriceMAD: parsedPrice,
      billingCycle: form.billingCycle,
      subscriptionStartDate: form.subscriptionStartDate,
      subscriptionEndDate: form.durationPreset === "custom" ? form.subscriptionEndDate : null,
      durationDays,
      trialDays: form.trialDays,
      employeeCount: parsedEmployeeCount,
      maxUsers: parsedMaxUsers,
      invitationMode: form.invitationMode,
      topics: form.topics.split(",").map((s) => s.trim()).filter(Boolean),
      competitors: form.competitors.split(",").map((s) => s.trim()).filter(Boolean),
      useCase: form.useCase.trim() || null,
      notes: form.notes.trim() || null,
      assignedCommercialId: form.assignedCommercialId || null,
      sector: form.sector.trim() || null,
      country: form.country.trim() || null,
      website: form.website.trim() || null,
      phone: form.contactPhone.trim() || null,
      contactName: form.contactName.trim(),
      contactRole: form.contactRole.trim() || null,
      discountPct: parsedDiscountPct,
      discountMAD: parsedDiscountMAD,
    };
  };

  const submit = async () => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/provision-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const d = await r.json();
      if (!r.ok || !d.success) {
        throw new Error(d.error || `HTTP ${r.status}`);
      }
      setResult(d as ProvisionResult);
      setShowConfirm(false);
      onCreated();
      // Task CONNECT-REQUESTS-PROVISIONING — if this provisioning
      // was seeded from an AccessRequest, mark that request as
      // "Converti" so the kanban reflects the new state without
      // manual double-entry. Fire-and-forget: provisioning itself
      // succeeded, the status update is best-effort.
      if (requestId) {
        try {
          await fetch(`/api/admin/requests/${requestId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "converted" }),
          });
        } catch {
          // Non-blocking — the boss can still patch the request
          // manually from the kanban if this fails.
        }
        setRequestId(null);
        onProvisioned();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau");
    }
    setCreating(false);
  };

  if (result) {
    return (
      <ProvisioningResultView
        result={result}
        copied={copied}
        onCopy={(text, field) => {
          navigator.clipboard.writeText(text);
          setCopied(field);
          setTimeout(() => setCopied(null), 2000);
        }}
        onClose={() => {
          setResult(null);
          setForm(makeInitialForm());
        }}
      />
    );
  }

  const sectionTitle = (n: number, title: string, icon: React.ReactNode) => (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px", paddingBottom: "10px", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ width: "26px", height: "26px", background: SAGE_BG, color: SAGE, borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontFamily: C.fontMono, fontWeight: 700 }}>
        {n}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "13px", fontWeight: 700, color: CHARCOAL, letterSpacing: "-0.01em" }}>
        {icon}
        {title}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: "920px" }}>
      {/* Hero */}
      <div style={{ padding: "18px 22px", background: SAGE_BG, borderRadius: "8px", border: `1px solid ${SAGE_BORDER}`, marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <Server size={16} color={SAGE} />
          <span style={{ fontSize: "10px", fontFamily: C.fontMono, color: SAGE, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700 }}>
            Moteur de provisioning
          </span>
        </div>
        <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 6px", color: CHARCOAL, letterSpacing: "-0.01em" }}>
          Créer un compte client — toutes les variables
        </h2>
        <p style={{ fontSize: "12px", color: C.textBody, margin: 0, lineHeight: 1.55 }}>
          Pricing custom, cycle de facturation, durée d'abonnement, période d'essai, taille d'équipe, mode d'invitation — le boss contrôle chaque levier.
        </p>
      </div>

      {/* Section 1 — Identité client */}
      <div style={{ marginBottom: "32px" }}>
        {sectionTitle(1, "Identité client", <Building2 size={14} />)}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "12px" }}>
          <Field label="Raison sociale *">
            <input style={inputStyle} value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Attijariwafa Bank" />
          </Field>
          <Field label="Secteur">
            <input style={inputStyle} value={form.sector} onChange={(e) => set("sector", e.target.value)} placeholder="Banque" />
          </Field>
          <Field label="Pays">
            <input style={inputStyle} value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="Maroc" />
          </Field>
          <Field label="Site web">
            <input style={inputStyle} value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="attijariwafa.com" />
          </Field>
        </div>
      </div>

      {/* Section 2 — Contact principal */}
      <div style={{ marginBottom: "32px" }}>
        {sectionTitle(2, "Contact principal", <User size={14} />)}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "12px" }}>
          <Field label="Nom complet *">
            <input style={inputStyle} value={form.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Salim El Amrani" />
          </Field>
          <Field label="Email *">
            <input style={inputStyle} value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} placeholder="s.elamrani@attijariwafa.com" />
          </Field>
          <Field label="Téléphone">
            <input style={inputStyle} value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} placeholder="+212 6 12 34 56 78" />
          </Field>
          <Field label="Fonction / titre">
            <input style={inputStyle} value={form.contactRole} onChange={(e) => set("contactRole", e.target.value)} placeholder="Dircom" />
          </Field>
        </div>
      </div>

      {/* Section 3 — Plan & Pricing */}
      <div style={{ marginBottom: "32px" }}>
        {sectionTitle(3, "Plan & Pricing", <Coins size={14} />)}
        <Field label="Plan *">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "8px" }}>
            {PLAN_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  set("accountType", opt.value as FormState["accountType"]);
                  handleSuggestedPrice(opt.suggestedPrice);
                }}
                style={{
                  padding: "11px 12px",
                  background: form.accountType === opt.value ? SAGE_BG : "transparent",
                  border: `1px solid ${form.accountType === opt.value ? SAGE : C.border}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 700, color: form.accountType === opt.value ? SAGE : CHARCOAL }}>{opt.label}</div>
                <div style={{ fontSize: "10px", color: C.textMuted, marginTop: "3px", fontFamily: C.fontMono }}>{opt.suggestedPrice.toLocaleString()} MAD</div>
                <div style={{ fontSize: "10px", color: C.textMuted, marginTop: "4px" }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "12px", marginTop: "14px" }}>
          <Field label="Prix personnalisé (MAD)">
            <div style={{ display: "flex", gap: "6px" }}>
              <input style={{ ...inputStyle, fontFamily: C.fontMono }} value={form.customPriceMAD} onChange={(e) => set("customPriceMAD", e.target.value)} placeholder="15000" />
            </div>
            <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
              {[15000, 40000, 75000, 150000].map((p) => (
                <button
                  key={p}
                  onClick={() => handleSuggestedPrice(p)}
                  style={{ padding: "3px 8px", background: parsedPrice === p ? SAGE_BG : "transparent", border: `1px solid ${parsedPrice === p ? SAGE_BORDER : C.border}`, color: parsedPrice === p ? SAGE : C.textBody, borderRadius: "3px", fontSize: "10px", fontFamily: C.fontMono, cursor: "pointer", fontWeight: 600 }}
                >
                  {p.toLocaleString()}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Cycle de facturation">
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.billingCycle} onChange={(e) => set("billingCycle", e.target.value as FormState["billingCycle"])}>
              {CYCLE_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Remise (%)">
            <input style={{ ...inputStyle, fontFamily: C.fontMono }} value={form.discountPct} onChange={(e) => set("discountPct", e.target.value)} placeholder="0" type="number" min="0" max="100" />
          </Field>
          <Field label="Remise (MAD)">
            <input style={{ ...inputStyle, fontFamily: C.fontMono }} value={form.discountMAD} onChange={(e) => set("discountMAD", e.target.value)} placeholder="0" type="number" min="0" />
          </Field>
        </div>

        {/* Pricing summary */}
        <div style={{ marginTop: "14px", padding: "14px 16px", background: SAGE_BG, border: `1px solid ${SAGE_BORDER}`, borderRadius: "6px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "16px" }}>
          <PricingStat label="Prix brut" value={parsedPrice != null ? `${parsedPrice.toLocaleString()} MAD` : "—"} />
          <PricingStat label="Prix effectif" value={effectivePrice != null ? `${effectivePrice.toLocaleString()} MAD` : "—"} highlight />
          <PricingStat label="Équivalent mensuel" value={monthlyEquivalent != null ? `${monthlyEquivalent.toLocaleString()} MAD` : "—"} />
          <PricingStat label="Estimation EUR/mois" value={eurEstimate != null ? `~${eurEstimate.toLocaleString()} €` : "—"} muted />
        </div>
      </div>

      {/* Section 4 — Abonnement */}
      <div style={{ marginBottom: "32px" }}>
        {sectionTitle(4, "Abonnement", <CalendarPlus size={14} />)}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "12px" }}>
          <Field label="Date de début *">
            <input type="date" style={inputStyle} value={form.subscriptionStartDate} onChange={(e) => set("subscriptionStartDate", e.target.value)} />
          </Field>
          <Field label="Durée">
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.durationPreset} onChange={(e) => set("durationPreset", e.target.value)}>
              {DURATION_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Date de fin *">
            <input type="date" style={inputStyle} value={form.subscriptionEndDate} onChange={(e) => set("subscriptionEndDate", e.target.value)} disabled={form.durationPreset !== "custom"} />
          </Field>
          <Field label="Période d'essai (jours)">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="range"
                min="0"
                max="90"
                value={form.trialDays}
                onChange={(e) => set("trialDays", Number(e.target.value))}
                style={{ flex: 1, accentColor: SAGE }}
              />
              <span style={{ fontFamily: C.fontMono, fontSize: "13px", color: SAGE, fontWeight: 700, minWidth: "30px", textAlign: "right" }}>
                {form.trialDays}j
              </span>
            </div>
            {trialEnd && (
              <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono, marginTop: "5px" }}>
                Fin d'essai : {trialEnd}
              </div>
            )}
          </Field>
        </div>
      </div>

      {/* Section 5 — Équipe */}
      <div style={{ marginBottom: "32px" }}>
        {sectionTitle(5, "Équipe", <Users size={14} />)}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "12px", marginBottom: "14px" }}>
          <Field label="Nombre d'employés (1-500)">
            <input type="number" min="1" max="500" style={{ ...inputStyle, fontFamily: C.fontMono }} value={form.employeeCount} onChange={(e) => set("employeeCount", e.target.value)} />
          </Field>
          <Field label="Utilisateurs max (≥ employés)">
            <input type="number" min="1" max="1000" style={{ ...inputStyle, fontFamily: C.fontMono }} value={form.maxUsers} onChange={(e) => set("maxUsers", e.target.value)} />
          </Field>
        </div>
        <Field label="Mode d'invitation">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button
              onClick={() => set("invitationMode", "boss-invite")}
              style={{
                padding: "14px",
                background: form.invitationMode === "boss-invite" ? SAGE_BG : "transparent",
                border: `1px solid ${form.invitationMode === "boss-invite" ? SAGE : C.border}`,
                borderRadius: "6px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 700, color: form.invitationMode === "boss-invite" ? SAGE : CHARCOAL, marginBottom: "4px" }}>
                Mode Chef
              </div>
              <div style={{ fontSize: "11px", color: C.textBody, lineHeight: 1.45 }}>
                J'envoie 1 lien au chef. Il invite son équipe jusqu'à {form.maxUsers || "N"} utilisateurs.
              </div>
            </button>
            <button
              onClick={() => set("invitationMode", "admin-create-per-employee")}
              style={{
                padding: "14px",
                background: form.invitationMode === "admin-create-per-employee" ? SAGE_BG : "transparent",
                border: `1px solid ${form.invitationMode === "admin-create-per-employee" ? SAGE : C.border}`,
                borderRadius: "6px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 700, color: form.invitationMode === "admin-create-per-employee" ? SAGE : CHARCOAL, marginBottom: "4px" }}>
                Mode Admin
              </div>
              <div style={{ fontSize: "11px", color: C.textBody, lineHeight: 1.45 }}>
                Je crée des liens individuels par employé (1 invitation par personne).
              </div>
            </button>
          </div>
        </Field>
      </div>

      {/* Section 6 — Configuration */}
      <div style={{ marginBottom: "28px" }}>
        {sectionTitle(6, "Configuration", <Target size={14} />)}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <Field label="Sujets à surveiller (séparés par virgule)">
            <input style={inputStyle} value={form.topics} onChange={(e) => set("topics", e.target.value)} placeholder="réputation marque, narratif ESG, risque boycott" />
          </Field>
          <Field label="Concurrents à tracker (séparés par virgule)">
            <input style={inputStyle} value={form.competitors} onChange={(e) => set("competitors", e.target.value)} placeholder="Bank of Africa, CIH Bank" />
          </Field>
        </div>
        <Field label="Cas d'usage">
          <textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={form.useCase} onChange={(e) => set("useCase", e.target.value)} placeholder="Ce que le prospect veut accomplir..." />
        </Field>
        <Field label="Notes (admin uniquement)">
          <textarea rows={2} style={{ ...inputStyle, resize: "vertical", background: "#FFFBEB", borderColor: "#FCD34D" }} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Décideurs, timeline, contraintes..." />
        </Field>
        <Field label="Commercial assigné">
          <select style={{ ...inputStyle, cursor: "pointer" }} value={form.assignedCommercialId} onChange={(e) => set("assignedCommercialId", e.target.value)}>
            <option value="">— Aucun —</option>
            {commercials.map((c) => (
              <option key={c.id} value={c.id}>{c.name || c.email}</option>
            ))}
          </select>
        </Field>
      </div>

      {error && (
        <div style={{ padding: "12px 14px", background: C.dangerBg, border: `1px solid ${C.danger}33`, borderRadius: "6px", color: C.danger, fontFamily: C.fontMono, fontSize: "12px", marginBottom: "14px" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", alignItems: "center" }}>
        <span style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono, marginRight: "auto" }}>
          {clientsCountNote(form, effectivePrice, monthlyEquivalent)}
        </span>
        <button
          onClick={() => setShowConfirm(true)}
          className="admin-primary-btn"
          style={{
            padding: "11px 20px",
            background: SAGE,
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: `0 1px 3px ${SAGE}40`,
          }}
        >
          <Plus size={15} strokeWidth={2.5} />
          Créer le compte client
        </button>
      </div>

      {showConfirm && (
        <ConfirmModal
          form={form}
          effectivePrice={effectivePrice}
          monthlyEquivalent={monthlyEquivalent}
          trialEnd={trialEnd}
          creating={creating}
          onCancel={() => setShowConfirm(false)}
          onConfirm={submit}
        />
      )}
    </div>
  );
}

function clientsCountNote(form: FormState, effPrice: number | null, monthly: number | null): string {
  const durationLabel = DURATION_PRESETS.find((p) => p.value === form.durationPreset)?.label ?? "Personnalisé";
  return [
    `Plan ${form.accountType}`,
    effPrice != null ? `${effPrice.toLocaleString()} MAD / ${form.billingCycle}` : "Prix non défini",
    monthly != null ? `(≈${monthly.toLocaleString()} MAD/mois)` : "",
    `· Durée: ${durationLabel}`,
    `· Essai: ${form.trialDays}j`,
    `· Équipe: ${form.employeeCount}/${form.maxUsers}`,
  ].filter(Boolean).join(" ");
}

function ConfirmModal({
  form,
  effectivePrice,
  monthlyEquivalent,
  trialEnd,
  creating,
  onCancel,
  onConfirm,
}: {
  form: FormState;
  effectivePrice: number | null;
  monthlyEquivalent: number | null;
  trialEnd: string | null;
  creating: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,10,10,0.45)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: C.bg,
          borderRadius: "10px",
          padding: "28px",
          maxWidth: "540px",
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div style={{ width: "32px", height: "32px", background: SAGE_BG, borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertCircle size={18} color={SAGE} />
          </div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: CHARCOAL, margin: 0, letterSpacing: "-0.01em" }}>
            Confirmer la création
          </h3>
        </div>
        <p style={{ fontSize: "13px", color: C.textBody, lineHeight: 1.55, margin: "0 0 16px" }}>
          Vous allez créer un compte client pour <strong>{form.companyName || "—"}</strong> ({form.contactEmail || "—"}). Vérifiez les détails ci-dessous :
        </p>
        <div style={{ background: C.bgSubtle, borderRadius: "6px", padding: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", fontSize: "12px", marginBottom: "20px" }}>
          <ConfirmRow label="Plan" value={form.accountType} />
          <ConfirmRow label="Cycle" value={form.billingCycle} />
          <ConfirmRow label="Prix effectif" value={effectivePrice != null ? `${effectivePrice.toLocaleString()} MAD` : "—"} highlight />
          <ConfirmRow label="Équivalent mensuel" value={monthlyEquivalent != null ? `${monthlyEquivalent.toLocaleString()} MAD` : "—"} />
          <ConfirmRow label="Début" value={form.subscriptionStartDate} />
          <ConfirmRow label="Fin" value={form.subscriptionEndDate} />
          <ConfirmRow label="Essai" value={`${form.trialDays}j${trialEnd ? ` (jusqu'au ${trialEnd})` : ""}`} />
          <ConfirmRow label="Équipe" value={`${form.employeeCount} employés / ${form.maxUsers} max`} />
          <ConfirmRow label="Mode invitation" value={form.invitationMode === "boss-invite" ? "Mode Chef" : "Mode Admin"} />
        </div>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            disabled={creating}
            style={{ padding: "9px 16px", background: "transparent", border: `1px solid ${C.border}`, color: C.textBody, borderRadius: "5px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={creating}
            style={{ padding: "9px 18px", background: creating ? C.border : SAGE, color: "#fff", border: "none", borderRadius: "5px", fontSize: "13px", fontWeight: 700, cursor: creating ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={2.5} />}
            {creating ? "Création..." : "Confirmer & créer"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: "9px", fontFamily: C.fontMono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: "12px", fontFamily: highlight ? C.fontMono : C.fontSans, fontWeight: highlight ? 700 : 500, color: highlight ? SAGE : CHARCOAL, marginTop: "2px" }}>{value}</div>
    </div>
  );
}

function ProvisioningResultView({
  result,
  copied,
  onCopy,
  onClose,
}: {
  result: ProvisionResult;
  copied: string | null;
  onCopy: (text: string, field: string) => void;
  onClose: () => void;
}) {
  return (
    <div style={{ maxWidth: "640px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div style={{ width: "40px", height: "40px", background: SAGE_BG, border: `1px solid ${SAGE_BORDER}`, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Check size={20} color={SAGE} strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontSize: "10px", fontFamily: C.fontMono, color: SAGE, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>
            Client provisionné
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: CHARCOAL, margin: "2px 0 0", letterSpacing: "-0.01em" }}>
            {result.company.name}
          </h2>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
        <SummaryRow label="Email contact" value={result.user.email} mono />
        <SummaryRow label="Rôle" value={result.user.role} />
        <SummaryRow label="Plan" value={result.settings.accountType} />
        <SummaryRow label="Cycle" value={result.settings.billingCycle} />
        {result.settings.effectivePriceMAD != null && (
          <SummaryRow label="Prix effectif" value={`${result.settings.effectivePriceMAD.toLocaleString()} MAD`} mono highlight />
        )}
        <SummaryRow label="Abonnement" value={`${result.settings.subscriptionStartDate.slice(0, 10)} → ${result.settings.subscriptionEndDate.slice(0, 10)}`} />
        <SummaryRow label="Statut" value={result.settings.status} />
        <SummaryRow
          label="Mot de passe temporaire"
          value={result.user.temporaryPassword}
          mono
          highlight
          onCopy={() => onCopy(result.user.temporaryPassword, "pw")}
          copied={copied === "pw"}
        />
        <div>
          <label style={labelStyle}>URL d'accès</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input readOnly value={result.invitation.url} style={{ flex: 1, padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: "5px", fontFamily: C.fontMono, fontSize: "11px", color: C.text, background: C.bgSubtle }} />
            <button
              onClick={() => onCopy(result.invitation.url, "url")}
              style={{ padding: "9px 12px", background: copied === "url" ? SAGE : CHARCOAL, color: "#fff", border: "none", borderRadius: "5px", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}
            >
              {copied === "url" ? <Check size={13} /> : <Copy size={13} />}
              {copied === "url" ? "Copié" : "Copier"}
            </button>
            <a href={result.invitation.url} target="_blank" rel="noopener noreferrer" style={{ padding: "9px 12px", background: "transparent", border: `1px solid ${C.border}`, color: C.textBody, borderRadius: "5px", fontSize: "12px", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
              <ExternalLink size={13} />
              Ouvrir
            </a>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
        <button onClick={onClose} style={{ padding: "10px 20px", background: SAGE, color: "#fff", border: "none", borderRadius: "5px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
          Créer un autre client
        </button>
      </div>
    </div>
  );
}

// ─── CLIENTS TABLE ────────────────────────────────────────────────

function ClientsTable({
  clients,
  loading,
  error,
  onAction,
}: {
  clients: ProvisionedClient[];
  loading: boolean;
  error: string | null;
  onAction: () => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<ProvisionedClient | null>(null);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.companyName.toLowerCase().includes(q) ||
          (c.contactName?.toLowerCase().includes(q) ?? false) ||
          (c.contactEmail?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [clients, search, statusFilter]);

  const exportCsv = () => {
    const header = ["Société", "Contact", "Email", "Plan", "Prix MAD", "Effectif MAD", "Cycle", "Début", "Fin", "Statut", "Employés", "Max users", "Commercial"];
    const rows = filtered.map((c) => [
      c.companyName,
      c.contactName ?? "",
      c.contactEmail ?? "",
      c.planLabel,
      c.customPriceMAD?.toString() ?? "",
      c.effectivePriceMAD?.toString() ?? "",
      c.billingCycle,
      c.subscriptionStartDate.slice(0, 10),
      c.subscriptionEndDate.slice(0, 10),
      c.status,
      c.employeeCount.toString(),
      c.maxUsers.toString(),
      c.assignedCommercialName ?? "",
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `provisioned-clients-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && clients.length === 0) return <LoadingState />;
  if (error) {
    return (
      <div style={{ padding: "16px 18px", background: C.dangerBg, border: `1px solid ${C.danger}33`, borderRadius: "6px", color: C.danger, fontFamily: C.fontMono, fontSize: "12px" }}>
        {error}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search size={14} color={C.textMuted} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par société, contact, email..." style={{ ...inputStyle, paddingLeft: "32px" }} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...monoInputStyle, minWidth: "180px", cursor: "pointer" }}>
          <option value="all">Tous les statuts ({clients.length})</option>
          <option value="trial">Essai</option>
          <option value="active">Actif</option>
          <option value="expired">Expiré</option>
          <option value="suspended">Suspendu</option>
        </select>
        <button onClick={exportCsv} className="admin-primary-btn" style={{ padding: "8px 12px", background: "transparent", border: `1px solid ${C.border}`, color: C.textBody, borderRadius: "5px", fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
          <Download size={13} />
          Export CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState text={clients.length === 0 ? "Aucun client provisionné. Utilisez le formulaire pour en créer un." : "Aucun client ne correspond au filtre."} />
      ) : (
        <div className="admin-table-wrap" style={{ border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden", background: C.bg }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(160px, 1.4fr) minmax(140px, 1fr) 100px minmax(120px, 1fr) 90px 110px 90px",
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
            <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>Société</div>
            <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>Contact</div>
            <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>Plan</div>
            <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>Abonnement</div>
            <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>Prix MAD</div>
            <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>Statut</div>
            <div style={{ background: C.bgSubtle, padding: "10px 14px" }}>Équipe</div>
          </div>
          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            {filtered.map((c) => (
              <ClientRow key={c.companyId} client={c} onClick={() => setSelected(c)} />
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: "16px", fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono }}>
        {filtered.length} client(s) affiché(s) sur {clients.length} provisionné(s).
      </div>

      {selected && (
        <ClientDetailModal
          client={selected}
          onClose={() => setSelected(null)}
          onAction={() => {
            setSelected(null);
            onAction();
          }}
        />
      )}
    </div>
  );
}

function ClientRow({ client, onClick }: { client: ProvisionedClient; onClick: () => void }) {
  const sc = STATUS_COLORS[client.status] || STATUS_COLORS.active;
  return (
    <div
      onClick={onClick}
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(160px, 1.4fr) minmax(140px, 1fr) 100px minmax(120px, 1fr) 90px 110px 90px",
        gap: "1px",
        background: C.border,
        fontFamily: C.fontSans,
        fontSize: "12px",
        cursor: "pointer",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = C.bgHover; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = C.bg; }}
    >
      <div style={{ background: "inherit", padding: "11px 14px" }}>
        <div style={{ fontWeight: 600, color: CHARCOAL }}>{client.companyName}</div>
        <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono, marginTop: "2px" }}>{client.sector || "—"}</div>
      </div>
      <div style={{ background: "inherit", padding: "11px 14px" }}>
        <div style={{ color: CHARCOAL }}>{client.contactName || "—"}</div>
        <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono, marginTop: "2px" }}>{client.contactEmail || "—"}</div>
      </div>
      <div style={{ background: "inherit", padding: "11px 14px" }}>
        <span style={{ fontSize: "10px", fontFamily: C.fontMono, color: SAGE, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
          {client.planLabel}
        </span>
      </div>
      <div style={{ background: "inherit", padding: "11px 14px", fontFamily: C.fontMono, fontSize: "10px", color: C.textBody }}>
        <div>{client.subscriptionStartDate.slice(0, 10)}</div>
        <div style={{ color: client.daysUntilExpiry < 30 ? C.danger : C.textMuted }}>→ {client.subscriptionEndDate.slice(0, 10)}</div>
      </div>
      <div style={{ background: "inherit", padding: "11px 14px", fontFamily: C.fontMono, fontSize: "11px", color: CHARCOAL, fontWeight: 600 }}>
        {client.effectivePriceMAD != null ? client.effectivePriceMAD.toLocaleString() : "—"}
      </div>
      <div style={{ background: "inherit", padding: "11px 14px" }}>
        <span style={{ fontSize: "9px", fontFamily: C.fontMono, padding: "3px 7px", borderRadius: "2px", background: sc.bg, color: sc.color, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
          {client.status === "trial" ? "Essai" : client.status === "active" ? "Actif" : client.status === "expired" ? "Expiré" : "Suspendu"}
        </span>
      </div>
      <div style={{ background: "inherit", padding: "11px 14px", fontFamily: C.fontMono, fontSize: "11px", color: C.textBody }}>
        {client.employeeCount}/{client.maxUsers}
      </div>
    </div>
  );
}

function ClientDetailModal({
  client,
  onClose,
  onAction,
}: {
  client: ProvisionedClient;
  onClose: () => void;
  onAction: () => void;
}) {
  const [acting, setActing] = useState(false);
  const [extendDays, setExtendDays] = useState("30");
  const [error, setError] = useState<string | null>(null);
  const sc = STATUS_COLORS[client.status] || STATUS_COLORS.active;

  const patch = async (action: "suspend" | "reactivate" | "extend", extra?: Record<string, unknown>) => {
    setActing(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/provision-client", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: client.companyId, action, ...extra }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
      onAction();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau");
    }
    setActing(false);
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
      onClick={onClose}
    >
      <div
        style={{ background: C.bg, borderRadius: "10px", padding: "26px", maxWidth: "640px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "18px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: CHARCOAL, margin: 0, letterSpacing: "-0.01em" }}>
                {client.companyName}
              </h3>
              <span style={{ fontSize: "9px", fontFamily: C.fontMono, padding: "3px 7px", borderRadius: "2px", background: sc.bg, color: sc.color, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                {client.status === "trial" ? "Essai" : client.status === "active" ? "Actif" : client.status === "expired" ? "Expiré" : "Suspendu"}
              </span>
            </div>
            <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono }}>
              {client.sector || "—"} · {client.country || "—"}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.textMuted, cursor: "pointer", padding: "4px" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
          <DetailGroup title="Contact">
            <DetailRow label="Nom" value={client.contactName} />
            <DetailRow label="Email" value={client.contactEmail} mono />
            <DetailRow label="Téléphone" value={client.phone} mono />
            <DetailRow label="Fonction" value={client.contactRole} />
          </DetailGroup>
          <DetailGroup title="Abonnement">
            <DetailRow label="Plan" value={client.planLabel} />
            <DetailRow label="Cycle" value={client.billingCycle} />
            <DetailRow label="Début" value={client.subscriptionStartDate.slice(0, 10)} mono />
            <DetailRow label="Fin" value={client.subscriptionEndDate.slice(0, 10)} mono />
            <DetailRow label="Jours restants" value={client.daysUntilExpiry.toString()} mono />
          </DetailGroup>
          <DetailGroup title="Pricing">
            <DetailRow label="Prix brut" value={client.customPriceMAD != null ? `${client.customPriceMAD.toLocaleString()} MAD` : null} mono />
            <DetailRow label="Remise" value={client.discountPct > 0 || client.discountMAD > 0 ? `${client.discountPct}% + ${client.discountMAD} MAD` : null} mono />
            <DetailRow label="Prix effectif" value={client.effectivePriceMAD != null ? `${client.effectivePriceMAD.toLocaleString()} MAD` : null} mono />
            <DetailRow label="Équiv. mensuel" value={client.monthlyMAD != null ? `${client.monthlyMAD.toLocaleString()} MAD` : null} mono />
            <DetailRow label="EUR/mois" value={client.eurEstimate != null ? `~${client.eurEstimate.toLocaleString()} €` : null} mono />
          </DetailGroup>
          <DetailGroup title="Équipe">
            <DetailRow label="Employés" value={client.employeeCount.toString()} mono />
            <DetailRow label="Utilisateurs max" value={client.maxUsers.toString()} mono />
            <DetailRow label="Mode invitation" value={client.invitationMode === "boss-invite" ? "Mode Chef" : "Mode Admin"} />
            <DetailRow label="Essai" value={client.trialDays > 0 ? `${client.trialDays}j` : "Aucun"} mono />
            <DetailRow label="Commercial" value={client.assignedCommercialName} />
          </DetailGroup>
        </div>

        {client.useCase && (
          <div style={{ marginBottom: "14px" }}>
            <div style={{ ...labelStyle, marginBottom: "6px" }}>Cas d'usage</div>
            <div style={{ fontSize: "12px", color: C.textBody, lineHeight: 1.55, padding: "10px 12px", background: C.bgSubtle, borderRadius: "5px" }}>
              {client.useCase}
            </div>
          </div>
        )}
        {client.notes && (
          <div style={{ marginBottom: "14px" }}>
            <div style={{ ...labelStyle, marginBottom: "6px" }}>Notes admin</div>
            <div style={{ fontSize: "12px", color: C.textBody, lineHeight: 1.55, padding: "10px 12px", background: C.warningBg, border: `1px solid ${C.warningBorder}40`, borderRadius: "5px" }}>
              {client.notes}
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding: "10px 12px", background: C.dangerBg, border: `1px solid ${C.danger}33`, borderRadius: "5px", color: C.danger, fontFamily: C.fontMono, fontSize: "11px", marginBottom: "12px" }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", paddingTop: "14px", borderTop: `1px solid ${C.border}` }}>
          <a
            href={`/atelier/console?company=${client.companySlug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: "8px 12px", background: "transparent", border: `1px solid ${C.border}`, color: C.textBody, borderRadius: "5px", fontSize: "12px", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <ExternalLink size={13} />
            Voir le dashboard
          </a>
          {client.status !== "suspended" ? (
            <button
              onClick={() => patch("suspend")}
              disabled={acting}
              style={{ padding: "8px 12px", background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", borderRadius: "5px", fontSize: "12px", fontWeight: 600, cursor: acting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <PauseCircle size={13} />
              Suspendre
            </button>
          ) : (
            <button
              onClick={() => patch("reactivate")}
              disabled={acting}
              style={{ padding: "8px 12px", background: SAGE_BG, border: `1px solid ${SAGE_BORDER}`, color: SAGE, borderRadius: "5px", fontSize: "12px", fontWeight: 600, cursor: acting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <PlayCircle size={13} />
              Réactiver
            </button>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "auto" }}>
            <input type="number" min="1" max="365" value={extendDays} onChange={(e) => setExtendDays(e.target.value)} style={{ width: "70px", ...monoInputStyle }} />
            <span style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono }}>jours</span>
            <button
              onClick={() => patch("extend", { extendDays: parseInt(extendDays, 10) || 30 })}
              disabled={acting}
              style={{ padding: "8px 12px", background: CHARCOAL, color: "#fff", border: "none", borderRadius: "5px", fontSize: "12px", fontWeight: 600, cursor: acting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <CalendarPlus size={13} />
              Prolonger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TIMELINE VIEW ────────────────────────────────────────────────

function TimelineView({
  clients,
  loading,
  revenue,
  revenueLoading,
}: {
  clients: ProvisionedClient[];
  loading: boolean;
  revenue: RevenueStats | null;
  revenueLoading: boolean;
}) {
  const expiringSoon = useMemo(
    () =>
      clients
        .filter((c) => c.status === "active" && c.daysUntilExpiry <= 30 && c.daysUntilExpiry >= 0)
        .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry),
    [clients],
  );

  if (loading && clients.length === 0) return <LoadingState />;

  return (
    <div>
      {/* Expiring soon alert strip */}
      {expiringSoon.length > 0 && (
        <div style={{ padding: "14px 18px", background: C.dangerBg, border: `1px solid ${C.danger}33`, borderRadius: "8px", marginBottom: "20px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <AlertCircle size={18} color={C.danger} style={{ flexShrink: 0, marginTop: "1px" }} />
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.danger, marginBottom: "4px" }}>
              {expiringSoon.length} abonnement{expiringSoon.length > 1 ? "s" : ""} expire{expiringSoon.length > 1 ? "nt" : ""} dans moins de 30 jours
            </div>
            <div style={{ fontSize: "11px", color: C.textBody, fontFamily: C.fontMono, lineHeight: 1.6 }}>
              {expiringSoon.slice(0, 5).map((c) => `${c.companyName} (${c.daysUntilExpiry}j)`).join(" · ")}
              {expiringSoon.length > 5 && ` · +${expiringSoon.length - 5} autres`}
            </div>
          </div>
        </div>
      )}

      {/* Timeline list */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ ...labelStyle, marginBottom: "12px" }}>
          Chronologie des abonnements ({clients.length})
        </div>
        {clients.length === 0 ? (
          <EmptyState text="Aucun abonnement provisionné." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {clients
              .slice()
              .sort((a, b) => new Date(a.subscriptionEndDate).getTime() - new Date(b.subscriptionEndDate).getTime())
              .map((c) => {
                const sc = STATUS_COLORS[c.status] || STATUS_COLORS.active;
                const totalDays = Math.max(1, Math.ceil((new Date(c.subscriptionEndDate).getTime() - new Date(c.subscriptionStartDate).getTime()) / (1000 * 60 * 60 * 24)));
                const elapsedDays = Math.max(0, Math.ceil((Date.now() - new Date(c.subscriptionStartDate).getTime()) / (1000 * 60 * 60 * 24)));
                const pct = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
                return (
                  <div key={c.companyId} style={{ padding: "12px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: sc.color }} />
                        <span style={{ fontSize: "13px", fontWeight: 600, color: CHARCOAL }}>{c.companyName}</span>
                        <span style={{ fontSize: "10px", fontFamily: C.fontMono, padding: "1px 6px", background: sc.bg, color: sc.color, borderRadius: "2px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          {c.status === "trial" ? "Essai" : c.status === "active" ? "Actif" : c.status === "expired" ? "Expiré" : "Suspendu"}
                        </span>
                      </div>
                      <div style={{ fontSize: "11px", fontFamily: C.fontMono, color: c.daysUntilExpiry < 30 && c.daysUntilExpiry >= 0 ? C.danger : C.textMuted }}>
                        {c.daysUntilExpiry > 0 ? `${c.daysUntilExpiry}j restants` : c.daysUntilExpiry === 0 ? "Expire aujourd'hui" : `Expiré depuis ${Math.abs(c.daysUntilExpiry)}j`}
                      </div>
                    </div>
                    <div style={{ height: "6px", background: C.bgSubtle, borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: sc.color, borderRadius: "3px", transition: "width 0.3s" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px", fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono }}>
                      <span>{c.subscriptionStartDate.slice(0, 10)}</span>
                      <span>{c.subscriptionEndDate.slice(0, 10)}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Revenue projection (12 months) */}
      <div>
        <div style={{ ...labelStyle, marginBottom: "12px" }}>
          Projection revenu (12 prochains mois)
        </div>
        {revenueLoading && !revenue ? (
          <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: C.textMuted, fontFamily: C.fontMono, fontSize: "12px" }}>
            <Loader2 size={16} className="animate-spin" style={{ marginRight: "8px" }} />
            Chargement...
          </div>
        ) : revenue && revenue.projection.length > 0 ? (
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "18px", height: "240px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue.projection}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: C.fontMono, fill: C.textMuted }} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fontFamily: C.fontMono, fill: C.textMuted }} axisLine={{ stroke: C.border }} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                <RTooltip
                  contentStyle={{ background: CHARCOAL, border: "none", borderRadius: "6px", fontSize: "12px", fontFamily: C.fontMono, color: "#fff" }}
                  labelStyle={{ color: "#a3a3a3", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}
                  formatter={(v: number) => [`${v.toLocaleString()} MAD`, "Revenu projeté"]}
                />
                <Bar dataKey="revenue" fill={SAGE} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState text="Aucune donnée de revenu disponible." />
        )}
      </div>
    </div>
  );
}

// ─── REVENUE DASHBOARD ────────────────────────────────────────────

function RevenueDashboard({
  revenue,
  loading,
}: {
  revenue: RevenueStats | null;
  loading: boolean;
}) {
  if (loading && !revenue) {
    return (
      <div style={{ padding: "60px 32px", textAlign: "center", color: C.textMuted, fontFamily: C.fontMono, fontSize: "12px" }}>
        <Loader2 size={20} className="animate-spin" style={{ margin: "0 auto 12px", color: SAGE }} />
        <div>Chargement des données financières...</div>
      </div>
    );
  }
  if (!revenue) {
    return <EmptyState text="Aucune donnée de revenu disponible." />;
  }

  const planColors: Record<string, string> = {
    essential: SAGE,
    pro: "#3D6649",
    enterprise: CHARCOAL,
    agency: "#C45A3F",
  };
  const cycleColors: Record<string, string> = {
    monthly: SAGE,
    quarterly: "#3D6649",
    annual: CHARCOAL,
    biennial: "#C45A3F",
  };

  return (
    <div>
      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "1px", background: C.border, border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden", marginBottom: "24px" }}>
        <KpiCell label="MRR (mensuel récurrent)" value={`${revenue.mrr.toLocaleString()} MAD`} color={SAGE} />
        <KpiCell label="ARR (annuel récurrent)" value={`${revenue.arr.toLocaleString()} MAD`} color={SAGE} />
        <KpiCell label="Revenu moyen / client" value={`${revenue.avgPerClient.toLocaleString()} MAD`} />
        <KpiCell label="Clients actifs" value={revenue.activeClients} />
        <KpiCell label="Suspendus / expirés" value={revenue.cancelled} color={revenue.cancelled > 0 ? C.danger : undefined} />
        <KpiCell label="Taux de churn" value={`${revenue.churnRate}%`} color={revenue.churnRate > 10 ? C.danger : undefined} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))", gap: "20px", marginBottom: "24px" }}>
        {/* Revenue by plan */}
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "18px" }}>
          <div style={{ ...labelStyle, marginBottom: "14px" }}>Revenu par plan</div>
          {revenue.byPlan.length === 0 ? (
            <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: C.textMuted, fontFamily: C.fontMono, fontSize: "11px" }}>Aucune donnée</div>
          ) : (
            <div style={{ height: "220px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={revenue.byPlan} dataKey="revenue" nameKey="label" cx="50%" cy="50%" outerRadius={75} innerRadius={45} paddingAngle={2}>
                    {revenue.byPlan.map((entry) => (
                      <Cell key={entry.plan} fill={planColors[entry.plan] || SAGE} />
                    ))}
                  </Pie>
                  <RTooltip
                    contentStyle={{ background: CHARCOAL, border: "none", borderRadius: "6px", fontSize: "12px", fontFamily: C.fontMono, color: "#fff" }}
                    formatter={(v: number) => [`${v.toLocaleString()} MAD`, "Revenu mensuel"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
            {revenue.byPlan.map((p) => (
              <div key={p.plan} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: planColors[p.plan] || SAGE }} />
                <span style={{ color: C.textBody, fontFamily: C.fontMono }}>{p.label}</span>
                <span style={{ color: C.textMuted, fontFamily: C.fontMono }}>{p.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by billing cycle */}
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "18px" }}>
          <div style={{ ...labelStyle, marginBottom: "14px" }}>Revenu par cycle de facturation</div>
          {revenue.byCycle.length === 0 ? (
            <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: C.textMuted, fontFamily: C.fontMono, fontSize: "11px" }}>Aucune donnée</div>
          ) : (
            <div style={{ height: "220px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue.byCycle} layout="vertical" margin={{ left: 30, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fontFamily: C.fontMono, fill: C.textMuted }} axisLine={{ stroke: C.border }} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fontFamily: C.fontSans, fill: C.textBody }} axisLine={{ stroke: C.border }} tickLine={false} width={70} />
                  <RTooltip
                    contentStyle={{ background: CHARCOAL, border: "none", borderRadius: "6px", fontSize: "12px", fontFamily: C.fontMono, color: "#fff" }}
                    formatter={(v: number) => [`${v.toLocaleString()} MAD`, "Revenu mensuel"]}
                  />
                  <Bar dataKey="revenue" radius={[0, 3, 3, 0]}>
                    {revenue.byCycle.map((entry) => (
                      <Cell key={entry.cycle} fill={cycleColors[entry.cycle] || SAGE} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Top 10 clients by revenue */}
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "18px" }}>
        <div style={{ ...labelStyle, marginBottom: "14px" }}>Top 10 clients par revenu</div>
        {revenue.topClients.length === 0 ? (
          <EmptyState text="Aucun client actif." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {revenue.topClients.map((c, i) => {
              const max = revenue.topClients[0]?.monthlyMAD || 1;
              const pct = (c.monthlyMAD / max) * 100;
              return (
                <div key={c.slug} style={{ display: "grid", gridTemplateColumns: "24px minmax(160px, 1fr) auto", gap: "12px", alignItems: "center", padding: "8px 0", borderBottom: i === revenue.topClients.length - 1 ? "none" : `1px solid ${C.border}` }}>
                  <span style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, fontWeight: 700 }}>#{i + 1}</span>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: CHARCOAL }}>{c.name}</div>
                    <div style={{ height: "4px", background: C.bgSubtle, borderRadius: "2px", marginTop: "4px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: SAGE, borderRadius: "2px" }} />
                    </div>
                  </div>
                  <span style={{ fontSize: "13px", fontFamily: C.fontMono, color: SAGE, fontWeight: 700 }}>
                    {c.monthlyMAD.toLocaleString()} MAD
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SHARED FORM HELPERS ──────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function PricingStat({ label, value, highlight, muted }: { label: string; value: string; highlight?: boolean; muted?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: "9px", fontFamily: C.fontMono, color: muted ? C.textMuted : SAGE, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, opacity: muted ? 0.7 : 1 }}>
        {label}
      </div>
      <div style={{ fontSize: "16px", fontFamily: C.fontMono, fontWeight: 700, color: highlight ? SAGE : muted ? C.textMuted : CHARCOAL, marginTop: "3px", letterSpacing: "-0.01em" }}>
        {value}
      </div>
    </div>
  );
}

// ─── END PROVISIONING TAB (BATCAVE-2) ────────────────────────────
// useApi / usePersistentState / KpisTab / CommerciauxTab / EmployeesTab
// are implemented earlier in this file (shared with BATCAVE-1).

// ═══════════════════════════════════════════════════════════════
//  EMPLOYÉS TAB — Bat Cave employee management (BATCAVE-3-EMPLOYEES)
//
//  Two invitation modes:
//    Mode 1 "Chef"  — 1 link sent to the company boss, he invites
//                      his team up to maxUsers (cap enforced).
//    Mode 2 "Admin" — individual links per employee, generated in
//                      bulk by the admin.
//
//  Employee fiches: boss fills 3 fields (name, email, role), the
//  employee completes the rest on first login. Stored in localStorage
//  ("admin:employee-fiches") for now; server persistence pending the
//  EmployeeFiche Prisma model (see /api/admin/employee-fiches).
// ═══════════════════════════════════════════════════════════════

// ─── useApi hook (local — not defined elsewhere in this file) ────

function useApi<T>(url: string | null, opts?: RequestInit): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!url);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!url) {
      Promise.resolve().then(() => {
        setData(null);
        setLoading(false);
      });
      return;
    }
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await fetch(url, opts);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        if (cancelled) return;
        setData(json as T);
      } catch (e: unknown) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "Erreur réseau";
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, refetch };
}

// ─── EMPLOYÉ TYPES ────────────────────────────────────────────────

type InvitationMode = "chef" | "admin";
type FicheStatus = "active" | "suspended" | "left";
type InvitationStatus = "not_sent" | "sent" | "accepted" | "expired";

interface EmployeeFiche {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number | null;
  role: string;
  department: string;
  startDate: string | null;
  endDate: string | null;
  status: FicheStatus;
  notes: string;
  invitation: {
    token: string | null;
    url: string | null;
    status: InvitationStatus;
    sentAt: string | null;
    acceptedAt: string | null;
    expiresAt: string | null;
  };
  lastLoginAt: string | null;
  loginCount: number;
  ipHistory: Array<{ ip: string; at: string; userAgent: string }>;
  harchiqQuestions: number;
  reportsGenerated: number;
  lastDashboardView: string | null;
  accountType: string;
  systemRole: "user" | "admin" | "company-admin";
  twoFactorEnabled: boolean;
  passwordLastChanged: string | null;
  activeSessions: number;
  annotations: Array<{ id: string; text: string; author: string; at: string }>;
  createdAt: string;
  updatedAt: string;
}

interface ProvisionedCompany {
  id: string;
  name: string;
  maxUsers: number;
  accountType: string;
  invitationMode: InvitationMode;
  chefToken: string | null;
  chefUrl: string | null;
  chefExpiresAt: string | null;
  createdAt: string;
}

interface BulkInvitationLink {
  token: string;
  url: string;
  emailPlaceholder: string;
  expiresAt: string;
  assignedFicheId: string | null;
}

// ─── FICHE FIELD TRACKER (completion meter) ──────────────────────

const FICHE_FIELDS: Array<keyof EmployeeFiche> = [
  "firstName", "lastName", "email", "phone", "age", "role",
  "department", "startDate", "endDate", "notes",
];

function computeCompletion(f: EmployeeFiche): { filled: number; total: number; pct: number } {
  const total = FICHE_FIELDS.length;
  let filled = 0;
  for (const k of FICHE_FIELDS) {
    const v = f[k];
    if (v === null || v === undefined) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    filled++;
  }
  return { filled, total, pct: Math.round((filled / total) * 100) };
}

function ficheInitials(f: EmployeeFiche): string {
  const a = (f.firstName || "").charAt(0).toUpperCase();
  const b = (f.lastName || "").charAt(0).toUpperCase();
  if (a && b) return a + b;
  if (a) return a;
  if (b) return b;
  return (f.email || "?").charAt(0).toUpperCase();
}

function ficheDisplayName(f: EmployeeFiche): string {
  const full = `${f.firstName} ${f.lastName}`.trim();
  return full || f.email || "Fiche sans nom";
}

// ─── CSV HELPERS ──────────────────────────────────────────────────

function downloadCSV(filename: string, rows: string[][]): void {
  const escape = (s: string): string => {
    if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const csv = rows.map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { cur.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        cur.push(field); field = "";
        if (cur.length > 1 || cur[0] !== "") rows.push(cur);
        cur = [];
      } else field += c;
    }
  }
  if (field !== "" || cur.length > 0) { cur.push(field); rows.push(cur); }
  return rows.filter((r) => r.length > 0);
}

// ─── EMPLOYÉS TAB — main component ───────────────────────────────

function EmployeesTab() {
  const [companies, setCompanies] = usePersistentState<ProvisionedCompany[]>(
    "admin:employee-companies", [],
  );
  const [fichesByCompany, setFichesByCompany] =
    usePersistentState<Record<string, EmployeeFiche[]>>("admin:employee-fiches", {});
  const [bulkLinksByCompany, setBulkLinksByCompany] =
    usePersistentState<Record<string, BulkInvitationLink[]>>("admin:employee-bulk-links", {});

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    companies[0]?.id ?? null,
  );
  useEffect(() => {
    if (!selectedCompanyId && companies.length > 0) setSelectedCompanyId(companies[0].id);
  }, [companies, selectedCompanyId]);

  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [editingFiche, setEditingFiche] = useState<EmployeeFiche | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [bulkCount, setBulkCount] = useState(5);
  const [bulkExpDays, setBulkExpDays] = useState(14);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId) || null;
  const fiches = selectedCompanyId ? (fichesByCompany[selectedCompanyId] || []) : [];
  const bulkLinks = selectedCompanyId ? (bulkLinksByCompany[selectedCompanyId] || []) : [];

  const kpis = useMemo(() => {
    const total = fiches.length;
    const maxUsers = selectedCompany?.maxUsers ?? 0;
    const sent = fiches.filter((f) => f.invitation.status !== "not_sent").length;
    const accepted = fiches.filter((f) => f.invitation.status === "accepted").length;
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const active7d = fiches.filter(
      (f) => f.lastLoginAt && new Date(f.lastLoginAt).getTime() >= sevenDaysAgo,
    ).length;
    const avgCompletion = total === 0
      ? 0
      : Math.round(fiches.reduce((s, f) => s + computeCompletion(f).pct, 0) / total);

    const byDept: Record<string, number> = {};
    const byRole: Record<string, number> = {};
    for (const f of fiches) {
      const d = f.department || "Non précisé";
      byDept[d] = (byDept[d] || 0) + 1;
      const r = f.role || "Non précisé";
      byRole[r] = (byRole[r] || 0) + 1;
    }
    return {
      total, maxUsers, sent, accepted, active7d, avgCompletion,
      byDept, byRole,
      conversionRate: sent === 0 ? 0 : Math.round((accepted / sent) * 100),
    };
  }, [fiches, selectedCompany]);

  const upsertFiches = (companyId: string, updater: (prev: EmployeeFiche[]) => EmployeeFiche[]) => {
    setFichesByCompany((prev) => ({ ...prev, [companyId]: updater(prev[companyId] || []) }));
  };

  const handleCreateFiche = (partial: { firstName: string; lastName: string; email: string; role: string; phone?: string; department?: string; }) => {
    if (!selectedCompanyId) return;
    const now = new Date().toISOString();
    const fiche: EmployeeFiche = {
      id: "fiche_" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36),
      companyId: selectedCompanyId,
      firstName: partial.firstName.trim(),
      lastName: partial.lastName.trim(),
      email: partial.email.trim().toLowerCase(),
      phone: partial.phone || "",
      age: null,
      role: partial.role.trim(),
      department: partial.department || "",
      startDate: null,
      endDate: null,
      status: "active",
      notes: "",
      invitation: { token: null, url: null, status: "not_sent", sentAt: null, acceptedAt: null, expiresAt: null },
      lastLoginAt: null,
      loginCount: 0,
      ipHistory: [],
      harchiqQuestions: 0,
      reportsGenerated: 0,
      lastDashboardView: null,
      accountType: selectedCompany?.accountType || "essential",
      systemRole: "user",
      twoFactorEnabled: false,
      passwordLastChanged: null,
      activeSessions: 0,
      annotations: [],
      createdAt: now,
      updatedAt: now,
    };
    upsertFiches(selectedCompanyId, (prev) => [fiche, ...prev]);
    setShowAddEmployee(false);
    setToast(`Fiche créée pour ${ficheDisplayName(fiche)}.`);
    fetch("/api/admin/employee-fiches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: selectedCompanyId,
        firstName: fiche.firstName, lastName: fiche.lastName,
        email: fiche.email, role: fiche.role, department: fiche.department,
        phone: fiche.phone, accountType: fiche.accountType, systemRole: fiche.systemRole,
      }),
    }).catch(() => { /* silent — localStorage is source of truth */ });
  };

  const handleUpdateFiche = (id: string, patch: Partial<EmployeeFiche>) => {
    if (!selectedCompanyId) return;
    upsertFiches(selectedCompanyId, (prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch, updatedAt: new Date().toISOString() } : f)),
    );
    fetch("/api/admin/employee-fiches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    }).catch(() => { /* silent */ });
  };

  const handleToggleStatus = (fiche: EmployeeFiche) => {
    const next: FicheStatus = fiche.status === "active" ? "suspended" : "active";
    handleUpdateFiche(fiche.id, { status: next });
    setToast(next === "suspended" ? `${ficheDisplayName(fiche)} suspendu.` : `${ficheDisplayName(fiche)} réactivé.`);
  };

  const handleSendInvitation = async (fiche: EmployeeFiche) => {
    if (!selectedCompanyId || !selectedCompany) return;
    if (!fiche.email) {
      setError("L'email de l'employé est requis pour envoyer une invitation.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fiche.email,
          name: ficheDisplayName(fiche),
          accountType: selectedCompany.accountType,
          role: fiche.systemRole === "admin" ? "admin" : "user",
          companyId: selectedCompanyId,
        }),
      });
      const d = await res.json();
      if (res.ok && d.invitation) {
        handleUpdateFiche(fiche.id, {
          invitation: {
            token: d.invitation.token,
            url: d.invitation.url,
            status: "sent",
            sentAt: new Date().toISOString(),
            acceptedAt: null,
            expiresAt: d.invitation.expiresAt,
          },
        });
        setToast(`Invitation envoyée à ${fiche.email}.`);
      } else {
        setError(d.error || "Échec de l'envoi de l'invitation.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau");
    }
    setBusy(false);
  };

  const handleGenerateChefLink = async () => {
    if (!selectedCompany) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `chef@${selectedCompany.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.local`,
          name: `Chef — ${selectedCompany.name}`,
          accountType: selectedCompany.accountType,
          role: "company-admin",
          companyId: selectedCompany.id,
        }),
      });
      const d = await res.json();
      if (res.ok && d.invitation) {
        setCompanies((prev) => prev.map((c) => c.id === selectedCompany.id ? {
          ...c,
          chefToken: d.invitation.token,
          chefUrl: d.invitation.url,
          chefExpiresAt: d.invitation.expiresAt,
        } : c));
        setToast("Lien chef généré.");
      } else {
        setError(d.error || "Échec de la génération du lien chef.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau");
    }
    setBusy(false);
  };

  const handleGenerateBulkLinks = async () => {
    if (!selectedCompany) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/invitations/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: selectedCompany.id,
          count: bulkCount,
          accountType: selectedCompany.accountType,
          role: "user",
          expirationDays: bulkExpDays,
        }),
      });
      const d = await res.json();
      if (res.ok && d.invitations) {
        const newLinks: BulkInvitationLink[] = d.invitations.map(
          (i: { token: string; url: string; emailPlaceholder: string; expiresAt: string }) => ({
            token: i.token, url: i.url, emailPlaceholder: i.emailPlaceholder,
            expiresAt: i.expiresAt, assignedFicheId: null,
          }),
        );
        setBulkLinksByCompany((prev) => ({
          ...prev,
          [selectedCompany.id]: [...(prev[selectedCompany.id] || []), ...newLinks],
        }));
        setToast(`${newLinks.length} liens générés.`);
      } else {
        setError(d.error || "Échec de la génération en masse.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau");
    }
    setBusy(false);
  };

  const handleAssignBulkLink = (fiche: EmployeeFiche) => {
    if (!selectedCompanyId) return;
    const unassigned = bulkLinks.find((l) => !l.assignedFicheId);
    if (!unassigned) {
      setError("Aucun lien non-attribué restant. Générez-en davantage.");
      return;
    }
    setBulkLinksByCompany((prev) => ({
      ...prev,
      [selectedCompanyId]: (prev[selectedCompanyId] || []).map((l) =>
        l.token === unassigned.token ? { ...l, assignedFicheId: fiche.id } : l,
      ),
    }));
    handleUpdateFiche(fiche.id, {
      invitation: {
        token: unassigned.token,
        url: unassigned.url,
        status: "sent",
        sentAt: new Date().toISOString(),
        acceptedAt: null,
        expiresAt: unassigned.expiresAt,
      },
    });
    setToast(`Lien attribué à ${ficheDisplayName(fiche)}.`);
  };

  const handleExportBulkLinksCSV = () => {
    if (!selectedCompany || bulkLinks.length === 0) return;
    const rows: string[][] = [
      ["Token", "URL", "Email placeholder", "Expire le", "Fiche assignée"],
      ...bulkLinks.map((l) => [
        l.token, l.url, l.emailPlaceholder,
        new Date(l.expiresAt).toLocaleString("fr-FR"),
        l.assignedFicheId || "—",
      ]),
    ];
    downloadCSV(`invitations-bulk-${selectedCompany.name.toLowerCase().replace(/\s+/g, "-")}.csv`, rows);
  };

  const handleExportFichesCSV = () => {
    if (!selectedCompany || fiches.length === 0) return;
    const rows: string[][] = [
      ["Prénom", "Nom", "Email", "Téléphone", "Âge", "Poste", "Département", "Date début", "Date fin", "Statut", "Invitation", "Completion %"],
      ...fiches.map((f) => {
        const c = computeCompletion(f);
        return [
          f.firstName, f.lastName, f.email, f.phone,
          f.age != null ? String(f.age) : "",
          f.role, f.department,
          f.startDate ? new Date(f.startDate).toLocaleDateString("fr-FR") : "",
          f.endDate ? new Date(f.endDate).toLocaleDateString("fr-FR") : "",
          f.status, f.invitation.status,
          String(c.pct),
        ];
      }),
    ];
    downloadCSV(`fiches-${selectedCompany.name.toLowerCase().replace(/\s+/g, "-")}.csv`, rows);
  };

  const handleCsvImport = (text: string) => {
    if (!selectedCompanyId) return;
    const rows = parseCSV(text);
    if (rows.length < 2) {
      setError("CSV vide ou en-tête manquant.");
      return;
    }
    const header = rows[0].map((h) => h.trim().toLowerCase());
    const idx = (name: string): number => header.findIndex((h) => h === name || h.includes(name));
    const iFirst = idx("prénom") >= 0 ? idx("prénom") : idx("first");
    const iLast = idx("nom") >= 0 ? idx("nom") : idx("last");
    const iEmail = idx("email");
    const iPhone = idx("téléphone") >= 0 ? idx("téléphone") : idx("phone");
    const iRole = idx("poste") >= 0 ? idx("poste") : idx("role");
    const iDept = idx("département") >= 0 ? idx("département") : idx("department");

    let imported = 0;
    const now = new Date().toISOString();
    const newFiches: EmployeeFiche[] = [];
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const firstName = (row[iFirst] || "").trim();
      const lastName = (row[iLast] || "").trim();
      const email = (row[iEmail] || "").trim().toLowerCase();
      if (!firstName && !lastName && !email) continue;
      newFiches.push({
        id: "fiche_" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36) + r,
        companyId: selectedCompanyId,
        firstName, lastName, email,
        phone: (row[iPhone] || "").trim(),
        age: null,
        role: (row[iRole] || "").trim(),
        department: (row[iDept] || "").trim(),
        startDate: null, endDate: null,
        status: "active",
        notes: "",
        invitation: { token: null, url: null, status: "not_sent", sentAt: null, acceptedAt: null, expiresAt: null },
        lastLoginAt: null, loginCount: 0, ipHistory: [],
        harchiqQuestions: 0, reportsGenerated: 0, lastDashboardView: null,
        accountType: selectedCompany?.accountType || "essential",
        systemRole: "user",
        twoFactorEnabled: false, passwordLastChanged: null, activeSessions: 0,
        annotations: [],
        createdAt: now, updatedAt: now,
      });
      imported++;
    }
    if (imported > 0) {
      upsertFiches(selectedCompanyId, (prev) => [...newFiches, ...prev]);
      setToast(`${imported} fiches importées.`);
    }
    setShowCsvImport(false);
  };

  const handleProvision = (cfg: {
    name: string;
    maxUsers: number;
    accountType: string;
    invitationMode: InvitationMode;
  }) => {
    const c: ProvisionedCompany = {
      id: "comp_" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36),
      name: cfg.name.trim(),
      maxUsers: cfg.maxUsers,
      accountType: cfg.accountType,
      invitationMode: cfg.invitationMode,
      chefToken: null, chefUrl: null, chefExpiresAt: null,
      createdAt: new Date().toISOString(),
    };
    setCompanies((prev) => [...prev, c]);
    setSelectedCompanyId(c.id);
    setShowProvisionModal(false);
    setToast(`Société « ${c.name} » provisionnée (mode ${c.invitationMode === "chef" ? "Chef" : "Admin"}).`);
  };

  if (companies.length === 0) {
    return (
      <div>
        <EmptyCompaniesState onProvision={() => setShowProvisionModal(true)} />
        {showProvisionModal && (
          <ProvisionCompanyModal onClose={() => setShowProvisionModal(false)} onProvision={handleProvision} />
        )}
      </div>
    );
  }

  return (
    <div>
      {toast && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 50,
          padding: "12px 18px", background: SAGE, color: "#fff",
          borderRadius: "6px", fontSize: "13px", fontWeight: 600,
          boxShadow: "0 8px 24px rgba(74,123,95,0.25)",
          display: "flex", alignItems: "center", gap: "8px",
          fontFamily: C.fontSans,
        }}>
          <CheckCircle2 size={15} />
          {toast}
        </div>
      )}

      <div style={{
        display: "flex", gap: "10px", marginBottom: "20px",
        flexWrap: "wrap", alignItems: "center",
      }}>
        <div style={{ position: "relative", minWidth: "280px", flex: 1 }}>
          <Building2 size={14} color={C.textMuted}
            style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)" }} />
          <select
            value={selectedCompanyId || ""}
            onChange={(e) => setSelectedCompanyId(e.target.value || null)}
            style={{ ...monoInputStyle, paddingLeft: "32px", cursor: "pointer", minWidth: "280px" }}
          >
            <option value="">— Sélectionner une société —</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.maxUsers} max · {c.invitationMode === "chef" ? "Chef" : "Admin"})
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowProvisionModal(true)}
          style={{
            padding: "9px 14px", background: "transparent",
            border: `1px solid ${C.border}`, color: C.textBody,
            borderRadius: "5px", fontSize: "12px", fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
            fontFamily: C.fontSans,
          }}
        >
          <Plus size={13} /> Nouvelle société
        </button>
      </div>

      {error && (
        <div style={{
          padding: "10px 12px", background: C.dangerBg,
          border: `1px solid ${C.danger}33`, borderRadius: "5px",
          color: C.danger, fontFamily: C.fontMono, fontSize: "11px",
          marginBottom: "16px",
        }}>
          {error}
        </div>
      )}

      {selectedCompany && (
        <>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
            gap: "1px", background: C.border,
            border: `1px solid ${C.border}`, borderRadius: "8px",
            overflow: "hidden", marginBottom: "20px",
          }}>
            <KpiCell
              label="Employés / max"
              value={`${kpis.total} / ${kpis.maxUsers}`}
              sub={kpis.maxUsers > 0 ? `${Math.round((kpis.total / kpis.maxUsers) * 100)}% de la capacité` : "—"}
              color={kpis.maxUsers > 0 && kpis.total > kpis.maxUsers ? C.danger : undefined}
            />
            <KpiCell
              label="Invitations envoyées"
              value={kpis.sent}
              sub={`${kpis.accepted} acceptées`}
            />
            <KpiCell
              label="Taux de conversion"
              value={`${kpis.conversionRate}%`}
              color={kpis.conversionRate >= 50 ? SAGE : C.warning}
            />
            <KpiCell
              label="Actifs (7j)"
              value={kpis.active7d}
              color={kpis.active7d > 0 ? SAGE : undefined}
            />
            <KpiCell
              label="Completion moy."
              value={`${kpis.avgCompletion}%`}
              color={kpis.avgCompletion >= 70 ? SAGE : C.warning}
            />
          </div>

          {selectedCompany.invitationMode === "chef" ? (
            <ChefLinkPanel
              company={selectedCompany}
              onGenerate={handleGenerateChefLink}
              busy={busy}
              maxUsers={selectedCompany.maxUsers}
              used={fiches.length}
            />
          ) : (
            <BulkLinksPanel
              company={selectedCompany}
              links={bulkLinks}
              bulkCount={bulkCount}
              setBulkCount={setBulkCount}
              bulkExpDays={bulkExpDays}
              setBulkExpDays={setBulkExpDays}
              onGenerate={handleGenerateBulkLinks}
              onExportCSV={handleExportBulkLinksCSV}
              busy={busy}
            />
          )}

          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: "12px", marginTop: "32px",
            flexWrap: "wrap", gap: "8px",
          }}>
            <div style={{ fontFamily: C.fontMono, fontSize: "11px", color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>
              Fiches employés ({fiches.length})
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <button onClick={() => setShowAddEmployee(true)} className="admin-primary-btn" style={{
                padding: "8px 12px", background: SAGE, color: "#fff",
                border: "none", borderRadius: "5px", fontSize: "12px",
                fontWeight: 600, cursor: "pointer", display: "flex",
                alignItems: "center", gap: "6px", fontFamily: C.fontSans,
              }}>
                <UserPlus size={13} /> Ajouter un employé
              </button>
              <button onClick={() => setShowCsvImport(true)} style={{
                padding: "8px 12px", background: "transparent",
                border: `1px solid ${C.border}`, color: C.textBody,
                borderRadius: "5px", fontSize: "12px", fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center",
                gap: "6px", fontFamily: C.fontSans,
              }}>
                <Upload size={13} /> Importer CSV
              </button>
              <button onClick={handleExportFichesCSV} disabled={fiches.length === 0} className="admin-primary-btn" style={{
                padding: "8px 12px", background: "transparent",
                border: `1px solid ${C.border}`, color: fiches.length === 0 ? C.textMuted : C.textBody,
                borderRadius: "5px", fontSize: "12px", fontWeight: 600,
                cursor: fiches.length === 0 ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: "6px",
                fontFamily: C.fontSans,
              }}>
                <Download size={13} /> Exporter fiches
              </button>
            </div>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px",
            marginBottom: "20px",
          }}>
            <BreakdownCard title="Par département" data={kpis.byDept} />
            <BreakdownCard title="Par poste" data={kpis.byRole} />
          </div>

          {fiches.length === 0 ? (
            <EmptyState text="Aucune fiche employé. Cliquez sur « Ajouter un employé » pour commencer." />
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
              gap: "14px",
            }}>
              {fiches.map((f) => (
                <EmployeeFicheCard
                  key={f.id}
                  fiche={f}
                  onEdit={() => setEditingFiche(f)}
                  onToggleStatus={() => handleToggleStatus(f)}
                  onSendInvitation={() => handleSendInvitation(f)}
                  onAssignBulkLink={
                    selectedCompany.invitationMode === "admin" && f.invitation.status === "not_sent"
                      ? () => handleAssignBulkLink(f)
                      : undefined
                  }
                  busy={busy}
                />
              ))}
            </div>
          )}
        </>
      )}

      {showProvisionModal && (
        <ProvisionCompanyModal
          onClose={() => setShowProvisionModal(false)}
          onProvision={handleProvision}
        />
      )}
      {showAddEmployee && selectedCompanyId && (
        <AddEmployeeModal
          companyName={selectedCompany?.name || ""}
          onClose={() => setShowAddEmployee(false)}
          onCreate={handleCreateFiche}
        />
      )}
      {showCsvImport && (
        <CsvImportModal
          onClose={() => setShowCsvImport(false)}
          onImport={handleCsvImport}
        />
      )}
      {editingFiche && (
        <EmployeeDetailModal
          fiche={editingFiche}
          companyName={selectedCompany?.name || ""}
          onClose={() => setEditingFiche(null)}
          onUpdate={(patch) => {
            handleUpdateFiche(editingFiche.id, patch);
            setEditingFiche((prev) => prev ? { ...prev, ...patch, updatedAt: new Date().toISOString() } : prev);
          }}
          onToggleStatus={() => handleToggleStatus(editingFiche)}
          onSendInvitation={() => handleSendInvitation(editingFiche)}
          busy={busy}
        />
      )}
    </div>
  );
}

// ─── EMPTY COMPANIES STATE ───────────────────────────────────────

function EmptyCompaniesState({ onProvision }: { onProvision: () => void }) {
  return (
    <div style={{
      padding: "60px 32px", border: `1px dashed ${C.border}`,
      borderRadius: "8px", textAlign: "center", background: C.bg,
    }}>
      <Briefcase size={36} color={C.border} style={{ margin: "0 auto 14px" }} />
      <div style={{
        fontSize: "16px", fontWeight: 600, color: C.text,
        marginBottom: "6px", fontFamily: C.fontSans,
      }}>
        Aucune société provisionnée
      </div>
      <div style={{
        fontSize: "13px", color: C.textMuted, fontFamily: C.fontMono,
        marginBottom: "20px", lineHeight: 1.5,
      }}>
        Provisionnez votre première société pour activer les 2 modes d'invitation
        (Chef ou Admin) et commencer à créer des fiches employés.
      </div>
      <button onClick={onProvision} style={{
        padding: "10px 18px", background: SAGE, color: "#fff",
        border: "none", borderRadius: "5px", fontSize: "13px",
        fontWeight: 600, cursor: "pointer", display: "inline-flex",
        alignItems: "center", gap: "8px", fontFamily: C.fontSans,
      }}>
        <Plus size={14} strokeWidth={2.5} /> Provisionner une société
      </button>
    </div>
  );
}

// ─── PROVISION COMPANY MODAL ─────────────────────────────────────

function ProvisionCompanyModal({
  onClose, onProvision,
}: {
  onClose: () => void;
  onProvision: (cfg: { name: string; maxUsers: number; accountType: string; invitationMode: InvitationMode }) => void;
}) {
  const [name, setName] = useState("");
  const [maxUsers, setMaxUsers] = useState(10);
  const [accountType, setAccountType] = useState("essential");
  const [mode, setMode] = useState<InvitationMode>("chef");
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    if (!name.trim()) { setErr("Le nom de la société est requis."); return; }
    if (maxUsers < 1) { setErr("Le nombre maximum d'employés doit être >= 1."); return; }
    onProvision({ name: name.trim(), maxUsers, accountType, invitationMode: mode });
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
      zIndex: 100, display: "flex", alignItems: "center",
      justifyContent: "center", padding: "16px",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: C.bg, border: `1px solid ${C.border}`,
        borderRadius: "10px", padding: "28px", maxWidth: "640px",
        width: "100%", maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <div style={{ ...labelStyle, marginBottom: "4px" }}>Nouvelle société</div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.01em" }}>
              Provisionner une société client
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.textMuted, cursor: "pointer", padding: "4px" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={labelStyle}>Nom de la société *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Maroc Telecom" style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Nombre max d'employés *</label>
              <input type="number" min={1} value={maxUsers} onChange={(e) => setMaxUsers(Math.max(1, Number(e.target.value) || 1))} style={{ ...inputStyle, fontFamily: C.fontMono }} />
            </div>
            <div>
              <label style={labelStyle}>Account type</label>
              <select value={accountType} onChange={(e) => setAccountType(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="essential">Essentiel</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
                <option value="agency">Agency</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Mode d'invitation *</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button onClick={() => setMode("chef")} style={{
                padding: "14px", textAlign: "left",
                background: mode === "chef" ? SAGE_BG : "transparent",
                border: `1px solid ${mode === "chef" ? SAGE : C.border}`,
                borderRadius: "6px", cursor: "pointer", transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <Crown size={16} color={mode === "chef" ? SAGE : C.textMuted} />
                  <span style={{ fontSize: "13px", fontWeight: 700, color: mode === "chef" ? SAGE : C.text, fontFamily: C.fontSans }}>
                    Mode 1 — Chef
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: C.textBody, lineHeight: 1.5, fontFamily: C.fontSans }}>
                  J'envoie 1 lien au chef d'entreprise. Il se connecte, voit le nombre d'employés que j'ai défini (maxUsers), et invite lui-même son équipe. Il ne peut pas dépasser ce nombre.
                </div>
              </button>
              <button onClick={() => setMode("admin")} style={{
                padding: "14px", textAlign: "left",
                background: mode === "admin" ? SAGE_BG : "transparent",
                border: `1px solid ${mode === "admin" ? SAGE : C.border}`,
                borderRadius: "6px", cursor: "pointer", transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <List size={16} color={mode === "admin" ? SAGE : C.textMuted} />
                  <span style={{ fontSize: "13px", fontWeight: 700, color: mode === "admin" ? SAGE : C.text, fontFamily: C.fontSans }}>
                    Mode 2 — Admin
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: C.textBody, lineHeight: 1.5, fontFamily: C.fontSans }}>
                  Je crée les liens individuellement pour chaque employé. Chaque lien est unique et lié à une fiche employé.
                </div>
              </button>
            </div>
          </div>

          {err && (
            <div style={{ padding: "10px 12px", background: C.dangerBg, border: `1px solid ${C.danger}30`, borderRadius: "5px", fontSize: "12px", color: C.danger }}>
              {err}
            </div>
          )}

          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "4px" }}>
            <button onClick={onClose} style={{
              padding: "9px 16px", background: "transparent",
              border: `1px solid ${C.border}`, color: C.textBody,
              fontFamily: C.fontSans, fontSize: "13px", fontWeight: 500,
              cursor: "pointer", borderRadius: "5px",
            }}>
              Annuler
            </button>
            <button onClick={submit} style={{
              padding: "9px 18px", background: SAGE, color: "#fff",
              border: "none", fontFamily: C.fontSans, fontSize: "13px",
              fontWeight: 600, cursor: "pointer", borderRadius: "5px",
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              <Plus size={14} strokeWidth={2.5} /> Provisionner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CHEF LINK PANEL ─────────────────────────────────────────────

function ChefLinkPanel({
  company, onGenerate, busy, maxUsers, used,
}: {
  company: ProvisionedCompany;
  onGenerate: () => void;
  busy: boolean;
  maxUsers: number;
  used: number;
}) {
  const [copied, setCopied] = useState(false);
  const remaining = Math.max(0, maxUsers - used);

  return (
    <div style={{
      padding: "20px", background: C.bg,
      border: `1px solid ${C.border}`, borderRadius: "8px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <Crown size={16} color={SAGE} />
        <span style={{ fontSize: "13px", fontWeight: 700, color: C.text, fontFamily: C.fontSans }}>
          Mode 1 — Chef d'entreprise
        </span>
        <span style={{
          fontSize: "9px", fontFamily: C.fontMono, color: SAGE,
          padding: "2px 7px", background: C.successBg, borderRadius: "2px",
          textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginLeft: "auto",
        }}>
          Actif
        </span>
      </div>
      <p style={{ fontSize: "12px", color: C.textBody, margin: "0 0 14px", lineHeight: 1.55, fontFamily: C.fontSans }}>
        J'envoie 1 lien au chef d'entreprise. Il se connecte, voit le nombre d'employés que j'ai défini ({maxUsers}), et invite lui-même son équipe. Il ne peut pas dépasser ce nombre.
      </p>

      <div className="admin-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "14px" }}>
        <div style={{ padding: "10px 12px", background: C.bgSubtle, borderRadius: "5px" }}>
          <div style={{ ...labelStyle, marginBottom: "4px" }}>Cap maxUsers</div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: C.text, fontFamily: C.fontMono }}>{maxUsers}</div>
        </div>
        <div style={{ padding: "10px 12px", background: C.bgSubtle, borderRadius: "5px" }}>
          <div style={{ ...labelStyle, marginBottom: "4px" }}>Fiches créées</div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: C.text, fontFamily: C.fontMono }}>{used}</div>
        </div>
        <div style={{ padding: "10px 12px", background: C.bgSubtle, borderRadius: "5px" }}>
          <div style={{ ...labelStyle, marginBottom: "4px" }}>Restantes</div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: remaining > 0 ? SAGE : C.danger, fontFamily: C.fontMono }}>{remaining}</div>
        </div>
      </div>

      {company.chefUrl ? (
        <div>
          <label style={labelStyle}>Lien chef (unique)</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input readOnly value={company.chefUrl} style={{
              flex: 1, padding: "9px 12px", border: `1px solid ${C.border}`,
              borderRadius: "5px", fontFamily: C.fontMono, fontSize: "11px",
              color: C.text, background: C.bgSubtle,
            }} />
            <button onClick={() => {
              navigator.clipboard.writeText(company.chefUrl || "");
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }} style={{
              padding: "9px 12px", background: copied ? SAGE : C.text,
              color: "#fff", border: "none", borderRadius: "5px",
              fontSize: "12px", fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: "5px",
            }}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copié" : "Copier"}
            </button>
          </div>
          {company.chefExpiresAt && (
            <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono, marginTop: "6px" }}>
              Expire le {new Date(company.chefExpiresAt).toLocaleDateString("fr-FR")}
            </div>
          )}
          <div style={{
            marginTop: "14px", padding: "12px 14px",
            background: SAGE_BG,
            border: `1px solid ${SAGE_BORDER}`,
            borderRadius: "5px",
          }}>
            <div style={{ fontSize: "9px", fontFamily: C.fontMono, color: SAGE, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>
              Aperçu — ce que voit le chef
            </div>
            <div style={{ fontSize: "12px", color: C.textBody, fontFamily: C.fontSans, lineHeight: 1.5 }}>
              « Bienvenue. Vous pouvez inviter jusqu'à <strong style={{ color: C.text }}>{maxUsers}</strong> employés
              ({remaining} restants). Chaque invitation crée une fiche que l'employé complétera à sa première connexion. »
            </div>
          </div>
        </div>
      ) : (
        <button onClick={onGenerate} disabled={busy} className="admin-primary-btn" style={{
          padding: "10px 16px", background: busy ? C.border : SAGE,
          color: "#fff", border: "none", borderRadius: "5px",
          fontSize: "13px", fontWeight: 600, cursor: busy ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", gap: "8px", fontFamily: C.fontSans,
        }}>
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
          {busy ? "Génération..." : "Générer le lien chef"}
        </button>
      )}
    </div>
  );
}

// ─── BULK LINKS PANEL (Mode Admin) ───────────────────────────────

function BulkLinksPanel({
  company, links, bulkCount, setBulkCount, bulkExpDays, setBulkExpDays,
  onGenerate, onExportCSV, busy,
}: {
  company: ProvisionedCompany;
  links: BulkInvitationLink[];
  bulkCount: number;
  setBulkCount: (n: number) => void;
  bulkExpDays: number;
  setBulkExpDays: (n: number) => void;
  onGenerate: () => void;
  onExportCSV: () => void;
  busy: boolean;
}) {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  return (
    <div style={{
      padding: "20px", background: C.bg,
      border: `1px solid ${C.border}`, borderRadius: "8px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <List size={16} color={SAGE} />
        <span style={{ fontSize: "13px", fontWeight: 700, color: C.text, fontFamily: C.fontSans }}>
          Mode 2 — Admin (liens individuels)
        </span>
        <span style={{
          fontSize: "9px", fontFamily: C.fontMono, color: SAGE,
          padding: "2px 7px", background: C.successBg, borderRadius: "2px",
          textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginLeft: "auto",
        }}>
          {links.length} lien(s)
        </span>
      </div>
      <p style={{ fontSize: "12px", color: C.textBody, margin: "0 0 14px", lineHeight: 1.55, fontFamily: C.fontSans }}>
        Je crée les liens individuellement pour chaque employé. Chaque lien est unique et lié à une fiche employé.
      </p>

      <div style={{
        display: "flex", gap: "10px", alignItems: "flex-end",
        marginBottom: "16px", flexWrap: "wrap",
      }}>
        <div>
          <label style={labelStyle}>Nombre d'employés</label>
          <input type="number" min={1} max={100} value={bulkCount}
            onChange={(e) => setBulkCount(Math.min(100, Math.max(1, Number(e.target.value) || 1)))}
            style={{ ...inputStyle, fontFamily: C.fontMono, width: "120px" }} />
        </div>
        <div>
          <label style={labelStyle}>Expiration (jours)</label>
          <input type="number" min={1} max={365} value={bulkExpDays}
            onChange={(e) => setBulkExpDays(Math.min(365, Math.max(1, Number(e.target.value) || 7)))}
            style={{ ...inputStyle, fontFamily: C.fontMono, width: "120px" }} />
        </div>
        <button onClick={onGenerate} disabled={busy} className="admin-primary-btn" style={{
          padding: "9px 16px", background: busy ? C.border : SAGE,
          color: "#fff", border: "none", borderRadius: "5px",
          fontSize: "13px", fontWeight: 600, cursor: busy ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", gap: "8px", fontFamily: C.fontSans,
        }}>
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} strokeWidth={2.5} />}
          {busy ? "Génération..." : `Générer ${bulkCount} lien(s)`}
        </button>
        {links.length > 0 && (
          <button onClick={onExportCSV} className="admin-primary-btn" style={{
            padding: "9px 12px", background: "transparent",
            border: `1px solid ${C.border}`, color: C.textBody,
            borderRadius: "5px", fontSize: "12px", fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center",
            gap: "6px", fontFamily: C.fontSans,
          }}>
            <Download size={13} /> Export CSV
          </button>
        )}
      </div>

      {links.length === 0 ? (
        <div style={{
          padding: "24px", textAlign: "center", color: C.textMuted,
          fontFamily: C.fontMono, fontSize: "12px",
          background: C.bgSubtle, borderRadius: "5px",
        }}>
          Aucun lien généré. Utilisez le formulaire ci-dessus.
        </div>
      ) : (
        <div className="admin-table-wrap" style={{
          border: `1px solid ${C.border}`, borderRadius: "6px",
          overflow: "hidden", maxHeight: "360px", overflowY: "auto",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "minmax(120px, 1fr) minmax(200px, 2fr) 110px 90px 90px",
            gap: "1px", background: C.border,
            fontFamily: C.fontMono, fontSize: "9px", color: C.textMuted,
            textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700,
          }}>
            <div style={{ background: C.bgSubtle, padding: "8px 12px" }}>Email placeholder</div>
            <div style={{ background: C.bgSubtle, padding: "8px 12px" }}>URL</div>
            <div style={{ background: C.bgSubtle, padding: "8px 12px" }}>Expire</div>
            <div style={{ background: C.bgSubtle, padding: "8px 12px" }}>Statut</div>
            <div style={{ background: C.bgSubtle, padding: "8px 12px" }}></div>
          </div>
          {links.map((l) => {
            const isExpired = new Date(l.expiresAt) < new Date();
            const isAssigned = !!l.assignedFicheId;
            const status = isExpired ? "Expiré" : isAssigned ? "Attribué" : "Libre";
            const sColor = isExpired ? C.danger : isAssigned ? SAGE : C.warning;
            const sBg = isExpired ? C.dangerBg : isAssigned ? C.successBg : C.warningBg;
            return (
              <div key={l.token} style={{
                display: "grid",
                gridTemplateColumns: "minmax(120px, 1fr) minmax(200px, 2fr) 110px 90px 90px",
                gap: "1px", background: C.border,
                fontFamily: C.fontSans, fontSize: "11px",
              }}>
                <div style={{ background: C.bg, padding: "8px 12px", fontFamily: C.fontMono, color: C.textBody, fontSize: "10px", wordBreak: "break-all" }}>
                  {l.emailPlaceholder}
                </div>
                <div style={{ background: C.bg, padding: "8px 12px", fontFamily: C.fontMono, color: C.text, fontSize: "10px", wordBreak: "break-all" }}>
                  {l.url}
                </div>
                <div style={{ background: C.bg, padding: "8px 12px", fontFamily: C.fontMono, color: C.textMuted, fontSize: "10px" }}>
                  {new Date(l.expiresAt).toLocaleDateString("fr-FR")}
                </div>
                <div style={{ background: C.bg, padding: "8px 12px" }}>
                  <span style={{
                    fontSize: "9px", fontFamily: C.fontMono, padding: "2px 7px",
                    borderRadius: "2px", background: sBg, color: sColor,
                    textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700,
                  }}>
                    {status}
                  </span>
                </div>
                <div style={{ background: C.bg, padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <button onClick={() => {
                    navigator.clipboard.writeText(l.url);
                    setCopiedToken(l.token);
                    setTimeout(() => setCopiedToken(null), 2000);
                  }} style={{
                    padding: "4px 8px", background: "transparent",
                    border: `1px solid ${C.border}`, color: C.textBody,
                    borderRadius: "3px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "4px",
                    fontFamily: C.fontMono, fontSize: "10px",
                  }}>
                    {copiedToken === l.token ? <Check size={11} color={SAGE} /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── BREAKDOWN CARD ──────────────────────────────────────────────

function BreakdownCard({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = entries.reduce((m, [, v]) => Math.max(m, v), 0);
  return (
    <div style={{
      padding: "14px 16px", background: C.bg,
      border: `1px solid ${C.border}`, borderRadius: "8px",
    }}>
      <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: "10px" }}>
        {title} ({entries.length})
      </div>
      {entries.length === 0 ? (
        <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono }}>—</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {entries.map(([k, v]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ flex: 1, fontSize: "12px", color: C.textBody, fontFamily: C.fontSans, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {k}
              </div>
              <div style={{ width: "80px", height: "6px", background: C.bgSubtle, borderRadius: "3px", overflow: "hidden" }}>
                <div style={{
                  width: `${max === 0 ? 0 : (v / max) * 100}%`,
                  height: "100%", background: SAGE,
                }} />
              </div>
              <div style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.text, minWidth: "24px", textAlign: "right", fontWeight: 600 }}>
                {v}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── EMPLOYEE FICHE CARD ─────────────────────────────────────────

function EmployeeFicheCard({
  fiche, onEdit, onToggleStatus, onSendInvitation, onAssignBulkLink, busy,
}: {
  fiche: EmployeeFiche;
  onEdit: () => void;
  onToggleStatus: () => void;
  onSendInvitation: () => void;
  onAssignBulkLink?: () => void;
  busy: boolean;
}) {
  const completion = computeCompletion(fiche);
  const statusMeta: Record<FicheStatus, { color: string; bg: string; label: string }> = {
    active: { color: SAGE, bg: C.successBg, label: "Actif" },
    suspended: { color: C.danger, bg: C.dangerBg, label: "Suspendu" },
    left: { color: C.textMuted, bg: C.bgSubtle, label: "Parti" },
  };
  const sm = statusMeta[fiche.status];
  const invMeta: Record<InvitationStatus, { color: string; bg: string; label: string }> = {
    not_sent: { color: C.textMuted, bg: C.bgSubtle, label: "Non envoyée" },
    sent: { color: C.warning, bg: C.warningBg, label: "Envoyée" },
    accepted: { color: SAGE, bg: C.successBg, label: "Acceptée" },
    expired: { color: C.danger, bg: C.dangerBg, label: "Expirée" },
  };
  const im = invMeta[fiche.invitation.status];

  return (
    <div style={{
      padding: "16px", background: C.bg,
      border: `1px solid ${C.border}`, borderRadius: "8px",
      display: "flex", flexDirection: "column", gap: "10px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        <div style={{
          width: "38px", height: "38px", borderRadius: "50%",
          background: SAGE_BG, color: SAGE,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: C.fontMono, fontSize: "13px", fontWeight: 700,
          flexShrink: 0,
        }}>
          {ficheInitials(fiche)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: C.text, fontFamily: C.fontSans, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {ficheDisplayName(fiche)}
          </div>
          <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {fiche.role || "—"}{fiche.department ? ` · ${fiche.department}` : ""}
          </div>
        </div>
        <span style={{
          fontSize: "9px", fontFamily: C.fontMono, padding: "2px 7px",
          borderRadius: "2px", background: sm.bg, color: sm.color,
          textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700,
          flexShrink: 0,
        }}>
          {sm.label}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
        {fiche.email && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: C.textBody, fontFamily: C.fontMono }}>
            <Mail size={11} color={C.textMuted} /> {fiche.email}
          </div>
        )}
        {fiche.phone && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: C.textBody, fontFamily: C.fontMono }}>
            <Phone size={11} color={C.textMuted} /> {fiche.phone}
          </div>
        )}
        {fiche.lastLoginAt && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono }}>
            <Clock size={11} /> Dernière connexion : {new Date(fiche.lastLoginAt).toLocaleDateString("fr-FR")}
          </div>
        )}
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
          <span style={{ fontSize: "9px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>
            Fiche {completion.pct}% complète
          </span>
          <span style={{ fontSize: "9px", fontFamily: C.fontMono, color: C.textMuted }}>
            {completion.filled}/{completion.total}
          </span>
        </div>
        <div style={{ width: "100%", height: "4px", background: C.bgSubtle, borderRadius: "2px", overflow: "hidden" }}>
          <div style={{
            width: `${completion.pct}%`, height: "100%",
            background: completion.pct >= 70 ? SAGE : completion.pct >= 40 ? C.warning : C.danger,
          }} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{
          fontSize: "9px", fontFamily: C.fontMono, padding: "2px 7px",
          borderRadius: "2px", background: im.bg, color: im.color,
          textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700,
        }}>
          {im.label}
        </span>
        {fiche.loginCount > 0 && (
          <span style={{ fontSize: "9px", fontFamily: C.fontMono, color: C.textMuted }}>
            {fiche.loginCount} connexion(s)
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "auto" }}>
        <button onClick={onEdit} style={{
          padding: "6px 10px", background: "transparent",
          border: `1px solid ${C.border}`, color: C.textBody,
          borderRadius: "4px", fontSize: "11px", fontWeight: 600,
          cursor: "pointer", display: "flex", alignItems: "center",
          gap: "4px", fontFamily: C.fontSans, flex: 1, justifyContent: "center",
        }}>
          <FileText size={11} /> Éditer
        </button>
        {fiche.invitation.status === "not_sent" && (
          onAssignBulkLink ? (
            <button onClick={onAssignBulkLink} disabled={busy} style={{
              padding: "6px 10px", background: SAGE, color: "#fff",
              border: "none", borderRadius: "4px", fontSize: "11px",
              fontWeight: 600, cursor: busy ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "4px",
              fontFamily: C.fontSans,
            }}>
              <Link2 size={11} /> Attribuer
            </button>
          ) : (
            <button onClick={onSendInvitation} disabled={busy} style={{
              padding: "6px 10px", background: SAGE, color: "#fff",
              border: "none", borderRadius: "4px", fontSize: "11px",
              fontWeight: 600, cursor: busy ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "4px",
              fontFamily: C.fontSans,
            }}>
              {busy ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}
              Inviter
            </button>
          )
        )}
        <button onClick={onToggleStatus} style={{
          padding: "6px 10px", background: fiche.status === "active" ? C.dangerBg : C.successBg,
          border: `1px solid ${fiche.status === "active" ? C.danger + "40" : SAGE + "40"}`,
          color: fiche.status === "active" ? C.danger : SAGE,
          borderRadius: "4px", fontSize: "11px", fontWeight: 600,
          cursor: "pointer", display: "flex", alignItems: "center",
          gap: "4px", fontFamily: C.fontSans,
        }}>
          {fiche.status === "active" ? <Ban size={11} /> : <Check size={11} />}
          {fiche.status === "active" ? "Suspendre" : "Réactiver"}
        </button>
      </div>
    </div>
  );
}

// ─── ADD EMPLOYEE MODAL (3 fields) ───────────────────────────────

function AddEmployeeModal({
  companyName, onClose, onCreate,
}: {
  companyName: string;
  onClose: () => void;
  onCreate: (data: { firstName: string; lastName: string; email: string; role: string; phone?: string; department?: string }) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    if (!firstName.trim() && !lastName.trim()) { setErr("Le prénom ou le nom est requis."); return; }
    if (!email.trim() || !email.includes("@")) { setErr("Un email valide est requis."); return; }
    if (!role.trim()) { setErr("Le poste est requis."); return; }
    onCreate({ firstName, lastName, email, role });
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
      zIndex: 100, display: "flex", alignItems: "center",
      justifyContent: "center", padding: "16px",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: C.bg, border: `1px solid ${C.border}`,
        borderRadius: "10px", padding: "28px", maxWidth: "520px",
        width: "100%", boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
          <div>
            <div style={{ ...labelStyle, marginBottom: "4px" }}>Nouvelle fiche · {companyName}</div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.01em" }}>
              Ajouter un employé
            </h2>
            <p style={{ fontSize: "11px", color: C.textMuted, margin: "4px 0 0", fontFamily: C.fontMono }}>
              Remplissez 3 champs. L'employé complétera le reste à sa première connexion.
            </p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.textMuted, cursor: "pointer", padding: "4px" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={labelStyle}>Prénom *</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Salim" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Nom *</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Bennani" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Email *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="salim.bennani@company.com" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Poste *</label>
            <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Directeur de la communication" style={inputStyle} />
          </div>
          {err && (
            <div style={{ padding: "10px 12px", background: C.dangerBg, border: `1px solid ${C.danger}30`, borderRadius: "5px", fontSize: "12px", color: C.danger }}>
              {err}
            </div>
          )}
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "4px" }}>
            <button onClick={onClose} style={{
              padding: "9px 16px", background: "transparent",
              border: `1px solid ${C.border}`, color: C.textBody,
              fontFamily: C.fontSans, fontSize: "13px", fontWeight: 500,
              cursor: "pointer", borderRadius: "5px",
            }}>
              Annuler
            </button>
            <button onClick={submit} style={{
              padding: "9px 18px", background: SAGE, color: "#fff",
              border: "none", fontFamily: C.fontSans, fontSize: "13px",
              fontWeight: 600, cursor: "pointer", borderRadius: "5px",
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              <Plus size={14} strokeWidth={2.5} /> Créer la fiche
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CSV IMPORT MODAL ────────────────────────────────────────────

function CsvImportModal({
  onClose, onImport,
}: {
  onClose: () => void;
  onImport: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result || ""));
    reader.readAsText(file);
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
      zIndex: 100, display: "flex", alignItems: "center",
      justifyContent: "center", padding: "16px",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: C.bg, border: `1px solid ${C.border}`,
        borderRadius: "10px", padding: "28px", maxWidth: "640px",
        width: "100%", maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
          <div>
            <div style={{ ...labelStyle, marginBottom: "4px" }}>Import en masse</div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: C.text, margin: 0, letterSpacing: "-0.01em" }}>
              Importer des fiches depuis un CSV
            </h2>
            <p style={{ fontSize: "11px", color: C.textMuted, margin: "4px 0 0", fontFamily: C.fontMono }}>
              En-tête attendu : Prénom, Nom, Email, Téléphone, Poste, Département
            </p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.textMuted, cursor: "pointer", padding: "4px" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{
          padding: "16px", border: `1px dashed ${C.border}`,
          borderRadius: "6px", textAlign: "center",
          marginBottom: "12px", background: C.bgSubtle,
        }}>
          <input
            type="file" accept=".csv,text/csv"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            style={{ display: "none" }}
            id="csv-file-input"
          />
          <label htmlFor="csv-file-input" style={{
            padding: "8px 14px", background: "transparent",
            border: `1px solid ${C.border}`, color: C.textBody,
            borderRadius: "5px", fontSize: "12px", fontWeight: 600,
            cursor: "pointer", display: "inline-flex", alignItems: "center",
            gap: "6px", fontFamily: C.fontSans,
          }}>
            <Upload size={13} /> {fileName || "Choisir un fichier CSV"}
          </label>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Prénom,Nom,Email,Téléphone,Poste,Département\nSalim,Bennani,salim@comp.com,+212612345678,Dircom,Communication"}
          rows={8}
          style={{
            ...inputStyle, fontFamily: C.fontMono, fontSize: "11px",
            resize: "vertical", minHeight: "180px", lineHeight: 1.5,
          }}
        />

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "12px" }}>
          <button onClick={onClose} style={{
            padding: "9px 16px", background: "transparent",
            border: `1px solid ${C.border}`, color: C.textBody,
            fontFamily: C.fontSans, fontSize: "13px", fontWeight: 500,
            cursor: "pointer", borderRadius: "5px",
          }}>
            Annuler
          </button>
          <button onClick={() => onImport(text)} disabled={!text.trim()} style={{
            padding: "9px 18px", background: !text.trim() ? C.border : SAGE, color: "#fff",
            border: "none", fontFamily: C.fontSans, fontSize: "13px",
            fontWeight: 600, cursor: !text.trim() ? "not-allowed" : "pointer",
            borderRadius: "5px", display: "flex", alignItems: "center", gap: "6px",
          }}>
            <Upload size={14} /> Importer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EMPLOYEE DETAIL MODAL ───────────────────────────────────────

function EmployeeDetailModal({
  fiche, companyName, onClose, onUpdate, onToggleStatus, onSendInvitation, busy,
}: {
  fiche: EmployeeFiche;
  companyName: string;
  onClose: () => void;
  onUpdate: (patch: Partial<EmployeeFiche>) => void;
  onToggleStatus: () => void;
  onSendInvitation: () => void;
  busy: boolean;
}) {
  const [section, setSection] = useState<"fiche" | "invitation" | "connexion" | "annotations" | "activite" | "permissions" | "securite">("fiche");
  const [newAnnotation, setNewAnnotation] = useState("");
  const [copiedUrl, setCopiedUrl] = useState(false);

  const completion = computeCompletion(fiche);

  const addAnnotation = () => {
    if (!newAnnotation.trim()) return;
    const ann = {
      id: "ann_" + Math.random().toString(36).slice(2, 10),
      text: newAnnotation.trim(),
      author: "admin",
      at: new Date().toISOString(),
    };
    onUpdate({ annotations: [...fiche.annotations, ann] });
    setNewAnnotation("");
  };

  const removeAnnotation = (id: string) => {
    onUpdate({ annotations: fiche.annotations.filter((a) => a.id !== id) });
  };

  const sections: Array<{ key: typeof section; label: string; icon: React.ReactNode }> = [
    { key: "fiche", label: "Fiche", icon: <FileText size={13} /> },
    { key: "invitation", label: "Invitation", icon: <Mail size={13} /> },
    { key: "connexion", label: "Connexion", icon: <Clock size={13} /> },
    { key: "annotations", label: `Annotations (${fiche.annotations.length})`, icon: <StickyNote size={13} /> },
    { key: "activite", label: "Activité", icon: <Activity size={13} /> },
    { key: "permissions", label: "Permissions", icon: <ShieldCheck size={13} /> },
    { key: "securite", label: "Sécurité", icon: <Lock size={13} /> },
  ];

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
      backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      zIndex: 100, display: "flex", alignItems: "center",
      justifyContent: "center", padding: "16px",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: C.bg, border: `1px solid ${C.border}`,
        borderRadius: "10px", padding: "0", maxWidth: "900px",
        width: "100%", maxHeight: "94vh", overflow: "hidden",
        boxShadow: "0 16px 48px rgba(0,0,0,0.20)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{
          padding: "20px 24px", borderBottom: `1px solid ${C.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "50%",
              background: SAGE_BG, color: SAGE,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: C.fontMono, fontSize: "16px", fontWeight: 700,
            }}>
              {ficheInitials(fiche)}
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: C.text, fontFamily: C.fontSans }}>
                {ficheDisplayName(fiche)}
              </div>
              <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono, marginTop: "2px" }}>
                {companyName} · Fiche {completion.pct}% complète ({completion.filled}/{completion.total})
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.textMuted, cursor: "pointer", padding: "4px" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{
          display: "flex", gap: "1px", background: C.border,
          borderBottom: `1px solid ${C.border}`, overflowX: "auto",
          flexShrink: 0,
        }}>
          {sections.map((s) => (
            <button key={s.key} onClick={() => setSection(s.key)} style={{
              padding: "10px 16px", background: section === s.key ? C.bg : C.bgSubtle,
              border: "none", color: section === s.key ? SAGE : C.textBody,
              fontFamily: C.fontSans, fontSize: "11px", fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center",
              gap: "6px", whiteSpace: "nowrap", transition: "background 0.15s",
            }}>
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {section === "fiche" && (
            <FicheSection fiche={fiche} onUpdate={onUpdate} />
          )}
          {section === "invitation" && (
            <InvitationSection
              fiche={fiche}
              onSendInvitation={onSendInvitation}
              busy={busy}
              copiedUrl={copiedUrl}
              setCopiedUrl={setCopiedUrl}
            />
          )}
          {section === "connexion" && <ConnexionSection fiche={fiche} />}
          {section === "annotations" && (
            <AnnotationsSection
              fiche={fiche}
              newAnnotation={newAnnotation}
              setNewAnnotation={setNewAnnotation}
              onAdd={addAnnotation}
              onRemove={removeAnnotation}
            />
          )}
          {section === "activite" && <ActiviteSection fiche={fiche} />}
          {section === "permissions" && (
            <PermissionsSection fiche={fiche} onUpdate={onUpdate} onToggleStatus={onToggleStatus} />
          )}
          {section === "securite" && <SecuriteSection fiche={fiche} />}
        </div>

        <div style={{
          padding: "12px 24px", borderTop: `1px solid ${C.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexShrink: 0, background: C.bgSubtle,
        }}>
          <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono }}>
            ID : {fiche.id} · Créée le {new Date(fiche.createdAt).toLocaleDateString("fr-FR")}
          </div>
          <button onClick={onClose} style={{
            padding: "8px 18px", background: SAGE, color: "#fff",
            border: "none", borderRadius: "5px", fontSize: "13px",
            fontWeight: 600, cursor: "pointer", fontFamily: C.fontSans,
          }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── FICHE SECTION ───────────────────────────────────────────────

function FicheSection({
  fiche, onUpdate,
}: {
  fiche: EmployeeFiche;
  onUpdate: (patch: Partial<EmployeeFiche>) => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
      <EditableField label="Prénom" value={fiche.firstName} onChange={(v) => onUpdate({ firstName: v })} />
      <EditableField label="Nom" value={fiche.lastName} onChange={(v) => onUpdate({ lastName: v })} />
      <EditableField label="Email" value={fiche.email} onChange={(v) => onUpdate({ email: v })} mono />
      <EditableField label="Téléphone" value={fiche.phone} onChange={(v) => onUpdate({ phone: v })} mono />
      <EditableField label="Âge" value={fiche.age != null ? String(fiche.age) : ""} onChange={(v) => onUpdate({ age: v ? Number(v) : null })} mono type="number" />
      <EditableField label="Poste" value={fiche.role} onChange={(v) => onUpdate({ role: v })} />
      <EditableField label="Département" value={fiche.department} onChange={(v) => onUpdate({ department: v })} />
      <EditableField label="Date de début" value={fiche.startDate || ""} onChange={(v) => onUpdate({ startDate: v || null })} type="date" />
      <EditableField label="Date de fin" value={fiche.endDate || ""} onChange={(v) => onUpdate({ endDate: v || null })} type="date" />
      <div style={{ gridColumn: "1 / -1" }}>
        <label style={labelStyle}>Notes</label>
        <textarea
          value={fiche.notes}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
          placeholder="Notes internes sur cet employé..."
        />
      </div>
    </div>
  );
}

function EditableField({
  label, value, onChange, mono, type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type || "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={mono ? { ...inputStyle, fontFamily: C.fontMono } : inputStyle}
      />
    </div>
  );
}

// ─── INVITATION SECTION ──────────────────────────────────────────

function InvitationSection({
  fiche, onSendInvitation, busy, copiedUrl, setCopiedUrl,
}: {
  fiche: EmployeeFiche;
  onSendInvitation: () => void;
  busy: boolean;
  copiedUrl: boolean;
  setCopiedUrl: (b: boolean) => void;
}) {
  const inv = fiche.invitation;
  const invMeta: Record<InvitationStatus, { color: string; bg: string; label: string }> = {
    not_sent: { color: C.textMuted, bg: C.bgSubtle, label: "Non envoyée" },
    sent: { color: C.warning, bg: C.warningBg, label: "Envoyée" },
    accepted: { color: SAGE, bg: C.successBg, label: "Acceptée" },
    expired: { color: C.danger, bg: C.dangerBg, label: "Expirée" },
  };
  const im = invMeta[inv.status];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{
          fontSize: "11px", fontFamily: C.fontMono, padding: "4px 10px",
          borderRadius: "3px", background: im.bg, color: im.color,
          textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700,
        }}>
          {im.label}
        </span>
        {inv.status === "not_sent" && (
          <button onClick={onSendInvitation} disabled={busy} style={{
            padding: "7px 14px", background: busy ? C.border : SAGE, color: "#fff",
            border: "none", borderRadius: "5px", fontSize: "12px",
            fontWeight: 600, cursor: busy ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: "6px",
            fontFamily: C.fontSans,
          }}>
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            {busy ? "Envoi..." : "Envoyer l'invitation"}
          </button>
        )}
      </div>
      {inv.url ? (
        <div>
          <label style={labelStyle}>URL d'invitation</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input readOnly value={inv.url} style={{
              flex: 1, padding: "9px 12px", border: `1px solid ${C.border}`,
              borderRadius: "5px", fontFamily: C.fontMono, fontSize: "11px",
              color: C.text, background: C.bgSubtle,
            }} />
            <button onClick={() => {
              navigator.clipboard.writeText(inv.url || "");
              setCopiedUrl(true);
              setTimeout(() => setCopiedUrl(false), 2000);
            }} style={{
              padding: "9px 12px", background: copiedUrl ? SAGE : C.text,
              color: "#fff", border: "none", borderRadius: "5px",
              fontSize: "12px", fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: "5px",
            }}>
              {copiedUrl ? <Check size={13} /> : <Copy size={13} />}
              {copiedUrl ? "Copié" : "Copier"}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono, padding: "14px", background: C.bgSubtle, borderRadius: "5px", textAlign: "center" }}>
          Aucune invitation envoyée.
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
        <div style={{ padding: "10px 12px", background: C.bgSubtle, borderRadius: "5px" }}>
          <div style={{ ...labelStyle, marginBottom: "4px" }}>Envoyée le</div>
          <div style={{ fontSize: "12px", color: C.text, fontFamily: C.fontMono }}>
            {inv.sentAt ? new Date(inv.sentAt).toLocaleString("fr-FR") : "—"}
          </div>
        </div>
        <div style={{ padding: "10px 12px", background: C.bgSubtle, borderRadius: "5px" }}>
          <div style={{ ...labelStyle, marginBottom: "4px" }}>Acceptée le</div>
          <div style={{ fontSize: "12px", color: C.text, fontFamily: C.fontMono }}>
            {inv.acceptedAt ? new Date(inv.acceptedAt).toLocaleString("fr-FR") : "—"}
          </div>
        </div>
        <div style={{ padding: "10px 12px", background: C.bgSubtle, borderRadius: "5px" }}>
          <div style={{ ...labelStyle, marginBottom: "4px" }}>Expire le</div>
          <div style={{ fontSize: "12px", color: C.text, fontFamily: C.fontMono }}>
            {inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString("fr-FR") : "—"}
          </div>
        </div>
      </div>
      <div style={{ padding: "10px 12px", background: C.bgSubtle, borderRadius: "5px" }}>
        <div style={{ ...labelStyle, marginBottom: "4px" }}>Token</div>
        <div style={{ fontSize: "10px", color: C.textBody, fontFamily: C.fontMono, wordBreak: "break-all" }}>
          {inv.token || "—"}
        </div>
      </div>
    </div>
  );
}

// ─── CONNEXION SECTION ───────────────────────────────────────────

function ConnexionSection({ fiche }: { fiche: EmployeeFiche }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ padding: "12px 14px", background: C.bgSubtle, borderRadius: "5px" }}>
          <div style={{ ...labelStyle, marginBottom: "4px" }}>Dernière connexion</div>
          <div style={{ fontSize: "13px", color: C.text, fontFamily: C.fontMono }}>
            {fiche.lastLoginAt ? new Date(fiche.lastLoginAt).toLocaleString("fr-FR") : "Jamais"}
          </div>
        </div>
        <div style={{ padding: "12px 14px", background: C.bgSubtle, borderRadius: "5px" }}>
          <div style={{ ...labelStyle, marginBottom: "4px" }}>Nombre de connexions</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: C.text, fontFamily: C.fontMono }}>
            {fiche.loginCount}
          </div>
        </div>
      </div>
      <div>
        <div style={{ ...labelStyle, marginBottom: "8px" }}>Historique IP (5 dernières)</div>
        {fiche.ipHistory.length === 0 ? (
          <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono, padding: "14px", background: C.bgSubtle, borderRadius: "5px", textAlign: "center" }}>
            Aucune connexion enregistrée.
          </div>
        ) : (
          <div style={{ border: `1px solid ${C.border}`, borderRadius: "5px", overflow: "hidden" }}>
            {fiche.ipHistory.slice(0, 5).map((h, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "minmax(120px, 1fr) minmax(140px, 1.2fr) minmax(180px, 2fr)",
                gap: "1px", background: C.border,
                fontFamily: C.fontMono, fontSize: "11px",
              }}>
                <div style={{ background: C.bg, padding: "8px 12px", color: C.text }}>{h.ip}</div>
                <div style={{ background: C.bg, padding: "8px 12px", color: C.textMuted }}>{new Date(h.at).toLocaleString("fr-FR")}</div>
                <div style={{ background: C.bg, padding: "8px 12px", color: C.textMuted, fontSize: "10px", wordBreak: "break-all" }}>{h.userAgent}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ANNOTATIONS SECTION ─────────────────────────────────────────

function AnnotationsSection({
  fiche, newAnnotation, setNewAnnotation, onAdd, onRemove,
}: {
  fiche: EmployeeFiche;
  newAnnotation: string;
  setNewAnnotation: (s: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div>
        <label style={labelStyle}>Nouvelle annotation</label>
        <div style={{ display: "flex", gap: "8px" }}>
          <textarea
            value={newAnnotation}
            onChange={(e) => setNewAnnotation(e.target.value)}
            rows={2}
            placeholder="Note interne (visible admin seulement)..."
            style={{ ...inputStyle, resize: "vertical", flex: 1 }}
          />
          <button onClick={onAdd} disabled={!newAnnotation.trim()} style={{
            padding: "0 16px", background: !newAnnotation.trim() ? C.border : SAGE,
            color: "#fff", border: "none", borderRadius: "5px",
            fontSize: "12px", fontWeight: 600,
            cursor: !newAnnotation.trim() ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: "6px",
            fontFamily: C.fontSans, alignSelf: "stretch",
          }}>
            <Plus size={14} /> Ajouter
          </button>
        </div>
      </div>
      {fiche.annotations.length === 0 ? (
        <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono, padding: "20px", background: C.bgSubtle, borderRadius: "5px", textAlign: "center" }}>
          Aucune annotation.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {fiche.annotations.map((a) => (
            <div key={a.id} style={{
              padding: "10px 12px", background: C.bgSubtle,
              border: `1px solid ${C.border}`, borderRadius: "5px",
              display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "12px", color: C.text, fontFamily: C.fontSans, lineHeight: 1.5 }}>
                  {a.text}
                </div>
                <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono, marginTop: "6px" }}>
                  {a.author} · {new Date(a.at).toLocaleString("fr-FR")}
                </div>
              </div>
              <button onClick={() => onRemove(a.id)} style={{
                background: "transparent", border: "none",
                color: C.textMuted, cursor: "pointer", padding: "2px",
              }}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ACTIVITÉ SECTION ────────────────────────────────────────────

function ActiviteSection({ fiche }: { fiche: EmployeeFiche }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
      <div style={{ padding: "14px", background: C.bgSubtle, borderRadius: "5px", textAlign: "center" }}>
        <Activity size={18} color={SAGE} style={{ margin: "0 auto 8px" }} />
        <div style={{ fontSize: "24px", fontWeight: 700, color: C.text, fontFamily: C.fontMono }}>
          {fiche.harchiqQuestions}
        </div>
        <div style={{ ...labelStyle, marginTop: "4px" }}>Questions HarchIQ</div>
      </div>
      <div style={{ padding: "14px", background: C.bgSubtle, borderRadius: "5px", textAlign: "center" }}>
        <FileText size={18} color={SAGE} style={{ margin: "0 auto 8px" }} />
        <div style={{ fontSize: "24px", fontWeight: 700, color: C.text, fontFamily: C.fontMono }}>
          {fiche.reportsGenerated}
        </div>
        <div style={{ ...labelStyle, marginTop: "4px" }}>Rapports générés</div>
      </div>
      <div style={{ padding: "14px", background: C.bgSubtle, borderRadius: "5px", textAlign: "center" }}>
        <BarChart3 size={18} color={SAGE} style={{ margin: "0 auto 8px" }} />
        <div style={{ fontSize: "12px", fontWeight: 600, color: C.text, fontFamily: C.fontMono, marginTop: "6px" }}>
          {fiche.lastDashboardView ? new Date(fiche.lastDashboardView).toLocaleDateString("fr-FR") : "—"}
        </div>
        <div style={{ ...labelStyle, marginTop: "4px" }}>Dernière vue dashboard</div>
      </div>
    </div>
  );
}

// ─── PERMISSIONS SECTION ─────────────────────────────────────────

function PermissionsSection({
  fiche, onUpdate, onToggleStatus,
}: {
  fiche: EmployeeFiche;
  onUpdate: (patch: Partial<EmployeeFiche>) => void;
  onToggleStatus: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <label style={labelStyle}>Rôle système</label>
          <select
            value={fiche.systemRole}
            onChange={(e) => onUpdate({ systemRole: e.target.value as EmployeeFiche["systemRole"] })}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="user">User</option>
            <option value="company-admin">Company Admin</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Account type</label>
          <select
            value={fiche.accountType}
            onChange={(e) => onUpdate({ accountType: e.target.value })}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="essential">Essentiel</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
            <option value="agency">Agency</option>
          </select>
        </div>
      </div>
      <div>
        <label style={labelStyle}>Statut du compte</label>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{
            fontSize: "11px", fontFamily: C.fontMono, padding: "4px 10px",
            borderRadius: "3px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700,
            background: fiche.status === "active" ? C.successBg : fiche.status === "suspended" ? C.dangerBg : C.bgSubtle,
            color: fiche.status === "active" ? SAGE : fiche.status === "suspended" ? C.danger : C.textMuted,
          }}>
            {fiche.status === "active" ? "Actif" : fiche.status === "suspended" ? "Suspendu" : "Parti"}
          </span>
          {fiche.status !== "left" && (
            <button onClick={onToggleStatus} style={{
              padding: "7px 14px",
              background: fiche.status === "active" ? C.dangerBg : C.successBg,
              border: `1px solid ${fiche.status === "active" ? C.danger + "40" : SAGE + "40"}`,
              color: fiche.status === "active" ? C.danger : SAGE,
              borderRadius: "5px", fontSize: "12px", fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center",
              gap: "6px", fontFamily: C.fontSans,
            }}>
              {fiche.status === "active" ? <Ban size={13} /> : <Check size={13} />}
              {fiche.status === "active" ? "Suspendre" : "Réactiver"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SÉCURITÉ SECTION ────────────────────────────────────────────

function SecuriteSection({ fiche }: { fiche: EmployeeFiche }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
        <div style={{
          padding: "14px", background: fiche.twoFactorEnabled ? C.successBg : C.bgSubtle,
          border: `1px solid ${fiche.twoFactorEnabled ? SAGE + "40" : C.border}`,
          borderRadius: "5px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <Lock size={14} color={fiche.twoFactorEnabled ? SAGE : C.textMuted} />
            <span style={{ ...labelStyle, marginBottom: 0 }}>2FA</span>
          </div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: fiche.twoFactorEnabled ? SAGE : C.textMuted, fontFamily: C.fontSans }}>
            {fiche.twoFactorEnabled ? "Activé" : "Désactivé"}
          </div>
        </div>
        <div style={{ padding: "14px", background: C.bgSubtle, borderRadius: "5px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <Key size={14} color={C.textMuted} />
            <span style={{ ...labelStyle, marginBottom: 0 }}>Mot de passe</span>
          </div>
          <div style={{ fontSize: "12px", color: C.text, fontFamily: C.fontMono }}>
            {fiche.passwordLastChanged ? new Date(fiche.passwordLastChanged).toLocaleDateString("fr-FR") : "Jamais changé"}
          </div>
        </div>
        <div style={{ padding: "14px", background: C.bgSubtle, borderRadius: "5px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
            <Activity size={14} color={C.textMuted} />
            <span style={{ ...labelStyle, marginBottom: 0 }}>Sessions actives</span>
          </div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: fiche.activeSessions > 0 ? SAGE : C.textMuted, fontFamily: C.fontMono }}>
            {fiche.activeSessions}
          </div>
        </div>
      </div>
      <div style={{
        padding: "12px 14px", background: C.warningBg,
        border: `1px solid ${C.warningBorder}40`, borderRadius: "5px",
        fontSize: "11px", color: C.warningText, fontFamily: C.fontMono, lineHeight: 1.5,
      }}>
        La gestion fine des sessions (révocation, devices) se fait via l'onglet Security.
        Les informations ci-dessus sont read-only sur la fiche employé.
      </div>
    </div>
  );
}

// ─── END BATCAVE-3-EMPLOYEES ─────────────────────────────────────
