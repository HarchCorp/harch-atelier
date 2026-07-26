"use client";

/**
 * Comms Overview — Reputation Command Center (V18.0 figma rework)
 *
 * Showcase section for the PR role. Premium composition:
 *  - 6 StatTile KPIs (rose accent) with 320ms mount skeleton
 *  - Reputation MetricRing (auto-tone) + 30-day trend area (rose gradient)
 *  - SoV donut (HarchCorp = rose) + 30-day coverage stacked area
 *  - Stakeholder sentiment stacked bars (emerald / slate / rose)
 *  - Emerging topics table (sentiment Tag + TrendingUp/Down delta)
 */
import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Hash,
  Megaphone,
  Newspaper,
  Smile,
  Star,
  TrendingDown,
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
import { DeferredChart } from "@/components/dataviz/chart-skeleton";
import { SectionHeader, StatusChip } from "../section-header";
import {
  PanelCard,
  PanelHeader,
  StatTile,
  MetricRing,
  Tag,
  StaggerGrid,
  type RoleAccent,
} from "../design-system";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  commsOverview,
  coverageVolume30d,
  emergingTopics,
  reputationTrend30d,
  sentimentTint,
  sovDistribution,
  stakeholderSentiment,
  type EmergingTopic,
} from "@/lib/comms-data";
import { cn } from "@/lib/utils";
import {
  KpiSkeletonGrid,
  PanelSkeletons,
  PR,
  PremiumTooltip,
  useMountReady,
} from "./_shared";

/* ------------------------------------------------------------------ */
/*  SoV donut (HarchCorp tinted rose)                                  */
/* ------------------------------------------------------------------ */

const sovColors = ["#e11d48", "#0ea5e9", "#a855f7", "#10b981", "#f59e0b", "#64748b", "#94a3b8"];

function SovDonut() {
  const total = sovDistribution.reduce((s, x) => s + x.value, 0);
  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sovDistribution}
              dataKey="value"
              nameKey="name"
              innerRadius={56}
              outerRadius={88}
              paddingAngle={2}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {sovDistribution.map((s, i) => (
                <Cell key={s.name} fill={sovColors[i % sovColors.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0];
                const pct = Math.round((Number(p.value) / total) * 1000) / 10;
                return (
                  <PremiumTooltip
                    header={String(p.name)}
                    rows={[
                      { label: "Mentions", value: Number(p.value).toLocaleString() },
                      { label: "Share", value: `${pct}%`, tone: "rose" },
                    ]}
                  />
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[9px] uppercase tracking-wide text-slate-400">Total</span>
          <span className="tabular text-[20px] font-bold text-slate-900">
            {total.toLocaleString()}
          </span>
          <span className="text-[9px] uppercase tracking-wide text-slate-400">mentions</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {sovDistribution.map((s, i) => {
          const isTarget = s.name === "HarchCorp";
          return (
            <div
              key={s.name}
              className={cn(
                "flex items-center justify-between rounded-md px-2 py-1.5 ring-1",
                isTarget ? "bg-rose-50 ring-rose-200" : "bg-slate-50 ring-slate-100",
              )}
            >
              <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-slate-600">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: sovColors[i % sovColors.length] }}
                />
                <span className="truncate">{s.name}</span>
              </span>
              <span
                className={cn(
                  "tabular text-[11px] font-bold",
                  isTarget ? "text-rose-700" : "text-slate-800",
                )}
              >
                {Math.round((s.value / total) * 1000) / 10}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reputation 30d trend area (rose gradient)                          */
/* ------------------------------------------------------------------ */

function ReputationTrendArea() {
  return (
    <DeferredChart height="h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={reputationTrend30d} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="repTrend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e11d48" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#e11d48" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
            minTickGap={20}
          />
          <YAxis
            domain={[40, 90]}
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              const idx = Number(payload.find((p) => p.dataKey === "index")?.value ?? 0);
              const sen = Number(payload.find((p) => p.dataKey === "sentiment")?.value ?? 0);
              return (
                <PremiumTooltip
                  header={label}
                  rows={[
                    { label: "Index", value: `${idx}`, tone: idx >= 60 ? "emerald" : "amber" },
                    {
                      label: "Net sentiment",
                      value: `${sen >= 0 ? "+" : ""}${sen}`,
                      tone: sen >= 0 ? "emerald" : "rose",
                    },
                  ]}
                />
              );
            }}
          />
          <Area type="monotone" dataKey="index" stroke="#e11d48" strokeWidth={2.2} fill="url(#repTrend)" />
        </AreaChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Coverage volume 30d stacked area                                   */
/* ------------------------------------------------------------------ */

function CoverageArea() {
  return (
    <DeferredChart height="h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={coverageVolume30d} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cvPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="cvNeu" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="cvNeg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
            minTickGap={20}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={28}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              const pos = Number(payload.find((p) => p.dataKey === "positive")?.value ?? 0);
              const neu = Number(payload.find((p) => p.dataKey === "neutral")?.value ?? 0);
              const neg = Number(payload.find((p) => p.dataKey === "negative")?.value ?? 0);
              return (
                <PremiumTooltip
                  header={label}
                  rows={[
                    { label: "Positive", value: `${pos}`, tone: "emerald", dot: "#10b981" },
                    { label: "Neutral", value: `${neu}`, tone: "slate", dot: "#94a3b8" },
                    { label: "Negative", value: `${neg}`, tone: "rose", dot: "#f43f5e" },
                    { label: "Total", value: `${pos + neu + neg}`, tone: "default" },
                  ]}
                />
              );
            }}
          />
          <Area type="monotone" dataKey="positive" stackId="1" stroke="#10b981" strokeWidth={1.4} fill="url(#cvPos)" />
          <Area type="monotone" dataKey="neutral" stackId="1" stroke="#94a3b8" strokeWidth={1.2} fill="url(#cvNeu)" />
          <Area type="monotone" dataKey="negative" stackId="1" stroke="#f43f5e" strokeWidth={1.4} fill="url(#cvNeg)" />
        </AreaChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Stakeholder sentiment stacked bars                                 */
/* ------------------------------------------------------------------ */

function StakeholderStacked() {
  return (
    <div className="flex flex-col gap-2.5">
      {stakeholderSentiment.map((s) => (
        <div key={s.stakeholder} className="grid grid-cols-[100px_1fr] items-center gap-3">
          <span className="truncate text-[11px] font-medium text-slate-700">{s.stakeholder}</span>
          <div className="flex h-5 overflow-hidden rounded-md bg-slate-50 ring-1 ring-slate-200">
            <div
              className="flex items-center justify-center bg-emerald-500 text-[9px] font-bold text-white transition-all"
              style={{ width: `${s.positive}%` }}
              title={`${s.positive}% positive`}
            >
              {s.positive >= 14 ? `${s.positive}` : ""}
            </div>
            <div
              className="flex items-center justify-center bg-slate-300 text-[9px] font-bold text-slate-800 transition-all"
              style={{ width: `${s.neutral}%` }}
              title={`${s.neutral}% neutral`}
            >
              {s.neutral >= 14 ? `${s.neutral}` : ""}
            </div>
            <div
              className="flex items-center justify-center bg-rose-500 text-[9px] font-bold text-white transition-all"
              style={{ width: `${s.negative}%` }}
              title={`${s.negative}% negative`}
            >
              {s.negative >= 14 ? `${s.negative}` : ""}
            </div>
          </div>
        </div>
      ))}
      <div className="mt-2 flex items-center gap-4 text-[10px] font-semibold uppercase tracking-wide">
        <span className="inline-flex items-center gap-1.5 text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Positive
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" /> Neutral
        </span>
        <span className="inline-flex items-center gap-1.5 text-rose-700">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Negative
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function CommsOverview(_: SectionComponentProps) {
  const ready = useMountReady(320);

  const repTone = commsOverview.reputationScore > 75 ? "emerald" : commsOverview.reputationScore > 55 ? "amber" : "rose";
  const repVerdict = commsOverview.reputationScore > 75 ? "Strong" : commsOverview.reputationScore > 55 ? "Stable" : "At risk";

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="comms-overview"
        accountType="pr"
        accent="rose"
        statusChips={
          <>
            <StatusChip label={`Rep ${commsOverview.reputationScore}`} tone={commsOverview.reputationScore > 60 ? "positive" : "warning"} icon={Star} />
            <StatusChip label={`SoV ${commsOverview.sovHarch}%`} tone="positive" icon={Megaphone} />
            <StatusChip label={`${commsOverview.activeCampaigns} active campaigns`} tone="neutral" icon={Activity} />
            <StatusChip label="Live" tone="positive" icon={Activity} pulse />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile
                label="Reputation Index"
                value={`${commsOverview.reputationScore}`}
                delta={`${commsOverview.reputationDelta >= 0 ? "+" : ""}${commsOverview.reputationDelta.toFixed(1)}`}
                deltaTone={commsOverview.reputationDelta >= 0 ? "positive" : "negative"}
                hint="30-day rolling · 0–100"
                icon={Star}
                accent={PR}
              />
              <StatTile
                label="Net Sentiment"
                value={`${commsOverview.netSentiment >= 0 ? "+" : ""}${commsOverview.netSentiment}`}
                hint="Pos% − Neg% (30d)"
                icon={Smile}
                accent={PR}
              />
              <StatTile
                label="Share of Voice"
                value={`${commsOverview.sovHarch}%`}
                delta={`${commsOverview.sovDelta >= 0 ? "+" : ""}${commsOverview.sovDelta.toFixed(1)}pp`}
                deltaTone={commsOverview.sovDelta >= 0 ? "positive" : "negative"}
                hint="HarchCorp · rank #1"
                icon={Megaphone}
                accent={PR}
              />
              <StatTile
                label="Coverage (30d)"
                value={commsOverview.coverage30d.toLocaleString()}
                hint="Articles tracked"
                icon={Newspaper}
                accent={PR}
              />
              <StatTile
                label="Active Campaigns"
                value={`${commsOverview.activeCampaigns}`}
                hint="Press · social · events"
                icon={Activity}
                accent={PR}
              />
              <StatTile
                label="Social Mentions"
                value={commsOverview.socialMentions.toLocaleString()}
                hint={`Reach ${(commsOverview.socialReach / 1_000_000).toFixed(1)}M`}
                icon={Hash}
                accent={PR}
              />
            </StaggerGrid>
          ) : (
            <KpiSkeletonGrid />
          )
        }
      />

      {ready ? (
        <>
          {/* Reputation gauge + 30d trend */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <PanelCard accent={PR} delay={0.05}>
              <PanelHeader
                title="Reputation Score"
                subtitle="Composite · 30-day rolling"
                icon={Star}
                accent={PR}
                action={<Tag tone={repTone as "emerald" | "amber" | "rose"}>{repVerdict}</Tag>}
              />
              <div className="flex flex-col items-center justify-center gap-3 px-4 py-6">
                <MetricRing
                  value={commsOverview.reputationScore}
                  size={180}
                  stroke={14}
                  tone={repTone as "emerald" | "amber" | "rose"}
                  label="Reputation"
                  sublabel="0–100"
                />
                <div className="flex items-center gap-3 text-[10px] uppercase tracking-wide text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 75+
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> 55–74
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> &lt;55
                  </span>
                </div>
              </div>
            </PanelCard>

            <PanelCard accent={PR} className="xl:col-span-2" delay={0.1}>
              <PanelHeader
                title="Reputation Trend — 30 days"
                subtitle="Daily net reputation index"
                icon={Activity}
                accent={PR}
                action={
                  <Tag tone="rose" icon={TrendingUp}>
                    Δ {commsOverview.reputationDelta >= 0 ? "+" : ""}
                    {commsOverview.reputationDelta.toFixed(1)}
                  </Tag>
                }
              />
              <div className="p-4">
                <ReputationTrendArea />
              </div>
            </PanelCard>
          </div>

          {/* SoV donut + coverage area */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <PanelCard accent={PR} delay={0.15}>
              <PanelHeader
                title="Share of Voice"
                subtitle="HarchCorp vs competitors · 30d"
                icon={Megaphone}
                accent={PR}
              />
              <div className="p-4">
                <SovDonut />
              </div>
            </PanelCard>

            <PanelCard accent={PR} className="xl:col-span-2" delay={0.2}>
              <PanelHeader
                title="Coverage Volume — 30 days"
                subtitle="Positive / neutral / negative split"
                icon={Newspaper}
                accent={PR}
                action={
                  <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wide">
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Pos
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" /> Neu
                    </span>
                    <span className="inline-flex items-center gap-1 text-rose-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Neg
                    </span>
                  </div>
                }
              />
              <div className="p-4">
                <CoverageArea />
              </div>
            </PanelCard>
          </div>

          {/* Stakeholder sentiment + emerging topics */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <PanelCard accent={PR} delay={0.25}>
              <PanelHeader
                title="Stakeholder Sentiment"
                subtitle="Positive / neutral / negative breakdown"
                icon={Smile}
                accent={PR}
              />
              <div className="p-4">
                <StakeholderStacked />
              </div>
            </PanelCard>

            <PanelCard accent={PR} delay={0.3}>
              <PanelHeader
                title="Emerging Topics — Top 5"
                subtitle="Volume surge vs prior 7 days"
                icon={Hash}
                accent={PR}
                action={<Tag tone="rose">{emergingTopics.length} topics</Tag>}
              />
              <div className="harch-scroll max-h-[340px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-white">
                    <TableRow className="text-[10px] uppercase tracking-wide text-slate-500">
                      <TableHead>Topic</TableHead>
                      <TableHead className="text-right">Volume 7d</TableHead>
                      <TableHead className="text-right">Δ vs prior</TableHead>
                      <TableHead>Sentiment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emergingTopics.map((t: EmergingTopic) => {
                      const tint = sentimentTint[t.sentiment];
                      const isUp = t.delta > 0;
                      return (
                        <TableRow key={t.id} className="text-[12px] transition-colors hover:bg-slate-50">
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="truncate text-slate-700" title={t.topic}>
                                {t.topic}
                              </span>
                              <span className="text-[10px] uppercase tracking-wide text-slate-400">{t.pillar}</span>
                            </div>
                          </TableCell>
                          <TableCell className="tabular text-right text-slate-700">
                            {t.volume7d.toLocaleString()}
                          </TableCell>
                          <TableCell className="tabular text-right">
                            <Tag tone={isUp ? "positive" : "negative"} icon={isUp ? TrendingUp : TrendingDown} size="xs">
                              {isUp ? "+" : ""}
                              {t.delta}%
                            </Tag>
                          </TableCell>
                          <TableCell>
                            <Tag
                              tone={
                                t.sentiment === "positive"
                                  ? "positive"
                                  : t.sentiment === "negative"
                                    ? "negative"
                                    : "neutral"
                              }
                              size="xs"
                            >
                              <span className={cn("h-1.5 w-1.5 rounded-full", tint.dot)} />
                              {t.sentiment}
                            </Tag>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </PanelCard>
          </div>
        </>
      ) : (
        <PanelSkeletons count={3} className="xl:grid-cols-2" />
      )}
    </div>
  );
}
