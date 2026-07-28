"use client";

/**
 * Comms Sentiment — Figma-grade rework (V18.0)
 *
 * Composition:
 *  - 6 StatTile KPIs (rose accent) with 320ms mount skeleton
 *  - 12-month sentiment multi-line chart (positive / neutral / negative)
 *  - Sentiment by outlet tier stacked bars
 *  - Sentiment by language donut (FR / AR / EN)
 *  - Sentiment by channel radar (print / online / social / broadcast)
 *  - Top sentiment drivers table (sortable, pillar Tag + delta Tag)
 */
import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Globe2,
  Layers,
  Smile,
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
  StaggerGrid,
} from "../design-system";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  sentimentByChannel,
  sentimentByLanguage,
  sentimentByTier,
  sentimentDrivers,
  sentimentSummary,
  sentimentTint,
  sentimentTrend12m,
  type SentimentDriver,
} from "@/lib/comms-data";
import { cn } from "@/lib/utils";
import {
  KpiSkeletonGrid,
  PanelSkeletons,
  PR,
  PremiumTooltip,
  useMountReady,
} from "./_shared";

type SortKey = "topic" | "sentiment" | "mentions" | "delta" | "pillar";

const pillarColor: Record<SentimentDriver["pillar"], string> = {
  Regulatory: "#7c3aed",
  Financial: "#10b981",
  ESG: "#14b8a6",
  Cyber: "#a855f7",
  Reputational: "#f43f5e",
  Operational: "#f59e0b",
};

const pillarTone: Record<SentimentDriver["pillar"], "violet" | "emerald" | "cyan" | "rose" | "amber"> = {
  Regulatory: "violet",
  Financial: "emerald",
  ESG: "cyan",
  Cyber: "violet",
  Reputational: "rose",
  Operational: "amber",
};

/* ------------------------------------------------------------------ */
/*  12-month sentiment multi-line                                      */
/* ------------------------------------------------------------------ */

function SentimentTrendArea() {
  return (
    <DeferredChart height="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sentimentTrend12m} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
            minTickGap={12}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={32}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              const pos = Number(payload.find((p) => p.dataKey === "positive")?.value ?? 0);
              const neu = Number(payload.find((p) => p.dataKey === "neutral")?.value ?? 0);
              const neg = Number(payload.find((p) => p.dataKey === "negative")?.value ?? 0);
              return (
                <PremiumTooltip
                  header={label}
                  rows={[
                    { label: "Positive", value: `${pos}`, tone: "emerald", dot: "#10b981" },
                    { label: "Neutral", value: `${neu}`, tone: "slate", dot: "#94a3b8" },
                    { label: "Negative", value: `${neg}`, tone: "rose", dot: "#f43f5e" },
                    { label: "Total", value: `${pos + neu + neg}`, tone: "default" },
                  ]}
                />
              );
            }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 10, paddingTop: 6 }}
            formatter={(value) => (
              <span className="text-[10px] capitalize text-slate-600">{value}</span>
            )}
          />
          <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2.4} dot={false} name="Positive" />
          <Line type="monotone" dataKey="neutral" stroke="#94a3b8" strokeWidth={1.6} dot={false} strokeDasharray="4 4" name="Neutral" />
          <Line type="monotone" dataKey="negative" stroke="#f43f5e" strokeWidth={2.4} dot={false} name="Negative" />
        </LineChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Sentiment by tier stacked bars                                     */
/* ------------------------------------------------------------------ */

function SentimentByTierBars() {
  return (
    <DeferredChart height="h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sentimentByTier} margin={{ top: 10, right: 12, left: 0, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="tier"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
            tickFormatter={(v) => v.replace("tier", "Tier ")}
          />
          <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={28} unit="%" />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              const pos = Number(payload.find((p) => p.dataKey === "positive")?.value ?? 0);
              const neu = Number(payload.find((p) => p.dataKey === "neutral")?.value ?? 0);
              const neg = Number(payload.find((p) => p.dataKey === "negative")?.value ?? 0);
              return (
                <PremiumTooltip
                  header={label.replace("tier", "Tier ")}
                  rows={[
                    { label: "Positive", value: `${pos}%`, tone: "emerald", dot: "#10b981" },
                    { label: "Neutral", value: `${neu}%`, tone: "slate", dot: "#94a3b8" },
                    { label: "Negative", value: `${neg}%`, tone: "rose", dot: "#f43f5e" },
                  ]}
                />
              );
            }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 10, paddingTop: 6 }}
            formatter={(value) => (
              <span className="text-[10px] capitalize text-slate-600">{value}</span>
            )}
          />
          <Bar dataKey="positive" stackId="a" fill="#10b981" barSize={42} name="Positive" />
          <Bar dataKey="neutral" stackId="a" fill="#94a3b8" barSize={42} name="Neutral" />
          <Bar dataKey="negative" stackId="a" fill="#f43f5e" radius={[3, 3, 0, 0]} barSize={42} name="Negative" />
        </BarChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Sentiment by language donut (FR / AR / EN)                         */
/* ------------------------------------------------------------------ */

function SentimentByLanguageDonut() {
  const total = sentimentByLanguage.reduce((s, l) => s + l.articles, 0);
  const langColors: Record<string, string> = { fr: "#e11d48", ar: "#10b981", en: "#0ea5e9" };
  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sentimentByLanguage}
              dataKey="articles"
              nameKey="label"
              innerRadius={54}
              outerRadius={88}
              paddingAngle={2}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {sentimentByLanguage.map((l) => (
                <Cell key={l.language} fill={langColors[l.language]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0];
                const pct = Math.round((Number(p.value) / total) * 1000) / 10;
                const lang = sentimentByLanguage.find((l) => l.label === p.name);
                return (
                  <PremiumTooltip
                    header={String(p.name)}
                    rows={[
                      { label: "Articles", value: Number(p.value).toLocaleString() },
                      { label: "Share", value: `${pct}%`, tone: "rose" },
                      ...(lang
                        ? [
                            { label: "Positive", value: `${lang.positive}%`, tone: "emerald" as const },
                            { label: "Negative", value: `${lang.negative}%`, tone: "rose" as const },
                          ]
                        : []),
                    ]}
                  />
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[9px] uppercase tracking-wide text-slate-400">Total</span>
          <span className="tabular text-[20px] font-bold text-slate-900">
            {total.toLocaleString()}
          </span>
          <span className="text-[9px] uppercase tracking-wide text-slate-400">articles</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {sentimentByLanguage.map((l) => (
          <div
            key={l.language}
            className="flex flex-col items-center rounded-md bg-slate-50 px-2 py-1.5 ring-1 ring-slate-100"
          >
            <span className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <span className="h-2 w-2 rounded-full" style={{ background: langColors[l.language] }} />
              {l.label}
            </span>
            <span className="tabular mt-0.5 text-[12px] font-bold text-slate-800">
              {l.articles.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sentiment by channel radar                                         */
/* ------------------------------------------------------------------ */

const channelLabels: Record<string, string> = {
  print: "Print",
  online: "Online",
  social: "Social",
  broadcast: "Broadcast",
};

function SentimentByChannelRadar() {
  const data = sentimentByChannel.map((c) => ({
    channel: channelLabels[c.channel],
    positive: c.positive,
    neutral: c.neutral,
    negative: c.negative,
  }));
  return (
    <DeferredChart height="h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="channel" tick={{ fontSize: 10, fill: "#475569" }} />
          <PolarRadiusAxis type="number" domain={[0, 60]} tick={false} axisLine={false} />
          <Radar name="Positive" dataKey="positive" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.2} />
          <Radar name="Neutral" dataKey="neutral" stroke="#94a3b8" strokeWidth={1.4} fill="#94a3b8" fillOpacity={0.08} />
          <Radar name="Negative" dataKey="negative" stroke="#f43f5e" strokeWidth={2} fill="#f43f5e" fillOpacity={0.2} />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 10, paddingTop: 6 }}
            formatter={(value) => (
              <span className="text-[10px] capitalize text-slate-600">{value}</span>
            )}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              return (
                <PremiumTooltip
                  header={label}
                  rows={payload.map((p) => ({
                    label: String(p.dataKey ?? "").replace(/^\w/, (c) => c.toUpperCase()),
                    value: `${p.value}%`,
                    tone:
                      p.dataKey === "positive" ? "emerald" : p.dataKey === "negative" ? "rose" : "slate",
                  }))}
                />
              );
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function CommsSentiment(_: SectionComponentProps) {
  const ready = useMountReady(320);
  const [sortKey, setSortKey] = React.useState<SortKey>("sentiment");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");

  const filtered = React.useMemo(() => {
    const list = sentimentDrivers.slice();
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (sortKey === "topic" || sortKey === "pillar") return String(a[sortKey]).localeCompare(String(b[sortKey])) * dir;
      if (sortKey === "sentiment" || sortKey === "delta") return (a[sortKey] - b[sortKey]) * dir;
      if (sortKey === "mentions") return (a.mentions - b.mentions) * dir;
      return 0;
    });
    return list;
  }, [sortKey, sortDir]);

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
        sectionId="comms-sentiment"
        accountType="pr"
        accent="rose"
        statusChips={
          <>
            <StatusChip label={`Net ${sentimentSummary.netSentiment >= 0 ? "+" : ""}${sentimentSummary.netSentiment}`} tone="positive" icon={Smile} />
            <StatusChip label={`${sentimentSummary.totalArticles.toLocaleString()} articles`} tone="neutral" icon={Layers} />
            <StatusChip label="FR / AR / EN" tone="neutral" icon={Globe2} />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile
                label="Total Articles (12m)"
                value={sentimentSummary.totalArticles.toLocaleString()}
                hint="FR + AR + EN outlets"
                icon={Layers}
                accent={PR}
              />
              <StatTile
                label="Positive Share"
                value={`${sentimentSummary.positiveShare}%`}
                delta="+share"
                deltaTone="positive"
                hint="Across all languages"
                icon={TrendingUp}
                accent={PR}
              />
              <StatTile
                label="Negative Share"
                value={`${sentimentSummary.negativeShare}%`}
                delta="-share"
                deltaTone="negative"
                hint="Across all languages"
                icon={TrendingDown}
                accent={PR}
              />
              <StatTile
                label="Net Sentiment"
                value={`${sentimentSummary.netSentiment >= 0 ? "+" : ""}${sentimentSummary.netSentiment}`}
                hint="Pos% − Neg%"
                icon={Smile}
                accent={PR}
              />
              <StatTile
                label="Avg Monthly Volume"
                value={sentimentSummary.avgMonthlyVolume.toLocaleString()}
                hint="Trailing 12 months"
                icon={Layers}
                accent={PR}
              />
              <StatTile
                label="Tier-1 Sentiment"
                value={`${sentimentSummary.tier1Count}%`}
                hint="Top-tier press split"
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
          {/* 12m trend (full width) */}
          <PanelCard accent={PR} delay={0.05}>
            <PanelHeader
              title="Sentiment Trend — 12 months"
              subtitle="Positive vs neutral vs negative article volume · GLM-4 classified"
              icon={Smile}
              accent={PR}
              action={
                <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wide">
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Positive
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300" /> Neutral
                  </span>
                  <span className="inline-flex items-center gap-1 text-rose-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Negative
                  </span>
                </div>
              }
            />
            <div className="p-4">
              <SentimentTrendArea />
            </div>
          </PanelCard>

          {/* Tier + Language + Channel */}
          <StaggerGrid className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <PanelCard accent={PR} delay={0.1}>
              <PanelHeader
                title="Sentiment by Outlet Tier"
                subtitle="Tier-1 vs tier-2 vs tier-3"
                icon={Layers}
                accent={PR}
              />
              <div className="p-4">
                <SentimentByTierBars />
              </div>
            </PanelCard>
            <PanelCard accent={PR} delay={0.15}>
              <PanelHeader
                title="Sentiment by Language"
                subtitle="Français · العربية · English"
                icon={Globe2}
                accent={PR}
              />
              <div className="p-4">
                <SentimentByLanguageDonut />
              </div>
            </PanelCard>
            <PanelCard accent={PR} delay={0.2}>
              <PanelHeader
                title="Sentiment by Channel"
                subtitle="Print · online · social · broadcast"
                icon={Smile}
                accent={PR}
              />
              <div className="p-4">
                <SentimentByChannelRadar />
              </div>
            </PanelCard>
          </StaggerGrid>

          {/* Drivers table */}
          <PanelCard accent={PR} delay={0.25}>
            <PanelHeader
              title="Top Sentiment Drivers"
              subtitle="Topics with highest sentiment impact · sortable"
              icon={Filter}
              accent={PR}
              action={
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  <Filter className="h-3 w-3" /> {sentimentDrivers.length} drivers
                </div>
              }
            />
            <div className="harch-scroll max-h-[460px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-white">
                  <TableRow className="text-[10px] uppercase tracking-wide text-slate-500">
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("topic")}>
                        Driver {renderSortIcon("topic")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("pillar")}>
                        Pillar {renderSortIcon("pillar")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("sentiment")}>
                        Sentiment {renderSortIcon("sentiment")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("mentions")}>
                        Mentions {renderSortIcon("mentions")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("delta")}>
                        Δ 30d {renderSortIcon("delta")}
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((d: SentimentDriver) => {
                    const isPos = d.sentiment >= 0;
                    return (
                      <TableRow key={d.id} className="text-[12px] transition-colors hover:bg-slate-50">
                        <TableCell className="max-w-[320px]">
                          <div className="flex flex-col">
                            <span className="truncate text-slate-700" title={d.topic}>
                              {d.topic}
                            </span>
                            <span className="text-[10px] uppercase tracking-wide text-slate-400">{d.id}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Tag tone={pillarTone[d.pillar]} size="xs">
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ background: pillarColor[d.pillar] }}
                            />
                            {d.pillar}
                          </Tag>
                        </TableCell>
                        <TableCell className="tabular text-right">
                          <Tag tone={isPos ? "positive" : "negative"} size="xs">
                            {isPos ? "+" : ""}
                            {d.sentiment}
                          </Tag>
                        </TableCell>
                        <TableCell className="tabular text-right text-slate-700">
                          {d.mentions.toLocaleString()}
                        </TableCell>
                        <TableCell className="tabular text-right">
                          <Tag
                            tone={d.delta >= 0 ? "positive" : "negative"}
                            size="xs"
                            icon={d.delta >= 0 ? TrendingUp : TrendingDown}
                          >
                            {d.delta >= 0 ? "+" : ""}
                            {d.delta}pp
                          </Tag>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </PanelCard>
        </>
      ) : (
        <PanelSkeletons count={4} />
      )}
    </div>
  );
}
