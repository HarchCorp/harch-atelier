"use client";

/**
 * Harch Atelier — Global context filters (V13.1)
 *
 * A lightweight, session-only zustand store for the cross-section "global
 * context" filters shown in the GlobalFilterBar: date range, entity, pillar,
 * region. These persist across section navigation so an analyst can scope the
 * entire workspace to "last 30 days · Attijariwafa · Regulatory · EU" and
 * every section they visit reflects that scope.
 *
 * NOT persisted to localStorage (session-only) — matches the risk-store's
 * `filters` field behavior. Use the risk-store for risk-event-specific
 * filters (severity/status/source/query); use this store for the global
 * workspace scope.
 */
import { create } from "zustand";
import type { RiskPillar } from "@/lib/mock-data";

export type DateRangeKey = "7d" | "30d" | "90d" | "1y" | "all";

export interface GlobalFilters {
  dateRange: DateRangeKey;
  /** Entity id from entities-data, or "all". */
  entity: string;
  pillar: RiskPillar | "all";
  region: string | "all";
}

interface GlobalFilterState extends GlobalFilters {
  set: <K extends keyof GlobalFilters>(key: K, value: GlobalFilters[K]) => void;
  setMany: (patch: Partial<GlobalFilters>) => void;
  reset: () => void;
  /** Active filter count (for the bar's badge). */
  activeCount: () => number;
}

const defaults: GlobalFilters = {
  dateRange: "30d",
  entity: "all",
  pillar: "all",
  region: "all",
};

export const useGlobalFilters = create<GlobalFilterState>((set, get) => ({
  ...defaults,
  set: (key, value) => set({ [key]: value } as Pick<GlobalFilters, typeof key>),
  setMany: (patch) => set(patch),
  reset: () => set({ ...defaults }),
  activeCount: () => {
    const s = get();
    let n = 0;
    if (s.dateRange !== defaults.dateRange) n++;
    if (s.entity !== "all") n++;
    if (s.pillar !== "all") n++;
    if (s.region !== "all") n++;
    return n;
  },
}));

/** Human label for each date-range key. */
export const dateRangeLabel: Record<DateRangeKey, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
  "1y": "1 year",
  all: "All time",
};

/** Regions (matches mock-data region codes + friendly labels). */
export const regionOptions: { value: string; label: string }[] = [
  { value: "all", label: "All regions" },
  { value: "MA", label: "Morocco" },
  { value: "EU", label: "Europe" },
  { value: "NA", label: "North America" },
  { value: "APAC", label: "Asia-Pacific" },
  { value: "MEA", label: "Middle East & Africa" },
  { value: "LATAM", label: "Latin America" },
];

/** Pillars (matches mock-data RiskPillar). */
export const pillarOptions: { value: RiskPillar | "all"; label: string }[] = [
  { value: "all", label: "All pillars" },
  { value: "Regulatory", label: "Regulatory" },
  { value: "Cyber", label: "Cyber" },
  { value: "Financial", label: "Financial" },
  { value: "ESG", label: "ESG" },
  { value: "Geopolitical", label: "Geopolitical" },
  { value: "Reputational", label: "Reputational" },
];
