"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Minus,
  PieChart as PieIcon,
  Scale,
  TrendingUp,
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
import { DeferredChart } from "@/components/dataviz/chart-skeleton";
import { SectionHeader, StatusChip } from "../section-header";
import {
  PanelCard,
  PanelHeader,
  StatTile,
  Tag,
  ProgressBar,
  StaggerGrid,
  type RoleAccent,
} from "../design-system";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  positions,
  positionsSummary,
  sectorExposures,
  positionPnl,
  positionPnlPct,
  positionExposure,
  sectorColor,
  formatMAD,
  formatCompactMAD,
  chgColor,
  type Position,
  type BvcSector,
} from "@/lib/market-data";
import { cn } from "@/lib/utils";

const TRADER: RoleAccent = "emerald";

type SortKey = "ticker" | "side" | "qty" | "avgPrice" | "last" | "pnl" | "pnlPct" | "exposure" | "daysHeld";

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

/* ------------------------------------------------------------------ */
/*  P&L bar chart                                                      */
/* ------------------------------------------------------------------ */

function PnlTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { ticker: string; pnl: number; pnlPct: number; side: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-semibold text-slate-800">{p.ticker}</span>
        <Tag tone={p.side === "long" ? "positive" : "negative"} size="xs">{p.side}</Tag>
      </div>
      <div className="tabular mt-1 text-[12px] font-semibold text-slate-800">
        {p.pnl >= 0 ? "+" : ""}
        {formatMAD(p.pnl)} MAD
      </div>
      <div className={cn("tabular text-[10px]", chgColor(p.pnlPct))}>
        {p.pnlPct >= 0 ? "+" : ""}
        {p.pnlPct.toFixed(2)}%
      </div>
    </div>
  );
}

function PnlByPositionChart() {
  const data = positions
    .map((p) => ({
      ticker: p.ticker,
      pnl: positionPnl(p),
      pnlPct: positionPnlPct(p),
      side: p.side,
    }))
    .sort((a, b) => b.pnl - a.pnl);

  return (
    <DeferredChart height="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="pnlPosGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#059669" stopOpacity={0.75} />
            </linearGradient>
            <linearGradient id="pnlNegGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb7185" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#e11d48" stopOpacity={0.75} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="ticker"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(v: number) => `${formatCompactMAD(v)}`}
          />
          <Tooltip content={<PnlTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
          <ReferenceLine y={0} stroke="#94a3b8" />
          <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.pnl >= 0 ? "url(#pnlPosGrad)" : "url(#pnlNegGrad)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Sector exposure breakdown                                          */
/* ------------------------------------------------------------------ */

function SectorExposurePanel() {
  const max = Math.max(...sectorExposures.map((s) => s.exposure), 1);
  return (
    <div className="flex flex-col gap-2.5 p-4">
      {sectorExposures.map((s) => {
        const tone = s.pnl >= 0 ? "emerald" : "rose";
        return (
          <div key={s.sector} className="grid grid-cols-[110px_1fr_70px] items-center gap-3">
            <Tag tone="neutral" size="sm">
              <span className="h-1.5 w-1.5 rounded-sm" style={{ background: sectorColor[s.sector as BvcSector] }} />
              {s.sector}
            </Tag>
            <div className="relative">
              <ProgressBar
                value={s.exposure}
                max={max}
                tone={tone}
                height={18}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 tabular text-[10px] font-semibold text-slate-700">
                {s.pct.toFixed(1)}%
              </span>
            </div>
            <span
              className={cn(
                "tabular text-right text-[11px] font-semibold",
                s.pnl >= 0 ? "text-emerald-700" : "text-rose-700",
              )}
            >
              {s.pnl >= 0 ? "+" : ""}
              {formatCompactMAD(s.pnl)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Long / Short split                                                 */
/* ------------------------------------------------------------------ */

function LongShortSplit() {
  const long = positionsSummary.longExposure;
  const short = positionsSummary.shortExposure;
  const total = long + short;
  const longPct = (long / total) * 100;
  const shortPct = (short / total) * 100;
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
        <div
          className="h-full bg-emerald-500 transition-all duration-700"
          style={{ width: `${longPct}%` }}
        />
        <div
          className="h-full bg-rose-500 transition-all duration-700"
          style={{ width: `${shortPct}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-emerald-50 p-3 ring-1 ring-emerald-200">
          <div className="flex items-center justify-between">
            <span className="card-title text-emerald-700">Long</span>
            <ArrowUp className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="tabular mt-1 text-[16px] font-bold text-emerald-800">
            {formatCompactMAD(long)}M
          </div>
          <div className="tabular text-[10px] text-emerald-600">{longPct.toFixed(1)}% of gross</div>
        </div>
        <div className="rounded-lg bg-rose-50 p-3 ring-1 ring-rose-200">
          <div className="flex items-center justify-between">
            <span className="card-title text-rose-700">Short</span>
            <ArrowDown className="h-3.5 w-3.5 text-rose-600" />
          </div>
          <div className="tabular mt-1 text-[16px] font-bold text-rose-800">
            {formatCompactMAD(short)}M
          </div>
          <div className="tabular text-[10px] text-rose-600">{shortPct.toFixed(1)}% of gross</div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function PositionsBlotter(_: SectionComponentProps) {
  const ready = useReady(300);
  const [sortKey, setSortKey] = React.useState<SortKey>("exposure");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");

  const sorted = React.useMemo(() => {
    const list = positions.slice();
    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "ticker" || sortKey === "side") {
        return String(a[sortKey]).localeCompare(String(b[sortKey])) * dir;
      }
      const av =
        sortKey === "pnl"
          ? positionPnl(a)
          : sortKey === "pnlPct"
            ? positionPnlPct(a)
            : sortKey === "exposure"
              ? positionExposure(a)
              : (a[sortKey] as number);
      const bv =
        sortKey === "pnl"
          ? positionPnl(b)
          : sortKey === "pnlPct"
            ? positionPnlPct(b)
            : sortKey === "exposure"
              ? positionExposure(b)
              : (b[sortKey] as number);
      return (av - bv) * dir;
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
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 text-slate-700" />
    ) : (
      <ChevronDown className="h-3 w-3 text-slate-700" />
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="mkt-positions"
        accountType="trader"
        accent="emerald"
        statusChips={
          <>
            <StatusChip label="Mark-to-market" tone="neutral" icon={Scale} />
            <StatusChip label={`${positionsSummary.count} open`} tone="neutral" icon={Briefcase} />
            <StatusChip
              label={`${positionsSummary.winners}W / ${positionsSummary.losers}L`}
              tone={positionsSummary.winners >= positionsSummary.losers ? "positive" : "negative"}
            />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <StatTile
                label="Gross Exposure"
                value={`${formatCompactMAD(positionsSummary.totalExposure)}`}
                unit="M MAD"
                hint={`Cost basis ${formatCompactMAD(positionsSummary.totalCost)}M MAD`}
                icon={Wallet}
                accent={TRADER}
              />
              <StatTile
                label="Net M2M P&L"
                value={`${positionsSummary.totalPnl >= 0 ? "+" : ""}${formatCompactMAD(positionsSummary.totalPnl)}M`}
                delta={`${positionsSummary.totalPnlPct >= 0 ? "+" : ""}${positionsSummary.totalPnlPct.toFixed(2)}%`}
                deltaTone={positionsSummary.totalPnl >= 0 ? "positive" : "negative"}
                hint="Unrealised"
                icon={TrendingUp}
                accent={TRADER}
              />
              <StatTile
                label="Long Exposure"
                value={`${formatCompactMAD(positionsSummary.longExposure)}M`}
                delta={`${positionsSummary.longPct.toFixed(1)}%`}
                deltaTone="positive"
                hint="Of gross"
                icon={ArrowUp}
                accent={TRADER}
              />
              <StatTile
                label="Short Exposure"
                value={`${formatCompactMAD(positionsSummary.shortExposure)}M`}
                delta={`${positionsSummary.shortPct.toFixed(1)}%`}
                deltaTone="negative"
                hint="Of gross"
                icon={ArrowDown}
                accent={TRADER}
              />
              <StatTile
                label="Win Rate"
                value={`${((positionsSummary.winners / positionsSummary.count) * 100).toFixed(0)}%`}
                delta={`${positionsSummary.winners}W`}
                deltaTone={positionsSummary.winners >= positionsSummary.losers ? "positive" : "negative"}
                hint={`${positionsSummary.winners} winners / ${positionsSummary.losers} losers`}
                icon={PieIcon}
                accent={TRADER}
              />
            </StaggerGrid>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <KpiSkeleton key={i} />
              ))}
            </div>
          )
        }
      />

      {/* P&L chart + Long/Short split */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <PanelCard accent={TRADER} className="xl:col-span-2" delay={0.05}>
          <PanelHeader
            title="P&L by Position"
            subtitle="Mark-to-market · unrealised (MAD)"
            icon={TrendingUp}
            accent={TRADER}
            action={
              <Tag tone={positionsSummary.totalPnl >= 0 ? "positive" : "negative"}>
                Net {positionsSummary.totalPnl >= 0 ? "+" : ""}
                {formatCompactMAD(positionsSummary.totalPnl)}M
              </Tag>
            }
          />
          <div className="p-4">
            <PnlByPositionChart />
          </div>
        </PanelCard>
        <PanelCard accent={TRADER} delay={0.1}>
          <PanelHeader
            title="Long / Short Split"
            subtitle="Gross exposure by side"
            icon={Scale}
            accent={TRADER}
          />
          <LongShortSplit />
        </PanelCard>
      </div>

      {/* Sector exposure + blotter table */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <PanelCard accent={TRADER} delay={0.15}>
          <PanelHeader
            title="Sector Exposure"
            subtitle="P&L by sector"
            icon={Briefcase}
            accent={TRADER}
          />
          <SectorExposurePanel />
        </PanelCard>

        <PanelCard accent={TRADER} className="xl:col-span-2" delay={0.2}>
          <PanelHeader
            title="Positions Blotter"
            subtitle="HarchCorp open positions · sortable"
            icon={Wallet}
            accent={TRADER}
            action={<Tag tone="emerald">{positions.length} positions</Tag>}
          />
          <div className="harch-scroll max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white">
                <TableRow className="text-[10px] uppercase tracking-wide text-slate-500">
                  <TableHead>
                    <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("ticker")}>
                      Ticker {renderSortIcon("ticker")}
                    </button>
                  </TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead className="text-right">
                    <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("qty")}>
                      Qty {renderSortIcon("qty")}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("avgPrice")}>
                      Avg {renderSortIcon("avgPrice")}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("last")}>
                      Last {renderSortIcon("last")}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("pnl")}>
                      M2M P&L {renderSortIcon("pnl")}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("pnlPct")}>
                      % P&L {renderSortIcon("pnlPct")}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("exposure")}>
                      Exposure {renderSortIcon("exposure")}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("daysHeld")}>
                      Days {renderSortIcon("daysHeld")}
                    </button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((p: Position) => {
                  const pnl = positionPnl(p);
                  const pnlPct = positionPnlPct(p);
                  const exposure = positionExposure(p);
                  return (
                    <TableRow key={p.id} className="text-[12px] transition-colors hover:bg-slate-50">
                      <TableCell className="font-semibold text-slate-900">{p.ticker}</TableCell>
                      <TableCell>
                        <Tag tone={p.side === "long" ? "positive" : "negative"} icon={p.side === "long" ? ArrowUp : ArrowDown}>
                          {p.side}
                        </Tag>
                      </TableCell>
                      <TableCell className="tabular text-right text-slate-700">{p.qty.toLocaleString()}</TableCell>
                      <TableCell className="tabular text-right text-slate-600">{formatMAD(p.avgPrice)}</TableCell>
                      <TableCell className="tabular text-right text-slate-800">{formatMAD(p.last)}</TableCell>
                      <TableCell className={cn("tabular text-right font-semibold", chgColor(pnl))}>
                        {pnl >= 0 ? "+" : ""}
                        {formatMAD(pnl)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Tag
                          tone={pnlPct > 0 ? "positive" : pnlPct < 0 ? "negative" : "neutral"}
                          icon={pnlPct > 0 ? ArrowUp : pnlPct < 0 ? ArrowDown : Minus}
                        >
                          {Math.abs(pnlPct).toFixed(2)}%
                        </Tag>
                      </TableCell>
                      <TableCell className="tabular text-right text-slate-700">{formatCompactMAD(exposure)}M</TableCell>
                      <TableCell className="tabular text-right text-slate-500">{p.daysHeld}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </PanelCard>
      </div>
    </div>
  );
}
