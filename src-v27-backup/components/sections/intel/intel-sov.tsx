"use client";

import * as React from "react";
import { PieChart as PieIcon } from "lucide-react";
import { SectionHeader } from "../section-header";
import { ShareOfVoice } from "@/components/dataviz/share-of-voice";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";

/** Intelligence → Share of Voice (reuses existing widget). */
export function IntelSov({ accountType }: SectionComponentProps) {
  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="intel-sov"
        accountType={accountType}
        accent="amber"
        statusChips={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-300 ring-1 ring-white/10">
            <PieIcon className="h-3 w-3 text-amber-300" />
            Target vs competitors
          </span>
        }
      />
      <ShareOfVoice />
    </div>
  );
}
