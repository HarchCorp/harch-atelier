"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Gauge,
  Minus,
  Newspaper,
  ShieldAlert,
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
import { ChartCard } from "@/components/dataviz/chart-card";
import { DeferredChart } from "@/components/dataviz/chart-skeleton";
import { SectionHeader, StatusChip } from "../section-header";
import {
  MetricRing,
  PanelCard,
  PanelHeader,
  StaggerGrid,
  StatTile,
  Tag,
  type RoleAccent,
} from "../design-system";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  compositeKpis,
  compositeRisk30d,
  pillarBreakdown,
  pillarColor,
  topMovers,
  type CompositeKpi,
  type CompositeRiskDay,
} from "@/lib/admin-data";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Composite risk index — MetricRing                                  */
/* ------------------------------------------------------------------ */

function CompositeGauge({ score }: { score: number }) {
  const verdict = score > 75 ? "Elevated" : score > 55 ? "Moderate" : "Stable";
  const tone = score > 75 ? "rose" : score > 55 ? "amber" : "emerald";
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-4">
      <MetricRing
        value={score}
        size={180}
        stroke={11}
        tone={tone}
        sublabel="RISK"
      />
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-wide text-slate-500">Composite Risk Index</div>
        <div className="tabular text-[28px] font-bold text-slate-900">{score.toFixed(1)}</div>
        <Tag tone={score > 75 ? "negative" : score > 55 ? "warning" : "positive"}>{verdict}</Tag>
        <div className="mt-1.5 text-[10px] text-slate-400">0–100 scale · 30d rolling</div>
      </div>
    </div>
  );
}

function RiskTrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  const idx = payload.find((p) => p.dataKey === "index")?.value ?? 0;
  const events = payload.find((p) => p.dataKey === "events")?.value ?? 0;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className="tabular mt-1 text-[14px] font-bold text-slate-900">{idx.toFixed(1)}</div>
      <div className="tabular text-[10px] text-slate-500">{events} new events</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pillar breakdown chart                                             */
/* ------------------------------------------------------------------ */

function PillarBreakdownChart() {
  const data = pillarBreakdown.map((p) => ({
    pillar: p.pillar,
    score: p.score,
    delta: p.delta,
    color: pillarColor[p.pillar],
  }));
  return (
    <DeferredChart height="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="pillar" tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} width={92} />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as { pillar: string; score: number; delta: number };
              return (
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
                  <div className="text-[11px] font-semibold text-slate-800">{p.pillar}</div>
                  <div className="tabular mt-0.5 text-[14px] font-bold text-slate-900">{p.score}</div>
                  <div className={cn("tabular text-[10px]", p.delta > 0 ? "text-rose-600" : p.delta < 0 ? "text-emerald-600" : "text-slate-500")}>
                    {p.delta > 0 ? "+" : ""}{p.delta.toFixed(1)} pts · 30d
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={18}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Pillar radar                                                       */
/* ------------------------------------------------------------------ */

function PillarRadar() {
  const data = pillarBreakdown.map((p) => ({ pillar: p.pillar, score: p.score }));
  return (
    <DeferredChart height="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 10, fill: "#475569" }} />
          <Radar
            dataKey="score"
            stroke="#0ea5e9"
            strokeWidth={1.8}
            fill="#0ea5e9"
            fillOpacity={0.25}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              const v = payload[0].value as number;
              return (
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
                  <div className="text-[11px] font-semibold text-slate-800">{label}</div>
                  <div className="tabular mt-0.5 text-[14px] font-bold text-slate-900">{v}</div>
                </div>
              );
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Risk trend area chart                                              */
/* ------------------------------------------------------------------ */

function RiskTrendChart() {
  return (
    <DeferredChart height="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={compositeRisk30d as CompositeRiskDay[]} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} minTickGap={32} tickFormatter={(v: string) => v.slice(5)} />
          <YAxis domain={[20, 100]} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={28} />
          <Tooltip content={<RiskTrendTooltip />} />
          <Area type="monotone" dataKey="index" stroke="#f43f5e" strokeWidth={1.8} fill="url(#riskGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  KPI tone → accent map                                              */
/* ------------------------------------------------------------------ */

const kpiAccent: Record<CompositeKpi["tone"], RoleAccent> = {
  positive: "emerald",
  negative: "rose",
  warning: "amber",
  neutral: "slate",
};

const kpiDeltaTone: Record<CompositeKpi["tone"], "positive" | "negative" | "neutral"> = {
  positive: "positive",
  negative: "negative",
  warning: "negative",
  neutral: "neutral",
};

function kpiIconFor(label: string) {
  if (label.includes("Coverage")) return Newspaper;
  if (label.includes("Alerts") || label.includes("Critical")) return ShieldAlert;
  if (label.includes("Entities")) return Activity;
  return TrendingUp;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function IntelOverview(_: SectionComponentProps) {
  const latest = compositeRisk30d[compositeRisk30d.length - 1];
  const prev = compositeRisk30d[compositeRisk30d.length - 2];
  const deltaIdx = latest.index - prev.index;

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="intel-overview"
        accountType="admin"
        accent="rose"
        statusChips={
          <>
            <StatusChip label={`Index ${latest.index.toFixed(1)}`} tone={latest.index > 70 ? "negative" : "warning"} icon={Gauge} pulse={latest.index > 75} />
            <StatusChip label="6 pillars · 5 regions" tone="neutral" icon={Activity} />
          </>
        }
        kpis={
          <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {compositeKpis.map((k) => (
              <StatTile
                key={k.label}
                label={k.label}
                value={k.value}
                delta={k.delta}
                deltaTone={kpiDeltaTone[k.tone]}
                hint={k.hint}
                icon={kpiIconFor(k.label)}
                accent={kpiAccent[k.tone]}
              />
            ))}
          </StaggerGrid>
        }
      />

      {/* Composite gauge + trend */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <PanelCard accent={latest.index > 75 ? "rose" : latest.index > 55 ? "amber" : "emerald"}>
          <PanelHeader
            title="Composite Risk Index"
            subtitle={`30-day rolling · ${deltaIdx >= 0 ? "+" : ""}${deltaIdx.toFixed(1)} pts vs prior day`}
            icon={Gauge}
            accent="slate"
          />
          <div className="p-4">
            <CompositeGauge score={latest.index} />
          </div>
        </PanelCard>
        <ChartCard
          title="Risk Trend — 30 days"
          subtitle="Composite index · new events per day"
          className="xl:col-span-2"
          action={
            <span className={cn("tabular text-[11px] font-semibold", deltaIdx >= 0 ? "text-rose-700" : "text-emerald-700")}>
              {deltaIdx >= 0 ? "+" : ""}{deltaIdx.toFixed(1)} Δ
            </span>
          }
        >
          <RiskTrendChart />
        </ChartCard>
      </div>

      {/* Pillar breakdown + radar */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartCard
          title="Pillar Breakdown"
          subtitle="6-pillar exposure scores · 0–100"
          action={<span className="text-[10px] uppercase tracking-wide text-slate-500">30d weighted</span>}
        >
          <PillarBreakdownChart />
        </ChartCard>
        <ChartCard
          title="Pillar Radar"
          subtitle="Symmetric exposure across pillars"
        >
          <PillarRadar />
        </ChartCard>
      </div>

      {/* Top movers table */}
      <ChartCard
        title="Top Movers"
        subtitle="Largest 7-day composite score deltas"
        bodyClassName="p-0"
        action={
          <span className="text-[10px] uppercase tracking-wide text-slate-500">{topMovers.length} entities</span>
        }
      >
        <Table>
          <TableHeader>
            <TableRow className="text-[10px] uppercase tracking-wide text-slate-500">
              <TableHead>Entity</TableHead>
              <TableHead>Pillar</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-right">7d Δ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topMovers.map((m) => {
              const isUp = m.delta7d > 0;
              return (
                <TableRow key={m.entity} className="text-[12px] hover:bg-slate-50/60">
                  <TableCell className="font-medium text-slate-900">{m.entity}</TableCell>
                  <TableCell>
                    <span
                      className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ring-1 ring-slate-200"
                      style={{ color: pillarColor[m.pillar] }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: pillarColor[m.pillar] }} />
                      {m.pillar}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate text-slate-600" title={m.reason}>{m.reason}</TableCell>
                  <TableCell className="tabular text-right font-semibold text-slate-800">{m.score}</TableCell>
                  <TableCell className="text-right">
                    <Tag tone={isUp ? "negative" : "positive"} icon={isUp ? ArrowUp : m.delta7d < 0 ? ArrowDown : Minus}>
                      {Math.abs(m.delta7d).toFixed(1)}
                    </Tag>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ChartCard>
    </div>
  );
}
