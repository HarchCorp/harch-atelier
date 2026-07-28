"use client";

/**
 * Comms Social Listening — Figma-grade rework (V18.0)
 *
 * Composition:
 *  - 6 StatTile KPIs (rose accent) with 320ms mount skeleton
 *  - Mentions by platform bars (color-coded per platform)
 *  - Virality timeline 7-day line (volume + high-virality subset)
 *  - Top hashtags cloud (sized + tinted by sentiment)
 *  - Top influencers table (platform color avatars + sentiment Tag)
 *  - Real-time mention stream table (platform filter, sortable)
 */
import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChevronDown,
  ChevronUp,
  Flame,
  Hash,
  Heart,
  MessageSquare,
  TrendingUp,
  Users as UsersIcon,
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
  formatCompact,
  mentionsByPlatform,
  platformMeta,
  relativeTime,
  sentimentTint,
  socialMentions,
  socialSummary,
  topHashtags,
  topInfluencers,
  viralityTimeline7d,
  type Platform,
  type SocialMention,
} from "@/lib/comms-data";
import { cn } from "@/lib/utils";
import {
  KpiSkeletonGrid,
  PanelSkeletons,
  PR,
  PremiumTooltip,
  useMountReady,
} from "./_shared";

type SortKey = "author" | "platform" | "reach" | "engagement" | "virality" | "timestamp";
type PlatformFilter = Platform | "all";

const platformLabel: Record<Platform, string> = {
  twitter: "Twitter/X",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
};

/* ------------------------------------------------------------------ */
/*  Mentions by platform bars                                          */
/* ------------------------------------------------------------------ */

function MentionsByPlatformBars() {
  return (
    <DeferredChart height="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={mentionsByPlatform} margin={{ top: 10, right: 12, left: 0, bottom: 0 }} barCategoryGap="22%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="platform"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
            tickFormatter={(v) => platformMeta[v as Platform].label}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={32}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              const p = payload[0].payload as {
                platform: Platform;
                mentions: number;
                reach: number;
                engagement: number;
              };
              return (
                <PremiumTooltip
                  header={platformMeta[p.platform].label}
                  rows={[
                    { label: "Mentions", value: `${p.mentions}`, tone: "rose" },
                    { label: "Reach", value: formatCompact(p.reach), tone: "default" },
                    { label: "Engagement", value: formatCompact(p.engagement), tone: "default" },
                  ]}
                />
              );
            }}
          />
          <Bar dataKey="mentions" barSize={32} radius={[3, 3, 0, 0]} name="Mentions">
            {mentionsByPlatform.map((p) => (
              <Cell key={p.platform} fill={platformMeta[p.platform].color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Virality timeline line chart                                       */
/* ------------------------------------------------------------------ */

function ViralityTimeline() {
  return (
    <DeferredChart height="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={viralityTimeline7d} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
            minTickGap={12}
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
              const vol = Number(payload.find((p) => p.dataKey === "volume")?.value ?? 0);
              const high = Number(payload.find((p) => p.dataKey === "highVirality")?.value ?? 0);
              return (
                <PremiumTooltip
                  header={label}
                  rows={[
                    { label: "Total mentions", value: `${vol}`, tone: "rose", dot: "#e11d48" },
                    { label: "High virality (≥60)", value: `${high}`, tone: "amber", dot: "#f59e0b" },
                  ]}
                />
              );
            }}
          />
          <Line type="monotone" dataKey="volume" stroke="#e11d48" strokeWidth={2.4} dot={{ r: 3, fill: "#e11d48" }} activeDot={{ r: 5 }} name="Total mentions" />
          <Line type="monotone" dataKey="highVirality" stroke="#f59e0b" strokeWidth={1.8} strokeDasharray="4 4" dot={false} name="High virality" />
        </LineChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Top hashtags visual (sized + tinted chips)                         */
/* ------------------------------------------------------------------ */

function HashtagCloud() {
  const max = Math.max(...topHashtags.map((h) => h.count), 1);
  const tintMap = {
    positive: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    neutral: "bg-slate-100 text-slate-600 ring-slate-200",
    negative: "bg-rose-50 text-rose-700 ring-rose-200",
  } as const;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {topHashtags.map((h) => {
        const tint = tintMap[h.sentiment];
        const size = 11 + Math.round((h.count / max) * 7);
        return (
          <span
            key={h.tag}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ring-1",
              tint,
            )}
            style={{ fontSize: `${size}px` }}
            title={`${h.tag} · ${h.count} mentions · ${h.sentiment}`}
          >
            <Hash className="h-3 w-3" />
            {h.tag.replace("#", "")}
            <span className="tabular text-[10px] opacity-70">{h.count}</span>
          </span>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mention stream row                                                 */
/* ------------------------------------------------------------------ */

function MentionRow({ m }: { m: SocialMention }) {
  const tint = sentimentTint[m.sentiment];
  const viralityTone = m.virality >= 80 ? "negative" : m.virality >= 60 ? "warning" : "neutral";
  return (
    <TableRow key={m.id} className="text-[12px] transition-colors hover:bg-slate-50">
      <TableCell>
        <div className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold text-white"
            style={{ background: platformMeta[m.platform].color }}
          >
            {platformMeta[m.platform].label.slice(0, 2)}
          </span>
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">{m.author}</span>
            <span className="text-[10px] text-slate-500">{m.handle}</span>
          </div>
        </div>
      </TableCell>
      <TableCell className="max-w-[320px]">
        <div className="flex flex-col">
          <span className="truncate text-slate-700" title={m.content}>
            {m.content}
          </span>
          <span className="text-[10px] text-slate-400">
            {platformLabel[m.platform]} · {m.id}
          </span>
        </div>
      </TableCell>
      <TableCell className="tabular whitespace-nowrap text-slate-500">
        {relativeTime(m.timestamp)}
      </TableCell>
      <TableCell>
        <Tag
          tone={
            m.sentiment === "positive"
              ? "positive"
              : m.sentiment === "negative"
                ? "negative"
                : "neutral"
          }
          size="xs"
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", tint.dot)} />
          {m.sentiment}
        </Tag>
      </TableCell>
      <TableCell className="tabular text-right text-slate-700">{formatCompact(m.reach)}</TableCell>
      <TableCell className="tabular text-right text-slate-700">{formatCompact(m.engagement)}</TableCell>
      <TableCell className="tabular text-right">
        <Tag tone={viralityTone} size="xs" icon={Flame}>
          {m.virality}
        </Tag>
      </TableCell>
    </TableRow>
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

export function CommsSocial(_: SectionComponentProps) {
  const ready = useMountReady(320);
  const [sortKey, setSortKey] = React.useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [platformFilter, setPlatformFilter] = React.useState<PlatformFilter>("all");

  const filtered = React.useMemo(() => {
    let list = socialMentions.slice();
    if (platformFilter !== "all") list = list.filter((m) => m.platform === platformFilter);
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (sortKey === "timestamp") return (Date.parse(a.timestamp) - Date.parse(b.timestamp)) * dir;
      if (sortKey === "reach" || sortKey === "engagement" || sortKey === "virality") return (a[sortKey] - b[sortKey]) * dir;
      if (sortKey === "platform") return a.platform.localeCompare(b.platform) * dir;
      if (sortKey === "author") return a.author.localeCompare(b.author) * dir;
      return 0;
    });
    return list;
  }, [platformFilter, sortKey, sortDir]);

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
        sectionId="comms-social"
        accountType="pr"
        accent="rose"
        statusChips={
          <>
            <StatusChip label={`${socialSummary.totalMentions} mentions`} tone="neutral" icon={MessageSquare} />
            <StatusChip label={`${socialSummary.highVirality} high-virality`} tone="negative" icon={Flame} pulse />
            <StatusChip label={`${socialSummary.positive} positive · ${socialSummary.negative} negative`} tone="neutral" icon={Heart} />
            <StatusChip label="Live" tone="positive" icon={TrendingUp} pulse />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile
                label="Mentions (7d)"
                value={`${socialSummary.totalMentions}`}
                hint="Across 6 platforms"
                icon={MessageSquare}
                accent={PR}
              />
              <StatTile
                label="Total Reach"
                value={`${(socialSummary.totalReach / 1_000_000).toFixed(1)}M`}
                hint="Aggregate impressions"
                icon={UsersIcon}
                accent={PR}
              />
              <StatTile
                label="Engagement"
                value={formatCompact(socialSummary.totalEngagement)}
                hint="Likes · shares · comments"
                icon={Heart}
                accent={PR}
              />
              <StatTile
                label="Positive"
                value={`${socialSummary.positive}`}
                delta={`${Math.round((socialSummary.positive / socialSummary.totalMentions) * 100)}%`}
                deltaTone="positive"
                hint="Of total mentions"
                icon={Heart}
                accent={PR}
              />
              <StatTile
                label="High Virality"
                value={`${socialSummary.highVirality}`}
                hint="Virality score ≥60"
                icon={Flame}
                accent={PR}
              />
              <StatTile
                label="Top Influencers"
                value={`${socialSummary.topInfluencers}`}
                hint="Tracked accounts"
                icon={UsersIcon}
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
          {/* Mentions by platform + virality timeline */}
          <StaggerGrid className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <PanelCard accent={PR} delay={0.05}>
              <PanelHeader
                title="Mentions by Platform"
                subtitle="Volume + reach across 6 social platforms"
                icon={MessageSquare}
                accent={PR}
                action={<Tag tone="rose">{mentionsByPlatform.length} platforms</Tag>}
              />
              <div className="p-4">
                <MentionsByPlatformBars />
              </div>
            </PanelCard>
            <PanelCard accent={PR} delay={0.1}>
              <PanelHeader
                title="Virality Timeline — 7 days"
                subtitle="Daily mention volume + high-virality subset"
                icon={Flame}
                accent={PR}
                action={
                  <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wide">
                    <span className="inline-flex items-center gap-1 text-rose-700">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#e11d48" }} /> Volume
                    </span>
                    <span className="inline-flex items-center gap-1 text-amber-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> High-virality
                    </span>
                  </div>
                }
              />
              <div className="p-4">
                <ViralityTimeline />
              </div>
            </PanelCard>
          </StaggerGrid>

          {/* Hashtag cloud + top influencers */}
          <StaggerGrid className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <PanelCard accent={PR} delay={0.15}>
              <PanelHeader
                title="Top Hashtags"
                subtitle="Trailing 7 days · color-coded by sentiment"
                icon={Hash}
                accent={PR}
                action={<Tag tone="rose">{topHashtags.length} tags</Tag>}
              />
              <div className="p-4">
                <HashtagCloud />
                <div className="mt-4 flex items-center gap-4 text-[10px] font-semibold uppercase tracking-wide">
                  <span className="inline-flex items-center gap-1.5 text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Positive
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Neutral
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-rose-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Negative
                  </span>
                </div>
              </div>
            </PanelCard>
            <PanelCard accent={PR} delay={0.2}>
              <PanelHeader
                title="Top Influencers"
                subtitle="Highest-impact accounts mentioning HarchCorp"
                icon={UsersIcon}
                accent={PR}
                action={<Tag tone="rose">{topInfluencers.length} accounts</Tag>}
              />
              <div className="harch-scroll max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-white">
                    <TableRow className="text-[10px] uppercase tracking-wide text-slate-500">
                      <TableHead>Account</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead className="text-right">Followers</TableHead>
                      <TableHead className="text-right">Mentions</TableHead>
                      <TableHead className="text-right">Avg sentiment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topInfluencers.map((inf) => {
                      const isPos = inf.avgSentiment >= 0;
                      return (
                        <TableRow key={inf.handle} className="text-[12px] transition-colors hover:bg-slate-50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span
                                className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white"
                                style={{ background: platformMeta[inf.platform].color }}
                              >
                                {inf.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </span>
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-900">{inf.name}</span>
                                <span className="text-[10px] text-slate-500">{inf.handle}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-slate-600">
                            {platformLabel[inf.platform]}
                          </TableCell>
                          <TableCell className="tabular text-right text-slate-700">
                            {formatCompact(inf.followers)}
                          </TableCell>
                          <TableCell className="tabular text-right text-slate-700">{inf.mentions}</TableCell>
                          <TableCell className="tabular text-right">
                            <Tag tone={isPos ? "positive" : "negative"} size="xs">
                              {isPos ? "+" : ""}
                              {inf.avgSentiment}
                            </Tag>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </PanelCard>
          </StaggerGrid>

          {/* Real-time mention stream */}
          <PanelCard accent={PR} delay={0.25}>
            <PanelHeader
              title="Real-time Mention Stream"
              subtitle="Live social mentions across platforms · sortable + filterable"
              icon={MessageSquare}
              accent={PR}
              action={
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Streaming
                </span>
              }
            />
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-3 py-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Platform</span>
              <FilterChip active={platformFilter === "all"} onClick={() => setPlatformFilter("all")}>
                All
              </FilterChip>
              {(Object.keys(platformLabel) as Platform[]).map((p) => (
                <FilterChip key={p} active={platformFilter === p} onClick={() => setPlatformFilter(p)}>
                  {platformLabel[p]}
                </FilterChip>
              ))}
            </div>

            <div className="harch-scroll max-h-[640px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-white">
                  <TableRow className="text-[10px] uppercase tracking-wide text-slate-500">
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("author")}>
                        Author {renderSortIcon("author")}
                      </button>
                    </TableHead>
                    <TableHead className="min-w-[300px]">Content</TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("timestamp")}>
                        Time {renderSortIcon("timestamp")}
                      </button>
                    </TableHead>
                    <TableHead>Sentiment</TableHead>
                    <TableHead className="text-right">
                      <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("reach")}>
                        Reach {renderSortIcon("reach")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("engagement")}>
                        Engagement {renderSortIcon("engagement")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("virality")}>
                        Virality {renderSortIcon("virality")}
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((m: SocialMention) => (
                    <MentionRow key={m.id} m={m} />
                  ))}
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-[12px] text-slate-400">
                        No mentions match the current filter.
                      </TableCell>
                    </TableRow>
                  ) : null}
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
