"use client";

import * as React from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ChevronRight,
  Eye,
  Flame,
  Gauge,
  ShieldAlert,
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
  MiniSparkline,
  StaggerGrid,
  type RoleAccent,
} from "../design-system";
import { KpiSkeleton, useReady } from "./_shared";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  entityWatchlist,
  pillarColor,
  pillarLabel,
  sectorColor,
  watchlistSummary,
  type WatchlistSignal,
} from "@/lib/entities-data";
import { cn } from "@/lib/utils";

const MARKET: RoleAccent = "amber";

/* ------------------------------------------------------------------ */
/*  Severity palette                                                   */
/* ------------------------------------------------------------------ */

type Severity = "critical" | "high" | "medium" | "low";

const severityTone: Record<Severity, "negative" | "warning" | "neutral" | "info"> = {
  critical: "negative",
  high: "warning",
  medium: "warning",
  low: "neutral",
};

const severityHex: Record<Severity, string> = {
  critical: "#e11d48",
  high: "#ea580c",
  medium: "#f59e0b",
  low: "#64748b",
};

const severityBarClass: Record<Severity, string> = {
  critical: "bg-rose-500",
  high: "bg-orange-500",
  medium: "bg-amber-400",
  low: "bg-slate-400",
};

/* ------------------------------------------------------------------ */
/*  Pillar tone mapping                                                */
/* ------------------------------------------------------------------ */

const pillarToneMap: Record<
  WatchlistSignal["pillar"],
  "info" | "cyan" | "amber" | "emerald" | "violet" | "rose" | "negative"
> = {
  regulatory: "violet",
  cyber: "cyan",
  financial: "info",
  esg: "emerald",
  geopolitical: "amber",
  reputational: "rose",
};

/* ------------------------------------------------------------------ */
/*  Severity donut                                                     */
/* ------------------------------------------------------------------ */

function SeverityDonut() {
  const data: { band: string; count: number; color: string }[] = [
    { band: "Critical", count: watchlistSummary.bySeverity.critical, color: "#e11d48" },
    { band: "High", count: watchlistSummary.bySeverity.high, color: "#ea580c" },
    { band: "Medium", count: watchlistSummary.bySeverity.medium, color: "#f59e0b" },
    { band: "Low", count: watchlistSummary.bySeverity.low, color: "#64748b" },
  ];
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div className="flex flex-col gap-3 p-4">
      <DeferredChart height="h-[170px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="band"
              innerRadius={44}
              outerRadius={72}
              paddingAngle={2}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {data.map((d) => (
                <Cell key={d.band} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0];
                const v = Number(p.value);
                const pct = Math.round((v / total) * 1000) / 10;
                return (
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
                    <div className="text-[11px] font-semibold text-slate-800">{p.name}</div>
                    <div className="tabular text-[14px] font-bold text-slate-900">{v} signals</div>
                    <div className="tabular text-[10px] text-slate-500">{pct}% of watchlist</div>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </DeferredChart>
      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
        {data.map((d) => (
          <div key={d.band} className="flex items-center justify-between rounded bg-slate-50 px-2 py-1">
            <span className="flex items-center gap-1.5 truncate text-slate-600">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
              <span className="truncate">{d.band}</span>
            </span>
            <span className="tabular font-semibold text-slate-800">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pillar distribution bars                                           */
/* ------------------------------------------------------------------ */

function PillarBars() {
  const byPillar = new Map<WatchlistSignal["pillar"], number>();
  for (const s of entityWatchlist) {
    byPillar.set(s.pillar, (byPillar.get(s.pillar) ?? 0) + 1);
  }
  const entries = Array.from(byPillar.entries()).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map((e) => e[1]));
  return (
    <div className="flex flex-col gap-3 p-4">
      {entries.map(([p, count]) => {
        const color = pillarColor[p];
        const pct = (count / max) * 100;
        return (
          <div key={p} className="grid grid-cols-[78px_1fr_28px] items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
              {pillarLabel[p]}
            </span>
            <div className="relative h-4 overflow-hidden rounded bg-slate-50 ring-1 ring-slate-200">
              <div
                className="h-full rounded"
                style={{ width: `${pct}%`, background: color, transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)" }}
              />
            </div>
            <span className="tabular text-right text-[11px] font-bold text-slate-800">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Summary posture tile (MetricRing)                                  */
/* ------------------------------------------------------------------ */

function SummaryPosture() {
  // Posture score: weighted severity → 0-100 (higher = worse posture)
  const weights: Record<Severity, number> = { critical: 100, high: 65, medium: 35, low: 12 };
  const total = watchlistSummary.total || 1;
  const posture = Math.round(
    ((watchlistSummary.bySeverity.critical * weights.critical +
      watchlistSummary.bySeverity.high * weights.high +
      watchlistSummary.bySeverity.medium * weights.medium +
      watchlistSummary.bySeverity.low * weights.low) /
      total) *
      10,
  ) / 10;
  const verdict = posture >= 70 ? "Critical" : posture >= 50 ? "Elevated" : posture >= 30 ? "Moderate" : "Stable";
  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <MetricRing value={posture} size={130} stroke={10} label="Posture" sublabel={verdict} />
      <div className="grid w-full grid-cols-2 gap-1.5">
        <PostureTile label="Critical" value={watchlistSummary.critical} tone="negative" />
        <PostureTile label="High" value={watchlistSummary.high} tone="warning" />
        <PostureTile label="Medium" value={watchlistSummary.bySeverity.medium} tone="warning" />
        <PostureTile label="Low" value={watchlistSummary.bySeverity.low} tone="neutral" />
      </div>
      <div className="w-full rounded-lg bg-slate-50 p-3 text-[11px] text-slate-600">
        <span className="font-semibold text-slate-800">Triage queue:</span>{" "}
        {watchlistSummary.critical > 0
          ? `${watchlistSummary.critical} critical signal${watchlistSummary.critical === 1 ? "" : "s"} require immediate analyst review. `
          : "No critical signals. "}
        Avg sentiment delta is{" "}
        <span className="font-semibold text-rose-700">{watchlistSummary.avgDelta}</span>{" "}
        across {watchlistSummary.total} tracked entities.
      </div>
    </div>
  );
}

function PostureTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "negative" | "warning" | "neutral";
}) {
  const cls = {
    negative: "bg-rose-50 text-rose-700",
    warning: "bg-amber-50 text-amber-700",
    neutral: "bg-slate-100 text-slate-700",
  }[tone];
  return (
    <div className={cn("rounded-lg px-2 py-1.5 text-center ring-1 ring-inset ring-slate-200/60", cls)}>
      <div className="tabular text-[18px] font-bold leading-none">{value}</div>
      <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide opacity-80">{label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Watchlist card                                                     */
/* ------------------------------------------------------------------ */

function WatchlistCard({ signal, onClick }: { signal: WatchlistSignal; onClick: () => void }) {
  const sev = signal.severity;
  const color = sectorColor[signal.sector] ?? "#64748b";
  const snt = signal.sentimentDelta > 0 ? "text-emerald-700" : signal.sentimentDelta < 0 ? "text-rose-700" : "text-slate-500";
  const isCritical = sev === "critical";
  const isHigh = sev === "high";
  const sparkColor = severityHex[sev];

  return (
    <PanelCard
      accent={isCritical ? "rose" : isHigh ? undefined : undefined}
      className="p-4"
      hover={true}
      delay={0}
    >
      <button
        type="button"
        onClick={onClick}
        className="group relative flex w-full flex-col gap-3 text-left"
      >
        {/* Severity stripe */}
        <span className={cn("absolute -left-4 top-0 h-full w-1 rounded-l-2xl", severityBarClass[sev])} />

        {/* Header: entity + ticker + severity */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2.5">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[10px] font-bold text-slate-700 ring-1 ring-slate-200"
              style={{ boxShadow: `inset 0 0 0 1px ${color}22` }}
              title={signal.entityName}
            >
              {signal.ticker ?? signal.entityName.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-bold text-slate-900" title={signal.entityName}>{signal.entityName}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-slate-400">
                <Tag tone="neutral" size="xs">{signal.sector}</Tag>
                <span>{signal.ticker ?? "Private"}</span>
              </div>
            </div>
          </div>
          <Tag tone={severityTone[sev]} size="xs" icon={isCritical ? Flame : AlertTriangle}>
            {sev}
          </Tag>
        </div>

        {/* Signal type + pillar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            {isCritical ? <Flame className="h-3.5 w-3.5 text-rose-500" /> : <AlertTriangle className={cn("h-3.5 w-3.5", severityTone[sev] === "negative" ? "text-rose-500" : severityTone[sev] === "warning" ? "text-orange-500" : "text-slate-400")} />}
            <span className="truncate text-[12px] font-medium text-slate-800" title={signal.type}>{signal.type}</span>
          </div>
          <Tag tone={pillarToneMap[signal.pillar]} size="xs">{pillarLabel[signal.pillar]}</Tag>
        </div>

        {/* Sentiment delta + articles + updated */}
        <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-2">
          <div>
            <div className="text-[9px] uppercase tracking-wide text-slate-400">Δ Snt</div>
            <div className={cn("tabular inline-flex items-center gap-0.5 text-[12px] font-bold", snt)}>
              {signal.sentimentDelta > 0 ? <TrendingUp className="h-3 w-3" /> : signal.sentimentDelta < 0 ? <TrendingDown className="h-3 w-3" /> : null}
              {signal.sentimentDelta > 0 ? "+" : ""}{signal.sentimentDelta}
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wide text-slate-400">Articles</div>
            <div className="tabular text-[12px] font-bold text-slate-800">{signal.articles}</div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wide text-slate-400">Updated</div>
            <div className="text-[11px] font-semibold text-slate-700">{signal.updatedAt}</div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="h-[34px]">
          <MiniSparkline data={signal.sparkline} color={sparkColor} width={260} height={34} fillOpacity={0.22} />
        </div>

        {/* Footer chevron */}
        <div className="flex items-center justify-end gap-1 text-[10px] font-medium text-slate-400 transition-colors group-hover:text-amber-700">
          View profile
          <ChevronRight className="h-3 w-3" />
        </div>
      </button>
    </PanelCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Watchlist stream table                                             */
/* ------------------------------------------------------------------ */

function WatchlistStream({ onSelectEntity }: { onSelectEntity: (entityId: string) => void }) {
  return (
    <div className="harch-scroll max-h-[480px] overflow-y-auto">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-white">
          <TableRow className="text-[10px] uppercase tracking-wide text-slate-500 hover:bg-transparent">
            <TableHead>Entity</TableHead>
            <TableHead>Signal</TableHead>
            <TableHead>Pillar</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead className="text-right">Δ Snt</TableHead>
            <TableHead className="text-right">Articles</TableHead>
            <TableHead className="text-right">Updated</TableHead>
            <TableHead className="text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {entityWatchlist.map((s) => {
            const snt = s.sentimentDelta > 0 ? "text-emerald-700" : s.sentimentDelta < 0 ? "text-rose-700" : "text-slate-500";
            const isCritical = s.severity === "critical";
            return (
              <TableRow
                key={s.id}
                onClick={() => onSelectEntity(s.entityId)}
                className={cn(
                  "cursor-pointer text-[12px] transition-colors hover:bg-amber-50/40",
                  isCritical && "bg-rose-50/30",
                )}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-50 text-[9px] font-bold text-slate-700 ring-1 ring-slate-200">
                      {s.ticker ?? s.entityName.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-slate-800" title={s.entityName}>{s.entityName}</div>
                      <div className="text-[9px] uppercase tracking-wide text-slate-400">{s.sector}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-slate-700">{s.type}</TableCell>
                <TableCell>
                  <Tag tone={pillarToneMap[s.pillar]} size="xs">{pillarLabel[s.pillar]}</Tag>
                </TableCell>
                <TableCell>
                  <Tag tone={severityTone[s.severity]} size="xs" icon={s.severity === "critical" ? Flame : undefined}>
                    {s.severity}
                  </Tag>
                </TableCell>
                <TableCell className="text-right">
                  <span className={cn("tabular inline-flex items-center justify-end gap-0.5 text-[11px] font-semibold", snt)}>
                    {s.sentimentDelta > 0 ? <TrendingUp className="h-3 w-3" /> : s.sentimentDelta < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                    {s.sentimentDelta > 0 ? "+" : ""}{s.sentimentDelta}
                  </span>
                </TableCell>
                <TableCell className="tabular text-right text-slate-700">{s.articles}</TableCell>
                <TableCell className="tabular text-right text-[11px] text-slate-500">{s.updatedAt}</TableCell>
                <TableCell className="text-right">
                  <ChevronRight className="ml-auto h-3.5 w-3.5 text-slate-300" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function WatchlistSection({ onSelectEntity }: SectionComponentProps) {
  const ready = useReady(320);
  const handleSelectEntity = React.useCallback((id: string) => {
    onSelectEntity(id);
  }, [onSelectEntity]);

  const sortedCards = React.useMemo(
    () =>
      [...entityWatchlist].sort((a, b) => {
        const order: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[a.severity] - order[b.severity];
      }),
    [],
  );

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="ent-watchlist"
        accountType="market"
        accent="amber"
        statusChips={
          <>
            <StatusChip label={`${watchlistSummary.total} signals`} tone="neutral" icon={Eye} />
            <StatusChip label={`${watchlistSummary.critical} critical`} tone={watchlistSummary.critical > 0 ? "negative" : "neutral"} icon={ShieldAlert} />
            <StatusChip label={`${watchlistSummary.high} high`} tone={watchlistSummary.high > 0 ? "warning" : "neutral"} icon={AlertTriangle} />
            <StatusChip label="Live" tone="positive" icon={Activity} pulse />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile label="Tracked Entities" value={`${watchlistSummary.total}`} delta="all sectors" deltaTone="neutral" hint="Watchlist size" icon={Eye} accent={MARKET} />
              <StatTile label="Critical Signals" value={`${watchlistSummary.critical}`} deltaTone="negative" delta="triage now" hint="Immediate review" icon={ShieldAlert} accent={MARKET} />
              <StatTile label="High Signals" value={`${watchlistSummary.high}`} deltaTone="negative" delta="monitoring" hint="Active monitoring" icon={AlertTriangle} accent={MARKET} />
              <StatTile label="Total Articles" value={`${watchlistSummary.totalArticles}`} delta="30d" deltaTone="neutral" hint="Backing signals" icon={Activity} accent={MARKET} />
              <StatTile label="Avg Sentiment Δ" value={`${watchlistSummary.avgDelta}`} deltaTone="negative" delta="vs prior" hint="Across watchlist" icon={TrendingDown} accent={MARKET} />
              <StatTile label="Signal Pillars" value="6" delta="Reg·Cy·Fin·ESG·Geo·Rep" deltaTone="neutral" hint="Risk pillars covered" icon={Gauge} accent={MARKET} />
            </StaggerGrid>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <KpiSkeleton key={i} />
              ))}
            </div>
          )
        }
      />

      {/* Severity donut + pillar bars + summary posture */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <PanelCard accent={MARKET} delay={0.05}>
          <PanelHeader
            title="Severity Distribution"
            subtitle="Signals by severity band"
            icon={ShieldAlert}
            accent={MARKET}
          />
          <SeverityDonut />
        </PanelCard>
        <PanelCard accent={MARKET} delay={0.1}>
          <PanelHeader
            title="Pillar Distribution"
            subtitle="Signals per risk pillar"
            icon={Gauge}
            accent={MARKET}
          />
          <PillarBars />
        </PanelCard>
        <PanelCard accent={MARKET} delay={0.15}>
          <PanelHeader
            title="Watchlist Summary"
            subtitle="Composite triage posture"
            icon={Activity}
            accent={MARKET}
          />
          <SummaryPosture />
        </PanelCard>
      </div>

      {/* Watchlist cards grid */}
      <PanelCard accent={MARKET} hover={false} delay={0.2}>
        <PanelHeader
          title="Tracked Entities — Live Signals"
          subtitle={`${sortedCards.length} signals · click any card for entity profile`}
          icon={Eye}
          accent={MARKET}
          action={
            <div className="hidden flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wide sm:flex">
              <span className="inline-flex items-center gap-1 text-rose-700"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Critical</span>
              <span className="inline-flex items-center gap-1 text-orange-700"><span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> High</span>
              <span className="inline-flex items-center gap-1 text-amber-700"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Medium</span>
              <span className="inline-flex items-center gap-1 text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Low</span>
            </div>
          }
        />
        <StaggerGrid className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedCards.map((s) => (
            <WatchlistCard key={s.id} signal={s} onClick={() => handleSelectEntity(s.entityId)} />
          ))}
        </StaggerGrid>
      </PanelCard>

      {/* Stream table */}
      <PanelCard accent={MARKET} hover={false} delay={0.25}>
        <PanelHeader
          title="Signal Stream"
          subtitle={`${entityWatchlist.length} signals · sortable stream`}
          icon={Activity}
          accent={MARKET}
        />
        <WatchlistStream onSelectEntity={handleSelectEntity} />
      </PanelCard>
    </div>
  );
}
