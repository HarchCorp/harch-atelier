"use client";

/**
 * Harch Atelier — Entities shared helpers (V18.1 figma rework · market)
 *
 * Small primitives shared across the 5 entities sections: a brief mount
 * skeleton hook, a KPI skeleton tile, and a compact inline risk ring.
 * Market accent = amber throughout.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

/** Brief mount skeleton (300-500ms) for a premium feel. */
export function useReady(ms = 320): boolean {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setReady(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return ready;
}

/** KPI skeleton tile matching StatTile dimensions. */
export function KpiSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
      <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
      <div className="h-6 w-24 animate-pulse rounded bg-slate-100" />
      <div className="h-2.5 w-20 animate-pulse rounded bg-slate-100" />
    </div>
  );
}

/** Compact animated SVG risk ring (size 42) for inline table/list use. */
export function InlineRiskRing({
  value,
  size = 42,
  stroke = 4,
  showDecimal = false,
}: {
  value: number;
  size?: number;
  stroke?: number;
  showDecimal?: boolean;
}) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;
  const color = v >= 70 ? "#e11d48" : v >= 55 ? "#ea580c" : v >= 40 ? "#f59e0b" : "#10b981";
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <span className="tabular absolute text-[11px] font-bold text-slate-900">
        {showDecimal ? v.toFixed(0) : Math.round(v)}
      </span>
    </div>
  );
}

/** Premium filter chip styled like an amber-accented Tag. */
export function FilterChip({
  label,
  active,
  onClick,
  dot,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  dot?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 transition-colors",
        active
          ? "bg-amber-100 text-amber-800 ring-amber-300"
          : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 hover:text-slate-800 hover:ring-slate-300",
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot }} /> : null}
      {label}
    </button>
  );
}
