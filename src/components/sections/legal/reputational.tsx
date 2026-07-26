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
import {
  AlertTriangle,
  Megaphone,
  Star,
  ThumbsDown,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  Users,
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
  Tag,
  StaggerGrid,
  MetricRing,
  ProgressBar,
  motionVariants,
} from "../design-system";
import { motion } from "framer-motion";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  executiveReps,
  formatDate,
  relativeTime,
  reputationControversies,
  reputationIndex,
  reputationSummary,
  stakeholderSentiment,
} from "@/lib/legal-data";
import { cn } from "@/lib/utils";
import { KpiSkeletonGrid, PanelSkeletons, PremiumTooltip, useMountReady } from "./_shared";

/* ------------------------------------------------------------------ */
/*  Reputation index gauge (premium MetricRing)                        */
/* ------------------------------------------------------------------ */

function ReputationGauge() {
  const score = reputationSummary.current;
  const verdict = score > 75 ? "Strong" : score > 55 ? "Stable" : "At Risk";
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <MetricRing value={score} size={172} stroke={11} sublabel="Index" />
      <div className="flex flex-col items-center gap-1 text-center">
        <span
          className={cn(
            "text-[12px] font-bold uppercase tracking-wider",
            score > 75 ? "text-emerald-700" : score > 55 ? "text-amber-700" : "text-rose-700",
          )}
        >
          {verdict}
        </span>
        <span className="text-[10px] uppercase tracking-wide text-slate-400">30-day rolling · 0–100</span>
      </div>
      <div className="grid w-full grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-center">
        <div>
          <div className="tabular text-[13px] font-bold text-emerald-700">
            {reputationSummary.delta30d >= 0 ? "+" : ""}{reputationSummary.delta30d.toFixed(1)}
          </div>
          <div className="text-[9px] uppercase tracking-wide text-slate-400">30d delta</div>
        </div>
        <div>
          <div className="tabular text-[13px] font-bold text-rose-700">
            {reputationIndex.delta90d >= 0 ? "+" : ""}{reputationIndex.delta90d.toFixed(1)}
          </div>
          <div className="text-[9px] uppercase tracking-wide text-slate-400">90d delta</div>
        </div>
      </div>
    </div>
  );
}

function ReputationTrend() {
  return (
    <DeferredChart height="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={reputationIndex.trend} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} minTickGap={20} />
          <YAxis domain={[40, 90]} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={28} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              const idx = Number(payload.find((p) => p.dataKey === "index")?.value ?? 0);
              const sen = Number(payload.find((p) => p.dataKey === "sentiment")?.value ?? 0);
              return (
                <PremiumTooltip
                  header={label}
                  rows={[
                    { label: "Index", value: `${idx}`, tone: "violet" },
                    { label: "Net sentiment", value: `${sen >= 0 ? "+" : ""}${sen}`, tone: sen >= 0 ? "emerald" : "rose" },
                  ]}
                />
              );
            }}
          />
          <Line type="monotone" dataKey="index" stroke="#7c3aed" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Index" />
        </LineChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Executive reputation cards                                         */
/* ------------------------------------------------------------------ */

function ExecutiveCards() {
  return (
    <StaggerGrid className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {executiveReps.map((e) => {
        const isUp = e.delta > 0;
        const ringTone = e.sentiment > 70 ? "emerald" : e.sentiment > 55 ? "amber" : "rose";
        return (
          <motion.div key={e.name} variants={motionVariants.item}>
            <PanelCard accent="violet" className="h-full p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-700 ring-1 ring-violet-200">
                    {e.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-slate-900">{e.name}</span>
                    <span className="text-[10px] text-slate-500">{e.title}</span>
                  </div>
                </div>
                <Tag tone={isUp ? "positive" : "negative"} size="xs" icon={isUp ? TrendingUp : TrendingDown}>
                  {isUp ? "+" : ""}{e.delta.toFixed(1)}
                </Tag>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <MetricRing value={e.sentiment} size={52} stroke={6} tone={ringTone} />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500">
                    <span>Sentiment</span>
                    <span className="tabular font-bold text-slate-700">{e.sentiment}</span>
                  </div>
                  <div className="mt-1.5">
                    <ProgressBar
                      value={e.sentiment}
                      tone={ringTone === "rose" ? "rose" : ringTone === "amber" ? "amber" : "emerald"}
                      height={5}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Megaphone className="h-3 w-3" /> <span className="tabular">{e.mentions}</span> mentions
                </span>
                <span className="inline-flex items-center gap-1 text-rose-700">
                  <ThumbsDown className="h-3 w-3" /> <span className="tabular">{e.negative}%</span> neg
                </span>
              </div>
            </PanelCard>
          </motion.div>
        );
      })}
    </StaggerGrid>
  );
}

/* ------------------------------------------------------------------ */
/*  Stakeholder sentiment — horizontal stacked bars (manual)           */
/* ------------------------------------------------------------------ */

function StakeholderStacked() {
  return (
    <div className="flex flex-col gap-3">
      {stakeholderSentiment.map((s) => (
        <div key={s.stakeholder} className="grid grid-cols-[110px_1fr] items-center gap-3">
          <span className="truncate text-[12px] font-medium text-slate-700">{s.stakeholder}</span>
          <div className="flex h-6 overflow-hidden rounded-md bg-slate-50 ring-1 ring-slate-200">
            <div
              className="flex items-center justify-center bg-emerald-500 text-[10px] font-bold text-white transition-all duration-500 hover:bg-emerald-600"
              style={{ width: `${s.positive}%` }}
              title={`${s.positive}% positive`}
            >
              {s.positive >= 12 ? <span className="tabular">{s.positive}</span> : ""}
            </div>
            <div
              className="flex items-center justify-center bg-slate-300 text-[10px] font-bold text-slate-800 transition-all duration-500 hover:bg-slate-400"
              style={{ width: `${s.neutral}%` }}
              title={`${s.neutral}% neutral`}
            >
              {s.neutral >= 12 ? <span className="tabular">{s.neutral}</span> : ""}
            </div>
            <div
              className="flex items-center justify-center bg-rose-500 text-[10px] font-bold text-white transition-all duration-500 hover:bg-rose-600"
              style={{ width: `${s.negative}%` }}
              title={`${s.negative}% negative`}
            >
              {s.negative >= 12 ? <span className="tabular">{s.negative}</span> : ""}
            </div>
          </div>
        </div>
      ))}
      <div className="mt-2 flex items-center gap-4 border-t border-slate-100 pt-2 text-[10px] font-semibold uppercase tracking-wider">
        <span className="inline-flex items-center gap-1.5 text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Positive</span>
        <span className="inline-flex items-center gap-1.5 text-slate-600"><span className="h-1.5 w-1.5 rounded-full bg-slate-300" /> Neutral</span>
        <span className="inline-flex items-center gap-1.5 text-rose-700"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Negative</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

const controversyStatusTone: Record<"open" | "responding" | "resolved", "negative" | "warning" | "positive"> = {
  open: "negative",
  responding: "warning",
  resolved: "positive",
};

export function ReputationalRisk(_: SectionComponentProps) {
  const ready = useMountReady();

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="risk-rep"
        accountType="legal"
        accent="violet"
        statusChips={
          <>
            <StatusChip label={`Index ${reputationSummary.current}`} tone={reputationSummary.current > 60 ? "positive" : "warning"} icon={Star} />
            <StatusChip label={`NPS ${reputationSummary.nps}`} tone="positive" icon={ThumbsUp} />
            <StatusChip label={`${reputationSummary.criticalControversies} critical`} tone="negative" icon={AlertTriangle} pulse />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile label="Reputation Index" value={`${reputationSummary.current}`} delta={`${reputationSummary.delta30d >= 0 ? "+" : ""}${reputationSummary.delta30d.toFixed(1)}`} deltaTone="positive" hint="30-day delta" icon={Star} accent="violet" />
              <StatTile label="NPS Proxy" value={`${reputationSummary.nps}`} delta={`+${reputationSummary.npsDelta}`} deltaTone="positive" hint="Net Promoter proxy" icon={ThumbsUp} accent="emerald" />
              <StatTile label="Avg Exec Sentiment" value={`${reputationSummary.avgExecutive}`} hint={`${executiveReps.length} executives`} icon={Users} />
              <StatTile label="Open Controversies" value={`${reputationSummary.openControversies}`} hint="Awaiting response" icon={AlertTriangle} accent="amber" />
              <StatTile label="Critical Controversies" value={`${reputationSummary.criticalControversies}`} hint="C-suite escalation" icon={Megaphone} accent="rose" />
              <StatTile label="Open Reach" value={`${(reputationSummary.totalReach / 1000).toFixed(1)}k`} hint="Aggregate reach · open" icon={TrendingUp} />
            </StaggerGrid>
          ) : (
            <KpiSkeletonGrid />
          )
        }
      />

      {!ready ? (
        <PanelSkeletons count={2} />
      ) : (
        <motion.div
          variants={motionVariants.container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-5"
        >
          {/* Gauge + trend */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <PanelCard accent="violet">
              <PanelHeader
                title="Reputation Index"
                subtitle="Composite · 30-day rolling"
                icon={Star}
                accent="violet"
              />
              <div className="p-4">
                <ReputationGauge />
              </div>
            </PanelCard>
            <PanelCard
              accent="violet"
              className="xl:col-span-2"
            >
              <PanelHeader
                title="Index Trend — 30 days"
                subtitle="Daily reputation index"
                icon={TrendingUp}
                accent="violet"
                action={<Tag tone="violet">Index</Tag>}
              />
              <div className="p-4">
                <ReputationTrend />
              </div>
            </PanelCard>
          </div>

          {/* Executive reputation cards */}
          <PanelCard accent="violet">
            <PanelHeader
              title="Executive Reputation"
              subtitle="Per-executive sentiment + mention volume"
              icon={Users}
              accent="violet"
              action={<Tag tone="neutral">{executiveReps.length} tracked</Tag>}
            />
            <div className="p-4">
              <ExecutiveCards />
            </div>
          </PanelCard>

          {/* Stakeholder sentiment + controversy feed */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <PanelCard accent="violet">
              <PanelHeader
                title="Sentiment by Stakeholder"
                subtitle="Positive / neutral / negative breakdown"
                icon={ThumbsUp}
                accent="violet"
              />
              <div className="p-4">
                <StakeholderStacked />
              </div>
            </PanelCard>
            <PanelCard accent="violet">
              <PanelHeader
                title="Brand Controversy Feed"
                subtitle="Open + closed material controversies"
                icon={Megaphone}
                accent="violet"
                action={<Tag tone="neutral">{reputationControversies.length} tracked</Tag>}
              />
              <div className="max-h-[340px] overflow-y-auto harch-scroll">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-white">
                    <TableRow className="text-[10px] uppercase tracking-wider text-slate-500 hover:bg-transparent">
                      <TableHead>Date</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Reach</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reputationControversies.map((c) => {
                      const tone = controversyStatusTone[c.status];
                      return (
                        <TableRow key={c.id} className="text-[12px] hover:bg-slate-50">
                          <TableCell className="tabular whitespace-nowrap text-slate-500">
                            <div className="flex flex-col">
                              <span>{formatDate(c.date)}</span>
                              <span className="text-[10px] text-slate-400">{relativeTime(c.date)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[240px]">
                            <div className="flex flex-col">
                              <span className="truncate text-slate-700" title={c.title}>{c.title}</span>
                              <span className="text-[10px] text-slate-400">{c.outlet}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Tag
                              tone={c.severity === "critical" ? "negative" : c.severity === "high" ? "warning" : c.severity === "medium" ? "info" : "neutral"}
                              size="xs"
                            >
                              {c.severity}
                            </Tag>
                          </TableCell>
                          <TableCell>
                            <Tag tone={tone} size="xs">{c.status}</Tag>
                          </TableCell>
                          <TableCell className="tabular text-right text-slate-700">{c.reach.toLocaleString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </PanelCard>
          </div>
        </motion.div>
      )}
    </div>
  );
}
