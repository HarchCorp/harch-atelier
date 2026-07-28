"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertOctagon,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  Search,
  ShieldAlert,
  TimerReset,
  UserCheck,
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
import { ChartCard } from "@/components/dataviz/chart-card";
import { DeferredChart } from "@/components/dataviz/chart-skeleton";
import { SectionHeader, StatusChip } from "../section-header";
import {
  PanelCard,
  PanelHeader,
  StaggerGrid,
  StatTile,
  Tag,
  type RoleAccent,
} from "../design-system";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  alertQueue,
  alertQueueStatusTint,
  alertSummary,
  alertVolume14d,
  pillarColor,
  relativeTime,
  type AlertQueueItem,
  type AlertQueueStatus,
} from "@/lib/admin-data";
import type { RiskPillar, Severity } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type SortKey = "id" | "entity" | "pillar" | "severity" | "triggeredAt" | "status" | "slaMinutes";

const severityRank: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 };

const severityTone: Record<Severity, "negative" | "warning" | "info" | "neutral"> = {
  critical: "negative",
  high: "warning",
  medium: "info",
  low: "neutral",
};

const statusTone: Record<AlertQueueStatus, "negative" | "warning" | "info" | "positive"> = {
  open: "negative",
  assigned: "warning",
  ack: "info",
  resolved: "positive",
  breach: "negative",
};

/* ------------------------------------------------------------------ */
/*  Volume sparkline                                                   */
/* ------------------------------------------------------------------ */

function VolumeSparkline() {
  return (
    <DeferredChart height="h-[100px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={alertVolume14d} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="alertVol" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} minTickGap={20} />
          <YAxis hide domain={[0, "auto"]} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const v = payload[0].value as number;
              return (
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-lg">
                  <div className="tabular text-[11px] font-semibold text-slate-800">{v} alerts</div>
                  <div className="text-[10px] text-slate-400">{label}</div>
                </div>
              );
            }}
          />
          <Area type="monotone" dataKey="volume" stroke="#f43f5e" strokeWidth={1.4} fill="url(#alertVol)" />
        </AreaChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

const summaryAccent: Record<"open" | "critical" | "assigned" | "breach", RoleAccent> = {
  open: "rose",
  critical: "rose",
  assigned: "amber",
  breach: "rose",
};

export function AlertsQueue(_: SectionComponentProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>("triggeredAt");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [sevFilter, setSevFilter] = React.useState<Severity | "all">("all");
  const [pillarFilter, setPillarFilter] = React.useState<RiskPillar | "all">("all");
  const [statusFilter, setStatusFilter] = React.useState<AlertQueueStatus | "all">("all");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    let list = alertQueue.slice();
    if (sevFilter !== "all") list = list.filter((a) => a.severity === sevFilter);
    if (pillarFilter !== "all") list = list.filter((a) => a.pillar === pillarFilter);
    if (statusFilter !== "all") list = list.filter((a) => a.status === statusFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (a) => a.id.toLowerCase().includes(q) || a.entity.toLowerCase().includes(q) || a.rule.toLowerCase().includes(q),
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (sortKey === "severity") return (severityRank[a.severity] - severityRank[b.severity]) * dir;
      if (sortKey === "triggeredAt") return (Date.parse(a.triggeredAt) - Date.parse(b.triggeredAt)) * dir;
      if (sortKey === "slaMinutes") return (a.slaMinutes - b.slaMinutes) * dir;
      return String(a[sortKey]).localeCompare(String(b[sortKey])) * dir;
    });
    return list;
  }, [sevFilter, pillarFilter, statusFilter, query, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };
  const renderSortIcon = (col: SortKey) => {
    if (sortKey !== col) return <ChevronDown className="h-3 w-3 text-slate-300" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 text-slate-700" />
    ) : (
      <ChevronDown className="h-3 w-3 text-slate-700" />
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="intel-alerts"
        accountType="admin"
        accent="rose"
        statusChips={
          <>
            <StatusChip label={`${alertSummary.open} open`} tone="negative" icon={Bell} pulse={alertSummary.open > 5} />
            {alertSummary.critical > 0 ? (
              <StatusChip label={`${alertSummary.critical} critical`} tone="negative" icon={AlertOctagon} />
            ) : null}
            {alertSummary.breach > 0 ? (
              <StatusChip label={`${alertSummary.breach} SLA breach`} tone="negative" icon={TimerReset} />
            ) : null}
          </>
        }
        kpis={
          <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatTile label="Open" value={`${alertSummary.open}`} hint="Awaiting triage" icon={Bell} accent="rose" />
            <StatTile label="Critical" value={`${alertSummary.critical}`} hint="Open critical-severity" icon={AlertOctagon} accent="rose" />
            <StatTile label="Assigned" value={`${alertSummary.assigned}`} hint="In progress" icon={UserCheck} accent="amber" />
            <StatTile label="SLA Breach" value={`${alertSummary.breach}`} hint="Past SLA budget" icon={TimerReset} accent="rose" />
            <StatTile label="Resolved 7d" value={`${alertSummary.resolved7d}`} hint="Closed by analysts" icon={CheckCircle2} accent="emerald" />
            <StatTile label="Total" value={`${alertQueue.length}`} hint="In queue · last 96h" icon={ShieldAlert} accent="slate" />
          </StaggerGrid>
        }
      />

      {/* Summary tiles + volume sparkline */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <StaggerGrid className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:col-span-2">
          <StatTile label="Open" value={alertSummary.open} icon={Bell} accent={summaryAccent.open} hint="Awaiting analyst triage" />
          <StatTile label="Critical" value={alertSummary.critical} icon={AlertOctagon} accent={summaryAccent.critical} hint="Top-severity · needs immediate action" />
          <StatTile label="Assigned" value={alertSummary.assigned} icon={UserCheck} accent={summaryAccent.assigned} hint="Analyst engaged" />
          <StatTile label="SLA Breach" value={alertSummary.breach} icon={TimerReset} accent={summaryAccent.breach} hint="Over budget · auto-escalation armed" />
        </StaggerGrid>
        <ChartCard
          title="Alert Volume — 14 days"
          subtitle="Daily trigger count across all rules"
          footer={`Avg ${Math.round(alertVolume14d.reduce((s, d) => s + d.volume, 0) / alertVolume14d.length)} alerts/day`}
        >
          <VolumeSparkline />
        </ChartCard>
      </div>

      {/* Triage queue */}
      <PanelCard>
        <PanelHeader
          title="Triage Queue"
          subtitle="Filterable by severity · pillar · status"
          icon={Bell}
          accent="rose"
          action={
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search id, entity, rule…"
                className="h-7 w-48 pl-7 text-[11px] sm:w-56"
              />
            </div>
          }
        />
        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-3 py-2.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <Filter className="h-3 w-3" /> Severity
          </span>
          {(["all", "critical", "high", "medium", "low"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSevFilter(s)}
              className={cn(
                "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 transition-colors",
                sevFilter === s ? "bg-slate-800 text-white ring-slate-800" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
              )}
            >
              {s}
            </button>
          ))}
          <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Pillar</span>
          <button
            onClick={() => setPillarFilter("all")}
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 transition-colors",
              pillarFilter === "all" ? "bg-slate-800 text-white ring-slate-800" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
            )}
          >
            All
          </button>
          {(["Regulatory", "Cyber", "Financial", "ESG", "Geopolitical", "Reputational"] as RiskPillar[]).map((p) => (
            <button
              key={p}
              onClick={() => setPillarFilter(p)}
              className={cn(
                "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 transition-colors",
                pillarFilter === p ? "bg-slate-800 text-white ring-slate-800" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
              )}
            >
              {p}
            </button>
          ))}
          <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Status</span>
          {(["all", "open", "assigned", "ack", "resolved", "breach"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 transition-colors",
                statusFilter === s ? "bg-slate-800 text-white ring-slate-800" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="max-h-[560px] overflow-y-auto harch-scroll">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-white">
              <TableRow className="text-[10px] uppercase tracking-wide text-slate-500">
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("id")}>
                    ID {renderSortIcon("id")}
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("entity")}>
                    Entity {renderSortIcon("entity")}
                  </button>
                </TableHead>
                <TableHead>Rule</TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("pillar")}>
                    Pillar {renderSortIcon("pillar")}
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("severity")}>
                    Severity {renderSortIcon("severity")}
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("triggeredAt")}>
                    Triggered {renderSortIcon("triggeredAt")}
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("status")}>
                    Status {renderSortIcon("status")}
                  </button>
                </TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead className="text-right">
                  <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("slaMinutes")}>
                    SLA {renderSortIcon("slaMinutes")}
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a: AlertQueueItem) => {
                const st = alertQueueStatusTint[a.status];
                const slaTone = a.slaMinutes < 0 ? "text-rose-700" : a.slaMinutes < 60 ? "text-amber-700" : "text-slate-600";
                return (
                  <TableRow key={a.id} className="text-[12px] hover:bg-slate-50/60">
                    <TableCell className="font-mono font-semibold text-slate-700">{a.id}</TableCell>
                    <TableCell className="font-medium text-slate-900">{a.entity}</TableCell>
                    <TableCell className="max-w-[180px] truncate text-slate-500" title={a.rule}>{a.rule}</TableCell>
                    <TableCell>
                      <span
                        className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ring-1 ring-slate-200"
                        style={{ color: pillarColor[a.pillar] }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: pillarColor[a.pillar] }} />
                        {a.pillar}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Tag tone={severityTone[a.severity]}>{a.severity}</Tag>
                    </TableCell>
                    <TableCell className="tabular whitespace-nowrap text-slate-500">
                      {relativeTime(a.triggeredAt)}
                    </TableCell>
                    <TableCell>
                      <Tag tone={statusTone[a.status]}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", st.dot)} />
                        {a.status}
                      </Tag>
                    </TableCell>
                    <TableCell className="text-slate-600">{a.assignedTo ?? "—"}</TableCell>
                    <TableCell className={cn("tabular text-right font-semibold", slaTone)}>
                      {a.slaMinutes < 0 ? `${Math.abs(a.slaMinutes)}m over` : `${a.slaMinutes}m`}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-[12px] text-slate-400">
                    No alerts match the current filters.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Showing <span className="tabular font-semibold text-slate-700">{filtered.length}</span> of {alertQueue.length} alerts
          </span>
          <span className="text-slate-400">SLA budget: 4h · auto-escalation armed</span>
        </div>
      </PanelCard>
    </div>
  );
}
