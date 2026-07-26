"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Filter,
  Gavel,
  Search,
  Scale,
  Wallet,
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
  ProgressBar,
  EmptyState,
  motionVariants,
} from "../design-system";
import { motion } from "framer-motion";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  formatDate,
  formatUSD,
  legalMatters,
  matterStatusTint,
  matterTypeColor,
  mattersByStatus,
  mattersSummary,
  relativeTime,
  type LegalMatter,
  type MatterStatus,
  type MatterType,
} from "@/lib/legal-data";
import { cn } from "@/lib/utils";
import { KpiSkeletonGrid, PanelSkeletons, PremiumTooltip, useMountReady, daysFromToday } from "./_shared";

type SortKey = "id" | "name" | "type" | "counterparty" | "status" | "deadline" | "burn" | "exposure";

const matterStatusTone: Record<MatterStatus, "info" | "warning" | "violet" | "negative" | "positive" | "neutral"> = {
  active: "info",
  filing: "warning",
  discovery: "violet",
  hearing: "negative",
  settlement: "positive",
  closed: "neutral",
};

/* ------------------------------------------------------------------ */
/*  Matters-by-status donut                                            */
/* ------------------------------------------------------------------ */

const statusColors: Record<MatterStatus, string> = {
  active: "#0ea5e9",
  filing: "#f59e0b",
  discovery: "#a855f7",
  hearing: "#f43f5e",
  settlement: "#10b981",
  closed: "#94a3b8",
};

function MattersDonut() {
  const [active, setActive] = React.useState<MatterStatus | null>(null);
  const filtered = active ? mattersByStatus.filter((s) => s.status === active) : mattersByStatus;
  const total = filtered.reduce((sum, s) => sum + s.count, 0);
  return (
    <div className="flex flex-col gap-3">
      <DeferredChart height="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filtered}
              dataKey="count"
              nameKey="status"
              innerRadius={50}
              outerRadius={84}
              paddingAngle={2}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {filtered.map((s) => (
                <Cell key={s.status} fill={statusColors[s.status]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active: a, payload }) => {
                if (!a || !payload?.length) return null;
                const p = payload[0];
                return (
                  <PremiumTooltip
                    header={`${p.name}`}
                    rows={[{ label: "Matters", value: `${p.value}` }]}
                  />
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </DeferredChart>
      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
        {mattersByStatus.map((s) => (
          <button
            key={s.status}
            onClick={() => setActive((cur) => (cur === s.status ? null : s.status))}
            className={cn(
              "flex items-center justify-between rounded-md px-2 py-1 capitalize ring-1 transition-colors",
              active === s.status
                ? "bg-violet-50 ring-violet-200"
                : "bg-slate-50 ring-transparent hover:bg-slate-100",
            )}
          >
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2 w-2 rounded-full" style={{ background: statusColors[s.status] }} />
              {s.status}
            </span>
            <span className="tabular font-semibold text-slate-800">{s.count}</span>
          </button>
        ))}
      </div>
      {active ? (
        <div className="flex items-center justify-between rounded-md bg-violet-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-700">
          <span>Filtered · {active}</span>
          <span className="tabular">{total} matters</span>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Budget vs burn bar chart                                           */
/* ------------------------------------------------------------------ */

function BudgetVsBurnChart() {
  const data = legalMatters
    .map((m) => ({
      id: m.id,
      name: m.id.replace("MAT-", ""),
      budget: m.budget,
      burn: m.burn,
      pct: Math.round((m.burn / m.budget) * 100),
    }))
    .sort((a, b) => b.pct - a.pct);
  return (
    <DeferredChart height="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }} barCategoryGap="18%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={36} unit="k" />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              const budget = Number(payload.find((p) => p.dataKey === "budget")?.value ?? 0);
              const burn = Number(payload.find((p) => p.dataKey === "burn")?.value ?? 0);
              const pct = Math.round((burn / budget) * 100);
              const matter = legalMatters.find((m) => m.id === `MAT-${label}`);
              return (
                <PremiumTooltip
                  header={`${matter?.id ?? ""} · ${matter?.name ?? ""}`}
                  rows={[
                    { label: "Budget", value: formatUSD(budget * 1000), tone: "slate" },
                    { label: "Burn", value: formatUSD(burn * 1000), tone: "violet" },
                    { label: "Utilization", value: `${pct}%`, tone: pct > 80 ? "rose" : pct > 60 ? "amber" : "emerald" },
                    { label: "Status", value: pct > 80 ? "Over-budget risk" : pct > 60 ? "Monitor" : "On track", tone: pct > 80 ? "rose" : pct > 60 ? "amber" : "emerald" },
                  ]}
                />
              );
            }}
          />
          <Bar dataKey="budget" fill="#e2e8f0" radius={[3, 3, 0, 0]} barSize={20} name="Budget" />
          <Bar dataKey="burn" fill="#7c3aed" radius={[3, 3, 0, 0]} barSize={20} name="Burn" />
        </BarChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Matters timeline                                                    */
/* ------------------------------------------------------------------ */

function MattersTimeline() {
  const upcoming = legalMatters
    .filter((m) => m.status !== "closed")
    .sort((a, b) => Date.parse(a.deadline) - Date.parse(b.deadline))
    .slice(0, 6);
  return (
    <div className="flex flex-col gap-2">
      {upcoming.map((m) => {
        const days = daysFromToday(m.deadline);
        const overdue = days < 0;
        return (
          <motion.div
            key={m.id}
            variants={motionVariants.item}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 transition-all hover:border-slate-300 hover:shadow-sm"
          >
            <div className={cn("flex w-14 flex-col items-center rounded-md px-2 py-1.5 text-white", overdue ? "bg-rose-700" : days <= 14 ? "bg-amber-600" : "bg-slate-900")}>
              <span className="tabular text-[16px] font-bold leading-none">{Math.abs(days)}</span>
              <span className="text-[9px] uppercase tracking-wide text-white/80">{overdue ? "overdue" : "days"}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] font-semibold text-violet-700">{m.id}</span>
                <span className="truncate text-[12px] font-semibold text-slate-900" title={m.name}>{m.name}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-500">
                <span className="tabular">{formatDate(m.deadline)}</span>
                <span>·</span>
                <span className="truncate">{m.nextMilestone}</span>
              </div>
            </div>
            <Tag tone={matterStatusTone[m.status]} size="xs">{m.status}</Tag>
          </motion.div>
        );
      })}
      {upcoming.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No upcoming matter deadlines." accent="violet" />
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

const allTypes: MatterType[] = ["Litigation", "Arbitration", "Regulatory Inquiry", "IP", "Contract", "Compliance Investigation", "Employment", "Real Estate"];

export function LegalMatters(_: SectionComponentProps) {
  const ready = useMountReady();
  const [sortKey, setSortKey] = React.useState<SortKey>("deadline");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [typeFilter, setTypeFilter] = React.useState<MatterType | "all">("all");
  const [statusFilter, setStatusFilter] = React.useState<MatterStatus | "all">("all");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    let list = legalMatters.slice();
    if (typeFilter !== "all") list = list.filter((m) => m.type === typeFilter);
    if (statusFilter !== "all") list = list.filter((m) => m.status === statusFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.id.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.counterparty.toLowerCase().includes(q) ||
          m.counsel.toLowerCase().includes(q) ||
          m.jurisdiction.toLowerCase().includes(q),
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (sortKey === "deadline") return (Date.parse(a.deadline) - Date.parse(b.deadline)) * dir;
      if (sortKey === "burn" || sortKey === "exposure") return (a[sortKey] - b[sortKey]) * dir;
      return String(a[sortKey]).localeCompare(String(b[sortKey])) * dir;
    });
    return list;
  }, [typeFilter, statusFilter, query, sortKey, sortDir]);

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
        sectionId="risk-matters"
        accountType="legal"
        accent="violet"
        statusChips={
          <>
            <StatusChip label={`${mattersSummary.active} active`} tone="neutral" icon={Gavel} />
            <StatusChip label={`${mattersSummary.dueNext14d} due 14d`} tone="warning" icon={CalendarClock} />
            <StatusChip label={`${mattersSummary.overBudget} over-budget`} tone="negative" icon={AlertTriangle} />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile label="Active Matters" value={`${mattersSummary.active}`} hint={`${mattersSummary.total} total in docket`} icon={Gavel} accent="violet" />
              <StatTile label="Total Budget" value={formatUSD(mattersSummary.totalBudget * 1000)} hint="Approved · USD" icon={Wallet} />
              <StatTile label="Burn To Date" value={formatUSD(mattersSummary.totalBurn * 1000)} delta={`${Math.round((mattersSummary.totalBurn / mattersSummary.totalBudget) * 100)}%`} deltaTone="negative" hint="Of total budget" icon={Scale} accent="amber" />
              <StatTile label="Total Exposure" value={formatUSD(mattersSummary.totalExposure * 1000)} hint="Aggregate claim value" icon={AlertTriangle} accent="rose" />
              <StatTile label="Due Next 14d" value={`${mattersSummary.dueNext14d}`} hint="Imminent deadlines" icon={CalendarClock} accent="amber" />
              <StatTile label="External Counsel" value={`${mattersSummary.externalCounsel}`} hint="Firms engaged" icon={Scale} />
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
          {/* Donut + budget vs burn */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <PanelCard accent="violet">
              <PanelHeader
                title="Matters by Status"
                subtitle="Active docket distribution · click to filter"
                icon={Gavel}
                accent="violet"
              />
              <div className="p-4">
                <MattersDonut />
              </div>
            </PanelCard>
            <PanelCard
              accent="violet"
              className="xl:col-span-2"
            >
              <PanelHeader
                title="Budget vs Burn"
                subtitle="Per matter · USD thousands"
                icon={Wallet}
                accent="violet"
                action={
                  <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1 text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-slate-200" /> Budget</span>
                    <span className="inline-flex items-center gap-1 text-violet-700"><span className="h-1.5 w-1.5 rounded-full bg-violet-600" /> Burn</span>
                  </div>
                }
              />
              <div className="p-4">
                <BudgetVsBurnChart />
              </div>
            </PanelCard>
          </div>

          {/* Upcoming milestones timeline */}
          <PanelCard accent="violet">
            <PanelHeader
              title="Upcoming Milestones"
              subtitle="Next 6 deadlines across active matters"
              icon={CalendarClock}
              accent="violet"
              action={<Tag tone="warning">{mattersSummary.dueNext14d} due within 14d</Tag>}
            />
            <div className="max-h-[320px] overflow-y-auto harch-scroll p-3">
              <MattersTimeline />
            </div>
          </PanelCard>

          {/* Matters docket table */}
          <PanelCard accent="violet">
            <PanelHeader
              title="Legal Matters Docket"
              subtitle="Open matters · sortable, filterable, searchable"
              icon={Gavel}
              accent="violet"
              action={
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search matter, counterparty, counsel…"
                      className="h-7 w-56 pl-7 text-[11px] sm:w-64"
                    />
                  </div>
                </div>
              }
            />
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-3 py-2.5">
              <Filter className="h-3 w-3 text-slate-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Type</span>
              <button
                onClick={() => setTypeFilter("all")}
                className={cn(
                  "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 transition-colors",
                  typeFilter === "all" ? "bg-violet-700 text-white ring-violet-700" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
                )}
              >
                All
              </button>
              {allTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={cn(
                    "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 transition-colors",
                    typeFilter === t ? "bg-violet-700 text-white ring-violet-700" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="max-h-[640px] overflow-y-auto harch-scroll">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-white">
                  <TableRow className="text-[10px] uppercase tracking-wider text-slate-500 hover:bg-transparent">
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("id")}>
                        ID {renderSortIcon("id")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("name")}>
                        Matter {renderSortIcon("name")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("type")}>
                        Type {renderSortIcon("type")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("counterparty")}>
                        Counterparty {renderSortIcon("counterparty")}
                      </button>
                    </TableHead>
                    <TableHead>Counsel</TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("status")}>
                        Status {renderSortIcon("status")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("burn")}>
                        Budget · Burn {renderSortIcon("burn")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("exposure")}>
                        Exposure {renderSortIcon("exposure")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("deadline")}>
                        Deadline {renderSortIcon("deadline")}
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((m: LegalMatter) => {
                    const tint = matterStatusTint[m.status];
                    const typeColor = matterTypeColor[m.type];
                    const days = daysFromToday(m.deadline);
                    const overdue = days < 0;
                    const burnPct = Math.round((m.burn / m.budget) * 100);
                    const overBudget = burnPct > 80;
                    return (
                      <TableRow key={m.id} className="text-[12px] hover:bg-slate-50">
                        <TableCell>
                          <span className="font-mono text-[11px] font-semibold text-violet-700">{m.id}</span>
                        </TableCell>
                        <TableCell className="max-w-[240px]">
                          <div className="flex flex-col">
                            <span className="truncate font-medium text-slate-900" title={m.name}>{m.name}</span>
                            <span className="truncate text-[10px] text-slate-400" title={m.jurisdiction}>{m.jurisdiction}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1"
                            style={{ color: typeColor, background: `${typeColor}15`, boxShadow: `inset 0 0 0 1px ${typeColor}40` }}
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: typeColor }} />
                            {m.type}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate text-slate-700" title={m.counterparty}>{m.counterparty}</TableCell>
                        <TableCell className="max-w-[160px] truncate text-slate-600" title={m.counsel}>{m.counsel}</TableCell>
                        <TableCell>
                          <Tag tone={matterStatusTone[m.status]} size="xs">
                            <span className={cn("h-1.5 w-1.5 rounded-full", tint.dot)} />
                            {m.status}
                          </Tag>
                        </TableCell>
                        <TableCell className="tabular text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-[11px] font-semibold text-slate-900">{formatUSD(m.budget * 1000)}</span>
                            <div className="mt-1 flex w-32 items-center gap-1.5">
                              <div className="flex-1">
                                <ProgressBar
                                  value={Math.min(burnPct, 100)}
                                  tone={overBudget ? "rose" : burnPct > 60 ? "amber" : "emerald"}
                                  height={5}
                                />
                              </div>
                              <span className={cn("tabular text-[10px] font-semibold", overBudget ? "text-rose-700" : burnPct > 60 ? "text-amber-700" : "text-slate-600")}>
                                {formatUSD(m.burn * 1000)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="tabular text-right font-semibold text-slate-700">{formatUSD(m.exposure * 1000)}</TableCell>
                        <TableCell className="tabular whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className={cn("font-medium", overdue ? "text-rose-700" : "text-slate-700")}>{formatDate(m.deadline)}</span>
                            <span className={cn("text-[10px]", overdue ? "text-rose-600" : "text-slate-400")}>
                              {overdue ? `${Math.abs(days)}d overdue` : `in ${days}d`}
                            </span>
                            <span className="truncate text-[10px] text-slate-400" title={m.nextMilestone}>{m.nextMilestone}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-8">
                        <EmptyState icon={Search} title="No matters match the current filters." description="Try clearing the type filter or search." accent="violet" />
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Gavel className="h-3.5 w-3.5 text-violet-600" />
                Showing <span className="tabular font-semibold text-slate-700">{filtered.length}</span> of {legalMatters.length} matters · {mattersSummary.externalCounsel} counsel firms
              </span>
              <span className="text-slate-400">Anchored {relativeTime("2025-11-15T10:30:00Z")} · matters docket</span>
            </div>
          </PanelCard>
        </motion.div>
      )}
    </div>
  );
}
