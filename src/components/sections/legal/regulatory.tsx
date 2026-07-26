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
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Filter,
  Landmark,
  Search,
  ShieldAlert,
  ShieldCheck,
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
import {
  Tooltip as RadixTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { DeferredChart } from "@/components/dataviz/chart-skeleton";
import { SectionHeader, StatusChip } from "../section-header";
import {
  PanelCard,
  PanelHeader,
  StatTile,
  Tag,
  StaggerGrid,
  EmptyState,
  motionVariants,
} from "../design-system";
import { motion } from "framer-motion";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  filingStatusTint,
  formatDate,
  regObligations,
  regulatorHeatmap,
  regulatorySummary,
  upcomingFilings,
  relativeTime,
  type FilingStatus,
  type RegObligation,
} from "@/lib/legal-data";
import { cn } from "@/lib/utils";
import {
  KpiSkeletonGrid,
  PanelSkeletons,
  PremiumTooltip,
  useMountReady,
  daysFromToday,
} from "./_shared";

type SortKey = "nextDue" | "regulator" | "obligation" | "status" | "risk" | "owner";

const statusOrder: Record<FilingStatus, number> = {
  overdue: 0,
  in_progress: 1,
  drafting: 2,
  not_started: 3,
  filed: 4,
};

const statusTone: Record<FilingStatus, "negative" | "info" | "warning" | "neutral" | "positive"> = {
  overdue: "negative",
  in_progress: "info",
  drafting: "warning",
  not_started: "neutral",
  filed: "positive",
};

const statusColumnColor: Record<FilingStatus, string> = {
  overdue: "#f43f5e",
  in_progress: "#0ea5e9",
  drafting: "#f59e0b",
  not_started: "#94a3b8",
  filed: "#10b981",
};

const statusLabel: Record<FilingStatus, string> = {
  overdue: "Overdue",
  in_progress: "In progress",
  drafting: "Drafting",
  not_started: "Not started",
  filed: "Filed",
};

/* ------------------------------------------------------------------ */
/*  Regulator × status heatmap (premium, hover tooltips, smooth CSS)   */
/* ------------------------------------------------------------------ */

function heatCellClasses(count: number): string {
  if (count === 0) return "bg-slate-50 text-slate-300 ring-slate-100";
  if (count >= 3) return "bg-rose-100 text-rose-900 ring-rose-200";
  if (count === 2) return "bg-amber-100 text-amber-900 ring-amber-200";
  return "bg-sky-100 text-sky-900 ring-sky-200";
}

function RegulatorHeatmap() {
  const statuses: FilingStatus[] = ["overdue", "in_progress", "drafting", "not_started", "filed"];
  return (
    <TooltipProvider delayDuration={120}>
      <div className="overflow-x-auto harch-scroll">
        <table className="w-full min-w-[680px] border-collapse text-[11px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-slate-500">
              <th className="sticky left-0 z-10 bg-white px-4 py-2.5 text-left font-semibold">Regulator</th>
              {statuses.map((s) => (
                <th key={s} className="px-2 py-2.5 text-center font-semibold">{statusLabel[s]}</th>
              ))}
              <th className="px-3 py-2.5 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {regulatorHeatmap.map((row, i) => {
              const total = statuses.reduce((s, st) => s + row[st], 0);
              return (
                <tr key={row.regulator} className={cn("border-t border-slate-100", i % 2 === 1 ? "bg-slate-50/40" : "bg-white")}>
                  <td className="sticky left-0 z-10 bg-inherit px-4 py-2 font-semibold text-slate-700">{row.regulator}</td>
                  {statuses.map((s) => (
                    <td key={s} className="px-2 py-2 text-center">
                      <RadixTooltip>
                        <TooltipTrigger asChild>
                          <span
                            className={cn(
                              "tabular inline-flex h-7 w-9 cursor-default items-center justify-center rounded-md text-[11px] font-bold ring-1 transition-all duration-200 hover:scale-105 hover:shadow-sm",
                              row[s] > 0 ? heatCellClasses(row[s]) : "bg-slate-50 text-slate-300 ring-slate-100",
                            )}
                          >
                            {row[s] > 0 ? row[s] : "·"}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="!bg-slate-900 !text-white">
                          <span className="text-[10px] font-semibold uppercase tracking-wide">
                            {row.regulator} · {statusLabel[s]}
                          </span>
                          <span className="tabular mt-0.5 block text-[12px] font-bold">{row[s]} filing{row[s] === 1 ? "" : "s"}</span>
                        </TooltipContent>
                      </RadixTooltip>
                    </td>
                  ))}
                  <td className="tabular px-3 py-2 text-right font-bold text-slate-900">{total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 px-4 py-2.5 text-[10px] uppercase tracking-wider text-slate-500">
        {statuses.map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: statusColumnColor[s] }} />
            {statusLabel[s]}
          </span>
        ))}
      </div>
    </TooltipProvider>
  );
}

/* ------------------------------------------------------------------ */
/*  Filing risk distribution chart                                     */
/* ------------------------------------------------------------------ */

function FilingRiskChart() {
  const buckets = [
    { range: "0–39", count: regObligations.filter((o) => o.risk < 40).length },
    { range: "40–59", count: regObligations.filter((o) => o.risk >= 40 && o.risk < 60).length },
    { range: "60–74", count: regObligations.filter((o) => o.risk >= 60 && o.risk < 75).length },
    { range: "75–89", count: regObligations.filter((o) => o.risk >= 75 && o.risk < 90).length },
    { range: "90–100", count: regObligations.filter((o) => o.risk >= 90).length },
  ];
  const toneForRisk = (range: string) => {
    if (range === "0–39") return "#10b981";
    if (range === "40–59") return "#0ea5e9";
    if (range === "60–74") return "#f59e0b";
    if (range === "75–89") return "#f97316";
    return "#f43f5e";
  };
  return (
    <DeferredChart height="h-[210px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={buckets} margin={{ top: 10, right: 12, left: 0, bottom: 0 }} barCategoryGap="22%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <PremiumTooltip
                  header={`Risk band ${label}`}
                  rows={[
                    { label: "Filings", value: `${payload[0].value as number}` },
                  ]}
                />
              );
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={36}>
            {buckets.map((b) => (
              <Cell key={b.range} fill={toneForRisk(b.range)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function RegulatoryRisk(_: SectionComponentProps) {
  const ready = useMountReady();
  const [sortKey, setSortKey] = React.useState<SortKey>("nextDue");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = React.useState<FilingStatus | "all">("all");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    let list = regObligations.slice();
    if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.obligation.toLowerCase().includes(q) ||
          o.regulator.toLowerCase().includes(q) ||
          o.owner.toLowerCase().includes(q) ||
          o.jurisdiction.toLowerCase().includes(q),
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (sortKey === "nextDue") return (Date.parse(a.nextDue) - Date.parse(b.nextDue)) * dir;
      if (sortKey === "risk") return (a.risk - b.risk) * dir;
      if (sortKey === "status") return (statusOrder[a.status] - statusOrder[b.status]) * dir;
      return String(a[sortKey]).localeCompare(String(b[sortKey])) * dir;
    });
    return list;
  }, [statusFilter, query, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };
  const renderSortIcon = (col: SortKey) => {
    if (sortKey !== col) return <ChevronDown className="h-3 w-3 text-slate-300" />;
    return sortDir === "asc" ? <ChevronUp className="h-3 w-3 text-slate-700" /> : <ChevronDown className="h-3 w-3 text-slate-700" />;
  };

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="risk-regulatory"
        accountType="legal"
        accent="violet"
        statusChips={
          <>
            <StatusChip label={`${regulatorySummary.regulators} regulators`} tone="neutral" icon={Landmark} />
            <StatusChip label={`${regulatorySummary.overdue} overdue`} tone="negative" icon={AlertTriangle} pulse />
            <StatusChip label={`${regulatorySummary.dueNext14d} due 14d`} tone="warning" icon={CalendarClock} />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile label="Total Obligations" value={`${regulatorySummary.total}`} hint="Across all regulators" icon={ShieldAlert} accent="violet" />
              <StatTile label="Filed" value={`${regulatorySummary.filed}`} hint="Closed this cycle" icon={CheckCircle2} accent="emerald" />
              <StatTile label="In Progress" value={`${regulatorySummary.inProgress}`} hint="Active filings" />
              <StatTile label="Overdue" value={`${regulatorySummary.overdue}`} hint="SLA breach" icon={XCircle} accent="rose" />
              <StatTile label="Due This Month" value={`${regulatorySummary.dueThisMonth}`} hint="November 2025" icon={CalendarClock} accent="amber" />
              <StatTile label="High-Risk Filings" value={`${regulatorySummary.highRisk}`} hint="Risk ≥ 70" icon={AlertTriangle} accent="rose" />
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
          {/* Heatmap + risk distribution */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <PanelCard accent="violet" className="xl:col-span-2">
              <PanelHeader
                title="Regulator × Status Heatmap"
                subtitle="Filing posture concentration by regulator"
                icon={Landmark}
                accent="violet"
                action={<Tag tone="neutral">{regulatorHeatmap.length} regulators</Tag>}
              />
              <div className="p-2">
                <RegulatorHeatmap />
              </div>
            </PanelCard>
            <PanelCard accent="violet">
              <PanelHeader
                title="Filing Risk Distribution"
                subtitle="Obligations by risk band"
                icon={ShieldAlert}
                accent="violet"
                action={<Tag tone="neutral">0–100</Tag>}
              />
              <div className="p-4">
                <FilingRiskChart />
              </div>
            </PanelCard>
          </div>

          {/* Upcoming filings timeline */}
          <PanelCard accent="violet">
            <PanelHeader
              title="Upcoming Filing Calendar"
              subtitle="Next 90 days · chronological"
              icon={CalendarClock}
              accent="violet"
              action={<Tag tone="neutral">{upcomingFilings.length} filings</Tag>}
            />
            <div className="max-h-[280px] overflow-y-auto harch-scroll p-3">
              <div className="flex flex-col gap-2">
                {upcomingFilings.map((f) => {
                  const tint = filingStatusTint[f.status];
                  const days = daysFromToday(f.nextDue);
                  return (
                    <motion.div
                      key={f.id}
                      variants={motionVariants.item}
                      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 transition-all hover:border-slate-300 hover:shadow-sm"
                    >
                      <div
                        className={cn(
                          "flex w-14 flex-col items-center rounded-md px-2 py-1.5 text-white",
                          days < 0 ? "bg-rose-700" : days <= 14 ? "bg-amber-600" : "bg-slate-900",
                        )}
                      >
                        <span className="tabular text-[16px] font-bold leading-none">{Math.abs(days)}</span>
                        <span className="text-[9px] uppercase tracking-wide text-white/80">{days < 0 ? "overdue" : "days"}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-[12px] font-semibold text-slate-900">{f.obligation}</span>
                          <Tag tone="violet" size="xs">{f.regulator}</Tag>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-500">
                          <span className="tabular">{formatDate(f.nextDue)}</span>
                          <span>·</span>
                          <span className="truncate">{f.owner}</span>
                        </div>
                      </div>
                      <Tag tone={statusTone[f.status]} size="sm">
                        <span className={cn("h-1.5 w-1.5 rounded-full", tint.dot)} />
                        {statusLabel[f.status]}
                      </Tag>
                    </motion.div>
                  );
                })}
                {upcomingFilings.length === 0 ? (
                  <EmptyState icon={CalendarClock} title="No upcoming filings" description="Nothing due in the next 90 days." />
                ) : null}
              </div>
            </div>
          </PanelCard>

          {/* Obligations register */}
          <PanelCard accent="violet">
            <PanelHeader
              title="Regulatory Obligations Register"
              subtitle="Every active obligation · sortable, filterable, searchable"
              icon={ShieldCheck}
              accent="violet"
              action={
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search obligation, regulator…"
                      className="h-7 w-48 pl-7 text-[11px] sm:w-56"
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
              {(Object.keys(filingStatusTint) as FilingStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 transition-colors",
                    statusFilter === s ? "bg-violet-700 text-white ring-violet-700" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
                  )}
                >
                  {statusLabel[s]}
                </button>
              ))}
            </div>

            <div className="max-h-[560px] overflow-y-auto harch-scroll">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-white">
                  <TableRow className="text-[10px] uppercase tracking-wider text-slate-500 hover:bg-transparent">
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("regulator")}>
                        Regulator {renderSortIcon("regulator")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("obligation")}>
                        Obligation {renderSortIcon("obligation")}
                      </button>
                    </TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("nextDue")}>
                        Next Due {renderSortIcon("nextDue")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("status")}>
                        Status {renderSortIcon("status")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("owner")}>
                        Owner {renderSortIcon("owner")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("risk")}>
                        Risk {renderSortIcon("risk")}
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((o: RegObligation) => {
                    const tint = filingStatusTint[o.status];
                    const days = daysFromToday(o.nextDue);
                    const overdue = o.status === "overdue" || days < 0;
                    const riskTone = o.risk >= 80 ? "negative" : o.risk >= 60 ? "warning" : o.risk >= 40 ? "info" : "positive";
                    return (
                      <TableRow key={o.id} className="text-[12px] hover:bg-slate-50">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{o.regulator}</span>
                            <span className="font-mono text-[10px] text-slate-400">{o.id} · {o.jurisdiction}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[280px]">
                          <div className="flex flex-col">
                            <span className="truncate text-slate-700" title={o.obligation}>{o.obligation}</span>
                            {o.note ? <span className="truncate text-[10px] text-slate-400" title={o.note}>{o.note}</span> : null}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize text-slate-600">{o.frequency}</TableCell>
                        <TableCell className="tabular whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className={cn("font-medium", overdue ? "text-rose-700" : "text-slate-700")}>{formatDate(o.nextDue)}</span>
                            <span className={cn("text-[10px]", overdue ? "text-rose-600" : "text-slate-400")}>
                              {overdue ? `${Math.abs(days)}d overdue` : `in ${days}d`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Tag tone={statusTone[o.status]} size="sm">
                            <span className={cn("h-1.5 w-1.5 rounded-full", tint.dot)} />
                            {statusLabel[o.status]}
                          </Tag>
                        </TableCell>
                        <TableCell className="text-slate-600">{o.owner}</TableCell>
                        <TableCell className="tabular text-right">
                          <Tag tone={riskTone} size="sm">{o.risk}</Tag>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8">
                        <EmptyState icon={Search} title="No obligations match the current filters." description="Try clearing the search or status filter." accent="violet" />
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-violet-600" />
                Showing <span className="tabular font-semibold text-slate-700">{filtered.length}</span> of {regObligations.length} obligations
              </span>
              <span className="text-slate-400">Anchored {relativeTime("2025-11-15T10:30:00Z")} · regulatory register</span>
            </div>
          </PanelCard>
        </motion.div>
      )}
    </div>
  );
}
