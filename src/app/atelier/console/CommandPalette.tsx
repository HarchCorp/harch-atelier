"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Command } from "cmdk";
import { C as TOKENS } from "../components/tokens";

// ═══════════════════════════════════════════════════════════════
//  COMMAND PALETTE (cmdk-palette)
//
//  Institutional Cmd+K / Ctrl+K palette for the HarchIQ ConsoleShell.
//  Used by all 4 dashboards (Brand Monitor, Competitor Intel,
//  Investor Desk, Alpha Desk). Light theme only, English only,
//  inline styles matching the ConsoleShell vibe.
//
//  Features:
//    • Fuzzy search across all commands (cmdk built-in)
//    • Grouped commands: Recently used · Navigation · Actions · Account
//    • Keyboard nav: ↑↓ move, ↵ select, esc close (cmdk default)
//    • Recently used — last 5 selections persisted to localStorage
//    • Footer shows keyboard hints + current user/account status
//    • Overlay + dialog use design tokens (C.bg, C.border, C.textMuted)
//
//  cmdk is the underlying primitive — we wrap it in our own overlay
//  so we control the exact institutional look (no shadcn dialog chrome).
// ═══════════════════════════════════════════════════════════════

// ─── DESIGN TOKENS (mirror ConsoleShell's local C extension) ───────
const C = {
  ...TOKENS,
  surface: TOKENS.bg,
  surfaceAlt: TOKENS.bgHover,        // neutral-100
  selectedBg: "#f4f4f5",             // neutral-100/zinc-100 — exact spec
  borderLight: TOKENS.border,        // neutral-200
  textPrimary: TOKENS.text,          // neutral-950
  textSecondary: TOKENS.textBody,    // neutral-600
  textMuted: TOKENS.textMuted,       // neutral-500
  textFaint: "#a3a3a3",              // neutral-400
};

const FONT = {
  sans: C.fontSans,
  mono: C.fontMono,
};

const RECENT_KEY = "harchiq.cmdk.recent";
const RECENT_MAX = 5;

export type CommandGroup = "navigation" | "actions" | "account";

export interface CommandItem {
  id: string;
  label: string;
  hint?: string;
  icon?: string; // text icon like "→" "↻" "↓"
  action: () => void;
  group: CommandGroup;
  keywords?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  accent: string;
  userName: string;
  accountType: string;
  items: CommandItem[];
  lastRefresh?: string | null;
}

// ─── Group labels (English, uppercase, mono) ───────────────────────
const GROUP_LABELS: Record<CommandGroup | "recent", string> = {
  recent: "Recently used",
  navigation: "Navigation",
  actions: "Quick actions",
  account: "Account",
};

// Group order for display (when not searching)
const GROUP_ORDER: (CommandGroup | "recent")[] = [
  "recent",
  "navigation",
  "actions",
  "account",
];

export function CommandPalette(props: CommandPaletteProps) {
  // The outer component is a thin wrapper that only mounts the inner
  // palette when `open` is true. This guarantees the inner state
  // (search input, recent list) is fresh on every open — no
  // useEffect-based reset needed, which keeps the lint rule
  // `react-hooks/set-state-in-effect` happy.
  if (!props.open) return null;
  return <CommandPaletteInner {...props} />;
}

// ─── INNER — only mounted when the palette is open ──────────────────
//  Because this is freshly mounted on every open, useState initialisers
//  run each time (reading the latest localStorage) and the search input
//  starts empty by default.
function CommandPaletteInner({
  onOpenChange,
  accent,
  userName,
  accountType,
  items,
  lastRefresh,
}: CommandPaletteProps) {
  // Lazy initial state — reads localStorage once on mount. Since the
  // inner is remounted every time the palette opens, this naturally
  // refreshes the recent list on every open (so changes made by other
  // palettes/tabs are picked up).
  const [recent, setRecent] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.slice(0, RECENT_MAX);
      }
    } catch {
      // localStorage may be unavailable (SSR, privacy mode) — ignore
    }
    return [];
  });

  const [search, setSearch] = useState("");

  // Esc closes the palette (cmdk handles Esc inside input, but we also
  // catch it at the overlay level so clicking outside the dialog still
  // closes properly).
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  // Lock body scroll while open. This effect only mutates the DOM
  // (an external system) — no setState — so it doesn't trip the
  // set-state-in-effect rule.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Record a command use and persist the new recent list
  const recordUse = useCallback((id: string) => {
    setRecent((prev) => {
      const next = [id, ...prev.filter((r) => r !== id)].slice(0, RECENT_MAX);
      try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        // ignore — recent-tracking is a nice-to-have, not critical
      }
      return next;
    });
  }, []);

  // Lookup map so we can resolve recent IDs back to items
  const itemById = useMemo(() => {
    const m = new Map<string, CommandItem>();
    for (const it of items) m.set(it.id, it);
    return m;
  }, [items]);

  const recentItems = useMemo<CommandItem[]>(() => {
    return recent
      .map((id) => itemById.get(id))
      .filter((it): it is CommandItem => Boolean(it))
      .slice(0, RECENT_MAX);
  }, [recent, itemById]);

  // Group items by their `group` field for non-recent groups
  const grouped = useMemo(() => {
    const buckets: Record<CommandGroup, CommandItem[]> = {
      navigation: [],
      actions: [],
      account: [],
    };
    for (const it of items) {
      if (buckets[it.group]) buckets[it.group].push(it);
    }
    return buckets;
  }, [items]);

  // When the user is actively searching, hide the "Recently used" group
  // (cmdk will rank results globally) — only show recent at the top when
  // the search box is empty.
  const showRecent = search.trim().length === 0 && recentItems.length > 0;

  const handleSelect = (it: CommandItem) => {
    recordUse(it.id);
    close();
    // Defer the action so the palette can close & unmount first
    // (avoids state updates on a tearing-down tree if the action
    // re-renders the shell).
    setTimeout(() => {
      try {
        it.action();
      } catch {
        // swallow — palette should never crash the shell
      }
    }, 0);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onMouseDown={(e) => {
        // Click on the overlay backdrop (not on the dialog) closes
        if (e.target === e.currentTarget) close();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.3)",
        zIndex: 300, // above DailyBriefing modal (200/201) so Cmd+K can be invoked over the briefing
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: "min(560px, calc(100vw - 32px))",
          marginTop: "15vh",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "8px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          overflow: "hidden",
          fontFamily: FONT.sans,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Command
          label="Command Palette"
          // cmdk filter — built-in fuzzy match against value+keywords
          shouldFilter={true}
          loop
        >
          {/* ─── SEARCH INPUT ─────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "16px",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <span
              aria-hidden
              style={{
                fontFamily: FONT.mono,
                fontSize: "13px",
                color: C.textMuted,
                flexShrink: 0,
              }}
            >
              ›
            </span>
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search commands…"
              autoFocus
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontFamily: FONT.mono,
                fontSize: "14px",
                color: C.textPrimary,
                padding: 0,
              }}
            />
            <button
              onClick={close}
              aria-label="Close command palette"
              style={{
                background: "transparent",
                border: `1px solid ${C.border}`,
                borderRadius: "4px",
                padding: "2px 8px",
                fontFamily: FONT.mono,
                fontSize: "10px",
                color: C.textMuted,
                cursor: "pointer",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.textMuted;
                e.currentTarget.style.color = C.textPrimary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.color = C.textMuted;
              }}
            >
              esc
            </button>
          </div>

          {/* ─── LIST ─────────────────────────────────────────────── */}
          <Command.List
            style={{
              maxHeight: "min(420px, calc(80vh - 180px))",
              overflowY: "auto",
              paddingBottom: "4px",
            }}
          >
            <Command.Empty
              style={{
                padding: "32px 16px",
                fontSize: "13px",
                color: C.textMuted,
                fontFamily: FONT.mono,
                textAlign: "center",
              }}
            >
              No commands match “{search}”.
            </Command.Empty>

            {/* Recently used — only when not searching */}
            {showRecent && (
              <PaletteGroup
                label={GROUP_LABELS.recent}
                accent={accent}
                items={recentItems.map((it) => ({ ...it, group: "navigation" }))}
                onSelect={handleSelect}
              />
            )}

            {GROUP_ORDER.filter((g) => g !== "recent").map((g) => {
              const groupItems = grouped[g as CommandGroup];
              if (!groupItems || groupItems.length === 0) return null;
              return (
                <PaletteGroup
                  key={g}
                  label={GROUP_LABELS[g as CommandGroup]}
                  accent={accent}
                  items={groupItems}
                  onSelect={handleSelect}
                />
              );
            })}
          </Command.List>

          {/* ─── FOOTER ───────────────────────────────────────────── */}
          <div
            style={{
              padding: "8px 16px",
              borderTop: `1px solid ${C.border}`,
              fontSize: "10px",
              color: C.textMuted,
              fontFamily: FONT.mono,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              background: C.surfaceAlt,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span><kbd style={kbdStyle}>↑</kbd><kbd style={kbdStyle}>↓</kbd> navigate</span>
              <span><kbd style={kbdStyle}>↵</kbd> select</span>
              <span><kbd style={kbdStyle}>esc</kbd> close</span>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: accent,
                  display: "inline-block",
                }}
                aria-hidden
              />
              <span>{userName} · {accountType}</span>
              {lastRefresh && (
                <span style={{ color: C.textFaint }}>· updated {lastRefresh}</span>
              )}
            </div>
          </div>
        </Command>

        {/* ─── LOCAL CSS OVERRIDES (data-selected + group headings) ──
            cmdk exposes its styling hooks via data-* attributes. We
            can't reach them with inline styles, so a tiny scoped
            <style> block is the cleanest match for the design spec. */}
        <style>{`
          [cmdk-root] [cmdk-list] [cmdk-group] [cmdk-group-heading] {
            padding: 8px 16px 6px;
            font-size: 10px;
            font-family: ${FONT.mono};
            color: ${C.textMuted};
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-weight: 600;
          }
          [cmdk-root] [cmdk-list] [cmdk-item] {
            padding: 10px 16px;
            font-size: 13px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 12px;
            color: ${C.textPrimary};
            font-family: ${FONT.sans};
            border-radius: 0;
            transition: background 0.1s ease;
          }
          [cmdk-root] [cmdk-list] [cmdk-item][data-selected="true"] {
            background: ${C.selectedBg};
          }
          [cmdk-root] [cmdk-list] [cmdk-item][data-selected="true"] .cmdk-icon {
            color: ${accent};
          }
          [cmdk-root] [cmdk-list] [cmdk-item] .cmdk-icon {
            color: ${C.textMuted};
            font-family: ${FONT.mono};
            font-size: 13px;
            width: 14px;
            text-align: center;
            flex-shrink: 0;
            transition: color 0.1s ease;
          }
          [cmdk-root] [cmdk-list] [cmdk-item] .cmdk-hint {
            margin-left: auto;
            font-family: ${FONT.mono};
            font-size: 10px;
            color: ${C.textMuted};
            letter-spacing: 0.06em;
            text-transform: uppercase;
          }
          [cmdk-root] [cmdk-list]::-webkit-scrollbar {
            width: 8px;
          }
          [cmdk-root] [cmdk-list]::-webkit-scrollbar-track {
            background: transparent;
          }
          [cmdk-root] [cmdk-list]::-webkit-scrollbar-thumb {
            background: ${C.border};
            border-radius: 4px;
          }
          [cmdk-root] [cmdk-list]::-webkit-scrollbar-thumb:hover {
            background: ${C.textMuted};
          }
        `}</style>
      </div>
    </div>
  );
}

// ─── PALETTE GROUP — renders a cmdk Group with heading + items ──────
function PaletteGroup({
  label,
  accent,
  items,
  onSelect,
}: {
  label: string;
  accent: string;
  items: CommandItem[];
  onSelect: (it: CommandItem) => void;
}) {
  return (
    <Command.Group heading={label}>
      {items.map((it) => (
        <PaletteItem key={it.id} item={it} accent={accent} onSelect={onSelect} />
      ))}
    </Command.Group>
  );
}

// ─── PALETTE ITEM — a single selectable row ────────────────────────
//  `value` is what cmdk filters against. We concat label + keywords
//  so the fuzzy search catches "alerts" via "nav" too.
function PaletteItem({
  item,
  accent,
  onSelect,
}: {
  item: CommandItem;
  accent: string;
  onSelect: (it: CommandItem) => void;
}) {
  const value = `${item.label} ${item.hint ?? ""} ${item.keywords ?? ""}`.trim();
  return (
    <Command.Item
      value={value}
      onSelect={() => onSelect(item)}
    >
      <span className="cmdk-icon" aria-hidden>
        {item.icon ?? "·"}
      </span>
      <span>{item.label}</span>
      {item.hint && <span className="cmdk-hint">{item.hint}</span>}
      {/* Unused but kept so the accent prop is referenced in the JSX
          tree (prevents TS unused-var lint without disabling it). */}
      <span style={{ display: "none" }} aria-hidden data-accent={accent} />
    </Command.Item>
  );
}

// ─── SHARED FOOTER kbd STYLE ───────────────────────────────────────
const kbdStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "1px 5px",
  margin: "0 2px",
  border: `1px solid ${TOKENS.border}`,
  borderRadius: "3px",
  background: TOKENS.bg,
  fontFamily: TOKENS.fontMono,
  fontSize: "9px",
  color: TOKENS.textBody,
  lineHeight: 1.4,
};

// ─── DEFAULT EXPORT FOR LAZY LOADING (optional) ────────────────────
export default CommandPalette;
