"use client";

/**
 * Harch Atelier — UI session store (V13.1)
 *
 * Lightweight session-only zustand store for ephemeral UI state that should
 * persist across section navigation but NOT across page reloads:
 *  - `recentSections`: the last 5 visited section ids (most-recent first).
 *
 * Kept separate from `risk-store` (persisted) and `global-filters-store`
 * (session workspace scope) to keep concerns cleanly separated.
 */
import { create } from "zustand";

const MAX_RECENT = 5;

interface UiState {
  recentSections: string[];
  pushRecent: (sectionId: string) => void;
  clearRecent: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  recentSections: [],
  pushRecent: (sectionId) => {
    if (!sectionId || sectionId === "dashboard") return;
    const prev = get().recentSections;
    // Dedupe + move to front.
    const next = [sectionId, ...prev.filter((id) => id !== sectionId)].slice(0, MAX_RECENT);
    set({ recentSections: next });
  },
  clearRecent: () => set({ recentSections: [] }),
}));
