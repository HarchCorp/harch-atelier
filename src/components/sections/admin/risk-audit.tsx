"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Filter,
  Lock,
  ScrollText,
  Search,
  ShieldCheck,
  TriangleAlert,
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
import { Button } from "@/components/ui/button";
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
  auditActivity14d,
  auditLog,
  relativeTime,
  type AuditAction,
  type AuditEntry,
  type AuditResult,
} from "@/lib/admin-data";
import { cn } from "@/lib/utils";

type SortKey = "ts" | "actor" | "action" | "target" | "result";

const allActions: AuditAction[] = [
  "auth.login", "auth.logout", "auth.mfa_challenge",
  "user.invite", "user.suspend", "user.role_change",
  "source.disable", "source.enable",
  "integration.toggle",
  "alert.ack", "alert.escalate", "alert.assign",
  "view.billing", "settings.update", "data.export",
];

/* ------------------------------------------------------------------ */
/*  Action labels + tone                                               */
/* ------------------------------------------------------------------ */

const actionLabel: Record<AuditAction, string> = {
  "auth.login": "Login",
  "auth.logout": "Logout",
  "auth.mfa_challenge": "MFA Challenge",
  "user.invite": "User Invite",
  "user.suspend": "User Suspend",
  "user.role_change": "Role Change",
  "source.disable": "Source Disable",
  "source.enable": "Source Enable",
  "integration.toggle": "Integration Toggle",
  "alert.ack": "Alert Acknowledge",
  "alert.escalate": "Alert Escalate",
  "alert.assign": "Alert Assign",
  "view.billing": "View Billing",
  "settings.update": "Settings Update",
  "data.export": "Data Export",
};

const actionTone: Record<AuditAction, "info" | "neutral" | "warning" | "negative" | "positive"> = {
  "auth.login": "info",
  "auth.logout": "neutral",
  "auth.mfa_challenge": "info",
  "user.invite": "positive",
  "user.suspend": "warning",
  "user.role_change": "info",
  "source.disable": "negative",
  "source.enable": "positive",
  "integration.toggle": "warning",
  "alert.ack": "info",
  "alert.escalate": "negative",
  "alert.assign": "warning",
  "view.billing": "neutral",
  "settings.update": "info",
  "data.export": "info",
};

/* ------------------------------------------------------------------ */
/*  Activity-over-time bar chart                                       */
/* ------------------------------------------------------------------ */

function ActivityChart() {
  return (
    <DeferredChart height="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={auditActivity14d} margin={{ top: 10, right: 12, left: 0, bottom: 0 }} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} minTickGap={12} />
          <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={32} />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const success = payload.find((p) => p.dataKey === "success")?.value ?? 0;
              const failure = payload.find((p) => p.dataKey === "failure")?.value ?? 0;
              return (
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
                  <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</div>
                  <div className="tabular mt-1 flex items-center justify-between gap-4 text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Success
                    </span>
                    <span className="font-semibold text-slate-800">{success}</span>
                  </div>
                  <div className="tabular flex items-center justify-between gap-4 text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Failure
                    </span>
                    <span className="font-semibold text-slate-800">{failure}</span>
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="success" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={14} />
          <Bar dataKey="failure" stackId="a" fill="#f43f5e" radius={[3, 3, 0, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Result pill                                                        */
/* ------------------------------------------------------------------ */

function ResultPill({ result }: { result: AuditResult }) {
  if (result === "success") {
    return <Tag tone="positive" icon={CheckCircle2}>Success</Tag>;
  }
  return <Tag tone="negative" icon={XCircle}>Failure</Tag>;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function AuditLog(_: SectionComponentProps) {
  const [sortKey, setSortKey] = React.useState<SortKey>("ts");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [actionFilter, setActionFilter] = React.useState<AuditAction | "all">("all");
  const [resultFilter, setResultFilter] = React.useState<AuditResult | "all">("all");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    let list = auditLog.slice();
    if (actionFilter !== "all") list = list.filter((e) => e.action === actionFilter);
    if (resultFilter !== "all") list = list.filter((e) => e.result === resultFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.actor.toLowerCase().includes(q) ||
          e.target.toLowerCase().includes(q) ||
          e.action.toLowerCase().includes(q) ||
          e.ip.includes(q) ||
          (e.note ?? "").toLowerCase().includes(q),
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (sortKey === "ts") return (Date.parse(a.ts) - Date.parse(b.ts)) * dir;
      if (sortKey === "result") return a.result.localeCompare(b.result) * dir;
      return String(a[sortKey]).localeCompare(String(b[sortKey])) * dir;
    });
    return list;
  }, [actionFilter, resultFilter, query, sortKey, sortDir]);

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

  const totalSuccess = auditActivity14d.reduce((s, d) => s + d.success, 0);
  const totalFailure = auditActivity14d.reduce((s, d) => s + d.failure, 0);
  const failureRate = (totalFailure / (totalSuccess + totalFailure)) * 100;

  const categoryStats = [
    { label: "Authentication", count: auditLog.filter((e) => e.action.startsWith("auth.")).length, accent: "cyan" as RoleAccent, icon: ShieldCheck },
    { label: "User management", count: auditLog.filter((e) => e.action.startsWith("user.")).length, accent: "violet" as RoleAccent, icon: FileText },
    { label: "Source / integration", count: auditLog.filter((e) => e.action.startsWith("source.") || e.action.startsWith("integration.")).length, accent: "amber" as RoleAccent, icon: TriangleAlert },
    { label: "Alert triage", count: auditLog.filter((e) => e.action.startsWith("alert.")).length, accent: "rose" as RoleAccent, icon: TriangleAlert },
    { label: "Billing / settings / export", count: auditLog.filter((e) => ["view.billing", "settings.update", "data.export"].includes(e.action)).length, accent: "slate" as RoleAccent, icon: FileText },
  ];

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="risk-audit"
        accountType="admin"
        accent="emerald"
        statusChips={
          <>
            <StatusChip label="Immutable · WORM" tone="positive" icon={Lock} />
            <StatusChip label="7-yr retention" tone="neutral" icon={ScrollText} />
            <StatusChip label={`${failureRate.toFixed(1)}% failure rate`} tone={failureRate > 8 ? "warning" : "neutral"} icon={TriangleAlert} />
          </>
        }
        kpis={
          <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatTile label="Audit entries" value={`${auditLog.length}`} hint="In current view" icon={ScrollText} accent="slate" />
            <StatTile label="Successes 14d" value={totalSuccess.toLocaleString()} hint="Across all actors" icon={CheckCircle2} accent="emerald" />
            <StatTile label="Failures 14d" value={totalFailure.toLocaleString()} delta={`${failureRate.toFixed(1)}%`} deltaTone="negative" hint="Of total events" icon={XCircle} accent="rose" />
            <StatTile label="Unique actors" value={`${new Set(auditLog.map((e) => e.actor)).size}`} hint="Users with activity" icon={ShieldCheck} accent="slate" />
            <StatTile label="Actions tracked" value={`${allActions.length}`} hint="Distinct audit types" icon={FileText} accent="slate" />
            <StatTile label="Retention" value="2,557d" hint="7-yr compliance window" icon={Lock} accent="cyan" />
          </StaggerGrid>
        }
      />

      {/* Activity chart + summary tiles */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <ChartCard
          title="Audit Activity — 14 days"
          subtitle="Daily event volume · success vs failure"
          className="xl:col-span-2"
          action={
            <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wide">
              <span className="inline-flex items-center gap-1 text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Success</span>
              <span className="inline-flex items-center gap-1 text-rose-700"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Failure</span>
            </div>
          }
        >
          <ActivityChart />
        </ChartCard>
        <PanelCard>
          <PanelHeader
            title="Activity Highlights"
            subtitle="Most-tracked action categories"
            icon={ScrollText}
            accent="slate"
          />
          <div className="p-3">
            <StaggerGrid className="flex flex-col gap-2.5">
              {categoryStats.map((row) => (
                <StatTile
                  key={row.label}
                  label={row.label}
                  value={row.count}
                  icon={row.icon}
                  accent={row.accent}
                />
              ))}
            </StaggerGrid>
          </div>
        </PanelCard>
      </div>

      {/* Audit log table */}
      <PanelCard>
        <PanelHeader
          title="Immutable Audit Trail"
          subtitle="Every actor · action · target · IP — searchable + filterable"
          icon={Lock}
          accent="emerald"
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search actor, action, IP…"
                  className="h-7 w-48 pl-7 text-[11px] sm:w-56"
                />
              </div>
              <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11px]">
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
            </div>
          }
        />
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-3 py-2.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <Filter className="h-3 w-3" /> Action
          </span>
          <button
            onClick={() => setActionFilter("all")}
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 transition-colors",
              actionFilter === "all" ? "bg-slate-800 text-white ring-slate-800" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
            )}
          >
            All
          </button>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as AuditAction | "all")}
            className="h-6 rounded border border-slate-200 bg-white px-2 text-[10px] text-slate-600"
          >
            <option value="all">All actions</option>
            {allActions.map((a) => (
              <option key={a} value={a}>{actionLabel[a]}</option>
            ))}
          </select>
          <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Result</span>
          {(["all", "success", "failure"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setResultFilter(r)}
              className={cn(
                "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 transition-colors",
                resultFilter === r ? "bg-slate-800 text-white ring-slate-800" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
              )}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="max-h-[600px] overflow-y-auto harch-scroll">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-white">
              <TableRow className="text-[10px] uppercase tracking-wide text-slate-500">
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("ts")}>
                    Timestamp {renderSortIcon("ts")}
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("actor")}>
                    Actor {renderSortIcon("actor")}
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("action")}>
                    Action {renderSortIcon("action")}
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("target")}>
                    Target {renderSortIcon("target")}
                  </button>
                </TableHead>
                <TableHead>IP</TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("result")}>
                    Result {renderSortIcon("result")}
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e: AuditEntry) => (
                <TableRow key={e.id} className="text-[12px] hover:bg-slate-50/60">
                  <TableCell className="tabular whitespace-nowrap text-slate-500" title={e.ts}>
                    <div className="flex flex-col">
                      <span>{relativeTime(e.ts)}</span>
                      <span className="text-[10px] text-slate-400">{e.id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-700">{e.actor}</TableCell>
                  <TableCell>
                    <Tag tone={actionTone[e.action]} size="sm">{actionLabel[e.action]}</Tag>
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    <div className="flex flex-col">
                      <span className="truncate text-slate-700" title={e.target}>{e.target}</span>
                      {e.note ? <span className="truncate text-[10px] text-slate-400">{e.note}</span> : null}
                    </div>
                  </TableCell>
                  <TableCell className="tabular text-slate-500">{e.ip}</TableCell>
                  <TableCell><ResultPill result={e.result} /></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-[12px] text-slate-400">
                    No audit entries match the current filters.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            Showing <span className="tabular font-semibold text-slate-700">{filtered.length}</span> of {auditLog.length} entries · WORM-protected
          </span>
          <span className="text-slate-400">7-yr retention · regulator-exportable</span>
        </div>
      </PanelCard>
    </div>
  );
}
