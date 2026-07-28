"use client";

import * as React from "react";
import {
  Building2,
  ChevronRight,
  Coins,
  Flag,
  MapPin,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { InlineRiskRing, FilterChip, KpiSkeleton, useReady } from "./_shared";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  formatCompact,
  formatCompactMAD,
  formatMAD,
  moroccanCityDistribution,
  moroccanEntities,
  moroccanSectorMktCap,
  sectorColor,
  type Entity,
  type EntitySector,
} from "@/lib/entities-data";
import { cn } from "@/lib/utils";

const MARKET: RoleAccent = "amber";

/* ------------------------------------------------------------------ */
/*  Sector tone mapping (for sector Tag chips)                         */
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

/* ------------------------------------------------------------------ */
/*  Sector market-cap bars (ProgressBar-driven)                        */
/* ------------------------------------------------------------------ */

function SectorMktCapBars() {
  const max = Math.max(...moroccanSectorMktCap.map((s) => s.mktCapM));
  return (
    <div className="flex flex-col gap-2.5 p-4">
      {moroccanSectorMktCap.map((s) => {
        const pct = (s.mktCapM / max) * 100;
        return (
          <div key={s.sector} className="grid grid-cols-[100px_1fr_78px] items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 truncate text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: s.color }} />
              <span className="truncate">{s.sector}</span>
            </span>
            <ProgressBar value={pct} tone="amber" height={7} />
            <span className="tabular text-right text-[10px] font-semibold text-slate-700">
              {formatCompactMAD(s.mktCapM)}M
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Morocco city distribution strip (ProgressBar)                      */
/* ------------------------------------------------------------------ */

function MoroccoCityStrip() {
  const max = Math.max(...moroccanCityDistribution.map((c) => c.count));
  return (
    <div className="flex flex-col gap-2.5 p-4">
      {moroccanCityDistribution.map((c) => {
        const pct = (c.count / max) * 100;
        return (
          <div key={c.city} className="grid grid-cols-[90px_1fr_28px_36px] items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
              <MapPin className="h-3 w-3 text-amber-500" />
              <span className="truncate">{c.city}</span>
            </div>
            <ProgressBar value={pct} tone="amber" height={7} />
            <span className="tabular text-right text-[11px] font-bold text-slate-800">{c.count}</span>
            <span className="tabular text-right text-[10px] text-slate-500">{c.share}%</span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Moroccan company list — grouped by sector with sticky headers      */
/* ------------------------------------------------------------------ */

function MoroccanList({
  rows,
  onSelectEntity,
}: {
  rows: Entity[];
  onSelectEntity: (entityId: string) => void;
}) {
  const grouped = React.useMemo(() => {
    const bySector = new Map<EntitySector, Entity[]>();
    for (const e of rows) {
      const arr = bySector.get(e.sector) ?? [];
      arr.push(e);
      bySector.set(e.sector, arr);
    }
    return Array.from(bySector.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [rows]);

  return (
    <div className="harch-scroll max-h-[640px] overflow-y-auto">
      {grouped.map(([sector, ents]) => {
        const color = sectorColor[sector] ?? "#64748b";
        return (
          <div key={sector} className="border-b border-slate-100 last:border-0">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-slate-50/95 px-3 py-2 backdrop-blur">
              <Tag tone={sectorToneMap[sector] ?? "neutral"} size="sm">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                {sector}
              </Tag>
              <span className="tabular text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {ents.length} {ents.length === 1 ? "entity" : "entities"}
              </span>
            </div>
            <div className="px-2 py-1">
              {ents.map((e) => {
                const isHarch = e.type === "self";
                const lastNews = e.lastNews[0];
                const snt = e.sentiment > 8 ? "text-emerald-700" : e.sentiment < -4 ? "text-rose-700" : "text-slate-500";
                const sectorColorHex = sectorColor[e.sector] ?? "#64748b";
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => onSelectEntity(e.id)}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-amber-50/40",
                      isHarch && "bg-amber-50/30",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ring-1",
                        isHarch
                          ? "bg-amber-100 text-amber-800 ring-amber-300"
                          : "bg-white text-slate-700 ring-slate-200",
                      )}
                      style={!isHarch ? { boxShadow: `inset 0 0 0 1px ${sectorColorHex}22` } : undefined}
                      title={e.name}
                    >
                      {e.ticker ?? e.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-[13px] font-medium text-slate-800" title={e.name}>{e.name}</span>
                        {e.ticker && (
                          <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase text-slate-600">
                            {e.ticker}
                          </span>
                        )}
                        <span className="inline-flex shrink-0 items-center gap-1 text-[10px] text-slate-500">
                          <MapPin className="h-3 w-3 text-amber-500" />
                          {e.hq}
                        </span>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                        <span className="inline-flex items-center gap-0.5">
                          <Users className="h-2.5 w-2.5" /> {formatCompact(e.employees)}
                        </span>
                        {e.revenueM > 0 && (
                          <span className="tabular inline-flex items-center gap-0.5">
                            <Coins className="h-2.5 w-2.5" /> {formatMAD(e.revenueM, 0)}M MAD
                          </span>
                        )}
                        <span className="truncate">· {lastNews?.title ?? "No recent news"}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <InlineRiskRing value={e.riskScore} size={36} stroke={4} />
                      <span className={cn("tabular inline-flex items-center gap-0.5 text-[10px] font-semibold", snt)}>
                        {e.sentiment > 0 ? <TrendingUp className="h-2.5 w-2.5" /> : e.sentiment < 0 ? <TrendingDown className="h-2.5 w-2.5" /> : null}
                        {e.sentiment > 0 ? "+" : ""}{e.sentiment}
                      </span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

const moroccanSectors: EntitySector[] = Array.from(new Set(moroccanEntities.map((e) => e.sector)));

export function MoroccanSection({ onSelectEntity }: SectionComponentProps) {
  const ready = useReady(320);
  const [query, setQuery] = React.useState("");
  const [sectorFilter, setSectorFilter] = React.useState<EntitySector | "all">("all");

  const filtered = React.useMemo(() => {
    return moroccanEntities.filter((e) => {
      if (sectorFilter !== "all" && e.sector !== sectorFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !e.name.toLowerCase().includes(q) &&
          !e.id.toLowerCase().includes(q) &&
          !(e.ticker ?? "").toLowerCase().includes(q) &&
          !e.hq.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [query, sectorFilter]);

  const handleSelectEntity = React.useCallback((id: string) => {
    onSelectEntity(id);
  }, [onSelectEntity]);

  const totalMoroccanMktCap = moroccanEntities.reduce((s, e) => s + (e.mktCapM ?? 0), 0);
  const totalMoroccanEmployees = moroccanEntities.reduce((s, e) => s + e.employees, 0);
  const totalMoroccanRevenue = moroccanEntities.reduce((s, e) => s + e.revenueM, 0);
  const listedCount = moroccanEntities.filter((e) => e.type === "listed").length;
  const privateCount = moroccanEntities.filter((e) => e.type === "private").length;

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="ent-moroccan"
        accountType="market"
        accent="amber"
        statusChips={
          <>
            <StatusChip label={`${moroccanEntities.length} MA entities`} tone="neutral" icon={Flag} />
            <StatusChip label={`${listedCount} BVC-listed`} tone="positive" icon={Building2} />
            <StatusChip label={`${privateCount} private`} tone="neutral" icon={Building2} />
            <StatusChip label="Live" tone="positive" pulse />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile
                label="MA Entities"
                value={`${moroccanEntities.length}`}
                hint="Listed + private + cpty"
                icon={Flag}
                accent={MARKET}
              />
              <StatTile
                label="BVC Listed"
                value={`${listedCount}`}
                delta="Casablanca"
                deltaTone="positive"
                hint="Bourse exchange"
                icon={Building2}
                accent={MARKET}
              />
              <StatTile
                label="Private Cos"
                value={`${privateCount}`}
                delta="Holding + agri"
                deltaTone="neutral"
                hint="Holding + agri + energy"
                icon={Building2}
                accent={MARKET}
              />
              <StatTile
                label="Total Mkt Cap"
                value={formatCompactMAD(totalMoroccanMktCap)}
                unit="MAD M"
                hint="Listed market cap"
                icon={TrendingUp}
                accent={MARKET}
              />
              <StatTile
                label="Total Revenue"
                value={formatCompactMAD(totalMoroccanRevenue)}
                unit="MAD M"
                hint={`${formatCompact(totalMoroccanEmployees)} employees`}
                icon={Users}
                accent={MARKET}
              />
              <StatTile
                label="HQ Cities"
                value={`${moroccanCityDistribution.length}`}
                delta="Casablanca · Rabat"
                deltaTone="neutral"
                hint="Geographic footprint"
                icon={MapPin}
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

      {/* Sector mkt cap + city distribution */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <PanelCard accent={MARKET} className="xl:col-span-2" delay={0.05}>
          <PanelHeader
            title="Moroccan Listed Market Cap by Sector"
            subtitle="BVC-listed only · MAD millions"
            icon={Coins}
            accent={MARKET}
          />
          <SectorMktCapBars />
        </PanelCard>

        <PanelCard accent={MARKET} delay={0.1}>
          <PanelHeader
            title="HQ City Distribution"
            subtitle="Where MA entities are headquartered"
            icon={MapPin}
            accent={MARKET}
          />
          <MoroccoCityStrip />
        </PanelCard>
      </div>

      {/* Sector filter chips + search + list */}
      <PanelCard accent={MARKET} delay={0.15} hover={false}>
        <PanelHeader
          title="Moroccan Companies"
          subtitle={`${filtered.length} of ${moroccanEntities.length} entities · click for full profile`}
          icon={Building2}
          accent={MARKET}
          action={
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search MA company…"
                className="h-8 w-[200px] pl-8 text-[12px]"
              />
            </div>
          }
        />
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-3 py-2.5">
          <span className="card-title mr-1">Sector:</span>
          <FilterChip label="All" active={sectorFilter === "all"} onClick={() => setSectorFilter("all")} />
          {moroccanSectors.map((s) => (
            <FilterChip
              key={s}
              label={s}
              active={sectorFilter === s}
              onClick={() => setSectorFilter(sectorFilter === s ? "all" : s)}
              dot={sectorColor[s] ?? "#64748b"}
            />
          ))}
        </div>
        <MoroccanList rows={filtered} onSelectEntity={handleSelectEntity} />
      </PanelCard>
    </div>
  );
}
