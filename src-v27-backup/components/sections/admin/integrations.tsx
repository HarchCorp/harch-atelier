"use client";

import * as React from "react";
import {
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
  Activity,
  CheckCircle2,
  Cloud,
  Database,
  Globe2,
  KeyRound,
  MessageSquare,
  Plug,
  TriangleAlert,
  Webhook,
  Zap,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { ChartCard } from "@/components/dataviz/chart-card";
import { DeferredChart } from "@/components/dataviz/chart-skeleton";
import { SectionHeader, StatusChip } from "../section-header";
import {
  PanelCard,
  PanelHeader,
  ProgressBar,
  StaggerGrid,
  StatTile,
  Tag,
} from "../design-system";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  integrationEvents,
  integrationStatusColor,
  integrations,
  relativeTime,
  formatNumber,
  type Integration,
  type IntegrationLogLevel,
} from "@/lib/admin-data";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Category icon                                                      */
/* ------------------------------------------------------------------ */

const categoryIcon: Record<Integration["category"], React.FC<{ className?: string }>> = {
  Market: Globe2,
  AI: Zap,
  Identity: KeyRound,
  Notifications: MessageSquare,
  Storage: Cloud,
  Webhook: Webhook,
};

const statusTone: Record<Integration["status"], "positive" | "warning" | "negative" | "neutral"> = {
  connected: "positive",
  warning: "warning",
  error: "negative",
  disabled: "neutral",
};

/* ------------------------------------------------------------------ */
/*  Integration card                                                   */
/* ------------------------------------------------------------------ */

function IntegrationCard({
  integration,
  onToggle,
  index,
}: {
  integration: Integration;
  onToggle: (id: string) => void;
  index: number;
}) {
  const Icon = categoryIcon[integration.category];
  const statusLabel =
    integration.status === "connected" ? "Connected" :
    integration.status === "warning" ? "Warning" :
    integration.status === "error" ? "Error" : "Disabled";
  const accent =
    integration.status === "error" ? "rose" :
    integration.status === "warning" ? "amber" :
    integration.status === "disabled" ? undefined : "emerald";
  return (
    <PanelCard
      accent={accent}
      delay={index * 0.03}
      className="p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[13px] font-semibold text-slate-900">{integration.name}</span>
              <span className={cn("h-1.5 w-1.5 rounded-full", integrationStatusColor[integration.status].dot)} />
            </div>
            <div className="mt-0.5 truncate text-[10px] uppercase tracking-wide text-slate-400">
              {integration.category} · {integration.vendor}
            </div>
          </div>
        </div>
        <Tag tone={statusTone[integration.status]}>{statusLabel}</Tag>
      </div>
      <p className="mt-2 truncate text-[11px] text-slate-500" title={integration.configSummary}>
        {integration.configSummary}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-[11px]">
        <div>
          <div className="card-title">Events 24h</div>
          <div className="tabular font-semibold text-slate-800">
            {integration.events24h === 0 ? "—" : formatNumber(integration.events24h)}
          </div>
        </div>
        <div>
          <div className="card-title">Last event</div>
          <div className="tabular font-semibold text-slate-800">
            {relativeTime(integration.lastEvent)}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-[10px] uppercase tracking-wide text-slate-500">Sync</span>
        <Switch
          checked={integration.syncEnabled}
          onCheckedChange={() => onToggle(integration.id)}
          aria-label={`Toggle sync for ${integration.name}`}
        />
      </div>
    </PanelCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Event log level tint                                               */
/* ------------------------------------------------------------------ */

const levelTone: Record<IntegrationLogLevel, "info" | "warning" | "negative"> = {
  info: "info",
  warn: "warning",
  error: "negative",
};

/* ------------------------------------------------------------------ */
/*  Events-by-integration bar chart                                    */
/* ------------------------------------------------------------------ */

function EventsByIntegration() {
  const data = integrations
    .map((i) => ({ name: i.name.split(" ")[0], fullName: i.name, events: i.events24h, status: i.status }))
    .sort((a, b) => b.events - a.events);
  return (
    <DeferredChart height="h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={48} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as { fullName: string; events: number; status: string };
              return (
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
                  <div className="text-[11px] font-semibold text-slate-800">{p.fullName}</div>
                  <div className="tabular mt-0.5 text-[12px] text-slate-600">
                    {formatNumber(p.events)} events · {p.status}
                  </div>
                </div>
              );
            }}
          />
          <Bar dataKey="events" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.status === "connected" ? "#10b981" : d.status === "warning" ? "#f59e0b" : d.status === "error" ? "#f43f5e" : "#94a3b8"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function Integrations(_: SectionComponentProps) {
  const [syncState, setSyncState] = React.useState<Record<string, boolean>>(
    Object.fromEntries(integrations.map((i) => [i.id, i.syncEnabled])),
  );
  const [filter, setFilter] = React.useState<Integration["status"] | "all">("all");

  const handleToggle = React.useCallback((id: string) => {
    setSyncState((s) => ({ ...s, [id]: !s[id] }));
  }, []);

  const integrationsView = integrations.map((i) => ({ ...i, syncEnabled: syncState[i.id] ?? i.syncEnabled }));

  const filtered = filter === "all" ? integrationsView : integrationsView.filter((i) => i.status === filter);

  const connected = integrations.filter((i) => i.status === "connected").length;
  const warning = integrations.filter((i) => i.status === "warning").length;
  const error = integrations.filter((i) => i.status === "error").length;
  const disabled = integrations.filter((i) => i.status === "disabled").length;
  const totalEvents24h = integrations.reduce((s, i) => s + i.events24h, 0);
  const connectedPct = Math.round((connected / integrations.length) * 100);

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="admin-integrations"
        accountType="admin"
        accent="violet"
        statusChips={
          <>
            <StatusChip label={`${connected} connected`} tone="positive" icon={CheckCircle2} />
            {warning > 0 ? <StatusChip label={`${warning} warning`} tone="warning" icon={TriangleAlert} /> : null}
            {error > 0 ? <StatusChip label={`${error} error`} tone="negative" icon={TriangleAlert} pulse /> : null}
          </>
        }
        kpis={
          <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatTile label="Integrations" value={`${integrations.length}`} hint={`${disabled} disabled`} icon={Plug} accent="slate" />
            <StatTile label="Connected" value={`${connected}`} delta={`${connectedPct}%`} hint="Healthy" icon={CheckCircle2} accent="emerald" />
            <StatTile label="Warnings" value={`${warning}`} hint="Need attention" icon={TriangleAlert} accent="amber" />
            <StatTile label="Events 24h" value={formatNumber(totalEvents24h)} hint="Across all connectors" icon={Activity} accent="slate" />
            <StatTile label="Categories" value={`${new Set(integrations.map((i) => i.category)).size}`} hint="Market · AI · Identity · …" icon={Database} accent="violet" />
            <StatTile label="Disabled" value={`${disabled}`} hint="Awaiting renewal / config" icon={Plug} accent="slate" />
          </StaggerGrid>
        }
      />

      {/* Events by integration + status summary */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <ChartCard
          title="Events by Integration"
          subtitle="24-hour event volume · colour-coded by status"
          className="xl:col-span-2"
        >
          <EventsByIntegration />
        </ChartCard>
        <PanelCard accent="slate">
          <PanelHeader
            title="Status Summary"
            subtitle="Connector health at a glance"
            icon={Activity}
            accent="slate"
          />
          <div className="flex flex-col gap-3 p-4">
            <StaggerGrid className="grid grid-cols-2 gap-2.5">
              <StatTile label="Connected" value={connected} icon={CheckCircle2} accent="emerald" />
              <StatTile label="Warning" value={warning} icon={TriangleAlert} accent="amber" />
              <StatTile label="Error" value={error} icon={TriangleAlert} accent="rose" />
              <StatTile label="Disabled" value={disabled} icon={Plug} accent="slate" />
            </StaggerGrid>
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-[11px] text-slate-600">
              <div className="card-title mb-1 text-slate-700">Notes</div>
              Bloomberg Terminal seat expired — awaiting procurement renewal. OpsGenie webhook delivery failures backing off (5xx).
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="card-title">Operational</span>
                <span className="tabular text-[11px] font-bold text-slate-700">{connectedPct}%</span>
              </div>
              <div className="mt-2">
                <ProgressBar value={connectedPct} tone="emerald" threshold={80} />
              </div>
            </div>
          </div>
        </PanelCard>
      </div>

      {/* Connector cards */}
      <PanelCard>
        <PanelHeader
          title="Connectors"
          subtitle="All configured integrations · toggle sync per connector"
          icon={Plug}
          accent="slate"
        />
        <div className="p-3">
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wide text-slate-500">Filter:</span>
            {(["all", "connected", "warning", "error", "disabled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 transition-colors",
                  filter === f ? "bg-slate-800 text-white ring-slate-800" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50",
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <StaggerGrid className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((i, idx) => (
              <IntegrationCard key={i.id} integration={i} onToggle={handleToggle} index={idx} />
            ))}
          </StaggerGrid>
        </div>
      </PanelCard>

      {/* Integration event log */}
      <ChartCard
        title="Integration Event Log"
        subtitle="Recent connector events · info / warn / error"
        bodyClassName="p-0"
        action={
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {integrationEvents.length} recent events
          </span>
        }
      >
        <div className="max-h-[420px] overflow-y-auto harch-scroll">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-white">
              <TableRow className="text-[10px] uppercase tracking-wide text-slate-500">
                <TableHead>Timestamp</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Integration</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {integrationEvents.map((e) => (
                <TableRow key={e.id} className="text-[12px] hover:bg-slate-50/60">
                  <TableCell className="tabular whitespace-nowrap text-slate-500">
                    {relativeTime(e.ts)}
                  </TableCell>
                  <TableCell>
                    <Tag tone={levelTone[e.level]}>{e.level}</Tag>
                  </TableCell>
                  <TableCell className="font-medium text-slate-700">{e.integrationName}</TableCell>
                  <TableCell className="text-slate-600">{e.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ChartCard>
    </div>
  );
}
