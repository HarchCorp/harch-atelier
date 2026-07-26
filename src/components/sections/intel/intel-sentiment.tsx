"use client";

import * as React from "react";
import { Smile } from "lucide-react";
import { SectionHeader } from "../section-header";
import { SentimentTrend } from "@/components/dataviz/sentiment-trend";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";

/** Intelligence → Sentiment Trend (reuses existing widget). */
export function IntelSentiment({ accountType }: SectionComponentProps) {
  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="intel-sentiment"
        accountType={accountType}
        accent="emerald"
        statusChips={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-300 ring-1 ring-white/10">
            <Smile className="h-3 w-3 text-emerald-300" />
            GLM-4 classified
          </span>
        }
      />
      <SentimentTrend />
    </div>
  );
}
