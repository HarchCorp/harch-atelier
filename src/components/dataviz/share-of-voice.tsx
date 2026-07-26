"use client";

import * as React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartCard } from "./chart-card";
import { DeferredChart } from "./chart-skeleton";
import { shareOfVoice } from "@/lib/mock-data";

const palette = [
  "#1e293b", // slate-800 (target)
  "#0d9488", // teal-600
  "#6366f1", // indigo-500  (kept off the primary brand palette; used as a competitor accent)
  "#0891b2", // cyan-600
  "#7c3aed", // violet-600
  "#94a3b8", // slate-400 (Other)
];

function SovTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; isTarget: boolean } }> }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const total = shareOfVoice.reduce((s, d) => s + d.value, 0);
  const pct = ((p.value / total) * 100).toFixed(1);
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-semibold text-slate-800">{p.name}</span>
        {p.isTarget ? <span className="rounded bg-slate-800 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">Target</span> : null}
      </div>
      <div className="mt-1 text-[10px] text-slate-500">
        <span className="tabular text-[12px] font-semibold text-slate-700">{p.value}</span> articles · <span className="tabular text-slate-700">{pct}%</span> share
      </div>
    </div>
  );
}

export function ShareOfVoice() {
  const total = shareOfVoice.reduce((s, d) => s + d.value, 0);
  const target = shareOfVoice.find((d) => d.isTarget)!;
  const targetPct = ((target.value / total) * 100).toFixed(1);

  return (
    <ChartCard
      id="sov"
      title="Share of Voice"
      subtitle="HarchCorp vs key competitors · 30d"
      action={
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500">
          {shareOfVoice.map((s, i) => (
            <span key={s.name} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: palette[i % palette.length] }} />
              <span className={s.isTarget ? "font-semibold text-slate-700" : ""}>{s.name}</span>
            </span>
          ))}
        </div>
      }
      footer={<span>Total coverage volume: <span className="tabular text-slate-700">{total.toLocaleString()}</span> articles across 6 entities.</span>}
    >
      <div className="relative h-[300px] w-full">
        <DeferredChart height="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
            <Tooltip content={<SovTooltip />} />
            <Pie
              data={shareOfVoice}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={78}
              outerRadius={120}
              paddingAngle={1.5}
              stroke="#fff"
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
            >
              {shareOfVoice.map((_, i) => (
                <Cell key={i} fill={palette[i % palette.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        </DeferredChart>
        {/* Central label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">HarchCorp</span>
          <span className="tabular text-[34px] font-bold leading-none text-slate-800">{targetPct}%</span>
          <span className="mt-1 text-[10px] text-slate-400">of total share</span>
        </div>
      </div>
    </ChartCard>
  );
}
