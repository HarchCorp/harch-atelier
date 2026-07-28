"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCard } from "./chart-card";
import { DeferredChart } from "./chart-skeleton";
import { sentiment12m } from "@/lib/mock-data";

interface SentTooltipProps {
  active?: boolean;
  label?: string;
  payload?: Array<{ value: number; dataKey: string }>;
}

function SentTooltip({ active, label, payload }: SentTooltipProps) {
  if (!active || !label || !payload?.length) return null;
  const pos = payload.find((p) => p.dataKey === "positive")?.value ?? 0;
  const neg = payload.find((p) => p.dataKey === "negative")?.value ?? 0;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1.5 space-y-0.5 text-[11px]">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" />Positive</span>
          <span className="tabular font-semibold text-slate-800">{pos}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-rose-700"><span className="h-2 w-2 rounded-full bg-rose-500" />Negative</span>
          <span className="tabular font-semibold text-slate-800">{neg}</span>
        </div>
      </div>
    </div>
  );
}

export function SentimentTrend() {
  const last = sentiment12m[sentiment12m.length - 1];
  const prev = sentiment12m[sentiment12m.length - 2];
  const netNow = last.positive - last.negative;
  const netPrev = prev.positive - prev.negative;
  const delta = netNow - netPrev;
  return (
    <ChartCard
      id="sentiment"
      title="Sentiment Trend"
      subtitle="Positive vs negative mentions · trailing 12 months"
      action={
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Positive</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" />Negative</span>
        </div>
      }
      footer={
        <span>
          Latest net sentiment <span className="tabular font-semibold text-slate-700">{netNow >= 0 ? "+" : ""}{netNow}</span> ·
          MoM change <span className={`tabular font-semibold ${delta >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{delta >= 0 ? "+" : ""}{delta}</span>
        </span>
      }
    >
      <DeferredChart height="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sentiment12m} margin={{ top: 8, right: 12, bottom: 4, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
              width={32}
              allowDecimals={false}
            />
            <Tooltip content={<SentTooltip />} cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "3 3" }} />
            <Line
              type="monotone"
              dataKey="positive"
              stroke="#10b981"
              strokeWidth={2.25}
              dot={{ r: 2.5, fill: "#10b981", strokeWidth: 0 }}
              activeDot={{ r: 4.5, strokeWidth: 1.5, stroke: "#fff" }}
            />
            <Line
              type="monotone"
              dataKey="negative"
              stroke="#f43f5e"
              strokeWidth={2.25}
              dot={{ r: 2.5, fill: "#f43f5e", strokeWidth: 0 }}
              activeDot={{ r: 4.5, strokeWidth: 1.5, stroke: "#fff" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </DeferredChart>
    </ChartCard>
  );
}
