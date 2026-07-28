"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  Bell,
  Database,
  FileWarning,
  HardDrive,
  Search,
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
  Tag,
  StaggerGrid,
  ProgressBar,
  EmptyState,
  motionVariants,
} from "../design-system";
import { motion } from "framer-motion";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  custodianCoverage,
  formatDate,
  holdStatusTint,
  holdTimeline90d,
  holdsSummary,
  litigationHolds,
  relativeTime,
  type HoldStatus,
  type LitigationHold,
} from "@/lib/legal-data";
import { cn } from "@/lib/utils";
import { KpiSkeletonGrid, PanelSkeletons, PremiumTooltip, useMountReady } from "./_shared";

/* ------------------------------------------------------------------ */
/*  Custodian coverage bar chart                                       */
/* ------------------------------------------------------------------ */

function CustodianBars() {
  return (
    <DeferredChart height="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={custodianCoverage} margin={{ top: 10, right: 12, left: 0, bottom: 0 }} barCategoryGap="22%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="source" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} angle={-15} textAnchor="end" height={48} interval={0} />
          <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              const custodians = Number(payload.find((p) => p.dataKey === "custodians")?.value ?? 0);
              const holds = Number(payload.find((p) => p.dataKey === "holds")?.value ?? 0);
              return (
                <PremiumTooltip
                  header={label}
                  rows={[
                    { label: "Custodians", value: `${custodians}`, tone: "violet" },
                    { label: "Holds", value: `${holds}`, tone: "slate" },
                  ]}
                />
              );
            }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 10, paddingTop: 6 }}
            formatter={(value) => <span className="text-[10px] text-slate-600">{value === "custodians" ? "Custodians" : "Holds"}</span>}
          />
          <Bar dataKey="custodians" fill="#7c3aed" radius={[3, 3, 0, 0]} barSize={18} name="custodians" />
          <Bar dataKey="holds" fill="#c4b5fd" radius={[3, 3, 0, 0]} barSize={18} name="holds" />
        </BarChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Hold-status timeline (90d, weekly)                                 */
/* ------------------------------------------------------------------ */

function HoldTimeline() {
  return (
    <DeferredChart height="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={holdTimeline90d} margin={{ top: 10, right: 12, left: 0, bottom: 0 }} barCategoryGap="22%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} minTickGap={12} />
          <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length || !label) return null;
              return (
                <PremiumTooltip
                  header={`Week of ${label}`}
                  rows={[
                    { label: "Active", value: `${payload.find((p) => p.dataKey === "active")?.value ?? 0}`, tone: "violet" },
                    { label: "Released", value: `${payload.find((p) => p.dataKey === "released")?.value ?? 0}`, tone: "emerald" },
                    { label: "Superseded", value: `${payload.find((p) => p.dataKey === "superseded")?.value ?? 0}`, tone: "slate" },
                  ]}
                />
              );
            }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 10, paddingTop: 6 }}
            formatter={(value) => <span className="text-[10px] capitalize text-slate-600">{value}</span>}
          />
          <Bar dataKey="active" stackId="a" fill="#7c3aed" barSize={14} />
          <Bar dataKey="released" stackId="a" fill="#10b981" barSize={14} />
          <Bar dataKey="superseded" stackId="a" fill="#94a3b8" radius={[3, 3, 0, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

const holdStatusTone: Record<HoldStatus, "violet" | "positive" | "neutral" | "warning"> = {
  active: "violet",
  released: "positive",
  superseded: "neutral",
  pending_release: "warning",
};

export function HoldNotices(_: SectionComponentProps) {
  const ready = useMountReady();
  const [statusFilter, setStatusFilter] = React.useState<HoldStatus | "all">("all");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    let list = litigationHolds.slice();
    if (statusFilter !== "all") list = list.filter((h) => h.status === statusFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (h) =>
          h.id.toLowerCase().includes(q) ||
          h.matter.toLowerCase().includes(q) ||
          h.matterId.toLowerCase().includes(q) ||
          h.dataSources.some((s) => s.toLowerCase().includes(q)),
      );
    }
    return list.sort((a, b) => Date.parse(b.issued) - Date.parse(a.issued));
  }, [statusFilter, query]);

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="risk-holds"
        accountType="legal"
        accent="violet"
        statusChips={
          <>
            <StatusChip label={`${holdsSummary.active} active`} tone="neutral" icon={FileWarning} />
            <StatusChip label={`${holdsSummary.remindersDue} reminders due`} tone="warning" icon={Bell} pulse />
            <StatusChip label={`${holdsSummary.totalCustodians} custodians`} tone="neutral" icon={Users} />
          </>
        }
        kpis={
          ready ? (
            <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatTile label="Active Holds" value={`${holdsSummary.active}`} hint={`${holdsSummary.pendingRelease} pending release`} icon={FileWarning} accent="violet" />
              <StatTile label="Total Custodians" value={`${holdsSummary.totalCustodians}`} hint="Under preservation" icon={Users} />
              <StatTile label="Preserved Volume" value={`${(holdsSummary.totalVolumeGb / 1024).toFixed(2)} TB`} delta={`${holdsSummary.totalVolumeGb} GB`} deltaTone="neutral" hint="ESI under hold" icon={HardDrive} />
              <StatTile label="Reminders Due" value={`${holdsSummary.remindersDue}`} hint=">7d since last reminder" icon={Bell} accent="amber" />
              <StatTile label="Avg Custodians" value={`${holdsSummary.avgCustodians}`} hint="Per hold notice" />
              <StatTile label="Released (all-time)" value={`${holdsSummary.released}`} hint="Closed + released" icon={FileWarning} accent="emerald" />
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
          {/* Custodian bars + hold-status timeline */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <PanelCard accent="violet">
              <PanelHeader
                title="Custodian Coverage by Source"
                subtitle="Preserved ESI sources across active holds"
                icon={Database}
                accent="violet"
                action={
                  <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1 text-violet-700"><span className="h-1.5 w-1.5 rounded-full bg-violet-600" /> Custodians</span>
                    <span className="inline-flex items-center gap-1 text-violet-400"><span className="h-1.5 w-1.5 rounded-full bg-violet-300" /> Holds</span>
                  </div>
                }
              />
              <div className="p-4">
                <CustodianBars />
              </div>
            </PanelCard>
            <PanelCard accent="violet">
              <PanelHeader
                title="Hold-Status Timeline — 90 days"
                subtitle="Weekly active vs released vs superseded"
                icon={Bell}
                accent="violet"
                action={
                  <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1 text-violet-700"><span className="h-1.5 w-1.5 rounded-full bg-violet-500" /> Active</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Released</span>
                    <span className="inline-flex items-center gap-1 text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> Superseded</span>
                  </div>
                }
              />
              <div className="p-4">
                <HoldTimeline />
              </div>
            </PanelCard>
          </div>

          {/* Hold register */}
          <PanelCard accent="violet">
            <PanelHeader
              title="Litigation Hold Register"
              subtitle="Active + released notices · preservation status"
              icon={FileWarning}
              accent="violet"
              action={
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search hold, matter, source…"
                      className="h-7 w-56 pl-7 text-[11px] sm:w-64"
                    />
                  </div>
                </div>
              }
            />
            <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-3 py-2.5">
              <AlertTriangle className="h-3 w-3 text-slate-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Status</span>
              <button
                onClick={() => setStatusFilter("all")}
                className={cn(
                  "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 transition-colors",
                  statusFilter === "all" ? "bg-violet-700 text-white ring-violet-700" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
                )}
              >
                All
              </button>
              {(Object.keys(holdStatusTint) as HoldStatus[]).map((s) => (
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

            <div className="max-h-[640px] overflow-y-auto harch-scroll">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-white">
                  <TableRow className="text-[10px] uppercase tracking-wider text-slate-500 hover:bg-transparent">
                    <TableHead>ID</TableHead>
                    <TableHead>Matter</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead className="text-right">Custodians</TableHead>
                    <TableHead>Data Sources Preserved</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead>Last Reminder</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((h: LitigationHold) => {
                    const tint = holdStatusTint[h.status];
                    const reminderDays = Math.round((Date.parse("2025-11-15T00:00:00Z") - Date.parse(h.lastReminder)) / 86400000);
                    const reminderDue = reminderDays > 7 && (h.status === "active" || h.status === "pending_release");
                    return (
                      <TableRow key={h.id} className="text-[12px] hover:bg-slate-50">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-mono text-[11px] font-semibold text-violet-700">{h.id}</span>
                            <span className="font-mono text-[10px] text-slate-400">{h.matterId}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[240px]">
                          <span className="truncate font-medium text-slate-900" title={h.matter}>{h.matter}</span>
                        </TableCell>
                        <TableCell className="tabular whitespace-nowrap text-slate-500">
                          <div className="flex flex-col">
                            <span>{formatDate(h.issued)}</span>
                            <span className="text-[10px] text-slate-400">{relativeTime(h.issued)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="tabular text-right">
                          <span className="inline-flex items-center gap-1 text-slate-800">
                            <Users className="h-3 w-3 text-slate-400" />
                            <span className="font-semibold">{h.custodians}</span>
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex max-w-[280px] flex-wrap gap-1">
                            {h.dataSources.map((s) => (
                              <span
                                key={s}
                                className="inline-flex items-center gap-1 rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 ring-1 ring-violet-200"
                                title={s}
                              >
                                <Database className="h-2.5 w-2.5" />
                                {s}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="tabular text-right text-slate-700">{h.volumeGb} GB</TableCell>
                        <TableCell className="tabular whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className={cn("font-medium", reminderDue ? "text-rose-700" : "text-slate-700")}>{formatDate(h.lastReminder)}</span>
                            <span className={cn("text-[10px]", reminderDue ? "text-rose-600" : "text-slate-400")}>
                              {reminderDays === 0 ? "today" : `${reminderDays}d ago`}
                              {reminderDue ? " · reminder due" : ""}
                            </span>
                          </div>
                          {reminderDue ? (
                            <div className="mt-1 w-20">
                              <ProgressBar value={Math.min((reminderDays / 30) * 100, 100)} tone="rose" height={3} />
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <Tag tone={holdStatusTone[h.status]} size="xs">
                            <span className={cn("h-1.5 w-1.5 rounded-full", tint.dot)} />
                            {h.status.replace("_", " ")}
                          </Tag>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8">
                        <EmptyState icon={Search} title="No holds match the current filter." description="Try clearing the status filter or search." accent="violet" />
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <FileWarning className="h-3.5 w-3.5 text-violet-600" />
                Showing <span className="tabular font-semibold text-slate-700">{filtered.length}</span> of {litigationHolds.length} holds · spoliation-prevention register
              </span>
              <span className="text-slate-400">Custodian reminders every 30d · FRCP Rule 37(e) safe harbor</span>
            </div>
          </PanelCard>
        </motion.div>
      )}
    </div>
  );
}
