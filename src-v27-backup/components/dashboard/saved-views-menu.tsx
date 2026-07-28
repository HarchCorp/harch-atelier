"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useRiskStore, type FilterState } from "@/lib/risk-store";
import { buildSavedViewsJson, downloadJson, parseSavedViewsJson } from "@/lib/store-io";
import { Bookmark, Save, Trash2, Check, FolderOpen, Download, Upload, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function describeFilters(f: FilterState): string {
  const parts: string[] = [];
  if (f.pillar !== "all") parts.push(f.pillar);
  if (f.severity !== "all") parts.push(f.severity);
  if (f.status !== "all") parts.push(f.status);
  if (f.source !== "all") parts.push(f.source);
  if (f.query) parts.push(`"${f.query}"`);
  return parts.length > 0 ? parts.join(" · ") : "no filters";
}

export function SavedViewsMenu() {
  const savedViews = useRiskStore((s) => s.savedViews);
  const filters = useRiskStore((s) => s.filters);
  const saveView = useRiskStore((s) => s.saveView);
  const loadView = useRiskStore((s) => s.loadView);
  const deleteView = useRiskStore((s) => s.deleteView);
  const duplicateView = useRiskStore((s) => s.duplicateView);
  const importViews = useRiskStore((s) => s.importViews);
  const [name, setName] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const hasFilters =
    filters.pillar !== "all" ||
    filters.severity !== "all" ||
    filters.status !== "all" ||
    filters.source !== "all" ||
    filters.region !== "all" ||
    filters.query !== "";

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Name required", { description: "Enter a name for the saved view." });
      return;
    }
    saveView(trimmed);
    toast.success(`Saved view "${trimmed}"`, {
      description: describeFilters(filters),
    });
    setName("");
    setOpen(false);
  };

  const handleLoad = (id: string, viewName: string) => {
    loadView(id);
    toast.success(`Loaded view "${viewName}"`);
    setOpen(false);
  };

  const handleDelete = (id: string, viewName: string) => {
    deleteView(id);
    toast.success(`Deleted view "${viewName}"`);
  };

  const handleExport = () => {
    if (savedViews.length === 0) {
      toast.error("No views to export", { description: "Save a view first." });
      return;
    }
    const json = buildSavedViewsJson(savedViews);
    const ts = new Date().toISOString().slice(0, 10);
    downloadJson(`harch-saved-views-${ts}.json`, json);
    toast.success(`Exported ${savedViews.length} view${savedViews.length > 1 ? "s" : ""}`, {
      description: `JSON downloaded · ${savedViews.length} views.`,
    });
    setOpen(false);
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || "");
        const views = parseSavedViewsJson(text);
        importViews(views);
        toast.success(`Imported ${views.length} view${views.length > 1 ? "s" : ""}`, {
          description: `${file.name} · ${views.length} views added.`,
        });
        setOpen(false);
      } catch (err) {
        toast.error("Import failed", {
          description: err instanceof Error ? err.message : "Invalid JSON file.",
        });
      }
    };
    reader.onerror = () => {
      toast.error("Import failed", { description: "Could not read the file." });
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-imported.
    e.target.value = "";
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-1 text-[10px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <Bookmark className="h-3 w-3" />
          Views
          {savedViews.length > 0 ? (
            <span className="tabular rounded bg-slate-100 px-1 text-[9px] text-slate-600">
              {savedViews.length}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Save current view
        </DropdownMenuLabel>
        <div className="flex items-center gap-1 px-2 pb-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
            }}
            placeholder="e.g. Critical Cyber 30d"
            disabled={!hasFilters}
            className="h-7 flex-1 border-slate-200 text-[11px] placeholder:text-slate-400"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={!hasFilters}
            className="h-7 gap-1 bg-slate-900 px-2 text-[10px] text-white hover:bg-slate-800"
          >
            <Save className="h-3 w-3" />
            Save
          </Button>
        </div>
        {!hasFilters ? (
          <p className="px-2 pb-2 text-[10px] text-slate-400">
            Set at least one filter to save a view.
          </p>
        ) : null}

        {savedViews.length > 0 ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Saved views ({savedViews.length})
            </DropdownMenuLabel>
            <div className="max-h-[240px] overflow-y-auto">
              {savedViews.map((v) => (
                <div
                  key={v.id}
                  className="group flex items-center gap-1 rounded-md px-1 py-0.5 hover:bg-slate-50"
                >
                  <DropdownMenuItem
                    onSelect={() => handleLoad(v.id, v.name)}
                    className="flex-1 cursor-pointer items-start gap-2 py-1.5"
                  >
                    <FolderOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] font-medium text-slate-800">{v.name}</div>
                      <div className="truncate text-[10px] text-slate-400">{describeFilters(v.filters)}</div>
                    </div>
                  </DropdownMenuItem>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateView(v.id);
                      toast.success(`Duplicated "${v.name}"`, {
                        description: `Created "${v.name} (copy)".`,
                      });
                    }}
                    className="shrink-0 rounded p-1 text-slate-300 opacity-0 transition-opacity hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100"
                    aria-label={`Duplicate view ${v.name}`}
                    title="Duplicate view"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(v.id, v.name);
                    }}
                    className="shrink-0 rounded p-1 text-slate-300 opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                    aria-label={`Delete view ${v.name}`}
                    title="Delete view"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="px-2 pb-2 pt-1 text-[10px] text-slate-400">
            No saved views yet. Save one above.
          </p>
        )}

        {/* Export / Import */}
        <DropdownMenuSeparator />
        <div className="flex items-center gap-1 px-2 py-1.5">
          <button
            type="button"
            onClick={handleExport}
            disabled={savedViews.length === 0}
            className="flex flex-1 items-center justify-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white"
          >
            <Download className="h-3 w-3" />
            Export
          </button>
          <button
            type="button"
            onClick={handleImportClick}
            className="flex flex-1 items-center justify-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <Upload className="h-3 w-3" />
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
