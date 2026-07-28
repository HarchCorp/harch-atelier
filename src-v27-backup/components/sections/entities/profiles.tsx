"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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
  Building2,
  Coins,
  Eye,
  Globe2,
  Layers,
  MapPin,
  Star,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeferredChart } from "@/components/dataviz/chart-skeleton";
import { SectionHeader, StatusChip } from "../section-header";
import {
  PanelCard,
  PanelHeader,
  StatTile,
  MetricRing,
  Tag,
  ProgressBar,
  StaggerGrid,
  type RoleAccent,
} from "../design-system";
import { KpiSkeleton, useReady } from "./_shared";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  formatCompact,
  formatCompactMAD,
  formatMAD,
  pillarColor,
  pillarLabel,
  sectorColor,
  topProfiles,
  type Entity,
  type RiskPillarKey,
} from "@/lib/entities-data";
import { cn } from "@/lib/utils";

const MARKET: RoleAccent = "amber";

/* ------------------------------------------------------------------ */
/*  Status tone mapping                                                */
/* ------------------------------------------------------------------ */

const statusToneMap: Record<
  Entity["status"],
  "positive" | "warning" | "negative" | "info" | "violet"
> = {
  active: "positive",
  watch: "warning",
  restricted: "negative",
  review: "info",
  monitored: "violet",
};

const sectorToneMap: Record<
  Entity["sector"],
  "neutral" | "positive" | "negative" | "warning" | "info" | "amber" | "rose" | "emerald" | "violet" | "cyan" | "slate"
> = {
  Banking: "info",
  Telecom: "violet",
  "Real Estate": "amber",
  Construction: "emerald",
  Materials: "emerald",
  Consumer: "rose",
  Energy: "warning",
  Pharma: "positive",
  Tech: "cyan",
  Holding: "slate",
  Insurance: "violet",
  Agri: "positive",
  Utilities: "cyan",
  Automotive: "rose",
  Logistics: "violet",
};

/* ------------------------------------------------------------------ */
/*  6-pillar risk radar                                                */
/* ------------------------------------------------------------------ */

function RiskRadar({ entity }: { entity: Entity }) {
  const pillars: RiskPillarKey[] = [
    "regulatory",
    "cyber",
    "financial",
    "esg",
    "geopolitical",
    "reputational",
  ];
  const data = pillars.map((p) => ({
    pillar: pillarLabel[p],
    score: entity.riskPillars[p],
    full: 100,
  }));
  return (
    <DeferredChart height="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="76%">
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 10, fill: "#475569" }} />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#d97706"
            strokeWidth={2}
            fill="#f59e0b"
            fillOpacity={0.32}
          />
          <Radar
            name="Ceiling"
            dataKey="full"
            stroke="#cbd5e1"
            strokeWidth={1}
            strokeDasharray="3 3"
            fill="#f1f5f9"
            fillOpacity={0.2}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              const v = Number(payload[0]?.value ?? 0);
              const fill = v >= 70 ? "#e11d48" : v >= 55 ? "#ea580c" : v >= 40 ? "#f59e0b" : "#10b981";
              return (
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
                  <div className="text-[11px] font-semibold text-slate-800">{label}</div>
                  <div className="tabular text-[14px] font-bold" style={{ color: fill }}>{v} / 100</div>
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
/*  Sentiment trend 12m mini-chart                                     */
/* ------------------------------------------------------------------ */

function SentimentTrend({ entity }: { entity: Entity }) {
  const monthLabels = ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
  const data = entity.sentimentTrend12m.map((v, i) => ({
    month: monthLabels[i],
    sentiment: v,
  }));
  const color = entity.sentiment > 8 ? "#10b981" : entity.sentiment < -4 ? "#e11d48" : "#64748b";
  return (
    <DeferredChart height="h-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`sntGrad-${entity.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} minTickGap={20} />
          <YAxis domain={[-100, 100]} tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} width={28} />
          <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="2 2" />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              const v = Number(payload[0]?.value ?? 0);
              return (
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
                  <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
                  <div className={cn("tabular text-[13px] font-bold", v > 0 ? "text-emerald-700" : v < 0 ? "text-rose-700" : "text-slate-700")}>
                    {v > 0 ? "+" : ""}{v} net
                  </div>
                </div>
              );
            }}
          />
          <Area type="monotone" dataKey="sentiment" stroke={color} strokeWidth={1.8} fill={`url(#sntGrad-${entity.id})`} />
        </AreaChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Ownership pie                                                      */
/* ------------------------------------------------------------------ */

function OwnershipPie({ entity }: { entity: Entity }) {
  const palette = ["#d97706", "#0ea5e9", "#10b981", "#a855f7", "#64748b"];
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="h-[170px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={entity.ownership}
              dataKey="share"
              nameKey="name"
              innerRadius={40}
              outerRadius={68}
              paddingAngle={2}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {entity.ownership.map((o, i) => (
                <Cell key={o.name} fill={palette[i % palette.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0];
                const v = Number(p.value);
                const name = String(p.payload?.name ?? "");
                const type = String(p.payload?.type ?? "");
                return (
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
                    <div className="text-[11px] font-semibold text-slate-800">{name}</div>
                    <div className="tabular text-[14px] font-bold text-slate-900">{v}%</div>
                    <div className="text-[10px] text-slate-500">{type}</div>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-1.5">
        {entity.ownership.map((o, i) => (
          <div key={o.name} className="grid grid-cols-[10px_1fr_42px] items-center gap-2 text-[11px]">
            <span className="h-2 w-2 rounded-full" style={{ background: palette[i % palette.length] }} />
            <div className="min-w-0">
              <div className="truncate font-medium text-slate-700" title={o.name}>{o.name}</div>
              <div className="text-[9px] uppercase tracking-wide text-slate-400">{o.type}</div>
            </div>
            <span className="tabular text-right font-semibold text-slate-800">{o.share}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Profile dossier                                                    */
/* ------------------------------------------------------------------ */

function ProfileDossier({ entity }: { entity: Entity }) {
  const isHarch = entity.type === "self";
  const sectorColorHex = sectorColor[entity.sector] ?? "#64748b";
  const snt = entity.sentiment > 8 ? "text-emerald-700" : entity.sentiment < -4 ? "text-rose-700" : "text-slate-500";

  return (
    <div className="flex flex-col gap-4">
      {/* Profile header */}
      <PanelCard accent={MARKET} hover={false}>
        <div className="flex flex-wrap items-start justify-between gap-4 p-5">
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-[16px] font-bold ring-1",
                isHarch
                  ? "bg-amber-100 text-amber-800 ring-amber-300"
                  : "bg-white text-slate-700 ring-slate-200",
              )}
              style={!isHarch ? { boxShadow: `inset 0 0 0 1px ${sectorColorHex}22` } : undefined}
              title={entity.name}
            >
              {entity.ticker ?? entity.name.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[18px] font-bold tracking-tight text-slate-900">{entity.name}</h3>
                {isHarch && (
                  <Tag tone="amber" size="xs" icon={Star}>Self</Tag>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                {entity.ticker && (
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-semibold text-slate-700">{entity.ticker}</span>
                )}
                <Tag tone={sectorToneMap[entity.sector] ?? "neutral"} size="xs">{entity.sector}</Tag>
                <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3 text-amber-500" /> {entity.hq}, {entity.country}</span>
                <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" /> {formatCompact(entity.employees)} employees</span>
                <Tag tone={statusToneMap[entity.status]} size="xs">{entity.status}</Tag>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex flex-col items-center">
              <MetricRing value={entity.riskScore} size={84} stroke={8} label="Risk" />
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="card-title">Sentiment</span>
              <span className={cn("tabular inline-flex items-center gap-1 text-[20px] font-bold", snt)}>
                {entity.sentiment > 0 ? <TrendingUp className="h-4 w-4" /> : entity.sentiment < 0 ? <TrendingDown className="h-4 w-4" /> : null}
                {entity.sentiment > 0 ? "+" : ""}{entity.sentiment}
              </span>
              <span className="text-[10px] text-slate-400">-100..+100 net</span>
            </div>
          </div>
        </div>
      </PanelCard>

      {/* Financial KPIs */}
      <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Revenue" value={entity.revenueM > 0 ? `${formatMAD(entity.revenueM, 0)}` : "—"} unit="MAD M" icon={Coins} accent={MARKET} />
        <StatTile label="Net Income" value={entity.netIncomeM !== 0 ? `${formatMAD(entity.netIncomeM, 0)}` : "—"} unit="MAD M" icon={TrendingUp} accent={MARKET} />
        <StatTile label="Total Assets" value={`${formatMAD(entity.assetsM, 0)}`} unit="MAD M" icon={Layers} accent={MARKET} />
        <StatTile label="Mkt Cap" value={entity.mktCapM ? `${formatCompactMAD(entity.mktCapM)}` : "—"} unit="MAD M" icon={Globe2} accent={MARKET} />
        <StatTile label="P/E Ratio" value={entity.peRatio ? entity.peRatio.toFixed(1) : "—"} unit="x" icon={Star} accent={MARKET} />
        <StatTile label="Div Yield" value={entity.dividendYield !== null ? `${entity.dividendYield.toFixed(1)}` : "—"} unit="% annual" icon={Coins} accent={MARKET} />
      </StaggerGrid>

      {/* Charts: radar + sentiment trend + ownership */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <PanelCard accent={MARKET} hover={false}>
          <PanelHeader
            title="Risk Radar — 6 Pillars"
            subtitle="0-100 (higher = riskier)"
            icon={Layers}
            accent={MARKET}
          />
          <div className="p-3">
            <RiskRadar entity={entity} />
          </div>
        </PanelCard>
        <PanelCard accent={MARKET} hover={false}>
          <PanelHeader
            title="Sentiment Trend — 12 months"
            subtitle="Monthly net sentiment (-100..+100)"
            icon={TrendingUp}
            accent={MARKET}
          />
          <div className="p-3">
            <SentimentTrend entity={entity} />
          </div>
        </PanelCard>
        <PanelCard accent={MARKET} hover={false}>
          <PanelHeader
            title="Ownership Structure"
            subtitle="Major shareholders"
            icon={Users}
            accent={MARKET}
          />
          <OwnershipPie entity={entity} />
        </PanelCard>
      </div>

      {/* Pillar breakdown + recent news + leadership */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <PanelCard accent={MARKET} hover={false}>
          <PanelHeader
            title="Pillar Breakdown"
            subtitle="Per-pillar score vs portfolio avg"
            icon={Layers}
            accent={MARKET}
          />
          <div className="flex flex-col gap-3 p-4">
            {(Object.keys(entity.riskPillars) as RiskPillarKey[]).map((p) => {
              const v = entity.riskPillars[p];
              const tone = v >= 70 ? "rose" : v >= 55 ? "amber" : v >= 40 ? "amber" : "emerald";
              const valueTone = v >= 70 ? "text-rose-700" : v >= 55 ? "text-orange-700" : v >= 40 ? "text-amber-700" : "text-emerald-700";
              return (
                <div key={p} className="grid grid-cols-[78px_1fr_36px] items-center gap-2.5">
                  <span className="text-[11px] font-medium text-slate-700">{pillarLabel[p]}</span>
                  <ProgressBar value={v} tone={tone} height={7} />
                  <span className={cn("tabular text-right text-[11px] font-bold", valueTone)}>{v}</span>
                </div>
              );
            })}
          </div>
        </PanelCard>

        <PanelCard accent={MARKET} hover={false}>
          <PanelHeader
            title="Recent News"
            subtitle="Latest coverage across outlets"
            icon={Eye}
            accent={MARKET}
          />
          <div className="divide-y divide-slate-100">
            {entity.lastNews.map((n, i) => {
              const sntTone: "positive" | "negative" | "neutral" =
                n.sentiment === "positive" ? "positive" : n.sentiment === "negative" ? "negative" : "neutral";
              return (
                <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 transition-colors hover:bg-slate-50">
                  <Tag tone={sntTone} size="xs">{n.sentiment}</Tag>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-medium text-slate-800" title={n.title}>{n.title}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="font-medium text-slate-600">{n.outlet}</span>
                      <span>·</span>
                      <span className="tabular">{n.date}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </PanelCard>

        <PanelCard accent={MARKET} hover={false}>
          <PanelHeader
            title="Leadership"
            subtitle="Executives & tenure"
            icon={Users}
            accent={MARKET}
          />
          <div className="harch-scroll max-h-[280px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white">
                <TableRow className="text-[10px] uppercase tracking-wide text-slate-500 hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Since</TableHead>
                  <TableHead className="text-right">Yrs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entity.leadership.map((l) => {
                  const years = 2025 - l.since;
                  return (
                    <TableRow key={l.name} className="text-[12px] hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-800">{l.name}</TableCell>
                      <TableCell className="text-[11px] text-slate-600">{l.role}</TableCell>
                      <TableCell className="tabular text-right text-slate-600">{l.since}</TableCell>
                      <TableCell className="tabular text-right font-semibold text-slate-800">{years}y</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </PanelCard>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function ProfilesSection(_: SectionComponentProps) {
  const ready = useReady(320);
  const [activeId, setActiveId] = React.useState(topProfiles[0]?.id ?? "HRCH");
  const active = topProfiles.find((e) => e.id === activeId) ?? topProfiles[0];

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="ent-profiles"
        accountType="market"
        accent="amber"
        statusChips={
          <>
            <StatusChip label={`${topProfiles.length} deep dossiers`} tone="neutral" icon={Users} />
            <StatusChip label="Financials + Risk + News" tone="neutral" icon={Layers} />
            <StatusChip label="Live" tone="positive" pulse />
          </>
        }
        kpis={
          ready && active ? (
            <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile label="Active Profile" value={active.name.split(" ")[0]} hint={active.ticker ?? "Private"} icon={Building2} accent={MARKET} />
              <StatTile label="Revenue" value={active.revenueM > 0 ? formatCompactMAD(active.revenueM) : "—"} unit="MAD M" icon={Coins} accent={MARKET} />
              <StatTile label="Net Income" value={active.netIncomeM !== 0 ? formatCompactMAD(active.netIncomeM) : "—"} unit="MAD M" icon={TrendingUp} accent={MARKET} />
              <StatTile label="Total Assets" value={formatCompactMAD(active.assetsM)} unit="MAD M" icon={Layers} accent={MARKET} />
              <StatTile label="Risk Score" value={active.riskScore.toFixed(1)} delta="0-100" deltaTone="neutral" hint="Composite" icon={Star} accent={MARKET} />
              <StatTile label="Sentiment" value={`${active.sentiment > 0 ? "+" : ""}${active.sentiment}`} delta="-100..+100" deltaTone="neutral" hint="Net" icon={Eye} accent={MARKET} />
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

      <PanelCard accent={MARKET} hover={false}>
        <PanelHeader
          title="Profile Selector"
          subtitle={`${topProfiles.length} key entities · HarchCorp + MA strategic cos`}
          icon={Users}
          accent={MARKET}
        />
        <div className="p-3">
          <Tabs value={activeId} onValueChange={setActiveId}>
            <TabsList className="flex h-auto w-full flex-wrap gap-1 bg-slate-100 p-1">
              {topProfiles.map((e) => {
                const isHarch = e.type === "self";
                const isActive = e.id === activeId;
                return (
                  <TabsTrigger
                    key={e.id}
                    value={e.id}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm",
                      isHarch && "data-[state=active]:bg-amber-50 data-[state=active]:text-amber-800 data-[state=active]:ring-1 data-[state=active]:ring-amber-300",
                      !isActive && "text-slate-600",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold",
                        isHarch ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-700",
                      )}
                    >
                      {e.ticker ?? e.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="hidden sm:inline">{e.name.split(" ")[0]}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            {topProfiles.map((e) => (
              <TabsContent key={e.id} value={e.id} className="mt-3">
                <ProfileDossier entity={e} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </PanelCard>
    </div>
  );
}
