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
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  CandlestickChart,
  Minus,
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
import { Input } from "@/components/ui/input";
import { DeferredChart } from "@/components/dataviz/chart-skeleton";
import { SectionHeader, StatusChip } from "../section-header";
import {
  PanelCard,
  PanelHeader,
  StatTile,
  Tag,
  ProgressBar,
  StaggerGrid,
  Divider,
  type RoleAccent,
} from "../design-system";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  moroccanEquities,
  sectorColor,
  formatMAD,
  formatVolume,
  formatCompactMAD,
  type Equity,
  type BvcSector,
} from "@/lib/market-data";
import { cn } from "@/lib/utils";

const TRADER: RoleAccent = "emerald";

type SortKey = "ticker" | "name" | "last" | "chgPct" | "volume" | "mktCapM" | "peRatio";

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
/*  Sparkline tooltip                                                  */
/* ------------------------------------------------------------------ */

function SparkTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; color: string }>;
  label?: number;
}) {
  if (!active || !payload?.length || label == null) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-2 py-1 shadow-lg">
      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        Day {label + 1}
      </div>
      <div className="tabular text-[12px] font-semibold text-slate-800">
        {formatMAD(payload[0].value)}
      </div>
    </div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ i, v }));
  const gid = `spark-${color.replace("#", "")}`;
  return (
    <DeferredChart height="h-[80px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="i" hide />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip content={<SparkTooltip />} />
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.6} fill={`url(#${gid})`} />
        </AreaChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Equity detail panel (premium)                                      */
/* ------------------------------------------------------------------ */

function EquityDetail({ equity }: { equity: Equity }) {
  const sparkColor = equity.chgPct >= 0 ? "#10b981" : "#e11d48";
  const fromHighPct = ((equity.last - equity.high52) / equity.high52) * 100;
  const fromLowPct = ((equity.last - equity.low52) / equity.low52) * 100;
  const rangePosition = ((equity.last - equity.low52) / (equity.high52 - equity.low52)) * 100;
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[18px] font-bold text-slate-900">{equity.ticker}</span>
            <Tag tone="emerald" size="xs">{equity.sector}</Tag>
          </div>
          <p className="text-[12px] text-slate-500">{equity.name}</p>
        </div>
        <div className="text-right">
          <div className="tabular text-[20px] font-bold text-slate-900">{formatMAD(equity.last)}</div>
          <Tag
            tone={equity.chgPct > 0 ? "positive" : equity.chgPct < 0 ? "negative" : "neutral"}
            icon={equity.chgPct > 0 ? ArrowUp : equity.chgPct < 0 ? ArrowDown : Minus}
          >
            {Math.abs(equity.chgPct).toFixed(2)}%
          </Tag>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
        <div className="card-title mb-2">30-Day Price</div>
        <Sparkline data={equity.series30d} color={sparkColor} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DetailStat label="Prev Close" value={formatMAD(equity.prevClose)} />
        <DetailStat label="Volume" value={formatVolume(equity.volume)} />
        <DetailStat label="Mkt Cap" value={`${formatCompactMAD(equity.mktCapM)}M`} unit="MAD" />
        <DetailStat label="P/E" value={equity.peRatio.toFixed(1)} />
        <DetailStat label="52W High" value={formatMAD(equity.high52)} />
        <DetailStat label="52W Low" value={formatMAD(equity.low52)} />
        <DetailStat label="From High" value={`${fromHighPct.toFixed(1)}%`} tone="negative" />
        <DetailStat label="From Low" value={`+${fromLowPct.toFixed(1)}%`} tone="positive" />
      </div>

      <Divider label="52-Week Range" />
      <div>
        <div className="mb-1 flex items-center justify-between text-[10px] text-slate-500">
          <span className="tabular">{formatMAD(equity.low52)}</span>
          <span className="tabular">{formatMAD(equity.high52)}</span>
        </div>
        <ProgressBar value={rangePosition} tone="emerald" height={5} threshold={50} />
        <div className="mt-1 text-center text-[10px] text-slate-500">
          <span className="tabular font-semibold text-slate-700">{rangePosition.toFixed(0)}%</span> of range
        </div>
      </div>
    </div>
  );
}

function DetailStat({
  label,
  value,
  unit,
  tone = "neutral",
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: "positive" | "negative" | "neutral";
}) {
  const toneClass = {
    positive: "text-emerald-700",
    negative: "text-rose-700",
    neutral: "text-slate-800",
  }[tone];
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-2.5">
      <div className="card-title">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={cn("tabular mt-0.5 text-[14px] font-semibold", toneClass)}>{value}</span>
        {unit ? <span className="text-[9px] text-slate-400">{unit}</span> : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function EquitiesScreener(_: SectionComponentProps) {
  const ready = useReady(300);
  const [filter, setFilter] = React.useState<BvcSector | "all">("all");
  const [query, setQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("mktCapM");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [selectedTicker, setSelectedTicker] = React.useState<string>(moroccanEquities[0].ticker);

  const sectors = React.useMemo(() => {
    const s = new Set<BvcSector>();
    moroccanEquities.forEach((e) => s.add(e.sector));
    return [...s];
  }, []);

  const filtered = React.useMemo(() => {
    let list = moroccanEquities.slice();
    if (filter !== "all") list = list.filter((e) => e.sector === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (e) => e.ticker.toLowerCase().includes(q) || e.name.toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return list;
  }, [filter, query, sortKey, sortDir]);

  const selected = React.useMemo(
    () => moroccanEquities.find((e) => e.ticker === selectedTicker) ?? moroccanEquities[0],
    [selectedTicker],
  );

  const totalMktCap = moroccanEquities.reduce((s, e) => s + e.mktCapM, 0);
  const gainers = moroccanEquities.filter((e) => e.chgPct > 0).length;
  const losers = moroccanEquities.filter((e) => e.chgPct < 0).length;
  const avgPe =
    moroccanEquities.reduce((s, e) => s + e.peRatio, 0) / moroccanEquities.length;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
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
        sectionId="mkt-equities"
        accountType="trader"
        accent="emerald"
        statusChips={
          <>
            <StatusChip label="Casablanca-listed" tone="neutral" icon={CandlestickChart} />
            <StatusChip label={`${moroccanEquities.length} equities`} tone="neutral" />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <StatTile
                label="Total Mkt Cap"
                value={`${formatCompactMAD(totalMktCap)}`}
                unit="M MAD"
                icon={CandlestickChart}
                accent={TRADER}
                hint="Casablanca board"
              />
              <StatTile
                label="Gainers"
                value={`${gainers}`}
                delta={`${((gainers / moroccanEquities.length) * 100).toFixed(0)}%`}
                deltaTone="positive"
                hint="of board"
                icon={ArrowUp}
                accent={TRADER}
              />
              <StatTile
                label="Losers"
                value={`${losers}`}
                delta={`${((losers / moroccanEquities.length) * 100).toFixed(0)}%`}
                deltaTone="negative"
                hint="of board"
                icon={ArrowDown}
                accent={TRADER}
              />
              <StatTile
                label="Avg P/E"
                value={avgPe.toFixed(1)}
                deltaTone="neutral"
                hint="Equal-weighted"
                accent={TRADER}
              />
              <StatTile
                label="Sectors"
                value={`${sectors.length}`}
                deltaTone="neutral"
                hint="Tracked BVC sectors"
                icon={Layers}
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

      {/* Screener + detail */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <PanelCard accent={TRADER} className="xl:col-span-2" delay={0.05}>
          <PanelHeader
            title="Equities Screener"
            subtitle="Casablanca Stock Exchange · sortable"
            icon={CandlestickChart}
            accent={TRADER}
            action={
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search ticker…"
                  className="h-7 w-32 pl-7 text-[11px] sm:w-44"
                />
              </div>
            }
          />
          {/* Sector filter chips */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-3 py-2.5">
            <Filter className="h-3 w-3 text-slate-400" />
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 transition-colors",
                filter === "all"
                  ? "bg-emerald-600 text-white ring-emerald-600"
                  : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
              )}
            >
              All
            </button>
            {sectors.map((s) => {
              const active = filter === s;
              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={cn(
                    "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 transition-colors",
                    active
                      ? "bg-emerald-600 text-white ring-emerald-600"
                      : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
                  )}
                >
                  {s}
                </button>
              );
            })}
            <span className="ml-auto tabular text-[10px] text-slate-400">
              {filtered.length} shown
            </span>
          </div>

          <div className="harch-scroll max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white">
                <TableRow className="text-[10px] uppercase tracking-wide text-slate-500">
                  <TableHead>
                    <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("ticker")}>
                      Ticker {renderSortIcon("ticker")}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("name")}>
                      Name {renderSortIcon("name")}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("last")}>
                      Last {renderSortIcon("last")}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("chgPct")}>
                      Chg % {renderSortIcon("chgPct")}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("volume")}>
                      Vol {renderSortIcon("volume")}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("mktCapM")}>
                      Mkt Cap {renderSortIcon("mktCapM")}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("peRatio")}>
                      P/E {renderSortIcon("peRatio")}
                    </button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => {
                  const isSelected = e.ticker === selectedTicker;
                  return (
                    <TableRow
                      key={e.ticker}
                      onClick={() => setSelectedTicker(e.ticker)}
                      className={cn(
                        "cursor-pointer text-[12px] transition-colors",
                        isSelected ? "bg-emerald-50/60 ring-1 ring-inset ring-emerald-200" : "hover:bg-slate-50",
                      )}
                    >
                      <TableCell className="font-semibold text-slate-900">{e.ticker}</TableCell>
                      <TableCell className="max-w-[160px] truncate text-slate-600">{e.name}</TableCell>
                      <TableCell className="tabular text-right text-slate-800">{formatMAD(e.last)}</TableCell>
                      <TableCell className="text-right">
                        <Tag
                          tone={e.chgPct > 0 ? "positive" : e.chgPct < 0 ? "negative" : "neutral"}
                          icon={e.chgPct > 0 ? ArrowUp : e.chgPct < 0 ? ArrowDown : Minus}
                        >
                          {Math.abs(e.chgPct).toFixed(2)}%
                        </Tag>
                      </TableCell>
                      <TableCell className="tabular text-right text-slate-500">{formatVolume(e.volume)}</TableCell>
                      <TableCell className="tabular text-right text-slate-700">{formatCompactMAD(e.mktCapM)}M</TableCell>
                      <TableCell className="tabular text-right text-slate-700">{e.peRatio.toFixed(1)}</TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-[12px] text-slate-400">
                      No equities match the current filter.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </PanelCard>

        <PanelCard accent={TRADER} delay={0.1}>
          <PanelHeader
            title="Equity Detail"
            subtitle={`${selected.ticker} · 30-day sparkline + key stats`}
            icon={Layers}
            accent={TRADER}
          />
          <EquityDetail equity={selected} />
        </PanelCard>
      </div>

      {/* Sector breakdown bar */}
      <PanelCard accent={TRADER} delay={0.15}>
        <PanelHeader
          title="Sector Market Cap Distribution"
          subtitle="Casablanca-listed equities · share of total market cap"
          icon={Layers}
          accent={TRADER}
        />
        <div className="p-4">
          <SectorDistributionBar />
        </div>
      </PanelCard>
    </div>
  );
}

function SectorDistributionBar() {
  const totals = React.useMemo(() => {
    const map = new Map<BvcSector, number>();
    moroccanEquities.forEach((e) => map.set(e.sector, (map.get(e.sector) ?? 0) + e.mktCapM));
    const total = [...map.values()].reduce((s, v) => s + v, 0);
    return [...map.entries()]
      .map(([sector, v]) => ({
        sector,
        value: v,
        pct: (v / total) * 100,
      }))
      .sort((a, b) => b.value - a.value);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-7 w-full overflow-hidden rounded-md ring-1 ring-slate-200">
        {totals.map((t) => (
          <div
            key={t.sector}
            className="flex items-center justify-center text-[9px] font-semibold text-white/95 transition-all duration-300 hover:brightness-110"
            style={{ width: `${t.pct}%`, background: sectorColor[t.sector] }}
            title={`${t.sector}: ${t.pct.toFixed(1)}%`}
          >
            {t.pct > 6 ? t.sector.split(" ")[0] : ""}
          </div>
        ))}
      </div>
      <StaggerGrid className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {totals.map((t) => (
          <div key={t.sector} className="flex items-center gap-2 rounded-md border border-slate-100 px-2.5 py-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: sectorColor[t.sector] }} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[11px] font-medium text-slate-700">{t.sector}</div>
              <div className="tabular text-[10px] text-slate-500">{t.pct.toFixed(1)}%</div>
            </div>
            <div className="tabular text-[10px] text-slate-500">{formatCompactMAD(t.value)}M</div>
          </div>
        ))}
      </StaggerGrid>
    </div>
  );
}
