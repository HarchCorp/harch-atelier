"use client";

import * as React from "react";
import {
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  Cell,
} from "recharts";
import { ChartCard } from "./chart-card";
import { DeferredChart } from "./chart-skeleton";
import { riskPoints, riskPointToEvent, severityColor, type RiskPoint, type RiskEvent, type Severity } from "@/lib/mock-data";

const severityFill: Record<Severity, string> = {
  critical: "#e11d48", // rose-600
  high: "#ea580c", // orange-600
  medium: "#d97706", // amber-600
  low: "#64748b", // slate-500
};

interface QuadrantLabelProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  xRange: [number, number];
  yRange: [number, number];
  label: string;
  align: "tl" | "tr" | "bl" | "br";
  color: string;
}

function QuadrantLabel({ x, y, width, height, label, align, color }: QuadrantLabelProps) {
  if (x == null || y == null || width == null || height == null) return null;
  const pad = 8;
  const anchor = align.endsWith("r") ? "end" : "start";
  const tx = align.endsWith("r") ? x + width - pad : x + pad;
  const ty = align.startsWith("t") ? y + 14 : y + height - 6;
  return (
    <text x={tx} y={ty} textAnchor={anchor} fontSize={9} fontWeight={700} letterSpacing={0.6} fill={color} style={{ textTransform: "uppercase" }}>
      {label}
    </text>
  );
}

function RiskTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; frequency: number; mediaImpact: number; articles: number; severity: Severity; id: string; pillar: string } }> }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const sc = severityColor[p.severity];
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
        <span className="text-[11px] font-semibold text-slate-800">{p.name}</span>
      </div>
      <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-500">
        <span>ID</span>
        <span className="tabular text-slate-700">{p.id}</span>
        <span>Pillar</span>
        <span className="text-slate-700">{p.pillar}</span>
        <span>Frequency</span>
        <span className="tabular text-slate-700">{p.frequency}</span>
        <span>Media impact</span>
        <span className="tabular text-slate-700">{p.mediaImpact}</span>
        <span>Articles (30d)</span>
        <span className="tabular text-slate-700">{p.articles}</span>
      </div>
    </div>
  );
}

interface RiskMatrixProps {
  onSelect?: (e: RiskEvent) => void;
}

export function RiskMatrix({ onSelect }: RiskMatrixProps = {}) {
  const handleBubbleClick = React.useCallback(
    (data: { payload?: RiskPoint }) => {
      if (!data?.payload || !onSelect) return;
      const idx = riskPoints.findIndex((p) => p.id === data.payload!.id);
      onSelect(riskPointToEvent(data.payload, idx));
    },
    [onSelect],
  );
  return (
    <ChartCard
      id="matrix"
      title="Risk Matrix"
      subtitle="Frequency × Media Impact · 16 active signals · click a bubble to drill down"
      action={
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          {(["critical", "high", "medium", "low"] as Severity[]).map((s) => (
            <span key={s} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: severityFill[s] }} />
              <span className="capitalize">{s}</span>
            </span>
          ))}
        </div>
      }
      footer={
        <span>
          Bubble size = article volume (30d). Threshold line at 50/50.
        </span>
      }
    >
      <DeferredChart height="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            {/* Quadrant backgrounds */}
            <ReferenceArea x1={50} x2={100} y1={50} y2={100} fill="#e11d48" fillOpacity={0.06} />
            <ReferenceArea x1={0} x2={50} y1={50} y2={100} fill="#ea580c" fillOpacity={0.06} />
            <ReferenceArea x1={50} x2={100} y1={0} y2={50} fill="#d97706" fillOpacity={0.06} />
            <ReferenceArea x1={0} x2={50} y1={0} y2={50} fill="#64748b" fillOpacity={0.05} />

            {/* Quadrant labels */}
            <ReferenceArea x1={50} x2={100} y1={50} y2={100} label={<QuadrantLabel label="Code Red" align="tr" color="#be123c" xRange={[50,100]} yRange={[50,100]} />} fillOpacity={0} />
            <ReferenceArea x1={0} x2={50} y1={50} y2={100} label={<QuadrantLabel label="Constant Threats" align="tl" color="#9a3412" xRange={[0,50]} yRange={[50,100]} />} fillOpacity={0} />
            <ReferenceArea x1={50} x2={100} y1={0} y2={50} label={<QuadrantLabel label="Emerging Threats" align="br" color="#92400e" xRange={[50,100]} yRange={[0,50]} />} fillOpacity={0} />
            <ReferenceArea x1={0} x2={50} y1={0} y2={50} label={<QuadrantLabel label="Monitor" align="bl" color="#475569" xRange={[0,50]} yRange={[0,50]} />} fillOpacity={0} />

            <ReferenceLine x={50} stroke="#94a3b8" strokeDasharray="4 4" />
            <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="4 4" />

            <XAxis
              type="number"
              dataKey="frequency"
              name="Frequency"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              label={{ value: "Frequency →", position: "insideBottom", offset: -12, fontSize: 10, fill: "#94a3b8" }}
            />
            <YAxis
              type="number"
              dataKey="mediaImpact"
              name="Media Impact"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              label={{ value: "Media Impact", angle: -90, position: "insideLeft", offset: 16, fontSize: 10, fill: "#94a3b8" }}
            />
            <ZAxis type="number" dataKey="articles" range={[40, 520]} name="Articles" />
            <Tooltip content={<RiskTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "#cbd5e1" }} />
            <Scatter
              data={riskPoints}
              fillOpacity={0.78}
              stroke="#fff"
              strokeWidth={1}
              onClick={(data: { payload?: RiskPoint }) => handleBubbleClick(data)}
              cursor="pointer"
            >
              {riskPoints.map((p) => (
                <Cell key={p.id} fill={severityFill[p.severity]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </DeferredChart>
    </ChartCard>
  );
}
