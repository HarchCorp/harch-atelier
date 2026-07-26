"use client";

import * as React from "react";
import { ChartCard } from "./chart-card";
import { pillarAgg, type RiskPillar } from "@/lib/mock-data";
import { useRiskStore } from "@/lib/risk-store";
import { cn } from "@/lib/utils";
import { FilterX, MousePointerClick } from "lucide-react";

const pillarTint: Record<RiskPillar, { bar: string; chip: string; dot: string; ring: string }> = {
  Regulatory: { bar: "bg-violet-500", chip: "bg-violet-50 text-violet-700", dot: "bg-violet-500", ring: "ring-violet-300" },
  Cyber: { bar: "bg-cyan-500", chip: "bg-cyan-50 text-cyan-700", dot: "bg-cyan-500", ring: "ring-cyan-300" },
  Financial: { bar: "bg-sky-500", chip: "bg-sky-50 text-sky-700", dot: "bg-sky-500", ring: "ring-sky-300" },
  ESG: { bar: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", ring: "ring-emerald-300" },
  Geopolitical: { bar: "bg-amber-500", chip: "bg-amber-50 text-amber-700", dot: "bg-amber-500", ring: "ring-amber-300" },
  Reputational: { bar: "bg-rose-500", chip: "bg-rose-50 text-rose-700", dot: "bg-rose-500", ring: "ring-rose-300" },
};

export function RiskPillars() {
  const maxExposure = Math.max(...pillarAgg.map((p) => p.exposure), 1);
  const totalArticles = pillarAgg.reduce((s, p) => s + p.articles, 0);
  const topPillar = pillarAgg[0];

  const activePillar = useRiskStore((s) => s.filters.pillar);
  const setFilter = useRiskStore((s) => s.setFilter);

  const togglePillar = React.useCallback(
    (p: RiskPillar) => {
      setFilter("pillar", activePillar === p ? "all" : p);
    },
    [activePillar, setFilter],
  );

  const isActive = activePillar !== "all";

  return (
    <ChartCard
      id="pillars"
      title="Risk Pillars"
      subtitle="Exposure by category · weighted 30d · click to filter the table"
      action={
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          {isActive ? (
            <button
              onClick={() => setFilter("pillar", "all")}
              className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700 hover:bg-slate-200"
            >
              <FilterX className="h-3 w-3" />
              Clear
            </button>
          ) : (
            <span className="flex items-center gap-1 text-slate-400">
              <MousePointerClick className="h-3 w-3" />
              click bars
            </span>
          )}
          <span className="tabular rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">
            {totalArticles.toLocaleString()} articles
          </span>
        </div>
      }
      footer={
        <span>
          Top exposure: <span className="font-semibold text-slate-700">{topPillar.pillar}</span> ·{" "}
          <span className="tabular font-semibold text-slate-700">{topPillar.exposure}/100</span>
          {isActive ? (
            <> · filtering by <span className="font-semibold text-slate-700">{activePillar}</span></>
          ) : null}
        </span>
      }
    >
      <div className="space-y-2.5">
        {pillarAgg.map((p) => {
          const tint = pillarTint[p.pillar];
          const widthPct = (p.exposure / maxExposure) * 100;
          const skewLabel =
            p.sentimentSkew === 0
              ? "neutral"
              : p.sentimentSkew > 0
                ? `+${p.sentimentSkew}`
                : `${p.sentimentSkew}`;
          const skewColor =
            p.sentimentSkew > 0
              ? "text-emerald-700"
              : p.sentimentSkew < 0
                ? "text-rose-700"
                : "text-slate-500";
          const selected = activePillar === p.pillar;
          return (
            <button
              key={p.pillar}
              type="button"
              onClick={() => togglePillar(p.pillar)}
              className={cn(
                "group block w-full rounded-md px-1.5 py-1 text-left transition-all hover:bg-slate-50",
                selected && cn("bg-slate-50 ring-1 ring-inset", tint.ring),
              )}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className={cn("h-1.5 w-1.5 rounded-full", tint.dot)} />
                  <span className={cn("text-[11px] font-medium", selected ? "text-slate-900" : "text-slate-700")}>{p.pillar}</span>
                  <span className="text-[10px] text-slate-400">
                    · <span className="tabular">{p.events}</span> events
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("tabular text-[10px] font-semibold", skewColor)}>{skewLabel}</span>
                  <span className="tabular text-[12px] font-bold text-slate-800">{p.exposure}</span>
                </div>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500 ease-out",
                    tint.bar,
                    selected ? "opacity-100" : "group-hover:opacity-80",
                    !selected && activePillar !== "all" && "opacity-40",
                  )}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400">
        <span>Exposure = volume × severity weighting</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="tabular text-emerald-600">+skew</span> = net positive
          </span>
          <span className="flex items-center gap-1">
            <span className="tabular text-rose-600">−skew</span> = net negative
          </span>
        </div>
      </div>
    </ChartCard>
  );
}
