"use client";

import * as React from "react";
import { ChartCard } from "./chart-card";
import { riskTrend90d, peakToEventId, type RiskTrendPoint } from "@/lib/mock-data";
import { format, parseISO } from "date-fns";
import { TrendingUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const W = 760;
const H = 120;
const PAD_X = 8;
const PAD_Y = 14;

function indexColor(index: number): string {
  if (index >= 80) return "#e11d48"; // rose-600
  if (index >= 65) return "#ea580c"; // orange-600
  if (index >= 50) return "#d97706"; // amber-600
  return "#64748b"; // slate-500
}

function TrendTooltip({ point, x, y }: { point: RiskTrendPoint; x: number; y: number }) {
  let dateLabel = point.date;
  try {
    dateLabel = format(parseISO(point.date), "MMM d, yyyy");
  } catch {
    /* keep raw */
  }
  const color = indexColor(point.index);
  return (
    <div
      className="pointer-events-none absolute z-10 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-lg"
      style={{
        left: Math.min(x + 8, W - 150),
        top: Math.max(y - 56, 4),
      }}
    >
      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{dateLabel}</div>
      <div className="mt-0.5 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="tabular text-[13px] font-bold text-slate-900">{point.index}</span>
        <span className="text-[10px] text-slate-400">/100</span>
      </div>
      {point.peak ? (
        <div className="mt-0.5 text-[10px] font-medium text-rose-600">▲ {point.peak}</div>
      ) : null}
    </div>
  );
}

interface RiskTrendTimelineProps {
  onSelectEvent?: (eventId: string) => void;
}

export function RiskTrendTimeline({ onSelectEvent }: RiskTrendTimelineProps = {}) {
  const [hover, setHover] = React.useState<number | null>(null);
  const data = riskTrend90d;
  const max = 100;
  const min = 0;
  const range = max - min;
  const stepX = (W - PAD_X * 2) / (data.length - 1);

  const points = data.map((p, i) => ({
    x: PAD_X + i * stepX,
    y: H - PAD_Y - ((p.index - min) / range) * (H - PAD_Y * 2),
    p,
  }));

  const linePath = points
    .map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(1)},${H - PAD_Y} L${points[0].x.toFixed(1)},${H - PAD_Y} Z`;

  const peaks = points.filter((pt) => pt.p.peak);
  const avg = Math.round(data.reduce((s, p) => s + p.index, 0) / data.length);
  const latest = data[data.length - 1];
  const first = data[0];
  const delta = latest.index - first.index;
  const maxIdx = Math.max(...data.map((p) => p.index));

  // Avg line y
  const avgY = H - PAD_Y - ((avg - min) / range) * (H - PAD_Y * 2);

  return (
    <ChartCard
      id="trend"
      title="Risk Trend Timeline"
      subtitle="Composite risk index · trailing 90 days"
      action={
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-slate-400" />
            avg <span className="tabular font-semibold text-slate-700">{avg}</span>
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className={cn("h-3 w-3", delta >= 0 ? "text-rose-500" : "text-emerald-500")} />
            <span className={cn("tabular font-semibold", delta >= 0 ? "text-rose-600" : "text-emerald-600")}>
              {delta >= 0 ? "+" : ""}{delta}
            </span>
            90d
          </span>
          <span className="flex items-center gap-1">
            peak <span className="tabular font-semibold text-rose-600">{maxIdx}</span>
          </span>
        </div>
      }
      footer={
        <span>
          {peaks.length} annotated peaks · hover for detail · click a peak to open its event · latest{" "}
          <span className="tabular font-semibold text-slate-700">{latest.index}</span>
        </span>
      }
    >
      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-[120px] w-full"
          preserveAspectRatio="none"
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e11d48" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#e11d48" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          {/* Gridlines */}
          {[25, 50, 75].map((g) => {
            const gy = H - PAD_Y - ((g - min) / range) * (H - PAD_Y * 2);
            return (
              <g key={g}>
                <line x1={PAD_X} x2={W - PAD_X} y1={gy} y2={gy} stroke="#f1f5f9" strokeWidth={1} />
                <text x={W - PAD_X + 2} y={gy + 3} fontSize={8} fill="#cbd5e1">{g}</text>
              </g>
            );
          })}

          {/* Average line */}
          <line
            x1={PAD_X}
            x2={W - PAD_X}
            y1={avgY}
            y2={avgY}
            stroke="#94a3b8"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <text x={PAD_X + 2} y={avgY - 3} fontSize={8} fill="#94a3b8">avg {avg}</text>

          {/* Area + line */}
          <path d={areaPath} fill="url(#trendArea)" />
          <path d={linePath} fill="none" stroke="#e11d48" strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />

          {/* Peak markers — clickable to open the event drawer */}
          {peaks.map((pt) => {
            const eventId = pt.p.peak ? peakToEventId[pt.p.peak] : undefined;
            const clickable = Boolean(onSelectEvent && eventId);
            return (
              <g
                key={pt.p.day}
                className={clickable ? "cursor-pointer" : ""}
                onClick={() => {
                  if (clickable && eventId) onSelectEvent?.(eventId);
                }}
              >
                <line
                  x1={pt.x}
                  x2={pt.x}
                  y1={pt.y}
                  y2={H - PAD_Y}
                  stroke="#e11d48"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  strokeOpacity={0.4}
                />
                {/* Wider invisible hit area for easier clicking */}
                {clickable ? (
                  <rect x={pt.x - 14} y={pt.y - 16} width={28} height={32} fill="transparent" />
                ) : null}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={3.5}
                  fill="#fff"
                  stroke="#e11d48"
                  strokeWidth={1.75}
                  className={clickable ? "transition-all hover:r-5" : ""}
                />
                <text x={pt.x} y={pt.y - 7} fontSize={8} fontWeight={600} fill="#be123c" textAnchor="middle">
                  {pt.p.peak}
                </text>
              </g>
            );
          })}

          {/* Hover hit areas */}
          {points.map((pt, i) => (
            <rect
              key={i}
              x={pt.x - stepX / 2}
              y={0}
              width={stepX}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}

          {/* Hover marker */}
          {hover != null ? (
            <g>
              <line
                x1={points[hover].x}
                x2={points[hover].x}
                y1={PAD_Y}
                y2={H - PAD_Y}
                stroke="#cbd5e1"
                strokeWidth={1}
              />
              <circle
                cx={points[hover].x}
                cy={points[hover].y}
                r={4}
                fill="#fff"
                stroke={indexColor(points[hover].p.index)}
                strokeWidth={2}
              />
            </g>
          ) : null}
        </svg>

        {/* HTML tooltip (positioned over the SVG) */}
        {hover != null ? (
          <TrendTooltip point={points[hover].p} x={points[hover].x} y={points[hover].y} />
        ) : null}
      </div>
    </ChartCard>
  );
}
