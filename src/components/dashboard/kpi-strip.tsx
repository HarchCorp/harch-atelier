"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Activity, Newspaper, AlertTriangle, Gauge } from "lucide-react";
import { coverage30d, sentiment12m, headlineKpis } from "@/lib/mock-data";
import { useSignalPulse } from "@/hooks/use-signal-pulse";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  unit?: string;
  delta: number;
  deltaSuffix?: string;
  deltaInvert?: boolean; // when true, a positive delta is bad (red)
  icon: React.ReactNode;
  accent: string;
  spark: number[];
  sparkColor: string;
  hint: string;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 96;
  const h = 28;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / range) * h).toFixed(1)}`);
  const areaPts = `0,${h} ${pts.join(" ")} ${w},${h}`;
  const id = React.useId();
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={areaPts} fill={`url(#${id})`} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function KpiCard({ label, value, unit, delta, deltaSuffix = "vs prev. period", deltaInvert, icon, accent, spark, sparkColor, hint }: KpiCardProps) {
  const good = deltaInvert ? delta < 0 : delta >= 0;
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("flex h-7 w-7 items-center justify-center rounded-md", accent)}>{icon}</span>
          <span className="card-title">{label}</span>
        </div>
        <span
          className={cn(
            "tabular inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold",
            good ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
          )}
        >
          {good ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {delta > 0 ? "+" : ""}{delta.toFixed(1)}{deltaSuffix === "%" ? "" : ""}
        </span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="flex items-baseline gap-1">
          <span className="tabular text-[26px] font-bold leading-none text-slate-900">{value}</span>
          {unit ? <span className="text-[12px] font-medium text-slate-400">{unit}</span> : null}
        </div>
        <Sparkline data={spark} color={sparkColor} />
      </div>
      <p className="mt-2 text-[10px] text-slate-400">{hint}</p>
    </div>
  );
}

export function KpiStrip() {
  const posSeries = coverage30d.map((d) => d.positive);
  const negSeries = coverage30d.map((d) => d.negative);
  const sentPos = sentiment12m.map((m) => m.positive);
  const alertSeries = [9, 11, 10, 13, 12, 14, 13, 15, 14, 16, 15, 17];

  // Live KPI stream from the signal-pulse service.
  const { kpis, connected } = useSignalPulse();

  const riskIndex = kpis?.riskIndex ?? headlineKpis.riskIndex;
  const negativeShare = kpis?.negativeShare ?? headlineKpis.negativeShare;
  const activeAlerts = kpis?.activeAlerts ?? headlineKpis.activeAlerts;

  // Derive a live delta vs the headline baseline.
  const riskIndexDelta = riskIndex - headlineKpis.riskIndex;
  const negShareDelta = negativeShare - headlineKpis.negativeShare;
  const alertsDelta = activeAlerts - headlineKpis.activeAlerts;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Composite Risk Index"
        value={riskIndex.toFixed(1)}
        unit="/100"
        delta={riskIndexDelta}
        deltaInvert
        icon={<Gauge className="h-4 w-4 text-rose-600" />}
        accent="bg-rose-50"
        spark={sentPos}
        sparkColor="#e11d48"
        hint={connected ? "Live · GLM-4 weighted · 6 risk pillars" : "GLM-4 weighted · 6 risk pillars · rolling 30d"}
      />
      <KpiCard
        label="Coverage Volume"
        value={headlineKpis.coverage30d.toLocaleString()}
        unit="articles"
        delta={headlineKpis.coverageDelta}
        icon={<Newspaper className="h-4 w-4 text-sky-600" />}
        accent="bg-sky-50"
        spark={posSeries}
        sparkColor="#0ea5e9"
        hint="Deduplicated articles across 1,840 sources"
      />
      <KpiCard
        label="Negative Share"
        value={`${negativeShare}`}
        unit="%"
        delta={negShareDelta}
        deltaInvert
        icon={<Activity className="h-4 w-4 text-amber-600" />}
        accent="bg-amber-50"
        spark={negSeries}
        sparkColor="#f59e0b"
        hint={connected ? "Live · share classified negative by GLM-4" : "Share of coverage classified negative by GLM-4"}
      />
      <KpiCard
        label="Active Alerts"
        value={`${activeAlerts}`}
        unit="open"
        delta={alertsDelta}
        deltaInvert
        icon={<AlertTriangle className="h-4 w-4 text-violet-600" />}
        accent="bg-violet-50"
        spark={alertSeries}
        sparkColor="#8b5cf6"
        hint={connected ? "Live · threshold breaches awaiting triage" : "Threshold breaches awaiting analyst triage"}
      />
    </div>
  );
}
