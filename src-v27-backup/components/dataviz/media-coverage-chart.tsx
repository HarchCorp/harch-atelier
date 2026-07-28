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
import { format, parseISO } from "date-fns";
import { ChartCard } from "./chart-card";
import { DeferredChart } from "./chart-skeleton";
import { sliceCoverage, type CoverageRange } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface CoverageTooltipProps {
  active?: boolean;
  label?: string;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
}

function CoverageTooltip({ active, label, payload }: CoverageTooltipProps) {
  if (!active || !label || !payload?.length) return null;
  let dateLabel = label;
  try {
    dateLabel = format(parseISO(label), "MMM d, yyyy");
  } catch {
    /* keep raw */
  }
  const pos = payload.find((p) => p.dataKey === "positive")?.value ?? 0;
  const neg = payload.find((p) => p.dataKey === "negative")?.value ?? 0;
  const net = pos - neg;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{dateLabel}</div>
      <div className="mt-1.5 space-y-0.5 text-[11px]">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-emerald-700"><span className="h-2 w-2 rounded-sm bg-emerald-500" />Positive</span>
          <span className="tabular font-semibold text-slate-800">{pos}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-rose-700"><span className="h-2 w-2 rounded-sm bg-rose-500" />Negative</span>
          <span className="tabular font-semibold text-slate-800">{neg}</span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-4 border-t border-slate-100 pt-1 text-slate-500">
          <span>Net sentiment</span>
          <span className={`tabular font-semibold ${net >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{net >= 0 ? "+" : ""}{net}</span>
        </div>
      </div>
    </div>
  );
}

function RangeToggle({ value, onChange }: { value: CoverageRange; onChange: (r: CoverageRange) => void }) {
  const options: { key: CoverageRange; label: string }[] = [
    { key: "7d", label: "7D" },
    { key: "30d", label: "30D" },
    { key: "90d", label: "90D" },
  ];
  return (
    <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 p-0.5">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={cn(
            "rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors",
            value === o.key
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function LegendRow() {
  return (
    <div className="flex items-center gap-3 text-[10px] text-slate-500">
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-sm bg-emerald-500" />
        Positive Coverage
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-sm bg-rose-500" />
        Negative Coverage
      </span>
    </div>
  );
}

export function MediaCoverageChart() {
  const [range, setRange] = React.useState<CoverageRange>("30d");
  const data = React.useMemo(() => sliceCoverage(range), [range]);
  const totalPos = data.reduce((s, d) => s + d.positive, 0);
  const totalNeg = data.reduce((s, d) => s + d.negative, 0);
  return (
    <ChartCard
      id="coverage"
      title="Media Coverage"
      subtitle={`Article volume · last ${range === "7d" ? "7" : range === "30d" ? "30" : "90"} days`}
      action={
        <div className="flex items-center gap-2">
          <LegendRow />
          <RangeToggle value={range} onChange={setRange} />
        </div>
      }
      footer={
        <span>
          {range} totals — positive <span className="tabular text-emerald-700">{totalPos}</span> · negative <span className="tabular text-rose-700">{totalNeg}</span> · net <span className="tabular font-semibold text-slate-700">{totalPos - totalNeg >= 0 ? "+" : ""}{totalPos - totalNeg}</span>
        </span>
      }
    >
      <DeferredChart height="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -12 }}>
            <defs>
              <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.30} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(v: string) => {
                try {
                  return format(parseISO(v), "MMM d");
                } catch {
                  return v;
                }
              }}
              tick={{ fontSize: 9, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              minTickGap={range === "90d" ? 40 : 24}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
              width={36}
              allowDecimals={false}
            />
            <Tooltip content={<CoverageTooltip />} cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "3 3" }} />
            <Area
              type="monotone"
              dataKey="positive"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#posGrad)"
              activeDot={{ r: 4, strokeWidth: 1.5, stroke: "#fff" }}
            />
            <Area
              type="monotone"
              dataKey="negative"
              stroke="#f43f5e"
              strokeWidth={2}
              fill="url(#negGrad)"
              activeDot={{ r: 4, strokeWidth: 1.5, stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </DeferredChart>
    </ChartCard>
  );
}
