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
import {
  Banknote,
  Landmark,
  PiggyBank,
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
  MetricRing,
  ProgressBar,
  Divider,
  StaggerGrid,
  type RoleAccent,
} from "../design-system";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  yieldCurve,
  corporateBonds,
  sectorChipTint,
  formatMAD,
  chgColor,
  type YieldCurvePoint,
  type BvcSector,
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
/*  Yield curve tooltip                                                */
/* ------------------------------------------------------------------ */

function YieldTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  const y = payload.find((p) => p.dataKey === "yield")?.value ?? 0;
  const prev = payload.find((p) => p.dataKey === "prevYield")?.value ?? 0;
  const delta = y - prev;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label} tenor
      </div>
      <div className="tabular mt-1 text-[14px] font-bold text-slate-900">{y.toFixed(2)}%</div>
      <div className="tabular text-[10px] text-slate-500">
        Prev {prev.toFixed(2)}% ·{" "}
        <span className={cn("font-semibold", chgColor(delta))}>
          {delta >= 0 ? "+" : ""}
          {(delta * 100).toFixed(0)} bps
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function FixedIncomeView(_: SectionComponentProps) {
  const ready = useReady(300);
  const shortRate = yieldCurve[0].yield;
  const longRate = yieldCurve[yieldCurve.length - 1].yield;
  const spread = longRate - shortRate;
  const avgYield =
    yieldCurve.reduce((s, p) => s + p.yield, 0) / yieldCurve.length;
  const totalBondsM = corporateBonds.reduce((s, b) => s + b.amountM, 0);

  // Steepness indicator: 2s10s spread
  const twoY = yieldCurve.find((p) => p.tenor === "2Y")!.yield;
  const tenY = yieldCurve.find((p) => p.tenor === "10Y")!.yield;
  const twoTen = (tenY - twoY) * 100;

  // Curve slope normalised 0-100 for the MetricRing (0=inverted, 100=very steep)
  const slopeScore = Math.max(0, Math.min(100, (spread / 1.5) * 100));

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="mkt-fixed-income"
        accountType="trader"
        accent="emerald"
        statusChips={
          <>
            <StatusChip label="BAM T-bills + corporate bonds" tone="neutral" icon={Landmark} />
            <StatusChip label={`${corporateBonds.length} corporate issues`} tone="neutral" icon={PiggyBank} />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <StatTile
                label="13W T-Bill"
                value={`${shortRate.toFixed(2)}%`}
                delta={`+${((yieldCurve[0].yield - yieldCurve[0].prevYield) * 100).toFixed(0)} bps`}
                deltaTone="neutral"
                icon={Banknote}
                accent={TRADER}
              />
              <StatTile
                label="10Y T-Bill"
                value={`${longRate.toFixed(2)}%`}
                delta={`+${((yieldCurve[yieldCurve.length - 1].yield - yieldCurve[yieldCurve.length - 1].prevYield) * 100).toFixed(0)} bps`}
                deltaTone="neutral"
                icon={Banknote}
                accent={TRADER}
              />
              <StatTile
                label="2s10s Spread"
                value={`${twoTen.toFixed(0)} bps`}
                deltaTone={twoTen > 0 ? "positive" : "negative"}
                hint={twoTen > 0 ? "Steepening curve" : "Inverted curve"}
                icon={TrendingUp}
                accent={TRADER}
              />
              <StatTile
                label="Avg Yield"
                value={`${avgYield.toFixed(2)}%`}
                deltaTone="neutral"
                hint="Across 7 tenors"
                accent={TRADER}
              />
              <StatTile
                label="Corporate Outstanding"
                value={`${formatMAD(totalBondsM, 0)}`}
                unit="M MAD"
                hint={`${corporateBonds.length} issues · all sectors`}
                icon={PiggyBank}
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

      {/* Yield curve + curve stats */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <PanelCard accent={TRADER} className="xl:col-span-2" delay={0.05}>
          <PanelHeader
            title="BAM Treasury Yield Curve"
            subtitle="Moroccan T-bills · current vs previous"
            icon={Landmark}
            accent={TRADER}
            action={
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-emerald-500" /> Current
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-slate-400" /> Previous
                </span>
              </div>
            }
          />
          <div className="p-4">
            <DeferredChart height="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={yieldCurve as YieldCurvePoint[]}
                  margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="tenor"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[2.2, 3.8]}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                    tickFormatter={(v: number) => `${v.toFixed(1)}%`}
                  />
                  <Tooltip content={<YieldTooltip />} />
                  <ReferenceLine y={3} stroke="#94a3b8" strokeDasharray="2 4" />
                  <Line
                    type="monotone"
                    dataKey="prevYield"
                    stroke="#94a3b8"
                    strokeWidth={1.2}
                    strokeDasharray="4 3"
                    dot={{ r: 3, fill: "#94a3b8" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="yield"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#10b981" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </DeferredChart>
          </div>
        </PanelCard>

        <PanelCard accent={TRADER} delay={0.1}>
          <PanelHeader
            title="Curve Stats"
            subtitle="Yield spread analysis"
            icon={TrendingUp}
            accent={TRADER}
          />
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
              <MetricRing
                value={slopeScore}
                size={72}
                stroke={7}
                tone={slopeScore >= 50 ? "emerald" : slopeScore >= 25 ? "amber" : "rose"}
                sublabel="Slope"
              />
              <div className="flex-1">
                <div className="card-title">Curve Shape</div>
                <div className="mt-1 flex items-center gap-1.5">
                  {spread > 0 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-rose-600" />
                  )}
                  <span className="text-[13px] font-semibold text-slate-900">
                    {spread > 0 ? "Upward sloping" : "Inverted"}
                  </span>
                </div>
                <div className="mt-0.5 text-[10px] text-slate-500">
                  {spread > 0
                    ? "Normal term-premium environment"
                    : "Recession signal — short yields exceed long"}
                </div>
              </div>
            </div>

            <Divider label="Term spreads" />
            {[
              { label: "13W – 2Y", from: yieldCurve[0], to: yieldCurve[3] },
              { label: "2Y – 5Y", from: yieldCurve[3], to: yieldCurve[4] },
              { label: "5Y – 10Y", from: yieldCurve[4], to: yieldCurve[5] },
              { label: "10Y – 15Y", from: yieldCurve[5], to: yieldCurve[6] },
              { label: "13W – 10Y (full)", from: yieldCurve[0], to: yieldCurve[5] },
            ].map((row) => {
              const bps = (row.to.yield - row.from.yield) * 100;
              const maxAbs = 150;
              return (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white p-2.5"
                >
                  <span className="text-[11px] font-medium text-slate-700">{row.label}</span>
                  <div className="flex-1">
                    <ProgressBar
                      value={Math.abs(bps)}
                      max={maxAbs}
                      tone={bps >= 0 ? "emerald" : "rose"}
                      height={4}
                    />
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        "tabular text-[13px] font-bold",
                        bps >= 0 ? "text-emerald-700" : "text-rose-700",
                      )}
                    >
                      {bps >= 0 ? "+" : ""}
                      {bps.toFixed(0)} bps
                    </div>
                    <div className="tabular text-[9px] text-slate-500">
                      {row.from.yield.toFixed(2)}% → {row.to.yield.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </PanelCard>
      </div>

      {/* Corporate bonds table */}
      <PanelCard accent={TRADER} delay={0.15}>
        <PanelHeader
          title="Corporate Bonds"
          subtitle="Casablanca-listed corporate debt · outstanding issues"
          icon={PiggyBank}
          accent={TRADER}
          action={<Tag tone="emerald">{corporateBonds.length} issues</Tag>}
        />
        <div className="harch-scroll max-h-[440px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-white">
              <TableRow className="text-[10px] uppercase tracking-wide text-slate-500">
                <TableHead>ISIN</TableHead>
                <TableHead>Issuer</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead className="text-right">Coupon</TableHead>
                <TableHead>Maturity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Yield</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {corporateBonds.map((b) => (
                <TableRow key={b.isin} className="text-[12px] transition-colors hover:bg-slate-50">
                  <TableCell className="font-mono text-[10px] text-slate-500">{b.isin}</TableCell>
                  <TableCell className="font-medium text-slate-900">{b.issuer}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ring-1",
                        sectorChipTint[b.sector as BvcSector],
                      )}
                    >
                      {b.sector}
                    </span>
                  </TableCell>
                  <TableCell className="tabular text-right text-slate-700">{b.coupon.toFixed(2)}%</TableCell>
                  <TableCell className="tabular text-slate-600">{b.maturity}</TableCell>
                  <TableCell className="tabular text-right text-slate-700">{b.price.toFixed(2)}</TableCell>
                  <TableCell className="tabular text-right font-semibold text-slate-900">
                    {b.yield.toFixed(2)}%
                  </TableCell>
                  <TableCell>
                    <Tag
                      tone={
                        b.rating.startsWith("A")
                          ? "positive"
                          : b.rating.startsWith("BBB")
                            ? "warning"
                            : "negative"
                      }
                    >
                      {b.rating}
                    </Tag>
                  </TableCell>
                  <TableCell className="tabular text-right text-slate-700">
                    {formatMAD(b.amountM, 0)}M
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </PanelCard>
    </div>
  );
}
