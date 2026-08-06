// ═══════════════════════════════════════════════════════════════
//  RBAC MATRIX — PROJECT YGGDRASIL (Deep Role-Based Access Control)
//
//  Single source of truth for every role + permission in the
//  HarchIQ platform. The matrix is intentionally exhaustive: legacy
//  roles (legacy_user_v1, legacy_trial, legacy_beta) are preserved
//  so old DB rows keep resolving to a deterministic permission set
//  instead of crashing the auth layer.
//
//  Hierarchy (getRoleLevel):
//    0   viewer         — read-only consumer
//    10  analyst        — read + write on reports/alerts
//    20  manager        — analyst + team escalation
//    30  company-admin  — Dircom/CTO client (self-service team admin)
//    40  agency-admin   — B2B2B partner agency (multi-client)
//    50  admin          — Harch system admin (ops, support)
//   100  super_admin    — Divine — full access, master-code gated
//
//  Legacy roles resolve to level 0 (read-only) so historical rows
//  cannot silently escalate privileges.
// ═══════════════════════════════════════════════════════════════

// ─── ROLES ──────────────────────────────────────────────────────

export const UserRole = {
  SUPER_ADMIN: "super_admin", // Divin — accès total, master code required
  ADMIN: "admin", // Admin système
  AGENCY_ADMIN: "agency-admin", // Partenaire agence (B2B2B)
  COMPANY_ADMIN: "company-admin", // Dircom/CTO client
  MANAGER: "manager", // Manager d'équipe
  ANALYST: "analyst", // Analyste
  VIEWER: "viewer", // Lecture seule
  // Legacy roles (kept for historical integrity — DB may have old rows)
  LEGACY_USER_V1: "legacy_user_v1",
  LEGACY_TRIAL: "legacy_trial",
  LEGACY_BETA: "legacy_beta",
} as const;

export type UserRoleValue = (typeof UserRole)[keyof typeof UserRole];

/** All roles that are still considered "active" (not legacy). */
export const ACTIVE_ROLES: UserRoleValue[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.AGENCY_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.MANAGER,
  UserRole.ANALYST,
  UserRole.VIEWER,
];

/** Legacy roles kept only for backwards compatibility with old DB rows. */
export const LEGACY_ROLES: UserRoleValue[] = [
  UserRole.LEGACY_USER_V1,
  UserRole.LEGACY_TRIAL,
  UserRole.LEGACY_BETA,
];

// ─── PERMISSIONS ────────────────────────────────────────────────

export type Permission =
  | "console:read"
  | "console:write"
  | "console:admin"
  | "agency:read"
  | "agency:write"
  | "agency:admin"
  | "admin:read"
  | "admin:write"
  | "admin:super"
  | "users:read"
  | "users:write"
  | "users:delete"
  | "reports:read"
  | "reports:write"
  | "reports:export"
  | "alerts:read"
  | "alerts:write"
  | "alerts:escalate"
  | "billing:read"
  | "billing:write"
  | "audit:read"
  | "audit:export"
  | "master:code"; // super_admin only — generate / validate master codes

/**
 * Full permission matrix.
 *
 * Each role maps to the exhaustive set of permissions it grants.
 * Inheritance is explicit (no cascade): a higher role lists every
 * permission it needs. This makes audits trivial — grep the matrix
 * to know exactly who can do what.
 */
export const PERMISSIONS: Record<UserRoleValue, Permission[]> = {
  // ─── DIVIN ──────────────────────────────────────────────────
  [UserRole.SUPER_ADMIN]: [
    "console:read",
    "console:write",
    "console:admin",
    "agency:read",
    "agency:write",
    "agency:admin",
    "admin:read",
    "admin:write",
    "admin:super",
    "users:read",
    "users:write",
    "users:delete",
    "reports:read",
    "reports:write",
    "reports:export",
    "alerts:read",
    "alerts:write",
    "alerts:escalate",
    "billing:read",
    "billing:write",
    "audit:read",
    "audit:export",
    "master:code",
  ],

  // ─── ADMIN SYSTÈME ──────────────────────────────────────────
  [UserRole.ADMIN]: [
    "console:read",
    "console:write",
    "console:admin",
    "agency:read",
    "agency:write",
    "admin:read",
    "admin:write",
    "users:read",
    "users:write",
    "reports:read",
    "reports:write",
    "reports:export",
    "alerts:read",
    "alerts:write",
    "alerts:escalate",
    "billing:read",
    "audit:read",
    "audit:export",
  ],

  // ─── AGENCY ADMIN (B2B2B partner) ───────────────────────────
  [UserRole.AGENCY_ADMIN]: [
    "console:read",
    "console:write",
    "agency:read",
    "agency:write",
    "agency:admin",
    "users:read",
    "users:write",
    "reports:read",
    "reports:write",
    "reports:export",
    "alerts:read",
    "alerts:write",
    "billing:read",
    "audit:read",
  ],

  // ─── COMPANY ADMIN (Dircom/CTO client) ──────────────────────
  [UserRole.COMPANY_ADMIN]: [
    "console:read",
    "console:write",
    "users:read",
    "users:write",
    "reports:read",
    "reports:write",
    "reports:export",
    "alerts:read",
    "alerts:write",
    "alerts:escalate",
    "billing:read",
  ],

  // ─── MANAGER ────────────────────────────────────────────────
  [UserRole.MANAGER]: [
    "console:read",
    "console:write",
    "reports:read",
    "reports:write",
    "reports:export",
    "alerts:read",
    "alerts:write",
    "alerts:escalate",
  ],

  // ─── ANALYST ────────────────────────────────────────────────
  [UserRole.ANALYST]: [
    "console:read",
    "console:write",
    "reports:read",
    "reports:write",
    "reports:export",
    "alerts:read",
    "alerts:write",
  ],

  // ─── VIEWER (read-only) ─────────────────────────────────────
  [UserRole.VIEWER]: ["console:read", "reports:read", "alerts:read"],

  // ─── LEGACY (read-only, no escalation) ──────────────────────
  [UserRole.LEGACY_USER_V1]: ["console:read", "reports:read"],
  [UserRole.LEGACY_TRIAL]: ["console:read", "reports:read"],
  [UserRole.LEGACY_BETA]: ["console:read", "reports:read", "alerts:read"],
};

// ─── ROLE LEVELS ────────────────────────────────────────────────

const ROLE_LEVELS: Record<UserRoleValue, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.ADMIN]: 50,
  [UserRole.AGENCY_ADMIN]: 40,
  [UserRole.COMPANY_ADMIN]: 30,
  [UserRole.MANAGER]: 20,
  [UserRole.ANALYST]: 10,
  [UserRole.VIEWER]: 0,
  [UserRole.LEGACY_USER_V1]: 0,
  [UserRole.LEGACY_TRIAL]: 0,
  [UserRole.LEGACY_BETA]: 0,
};

// ─── HELPERS ────────────────────────────────────────────────────

/**
 * Normalise any unknown string into a known UserRoleValue.
 * Unknown values fall back to VIEWER (least privilege) so a
 * corrupted or migrated DB row cannot accidentally grant admin.
 */
export function normalizeRole(raw: string | undefined | null): UserRoleValue {
  if (!raw) return UserRole.VIEWER;
  const allRoles = [...ACTIVE_ROLES, ...LEGACY_ROLES] as string[];
  if (allRoles.includes(raw)) {
    return raw as UserRoleValue;
  }
  return UserRole.VIEWER;
}

/**
 * Does the given role grant the given permission?
 *
 * Unknown roles (string not in the matrix) resolve to VIEWER,
 * which grants the smallest read-only subset. This is the
 * fail-closed behaviour mandated by the zero-trust policy.
 */
export function hasPermission(
  role: string | undefined | null,
  permission: Permission,
): boolean {
  const normalized = normalizeRole(role);
  return PERMISSIONS[normalized].includes(permission);
}

/**
 * Does the given role grant ANY of the listed permissions?
 * Useful for route guards: `hasAnyPermission(role, ['admin:write', 'admin:super'])`.
 */
export function hasAnyPermission(
  role: string | undefined | null,
  permissions: Permission[],
): boolean {
  const normalized = normalizeRole(role);
  const granted = PERMISSIONS[normalized];
  return permissions.some((p) => granted.includes(p));
}

/**
 * Numeric hierarchy level (0=viewer, 100=super_admin).
 * Used for "is X senior enough to manage Y" checks.
 */
export function getRoleLevel(role: string | undefined | null): number {
  const normalized = normalizeRole(role);
  return ROLE_LEVELS[normalized];
}

/**
 * Can a user with `targetRole` access a resource gated by `requiredRole`?
 *
 * Returns true iff the target role's level is >= the required role's
 * level. E.g. an admin (50) can access a resource gated by
 * company-admin (30), but a company-admin (30) cannot access an
 * admin-only (50) resource.
 *
 * Note: super_admin (100) is always >= everything.
 */
export function canRoleAccess(
  targetRole: string | undefined | null,
  requiredRole: string | undefined | null,
): boolean {
  return getRoleLevel(targetRole) >= getRoleLevel(requiredRole);
}

/**
 * Is this role a legacy role? Useful for surfacing a warning in the
 * admin UI when an old DB row is encountered.
 */
export function isLegacyRole(role: string | undefined | null): boolean {
  return LEGACY_ROLES.includes(normalizeRole(role) as UserRoleValue);
}

/**
 * Human-readable label for a role (FR, since the product UI is FR-first).
 */
export function roleLabel(role: string | undefined | null): string {
  const normalized = normalizeRole(role);
  const labels: Record<UserRoleValue, string> = {
    [UserRole.SUPER_ADMIN]: "Super Admin",
    [UserRole.ADMIN]: "Administrateur",
    [UserRole.AGENCY_ADMIN]: "Admin Agence",
    [UserRole.COMPANY_ADMIN]: "Admin Entreprise",
    [UserRole.MANAGER]: "Manager",
    [UserRole.ANALYST]: "Analyste",
    [UserRole.VIEWER]: "Lecture seule",
    [UserRole.LEGACY_USER_V1]: "Utilisateur (legacy)",
    [UserRole.LEGACY_TRIAL]: "Trial (legacy)",
    [UserRole.LEGACY_BETA]: "Beta (legacy)",
  };
  return labels[normalized];
}
