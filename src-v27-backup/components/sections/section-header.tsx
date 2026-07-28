"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, type LucideIcon, Sparkles, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { findNavItem } from "@/lib/nav-config";
import { getSectionMeta } from "@/components/dashboard/section-registry";
import type { AccountType } from "@/lib/mock-data";

interface SectionHeaderProps {
  sectionId: string;
  accountType: AccountType;
  /** Optional hero icon override (defaults to the nav item icon). */
  icon?: LucideIcon;
  /** Optional right-side status chips (e.g. "Live", "Session open"). */
  statusChips?: React.ReactNode;
  /** Optional grid of KPI tiles shown below the hero. */
  kpis?: React.ReactNode;
  /** Tailwind tint for the hero accent blur (defaults to emerald). */
  accent?: "emerald" | "amber" | "sky" | "violet" | "rose" | "cyan";
  className?: string;
}

const accentBlur: Record<NonNullable<SectionHeaderProps["accent"]>, string> = {
  emerald: "bg-emerald-500/10",
  amber: "bg-amber-500/10",
  sky: "bg-sky-500/10",
  violet: "bg-violet-500/10",
  rose: "bg-rose-500/10",
  cyan: "bg-cyan-500/10",
};

const accentIcon: Record<NonNullable<SectionHeaderProps["accent"]>, string> = {
  emerald: "text-emerald-300",
  amber: "text-amber-300",
  sky: "text-sky-300",
  violet: "text-violet-300",
  rose: "text-rose-300",
  cyan: "text-cyan-300",
};

/**
 * SectionHeader — Palantir-grade breadcrumb + hero banner shared by every
 * built section. Matches the visual language of SectionPlaceholder but
 * replaces the "scaffolded" badge with live status chips.
 */
export function SectionHeader({
  sectionId,
  accountType,
  icon,
  statusChips,
  kpis,
  accent = "emerald",
  className,
}: SectionHeaderProps) {
  const meta = getSectionMeta(sectionId);
  const nav = findNavItem(sectionId);
  const categoryName = nav?.category?.label ?? "Section";
  const Icon = icon ?? nav?.item.icon ?? Activity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn("flex flex-col gap-5", className)}
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[11px] text-slate-400">
        <Link href="#dashboard" className="hover:text-slate-700">
          Dashboard
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-500">{categoryName}</span>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-slate-700">{meta.title}</span>
      </nav>

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
        <div className={cn("absolute -right-8 -top-8 h-40 w-40 rounded-full blur-3xl", accentBlur[accent])} />
        <div className="absolute -bottom-12 left-1/3 h-40 w-40 rounded-full bg-slate-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                <Icon className={cn("h-5 w-5", accentIcon[accent])} />
              </span>
              <div>
                <h2 className="text-[20px] font-bold tracking-tight">{meta.title}</h2>
                <p className="text-[12px] text-slate-300">{meta.description}</p>
              </div>
            </div>
            {statusChips ? (
              <div className="flex flex-wrap items-center gap-2">{statusChips}</div>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-300 ring-1 ring-white/10">
              <Sparkles className={cn("h-3 w-3", accentIcon[accent])} />
              Workspace: {accountType}
            </span>
          </div>
        </div>
      </div>

      {kpis ? <div>{kpis}</div> : null}
    </motion.div>
  );
}

/** A standard KPI tile shown below the hero. */
export function KpiTile({
  label,
  value,
  delta,
  deltaLabel,
  tone = "neutral",
  icon: Icon,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaLabel?: string;
  tone?: "positive" | "negative" | "neutral" | "warning";
  icon?: LucideIcon;
}) {
  const toneClass = {
    positive: "text-emerald-700",
    negative: "text-rose-700",
    neutral: "text-slate-600",
    warning: "text-amber-700",
  }[tone];
  const deltaTone = delta && delta.startsWith("-")
    ? "text-rose-600 bg-rose-50 ring-rose-200"
    : "text-emerald-600 bg-emerald-50 ring-emerald-200";
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="card-title">{label}</span>
        {Icon ? <Icon className="h-3.5 w-3.5 text-slate-400" /> : null}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="tabular text-[20px] font-bold text-slate-900">{value}</span>
        {delta ? (
          <span className={cn("tabular rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1", deltaTone)}>
            {delta}
          </span>
        ) : null}
      </div>
      {deltaLabel ? <span className={cn("text-[11px]", toneClass)}>{deltaLabel}</span> : null}
    </div>
  );
}

/** Status chip used inside SectionHeader statusChips slot. */
export function StatusChip({
  label,
  tone = "neutral",
  pulse,
  icon: Icon,
}: {
  label: string;
  tone?: "neutral" | "positive" | "negative" | "warning";
  pulse?: boolean;
  icon?: LucideIcon;
}) {
  const toneClass = {
    neutral: "bg-white/5 text-slate-200 ring-white/10",
    positive: "bg-emerald-500/15 text-emerald-200 ring-emerald-500/30",
    negative: "bg-rose-500/15 text-rose-200 ring-rose-500/30",
    warning: "bg-amber-500/15 text-amber-200 ring-amber-500/30",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1",
        toneClass,
      )}
    >
      {pulse ? (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      ) : Icon ? (
        <Icon className="h-3 w-3" />
      ) : null}
      {label}
    </span>
  );
}
