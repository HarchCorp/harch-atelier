"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  ShieldCheck,
  CircleDot,
  Command as CommandIcon,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertsPopover } from "./alerts-popover";
import { ThemeToggle } from "./theme-toggle";
import { useRiskStore } from "@/lib/risk-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  navByAccountType,
  type AccountType,
  type AlertItem,
} from "@/lib/mock-data";
import { RotateCcw } from "lucide-react";

const accountMeta: Record<AccountType, { label: string; name: string; initials: string; tint: string }> = {
  admin: { label: "Admin Console", name: "A. Marchetti", initials: "AM", tint: "bg-slate-800" },
  trader: { label: "Trader Desk", name: "T. Okafor", initials: "TO", tint: "bg-emerald-700" },
  legal: { label: "Legal Counsel", name: "L. Reyes", initials: "LR", tint: "bg-violet-700" },
  market: { label: "Market Intel", name: "M. Dubois", initials: "MD", tint: "bg-amber-700" },
  self: { label: "Self Service", name: "S. Bauer", initials: "SB", tint: "bg-cyan-700" },
  pr: { label: "PR & Comms", name: "P. Novak", initials: "PN", tint: "bg-rose-700" },
};

interface TopBarProps {
  accountType: AccountType;
  onAccountTypeChange: (t: AccountType) => void;
  onOpenPalette: () => void;
  onOpenAlert?: (a: AlertItem) => void;
  onOpenBrief?: () => void;
}

export function TopBar({ accountType, onAccountTypeChange, onOpenPalette, onOpenAlert, onOpenBrief }: TopBarProps) {
  const nav = navByAccountType[accountType];
  const meta = accountMeta[accountType];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/80 lg:px-6">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-white">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="hidden flex-col leading-none sm:flex">
          <span className="text-[13px] font-bold tracking-tight text-slate-900">
            HARCH<span className="text-slate-400">ATELIER</span>
          </span>
          <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-slate-400">
            Risk Intelligence
          </span>
        </div>
      </div>

      <div className="mx-1 hidden h-6 w-px bg-slate-200 lg:block" />

      {/* Horizontal nav */}
      <nav className="harch-scroll hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto md:flex">
        {nav.map((item, i) => {
          const active = i === 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative shrink-0 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors",
                active
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
              )}
            >
              {item.label}
              {active ? (
                <CircleDot className="absolute -right-0.5 -top-0.5 h-2 w-2 text-emerald-500" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Search / command palette trigger (desktop) */}
      <button
        type="button"
        onClick={onOpenPalette}
        className="relative ml-auto hidden h-8 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-left text-[12px] text-slate-400 transition-colors hover:border-slate-300 hover:bg-white lg:flex lg:w-64"
        aria-label="Open command palette"
      >
        <Search className="h-3.5 w-3.5 text-slate-400" />
        <span className="flex-1 truncate">Search events, alerts…</span>
        <kbd className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1 py-px text-[9px] font-semibold text-slate-500">
          <CommandIcon className="h-2.5 w-2.5" />K
        </kbd>
      </button>
      {/* Mobile search icon (opens palette) */}
      <button
        type="button"
        onClick={onOpenPalette}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 lg:hidden"
        aria-label="Open command palette"
      >
        <Search className="h-4 w-4" />
      </button>

      {/* Daily Intelligence Brief */}
      {onOpenBrief ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenBrief}
          className="hidden h-8 gap-1.5 border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 sm:inline-flex"
          aria-label="Open Daily Intelligence Brief"
        >
          <FileText className="h-3.5 w-3.5 text-emerald-600" />
          <span>Brief</span>
        </Button>
      ) : null}

      {/* Alerts popover */}
      <AlertsPopover onOpenAlert={onOpenAlert} />

      {/* Theme toggle */}
      <ThemeToggle />

      {/* Account switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-9 gap-2 border-slate-200 bg-white px-2 pr-2.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          >
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white",
                meta.tint,
              )}
            >
              {meta.initials}
            </span>
            <span className="hidden flex-col items-start leading-none sm:flex">
              <span className="text-[12px] font-semibold text-slate-800">{meta.name}</span>
              <span className="text-[9px] font-medium uppercase tracking-wide text-slate-400">{meta.label}</span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Switch workspace
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(Object.keys(accountMeta) as AccountType[]).map((t) => {
            const m = accountMeta[t];
            const active = t === accountType;
            return (
              <DropdownMenuItem
                key={t}
                onSelect={() => onAccountTypeChange(t)}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-md py-1.5",
                  active && "bg-slate-50",
                )}
              >
                <span className={cn("flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white", m.tint)}>
                  {m.initials}
                </span>
                <div className="flex flex-1 flex-col leading-tight">
                  <span className="text-[12px] font-medium text-slate-800">{m.name}</span>
                  <span className="text-[10px] text-slate-400">{m.label}</span>
                </div>
                {active ? (
                  <Badge variant="secondary" className="h-4 px-1 text-[9px] font-semibold uppercase tracking-wide">
                    Active
                  </Badge>
                ) : null}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              useRiskStore.getState().clearAll();
              toast.success("Workspace reset", {
                description: "All acknowledgements, alerts, and saved views cleared.",
              });
            }}
            className="flex cursor-pointer items-center gap-2 rounded-md py-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="text-[12px] font-medium">Reset workspace</span>
            <span className="ml-auto text-[9px] text-slate-400">clears all</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
