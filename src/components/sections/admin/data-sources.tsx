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
  Activity,
  AlertOctagon,
  CheckCircle2,
  Database,
  Gauge,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { ChartCard } from "@/components/dataviz/chart-card";
import { DeferredChart } from "@/components/dataviz/chart-skeleton";
import { SectionHeader, StatusChip } from "../section-header";
import {
  MetricRing,
  MiniSparkline,
  PanelCard,
  PanelHeader,
  ProgressBar,
  StaggerGrid,
  StatTile,
  Tag,
} from "../design-system";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  dataSources,
  sourceHealth30d,
  statusColor,
  formatNumber,
  type DataSource,
  type SourceHealthDay,
} from "@/lib/admin-data";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Source card                                                        */
/* ------------------------------------------------------------------ */

const statusTone: Record<DataSource["status"], "positive" | "warning" | "negative"> = {
  up: "positive",
  degraded: "warning",
  down: "negative",
};

function SourceCard({ source, index }: { source: DataSource; index: number }) {
  const Icon =
    source.status === "up" ? CheckCircle2 : source.status === "degraded" ? TriangleAlert : AlertOctagon;
  const latencyColor = source.status === "up" ? "#10b981" : source.status === "degraded" ? "#f59e0b" : "#f43f5e";
  const errorTone: "emerald" | "amber" | "rose" =
    source.errorRate > 0.05 ? "rose" : source.errorRate > 0.01 ? "amber" : "emerald";
  return (
    <PanelCard
      accent={source.status === "down" ? "rose" : source.status === "degraded" ? "amber" : undefined}
      delay={index * 0.03}
      className="p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-semibold text-slate-900">{source.name}</span>
            <span className={cn("h-1.5 w-1.5 rounded-full", statusColor[source.status].dot)} />
          </div>
          <div className="mt-0.5 truncate text-[10px] uppercase tracking-wide text-slate-400">
            {source.category} · {source.id}
          </div>
        </div>
        <Tag tone={statusTone[source.status]} icon={Icon}>{source.status}</Tag>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">{source.description}</p>

      <div className="mt-3">
        <MiniSparkline data={source.latencySeries} color={latencyColor} width={260} height={36} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-[11px]">
        <div>
          <div className="card-title">Latency p95</div>
          <div className="tabular font-semibold text-slate-800">
            {source.status === "down" ? "—" : `${source.latencyMs}ms`}
          </div>
        </div>
        <div>
          <div className="card-title">Records/day</div>
          <div className="tabular font-semibold text-slate-800">
            {source.recordsPerDay === 0 ? "—" : formatNumber(source.recordsPerDay)}
          </div>
        </div>
        <div>
          <div className="card-title">Error rate</div>
          <div className="tabular font-semibold text-slate-800">{(source.errorRate * 100).toFixed(2)}%</div>
        </div>
      </div>

      <div className="mt-3">
        <ProgressBar
          value={source.errorRate * 100}
          max={5}
          tone={errorTone}
          height={4}
          threshold={2}
          showLabel
        />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <RefreshCw className="h-3 w-3" />
          Last sync: <span className="font-medium text-slate-700">{source.lastSync}</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <Activity className="h-3 w-3" />
          24h latency
        </span>
      </div>
    </PanelCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Health timeline tooltip                                            */
/* ------------------------------------------------------------------ */

function HealthTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  const up = payload.find((p) => p.dataKey === "up")?.value ?? 0;
  const degraded = payload.find((p) => p.dataKey === "degraded")?.value ?? 0;
  const down = payload.find((p) => p.dataKey === "down")?.value ?? 0;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 space-y-0.5 text-[11px]">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Up
          </span>
          <span className="tabular font-semibold text-slate-800">{up}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Degraded
          </span>
          <span className="tabular font-semibold text-slate-800">{degraded}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Down
          </span>
          <span className="tabular font-semibold text-slate-800">{down}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Health timeline chart                                              */
/* ------------------------------------------------------------------ */

function HealthTimeline() {
  return (
    <DeferredChart height="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sourceHealth30d as SourceHealthDay[]} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="upGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="degGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="downGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} minTickGap={24} />
          <YAxis domain={[0, 8]} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={28} />
          <Tooltip content={<HealthTooltip />} />
          <Area type="monotone" dataKey="up" stackId="1" stroke="#10b981" strokeWidth={1.5} fill="url(#upGrad)" />
          <Area type="monotone" dataKey="degraded" stackId="1" stroke="#f59e0b" strokeWidth={1.5} fill="url(#degGrad)" />
          <Area type="monotone" dataKey="down" stackId="1" stroke="#f43f5e" strokeWidth={1.5} fill="url(#downGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function DataSources(_: SectionComponentProps) {
  const upCount = dataSources.filter((s) => s.status === "up").length;
  const degradedCount = dataSources.filter((s) => s.status === "degraded").length;
  const downCount = dataSources.filter((s) => s.status === "down").length;
  const totalRecords = dataSources.reduce((s, x) => s + x.recordsPerDay, 0);
  const avgLatency = Math.round(
    dataSources.filter((s) => s.latencyMs > 0).reduce((s, x) => s + x.latencyMs, 0) /
      Math.max(1, dataSources.filter((s) => s.latencyMs > 0).length),
  );
  const avgErrorRate =
    dataSources.reduce((s, x) => s + x.errorRate, 0) / dataSources.length;
  const healthPct = Math.round((upCount / dataSources.length) * 100);

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="admin-sources"
        accountType="admin"
        accent="sky"
        statusChips={
          <>
            <StatusChip label={`${upCount} up`} tone="positive" icon={CheckCircle2} />
            {degradedCount > 0 ? <StatusChip label={`${degradedCount} degraded`} tone="warning" icon={TriangleAlert} /> : null}
            {downCount > 0 ? <StatusChip label={`${downCount} down`} tone="negative" icon={AlertOctagon} pulse /> : null}
          </>
        }
        kpis={
          <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatTile label="Sources" value={`${dataSources.length}`} hint={`${dataSources.length - downCount} operational`} icon={Database} accent="slate" />
            <StatTile label="Healthy" value={`${upCount}`} delta={`${healthPct}%`} hint="of pipelines" icon={CheckCircle2} accent="emerald" />
            <StatTile label="Degraded" value={`${degradedCount}`} hint="Performance SLO breach" icon={TriangleAlert} accent="amber" />
            <StatTile label="Records / day" value={formatNumber(totalRecords)} hint="Across all sources" icon={Activity} accent="slate" />
            <StatTile label="Avg p95 latency" value={`${avgLatency}ms`} hint="Operational sources" icon={Gauge} accent="cyan" />
            <StatTile
              label="Avg error rate"
              value={`${(avgErrorRate * 100).toFixed(2)}%`}
              hint="Volume-weighted"
              accent={avgErrorRate > 0.05 ? "rose" : "slate"}
            />
          </StaggerGrid>
        }
      />

      {/* Health timeline + summary ring */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <ChartCard
          title="Source Health Timeline"
          subtitle="30-day pipeline availability · stacked by status"
          className="xl:col-span-2"
          action={
            <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wide">
              <span className="inline-flex items-center gap-1 text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Up</span>
              <span className="inline-flex items-center gap-1 text-amber-700"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Degraded</span>
              <span className="inline-flex items-center gap-1 text-rose-700"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Down</span>
            </div>
          }
          footer={`Today: ${upCount} up · ${degradedCount} degraded · ${downCount} down · ${dataSources.length} total pipelines`}
        >
          <HealthTimeline />
        </ChartCard>
        <PanelCard accent={healthPct > 80 ? "emerald" : healthPct > 60 ? "amber" : "rose"}>
          <PanelHeader
            title="Operational Health"
            subtitle="Live pipeline availability"
            icon={Gauge}
            accent="slate"
          />
          <div className="flex flex-col items-center gap-3 p-5">
            <MetricRing
              value={healthPct}
              size={140}
              stroke={10}
              tone={healthPct > 80 ? "emerald" : healthPct > 60 ? "amber" : "rose"}
              label="HEALTHY"
              sublabel={`${upCount}/${dataSources.length}`}
            />
            <div className="grid w-full grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-emerald-50 p-2 ring-1 ring-emerald-200">
                <div className="tabular text-[14px] font-bold text-emerald-800">{upCount}</div>
                <div className="text-[9px] uppercase tracking-wide text-emerald-700">Up</div>
              </div>
              <div className="rounded-lg bg-amber-50 p-2 ring-1 ring-amber-200">
                <div className="tabular text-[14px] font-bold text-amber-800">{degradedCount}</div>
                <div className="text-[9px] uppercase tracking-wide text-amber-700">Degraded</div>
              </div>
              <div className="rounded-lg bg-rose-50 p-2 ring-1 ring-rose-200">
                <div className="tabular text-[14px] font-bold text-rose-800">{downCount}</div>
                <div className="text-[9px] uppercase tracking-wide text-rose-700">Down</div>
              </div>
            </div>
          </div>
        </PanelCard>
      </div>

      {/* Source cards grid */}
      <PanelCard>
        <PanelHeader
          title="Ingestion Pipelines"
          subtitle="Health · latency · throughput · error rate"
          icon={Database}
          accent="slate"
          action={
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {dataSources.length} pipelines
            </span>
          }
        />
        <div className="p-3">
          <StaggerGrid className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {dataSources.map((s, i) => (
              <SourceCard key={s.id} source={s} index={i} />
            ))}
          </StaggerGrid>
        </div>
      </PanelCard>
    </div>
  );
}
