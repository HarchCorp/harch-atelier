"use client";

/**
 * Comms Campaigns — Figma-grade rework (V18.0)
 *
 * Composition:
 *  - 6 StatTile KPIs (rose accent) with 320ms mount skeleton
 *  - Campaign cards grid (PanelCard per campaign, channel color + status Tag + ProgressBar)
 *  - Reach vs cost bars (per campaign)
 *  - ROI scatter (cost x engagement, bubble = sentiment lift, color = +/-)
 *  - 120-day Gantt timeline (Today marker, status-tinted bars)
 */
import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import {
  Activity,
  CalendarClock,
  Coins,
  Mail,
  Megaphone,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { DeferredChart } from "@/components/dataviz/chart-skeleton";
import { SectionHeader, StatusChip } from "../section-header";
import {
  PanelCard,
  PanelHeader,
  StatTile,
  Tag,
  ProgressBar,
  StaggerGrid,
} from "../design-system";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  campaignChannelColor,
  campaignRoi,
  campaignStatusTint,
  campaignTimeline,
  campaigns,
  campaignsSummary,
  formatCompact,
  formatUSD,
  type Campaign,
  type CampaignChannel,
  type CampaignStatus,
} from "@/lib/comms-data";
import { cn } from "@/lib/utils";
import {
  KpiSkeletonGrid,
  PanelSkeletons,
  PR,
  PremiumTooltip,
  useMountReady,
} from "./_shared";

const channelLabels: Record<CampaignChannel, string> = {
  press: "Press",
  social: "Social",
  events: "Events",
  digital: "Digital",
  investor: "Investor",
  internal: "Internal",
};

const statusTone: Record<CampaignStatus, "positive" | "info" | "neutral" | "warning"> = {
  active: "positive",
  scheduled: "info",
  completed: "neutral",
  paused: "warning",
};

const statusColor: Record<CampaignStatus, string> = {
  active: "#10b981",
  scheduled: "#0ea5e9",
  completed: "#94a3b8",
  paused: "#f59e0b",
};

/* ------------------------------------------------------------------ */
/*  Campaign card (premium)                                            */
/* ------------------------------------------------------------------ */

function CampaignCard({ c, delay }: { c: Campaign; delay: number }) {
  const roi = campaignRoi(c);
  const progressPct = c.duration > 0 ? Math.min(100, Math.round((c.daysElapsed / c.duration) * 100)) : 0;
  const isUpSent = c.sentimentLift >= 0;
  const isUpSov = c.sovLift >= 0;
  const channelColor = campaignChannelColor[c.channel];
  return (
    <PanelCard accent={PR} delay={delay} className="p-0">
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white"
              style={{ background: channelColor }}
            >
              <Mail className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h4 className="truncate text-[12px] font-semibold text-slate-900" title={c.name}>
                {c.name}
              </h4>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span className="uppercase tracking-wide">{channelLabels[c.channel]}</span>
                <span>·</span>
                <span className="tabular">{c.id}</span>
              </div>
            </div>
          </div>
          <Tag tone={statusTone[c.status]} size="xs" icon={c.status === "active" ? Activity : CalendarClock}>
            {c.status}
          </Tag>
        </div>

        {/* Progress */}
        {c.status === "active" || c.status === "scheduled" ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-slate-500">
              <span>Progress · {c.daysElapsed}d elapsed</span>
              <span className="tabular font-semibold text-slate-700">{progressPct}%</span>
            </div>
            <ProgressBar
              value={progressPct}
              tone={c.status === "active" ? "emerald" : "sky"}
              height={5}
              threshold={50}
            />
          </div>
        ) : (
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-slate-500">
            <span>Duration · {c.duration}d</span>
            <span>{c.status === "completed" ? "Completed" : "Paused"}</span>
          </div>
        )}

        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-lg bg-slate-50 px-2 py-1.5 ring-1 ring-slate-100">
            <div className="card-title">Reach</div>
            <div className="tabular text-[14px] font-bold text-slate-900">{formatCompact(c.reach)}</div>
          </div>
          <div className="rounded-lg bg-slate-50 px-2 py-1.5 ring-1 ring-slate-100">
            <div className="card-title">Engagement</div>
            <div className="tabular text-[14px] font-bold text-slate-900">{formatCompact(c.engagement)}</div>
          </div>
          <div className="rounded-lg bg-slate-50 px-2 py-1.5 ring-1 ring-slate-100">
            <div className="card-title">Sentiment lift</div>
            <div
              className={cn(
                "tabular text-[14px] font-bold",
                isUpSent ? "text-emerald-700" : "text-rose-700",
              )}
            >
              {isUpSent ? "+" : ""}
              {c.sentimentLift}pp
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 px-2 py-1.5 ring-1 ring-slate-100">
            <div className="card-title">SoV lift</div>
            <div
              className={cn(
                "tabular text-[14px] font-bold",
                isUpSov ? "text-emerald-700" : c.sovLift === 0 ? "text-slate-700" : "text-rose-700",
              )}
            >
              {isUpSov ? "+" : ""}
              {c.sovLift}pp
            </div>
          </div>
        </div>

        {/* Cost + ROI */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Wallet className="h-3 w-3" />
            <span className="tabular font-semibold text-slate-700">{formatUSD(c.cost)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wide text-slate-500">ROI</span>
            <Tag
              tone={roi >= 1 ? "positive" : roi > 0 ? "warning" : "neutral"}
              size="xs"
            >
              {roi.toFixed(2)}×
            </Tag>
          </div>
        </div>
      </div>
    </PanelCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Reach vs cost bars                                                 */
/* ------------------------------------------------------------------ */

function ReachVsCostBars() {
  const data = campaigns
    .filter((c) => c.cost > 0)
    .map((c) => ({
      id: c.id,
      name: c.name.length > 28 ? c.name.slice(0, 26) + "…" : c.name,
      reach: Math.round(c.reach / 1_000_000),
      cost: Math.round(c.cost / 1_000),
    }));
  return (
    <DeferredChart height="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 12, left: 8, bottom: 0 }} barCategoryGap="22%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 9, fill: "#475569" }}
            axisLine={false}
            tickLine={false}
            width={170}
          />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              const reach = Number(payload.find((p) => p.dataKey === "reach")?.value ?? 0);
              const cost = Number(payload.find((p) => p.dataKey === "cost")?.value ?? 0);
              return (
                <PremiumTooltip
                  header={label}
                  rows={[
                    { label: "Reach", value: `${reach}M impressions`, tone: "rose" },
                    { label: "Cost", value: formatUSD(cost * 1000), tone: "slate" },
                  ]}
                />
              );
            }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 10, paddingTop: 6 }}
            formatter={(value) => (
              <span className="text-[10px] text-slate-600">
                {value === "reach" ? "Reach (M)" : "Cost ($k)"}
              </span>
            )}
          />
          <Bar dataKey="reach" fill="#e11d48" barSize={10} name="reach" radius={[0, 3, 3, 0]} />
          <Bar dataKey="cost" fill="#94a3b8" barSize={10} name="cost" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  ROI scatter — cost vs engagement, bubble = sentiment lift          */
/* ------------------------------------------------------------------ */

function RoiScatter() {
  const data = campaigns
    .filter((c) => c.cost > 0)
    .map((c) => ({
      id: c.id,
      name: c.name,
      x: c.cost / 1000,
      y: c.engagement / 1000,
      z: Math.max(8, Math.abs(c.sentimentLift) * 4),
      sentimentLift: c.sentimentLift,
      roi: campaignRoi(c),
      channel: c.channel,
    }));
  return (
    <DeferredChart height="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            type="number"
            dataKey="x"
            name="Cost"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
            label={{ value: "Cost ($k)", position: "insideBottom", offset: -4, style: { fontSize: 10, fill: "#64748b" } }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Engagement"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={36}
            label={{ value: "Engagement (k)", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "#64748b" } }}
          />
          <ZAxis type="number" dataKey="z" range={[40, 320]} name="Sentiment lift" />
          <Tooltip
            cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as {
                name: string;
                x: number;
                y: number;
                sentimentLift: number;
                roi: number;
                channel: CampaignChannel;
              };
              return (
                <PremiumTooltip
                  header={p.name}
                  rows={[
                    { label: "Cost", value: formatUSD(p.x * 1000), tone: "slate" },
                    { label: "Engagement", value: `${p.y.toFixed(1)}k`, tone: "default" },
                    {
                      label: "Sentiment lift",
                      value: `${p.sentimentLift >= 0 ? "+" : ""}${p.sentimentLift}pp`,
                      tone: p.sentimentLift >= 0 ? "emerald" : "rose",
                    },
                    { label: "ROI", value: `${p.roi.toFixed(2)}×`, tone: p.roi >= 1 ? "emerald" : "amber" },
                    { label: "Channel", value: channelLabels[p.channel], tone: "default" },
                  ]}
                />
              );
            }}
          />
          <Scatter data={data} fill="#e11d48" fillOpacity={0.6}>
            {data.map((d) => (
              <Cell key={d.id} fill={d.sentimentLift >= 0 ? "#10b981" : "#f43f5e"} fillOpacity={0.7} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Campaign timeline (Gantt-style, 120-day window)                    */
/* ------------------------------------------------------------------ */

function CampaignTimeline() {
  const winMin = -45;
  const winMax = 75;
  const span = winMax - winMin;
  return (
    <div className="flex flex-col gap-2.5">
      {/* Day ruler */}
      <div className="relative h-5 border-b border-slate-100">
        {[-30, 0, 30, 60].map((d) => {
          const left = ((d - winMin) / span) * 100;
          return (
            <div
              key={d}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${left}%`, transform: "translateX(-50%)" }}
            >
              <span className="text-[9px] uppercase tracking-wide text-slate-400">
                {d === 0 ? "Today" : d > 0 ? `+${d}d` : `${d}d`}
              </span>
            </div>
          );
        })}
        <div
          className="absolute top-0 bottom-0 border-l border-rose-400"
          style={{ left: `${((0 - winMin) / span) * 100}%` }}
        />
      </div>
      {/* Bars */}
      <div className="flex flex-col gap-2">
        {campaignTimeline.map((p) => {
          const startLeft = ((p.startDay - winMin) / span) * 100;
          const width = (p.duration / span) * 100;
          const color = statusColor[p.status];
          return (
            <div key={p.phase} className="grid grid-cols-[160px_1fr] items-center gap-3">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[11px] font-medium text-slate-700" title={p.phase}>
                  {p.phase}
                </span>
                <span className="text-[10px] text-slate-400">{p.campaign}</span>
              </div>
              <div className="relative h-6 rounded bg-slate-50 ring-1 ring-slate-200">
                <div
                  className="absolute top-0 h-full rounded ring-1 transition-all"
                  style={{
                    left: `${Math.max(0, startLeft)}%`,
                    width: `${Math.min(100, width)}%`,
                    background: color,
                    borderColor: color,
                  }}
                  title={`${p.phase} · ${p.duration}d · ${p.status}`}
                >
                  <span className="absolute inset-0 flex items-center justify-center px-2 text-[10px] font-semibold uppercase tracking-wide text-white">
                    {p.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-4 text-[10px] font-semibold uppercase tracking-wide">
        <span className="inline-flex items-center gap-1.5 text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
        </span>
        <span className="inline-flex items-center gap-1.5 text-sky-700">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500" /> Scheduled
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Completed
        </span>
        <span className="inline-flex items-center gap-1.5 text-rose-700">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> Today
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function CommsCampaigns(_: SectionComponentProps) {
  const ready = useMountReady(320);

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="comms-campaigns"
        accountType="pr"
        accent="rose"
        statusChips={
          <>
            <StatusChip label={`${campaignsSummary.active} active`} tone="positive" icon={Activity} pulse />
            <StatusChip label={`${campaignsSummary.scheduled} scheduled`} tone="neutral" icon={CalendarClock} />
            <StatusChip label={`Avg ROI ${campaignsSummary.avgRoi.toFixed(2)}×`} tone="positive" icon={TrendingUp} />
            <StatusChip label={`Total ${formatUSD(campaignsSummary.totalCost)}`} tone="neutral" icon={Coins} />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile
                label="Active Campaigns"
                value={`${campaignsSummary.active}`}
                hint="Press · social · events · digital"
                icon={Activity}
                accent={PR}
              />
              <StatTile
                label="Scheduled"
                value={`${campaignsSummary.scheduled}`}
                hint="Upcoming launches"
                icon={CalendarClock}
                accent={PR}
              />
              <StatTile
                label="Total Reach"
                value={`${(campaignsSummary.totalReach / 1_000_000).toFixed(1)}M`}
                hint="Aggregate impressions"
                icon={Megaphone}
                accent={PR}
              />
              <StatTile
                label="Total Engagement"
                value={formatCompact(campaignsSummary.totalEngagement)}
                hint="Likes · shares · comments"
                icon={Activity}
                accent={PR}
              />
              <StatTile
                label="Total Spend"
                value={formatUSD(campaignsSummary.totalCost)}
                hint="Across all campaigns"
                icon={Wallet}
                accent={PR}
              />
              <StatTile
                label="Avg ROI"
                value={`${campaignsSummary.avgRoi.toFixed(2)}×`}
                delta={`${campaignsSummary.avgSentimentLift >= 0 ? "+" : ""}${campaignsSummary.avgSentimentLift}pp`}
                deltaTone={campaignsSummary.avgSentimentLift >= 0 ? "positive" : "negative"}
                hint="Benefit / cost ratio"
                icon={TrendingUp}
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
          {/* Campaign cards grid */}
          <PanelCard accent={PR} delay={0.05}>
            <PanelHeader
              title="Active + Recent Campaigns"
              subtitle="Performance per campaign · reach, engagement, sentiment lift, SoV lift, ROI"
              icon={Megaphone}
              accent={PR}
              action={<Tag tone="rose">{campaigns.length} campaigns tracked</Tag>}
            />
            <div className="p-4">
              <StaggerGrid className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {campaigns.map((c, i) => (
                  <CampaignCard key={c.id} c={c} delay={0.1 + i * 0.05} />
                ))}
              </StaggerGrid>
            </div>
          </PanelCard>

          {/* Reach vs cost + ROI scatter */}
          <StaggerGrid className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <PanelCard accent={PR} delay={0.15}>
              <PanelHeader
                title="Reach vs Cost"
                subtitle="Per campaign · impressions vs spend"
                icon={Megaphone}
                accent={PR}
                action={
                  <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wide">
                    <span className="inline-flex items-center gap-1 text-rose-700">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#e11d48" }} /> Reach
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Cost
                    </span>
                  </div>
                }
              />
              <div className="p-4">
                <ReachVsCostBars />
              </div>
            </PanelCard>
            <PanelCard accent={PR} delay={0.2}>
              <PanelHeader
                title="ROI Scatter"
                subtitle="Cost (x) vs engagement (y) · bubble size = sentiment lift"
                icon={Activity}
                accent={PR}
                action={
                  <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wide">
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> +Sentiment
                    </span>
                    <span className="inline-flex items-center gap-1 text-rose-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> −Sentiment
                    </span>
                  </div>
                }
              />
              <div className="p-4">
                <RoiScatter />
              </div>
            </PanelCard>
          </StaggerGrid>

          {/* Timeline */}
          <PanelCard accent={PR} delay={0.25}>
            <PanelHeader
              title="Campaign Timeline"
              subtitle="120-day Gantt view · past, current, scheduled"
              icon={CalendarClock}
              accent={PR}
              action={
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> Today
                </span>
              }
            />
            <div className="p-4">
              <CampaignTimeline />
            </div>
          </PanelCard>
        </>
      ) : (
        <PanelSkeletons count={3} />
      )}
    </div>
  );
}
