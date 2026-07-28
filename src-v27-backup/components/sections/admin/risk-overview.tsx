"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDown,
  ArrowUp,
  Gauge,
  Layers,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartCard } from "@/components/dataviz/chart-card";
import { DeferredChart } from "@/components/dataviz/chart-skeleton";
import { SectionHeader, StatusChip } from "../section-header";
import {
  PanelCard,
  PanelHeader,
  ProgressBar,
  StaggerGrid,
  StatTile,
  Tag,
} from "../design-system";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  pillarBreakdown,
  pillarColor,
  pillarTrend12m,
  topRiskEntities,
  type PillarTrendMonth,
} from "@/lib/admin-data";
import type { RiskPillar } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const pillars: RiskPillar[] = ["Regulatory", "Cyber", "Financial", "ESG", "Geopolitical", "Reputational"];

const pillarToneMap: Record<string, "emerald" | "rose" | "amber" | "sky" | "violet" | "slate"> = {
  Regulatory: "violet",
  Cyber: "rose",
  Financial: "sky",
  ESG: "emerald",
  Geopolitical: "amber",
  Reputational: "slate",
};

/* ------------------------------------------------------------------ */
/*  Pillar bars — premium ProgressBar rows                             */
/* ------------------------------------------------------------------ */

function PillarBars() {
  const sorted = [...pillarBreakdown].sort((a, b) => b.score - a.score);
  return (
    <div className="flex flex-col gap-3">
      {sorted.map((p) => {
        const isUp = p.delta > 0;
        return (
          <div key={p.pillar} className="grid grid-cols-[110px_1fr_60px_60px] items-center gap-3">
            <span className="truncate text-[12px] font-medium text-slate-700">{p.pillar}</span>
            <div className="relative">
              <ProgressBar
                value={p.score}
                tone={pillarToneMap[p.pillar] ?? "slate"}
                height={20}
              />
              <span className="tabular pointer-events-none absolute right-2 top-0 flex h-full items-center text-[10px] font-bold text-white">
                {p.score}
              </span>
            </div>
            <span
              className={cn(
                "tabular inline-flex items-center justify-end gap-0.5 text-[11px] font-semibold",
                isUp ? "text-rose-600" : p.delta < 0 ? "text-emerald-600" : "text-slate-500",
              )}
            >
              {isUp ? <ArrowUp className="h-3 w-3" /> : p.delta < 0 ? <ArrowDown className="h-3 w-3" /> : null}
              {Math.abs(p.delta).toFixed(1)}
            </span>
            <span className="tabular text-right text-[11px] text-slate-500">{p.events} ev</span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pillar radar                                                       */
/* ------------------------------------------------------------------ */

function PillarRadarChart() {
  const data = pillarBreakdown.map((p) => ({ pillar: p.pillar, score: p.score }));
  return (
    <DeferredChart height="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 11, fill: "#475569" }} />
          <Radar
            dataKey="score"
            stroke="#0ea5e9"
            strokeWidth={2}
            fill="#0ea5e9"
            fillOpacity={0.25}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              const v = payload[0].value as number;
              return (
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
                  <div className="text-[11px] font-semibold text-slate-800">{label}</div>
                  <div className="tabular mt-0.5 text-[14px] font-bold text-slate-900">{v}</div>
                </div>
              );
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Pillar trend multi-line                                            */
/* ------------------------------------------------------------------ */

function PillarTrendChart() {
  return (
    <DeferredChart height="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={pillarTrend12m as PillarTrendMonth[]} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
          <YAxis domain={[20, 100]} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={28} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              return (
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
                  <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label} 2025</div>
                  <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
                    {payload.map((p) => (
                      <div key={p.dataKey as string} className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
                          {p.dataKey as string}
                        </span>
                        <span className="tabular font-semibold text-slate-800">{p.value as number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 10, paddingTop: 6 }}
            formatter={(value) => <span className="text-[10px] text-slate-600">{value}</span>}
          />
          {pillars.map((p) => (
            <Line
              key={p}
              type="monotone"
              dataKey={p}
              stroke={pillarColor[p]}
              strokeWidth={1.6}
              dot={false}
              activeDot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Top risk entities heat-table                                       */
/* ------------------------------------------------------------------ */

function TopRiskEntitiesTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="text-[10px] uppercase tracking-wide text-slate-500">
          <TableHead>Entity</TableHead>
          <TableHead className="text-right">Composite</TableHead>
          {pillars.map((p) => (
            <TableHead key={p} className="text-center">{p.slice(0, 3)}</TableHead>
          ))}
          <TableHead className="text-right">Events</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {topRiskEntities.map((e) => (
          <TableRow key={e.entity} className="text-[12px] hover:bg-slate-50/60">
            <TableCell className="font-medium text-slate-900">{e.entity}</TableCell>
            <TableCell className="tabular text-right">
              <Tag tone={e.composite > 70 ? "negative" : e.composite > 55 ? "warning" : "positive"}>
                {e.composite}
              </Tag>
            </TableCell>
            {pillars.map((p) => {
              const v = e[p];
              const tone =
                v > 70 ? "bg-rose-100 text-rose-800" :
                v > 50 ? "bg-amber-100 text-amber-800" :
                "bg-emerald-100 text-emerald-800";
              return (
                <TableCell key={p} className="text-center">
                  <span className={cn("tabular inline-flex h-7 w-9 items-center justify-center rounded text-[11px] font-semibold", tone)}>
                    {v}
                  </span>
                </TableCell>
              );
            })}
            <TableCell className="tabular text-right text-slate-700">{e.events}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function RiskOverview(_: SectionComponentProps) {
  const avgScore = Math.round(pillarBreakdown.reduce((s, p) => s + p.score, 0) / pillarBreakdown.length);
  const highest = [...pillarBreakdown].sort((a, b) => b.score - a.score)[0];
  const lowest = [...pillarBreakdown].sort((a, b) => a.score - b.score)[0];
  const trendingUp = pillarBreakdown.filter((p) => p.delta > 0).length;
  const totalEvents = pillarBreakdown.reduce((s, p) => s + p.events, 0);
  const totalArticles = pillarBreakdown.reduce((s, p) => s + p.articles, 0);

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="risk-overview"
        accountType="admin"
        accent="violet"
        statusChips={
          <>
            <StatusChip label={`Avg ${avgScore}`} tone={avgScore > 65 ? "negative" : "warning"} icon={Gauge} />
            <StatusChip label={`${highest.pillar} highest`} tone="negative" icon={ShieldAlert} />
            <StatusChip label={`${trendingUp} pillars ↑`} tone="warning" icon={TrendingUp} />
          </>
        }
        kpis={
          <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatTile label="Avg Pillar Score" value={`${avgScore}`} hint="Across 6 pillars" icon={Gauge} accent={avgScore > 65 ? "rose" : "slate"} />
            <StatTile label="Highest Pillar" value={highest.pillar} delta={`${highest.score}`} deltaTone="negative" hint={`+${highest.delta.toFixed(1)} pts · 30d`} icon={ShieldAlert} accent="rose" />
            <StatTile label="Lowest Pillar" value={lowest.pillar} delta={`${lowest.score}`} deltaTone="positive" hint={`${lowest.delta >= 0 ? "+" : ""}${lowest.delta.toFixed(1)} pts · 30d`} icon={TrendingUp} accent="emerald" />
            <StatTile label="Pillars Trending ↑" value={`${trendingUp}`} hint="Of 6 pillars · 30d" icon={ArrowUp} accent="amber" />
            <StatTile label="Total Events" value={`${totalEvents}`} hint="Materialised · 30d" icon={Layers} accent="slate" />
            <StatTile label="Total Articles" value={totalArticles.toLocaleString()} hint="Ingested · 30d" icon={TrendingUp} accent="slate" />
          </StaggerGrid>
        }
      />

      {/* Pillar bars + radar */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <PanelCard>
          <PanelHeader
            title="Pillar Breakdown"
            subtitle="6-pillar exposure · score + 30d delta + event count"
            icon={Layers}
            accent="slate"
            action={<span className="text-[10px] uppercase tracking-wide text-slate-500">0–100</span>}
          />
          <div className="p-4">
            <PillarBars />
          </div>
        </PanelCard>
        <ChartCard
          title="Pillar Radar"
          subtitle="Symmetric exposure across pillars"
        >
          <PillarRadarChart />
        </ChartCard>
      </div>

      {/* 12-month pillar trend */}
      <ChartCard
        title="Pillar Trend — 12 months"
        subtitle="Monthly exposure scores by pillar"
        action={
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wide">
            {pillars.map((p) => (
              <span key={p} className="inline-flex items-center gap-1" style={{ color: pillarColor[p] }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: pillarColor[p] }} />
                {p}
              </span>
            ))}
          </div>
        }
      >
        <PillarTrendChart />
      </ChartCard>

      {/* Top risk entities */}
      <PanelCard>
        <PanelHeader
          title="Top Risk Entities"
          subtitle="Composite + per-pillar scores · heatmap"
          icon={ShieldAlert}
          accent="slate"
          action={<span className="text-[10px] uppercase tracking-wide text-slate-500">{topRiskEntities.length} entities</span>}
        />
        <div className="max-h-[480px] overflow-y-auto harch-scroll p-0">
          <TopRiskEntitiesTable />
        </div>
      </PanelCard>
    </div>
  );
}
