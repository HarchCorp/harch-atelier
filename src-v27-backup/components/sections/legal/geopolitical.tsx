"use client";

import * as React from "react";
import {
  AlertTriangle,
  Ban,
  Globe2,
  ShieldAlert,
  ShieldCheck,
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
import {
  Tooltip as RadixTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SectionHeader, StatusChip } from "../section-header";
import {
  PanelCard,
  PanelHeader,
  StatTile,
  Tag,
  StaggerGrid,
  ProgressBar,
  MetricRing,
  motionVariants,
} from "../design-system";
import { motion } from "framer-motion";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  geoSummary,
  regionalRisks,
  relativeTime,
  sanctionStatusTint,
  sanctionedJurisdictions,
  sanctionsHits,
  tradePolicyTint,
  tradePolicyTimeline,
  type SanctionedJurisdiction,
} from "@/lib/legal-data";
import { cn } from "@/lib/utils";
import { KpiSkeletonGrid, PanelSkeletons, useMountReady, daysFromToday } from "./_shared";

/* ------------------------------------------------------------------ */
/*  Sanctions heatmap (premium — Radix tooltips + smooth transitions)  */
/* ------------------------------------------------------------------ */

function exposureTone(v: 0 | 1 | 2): { cell: string; label: string } {
  if (v === 2) return { cell: "bg-rose-200 text-rose-900 ring-rose-300", label: "Indirect (via counterparty)" };
  if (v === 1) return { cell: "bg-amber-100 text-amber-900 ring-amber-200", label: "Direct" };
  return { cell: "bg-slate-50 text-slate-300 ring-slate-100", label: "None" };
}

const sanctionStatusTone: Record<"clear" | "watch" | "blocked", "positive" | "warning" | "negative"> = {
  clear: "positive",
  watch: "warning",
  blocked: "negative",
};

function SanctionsHeatmap() {
  return (
    <TooltipProvider delayDuration={120}>
      <div className="overflow-x-auto harch-scroll">
        <table className="w-full min-w-[820px] border-collapse text-[11px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-slate-500">
              <th className="sticky left-0 z-10 bg-white px-4 py-2.5 text-left font-semibold">Entity</th>
              {sanctionedJurisdictions.map((j) => (
                <th key={j} className="px-2 py-2.5 text-center font-semibold">{j}</th>
              ))}
              <th className="px-3 py-2.5 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {sanctionsHits.map((row, i) => {
              const statusTone = sanctionStatusTone[row.status];
              return (
                <tr key={row.entity} className={cn("border-t border-slate-100", i % 2 === 1 ? "bg-slate-50/40" : "bg-white")}>
                  <td className="sticky left-0 z-10 bg-inherit px-4 py-2 font-semibold text-slate-700">
                    <div className="flex flex-col">
                      <span className="truncate">{row.entity}</span>
                      <span className="text-[10px] font-normal text-slate-400">
                        <span className="tabular">{row.hits}</span> hits · {relativeTime(row.lastScreened)}
                      </span>
                    </div>
                  </td>
                  {sanctionedJurisdictions.map((j) => {
                    const v = row.exposures[j as SanctionedJurisdiction];
                    const t = exposureTone(v);
                    return (
                      <td key={j} className="px-2 py-2 text-center">
                        <RadixTooltip>
                          <TooltipTrigger asChild>
                            <span
                              className={cn(
                                "tabular inline-flex h-7 w-9 cursor-default items-center justify-center rounded-md text-[10px] font-bold ring-1 transition-all duration-200 hover:scale-105 hover:shadow-sm",
                                v > 0 ? t.cell : "bg-slate-50 text-slate-300 ring-slate-100",
                              )}
                            >
                              {v > 0 ? (v === 2 ? "2" : "1") : "·"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="!bg-slate-900 !text-white">
                            <span className="text-[10px] font-semibold uppercase tracking-wide">
                              {row.entity} · {j}
                            </span>
                            <span className="tabular mt-0.5 block text-[12px] font-bold">{t.label}</span>
                          </TooltipContent>
                        </RadixTooltip>
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-right">
                    <Tag tone={statusTone} size="xs">
                      <span className={cn("h-1.5 w-1.5 rounded-full", sanctionStatusTint[row.status].dot)} />
                      {row.status}
                    </Tag>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 px-4 py-2.5 text-[10px] uppercase tracking-wider text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-amber-100 ring-1 ring-amber-200" /> Direct
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-rose-200 ring-1 ring-rose-300" /> Indirect
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-slate-50 ring-1 ring-slate-100" /> None
        </span>
      </div>
    </TooltipProvider>
  );
}

/* ------------------------------------------------------------------ */
/*  Regional risk index cards                                          */
/* ------------------------------------------------------------------ */

function regionalRingTone(index: number): "rose" | "amber" | "emerald" {
  if (index >= 65) return "rose";
  if (index >= 50) return "amber";
  return "emerald";
}

function RegionCards() {
  return (
    <StaggerGrid className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {regionalRisks.map((r) => {
        const isUp = r.delta > 0;
        const ringTone = regionalRingTone(r.index);
        return (
          <motion.div key={r.region} variants={motionVariants.item}>
            <PanelCard accent="violet" className="h-full p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-[22px] leading-none">{r.flag}</span>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-slate-900">{r.region}</span>
                    <span className="text-[10px] text-slate-400">
                      <span className="tabular">{r.entities}</span> entities · <span className="tabular">${r.exposure}M exp</span>
                    </span>
                  </div>
                </div>
                <Tag tone={isUp ? "negative" : "positive"} size="xs" icon={isUp ? TrendingUp : TrendingDown}>
                  {r.delta >= 0 ? "+" : ""}{r.delta.toFixed(1)}
                </Tag>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <MetricRing value={r.index} size={56} stroke={6} tone={ringTone} />
                <div className="flex-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Risk index</div>
                  <div className="tabular mt-0.5 text-[18px] font-bold text-slate-900">{r.index}</div>
                  <div className="mt-1">
                    <ProgressBar
                      value={r.index}
                      tone={ringTone === "rose" ? "rose" : ringTone === "amber" ? "amber" : "emerald"}
                      height={4}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500">
                <span>Top risk</span>
                <span className="font-semibold text-slate-700">{r.topRisk}</span>
              </div>
            </PanelCard>
          </motion.div>
        );
      })}
    </StaggerGrid>
  );
}

/* ------------------------------------------------------------------ */
/*  Trade-policy timeline                                              */
/* ------------------------------------------------------------------ */

const impactTone: Record<"high" | "medium" | "low", "negative" | "warning" | "neutral"> = {
  high: "negative",
  medium: "warning",
  low: "neutral",
};
const tradeCategoryTone: Record<string, "warning" | "negative" | "violet" | "positive" | "cyan"> = {
  Tariff: "warning",
  "Export Control": "negative",
  Sanctions: "violet",
  "Trade Agreement": "positive",
  Quota: "cyan",
};

function TradePolicyTimeline() {
  const sorted = [...tradePolicyTimeline].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  return (
    <div className="flex flex-col gap-2">
      {sorted.map((t) => {
        const isFuture = Date.parse(t.date) >= Date.parse("2025-11-15T00:00:00Z");
        const days = daysFromToday(t.date);
        return (
          <motion.div
            key={t.id}
            variants={motionVariants.item}
            className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-2.5 transition-all hover:border-slate-300 hover:shadow-sm"
          >
            <div className={cn("flex w-12 flex-col items-center rounded-md px-2 py-1.5 text-white", isFuture ? "bg-violet-700" : "bg-slate-800")}>
              <span className="text-[9px] font-medium uppercase tracking-wide text-white/80">{new Date(t.date).toISOString().slice(5, 7)}</span>
              <span className="tabular text-[14px] font-bold leading-none">{new Date(t.date).toISOString().slice(8, 10)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-semibold text-slate-900">{t.title}</span>
                <Tag tone={tradeCategoryTone[t.category]} size="xs">{t.category}</Tag>
                <Tag tone={impactTone[t.impact]} size="xs">{t.impact} impact</Tag>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                <span className="truncate">{t.jurisdictions}</span>
                <span>·</span>
                <span className="tabular">{isFuture ? `in ${days}d` : relativeTime(t.date)}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function GeopoliticalRisk(_: SectionComponentProps) {
  const ready = useMountReady();

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="risk-geo"
        accountType="legal"
        accent="violet"
        statusChips={
          <>
            <StatusChip label={`${geoSummary.watchEntities} on watch`} tone="warning" icon={ShieldAlert} />
            <StatusChip label={`${geoSummary.blockedEntities} blocked`} tone="negative" icon={Ban} />
            <StatusChip label={`Avg idx ${geoSummary.avgIndex}`} tone="neutral" icon={Globe2} />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile label="Entities Screened" value={`${geoSummary.totalScreened}`} hint="OFAC + EU + UN + WCO" icon={ShieldCheck} accent="violet" />
              <StatTile label="On Watch" value={`${geoSummary.watchEntities}`} hint="Indirect exposure flagged" icon={ShieldAlert} accent="amber" />
              <StatTile label="Blocked" value={`${geoSummary.blockedEntities}`} hint="Direct hit · freeze assets" icon={Ban} accent="rose" />
              <StatTile label="Highest Region" value={geoSummary.highestRegion.region} delta={`${geoSummary.highestRegion.index}`} deltaTone="negative" hint={`+${geoSummary.highestRegion.delta.toFixed(1)} pts · 30d`} accent="rose" />
              <StatTile label="Avg Regional Index" value={`${geoSummary.avgIndex}`} hint="Across 6 regions" accent="amber" />
              <StatTile label="Upcoming Policies" value={`${geoSummary.upcomingPolicies}`} hint="Next 90 days · trade" />
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
          {/* Sanctions heatmap */}
          <PanelCard accent="violet">
            <PanelHeader
              title="Sanctions Exposure Heatmap"
              subtitle="Entity × sanctioned jurisdiction · OFAC + EU + UN screening"
              icon={ShieldAlert}
              accent="violet"
              action={<Tag tone="neutral">{sanctionsHits.length} entities · {sanctionedJurisdictions.length} jurisdictions</Tag>}
            />
            <div className="p-2">
              <SanctionsHeatmap />
            </div>
          </PanelCard>

          {/* Regional risk cards */}
          <PanelCard accent="violet">
            <PanelHeader
              title="Regional Risk Index"
              subtitle="Per-region composite risk · 0–100 scale"
              icon={Globe2}
              accent="violet"
              action={<Tag tone="neutral">{regionalRisks.length} regions</Tag>}
            />
            <div className="p-4">
              <RegionCards />
            </div>
          </PanelCard>

          {/* Trade-policy timeline */}
          <PanelCard accent="violet">
            <PanelHeader
              title="Trade Policy Timeline"
              subtitle="Tariffs · export controls · sanctions · agreements"
              icon={TrendingUp}
              accent="violet"
              action={<Tag tone="neutral">{tradePolicyTimeline.length} events</Tag>}
            />
            <div className="max-h-[440px] overflow-y-auto harch-scroll p-3">
              <TradePolicyTimeline />
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-violet-600" />
                Tracking {tradePolicyTimeline.length} policy events · past + future
              </span>
              <span className="text-slate-400">OFAC · EU Council · WCO · Bank Al-Maghrib FX</span>
            </div>
          </PanelCard>
        </motion.div>
      )}
    </div>
  );
}
