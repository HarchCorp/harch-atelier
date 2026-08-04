"use client";

import { useState } from "react";

// ═══════════════════════════════════════════════════════════════
//  KEYWORD SEARCH BAR — with filter pills
//
//  Inspired by Meltwater Explorer + Talkwalker consumer intelligence.
//  The Dircom types a keyword, gets instant filter pills for source
//  type, language, location, sentiment, date range. Pattern matches
//  the competitor screenshots (IMG_1050, IMG_1056).
// ═══════════════════════════════════════════════════════════════

const C = {
  surface: "#FFFFFF",
  surfaceAlt: "#F4F4F5",
  border: "#E5E5E5",
  borderLight: "#F0F0F0",
  text: "#0A0A0A",
  textSec: "#525252",
  textMuted: "#71717A",
  accent: "#78716c",
  cta: "#10b981",
  fontSans: "'Inter', system-ui, sans-serif",
  fontMono: "'Space Mono', monospace",
};

type FilterCategory = "source" | "language" | "sentiment" | "dateRange";

interface FilterOption {
  label: string;
  value: string;
  color?: string;
}

const FILTERS: Record<FilterCategory, FilterOption[]> = {
  source: [
    { label: "All sources", value: "all" },
    { label: "Hespress", value: "hespress" },
    { label: "Le360", value: "le360" },
    { label: "TelQuel", value: "telquel" },
    { label: "Médias24", value: "medias24" },
    { label: "L'Économiste", value: "leseco" },
    { label: "TikTok", value: "tiktok" },
    { label: "Facebook", value: "facebook" },
    { label: "WhatsApp", value: "whatsapp" },
  ],
  language: [
    { label: "Toutes", value: "all" },
    { label: "MSA", value: "msa", color: "#1e3a5f" },
    { label: "Français", value: "french", color: "#4a7b5f" },
    { label: "English", value: "english", color: "#8b6914" },
    { label: "Darija", value: "darija", color: "#a0524b" },
  ],
  sentiment: [
    { label: "Tous", value: "all" },
    { label: "Positive", value: "positive", color: "#10b981" },
    { label: "Neutre", value: "neutral", color: "#71717a" },
    { label: "Négatif", value: "negative", color: "#ef4444" },
  ],
  dateRange: [
    { label: "24h", value: "24h" },
    { label: "7j", value: "7d" },
    { label: "30j", value: "30d" },
    { label: "90j", value: "90d" },
    { label: "365j", value: "365d" },
  ],
};

export function KeywordSearchBar({ onSearch }: { onSearch?: (query: string, filters: Record<FilterCategory, string>) => void }) {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<FilterCategory, string>>({
    source: "all",
    language: "all",
    sentiment: "all",
    dateRange: "7d",
  });
  const [expandedCategory, setExpandedCategory] = useState<FilterCategory | null>(null);

  const handleSearch = () => {
    onSearch?.(query, activeFilters);
  };

  const activeFilterCount = Object.values(activeFilters).filter((v) => v !== "all" && v !== "7d").length;

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "12px",
        padding: "16px 20px",
      }}
    >
      <style>{`
        @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 200px; } }
      `}</style>

      {/* Search input row */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: expandedCategory ? "12px" : "0" }}>
        {/* Search icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Rechercher un mot-clé, une marque, un dirigeant..."
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontFamily: C.fontSans,
            fontSize: "15px",
            color: C.text,
            background: "transparent",
          }}
        />

        {/* Active filter count badge */}
        {activeFilterCount > 0 && (
          <span
            style={{
              fontFamily: C.fontMono,
              fontSize: "10px",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "10px",
              background: C.accent,
              color: "#fff",
            }}
          >
            {activeFilterCount} filtre{activeFilterCount > 1 ? "s" : ""}
          </span>
        )}

        {/* Search button */}
        <button
          onClick={handleSearch}
          style={{
            padding: "8px 18px",
            background: C.cta,
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontFamily: C.fontSans,
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Rechercher →
        </button>
      </div>

      {/* Filter pills row */}
      <div style={{ display: "flex", gap: "6px", marginTop: "12px", flexWrap: "wrap" }}>
        {(Object.keys(FILTERS) as FilterCategory[]).map((cat) => {
          const activeValue = activeFilters[cat];
          const activeOption = FILTERS[cat].find((o) => o.value === activeValue);
          const isExpanded = expandedCategory === cat;
          return (
            <div key={cat} style={{ position: "relative" }}>
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  background: isExpanded ? C.text : C.surfaceAlt,
                  color: isExpanded ? "#fff" : C.textSec,
                  border: `1px solid ${isExpanded ? C.text : C.border}`,
                  borderRadius: "6px",
                  fontFamily: C.fontMono,
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  transition: "all 0.15s",
                }}
              >
                {cat === "source" && "📰"}
                {cat === "language" && "🌐"}
                {cat === "sentiment" && "📊"}
                {cat === "dateRange" && "📅"}
                <span>{activeOption?.label || cat}</span>
                {activeOption?.color && (
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: activeOption.color, display: "inline-block" }} />
                )}
                <span style={{ fontSize: "9px", opacity: 0.6 }}>▼</span>
              </button>

              {/* Dropdown */}
              {isExpanded && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: "4px",
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    zIndex: 50,
                    minWidth: "160px",
                    padding: "4px",
                    animation: "slideDown 0.2s ease-out",
                    overflow: "hidden",
                  }}
                >
                  {FILTERS[cat].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setActiveFilters((prev) => ({ ...prev, [cat]: opt.value }));
                        setExpandedCategory(null);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        width: "100%",
                        padding: "8px 12px",
                        background: activeFilters[cat] === opt.value ? C.surfaceAlt : "transparent",
                        border: "none",
                        borderRadius: "4px",
                        fontFamily: C.fontSans,
                        fontSize: "13px",
                        color: C.text,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceAlt)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = activeFilters[cat] === opt.value ? C.surfaceAlt : "transparent")}
                    >
                      {opt.color && (
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: opt.color, flexShrink: 0 }} />
                      )}
                      <span>{opt.label}</span>
                      {activeFilters[cat] === opt.value && (
                        <span style={{ marginLeft: "auto", color: C.cta, fontSize: "14px" }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
