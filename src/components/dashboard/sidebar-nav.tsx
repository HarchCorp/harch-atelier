"use client";

/**
 * Harch Atelier — Collapsible left sidebar (V13.0)
 *
 * Palantir-style dense navigation:
 *  - Universal "Dashboard" entry pinned at the top.
 *  - Grouped categories that expand/collapse (accordion, multi-open).
 *  - Active item: left accent bar + tinted background.
 *  - Collapsible to icon-rail (w-16) on desktop; slide-in Sheet on mobile.
 *  - Count badges per item with semantic tones.
 */
import * as React from "react";
import {
  ChevronsLeft,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  resolveNav,
  badgeToneClass,
  type NavItem,
  type NavCategory,
} from "@/lib/nav-config";
import type { AccountType } from "@/lib/mock-data";

interface SidebarNavProps {
  accountType: AccountType;
  activeSection: string;
  onSectionChange: (id: string) => void;
  collapsed: boolean;
  onCollapsedChange: (c: boolean) => void;
  /** Mobile drawer open state (controlled by parent). */
  mobileOpen: boolean;
  onMobileOpenChange: (o: boolean) => void;
}

/* ------------------------------------------------------------------ */
/*  Internal: a single nav item row                                    */
/* ------------------------------------------------------------------ */

function NavItemRow({
  item,
  active,
  collapsed,
  onSelect,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onSelect: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group/navitem relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-[12.5px] font-medium transition-colors",
        collapsed && "justify-center px-0",
        active
          ? "bg-slate-800 text-white"
          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100",
      )}
    >
      {/* active accent bar */}
      {active ? (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-emerald-400" />
      ) : null}
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          active ? "text-emerald-400" : "text-slate-500 group-hover/navitem:text-slate-300",
        )}
      />
      {!collapsed ? (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge ? (
            <span
              className={cn(
                "tabular inline-flex items-center justify-center rounded px-1.5 py-px text-[9px] font-bold uppercase leading-none",
                badgeToneClass[item.badge.tone],
              )}
            >
              {item.badge.text}
            </span>
          ) : null}
        </>
      ) : null}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Internal: a collapsible category                                   */
/* ------------------------------------------------------------------ */

function NavCategoryBlock({
  category,
  activeSection,
  collapsed,
  onSectionChange,
  defaultOpen,
}: {
  category: NavCategory;
  activeSection: string;
  collapsed: boolean;
  onSectionChange: (id: string) => void;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const CategoryIcon = category.icon;

  // When in collapsed rail mode, render just the category icon (expands on click → opens first item).
  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1">
        <span
          title={category.label}
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-800/50 hover:text-slate-200"
        >
          <CategoryIcon className="h-4 w-4" />
        </span>
        <span className="h-px w-6 bg-slate-800" />
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cn(
            "group flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-500 transition-colors hover:bg-slate-800/40 hover:text-slate-300",
          )}
        >
          <CategoryIcon className="h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-slate-300" />
          <span className="flex-1 truncate">{category.label}</span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-slate-600 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="data-[state=open]:animate-in data-[state=open]:slide-in-from-top-1 data-[state=open]:fade-in overflow-hidden">
        <div className="mt-0.5 flex flex-col gap-0.5 pl-1">
          {category.items.map((item) => (
            <NavItemRow
              key={item.id}
              item={item}
              active={item.id === activeSection}
              collapsed={false}
              onSelect={() => onSectionChange(item.id)}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared sidebar body (desktop + mobile)                             */
/* ------------------------------------------------------------------ */

function SidebarBody({
  accountType,
  activeSection,
  collapsed,
  onSectionChange,
  onNavigateClose,
}: {
  accountType: AccountType;
  activeSection: string;
  collapsed: boolean;
  onSectionChange: (id: string) => void;
  onNavigateClose?: () => void;
}) {
  const { dashboard, categories } = resolveNav(accountType);
  const DashboardIcon = dashboard.icon;

  const handleSelect = (id: string) => {
    onSectionChange(id);
    onNavigateClose?.();
  };

  return (
    <div className="flex h-full flex-col bg-slate-900 text-slate-300">
      {/* Brand block */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center gap-2.5 border-b border-slate-800 px-3",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-900/40">
          <ShieldCheck className="h-4 w-4" />
        </div>
        {!collapsed ? (
          <div className="flex min-w-0 flex-col leading-none">
            <span className="truncate text-[13px] font-bold tracking-tight text-white">
              HARCH<span className="text-slate-500">ATELIER</span>
            </span>
            <span className="truncate text-[9px] font-medium uppercase tracking-[0.18em] text-slate-500">
              Risk Intelligence
            </span>
          </div>
        ) : null}
      </div>

      {/* Nav scroll region */}
      <nav className="harch-scroll flex-1 overflow-y-auto px-2 py-3">
        {/* Universal dashboard */}
        <div className="mb-2">
          <NavItemRow
            item={dashboard}
            active={activeSection === dashboard.id}
            collapsed={collapsed}
            onSelect={() => handleSelect(dashboard.id)}
          />
        </div>

        {/* Categories */}
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            {categories.map((c) => (
              <NavCategoryBlock
                key={c.id}
                category={c}
                activeSection={activeSection}
                collapsed
                onSectionChange={handleSelect}
                defaultOpen
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {categories.map((c) => (
              <NavCategoryBlock
                key={c.id}
                category={c}
                activeSection={activeSection}
                collapsed={false}
                onSectionChange={handleSelect}
                defaultOpen
              />
            ))}
          </div>
        )}
      </nav>

      {/* Footer: live status + collapse toggle (desktop only) */}
      {!collapsed ? (
        <div className="shrink-0 border-t border-slate-800 px-3 py-2.5">
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span>GLM-4 pipeline · live</span>
            <span className="ml-auto rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              v13.0
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Public component — desktop fixed + mobile sheet                    */
/* ------------------------------------------------------------------ */

export function SidebarNav({
  accountType,
  activeSection,
  onSectionChange,
  collapsed,
  onCollapsedChange,
  mobileOpen,
  onMobileOpenChange,
}: SidebarNavProps) {
  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 border-r border-slate-800 transition-[width] duration-200 md:block",
          collapsed ? "w-[68px]" : "w-64",
        )}
      >
        <SidebarBody
          accountType={accountType}
          activeSection={activeSection}
          collapsed={collapsed}
          onSectionChange={onSectionChange}
        />
        {/* Collapse toggle (desktop) */}
        <button
          type="button"
          onClick={() => onCollapsedChange(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "absolute -right-3 top-16 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-400 shadow-md transition-colors hover:bg-slate-700 hover:text-white",
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronsLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </aside>

      {/* Mobile slide-in drawer */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-72 border-slate-800 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="absolute right-3 top-3 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:bg-slate-800 hover:text-white"
              onClick={() => onMobileOpenChange(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close navigation</span>
            </Button>
          </div>
          <div className="h-full">
            <SidebarBody
              accountType={accountType}
              activeSection={activeSection}
              collapsed={false}
              onSectionChange={onSectionChange}
              onNavigateClose={() => onMobileOpenChange(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
