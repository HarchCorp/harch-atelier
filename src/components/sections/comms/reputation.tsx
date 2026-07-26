"use client";

/**
 * Comms Reputation — Figma-grade rework (V18.0)
 *
 * Composition:
 *  - 6 StatTile KPIs (rose accent) with 320ms mount skeleton
 *  - Reputation MetricRing (auto-tone) + 12-month trend line
 *  - NPS MetricRing (-100..+100 mapped to 0..100) + 30-day trend line
 *  - Stakeholder × month reputation heatmap (color-coded, hover tooltips)
 *  - Executive reputation cards (PanelCard per exec, sentiment ProgressBar)
 *  - Reputation drivers + pain points table (sortable, type Tag)
 */
import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChevronDown,
  ChevronUp,
  Star,
  ThumbsDown,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  Users as UsersIcon,
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
import { DeferredChart } from "@/components/dataviz/chart-skeleton";
import { SectionHeader, StatusChip } from "../section-header";
import {
  PanelCard,
  PanelHeader,
  StatTile,
  MetricRing,
  Tag,
  ProgressBar,
  StaggerGrid,
} from "../design-system";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  executiveReps,
  reputationDrivers,
  reputationHeatmap,
  reputationSummary,
  reputationTrend12m,
  reputationTrend30d,
  type ReputationDriver,
} from "@/lib/comms-data";
import { cn } from "@/lib/utils";
import {
  KpiSkeletonGrid,
  PanelSkeletons,
  PR,
  PremiumTooltip,
  useMountReady,
} from "./_shared";

type SortKey = "topic" | "impact" | "volume" | "trend" | "type";

/* ------------------------------------------------------------------ */
/*  Reputation 12-month trend line                                     */
/* ------------------------------------------------------------------ */

function ReputationTrend12m() {
  return (
    <DeferredChart height="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={reputationTrend12m} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
            minTickGap={12}
          />
          <YAxis
            domain={[40, 90]}
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              const idx = Number(payload.find((p) => p.dataKey === "index")?.value ?? 0);
              const sen = Number(payload.find((p) => p.dataKey === "sentiment")?.value ?? 0);
              return (
                <PremiumTooltip
                  header={label}
                  rows={[
                    { label: "Index", value: `${idx}`, tone: idx >= 60 ? "emerald" : "amber" },
                    {
                      label: "Net sentiment",
                      value: `${sen >= 0 ? "+" : ""}${sen}`,
                      tone: sen >= 0 ? "emerald" : "rose",
                    },
                  ]}
                />
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="index"
            stroke="#e11d48"
            strokeWidth={2.4}
            dot={{ r: 3, fill: "#e11d48" }}
            activeDot={{ r: 5 }}
            name="Reputation index"
          />
        </LineChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Reputation 30-day trend line                                       */
/* ------------------------------------------------------------------ */

function ReputationTrend30d() {
  return (
    <DeferredChart height="h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={reputationTrend30d} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
            minTickGap={20}
          />
          <YAxis
            domain={[40, 90]}
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              const idx = Number(payload.find((p) => p.dataKey === "index")?.value ?? 0);
              const sen = Number(payload.find((p) => p.dataKey === "sentiment")?.value ?? 0);
              return (
                <PremiumTooltip
                  header={label}
                  rows={[
                    { label: "Index", value: `${idx}`, tone: idx >= 60 ? "emerald" : "amber" },
                    {
                      label: "Net sentiment",
                      value: `${sen >= 0 ? "+" : ""}${sen}`,
                      tone: sen >= 0 ? "emerald" : "rose",
                    },
                  ]}
                />
              );
            }}
          />
          <Line type="monotone" dataKey="index" stroke="#e11d48" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Index" />
        </LineChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Stakeholder × month reputation heatmap                             */
/* ------------------------------------------------------------------ */

function ReputationHeatmap() {
  const months = reputationHeatmap[0].cells.map((c) => c.month);
  const cellTint = (score: number) => {
    if (score >= 75) return "bg-emerald-500 text-white";
    if (score >= 60) return "bg-emerald-300 text-emerald-900";
    if (score >= 50) return "bg-amber-300 text-amber-900";
    if (score >= 40) return "bg-orange-300 text-orange-900";
    return "bg-rose-400 text-white";
  };
  return (
    <TooltipProvider delayDuration={120}>
      <div className="harch-scroll overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-[11px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-slate-500">
              <th className="sticky left-0 z-10 bg-white px-3 py-2 text-left">Stakeholder</th>
              {months.map((m) => (
                <th key={m} className="px-2 py-2 text-center">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reputationHeatmap.map((row, i) => (
              <tr
                key={row.stakeholder}
                className={cn("border-t border-slate-100", i % 2 === 1 ? "bg-slate-50/40" : "bg-white")}
              >
                <td className="sticky left-0 z-10 bg-inherit px-3 py-1.5 font-medium text-slate-700">
                  {row.stakeholder}
                </td>
                {row.cells.map((c) => (
                  <td key={c.month} className="px-1.5 py-1.5 text-center">
                    <RadixTooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={cn(
                            "tabular mx-auto flex h-9 w-12 cursor-default items-center justify-center rounded-md text-[11px] font-bold ring-1 transition-all duration-200 hover:scale-105 hover:shadow-sm",
                            cellTint(c.score),
                          )}
                        >
                          {c.score}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="!bg-slate-900 !text-white">
                        <span className="text-[10px] font-semibold uppercase tracking-wide">
                          {row.stakeholder} · {c.month}
                        </span>
                        <span className="tabular mt-0.5 block text-[12px] font-bold">{c.score}/100</span>
                      </TooltipContent>
                    </RadixTooltip>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-end gap-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        <span>Score:</span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-4 rounded bg-rose-400" /> &lt;40
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-4 rounded bg-orange-300" /> 40s
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-4 rounded bg-amber-300" /> 50s
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-4 rounded bg-emerald-300" /> 60s
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-4 rounded bg-emerald-500" /> 75+
        </span>
      </div>
    </TooltipProvider>
  );
}

/* ------------------------------------------------------------------ */
/*  Executive reputation mini-cards                                    */
/* ------------------------------------------------------------------ */

function ExecutiveCards() {
  return (
    <StaggerGrid className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {executiveReps.map((e, i) => {
        const isUp = e.delta > 0;
        const ringTone = e.sentiment > 70 ? "emerald" : e.sentiment > 55 ? "amber" : "rose";
        return (
          <PanelCard key={e.name} accent={PR} delay={0.1 + i * 0.04} className="p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200">
                  {e.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div className="flex flex-col">
                  <span className="text-[12px] font-semibold text-slate-900">{e.name}</span>
                  <span className="text-[10px] text-slate-500">{e.title}</span>
                </div>
              </div>
              <Tag
                tone={isUp ? "positive" : "negative"}
                size="xs"
                icon={isUp ? TrendingUp : TrendingDown}
              >
                {isUp ? "+" : ""}
                {e.delta.toFixed(1)}
              </Tag>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1">
                <ProgressBar
                  value={e.sentiment}
                  tone={ringTone === "emerald" ? "emerald" : ringTone === "amber" ? "amber" : "rose"}
                  height={5}
                  threshold={70}
                />
              </div>
              <span className="tabular text-[14px] font-bold text-slate-900">{e.sentiment}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-wide text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3" /> {e.mentions} mentions
              </span>
              <span className="inline-flex items-center gap-1">
                <ThumbsDown className="h-3 w-3" /> {e.negative}% neg
              </span>
            </div>
          </PanelCard>
        );
      })}
    </StaggerGrid>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function CommsReputation(_: SectionComponentProps) {
  const ready = useMountReady(320);
  const [sortKey, setSortKey] = React.useState<SortKey>("impact");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");

  const filtered = React.useMemo(() => {
    const list = reputationDrivers.slice();
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (sortKey === "topic" || sortKey === "trend" || sortKey === "type") return String(a[sortKey]).localeCompare(String(b[sortKey])) * dir;
      if (sortKey === "impact" || sortKey === "volume") return (a[sortKey] - b[sortKey]) * dir;
      return 0;
    });
    return list;
  }, [sortKey, sortDir]);

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

  const repTone = reputationSummary.current > 75 ? "emerald" : reputationSummary.current > 55 ? "amber" : "rose";
  const repVerdict = reputationSummary.current > 75 ? "Strong" : reputationSummary.current > 55 ? "Stable" : "At risk";
  const npsPct = (reputationSummary.nps + 100) / 2;
  const npsTone = reputationSummary.nps > 50 ? "emerald" : reputationSummary.nps > 0 ? "amber" : "rose";
  const npsVerdict = reputationSummary.nps > 50 ? "Excellent" : reputationSummary.nps > 0 ? "Good" : "Needs work";

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="comms-reputation"
        accountType="pr"
        accent="rose"
        statusChips={
          <>
            <StatusChip label={`Index ${reputationSummary.current}`} tone={reputationSummary.current > 60 ? "positive" : "warning"} icon={Star} />
            <StatusChip label={`NPS ${reputationSummary.nps >= 0 ? "+" : ""}${reputationSummary.nps}`} tone="positive" icon={ThumbsUp} />
            <StatusChip
              label={`Δ30d ${reputationSummary.delta30d >= 0 ? "+" : ""}${reputationSummary.delta30d.toFixed(1)}`}
              tone={reputationSummary.delta30d >= 0 ? "positive" : "negative"}
              icon={reputationSummary.delta30d >= 0 ? TrendingUp : TrendingDown}
            />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile
                label="Reputation Index"
                value={`${reputationSummary.current}`}
                delta={`${reputationSummary.delta30d >= 0 ? "+" : ""}${reputationSummary.delta30d.toFixed(1)}`}
                deltaTone={reputationSummary.delta30d >= 0 ? "positive" : "negative"}
                hint="30-day delta"
                icon={Star}
                accent={PR}
              />
              <StatTile
                label="NPS Proxy"
                value={`${reputationSummary.nps >= 0 ? "+" : ""}${reputationSummary.nps}`}
                delta={`+${reputationSummary.npsDelta}`}
                deltaTone="positive"
                hint="Net Promoter proxy"
                icon={ThumbsUp}
                accent={PR}
              />
              <StatTile
                label="Δ90 days"
                value={`${reputationSummary.delta90d >= 0 ? "+" : ""}${reputationSummary.delta90d.toFixed(1)}`}
                hint="Quarterly trend"
                icon={reputationSummary.delta90d >= 0 ? TrendingUp : TrendingDown}
                accent={PR}
              />
              <StatTile
                label="Avg Exec Sentiment"
                value={`${reputationSummary.avgExecutive}`}
                hint={`${executiveReps.length} executives`}
                icon={UsersIcon}
                accent={PR}
              />
              <StatTile
                label="Active Drivers"
                value={`${reputationDrivers.filter((d) => d.type === "driver").length}`}
                hint="Positive contributors"
                icon={TrendingUp}
                accent={PR}
              />
              <StatTile
                label="Pain Points"
                value={`${reputationDrivers.filter((d) => d.type === "pain").length}`}
                hint="Negative contributors"
                icon={TrendingDown}
                accent={PR}
              />
            </StaggerGrid>
          ) : (
            <KpiSkeletonGrid />
          )
        }
      />

      {ready ? (
        <>
          {/* Reputation gauge + 12m trend */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <PanelCard accent={PR} delay={0.05}>
              <PanelHeader
                title="Reputation Score"
                subtitle="Composite · 30-day rolling"
                icon={Star}
                accent={PR}
                action={<Tag tone={repTone}>{repVerdict}</Tag>}
              />
              <div className="flex flex-col items-center justify-center gap-3 px-4 py-6">
                <MetricRing
                  value={reputationSummary.current}
                  size={180}
                  stroke={14}
                  tone={repTone}
                  label="Reputation"
                  sublabel="0–100"
                />
                <div className="flex items-center gap-3 text-[10px] uppercase tracking-wide text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 75+
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> 55–74
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> &lt;55
                  </span>
                </div>
              </div>
            </PanelCard>
            <PanelCard accent={PR} className="xl:col-span-2" delay={0.1}>
              <PanelHeader
                title="Reputation Trend — 12 months"
                subtitle="Monthly net reputation index"
                icon={TrendingUp}
                accent={PR}
              />
              <div className="p-4">
                <ReputationTrend12m />
              </div>
            </PanelCard>
          </div>

          {/* NPS gauge + 30d trend */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <PanelCard accent={PR} delay={0.15}>
              <PanelHeader
                title="NPS Proxy"
                subtitle="Net Promoter Score equivalent"
                icon={ThumbsUp}
                accent={PR}
                action={<Tag tone={npsTone}>{npsVerdict}</Tag>}
              />
              <div className="flex flex-col items-center justify-center gap-3 px-4 py-6">
                <MetricRing
                  value={npsPct}
                  size={180}
                  stroke={14}
                  tone={npsTone}
                  label="NPS"
                  sublabel="−100..+100"
                />
                <span className="tabular text-[14px] font-bold text-slate-900">
                  {reputationSummary.nps >= 0 ? "+" : ""}
                  {reputationSummary.nps}
                </span>
              </div>
            </PanelCard>
            <PanelCard accent={PR} className="xl:col-span-2" delay={0.2}>
              <PanelHeader
                title="Index Trend — 30 days"
                subtitle="Daily reputation index"
                icon={Star}
                accent={PR}
              />
              <div className="p-4">
                <ReputationTrend30d />
              </div>
            </PanelCard>
          </div>

          {/* Heatmap */}
          <PanelCard accent={PR} delay={0.25}>
            <PanelHeader
              title="Reputation by Stakeholder × Month"
              subtitle="7 stakeholders × 6 months · color-coded by score"
              icon={UsersIcon}
              accent={PR}
            />
            <div className="p-4">
              <ReputationHeatmap />
            </div>
          </PanelCard>

          {/* Executives + Drivers */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <PanelCard accent={PR} delay={0.3}>
              <PanelHeader
                title="Executive Reputation"
                subtitle="Per-executive sentiment + mention volume"
                icon={UsersIcon}
                accent={PR}
                action={<Tag tone="rose">{executiveReps.length} tracked</Tag>}
              />
              <div className="p-4">
                <ExecutiveCards />
              </div>
            </PanelCard>

            <PanelCard accent={PR} delay={0.35}>
              <PanelHeader
                title="Reputation Drivers + Pain Points"
                subtitle="Topics with highest reputation impact"
                icon={Star}
                accent={PR}
              />
              <div className="harch-scroll max-h-[420px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-white">
                    <TableRow className="text-[10px] uppercase tracking-wide text-slate-500">
                      <TableHead>
                        <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("topic")}>
                          Topic {renderSortIcon("topic")}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("type")}>
                          Type {renderSortIcon("type")}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("impact")}>
                          Impact {renderSortIcon("impact")}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("volume")}>
                          Volume {renderSortIcon("volume")}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("trend")}>
                          Trend {renderSortIcon("trend")}
                        </button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((d: ReputationDriver) => {
                      const isDriver = d.type === "driver";
                      return (
                        <TableRow key={d.id} className="text-[12px] transition-colors hover:bg-slate-50">
                          <TableCell className="max-w-[260px]">
                            <span className="truncate text-slate-700" title={d.topic}>
                              {d.topic}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Tag tone={isDriver ? "positive" : "negative"} size="xs">
                              {d.type}
                            </Tag>
                          </TableCell>
                          <TableCell className="tabular text-right">
                            <Tag tone={d.impact >= 0 ? "positive" : "negative"} size="xs">
                              {d.impact >= 0 ? "+" : ""}
                              {d.impact}
                            </Tag>
                          </TableCell>
                          <TableCell className="tabular text-right text-slate-700">
                            {d.volume.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Tag
                              tone={
                                d.trend === "up"
                                  ? "positive"
                                  : d.trend === "down"
                                    ? "negative"
                                    : "neutral"
                              }
                              size="xs"
                              icon={
                                d.trend === "up"
                                  ? TrendingUp
                                  : d.trend === "down"
                                    ? TrendingDown
                                    : undefined
                              }
                            >
                              {d.trend}
                            </Tag>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </PanelCard>
          </div>
        </>
      ) : (
        <PanelSkeletons count={4} />
      )}
    </div>
  );
}
