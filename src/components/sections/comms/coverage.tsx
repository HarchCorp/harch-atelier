"use client";

/**
 * Comms Coverage — Figma-grade rework (V18.0)
 *
 * Composition:
 *  - 6 StatTile KPIs (rose accent) with 320ms mount skeleton
 *  - 30-day coverage volume stacked area (crisis-spike highlighted)
 *  - Top outlets horizontal bars (color-coded by tier)
 *  - Coverage feed table (tier/sentiment/lang filters + search)
 *  - Article rows with Tag badges for tier / sentiment / language
 */
import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Filter,
  Globe2,
  Languages,
  Newspaper,
  Search,
  Signal,
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
} from "../design-system";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  coverageArticles,
  coverageSummary,
  coverageVolume30d,
  formatDate,
  formatCompact,
  relativeTime,
  sentimentTint,
  topOutlets,
  type ArticleTier,
  type CoverageArticle,
  type Language,
  type Sentiment,
} from "@/lib/comms-data";
import { cn } from "@/lib/utils";
import {
  KpiSkeletonGrid,
  PanelSkeletons,
  PR,
  PremiumTooltip,
  useMountReady,
} from "./_shared";

type SortKey = "publishedAt" | "outlet" | "tier" | "reach" | "sentiment" | "language" | "region";
type TierFilter = ArticleTier | "all";
type SentimentFilter = Sentiment | "all";
type LanguageFilter = Language | "all";

const tierMeta: Record<ArticleTier, { label: string; tone: "rose" | "amber" | "neutral"; color: string }> = {
  tier1: { label: "Tier 1", tone: "rose", color: "#e11d48" },
  tier2: { label: "Tier 2", tone: "amber", color: "#f59e0b" },
  tier3: { label: "Tier 3", tone: "neutral", color: "#94a3b8" },
};

const languageMeta: Record<Language, string> = {
  fr: "Français",
  ar: "العربية",
  en: "English",
};

const regionFlag: Record<string, string> = {
  Morocco: "🇲🇦",
  EU: "🇪🇺",
  US: "🇺🇸",
  MENA: "🌍",
  SSA: "🌍",
  APAC: "🌏",
  LATAM: "🌎",
};

/* ------------------------------------------------------------------ */
/*  Coverage volume 30d stacked area                                   */
/* ------------------------------------------------------------------ */

function CoverageVolumeArea() {
  return (
    <DeferredChart height="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={coverageVolume30d} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="covPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="covNeu" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="covNeg" x1="0" y1="0" x2="0" y2="1">
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
              const total = pos + neu + neg;
              return (
                <PremiumTooltip
                  header={label}
                  rows={[
                    { label: "Positive", value: `${pos}`, tone: "emerald", dot: "#10b981" },
                    { label: "Neutral", value: `${neu}`, tone: "slate", dot: "#94a3b8" },
                    { label: "Negative", value: `${neg}`, tone: "rose", dot: "#f43f5e" },
                    { label: "Total", value: `${total}`, tone: "default" },
                  ]}
                />
              );
            }}
          />
          <Area type="monotone" dataKey="positive" stackId="1" stroke="#10b981" strokeWidth={1.4} fill="url(#covPos)" />
          <Area type="monotone" dataKey="neutral" stackId="1" stroke="#94a3b8" strokeWidth={1.2} fill="url(#covNeu)" />
          <Area type="monotone" dataKey="negative" stackId="1" stroke="#f43f5e" strokeWidth={1.4} fill="url(#covNeg)" />
        </AreaChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Top outlets by reach (horizontal bars)                             */
/* ------------------------------------------------------------------ */

function TopOutletsBars() {
  const data = topOutlets.slice().sort((a, b) => a.reach - b.reach);
  const maxReach = Math.max(...data.map((d) => d.reach), 1);
  return (
    <DeferredChart height="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 10, right: 16, left: 8, bottom: 0 }} barCategoryGap="14%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
          />
          <YAxis
            type="category"
            dataKey="outlet"
            tick={{ fontSize: 10, fill: "#475569" }}
            axisLine={false}
            tickLine={false}
            width={130}
          />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              const item = payload[0];
              const tier = (item.payload as { tier: ArticleTier }).tier;
              return (
                <PremiumTooltip
                  header={label}
                  rows={[
                    { label: "Reach", value: Number(item.value).toLocaleString(), tone: "rose" },
                    { label: "Tier", value: tierMeta[tier].label, tone: "default" },
                    { label: "Articles", value: String(item.payload?.articles ?? "—"), tone: "default" },
                  ]}
                />
              );
            }}
          />
          <Bar dataKey="reach" barSize={16} radius={[0, 4, 4, 0]} name="Reach">
            {data.map((d) => (
              <Cell key={d.outlet} fill={tierMeta[d.tier].color} fillOpacity={0.4 + (d.reach / maxReach) * 0.6} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Filter chip button                                                 */
/* ------------------------------------------------------------------ */

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 transition-all",
        active ? "bg-rose-700 text-white ring-rose-700" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function CommsCoverage(_: SectionComponentProps) {
  const ready = useMountReady(320);
  const [sortKey, setSortKey] = React.useState<SortKey>("publishedAt");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [tierFilter, setTierFilter] = React.useState<TierFilter>("all");
  const [sentimentFilter, setSentimentFilter] = React.useState<SentimentFilter>("all");
  const [languageFilter, setLanguageFilter] = React.useState<LanguageFilter>("all");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    let list = coverageArticles.slice();
    if (tierFilter !== "all") list = list.filter((a) => a.tier === tierFilter);
    if (sentimentFilter !== "all") list = list.filter((a) => a.sentiment === sentimentFilter);
    if (languageFilter !== "all") list = list.filter((a) => a.language === languageFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.headline.toLowerCase().includes(q) ||
          a.outlet.toLowerCase().includes(q) ||
          a.author.toLowerCase().includes(q) ||
          a.region.toLowerCase().includes(q),
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (sortKey === "publishedAt") return (Date.parse(a.publishedAt) - Date.parse(b.publishedAt)) * dir;
      if (sortKey === "reach") return (a.reach - b.reach) * dir;
      if (sortKey === "tier") return a.tier.localeCompare(b.tier) * dir;
      if (sortKey === "sentiment") return a.sentiment.localeCompare(b.sentiment) * dir;
      return String(a[sortKey]).localeCompare(String(b[sortKey])) * dir;
    });
    return list;
  }, [tierFilter, sentimentFilter, languageFilter, query, sortKey, sortDir]);

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

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="comms-coverage"
        accountType="pr"
        accent="rose"
        statusChips={
          <>
            <StatusChip label={`${coverageSummary.totalArticles} articles`} tone="neutral" icon={Newspaper} />
            <StatusChip label={`${coverageSummary.crisisSpikes} crisis spike`} tone="negative" icon={AlertTriangle} pulse />
            <StatusChip label={`FR ${coverageSummary.fr} · AR ${coverageSummary.ar} · EN ${coverageSummary.en}`} tone="neutral" icon={Languages} />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile
                label="Articles (30d)"
                value={`${coverageSummary.totalArticles}`}
                hint="Tracked coverage"
                icon={Newspaper}
                accent={PR}
              />
              <StatTile
                label="Total Reach"
                value={`${(coverageSummary.totalReach / 1_000_000).toFixed(1)}M`}
                hint="Aggregate impressions"
                icon={Signal}
                accent={PR}
              />
              <StatTile
                label="Positive"
                value={`${coverageSummary.positive}`}
                delta={`${Math.round((coverageSummary.positive / coverageSummary.totalArticles) * 100)}%`}
                deltaTone="positive"
                hint="Of total coverage"
                icon={Newspaper}
                accent={PR}
              />
              <StatTile
                label="Negative"
                value={`${coverageSummary.negative}`}
                delta={`${Math.round((coverageSummary.negative / coverageSummary.totalArticles) * 100)}%`}
                deltaTone="negative"
                hint="Of total coverage"
                icon={AlertTriangle}
                accent={PR}
              />
              <StatTile
                label="Tier-1 Coverage"
                value={`${coverageSummary.tier1}`}
                hint="Top-tier press"
                icon={Globe2}
                accent={PR}
              />
              <StatTile
                label="Morocco Region"
                value={`${coverageSummary.morocco}`}
                hint="Moroccan outlets"
                icon={Globe2}
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
          {/* Coverage volume + top outlets */}
          <StaggerGrid className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <PanelCard accent={PR} delay={0.05}>
              <PanelHeader
                title="Coverage Volume — 30 days"
                subtitle="Positive / neutral / negative articles per day"
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
                <CoverageVolumeArea />
              </div>
            </PanelCard>
            <PanelCard accent={PR} delay={0.1}>
              <PanelHeader
                title="Top Outlets by Reach"
                subtitle="Aggregate readership · color-coded by tier"
                icon={Globe2}
                accent={PR}
                action={
                  <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wide">
                    <span className="inline-flex items-center gap-1 text-rose-700">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#e11d48" }} /> T1
                    </span>
                    <span className="inline-flex items-center gap-1 text-amber-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> T2
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> T3
                    </span>
                  </div>
                }
              />
              <div className="p-4">
                <TopOutletsBars />
              </div>
            </PanelCard>
          </StaggerGrid>

          {/* Article feed table */}
          <PanelCard accent={PR} delay={0.15}>
            <PanelHeader
              title="Coverage Feed"
              subtitle="Article-level coverage · sortable + filterable"
              icon={Newspaper}
              accent={PR}
              action={
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search headline, outlet, author…"
                    className="h-7 w-52 pl-7 text-[11px] sm:w-64"
                  />
                </div>
              }
            />
            {/* Filter chips */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-3 py-2.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <Filter className="h-3 w-3" /> Tier
              </span>
              <FilterChip active={tierFilter === "all"} onClick={() => setTierFilter("all")}>
                All
              </FilterChip>
              {(Object.keys(tierMeta) as ArticleTier[]).map((t) => (
                <FilterChip key={t} active={tierFilter === t} onClick={() => setTierFilter(t)}>
                  {tierMeta[t].label}
                </FilterChip>
              ))}
              <span className="mx-1 h-3 w-px bg-slate-200" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Sentiment</span>
              <FilterChip active={sentimentFilter === "all"} onClick={() => setSentimentFilter("all")}>
                All
              </FilterChip>
              {(["positive", "neutral", "negative"] as Sentiment[]).map((s) => (
                <FilterChip key={s} active={sentimentFilter === s} onClick={() => setSentimentFilter(s)}>
                  <span className="capitalize">{s}</span>
                </FilterChip>
              ))}
              <span className="mx-1 h-3 w-px bg-slate-200" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Lang</span>
              <FilterChip active={languageFilter === "all"} onClick={() => setLanguageFilter("all")}>
                All
              </FilterChip>
              {(["fr", "ar", "en"] as Language[]).map((l) => (
                <FilterChip key={l} active={languageFilter === l} onClick={() => setLanguageFilter(l)}>
                  {l.toUpperCase()}
                </FilterChip>
              ))}
            </div>

            <div className="harch-scroll max-h-[640px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-white">
                  <TableRow className="text-[10px] uppercase tracking-wide text-slate-500">
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("publishedAt")}>
                        Date {renderSortIcon("publishedAt")}
                      </button>
                    </TableHead>
                    <TableHead className="min-w-[280px]">Headline</TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("outlet")}>
                        Outlet {renderSortIcon("outlet")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("tier")}>
                        Tier {renderSortIcon("tier")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("sentiment")}>
                        Sentiment {renderSortIcon("sentiment")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("reach")}>
                        Reach {renderSortIcon("reach")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("language")}>
                        Lang {renderSortIcon("language")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("region")}>
                        Region {renderSortIcon("region")}
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a: CoverageArticle) => {
                    const tier = tierMeta[a.tier];
                    const sen = sentimentTint[a.sentiment];
                    return (
                      <TableRow key={a.id} className="text-[12px] transition-colors hover:bg-slate-50">
                        <TableCell className="tabular whitespace-nowrap text-slate-500">
                          <div className="flex flex-col">
                            <span>{formatDate(a.publishedAt)}</span>
                            <span className="text-[10px] text-slate-400">{relativeTime(a.publishedAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[320px]">
                          <a href={a.url} className="group flex flex-col" title={a.headline}>
                            <span
                              className="truncate text-slate-700 group-hover:text-rose-700 group-hover:underline"
                              title={a.headline}
                            >
                              {a.headline}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              by {a.author} · {a.id}
                            </span>
                          </a>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-slate-700">{a.outlet}</TableCell>
                        <TableCell>
                          <Tag tone={tier.tone} size="xs">
                            {tier.label}
                          </Tag>
                        </TableCell>
                        <TableCell>
                          <Tag
                            tone={
                              a.sentiment === "positive"
                                ? "positive"
                                : a.sentiment === "negative"
                                  ? "negative"
                                  : "neutral"
                            }
                            size="xs"
                          >
                            <span className={cn("h-1.5 w-1.5 rounded-full", sen.dot)} />
                            {a.sentiment}
                          </Tag>
                        </TableCell>
                        <TableCell className="tabular whitespace-nowrap text-right text-slate-700">
                          {formatCompact(a.reach)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-slate-600">
                          <Tag tone="neutral" size="xs">
                            {a.language.toUpperCase()}
                          </Tag>
                          <span className="ml-1 text-[10px] text-slate-400">{languageMeta[a.language]}</span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-slate-600">
                          <span className="inline-flex items-center gap-1.5">
                            <span>{regionFlag[a.region] ?? "🌍"}</span>
                            <span>{a.region}</span>
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-[12px] text-slate-400">
                        No articles match the current filters.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </PanelCard>
        </>
      ) : (
        <PanelSkeletons count={3} />
      )}
    </div>
  );
}
