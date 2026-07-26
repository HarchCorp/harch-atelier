"use client";

import * as React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  ShieldCheck,
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  Newspaper,
  PieChart,
  Globe2,
  Layers,
  Radio,
  Users2,
  CornerDownLeft,
  RotateCcw,
  Download,
  Building2,
  GitCompare,
  FileText,
} from "lucide-react";
import {
  riskEvents,
  entitiesList,
  type AccountType,
  type RiskEvent,
} from "@/lib/mock-data";
import { useRiskStore } from "@/lib/risk-store";
import { buildSavedViewsJson, downloadJson } from "@/lib/store-io";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// local account meta (kept here so the palette is self-contained)
const paletteAccounts: { type: AccountType; label: string; name: string; hint: string }[] = [
  { type: "admin", label: "Admin Console", name: "A. Marchatti", hint: "Full access" },
  { type: "trader", label: "Trader Desk", name: "T. Okafor", hint: "Signal desk" },
  { type: "market", label: "Market Intel", name: "M. Dubois", hint: "IR analytics" },
  { type: "legal", label: "Legal Counsel", name: "L. Reyes", hint: "Regulatory matters" },
  { type: "pr", label: "PR & Comms", name: "P. Novak", hint: "Reputation" },
  { type: "self", label: "Self Service", name: "S. Bauer", hint: "Personal watch" },
];

interface PaletteAction {
  id: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountType: AccountType;
  onAccountTypeChange: (t: AccountType) => void;
  onSelectEvent: (e: RiskEvent) => void;
  onSelectEntity?: (entity: string) => void;
  onOpenCompare?: () => void;
  onOpenBrief?: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  accountType,
  onAccountTypeChange,
  onSelectEvent,
  onSelectEntity,
  onOpenCompare,
  onOpenBrief,
}: CommandPaletteProps) {
  const close = React.useCallback(() => onOpenChange(false), [onOpenChange]);

  const actions = React.useMemo<PaletteAction[]>(
    () => [
      {
        id: "goto-matrix",
        label: "Go to Risk Matrix",
        hint: "Scatter chart",
        icon: <Layers className="h-4 w-4 text-violet-600" />,
        onSelect: () => {
          document.getElementById("matrix")?.scrollIntoView({ behavior: "smooth", block: "start" });
          close();
        },
      },
      {
        id: "goto-coverage",
        label: "Go to Media Coverage",
        hint: "30d area chart",
        icon: <Newspaper className="h-4 w-4 text-emerald-600" />,
        onSelect: () => {
          document.getElementById("coverage")?.scrollIntoView({ behavior: "smooth", block: "start" });
          close();
        },
      },
      {
        id: "goto-sentiment",
        label: "Go to Sentiment Trend",
        hint: "12-month lines",
        icon: <TrendingUp className="h-4 w-4 text-amber-600" />,
        onSelect: () => {
          document.getElementById("sentiment")?.scrollIntoView({ behavior: "smooth", block: "start" });
          close();
        },
      },
      {
        id: "goto-sov",
        label: "Go to Share of Voice",
        hint: "Donut",
        icon: <PieChart className="h-4 w-4 text-sky-600" />,
        onSelect: () => {
          document.getElementById("sov")?.scrollIntoView({ behavior: "smooth", block: "start" });
          close();
        },
      },
      {
        id: "goto-geo",
        label: "Go to Geographic Distribution",
        hint: "Region heatmap",
        icon: <Globe2 className="h-4 w-4 text-cyan-600" />,
        onSelect: () => {
          document.getElementById("geo")?.scrollIntoView({ behavior: "smooth", block: "start" });
          close();
        },
      },
      {
        id: "goto-alerts",
        label: "Go to Alerts",
        hint: "Bell popover",
        icon: <AlertTriangle className="h-4 w-4 text-rose-600" />,
        onSelect: () => {
          document.getElementById("alerts")?.scrollIntoView({ behavior: "smooth", block: "start" });
          close();
        },
      },
      {
        id: "ws-reset",
        label: "Reset workspace",
        hint: "Clears all state",
        icon: <RotateCcw className="h-4 w-4 text-rose-600" />,
        onSelect: () => {
          useRiskStore.getState().clearAll();
          toast.success("Workspace reset", {
            description: "All acknowledgements, alerts, and saved views cleared.",
          });
          close();
        },
      },
      {
        id: "ws-export-views",
        label: "Export saved views",
        hint: "Download JSON",
        icon: <Download className="h-4 w-4 text-sky-600" />,
        onSelect: () => {
          const { savedViews } = useRiskStore.getState();
          if (savedViews.length === 0) {
            toast.error("No views to export", { description: "Save a view first." });
          } else {
            const json = buildSavedViewsJson(savedViews);
            const ts = new Date().toISOString().slice(0, 10);
            downloadJson(`harch-saved-views-${ts}.json`, json);
            toast.success(`Exported ${savedViews.length} view${savedViews.length > 1 ? "s" : ""}`);
          }
          close();
        },
      },
      {
        id: "ws-compare-views",
        label: "Compare saved views",
        hint: "Diff two views",
        icon: <GitCompare className="h-4 w-4 text-violet-600" />,
        onSelect: () => {
          if (onOpenCompare) {
            onOpenCompare();
          } else {
            toast.error("Compare unavailable");
          }
          close();
        },
      },
      {
        id: "open-brief",
        label: "Open Daily Intelligence Brief",
        hint: "Morning synthesis",
        icon: <FileText className="h-4 w-4 text-emerald-600" />,
        onSelect: () => {
          if (onOpenBrief) {
            onOpenBrief();
          } else {
            toast.error("Brief unavailable");
          }
          close();
        },
      },
    ],
    [close, onOpenCompare, onOpenBrief],
  );

  const recentEvents = React.useMemo(() => riskEvents.slice(0, 6), []);

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command Palette"
      description="Search events, jump to a widget, or switch workspace."
      className="max-w-[600px]"
    >
      <CommandInput placeholder="Search events, pillars, widgets… or type a workspace name" />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Jump to">
          {actions.map((a) => (
            <CommandItem
              key={a.id}
              value={`${a.label} ${a.hint}`}
              onSelect={() => a.onSelect()}
              className="gap-2"
            >
              {a.icon}
              <span className="flex-1 text-[13px]">{a.label}</span>
              <span className="text-[11px] text-slate-400">{a.hint}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Switch workspace">
          {paletteAccounts.map((a) => (
            <CommandItem
              key={a.type}
              value={`switch ${a.label} ${a.name} ${a.type}`}
              onSelect={() => {
                onAccountTypeChange(a.type);
                close();
              }}
              className="gap-2"
            >
              <LayoutDashboard className="h-4 w-4 text-slate-500" />
              <span className="flex-1 text-[13px]">{a.label}</span>
              <span className="text-[11px] text-slate-400">{a.name}</span>
              {a.type === accountType ? (
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-slate-500">
                  Active
                </span>
              ) : null}
            </CommandItem>
          ))}
        </CommandGroup>

        {onSelectEntity ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Entities">
              {entitiesList.map((entity) => (
                <CommandItem
                  key={entity}
                  value={`entity ${entity}`}
                  onSelect={() => {
                    onSelectEntity(entity);
                    close();
                  }}
                  className="gap-2"
                >
                  <Building2 className="h-4 w-4 text-slate-500" />
                  <span className="flex-1 text-[13px]">{entity}</span>
                  <span className="text-[10px] text-slate-400">profile</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}

        <CommandSeparator />

        <CommandGroup heading="Risk events">
          {recentEvents.map((e) => (
            <CommandItem
              key={e.id}
              value={`${e.title} ${e.pillar} ${e.id} ${e.severity}`}
              onSelect={() => {
                onSelectEvent(e);
                close();
              }}
              className="gap-2"
            >
              <ShieldCheck className="h-4 w-4 text-slate-500" />
              <span className="flex-1 truncate text-[13px]">{e.title}</span>
              <span className="tabular text-[10px] text-slate-400">{e.id}</span>
              <span
                className={cn(
                  "rounded px-1 py-0.5 text-[9px] font-semibold uppercase",
                  e.severity === "critical"
                    ? "bg-rose-50 text-rose-700"
                    : e.severity === "high"
                      ? "bg-orange-50 text-orange-700"
                      : "bg-slate-100 text-slate-600",
                )}
              >
                {e.severity}
              </span>
              <CornerDownLeft className="h-3 w-3 text-slate-300" />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

/** Hook that registers a global ⌘K / Ctrl+K listener and exposes the open state. */
export function useCommandPalette(): { open: boolean; setOpen: (v: boolean) => void; toggle: () => void } {
  const [open, setOpen] = React.useState(false);
  const toggle = React.useCallback(() => setOpen((v) => !v), []);
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  return { open, setOpen, toggle };
}
