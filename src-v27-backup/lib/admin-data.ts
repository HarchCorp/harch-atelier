/**
 * Harch Atelier — Admin operations dataset (V15.0 admin role)
 *
 * Deterministic, strictly-typed mock data for the Administration category +
 * oversight sections (intel-overview, intel-alerts, risk-overview, risk-audit).
 *
 * Conventions:
 *   - Deterministic seeded PRNG (mulberry32) so first paint is stable.
 *   - HarchCorp-flavoured: real-feeling user names, source names, integrations.
 *   - No `any`. All entities exported with strict interfaces.
 *   - Pillar scoring mirrors the RiskPillar union from mock-data.ts.
 */

import type { RiskPillar, Severity } from "@/lib/mock-data";

/* ------------------------------------------------------------------ */
/*  Deterministic PRNG                                                 */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20251115);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rnd() * arr.length)];
}

/* ------------------------------------------------------------------ */
/*  Users & Roles                                                      */
/* ------------------------------------------------------------------ */

export type UserRole =
  | "admin"
  | "trader"
  | "legal"
  | "market"
  | "pr"
  | "analyst"
  | "viewer";

export type UserStatus = "active" | "suspended" | "invited" | "locked";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  /** ISO timestamp. */
  lastLogin: string | null;
  mfa: boolean;
  /** ISO timestamp when the account was created. */
  createdAt: string;
  /** Number of sessions in the last 30d. */
  sessions30d: number;
  location: string;
}

const userFirstNames = [
  "Alessandro", "Tomás", "Lina", "Mehdi", "Priya", "Sofia", "Youssef",
  "Camille", "Dario", "Noor", "Elias", "Inès", "Rafael", "Sara",
  "Kenzo", "Aya", "Marc", "Jana",
];
const userLastNames = [
  "Marchetti", "Okafor", "Reyes", "Benali", "Dubois", "Novak", "Haddad",
  "Larsson", "Bauer", "Petit", "Khoury", "Schmidt", "Rossi", "Mansouri",
  "Tanaka", "El Fassi", "Volkov", "Hassan",
];
const userLocations = [
  "Casablanca, MA", "Tangier, MA", "Paris, FR", "London, UK", "Frankfurt, DE",
  "Madrid, ES", "New York, US", "Singapore, SG", "Dubai, AE",
];
const roleWeights: UserRole[] = [
  "admin", "admin",
  "trader", "trader", "trader",
  "analyst", "analyst", "analyst", "analyst",
  "legal", "legal",
  "market", "market",
  "pr", "pr",
  "viewer", "viewer",
];

function isoDaysAgo(days: number, hourOffset = 0): string {
  const d = new Date("2025-11-15T10:30:00Z");
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hourOffset);
  return d.toISOString();
}

export const adminUsers: AdminUser[] = (() => {
  // Fixed first user = A. Marchetti (matches the topbar account switcher)
  const fixed: AdminUser[] = [
    {
      id: "USR-0001",
      name: "Alessandro Marchetti",
      email: "a.marchetti@harchcorp.io",
      role: "admin",
      status: "active",
      lastLogin: isoDaysAgo(0, -2),
      mfa: true,
      createdAt: "2023-04-12T09:15:00Z",
      sessions30d: 28,
      location: "Casablanca, MA",
    },
  ];
  const rest: AdminUser[] = [];
  for (let i = 0; i < 11; i++) {
    const first = userFirstNames[(i + 1) % userFirstNames.length];
    const last = userLastNames[(i + 3) % userLastNames.length];
    const role = roleWeights[(i + 1) % roleWeights.length];
    const statusRoll = rnd();
    const status: UserStatus =
      statusRoll > 0.92 ? "invited" : statusRoll > 0.85 ? "locked" : statusRoll > 0.78 ? "suspended" : "active";
    const lastLoginDays = status === "invited" ? null : Math.floor(rnd() * 28) + 0;
    rest.push({
      id: `USR-${String(i + 2).padStart(4, "0")}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase().replace(/[éè]/g, "e")[0]}.${last.toLowerCase().replace(/[^a-z]/g, "")}@harchcorp.io`,
      role,
      status,
      lastLogin: lastLoginDays === null ? null : isoDaysAgo(lastLoginDays),
      mfa: rnd() > 0.32,
      createdAt: isoDaysAgo(Math.floor(rnd() * 600) + 90),
      sessions30d: status === "invited" ? 0 : Math.floor(rnd() * 30) + 1,
      location: pick(userLocations),
    });
  }
  return [...fixed, ...rest];
})();

/* ------------------------------------------------------------------ */
/*  RBAC matrix                                                        */
/* ------------------------------------------------------------------ */

export type Permission =
  | "view intel"
  | "view markets"
  | "view risk"
  | "view comms"
  | "view entities"
  | "ack events"
  | "escalate events"
  | "manage users"
  | "manage sources"
  | "manage integrations"
  | "view billing"
  | "configure alerts"
  | "export data"
  | "audit read";

export type PermissionGrant = "allow" | "deny" | "conditional";

export const allPermissions: Permission[] = [
  "view intel",
  "view markets",
  "view risk",
  "view comms",
  "view entities",
  "ack events",
  "escalate events",
  "manage users",
  "manage sources",
  "manage integrations",
  "view billing",
  "configure alerts",
  "export data",
  "audit read",
];

export const allRoles: UserRole[] = [
  "admin",
  "analyst",
  "trader",
  "legal",
  "market",
  "pr",
  "viewer",
];

/**
 * RBAC matrix: role × permission → grant.
 * Admin = full allow, viewer = read-only intel/markets/risk/comms/entities,
 * analyst = read + ack/export, etc.
 */
export const rbacMatrix: Record<UserRole, Record<Permission, PermissionGrant>> = {
  admin: {
    "view intel": "allow", "view markets": "allow", "view risk": "allow",
    "view comms": "allow", "view entities": "allow", "ack events": "allow",
    "escalate events": "allow", "manage users": "allow", "manage sources": "allow",
    "manage integrations": "allow", "view billing": "allow",
    "configure alerts": "allow", "export data": "allow", "audit read": "allow",
  },
  analyst: {
    "view intel": "allow", "view markets": "allow", "view risk": "allow",
    "view comms": "allow", "view entities": "allow", "ack events": "allow",
    "escalate events": "conditional", "manage users": "deny", "manage sources": "deny",
    "manage integrations": "deny", "view billing": "deny",
    "configure alerts": "conditional", "export data": "allow", "audit read": "conditional",
  },
  trader: {
    "view intel": "allow", "view markets": "allow", "view risk": "allow",
    "view comms": "conditional", "view entities": "allow", "ack events": "allow",
    "escalate events": "deny", "manage users": "deny", "manage sources": "deny",
    "manage integrations": "deny", "view billing": "deny",
    "configure alerts": "deny", "export data": "conditional", "audit read": "deny",
  },
  legal: {
    "view intel": "allow", "view markets": "conditional", "view risk": "allow",
    "view comms": "conditional", "view entities": "allow", "ack events": "allow",
    "escalate events": "allow", "manage users": "deny", "manage sources": "deny",
    "manage integrations": "deny", "view billing": "deny",
    "configure alerts": "conditional", "export data": "allow", "audit read": "allow",
  },
  market: {
    "view intel": "allow", "view markets": "allow", "view risk": "conditional",
    "view comms": "allow", "view entities": "allow", "ack events": "conditional",
    "escalate events": "deny", "manage users": "deny", "manage sources": "deny",
    "manage integrations": "deny", "view billing": "deny",
    "configure alerts": "conditional", "export data": "allow", "audit read": "deny",
  },
  pr: {
    "view intel": "allow", "view markets": "deny", "view risk": "conditional",
    "view comms": "allow", "view entities": "allow", "ack events": "conditional",
    "escalate events": "deny", "manage users": "deny", "manage sources": "deny",
    "manage integrations": "deny", "view billing": "deny",
    "configure alerts": "conditional", "export data": "allow", "audit read": "deny",
  },
  viewer: {
    "view intel": "allow", "view markets": "allow", "view risk": "allow",
    "view comms": "allow", "view entities": "allow", "ack events": "deny",
    "escalate events": "deny", "manage users": "deny", "manage sources": "deny",
    "manage integrations": "deny", "view billing": "deny",
    "configure alerts": "deny", "export data": "deny", "audit read": "deny",
  },
};

export const seatSummary = {
  used: adminUsers.length,
  total: 25,
  plan: "Enterprise",
  renewal: "2026-02-14",
  mfaEnabled: adminUsers.filter((u) => u.mfa).length,
  mfaDisabled: adminUsers.filter((u) => !u.mfa).length,
  activeNow: adminUsers.filter(
    (u) => u.lastLogin !== null && Date.parse(u.lastLogin) > Date.parse(isoDaysAgo(1)),
  ).length,
};

/* ------------------------------------------------------------------ */
/*  Data sources                                                       */
/* ------------------------------------------------------------------ */

export type SourceStatus = "up" | "degraded" | "down";

export interface DataSource {
  id: string;
  name: string;
  category: "OSINT" | "Market Data" | "AI/ML" | "Filings" | "Social" | "Regulatory";
  status: SourceStatus;
  /** p95 latency in ms. */
  latencyMs: number;
  /** Articles / records ingested per day. */
  recordsPerDay: number;
  /** Last successful sync (relative label). */
  lastSync: string;
  /** 0..1 error rate. */
  errorRate: number;
  /** 24 latency samples (ms) for the sparkline. */
  latencySeries: number[];
  /** Description shown in the card subtitle. */
  description: string;
}

function buildLatencySeries(base: number, jitter: number, count = 24): number[] {
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    out.push(Math.max(20, Math.round(base + (rnd() - 0.5) * 2 * jitter)));
  }
  return out;
}

export const dataSources: DataSource[] = [
  {
    id: "SRC-01",
    name: "News OSINT",
    category: "OSINT",
    status: "up",
    latencyMs: 412,
    recordsPerDay: 48230,
    lastSync: "32s ago",
    errorRate: 0.0021,
    latencySeries: buildLatencySeries(420, 60),
    description: "1,840 outlets · crawling + RSS · 14 languages",
  },
  {
    id: "SRC-02",
    name: "BVC Feed",
    category: "Market Data",
    status: "up",
    latencyMs: 88,
    recordsPerDay: 1842,
    lastSync: "Live",
    errorRate: 0.0004,
    latencySeries: buildLatencySeries(90, 22),
    description: "Bourse de Casablanca tick + index feed",
  },
  {
    id: "SRC-03",
    name: "GLM-4 Sentiment",
    category: "AI/ML",
    status: "degraded",
    latencyMs: 1840,
    recordsPerDay: 28410,
    lastSync: "4m ago",
    errorRate: 0.0312,
    latencySeries: buildLatencySeries(1900, 280),
    description: "z-ai GLM-4 · article classification + summary",
  },
  {
    id: "SRC-04",
    name: "Bloomberg Terminal",
    category: "Market Data",
    status: "up",
    latencyMs: 64,
    recordsPerDay: 9120,
    lastSync: "12s ago",
    errorRate: 0.0001,
    latencySeries: buildLatencySeries(66, 12),
    description: "Real-time pricing + corporate actions",
  },
  {
    id: "SRC-05",
    name: "Twitter Firehose",
    category: "Social",
    status: "degraded",
    latencyMs: 920,
    recordsPerDay: 124800,
    lastSync: "1m ago",
    errorRate: 0.0185,
    latencySeries: buildLatencySeries(940, 220),
    description: "PowerTrack stream · brand + executive mentions",
  },
  {
    id: "SRC-06",
    name: "SEC Filings",
    category: "Filings",
    status: "up",
    latencyMs: 240,
    recordsPerDay: 318,
    lastSync: "8m ago",
    errorRate: 0.0008,
    latencySeries: buildLatencySeries(250, 40),
    description: "EDGAR full-text · 10-K, 10-Q, 8-K, DEF 14A",
  },
  {
    id: "SRC-07",
    name: "AMMC Bulletin",
    category: "Regulatory",
    status: "up",
    latencyMs: 318,
    recordsPerDay: 42,
    lastSync: "26m ago",
    errorRate: 0.0000,
    latencySeries: buildLatencySeries(320, 18),
    description: "Autorité Marocaine du Marché des Capitaux · daily bulletin",
  },
  {
    id: "SRC-08",
    name: "RSS Aggregator",
    category: "OSINT",
    status: "down",
    latencyMs: 0,
    recordsPerDay: 0,
    lastSync: "47m ago",
    errorRate: 1.0,
    latencySeries: buildLatencySeries(180, 80).map((_, i) => (i < 8 ? 180 : 0)),
    description: "Curated feed list · 1,200 sources · parser offline",
  },
];

/** 30-day source-health timeline: per-source status array. */
export interface SourceHealthDay {
  day: string; // short label
  up: number;
  degraded: number;
  down: number;
}

export const sourceHealth30d: SourceHealthDay[] = (() => {
  const out: SourceHealthDay[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date("2025-11-15");
    d.setDate(d.getDate() - i);
    const roll = rnd();
    // Mostly healthy, occasional degradation
    let up = 8, degraded = 0, down = 0;
    if (roll > 0.85) { up = 6; degraded = 2; }
    else if (roll > 0.7) { up = 7; degraded = 1; }
    if (roll > 0.96) { up = 7; down = 1; }
    out.push({
      day: d.toISOString().slice(5, 10),
      up, degraded, down,
    });
  }
  // Force the last day to match current state
  out[out.length - 1] = {
    day: out[out.length - 1].day,
    up: dataSources.filter((s) => s.status === "up").length,
    degraded: dataSources.filter((s) => s.status === "degraded").length,
    down: dataSources.filter((s) => s.status === "down").length,
  };
  return out;
})();

/* ------------------------------------------------------------------ */
/*  Integrations                                                       */
/* ------------------------------------------------------------------ */

export type IntegrationStatus = "connected" | "warning" | "error" | "disabled";

export interface Integration {
  id: string;
  name: string;
  category: "Market" | "AI" | "Identity" | "Notifications" | "Storage" | "Webhook";
  status: IntegrationStatus;
  /** Short config summary. */
  configSummary: string;
  /** ISO timestamp of last event. */
  lastEvent: string;
  events24h: number;
  syncEnabled: boolean;
  vendor: string;
}

export const integrations: Integration[] = [
  {
    id: "INT-01",
    name: "Bourse de Casablanca API",
    category: "Market",
    status: "connected",
    configSummary: "OAuth2 · endpoint: api.bvc.ma · rate 600 req/min",
    lastEvent: isoDaysAgo(0, -0.05),
    events24h: 18420,
    syncEnabled: true,
    vendor: "BVC",
  },
  {
    id: "INT-02",
    name: "GLM-4 (z-ai)",
    category: "AI",
    status: "warning",
    configSummary: "API key · model glm-4-plus · 1k req/min quota",
    lastEvent: isoDaysAgo(0, -0.4),
    events24h: 28410,
    syncEnabled: true,
    vendor: "Z.ai",
  },
  {
    id: "INT-03",
    name: "NextAuth / IdP",
    category: "Identity",
    status: "connected",
    configSummary: "OIDC · Azure AD tenant · 12 mapped users",
    lastEvent: isoDaysAgo(0, -1.2),
    events24h: 96,
    syncEnabled: true,
    vendor: "Microsoft Entra",
  },
  {
    id: "INT-04",
    name: "SMTP Relay",
    category: "Notifications",
    status: "connected",
    configSummary: "mail.harchcorp.io · TLS · sender no-reply@harchcorp.io",
    lastEvent: isoDaysAgo(0, -0.8),
    events24h: 312,
    syncEnabled: true,
    vendor: "Postfix",
  },
  {
    id: "INT-05",
    name: "Slack",
    category: "Notifications",
    status: "connected",
    configSummary: "Bot token · 3 channels (#intel-alerts, #risk-triage, #ops)",
    lastEvent: isoDaysAgo(0, -0.1),
    events24h: 1284,
    syncEnabled: true,
    vendor: "Slack",
  },
  {
    id: "INT-06",
    name: "OpsGenie Webhook",
    category: "Webhook",
    status: "warning",
    configSummary: "HTTPS POST · HMAC SHA-256 · routing to EU ops schedule",
    lastEvent: isoDaysAgo(0, -2.6),
    events24h: 48,
    syncEnabled: true,
    vendor: "Atlassian",
  },
  {
    id: "INT-07",
    name: "S3 Archive",
    category: "Storage",
    status: "connected",
    configSummary: "Bucket harchcorp-archive · 847 GB · versioning on",
    lastEvent: isoDaysAgo(0, -3.2),
    events24h: 6,
    syncEnabled: true,
    vendor: "AWS",
  },
  {
    id: "INT-08",
    name: "Bloomberg Terminal",
    category: "Market",
    status: "disabled",
    configSummary: "SAPI · seat expired · awaiting procurement renewal",
    lastEvent: isoDaysAgo(7),
    events24h: 0,
    syncEnabled: false,
    vendor: "Bloomberg",
  },
];

export type IntegrationLogLevel = "info" | "warn" | "error";

export interface IntegrationEvent {
  id: string;
  /** ISO timestamp. */
  ts: string;
  integrationId: string;
  integrationName: string;
  level: IntegrationLogLevel;
  message: string;
}

const eventTemplates: Array<[string, IntegrationLogLevel, string]> = [
  ["Heartbeat ok", "info", "p95 latency within budget"],
  ["Rate limit warning", "warn", "approaching 80% of 600 req/min quota"],
  ["Auth refreshed", "info", "OAuth2 token rotated, expires in 1h"],
  ["Sync completed", "info", "12,481 records ingested"],
  ["Latency spike", "warn", "p95 latency exceeded SLO for 90s"],
  ["Retry exhausted", "error", "failed after 5 attempts, escalation triggered"],
  ["Quota reset", "info", "daily quota window rolled over"],
  ["Health probe ok", "info", "all endpoints 200 OK"],
  ["Webhook delivery failed", "error", "5xx response, backing off"],
  ["Schema drift detected", "warn", "field `sentiment_score` widened to float64"],
];

export const integrationEvents: IntegrationEvent[] = (() => {
  const out: IntegrationEvent[] = [];
  for (let i = 0; i < 24; i++) {
    const int = pick(integrations.filter((x) => x.status !== "disabled"));
    const [msg, level, detail] = pick(eventTemplates);
    out.push({
      id: `IEV-${String(20000 + i).padStart(5, "0")}`,
      ts: isoDaysAgo(0, -(i * 0.18 + 0.05)),
      integrationId: int.id,
      integrationName: int.name,
      level,
      message: `${msg} — ${detail}`,
    });
  }
  return out.sort((a, b) => Date.parse(b.ts) - Date.parse(a.ts));
})();

/* ------------------------------------------------------------------ */
/*  Billing                                                            */
/* ------------------------------------------------------------------ */

export interface UsageMeter {
  id: string;
  label: string;
  used: number;
  quota: number;
  unit: string;
  /** Override the bar colour tone. */
  tone: "emerald" | "amber" | "rose" | "sky" | "violet";
}

export const usageMeters: UsageMeter[] = [
  { id: "articles", label: "Articles ingested", used: 1_847_392, quota: 5_000_000, unit: "articles", tone: "emerald" },
  { id: "glm", label: "GLM-4 calls", used: 412_840, quota: 1_000_000, unit: "calls", tone: "violet" },
  { id: "seats", label: "Seats", used: 12, quota: 25, unit: "seats", tone: "sky" },
  { id: "storage", label: "Storage", used: 847, quota: 2048, unit: "GB", tone: "amber" },
  { id: "exports", label: "Exports (CSV / JSON)", used: 318, quota: 1000, unit: "exports", tone: "emerald" },
  { id: "webhooks", label: "Webhook deliveries", used: 88420, quota: 250_000, unit: "deliveries", tone: "sky" },
];

export interface MonthlyCost {
  month: string; // short label
  /** Cost in USD. */
  cost: number;
  /** Usage-derived surcharge. */
  overage: number;
}

export const monthlyCost12m: MonthlyCost[] = (() => {
  const labels = ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
  return labels.map((m, i) => {
    const base = 18500;
    const growth = i * 220;
    const noise = Math.round((rnd() - 0.5) * 600);
    const cost = base + growth + noise;
    const overage = i > 6 ? Math.round((rnd() * 1200)) : 0;
    return { month: m, cost, overage };
  });
})();

export type InvoiceStatus = "paid" | "pending" | "overdue" | "draft";

export interface Invoice {
  id: string;
  date: string; // ISO short
  amount: number; // USD
  status: InvoiceStatus;
  period: string;
}

export const invoices: Invoice[] = [
  { id: "INV-2025-11", date: "2025-11-01", amount: 21840, status: "paid", period: "Nov 2025" },
  { id: "INV-2025-10", date: "2025-10-01", amount: 20612, status: "paid", period: "Oct 2025" },
  { id: "INV-2025-09", date: "2025-09-01", amount: 20118, status: "paid", period: "Sep 2025" },
  { id: "INV-2025-08", date: "2025-08-01", amount: 19724, status: "paid", period: "Aug 2025" },
  { id: "INV-2025-07", date: "2025-07-01", amount: 19280, status: "paid", period: "Jul 2025" },
  { id: "INV-2025-06", date: "2025-06-01", amount: 18980, status: "paid", period: "Jun 2025" },
  { id: "INV-2025-05", date: "2025-05-01", amount: 18860, status: "paid", period: "May 2025" },
  { id: "INV-2025-04", date: "2025-04-01", amount: 18720, status: "paid", period: "Apr 2025" },
];

export const billingSummary = {
  plan: "Enterprise",
  mrr: monthlyCost12m[monthlyCost12m.length - 1].cost,
  mrrDelta: monthlyCost12m[monthlyCost12m.length - 1].cost - monthlyCost12m[monthlyCost12m.length - 2].cost,
  renewalDate: "2026-02-14",
  paymentMethod: "Wire transfer · IBAN ****8421",
  billingContact: "finance@harchcorp.io",
};

/* ------------------------------------------------------------------ */
/*  Workspace settings                                                 */
/* ------------------------------------------------------------------ */

export interface WorkspaceSettings {
  riskThresholdCritical: number; // 0..100
  riskThresholdHigh: number;
  riskThresholdMedium: number;
  retentionDays: number;
  notifyOnCritical: boolean;
  notifyOnHigh: boolean;
  digestDaily: boolean;
  digestWeekly: boolean;
  dataResidency: "EU" | "US" | "MA" | "APAC";
  autoEscalate: boolean;
  slaHours: number;
  defaultTheme: "light" | "dark" | "system";
}

export const defaultSettings: WorkspaceSettings = {
  riskThresholdCritical: 85,
  riskThresholdHigh: 65,
  riskThresholdMedium: 40,
  retentionDays: 365,
  notifyOnCritical: true,
  notifyOnHigh: true,
  digestDaily: true,
  digestWeekly: false,
  dataResidency: "EU",
  autoEscalate: true,
  slaHours: 4,
  defaultTheme: "light",
};

/* ------------------------------------------------------------------ */
/*  Composite risk index (intel-overview)                              */
/* ------------------------------------------------------------------ */

export interface CompositeRiskDay {
  date: string; // ISO short
  index: number;
  /** Volume of new materialised events that day. */
  events: number;
}

export const compositeRisk30d: CompositeRiskDay[] = (() => {
  const out: CompositeRiskDay[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date("2025-11-15");
    d.setDate(d.getDate() - i);
    const t = 29 - i;
    const base = 68 + 6 * Math.sin(t / 5.5) + 4 * Math.cos(t / 9.2);
    const noise = (rnd() - 0.5) * 5;
    const index = Math.max(35, Math.min(92, Math.round(base + noise)));
    out.push({
      date: d.toISOString().slice(0, 10),
      index,
      events: Math.max(0, Math.round(8 + 5 * Math.sin(t / 3.7) + (rnd() - 0.5) * 6)),
    });
  }
  return out;
})();

export interface CompositeKpi {
  label: string;
  value: string;
  delta: string;
  tone: "positive" | "negative" | "neutral" | "warning";
  hint: string;
}

export const compositeKpis: CompositeKpi[] = [
  { label: "Composite Risk Index", value: "72.4", delta: "+4.1", tone: "negative", hint: "30-day rolling · 0–100 scale" },
  { label: "Monitored Entities", value: "1,284", delta: "+12", tone: "neutral", hint: "Across 5 regions" },
  { label: "Open Alerts", value: "17", delta: "+5", tone: "negative", hint: "Awaiting triage" },
  { label: "Coverage 30d", value: "8,420", delta: "+12.3%", tone: "positive", hint: "Articles ingested" },
  { label: "Negative Share", value: "58%", delta: "+2.8pp", tone: "negative", hint: "Of coverage volume" },
  { label: "Critical Events", value: "3", delta: "+1", tone: "warning", hint: "Last 7 days" },
];

export interface PillarBreakdown {
  pillar: RiskPillar;
  /** 0..100 exposure score. */
  score: number;
  /** 30d delta in points. */
  delta: number;
  events: number;
  articles: number;
  trend: number[]; // 12-point trend
}

export const pillarBreakdown: PillarBreakdown[] = [
  {
    pillar: "Regulatory", score: 68, delta: +3.2, events: 4, articles: 1240,
    trend: [58, 60, 62, 61, 63, 64, 65, 64, 66, 67, 66, 68],
  },
  {
    pillar: "Cyber", score: 74, delta: +5.8, events: 3, articles: 980,
    trend: [62, 63, 64, 65, 66, 67, 68, 70, 71, 72, 73, 74],
  },
  {
    pillar: "Financial", score: 52, delta: -1.4, events: 2, articles: 720,
    trend: [55, 56, 55, 54, 56, 55, 54, 53, 54, 53, 52, 52],
  },
  {
    pillar: "ESG", score: 81, delta: +2.1, events: 3, articles: 1480,
    trend: [73, 74, 75, 76, 77, 77, 78, 79, 80, 80, 81, 81],
  },
  {
    pillar: "Geopolitical", score: 47, delta: -2.8, events: 1, articles: 460,
    trend: [54, 53, 52, 51, 52, 50, 49, 48, 48, 47, 47, 47],
  },
  {
    pillar: "Reputational", score: 63, delta: +0.9, events: 1, articles: 612,
    trend: [58, 59, 60, 61, 60, 61, 62, 61, 62, 62, 63, 63],
  },
];

export interface TopMover {
  entity: string;
  pillar: RiskPillar;
  /** Score today. */
  score: number;
  /** 7d delta in points. */
  delta7d: number;
  /** Reason code. */
  reason: string;
}

export const topMovers: TopMover[] = [
  { entity: "HarchCorp Logistics EU", pillar: "Cyber", score: 88, delta7d: +12.4, reason: "Ransomware affiliate claim" },
  { entity: "HarchCorp (Parent)", pillar: "Regulatory", score: 79, delta7d: +8.1, reason: "SEC informal inquiry" },
  { entity: "ATW SA", pillar: "Financial", score: 61, delta7d: -6.8, reason: "Analyst downgrade cycle" },
  { entity: "Marocaine de Distribution", pillar: "ESG", score: 84, delta7d: +5.2, reason: "NGO Scope-3 dispute" },
  { entity: "OCP Group", pillar: "Geopolitical", score: 53, delta7d: -4.1, reason: "Export-control request" },
  { entity: "CFG Bank", pillar: "Reputational", score: 58, delta7d: +3.7, reason: "Board refresh op-ed" },
];

/* ------------------------------------------------------------------ */
/*  Alerts queue (intel-alerts)                                        */
/* ------------------------------------------------------------------ */

export type AlertQueueStatus = "open" | "assigned" | "ack" | "resolved" | "breach";

export interface AlertQueueItem {
  id: string;
  entity: string;
  pillar: RiskPillar;
  severity: Severity;
  /** ISO timestamp. */
  triggeredAt: string;
  status: AlertQueueStatus;
  assignedTo: string | null;
  /** SLA minutes remaining (negative = breach). */
  slaMinutes: number;
  /** Short trigger description. */
  rule: string;
}

const alertEntities = [
  "HarchCorp (Parent)", "HarchCorp Logistics EU", "ATW SA", "Marocaine de Distribution",
  "OCP Group", "CFG Bank", "IAM Maroc", "LBV Real Estate", "HarchCorp Energy APAC",
];
const alertRules = [
  "Sentiment < -0.6 sustained 1h",
  "Tier-1 outlet · negative coverage",
  "Risk index > 85",
  "Keyword hit: 'investigation'",
  "Volume spike 3σ over baseline",
  "Watchlist signal breach",
  "Pillar score Δ > 5pts",
];

function isoHoursAgo(hours: number): string {
  const d = new Date("2025-11-15T10:30:00Z");
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

export const alertQueue: AlertQueueItem[] = (() => {
  const items: AlertQueueItem[] = [];
  const severities: Severity[] = ["critical", "high", "medium", "low"];
  const statuses: AlertQueueStatus[] = ["open", "open", "open", "assigned", "assigned", "ack", "resolved", "breach"];
  for (let i = 0; i < 18; i++) {
    const sev = i < 3 ? "critical" : i < 8 ? "high" : i < 14 ? "medium" : "low";
    const st = i < 8 ? "open" : statuses[Math.floor(rnd() * statuses.length)];
    const hoursAgo = Math.floor(rnd() * 96) + 0.2;
    items.push({
      id: `ALT-${String(5030 + i).padStart(4, "0")}`,
      entity: pick(alertEntities),
      pillar: pick(["Regulatory", "Cyber", "Financial", "ESG", "Geopolitical", "Reputational"] as RiskPillar[]),
      severity: sev as Severity,
      triggeredAt: isoHoursAgo(hoursAgo),
      status: st,
      assignedTo: st === "open" || st === "breach" ? null : pick(adminUsers.filter((u) => u.role !== "viewer")).name,
      slaMinutes: Math.round((4 - hoursAgo / 24) * 60 + (rnd() - 0.5) * 90),
      rule: pick(alertRules),
    });
  }
  return items.sort((a, b) => Date.parse(a.triggeredAt) - Date.parse(b.triggeredAt));
})();

/** 14-day alert volume series for the sparkline. */
export const alertVolume14d: { day: string; volume: number }[] = (() => {
  const out: { day: string; volume: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date("2025-11-15");
    d.setDate(d.getDate() - i);
    out.push({
      day: d.toISOString().slice(5, 10),
      volume: Math.max(0, Math.round(12 + 8 * Math.sin(i / 2.1) + (rnd() - 0.5) * 6)),
    });
  }
  return out;
})();

export const alertSummary = {
  open: alertQueue.filter((a) => a.status === "open").length,
  critical: alertQueue.filter((a) => a.severity === "critical" && a.status !== "resolved").length,
  assigned: alertQueue.filter((a) => a.status === "assigned").length,
  breach: alertQueue.filter((a) => a.status === "breach" || a.slaMinutes < 0).length,
  resolved7d: alertQueue.filter((a) => a.status === "resolved").length,
};

/* ------------------------------------------------------------------ */
/*  Risk pillar trend (12-month, for risk-overview)                    */
/* ------------------------------------------------------------------ */

export interface PillarTrendMonth {
  month: string;
  Regulatory: number;
  Cyber: number;
  Financial: number;
  ESG: number;
  Geopolitical: number;
  Reputational: number;
}

export const pillarTrend12m: PillarTrendMonth[] = (() => {
  const labels = ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
  return labels.map((m, i) => {
    const drift = (s: number, base: number, amp: number) =>
      Math.max(20, Math.min(95, Math.round(base + amp * Math.sin(i / 2.4) + (rnd() - 0.5) * 4)));
    return {
      month: m,
      Regulatory: drift(i, 60, 6),
      Cyber: drift(i, 66, 8),
      Financial: drift(i, 54, 5),
      ESG: drift(i, 76, 4),
      Geopolitical: drift(i, 50, 7),
      Reputational: drift(i, 60, 3),
    };
  });
})();

export interface TopRiskEntity {
  entity: string;
  composite: number;
  Regulatory: number;
  Cyber: number;
  Financial: number;
  ESG: number;
  Geopolitical: number;
  Reputational: number;
  events: number;
}

export const topRiskEntities: TopRiskEntity[] = [
  { entity: "HarchCorp Logistics EU", composite: 81, Regulatory: 72, Cyber: 92, Financial: 58, ESG: 70, Geopolitical: 64, Reputational: 78, events: 8 },
  { entity: "HarchCorp (Parent)", composite: 74, Regulatory: 84, Cyber: 70, Financial: 62, ESG: 75, Geopolitical: 58, Reputational: 80, events: 11 },
  { entity: "Marocaine de Distribution", composite: 68, Regulatory: 54, Cyber: 50, Financial: 48, ESG: 88, Geopolitical: 42, Reputational: 60, events: 5 },
  { entity: "ATW SA", composite: 61, Regulatory: 58, Cyber: 62, Financial: 70, ESG: 52, Geopolitical: 48, Reputational: 54, events: 4 },
  { entity: "OCP Group", composite: 58, Regulatory: 60, Cyber: 46, Financial: 52, ESG: 64, Geopolitical: 70, Reputational: 50, events: 3 },
  { entity: "CFG Bank", composite: 55, Regulatory: 66, Cyber: 48, Financial: 64, ESG: 40, Geopolitical: 36, Reputational: 58, events: 2 },
  { entity: "HarchCorp Energy APAC", composite: 52, Regulatory: 44, Cyber: 56, Financial: 50, ESG: 68, Geopolitical: 62, Reputational: 46, events: 3 },
  { entity: "IAM Maroc", composite: 47, Regulatory: 50, Cyber: 42, Financial: 54, ESG: 46, Geopolitical: 38, Reputational: 52, events: 2 },
];

/* ------------------------------------------------------------------ */
/*  Audit log (risk-audit)                                             */
/* ------------------------------------------------------------------ */

export type AuditAction =
  | "auth.login"
  | "auth.logout"
  | "auth.mfa_challenge"
  | "user.invite"
  | "user.suspend"
  | "user.role_change"
  | "source.disable"
  | "source.enable"
  | "integration.toggle"
  | "alert.ack"
  | "alert.escalate"
  | "alert.assign"
  | "view.billing"
  | "settings.update"
  | "data.export";

export type AuditResult = "success" | "failure";

export interface AuditEntry {
  id: string;
  /** ISO timestamp. */
  ts: string;
  actor: string;
  action: AuditAction;
  target: string;
  ip: string;
  result: AuditResult;
  /** Optional context note. */
  note?: string;
}

const auditActors = adminUsers.map((u) => u.name);
const auditIps = [
  "41.92.118.42", "41.92.118.51", "82.143.16.18", "82.143.16.24",
  "196.12.250.31", "196.12.250.42", "203.0.113.7", "203.0.113.18",
  "198.51.100.42", "198.51.100.84",
];
const actionTargets: Record<AuditAction, string[]> = {
  "auth.login": ["—"],
  "auth.logout": ["—"],
  "auth.mfa_challenge": ["TOTP"],
  "user.invite": ["u.tanaka@harchcorp.io", "j.hassan@harchcorp.io", "m.volkov@harchcorp.io"],
  "user.suspend": ["USR-0007", "USR-0009"],
  "user.role_change": ["USR-0004 → analyst", "USR-0008 → legal", "USR-0011 → viewer"],
  "source.disable": ["SRC-08 RSS Aggregator", "SRC-05 Twitter Firehose"],
  "source.enable": ["SRC-08 RSS Aggregator", "SRC-02 BVC Feed"],
  "integration.toggle": ["INT-08 Bloomberg Terminal", "INT-06 OpsGenie Webhook"],
  "alert.ack": ["ALT-5030", "ALT-5031", "ALT-5034"],
  "alert.escalate": ["ALT-5030", "ALT-5033"],
  "alert.assign": ["ALT-5035 → A. Marchetti", "ALT-5038 → L. Reyes"],
  "view.billing": ["INV-2025-11", "Usage meters"],
  "settings.update": ["Risk thresholds", "Retention policy", "Notification rules"],
  "data.export": ["Risk events CSV (14 rows)", "Audit log JSON (288 entries)"],
};

const auditActionPool: AuditAction[] = [
  "auth.login", "auth.login", "auth.login", "auth.login",
  "auth.logout", "auth.logout",
  "auth.mfa_challenge",
  "user.invite", "user.role_change", "user.suspend",
  "source.disable", "source.enable",
  "integration.toggle",
  "alert.ack", "alert.ack", "alert.escalate", "alert.assign",
  "view.billing", "settings.update", "data.export",
];

export const auditLog: AuditEntry[] = (() => {
  const out: AuditEntry[] = [];
  for (let i = 0; i < 32; i++) {
    const action = pick(auditActionPool);
    const result: AuditResult = action === "auth.login" && rnd() > 0.9 ? "failure" : "success";
    const note =
      action === "auth.login" && result === "failure"
        ? "Invalid credentials · 3rd attempt"
        : action === "auth.mfa_challenge"
          ? "TOTP code accepted"
          : action === "settings.update"
            ? "Threshold raised"
            : action === "data.export"
              ? "CSV downloaded"
              : undefined;
    out.push({
      id: `AUD-${String(88000 + i).padStart(6, "0")}`,
      ts: isoHoursAgo(i * 0.6 + (rnd() - 0.5) * 0.2),
      actor: pick(auditActors),
      action,
      target: pick(actionTargets[action]),
      ip: pick(auditIps),
      result,
      note,
    });
  }
  return out.sort((a, b) => Date.parse(b.ts) - Date.parse(a.ts));
})();

/** Audit activity volume for the last 14 days (by day, success vs failure). */
export const auditActivity14d: { day: string; success: number; failure: number }[] = (() => {
  const out: { day: string; success: number; failure: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date("2025-11-15");
    d.setDate(d.getDate() - i);
    const total = Math.round(40 + 30 * Math.sin(i / 2.3) + (rnd() - 0.5) * 12);
    const failure = Math.round(total * (0.04 + rnd() * 0.08));
    out.push({
      day: d.toISOString().slice(5, 10),
      success: total - failure,
      failure,
    });
  }
  return out;
})();

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatUSD(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function formatPct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export function relativeTime(iso: string, now = "2025-11-15T10:30:00Z"): string {
  const diffMs = Date.parse(now) - Date.parse(iso);
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toISOString().slice(0, 10);
}

export const statusColor: Record<SourceStatus, { text: string; bg: string; ring: string; dot: string }> = {
  up: { text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  degraded: { text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200", dot: "bg-amber-500" },
  down: { text: "text-rose-700", bg: "bg-rose-50", ring: "ring-rose-200", dot: "bg-rose-500" },
};

export const integrationStatusColor: Record<IntegrationStatus, { text: string; bg: string; ring: string; dot: string }> = {
  connected: { text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  warning: { text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200", dot: "bg-amber-500" },
  error: { text: "text-rose-700", bg: "bg-rose-50", ring: "ring-rose-200", dot: "bg-rose-500" },
  disabled: { text: "text-slate-600", bg: "bg-slate-100", ring: "ring-slate-200", dot: "bg-slate-400" },
};

export const userStatusColor: Record<UserStatus, { text: string; bg: string; ring: string; dot: string }> = {
  active: { text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  suspended: { text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200", dot: "bg-amber-500" },
  invited: { text: "text-sky-700", bg: "bg-sky-50", ring: "ring-sky-200", dot: "bg-sky-500" },
  locked: { text: "text-rose-700", bg: "bg-rose-50", ring: "ring-rose-200", dot: "bg-rose-500" },
};

export const roleTint: Record<UserRole, { text: string; bg: string; ring: string }> = {
  admin: { text: "text-slate-700", bg: "bg-slate-100", ring: "ring-slate-200" },
  analyst: { text: "text-violet-700", bg: "bg-violet-50", ring: "ring-violet-200" },
  trader: { text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200" },
  legal: { text: "text-violet-700", bg: "bg-violet-50", ring: "ring-violet-200" },
  market: { text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200" },
  pr: { text: "text-rose-700", bg: "bg-rose-50", ring: "ring-rose-200" },
  viewer: { text: "text-slate-600", bg: "bg-slate-100", ring: "ring-slate-200" },
};

export const severityTint: Record<Severity, { text: string; bg: string; ring: string }> = {
  critical: { text: "text-rose-700", bg: "bg-rose-50", ring: "ring-rose-200" },
  high: { text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200" },
  medium: { text: "text-sky-700", bg: "bg-sky-50", ring: "ring-sky-200" },
  low: { text: "text-slate-600", bg: "bg-slate-100", ring: "ring-slate-200" },
};

export const alertQueueStatusTint: Record<AlertQueueStatus, { text: string; bg: string; ring: string; dot: string }> = {
  open: { text: "text-rose-700", bg: "bg-rose-50", ring: "ring-rose-200", dot: "bg-rose-500" },
  assigned: { text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200", dot: "bg-amber-500" },
  ack: { text: "text-sky-700", bg: "bg-sky-50", ring: "ring-sky-200", dot: "bg-sky-500" },
  resolved: { text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  breach: { text: "text-rose-800", bg: "bg-rose-100", ring: "ring-rose-300", dot: "bg-rose-600" },
};

export const pillarColor: Record<RiskPillar, string> = {
  Regulatory: "#0ea5e9",
  Cyber: "#a855f7",
  Financial: "#10b981",
  ESG: "#14b8a6",
  Geopolitical: "#f59e0b",
  Reputational: "#f43f5e",
};

export const grantTint: Record<PermissionGrant, { text: string; bg: string; ring: string }> = {
  allow: { text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200" },
  conditional: { text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200" },
  deny: { text: "text-rose-700", bg: "bg-rose-50", ring: "ring-rose-200" },
};

export const meterTone: Record<UsageMeter["tone"], { bar: string; text: string; ring: string }> = {
  emerald: { bar: "bg-emerald-500", text: "text-emerald-700", ring: "ring-emerald-200" },
  amber: { bar: "bg-amber-500", text: "text-amber-700", ring: "ring-amber-200" },
  rose: { bar: "bg-rose-500", text: "text-rose-700", ring: "ring-rose-200" },
  sky: { bar: "bg-sky-500", text: "text-sky-700", ring: "ring-sky-200" },
  violet: { bar: "bg-violet-500", text: "text-violet-700", ring: "ring-violet-200" },
};
