"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  Bug,
  ChevronDown,
  ChevronUp,
  Filter,
  Lock,
  Search,
  ShieldCheck,
  TimerReset,
  XCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { DeferredChart } from "@/components/dataviz/chart-skeleton";
import { SectionHeader, StatusChip } from "../section-header";
import {
  PanelCard,
  PanelHeader,
  StatTile,
  Tag,
  StaggerGrid,
  MetricRing,
  EmptyState,
  motionVariants,
} from "../design-system";
import { motion } from "framer-motion";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  cyberIncidents,
  cyberReadinessRadar,
  cyberStatusTint,
  cyberSummary,
  cyberTrend30d,
  cveExposure,
  relativeTime,
  severityTint,
  type CyberIncident,
  type CyberIncidentStatus,
} from "@/lib/legal-data";
import type { Severity } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { KpiSkeletonGrid, PanelSkeletons, PremiumTooltip, useMountReady } from "./_shared";

type SortKey = "id" | "type" | "entity" | "severity" | "status" | "detected" | "tactic";

const severityRank: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 };
const severityTone: Record<Severity, "negative" | "warning" | "info" | "neutral"> = {
  critical: "negative",
  high: "warning",
  medium: "info",
  low: "neutral",
};
const cyberStatusTone: Record<CyberIncidentStatus, "negative" | "warning" | "info" | "neutral" | "positive"> = {
  open: "negative",
  investigating: "warning",
  contained: "info",
  remediated: "positive",
  disclosed: "neutral",
};

/* ------------------------------------------------------------------ */
/*  Cyber posture gauge (premium MetricRing)                           */
/* ------------------------------------------------------------------ */

function PostureGauge() {
  const score = cyberSummary.posture;
  const verdict = score > 75 ? "Resilient" : score > 55 ? "Moderate" : "At Risk";
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <MetricRing value={score} size={172} stroke={11} sublabel="Posture" />
      <div className="flex flex-col items-center gap-1 text-center">
        <span
          className={cn(
            "text-[12px] font-bold uppercase tracking-wider",
            score > 75 ? "text-emerald-700" : score > 55 ? "text-amber-700" : "text-rose-700",
          )}
        >
          {verdict}
        </span>
        <span className="text-[10px] uppercase tracking-wide text-slate-400">0–100 · CISO composite</span>
      </div>
      <div className="grid w-full grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
        <div>
          <div className="tabular text-[14px] font-bold text-slate-900">{cyberSummary.total}</div>
          <div className="text-[9px] uppercase tracking-wide text-slate-400">Total</div>
        </div>
        <div>
          <div className="tabular text-[14px] font-bold text-rose-700">{cyberSummary.critical}</div>
          <div className="text-[9px] uppercase tracking-wide text-slate-400">Critical</div>
        </div>
        <div>
          <div className="tabular text-[14px] font-bold text-slate-900">{cyberSummary.avgMttr}h</div>
          <div className="text-[9px] uppercase tracking-wide text-slate-400">Avg MTTR</div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  30-day incident trend                                               */
/* ------------------------------------------------------------------ */

function IncidentTrend() {
  return (
    <DeferredChart height="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={cyberTrend30d} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="incTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="incCrit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} minTickGap={20} />
          <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              const total = payload.find((p) => p.dataKey === "incidents")?.value ?? 0;
              const crit = payload.find((p) => p.dataKey === "critical")?.value ?? 0;
              return (
                <PremiumTooltip
                  header={label}
                  rows={[
                    { label: "Total incidents", value: `${total}`, tone: "violet" },
                    { label: "Critical", value: `${crit}`, tone: "rose" },
                  ]}
                />
              );
            }}
          />
          <Area type="monotone" dataKey="incidents" stroke="#a855f7" strokeWidth={1.8} fill="url(#incTotal)" />
          <Area type="monotone" dataKey="critical" stroke="#f43f5e" strokeWidth={1.5} fill="url(#incCrit)" />
        </AreaChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Cyber readiness radar                                              */
/* ------------------------------------------------------------------ */

function ReadinessRadar() {
  const [showTarget, setShowTarget] = React.useState(true);
  return (
    <div className="flex flex-col gap-2">
      <DeferredChart height="h-[230px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={cyberReadinessRadar} outerRadius="70%">
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: "#475569" }} />
            <PolarRadiusAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="Current" dataKey="score" stroke="#7c3aed" strokeWidth={2} fill="#7c3aed" fillOpacity={0.25} />
            {showTarget ? (
              <Radar name="Target" dataKey="target" stroke="#94a3b8" strokeWidth={1.2} strokeDasharray="4 4" fill="#94a3b8" fillOpacity={0.05} />
            ) : null}
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length || !label) return null;
                const cur = payload.find((p) => p.dataKey === "score")?.value ?? 0;
                const tgt = payload.find((p) => p.dataKey === "target")?.value ?? 0;
                return (
                  <PremiumTooltip
                    header={label}
                    rows={[
                      { label: "Current", value: `${cur}`, tone: "violet" },
                      { label: "Target", value: `${tgt}`, tone: "slate" },
                    ]}
                  />
                );
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </DeferredChart>
      <div className="flex items-center justify-center gap-3 border-t border-slate-100 pt-2">
        <button
          onClick={() => setShowTarget(true)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1 transition-colors",
            showTarget ? "bg-violet-700 text-white ring-violet-700" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Target
        </button>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-600" /> Current
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function CyberRisk(_: SectionComponentProps) {
  const ready = useMountReady();
  const [sortKey, setSortKey] = React.useState<SortKey>("detected");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = React.useState<CyberIncidentStatus | "all">("all");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    let list = cyberIncidents.slice();
    if (statusFilter !== "all") list = list.filter((i) => i.status === statusFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q) ||
          i.entity.toLowerCase().includes(q) ||
          i.summary.toLowerCase().includes(q) ||
          i.tactic.toLowerCase().includes(q),
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (sortKey === "detected") return (Date.parse(a.detected) - Date.parse(b.detected)) * dir;
      if (sortKey === "severity") return (severityRank[a.severity] - severityRank[b.severity]) * dir;
      return String(a[sortKey]).localeCompare(String(b[sortKey])) * dir;
    });
    return list;
  }, [statusFilter, query, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };
  const renderSortIcon = (col: SortKey) => {
    if (sortKey !== col) return <ChevronDown className="h-3 w-3 text-slate-300" />;
    return sortDir === "asc" ? <ChevronUp className="h-3 w-3 text-slate-700" /> : <ChevronDown className="h-3 w-3 text-slate-700" />;
  };

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="risk-cyber"
        accountType="legal"
        accent="violet"
        statusChips={
          <>
            <StatusChip label={`${cyberSummary.open} open`} tone="negative" icon={AlertTriangle} pulse />
            <StatusChip label={`${cyberSummary.disclosed} disclosed`} tone="neutral" icon={Lock} />
            <StatusChip label={`${cyberSummary.criticalCves} critical CVEs`} tone="negative" icon={Bug} />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile label="Active Incidents" value={`${cyberSummary.total}`} hint="Last 30 days" icon={AlertTriangle} accent="violet" />
              <StatTile label="Open / Investigating" value={`${cyberSummary.open}`} hint="Awaiting containment" icon={XCircle} accent="rose" />
              <StatTile label="Critical Severity" value={`${cyberSummary.critical}`} hint="CISO-escalated" icon={AlertTriangle} accent="rose" />
              <StatTile label="Disclosure Triggered" value={`${cyberSummary.disclosureTriggered}`} hint="Loi 09-08 / GDPR" icon={Lock} accent="amber" />
              <StatTile label="Avg MTTR" value={`${cyberSummary.avgMttr}h`} hint="Mean time to contain" icon={TimerReset} />
              <StatTile label="Unpatched CVEs" value={`${cyberSummary.unpatchedCves}`} hint={`${cyberSummary.criticalCves} critical`} icon={Bug} accent="amber" />
            </StaggerGrid>
          ) : (
            <KpiSkeletonGrid />
          )
        }
      />

      {!ready ? (
        <PanelSkeletons count={2} />
      ) : (
        <motion.div
          variants={motionVariants.container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-5"
        >
          {/* Posture gauge + trend */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <PanelCard accent="violet">
              <PanelHeader
                title="Cyber Posture Index"
                subtitle="Composite readiness · 0–100"
                icon={ShieldCheck}
                accent="violet"
              />
              <div className="p-4">
                <PostureGauge />
              </div>
            </PanelCard>
            <PanelCard
              accent="violet"
              className="xl:col-span-2"
            >
              <PanelHeader
                title="Incident Trend — 30 days"
                subtitle="Daily incident volume · total vs critical"
                icon={AlertTriangle}
                accent="violet"
                action={
                  <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wide">
                    <span className="inline-flex items-center gap-1 text-violet-700"><span className="h-1.5 w-1.5 rounded-full bg-violet-500" /> Total</span>
                    <span className="inline-flex items-center gap-1 text-rose-700"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Critical</span>
                  </div>
                }
              />
              <div className="p-4">
                <IncidentTrend />
              </div>
            </PanelCard>
          </div>

          {/* Readiness radar + CVE exposure */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <PanelCard accent="violet">
              <PanelHeader
                title="Cyber Readiness Radar"
                subtitle="Posture dimensions · current vs target"
                icon={ShieldCheck}
                accent="violet"
                action={<Tag tone="neutral">8 dimensions</Tag>}
              />
              <div className="p-4">
                <ReadinessRadar />
              </div>
            </PanelCard>
            <PanelCard accent="violet">
              <PanelHeader
                title="CVE Exposure"
                subtitle="Top vulnerabilities across the estate"
                icon={Bug}
                accent="violet"
                action={<Tag tone="neutral">{cveExposure.length} tracked</Tag>}
              />
              <div className="max-h-[300px] overflow-y-auto harch-scroll">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-white">
                    <TableRow className="text-[10px] uppercase tracking-wider text-slate-500 hover:bg-transparent">
                      <TableHead>CVE</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">CVSS</TableHead>
                      <TableHead className="text-right">Affected</TableHead>
                      <TableHead>Exploit</TableHead>
                      <TableHead>Patch</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cveExposure.map((c) => (
                      <TableRow key={c.cve} className="text-[12px] hover:bg-slate-50">
                        <TableCell className="font-mono text-[11px] font-semibold text-violet-700">{c.cve}</TableCell>
                        <TableCell className="text-slate-700">{c.product}</TableCell>
                        <TableCell className="tabular text-right">
                          <Tag tone={c.cvss >= 9 ? "negative" : c.cvss >= 7 ? "warning" : "info"} size="xs">{c.cvss.toFixed(1)}</Tag>
                        </TableCell>
                        <TableCell className="tabular text-right text-slate-700">{c.affected}</TableCell>
                        <TableCell className="capitalize">
                          <Tag tone={c.exploit === "active" ? "negative" : c.exploit === "poc" ? "warning" : "neutral"} size="xs">{c.exploit}</Tag>
                        </TableCell>
                        <TableCell>
                          {c.patched ? (
                            <Tag tone="positive" size="xs" icon={ShieldCheck}>Patched</Tag>
                          ) : (
                            <Tag tone="negative" size="xs" icon={AlertTriangle}>Pending</Tag>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </PanelCard>
          </div>

          {/* Threat feed table */}
          <PanelCard accent="violet">
            <PanelHeader
              title="Threat Intel Feed"
              subtitle="Open + closed cyber incidents · MITRE ATT&CK mapped"
              icon={Bug}
              accent="violet"
              action={
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search incident, entity, tactic…"
                      className="h-7 w-56 pl-7 text-[11px] sm:w-64"
                    />
                  </div>
                </div>
              }
            />
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-3 py-2.5">
              <Filter className="h-3 w-3 text-slate-400" />
              <button
                onClick={() => setStatusFilter("all")}
                className={cn(
                  "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 transition-colors",
                  statusFilter === "all" ? "bg-violet-700 text-white ring-violet-700" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
                )}
              >
                All
              </button>
              {(Object.keys(cyberStatusTint) as CyberIncidentStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 transition-colors capitalize",
                    statusFilter === s ? "bg-violet-700 text-white ring-violet-700" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
                  )}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>

            <div className="max-h-[560px] overflow-y-auto harch-scroll">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-white">
                  <TableRow className="text-[10px] uppercase tracking-wider text-slate-500 hover:bg-transparent">
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("id")}>
                        ID {renderSortIcon("id")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("type")}>
                        Type {renderSortIcon("type")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("severity")}>
                        Severity {renderSortIcon("severity")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("entity")}>
                        Entity {renderSortIcon("entity")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("tactic")}>
                        MITRE Tactic {renderSortIcon("tactic")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("status")}>
                        Status {renderSortIcon("status")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("detected")}>
                        Detected {renderSortIcon("detected")}
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((i: CyberIncident) => {
                    const tint = cyberStatusTint[i.status];
                    const sev = severityTint[i.severity];
                    return (
                      <TableRow key={i.id} className="text-[12px] hover:bg-slate-50">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-mono text-[11px] font-semibold text-violet-700">{i.id}</span>
                            {i.disclosureTriggered ? (
                              <span className="mt-1 inline-flex">
                                <Tag tone="negative" size="xs" icon={Lock}>Disclosure</Tag>
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{i.type}</span>
                            <span className="truncate text-[10px] text-slate-400 max-w-[220px]" title={i.summary}>{i.summary}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Tag tone={severityTone[i.severity]} size="sm">
                            <span className={cn("h-1.5 w-1.5 rounded-full", sev.dot)} />
                            {i.severity}
                          </Tag>
                        </TableCell>
                        <TableCell className="text-slate-700">{i.entity}</TableCell>
                        <TableCell className="text-slate-600">{i.tactic}</TableCell>
                        <TableCell>
                          <Tag tone={cyberStatusTone[i.status]} size="sm">
                            <span className={cn("h-1.5 w-1.5 rounded-full", tint.dot)} />
                            {i.status.replace("_", " ")}
                          </Tag>
                        </TableCell>
                        <TableCell className="tabular whitespace-nowrap text-slate-500">
                          <div className="flex flex-col">
                            <span>{relativeTime(i.detected)}</span>
                            {i.mttrHours > 0 ? <span className="text-[10px] text-slate-400">MTTR {i.mttrHours}h</span> : <span className="text-[10px] text-amber-600">ongoing</span>}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8">
                        <EmptyState icon={Search} title="No incidents match the current filters." description="Try clearing the search or status filter." accent="violet" />
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Bug className="h-3.5 w-3.5 text-violet-600" />
                Showing <span className="tabular font-semibold text-slate-700">{filtered.length}</span> of {cyberIncidents.length} incidents · MITRE ATT&CK mapped
              </span>
              <span className="text-slate-400">Disclosure SLA: 72h · Loi 09-08 / GDPR Article 33</span>
            </div>
          </PanelCard>
        </motion.div>
      )}
    </div>
  );
}
