"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { SectionHeader } from "../section-header";
import { RiskEventsTable } from "@/components/dashboard/risk-events-table";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";

/** Intelligence → Risk Events (reuses the dashboard's triageable table). */
export function IntelEvents({ accountType, onSelect }: SectionComponentProps) {
  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="intel-events"
        accountType={accountType}
        accent="rose"
        statusChips={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-300 ring-1 ring-white/10">
            <AlertTriangle className="h-3 w-3 text-rose-300" />
            14 materialised events
          </span>
        }
      />
      <RiskEventsTable onSelect={onSelect} />
    </div>
  );
}
