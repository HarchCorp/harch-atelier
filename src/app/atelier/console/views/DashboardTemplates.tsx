"use client";

// ═══════════════════════════════════════════════════════════════
//  DashboardTemplates.tsx — Talkwalker/Meltwater-style templates
//
//  Pre-configured dashboard layouts for the 4 HarchIQ offers.
//  Each template controls which "rows" of widgets are visible on
//  a given dashboard, so a user can switch from "Full View" to a
//  focused "Crisis Comms" or "Executive Summary" layout with one
//  click — mirrors the template picker in Talkwalker/Meltwater.
//
//  Persistence:
//    • localStorage key: `harchiq.dashboard.template.<accountType>`
//    • Cross-component sync via the `harchiq:template` CustomEvent
//      (dispatched on window). ConsoleShell's TemplateSelector is
//      the only writer; each dashboard listens and re-renders.
//
//  Usage in a dashboard:
//    const { template } = useDashboardTemplate("brand-monitor");
//    <div className="dash-main" data-template={template}
//         data-template-account="brand-monitor">
//      <TemplateVisibilityStyle accountType="brand-monitor" />
//      <div className="bm-grid">
//        <section data-template-row="1" style={{ display: "contents" }}>
//          ...row 1 widgets...
//        </section>
//        ...
//      </div>
//    </div>
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from "react";
import { C as TOKENS } from "../../components/tokens";

// ─── Local C extension (mirrors ConsoleShell) ─────────────────────
const C = {
  ...TOKENS,
  surface: TOKENS.bg,
  surfaceAlt: TOKENS.bgHover,
  borderLight: TOKENS.border,
  textPrimary: TOKENS.text,
  textSecondary: TOKENS.textBody,
  textFaint: TOKENS.textOnDarkBody,
};

const FONT = {
  sans: C.fontSans,
  mono: C.fontMono,
};

// ─── Account types ────────────────────────────────────────────────
export type TemplateAccountType =
  | "brand-monitor"
  | "market-competitor"
  | "investment-bank"
  | "harch-alpha";

// ─── Template definitions ─────────────────────────────────────────
//  `hiddenRows` is the list of `data-template-row` values that should
//  be hidden when this template is active. Anything not listed stays
//  visible. "full" always has an empty hiddenRows list.

export interface TemplateDef {
  id: string;
  name: string;
  description: string;
  icon: string; // single-char glyph for the dropdown
  hiddenRows: string[];
}

const TEMPLATES: Record<TemplateAccountType, TemplateDef[]> = {
  "brand-monitor": [
    {
      id: "crisis",
      name: "Crisis Comms",
      description:
        "Escalation Matrix, Real-time Alert Feed, Sentiment Trend, Top Threats. Hides AI Visibility, Topics, Reports.",
      icon: "!",
      // Hide exec strip (1), source matrix (4), AI visibility (5), topics (6)
      hiddenRows: ["1", "4", "5", "6"],
    },
    {
      id: "executive",
      name: "Executive Summary",
      description:
        "Reputation Score, Sentiment Breakdown, AI Visibility Score, Top 5 Signals. Compact board-ready view.",
      icon: "*",
      // Show only exec strip (1) + sentiment analytics (3)
      hiddenRows: ["2", "4", "5", "6", "7"],
    },
    {
      id: "campaign",
      name: "Campaign Tracking",
      description:
        "Source Distribution, Topic Volume, Mention Timeline, Influencer mentions. PR campaign measurement.",
      icon: "C",
      // Show source matrix (4), topics (6), alert volume timeline (7)
      hiddenRows: ["1", "2", "3", "5"],
    },
    {
      id: "full",
      name: "Full View",
      description: "All widgets shown. Default institutional terminal density.",
      icon: "+",
      hiddenRows: [],
    },
  ],

  "market-competitor": [
    {
      id: "threat",
      name: "Threat Hunting",
      description:
        "Bad Buzz Feed, Threat Level Distribution, Competitor Moves, Delta from You. Focused on tactical threats.",
      icon: "!",
      // Hide split-screen (2), bottom strip (3), SOV Sankey (5).
      // Show exec strip (1) for delta + Module 1 basket matrix (4)
      // + Module 3 tactical terminal (6).
      hiddenRows: ["2", "3", "5"],
    },
    {
      id: "market",
      name: "Market Position",
      description:
        "Competitive Landscape, SOV Trend, Reputation vs Market Share. Strategic market view.",
      icon: "M",
      // Hide bottom strip (3), basket matrix (4), tactical terminal (6).
      // Show exec strip (1) + split-screen landscape (2) + SOV Sankey (5).
      hiddenRows: ["3", "4", "6"],
    },
    {
      id: "full",
      name: "Full View",
      description: "All widgets shown. Default war-room density.",
      icon: "+",
      hiddenRows: [],
    },
  ],

  "investment-bank": [
    {
      id: "diligence",
      name: "Due Diligence",
      description:
        "UBO Graph, Compliance Registry, DD Checklist, Red Flags. Onboarding & KYC forensic view.",
      icon: "D",
      // Hide charts (3,4,5,6,7) + holdings table (11)
      hiddenRows: ["3", "4", "5", "6", "7", "11"],
    },
    {
      id: "portfolio",
      name: "Portfolio Risk",
      description:
        "Holdings Table, Risk Distribution, Exposure by Sector, Risk Trend. Active portfolio monitoring.",
      icon: "P",
      // Hide DD checklist/entity graph (2), adverse timeline (3),
      // cross-border (4), threat network (7), UBO (8), compliance (9), adverse (10)
      hiddenRows: ["2", "3", "4", "7", "8", "9", "10"],
    },
    {
      id: "full",
      name: "Full View",
      description: "All widgets shown. Default forensic terminal density.",
      icon: "+",
      hiddenRows: [],
    },
  ],

  "harch-alpha": [
    {
      id: "signal",
      name: "Signal Hunting",
      description:
        "Price x Sentiment Chart, Z-Score Matrix, Alpha Scorecard, Signal Feed. Quant signal discovery.",
      icon: "S",
      // Hide multi-asset sparkline grid (4), correlation quick-view (6),
      // top movers (8), asset perf (9), market selector (10), settlement (11)
      hiddenRows: ["4", "6", "8", "9", "10", "11"],
    },
    {
      id: "portfolio",
      name: "Portfolio Monitor",
      description:
        "Asset Table, Settlement Ledger, Volatility Gauges, Top Movers. Active position monitoring.",
      icon: "P",
      // Hide signal feed (5), correlation (6), dual axis (7), asset perf (9),
      // market selector (10), z-score matrix (12)
      hiddenRows: ["5", "6", "7", "9", "10", "12"],
    },
    {
      id: "full",
      name: "Full View",
      description: "All widgets shown. Default quant terminal density.",
      icon: "+",
      hiddenRows: [],
    },
  ],
};

// ─── Template lookup helpers ──────────────────────────────────────

export function getTemplates(accountType: TemplateAccountType): TemplateDef[] {
  return TEMPLATES[accountType] ?? TEMPLATES["brand-monitor"];
}

export function getDefaultTemplateId(
  accountType: TemplateAccountType,
): string {
  return "full";
}

export function getTemplateDef(
  accountType: TemplateAccountType,
  templateId: string,
): TemplateDef | undefined {
  return getTemplates(accountType).find((t) => t.id === templateId);
}

// ─── localStorage key per accountType ─────────────────────────────
export function templateStorageKey(accountType: TemplateAccountType): string {
  return `harchiq.dashboard.template.${accountType}`;
}

// ─── CustomEvent name dispatched on template change ───────────────
export const TEMPLATE_EVENT = "harchiq:template";

export interface TemplateEventPayload {
  accountType: TemplateAccountType;
  template: string;
}

// ─── useDashboardTemplate hook ────────────────────────────────────
//  Each dashboard mounts this hook to:
//    1. Read its initial template from localStorage (SSR-safe).
//    2. Listen for `harchiq:template` CustomEvents so the
//       ConsoleShell's TemplateSelector can drive every dashboard
//       without prop drilling.
//    3. Expose a setter that writes localStorage + dispatches the
//       event (used by in-dashboard template pickers if needed).

export function useDashboardTemplate(
  accountType: TemplateAccountType,
): {
  template: string;
  setTemplate: (next: string) => void;
  reset: () => void;
} {
  const [template, setTemplateState] = useState<string>(() => {
    if (typeof window === "undefined") return "full";
    try {
      const stored = window.localStorage.getItem(
        templateStorageKey(accountType),
      );
      // Validate against the templates list — fall back to "full" if
      // the stored value is stale (e.g. a template id was renamed).
      const valid = stored && getTemplates(accountType).some((t) => t.id === stored);
      return valid ? stored : "full";
    } catch {
      return "full";
    }
  });

  // Listen for template-change events from the ConsoleShell selector
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<TemplateEventPayload>;
      if (!ce.detail) return;
      if (ce.detail.accountType !== accountType) return;
      setTemplateState(ce.detail.template);
    };
    window.addEventListener(TEMPLATE_EVENT, handler);
    return () => window.removeEventListener(TEMPLATE_EVENT, handler);
  }, [accountType]);

  const setTemplate = useCallback(
    (next: string) => {
      try {
        window.localStorage.setItem(
          templateStorageKey(accountType),
          next,
        );
      } catch {
        // localStorage may be unavailable — skip silently
      }
      setTemplateState(next);
      window.dispatchEvent(
        new CustomEvent<TemplateEventPayload>(TEMPLATE_EVENT, {
          detail: { accountType, template: next },
        }),
      );
    },
    [accountType],
  );

  const reset = useCallback(() => {
    setTemplate("full");
  }, [setTemplate]);

  return { template, setTemplate, reset };
}

// ─── TemplateVisibilityStyle — emits the CSS rules that hide rows ─
//  Renders a <style> block with one rule per (template × hiddenRow)
//  pair. The rules are scoped by `data-template-account` +
//  `data-template` so they don't leak across dashboards (important
//  when ConsoleShell swaps dashboards on tier switch).

export function TemplateVisibilityStyle({
  accountType,
}: {
  accountType: TemplateAccountType;
}) {
  const templates = getTemplates(accountType);
  const rules: string[] = [];
  for (const t of templates) {
    for (const row of t.hiddenRows) {
      rules.push(
        `[data-template-account="${accountType}"][data-template="${t.id}"] [data-template-row="${row}"] { display: none !important; }`,
      );
    }
  }
  if (rules.length === 0) return null;
  return <style>{rules.join("\n")}</style>;
}

// ─── TemplateSelector — dropdown for the ConsoleShell top bar ─────
//  Renders a compact pill button showing the current template name
//  + icon. Click toggles a dropdown listing all templates for the
//  active accountType, each with name, icon, and description on
//  hover (title attribute). Selecting a template writes localStorage
//  + dispatches the `harchiq:template` event.

export function TemplateSelector({
  accountType,
  accent,
}: {
  accountType: TemplateAccountType;
  accent: string;
}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string>(() => {
    if (typeof window === "undefined") return "full";
    try {
      const stored = window.localStorage.getItem(
        templateStorageKey(accountType),
      );
      const valid =
        stored && getTemplates(accountType).some((t) => t.id === stored);
      return valid ? stored : "full";
    } catch {
      return "full";
    }
  });

  // Sync with cross-component events so the selector label updates
  // when a template is picked from the Cmd+K palette or a dashboard.
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<TemplateEventPayload>;
      if (!ce.detail || ce.detail.accountType !== accountType) return;
      setCurrent(ce.detail.template);
    };
    window.addEventListener(TEMPLATE_EVENT, handler);
    return () => window.removeEventListener(TEMPLATE_EVENT, handler);
  }, [accountType]);

  // Close on Escape / outside click
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest?.("[data-template-selector]")) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [open]);

  const templates = getTemplates(accountType);
  const active = getTemplateDef(accountType, current) ?? templates[templates.length - 1];

  const select = (id: string) => {
    setCurrent(id);
    setOpen(false);
    try {
      window.localStorage.setItem(templateStorageKey(accountType), id);
    } catch {
      // ignore
    }
    window.dispatchEvent(
      new CustomEvent<TemplateEventPayload>(TEMPLATE_EVENT, {
        detail: { accountType, template: id },
      }),
    );
  };

  const reset = () => {
    select("full");
  };

  return (
    <div
      data-template-selector
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Dashboard template: ${active.name}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={active.description}
        className="console-template-btn"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          height: "28px",
          padding: "0 10px",
          background: open ? C.surface : C.surfaceAlt,
          border: `1px solid ${open ? accent : C.border}`,
          borderRadius: "4px",
          fontFamily: FONT.mono,
          fontSize: "10px",
          fontWeight: 700,
          color: open ? accent : C.textSecondary,
          cursor: "pointer",
          transition: "border-color 0.15s, color 0.15s, background 0.15s",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "14px",
            height: "14px",
            borderRadius: "2px",
            background: accent,
            color: "#ffffff",
            fontSize: "10px",
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          {active.icon}
        </span>
        <span className="console-template-label">{active.name}</span>
        <span
          aria-hidden
          style={{
            fontSize: "8px",
            color: open ? accent : C.textMuted,
            transition: "transform 0.15s",
            transform: open ? "rotate(180deg)" : "rotate(0)",
            marginLeft: "2px",
          }}
        >
          {"\u25BE"}
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Dashboard templates"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            minWidth: "280px",
            maxWidth: "320px",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "4px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
            zIndex: 60,
            overflow: "hidden",
            fontFamily: FONT.sans,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              padding: "8px 12px 6px",
              fontSize: "9px",
              fontFamily: FONT.mono,
              color: C.textMuted,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Dashboard Template</span>
            <span style={{ color: C.textFaint }}>{templates.length} layouts</span>
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, maxHeight: "320px", overflowY: "auto" }}>
            {templates.map((t) => {
              const isActive = t.id === current;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => select(t.id)}
                    title={t.description}
                    style={{
                      display: "flex",
                      gap: "10px",
                      width: "100%",
                      padding: "10px 12px",
                      background: isActive ? `${accent}0F` : "transparent",
                      border: "none",
                      borderBottom: `1px solid ${C.bgHover}`,
                      cursor: "pointer",
                      textAlign: "left",
                      alignItems: "flex-start",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = C.bgHover;
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        flexShrink: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "20px",
                        height: "20px",
                        borderRadius: "3px",
                        background: isActive ? accent : C.bgHover,
                        color: isActive ? "#ffffff" : C.textSecondary,
                        fontFamily: FONT.mono,
                        fontSize: "11px",
                        fontWeight: 800,
                      }}
                    >
                      {t.icon}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          display: "block",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: C.textPrimary,
                          fontFamily: FONT.sans,
                        }}
                      >
                        {t.name}
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontSize: "10px",
                          color: C.textMuted,
                          fontFamily: FONT.sans,
                          marginTop: "2px",
                          lineHeight: 1.4,
                        }}
                      >
                        {t.description}
                      </span>
                    </span>
                    {isActive && (
                      <span
                        aria-hidden
                        style={{
                          flexShrink: 0,
                          fontSize: "10px",
                          color: accent,
                          fontFamily: FONT.mono,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        Active
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <div
            style={{
              padding: "8px 12px",
              borderTop: `1px solid ${C.border}`,
              background: C.bgHover,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "9px",
                fontFamily: FONT.mono,
                color: C.textMuted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Persisted to localStorage
            </span>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: "4px 10px",
                fontSize: "10px",
                fontFamily: FONT.mono,
                fontWeight: 700,
                color: C.textSecondary,
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "3px",
                cursor: "pointer",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = accent;
                e.currentTarget.style.color = accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.color = C.textSecondary;
              }}
            >
              Reset to Default
            </button>
          </div>
        </div>
      )}

      {/* Responsive: hide the label on narrow screens (icon-only) */}
      <style>{`
        @media (max-width: 768px) {
          .console-template-btn .console-template-label { display: none !important; }
          .console-template-btn { padding: 0 8px !important; }
        }
      `}</style>
    </div>
  );
}

// ─── buildTemplateCommands — Cmd+K palette commands for templates ─
//  Returns one CommandItem-shaped object per template. The caller
//  (ConsoleShell) merges these into its `paletteItems` list so the
//  user can switch templates from the keyboard.

export interface TemplateCommandShard {
  id: string;
  label: string;
  hint: string;
  icon: string;
  group: "actions";
  keywords: string;
  action: () => void;
}

export function buildTemplateCommands(
  accountType: TemplateAccountType,
): TemplateCommandShard[] {
  const templates = getTemplates(accountType);
  return templates.map((t) => ({
    id: `template-${accountType}-${t.id}`,
    label: `Template: ${t.name}`,
    hint: "layout",
    icon: t.icon,
    group: "actions" as const,
    keywords: `template layout ${t.id} ${t.name.toLowerCase()} dashboard view switch`,
    action: () => {
      try {
        window.localStorage.setItem(templateStorageKey(accountType), t.id);
      } catch {
        // ignore
      }
      window.dispatchEvent(
        new CustomEvent<TemplateEventPayload>(TEMPLATE_EVENT, {
          detail: { accountType, template: t.id },
        }),
      );
    },
  }));
}

export default TemplateSelector;
