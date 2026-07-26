"use client";

/**
 * Harch Atelier — Global Filter Bar (V13.1)
 *
 * A sleek, collapsible filter strip rendered below the page header. Scopes the
 * entire workspace: date range, entity, pillar, region. State lives in the
 * session-only `useGlobalFilters` store so it persists across section
 * navigation. An active-filter badge + reset affordance keep things tidy.
 *
 * Responsive: full controls on desktop, a compact "Filters (N)" popover on
 * mobile.
 */
import * as React from "react";
import {
  Calendar,
  Building2,
  ShieldAlert,
  Globe2,
  RotateCcw,
  SlidersHorizontal,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  useGlobalFilters,
  dateRangeLabel,
  regionOptions,
  pillarOptions,
  type DateRangeKey,
} from "@/lib/global-filters-store";
import { entityDirectory } from "@/lib/entities-data";
import type { RiskPillar } from "@/lib/mock-data";

interface GlobalFilterBarProps {
  /** Hide the bar entirely (e.g. on the dashboard landing). */
  hidden?: boolean;
}

/** A single labeled filter control. */
function FilterPill({
  icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 transition-colors hover:border-slate-300">
      <span className="flex h-5 w-5 items-center justify-center text-slate-400">{icon}</span>
      <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:inline">
        {label}
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-6 w-auto gap-1 border-0 bg-transparent p-0 text-[12px] font-medium text-slate-700 shadow-none focus:ring-0 data-[size=default]:h-6">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="min-w-[140px]">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-[12px]">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function GlobalFilterBar({ hidden }: GlobalFilterBarProps) {
  const filters = useGlobalFilters();
  const activeCount = useGlobalFilters((s) => s.activeCount());

  if (hidden) return null;

  const dateOptions = (Object.keys(dateRangeLabel) as DateRangeKey[]).map((k) => ({
    value: k,
    label: dateRangeLabel[k],
  }));
  const entityOptions = [
    { value: "all", label: "All entities" },
    ...entityDirectory.slice(0, 24).map((e) => ({
      value: e.id,
      label: e.ticker ? `${e.name} (${e.ticker})` : e.name,
    })),
  ];
  const pillarOpts = pillarOptions as unknown as { value: string; label: string }[];
  const regionOpts = regionOptions;

  const full = (
    <div className="flex flex-wrap items-center gap-2">
      <FilterPill
        icon={<Calendar className="h-3.5 w-3.5" />}
        label="Range"
        value={filters.dateRange}
        options={dateOptions}
        onChange={(v) => filters.set("dateRange", v as DateRangeKey)}
      />
      <FilterPill
        icon={<Building2 className="h-3.5 w-3.5" />}
        label="Entity"
        value={filters.entity}
        options={entityOptions}
        onChange={(v) => filters.set("entity", v)}
      />
      <FilterPill
        icon={<ShieldAlert className="h-3.5 w-3.5" />}
        label="Pillar"
        value={filters.pillar}
        options={pillarOpts}
        onChange={(v) => filters.set("pillar", v as RiskPillar | "all")}
      />
      <FilterPill
        icon={<Globe2 className="h-3.5 w-3.5" />}
        label="Region"
        value={filters.region}
        options={regionOpts}
        onChange={(v) => filters.set("region", v)}
      />
      {activeCount > 0 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={filters.reset}
              className="h-7 gap-1 px-2 text-[11px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear all global filters</TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-slate-500 ring-1 ring-slate-200">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </span>
          <span className="hidden text-[11px] font-semibold uppercase tracking-wider text-slate-500 sm:inline">
            Workspace scope
          </span>
          {activeCount > 0 ? (
            <Badge className="h-5 gap-0.5 bg-emerald-100 px-1.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700 hover:bg-emerald-100">
              <Check className="h-2.5 w-2.5" />
              {activeCount} active
            </Badge>
          ) : (
            <span className="hidden text-[10px] text-slate-400 md:inline">
              No filters applied
            </span>
          )}
        </div>

        {/* Desktop: inline filters */}
        <div className="hidden md:block">{full}</div>

        {/* Mobile: compact popover */}
        <div className="md:hidden">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 border-slate-200 px-2 text-[11px] font-medium"
              >
                <SlidersHorizontal className="h-3 w-3" />
                Filters
                {activeCount > 0 ? (
                  <Badge className="ml-0.5 h-4 px-1 text-[9px] font-bold text-emerald-700">
                    {activeCount}
                  </Badge>
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Workspace scope
                </span>
                {activeCount > 0 ? (
                  <button
                    type="button"
                    onClick={filters.reset}
                    className="flex items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-slate-700"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                ) : null}
              </div>
              <div className="flex flex-col gap-2.5">{full}</div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </TooltipProvider>
  );
}
