"use client";

import { create } from "zustand";
import { getArticlesFor, sourceIndex, regionIndex, type AlertStatus, type RiskEvent, type RiskPillar, type Severity } from "@/lib/mock-data";

export type ActionState = "pending" | "acknowledged" | "escalated" | "watching";

export interface FilterState {
  pillar: RiskPillar | "all";
  severity: Severity | "all";
  status: ActionState | "all";
  source: string | "all";
  region: string | "all";
  query: string;
}

export interface SavedView {
  id: string;
  name: string;
  filters: FilterState;
  createdAt: number;
}

export type ActivityType =
  | "acknowledge" | "escalate" | "watch" | "bulk-acknowledge" | "bulk-escalate"
  | "save-view" | "load-view" | "duplicate-view" | "merge-views" | "delete-view" | "reset-workspace";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  label: string;
  detail?: string;
  ts: number;
}

interface RiskState {
  actions: Record<string, ActionState>;
  readAlerts: Record<string, boolean>;
  filters: FilterState;
  selected: Set<string>;
  savedViews: SavedView[];
  activity: ActivityEntry[];

  setAction: (eventId: string, state: ActionState, label?: string) => void;
  getAction: (eventId: string) => ActionState;
  markAlertRead: (alertId: string) => void;
  markAllAlertsRead: (alertIds: string[]) => void;
  acknowledgeAll: (alertIds: string[], eventIds: string[]) => void;
  isAlertRead: (alertId: string) => boolean;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  toggleSelected: (eventId: string) => void;
  setSelected: (eventIds: string[]) => void;
  clearSelected: () => void;
  bulkAcknowledge: () => void;
  bulkEscalate: () => void;
  saveView: (name: string) => void;
  loadView: (id: string) => void;
  deleteView: (id: string) => void;
  duplicateView: (id: string) => void;
  mergeViews: (idA: string, idB: string, name: string) => void;
  importViews: (views: SavedView[]) => void;
  logActivity: (type: ActivityType, label: string, detail?: string) => void;
  clearActivity: () => void;
  clearAll: () => void;
}

const defaultFilters: FilterState = {
  pillar: "all", severity: "all", status: "all", source: "all", region: "all", query: "",
};

// Plain zustand — NO persist middleware (causes SSR crashes in production)
export const useRiskStore = create<RiskState>((set, get) => ({
  actions: {}, readAlerts: {}, filters: { ...defaultFilters },
  selected: new Set<string>(), savedViews: [], activity: [],

  setAction: (eventId, state, label) => set((s) => {
    const verb = state === "acknowledged" ? "Acknowledged" : state === "escalated" ? "Escalated" : state === "watching" ? "Watching" : "Reverted";
    const entry: ActivityEntry = {
      id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      type: state === "acknowledged" ? "acknowledge" : state === "escalated" ? "escalate" : state === "watching" ? "watch" : "acknowledge",
      label: label ? `${verb} "${label}"` : `${verb} ${eventId}`, detail: eventId, ts: Date.now(),
    };
    return { actions: { ...s.actions, [eventId]: state }, activity: [entry, ...s.activity].slice(0, 50) };
  }),
  getAction: (eventId) => get().actions[eventId] ?? "pending",
  markAlertRead: (alertId) => set((s) => ({ readAlerts: { ...s.readAlerts, [alertId]: true } })),
  markAllAlertsRead: (alertIds) => set((s) => { const n = { ...s.readAlerts }; for (const id of alertIds) n[id] = true; return { readAlerts: n }; }),
  acknowledgeAll: (alertIds, eventIds) => set((s) => {
    const na = { ...s.actions }; const nr = { ...s.readAlerts };
    for (const id of eventIds) na[id] = "acknowledged";
    for (const id of alertIds) nr[id] = true;
    return { actions: na, readAlerts: nr };
  }),
  isAlertRead: (alertId) => get().readAlerts[alertId] === true,
  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () => set({ filters: { ...defaultFilters } }),
  toggleSelected: (eventId) => set((s) => { const n = new Set(s.selected); if (n.has(eventId)) n.delete(eventId); else n.add(eventId); return { selected: n }; }),
  setSelected: (eventIds) => set({ selected: new Set(eventIds) }),
  clearSelected: () => set({ selected: new Set<string>() }),
  bulkAcknowledge: () => set((s) => { if (!s.selected.size) return s; const na = { ...s.actions }; for (const id of s.selected) na[id] = "acknowledged"; return { actions: na, selected: new Set<string>() }; }),
  bulkEscalate: () => set((s) => { if (!s.selected.size) return s; const na = { ...s.actions }; for (const id of s.selected) na[id] = "escalated"; return { actions: na, selected: new Set<string>() }; }),
  saveView: (name) => set((s) => ({ savedViews: [...s.savedViews, { id: `view-${Date.now().toString(36)}`, name: name.trim() || `View ${s.savedViews.length + 1}`, filters: { ...s.filters }, createdAt: Date.now() }] })),
  loadView: (id) => set((s) => { const v = s.savedViews.find((x) => x.id === id); return v ? { filters: { ...v.filters }, selected: new Set<string>() } : s; }),
  deleteView: (id) => set((s) => ({ savedViews: s.savedViews.filter((v) => v.id !== id) })),
  duplicateView: (id) => set((s) => { const src = s.savedViews.find((v) => v.id === id); if (!src) return s; return { savedViews: [...s.savedViews, { id: `view-${Date.now().toString(36)}`, name: `${src.name} (copy)`, filters: { ...src.filters }, createdAt: Date.now() }] }; }),
  mergeViews: (idA, idB, name) => set((s) => { const a = s.savedViews.find((v) => v.id === idA); const b = s.savedViews.find((v) => v.id === idB); if (!a || !b) return s; const mf = <K extends keyof FilterState>(k: K): FilterState[K] => { const va = a.filters[k]; const vb = b.filters[k]; if (va === "all") return vb; if (vb === "all") return va; if (va === vb) return va; return "all" as FilterState[K]; }; return { savedViews: [...s.savedViews, { id: `view-merged-${Date.now().toString(36)}`, name: name.trim() || `${a.name} + ${b.name}`, filters: { pillar: mf("pillar"), severity: mf("severity"), status: mf("status"), source: mf("source"), region: mf("region"), query: [a.filters.query, b.filters.query].filter(Boolean).join(" OR ") }, createdAt: Date.now() }] }; }),
  importViews: (views) => set((s) => ({ savedViews: [...s.savedViews, ...views.map((v, i) => ({ ...v, id: `view-imported-${Date.now().toString(36)}-${i}`, createdAt: Date.now() }))] })),
  logActivity: (type, label, detail) => set((s) => ({ activity: [{ id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, type, label, detail, ts: Date.now() }, ...s.activity].slice(0, 50) })),
  clearActivity: () => set({ activity: [] }),
  clearAll: () => set({ actions: {}, readAlerts: {}, filters: { ...defaultFilters }, selected: new Set<string>(), savedViews: [], activity: [] }),
}));

export function useActionState(eventId: string | undefined): ActionState {
  return useRiskStore((s) => (eventId ? s.actions[eventId] ?? "pending" : "pending"));
}

export const actionStateMeta: Record<ActionState, { label: string; chip: string; dot: string }> = {
  pending: { label: "Pending", chip: "bg-slate-100 text-slate-500", dot: "bg-slate-400" },
  acknowledged: { label: "Acknowledged", chip: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  escalated: { label: "Escalated", chip: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  watching: { label: "Watching", chip: "bg-sky-50 text-sky-700", dot: "bg-sky-500" },
};

export function actionToAlertStatus(action: ActionState): AlertStatus {
  if (action === "acknowledged") return "acknowledged";
  if (action === "escalated") return "escalated";
  return "new";
}

export function filterRiskEvents(events: RiskEvent[], filters: FilterState, actions: Record<string, ActionState>): RiskEvent[] {
  const q = filters.query.trim().toLowerCase();
  const sourceMatch = filters.source !== "all" ? (sourceIndex.get(filters.source) ?? new Set<string>()) : null;
  const regionMatch = filters.region !== "all" ? (regionIndex.get(filters.region) ?? new Set<string>()) : null;
  return events.filter((e) => {
    if (filters.pillar !== "all" && e.pillar !== filters.pillar) return false;
    if (filters.severity !== "all" && e.severity !== filters.severity) return false;
    if (filters.status !== "all" && (actions[e.id] ?? "pending") !== filters.status) return false;
    if (sourceMatch && !sourceMatch.has(e.id)) return false;
    if (regionMatch && !regionMatch.has(e.id)) return false;
    if (q && !`${e.title} ${e.id} ${e.pillar} ${e.severity} ${e.region}`.toLowerCase().includes(q)) return false;
    return true;
  });
}
