"use client";

import * as React from "react";
import { Eye } from "lucide-react";
import { SectionHeader } from "../section-header";
import { WatchlistSignals } from "@/components/dashboard/watchlist-signals";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";

/** Intelligence → Watchlist (reuses the dashboard's live-signal grid). */
export function IntelWatchlist({ accountType }: SectionComponentProps) {
  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="intel-watchlist"
        accountType={accountType}
        accent="emerald"
        statusChips={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-300 ring-1 ring-white/10">
            <Eye className="h-3 w-3 text-emerald-300" />
            Live signal pulses
          </span>
        }
      />
      <WatchlistSignals />
    </div>
  );
}
