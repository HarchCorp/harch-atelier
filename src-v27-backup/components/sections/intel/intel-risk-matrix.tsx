"use client";

import * as React from "react";
import { Grid3x3 } from "lucide-react";
import { SectionHeader } from "../section-header";
import { RiskMatrix } from "@/components/dataviz/risk-matrix";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";

/**
 * Intelligence → Risk Matrix
 * Wraps the existing RiskMatrix widget with a section header consistent
 * with the placeholder style. The matrix's `onSelect` opens the same
 * event drawer used by the dashboard.
 */
export function IntelRiskMatrix({ accountType, onSelect }: SectionComponentProps) {
  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="intel-risk-matrix"
        accountType={accountType}
        accent="violet"
        statusChips={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-300 ring-1 ring-white/10">
            <Grid3x3 className="h-3 w-3 text-violet-300" />
            16 active signals
          </span>
        }
      />
      <RiskMatrix onSelect={onSelect} />
    </div>
  );
}
