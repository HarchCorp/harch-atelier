"use client";

import * as React from "react";
import {
  CartesianGrid,
  Cell,
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDown,
  ArrowUp,
  Diamond,
  Flame,
  Globe2,
  Minus,
  Wheat,
  Zap,
  Droplet,
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
  commodities,
  formatMAD,
  formatCompactMAD,
  chgColor,
  type Commodity,
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

/* ------------------------------------------------------------------ */
/*  Commodity helpers                                                  */
/* ------------------------------------------------------------------ */

function commodityColor(id: string): string {
  switch (id) {
    case "PHOS":
      return "#14b8a6";
    case "BRENT":
      return "#0ea5e9";
    case "GOLD":
      return "#f59e0b";
    case "WHEAT":
      return "#84cc16";
    case "NGAS":
      return "#475569";
    case "SILVER":
      return "#94a3b8";
    default:
      return "#64748b";
  }
}

/** Renders the appropriate lucide icon for a commodity id. */
function CommodityIcon({ id, className }: { id: string; className?: string }) {
  switch (id) {
    case "PHOS":
      return <Globe2 className={className} />;
    case "BRENT":
      return <Droplet className={className} />;
    case "GOLD":
      return <Diamond className={className} />;
    case "WHEAT":
      return <Wheat className={className} />;
    case "NGAS":
      return <Zap className={className} />;
    case "SILVER":
      return <Diamond className={className} />;
    default:
      return <Globe2 className={className} />;
  }
}

function PriceTooltip({
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
        ${formatMAD(payload[0].value)}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Commodity card (premium)                                           */
/* ------------------------------------------------------------------ */

function CommodityCard({ c, delay }: { c: Commodity; delay: number }) {
  const color = commodityColor(c.id);
  return (
    <PanelCard accent={TRADER} delay={delay} className="p-0">
      <div className="flex flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-md ring-1"
              style={{ background: `${color}15`, color, borderColor: `${color}30` }}
            >
              <CommodityIcon id={c.id} className="h-4 w-4" />
            </span>
            <div>
              <div className="text-[13px] font-semibold text-slate-900">{c.name}</div>
              <div className="text-[10px] uppercase tracking-wide text-slate-500">{c.unit}</div>
            </div>
          </div>
          <Tag
            tone={c.chgPct > 0 ? "positive" : c.chgPct < 0 ? "negative" : "neutral"}
            icon={c.chgPct > 0 ? ArrowUp : c.chgPct < 0 ? ArrowDown : Minus}
          >
            {Math.abs(c.chgPct).toFixed(2)}%
          </Tag>
        </div>
        <div className="flex items-baseline justify-between">
          <div>
            <div className="tabular text-[20px] font-bold text-slate-900">
              ${formatMAD(c.price, c.price > 100 ? 2 : 3)}
            </div>
            <div className="tabular text-[10px] text-slate-500">
              prev ${formatMAD(c.prevClose, c.prevClose > 100 ? 2 : 3)}
            </div>
          </div>
          <div className="text-right">
            <div className={cn("tabular text-[11px] font-semibold", chgColor(c.ytdPct))}>
              YTD {c.ytdPct > 0 ? "+" : ""}
              {c.ytdPct.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-500">
              HarchCorp {formatCompactMAD(c.exposureM)}M MAD
            </div>
          </div>
        </div>
        <div className="h-[60px]">
          <MiniSparkline data={c.series30d} color={color} width={260} height={60} />
        </div>
      </div>
    </PanelCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Exposure tooltip                                                   */
/* ------------------------------------------------------------------ */

function ExposureTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { name: string; exposure: number; chgPct: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <div className="text-[11px] font-semibold text-slate-800">{p.name}</div>
      <div className="tabular mt-1 text-[12px] font-semibold text-slate-800">
        {formatCompactMAD(p.exposure)}M MAD
      </div>
      <div className={cn("tabular text-[10px]", chgColor(p.chgPct))}>
        {p.chgPct > 0 ? "+" : ""}
        {p.chgPct.toFixed(2)}% session
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function CommoditiesBoard(_: SectionComponentProps) {
  const ready = useReady(300);
  const totalExposure = commodities.reduce((s, c) => s + c.exposureM, 0);
  const sortedByExp = [...commodities].sort((a, b) => b.exposureM - a.exposureM);

  const gainers = commodities.filter((c) => c.chgPct > 0).length;
  const losers = commodities.filter((c) => c.chgPct < 0).length;
  const best = [...commodities].sort((a, b) => b.chgPct - a.chgPct)[0];
  const worst = [...commodities].sort((a, b) => a.chgPct - b.chgPct)[0];
  const phos = commodities.find((c) => c.id === "PHOS")!;

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="mkt-commodities"
        accountType="trader"
        accent="emerald"
        statusChips={
          <>
            <StatusChip label="HarchCorp exposure board" tone="neutral" icon={Flame} />
            <StatusChip label={`${gainers} up / ${losers} down`} tone={gainers >= losers ? "positive" : "negative"} />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <StatTile
                label="Total Notional"
                value={`${formatCompactMAD(totalExposure)}`}
                unit="M MAD"
                hint="Across 6 commodities"
                icon={Flame}
                accent={TRADER}
              />
              <StatTile
                label="Largest Exposure"
                value={sortedByExp[0].name}
                delta={`${formatCompactMAD(sortedByExp[0].exposureM)}M`}
                deltaTone="neutral"
                hint={`${((sortedByExp[0].exposureM / totalExposure) * 100).toFixed(1)}% of total`}
                icon={Diamond}
                accent={TRADER}
              />
              <StatTile
                label="Best Performer"
                value={best.name}
                delta={`+${best.chgPct.toFixed(2)}%`}
                deltaTone="positive"
                hint="Session leader"
                icon={ArrowUp}
                accent={TRADER}
              />
              <StatTile
                label="Worst Performer"
                value={worst.name}
                delta={`${worst.chgPct.toFixed(2)}%`}
                deltaTone="negative"
                hint="Session laggard"
                icon={ArrowDown}
                accent={TRADER}
              />
              <StatTile
                label="Phosphate (OCP)"
                value={`$${phos.price.toFixed(2)}`}
                delta={`+${phos.ytdPct.toFixed(1)}% YTD`}
                deltaTone="positive"
                hint="Strategic commodity"
                icon={Globe2}
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

      {/* Commodity cards grid */}
      <StaggerGrid className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {commodities.map((c, i) => (
          <CommodityCard key={c.id} c={c} delay={0.05 + i * 0.04} />
        ))}
      </StaggerGrid>

      {/* Exposure bar chart + table */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <PanelCard accent={TRADER} delay={0.2}>
          <PanelHeader
            title="HarchCorp Notional Exposure"
            subtitle="Commodities exposure · millions MAD"
            icon={Flame}
            accent={TRADER}
            action={<Tag tone="emerald">{formatCompactMAD(totalExposure)}M total</Tag>}
          />
          <div className="p-4">
            <DeferredChart height="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sortedByExp.map((c) => ({ name: c.name, exposure: c.exposureM, chgPct: c.chgPct, id: c.id }))}
                  layout="vertical"
                  margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `${formatCompactMAD(v)}M`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#475569" }}
                    axisLine={false}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip content={<ExposureTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
                  <ReferenceLine x={0} stroke="#94a3b8" />
                  <Bar dataKey="exposure" radius={[0, 4, 4, 0]}>
                    {sortedByExp.map((c, i) => (
                      <Cell key={i} fill={commodityColor(c.id)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </DeferredChart>
          </div>
        </PanelCard>

        <PanelCard accent={TRADER} delay={0.25}>
          <PanelHeader
            title="Commodities Detail"
            subtitle="Session + YTD performance"
            icon={Diamond}
            accent={TRADER}
          />
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 text-[10px] uppercase tracking-wide text-slate-500">
                <TableHead>Commodity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Chg %</TableHead>
                <TableHead className="text-right">YTD</TableHead>
                <TableHead className="text-right">Exposure</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commodities.map((c) => (
                <TableRow key={c.id} className="text-[12px] transition-colors hover:bg-slate-50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-sm" style={{ background: commodityColor(c.id) }} />
                      <span className="font-medium text-slate-800">{c.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="tabular text-right text-slate-700">
                    ${formatMAD(c.price, c.price > 100 ? 2 : 3)}
                  </TableCell>
                  <TableCell>
                    <Tag
                      tone={c.chgPct > 0 ? "positive" : c.chgPct < 0 ? "negative" : "neutral"}
                      icon={c.chgPct > 0 ? ArrowUp : c.chgPct < 0 ? ArrowDown : Minus}
                    >
                      {Math.abs(c.chgPct).toFixed(2)}%
                    </Tag>
                  </TableCell>
                  <TableCell className={cn("tabular text-right font-semibold", chgColor(c.ytdPct))}>
                    {c.ytdPct > 0 ? "+" : ""}
                    {c.ytdPct.toFixed(1)}%
                  </TableCell>
                  <TableCell className="tabular text-right text-slate-700">
                    {formatCompactMAD(c.exposureM)}M
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </PanelCard>
      </div>
    </div>
  );
}
