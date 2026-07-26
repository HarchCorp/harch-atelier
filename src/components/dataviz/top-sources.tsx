"use client";

import * as React from "react";
import { ChartCard } from "./chart-card";
import { topSources, type ArticleTier } from "@/lib/mock-data";
import { useRiskStore } from "@/lib/risk-store";
import { cn } from "@/lib/utils";
import { FilterX, MousePointerClick } from "lucide-react";

const tierBadge: Record<ArticleTier, string> = {
  tier1: "bg-slate-800 text-white",
  tier2: "bg-slate-500 text-white",
  tier3: "bg-slate-300 text-slate-700",
};

function formatReach(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return `${n}`;
}

export function TopSources() {
  const maxArticles = Math.max(...topSources.map((s) => s.articles), 1);
  const activeSource = useRiskStore((s) => s.filters.source);
  const setFilter = useRiskStore((s) => s.setFilter);

  const toggleSource = React.useCallback(
    (src: string) => {
      setFilter("source", activeSource === src ? "all" : src);
    },
    [activeSource, setFilter],
  );

  const isActive = activeSource !== "all";

  return (
    <ChartCard
      id="sources"
      title="Top Sources"
      subtitle="Outlets driving coverage · 30d · click to filter the table"
      action={
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          {isActive ? (
            <button
              onClick={() => setFilter("source", "all")}
              className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700 hover:bg-slate-200"
            >
              <FilterX className="h-3 w-3" />
              Clear
            </button>
          ) : (
            <span className="flex items-center gap-1 text-slate-400">
              <MousePointerClick className="h-3 w-3" />
              click rows
            </span>
          )}
          {(["tier1", "tier2", "tier3"] as ArticleTier[]).map((t) => (
            <span key={t} className="flex items-center gap-1">
              <span className={cn("rounded px-1 py-px text-[9px] font-bold uppercase", tierBadge[t])}>
                {t.replace("tier", "T")}
              </span>
            </span>
          ))}
        </div>
      }
      footer={
        <span>
          Tier-1 outlets account for{" "}
          <span className="tabular font-semibold text-slate-700">
            {Math.round(
              (topSources.filter((s) => s.tier === "tier1").reduce((sum, s) => sum + s.articles, 0) /
                topSources.reduce((sum, s) => sum + s.articles, 0)) *
                100,
            )}
            %
          </span>{" "}
          of volume
          {isActive ? (
            <> · filtering by <span className="font-semibold text-slate-700">{activeSource}</span></>
          ) : null}
        </span>
      }
    >
      <div className="harch-scroll max-h-[340px] space-y-2 overflow-y-auto pr-1">
        {topSources.map((s) => {
          const negPct = (s.negative / s.articles) * 100;
          const posPct = (s.positive / s.articles) * 100;
          const neuPct = 100 - negPct - posPct;
          const selected = activeSource === s.source;
          return (
            <button
              key={s.source}
              type="button"
              onClick={() => toggleSource(s.source)}
              className={cn(
                "group block w-full rounded-lg border bg-white px-3 py-2 text-left transition-all hover:border-slate-200 hover:bg-slate-50/60",
                selected ? "border-sky-300 bg-sky-50/60 ring-1 ring-inset ring-sky-200" : "border-slate-100",
                !selected && isActive && "opacity-50",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={cn("rounded px-1 py-px text-[9px] font-bold uppercase", tierBadge[s.tier])}>
                    {s.tier.replace("tier", "T")}
                  </span>
                  <span className={cn("truncate text-[12px] font-semibold", selected ? "text-slate-900" : "text-slate-800")}>{s.source}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="tabular text-[10px] text-slate-400">{formatReach(s.reach)} reach</span>
                  <span className="tabular text-[13px] font-bold text-slate-900">{s.articles}</span>
                </div>
              </div>
              {/* Stacked sentiment bar */}
              <div className="mt-1.5 flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="bg-emerald-500" style={{ width: `${posPct}%` }} />
                <div className="bg-slate-300" style={{ width: `${neuPct}%` }} />
                <div className="bg-rose-500" style={{ width: `${negPct}%` }} />
              </div>
              <div className="mt-1 flex items-center justify-between text-[9px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-sm bg-emerald-500" />
                  <span className="tabular">{s.positive}</span> pos
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-sm bg-slate-300" />
                  <span className="tabular">{s.neutral}</span> neu
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-sm bg-rose-500" />
                  <span className="tabular">{s.negative}</span> neg
                </span>
                <span className="tabular">{Math.round((s.articles / maxArticles) * 100)}% share</span>
              </div>
            </button>
          );
        })}
      </div>
    </ChartCard>
  );
}
