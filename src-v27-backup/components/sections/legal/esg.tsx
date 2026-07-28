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
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  FileWarning,
  Leaf,
  Recycle,
  TrendingDown,
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
  EmptyState,
  motionVariants,
} from "../design-system";
import { motion } from "framer-motion";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  carbonTrend12m,
  esgComposite,
  esgControversies,
  esgDisclosureRegister,
  esgDisclosureStatusTint,
  esgRadar,
  esgScores,
  esgSummary,
  formatDate,
  formatNumber,
  relativeTime,
  type EsgDisclosure,
  type EsgDisclosureStatus,
} from "@/lib/legal-data";
import { cn } from "@/lib/utils";
import { KpiSkeletonGrid, PanelSkeletons, PremiumTooltip, useMountReady } from "./_shared";

/* ------------------------------------------------------------------ */
/*  E/S/G score bars                                                   */
/* ------------------------------------------------------------------ */

const esgColors: Record<string, string> = {
  Environmental: "#14b8a6",
  Social: "#0ea5e9",
  Governance: "#7c3aed",
};
const esgPillarTone: Record<string, "emerald" | "cyan" | "violet"> = {
  Environmental: "emerald",
  Social: "cyan",
  Governance: "violet",
};

function EsgBars() {
  return (
    <DeferredChart height="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={esgScores} margin={{ top: 10, right: 12, left: 0, bottom: 0 }} barCategoryGap="26%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="dimension" tick={{ fontSize: 11, fill: "#475569" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={28} />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              const v = Number(payload[0].value ?? 0);
              const delta = esgScores.find((s) => s.dimension === label)?.delta ?? 0;
              return (
                <PremiumTooltip
                  header={label}
                  rows={[
                    { label: "Score", value: `${v}`, tone: "emerald" },
                    { label: "90d delta", value: `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} pts`, tone: delta >= 0 ? "emerald" : "rose" },
                  ]}
                />
              );
            }}
          />
          <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={56}>
            {esgScores.map((s) => (
              <Cell key={s.dimension} fill={esgColors[s.dimension]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  ESG radar                                                          */
/* ------------------------------------------------------------------ */

function EsgRadarChart() {
  const [showTarget, setShowTarget] = React.useState(true);
  return (
    <div className="flex flex-col gap-2">
      <DeferredChart height="h-[230px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={esgRadar} outerRadius="70%">
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: "#475569" }} />
            <PolarRadiusAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="Score" dataKey="score" stroke="#14b8a6" strokeWidth={2} fill="#14b8a6" fillOpacity={0.25} />
            {showTarget ? (
              <Radar name="Target" dataKey="target" stroke="#94a3b8" strokeWidth={1.2} strokeDasharray="4 4" fill="#94a3b8" fillOpacity={0.05} />
            ) : null}
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length || !label) return null;
                const cur = Number(payload.find((p) => p.dataKey === "score")?.value ?? 0);
                const tgt = Number(payload.find((p) => p.dataKey === "target")?.value ?? 0);
                return (
                  <PremiumTooltip
                    header={label}
                    rows={[
                      { label: "Score", value: `${cur}`, tone: "emerald" },
                      { label: "Target", value: `${tgt}`, tone: "slate" },
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
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Target
        </button>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500" /> Score
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Carbon emissions trend                                              */
/* ------------------------------------------------------------------ */

function CarbonTrendChart() {
  return (
    <DeferredChart height="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={carbonTrend12m} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={44} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              const s1 = Number(payload.find((p) => p.dataKey === "scope1")?.value ?? 0);
              const s2 = Number(payload.find((p) => p.dataKey === "scope2")?.value ?? 0);
              const s3 = Number(payload.find((p) => p.dataKey === "scope3")?.value ?? 0);
              return (
                <PremiumTooltip
                  header={`${label} 2025`}
                  rows={[
                    { label: "Scope 1", value: `${formatNumber(s1)} tCO₂e`, tone: "emerald" },
                    { label: "Scope 2", value: `${formatNumber(s2)} tCO₂e`, tone: "sky" },
                    { label: "Scope 3", value: `${formatNumber(s3)} tCO₂e`, tone: "slate" },
                    { label: "Total", value: `${formatNumber(s1 + s2 + s3)} tCO₂e` },
                  ]}
                />
              );
            }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 10, paddingTop: 6 }}
            formatter={(value) => <span className="text-[10px] text-slate-600">{value}</span>}
          />
          <Line type="monotone" dataKey="scope1" stroke="#14b8a6" strokeWidth={1.6} dot={false} name="Scope 1" />
          <Line type="monotone" dataKey="scope2" stroke="#0ea5e9" strokeWidth={1.6} dot={false} name="Scope 2" />
          <Line type="monotone" dataKey="scope3" stroke="#334155" strokeWidth={1.6} dot={false} name="Scope 3" />
        </LineChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

const controversyStatusTone: Record<"open" | "remediating" | "closed", "negative" | "warning" | "positive"> = {
  open: "negative",
  remediating: "warning",
  closed: "positive",
};
const esgDisclosureStatusTone: Record<EsgDisclosureStatus, "negative" | "warning" | "info" | "positive"> = {
  overdue: "negative",
  in_review: "warning",
  draft: "info",
  scheduled: "positive",
  submitted: "positive",
};

export function EsgRisk(_: SectionComponentProps) {
  const ready = useMountReady();
  const [statusFilter, setStatusFilter] = React.useState<EsgDisclosureStatus | "all">("all");

  const filteredDisclosures = React.useMemo(() => {
    const list = esgDisclosureRegister.slice().sort((a, b) => Date.parse(a.due) - Date.parse(b.due));
    if (statusFilter === "all") return list;
    return list.filter((d) => d.status === statusFilter);
  }, [statusFilter]);

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="risk-esg"
        accountType="legal"
        accent="violet"
        statusChips={
          <>
            <StatusChip label={`Composite ${esgComposite}`} tone="positive" icon={Leaf} />
            <StatusChip label={`${esgSummary.openControversies} open controversies`} tone="warning" icon={AlertTriangle} />
            <StatusChip label={`Carbon ${esgSummary.ytdCarbonDelta >= 0 ? "+" : ""}${esgSummary.ytdCarbonDelta}% YoY`} tone="positive" icon={TrendingDown} />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile label="Composite ESG" value={`${esgComposite}`} delta={`${esgSummary.netPositiveDelta}/3 ↑`} deltaTone="positive" hint="Weighted 0–100" icon={Leaf} accent="emerald" />
              <StatTile label="Environmental" value={`${esgScores[0].score}`} delta={`+${esgScores[0].delta.toFixed(1)}`} deltaTone="positive" hint="90-day trend" accent="emerald" />
              <StatTile label="Social" value={`${esgScores[1].score}`} delta={`+${esgScores[1].delta.toFixed(1)}`} deltaTone="positive" hint="90-day trend" accent="cyan" />
              <StatTile label="Governance" value={`${esgScores[2].score}`} delta={`+${esgScores[2].delta.toFixed(1)}`} deltaTone="positive" hint="90-day trend" accent="violet" />
              <StatTile label="Open Controversies" value={`${esgSummary.openControversies}`} hint="Awaiting remediation" icon={AlertTriangle} accent="amber" />
              <StatTile label="Disclosures Due" value={`${esgSummary.disclosuresDue}`} delta={`${esgSummary.disclosuresOverdue} overdue`} deltaTone="negative" hint="FY 2025 cycle" icon={FileWarning} accent="amber" />
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
          {/* ESG bars + radar */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <PanelCard accent="violet">
              <PanelHeader
                title="E / S / G Score Breakdown"
                subtitle="Pillar scores with 90-day delta"
                icon={Leaf}
                accent="violet"
                action={<Tag tone="neutral">0–100</Tag>}
              />
              <div className="p-4">
                <EsgBars />
              </div>
            </PanelCard>
            <PanelCard accent="violet">
              <PanelHeader
                title="ESG Sub-Dimension Radar"
                subtitle="8 sub-dimensions · score vs target"
                icon={Recycle}
                accent="violet"
                action={<Tag tone="neutral">TCFD + GRI</Tag>}
              />
              <div className="p-4">
                <EsgRadarChart />
              </div>
            </PanelCard>
          </div>

          {/* Carbon trend + controversies */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <PanelCard accent="violet">
              <PanelHeader
                title="Carbon Emissions — 12 months"
                subtitle="Scope 1 / 2 / 3 · tCO₂e"
                icon={TrendingDown}
                accent="violet"
                action={
                  <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wide">
                    <span className="inline-flex items-center gap-1 text-teal-700"><span className="h-1.5 w-1.5 rounded-full bg-teal-500" /> S1</span>
                    <span className="inline-flex items-center gap-1 text-sky-700"><span className="h-1.5 w-1.5 rounded-full bg-sky-500" /> S2</span>
                    <span className="inline-flex items-center gap-1 text-slate-700"><span className="h-1.5 w-1.5 rounded-full bg-slate-700" /> S3</span>
                  </div>
                }
              />
              <div className="p-4">
                <CarbonTrendChart />
              </div>
            </PanelCard>
            <PanelCard accent="violet">
              <PanelHeader
                title="ESG Controversy Feed"
                subtitle="Open + closed material controversies"
                icon={AlertTriangle}
                accent="violet"
                action={<Tag tone="neutral">{esgControversies.length} tracked</Tag>}
              />
              <div className="max-h-[300px] overflow-y-auto harch-scroll">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-white">
                    <TableRow className="text-[10px] uppercase tracking-wider text-slate-500 hover:bg-transparent">
                      <TableHead>Date</TableHead>
                      <TableHead>Pillar</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Outlet</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {esgControversies.map((c) => {
                      const tone = controversyStatusTone[c.status as keyof typeof controversyStatusTone] ?? "neutral";
                      const pillarTone = esgPillarTone[c.pillar];
                      return (
                        <TableRow key={c.id} className="text-[12px] hover:bg-slate-50">
                          <TableCell className="tabular whitespace-nowrap text-slate-500">
                            <div className="flex flex-col">
                              <span>{formatDate(c.date)}</span>
                              <span className="text-[10px] text-slate-400">{relativeTime(c.date)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Tag tone={pillarTone} size="xs">{c.pillar.slice(0, 4)}</Tag>
                          </TableCell>
                          <TableCell className="max-w-[260px]">
                            <span className="truncate text-slate-700" title={c.title}>{c.title}</span>
                          </TableCell>
                          <TableCell>
                            <Tag
                              tone={c.severity === "critical" ? "negative" : c.severity === "high" ? "warning" : c.severity === "medium" ? "info" : "neutral"}
                              size="xs"
                            >
                              {c.severity}
                            </Tag>
                          </TableCell>
                          <TableCell>
                            <Tag tone={tone} size="xs">
                              {c.status}
                            </Tag>
                          </TableCell>
                          <TableCell className="text-slate-600">{c.outlet}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </PanelCard>
          </div>

          {/* ESG disclosure register */}
          <PanelCard accent="violet">
            <PanelHeader
              title="ESG Disclosure Register"
              subtitle="AMMC ESG chapter · TCFD · GRI · CDP · CSRD · UNGC · ILO"
              icon={FileWarning}
              accent="violet"
              action={
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={cn(
                      "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 transition-colors",
                      statusFilter === "all" ? "bg-violet-700 text-white ring-violet-700" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
                    )}
                  >
                    All
                  </button>
                  {(Object.keys(esgDisclosureStatusTint) as EsgDisclosureStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={cn(
                        "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 transition-colors",
                        statusFilter === s ? "bg-violet-700 text-white ring-violet-700" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
                      )}
                    >
                      {s.replace("_", " ")}
                    </button>
                  ))}
                </div>
              }
            />
            <div className="max-h-[440px] overflow-y-auto harch-scroll">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-white">
                  <TableRow className="text-[10px] uppercase tracking-wider text-slate-500 hover:bg-transparent">
                    <TableHead>ID</TableHead>
                    <TableHead>Framework</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDisclosures.map((d: EsgDisclosure) => {
                    const tone = esgDisclosureStatusTone[d.status];
                    const overdue = d.status === "overdue";
                    return (
                      <TableRow key={d.id} className="text-[12px] hover:bg-slate-50">
                        <TableCell className="font-mono text-[11px] text-violet-700">{d.id}</TableCell>
                        <TableCell className="font-medium text-slate-900">{d.framework}</TableCell>
                        <TableCell className="text-slate-600">{d.period}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-slate-600" title={d.scope}>{d.scope}</TableCell>
                        <TableCell className="text-slate-600">{d.owner}</TableCell>
                        <TableCell className="tabular whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className={cn("font-medium", overdue ? "text-rose-700" : "text-slate-700")}>{formatDate(d.due)}</span>
                            <span className="text-[10px] text-slate-400">{relativeTime(d.due)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Tag tone={tone} size="xs">
                            {d.status.replace("_", " ")}
                          </Tag>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredDisclosures.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8">
                        <EmptyState icon={FileWarning} title="No disclosures match the filter." description="Try selecting a different status." accent="violet" />
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Recycle className="h-3.5 w-3.5 text-violet-600" />
                Showing <span className="tabular font-semibold text-slate-700">{filteredDisclosures.length}</span> of {esgDisclosureRegister.length} disclosures
              </span>
              <span className="text-slate-400">Loi 17-23 · AMMC ESG chapter · CSRD cross-border</span>
            </div>
          </PanelCard>
        </motion.div>
      )}
    </div>
  );
}
