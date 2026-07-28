"use client";

/**
 * Harch Atelier — Communications & PR shared helpers (V18.0 figma rework)
 *
 * Local to the comms/ folder. Used by all 8 PR sections for:
 *  - mount-ready skeleton (premium first paint)
 *  - shared KPI skeleton grid (6 tiles)
 *  - panel skeleton stack
 *  - premium tooltip body used inside every recharts Tooltip
 *  - PR accent constant (rose)
 */
import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { RoleAccent } from "../design-system";

/** PR role accent token (per `roleAccent["pr"] = "rose"`). */
export const PR: RoleAccent = "rose";

/** Premium chart tooltip tone map. */
export type TooltipTone = "default" | "rose" | "emerald" | "amber" | "sky" | "violet" | "slate";

/**
 * useMountReady — flips false → true after `delay` ms so sections can paint
 * a brief premium skeleton before the animated content fades in.
 * Default 320ms matches the trader rework cadence.
 */
export function useMountReady(delay = 320): boolean {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    const id = window.setTimeout(() => setReady(true), delay);
    return () => window.clearTimeout(id);
  }, [delay]);
  return ready;
}

/** 6-tile KPI skeleton grid mirroring the StatTile strip layout. */
export function KpiSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-md"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-2.5 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Stacked PanelCard skeletons for chart + table bodies. */
export function PanelSkeletons({ count = 2, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-5 xl:grid-cols-2", className)}>
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
 * PremiumTooltip — shared styled tooltip body used by every recharts
 * Tooltip in the comms sections. Renders a dark slate card with a header
 * + rows.
 */
export function PremiumTooltip({
  header,
  rows,
}: {
  header: string;
  rows: { label: string; value: string; tone?: TooltipTone; dot?: string }[];
}) {
  const toneClass: Record<TooltipTone, string> = {
    default: "text-slate-700",
    rose: "text-rose-700",
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    sky: "text-sky-700",
    violet: "text-violet-700",
    slate: "text-slate-600",
  };
  return (
    <div className="min-w-[200px] rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{header}</div>
      <div className="mt-1 space-y-0.5">
        {rows.map((r, i) => (
          <div key={i} className="tabular flex items-center justify-between gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-500">
              {r.dot ? <span className="h-2 w-2 rounded-sm" style={{ background: r.dot }} /> : null}
              {r.label}
            </span>
            <span className={cn("font-semibold", toneClass[r.tone ?? "default"])}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Helper: convert a sentiment value to a tooltip tone. */
export function sentimentTone(s: "positive" | "neutral" | "negative"): TooltipTone {
  if (s === "positive") return "emerald";
  if (s === "negative") return "rose";
  return "slate";
}

/** Helper: convert a numeric delta to a tooltip tone. */
export function deltaTone(n: number): TooltipTone {
  if (n > 0) return "emerald";
  if (n < 0) return "rose";
  return "slate";
}
