/**
 * Harch Atelier — Legal & Compliance dataset (V16.0 legal role)
 *
 * Deterministic, strictly-typed mock data for the Risk & Compliance category
 * sections owned by the legal role:
 *   risk-regulatory, risk-cyber, risk-financial, risk-esg, risk-geo,
 *   risk-rep, risk-matters, risk-holds.
 *
 * Conventions:
 *   - Deterministic seeded PRNG (mulberry32) so first paint is stable.
 *   - HarchCorp-flavoured: real-feeling regulators (AMMC, BCBS, AMO, CNSS,
 *     CNPDP/Loi 09-08, OFAC, EU, UN), Moroccan counterparties
 *     (Attijariwafa, BMCE, CIH, CFG Bank, OCP, IAM, LBV), and external
 *     counsel firms.
 *   - No `any`. All entities exported with strict interfaces.
 *   - Pillar scoring mirrors the RiskPillar union from mock-data.ts.
 *   - All ISO timestamps are anchored to 2025-11-15T10:30:00Z (same as admin).
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
const rnd = mulberry32(20251116);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rnd() * arr.length)];
}

function isoDaysAgo(days: number, hourOffset = 0): string {
  const d = new Date("2025-11-15T10:30:00Z");
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hourOffset);
  return d.toISOString();
}

function isoHoursAgo(hours: number): string {
  const d = new Date("2025-11-15T10:30:00Z");
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

function isoDaysAhead(days: number): string {
  const d = new Date("2025-11-15T10:30:00Z");
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatUSD(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatMAD(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  });
}

export function formatPct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export function relativeTime(iso: string | null, now = "2025-11-15T10:30:00Z"): string {
  if (!iso) return "—";
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

export function formatDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

export const severityTint: Record<Severity, { text: string; bg: string; ring: string; dot: string }> = {
  critical: { text: "text-rose-700", bg: "bg-rose-50", ring: "ring-rose-200", dot: "bg-rose-500" },
  high: { text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200", dot: "bg-amber-500" },
  medium: { text: "text-sky-700", bg: "bg-sky-50", ring: "ring-sky-200", dot: "bg-sky-500" },
  low: { text: "text-slate-600", bg: "bg-slate-100", ring: "ring-slate-200", dot: "bg-slate-400" },
};

export const pillarColor: Record<RiskPillar, string> = {
  Regulatory: "#7c3aed",
  Cyber: "#a855f7",
  Financial: "#10b981",
  ESG: "#14b8a6",
  Geopolitical: "#f59e0b",
  Reputational: "#f43f5e",
};

/* ================================================================== */
/*  1. REGULATORY (risk-regulatory)                                    */
/* ================================================================== */

export type Regulator =
  | "AMMC"
  | "Bank Al-Maghrib"
  | "BCBS"
  | "AMO"
  | "CNSS"
  | "CNPDP"
  | "OFAC"
  | "EU"
  | "UN"
  | "WCO";

export type FilingStatus =
  | "filed"
  | "in_progress"
  | "overdue"
  | "not_started"
  | "drafting";

export type FilingFrequency =
  | "quarterly"
  | "annual"
  | "monthly"
  | "ad hoc"
  | "semi-annual";

export interface RegObligation {
  id: string;
  regulator: Regulator;
  obligation: string;
  /** Filing frequency. */
  frequency: FilingFrequency;
  /** Next due ISO date. */
  nextDue: string;
  status: FilingStatus;
  /** Owner inside HarchCorp. */
  owner: string;
  /** Risk weight 0–100. */
  risk: number;
  /** Jurisdiction scope. */
  jurisdiction: string;
  /** Optional note. */
  note?: string;
}

const regOwners = [
  "L. Reyes (Legal Counsel)",
  "M. Benali (Compliance Officer)",
  "S. Dubois (Deputy GC)",
  "Y. Haddad (Regulatory Affairs)",
  "I. Mansouri (Company Secretary)",
  "C. Petit (Senior Counsel)",
];

export const regObligations: RegObligation[] = [
  {
    id: "REG-001",
    regulator: "AMMC",
    obligation: "Quarterly financial disclosure · listed-issuer",
    frequency: "quarterly",
    nextDue: isoDaysAhead(9),
    status: "in_progress",
    owner: "I. Mansouri (Company Secretary)",
    risk: 78,
    jurisdiction: "Morocco",
    note: "MASI-listed parent · bulletin board deadline",
  },
  {
    id: "REG-002",
    regulator: "AMMC",
    obligation: "Insider dealing declaration (Article 50)",
    frequency: "ad hoc",
    nextDue: isoDaysAhead(2),
    status: "drafting",
    owner: "L. Reyes (Legal Counsel)",
    risk: 84,
    jurisdiction: "Morocco",
    note: "Closed-window for CEO equity vesting",
  },
  {
    id: "REG-003",
    regulator: "AMMC",
    obligation: "Annual report · ESG chapter (Loi 17-23)",
    frequency: "annual",
    nextDue: isoDaysAhead(64),
    status: "in_progress",
    owner: "Y. Haddad (Regulatory Affairs)",
    risk: 62,
    jurisdiction: "Morocco",
  },
  {
    id: "REG-004",
    regulator: "Bank Al-Maghrib",
    obligation: "Prudential reporting · treasury counterparties",
    frequency: "monthly",
    nextDue: isoDaysAhead(4),
    status: "in_progress",
    owner: "M. Benali (Compliance Officer)",
    risk: 70,
    jurisdiction: "Morocco",
  },
  {
    id: "REG-005",
    regulator: "BCBS",
    obligation: "Basel III · LCR & NSFR reporting",
    frequency: "quarterly",
    nextDue: isoDaysAgo(3),
    status: "overdue",
    owner: "M. Benali (Compliance Officer)",
    risk: 92,
    jurisdiction: "Cross-border",
    note: "CFG Bank sub-custody arm · SLA breach",
  },
  {
    id: "REG-006",
    regulator: "AMO",
    obligation: "Social security declarations (CNSS mirror)",
    frequency: "monthly",
    nextDue: isoDaysAhead(6),
    status: "not_started",
    owner: "I. Mansouri (Company Secretary)",
    risk: 44,
    jurisdiction: "Morocco",
  },
  {
    id: "REG-007",
    regulator: "CNSS",
    obligation: "Affiliation & contributions filing",
    frequency: "monthly",
    nextDue: isoDaysAhead(6),
    status: "not_started",
    owner: "I. Mansouri (Company Secretary)",
    risk: 48,
    jurisdiction: "Morocco",
  },
  {
    id: "REG-008",
    regulator: "CNPDP",
    obligation: "Loi 09-08 · data protection register update",
    frequency: "annual",
    nextDue: isoDaysAhead(22),
    status: "in_progress",
    owner: "S. Dubois (Deputy GC)",
    risk: 76,
    jurisdiction: "Morocco",
    note: "Post-Cyber incident review",
  },
  {
    id: "REG-009",
    regulator: "CNPDP",
    obligation: "Data-breach notification (72h)",
    frequency: "ad hoc",
    nextDue: isoDaysAgo(1),
    status: "overdue",
    owner: "L. Reyes (Legal Counsel)",
    risk: 96,
    jurisdiction: "Morocco",
    note: "Cyber-incident CYB-0024 · 71h elapsed",
  },
  {
    id: "REG-010",
    regulator: "OFAC",
    obligation: "Sanctions screening log · monthly attestation",
    frequency: "monthly",
    nextDue: isoDaysAhead(11),
    status: "filed",
    owner: "Y. Haddad (Regulatory Affairs)",
    risk: 58,
    jurisdiction: "US / Cross-border",
  },
  {
    id: "REG-011",
    regulator: "EU",
    obligation: "GDPR Article 30 · RoPA review",
    frequency: "annual",
    nextDue: isoDaysAhead(38),
    status: "in_progress",
    owner: "S. Dubois (Deputy GC)",
    risk: 64,
    jurisdiction: "European Union",
  },
  {
    id: "REG-012",
    regulator: "EU",
    obligation: "Sanctions Regulation (EU) 269/2014 screening",
    frequency: "monthly",
    nextDue: isoDaysAhead(7),
    status: "in_progress",
    owner: "Y. Haddad (Regulatory Affairs)",
    risk: 60,
    jurisdiction: "European Union",
  },
  {
    id: "REG-013",
    regulator: "UN",
    obligation: "Consolidated Sanctions List screening",
    frequency: "monthly",
    nextDue: isoDaysAhead(7),
    status: "in_progress",
    owner: "Y. Haddad (Regulatory Affairs)",
    risk: 56,
    jurisdiction: "Cross-border",
  },
  {
    id: "REG-014",
    regulator: "WCO",
    obligation: "Customs valuation & origin declarations",
    frequency: "quarterly",
    nextDue: isoDaysAhead(18),
    status: "drafting",
    owner: "C. Petit (Senior Counsel)",
    risk: 50,
    jurisdiction: "Morocco / EU",
    note: "Tangier Free Zone export volumes",
  },
  {
    id: "REG-015",
    regulator: "AMMC",
    obligation: "Market-abuse surveillance report",
    frequency: "quarterly",
    nextDue: isoDaysAhead(14),
    status: "drafting",
    owner: "M. Benali (Compliance Officer)",
    risk: 72,
    jurisdiction: "Morocco",
  },
  {
    id: "REG-016",
    regulator: "Bank Al-Maghrib",
    obligation: "FX position declaration",
    frequency: "monthly",
    nextDue: isoDaysAhead(5),
    status: "in_progress",
    owner: "M. Benali (Compliance Officer)",
    risk: 54,
    jurisdiction: "Morocco",
  },
];

export const filingStatusTint: Record<FilingStatus, { text: string; bg: string; ring: string; dot: string }> = {
  filed: { text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  in_progress: { text: "text-sky-700", bg: "bg-sky-50", ring: "ring-sky-200", dot: "bg-sky-500" },
  overdue: { text: "text-rose-700", bg: "bg-rose-50", ring: "ring-rose-200", dot: "bg-rose-500" },
  not_started: { text: "text-slate-600", bg: "bg-slate-100", ring: "ring-slate-200", dot: "bg-slate-400" },
  drafting: { text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200", dot: "bg-amber-500" },
};

/** Regulator × status heatmap cells. */
export const regulatorHeatmap: {
  regulator: Regulator;
  filed: number;
  in_progress: number;
  overdue: number;
  drafting: number;
  not_started: number;
}[] = (() => {
  const byReg = new Map<Regulator, Record<FilingStatus, number>>();
  for (const o of regObligations) {
    if (!byReg.has(o.regulator)) {
      byReg.set(o.regulator, {
        filed: 0, in_progress: 0, overdue: 0, drafting: 0, not_started: 0,
      });
    }
    byReg.get(o.regulator)![o.status] += 1;
  }
  return Array.from(byReg.entries()).map(([regulator, counts]) => ({
    regulator,
    ...counts,
  }));
})();

/** Upcoming filings (next 90 days, sorted by due date). */
export const upcomingFilings: RegObligation[] = regObligations
  .filter((o) => Date.parse(o.nextDue) >= Date.parse("2025-11-15T00:00:00Z"))
  .sort((a, b) => Date.parse(a.nextDue) - Date.parse(b.nextDue));

export const regulatorySummary = {
  total: regObligations.length,
  filed: regObligations.filter((o) => o.status === "filed").length,
  inProgress: regObligations.filter((o) => o.status === "in_progress").length,
  overdue: regObligations.filter((o) => o.status === "overdue").length,
  drafting: regObligations.filter((o) => o.status === "drafting").length,
  notStarted: regObligations.filter((o) => o.status === "not_started").length,
  dueThisMonth: regObligations.filter((o) => {
    const d = Date.parse(o.nextDue);
    return d >= Date.parse("2025-11-01T00:00:00Z") && d <= Date.parse("2025-11-30T23:59:59Z");
  }).length,
  dueNext14d: regObligations.filter((o) => {
    const d = Date.parse(o.nextDue);
    return d >= Date.parse("2025-11-15T00:00:00Z") && d <= Date.parse("2025-11-29T00:00:00Z");
  }).length,
  highRisk: regObligations.filter((o) => o.risk >= 70).length,
  regulators: new Set(regObligations.map((o) => o.regulator)).size,
};

/* ================================================================== */
/*  2. CYBER (risk-cyber)                                              */
/* ================================================================== */

export type CyberIncidentStatus =
  | "contained"
  | "investigating"
  | "remediated"
  | "disclosed"
  | "open";

export type MitreTactic =
  | "Initial Access"
  | "Execution"
  | "Persistence"
  | "Privilege Escalation"
  | "Defense Evasion"
  | "Credential Access"
  | "Discovery"
  | "Lateral Movement"
  | "Collection"
  | "Exfiltration"
  | "Impact";

export type CyberIncidentType =
  | "Phishing"
  | "Ransomware"
  | "Data Breach"
  | "DDoS"
  | "Insider Threat"
  | "Supply Chain"
  | "Malware"
  | "Privileged Account Misuse"
  | "Misconfiguration"
  | "Third-Party Leak";

export interface CyberIncident {
  id: string;
  type: CyberIncidentType;
  severity: Severity;
  entity: string;
  status: CyberIncidentStatus;
  /** Detected ISO timestamp. */
  detected: string;
  /** MITRE ATT&CK tactic. */
  tactic: MitreTactic;
  /** Hours-to-contain. */
  mttrHours: number;
  /** Was regulatory disclosure triggered? */
  disclosureTriggered: boolean;
  /** Brief description. */
  summary: string;
}

const cyberEntities = [
  "HarchCorp (Parent)",
  "HarchCorp Logistics EU",
  "HarchCorp Energy APAC",
  "ATW SA",
  "CFG Bank",
  "IAM Maroc",
  "Marocaine de Distribution",
  "HarchCorp Morocco",
];

export const cyberIncidents: CyberIncident[] = [
  {
    id: "CYB-0024",
    type: "Data Breach",
    severity: "critical",
    entity: "HarchCorp Morocco",
    status: "disclosed",
    detected: isoHoursAgo(73),
    tactic: "Exfiltration",
    mttrHours: 38,
    disclosureTriggered: true,
    summary: "Customer PII exfiltrated via misconfigured S3 bucket · 14k records.",
  },
  {
    id: "CYB-0023",
    type: "Ransomware",
    severity: "critical",
    entity: "HarchCorp Logistics EU",
    status: "contained",
    detected: isoHoursAgo(28),
    tactic: "Impact",
    mttrHours: 12,
    disclosureTriggered: true,
    summary: "LockBit 4.0 variant · perimeter segmented, no encrypt succeeded.",
  },
  {
    id: "CYB-0022",
    type: "Phishing",
    severity: "high",
    entity: "CFG Bank",
    status: "remediated",
    detected: isoHoursAgo(50),
    tactic: "Initial Access",
    mttrHours: 6,
    disclosureTriggered: false,
    summary: "Spear-phish against treasury team · 4 accounts reset, MFA enforced.",
  },
  {
    id: "CYB-0021",
    type: "Supply Chain",
    severity: "high",
    entity: "HarchCorp (Parent)",
    status: "investigating",
    detected: isoHoursAgo(96),
    tactic: "Initial Access",
    mttrHours: 0,
    disclosureTriggered: false,
    summary: "Compromised vendor SFTP credentials · audit in progress.",
  },
  {
    id: "CYB-0020",
    type: "DDoS",
    severity: "medium",
    entity: "IAM Maroc",
    status: "remediated",
    detected: isoDaysAgo(3),
    tactic: "Impact",
    mttrHours: 4,
    disclosureTriggered: false,
    summary: "Volumetric L3/L4 attack · 480 Gbps peak · scrubbed via Cloudflare.",
  },
  {
    id: "CYB-0019",
    type: "Insider Threat",
    severity: "high",
    entity: "ATW SA",
    status: "investigating",
    detected: isoDaysAgo(5),
    tactic: "Collection",
    mttrHours: 0,
    disclosureTriggered: false,
    summary: "Ex-employee exfiltrated client list before separation · HR + legal review.",
  },
  {
    id: "CYB-0018",
    type: "Privileged Account Misuse",
    severity: "medium",
    entity: "HarchCorp Energy APAC",
    status: "remediated",
    detected: isoDaysAgo(7),
    tactic: "Privilege Escalation",
    mttrHours: 14,
    disclosureTriggered: false,
    summary: "Stale admin account used off-hours · PAM rotation triggered.",
  },
  {
    id: "CYB-0017",
    type: "Malware",
    severity: "medium",
    entity: "Marocaine de Distribution",
    status: "contained",
    detected: isoDaysAgo(9),
    tactic: "Execution",
    mttrHours: 8,
    disclosureTriggered: false,
    summary: "TrickBot loader on POS terminals · 17 endpoints quarantined.",
  },
  {
    id: "CYB-0016",
    type: "Misconfiguration",
    severity: "low",
    entity: "HarchCorp Morocco",
    status: "remediated",
    detected: isoDaysAgo(12),
    tactic: "Initial Access",
    mttrHours: 3,
    disclosureTriggered: false,
    summary: "Public RDP exposure on staging box · firewall rule corrected.",
  },
  {
    id: "CYB-0015",
    type: "Third-Party Leak",
    severity: "high",
    entity: "HarchCorp Logistics EU",
    status: "investigating",
    detected: isoDaysAgo(15),
    tactic: "Exfiltration",
    mttrHours: 0,
    disclosureTriggered: true,
    summary: "Vendor credentials leaked on dark-web forum · scope assessment ongoing.",
  },
  {
    id: "CYB-0014",
    type: "Phishing",
    severity: "low",
    entity: "CFG Bank",
    status: "remediated",
    detected: isoDaysAgo(18),
    tactic: "Initial Access",
    mttrHours: 2,
    disclosureTriggered: false,
    summary: "Bulk phish blocked at SEG · 0 clicks.",
  },
  {
    id: "CYB-0013",
    type: "Malware",
    severity: "medium",
    entity: "HarchCorp (Parent)",
    status: "remediated",
    detected: isoDaysAgo(22),
    tactic: "Credential Access",
    mttrHours: 10,
    disclosureTriggered: false,
    summary: "Kerberoasting attempt · service account tickets rotated.",
  },
];

export const cyberStatusTint: Record<CyberIncidentStatus, { text: string; bg: string; ring: string; dot: string }> = {
  contained: { text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200", dot: "bg-amber-500" },
  investigating: { text: "text-rose-700", bg: "bg-rose-50", ring: "ring-rose-200", dot: "bg-rose-500" },
  remediated: { text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  disclosed: { text: "text-violet-700", bg: "bg-violet-50", ring: "ring-violet-200", dot: "bg-violet-500" },
  open: { text: "text-rose-800", bg: "bg-rose-100", ring: "ring-rose-300", dot: "bg-rose-600" },
};

/** 30-day incident volume trend. */
export const cyberTrend30d: { day: string; incidents: number; critical: number }[] = (() => {
  const out: { day: string; incidents: number; critical: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date("2025-11-15");
    d.setDate(d.getDate() - i);
    const base = 2 + 4 * Math.sin(i / 3.1);
    const incidents = Math.max(0, Math.round(base + (rnd() - 0.5) * 3));
    const critical = incidents > 4 ? Math.round(rnd() * 1.6) : 0;
    out.push({
      day: d.toISOString().slice(5, 10),
      incidents,
      critical,
    });
  }
  return out;
})();

/** CVE exposure list — products / versions present in the HarchCorp estate. */
export interface CveExposure {
  cve: string;
  product: string;
  cvss: number;
  affected: number;
  exploit: "active" | "poc" | "none";
  patched: boolean;
}

export const cveExposure: CveExposure[] = [
  { cve: "CVE-2025-10412", product: "Citrix NetScaler ADC 14.1", cvss: 9.4, affected: 3, exploit: "active", patched: false },
  { cve: "CVE-2025-09876", product: "Cisco IOS XE 17.12", cvss: 8.8, affected: 12, exploit: "active", patched: false },
  { cve: "CVE-2024-9014", product: "Fortinet FortiManager 7.4", cvss: 9.8, affected: 2, exploit: "active", patched: true },
  { cve: "CVE-2025-0723", product: "VMware vCenter 8.0 U2", cvss: 7.8, affected: 4, exploit: "poc", patched: false },
  { cve: "CVE-2024-6387", product: "OpenSSH 9.6 (regreSSHion)", cvss: 8.1, affected: 86, exploit: "poc", patched: true },
  { cve: "CVE-2025-0319", product: "Microsoft Exchange 2019 CU14", cvss: 8.5, affected: 5, exploit: "poc", patched: false },
  { cve: "CVE-2024-49113", product: "Windows Server 2022 (LDAP)", cvss: 7.5, affected: 142, exploit: "active", patched: true },
  { cve: "CVE-2025-0117", product: "Atlassian Confluence 8.5", cvss: 9.2, affected: 1, exploit: "none", patched: false },
];

/** Cyber-readiness radar (posture dimensions 0–100). */
export const cyberReadinessRadar: { dimension: string; score: number; target: number }[] = [
  { dimension: "Identity", score: 78, target: 90 },
  { dimension: "Network", score: 72, target: 85 },
  { dimension: "Endpoint", score: 81, target: 90 },
  { dimension: "Data", score: 64, target: 85 },
  { dimension: "Detection", score: 70, target: 88 },
  { dimension: "Response", score: 76, target: 90 },
  { dimension: "Recovery", score: 68, target: 85 },
  { dimension: "3rd-Party", score: 58, target: 80 },
];

export const cyberSummary = {
  total: cyberIncidents.length,
  open: cyberIncidents.filter((i) => i.status === "investigating" || i.status === "open").length,
  critical: cyberIncidents.filter((i) => i.severity === "critical").length,
  disclosed: cyberIncidents.filter((i) => i.status === "disclosed").length,
  disclosureTriggered: cyberIncidents.filter((i) => i.disclosureTriggered).length,
  avgMttr: Math.round(
    cyberIncidents.filter((i) => i.mttrHours > 0).reduce((s, i) => s + i.mttrHours, 0) /
      Math.max(1, cyberIncidents.filter((i) => i.mttrHours > 0).length),
  ),
  posture: 72,
  unpatchedCves: cveExposure.filter((c) => !c.patched).length,
  criticalCves: cveExposure.filter((c) => c.cvss >= 9 && !c.patched).length,
};

/* ================================================================== */
/*  3. FINANCIAL (risk-financial)                                      */
/* ================================================================== */

export interface FinancialRiskGauge {
  label: string;
  value: number;
  /** Lower-bound regulatory threshold. */
  threshold: number;
  unit: string;
  tone: "positive" | "warning" | "negative";
}

export const financialGauges: FinancialRiskGauge[] = [
  { label: "Credit Risk", value: 64, threshold: 70, unit: "score", tone: "warning" },
  { label: "Liquidity Risk", value: 38, threshold: 50, unit: "score", tone: "positive" },
  { label: "Market Risk", value: 71, threshold: 65, unit: "score", tone: "negative" },
  { label: "Operational Risk", value: 52, threshold: 60, unit: "score", tone: "warning" },
];

/** 30-day VaR trend (1-day 99% VaR, USD millions). */
export const varTrend30d: { day: string; var: number; limit: number }[] = (() => {
  const out: { day: string; var: number; limit: number }[] = [];
  const limit = 12.5;
  for (let i = 29; i >= 0; i--) {
    const d = new Date("2025-11-15");
    d.setDate(d.getDate() - i);
    const v = 7.4 + 2.8 * Math.sin(i / 4.0) + (rnd() - 0.5) * 1.6;
    out.push({
      day: d.toISOString().slice(5, 10),
      var: Math.max(3.5, Number(v.toFixed(2))),
      limit,
    });
  }
  return out;
})();

export interface Counterparty {
  id: string;
  name: string;
  /** Country code. */
  country: string;
  /** Exposure in USD millions. */
  exposure: number;
  /** Credit rating. */
  rating: string;
  /** Limit in USD millions. */
  limit: number;
  /** ISDA Master in place? */
  isda: boolean;
  /** Cross-default triggered? */
  crossDefault: boolean;
  /** Utilization 0–100. */
  utilization: number;
}

export const counterparties: Counterparty[] = [
  { id: "CP-001", name: "Attijariwafa Bank", country: "MA", exposure: 142, rating: "BBB+", limit: 180, isda: true, crossDefault: false, utilization: 79 },
  { id: "CP-002", name: "BMCE Bank of Africa", country: "MA", exposure: 96, rating: "BBB", limit: 140, isda: true, crossDefault: false, utilization: 69 },
  { id: "CP-003", name: "CFG Bank", country: "MA", exposure: 58, rating: "BB+", limit: 80, isda: true, crossDefault: true, utilization: 73 },
  { id: "CP-004", name: "CIH Bank", country: "MA", exposure: 41, rating: "BB", limit: 60, isda: false, crossDefault: false, utilization: 68 },
  { id: "CP-005", name: "Banque Populaire", country: "MA", exposure: 73, rating: "BBB", limit: 110, isda: true, crossDefault: false, utilization: 66 },
  { id: "CP-006", name: "Société Générale MA", country: "MA", exposure: 51, rating: "A-", limit: 90, isda: true, crossDefault: false, utilization: 57 },
  { id: "CP-007", name: "Crédit Agricole MA", country: "MA", exposure: 34, rating: "BBB-", limit: 60, isda: false, crossDefault: false, utilization: 57 },
  { id: "CP-008", name: "BNP Paribas", country: "FR", exposure: 168, rating: "A+", limit: 220, isda: true, crossDefault: false, utilization: 76 },
  { id: "CP-009", name: "Deutsche Bank AG", country: "DE", exposure: 92, rating: "A", limit: 150, isda: true, crossDefault: false, utilization: 61 },
  { id: "CP-010", name: "JP Morgan Chase", country: "US", exposure: 124, rating: "A+", limit: 200, isda: true, crossDefault: false, utilization: 62 },
  { id: "CP-011", name: "OCP Group", country: "MA", exposure: 88, rating: "BBB-", limit: 120, isda: false, crossDefault: false, utilization: 73 },
  { id: "CP-012", name: "IAM Maroc (Itissalat Al-Maghrib)", country: "MA", exposure: 47, rating: "BB+", limit: 70, isda: false, crossDefault: false, utilization: 67 },
];

export interface LiquidityRatio {
  label: string;
  value: number;
  /** Regulatory minimum. */
  minimum: number;
  unit: string;
}

export const liquidityRatios: LiquidityRatio[] = [
  { label: "LCR (Liquidity Coverage)", value: 142, minimum: 100, unit: "%" },
  { label: "NSFR (Net Stable Funding)", value: 118, minimum: 100, unit: "%" },
  { label: "MLA (Minimum Liquidity Avg)", value: 16.4, minimum: 12, unit: "%" },
  { label: "Tier-1 Capital Adequacy", value: 13.8, minimum: 10.5, unit: "%" },
];

export const financialSummary = {
  totalExposure: counterparties.reduce((s, c) => s + c.exposure, 0),
  avgUtilization: Math.round(
    counterparties.reduce((s, c) => s + c.utilization, 0) / counterparties.length,
  ),
  crossDefaultHits: counterparties.filter((c) => c.crossDefault).length,
  isdaCoverage: counterparties.filter((c) => c.isda).length,
  varLimit: 12.5,
  varLatest: varTrend30d[varTrend30d.length - 1].var,
  varBreach30d: varTrend30d.filter((d) => d.var > d.limit).length,
  lcr: liquidityRatios[0].value,
  nsfr: liquidityRatios[1].value,
};

/* ================================================================== */
/*  4. ESG (risk-esg)                                                  */
/* ================================================================== */

export interface EsgScore {
  dimension: "Environmental" | "Social" | "Governance";
  score: number;
  delta: number;
  /** Weight in composite (must sum to 1.0). */
  weight: number;
}

export const esgScores: EsgScore[] = [
  { dimension: "Environmental", score: 72, delta: +3.4, weight: 0.34 },
  { dimension: "Social", score: 68, delta: +1.8, weight: 0.30 },
  { dimension: "Governance", score: 81, delta: +0.6, weight: 0.36 },
];

export const esgComposite = Math.round(
  esgScores.reduce((s, x) => s + x.score * x.weight, 0),
);

/** ESG radar — sub-dimensions. */
export const esgRadar: { axis: string; score: number; target: number }[] = [
  { axis: "Carbon", score: 70, target: 85 },
  { axis: "Water", score: 76, target: 85 },
  { axis: "Waste", score: 64, target: 80 },
  { axis: "Workforce", score: 74, target: 85 },
  { axis: "Community", score: 68, target: 80 },
  { axis: "Customer", score: 72, target: 85 },
  { axis: "Board", score: 84, target: 90 },
  { axis: "Ethics", score: 80, target: 92 },
];

/** Carbon emissions trend (12 months, tCO2e). */
export interface CarbonMonth {
  month: string;
  scope1: number;
  scope2: number;
  scope3: number;
}

export const carbonTrend12m: CarbonMonth[] = (() => {
  const labels = ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
  return labels.map((m, i) => {
    const trend = 1 - i * 0.018;
    return {
      month: m,
      scope1: Math.round(1240 * trend + (rnd() - 0.5) * 40),
      scope2: Math.round(2180 * trend + (rnd() - 0.5) * 80),
      scope3: Math.round(8420 * trend + (rnd() - 0.5) * 220),
    };
  });
})();

export type EsgDisclosureStatus =
  | "submitted"
  | "draft"
  | "in_review"
  | "overdue"
  | "scheduled";

export interface EsgDisclosure {
  id: string;
  framework: string;
  period: string;
  status: EsgDisclosureStatus;
  owner: string;
  due: string;
  scope: string;
}

export const esgDisclosureRegister: EsgDisclosure[] = [
  { id: "ESG-D-001", framework: "AMMC ESG Chapter", period: "FY 2025", status: "draft", owner: "Y. Haddad", due: isoDaysAhead(64), scope: "Parent + 4 subs" },
  { id: "ESG-D-002", framework: "TCFD (Climate)", period: "FY 2025", status: "in_review", owner: "S. Dubois", due: isoDaysAhead(40), scope: "Carbon, climate risk" },
  { id: "ESG-D-003", framework: "GRI Standards", period: "FY 2025", status: "draft", owner: "Y. Haddad", due: isoDaysAhead(52), scope: "Multi-stakeholder" },
  { id: "ESG-D-004", framework: "UNGC (Communication on Progress)", period: "FY 2025", status: "scheduled", owner: "I. Mansouri", due: isoDaysAhead(90), scope: "10 principles" },
  { id: "ESG-D-005", framework: "CDP Climate", period: "FY 2024", status: "submitted", owner: "S. Dubois", due: isoDaysAgo(28), scope: "Scope 1/2/3" },
  { id: "ESG-D-006", framework: "EU CSRD (Br. 3 EU ops)", period: "FY 2025", status: "in_review", owner: "C. Petit", due: isoDaysAhead(75), scope: "EU subsidiaries" },
  { id: "ESG-D-007", framework: "ILO Compliance", period: "FY 2025", status: "overdue", owner: "I. Mansouri", due: isoDaysAgo(4), scope: "Labor practices" },
];

export const esgDisclosureStatusTint: Record<EsgDisclosureStatus, { text: string; bg: string; ring: string; dot: string }> = {
  submitted: { text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  draft: { text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200", dot: "bg-amber-500" },
  in_review: { text: "text-sky-700", bg: "bg-sky-50", ring: "ring-sky-200", dot: "bg-sky-500" },
  overdue: { text: "text-rose-700", bg: "bg-rose-50", ring: "ring-rose-200", dot: "bg-rose-500" },
  scheduled: { text: "text-slate-600", bg: "bg-slate-100", ring: "ring-slate-200", dot: "bg-slate-400" },
};

export interface EsgControversy {
  id: string;
  date: string;
  pillar: "Environmental" | "Social" | "Governance";
  title: string;
  severity: Severity;
  status: "open" | "remediating" | "closed";
  outlet: string;
}

export const esgControversies: EsgControversy[] = [
  { id: "ESC-009", date: isoDaysAgo(4), pillar: "Environmental", title: "Tangier plant emissions exceed Q3 permit", severity: "high", status: "remediating", outlet: "L'Économiste" },
  { id: "ESC-008", date: isoDaysAgo(12), pillar: "Social", title: "Subcontractor labor dispute at Casablanca port", severity: "medium", status: "open", outlet: "Medias24" },
  { id: "ESC-007", date: isoDaysAgo(24), pillar: "Governance", title: "Board independence question on related-party deal", severity: "high", status: "remediating", outlet: "Bloomberg" },
  { id: "ESC-006", date: isoDaysAgo(38), pillar: "Environmental", title: "Water-usage criticism in drought-affected region", severity: "medium", status: "closed", outlet: "TelQuel" },
  { id: "ESC-005", date: isoDaysAgo(51), pillar: "Social", title: "DEI targets lagging peer benchmarks", severity: "low", status: "closed", outlet: "Forbes Afrique" },
  { id: "ESC-004", date: isoDaysAgo(74), pillar: "Governance", title: "CFO pay-ratio disclosure challenge", severity: "medium", status: "closed", outlet: "Reuters" },
];

export const esgSummary = {
  composite: esgComposite,
  ytdCarbon: carbonTrend12m.reduce((s, m) => s + m.scope1 + m.scope2 + m.scope3, 0),
  ytdCarbonDelta: -8.2,
  openControversies: esgControversies.filter((c) => c.status !== "closed").length,
  disclosuresDue: esgDisclosureRegister.filter((d) => d.status !== "submitted" && d.status !== "scheduled").length,
  disclosuresOverdue: esgDisclosureRegister.filter((d) => d.status === "overdue").length,
  netPositiveDelta: esgScores.filter((s) => s.delta > 0).length,
};

/* ================================================================== */
/*  5. GEOPOLITICAL (risk-geo)                                         */
/* ================================================================== */

export type SanctionedJurisdiction =
  | "Iran"
  | "Russia"
  | "Syria"
  | "North Korea"
  | "Cuba"
  | "Venezuela"
  | "Myanmar"
  | "Belarus";

export interface SanctionsHit {
  entity: string;
  /** Sanctions exposure per jurisdiction (1 = direct exposure, 2 = indirect, 0 = none). */
  exposures: Record<SanctionedJurisdiction, 0 | 1 | 2>;
  /** Most-recent screening result. */
  lastScreened: string;
  hits: number;
  status: "clear" | "watch" | "blocked";
}

const sanctionedJurisdictionsList: SanctionedJurisdiction[] = [
  "Iran", "Russia", "Syria", "North Korea", "Cuba", "Venezuela", "Myanmar", "Belarus",
];

export const sanctionedJurisdictions: readonly SanctionedJurisdiction[] = sanctionedJurisdictionsList;

export const sanctionsHits: SanctionsHit[] = [
  {
    entity: "HarchCorp Logistics EU",
    exposures: { Iran: 0, Russia: 2, Syria: 0, "North Korea": 0, Cuba: 0, Venezuela: 0, Myanmar: 0, Belarus: 1 },
    lastScreened: isoHoursAgo(4),
    hits: 0,
    status: "watch",
  },
  {
    entity: "HarchCorp Energy APAC",
    exposures: { Iran: 1, Russia: 0, Syria: 0, "North Korea": 0, Cuba: 0, Venezuela: 0, Myanmar: 2, Belarus: 0 },
    lastScreened: isoHoursAgo(8),
    hits: 1,
    status: "watch",
  },
  {
    entity: "HarchCorp (Parent)",
    exposures: { Iran: 0, Russia: 2, Syria: 0, "North Korea": 0, Cuba: 0, Venezuela: 0, Myanmar: 0, Belarus: 0 },
    lastScreened: isoHoursAgo(6),
    hits: 0,
    status: "clear",
  },
  {
    entity: "ATW SA",
    exposures: { Iran: 0, Russia: 0, Syria: 0, "North Korea": 0, Cuba: 0, Venezuela: 0, Myanmar: 0, Belarus: 0 },
    lastScreened: isoHoursAgo(12),
    hits: 0,
    status: "clear",
  },
  {
    entity: "CFG Bank",
    exposures: { Iran: 0, Russia: 1, Syria: 0, "North Korea": 0, Cuba: 0, Venezuela: 0, Myanmar: 0, Belarus: 0 },
    lastScreened: isoHoursAgo(2),
    hits: 0,
    status: "clear",
  },
  {
    entity: "OCP Group",
    exposures: { Iran: 0, Russia: 2, Syria: 0, "North Korea": 0, Cuba: 0, Venezuela: 1, Myanmar: 0, Belarus: 0 },
    lastScreened: isoHoursAgo(14),
    hits: 0,
    status: "watch",
  },
  {
    entity: "Marocaine de Distribution",
    exposures: { Iran: 0, Russia: 0, Syria: 0, "North Korea": 0, Cuba: 0, Venezuela: 0, Myanmar: 0, Belarus: 0 },
    lastScreened: isoHoursAgo(20),
    hits: 0,
    status: "clear",
  },
  {
    entity: "HarchCorp Morocco",
    exposures: { Iran: 0, Russia: 1, Syria: 0, "North Korea": 0, Cuba: 0, Venezuela: 0, Myanmar: 0, Belarus: 0 },
    lastScreened: isoHoursAgo(10),
    hits: 0,
    status: "clear",
  },
];

export const sanctionStatusTint: Record<SanctionsHit["status"], { text: string; bg: string; ring: string; dot: string }> = {
  clear: { text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  watch: { text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200", dot: "bg-amber-500" },
  blocked: { text: "text-rose-700", bg: "bg-rose-50", ring: "ring-rose-200", dot: "bg-rose-500" },
};

export interface RegionalRisk {
  region: string;
  flag: string;
  index: number;
  delta: number;
  exposure: number;
  entities: number;
  topRisk: string;
}

export const regionalRisks: RegionalRisk[] = [
  { region: "Morocco", flag: "🇲🇦", index: 48, delta: +1.2, exposure: 412, entities: 6, topRisk: "Regulatory" },
  { region: "European Union", flag: "🇪🇺", index: 38, delta: -0.4, exposure: 286, entities: 4, topRisk: "ESG" },
  { region: "United States", flag: "🇺🇸", index: 42, delta: +0.8, exposure: 168, entities: 3, topRisk: "Sanctions" },
  { region: "MENA (ex-MA)", flag: "🌍", index: 67, delta: +3.4, exposure: 96, entities: 2, topRisk: "Geopolitical" },
  { region: "Sub-Saharan Africa", flag: "🌍", index: 58, delta: +1.8, exposure: 74, entities: 2, topRisk: "Financial" },
  { region: "APAC", flag: "🌏", index: 62, delta: +2.2, exposure: 124, entities: 2, topRisk: "Sanctions" },
];

export interface TradePolicyEvent {
  id: string;
  date: string;
  title: string;
  category: "Tariff" | "Export Control" | "Sanctions" | "Trade Agreement" | "Quota";
  impact: "high" | "medium" | "low";
  jurisdictions: string;
}

export const tradePolicyTimeline: TradePolicyEvent[] = [
  { id: "TPE-014", date: isoDaysAhead(8), title: "EU CBAM Phase 2 — cement & fertilizers", category: "Tariff", impact: "high", jurisdictions: "EU → MA exporters" },
  { id: "TPE-013", date: isoDaysAhead(14), title: "US OFAC SDN list — quarterly update", category: "Sanctions", impact: "medium", jurisdictions: "US → global" },
  { id: "TPE-012", date: isoDaysAgo(3), title: "Morocco-EU Association Committee — annual review", category: "Trade Agreement", impact: "medium", jurisdictions: "MA ↔ EU" },
  { id: "TPE-011", date: isoDaysAgo(11), title: "Russia dual-use export control — 14th sanctions package", category: "Export Control", impact: "high", jurisdictions: "EU → RU" },
  { id: "TPE-010", date: isoDaysAgo(24), title: "US Tariff Schedule — Section 301 review (China-origin)", category: "Tariff", impact: "medium", jurisdictions: "US → CN" },
  { id: "TPE-009", date: isoDaysAgo(38), title: "Tangier Free Zone — quota renewal (textiles)", category: "Quota", impact: "low", jurisdictions: "MA → EU/US" },
  { id: "TPE-008", date: isoDaysAgo(52), title: "WCO HS-2027 harmonized system preview", category: "Trade Agreement", impact: "low", jurisdictions: "Global" },
];

export const tradePolicyTint: Record<TradePolicyEvent["category"], { text: string; bg: string; ring: string }> = {
  Tariff: { text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200" },
  "Export Control": { text: "text-rose-700", bg: "bg-rose-50", ring: "ring-rose-200" },
  Sanctions: { text: "text-violet-700", bg: "bg-violet-50", ring: "ring-violet-200" },
  "Trade Agreement": { text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200" },
  Quota: { text: "text-sky-700", bg: "bg-sky-50", ring: "ring-sky-200" },
};

export const geoSummary = {
  watchEntities: sanctionsHits.filter((s) => s.status === "watch").length,
  blockedEntities: sanctionsHits.filter((s) => s.status === "blocked").length,
  totalScreened: sanctionsHits.length,
  avgIndex: Math.round(regionalRisks.reduce((s, r) => s + r.index, 0) / regionalRisks.length),
  highestRegion: [...regionalRisks].sort((a, b) => b.index - a.index)[0],
  upcomingPolicies: tradePolicyTimeline.filter((t) => Date.parse(t.date) >= Date.parse("2025-11-15T00:00:00Z")).length,
};

/* ================================================================== */
/*  6. REPUTATIONAL (risk-rep)                                         */
/* ================================================================== */

export const reputationIndex = {
  current: 68,
  delta30d: +2.4,
  delta90d: -1.2,
  trend: (() => {
    const out: { day: string; index: number; sentiment: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date("2025-11-15");
      d.setDate(d.getDate() - i);
      const drift = 64 + 4 * Math.sin(i / 4.2) + (rnd() - 0.5) * 2.4 + (29 - i) * 0.12;
      out.push({
        day: d.toISOString().slice(5, 10),
        index: Math.round(drift * 10) / 10,
        sentiment: Math.round((drift - 35) * 10) / 10,
      });
    }
    return out;
  })(),
};

export interface ExecutiveRep {
  name: string;
  title: string;
  sentiment: number;
  delta: number;
  mentions: number;
  negative: number;
}

export const executiveReps: ExecutiveRep[] = [
  { name: "Alessandro Marchetti", title: "Group CEO", sentiment: 72, delta: +3.1, mentions: 412, negative: 18 },
  { name: "Sofia Dubois", title: "Group CFO", sentiment: 65, delta: -1.4, mentions: 286, negative: 26 },
  { name: "Youssef Haddad", title: "COO, Logistics EU", sentiment: 71, delta: +1.2, mentions: 184, negative: 14 },
  { name: "Inès Mansouri", title: "Chief Sustainability Officer", sentiment: 78, delta: +4.6, mentions: 142, negative: 8 },
  { name: "Mehdi Benali", title: "Chief Compliance Officer", sentiment: 62, delta: -0.8, mentions: 96, negative: 22 },
  { name: "Camille Petit", title: "General Counsel", sentiment: 74, delta: +2.4, mentions: 88, negative: 10 },
];

export interface ReputationControversy {
  id: string;
  date: string;
  title: string;
  severity: Severity;
  status: "open" | "responding" | "resolved";
  reach: number;
  outlet: string;
}

export const reputationControversies: ReputationControversy[] = [
  { id: "RC-018", date: isoDaysAgo(2), title: "Q3 earnings call — analyst pushback on margin guidance", severity: "medium", status: "responding", reach: 12400, outlet: "Bloomberg" },
  { id: "RC-017", date: isoDaysAgo(6), title: "Casablanca port incident — contractor safety concerns", severity: "high", status: "responding", reach: 8600, outlet: "Medias24" },
  { id: "RC-016", date: isoDaysAgo(11), title: "Executive pay disclosure — social media criticism", severity: "low", status: "open", reach: 4200, outlet: "Twitter / X" },
  { id: "RC-015", date: isoDaysAgo(18), title: "AML compliance — analyst note flags CFG Bank exposure", severity: "high", status: "resolved", reach: 6800, outlet: "Reuters" },
  { id: "RC-014", date: isoDaysAgo(28), title: "Cyber incident — customer PII concerns", severity: "critical", status: "responding", reach: 18200, outlet: "L'Économiste" },
  { id: "RC-013", date: isoDaysAgo(40), title: "Sustainability targets — NGO scrutiny on water usage", severity: "medium", status: "resolved", reach: 3200, outlet: "TelQuel" },
  { id: "RC-012", date: isoDaysAgo(56), title: "Labor practices — subcontractor dispute coverage", severity: "medium", status: "resolved", reach: 5400, outlet: "Forbes Afrique" },
];

export interface StakeholderSentiment {
  stakeholder: string;
  positive: number;
  neutral: number;
  negative: number;
}

export const stakeholderSentiment: StakeholderSentiment[] = [
  { stakeholder: "Investors", positive: 48, neutral: 32, negative: 20 },
  { stakeholder: "Customers", positive: 56, neutral: 28, negative: 16 },
  { stakeholder: "Employees", positive: 52, neutral: 30, negative: 18 },
  { stakeholder: "Regulators", positive: 38, neutral: 44, negative: 18 },
  { stakeholder: "Media", positive: 34, neutral: 38, negative: 28 },
  { stakeholder: "NGOs", positive: 22, neutral: 42, negative: 36 },
  { stakeholder: "Analysts", positive: 44, neutral: 36, negative: 20 },
];

export const reputationSummary = {
  current: reputationIndex.current,
  delta30d: reputationIndex.delta30d,
  nps: 38,
  npsDelta: +4,
  openControversies: reputationControversies.filter((c) => c.status !== "resolved").length,
  criticalControversies: reputationControversies.filter((c) => c.severity === "critical" && c.status !== "resolved").length,
  avgExecutive: Math.round(executiveReps.reduce((s, e) => s + e.sentiment, 0) / executiveReps.length),
  totalReach: reputationControversies.filter((c) => c.status !== "resolved").reduce((s, c) => s + c.reach, 0),
};

/* ================================================================== */
/*  7. LEGAL MATTERS (risk-matters)                                    */
/* ================================================================== */

export type MatterType =
  | "Litigation"
  | "Arbitration"
  | "Regulatory Inquiry"
  | "IP"
  | "Contract"
  | "Compliance Investigation"
  | "Employment"
  | "Real Estate";

export type MatterStatus =
  | "active"
  | "filing"
  | "discovery"
  | "hearing"
  | "settlement"
  | "closed";

export interface LegalMatter {
  id: string;
  name: string;
  type: MatterType;
  counterparty: string;
  counsel: string;
  status: MatterStatus;
  /** Budget in USD thousands. */
  budget: number;
  /** Burn to date in USD thousands. */
  burn: number;
  /** Next milestone. */
  nextMilestone: string;
  /** Deadline ISO date. */
  deadline: string;
  /** Jurisdiction. */
  jurisdiction: string;
  /** Exposure amount in USD thousands. */
  exposure: number;
}

const counselFirms = [
  "Clifford Chance (Paris)",
  "Gide Loyrette Nouel (Casablanca)",
  "Baker McKenzie (London)",
  "Naciri & Associés (Rabat)",
  "Allen & Overy (Paris)",
  "K&L Gates (New York)",
  "CMS Camozzi (Milan)",
  "Latham & Watkins (Brussels)",
];

export const legalMatters: LegalMatter[] = [
  {
    id: "MAT-0001",
    name: "ATW SA shareholder derivative suit",
    type: "Litigation",
    counterparty: "Atlas Holdings SARL",
    counsel: "Naciri & Associés (Rabat)",
    status: "discovery",
    budget: 850,
    burn: 412,
    nextMilestone: "Document production close",
    deadline: isoDaysAhead(28),
    jurisdiction: "Morocco · Commercial Court",
    exposure: 4200,
  },
  {
    id: "MAT-0002",
    name: "CFG Bank AML inquiry",
    type: "Regulatory Inquiry",
    counterparty: "Bank Al-Maghrib",
    counsel: "Gide Loyrette Nouel (Casablanca)",
    status: "active",
    budget: 620,
    burn: 184,
    nextMilestone: "Supplemental filing",
    deadline: isoDaysAhead(14),
    jurisdiction: "Morocco · BAM",
    exposure: 1800,
  },
  {
    id: "MAT-0003",
    name: "Logistics EU subcontractor arbitration",
    type: "Arbitration",
    counterparty: "Rhenus Logistics",
    counsel: "Allen & Overy (Paris)",
    status: "hearing",
    budget: 540,
    burn: 378,
    nextMilestone: "Tribunal hearing · Paris ICC",
    deadline: isoDaysAhead(42),
    jurisdiction: "France · ICC",
    exposure: 960,
  },
  {
    id: "MAT-0004",
    name: "Brand trademark — opposition filing",
    type: "IP",
    counterparty: "Harcho Industries SA",
    counsel: "Baker McKenzie (London)",
    status: "filing",
    budget: 180,
    burn: 92,
    nextMilestone: "EUIPO opposition brief",
    deadline: isoDaysAhead(18),
    jurisdiction: "EU · EUIPO",
    exposure: 240,
  },
  {
    id: "MAT-0005",
    name: "OCP supply contract dispute",
    type: "Contract",
    counterparty: "OCP Group",
    counsel: "Naciri & Associés (Rabat)",
    status: "settlement",
    budget: 280,
    burn: 196,
    nextMilestone: "Mediation session #3",
    deadline: isoDaysAhead(7),
    jurisdiction: "Morocco · Arbitration",
    exposure: 620,
  },
  {
    id: "MAT-0006",
    name: "Tangier plant emissions — regulator action",
    type: "Regulatory Inquiry",
    counterparty: "Moroccan Ministry of Environment",
    counsel: "Gide Loyrette Nouel (Casablanca)",
    status: "active",
    budget: 320,
    burn: 88,
    nextMilestone: "Remediation plan submission",
    deadline: isoDaysAhead(21),
    jurisdiction: "Morocco",
    exposure: 1100,
  },
  {
    id: "MAT-0007",
    name: "Cyber incident — class action certification",
    type: "Litigation",
    counterparty: "Customer class (14k)",
    counsel: "Latham & Watkins (Brussels)",
    status: "filing",
    budget: 980,
    burn: 142,
    nextMilestone: "Class certification response",
    deadline: isoDaysAhead(35),
    jurisdiction: "EU · cross-border",
    exposure: 4800,
  },
  {
    id: "MAT-0008",
    name: "Executive separation — Non-compete enforcement",
    type: "Employment",
    counterparty: "Former COO",
    counsel: "CMS Camozzi (Milan)",
    status: "active",
    budget: 140,
    burn: 78,
    nextMilestone: "Injunction hearing",
    deadline: isoDaysAhead(11),
    jurisdiction: "Italy · Milan",
    exposure: 320,
  },
  {
    id: "MAT-0009",
    name: "LBV Real Estate — leasehold dispute",
    type: "Real Estate",
    counterparty: "Casablanca Free Zone",
    counsel: "Naciri & Associés (Rabat)",
    status: "discovery",
    budget: 120,
    burn: 64,
    nextMilestone: "Site inspection",
    deadline: isoDaysAhead(48),
    jurisdiction: "Morocco",
    exposure: 280,
  },
  {
    id: "MAT-0010",
    name: "Sanctions screening — voluntary self-disclosure",
    type: "Compliance Investigation",
    counterparty: "OFAC",
    counsel: "K&L Gates (New York)",
    status: "active",
    budget: 460,
    burn: 218,
    nextMilestone: "VSD supplemental response",
    deadline: isoDaysAhead(25),
    jurisdiction: "US · OFAC",
    exposure: 2400,
  },
  {
    id: "MAT-0011",
    name: "Energy APAC joint venture arbitration",
    type: "Arbitration",
    counterparty: "Singapore Energy Holdings",
    counsel: "Clifford Chance (Paris)",
    status: "hearing",
    budget: 720,
    burn: 538,
    nextMilestone: "Witness testimony · SIAC",
    deadline: isoDaysAhead(56),
    jurisdiction: "Singapore · SIAC",
    exposure: 1600,
  },
  {
    id: "MAT-0012",
    name: "Marocaine de Distribution — merger clearance",
    type: "Regulatory Inquiry",
    counterparty: "Moroccan Competition Council",
    counsel: "Gide Loyrette Nouel (Casablanca)",
    status: "filing",
    budget: 220,
    burn: 96,
    nextMilestone: "Phase-II notification",
    deadline: isoDaysAhead(38),
    jurisdiction: "Morocco",
    exposure: 540,
  },
];

export const matterStatusTint: Record<MatterStatus, { text: string; bg: string; ring: string; dot: string }> = {
  active: { text: "text-sky-700", bg: "bg-sky-50", ring: "ring-sky-200", dot: "bg-sky-500" },
  filing: { text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200", dot: "bg-amber-500" },
  discovery: { text: "text-violet-700", bg: "bg-violet-50", ring: "ring-violet-200", dot: "bg-violet-500" },
  hearing: { text: "text-rose-700", bg: "bg-rose-50", ring: "ring-rose-200", dot: "bg-rose-500" },
  settlement: { text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  closed: { text: "text-slate-600", bg: "bg-slate-100", ring: "ring-slate-200", dot: "bg-slate-400" },
};

export const matterTypeColor: Record<MatterType, string> = {
  Litigation: "#f43f5e",
  Arbitration: "#a855f7",
  "Regulatory Inquiry": "#7c3aed",
  IP: "#0ea5e9",
  Contract: "#10b981",
  "Compliance Investigation": "#f59e0b",
  Employment: "#14b8a6",
  "Real Estate": "#64748b",
};

/** Matters-by-status counts (for donut). */
export const mattersByStatus = (() => {
  const statusOrder: MatterStatus[] = ["active", "filing", "discovery", "hearing", "settlement", "closed"];
  return statusOrder
    .map((s) => ({ status: s, count: legalMatters.filter((m) => m.status === s).length }))
    .filter((x) => x.count > 0);
})();

export const mattersSummary = {
  total: legalMatters.length,
  active: legalMatters.filter((m) => m.status !== "closed").length,
  totalBudget: legalMatters.reduce((s, m) => s + m.budget, 0),
  totalBurn: legalMatters.reduce((s, m) => s + m.burn, 0),
  totalExposure: legalMatters.reduce((s, m) => s + m.exposure, 0),
  dueNext14d: legalMatters.filter((m) => {
    const d = Date.parse(m.deadline);
    return d >= Date.parse("2025-11-15T00:00:00Z") && d <= Date.parse("2025-11-29T00:00:00Z");
  }).length,
  overBudget: legalMatters.filter((m) => m.burn / m.budget > 0.8).length,
  externalCounsel: new Set(legalMatters.map((m) => m.counsel)).size,
};

/* ================================================================== */
/*  8. LITIGATION HOLDS (risk-holds)                                   */
/* ================================================================== */

export type HoldStatus = "active" | "released" | "superseded" | "pending_release";

export interface LitigationHold {
  id: string;
  /** Linked matter. */
  matter: string;
  matterId: string;
  /** Issued ISO date. */
  issued: string;
  /** Number of custodians. */
  custodians: number;
  /** Data sources preserved. */
  dataSources: string[];
  status: HoldStatus;
  /** Last reminder ISO date. */
  lastReminder: string;
  /** Total data volume preserved (GB). */
  volumeGb: number;
}

export const litigationHolds: LitigationHold[] = [
  {
    id: "HLD-001",
    matter: "ATW SA shareholder derivative suit",
    matterId: "MAT-0001",
    issued: isoDaysAgo(124),
    custodians: 18,
    dataSources: ["Exchange", "OneDrive", "Slack", "Bloomberg Terminal"],
    status: "active",
    lastReminder: isoDaysAgo(7),
    volumeGb: 184,
  },
  {
    id: "HLD-002",
    matter: "CFG Bank AML inquiry",
    matterId: "MAT-0002",
    issued: isoDaysAgo(64),
    custodians: 12,
    dataSources: ["Exchange", "Trade Repository", "Bloomberg Terminal", "Reuters Eikon"],
    status: "active",
    lastReminder: isoDaysAgo(3),
    volumeGb: 96,
  },
  {
    id: "HLD-003",
    matter: "Logistics EU subcontractor arbitration",
    matterId: "MAT-0003",
    issued: isoDaysAgo(96),
    custodians: 9,
    dataSources: ["Exchange", "OneDrive", "Teams", "Confluence"],
    status: "active",
    lastReminder: isoDaysAgo(11),
    volumeGb: 142,
  },
  {
    id: "HLD-004",
    matter: "Cyber incident — class action certification",
    matterId: "MAT-0007",
    issued: isoDaysAgo(38),
    custodians: 28,
    dataSources: ["Exchange", "Jira", "PagerDuty", "Splunk", "AWS CloudTrail"],
    status: "active",
    lastReminder: isoDaysAgo(2),
    volumeGb: 312,
  },
  {
    id: "HLD-005",
    matter: "Sanctions screening — voluntary self-disclosure",
    matterId: "MAT-0010",
    issued: isoDaysAgo(52),
    custodians: 7,
    dataSources: ["Exchange", "Sanctions Screening Platform", "SAP AML"],
    status: "active",
    lastReminder: isoDaysAgo(5),
    volumeGb: 64,
  },
  {
    id: "HLD-006",
    matter: "Energy APAC joint venture arbitration",
    matterId: "MAT-0011",
    issued: isoDaysAgo(88),
    custodians: 14,
    dataSources: ["Exchange", "OneDrive", "Box", "ShareFile"],
    status: "active",
    lastReminder: isoDaysAgo(9),
    volumeGb: 218,
  },
  {
    id: "HLD-007",
    matter: "Marocaine de Distribution — merger clearance",
    matterId: "MAT-0012",
    issued: isoDaysAgo(12),
    custodians: 6,
    dataSources: ["Exchange", "OneDrive"],
    status: "pending_release",
    lastReminder: isoDaysAgo(1),
    volumeGb: 28,
  },
  {
    id: "HLD-008",
    matter: "OCP supply contract dispute",
    matterId: "MAT-0005",
    issued: isoDaysAgo(180),
    custodians: 8,
    dataSources: ["Exchange", "SAP ERP", "OneDrive"],
    status: "superseded",
    lastReminder: isoDaysAgo(42),
    volumeGb: 96,
  },
  {
    id: "HLD-009",
    matter: "LBV Real Estate — leasehold dispute (closed)",
    matterId: "MAT-0009",
    issued: isoDaysAgo(220),
    custodians: 4,
    dataSources: ["Exchange", "OneDrive"],
    status: "released",
    lastReminder: isoDaysAgo(140),
    volumeGb: 18,
  },
];

export const holdStatusTint: Record<HoldStatus, { text: string; bg: string; ring: string; dot: string }> = {
  active: { text: "text-violet-700", bg: "bg-violet-50", ring: "ring-violet-200", dot: "bg-violet-500" },
  pending_release: { text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200", dot: "bg-amber-500" },
  released: { text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  superseded: { text: "text-slate-600", bg: "bg-slate-100", ring: "ring-slate-200", dot: "bg-slate-400" },
};

/** Custodian coverage by data source (for stacked bar chart). */
export const custodianCoverage: { source: string; custodians: number; holds: number }[] = [
  { source: "Exchange", custodians: 78, holds: 9 },
  { source: "OneDrive", custodians: 54, holds: 7 },
  { source: "Teams", custodians: 32, holds: 3 },
  { source: "Slack", custodians: 28, holds: 2 },
  { source: "Bloomberg Terminal", custodians: 14, holds: 3 },
  { source: "Splunk", custodians: 18, holds: 2 },
  { source: "AWS CloudTrail", custodians: 22, holds: 1 },
  { source: "Jira", custodians: 24, holds: 1 },
];

/** Hold-status timeline — 90 days of active vs released holds. */
export const holdTimeline90d: { week: string; active: number; released: number; superseded: number }[] = (() => {
  const out: { week: string; active: number; released: number; superseded: number }[] = [];
  for (let i = 12; i >= 0; i--) {
    const d = new Date("2025-11-15");
    d.setDate(d.getDate() - i * 7);
    out.push({
      week: d.toISOString().slice(5, 10),
      active: 6 + Math.round(2 * Math.sin(i / 2.3) + (rnd() - 0.5) * 2),
      released: Math.round(rnd() * 1.6),
      superseded: Math.round(rnd() * 0.8),
    });
  }
  return out;
})();

export const holdsSummary = {
  total: litigationHolds.length,
  active: litigationHolds.filter((h) => h.status === "active").length,
  pendingRelease: litigationHolds.filter((h) => h.status === "pending_release").length,
  released: litigationHolds.filter((h) => h.status === "released").length,
  totalCustodians: litigationHolds
    .filter((h) => h.status === "active" || h.status === "pending_release")
    .reduce((s, h) => s + h.custodians, 0),
  totalVolumeGb: litigationHolds
    .filter((h) => h.status === "active" || h.status === "pending_release")
    .reduce((s, h) => s + h.volumeGb, 0),
  remindersDue: litigationHolds.filter((h) => {
    const d = Date.parse(h.lastReminder);
    return Date.parse("2025-11-15T00:00:00Z") - d > 7 * 86400000 && (h.status === "active" || h.status === "pending_release");
  }).length,
  avgCustodians: Math.round(
    litigationHolds.reduce((s, h) => s + h.custodians, 0) / litigationHolds.length,
  ),
};
