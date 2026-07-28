"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRiskStore } from "@/lib/risk-store";
import { toast } from "sonner";
import { Keyboard } from "lucide-react";

interface Shortcut {
  keys: string[];
  label: string;
  group: "Navigation" | "Actions";
}

const shortcuts: Shortcut[] = [
  { keys: ["⌘", "K"], label: "Open command palette", group: "Actions" },
  { keys: ["?"], label: "Toggle this shortcuts dialog", group: "Actions" },
  { keys: ["b"], label: "Open Daily Intelligence Brief", group: "Actions" },
  { keys: ["g", "m"], label: "Go to Risk Matrix", group: "Navigation" },
  { keys: ["g", "c"], label: "Go to Media Coverage", group: "Navigation" },
  { keys: ["g", "s"], label: "Go to Sentiment Trend", group: "Navigation" },
  { keys: ["g", "v"], label: "Go to Share of Voice", group: "Navigation" },
  { keys: ["g", "e"], label: "Go to Geographic Distribution", group: "Navigation" },
  { keys: ["g", "a"], label: "Go to Risk Events", group: "Navigation" },
  { keys: ["1", "-", "9"], label: "Load saved view N (if exists)", group: "Actions" },
  { keys: ["Esc"], label: "Close dialog / drawer", group: "Actions" },
];

interface KeyboardShortcutsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcuts({ open, onOpenChange }: KeyboardShortcutsProps) {
  const groups: Shortcut["group"][] = ["Navigation", "Actions"];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] p-0">
        <DialogHeader className="border-b border-slate-100 px-5 py-4">
          <DialogTitle className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
            <Keyboard className="h-4 w-4 text-slate-500" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription className="text-[12px] text-slate-500">
            Press the keys in sequence. Navigation shortcuts use a two-key combo (e.g.{" "}
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1 text-[10px] font-semibold">g</kbd>{" "}
            then{" "}
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1 text-[10px] font-semibold">m</kbd>).
          </DialogDescription>
        </DialogHeader>
        <div className="px-5 py-3">
          {groups.map((g) => (
            <div key={g} className="mb-3 last:mb-0">
              <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {g}
              </h4>
              <div className="space-y-1">
                {shortcuts
                  .filter((s) => s.group === g)
                  .map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-slate-50"
                    >
                      <span className="text-[12px] text-slate-700">{s.label}</span>
                      <div className="flex items-center gap-0.5">
                        {s.keys.map((k, i) => (
                          <kbd
                            key={i}
                            className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 shadow-sm"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Global keyboard-shortcut listener. Registers:
 *  - `?` → toggle the help dialog
 *  - `g` then a letter → scroll to a widget anchor
 *
 * Ignores key presses when the user is typing in an input/textarea/contenteditable
 * or when a dialog/popover is open.
 */
export function useKeyboardShortcuts(onToggleHelp: () => void, onOpenBrief?: () => void): void {
  const pendingG = React.useRef(false);
  const gTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable ||
        target?.getAttribute("role") === "combobox" ||
        target?.getAttribute("role") === "textbox";

      // Dialog open? Let the dialog handle Esc / interactions.
      const dialogOpen = document.querySelector("[role='dialog']");
      if (dialogOpen) return;

      if (isTyping) return;

      const key = e.key.toLowerCase();

      // Help dialog
      if (key === "?" || (e.shiftKey && key === "/")) {
        e.preventDefault();
        onToggleHelp();
        return;
      }

      // Daily Intelligence Brief — single-key "b" (quick access)
      if (key === "b" && !pendingG.current && onOpenBrief) {
        e.preventDefault();
        onOpenBrief();
        return;
      }

      // Saved-view shortcuts: 1-9 loads the Nth saved view.
      if (key >= "1" && key <= "9" && !pendingG.current) {
        const { savedViews, loadView } = useRiskStore.getState();
        const idx = parseInt(key, 10) - 1;
        const view = savedViews[idx];
        if (view) {
          e.preventDefault();
          loadView(view.id);
          toast.success(`Loaded view "${view.name}"`, {
            description: `Shortcut ${key} · ${savedViews.length} views saved.`,
          });
        }
        return;
      }

      // Two-key navigation: `g` then a letter
      if (key === "g" && !pendingG.current) {
        pendingG.current = true;
        if (gTimer.current) clearTimeout(gTimer.current);
        gTimer.current = setTimeout(() => {
          pendingG.current = false;
        }, 800);
        return;
      }

      if (pendingG.current) {
        const map: Record<string, string> = {
          m: "matrix",
          c: "coverage",
          s: "sentiment",
          v: "sov",
          e: "geo",
          a: "alerts",
        };
        const id = map[key];
        if (id) {
          e.preventDefault();
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        pendingG.current = false;
        if (gTimer.current) clearTimeout(gTimer.current);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onToggleHelp, onOpenBrief]);
}
