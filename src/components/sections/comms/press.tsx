"use client";

/**
 * Comms Press Releases — Figma-grade rework (V18.0)
 *
 * Composition:
 *  - 6 StatTile KPIs (rose accent) with 320ms mount skeleton
 *  - Releases by status donut (draft / scheduled / published / embargoed)
 *  - Pickups by outlet horizontal bars
 *  - Press release library table (status filter + search, Tag badges)
 *  - Draft editor preview card (PanelCard with inputs + textarea + buttons)
 */
import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Filter,
  Mail,
  Megaphone,
  Newspaper,
  Search,
  Send,
  Clock,
  Eye,
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
  formatDate,
  formatNumber,
  pickupByOutlet,
  pressReleases,
  pressStatusCounts,
  pressStatusTint,
  pressSummary,
  relativeTime,
  sentimentTint,
  type Language,
  type PressRelease,
  type PressStatus,
} from "@/lib/comms-data";
import { cn } from "@/lib/utils";
import {
  KpiSkeletonGrid,
  PanelSkeletons,
  PR,
  PremiumTooltip,
  useMountReady,
} from "./_shared";

type SortKey = "publishDate" | "title" | "status" | "pickups" | "distribution" | "outletsReached";
type StatusFilter = PressStatus | "all";

const languageMeta: Record<Language, string> = {
  fr: "Français",
  ar: "العربية",
  en: "English",
};

const statusColors: Record<PressStatus, string> = {
  draft: "#94a3b8",
  scheduled: "#0ea5e9",
  published: "#10b981",
  embargoed: "#f59e0b",
};

const statusTone: Record<PressStatus, "neutral" | "info" | "positive" | "warning"> = {
  draft: "neutral",
  scheduled: "info",
  published: "positive",
  embargoed: "warning",
};

/* ------------------------------------------------------------------ */
/*  Status donut                                                       */
/* ------------------------------------------------------------------ */

function StatusDonut() {
  const total = pressStatusCounts.reduce((s, x) => s + x.count, 0);
  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pressStatusCounts}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              outerRadius={92}
              paddingAngle={2}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {pressStatusCounts.map((s) => (
                <Cell key={s.status} fill={statusColors[s.status]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0];
                const pct = Math.round((Number(p.value) / total) * 1000) / 10;
                return (
                  <PremiumTooltip
                    header={String(p.name)}
                    rows={[
                      { label: "Releases", value: `${p.value}`, tone: "rose" },
                      { label: "Share", value: `${pct}%`, tone: "default" },
                    ]}
                  />
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[9px] uppercase tracking-wide text-slate-400">Total</span>
          <span className="tabular text-[24px] font-bold text-slate-900">{total}</span>
          <span className="text-[9px] uppercase tracking-wide text-slate-400">releases</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {pressStatusCounts.map((s) => (
          <div
            key={s.status}
            className="flex items-center justify-between rounded-md bg-slate-50 px-2 py-1.5 ring-1 ring-slate-100"
          >
            <span className="flex items-center gap-1.5 capitalize text-[11px] text-slate-600">
              <span className="h-2 w-2 rounded-full" style={{ background: statusColors[s.status] }} />
              {s.status}
            </span>
            <span className="tabular text-[11px] font-bold text-slate-800">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pickup-by-outlet horizontal bars                                   */
/* ------------------------------------------------------------------ */

function PickupByOutletBars() {
  const data = pickupByOutlet.slice().sort((a, b) => a.pickups - b.pickups);
  const max = Math.max(...data.map((d) => d.pickups), 1);
  return (
    <DeferredChart height="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 10, right: 16, left: 8, bottom: 0 }} barCategoryGap="14%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="outlet"
            tick={{ fontSize: 10, fill: "#475569" }}
            axisLine={false}
            tickLine={false}
            width={140}
          />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              return (
                <PremiumTooltip
                  header={label}
                  rows={[{ label: "Pickups", value: `${payload[0].value}`, tone: "rose" }]}
                />
              );
            }}
          />
          <Bar dataKey="pickups" barSize={16} radius={[0, 4, 4, 0]} name="Pickups">
            {data.map((d) => (
              <Cell key={d.outlet} fill="#e11d48" fillOpacity={0.4 + (d.pickups / max) * 0.6} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Draft editor preview card                                          */
/* ------------------------------------------------------------------ */

function DraftEditorPreview() {
  const draft = pressReleases.find((r) => r.status === "draft");
  if (!draft) return null;
  return (
    <PanelCard accent={PR} className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-rose-100 text-rose-700 ring-1 ring-rose-200">
            <FileText className="h-4 w-4" />
          </span>
          <div className="flex flex-col">
            <span className="text-[12px] font-semibold text-slate-900">Draft Editor</span>
            <span className="text-[10px] uppercase tracking-wide text-slate-500">
              {draft.id} · {languageMeta[draft.language]}
            </span>
          </div>
        </div>
        <Tag tone="neutral" size="xs" icon={Clock}>
          Auto-saved
        </Tag>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <label className="card-title">Headline</label>
        <Input defaultValue={draft.title} className="h-9 text-[13px]" readOnly />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <label className="card-title">Author</label>
          <Input defaultValue={draft.author} className="h-8 text-[12px]" readOnly />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="card-title">Publish date (target)</label>
          <Input defaultValue={formatDate(draft.publishDate)} className="h-8 text-[12px]" readOnly />
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-1.5">
        <label className="card-title">Body (lead paragraph)</label>
        <Textarea
          readOnly
          className="min-h-[120px] text-[12px] leading-relaxed"
          defaultValue={`CASABLANCA, ${formatDate(draft.publishDate)} — HarchCorp today announced the upcoming strategic milestone outlined in release ${draft.id}. The communications team is coordinating distribution across Moroccan tier-1 outlets (Le Matin, L'Économiste, Aujourd'hui le Maroc, Medias24), regional wires (Reuters, Bloomberg), and ESG-focused press (Jeune Afrique, The Africa Report). Embargo lift and digital amplification on social channels (LinkedIn, Twitter/X) to follow press distribution.`}
        />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-slate-500">
          <Eye className="h-3 w-3" />
          <span>Distribution list · {pressSummary.avgDistribution} journalists avg</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11px]">
            <Filter className="h-3 w-3" /> Save draft
          </Button>
          <Button size="sm" className="h-7 gap-1.5 bg-rose-700 text-[11px] hover:bg-rose-800">
            <Send className="h-3 w-3" /> Submit for review
          </Button>
        </div>
      </div>
    </PanelCard>
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

export function CommsPress(_: SectionComponentProps) {
  const ready = useMountReady(320);
  const [sortKey, setSortKey] = React.useState<SortKey>("publishDate");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    let list = pressReleases.slice();
    if (statusFilter !== "all") list = list.filter((r) => r.status === statusFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.author.toLowerCase().includes(q),
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (sortKey === "publishDate") return (Date.parse(a.publishDate) - Date.parse(b.publishDate)) * dir;
      if (sortKey === "pickups" || sortKey === "distribution" || sortKey === "outletsReached") return (a[sortKey] - b[sortKey]) * dir;
      return String(a[sortKey]).localeCompare(String(b[sortKey])) * dir;
    });
    return list;
  }, [statusFilter, query, sortKey, sortDir]);

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
        sectionId="comms-press"
        accountType="pr"
        accent="rose"
        statusChips={
          <>
            <StatusChip label={`${pressSummary.published} published`} tone="positive" icon={Newspaper} />
            <StatusChip label={`${pressSummary.drafts} drafts`} tone="neutral" icon={FileText} />
            <StatusChip label={`${pressSummary.embargoed} embargoed`} tone="warning" icon={Clock} />
            <StatusChip label={`${pressSummary.totalPickups} pickups`} tone="positive" icon={Megaphone} />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile
                label="Total Releases"
                value={`${pressSummary.total}`}
                hint="Drafts + scheduled + published"
                icon={FileText}
                accent={PR}
              />
              <StatTile
                label="Published"
                value={`${pressSummary.published}`}
                hint="Live in market"
                icon={Newspaper}
                accent={PR}
              />
              <StatTile
                label="Drafts in Edit"
                value={`${pressSummary.drafts}`}
                hint="Awaiting approval"
                icon={FileText}
                accent={PR}
              />
              <StatTile
                label="Total Pickups"
                value={formatNumber(pressSummary.totalPickups)}
                hint="Articles quoting releases"
                icon={Megaphone}
                accent={PR}
              />
              <StatTile
                label="Outlets Reached"
                value={formatNumber(pressSummary.totalOutlets)}
                hint="Distinct outlets"
                icon={Mail}
                accent={PR}
              />
              <StatTile
                label="Pickup Rate"
                value={`${pressSummary.pickupRate.toFixed(1)}%`}
                hint="Pickups per 100 distributed"
                icon={Send}
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
          {/* Status donut + pickup bars */}
          <StaggerGrid className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <PanelCard accent={PR} delay={0.05}>
              <PanelHeader
                title="Releases by Status"
                subtitle="Draft · scheduled · published · embargoed"
                icon={FileText}
                accent={PR}
              />
              <div className="p-4">
                <StatusDonut />
              </div>
            </PanelCard>
            <PanelCard accent={PR} delay={0.1}>
              <PanelHeader
                title="Pickups by Outlet"
                subtitle="Top 10 outlets · articles quoting HarchCorp releases"
                icon={Megaphone}
                accent={PR}
                action={<Tag tone="rose">{pickupByOutlet.length} outlets</Tag>}
              />
              <div className="p-4">
                <PickupByOutletBars />
              </div>
            </PanelCard>
          </StaggerGrid>

          {/* Release library */}
          <PanelCard accent={PR} delay={0.15}>
            <PanelHeader
              title="Press Release Library"
              subtitle="Draft + scheduled + published + embargoed releases · sortable + filterable"
              icon={Newspaper}
              accent={PR}
              action={
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search title, ID, author…"
                    className="h-7 w-52 pl-7 text-[11px] sm:w-64"
                  />
                </div>
              }
            />
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-3 py-2.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <Filter className="h-3 w-3" /> Status
              </span>
              <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
                All
              </FilterChip>
              {(Object.keys(pressStatusTint) as PressStatus[]).map((s) => (
                <FilterChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
                  {s}
                </FilterChip>
              ))}
            </div>

            <div className="harch-scroll max-h-[560px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-white">
                  <TableRow className="text-[10px] uppercase tracking-wide text-slate-500">
                    <TableHead className="min-w-[300px]">
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("title")}>
                        Title {renderSortIcon("title")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("status")}>
                        Status {renderSortIcon("status")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("publishDate")}>
                        Publish date {renderSortIcon("publishDate")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("distribution")}>
                        Distribution {renderSortIcon("distribution")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("pickups")}>
                        Pickups {renderSortIcon("pickups")}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">
                      <button className="ml-auto flex items-center gap-1 hover:text-slate-700" onClick={() => toggleSort("outletsReached")}>
                        Outlets {renderSortIcon("outletsReached")}
                      </button>
                    </TableHead>
                    <TableHead>Sentiment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r: PressRelease) => {
                    const sen = sentimentTint[r.sentiment];
                    const isFuture = Date.parse(r.publishDate) > Date.parse("2025-11-15T10:30:00Z");
                    return (
                      <TableRow key={r.id} className="text-[12px] transition-colors hover:bg-slate-50">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="truncate text-slate-700" title={r.title}>
                              {r.title}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {r.id} · {r.author} · {languageMeta[r.language]}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Tag tone={statusTone[r.status]} size="xs">
                            <span className={cn("h-1.5 w-1.5 rounded-full", pressStatusTint[r.status].dot)} />
                            {r.status}
                          </Tag>
                        </TableCell>
                        <TableCell className="tabular whitespace-nowrap text-slate-500">
                          <div className="flex flex-col">
                            <span>{formatDate(r.publishDate)}</span>
                            <span className={cn("text-[10px]", isFuture ? "text-sky-600" : "text-slate-400")}>
                              {isFuture
                                ? `in ${Math.round(
                                    (Date.parse(r.publishDate) - Date.parse("2025-11-15T10:30:00Z")) / 86400000,
                                  )}d`
                                : relativeTime(r.publishDate)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="tabular text-right text-slate-700">
                          {r.distribution > 0 ? formatNumber(r.distribution) : "—"}
                        </TableCell>
                        <TableCell className="tabular text-right text-slate-700">
                          {r.pickups > 0 ? formatNumber(r.pickups) : "—"}
                        </TableCell>
                        <TableCell className="tabular text-right text-slate-700">
                          {r.outletsReached > 0 ? formatNumber(r.outletsReached) : "—"}
                        </TableCell>
                        <TableCell>
                          <Tag
                            tone={
                              r.sentiment === "positive"
                                ? "positive"
                                : r.sentiment === "negative"
                                  ? "negative"
                                  : "neutral"
                            }
                            size="xs"
                          >
                            <span className={cn("h-1.5 w-1.5 rounded-full", sen.dot)} />
                            {r.sentiment}
                          </Tag>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-[12px] text-slate-400">
                        No releases match the current filters.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </PanelCard>

          {/* Draft editor preview */}
          <PanelCard accent={PR} delay={0.2}>
            <PanelHeader
              title="Draft Editor — Preview"
              subtitle="Active draft release · review + submit for approval"
              icon={FileText}
              accent={PR}
            />
            <div className="p-4">
              <DraftEditorPreview />
            </div>
          </PanelCard>
        </>
      ) : (
        <PanelSkeletons count={3} />
      )}
    </div>
  );
}
