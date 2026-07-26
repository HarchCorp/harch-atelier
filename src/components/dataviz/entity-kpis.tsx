"use client";

import * as React from "react";
import { ChartCard } from "./chart-card";
import { entityIndex, severityColor, sentimentColor } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Building2, TrendingDown, TrendingUp, Trophy } from "lucide-react";

interface EntityStat {
  name: string;
  events: number;
  articles: number;
  critical: number;
  negative: number;
  positive: number;
  /** net sentiment skew -100..+100 */
  skew: number;
}

function computeEntityStats(): EntityStat[] {
  const stats: EntityStat[] = [];
  for (const [name, events] of entityIndex) {
    const articles = events.reduce((s, e) => s + e.articles, 0);
    const critical = events.filter((e) => e.severity === "critical" || e.severity === "high").length;
    const negative = events.filter((e) => e.sentiment === "negative").length;
    const positive = events.filter((e) => e.sentiment === "positive").length;
    const skew = events.length > 0
      ? Math.round(((positive - negative) / events.length) * 100)
      : 0;
    stats.push({ name, events: events.length, articles, critical, negative, positive, skew });
  }
  return stats;
}

interface EntityKPIsProps {
  onSelectEntity?: (entity: string) => void;
}

export function EntityKPIs({ onSelectEntity }: EntityKPIsProps = {}) {
  const stats = React.useMemo(() => computeEntityStats(), []);
  const byVolume = React.useMemo(
    () => [...stats].sort((a, b) => b.articles - a.articles).slice(0, 5),
    [stats],
  );
  const mostNegative = React.useMemo(
    () => [...stats].sort((a, b) => a.skew - b.skew).slice(0, 3),
    [stats],
  );
  const mostPositive = React.useMemo(
    () => [...stats].sort((a, b) => b.skew - a.skew).slice(0, 3),
    [stats],
  );
  const maxArticles = Math.max(...stats.map((s) => s.articles), 1);

  return (
    <ChartCard
      id="entity-kpis"
      title="Entity KPIs"
      subtitle="Ranked entities by volume + sentiment"
      action={
        <span className="tabular rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
          {stats.length} entities
        </span>
      }
      footer={
        <span>
          Top volume: <span className="font-semibold text-slate-700">{byVolume[0]?.name}</span> ·
          most negative: <span className="font-semibold text-rose-700">{mostNegative[0]?.name}</span>
        </span>
      }
    >
      {/* Top by volume */}
      <div>
        <h4 className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          <Trophy className="h-3 w-3 text-amber-500" />
          Top by article volume
          {onSelectEntity ? <span className="ml-1 text-[9px] font-normal text-slate-300">· click to open profile</span> : null}
        </h4>
        <div className="space-y-1.5">
          {byVolume.map((s, i) => (
            <button
              key={s.name}
              type="button"
              onClick={() => onSelectEntity?.(s.name)}
              className="group flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-slate-50"
            >
              <span className="tabular w-4 shrink-0 text-right text-[10px] font-bold text-slate-400">{i + 1}</span>
              <span className="w-28 shrink-0 truncate text-[11px] font-medium text-slate-700 group-hover:text-slate-900">{s.name}</span>
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-700 transition-all duration-500 group-hover:bg-slate-900"
                  style={{ width: `${(s.articles / maxArticles) * 100}%` }}
                />
              </div>
              <span className="tabular w-10 shrink-0 text-right text-[11px] font-bold text-slate-800">{s.articles}</span>
              <span className="tabular w-8 shrink-0 text-right text-[9px] text-slate-400">{s.events}ev</span>
            </button>
          ))}
        </div>
      </div>

      {/* Most negative / positive */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <h4 className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-rose-600">
            <TrendingDown className="h-3 w-3" />
            Most negative
          </h4>
          <div className="space-y-1">
            {mostNegative.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => onSelectEntity?.(s.name)}
                className="flex w-full items-center justify-between gap-2 rounded-md bg-rose-50/50 px-2 py-1 text-left transition-colors hover:bg-rose-100/70"
              >
                <span className="truncate text-[11px] font-medium text-slate-700">{s.name}</span>
                <span className="tabular text-[10px] font-bold text-rose-700">{s.skew}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
            <TrendingUp className="h-3 w-3" />
            Most positive
          </h4>
          <div className="space-y-1">
            {mostPositive.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => onSelectEntity?.(s.name)}
                className="flex w-full items-center justify-between gap-2 rounded-md bg-emerald-50/50 px-2 py-1 text-left transition-colors hover:bg-emerald-100/70"
              >
                <span className="truncate text-[11px] font-medium text-slate-700">{s.name}</span>
                <span className="tabular text-[10px] font-bold text-emerald-700">+{s.skew}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
