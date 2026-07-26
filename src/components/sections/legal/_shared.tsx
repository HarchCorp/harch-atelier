"use client";

/**
 * Shared Figma-grade helpers for the legal role's 8 Risk & Compliance
 * sections. Kept local to the legal folder so we don't touch any other
 * module. Used by every section to render a brief premium skeleton on
 * mount + a consistent StaggerGrid for the KPI strip + PanelCard body.
 */
import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Anchor date used by every legal dataset (2025-11-15T10:30:00Z). */
export const TODAY_ISO = "2025-11-15T00:00:00Z";

/** Whole-day delta from the anchor — negative = past, positive = future. */
export function daysFromToday(iso: string): number {
  return Math.round((Date.parse(iso) - Date.parse(TODAY_ISO)) / 86_400_000);
}

/**
 * useMountReady — flips from false → true after `delay` ms so sections can
 * paint a brief premium skeleton before the animated content fades in.
 * Default 380ms matches the self-role's skeleton cadence.
 */
export function useMountReady(delay = 380): boolean {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    const id = window.setTimeout(() => setReady(true), delay);
    return () => window.clearTimeout(id);
  }, [delay]);
  return ready;
}

/** 6-tile skeleton grid mirroring the KPI strip layout. */
export function KpiSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-5 rounded-md" />
          </div>
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-2.5 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Stacked panel-card skeletons for the chart + table bodies. */
export function PanelSkeletons({ count = 2 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
            i === 0 && count === 3 ? "xl:col-span-2" : "",
          )}
        >
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
          <Skeleton className="mt-2 h-[220px] w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

/**
 * PremiumChartTooltip — shared styled tooltip body used by every recharts
 * Tooltip in the legal sections. Renders a dark slate card with a header
 * + rows.
 */
export function PremiumTooltip({
  header,
  rows,
}: {
  header: string;
  rows: { label: string; value: string; tone?: "default" | "violet" | "rose" | "emerald" | "amber" | "sky" | "slate" }[];
}) {
  const toneClass: Record<string, string> = {
    default: "text-slate-700",
    violet: "text-violet-700",
    rose: "text-rose-700",
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    sky: "text-sky-700",
    slate: "text-slate-600",
  };
  return (
    <div className="min-w-[180px] rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{header}</div>
      <div className="mt-1 space-y-0.5">
        {rows.map((r, i) => (
          <div key={i} className="tabular flex items-center justify-between gap-4 text-[11px]">
            <span className="text-slate-500">{r.label}</span>
            <span className={cn("font-semibold", toneClass[r.tone ?? "default"])}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
