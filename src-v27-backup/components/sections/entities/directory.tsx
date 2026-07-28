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
  Building2,
  ChevronRight,
  Eye,
  Flag,
  Layers,
  Search,
  ShieldAlert,
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
import { Input } from "@/components/ui/input";
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
import { InlineRiskRing, KpiSkeleton, FilterChip, useReady } from "./_shared";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  entityDirectory,
  entitySummary,
  entitiesOverview,
  formatCompact,
  formatCompactMAD,
  formatMAD,
  riskDistribution,
  sectorColor,
  type Entity,
  type EntitySector,
  type EntityStatus,
  type EntityType,
  typeLabel,
} from "@/lib/entities-data";
import { cn } from "@/lib/utils";

const MARKET: RoleAccent = "amber";

/* ------------------------------------------------------------------ */
/*  Sector tag tone mapping                                            */
/* ------------------------------------------------------------------ */

const sectorToneMap: Record<
  EntitySector,
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

const statusToneMap: Record<EntityStatus, "positive" | "warning" | "negative" | "info" | "violet"> = {
  active: "positive",
  watch: "warning",
  restricted: "negative",
  review: "info",
  monitored: "violet",
};

const typeToneMap: Record<EntityType, "amber" | "info" | "slate" | "violet" | "emerald"> = {
  self: "amber",
  listed: "info",
  private: "slate",
  peer: "violet",
  counterparty: "emerald",
};

/* ------------------------------------------------------------------ */
/*  Sortable column header                                             */
/* ------------------------------------------------------------------ */

type SortKey = "name" | "sector" | "type" | "risk" | "sentiment" | "employees" | "revenue";

function SortHeader({
  k,
  label,
  className,
  active,
  dir,
  onClick,
}: {
  k: SortKey;
  label: string;
  className?: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: (k: SortKey) => void;
}) {
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onClick(k)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-slate-800",
          active && "text-slate-900",
        )}
      >
        {label}
        <span className="text-[9px] text-slate-400">
          {active ? (dir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </TableHead>
  );
}

/* ------------------------------------------------------------------ */
/*  Portfolio risk posture panel                                       */
/* ------------------------------------------------------------------ */

function RiskPosturePanel() {
  const score = entitySummary.avgRisk;
  const verdict = score >= 70 ? "Critical" : score >= 55 ? "High" : score >= 40 ? "Medium" : "Low";
  const statusTiles: { label: string; value: number; tone: "positive" | "warning" | "info" | "violet" }[] = [
    { label: "Active", value: entitySummary.byStatus.active ?? 0, tone: "positive" },
    { label: "Watch", value: entitySummary.byStatus.watch ?? 0, tone: "warning" },
    { label: "Review", value: entitySummary.byStatus.review ?? 0, tone: "info" },
    { label: "Monitored", value: entitySummary.byStatus.monitored ?? 0, tone: "violet" },
  ];
  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <MetricRing
        value={score}
        size={140}
        stroke={11}
        label="Avg Risk"
        sublabel={verdict}
      />
      <div className="grid w-full grid-cols-4 gap-1.5">
        {statusTiles.map((s) => (
          <StatusMini key={s.label} label={s.label} value={s.value} tone={s.tone} />
        ))}
      </div>
    </div>
  );
}

function StatusMini({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "positive" | "warning" | "info" | "violet";
}) {
  const cls = {
    positive: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    info: "bg-sky-50 text-sky-700",
    violet: "bg-violet-50 text-violet-700",
  }[tone];
  return (
    <div className={cn("rounded-lg px-1 py-1.5 text-center", cls)}>
      <div className="tabular text-[16px] font-bold leading-none">{value}</div>
      <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide opacity-80">{label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Risk distribution donut                                            */
/* ------------------------------------------------------------------ */

function RiskDonut() {
  const total = riskDistribution.reduce((s, r) => s + r.count, 0);
  return (
    <div className="flex flex-col gap-3 p-4">
      <DeferredChart height="h-[170px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={riskDistribution}
              dataKey="count"
              nameKey="band"
              innerRadius={44}
              outerRadius={72}
              paddingAngle={2}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {riskDistribution.map((r) => (
                <Cell key={r.band} fill={r.color} />
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
                    <div className="tabular text-[14px] font-bold text-slate-900">{v} entities</div>
                    <div className="tabular text-[10px] text-slate-500">{pct}% of portfolio</div>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </DeferredChart>
      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
        {riskDistribution.map((r) => (
          <div key={r.band} className="flex items-center justify-between rounded bg-slate-50 px-2 py-1">
            <span className="flex items-center gap-1.5 truncate text-slate-600">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: r.color }} />
              <span className="truncate">{r.band}</span>
            </span>
            <span className="tabular font-semibold text-slate-800">{r.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Directory table                                                    */
/* ------------------------------------------------------------------ */

function DirectoryTable({
  rows,
  onSelectEntity,
}: {
  rows: Entity[];
  onSelectEntity: (entityId: string) => void;
}) {
  const [sortKey, setSortKey] = React.useState<SortKey>("risk");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(k);
      setSortDir(k === "name" || k === "sector" || k === "type" ? "asc" : "desc");
    }
  };

  const sorted = React.useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      let av: number | string;
      let bv: number | string;
      switch (sortKey) {
        case "name": av = a.name; bv = b.name; break;
        case "sector": av = a.sector; bv = b.sector; break;
        case "type": av = a.type; bv = b.type; break;
        case "risk": av = a.riskScore; bv = b.riskScore; break;
        case "sentiment": av = a.sentiment; bv = b.sentiment; break;
        case "employees": av = a.employees; bv = b.employees; break;
        case "revenue": av = a.revenueM; bv = b.revenueM; break;
        default: av = a.riskScore; bv = b.riskScore;
      }
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
    return arr;
  }, [rows, sortKey, sortDir]);

  return (
    <div className="harch-scroll max-h-[560px] overflow-y-auto">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-white">
          <TableRow className="text-[10px] uppercase tracking-wide text-slate-500 hover:bg-transparent">
            <SortHeader k="name" label="Entity" active={sortKey === "name"} dir={sortDir} onClick={toggleSort} />
            <SortHeader k="sector" label="Sector" active={sortKey === "sector"} dir={sortDir} onClick={toggleSort} />
            <SortHeader k="type" label="Type" active={sortKey === "type"} dir={sortDir} onClick={toggleSort} />
            <TableHead>HQ</TableHead>
            <SortHeader k="risk" label="Risk" className="text-center" active={sortKey === "risk"} dir={sortDir} onClick={toggleSort} />
            <SortHeader k="sentiment" label="Sentiment" className="text-right" active={sortKey === "sentiment"} dir={sortDir} onClick={toggleSort} />
            <SortHeader k="employees" label="Employees" className="text-right" active={sortKey === "employees"} dir={sortDir} onClick={toggleSort} />
            <SortHeader k="revenue" label="Revenue (MAD M)" className="text-right" active={sortKey === "revenue"} dir={sortDir} onClick={toggleSort} />
            <TableHead>Last News</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((e) => {
            const isHarch = e.type === "self";
            const snt = e.sentiment > 8 ? "text-emerald-700" : e.sentiment < -4 ? "text-rose-700" : "text-slate-500";
            const lastNews = e.lastNews[0];
            const sectorColorHex = sectorColor[e.sector as EntitySector] ?? "#64748b";
            return (
              <TableRow
                key={e.id}
                onClick={() => onSelectEntity(e.id)}
                className={cn(
                  "cursor-pointer text-[12px] transition-colors hover:bg-amber-50/40",
                  isHarch && "bg-amber-50/30",
                )}
              >
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ring-1",
                        isHarch
                          ? "bg-amber-100 text-amber-800 ring-amber-300"
                          : "bg-slate-50 text-slate-700 ring-slate-200",
                      )}
                      style={!isHarch ? { boxShadow: `inset 0 0 0 1px ${sectorColorHex}22` } : undefined}
                      title={e.name}
                    >
                      {e.ticker ?? e.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-slate-800" title={e.name}>{e.name}</div>
                      <div className="text-[10px] uppercase tracking-wide text-slate-400">
                        {e.ticker ? `${e.ticker} · ${e.id}` : e.id}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Tag tone={sectorToneMap[e.sector as EntitySector] ?? "neutral"} size="xs">
                    {e.sector}
                  </Tag>
                </TableCell>
                <TableCell>
                  <Tag tone={typeToneMap[e.type as EntityType]} size="xs">
                    {typeLabel[e.type as EntityType]}
                  </Tag>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-[11px] text-slate-600">
                    {e.country === "Morocco" ? <Flag className="h-3 w-3 text-amber-500" /> : <Building2 className="h-3 w-3 text-slate-400" />}
                    <span className="truncate">{e.hq}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <InlineRiskRing value={e.riskScore} />
                </TableCell>
                <TableCell className="text-right">
                  <span className={cn("tabular inline-flex items-center justify-end gap-1 text-[11px] font-semibold", snt)}>
                    {e.sentiment > 0 ? <TrendingUp className="h-3 w-3" /> : e.sentiment < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                    {e.sentiment > 0 ? "+" : ""}{e.sentiment}
                  </span>
                </TableCell>
                <TableCell className="tabular text-right text-slate-700">{formatCompact(e.employees)}</TableCell>
                <TableCell className="tabular text-right text-slate-700">
                  {e.revenueM > 0 ? formatMAD(e.revenueM, 0) : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="truncate text-[11px] text-slate-700" title={lastNews?.title}>{lastNews?.title ?? "—"}</span>
                    <span className="text-[10px] text-slate-400">{lastNews?.outlet} · {lastNews?.date}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Tag tone={statusToneMap[e.status]} size="xs">{e.status}</Tag>
                </TableCell>
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

const allSectors: EntitySector[] = Array.from(new Set(entityDirectory.map((e) => e.sector)));
const allTypes: EntityType[] = ["listed", "private", "peer", "counterparty", "self"];
const allStatuses: EntityStatus[] = ["active", "watch", "review", "monitored", "restricted"];
const maxSectorCount = Math.max(...Object.values(entitySummary.bySector));

export function DirectorySection({ onSelectEntity }: SectionComponentProps) {
  const ready = useReady(320);
  const [query, setQuery] = React.useState("");
  const [sectorFilter, setSectorFilter] = React.useState<EntitySector | "all">("all");
  const [typeFilter, setTypeFilter] = React.useState<EntityType | "all">("all");
  const [statusFilter, setStatusFilter] = React.useState<EntityStatus | "all">("all");

  const filtered = React.useMemo(() => {
    return entityDirectory.filter((e) => {
      if (sectorFilter !== "all" && e.sector !== sectorFilter) return false;
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !e.name.toLowerCase().includes(q) &&
          !e.id.toLowerCase().includes(q) &&
          !(e.ticker ?? "").toLowerCase().includes(q) &&
          !e.sector.toLowerCase().includes(q) &&
          !e.hq.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [query, sectorFilter, typeFilter, statusFilter]);

  const handleSelectEntity = React.useCallback((id: string) => {
    onSelectEntity(id);
  }, [onSelectEntity]);

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="ent-directory"
        accountType="market"
        accent="amber"
        statusChips={
          <>
            <StatusChip label={`${entitiesOverview.totalEntities} entities`} tone="neutral" icon={Building2} />
            <StatusChip label={`${entitiesOverview.highRisk} high risk`} tone={entitiesOverview.highRisk > 0 ? "warning" : "neutral"} icon={ShieldAlert} />
            <StatusChip label={`${entitiesOverview.watchlisted} watchlisted`} tone="positive" icon={Eye} />
            <StatusChip label="Live" tone="positive" icon={Activity} pulse />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile
                label="Total Entities"
                value={`${entitiesOverview.totalEntities}`}
                hint="Across 5 types"
                icon={Building2}
                accent={MARKET}
              />
              <StatTile
                label="Avg Risk Score"
                value={`${entitiesOverview.avgRisk}`}
                delta="0-100"
                deltaTone="neutral"
                hint="Composite"
                icon={ShieldAlert}
                accent={MARKET}
              />
              <StatTile
                label="High / Critical"
                value={`${entitiesOverview.highRisk}`}
                delta={`C: ${entitiesOverview.criticalRisk}`}
                deltaTone="negative"
                hint="risk ≥ 60"
                icon={ShieldAlert}
                accent={MARKET}
              />
              <StatTile
                label="Avg Sentiment"
                value={`${entitiesOverview.avgSentiment > 0 ? "+" : ""}${entitiesOverview.avgSentiment}`}
                delta="-100..+100"
                deltaTone="neutral"
                hint="Net sentiment"
                icon={TrendingUp}
                accent={MARKET}
              />
              <StatTile
                label="Watchlisted"
                value={`${entitiesOverview.watchlisted}`}
                delta="tracked"
                deltaTone="positive"
                hint="Tracked entities"
                icon={Eye}
                accent={MARKET}
              />
              <StatTile
                label="Total Employees"
                value={formatCompact(entitiesOverview.totalEmployees)}
                hint={`Rev ${formatCompactMAD(entitiesOverview.totalRevenueM)} MAD M`}
                icon={Users}
                accent={MARKET}
              />
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

      {/* Summary: risk posture + risk distribution + sector breakdown */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <PanelCard accent={MARKET} delay={0.05}>
          <PanelHeader
            title="Portfolio Risk Posture"
            subtitle="Avg risk + status distribution"
            icon={ShieldAlert}
            accent={MARKET}
          />
          <RiskPosturePanel />
        </PanelCard>

        <PanelCard accent={MARKET} delay={0.1}>
          <PanelHeader
            title="Risk Distribution"
            subtitle="Entities by risk band"
            icon={Layers}
            accent={MARKET}
          />
          <RiskDonut />
        </PanelCard>

        <PanelCard accent={MARKET} delay={0.15}>
          <PanelHeader
            title="By Sector"
            subtitle="Entity count per sector · click to filter"
            icon={Building2}
            accent={MARKET}
          />
          <div className="harch-scroll max-h-[280px] overflow-y-auto p-3">
            <div className="flex flex-col gap-2">
              {allSectors.map((sec) => {
                const count = entitySummary.bySector[sec] ?? 0;
                const pct = Math.round((count / entitySummary.total) * 1000) / 10;
                const color = sectorColor[sec] ?? "#64748b";
                const isActive = sectorFilter === sec;
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSectorFilter(sectorFilter === sec ? "all" : sec)}
                    className={cn(
                      "group grid grid-cols-[110px_1fr_28px_36px] items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-slate-50",
                      isActive && "bg-amber-50 ring-1 ring-inset ring-amber-200",
                    )}
                  >
                    <span className="inline-flex items-center gap-1.5 truncate text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
                      <span className="truncate">{sec}</span>
                    </span>
                    <ProgressBar value={count} max={maxSectorCount} tone="amber" height={5} />
                    <span className="tabular text-right text-[11px] font-semibold text-slate-700">{count}</span>
                    <span className="tabular text-right text-[10px] text-slate-500">{pct}%</span>
                  </button>
                );
              })}
            </div>
          </div>
        </PanelCard>
      </div>

      {/* Filters + directory table */}
      <PanelCard accent={MARKET} delay={0.2} hover={false}>
        <PanelHeader
          title="Entity Directory"
          subtitle={`${filtered.length} of ${entityDirectory.length} entities · click a row for full profile`}
          icon={Building2}
          accent={MARKET}
          action={
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, ticker, sector, HQ…"
                className="h-8 w-[220px] pl-8 text-[12px]"
              />
            </div>
          }
        />
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-3 py-2.5">
          <span className="card-title mr-1">Type:</span>
          <FilterChip label="All" active={typeFilter === "all"} onClick={() => setTypeFilter("all")} />
          {allTypes.map((t) => (
            <FilterChip key={t} label={typeLabel[t]} active={typeFilter === t} onClick={() => setTypeFilter(typeFilter === t ? "all" : t)} />
          ))}
          <span className="mx-2 h-3 w-px bg-slate-200" />
          <span className="card-title mr-1">Status:</span>
          <FilterChip label="All" active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
          {allStatuses.map((s) => (
            <FilterChip key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(statusFilter === s ? "all" : s)} />
          ))}
          <span className="mx-2 h-3 w-px bg-slate-200" />
          <span className="card-title mr-1">Sector:</span>
          <FilterChip label="All" active={sectorFilter === "all"} onClick={() => setSectorFilter("all")} />
          {allSectors.slice(0, 6).map((s) => (
            <FilterChip
              key={s}
              label={s}
              active={sectorFilter === s}
              onClick={() => setSectorFilter(sectorFilter === s ? "all" : s)}
              dot={sectorColor[s] ?? "#64748b"}
            />
          ))}
        </div>
        <DirectoryTable rows={filtered} onSelectEntity={handleSelectEntity} />
      </PanelCard>
    </div>
  );
}
