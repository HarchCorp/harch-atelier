"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const options = [
    { key: "light", label: "Light", icon: Sun },
    { key: "dark", label: "Dark", icon: Moon },
    { key: "system", label: "System", icon: Monitor },
  ] as const;

  // Before mount, theme is undefined — default to "light" icon to avoid hydration mismatch.
  const resolvedTheme = mounted ? theme : "light";
  const Active = options.find((o) => o.key === resolvedTheme)?.icon ?? Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          aria-label="Toggle theme"
        >
          <Active className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {options.map((o) => {
          const Icon = o.icon;
          const active = resolvedTheme === o.key;
          return (
            <DropdownMenuItem
              key={o.key}
              onClick={() => setTheme(o.key)}
              className={cn("flex cursor-pointer items-center gap-2", active && "bg-slate-50")}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="text-[12px]">{o.label}</span>
              {active ? (
                <span className="ml-auto rounded bg-slate-100 px-1 text-[9px] font-semibold uppercase text-slate-500">
                  on
                </span>
              ) : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
