// ═══════════════════════════════════════════════════════════════
//  DEMO SESSION LAYER — Prisma-free auth + data for demo accounts
//
//  Why this exists:
//  The Prisma schema is PostgreSQL-only (uses String[] arrays) but the
//  sandbox .env points to a SQLite file. Every Prisma call throws
//  PrismaClientInitializationError. To let the core console + dashboard
//  + accounts work end-to-end in the demo environment, we short-circuit
//  auth for `demo-*@harch.atelier` emails and serve coherent demo data
//  from memory.
//
//  This is a DEMO bypass, not a production path. Real users still go
//  through the full Prisma-backed flow.
// ═══════════════════════════════════════════════════════════════

export const DEMO_EMAIL_DOMAIN = "@harch.atelier";
export const DEMO_PASSWORD = "demo";

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: string;
  accountType: string; // brand-monitor | market-competitor | investment-bank | harch-alpha
  companyId: string;
  status: string;
  isDemo: boolean;
  onboardingCompleted: boolean;
}

export interface DemoCompany {
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  sector: string;
  ticker: string | null;
  headquarters: string | null;
  website: string | null;
  description: string | null;
  tenantId: string;
  isDemo: boolean;
}

export interface DemoCompanySettings {
  companyId: string;
  plan: string; // starter | growth | enterprise
  seats: number;
  sources: string[];
  tags: string[];
  whatsappEnabled: boolean;
  briefingSchedule: string;
}

export interface DemoTeamMember {
  id: string;
  name: string;
  email: string;
  role: string; // company-admin | analyst | viewer
  status: string; // active | invited | suspended
  lastLoginAt: string | null;
}

export interface DemoInvitation {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  status: string; // pending | accepted | revoked
}

// ─── Demo data fixtures ─────────────────────────────────────────

const DEMO_COMPANY: DemoCompany = {
  id: "demo-company-attijariwafa",
  slug: "attijariwafa-bank-demo",
  name: "Attijariwafa Bank",
  aliases: ["Attijari", "Wafa Bank", "AWB"],
  sector: "Banking",
  ticker: "ATW",
  headquarters: "Casablanca, Morocco",
  website: "https://www.attijariwafa.com",
  description:
    "Leading Moroccan banking group with pan-African operations. Demo company for the Harch Atelier console.",
  tenantId: "demo-tenant-attijariwafa",
  isDemo: true,
};

const DEMO_COMPANY_SETTINGS: DemoCompanySettings = {
  companyId: DEMO_COMPANY.id,
  plan: "enterprise",
  seats: 10,
  sources: ["hespress", "le360", "telquel", "medias24", "leseco", "aujourdhui", "mwn", "yabiladi"],
  tags: ["service-client", "frais-bancaires", "digital", "agences", "panafrican"],
  whatsappEnabled: true,
  briefingSchedule: "daily-07:00",
};

const DEMO_TEAM: DemoTeamMember[] = [
  {
    id: "demo-user-1",
    name: "Salma Bennani",
    email: "demo-brand@harch.atelier",
    role: "company-admin",
    status: "active",
    lastLoginAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: "demo-user-2",
    name: "Karim El Idrissi",
    email: "karim.elidrissi@attijariwafa.com",
    role: "analyst",
    status: "active",
    lastLoginAt: new Date(Date.now() - 1 * 86400_000).toISOString(),
  },
  {
    id: "demo-user-3",
    name: "Nadia Tazi",
    email: "nadia.tazi@attijariwafa.com",
    role: "viewer",
    status: "active",
    lastLoginAt: new Date(Date.now() - 3 * 86400_000).toISOString(),
  },
  {
    id: "demo-user-4",
    name: "Omar Fassi",
    email: "omar.fassi@attijariwafa.com",
    role: "analyst",
    status: "invited",
    lastLoginAt: null,
  },
];

const DEMO_INVITATIONS: DemoInvitation[] = [
  {
    id: "demo-inv-1",
    email: "omar.fassi@attijariwafa.com",
    role: "analyst",
    createdAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
    status: "pending",
  },
];

// ─── Helpers ────────────────────────────────────────────────────

export function isDemoEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.startsWith("demo-") && email.endsWith(DEMO_EMAIL_DOMAIN);
}

export function getDemoAccountType(email: string): string {
  // demo-brand@... → brand-monitor, demo-trader@... → harch-alpha, etc.
  const local = email.split("@")[0];
  if (local.startsWith("demo-trader")) return "harch-alpha";
  if (local.startsWith("demo-invest")) return "investment-bank";
  if (local.startsWith("demo-compet")) return "market-competitor";
  return "brand-monitor"; // default, including demo-brand
}

const DEMO_USER_NAMES: Record<string, string> = {
  "demo-brand": "Salma Bennani",
  "demo-trader": "Youssef Alaoui",
  "demo-invest": "Hind Cherkaoui",
  "demo-compet": "Mehdi Berrada",
};

export function getDemoUser(email: string): DemoUser {
  const local = email.split("@")[0];
  return {
    id: `demo-user-${local}`,
    email,
    name: DEMO_USER_NAMES[local] ?? "Demo User",
    role: "company-admin",
    accountType: getDemoAccountType(email),
    companyId: DEMO_COMPANY.id,
    status: "active",
    isDemo: true,
    onboardingCompleted: true,
  };
}

export function getDemoCompany(): DemoCompany {
  return { ...DEMO_COMPANY };
}

export function getDemoCompanySettings(): DemoCompanySettings {
  return { ...DEMO_COMPANY_SETTINGS };
}

export function getDemoTeam(): DemoTeamMember[] {
  return DEMO_TEAM.map((m) => ({ ...m }));
}

export function getDemoInvitations(): DemoInvitation[] {
  return DEMO_INVITATIONS.map((i) => ({ ...i }));
}

// ─── Demo console data (weather, alerts, reputation, articles) ──

export interface DemoWeatherSnapshot {
  score: number; // 0..100
  trend: number; // -100..+100
  sentiment: "positive" | "neutral" | "negative";
  crisisLevel: "calm" | "watch" | "alert" | "critical";
  updatedAt: string;
  signals: Array<{ label: string; value: string; delta?: number }>;
}

export interface DemoAlert {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  summary: string;
  source: string;
  at: string;
  status: "new" | "acknowledged" | "resolved";
  entityId: string;
}

export interface DemoArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: "positive" | "neutral" | "negative";
  score: number;
  summary: string;
}

export interface DemoReputationScore {
  overall: number;
  trend: number;
  pillars: Array<{ name: string; score: number; delta: number }>;
}

export interface DemoReport {
  id: string;
  title: string;
  type: string;
  status: "draft" | "ready" | "sent";
  createdAt: string;
  period: string;
}

const DEMO_WEATHER: DemoWeatherSnapshot = {
  score: 78,
  trend: 4,
  sentiment: "positive",
  crisisLevel: "calm",
  updatedAt: new Date().toISOString(),
  signals: [
    { label: "Mentions (24h)", value: "1,247", delta: 12 },
    { label: "Sentiment", value: "+0.34", delta: 0.08 },
    { label: "Reach", value: "2.4M", delta: -3 },
    { label: "Share of voice", value: "34%", delta: 2 },
    { label: "Crisis index", value: "0.12", delta: -0.05 },
    { label: "AI visibility", value: "67%", delta: 5 },
  ],
};

const DEMO_ALERTS: DemoAlert[] = [
  {
    id: "alert-1",
    severity: "high",
    title: "Pic de mentions négatives sur les frais bancaires",
    summary: "142 mentions négatives en 2h sur Hespress et Le360 suite à l'annonce des nouveaux tarifs.",
    source: "hespress",
    at: new Date(Date.now() - 45 * 60_000).toISOString(),
    status: "new",
    entityId: DEMO_COMPANY.id,
  },
  {
    id: "alert-2",
    severity: "medium",
    title: "Article positif — interview du PDG dans TelQuel",
    summary: "Interview du directeur général sur la stratégie digitale, repartagée 340 fois.",
    source: "telquel",
    at: new Date(Date.now() - 3 * 3600_000).toISOString(),
    status: "acknowledged",
    entityId: DEMO_COMPANY.id,
  },
  {
    id: "alert-3",
    severity: "low",
    title: "Mention neutre — Médias24",
    summary: "Rapport sectoriel bancaire citant Attijariwafa comme leader du marché.",
    source: "medias24",
    at: new Date(Date.now() - 8 * 3600_000).toISOString(),
    status: "resolved",
    entityId: DEMO_COMPANY.id,
  },
  {
    id: "alert-4",
    severity: "critical",
    title: "Vidéo virale TikTok — plainte client",
    summary: "Une vidéo d'un client mécontent atteint 80K vues en 6h. Vélocité anormale.",
    source: "tiktok",
    at: new Date(Date.now() - 22 * 60_000).toISOString(),
    status: "new",
    entityId: DEMO_COMPANY.id,
  },
];

const DEMO_ARTICLES: DemoArticle[] = [
  {
    id: "art-1",
    title: "Attijariwafa Bank accélère sa digitalisation avec un nouveau mobile banking",
    url: "https://hespress.com/demo/1",
    source: "hespress",
    publishedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
    sentiment: "positive",
    score: 0.72,
    summary: "La banque lance une refonte complète de son application mobile avec authentification biométrique.",
  },
  {
    id: "art-2",
    title: "Frais bancaires : les clients d'Attijariwafa s'expriment",
    url: "https://le360.ma/demo/2",
    source: "le360",
    publishedAt: new Date(Date.now() - 5 * 3600_000).toISOString(),
    sentiment: "negative",
    score: -0.58,
    summary: "Plusieurs clients dénoncent une hausse des frais de tenue de compte.",
  },
  {
    id: "art-3",
    title: "Attijariwafa Bank maintient sa position de leader en Afrique",
    url: "https://telquel.ma/demo/3",
    source: "telquel",
    publishedAt: new Date(Date.now() - 1 * 86400_000).toISOString(),
    sentiment: "positive",
    score: 0.64,
    summary: "Le groupe consolide sa présence dans 14 pays africains.",
  },
  {
    id: "art-4",
    title: "Résultats trimestriels : Attijariwafa dépasse les attentes",
    url: "https://medias24.com/demo/4",
    source: "medias24",
    publishedAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
    sentiment: "positive",
    score: 0.81,
    summary: "PNB en hausse de 8,2%, résultat net +12,4%.",
  },
  {
    id: "art-5",
    title: "Service client : le retour des clients mécontents",
    url: "https://leseco.ma/demo/5",
    source: "leseco",
    publishedAt: new Date(Date.now() - 3 * 86400_000).toISOString(),
    sentiment: "negative",
    score: -0.42,
    summary: "Temps d'attente en agence signalé comme problème récurrent.",
  },
  {
    id: "art-6",
    title: "Attijariwafa Bank sponsor du Salon de l'Auto de Casablanca",
    url: "https://aujourdhui.ma/demo/6",
    source: "aujourdhui",
    publishedAt: new Date(Date.now() - 4 * 86400_000).toISOString(),
    sentiment: "neutral",
    score: 0.12,
    summary: "Présence en tant que partenaire officiel bancaire de l'événement.",
  },
];

const DEMO_REPUTATION: DemoReputationScore = {
  overall: 82,
  trend: 3,
  pillars: [
    { name: "Confiance", score: 85, delta: 2 },
    { name: "Innovation", score: 78, delta: 5 },
    { name: "Service client", score: 64, delta: -4 },
    { name: "Responsabilité", score: 81, delta: 1 },
    { name: "Performance", score: 88, delta: 3 },
    { name: "Image de marque", score: 84, delta: 0 },
  ],
};

const DEMO_REPORTS: DemoReport[] = [
  {
    id: "report-1",
    title: "Rapport mensuel réputation — Juin 2026",
    type: "monthly",
    status: "sent",
    createdAt: new Date(Date.now() - 7 * 86400_000).toISOString(),
    period: "Juin 2026",
  },
  {
    id: "report-2",
    title: "Briefing hebdomadaire — Semaine 27",
    type: "weekly",
    status: "sent",
    createdAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
    period: "S27 2026",
  },
  {
    id: "report-3",
    title: "Audit de crise — pic frais bancaires",
    type: "crisis",
    status: "draft",
    createdAt: new Date(Date.now() - 1 * 3600_000).toISOString(),
    period: "Juillet 2026",
  },
];

export function getDemoWeather(): DemoWeatherSnapshot {
  return { ...DEMO_WEATHER, updatedAt: new Date().toISOString() };
}

export function getDemoAlerts(): DemoAlert[] {
  return DEMO_ALERTS.map((a) => ({ ...a }));
}

export function getDemoArticles(): DemoArticle[] {
  return DEMO_ARTICLES.map((a) => ({ ...a }));
}

export function getDemoReputation(): DemoReputationScore {
  return {
    ...DEMO_REPUTATION,
    pillars: DEMO_REPUTATION.pillars.map((p) => ({ ...p })),
  };
}

export function getDemoReports(): DemoReport[] {
  return DEMO_REPORTS.map((r) => ({ ...r }));
}

// ─── Demo notifications ─────────────────────────────────────────

export interface DemoNotification {
  id: string;
  type: "alert" | "report" | "briefing" | "system";
  title: string;
  body: string;
  at: string;
  read: boolean;
  link?: string;
}

const DEMO_NOTIFICATIONS: DemoNotification[] = [
  {
    id: "notif-1",
    type: "alert",
    title: "Alerte critique — vidéo virale TikTok",
    body: "Une vidéo client atteint 80K vues en 6h.",
    at: new Date(Date.now() - 20 * 60_000).toISOString(),
    read: false,
    link: "/atelier/console/brand-monitor",
  },
  {
    id: "notif-2",
    type: "alert",
    title: "Pic négatif sur les frais bancaires",
    body: "142 mentions négatives en 2h.",
    at: new Date(Date.now() - 45 * 60_000).toISOString(),
    read: false,
    link: "/atelier/console/brand-monitor",
  },
  {
    id: "notif-3",
    type: "report",
    title: "Briefing hebdo prêt",
    body: "Le briefing de la semaine 27 est disponible.",
    at: new Date(Date.now() - 2 * 3600_000).toISOString(),
    read: true,
    link: "/atelier/console/brand-monitor",
  },
  {
    id: "notif-4",
    type: "system",
    title: "Nouveau membre d'équipe",
    body: "Omar Fassi a été invité en tant qu'analyste.",
    at: new Date(Date.now() - 2 * 86400_000).toISOString(),
    read: true,
  },
];

export function getDemoNotifications(): DemoNotification[] {
  return DEMO_NOTIFICATIONS.map((n) => ({ ...n }));
}
