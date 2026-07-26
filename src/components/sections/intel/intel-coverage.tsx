"use client";

import * as React from "react";
import { Newspaper } from "lucide-react";
import { SectionHeader } from "../section-header";
import { MediaCoverageChart } from "@/components/dataviz/media-coverage-chart";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";

/** Intelligence → Media Coverage (reuses existing widget). */
export function IntelCoverage({ accountType }: SectionComponentProps) {
  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="intel-coverage"
        accountType={accountType}
        accent="cyan"
        statusChips={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-300 ring-1 ring-white/10">
            <Newspaper className="h-3 w-3 text-cyan-300" />
            1,840 sources
          </span>
        }
      />
      <MediaCoverageChart />
    </div>
  );
}
