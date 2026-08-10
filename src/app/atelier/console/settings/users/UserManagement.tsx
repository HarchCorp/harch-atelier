"use client";

// ═══════════════════════════════════════════════════════════════
//  USER MANAGEMENT — Team & Invitations
//
//  Beautiful, modern UX for managing team members.
//  - Plan-aware (Essentiel: 3, Pro: 20, Enterprise/Agency: unlimited)
//  - User table with avatar, role badge, status dot, last-login
//  - Invite modal (email + name + role)
//  - Pending invitations list with resend / cancel
//  - Plan-limit upsell banner
//  - Mobile responsive (table → cards)
//
//  Task ID: POSTLOGIN-5-USERS
//  Agent: Agent 5 — Users UX
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { C } from "../../../components/tokens";

// ─── Types ───────────────────────────────────────────────────────

type Plan = "essential" | "pro" | "enterprise" | "agency";

type Role = "admin" | "member" | "viewer";

interface TeamUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string; // active | suspended
  lastLoginAt: string | null;
  createdAt: string;
  isSelf?: boolean;
}

interface PendingInvite {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  expiresAt: string;
}

interface UserManagementProps {
  plan?: Plan;
  currentUserId?: string;
  currentUserEmail?: string | null;
  currentUserName?: string | null;
}

// ─── Plan config ─────────────────────────────────────────────────

const PLAN_CONFIG: Record<Plan, {
  label: string;
  maxUsers: number | null; // null = unlimited
  supportsRoles: boolean;
  supportsTeams: boolean;
  supportsClientAssignment: boolean;
  upsellLabel: string;
  upsellTarget: string;
}> = {
  essential: {
    label: "Essentiel",
    maxUsers: 3,
    supportsRoles: false,
    supportsTeams: false,
    supportsClientAssignment: false,
    upsellLabel: "Passez à Pro pour 20 utilisateurs.",
    upsellTarget: "Pro",
  },
  pro: {
    label: "Pro",
    maxUsers: 20,
    supportsRoles: true,
    supportsTeams: false,
    supportsClientAssignment: false,
    upsellLabel: "Passez à Grandes Entreprises pour des utilisateurs illimités.",
    upsellTarget: "Grandes Entreprises",
  },
  enterprise: {
    label: "Grandes Entreprises",
    maxUsers: null,
    supportsRoles: true,
    supportsTeams: true,
    supportsClientAssignment: false,
    upsellLabel: "",
    upsellTarget: "",
  },
  agency: {
    label: "Agences",
    maxUsers: null,
    supportsRoles: true,
    supportsTeams: false,
    supportsClientAssignment: true,
    upsellLabel: "",
    upsellTarget: "",
  },
};

// ─── Constants ───────────────────────────────────────────────────

const FONT_SANS = "'Inter', system-ui, -apple-system, sans-serif";
const FONT_MONO = "'JetBrains Mono', 'Space Mono', ui-monospace, monospace";

const COLOR = {
  bg: "#FFFFFF",
  bgSubtle: "#FAFAFA",
  bgHover: "#FAFAFA",
  border: "#F0F0F0",
  borderStrong: "#E5E5E5",
  text: "#0A0A0A",
  textBody: "#525252",
  textMuted: "#71717A",
  textFaint: "#A1A1AA",
  sage: "#4A7B5F",
  sageBg: "rgba(74,123,95,0.10)",
  sageBgHover: "rgba(74,123,95,0.16)",
  charcoal: "#0A0A0A",
  amber: "#B45309",
  amberBg: "#FFFBEB",
  amberBorder: "#FCD34D",
  red: "#DC2626",
  redBg: "#FEF2F2",
  redBorder: "#FECACA",
  green: "#10B981",
  zircon: "#F4F4F5",
  zirconStrong: "#E4E4E7",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  "company-admin": "Admin",
  "agency-admin": "Admin",
  super_admin: "Super Admin",
  member: "Membre",
  user: "Membre",
  manager: "Membre",
  analyst: "Membre",
  viewer: "Lecteur",
};

function normalizeRole(role: string): Role {
  if (role === "admin" || role === "company-admin" || role === "agency-admin" || role === "super_admin") return "admin";
  if (role === "viewer") return "viewer";
  return "member";
}

function getInitials(name: string | null, email: string): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() || "").join("") || email.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function relativeTime(iso: string | null): string {
  if (!iso) return "Jamais";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Jamais";
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `il y a ${diffD} j`;
  const diffMo = Math.floor(diffD / 30);
  if (diffMo < 12) return `il y a ${diffMo} mois`;
  const diffY = Math.floor(diffMo / 12);
  return `il y a ${diffY} an${diffY > 1 ? "s" : ""}`;
}

function shortDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Main component ──────────────────────────────────────────────

export function UserManagement({
  plan = "pro",
  currentUserId,
  currentUserEmail,
  currentUserName,
}: UserManagementProps) {
  const cfg = PLAN_CONFIG[plan];

  const [users, setUsers] = useState<TeamUser[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "success" | "error"; msg: string } | null>(null);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const showToast = useCallback((kind: "success" | "error", msg: string) => {
    setToast({ kind, msg });
    window.setTimeout(() => setToast(null), 4000);
  }, []);

  // ─── Load team + pending invitations ─────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, invRes] = await Promise.all([
        fetch("/api/console/settings/users", { credentials: "same-origin" }),
        fetch("/api/console/settings/users/invitations", { credentials: "same-origin" }),
      ]);

      if (!usersRes.ok) {
        const d = await usersRes.json().catch(() => ({}));
        // 401 → session expired / not authenticated. Surface a friendly
        // message instead of a raw HTTP code; the user can re-sign-in.
        if (usersRes.status === 401) {
          throw new Error("Session expirée. Veuillez vous reconnecter.");
        }
        throw new Error(d.error || `Échec de chargement (HTTP ${usersRes.status})`);
      }
      const ud = await usersRes.json();
      const rawUsers: TeamUser[] = Array.isArray(ud.users) ? ud.users : [];
      const usersWithSelf: TeamUser[] = rawUsers.map((u) => ({
        ...u,
        isSelf: currentUserId ? u.id === currentUserId : (currentUserEmail ? u.email === currentUserEmail : false),
      }));
      setUsers(usersWithSelf);

      // Invitations — may 404 if endpoint missing; treat as empty
      let pending: PendingInvite[] = [];
      if (invRes.ok) {
        const id = await invRes.json();
        pending = Array.isArray(id.invitations) ? id.invitations : [];
      }
      setInvites(pending);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec du chargement");
    } finally {
      setLoading(false);
    }
  }, [currentUserId, currentUserEmail]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!openMenuId) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuId]);

  // ─── Derived state ───────────────────────────────────────────
  const activeUserCount = useMemo(
    () => users.filter((u) => u.status !== "suspended").length,
    [users],
  );
  const totalSeats = activeUserCount + invites.length;
  const atLimit = cfg.maxUsers !== null && totalSeats >= cfg.maxUsers;
  const reachedHardLimit = cfg.maxUsers !== null && activeUserCount >= cfg.maxUsers;

  // ─── Actions ─────────────────────────────────────────────────
  const handleRoleChange = async (userId: string, newRole: Role) => {
    setOpenMenuId(null);
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    if (target.isSelf) {
      showToast("error", "Vous ne pouvez pas modifier votre propre rôle.");
      return;
    }
    // Optimistic update
    const prev = users;
    setUsers((cur) => cur.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    try {
      const res = await fetch("/api/console/settings/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
        credentials: "same-origin",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `HTTP ${res.status}`);
      }
      showToast("success", `Rôle mis à jour pour ${target.email}.`);
    } catch (e) {
      setUsers(prev);
      showToast("error", e instanceof Error ? e.message : "Échec de la mise à jour du rôle.");
    }
  };

  const handleToggleStatus = async (userId: string) => {
    setOpenMenuId(null);
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    if (target.isSelf) {
      showToast("error", "Vous ne pouvez pas suspendre votre propre compte.");
      return;
    }
    const newStatus = target.status === "suspended" ? "active" : "suspended";
    const prev = users;
    setUsers((cur) => cur.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
    try {
      const res = await fetch("/api/console/settings/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus }),
        credentials: "same-origin",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `HTTP ${res.status}`);
      }
      showToast("success", newStatus === "suspended"
        ? `${target.email} suspendu.`
        : `${target.email} réactivé.`);
    } catch (e) {
      setUsers(prev);
      showToast("error", e instanceof Error ? e.message : "Échec de la mise à jour du statut.");
    }
  };

  const handleDelete = async (userId: string) => {
    setOpenMenuId(null);
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    if (target.isSelf) {
      showToast("error", "Vous ne pouvez pas supprimer votre propre compte.");
      return;
    }
    if (!window.confirm(`Supprimer définitivement ${target.email} ? Cette action est irréversible.`)) {
      return;
    }
    const prev = users;
    setUsers((cur) => cur.filter((u) => u.id !== userId));
    try {
      const res = await fetch("/api/console/settings/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
        credentials: "same-origin",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `HTTP ${res.status}`);
      }
      showToast("success", `${target.email} supprimé.`);
    } catch (e) {
      setUsers(prev);
      showToast("error", e instanceof Error ? e.message : "Échec de la suppression.");
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    try {
      const res = await fetch("/api/console/settings/users/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId: inviteId, action: "resend" }),
        credentials: "same-origin",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `HTTP ${res.status}`);
      }
      showToast("success", "Invitation renvoyée.");
    } catch (e) {
      showToast("error", e instanceof Error ? e.message : "Échec du renvoi.");
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    if (!window.confirm("Annuler cette invitation ?")) return;
    const prev = invites;
    setInvites((cur) => cur.filter((i) => i.id !== inviteId));
    try {
      const res = await fetch("/api/console/settings/users/invitations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId: inviteId }),
        credentials: "same-origin",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `HTTP ${res.status}`);
      }
      showToast("success", "Invitation annulée.");
    } catch (e) {
      setInvites(prev);
      showToast("error", e instanceof Error ? e.message : "Échec de l'annulation.");
    }
  };

  const handleInviteSuccess = (email: string) => {
    setInviteOpen(false);
    showToast("success", `Invitation envoyée à ${email}`);
    loadAll();
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: COLOR.bg,
      fontFamily: FONT_SANS,
      color: COLOR.text,
      display: "flex",
      flexDirection: "column",
    }}>
      <main style={{ flex: 1, padding: "32px", maxWidth: 1200, width: "100%", margin: "0 auto" }}>
        {/* Header section */}
        <section style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 24,
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
              <h1 style={{
                fontSize: 24,
                fontWeight: 700,
                color: COLOR.text,
                letterSpacing: "-0.02em",
                margin: 0,
                lineHeight: 1.2,
              }}>
                Gestion des utilisateurs
              </h1>
              <PlanBadge plan={plan} count={activeUserCount} max={cfg.maxUsers} />
            </div>
            <p style={{
              fontSize: 14,
              color: COLOR.textMuted,
              margin: 0,
              lineHeight: 1.5,
            }}>
              Invitez, gérez et assignez des rôles
            </p>
          </div>

          <button
            onClick={() => setInviteOpen(true)}
            disabled={reachedHardLimit}
            style={{
              background: reachedHardLimit ? COLOR.zirconStrong : COLOR.charcoal,
              color: reachedHardLimit ? COLOR.textFaint : "#FFFFFF",
              border: "none",
              borderRadius: 10,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 500,
              cursor: reachedHardLimit ? "not-allowed" : "pointer",
              fontFamily: FONT_SANS,
              transition: "background 0.15s ease, transform 0.05s ease",
              boxShadow: reachedHardLimit ? "none" : "0 1px 2px rgba(0,0,0,0.06)",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              if (!reachedHardLimit) e.currentTarget.style.background = "#1F1F1F";
            }}
            onMouseLeave={(e) => {
              if (!reachedHardLimit) e.currentTarget.style.background = COLOR.charcoal;
            }}
          >
            Inviter un utilisateur +
          </button>
        </section>

        {/* Toast */}
        {toast && (
          <div
            role="status"
            aria-live="polite"
            style={{
              position: "fixed",
              top: 24,
              right: 24,
              zIndex: 100,
              background: toast.kind === "success" ? COLOR.bg : COLOR.redBg,
              border: `1px solid ${toast.kind === "success" ? COLOR.borderStrong : COLOR.redBorder}`,
              color: toast.kind === "success" ? COLOR.text : COLOR.red,
              padding: "12px 16px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 500,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              maxWidth: 380,
            }}
          >
            {toast.kind === "success" ? "✓ " : "✕ "}{toast.msg}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div style={{
            background: COLOR.redBg,
            border: `1px solid ${COLOR.redBorder}`,
            color: COLOR.red,
            padding: "12px 16px",
            borderRadius: 10,
            fontSize: 13,
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}>
            <span>✕ {error}</span>
            <button
              onClick={loadAll}
              style={{
                background: "transparent",
                border: `1px solid ${COLOR.redBorder}`,
                color: COLOR.red,
                borderRadius: 6,
                padding: "4px 10px",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: FONT_SANS,
              }}
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Plan limit upsell banner */}
        {reachedHardLimit && cfg.upsellLabel && (
          <div style={{
            background: COLOR.amberBg,
            border: `1px solid ${COLOR.amberBorder}`,
            borderRadius: 10,
            padding: "14px 16px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}>
            <div style={{
              fontSize: 13,
              color: COLOR.amber,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <span aria-hidden>⚠</span>
              <span>Limite atteinte. {cfg.upsellLabel}</span>
            </div>
            <a
              href="/atelier/pricing"
              style={{
                color: COLOR.amber,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Voir les plans <span aria-hidden>→</span>
            </a>
          </div>
        )}

        {/* Loading state */}
        {loading && <UsersTableSkeleton />}

        {/* Users table / cards */}
        {!loading && (
          <section
            style={{
              background: COLOR.bg,
              border: `1px solid ${COLOR.border}`,
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            }}
            aria-label="Liste des utilisateurs"
          >
            {/* Desktop table */}
            <div className="um-desktop-table">
              <UsersTableHeader />
              <div style={{ maxHeight: 520, overflowY: "auto" }}>
                {users.length === 0 ? (
                  <EmptyState message="Aucun utilisateur. Invitez votre premier collaborateur." />
                ) : (
                  users.map((u, idx) => (
                    <UserRow
                      key={u.id}
                      user={u}
                      isLast={idx === users.length - 1}
                      menuOpen={openMenuId === u.id}
                      onMenuToggle={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                      onRoleChange={(r) => handleRoleChange(u.id, r)}
                      onToggleStatus={() => handleToggleStatus(u.id)}
                      onDelete={() => handleDelete(u.id)}
                      planSupportsRoles={cfg.supportsRoles}
                      menuRef={menuRef}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Mobile cards */}
            <div className="um-mobile-cards">
              {users.length === 0 ? (
                <EmptyState message="Aucun utilisateur. Invitez votre premier collaborateur." />
              ) : (
                <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  {users.map((u) => (
                    <UserCard
                      key={u.id}
                      user={u}
                      menuOpen={openMenuId === u.id}
                      onMenuToggle={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                      onRoleChange={(r) => handleRoleChange(u.id, r)}
                      onToggleStatus={() => handleToggleStatus(u.id)}
                      onDelete={() => handleDelete(u.id)}
                      planSupportsRoles={cfg.supportsRoles}
                      menuRef={menuRef}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Pending invitations */}
        {!loading && (
          <section
            style={{
              marginTop: 24,
              background: COLOR.bg,
              border: `1px solid ${COLOR.border}`,
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            }}
            aria-label="Invitations en attente"
          >
            <div style={{
              padding: "18px 20px",
              borderBottom: invites.length > 0 ? `1px solid ${COLOR.border}` : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}>
              <h2 style={{
                fontSize: 16,
                fontWeight: 700,
                color: COLOR.text,
                margin: 0,
                letterSpacing: "-0.01em",
              }}>
                Invitations en attente
              </h2>
              {invites.length > 0 && (
                <span style={{
                  fontSize: 12,
                  fontFamily: FONT_MONO,
                  color: COLOR.textMuted,
                  background: COLOR.zircon,
                  padding: "2px 8px",
                  borderRadius: 4,
                }}>
                  {invites.length}
                </span>
              )}
            </div>
            {invites.length === 0 ? (
              <div style={{
                padding: "32px 20px",
                textAlign: "center",
                fontSize: 13,
                color: COLOR.textMuted,
              }}>
                Aucune invitation en attente.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {invites.map((inv, idx) => (
                  <InviteRow
                    key={inv.id}
                    invite={inv}
                    isLast={idx === invites.length - 1}
                    onResend={() => handleResendInvite(inv.id)}
                    onCancel={() => handleCancelInvite(inv.id)}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Invite modal */}
      {inviteOpen && (
        <InviteModal
          onClose={() => setInviteOpen(false)}
          onSuccess={handleInviteSuccess}
          plan={plan}
          atLimit={reachedHardLimit}
        />
      )}

      {/* Responsive CSS — table on desktop, cards on mobile */}
      <style>{`
        .um-desktop-table { display: block; }
        .um-mobile-cards { display: none; }
        @media (max-width: 768px) {
          .um-desktop-table { display: none; }
          .um-mobile-cards { display: block; }
        }
        /* Custom scrollbar */
        .um-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .um-scroll::-webkit-scrollbar-thumb { background: ${COLOR.zirconStrong}; border-radius: 3px; }
        .um-scroll::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}

// ─── Plan badge ──────────────────────────────────────────────────

function PlanBadge({ plan, count, max }: { plan: Plan; count: number; max: number | null }) {
  const cfg = PLAN_CONFIG[plan];
  const label = max === null
    ? `${cfg.label} · ${count} utilisateur${count > 1 ? "s" : ""}`
    : `${cfg.label} · ${count}/${max} utilisateurs`;
  return (
    <span style={{
      fontSize: 12,
      fontFamily: FONT_MONO,
      color: COLOR.sage,
      background: COLOR.sageBg,
      padding: "3px 10px",
      borderRadius: 6,
      fontWeight: 500,
      letterSpacing: "0.01em",
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

// ─── Users table (desktop) ───────────────────────────────────────

function UsersTableHeader() {
  const headerStyle: React.CSSProperties = {
    background: COLOR.bgSubtle,
    fontSize: 12,
    textTransform: "uppercase",
    color: COLOR.textMuted,
    fontWeight: 600,
    letterSpacing: "0.05em",
    padding: "12px 16px",
    borderBottom: `1px solid ${COLOR.border}`,
  };
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(180px, 1.6fr) minmax(160px, 1.4fr) 110px 120px 130px 56px",
        gap: 0,
      }}
      role="row"
    >
      <div style={headerStyle} role="columnheader">Utilisateur</div>
      <div style={headerStyle} role="columnheader">Email</div>
      <div style={headerStyle} role="columnheader">Rôle</div>
      <div style={headerStyle} role="columnheader">Statut</div>
      <div style={headerStyle} role="columnheader">Dernière connexion</div>
      <div style={{ ...headerStyle, textAlign: "right" }} role="columnheader">Actions</div>
    </div>
  );
}

function UserRow({
  user,
  isLast,
  menuOpen,
  onMenuToggle,
  onRoleChange,
  onToggleStatus,
  onDelete,
  planSupportsRoles,
  menuRef,
}: {
  user: TeamUser;
  isLast: boolean;
  menuOpen: boolean;
  onMenuToggle: () => void;
  onRoleChange: (role: Role) => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  planSupportsRoles: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
}) {
  const normRole = normalizeRole(user.role);
  const isSuspended = user.status === "suspended";

  return (
    <div
      role="row"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(180px, 1.6fr) minmax(160px, 1.4fr) 110px 120px 130px 56px",
        gap: 0,
        padding: "14px 16px",
        borderBottom: isLast ? "none" : `1px solid ${COLOR.border}`,
        alignItems: "center",
        transition: "background 0.12s ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = COLOR.bgHover; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      {/* User cell */}
      <div role="cell" style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <Avatar name={user.name} email={user.email} />
        <div style={{ minWidth: 0, overflow: "hidden" }}>
          <div style={{
            fontSize: 14,
            color: COLOR.text,
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            {user.name || user.email.split("@")[0]}
            {user.isSelf && (
              <span style={{
                fontSize: 10,
                fontFamily: FONT_MONO,
                color: COLOR.sage,
                background: COLOR.sageBg,
                padding: "1px 6px",
                borderRadius: 3,
                fontWeight: 500,
                flexShrink: 0,
              }}>
                VOUS
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Email */}
      <div role="cell" style={{
        fontSize: 13,
        fontFamily: FONT_MONO,
        color: COLOR.textMuted,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        paddingRight: 12,
      }}>
        {user.email}
      </div>

      {/* Role */}
      <div role="cell">
        <RoleBadge role={normRole} />
      </div>

      {/* Status */}
      <div role="cell">
        <StatusBadge suspended={isSuspended} />
      </div>

      {/* Last login */}
      <div role="cell" style={{
        fontSize: 12,
        fontFamily: FONT_MONO,
        color: COLOR.textMuted,
      }}>
        {relativeTime(user.lastLoginAt)}
      </div>

      {/* Actions */}
      <div role="cell" style={{ position: "relative", textAlign: "right" }}>
        <button
          onClick={onMenuToggle}
          aria-label="Actions"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "6px 8px",
            borderRadius: 6,
            color: COLOR.textMuted,
            fontSize: 18,
            lineHeight: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.12s ease, color 0.12s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = COLOR.zircon; e.currentTarget.style.color = COLOR.text; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = COLOR.textMuted; }}
        >
          ⋮
        </button>
        {menuOpen && (
          <ActionMenu
            menuRef={menuRef}
            user={user}
            normRole={normRole}
            isSuspended={isSuspended}
            planSupportsRoles={planSupportsRoles}
            onRoleChange={onRoleChange}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
            onClose={() => onMenuToggle()}
          />
        )}
      </div>
    </div>
  );
}

// ─── User card (mobile) ──────────────────────────────────────────

function UserCard({
  user,
  menuOpen,
  onMenuToggle,
  onRoleChange,
  onToggleStatus,
  onDelete,
  planSupportsRoles,
  menuRef,
}: {
  user: TeamUser;
  menuOpen: boolean;
  onMenuToggle: () => void;
  onRoleChange: (role: Role) => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  planSupportsRoles: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
}) {
  const normRole = normalizeRole(user.role);
  const isSuspended = user.status === "suspended";

  return (
    <div
      style={{
        background: COLOR.bg,
        border: `1px solid ${COLOR.border}`,
        borderRadius: 10,
        padding: 14,
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <Avatar name={user.name} email={user.email} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14,
            color: COLOR.text,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 2,
          }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.name || user.email.split("@")[0]}
            </span>
            {user.isSelf && (
              <span style={{
                fontSize: 10,
                fontFamily: FONT_MONO,
                color: COLOR.sage,
                background: COLOR.sageBg,
                padding: "1px 6px",
                borderRadius: 3,
                fontWeight: 500,
                flexShrink: 0,
              }}>
                VOUS
              </span>
            )}
          </div>
          <div style={{
            fontSize: 12,
            fontFamily: FONT_MONO,
            color: COLOR.textMuted,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {user.email}
          </div>
        </div>
        <button
          onClick={onMenuToggle}
          aria-label="Actions"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "4px 6px",
            borderRadius: 6,
            color: COLOR.textMuted,
            fontSize: 18,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ⋮
        </button>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <RoleBadge role={normRole} />
        <StatusBadge suspended={isSuspended} />
        <span style={{
          fontSize: 11,
          fontFamily: FONT_MONO,
          color: COLOR.textMuted,
          marginLeft: "auto",
        }}>
          {relativeTime(user.lastLoginAt)}
        </span>
      </div>
      {menuOpen && (
        <ActionMenu
          menuRef={menuRef}
          user={user}
          normRole={normRole}
          isSuspended={isSuspended}
          planSupportsRoles={planSupportsRoles}
          onRoleChange={onRoleChange}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          onClose={() => onMenuToggle()}
          mobile
        />
      )}
    </div>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────

function Avatar({ name, email }: { name: string | null; email: string }) {
  return (
    <div
      aria-hidden
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: COLOR.sageBg,
        color: COLOR.sage,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 600,
        fontFamily: FONT_SANS,
        flexShrink: 0,
        letterSpacing: "0.02em",
      }}
    >
      {getInitials(name, email)}
    </div>
  );
}

// ─── Role badge ──────────────────────────────────────────────────

function RoleBadge({ role }: { role: Role }) {
  const styles: Record<Role, React.CSSProperties> = {
    admin: {
      background: COLOR.charcoal,
      color: "#FFFFFF",
    },
    member: {
      background: COLOR.sageBg,
      color: COLOR.sage,
    },
    viewer: {
      background: COLOR.zircon,
      color: COLOR.textMuted,
    },
  };
  return (
    <span style={{
      ...styles[role],
      fontSize: 11,
      fontFamily: FONT_MONO,
      padding: "2px 8px",
      borderRadius: 4,
      fontWeight: 500,
      letterSpacing: "0.02em",
      display: "inline-block",
      textTransform: "lowercase",
    }}>
      {ROLE_LABELS[role] || role}
    </span>
  );
}

// ─── Status badge ────────────────────────────────────────────────

function StatusBadge({ suspended }: { suspended: boolean }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 12,
      color: suspended ? COLOR.red : COLOR.sage,
      fontWeight: 500,
    }}>
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: suspended ? COLOR.red : COLOR.green,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {suspended ? "Suspendu" : "Actif"}
    </span>
  );
}

// ─── Action dropdown menu ────────────────────────────────────────

function ActionMenu({
  menuRef,
  user,
  normRole,
  isSuspended,
  planSupportsRoles,
  onRoleChange,
  onToggleStatus,
  onDelete,
  onClose,
  mobile,
}: {
  menuRef: React.RefObject<HTMLDivElement | null>;
  user: TeamUser;
  normRole: Role;
  isSuspended: boolean;
  planSupportsRoles: boolean;
  onRoleChange: (role: Role) => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onClose: () => void;
  mobile?: boolean;
}) {
  const containerStyle: React.CSSProperties = mobile
    ? {
        position: "relative",
        marginTop: 10,
        background: COLOR.bg,
        border: `1px solid ${COLOR.border}`,
        borderRadius: 10,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        overflow: "hidden",
        padding: 4,
      }
    : {
        position: "absolute",
        top: "100%",
        right: 0,
        marginTop: 4,
        background: COLOR.bg,
        border: `1px solid ${COLOR.border}`,
        borderRadius: 10,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        minWidth: 200,
        zIndex: 50,
        overflow: "hidden",
        padding: 4,
      };

  return (
    <div
      ref={menuRef}
      role="menu"
      style={containerStyle}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Role sub-menu (Pro+ only) */}
      {planSupportsRoles && !user.isSelf && (
        <>
          <div style={{
            padding: "8px 10px 4px",
            fontSize: 10,
            textTransform: "uppercase",
            color: COLOR.textMuted,
            fontWeight: 600,
            letterSpacing: "0.05em",
            fontFamily: FONT_MONO,
          }}>
            Modifier le rôle
          </div>
          {(["admin", "member", "viewer"] as Role[]).map((r) => (
            <button
              key={r}
              role="menuitem"
              onClick={() => onRoleChange(r)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "8px 10px",
                background: "transparent",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
                color: COLOR.text,
                fontFamily: FONT_SANS,
                textAlign: "left",
                transition: "background 0.1s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = COLOR.bgSubtle; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <span>{ROLE_LABELS[r]}</span>
              {normRole === r && <span style={{ color: COLOR.sage, fontSize: 14 }}>✓</span>}
            </button>
          ))}
          <div style={{ height: 1, background: COLOR.border, margin: "4px 0" }} />
        </>
      )}

      {/* Suspend / Reactivate */}
      <button
        role="menuitem"
        onClick={onToggleStatus}
        disabled={user.isSelf}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "8px 10px",
          background: "transparent",
          border: "none",
          borderRadius: 6,
          cursor: user.isSelf ? "not-allowed" : "pointer",
          fontSize: 13,
          color: user.isSelf ? COLOR.textFaint : COLOR.text,
          fontFamily: FONT_SANS,
          textAlign: "left",
          opacity: user.isSelf ? 0.5 : 1,
          transition: "background 0.1s ease",
        }}
        onMouseEnter={(e) => { if (!user.isSelf) e.currentTarget.style.background = COLOR.bgSubtle; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      >
        <span aria-hidden>{isSuspended ? "▶" : "❚❚"}</span>
        <span>{isSuspended ? "Réactiver" : "Suspendre"}</span>
      </button>

      {/* Delete */}
      <button
        role="menuitem"
        onClick={onDelete}
        disabled={user.isSelf}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "8px 10px",
          background: "transparent",
          border: "none",
          borderRadius: 6,
          cursor: user.isSelf ? "not-allowed" : "pointer",
          fontSize: 13,
          color: user.isSelf ? COLOR.textFaint : COLOR.red,
          fontFamily: FONT_SANS,
          textAlign: "left",
          opacity: user.isSelf ? 0.5 : 1,
          transition: "background 0.1s ease",
        }}
        onMouseEnter={(e) => { if (!user.isSelf) e.currentTarget.style.background = COLOR.redBg; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      >
        <span aria-hidden>🗑</span>
        <span>Supprimer</span>
      </button>

      {mobile && (
        <button
          onClick={onClose}
          style={{
            display: "block",
            width: "100%",
            padding: "8px 10px",
            background: "transparent",
            border: "none",
            borderTop: `1px solid ${COLOR.border}`,
            marginTop: 4,
            cursor: "pointer",
            fontSize: 12,
            color: COLOR.textMuted,
            fontFamily: FONT_SANS,
          }}
        >
          Fermer
        </button>
      )}
    </div>
  );
}

// ─── Pending invitation row ──────────────────────────────────────

function InviteRow({
  invite,
  isLast,
  onResend,
  onCancel,
}: {
  invite: PendingInvite;
  isLast: boolean;
  onResend: () => void;
  onCancel: () => void;
}) {
  const isExpired = new Date(invite.expiresAt).getTime() < Date.now();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "14px 20px",
        borderBottom: isLast ? "none" : `1px solid ${COLOR.border}`,
        flexWrap: "wrap",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = COLOR.bgSubtle; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontSize: 13,
          color: COLOR.text,
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 2,
        }}>
          <span style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontFamily: FONT_MONO,
          }}>
            {invite.email}
          </span>
          {isExpired && (
            <span style={{
              fontSize: 10,
              fontFamily: FONT_MONO,
              color: COLOR.amber,
              background: COLOR.amberBg,
              border: `1px solid ${COLOR.amberBorder}`,
              padding: "1px 6px",
              borderRadius: 3,
              fontWeight: 500,
              flexShrink: 0,
            }}>
              EXPIRÉE
            </span>
          )}
        </div>
        <div style={{
          fontSize: 11,
          color: COLOR.textMuted,
          fontFamily: FONT_MONO,
        }}>
          Envoyée le {shortDate(invite.createdAt)} · Rôle : {ROLE_LABELS[invite.role] || invite.role}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button
          onClick={onResend}
          style={{
            background: "transparent",
            border: `1px solid ${COLOR.borderStrong}`,
            color: COLOR.text,
            borderRadius: 6,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: FONT_SANS,
            transition: "background 0.12s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = COLOR.bgSubtle; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          Renvoyer
        </button>
        <button
          onClick={onCancel}
          style={{
            background: "transparent",
            border: `1px solid ${COLOR.redBorder}`,
            color: COLOR.red,
            borderRadius: 6,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: FONT_SANS,
            transition: "background 0.12s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = COLOR.redBg; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{
      padding: "48px 20px",
      textAlign: "center",
      color: COLOR.textMuted,
      fontSize: 13,
    }}>
      <div style={{ marginBottom: 8, fontSize: 24 }} aria-hidden>👥</div>
      {message}
    </div>
  );
}

// ─── Loading skeleton ────────────────────────────────────────────

function UsersTableSkeleton() {
  return (
    <section style={{
      background: COLOR.bg,
      border: `1px solid ${COLOR.border}`,
      borderRadius: 12,
      overflow: "hidden",
    }}>
      <UsersTableHeader />
      <div style={{ padding: 0 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(180px, 1.6fr) minmax(160px, 1.4fr) 110px 120px 130px 56px",
              padding: "14px 16px",
              borderBottom: i === 4 ? "none" : `1px solid ${COLOR.border}`,
              gap: 0,
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Skeleton circle width={32} height={32} />
              <Skeleton width={120} height={14} />
            </div>
            <Skeleton width={160} height={13} />
            <Skeleton width={60} height={18} rounded={4} />
            <Skeleton width={70} height={14} />
            <Skeleton width={90} height={12} />
            <div style={{ textAlign: "right" }}>
              <Skeleton width={20} height={20} rounded={6} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Skeleton({
  width,
  height,
  circle,
  rounded,
}: {
  width?: number | string;
  height?: number | string;
  circle?: boolean;
  rounded?: number;
}) {
  // Allow callers to pass a single `size` (used for square/circle skeletons)
  // by mapping it to width+height via the spread caller convention.
  return (
    <div
      style={{
        width: width ?? "100%",
        height: height ?? 14,
        borderRadius: circle ? "50%" : (rounded ?? 4),
        background: "linear-gradient(90deg, #F4F4F5 0%, #ECECEE 50%, #F4F4F5 100%)",
        backgroundSize: "200% 100%",
        animation: "um-shimmer 1.4s ease-in-out infinite",
      }}
    />
  );
}

// ─── Invite modal ────────────────────────────────────────────────

function InviteModal({
  onClose,
  onSuccess,
  plan,
  atLimit,
}: {
  onClose: () => void;
  onSuccess: (email: string) => void;
  plan: Plan;
  atLimit: boolean;
}) {
  const cfg = PLAN_CONFIG[plan];
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>(cfg.supportsRoles ? "member" : "member");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Lock body scroll while modal open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !name.trim()) {
      setLocalError("L'email et le nom sont obligatoires.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError("Adresse email invalide.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/console/settings/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          role: cfg.supportsRoles ? role : "member",
        }),
        credentials: "same-origin",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `HTTP ${res.status}`);
      }
      onSuccess(email.trim());
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Échec de l'envoi de l'invitation.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,10,10,0.50)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          background: COLOR.bg,
          borderRadius: 16,
          boxShadow: "0 20px 48px rgba(0,0,0,0.18)",
          overflow: "hidden",
          animation: "um-pop 0.18s ease-out",
        }}
      >
        {/* Modal header */}
        <div style={{
          padding: "24px 24px 0",
        }}>
          <h2 id="invite-modal-title" style={{
            fontSize: 18,
            fontWeight: 700,
            color: COLOR.text,
            margin: 0,
            letterSpacing: "-0.01em",
          }}>
            Inviter un utilisateur
          </h2>
          <p style={{
            fontSize: 13,
            color: COLOR.textMuted,
            margin: "6px 0 0",
            lineHeight: 1.5,
          }}>
            {atLimit
              ? "Votre plan a atteint sa limite d'utilisateurs."
              : "La personne recevra un email avec un lien d'activation."}
          </p>
        </div>

        {/* Modal body */}
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          {localError && (
            <div style={{
              background: COLOR.redBg,
              border: `1px solid ${COLOR.redBorder}`,
              color: COLOR.red,
              padding: "10px 12px",
              borderRadius: 8,
              fontSize: 12,
              marginBottom: 16,
            }}>
              ✕ {localError}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="invite-email"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 500,
                color: COLOR.text,
                marginBottom: 6,
              }}
            >
              Email <span style={{ color: COLOR.red }}>*</span>
            </label>
            <input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="marie.dupont@entreprise.ma"
              autoFocus
              style={{
                width: "100%",
                height: 40,
                padding: "0 12px",
                fontSize: 13,
                fontFamily: FONT_MONO,
                color: COLOR.text,
                background: COLOR.bg,
                border: `1px solid ${COLOR.borderStrong}`,
                borderRadius: 8,
                outline: "none",
                transition: "border-color 0.12s ease, box-shadow 0.12s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = COLOR.sage;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${COLOR.sageBg}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = COLOR.borderStrong;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Name */}
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="invite-name"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 500,
                color: COLOR.text,
                marginBottom: 6,
              }}
            >
              Nom <span style={{ color: COLOR.red }}>*</span>
            </label>
            <input
              id="invite-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Marie Dupont"
              style={{
                width: "100%",
                height: 40,
                padding: "0 12px",
                fontSize: 13,
                color: COLOR.text,
                background: COLOR.bg,
                border: `1px solid ${COLOR.borderStrong}`,
                borderRadius: 8,
                outline: "none",
                transition: "border-color 0.12s ease, box-shadow 0.12s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = COLOR.sage;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${COLOR.sageBg}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = COLOR.borderStrong;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Role (Pro+ only) */}
          {cfg.supportsRoles && (
            <div style={{ marginBottom: 24 }}>
              <label
                htmlFor="invite-role"
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 500,
                  color: COLOR.text,
                  marginBottom: 6,
                }}
              >
                Rôle
              </label>
              <div style={{ position: "relative" }}>
                <select
                  id="invite-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  style={{
                    width: "100%",
                    height: 40,
                    padding: "0 32px 0 12px",
                    fontSize: 13,
                    color: COLOR.text,
                    background: COLOR.bg,
                    border: `1px solid ${COLOR.borderStrong}`,
                    borderRadius: 8,
                    outline: "none",
                    cursor: "pointer",
                    appearance: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    fontFamily: FONT_SANS,
                    boxSizing: "border-box",
                  }}
                >
                  <option value="admin">Admin — accès complet</option>
                  <option value="member">Membre — édition</option>
                  <option value="viewer">Lecteur — lecture seule</option>
                </select>
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: COLOR.textMuted,
                    fontSize: 10,
                  }}
                >
                  ▼
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            paddingTop: 4,
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: COLOR.textMuted,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                padding: "10px 16px",
                fontFamily: FONT_SANS,
                borderRadius: 8,
                transition: "color 0.12s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = COLOR.text; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = COLOR.textMuted; }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || atLimit}
              style={{
                background: submitting || atLimit ? COLOR.zirconStrong : COLOR.charcoal,
                color: submitting || atLimit ? COLOR.textFaint : "#FFFFFF",
                border: "none",
                borderRadius: 10,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 500,
                cursor: submitting || atLimit ? "not-allowed" : "pointer",
                fontFamily: FONT_SANS,
                transition: "background 0.12s ease",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
              onMouseEnter={(e) => {
                if (!submitting && !atLimit) e.currentTarget.style.background = "#1F1F1F";
              }}
              onMouseLeave={(e) => {
                if (!submitting && !atLimit) e.currentTarget.style.background = COLOR.charcoal;
              }}
            >
              {submitting && (
                <span
                  aria-hidden
                  style={{
                    width: 12,
                    height: 12,
                    border: "2px solid rgba(255,255,255,0.30)",
                    borderTopColor: "#FFFFFF",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "um-spin 0.7s linear infinite",
                  }}
                />
              )}
              {submitting ? "Envoi…" : "Envoyer l'invitation"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes um-pop {
          0% { opacity: 0; transform: scale(0.96) translateY(8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes um-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes um-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export default UserManagement;
