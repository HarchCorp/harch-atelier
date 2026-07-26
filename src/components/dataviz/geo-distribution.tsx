"use client";

import * as React from "react";
import { ChartCard } from "./chart-card";
import { geoRegions, type RiskPillar } from "@/lib/mock-data";
import { useRiskStore } from "@/lib/risk-store";
import { cn } from "@/lib/utils";
import { FilterX, MousePointerClick } from "lucide-react";

const pillarDot: Record<RiskPillar, string> = {
  Regulatory: "bg-violet-500",
  Cyber: "bg-cyan-500",
  Financial: "bg-sky-500",
  ESG: "bg-emerald-500",
  Geopolitical: "bg-amber-500",
  Reputational: "bg-rose-500",
};

/** intensity 0-100 → heat color (slate → amber → rose) */
function heatColor(intensity: number): string {
  if (intensity >= 70) return "#e11d48"; // rose-600
  if (intensity >= 55) return "#ea580c"; // orange-600
  if (intensity >= 40) return "#d97706"; // amber-600
  if (intensity >= 25) return "#64748b"; // slate-500
  return "#cbd5e1"; // slate-300
}

function heatOpacity(intensity: number): number {
  return 0.18 + (intensity / 100) * 0.55;
}

const skewLabel = (s: number): string => (s === 0 ? "neutral" : s > 0 ? `+${s}` : `${s}`);

/** Band geometry per region — kept in sync with geoRegions order. */
const bandGeometry: { code: string; x: number; y: number; w: number; h: number; labelX: number; labelY: number; label: string }[] = [
  { code: "NA", x: 8, y: 6, w: 92, h: 22, labelX: 14, labelY: 21, label: "NA" },
  { code: "EU", x: 120, y: 6, w: 80, h: 22, labelX: 126, labelY: 21, label: "EU" },
  { code: "APAC", x: 216, y: 6, w: 96, h: 22, labelX: 222, labelY: 21, label: "APAC" },
  { code: "MEA", x: 120, y: 44, w: 96, h: 22, labelX: 126, labelY: 59, label: "MEA" },
  { code: "LATAM", x: 40, y: 82, w: 92, h: 22, labelX: 46, labelY: 97, label: "LATAM" },
];

interface WorldStripProps {
  activeRegion: string;
  onSelectRegion: (code: string) => void;
}

/** Simplified abstract world-strip — 5 stacked horizontal bands, one per region.
 *  Each band is a clickable group that toggles the region filter. */
function WorldStrip({ activeRegion, onSelectRegion }: WorldStripProps) {
  return (
    <svg viewBox="0 0 320 110" className="h-[110px] w-full" role="img" aria-label="Regional signal intensity map — click a region to filter">
      <defs>
        <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#f1f5f9" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="320" height="110" fill="url(#grid)" />
      {bandGeometry.map((b, i) => {
        const region = geoRegions[i];
        const selected = activeRegion === b.code;
        const dimmed = activeRegion !== "all" && !selected;
        return (
          <g
            key={b.code}
            className="cursor-pointer"
            onClick={() => onSelectRegion(b.code)}
          >
            {/* Wider transparent hit area for easier clicking */}
            <rect x={b.x - 2} y={b.y - 2} width={b.w + 4} height={b.h + 4} fill="transparent" />
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={3}
              fill={heatColor(region.intensity)}
              fillOpacity={dimmed ? heatOpacity(region.intensity) * 0.4 : heatOpacity(region.intensity)}
              stroke={selected ? "#0f172a" : "none"}
              strokeWidth={selected ? 1.5 : 0}
              className="transition-all"
            />
            <text
              x={b.labelX}
              y={b.labelY}
              fontSize={9}
              fontWeight={700}
              fill={dimmed ? "#94a3b8" : "#475569"}
            >
              {b.label}
            </text>
          </g>
        );
      })}
      {/* connection dots for visual interest */}
      {[
        { x: 100, y: 17 },
        { x: 200, y: 17 },
        { x: 264, y: 17 },
      ].map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="2.5" fill="#fff" stroke="#e2e8f0" strokeWidth="1" />
          <circle cx={p.x} cy={p.y} r="1.2" fill="#0f172a" />
        </g>
      ))}
    </svg>
  );
}

export function GeoDistribution() {
  const totalSignals = geoRegions.reduce((s, r) => s + r.signals, 0);
  const maxIntensity = Math.max(...geoRegions.map((r) => r.intensity));
  const activeRegion = useRiskStore((s) => s.filters.region);
  const setFilter = useRiskStore((s) => s.setFilter);
  const toggleRegion = React.useCallback(
    (code: string) => {
      setFilter("region", activeRegion === code ? "all" : code);
    },
    [activeRegion, setFilter],
  );
  const isActive = activeRegion !== "all";
  return (
    <ChartCard
      id="geo"
      title="Geographic Distribution"
      subtitle="Signal intensity by region · 30d · click a band or row to filter"
      action={
        <div className="flex items-center gap-2 text-[9px] text-slate-400">
          {isActive ? (
            <button
              onClick={() => setFilter("region", "all")}
              className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700 hover:bg-slate-200"
            >
              <FilterX className="h-3 w-3" />
              Clear
            </button>
          ) : (
            <span className="flex items-center gap-1 text-slate-400">
              <MousePointerClick className="h-3 w-3" />
              click map
            </span>
          )}
          <span>low</span>
          <span className="flex gap-0.5">
            {["#cbd5e1", "#64748b", "#d97706", "#ea580c", "#e11d48"].map((c) => (
              <span key={c} className="h-2 w-2 rounded-sm" style={{ backgroundColor: c }} />
            ))}
          </span>
          <span>high</span>
        </div>
      }
      footer={
        <span>
          <span className="tabular font-semibold text-slate-700">{totalSignals}</span> signals across{" "}
          <span className="tabular font-semibold text-slate-700">{geoRegions.length}</span> regions
          {isActive ? (
            <> · filtering by <span className="font-semibold text-slate-700">{activeRegion}</span></>
          ) : (
            <> · hottest: <span className="font-semibold text-slate-700">{geoRegions[0].name}</span></>
          )}
        </span>
      }
    >
      <WorldStrip activeRegion={activeRegion} onSelectRegion={toggleRegion} />
      <div className="mt-3 space-y-1.5">
        {geoRegions.map((r) => {
          const selected = activeRegion === r.code;
          return (
            <button
              key={r.code}
              type="button"
              onClick={() => toggleRegion(r.code)}
              className={cn(
                "group flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left transition-all hover:bg-slate-50",
                selected && "bg-slate-50 ring-1 ring-inset ring-slate-300",
                !selected && isActive && "opacity-50",
              )}
            >
              <span
                className={cn("h-2 w-2 shrink-0 rounded-full transition-opacity", !selected && isActive && "opacity-60")}
                style={{ backgroundColor: heatColor(r.intensity) }}
              />
              <span className={cn("w-28 shrink-0 truncate text-[11px] font-medium", selected ? "text-slate-900" : "text-slate-700")}>{r.name}</span>
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", !selected && isActive && "opacity-50")}
                  style={{
                    width: `${(r.intensity / maxIntensity) * 100}%`,
                    backgroundColor: heatColor(r.intensity),
                  }}
                />
              </div>
              <span className="tabular w-6 shrink-0 text-right text-[10px] font-semibold text-slate-700">{r.signals}</span>
              <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", pillarDot[r.topPillar])} title={`Top pillar: ${r.topPillar}`} />
              <span
                className={cn(
                  "tabular w-10 shrink-0 text-right text-[10px] font-medium",
                  r.sentimentSkew > 0 ? "text-emerald-700" : r.sentimentSkew < 0 ? "text-rose-700" : "text-slate-500",
                )}
              >
                {skewLabel(r.sentimentSkew)}
              </span>
            </button>
          );
        })}
      </div>
    </ChartCard>
  );
}
