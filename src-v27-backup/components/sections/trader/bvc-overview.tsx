"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Banknote,
  Building2,
  Clock,
  Flame,
  Gauge,
  Minus,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  MiniSparkline,
  Divider,
  type RoleAccent,
} from "../design-system";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  masi30d,
  masiIntraday,
  masiSessionStats,
  masiLatest,
  masiPrevClose,
  sectorIndices,
  topGainers,
  topLosers,
  mostActive,
  heatColor,
  formatMAD,
  formatVolume,
  chgColor,
  type IntradayPoint,
  type IndexPoint,
  type SectorIndex,
  type Equity,
} from "@/lib/market-data";
import { cn } from "@/lib/utils";

const TRADER: RoleAccent = "emerald";

/* ------------------------------------------------------------------ */
/*  Brief mount skeleton (premium feel)                                */
/* ------------------------------------------------------------------ */

function useReady(ms = 320) {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setReady(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return ready;
}

function KpiSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
      <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
      <div className="h-6 w-24 animate-pulse rounded bg-slate-100" />
      <div className="h-2.5 w-20 animate-pulse rounded bg-slate-100" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Chart tooltips                                                     */
/* ------------------------------------------------------------------ */

function IntradayTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  const masi = payload.find((p) => p.dataKey === "masi")?.value ?? 0;
  const masi20 = payload.find((p) => p.dataKey === "masi20")?.value ?? 0;
  const vol = payload.find((p) => p.dataKey === "volumeM")?.value ?? 0;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1.5 space-y-0.5 text-[11px]">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="h-2 w-2 rounded-sm bg-emerald-500" />
            MASI
          </span>
          <span className="tabular font-semibold text-slate-800">{formatMAD(masi)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="h-2 w-2 rounded-sm bg-sky-500" />
            MASI 20
          </span>
          <span className="tabular font-semibold text-slate-800">{formatMAD(masi20)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-4 border-t border-slate-100 pt-1 text-slate-500">
          <span>Turnover</span>
          <span className="tabular font-semibold">{formatMAD(vol)}M MAD</span>
        </div>
      </div>
    </div>
  );
}

function Index30dTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  let dateLabel = label;
  try {
    dateLabel = format(parseISO(label), "MMM d, yyyy");
  } catch {
    /* keep raw */
  }
  const masi = payload.find((p) => p.dataKey === "masi")?.value ?? 0;
  const masi20 = payload.find((p) => p.dataKey === "masi20")?.value ?? 0;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{dateLabel}</div>
      <div className="mt-1.5 space-y-0.5 text-[11px]">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="h-2 w-2 rounded-sm bg-emerald-500" />
            MASI
          </span>
          <span className="tabular font-semibold text-slate-800">{formatMAD(masi)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="h-2 w-2 rounded-sm bg-sky-500" />
            MASI 20
          </span>
          <span className="tabular font-semibold text-slate-800">{formatMAD(masi20)}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function chgArrow(chg: number) {
  if (chg > 0) return <ArrowUp className="h-3 w-3" />;
  if (chg < 0) return <ArrowDown className="h-3 w-3" />;
  return <Minus className="h-3 w-3" />;
}

/* ------------------------------------------------------------------ */
/*  Sector heatmap tile (premium, with hover tooltip)                  */
/* ------------------------------------------------------------------ */

function SectorHeatmapTile({ s }: { s: SectorIndex }) {
  const bg = heatColor(s.chgPct, 1.0);
  const [hover, setHover] = React.useState(false);
  return (
    <div
      className="group relative flex flex-col gap-1 rounded-lg border border-slate-200/60 p-3 transition-all duration-200 hover:scale-[1.03] hover:shadow-md hover:z-10"
      style={{ background: bg }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">{s.name}</span>
        <span className={cn("tabular text-[11px] font-semibold", chgColor(s.chgPct))}>
          {s.chgPct > 0 ? "+" : ""}
          {s.chgPct.toFixed(2)}%
        </span>
      </div>
      <div className="tabular text-[16px] font-bold text-slate-900">{formatMAD(s.value)}</div>
      <div className="flex items-center justify-between text-[10px] text-slate-500">
        <span>YTD</span>
        <span className={cn("tabular font-medium", chgColor(s.ytdPct))}>
          {s.ytdPct > 0 ? "+" : ""}
          {s.ytdPct.toFixed(1)}%
        </span>
      </div>
      {hover ? (
        <div className="pointer-events-none absolute -top-2 left-1/2 z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] shadow-lg">
          <div className="font-semibold text-slate-800">{s.name}</div>
          <div className="tabular mt-0.5 text-slate-600">
            Prev {formatMAD(s.prevClose)} · Last {formatMAD(s.value)}
          </div>
          <div className={cn("tabular", chgColor(s.chgPct))}>
            {s.chgPct > 0 ? "+" : ""}
            {(s.value - s.prevClose).toFixed(2)} ({s.chgPct > 0 ? "+" : ""}
            {s.chgPct.toFixed(2)}%)
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mover row (with sparkline)                                         */
/* ------------------------------------------------------------------ */

function MoverRow({ row }: { row: Equity }) {
  const sparkColor = row.chgPct >= 0 ? "#10b981" : "#e11d48";
  return (
    <TableRow className="text-[12px] transition-colors hover:bg-slate-50">
      <TableCell className="font-semibold text-slate-900">{row.ticker}</TableCell>
      <TableCell className="max-w-[140px] truncate text-slate-600">{row.name}</TableCell>
      <TableCell className="tabular text-right text-slate-800">{formatMAD(row.last)}</TableCell>
      <TableCell>
        <Tag
          tone={row.chgPct > 0 ? "positive" : row.chgPct < 0 ? "negative" : "neutral"}
          icon={row.chgPct > 0 ? ArrowUp : row.chgPct < 0 ? ArrowDown : Minus}
        >
          {Math.abs(row.chgPct).toFixed(2)}%
        </Tag>
      </TableCell>
      <TableCell className="tabular text-right text-slate-500">{formatVolume(row.volume)}</TableCell>
      <TableCell>
        <div className="flex justify-end">
          <MiniSparkline data={row.series30d} color={sparkColor} width={72} height={22} />
        </div>
      </TableCell>
    </TableRow>
  );
}

function MoversTable({
  rows,
  emptyHint,
}: {
  rows: Equity[];
  emptyHint: string;
}) {
  if (rows.length === 0) {
    return <div className="p-6 text-center text-[12px] text-slate-400">{emptyHint}</div>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-slate-50/80 text-[10px] uppercase tracking-wide text-slate-500">
          <TableHead>Ticker</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="text-right">Last</TableHead>
          <TableHead>Chg %</TableHead>
          <TableHead className="text-right">Volume</TableHead>
          <TableHead className="text-right">30D</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <MoverRow key={r.ticker} row={r} />
        ))}
      </TableBody>
    </Table>
  );
}

/* ------------------------------------------------------------------ */
/*  Sector performance diverging bar (animated)                        */
/* ------------------------------------------------------------------ */

function SectorPerformanceBar({ s, maxAbs }: { s: SectorIndex; maxAbs: number }) {
  const pct = maxAbs === 0 ? 0 : (s.chgPct / maxAbs) * 50;
  const isPos = s.chgPct >= 0;
  return (
    <div className="grid grid-cols-[110px_1fr_70px] items-center gap-3">
      <span className="truncate text-[12px] font-medium text-slate-700">{s.name}</span>
      <div className="relative h-5 rounded bg-slate-50">
        <div className="absolute left-1/2 top-0 h-full w-px bg-slate-300" />
        {Math.abs(pct) > 0.1 ? (
          <div
            className={cn(
              "absolute top-0 h-full rounded transition-all duration-500",
              isPos ? "bg-emerald-500" : "bg-rose-500",
            )}
            style={
              isPos
                ? { left: "50%", width: `${pct}%` }
                : { right: "50%", width: `${Math.abs(pct)}%` }
            }
          />
        ) : null}
      </div>
      <span className={cn("tabular text-right text-[12px] font-semibold", chgColor(s.chgPct))}>
        {s.chgPct > 0 ? "+" : ""}
        {s.chgPct.toFixed(2)}%
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function BvcOverview(_: SectionComponentProps) {
  const ready = useReady(320);

  const masiChg = masiLatest.masi - masiPrevClose.masi;
  const masiChgPct = (masiChg / masiPrevClose.masi) * 100;
  const masi20Chg = masiLatest.masi20 - masiPrevClose.masi20;
  const masi20ChgPct = (masi20Chg / masiPrevClose.masi20) * 100;
  const totalNames = masiSessionStats.advancers + masiSessionStats.decliners + masiSessionStats.unchanged;
  const declinerShare = (masiSessionStats.decliners / totalNames) * 100;
  const advancerPct = (masiSessionStats.advancers / totalNames) * 100;
  const declinerPct = (masiSessionStats.decliners / totalNames) * 100;
  const unchangedPct = (masiSessionStats.unchanged / totalNames) * 100;
  const maxAbsChg = Math.max(...sectorIndices.map((s) => Math.abs(s.chgPct)));
  const breadthTilt =
    masiSessionStats.advancers > masiSessionStats.decliners
      ? 100
      : (masiSessionStats.advancers / Math.max(1, masiSessionStats.decliners)) * 100;

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="mkt-bvc"
        accountType="trader"
        accent="emerald"
        statusChips={
          <>
            <StatusChip label="Session open" tone="positive" pulse icon={Clock} />
            <StatusChip label="BVC · Casablanca" tone="neutral" icon={Building2} />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile
                label="MASI"
                value={formatMAD(masiLatest.masi)}
                delta={`${masiChg >= 0 ? "+" : ""}${masiChg.toFixed(2)}`}
                deltaTone={masiChg >= 0 ? "positive" : "negative"}
                hint={`${masiChgPct >= 0 ? "+" : ""}${masiChgPct.toFixed(2)}% session`}
                icon={TrendingUp}
                accent={TRADER}
              />
              <StatTile
                label="MASI 20"
                value={formatMAD(masiLatest.masi20)}
                delta={`${masi20Chg >= 0 ? "+" : ""}${masi20Chg.toFixed(2)}`}
                deltaTone={masi20Chg >= 0 ? "positive" : "negative"}
                hint={`${masi20ChgPct >= 0 ? "+" : ""}${masi20ChgPct.toFixed(2)}% session`}
                icon={Activity}
                accent={TRADER}
              />
              <StatTile
                label="Advancers"
                value={`${masiSessionStats.advancers}`}
                delta={`${advancerPct.toFixed(0)}%`}
                deltaTone="positive"
                hint={`of ${totalNames} names`}
                icon={ArrowUp}
                accent={TRADER}
              />
              <StatTile
                label="Decliners"
                value={`${masiSessionStats.decliners}`}
                delta={`${declinerShare.toFixed(0)}%`}
                deltaTone="negative"
                hint="of board"
                icon={ArrowDown}
                accent={TRADER}
              />
              <StatTile
                label="Turnover"
                value={`${formatMAD(masiSessionStats.turnoverM, 0)}`}
                unit="M MAD"
                hint="Session-to-date"
                icon={Banknote}
                accent={TRADER}
              />
              <StatTile
                label="Session Range"
                value={`${formatMAD(masiSessionStats.low, 0)}`}
                hint={`High ${formatMAD(masiSessionStats.high, 0)}`}
                icon={Gauge}
                accent={TRADER}
              />
            </StaggerGrid>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <KpiSkeleton key={i} />
              ))}
            </div>
          )
        }
      />

      {/* Main chart row — intraday + 30d */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <PanelCard
          accent={TRADER}
          className="xl:col-span-2"
          delay={0.05}
        >
          <PanelHeader
            title="MASI — Intraday"
            subtitle="Bourse de Casablanca · 15-minute ticks"
            icon={Activity}
            accent={TRADER}
            action={
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Live
              </span>
            }
          />
          <div className="p-4">
            <DeferredChart height="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={masiIntraday as IntradayPoint[]} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="masiIntradayGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickLine={false}
                    interval={7}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    width={56}
                    tickFormatter={(v: number) => formatMAD(v, 0)}
                  />
                  <Tooltip content={<IntradayTooltip />} />
                  <ReferenceLine y={masiSessionStats.open} stroke="#94a3b8" strokeDasharray="2 4" />
                  <Area
                    type="monotone"
                    dataKey="masi"
                    stroke="#059669"
                    strokeWidth={1.8}
                    fill="url(#masiIntradayGrad)"
                  />
                  <Line type="monotone" dataKey="masi20" stroke="#0ea5e9" strokeWidth={1.2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </DeferredChart>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-2 text-[10px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-emerald-500" /> MASI
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-sky-500" /> MASI 20
              </span>
              <span className="ml-auto tabular">
                Open {formatMAD(masiSessionStats.open)} · Last {formatMAD(masiSessionStats.last)} ·{" "}
                <span className={chgColor(masiSessionStats.chgFromOpen)}>
                  Δ {masiSessionStats.chgFromOpen >= 0 ? "+" : ""}
                  {formatMAD(masiSessionStats.chgFromOpen)}
                </span>
              </span>
            </div>
          </div>
        </PanelCard>

        <PanelCard accent={TRADER} delay={0.1}>
          <PanelHeader
            title="MASI — 30 Day"
            subtitle="Moroccan All Shares Index"
            icon={TrendingUp}
            accent={TRADER}
            action={
              <span className={cn("tabular text-[11px] font-semibold", chgColor(masi30d[masi30d.length - 1].masi - masi30d[0].masi))}>
                {masi30d[masi30d.length - 1].masi - masi30d[0].masi >= 0 ? "+" : ""}
                {formatMAD(masi30d[masi30d.length - 1].masi - masi30d[0].masi)}
              </span>
            }
          />
          <div className="p-4">
            <DeferredChart height="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={masi30d as IndexPoint[]} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickLine={false}
                    tickFormatter={(v: string) => {
                      try {
                        return format(parseISO(v), "MMM d");
                      } catch {
                        return v;
                      }
                    }}
                    minTickGap={32}
                  />
                  <YAxis
                    yAxisId="left"
                    domain={["auto", "auto"]}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    width={56}
                    tickFormatter={(v: number) => formatMAD(v, 0)}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={["auto", "auto"]}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                    tickFormatter={(v: number) => formatMAD(v, 0)}
                  />
                  <Tooltip content={<Index30dTooltip />} />
                  <Line yAxisId="left" type="monotone" dataKey="masi" stroke="#059669" strokeWidth={1.8} dot={false} />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="masi20"
                    stroke="#0ea5e9"
                    strokeWidth={1.4}
                    dot={false}
                    strokeDasharray="4 3"
                  />
                </LineChart>
              </ResponsiveContainer>
            </DeferredChart>
          </div>
        </PanelCard>
      </div>

      {/* Sector heatmap + session stats with MetricRings */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <PanelCard accent={TRADER} className="xl:col-span-2" delay={0.15}>
          <PanelHeader
            title="Sector Heatmap"
            subtitle="BVC sector indices · session performance"
            icon={Flame}
            accent={TRADER}
            action={<Tag tone="emerald">8 sectors</Tag>}
          />
          <div className="p-4">
            <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {sectorIndices.map((s) => (
                <SectorHeatmapTile key={s.id} s={s} />
              ))}
            </StaggerGrid>
          </div>
        </PanelCard>

        <PanelCard accent={TRADER} delay={0.2}>
          <PanelHeader
            title="Session Statistics"
            subtitle="Advancers / decliners · turnover"
            icon={Gauge}
            accent={TRADER}
          />
          <div className="flex flex-col gap-4 p-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-1 rounded-lg bg-emerald-50 p-3 ring-1 ring-emerald-200">
                <MetricRing value={advancerPct} size={64} stroke={6} tone="emerald" sublabel="Adv" />
                <span className="tabular text-[14px] font-bold text-emerald-800">
                  {masiSessionStats.advancers}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg bg-rose-50 p-3 ring-1 ring-rose-200">
                <MetricRing value={declinerPct} size={64} stroke={6} tone="rose" sublabel="Dec" />
                <span className="tabular text-[14px] font-bold text-rose-800">
                  {masiSessionStats.decliners}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
                <MetricRing value={unchangedPct} size={64} stroke={6} tone="slate" sublabel="Flat" />
                <span className="tabular text-[14px] font-bold text-slate-700">
                  {masiSessionStats.unchanged}
                </span>
              </div>
            </div>

            <Divider label="Breadth" />
            <div>
              <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-wide text-slate-500">
                <span>Adv / Dec / Flat</span>
                <span className="tabular">{totalNames} names</span>
              </div>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="bg-emerald-500 transition-all duration-700"
                  style={{ width: `${advancerPct}%` }}
                />
                <div
                  className="bg-slate-300 transition-all duration-700"
                  style={{ width: `${unchangedPct}%` }}
                />
                <div
                  className="bg-rose-500 transition-all duration-700"
                  style={{ width: `${declinerPct}%` }}
                />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-sm bg-emerald-500" />
                  Adv {advancerPct.toFixed(0)}%
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-sm bg-slate-300" />
                  Flat {unchangedPct.toFixed(0)}%
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-sm bg-rose-500" />
                  Dec {declinerPct.toFixed(0)}%
                </span>
              </div>
            </div>

            <Divider label="Range" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="card-title">Turnover</div>
                <div className="tabular mt-0.5 text-[18px] font-bold text-slate-900">
                  {formatMAD(masiSessionStats.turnoverM, 0)}M
                </div>
                <div className="text-[10px] text-slate-500">MAD · session</div>
              </div>
              <div>
                <div className="card-title">Day Range</div>
                <div className="tabular mt-0.5 text-[14px] font-semibold text-slate-700">
                  {formatMAD(masiSessionStats.low, 0)} – {formatMAD(masiSessionStats.high, 0)}
                </div>
                <div className="mt-1">
                  <ProgressBar
                    value={(masiSessionStats.last - masiSessionStats.low)}
                    max={Math.max(1, masiSessionStats.high - masiSessionStats.low)}
                    tone="emerald"
                    height={4}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-emerald-50/60 px-3 py-2 ring-1 ring-emerald-200">
              <span className="text-[10px] font-medium uppercase tracking-wide text-emerald-700">
                Breadth Tilt
              </span>
              <span className="tabular text-[12px] font-bold text-emerald-800">
                {masiSessionStats.advancers > masiSessionStats.decliners ? "Bullish" : "Bearish"} · {breadthTilt.toFixed(0)}
              </span>
            </div>
          </div>
        </PanelCard>
      </div>

      {/* Sector performance diverging bars */}
      <PanelCard accent={TRADER} delay={0.25}>
        <PanelHeader
          title="Sector Performance"
          subtitle="BVC sector indices · session % change (diverging)"
          icon={Flame}
          accent={TRADER}
          action={<Tag tone="warning" icon={Flame}>Top mover highlighted</Tag>}
        />
        <div className="flex flex-col gap-2.5 p-4">
          {sectorIndices
            .slice()
            .sort((a, b) => b.chgPct - a.chgPct)
            .map((s) => (
              <SectorPerformanceBar key={s.id} s={s} maxAbs={maxAbsChg} />
            ))}
        </div>
      </PanelCard>

      {/* Movers tabs */}
      <PanelCard accent={TRADER} delay={0.3}>
        <PanelHeader
          title="Session Movers"
          subtitle="Top gainers · losers · most active · with 30-day sparkline"
          icon={TrendingUp}
          accent={TRADER}
        />
        <Tabs defaultValue="gainers">
          <div className="flex items-center justify-end border-b border-slate-100 px-3 py-2">
            <TabsList className="h-7">
              <TabsTrigger value="gainers" className="text-[11px]">
                Gainers
              </TabsTrigger>
              <TabsTrigger value="losers" className="text-[11px]">
                Losers
              </TabsTrigger>
              <TabsTrigger value="active" className="text-[11px]">
                Most Active
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="gainers">
            <MoversTable rows={topGainers} emptyHint="No gainers" />
          </TabsContent>
          <TabsContent value="losers">
            <MoversTable rows={topLosers} emptyHint="No losers" />
          </TabsContent>
          <TabsContent value="active">
            <MoversTable rows={mostActive} emptyHint="No activity" />
          </TabsContent>
        </Tabs>
      </PanelCard>
    </div>
  );
}
