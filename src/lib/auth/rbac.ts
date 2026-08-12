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

// ═══════════════════════════════════════════════════════════════════
//  ACCOUNT TYPE RBAC — P0-2 FIX (KAEL — Protocole Leverage Maximal)
//
//  Bouclier hermétique pour les 4 plans Harch Atelier.
//  Compatibilité ancien/nouveau système pendant la migration.
//
//  Mappage legacy → nouveau:
//    brand-monitor      → essential   (petite équipe, veille marque)
//    market-competitor  → pro         (équipe régionale, benchmark)
//    investment-bank    → enterprise  (marque leader, gouvernance)
//    harch-alpha        → agency      (multi-clients, white-label)
//
//  Les routes qui vérifient l'accountType doivent utiliser
//  isAccountTypeAllowed() au lieu d'un check manuel de tableau.
//  Cela garantit que les utilisateurs anciens ET nouveaux sont
//  correctement habilités pendant la transition.
// ═══════════════════════════════════════════════════════════════════

export const NEW_ACCOUNT_TYPES = ["essential", "pro", "enterprise", "agency"] as const;
export type NewAccountType = (typeof NEW_ACCOUNT_TYPES)[number];

export const LEGACY_ACCOUNT_TYPES = [
  "brand-monitor",
  "market-competitor",
  "investment-bank",
  "harch-alpha",
] as const;
export type LegacyAccountType = (typeof LEGACY_ACCOUNT_TYPES)[number];

export type AnyAccountType = NewAccountType | LegacyAccountType;

/** Map any accountType (legacy or new) to the new canonical type. */
const LEGACY_TO_NEW: Record<LegacyAccountType, NewAccountType> = {
  "brand-monitor": "essential",
  "market-competitor": "pro",
  "investment-bank": "enterprise",
  "harch-alpha": "agency",
};

/** Normalize any accountType string to the new canonical system. */
export function normalizeAccountType(
  accountType: string | undefined | null,
): NewAccountType | null {
  if (!accountType) return null;
  if ((NEW_ACCOUNT_TYPES as readonly string[]).includes(accountType)) {
    return accountType as NewAccountType;
  }
  if ((LEGACY_ACCOUNT_TYPES as readonly string[]).includes(accountType)) {
    return LEGACY_TO_NEW[accountType as LegacyAccountType];
  }
  return null;
}

/**
 * Check if a session's accountType is allowed, with legacy compatibility.
 *
 * Usage in API routes:
 *   const session = await getServerSession(authOptions);
 *   if (!isAccountTypeAllowed(session, ["essential", "pro"])) {
 *     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
 *   }
 *
 * Accepts BOTH new types ("essential") and legacy types ("brand-monitor")
 * in the allowedTypes array — both resolve to the same canonical type
 * before comparison. This means:
 *   isAccountTypeAllowed(session, ["essential"])
 * passes for users with accountType "essential" OR "brand-monitor".
 *
 * Admins bypass the check entirely (full access).
 */
export function isAccountTypeAllowed(
  session: { user?: { accountType?: string | null; role?: string | null } } | null,
  allowedTypes: Array<NewAccountType | LegacyAccountType>,
): boolean {
  if (!session?.user) return false;

  // Admins always pass (full access to all account-type-gated routes)
  if (session.user.role === "admin" || session.user.role === "super_admin") {
    return true;
  }

  const userNormalized = normalizeAccountType(session.user.accountType);
  if (!userNormalized) return false;

  // Normalize each allowed type and check membership
  const allowedNormalized = new Set<NewAccountType>(
    allowedTypes.map((t) => normalizeAccountType(t) ?? (t as NewAccountType)),
  );

  return allowedNormalized.has(userNormalized);
}

// ─── COMMERCIAL ROLE (Bat Cave — BATCAVE-2) ──────────────────────
// Sales reps who can create clients + manage invitations but CANNOT
// see full financials or delete accounts. Level 35 (above manager,
// below company-admin). Can access /atelier/admin but with restricted
// tabs (Requests + Clients + Invitations + Provisioning only).
export const COMMERCIAL_PERMISSIONS = {
  viewRequests: true,
  annotateRequests: true,
  createClients: true,
  manageInvitations: true,
  viewEmployeeFiches: true,
  viewKPIs: true, // own KPIs only
  viewFinancials: false, // boss/admin only
  deleteAccounts: false,
  manageCommercials: false, // boss/admin only
  viewAuditLogs: false,
} as const;

export function isCommercial(role: string | null | undefined): boolean {
  return role === "commercial";
}

export function canAccessAdmin(role: string | null | undefined): boolean {
  return role === "admin" || role === "super_admin" || role === "commercial";
}

export function getAdminPermissions(role: string | null | undefined) {
  if (role === "super_admin" || role === "admin") {
    return {
      viewRequests: true,
      annotateRequests: true,
      createClients: true,
      manageInvitations: true,
      viewEmployeeFiches: true,
      viewKPIs: true,
      viewFinancials: true,
      deleteAccounts: true,
      manageCommercials: true,
      viewAuditLogs: true,
    };
  }
  if (role === "commercial") {
    return COMMERCIAL_PERMISSIONS;
  }
  return null; // no admin access
}
