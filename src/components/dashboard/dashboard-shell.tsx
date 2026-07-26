"use client";

import * as React from "react";
import { TopBar } from "./topbar";
import { KpiStrip } from "./kpi-strip";
import type { AccountType, AlertItem } from "@/lib/mock-data";
import { ShieldCheck, Lock } from "lucide-react";

interface DashboardShellProps {
  accountType: AccountType;
  onAccountTypeChange: (t: AccountType) => void;
  title: string;
  description: string;
  onOpenPalette: () => void;
  onOpenAlert?: (a: AlertItem) => void;
  onOpenBrief?: () => void;
  children: React.ReactNode;
}

export function DashboardShell({
  accountType,
  onAccountTypeChange,
  title,
  description,
  onOpenPalette,
  onOpenAlert,
  onOpenBrief,
  children,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <TopBar
        accountType={accountType}
        onAccountTypeChange={onAccountTypeChange}
        onOpenPalette={onOpenPalette}
        onOpenAlert={onOpenAlert}
        onOpenBrief={onOpenBrief}
      />

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-5 lg:px-6 lg:py-6">
        {/* Page header */}
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[20px] font-bold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-0.5 text-[12px] text-slate-500">{description}</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live feed · synced 2m ago
            </span>
            <span className="hidden h-3 w-px bg-slate-200 sm:block" />
            <span className="hidden items-center gap-1 sm:flex">
              <Lock className="h-3 w-3" />
              SOC-2 · EU data residency
            </span>
          </div>
        </div>

        {/* KPI strip */}
        <KpiStrip />

        {/* Widget grid (page-specific) */}
        <div className="mt-5">{children}</div>
      </main>

      {/* Sticky footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-2 px-4 py-3 text-[11px] text-slate-400 sm:flex-row lg:px-6">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
            <span>Harch Atelier · Enterprise Risk Intelligence</span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
              v12.0
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>© 2025 HarchCorp</span>
            <span className="hidden items-center gap-1 sm:flex">
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1 py-px text-[9px] font-semibold text-slate-500">?</kbd>
              <span className="text-slate-400">for shortcuts</span>
            </span>
            <span className="hidden sm:inline">All signals simulated for demo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
