"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChartCard } from "@/components/dataviz/chart-card";
import {
  riskEvents,
  topSources,
  geoRegions,
  sentimentColor,
  severityColor,
  type RiskEvent,
  type RiskPillar,
  type Severity,
} from "@/lib/mock-data";
import {
  useRiskStore,
  useActionState,
  actionStateMeta,
  filterRiskEvents,
  type ActionState,
} from "@/lib/risk-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { buildEventsCsv, downloadCsv } from "@/lib/csv-export";
import { SavedViewsMenu } from "./saved-views-menu";
import { ChevronRight, Search, X, Filter, CheckCheck, ArrowUpRight, Download } from "lucide-react";

const pillarColor: Record<RiskPillar, string> = {
  Regulatory: "text-violet-700 bg-violet-50",
  Cyber: "text-cyan-700 bg-cyan-50",
  Financial: "text-sky-700 bg-sky-50",
  ESG: "text-emerald-700 bg-emerald-50",
  Geopolitical: "text-amber-700 bg-amber-50",
  Reputational: "text-rose-700 bg-rose-50",
};

const allPillars: RiskPillar[] = [
  "Regulatory",
  "Cyber",
  "Financial",
  "ESG",
  "Geopolitical",
  "Reputational",
];
const allSeverities: Severity[] = ["critical", "high", "medium", "low"];
const allStatuses: ActionState[] = ["pending", "acknowledged", "escalated", "watching"];

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function Row({ e, onSelect }: { e: RiskEvent; onSelect?: (e: RiskEvent) => void }) {
  const sc = severityColor[e.severity];
  const snt = sentimentColor[e.sentiment];
  const action = useActionState(e.id);
  const am = actionStateMeta[action];
  const dimmed = action === "acknowledged";
  const selected = useRiskStore((s) => s.selected.has(e.id));
  const toggleSelected = useRiskStore((s) => s.toggleSelected);
  return (
    <TableRow
      className={cn(
        "group h-8 cursor-pointer border-slate-100 transition-colors hover:bg-slate-50",
        dimmed && "opacity-55",
        selected && "bg-sky-50/60 hover:bg-sky-50",
      )}
      onClick={() => onSelect?.(e)}
      tabIndex={0}
      onKeyDown={(ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          onSelect?.(e);
        }
      }}
    >
      <TableCell className="py-0 pl-3 pr-1 align-middle" onClick={(ev) => ev.stopPropagation()}>
        <Checkbox
          checked={selected}
          onCheckedChange={() => toggleSelected(e.id)}
          className="h-3.5 w-3.5 border-slate-300 data-[state=checked]:border-sky-600 data-[state=checked]:bg-sky-600"
          aria-label={`Select ${e.id}`}
        />
      </TableCell>
      <TableCell className="py-0 pr-3 align-middle">
        <div className="flex items-center gap-2">
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", sc.dot)} />
          <span className="tabular text-[11px] text-slate-600">{formatDate(e.date)}</span>
        </div>
      </TableCell>
      <TableCell className="py-0 pr-3 align-middle">
        <span className={cn("inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium", pillarColor[e.pillar])}>
          {e.pillar}
        </span>
      </TableCell>
      <TableCell className="py-0 pr-3 align-middle">
        <div className="flex items-center gap-2">
          <span className="tabular text-[10px] text-slate-400">{e.id}</span>
          <span className="truncate text-[12px] font-medium text-slate-800 group-hover:text-slate-900">{e.title}</span>
        </div>
      </TableCell>
      <TableCell className="py-0 pr-3 text-right align-middle">
        <span className="tabular text-[12px] font-semibold text-slate-700">{e.articles}</span>
      </TableCell>
      <TableCell className="py-0 pr-3 text-right align-middle">
        <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium capitalize", snt.bg, snt.text)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", snt.dot)} />
          {e.sentiment}
        </span>
      </TableCell>
      <TableCell className="py-0 pl-3 pr-4 text-right align-middle">
        <div className="flex items-center justify-end gap-1.5">
          {action !== "pending" ? (
            <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-semibold capitalize", am.chip)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", am.dot)} />
              {am.label}
            </span>
          ) : (
            <span className="text-[10px] text-slate-300">—</span>
          )}
          <ChevronRight className="h-3 w-3 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500" />
        </div>
      </TableCell>
    </TableRow>
  );
}

function FilterBar() {
  const { filters, setFilter, resetFilters } = useRiskStore();
  const hasActive =
    filters.pillar !== "all" ||
    filters.severity !== "all" ||
    filters.status !== "all" ||
    filters.source !== "all" ||
    filters.region !== "all" ||
    filters.query !== "";

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 bg-slate-50/40 px-3 py-2">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        <Filter className="h-3 w-3" />
        Filter
      </div>
      <Select value={filters.pillar} onValueChange={(v) => setFilter("pillar", v as RiskPillar | "all")}>
        <SelectTrigger className="h-7 w-[120px] border-slate-200 bg-white text-[11px] text-slate-700">
          <SelectValue placeholder="Pillar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All pillars</SelectItem>
          {allPillars.map((p) => (
            <SelectItem key={p} value={p}>{p}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.severity} onValueChange={(v) => setFilter("severity", v as Severity | "all")}>
        <SelectTrigger className="h-7 w-[100px] border-slate-200 bg-white text-[11px] capitalize text-slate-700">
          <SelectValue placeholder="Severity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All severities</SelectItem>
          {allSeverities.map((s) => (
            <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.status} onValueChange={(v) => setFilter("status", v as ActionState | "all")}>
        <SelectTrigger className="h-7 w-[120px] border-slate-200 bg-white text-[11px] capitalize text-slate-700">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {allStatuses.map((s) => (
            <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.source} onValueChange={(v) => setFilter("source", v as string | "all")}>
        <SelectTrigger className="h-7 w-[130px] border-slate-200 bg-white text-[11px] text-slate-700">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All sources</SelectItem>
          {topSources.map((s) => (
            <SelectItem key={s.source} value={s.source}>{s.source}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.region} onValueChange={(v) => setFilter("region", v as string | "all")}>
        <SelectTrigger className="h-7 w-[110px] border-slate-200 bg-white text-[11px] text-slate-700">
          <SelectValue placeholder="Region" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All regions</SelectItem>
          {geoRegions.map((r) => (
            <SelectItem key={r.code} value={r.code}>{r.code} · {r.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="relative ml-auto">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
        <Input
          value={filters.query}
          onChange={(e) => setFilter("query", e.target.value)}
          placeholder="Search title or ID…"
          className="h-7 w-[180px] border-slate-200 bg-white pl-7 pr-6 text-[11px] text-slate-700 placeholder:text-slate-400"
        />
        {filters.query ? (
          <button
            type="button"
            onClick={() => setFilter("query", "")}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        ) : null}
      </div>
      <SavedViewsMenu />
      {hasActive ? (
        <button
          type="button"
          onClick={resetFilters}
          className="flex items-center gap-1 rounded px-1.5 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-3 w-3" />
          Reset
        </button>
      ) : null}
    </div>
  );
}

function BulkActionBar({ visibleRowIds }: { visibleRowIds: string[] }) {
  const selected = useRiskStore((s) => s.selected);
  const clearSelected = useRiskStore((s) => s.clearSelected);
  const setSelected = useRiskStore((s) => s.setSelected);
  const bulkAcknowledge = useRiskStore((s) => s.bulkAcknowledge);
  const bulkEscalate = useRiskStore((s) => s.bulkEscalate);

  const visibleSelected = visibleRowIds.filter((id) => selected.has(id));
  const count = visibleSelected.length;
  const allVisibleSelected = visibleRowIds.length > 0 && visibleSelected.length === visibleRowIds.length;

  if (count === 0) return null;

  const handleAck = () => {
    bulkAcknowledge();
    toast.success(`Acknowledged ${count} event${count > 1 ? "s" : ""}`, {
      description: `${count} risk event${count > 1 ? "s have" : " has"} been acknowledged.`,
    });
  };

  const handleEscalate = () => {
    bulkEscalate();
    toast.success(`Escalated ${count} event${count > 1 ? "s" : ""}`, {
      description: `${count} risk event${count > 1 ? "s have" : " has"} been escalated to the incident channel.`,
    });
  };

  return (
    <div className="flex items-center gap-2 border-b border-sky-100 bg-sky-50/80 px-3 py-2">
      <span className="tabular flex items-center gap-1.5 text-[11px] font-semibold text-sky-800">
        <CheckCheck className="h-3.5 w-3.5" />
        {count} selected
      </span>
      <div className="mx-1 h-4 w-px bg-sky-200" />
      <button
        type="button"
        onClick={handleAck}
        className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-700"
      >
        <CheckCheck className="h-3 w-3" />
        Acknowledge
      </button>
      <button
        type="button"
        onClick={handleEscalate}
        className="flex items-center gap-1 rounded-md bg-amber-600 px-2 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-amber-700"
      >
        <ArrowUpRight className="h-3 w-3" />
        Escalate
      </button>
      <button
        type="button"
        onClick={() => {
          if (allVisibleSelected) {
            // deselect only the visible ones
            const next = new Set(selected);
            for (const id of visibleRowIds) next.delete(id);
            setSelected([...next]);
          } else {
            // select all visible (merges with existing)
            setSelected([...new Set([...selected, ...visibleRowIds])]);
          }
        }}
        className="ml-auto text-[10px] font-medium text-sky-700 hover:text-sky-900"
      >
        {allVisibleSelected ? "Deselect visible" : "Select all visible"}
      </button>
      <button
        type="button"
        onClick={clearSelected}
        className="flex items-center gap-1 rounded px-1.5 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      >
        <X className="h-3 w-3" />
        Clear
      </button>
    </div>
  );
}

export function RiskEventsTable({ limit, onSelect }: { limit?: number; onSelect?: (e: RiskEvent) => void }) {
  const { actions, filters, selected, setSelected } = useRiskStore();
  const filtered = React.useMemo(
    () => filterRiskEvents(riskEvents, filters, actions),
    [filters, actions],
  );
  const rows = limit ? filtered.slice(0, limit) : filtered;
  const critical = riskEvents.filter((e) => e.severity === "critical").length;
  const high = riskEvents.filter((e) => e.severity === "high").length;
  const acked = Object.values(actions).filter((a) => a === "acknowledged").length;
  const visibleIds = rows.map((r) => r.id);
  const visibleSelectedCount = visibleIds.filter((id) => selected.has(id)).length;

  const handleExport = () => {
    // Export selected rows if any, otherwise all filtered rows.
    const exportRows =
      visibleSelectedCount > 0
        ? rows.filter((r) => selected.has(r.id))
        : rows;
    if (exportRows.length === 0) {
      toast.error("Nothing to export", { description: "No rows match the current filters." });
      return;
    }
    const csv = buildEventsCsv(exportRows, actions);
    const ts = new Date().toISOString().slice(0, 10);
    const scope = visibleSelectedCount > 0 ? "selected" : "filtered";
    downloadCsv(`harch-risk-events-${scope}-${ts}.csv`, csv);
    toast.success(`Exported ${exportRows.length} event${exportRows.length > 1 ? "s" : ""}`, {
      description: `CSV downloaded · ${scope} scope · ${exportRows.length} rows.`,
    });
  };

  return (
    <ChartCard
      id="alerts"
      title="Risk Events"
      subtitle="GLM-4 classified signals · last 7 days · click a row to drill down"
      action={
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" />Critical <span className="tabular text-slate-700">{critical}</span></span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-orange-500" />High <span className="tabular text-slate-700">{high}</span></span>
          {acked > 0 ? (
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Acked <span className="tabular text-slate-700">{acked}</span></span>
          ) : null}
          {visibleSelectedCount > 0 ? (
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-sky-500" />Sel <span className="tabular text-slate-700">{visibleSelectedCount}</span></span>
          ) : null}
          <span className="tabular text-slate-700">{rows.length}</span>/<span className="tabular text-slate-700">{riskEvents.length}</span>
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            title={visibleSelectedCount > 0 ? `Export ${visibleSelectedCount} selected` : "Export filtered rows"}
          >
            <Download className="h-3 w-3" />
            CSV
          </button>
        </div>
      }
      bodyClassName="p-0"
    >
      <FilterBar />
      <BulkActionBar visibleRowIds={visibleIds} />
      <div className="harch-scroll max-h-[320px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="h-8 border-slate-100 bg-slate-50/60 hover:bg-slate-50/60">
              <TableHead className="h-8 w-8 py-0 pl-3 pr-1">
                <Checkbox
                  checked={visibleIds.length > 0 && visibleSelectedCount === visibleIds.length}
                  onCheckedChange={() => {
                    const allSel = visibleSelectedCount === visibleIds.length;
                    if (allSel) {
                      const next = new Set(selected);
                      for (const id of visibleIds) next.delete(id);
                      setSelected([...next]);
                    } else {
                      setSelected([...new Set([...selected, ...visibleIds])]);
                    }
                  }}
                  className="h-3.5 w-3.5 border-slate-300 data-[state=checked]:border-sky-600 data-[state=checked]:bg-sky-600"
                  aria-label="Select all visible rows"
                />
              </TableHead>
              <TableHead className="h-8 py-0 pr-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Date</TableHead>
              <TableHead className="h-8 py-0 pr-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Risk Pillar</TableHead>
              <TableHead className="h-8 py-0 pr-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Event Title</TableHead>
              <TableHead className="h-8 py-0 pr-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500"># Articles</TableHead>
              <TableHead className="h-8 py-0 pr-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">Sentiment</TableHead>
              <TableHead className="h-8 py-0 pl-3 pr-4 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="h-20">
                <TableCell colSpan={7} className="text-center">
                  <div className="flex flex-col items-center gap-1 py-4 text-slate-400">
                    <Search className="h-5 w-5 text-slate-300" />
                    <span className="text-[12px] font-medium">No events match your filters</span>
                    <span className="text-[10px]">Try resetting the filter bar above.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((e) => (
                <Row key={e.id} e={e} onSelect={onSelect} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </ChartCard>
  );
}
