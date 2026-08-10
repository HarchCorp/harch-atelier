"use client";

import React, { useState, useMemo, useCallback } from "react";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import {
  ScrollProgress,
  CursorGlow,
  BackToTop,
} from "../components/shared";
import {
  FAQS,
  CATEGORY_ORDER,
  type Category,
  type FAQ,
} from "./faq-data";

// ═══════════════════════════════════════════════════════════════════════
// HARCH ATELIER — FAQ PAGE (CRAZY-8-FAQ)
// 52 questions · 6 catégories · recherche temps réel · accordion · Voir plus
// ═══════════════════════════════════════════════════════════════════════
//
// Palette (LOCKED — light):
//   bg #FAFAFA · surface #FFFFFF · surfaceAlt #F4F4F5 · border #E5E5E5
//   text #0A0A0A · secondary #525252 · muted #71717A
//   accent #8B9DAF · accentDark #4A5D6E
//   sage #4A7B5F · sageBright #6FA386 · red #A0524B
//
// Sections:
//   01  Hero + search
//   02  Category filter tabs (Tous / Plateforme / Sécurité / Tarifs / Méthodologie / Conformité / Comptes)
//   03  FAQ list (52 questions, accordion — one open at a time, chevron rotate)
//   04  "Pas trouvé votre question ?" CTA → /atelier/contact
//   05  Footer
//
// ═══════════════════════════════════════════════════════════════════════

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────
const C = {
  bg: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceAlt: "#F4F4F5",
  border: "#E5E5E5",
  borderLight: "#F0F0F0",
  textPrimary: "#0A0A0A",
  textSecondary: "#525252",
  textMuted: "#71717A",
  textFaint: "#A1A1AA",
  accent: "#8B9DAF",
  accentDark: "#4A5D6E",
  sage: "#4A7B5F",
  sageBright: "#6FA386",
  sageDark: "#3D6650",
  sageBg: "rgba(74,123,95,0.08)",
  red: "#A0524B",
  redBg: "rgba(160,82,75,0.08)",
  neutral: "#71717A",
  neutralBg: "rgba(113,113,122,0.10)",
} as const;

const FONT = {
  sans: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', monospace",
} as const;

const SHADOW = {
  card: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
  cardHover: "0 2px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.06)",
  hero: "0 4px 12px rgba(0,0,0,0.04), 0 24px 48px rgba(0,0,0,0.06)",
} as const;

// ─── TYPES ─────────────────────────────────────────────────────────────

const CATEGORY_LABEL: Record<Category | "Tous", string> = {
  Tous: "Tous",
  Plateforme: "Plateforme",
  Sécurité: "Sécurité",
  Tarifs: "Tarifs",
  Méthodologie: "Méthodologie",
  Conformité: "Conformité",
  Comptes: "Comptes",
};

// FAQS is imported from ./faq-data (shared with server page.tsx for JSON-LD)

// (No re-export needed — page.tsx imports FAQS directly from ./faq-data)

// ─── DATA ─────────────────────────────────────────────────────────────
// All FAQ data (52 questions, 6 categories) is imported from ./faq-data.ts
// so it can be shared between this client component and the server page.tsx
// (which uses it to render the JSON-LD FAQPage schema).

// ─── SHARED HELPERS ────────────────────────────────────────────────────

function Eyebrow({
  children,
  color = C.textMuted,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <div
      style={{
        fontSize: "12px",
        fontFamily: FONT.mono,
        color: color,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        fontWeight: 500,
        justifyContent: "center",
      }}
    >
      {children}
      <span
        style={{
          width: "48px",
          height: "1px",
          background: `linear-gradient(to right, ${color}, transparent)`,
          opacity: 0.6,
        }}
        aria-hidden
      />
    </div>
  );
}

function IconArrow({
  size = 20,
  color = C.textMuted,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconSearch({
  size = 18,
  color = C.textMuted,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconChevron({
  size = 18,
  color = C.textMuted,
  open = false,
}: {
  size?: number;
  color?: string;
  open?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "transform 0.25s ease",
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
      }}
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconClose({
  size = 16,
  color = C.textMuted,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// Category color mapping
const CATEGORY_COLOR: Record<Category, string> = {
  Plateforme: C.sage,
  Sécurité: C.accentDark,
  Tarifs: C.red,
  Méthodologie: C.sageDark,
  Conformité: C.accent,
  Comptes: C.sageBright,
};

// ═══════════════════════════════════════════════════════════════════════
// SECTION 01 — HERO + SEARCH
// ═══════════════════════════════════════════════════════════════════════

function Hero({
  search,
  setSearch,
  totalResults,
}: {
  search: string;
  setSearch: (v: string) => void;
  totalResults: number;
}) {
  return (
    <section
      style={{
        position: "relative",
        background: C.bg,
        padding: "80px 32px 64px",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-200px",
          right: "-100px",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(74,123,95,0.06), transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-150px",
          left: "-100px",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(139,157,175,0.05), transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "0 16px",
          position: "relative",
          zIndex: 1,
          textAlign: "center",
        }}
      >
        <Eyebrow color={C.sage}>FAQ · 52 questions · 6 catégories</Eyebrow>
        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            color: C.textPrimary,
            margin: "0 0 24px",
          }}
        >
          Toutes vos questions sur
          <br />
          <span style={{ color: C.sage }}>Harch Atelier.</span>
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: C.textSecondary,
            lineHeight: 1.55,
            maxWidth: "620px",
            margin: "0 auto 32px",
          }}
        >
          Recherchez par mot-clé, filtrez par catégorie, ou parcourez les 52
          réponses. Chaque réponse est rédigée par notre équipe produit et
          mise à jour trimestriellement.
        </p>

        {/* Search bar */}
        <div
          style={{
            position: "relative",
            maxWidth: "640px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "18px",
              top: "50%",
              transform: "translateY(-50%)",
              color: C.textMuted,
              pointerEvents: "none",
            }}
          >
            <IconSearch size={18} color={C.textMuted} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher — sentiment, prix, CNDP, ChatGPT, alertes…"
            aria-label="Rechercher dans la FAQ"
            style={{
              width: "100%",
              padding: "16px 48px 16px 50px",
              fontSize: "15px",
              fontFamily: FONT.sans,
              color: C.textPrimary,
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "6px",
              outline: "none",
              boxShadow: SHADOW.card,
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = C.sage;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${C.sageBg}`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.boxShadow = SHADOW.card;
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Effacer la recherche"
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: C.textMuted,
              }}
            >
              <IconClose size={16} color={C.textMuted} />
            </button>
          )}
        </div>

        {/* Result counter */}
        <div
          style={{
            marginTop: "20px",
            fontSize: "12px",
            fontFamily: FONT.mono,
            color: C.textMuted,
            letterSpacing: "0.04em",
          }}
        >
          {search || totalResults !== FAQS.length
            ? `${totalResults} résultat${totalResults > 1 ? "s" : ""}`
            : `${FAQS.length} questions au total`}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 02 — CATEGORY FILTER TABS
// ═══════════════════════════════════════════════════════════════════════

function CategoryFilter({
  active,
  setActive,
  counts,
}: {
  active: Category | "Tous";
  setActive: (c: Category | "Tous") => void;
  counts: Record<string, number>;
}) {
  const tabs: (Category | "Tous")[] = ["Tous", ...CATEGORY_ORDER];
  return (
    <section
      style={{
        background: C.surface,
        padding: "32px 32px 0",
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.borderLight}`,
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        <div
          className="faq-tabs"
          role="tablist"
          aria-label="Catégories de FAQ"
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {tabs.map((cat) => {
            const isActive = active === cat;
            const count =
              cat === "Tous" ? FAQS.length : counts[cat] || 0;
            const accentColor =
              cat === "Tous" ? C.sage : CATEGORY_COLOR[cat as Category];
            return (
              <button
                key={cat}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(cat)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  fontSize: "13px",
                  fontFamily: FONT.sans,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#FFFFFF" : C.textSecondary,
                  background: isActive ? accentColor : C.surface,
                  border: `1px solid ${isActive ? accentColor : C.border}`,
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = accentColor;
                    e.currentTarget.style.color = accentColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.color = C.textSecondary;
                  }
                }}
              >
                {CATEGORY_LABEL[cat]}
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: FONT.mono,
                    padding: "2px 7px",
                    borderRadius: "2px",
                    background: isActive
                      ? "rgba(255,255,255,0.22)"
                      : C.surfaceAlt,
                    color: isActive ? "#FFFFFF" : C.textMuted,
                    fontWeight: 700,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 03 — FAQ LIST (accordion, one open at a time)
// ═══════════════════════════════════════════════════════════════════════

function FAQList({
  faqs,
  openId,
  setOpenId,
}: {
  faqs: FAQ[];
  openId: number | null;
  setOpenId: (id: number | null) => void;
}) {
  return (
    <section
      style={{
        background: C.surface,
        padding: "40px 32px 80px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        {faqs.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 32px",
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: C.textMuted,
                fontFamily: FONT.mono,
                marginBottom: "8px",
              }}
            >
              Aucune question ne correspond à votre recherche.
            </div>
            <div style={{ fontSize: "13px", color: C.textSecondary }}>
              Essayez un autre mot-clé, ou parcourez les 52 questions par
              catégorie.
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {faqs.map((faq) => (
              <FAQItem
                key={faq.id}
                faq={faq}
                open={openId === faq.id}
                onToggle={() =>
                  setOpenId(openId === faq.id ? null : faq.id)
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FAQItem({
  faq,
  open,
  onToggle,
}: {
  faq: FAQ;
  open: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasDetail = Boolean(faq.detail);
  const accentColor = CATEGORY_COLOR[faq.category];

  // Reset "Voir plus" when accordion closes
  React.useEffect(() => {
    if (!open && expanded) setExpanded(false);
  }, [open, expanded]);

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${open ? accentColor : C.border}`,
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: open ? SHADOW.cardHover : SHADOW.card,
        transition: "border-color 0.25s, box-shadow 0.25s",
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`faq-panel-${faq.id}`}
        style={{
          width: "100%",
          padding: "20px 24px",
          background: "transparent",
          border: "none",
          textAlign: "left",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          fontFamily: FONT.sans,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            flex: 1,
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontFamily: FONT.mono,
              fontWeight: 700,
              color: C.textMuted,
              minWidth: "32px",
              letterSpacing: "0.04em",
              flexShrink: 0,
            }}
          >
            {String(faq.id).padStart(2, "0")}
          </span>
          <span
            style={{
              fontSize: "10px",
              fontFamily: FONT.mono,
              color: accentColor,
              background:
                faq.category === "Plateforme"
                  ? C.sageBg
                  : faq.category === "Sécurité"
                    ? "rgba(74,93,110,0.08)"
                    : faq.category === "Tarifs"
                      ? C.redBg
                      : faq.category === "Méthodologie"
                        ? "rgba(61,102,80,0.10)"
                        : faq.category === "Conformité"
                          ? "rgba(139,157,175,0.10)"
                          : "rgba(111,163,134,0.12)",
              padding: "3px 8px",
              borderRadius: "2px",
              border: `1px solid ${accentColor}33`,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: 700,
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {faq.category}
          </span>
          <span
            style={{
              fontSize: "clamp(15px, 1.4vw, 16px)",
              fontWeight: 600,
              color: C.textPrimary,
              letterSpacing: "-0.01em",
              lineHeight: 1.35,
            }}
          >
            {faq.q}
          </span>
        </div>
        <span
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: open ? accentColor : C.surfaceAlt,
            color: open ? "#FFFFFF" : C.textMuted,
            transition: "background 0.2s, color 0.2s",
          }}
        >
          <IconChevron size={16} color={open ? "#FFFFFF" : C.textMuted} open={open} />
        </span>
      </button>

      {/* Panel — CSS-only smooth animation via grid-template-rows trick */}
      <div
        id={`faq-panel-${faq.id}`}
        className={`faq-panel ${open ? "faq-panel--open" : ""}`}
        role="region"
        aria-hidden={!open}
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows 0.3s ease",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <div style={{ padding: "0 24px 24px 70px" }}>
            <AnswerBody faq={faq} expanded={expanded} setExpanded={setExpanded} hasDetail={hasDetail} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ANSWER BODY ───────────────────────────────────────────────────────

function AnswerBody({
  faq,
  expanded,
  setExpanded,
  hasDetail,
}: {
  faq: FAQ;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  hasDetail: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <p
        style={{
          fontSize: "15px",
          color: C.textSecondary,
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        {faq.intro}
      </p>

      {/* Detail (collapsible via "Voir plus") */}
      {hasDetail && faq.detail && (
        <>
          {/* Bullets */}
          {expanded && faq.detail.bullets && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {faq.detail.bullets.map((b, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      background: CATEGORY_COLOR[faq.category],
                      marginTop: "9px",
                      flexShrink: 0,
                    }}
                    aria-hidden
                  />
                  <span
                    style={{
                      fontSize: "14px",
                      color: C.textPrimary,
                      lineHeight: 1.55,
                    }}
                  >
                    {b}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Note (italic insight) */}
          {expanded && faq.detail.note && (
            <div
              style={{
                padding: "14px 16px",
                background: C.sageBg,
                border: `1px solid rgba(74,123,95,0.2)`,
                borderRadius: "6px",
                fontSize: "13px",
                color: C.textPrimary,
                lineHeight: 1.55,
                fontStyle: "italic",
              }}
            >
              {faq.detail.note}
            </div>
          )}

          {/* Voir plus / Voir moins button */}
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 0",
              fontSize: "13px",
              fontFamily: FONT.sans,
              fontWeight: 600,
              color: CATEGORY_COLOR[faq.category],
              background: "transparent",
              border: "none",
              cursor: "pointer",
              borderBottom: `1px solid ${CATEGORY_COLOR[faq.category]}33`,
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderBottomColor = CATEGORY_COLOR[faq.category];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderBottomColor = `${CATEGORY_COLOR[faq.category]}33`;
            }}
          >
            {expanded ? "Voir moins" : "Voir plus"}
            <IconChevron
              size={14}
              color={CATEGORY_COLOR[faq.category]}
              open={expanded}
            />
          </button>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 04 — "PAS TROUVÉ VOTRE QUESTION ?" CTA → /atelier/contact
// ═══════════════════════════════════════════════════════════════════════

function ContactCTA() {
  return (
    <section
      style={{
        background: C.surfaceAlt,
        padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          textAlign: "center",
          padding: "56px 48px",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          boxShadow: SHADOW.card,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "300px",
            height: "300px",
            background:
              "radial-gradient(circle, rgba(74,123,95,0.08), transparent 70%)",
            borderRadius: "50%",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Eyebrow color={C.sage}>Pas trouvé votre question ?</Eyebrow>
          <h2
            style={{
              fontSize: "clamp(26px, 4vw, 38px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: C.textPrimary,
              margin: "0 0 16px",
            }}
          >
            Parlez à un humain.
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: C.textSecondary,
              lineHeight: 1.6,
              maxWidth: "520px",
              margin: "0 auto 32px",
            }}
          >
            Notre équipe répond sous 24 heures, en français. Pas de pitch
            commercial — juste une réponse à votre question spécifique.
          </p>
          <div
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href="/atelier/contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 28px",
                background: C.sage,
                color: "#FFFFFF",
                fontSize: "15px",
                fontWeight: 600,
                textDecoration: "none",
                borderRadius: "3px",
                border: `1px solid ${C.sage}`,
                cursor: "pointer",
                fontFamily: FONT.sans,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = C.sageDark)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = C.sage)
              }
            >
              Écrire à l'équipe
              <IconArrow size={16} color="#FFFFFF" />
            </a>
            <a
              href="https://wa.me/212684440682"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 28px",
                background: "transparent",
                color: C.accentDark,
                fontSize: "15px",
                fontWeight: 500,
                textDecoration: "none",
                borderRadius: "3px",
                border: `1px solid ${C.accentDark}`,
                cursor: "pointer",
                fontFamily: FONT.sans,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(74,93,110,0.06)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              WhatsApp
            </a>
          </div>

          {/* Contact info row */}
          <div
            style={{
              marginTop: "40px",
              paddingTop: "32px",
              borderTop: `1px solid ${C.borderLight}`,
              display: "flex",
              gap: "24px",
              justifyContent: "center",
              flexWrap: "wrap",
              fontSize: "12px",
              fontFamily: FONT.mono,
              color: C.textMuted,
            }}
          >
            <span>atelier@harchcorp.com</span>
            <span aria-hidden>·</span>
            <span>+212 684 440 682</span>
            <span aria-hidden>·</span>
            <span>Casablanca, Maroc</span>
            <span aria-hidden>·</span>
            <span>Réponse sous 24h</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// RESPONSIVE STYLES
// ═══════════════════════════════════════════════════════════════════════

function ResponsiveStyles() {
  return (
    <style>{`
      @media (max-width: 640px) {
        .faq-tabs {
          justify-content: flex-start !important;
          overflow-x: auto;
          flex-wrap: nowrap !important;
          padding-bottom: 8px;
          margin: 0 -16px;
          padding-left: 16px;
          padding-right: 16px;
          -webkit-overflow-scrolling: touch;
        }
        .faq-tabs::-webkit-scrollbar { height: 4px; }
        .faq-tabs::-webkit-scrollbar-thumb {
          background: ${C.border};
          border-radius: 2px;
        }
        .faq-tabs button { flex-shrink: 0; }
      }
      /* Accordion panel — smooth open/close */
      .faq-panel > div { overflow: hidden; }
      /* Custom scrollbar for long lists */
      @media (min-width: 641px) {
        /* No-op — desktop uses natural flow */
      }
    `}</style>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "Tous">(
    "Tous"
  );
  const [openId, setOpenId] = useState<number | null>(1);

  // Counts per category
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    FAQS.forEach((f) => {
      c[f.category] = (c[f.category] || 0) + 1;
    });
    return c;
  }, []);

  // Filtered FAQs — search in question + intro + bullets + note
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FAQS.filter((f) => {
      const matchesCategory =
        activeCategory === "Tous" || f.category === activeCategory;
      if (!matchesCategory) return false;
      if (q === "") return true;
      // Build a searchable text blob from question + intro + bullets + note
      const blob = [
        f.q,
        f.intro,
        f.detail?.bullets?.join(" ") ?? "",
        f.detail?.note ?? "",
        f.category,
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [search, activeCategory]);

  // When the filtered list changes and the openId is no longer visible,
  // auto-open the first visible question for better UX.
  const handleSetOpenId = useCallback(
    (id: number | null) => {
      setOpenId(id);
    },
    []
  );

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />
      <main
        style={{
          background: C.bg,
          color: C.textPrimary,
          fontFamily: FONT.sans,
        }}
      >
        <Hero
          search={search}
          setSearch={setSearch}
          totalResults={filtered.length}
        />
        <CategoryFilter
          active={activeCategory}
          setActive={setActiveCategory}
          counts={counts}
        />
        <FAQList
          faqs={filtered}
          openId={openId}
          setOpenId={handleSetOpenId}
        />
        <ContactCTA />
      </main>
      <AtelierFooter />
      <BackToTop />
      <ResponsiveStyles />
    </>
  );
}
