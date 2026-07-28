"use client";

import * as React from "react";
import {
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
  BarChart3,
  TrendingDown,
  TrendingUp,
  Layers,
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
  MiniSparkline,
  StaggerGrid,
  type RoleAccent,
} from "../design-system";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  masi30d,
  sectorIndices,
  sectorColor,
  formatMAD,
  chgColor,
  type BvcSector,
  type SectorIndex,
} from "@/lib/market-data";
import { cn } from "@/lib/utils";

const TRADER: RoleAccent = "emerald";

/* ------------------------------------------------------------------ */
/*  Brief mount skeleton                                               */
/* ------------------------------------------------------------------ */

function useReady(ms = 300) {
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

/** Look up the chart colour for a sector index by its name (matches BvcSector). */
function indexColor(idx: SectorIndex): string {
  return sectorColor[idx.name as BvcSector] ?? "#64748b";
}

/* ------------------------------------------------------------------ */
/*  Multi-line comparison chart                                        */
/* ------------------------------------------------------------------ */

interface ComparisonRow {
  date: string;
  [key: string]: number | string;
}

function buildComparisonData(): ComparisonRow[] {
  // Normalise each index to its 30d-ago close = 100 for comparison.
  return masi30d.map((pt, i) => {
    const row: ComparisonRow = { date: pt.date };
    for (const idx of sectorIndices) {
      const start = idx.series30d[0];
      const v = idx.series30d[i] ?? start;
      row[idx.id] = Math.round(((v / start) * 100) * 100) / 100;
    }
    return row;
  });
}

function ComparisonTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  let dateLabel = label;
  try {
    dateLabel = format(parseISO(label), "MMM d, yyyy");
  } catch {
    /* keep raw */
  }
  const sorted = [...payload].sort((a, b) => b.value - a.value);
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{dateLabel}</div>
      <div className="mt-1.5 space-y-0.5 text-[11px]">
        {sorted.map((p) => {
          const idx = sectorIndices.find((s) => s.id === p.dataKey);
          return (
            <div key={p.dataKey} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm" style={{ background: p.color }} />
                {idx?.name ?? p.dataKey}
              </span>
              <span
                className={cn(
                  "tabular font-semibold",
                  p.value >= 100 ? "text-emerald-700" : "text-rose-700",
                )}
              >
                {p.value >= 100 ? "+" : ""}
                {(p.value - 100).toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Index card (premium)                                               */
/* ------------------------------------------------------------------ */

function IndexCard({ idx, delay }: { idx: SectorIndex; delay: number }) {
  const sparkColor = idx.chgPct >= 0 ? "#10b981" : "#e11d48";
  return (
    <PanelCard accent={TRADER} delay={delay} className="p-0">
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="card-title">{idx.name}</div>
            <div className="tabular mt-0.5 text-[18px] font-bold text-slate-900">
              {formatMAD(idx.value, 0)}
            </div>
          </div>
          <div className="text-right">
            <Tag
              tone={idx.chgPct > 0 ? "positive" : idx.chgPct < 0 ? "negative" : "neutral"}
              icon={idx.chgPct > 0 ? TrendingUp : idx.chgPct < 0 ? TrendingDown : null}
            >
              {idx.chgPct > 0 ? "+" : ""}
              {idx.chgPct.toFixed(2)}%
            </Tag>
            <div className="mt-1 tabular text-[10px] text-slate-500">
              YTD {idx.ytdPct > 0 ? "+" : ""}
              {idx.ytdPct.toFixed(1)}%
            </div>
          </div>
        </div>
        <div className="h-[60px]">
          <MiniSparkline data={idx.series30d} color={sparkColor} width={260} height={60} />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span className="tabular">Prev {formatMAD(idx.prevClose, 0)}</span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-sm" style={{ background: indexColor(idx) }} />
            30-day series
          </span>
        </div>
      </div>
    </PanelCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function IndicesView(_: SectionComponentProps) {
  const ready = useReady(300);
  const comparisonData = React.useMemo(() => buildComparisonData(), []);
  const [activeSeries, setActiveSeries] = React.useState<string[]>(sectorIndices.slice(0, 5).map((s) => s.id));

  const toggleSeries = (id: string) => {
    setActiveSeries((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  const masi = masi30d[masi30d.length - 1];
  const masiPrev = masi30d[masi30d.length - 2];
  const masiChg = masi.masi - masiPrev.masi;
  const masiChgPct = (masiChg / masiPrev.masi) * 100;
  const masi20Chg = masi.masi20 - masiPrev.masi20;
  const masi20ChgPct = (masi20Chg / masiPrev.masi20) * 100;

  const best = [...sectorIndices].sort((a, b) => b.chgPct - a.chgPct)[0];
  const worst = [...sectorIndices].sort((a, b) => a.chgPct - b.chgPct)[0];

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="mkt-indices"
        accountType="trader"
        accent="emerald"
        statusChips={
          <>
            <StatusChip label="BVC · Casablanca" tone="neutral" icon={BarChart3} />
            <StatusChip label={`${sectorIndices.length} sector indices`} tone="neutral" />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <StatTile
                label="MASI"
                value={formatMAD(masi.masi)}
                delta={`${masiChg >= 0 ? "+" : ""}${masiChg.toFixed(2)}`}
                deltaTone={masiChg >= 0 ? "positive" : "negative"}
                hint={`${masiChgPct >= 0 ? "+" : ""}${masiChgPct.toFixed(2)}%`}
                icon={TrendingUp}
                accent={TRADER}
              />
              <StatTile
                label="MASI 20"
                value={formatMAD(masi.masi20)}
                delta={`${masi20Chg >= 0 ? "+" : ""}${masi20Chg.toFixed(2)}`}
                deltaTone={masi20Chg >= 0 ? "positive" : "negative"}
                hint={`${masi20ChgPct >= 0 ? "+" : ""}${masi20ChgPct.toFixed(2)}%`}
                icon={Activity}
                accent={TRADER}
              />
              <StatTile
                label="Best Sector"
                value={best.name}
                delta={`+${best.chgPct.toFixed(2)}%`}
                deltaTone="positive"
                hint="Session leader"
                icon={TrendingUp}
                accent={TRADER}
              />
              <StatTile
                label="Worst Sector"
                value={worst.name}
                delta={`${worst.chgPct.toFixed(2)}%`}
                deltaTone="negative"
                hint="Session laggard"
                icon={TrendingDown}
                accent={TRADER}
              />
            </StaggerGrid>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <KpiSkeleton key={i} />
              ))}
            </div>
          )
        }
      />

      {/* Multi-line comparison chart */}
      <PanelCard accent={TRADER} delay={0.1}>
        <PanelHeader
          title="Sector Indices — 30 Day Comparison"
          subtitle="Normalised to 100 at 30d-ago close · click legend to toggle"
          icon={BarChart3}
          accent={TRADER}
          action={
            <div className="flex flex-wrap items-center gap-1.5">
              {sectorIndices.map((s) => {
                const active = activeSeries.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSeries(s.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 transition-all",
                      active
                        ? "bg-white text-slate-700 ring-slate-300"
                        : "bg-slate-50 text-slate-400 ring-slate-200 line-through",
                    )}
                  >
                    <span className="h-2 w-2 rounded-sm" style={{ background: indexColor(s) }} />
                    {s.name}
                  </button>
                );
              })}
            </div>
          }
        />
        <div className="p-4">
          <DeferredChart height="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparisonData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
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
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                  tickFormatter={(v: number) => `${v.toFixed(0)}`}
                />
                <Tooltip content={<ComparisonTooltip />} />
                <ReferenceLineBaseline />
                {sectorIndices.map((s) =>
                  activeSeries.includes(s.id) ? (
                    <Line
                      key={s.id}
                      type="monotone"
                      dataKey={s.id}
                      stroke={indexColor(s)}
                      strokeWidth={1.6}
                      dot={false}
                    />
                  ) : null,
                )}
              </LineChart>
            </ResponsiveContainer>
          </DeferredChart>
        </div>
      </PanelCard>

      {/* Index cards grid */}
      <StaggerGrid className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sectorIndices.map((s, i) => (
          <IndexCard key={s.id} idx={s} delay={0.15 + i * 0.04} />
        ))}
      </StaggerGrid>

      {/* Index performance table */}
      <PanelCard accent={TRADER} delay={0.3}>
        <PanelHeader
          title="Index Performance Summary"
          subtitle="All BVC indices · session + YTD returns"
          icon={Layers}
          accent={TRADER}
          action={<Tag tone="emerald">{sectorIndices.length} indices</Tag>}
        />
        <IndicesTable />
      </PanelCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reference baseline (100 = normalised base)                         */
/* ------------------------------------------------------------------ */

function ReferenceLineBaseline() {
  // Render the baseline (100) so users can see +/- vs the normalised base.
  return <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="2 4" />;
}

function IndicesTable() {
  return (
    <div className="harch-scroll max-h-[360px] overflow-y-auto">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-white">
          <TableRow className="text-[10px] uppercase tracking-wide text-slate-500">
            <TableHead>Index</TableHead>
            <TableHead className="text-right">Last</TableHead>
            <TableHead className="text-right">Prev Close</TableHead>
            <TableHead className="text-right">Chg</TableHead>
            <TableHead className="text-right">Chg %</TableHead>
            <TableHead className="text-right">YTD %</TableHead>
            <TableHead className="text-right">30D Range</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sectorIndices.map((s) => {
            const min = Math.min(...s.series30d);
            const max = Math.max(...s.series30d);
            const chg = s.value - s.prevClose;
            return (
              <TableRow key={s.id} className="text-[12px] transition-colors hover:bg-slate-50">
                <TableCell className="font-semibold text-slate-900">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-sm" style={{ background: indexColor(s) }} />
                    {s.name}
                  </span>
                </TableCell>
                <TableCell className="tabular text-right text-slate-800">{formatMAD(s.value, 0)}</TableCell>
                <TableCell className="tabular text-right text-slate-500">{formatMAD(s.prevClose, 0)}</TableCell>
                <TableCell className={cn("tabular text-right", chgColor(chg))}>
                  {chg >= 0 ? "+" : ""}
                  {chg.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <Tag tone={s.chgPct > 0 ? "positive" : s.chgPct < 0 ? "negative" : "neutral"}>
                    {s.chgPct > 0 ? "+" : ""}
                    {s.chgPct.toFixed(2)}%
                  </Tag>
                </TableCell>
                <TableCell className={cn("tabular text-right font-semibold", chgColor(s.ytdPct))}>
                  {s.ytdPct > 0 ? "+" : ""}
                  {s.ytdPct.toFixed(1)}%
                </TableCell>
                <TableCell className="tabular text-right text-slate-500">
                  {formatMAD(min, 0)} – {formatMAD(max, 0)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/* Recharts ReferenceLine import — used by ReferenceLineBaseline. */
