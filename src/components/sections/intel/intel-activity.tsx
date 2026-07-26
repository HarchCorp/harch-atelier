"use client";

import * as React from "react";
import { ListChecks } from "lucide-react";
import { SectionHeader } from "../section-header";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";

/** Intelligence → Activity Feed (reuses the dashboard's audit trail widget). */
export function IntelActivity({ accountType }: SectionComponentProps) {
  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="intel-activity"
        accountType={accountType}
        accent="sky"
        statusChips={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-300 ring-1 ring-white/10">
            <ListChecks className="h-3 w-3 text-sky-300" />
            Analyst + system stream
          </span>
        }
      />
      <ActivityFeed />
    </div>
  );
}
