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
  ArrowDown,
  ArrowUp,
  Banknote,
  Coins,
  Globe2,
  Landmark,
  Percent,
  TrendingUp,
} from "lucide-react";
import { DeferredChart } from "@/components/dataviz/chart-skeleton";
import { SectionHeader, StatusChip } from "../section-header";
import {
  PanelCard,
  PanelHeader,
  StatTile,
  Tag,
  ProgressBar,
  MetricRing,
  Divider,
  StaggerGrid,
  type RoleAccent,
} from "../design-system";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  fx30d,
  fxLatest,
  fxPrevClose,
  fxRates,
  bamKeyRate,
  madStrength,
  formatMAD,
  chgColor,
  type FxPoint,
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
/*  FX chart tooltip                                                   */
/* ------------------------------------------------------------------ */

const FX_META: Record<string, { label: string; color: string }> = {
  eurMad: { label: "EUR/MAD", color: "#0ea5e9" },
  usdMad: { label: "USD/MAD", color: "#10b981" },
  gbpMad: { label: "GBP/MAD", color: "#f59e0b" },
};

function FxTooltip({
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
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{dateLabel}</div>
      <div className="mt-1.5 space-y-0.5 text-[11px]">
        {payload.map((p) => {
          const meta = FX_META[p.dataKey] ?? { label: p.dataKey, color: p.color };
          return (
            <div key={p.dataKey} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2 w-2 rounded-sm" style={{ background: meta.color }} />
                {meta.label}
              </span>
              <span className="tabular font-semibold text-slate-800">{p.value.toFixed(4)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function FxRatesView(_: SectionComponentProps) {
  const ready = useReady(300);

  const eurChgPct = ((fxLatest.eurMad - fxPrevClose.eurMad) / fxPrevClose.eurMad) * 100;
  const usdChgPct = ((fxLatest.usdMad - fxPrevClose.usdMad) / fxPrevClose.usdMad) * 100;

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="mkt-fx"
        accountType="trader"
        accent="emerald"
        statusChips={
          <>
            <StatusChip label="Bank Al-Maghrib" tone="neutral" icon={Landmark} />
            <StatusChip label={`${bamKeyRate.current.toFixed(2)}% key rate`} tone="warning" icon={Percent} />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {fxRates.map((r) => (
                <StatTile
                  key={r.pair}
                  label={r.pair}
                  value={r.value.toFixed(4)}
                  delta={`${r.chgPct >= 0 ? "+" : ""}${r.chgPct.toFixed(2)}%`}
                  deltaTone={r.chgPct >= 0 ? "positive" : "negative"}
                  hint={`YTD ${r.ytdPct >= 0 ? "+" : ""}${r.ytdPct.toFixed(1)}%`}
                  icon={r.pair.startsWith("EUR") ? Banknote : r.pair.startsWith("USD") ? Coins : Globe2}
                  accent={TRADER}
                />
              ))}
              <StatTile
                label="MAD Strength"
                value={madStrength.index.toFixed(1)}
                delta={`${madStrength.chgPct >= 0 ? "+" : ""}${madStrength.chgPct.toFixed(2)}%`}
                deltaTone={madStrength.chgPct >= 0 ? "positive" : "negative"}
                hint="Index · base 100 = 2020"
                icon={TrendingUp}
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

      {/* FX chart + BAM key rate card */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <PanelCard accent={TRADER} className="xl:col-span-2" delay={0.05}>
          <PanelHeader
            title="MAD Crosses — 30 Day"
            subtitle="EUR/MAD · USD/MAD · GBP/MAD"
            icon={Globe2}
            accent={TRADER}
            action={
              <div className="flex flex-wrap items-center gap-1.5">
                {Object.values(FX_META).map((m) => (
                  <span key={m.label} className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                    <span className="h-2 w-2 rounded-sm" style={{ background: m.color }} />
                    {m.label}
                  </span>
                ))}
              </div>
            }
          />
          <div className="p-4">
            <DeferredChart height="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fx30d as FxPoint[]} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
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
                    width={48}
                    tickFormatter={(v: number) => v.toFixed(2)}
                  />
                  <Tooltip content={<FxTooltip />} />
                  <Line yAxisId="left" type="monotone" dataKey="eurMad" stroke={FX_META.eurMad.color} strokeWidth={1.8} dot={false} />
                  <Line yAxisId="left" type="monotone" dataKey="usdMad" stroke={FX_META.usdMad.color} strokeWidth={1.6} dot={false} />
                  <Line yAxisId="left" type="monotone" dataKey="gbpMad" stroke={FX_META.gbpMad.color} strokeWidth={1.4} dot={false} strokeDasharray="4 3" />
                </LineChart>
              </ResponsiveContainer>
            </DeferredChart>
          </div>
        </PanelCard>

        {/* Bank Al-Maghrib key rate */}
        <PanelCard accent={TRADER} delay={0.1}>
          <PanelHeader
            title="Bank Al-Maghrib"
            subtitle="Policy rate · inflation outlook"
            icon={Landmark}
            accent={TRADER}
            action={<Tag tone="warning">BAM</Tag>}
          />
          <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <MetricRing
                value={bamKeyRate.current * 20}
                size={84}
                stroke={7}
                tone="amber"
                sublabel="Rate"
              />
              <div className="flex-1">
                <div className="card-title text-amber-700">Key Policy Rate</div>
                <div className="tabular mt-1 text-[28px] font-bold leading-none text-amber-900">
                  {bamKeyRate.current.toFixed(2)}%
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-amber-700">
                  <Tag tone="warning" icon={ArrowUp}>+{bamKeyRate.changeBps} bps</Tag>
                  <span>from {bamKeyRate.previous.toFixed(2)}%</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="card-title">Inflation (CPI)</div>
                <div className="tabular mt-1 text-[18px] font-bold text-slate-900">
                  {bamKeyRate.inflation.toFixed(1)}%
                </div>
                <div className="mt-1 text-[10px] text-slate-500">
                  Target {bamKeyRate.inflationTarget.toFixed(1)}%
                </div>
                <div className="mt-1.5">
                  <ProgressBar
                    value={bamKeyRate.inflation}
                    max={bamKeyRate.inflationTarget * 2}
                    tone="amber"
                    height={4}
                    threshold={(bamKeyRate.inflationTarget / (bamKeyRate.inflationTarget * 2)) * 100}
                  />
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="card-title">Next Meeting</div>
                <div className="tabular mt-1 text-[14px] font-bold text-slate-900">
                  {bamKeyRate.nextMeeting.slice(5)}
                </div>
                <div className="text-[10px] text-slate-500">MPC council</div>
                <div className="mt-1 text-[10px] text-slate-500">
                  Effective {bamKeyRate.effectiveDate.slice(5)}
                </div>
              </div>
            </div>
            <Divider label="MAD Strength" />
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="tabular text-[20px] font-bold text-slate-900">
                    {madStrength.index.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-slate-500">Base 100 = 2020</div>
                </div>
                <div className="text-right">
                  <Tag
                    tone={madStrength.chgPct > 0 ? "positive" : "negative"}
                    icon={madStrength.chgPct > 0 ? ArrowUp : ArrowDown}
                  >
                    {Math.abs(madStrength.chgPct).toFixed(2)}%
                  </Tag>
                  <div className="mt-1 tabular text-[10px] text-slate-500">
                    YTD {madStrength.ytdPct > 0 ? "+" : ""}
                    {madStrength.ytdPct.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                <span>DXY correlation</span>
                <span className="tabular font-semibold text-slate-700">
                  {madStrength.dxyCorrelation.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </PanelCard>
      </div>

      {/* EUR/MAD area chart + USD/MAD area chart */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <PanelCard accent={TRADER} delay={0.15}>
          <PanelHeader
            title="EUR/MAD — 30 Day"
            subtitle={`Latest ${fxLatest.eurMad.toFixed(4)} · prev ${fxPrevClose.eurMad.toFixed(4)}`}
            icon={Banknote}
            accent={TRADER}
            action={
              <Tag
                tone={eurChgPct >= 0 ? "positive" : "negative"}
                icon={eurChgPct >= 0 ? ArrowUp : ArrowDown}
              >
                {Math.abs(eurChgPct).toFixed(2)}%
              </Tag>
            }
          />
          <div className="p-4">
            <DeferredChart height="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fx30d as FxPoint[]} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="eurMadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={FX_META.eurMad.color} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={FX_META.eurMad.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                    tickFormatter={(v: number) => v.toFixed(2)}
                  />
                  <Tooltip content={<FxTooltip />} />
                  <ReferenceLine y={fxPrevClose.eurMad} stroke="#94a3b8" strokeDasharray="2 4" />
                  <Area type="monotone" dataKey="eurMad" stroke={FX_META.eurMad.color} strokeWidth={1.8} fill="url(#eurMadGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </DeferredChart>
          </div>
        </PanelCard>

        <PanelCard accent={TRADER} delay={0.2}>
          <PanelHeader
            title="USD/MAD — 30 Day"
            subtitle={`Latest ${fxLatest.usdMad.toFixed(4)} · prev ${fxPrevClose.usdMad.toFixed(4)}`}
            icon={Coins}
            accent={TRADER}
            action={
              <Tag
                tone={usdChgPct >= 0 ? "positive" : "negative"}
                icon={usdChgPct >= 0 ? ArrowUp : ArrowDown}
              >
                {Math.abs(usdChgPct).toFixed(2)}%
              </Tag>
            }
          />
          <div className="p-4">
            <DeferredChart height="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fx30d as FxPoint[]} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="usdMadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={FX_META.usdMad.color} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={FX_META.usdMad.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                    tickFormatter={(v: number) => v.toFixed(2)}
                  />
                  <Tooltip content={<FxTooltip />} />
                  <ReferenceLine y={fxPrevClose.usdMad} stroke="#94a3b8" strokeDasharray="2 4" />
                  <Area type="monotone" dataKey="usdMad" stroke={FX_META.usdMad.color} strokeWidth={1.8} fill="url(#usdMadGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </DeferredChart>
          </div>
        </PanelCard>
      </div>
    </div>
  );
}
