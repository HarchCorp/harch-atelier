"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getArticlesFor, sourceIndex, regionIndex, type AlertStatus, type RiskEvent, type RiskPillar, type Severity } from "@/lib/mock-data";

/**
 * Shared risk-event action state.
 *
 * Keeps a map of eventId → ActionState so the drawer, the RiskEventsTable,
 * and the AlertsPopover all render the same status. Actions (acknowledge /
 * escalate / watch) are dispatched here and every subscriber re-renders.
 *
 * `actions` and `readAlerts` are persisted to localStorage so acknowledged /
 * escalated state survives page reloads. `filters` are session-only.
 */

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
  | "acknowledge"
  | "escalate"
  | "watch"
  | "bulk-acknowledge"
  | "bulk-escalate"
  | "save-view"
  | "load-view"
  | "duplicate-view"
  | "merge-views"
  | "delete-view"
  | "reset-workspace";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  /** human label, e.g. "Acknowledged 'SEC inquiry'" */
  label: string;
  /** optional detail / description */
  detail?: string;
  /** ISO timestamp */
  ts: number;
}

interface RiskState {
  /** eventId → action state */
  actions: Record<string, ActionState>;
  /** alertId → read flag */
  readAlerts: Record<string, boolean>;
  /** session-only filters (not persisted) */
  filters: FilterState;
  /** selected eventIds for bulk operations */
  selected: Set<string>;
  /** named filter presets (persisted) */
  savedViews: SavedView[];
  /** audit trail of user actions (persisted, capped at 50) */
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

  /** Wipe all persisted + session state (reset workspace). */
  clearAll: () => void;
}

const defaultFilters: FilterState = {
  pillar: "all",
  severity: "all",
  status: "all",
  source: "all",
  region: "all",
  query: "",
};

export const useRiskStore = create<RiskState>()(
  persist(
    (set, get) => ({
      actions: {},
      readAlerts: {},
      filters: { ...defaultFilters },
      selected: new Set<string>(),
      savedViews: [],
      activity: [],

      setAction: (eventId, state, label) =>
        set((s) => {
          const nextActions = { ...s.actions, [eventId]: state };
          const verb = state === "acknowledged" ? "Acknowledged" : state === "escalated" ? "Escalated" : state === "watching" ? "Watching" : "Set";
          const entry: ActivityEntry = {
            id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            type: state === "acknowledged" ? "acknowledge" : state === "escalated" ? "escalate" : state === "watching" ? "watch" : "acknowledge",
            label: label ? `${verb} "${label}"` : `${verb} ${eventId}`,
            detail: eventId,
            ts: Date.now(),
          };
          return {
            actions: nextActions,
            activity: [entry, ...s.activity].slice(0, 50),
          };
        }),

      getAction: (eventId) => get().actions[eventId] ?? "pending",

      markAlertRead: (alertId) =>
        set((s) => ({
          readAlerts: { ...s.readAlerts, [alertId]: true },
        })),

      markAllAlertsRead: (alertIds) =>
        set((s) => {
          const next = { ...s.readAlerts };
          for (const id of alertIds) next[id] = true;
          return { readAlerts: next };
        }),

      acknowledgeAll: (alertIds, eventIds) =>
        set((s) => {
          const nextActions = { ...s.actions };
          const nextReads = { ...s.readAlerts };
          for (const id of eventIds) nextActions[id] = "acknowledged";
          for (const id of alertIds) nextReads[id] = true;
          return { actions: nextActions, readAlerts: nextReads };
        }),

      isAlertRead: (alertId) => get().readAlerts[alertId] === true,

      setFilter: (key, value) =>
        set((s) => ({ filters: { ...s.filters, [key]: value } })),

      resetFilters: () => set({ filters: { ...defaultFilters } }),

      toggleSelected: (eventId) =>
        set((s) => {
          const next = new Set(s.selected);
          if (next.has(eventId)) next.delete(eventId);
          else next.add(eventId);
          return { selected: next };
        }),

      setSelected: (eventIds) => set({ selected: new Set(eventIds) }),

      clearSelected: () => set({ selected: new Set<string>() }),

      bulkAcknowledge: () =>
        set((s) => {
          if (s.selected.size === 0) return s;
          const nextActions = { ...s.actions };
          for (const id of s.selected) nextActions[id] = "acknowledged";
          const count = s.selected.size;
          const entry: ActivityEntry = {
            id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            type: "bulk-acknowledge",
            label: `Bulk acknowledged ${count} event${count > 1 ? "s" : ""}`,
            ts: Date.now(),
          };
          return { actions: nextActions, selected: new Set<string>(), activity: [entry, ...s.activity].slice(0, 50) };
        }),

      bulkEscalate: () =>
        set((s) => {
          if (s.selected.size === 0) return s;
          const nextActions = { ...s.actions };
          for (const id of s.selected) nextActions[id] = "escalated";
          const count = s.selected.size;
          const entry: ActivityEntry = {
            id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            type: "bulk-escalate",
            label: `Bulk escalated ${count} event${count > 1 ? "s" : ""}`,
            ts: Date.now(),
          };
          return { actions: nextActions, selected: new Set<string>(), activity: [entry, ...s.activity].slice(0, 50) };
        }),

      saveView: (name) =>
        set((s) => {
          const view: SavedView = {
            id: `view-${Date.now().toString(36)}`,
            name: name.trim() || `View ${s.savedViews.length + 1}`,
            filters: { ...s.filters },
            createdAt: Date.now(),
          };
          const entry: ActivityEntry = {
            id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            type: "save-view",
            label: `Saved view "${view.name}"`,
            ts: Date.now(),
          };
          return { savedViews: [...s.savedViews, view], activity: [entry, ...s.activity].slice(0, 50) };
        }),

      loadView: (id) =>
        set((s) => {
          const view = s.savedViews.find((v) => v.id === id);
          if (!view) return s;
          const entry: ActivityEntry = {
            id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            type: "load-view",
            label: `Loaded view "${view.name}"`,
            ts: Date.now(),
          };
          return { filters: { ...view.filters }, selected: new Set<string>(), activity: [entry, ...s.activity].slice(0, 50) };
        }),

      deleteView: (id) =>
        set((s) => {
          const view = s.savedViews.find((v) => v.id === id);
          if (!view) return s;
          const entry: ActivityEntry = {
            id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            type: "delete-view",
            label: `Deleted view "${view.name}"`,
            ts: Date.now(),
          };
          return {
            savedViews: s.savedViews.filter((v) => v.id !== id),
            activity: [entry, ...s.activity].slice(0, 50),
          };
        }),

      duplicateView: (id) =>
        set((s) => {
          const src = s.savedViews.find((v) => v.id === id);
          if (!src) return s;
          const copy: SavedView = {
            id: `view-${Date.now().toString(36)}`,
            name: `${src.name} (copy)`,
            filters: { ...src.filters },
            createdAt: Date.now(),
          };
          const entry: ActivityEntry = {
            id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            type: "duplicate-view",
            label: `Duplicated "${src.name}"`,
            ts: Date.now(),
          };
          return { savedViews: [...s.savedViews, copy], activity: [entry, ...s.activity].slice(0, 50) };
        }),

      mergeViews: (idA, idB, name) =>
        set((s) => {
          const a = s.savedViews.find((v) => v.id === idA);
          const b = s.savedViews.find((v) => v.id === idB);
          if (!a || !b) return s;
          // Merge: conflicting single-value filters broaden to "all".
          const mergeField = <K extends keyof FilterState>(key: K): FilterState[K] => {
            const va = a.filters[key];
            const vb = b.filters[key];
            if (va === "all") return vb;
            if (vb === "all") return va;
            if (va === vb) return va;
            return "all" as FilterState[K];
          };
          const queryA = a.filters.query.trim();
          const queryB = b.filters.query.trim();
          const mergedQuery = queryA && queryB ? `${queryA} OR ${queryB}` : queryA || queryB;
          const merged: SavedView = {
            id: `view-merged-${Date.now().toString(36)}`,
            name: name.trim() || `${a.name} + ${b.name}`,
            filters: {
              pillar: mergeField("pillar"),
              severity: mergeField("severity"),
              status: mergeField("status"),
              source: mergeField("source"),
              region: mergeField("region"),
              query: mergedQuery,
            },
            createdAt: Date.now(),
          };
          return { savedViews: [...s.savedViews, merged], activity: [{
            id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            type: "merge-views" as ActivityType,
            label: `Merged "${a.name}" + "${b.name}"`,
            detail: `→ "${merged.name}"`,
            ts: Date.now(),
          } as ActivityEntry, ...s.activity].slice(0, 50) };
        }),

      importViews: (views) =>
        set((s) => {
          // Re-id imported views to avoid collisions with existing ones.
          const imported = views.map((v, i) => ({
            ...v,
            id: `view-imported-${Date.now().toString(36)}-${i}`,
            createdAt: Date.now(),
          }));
          return { savedViews: [...s.savedViews, ...imported] };
        }),

      logActivity: (type, label, detail) =>
        set((s) => ({
          activity: [{
            id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            type,
            label,
            detail,
            ts: Date.now(),
          }, ...s.activity].slice(0, 50),
        })),

      clearActivity: () => set({ activity: [] }),

      clearAll: () =>
        set({
          actions: {},
          readAlerts: {},
          filters: { ...defaultFilters },
          selected: new Set<string>(),
          savedViews: [],
          activity: [{
            id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            type: "reset-workspace",
            label: "Workspace reset",
            detail: "All state cleared",
            ts: Date.now(),
          }],
        }),
    }),
    {
      name: "harch-risk-store",
      storage: createJSONStorage(() => localStorage),
      // Persist actions + readAlerts + savedViews + activity. Filters + selected are session-only.
      partialize: (s) => ({
        actions: s.actions,
        readAlerts: s.readAlerts,
        savedViews: s.savedViews,
        activity: s.activity,
      }),
      // Skip SSR/hydration mismatch: the store initializes empty on the server
      // and rehydrates on the client. Components read the live value after mount.
      skipHydration: false,
    },
  ),
);

/** Convenience selector hook for a single event's action state. */
export function useActionState(eventId: string | undefined): ActionState {
  return useRiskStore((s) => (eventId ? s.actions[eventId] ?? "pending" : "pending"));
}

/** Status badge metadata shared by table + drawer + alerts. */
export const actionStateMeta: Record<
  ActionState,
  { label: string; chip: string; dot: string }
> = {
  pending: { label: "Pending", chip: "bg-slate-100 text-slate-500", dot: "bg-slate-400" },
  acknowledged: { label: "Acknowledged", chip: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  escalated: { label: "Escalated", chip: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  watching: { label: "Watching", chip: "bg-sky-50 text-sky-700", dot: "bg-sky-500" },
};

/** Map an ActionState to an AlertStatus for the popover. */
export function actionToAlertStatus(action: ActionState): AlertStatus {
  if (action === "acknowledged") return "acknowledged";
  if (action === "escalated") return "escalated";
  return "new";
}

/** Filter risk events by the current filter state. */
export function filterRiskEvents(
  events: RiskEvent[],
  filters: FilterState,
  actions: Record<string, ActionState>,
): RiskEvent[] {
  const q = filters.query.trim().toLowerCase();
  // Pre-resolve source + region filters to event-id sets (O(1) lookup).
  const sourceMatch = filters.source !== "all" ? (sourceIndex.get(filters.source) ?? new Set<string>()) : null;
  const regionMatch = filters.region !== "all" ? (regionIndex.get(filters.region) ?? new Set<string>()) : null;
  return events.filter((e) => {
    if (filters.pillar !== "all" && e.pillar !== filters.pillar) return false;
    if (filters.severity !== "all" && e.severity !== filters.severity) return false;
    if (filters.status !== "all") {
      const st = actions[e.id] ?? "pending";
      if (st !== filters.status) return false;
    }
    if (sourceMatch && !sourceMatch.has(e.id)) return false;
    if (regionMatch && !regionMatch.has(e.id)) return false;
    if (q) {
      const hay = `${e.title} ${e.id} ${e.pillar} ${e.severity} ${e.region}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
