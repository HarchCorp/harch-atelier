"use client";

/**
 * Comms Share of Voice — Figma-grade rework (V18.0)
 *
 * Composition:
 *  - 6 StatTile KPIs (rose accent) with 320ms mount skeleton
 *  - SoV distribution donut (HarchCorp tinted rose + center total)
 *  - 30-day SoV trend multi-line (HarchCorp = rose primary stroke)
 *  - Owned vs earned vs shared media bars (4 competitors × 3 media types)
 *  - SoV by outlet tier stacked bars
 *  - Competitor mention tracker table (HarchCorp highlighted row)
 */
import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Layers,
  Megaphone,
  PieChart as PieIcon,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeferredChart } from "@/components/dataviz/chart-skeleton";
import { SectionHeader, StatusChip } from "../section-header";
import {
  PanelCard,
  PanelHeader,
  StatTile,
  Tag,
  ProgressBar,
  StaggerGrid,
} from "../design-system";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  competitorMentions,
  sovByMedia,
  sovByTier,
  sovDistribution,
  sovSummary,
  sovTrend30d,
  type CompetitorMention,
  type MediaType,
} from "@/lib/comms-data";
import { cn } from "@/lib/utils";
import {
  KpiSkeletonGrid,
  PanelSkeletons,
  PR,
  PremiumTooltip,
  useMountReady,
} from "./_shared";

type SortKey = "name" | "mentions" | "reach" | "sentimentShare" | "sov" | "delta30d";

/* ------------------------------------------------------------------ */
/*  SoV distribution donut (HarchCorp = rose)                          */
/* ------------------------------------------------------------------ */

const sovColors = ["#e11d48", "#0ea5e9", "#a855f7", "#10b981", "#f59e0b", "#64748b", "#94a3b8"];

function SovDonut() {
  const total = sovDistribution.reduce((s, x) => s + x.value, 0);
  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sovDistribution}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={94}
              paddingAngle={2}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {sovDistribution.map((s, i) => (
                <Cell key={s.name} fill={sovColors[i % sovColors.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0];
                const pct = Math.round((Number(p.value) / total) * 1000) / 10;
                return (
                  <PremiumTooltip
                    header={String(p.name)}
                    rows={[
                      { label: "Mentions", value: Number(p.value).toLocaleString() },
                      { label: "Share", value: `${pct}%`, tone: "rose" },
                    ]}
                  />
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[9px] uppercase tracking-wide text-slate-400">HarchCorp</span>
          <span className="tabular text-[24px] font-bold text-rose-700">{sovSummary.harchShare}%</span>
          <span className="text-[9px] uppercase tracking-wide text-slate-400">rank #{sovSummary.rank}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {sovDistribution.map((s, i) => {
          const isTarget = s.isTarget;
          return (
            <div
              key={s.name}
              className={cn(
                "flex items-center justify-between rounded-md px-2 py-1.5 ring-1",
                isTarget ? "bg-rose-50 ring-rose-200" : "bg-slate-50 ring-slate-100",
              )}
            >
              <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-slate-600">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: sovColors[i % sovColors.length] }}
                />
                <span className="truncate">{s.name}</span>
              </span>
              <span
                className={cn(
                  "tabular text-[11px] font-bold",
                  isTarget ? "text-rose-700" : "text-slate-800",
                )}
              >
                {Math.round((s.value / total) * 1000) / 10}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  30-day SoV trend multi-line (HarchCorp primary)                    */
/* ------------------------------------------------------------------ */

function SovTrendLines() {
  return (
    <DeferredChart height="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sovTrend30d} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
            minTickGap={20}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={32}
            unit="%"
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              return (
                <PremiumTooltip
                  header={label}
                  rows={payload.map((p) => ({
                    label: String(p.dataKey),
                    value: `${p.value}%`,
                    tone: p.dataKey === "HarchCorp" ? "rose" : "default",
                    dot: p.color,
                  }))}
                />
              );
            }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 10, paddingTop: 6 }}
            formatter={(value) => (
              <span className="text-[10px] text-slate-600">{value}</span>
            )}
          />
          <Line type="monotone" dataKey="HarchCorp" stroke="#e11d48" strokeWidth={2.6} dot={false} name="HarchCorp" />
          <Line type="monotone" dataKey="Northwind" stroke="#0ea5e9" strokeWidth={1.6} dot={false} name="Northwind" />
          <Line type="monotone" dataKey="Vela" stroke="#a855f7" strokeWidth={1.6} dot={false} name="Vela Dynamics" />
          <Line type="monotone" dataKey="Orbital" stroke="#10b981" strokeWidth={1.6} dot={false} name="Orbital Systems" />
        </LineChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Owned vs earned vs shared bars                                     */
/* ------------------------------------------------------------------ */

const mediaTypeLabels: Record<MediaType, string> = {
  owned: "Owned",
  earned: "Earned",
  shared: "Shared",
};

function SovByMediaBars() {
  return (
    <DeferredChart height="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sovByMedia} margin={{ top: 10, right: 12, left: 0, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="type"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
            tickFormatter={(v) => mediaTypeLabels[v as MediaType]}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={32}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              return (
                <PremiumTooltip
                  header={mediaTypeLabels[label as MediaType]}
                  rows={payload.map((p) => ({
                    label: String(p.dataKey),
                    value: String(p.value),
                    tone: p.dataKey === "HarchCorp" ? "rose" : "default",
                    dot: p.color,
                  }))}
                />
              );
            }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 10, paddingTop: 6 }}
            formatter={(value) => (
              <span className="text-[10px] text-slate-600">{value}</span>
            )}
          />
          <Bar dataKey="HarchCorp" fill="#e11d48" barSize={26} name="HarchCorp" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Northwind" fill="#0ea5e9" barSize={26} name="Northwind" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Vela" fill="#a855f7" barSize={26} name="Vela" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Orbital" fill="#10b981" barSize={26} name="Orbital" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  SoV by tier stacked bars                                           */
/* ------------------------------------------------------------------ */

function SovByTierStacked() {
  return (
    <DeferredChart height="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sovByTier} margin={{ top: 10, right: 12, left: 0, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="tier"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
            tickFormatter={(v) => v.replace("tier", "Tier ")}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={32}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              return (
                <PremiumTooltip
                  header={label.replace("tier", "Tier ")}
                  rows={payload.map((p) => ({
                    label: String(p.dataKey),
                    value: String(p.value),
                    tone: p.dataKey === "HarchCorp" ? "rose" : "default",
                    dot: p.color,
                  }))}
                />
              );
            }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 10, paddingTop: 6 }}
            formatter={(value) => (
              <span className="text-[10px] text-slate-600">{value}</span>
            )}
          />
          <Bar dataKey="HarchCorp" stackId="a" fill="#e11d48" barSize={42} name="HarchCorp" />
          <Bar dataKey="Northwind" stackId="a" fill="#0ea5e9" barSize={42} name="Northwind" />
          <Bar dataKey="Vela" stackId="a" fill="#a855f7" barSize={42} name="Vela" />
          <Bar dataKey="Orbital" stackId="a" fill="#10b981" barSize={42} name="Orbital" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function CommsSov(_: SectionComponentProps) {
  const ready = useMountReady(320);
  const [sortKey, setSortKey] = React.useState<SortKey>("sov");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");

  const filtered = React.useMemo(() => {
    const list = competitorMentions.slice();
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      if (sortKey === "delta30d" || sortKey === "sov" || sortKey === "sentimentShare") return (a[sortKey] - b[sortKey]) * dir;
      if (sortKey === "mentions" || sortKey === "reach") return (a[sortKey] - b[sortKey]) * dir;
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

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="comms-sov"
        accountType="pr"
        accent="rose"
        statusChips={
          <>
            <StatusChip label={`HarchCorp ${sovSummary.harchShare}%`} tone="positive" icon={Megaphone} />
            <StatusChip label={`Rank #${sovSummary.rank}`} tone="positive" icon={TrendingUp} />
            <StatusChip label={`${sovSummary.competitors} competitors`} tone="neutral" icon={Layers} />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile
                label="HarchCorp SoV"
                value={`${sovSummary.harchShare}%`}
                delta={`${sovSummary.harchDelta30d >= 0 ? "+" : ""}${sovSummary.harchDelta30d.toFixed(1)}pp`}
                deltaTone={sovSummary.harchDelta30d >= 0 ? "positive" : "negative"}
                hint="30-day change"
                icon={PieIcon}
                accent={PR}
              />
              <StatTile
                label="Industry Rank"
                value={`#${sovSummary.rank}`}
                hint={`Among ${sovSummary.competitors + 1} competitors`}
                icon={TrendingUp}
                accent={PR}
              />
              <StatTile
                label="Total Mentions"
                value={sovSummary.totalMentions.toLocaleString()}
                hint="Trailing 30 days"
                icon={Megaphone}
                accent={PR}
              />
              <StatTile
                label="Competitors"
                value={`${sovSummary.competitors}`}
                hint="Tracked peer set"
                icon={Layers}
                accent={PR}
              />
              <StatTile
                label="Owned Media"
                value={`${sovSummary.ownedShare}%`}
                hint="HarchCorp channels"
                icon={Megaphone}
                accent={PR}
              />
              <StatTile
                label="Earned + Shared"
                value={`${100 - sovSummary.ownedShare}%`}
                hint="Industry split"
                icon={Layers}
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
          {/* Donut + 30d trend */}
          <StaggerGrid className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <PanelCard accent={PR} delay={0.05}>
              <PanelHeader
                title="Share of Voice — Distribution"
                subtitle="HarchCorp vs competitors · 30d mentions"
                icon={PieIcon}
                accent={PR}
              />
              <div className="p-4">
                <SovDonut />
              </div>
            </PanelCard>
            <PanelCard accent={PR} delay={0.1}>
              <PanelHeader
                title="SoV Trend — 30 days"
                subtitle="Daily share % across 4 key players"
                icon={Megaphone}
                accent={PR}
                action={
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-rose-700">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#e11d48" }} /> Harch
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-500" /> NWD
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-500" /> Vela
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Orbital
                    </span>
                  </div>
                }
              />
              <div className="p-4">
                <SovTrendLines />
              </div>
            </PanelCard>
          </StaggerGrid>

          {/* Media type + tier */}
          <StaggerGrid className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <PanelCard accent={PR} delay={0.15}>
              <PanelHeader
                title="Owned vs Earned vs Shared"
                subtitle="Mentions by media type · HarchCorp vs competitors"
                icon={Layers}
                accent={PR}
              />
              <div className="p-4">
                <SovByMediaBars />
              </div>
            </PanelCard>
            <PanelCard accent={PR} delay={0.2}>
              <PanelHeader
                title="SoV by Outlet Tier"
                subtitle="Tier-1 / tier-2 / tier-3 stacked"
                icon={PieIcon}
                accent={PR}
              />
              <div className="p-4">
                <SovByTierStacked />
              </div>
            </PanelCard>
          </StaggerGrid>

          {/* Competitor mentions table */}
          <PanelCard accent={PR} delay={0.25}>
            <PanelHeader
              title="Competitor Mention Tracker"
              subtitle="Sortable peer benchmarking · mentions, reach, sentiment, SoV"
              icon={Filter}
              accent={PR}
              action={
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  <Filter className="h-3 w-3" /> {competitorMentions.length} peers
                </div>
              }
            />
            <div className="harch-scroll max-h-[440px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-white">
                  <TableRow className="text-[10px] uppercase tracking-wide text-slate-500">
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("name")}>
                        Company {renderSortIcon("name")}
                      </button>
                    </TableHead>
                    <TableHead>Ticker</TableHead>
                    <TableHead className="text-right">
                      <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("mentions")}>
                        Mentions {renderSortIcon("mentions")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("reach")}>
                        Reach {renderSortIcon("reach")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("sentimentShare")}>
                        Sentiment % {renderSortIcon("sentimentShare")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("sov")}>
                        SoV % {renderSortIcon("sov")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("delta30d")}>
                        Δ 30d {renderSortIcon("delta30d")}
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c: CompetitorMention) => {
                    const isTarget = c.name === "HarchCorp";
                    return (
                      <TableRow
                        key={c.ticker}
                        className={cn(
                          "text-[12px] transition-colors hover:bg-slate-50",
                          isTarget && "bg-rose-50/60",
                        )}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <span
                              className={cn(
                                "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white",
                                isTarget ? "bg-rose-700" : "bg-slate-800",
                              )}
                            >
                              {c.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </span>
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-900">{c.name}</span>
                              {isTarget ? (
                                <span className="text-[10px] font-semibold uppercase text-rose-700">Target</span>
                              ) : (
                                <span className="text-[10px] text-slate-400">Competitor</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="tabular text-slate-600">{c.ticker}</TableCell>
                        <TableCell className="tabular text-right text-slate-700">
                          {c.mentions.toLocaleString()}
                        </TableCell>
                        <TableCell className="tabular text-right text-slate-700">
                          {(c.reach / 1_000_000).toFixed(1)}M
                        </TableCell>
                        <TableCell className="tabular text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="hidden w-16 sm:block">
                              <ProgressBar
                                value={c.sentimentShare}
                                tone="emerald"
                                height={5}
                              />
                            </div>
                            <span className="font-semibold text-slate-800">{c.sentimentShare}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="tabular text-right">
                          <Tag tone={isTarget ? "rose" : "neutral"} size="xs">
                            {c.sov.toFixed(1)}%
                          </Tag>
                        </TableCell>
                        <TableCell className="tabular text-right">
                          <Tag
                            tone={c.delta30d >= 0 ? "positive" : "negative"}
                            size="xs"
                            icon={c.delta30d >= 0 ? TrendingUp : TrendingDown}
                          >
                            {c.delta30d >= 0 ? "+" : ""}
                            {c.delta30d.toFixed(1)}pp
                          </Tag>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </PanelCard>
        </>
      ) : (
        <PanelSkeletons count={4} />
      )}
    </div>
  );
}
