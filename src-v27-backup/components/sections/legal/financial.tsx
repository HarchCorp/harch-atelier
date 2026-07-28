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
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Handshake,
  Search,
  ShieldAlert,
  TrendingDown,
  Wallet,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
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
  EmptyState,
  motionVariants,
} from "../design-system";
import { motion } from "framer-motion";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  counterparties,
  financialGauges,
  financialSummary,
  formatUSD,
  liquidityRatios,
  varTrend30d,
  type Counterparty,
  type FinancialRiskGauge,
} from "@/lib/legal-data";
import { cn } from "@/lib/utils";
import { KpiSkeletonGrid, PanelSkeletons, PremiumTooltip, useMountReady } from "./_shared";

type SortKey = "name" | "exposure" | "rating" | "limit" | "utilization" | "country";

/* ------------------------------------------------------------------ */
/*  Risk gauge tile (premium MetricRing)                               */
/* ------------------------------------------------------------------ */

function GaugeTile({ gauge }: { gauge: FinancialRiskGauge }) {
  const ringTone = gauge.value < gauge.threshold ? "rose" : gauge.value < gauge.threshold + 10 ? "amber" : "emerald";
  return (
    <PanelCard accent="violet" className="p-4">
      <div className="flex flex-col items-center gap-3">
        <MetricRing value={gauge.value} size={120} stroke={9} sublabel={gauge.unit} tone={ringTone} />
        <div className="text-center">
          <div className="text-[12px] font-bold text-slate-800">{gauge.label}</div>
          <div className="text-[10px] text-slate-500">Threshold ≥ {gauge.threshold}</div>
        </div>
        <div className="flex w-full items-center justify-between rounded-md bg-slate-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">
          <span className="text-slate-500">Tone</span>
          <span
            className={cn(
              "capitalize",
              gauge.tone === "negative" ? "text-rose-700" : gauge.tone === "warning" ? "text-amber-700" : "text-emerald-700",
            )}
          >
            {gauge.tone}
          </span>
        </div>
      </div>
    </PanelCard>
  );
}

/* ------------------------------------------------------------------ */
/*  VaR trend chart                                                    */
/* ------------------------------------------------------------------ */

function VarTrendChart() {
  return (
    <DeferredChart height="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={varTrend30d} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} minTickGap={20} />
          <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={36} unit="M" domain={[0, "auto"]} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              const v = Number(payload.find((p) => p.dataKey === "var")?.value ?? 0);
              const limit = Number(payload.find((p) => p.dataKey === "limit")?.value ?? 0);
              const breach = v > limit;
              return (
                <PremiumTooltip
                  header={label}
                  rows={[
                    { label: "VaR", value: formatUSD(v * 1_000_000), tone: breach ? "rose" : "emerald" },
                    { label: "Limit", value: formatUSD(limit * 1_000_000), tone: "slate" },
                    { label: "Status", value: breach ? "▲ Breach" : "▼ Within limit", tone: breach ? "rose" : "emerald" },
                  ]}
                />
              );
            }}
          />
          <ReferenceLine y={12.5} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: "Limit $12.5M", position: "insideTopRight", fontSize: 9, fill: "#f43f5e" }} />
          <Line type="monotone" dataKey="var" stroke="#7c3aed" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="VaR" />
        </LineChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Liquidity ratios bar chart                                         */
/* ------------------------------------------------------------------ */

function LiquidityBars() {
  return (
    <DeferredChart height="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={liquidityRatios} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} unit="%" />
          <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} width={150} />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              const v = payload[0].value as number;
              const r = liquidityRatios.find((x) => x.label === label);
              const min = r?.minimum ?? 0;
              const ok = v >= min;
              return (
                <PremiumTooltip
                  header={label}
                  rows={[
                    { label: "Current", value: `${v}${r?.unit}`, tone: ok ? "emerald" : "rose" },
                    { label: "Reg min", value: `${min}${r?.unit}`, tone: "slate" },
                    { label: "Status", value: ok ? "Compliant" : "Breach", tone: ok ? "emerald" : "rose" },
                  ]}
                />
              );
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
            {liquidityRatios.map((r) => (
              <Cell key={r.label} fill={r.value >= r.minimum ? "#10b981" : "#f43f5e"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Risk radar (financial gauges)                                      */
/* ------------------------------------------------------------------ */

function FinancialRadar() {
  const data = financialGauges.map((g) => ({ dimension: g.label.replace(" Risk", ""), score: g.value, threshold: g.threshold }));
  const [showTarget, setShowTarget] = React.useState(true);
  return (
    <div className="flex flex-col gap-2">
      <DeferredChart height="h-[230px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "#475569" }} />
            <Radar name="Score" dataKey="score" stroke="#7c3aed" strokeWidth={2} fill="#7c3aed" fillOpacity={0.25} />
            {showTarget ? (
              <Radar name="Threshold" dataKey="threshold" stroke="#94a3b8" strokeWidth={1.2} strokeDasharray="4 4" fill="#94a3b8" fillOpacity={0.05} />
            ) : null}
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length || !label) return null;
                const cur = payload.find((p) => p.dataKey === "score")?.value ?? 0;
                const thr = payload.find((p) => p.dataKey === "threshold")?.value ?? 0;
                return (
                  <PremiumTooltip
                    header={label}
                    rows={[
                      { label: "Score", value: `${cur}`, tone: "violet" },
                      { label: "Threshold", value: `${thr}`, tone: "slate" },
                    ]}
                  />
                );
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </DeferredChart>
      <div className="flex items-center justify-center gap-3 border-t border-slate-100 pt-2">
        <button
          onClick={() => setShowTarget(true)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1 transition-colors",
            showTarget ? "bg-violet-700 text-white ring-violet-700" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Threshold
        </button>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-600" /> Score
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function FinancialRisk(_: SectionComponentProps) {
  const ready = useMountReady();
  const [sortKey, setSortKey] = React.useState<SortKey>("exposure");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    let list = counterparties.slice();
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.rating.toLowerCase().includes(q));
    }
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (sortKey === "exposure" || sortKey === "limit" || sortKey === "utilization") return (a[sortKey] - b[sortKey]) * dir;
      return String(a[sortKey]).localeCompare(String(b[sortKey])) * dir;
    });
    return list;
  }, [query, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };
  const renderSortIcon = (col: SortKey) => {
    if (sortKey !== col) return <ChevronDown className="h-3 w-3 text-slate-300" />;
    return sortDir === "asc" ? <ChevronUp className="h-3 w-3 text-slate-700" /> : <ChevronDown className="h-3 w-3 text-slate-700" />;
  };

  const varBreach = financialSummary.varLatest > financialSummary.varLimit;

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="risk-financial"
        accountType="legal"
        accent="violet"
        statusChips={
          <>
            <StatusChip label={`VaR ${formatUSD(financialSummary.varLatest * 1_000_000)}`} tone={varBreach ? "negative" : "positive"} icon={TrendingDown} />
            <StatusChip label={`LCR ${financialSummary.lcr}%`} tone="positive" icon={ShieldAlert} />
            <StatusChip label={`${financialSummary.crossDefaultHits} cross-default`} tone="negative" icon={AlertTriangle} />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile label="Total Exposure" value={formatUSD(financialSummary.totalExposure * 1_000_000)} hint="Across counterparties" icon={Wallet} accent="violet" />
              <StatTile label="Avg Utilization" value={`${financialSummary.avgUtilization}%`} hint="Of approved limits" accent="amber" />
              <StatTile label="Cross-Default Hits" value={`${financialSummary.crossDefaultHits}`} hint="Triggers active" icon={AlertTriangle} accent="rose" />
              <StatTile label="ISDA Coverage" value={`${financialSummary.isdaCoverage}/${counterparties.length}`} hint="Master agreements" icon={Handshake} accent="emerald" />
              <StatTile label="1-Day VaR (99%)" value={formatUSD(financialSummary.varLatest * 1_000_000)} delta={`${financialSummary.varBreach30d} breaches`} deltaTone={varBreach ? "negative" : "positive"} hint={`Limit ${formatUSD(financialSummary.varLimit * 1_000_000)}`} />
              <StatTile label="LCR / NSFR" value={`${financialSummary.lcr}% / ${financialSummary.nsfr}%`} hint="Both above min" icon={ShieldAlert} accent="emerald" />
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
          {/* Risk gauges 4-up */}
          <StaggerGrid className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {financialGauges.map((g) => (
              <GaugeTile key={g.label} gauge={g} />
            ))}
          </StaggerGrid>

          {/* VaR trend + Liquidity bars */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <PanelCard accent="violet">
              <PanelHeader
                title="Value-at-Risk — 30 days"
                subtitle="1-day 99% VaR vs $12.5M limit"
                icon={TrendingDown}
                accent="violet"
                action={<Tag tone={financialSummary.varBreach30d > 0 ? "warning" : "positive"}>{financialSummary.varBreach30d} breaches</Tag>}
              />
              <div className="p-4">
                <VarTrendChart />
              </div>
            </PanelCard>
            <PanelCard accent="violet">
              <PanelHeader
                title="Liquidity & Capital Ratios"
                subtitle="LCR · NSFR · MLA · Tier-1 CAR"
                icon={ShieldAlert}
                accent="violet"
                action={<Tag tone="neutral">vs reg min</Tag>}
              />
              <div className="p-4">
                <LiquidityBars />
              </div>
            </PanelCard>
          </div>

          {/* Financial radar + counterparty exposure */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <PanelCard accent="violet">
              <PanelHeader
                title="Financial Risk Radar"
                subtitle="Score vs threshold · 4 risk types"
                icon={ShieldAlert}
                accent="violet"
              />
              <div className="p-4">
                <FinancialRadar />
              </div>
            </PanelCard>
            <PanelCard
              accent="violet"
              className="xl:col-span-2"
            >
              <PanelHeader
                title="Counterparty Exposure"
                subtitle="Top counterparties by exposure"
                icon={Wallet}
                accent="violet"
                action={
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search counterparty…"
                        className="h-7 w-48 pl-7 text-[11px] sm:w-56"
                      />
                    </div>
                  </div>
                }
              />
              <div className="max-h-[480px] overflow-y-auto harch-scroll">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-white">
                    <TableRow className="text-[10px] uppercase tracking-wider text-slate-500 hover:bg-transparent">
                      <TableHead>
                        <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("name")}>
                          Counterparty {renderSortIcon("name")}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("country")}>
                          Country {renderSortIcon("country")}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("rating")}>
                          Rating {renderSortIcon("rating")}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("exposure")}>
                          Exposure {renderSortIcon("exposure")}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("limit")}>
                          Limit {renderSortIcon("limit")}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">
                        <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("utilization")}>
                          Utilization {renderSortIcon("utilization")}
                        </button>
                      </TableHead>
                      <TableHead>ISDA</TableHead>
                      <TableHead>Cross-Default</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((c: Counterparty) => (
                      <TableRow key={c.id} className="text-[12px] hover:bg-slate-50">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{c.name}</span>
                            <span className="font-mono text-[10px] text-slate-400">{c.id}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Tag tone="neutral" size="xs">{c.country}</Tag>
                        </TableCell>
                        <TableCell>
                          <Tag
                            tone={c.rating.startsWith("A") ? "positive" : c.rating.startsWith("BBB") ? "info" : "warning"}
                            size="xs"
                          >
                            {c.rating}
                          </Tag>
                        </TableCell>
                        <TableCell className="tabular text-right font-semibold text-slate-900">{formatUSD(c.exposure * 1_000_000)}</TableCell>
                        <TableCell className="tabular text-right text-slate-600">{formatUSD(c.limit * 1_000_000)}</TableCell>
                        <TableCell className="tabular text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20">
                              <ProgressBar
                                value={c.utilization}
                                tone={c.utilization > 80 ? "rose" : c.utilization > 65 ? "amber" : "emerald"}
                                height={5}
                                showLabel
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {c.isda ? (
                            <Tag tone="positive" size="xs" icon={Handshake}>In place</Tag>
                          ) : (
                            <Tag tone="neutral" size="xs">Missing</Tag>
                          )}
                        </TableCell>
                        <TableCell>
                          {c.crossDefault ? (
                            <Tag tone="negative" size="xs" icon={AlertTriangle}>Triggered</Tag>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-8">
                          <EmptyState icon={Search} title="No counterparties match the filter." description="Try clearing the search." accent="violet" />
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5 text-violet-600" />
                  Showing <span className="tabular font-semibold text-slate-700">{filtered.length}</span> of {counterparties.length} counterparties
                </span>
                <span className="text-slate-400">BCBS Basel III · Bank Al-Maghrib prudential</span>
              </div>
            </PanelCard>
          </div>
        </motion.div>
      )}
    </div>
  );
}
