"use client";

import * as React from "react";
import {
  CartesianGrid,
  Cell,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ReferenceLine,
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
  Network,
  ShieldAlert,
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
  Tag,
  ProgressBar,
  StaggerGrid,
  type RoleAccent,
} from "../design-system";
import { InlineRiskRing, KpiSkeleton, useReady } from "./_shared";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  formatCompactMAD,
  formatMAD,
  peerBenchmarkRows,
  peerGroups,
  peerRadarData,
  peerRanking,
  peerScatterData,
  sectorColor,
  type PeerBenchmarkRow,
  type PeerGroupKey,
} from "@/lib/entities-data";
import { cn } from "@/lib/utils";

const MARKET: RoleAccent = "amber";

const radarPalette = ["#d97706", "#0ea5e9", "#10b981", "#a855f7"];

/* ------------------------------------------------------------------ */
/*  Peer benchmark table                                               */
/* ------------------------------------------------------------------ */

function PeerBenchmarkTable({ rows }: { rows: PeerBenchmarkRow[] }) {
  const sorted = [...rows].sort((a, b) => b.revenueM - a.revenueM);
  return (
    <div className="harch-scroll max-h-[440px] overflow-y-auto">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-white">
          <TableRow className="text-[10px] uppercase tracking-wide text-slate-500 hover:bg-transparent">
            <TableHead>Entity</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Net Income</TableHead>
            <TableHead className="text-right">Margin</TableHead>
            <TableHead className="text-right">ROE</TableHead>
            <TableHead className="text-right">Mkt Cap</TableHead>
            <TableHead className="text-center">Risk</TableHead>
            <TableHead className="text-right">Sentiment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((r) => {
            const snt = r.sentiment > 8 ? "text-emerald-700" : r.sentiment < -4 ? "text-rose-700" : "text-slate-500";
            const marginTone: "positive" | "negative" | "neutral" =
              r.marginPct > 8 ? "positive" : r.marginPct < 0 ? "negative" : "neutral";
            const roeTone: "positive" | "negative" | "neutral" =
              r.roePct > 10 ? "positive" : r.roePct < 0 ? "negative" : "neutral";
            return (
              <TableRow key={r.id} className="text-[12px] transition-colors hover:bg-amber-50/40">
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[10px] font-bold text-slate-700 ring-1 ring-slate-200" title={r.name}>
                      {r.ticker ?? r.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-slate-800" title={r.name}>{r.name}</div>
                      <div className="text-[10px] uppercase tracking-wide text-slate-400">{r.ticker ?? "Private"}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="tabular text-right text-slate-700">{formatMAD(r.revenueM, 0)}</TableCell>
                <TableCell className="tabular text-right text-slate-700">{formatMAD(r.netIncomeM, 0)}</TableCell>
                <TableCell className="text-right">
                  <Tag tone={marginTone} size="xs">{r.marginPct.toFixed(1)}%</Tag>
                </TableCell>
                <TableCell className="text-right">
                  <Tag tone={roeTone} size="xs">{r.roePct.toFixed(1)}%</Tag>
                </TableCell>
                <TableCell className="tabular text-right text-slate-700">{r.mktCapM ? formatCompactMAD(r.mktCapM) : "—"}</TableCell>
                <TableCell className="text-center">
                  <InlineRiskRing value={r.riskScore} size={38} stroke={4} />
                </TableCell>
                <TableCell className="text-right">
                  <span className={cn("tabular inline-flex items-center justify-end gap-1 text-[11px] font-semibold", snt)}>
                    {r.sentiment > 0 ? <TrendingUp className="h-3 w-3" /> : r.sentiment < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                    {r.sentiment > 0 ? "+" : ""}{r.sentiment}
                  </span>
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
/*  Peer scatter — risk vs revenue, bubble = mkt cap                   */
/* ------------------------------------------------------------------ */

function PeerScatter({ groupKey }: { groupKey: PeerGroupKey }) {
  const group = peerGroups.find((g) => g.key === groupKey)!;
  const data = peerScatterData(group);
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center px-6 text-center text-[12px] text-slate-400">
        No listed entities in this sector — scatter requires market cap.
      </div>
    );
  }
  return (
    <DeferredChart height="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 12, right: 24, left: 0, bottom: 12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            type="number"
            dataKey="revenueM"
            name="Revenue"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
            tickFormatter={(v) => formatCompactMAD(v as number)}
            label={{ value: "Revenue (MAD M)", position: "insideBottom", offset: -2, style: { fontSize: 10, fill: "#64748b" } }}
          />
          <YAxis
            type="number"
            dataKey="riskScore"
            name="Risk"
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={36}
            label={{ value: "Risk", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "#64748b" } }}
          />
          <ZAxis type="number" dataKey="mktCapM" range={[60, 1200]} name="Mkt Cap" />
          <ReferenceLine y={55} stroke="#ea580c" strokeDasharray="4 4" label={{ value: "High-risk threshold", style: { fontSize: 9, fill: "#ea580c" }, position: "insideTopRight" }} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3", stroke: "#cbd5e1" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as { name: string; revenueM: number; riskScore: number; mktCapM: number; sector: string };
              return (
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
                  <div className="text-[12px] font-bold text-slate-900">{p.name}</div>
                  <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
                    <span className="text-slate-500">Revenue</span>
                    <span className="tabular text-right font-semibold text-slate-800">{formatMAD(p.revenueM, 0)}M MAD</span>
                    <span className="text-slate-500">Risk</span>
                    <span className="tabular text-right font-semibold text-slate-800">{p.riskScore}</span>
                    <span className="text-slate-500">Mkt Cap</span>
                    <span className="tabular text-right font-semibold text-slate-800">{formatCompactMAD(p.mktCapM)}M MAD</span>
                  </div>
                </div>
              );
            }}
          />
          <Scatter data={data} fill="#f59e0b">
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} fillOpacity={0.65} stroke={d.color} strokeWidth={1.5} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Peer radar overlay (top 4 peers by revenue)                        */
/* ------------------------------------------------------------------ */

function PeerRadar({ groupKey }: { groupKey: PeerGroupKey }) {
  const group = peerGroups.find((g) => g.key === groupKey)!;
  const data = peerRadarData(group);
  const peers = group.entities.slice(0, 4);
  if (peers.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-[12px] text-slate-400">
        No peers in this sector.
      </div>
    );
  }
  return (
    <DeferredChart height="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="74%">
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 10, fill: "#475569" }} />
          {peers.map((p, i) => (
            <Radar
              key={p.id}
              name={p.name}
              dataKey={p.name}
              stroke={radarPalette[i % radarPalette.length]}
              fill={radarPalette[i % radarPalette.length]}
              fillOpacity={0.12}
              strokeWidth={1.8}
            />
          ))}
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              return (
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</div>
                  <div className="mt-1 space-y-0.5">
                    {payload.map((p) => (
                      <div key={p.name} className="flex items-center justify-between gap-3 text-[11px]">
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
                          {p.name}
                        </span>
                        <span className="tabular font-bold text-slate-900">{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 10 }}
            iconSize={8}
            iconType="circle"
          />
        </RadarChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Peer ranking bars (revenue, risk overlay marker)                   */
/* ------------------------------------------------------------------ */

function PeerRanking({ groupKey }: { groupKey: PeerGroupKey }) {
  const group = peerGroups.find((g) => g.key === groupKey)!;
  const ranked = peerRanking(group, "revenueM");
  const maxRev = Math.max(...ranked.map((e) => e.revenueM));
  return (
    <div className="flex flex-col gap-3 p-4">
      {ranked.map((e, i) => {
        const pct = maxRev > 0 ? (e.revenueM / maxRev) * 100 : 0;
        const riskPct = e.riskScore;
        const riskColor = riskPct >= 70 ? "#e11d48" : riskPct >= 55 ? "#ea580c" : riskPct >= 40 ? "#f59e0b" : "#10b981";
        return (
          <div key={e.id} className="grid grid-cols-[20px_120px_1fr_60px_50px] items-center gap-2">
            <span className="tabular text-right text-[11px] font-bold text-slate-400">#{i + 1}</span>
            <div className="min-w-0">
              <div className="truncate text-[11px] font-medium text-slate-800" title={e.name}>{e.name}</div>
              <div className="text-[9px] uppercase tracking-wide text-slate-400">{e.ticker ?? "Private"}</div>
            </div>
            <div className="relative h-5 overflow-hidden rounded bg-slate-50 ring-1 ring-slate-200">
              <div
                className="h-full rounded bg-gradient-to-r from-amber-400 to-amber-600"
                style={{ width: `${pct}%`, transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)" }}
              />
              <div
                className="absolute top-0 h-full w-1 shadow-md"
                style={{ left: `${riskPct}%`, background: riskColor }}
                title={`Risk score: ${e.riskScore}`}
              />
            </div>
            <span className="tabular text-right text-[10px] text-slate-500">{formatCompactMAD(e.revenueM)}M</span>
            <span className="tabular text-right text-[11px] font-bold" style={{ color: riskColor }}>{e.riskScore.toFixed(0)}</span>
          </div>
        );
      })}
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[10px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3 rounded bg-gradient-to-r from-amber-400 to-amber-600" />
          Revenue share
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-1" style={{ background: "#e11d48" }} />
          Risk marker (position = risk score)
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function PeersSection(_: SectionComponentProps) {
  const ready = useReady(320);
  const [groupKey, setGroupKey] = React.useState<PeerGroupKey>("Banking");
  const group = peerGroups.find((g) => g.key === groupKey)!;
  const rows = React.useMemo(() => peerBenchmarkRows(group), [group]);
  const avgRisk = rows.length > 0 ? Math.round((rows.reduce((s, r) => s + r.riskScore, 0) / rows.length) * 10) / 10 : 0;
  const totalRev = rows.reduce((s, r) => s + r.revenueM, 0);
  const totalMktCap = rows.reduce((s, r) => s + (r.mktCapM ?? 0), 0);
  const avgMargin = rows.length > 0 ? Math.round((rows.reduce((s, r) => s + r.marginPct, 0) / rows.length) * 10) / 10 : 0;
  const topPeer = peerRanking(group, "revenueM")[0];

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="ent-peers"
        accountType="market"
        accent="amber"
        statusChips={
          <>
            <StatusChip label={`${peerGroups.length} peer groups`} tone="neutral" icon={Network} />
            <StatusChip label={`${group.entities.length} ${group.label.toLowerCase()} peers`} tone="positive" icon={Activity} />
            <StatusChip label="Live" tone="positive" pulse />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile label="Sector" value={group.label} delta={`${group.entities.length} peers`} deltaTone="neutral" icon={Network} accent={MARKET} />
              <StatTile label="Total Revenue" value={formatCompactMAD(totalRev)} unit="MAD M" hint="Sector aggregate" icon={TrendingUp} accent={MARKET} />
              <StatTile label="Total Mkt Cap" value={formatCompactMAD(totalMktCap)} unit="MAD M" hint="Listed peers" icon={Star} accent={MARKET} />
              <StatTile label="Avg Margin" value={`${avgMargin.toFixed(1)}%`} deltaTone={avgMargin > 8 ? "positive" : "negative"} delta={avgMargin > 8 ? "healthy" : "thin"} hint="Net / revenue" icon={Activity} accent={MARKET} />
              <StatTile label="Avg Risk" value={`${avgRisk}`} delta={avgRisk > 55 ? "elevated" : "moderate"} deltaTone={avgRisk > 55 ? "negative" : "neutral"} hint="Composite sector risk" icon={ShieldAlert} accent={MARKET} />
              <StatTile label="Leader" value={topPeer?.name.split(" ")[0] ?? "—"} delta={topPeer?.ticker ?? "Private"} deltaTone="positive" hint="Top by revenue" icon={Star} accent={MARKET} />
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

      {/* Sector selector */}
      <PanelCard accent={MARKET} hover={false} delay={0.05}>
        <div className="flex flex-wrap items-center gap-2 p-3">
          <span className="card-title mr-1">Peer Group:</span>
          {peerGroups.map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => setGroupKey(g.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 transition-colors",
                g.key === groupKey
                  ? "bg-amber-100 text-amber-800 ring-amber-300"
                  : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 hover:text-slate-800 hover:ring-slate-300",
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: sectorColor[g.entities[0]?.sector ?? "Banking"] ?? "#64748b" }} />
              {g.label}
              <span className="tabular rounded-full bg-white/60 px-1.5 text-[10px]">{g.entities.length}</span>
            </button>
          ))}
        </div>
      </PanelCard>

      {/* Benchmark table + scatter */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <PanelCard accent={MARKET} className="xl:col-span-2" hover={false} delay={0.1}>
          <PanelHeader
            title="Peer Benchmark Matrix"
            subtitle={`${group.label} · revenue, margin, ROE, mkt cap, risk, sentiment`}
            icon={Network}
            accent={MARKET}
          />
          <PeerBenchmarkTable rows={rows} />
        </PanelCard>
        <PanelCard accent={MARKET} hover={false} delay={0.15}>
          <PanelHeader
            title="Risk vs Revenue"
            subtitle="Bubble = mkt cap · orange line = high-risk threshold"
            icon={Activity}
            accent={MARKET}
          />
          <div className="p-3">
            <PeerScatter groupKey={groupKey} />
          </div>
        </PanelCard>
      </div>

      {/* Radar overlay + ranking */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <PanelCard accent={MARKET} hover={false} delay={0.2}>
          <PanelHeader
            title="6-Pillar Radar Overlay"
            subtitle={`Top ${Math.min(4, group.entities.length)} ${group.label} peers compared`}
            icon={ShieldAlert}
            accent={MARKET}
          />
          <div className="p-3">
            <PeerRadar groupKey={groupKey} />
          </div>
        </PanelCard>
        <PanelCard accent={MARKET} hover={false} delay={0.25}>
          <PanelHeader
            title="Revenue Ranking"
            subtitle="Sorted by revenue · risk marker position = risk score"
            icon={TrendingUp}
            accent={MARKET}
          />
          <PeerRanking groupKey={groupKey} />
        </PanelCard>
      </div>
    </div>
  );
}
