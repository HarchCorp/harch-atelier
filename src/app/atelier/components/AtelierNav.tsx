"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { ATELIER_NAV_LINKS, NavItem } from "./tokens";
import {
  ShieldAlert, OctagonAlert, Megaphone, Leaf, Scale,
  ShieldCheck, LayoutDashboard, CodeXml, Star, FileWarning,
  FileChartColumn, Newspaper, FileSearch,
  MessageSquare, LayoutGrid, Mail,
  BrainCircuit, Database, Grid3x3,
  BookOpen, FileText, Radio, ChartColumn,
  Landmark, Wifi, Mountain, Plane, ShoppingBag, Zap,
  Building2, Info, Handshake, Briefcase,
  Trophy, Activity, TrendingUp, GitCompare,
  X,
  type LucideIcon,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
//  ATELIER NAVBAR — Stripe / Linear-grade
//  Frosted glass header (rgba 0.85 + blur 12px), charcoal CTA
//  (no sage green in navbar — reserved for dashboards), color-only
//  hover on nav items (Linear-style), mega-menu with icon + title +
//  description, full-screen mobile overlay with blur(20px).
//
//  i18n: the FR/EN toggle is wired to `router.replace(pathname,
//  { locale })` from `@/i18n/navigation`. The active locale is read
//  from `useLocale()` (next-intl), reflecting the URL prefix set by
//  the next-intl middleware in src/middleware.ts.
// ═══════════════════════════════════════════════════════════════

type Lang = "fr" | "en";

// Navbar-local design tokens (Stripe / Linear-grade palette)
const C = {
  bg: "#FFFFFF",
  bgSubtle: "#FAFAFA",
  surfaceAlt: "#F4F4F5",
  surfaceHover: "#FAFAFA",
  border: "#E5E5E5",
  borderLight: "rgba(0,0,0,0.06)",
  borderMenu: "rgba(0,0,0,0.04)",
  text: "#0A0A0A",        // charcoal — primary
  textSec: "#525252",     // neutral-600 — body
  textMuted: "#71717A",   // zinc-500 — descriptions
  textFaint: "#9CA3AF",   // gray-400 — chevrons / inactive lang
  iconBg: "#F4F4F5",
  // Charcoal-tinted hover (no sage green in navbar — sage reserved for dashboards)
  iconHoverBg: "rgba(10,10,10,0.06)",
  iconHoverColor: "#0A0A0A",
  pipe: "#E5E5E5",
  charcoal: "#0A0A0A",
  charcoalHover: "#1A1A1A",
  // Mono font stack: prefer JetBrains Mono, fall back to Space Mono
  // (loaded globally via next/font) then system monospace.
  fontMono: "'JetBrains Mono', 'Space Mono', ui-monospace, monospace",
  fontSans: "'Inter', system-ui, -apple-system, sans-serif",
} as const;

// ─── Icon mapping for mega-menu links ───────────────────────────
function iconForLabel(label: string): LucideIcon {
  const l = label.toLowerCase();
  if (l.startsWith("★") || l.includes("flagship")) return Star;
  if (l.includes("enterprise risk intelligence")) return ShieldCheck;
  if (l.includes("reputation risk report")) return OctagonAlert;
  if (l.includes("reputation risk")) return OctagonAlert;
  if (l.includes("risk report")) return FileWarning;
  if (l.includes("reputation dashboard")) return LayoutDashboard;
  if (l.includes("advanced dashboard")) return LayoutGrid;
  if (l.includes("reputation tracker")) return TrendingUp;
  if (l.includes("reputation report")) return FileChartColumn;
  if (l.includes("reputation")) return FileChartColumn;
  if (l.includes("pr") || l.includes("comms")) return Megaphone;
  if (l.includes("esg")) return Leaf;
  if (l.includes("regulation")) return Scale;
  if (l.includes("api") || l.includes("mcp")) return CodeXml;
  if (l.includes("media impact")) return Newspaper;
  if (l.includes("media report") || l.includes("2026 media")) return ChartColumn;
  if (l.includes("deep dive")) return FileSearch;
  if (l.includes("ask harch")) return MessageSquare;
  if (l.includes("newsletter") || l.includes("briefing")) return Mail;
  if (l.includes("our ai")) return BrainCircuit;
  if (l.includes("data")) return Database;
  if (l.includes("commitment")) return ShieldCheck;
  if (l.includes("resilience")) return Grid3x3;
  if (l.includes("blog")) return FileText;
  if (l.includes("insight")) return BookOpen;
  if (l.includes("news") || l.includes("feed")) return Radio;
  if (l.includes("banking") || l.includes("bank")) return Landmark;
  if (l.includes("telecom")) return Wifi;
  if (l.includes("mining") || l.includes("phosphate")) return Mountain;
  if (l.includes("aviation") || l.includes("air maroc")) return Plane;
  if (l.includes("retail")) return ShoppingBag;
  if (l.includes("energy")) return Zap;
  if (l.includes("ocp")) return Building2;
  if (l.includes("about")) return Info;
  if (l.includes("partner")) return Handshake;
  if (l.includes("career")) return Briefcase;
  if (l.includes("contact")) return Mail;
  if (l.includes("harch 100")) return Trophy;
  if (l.includes("risk tracker")) return Activity;
  if (l.includes("compar")) return GitCompare;
  return FileText;
}

export function AtelierNav() {
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const signInHref = isLoggedIn ? "/atelier/console" : "/atelier/login";
  const signInLabel = isLoggedIn ? "Console" : "Se connecter";

  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  // Active locale from next-intl (reflects URL prefix set by middleware).
  const locale = useLocale() as Lang;
  const router = useRouter();
  const pathname = usePathname();

  // Hover-delay timers (100ms open, 200ms close) for buttery mega-menu.
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Legacy localStorage migration DISABLED — was causing intermittent
  // client-side redirects on production. The URL is the single source
  // of truth for locale. No automatic redirect based on localStorage.
  // E2E test found this was redirecting ~30% of page loads.

  // Lock body scroll while mobile menu is open.
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  // Click-outside closes any open dropdown.
  useEffect(() => {
    if (!openDropdown) return;
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        clearTimers();
        setOpenDropdown(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearTimers();
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openDropdown]);

  // Cleanup timers on unmount.
  useEffect(() => {
    return () => clearTimers();
  }, []);

  const clearTimers = () => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const switchLang = (next: Lang) => {
    if (next === locale) return;
    // Real i18n navigation: rewrites URL with new locale prefix.
    router.replace(pathname, { locale: next });
  };

  // ─── Hover-delay handlers ────────────────────────────────────
  const handleItemEnter = (label: string) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    if (openTimer.current) clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => {
      setOpenDropdown(label);
      openTimer.current = null;
    }, 100);
  };

  const scheduleClose = () => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setOpenDropdown(null);
      closeTimer.current = null;
    }, 200);
  };

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  return (
    <>
      <header
        ref={headerRef}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          boxShadow: scrolled ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
          transition: "box-shadow 0.2s ease",
        }}
        onMouseLeave={scheduleClose}
      >
        <div
          style={{
            maxWidth: "1320px",
            margin: "0 auto",
            padding: "0 32px",
            height: "64px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "24px",
          }}
        >
          {/* ─── Brand — HARCH (bold charcoal) │ ATELIER (lighter gray) ─── */}
          <a
            href="/atelier"
            aria-label="Harch Atelier — accueil"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: C.text,
                fontFamily: C.fontSans,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              HARCH
            </span>
            <span
              aria-hidden
              style={{
                width: "1px",
                height: "16px",
                background: C.pipe,
                display: "inline-block",
                margin: "0 8px",
              }}
            />
            <span
              style={{
                fontSize: "14px",
                fontWeight: 400,
                color: C.textMuted,
                fontFamily: C.fontSans,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              Atelier
            </span>
          </a>

          {/* ─── Desktop nav — mega menu ─── */}
          <nav
            className="atelier-nav-desktop"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              height: "100%",
              flex: 1,
              justifyContent: "center",
            }}
          >
            {ATELIER_NAV_LINKS.map((item) => (
              <NavItemDesktop
                key={item.label}
                item={item}
                isOpen={openDropdown === item.label}
                onHoverOpen={() => {
                  if (item.dropdown) handleItemEnter(item.label);
                  else scheduleClose();
                }}
                onLeave={scheduleClose}
                onDropdownEnter={cancelClose}
                onDropdownLeave={scheduleClose}
                onToggle={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
              />
            ))}
          </nav>

          {/* ─── Right cluster — all items in ONE flex row, same height ─── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexShrink: 0,
              height: "100%",
            }}
          >
            {/* Se connecter — text link */}
            <a
              href={signInHref}
              className="atelier-nav-desktop"
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: C.textSec,
                textDecoration: "none",
                fontFamily: C.fontSans,
                transition: "color 0.15s ease",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                height: "36px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = C.text; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = C.textSec; }}
            >
              {signInLabel}
            </a>

            {/* Tarifs — text link */}
            <a
              href="/atelier/pricing"
              className="atelier-nav-desktop"
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: C.textSec,
                textDecoration: "none",
                fontFamily: C.fontSans,
                transition: "color 0.15s ease",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                height: "36px",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = C.text; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = C.textSec; }}
            >
              Tarifs
            </a>

            {/* Language indicator — FR (site is French-only, EN coming soon) */}
            <div
              className="atelier-nav-desktop"
              style={{
                display: "flex",
                alignItems: "center",
                height: "36px",
                fontFamily: C.fontMono,
                fontSize: "12px",
                fontWeight: 700,
                color: "#4A7B5F",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                padding: "4px 8px",
                borderRadius: "4px",
                backgroundColor: "rgba(74, 123, 95, 0.06)",
              }}
              title="Le site est en francais. La version anglaise arrive bientot."
            >
              FR
            </div>

            {/* Demander une démo — charcoal solid button */}
            <a
              href="/atelier/audit"
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#FFFFFF",
                textDecoration: "none",
                fontFamily: C.fontSans,
                letterSpacing: "-0.01em",
                padding: "10px 20px",
                background: C.charcoal,
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                transition: "all 150ms ease",
                display: "inline-flex",
                alignItems: "center",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.charcoalHover;
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = C.charcoal;
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Demander une démo
            </a>

            {/* Mobile burger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Ouvrir le menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              className="atelier-burger"
              style={{
                display: "none",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                flexDirection: "column",
                gap: "5px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: "20px",
                    height: "2px",
                    background: C.text,
                    transition: "all 0.2s ease",
                    transformOrigin: "center",
                    transform:
                      mobileOpen && i === 0 ? "rotate(45deg) translate(4px, 4px)" :
                      mobileOpen && i === 2 ? "rotate(-45deg) translate(5px, -5px)" : "none",
                    opacity: mobileOpen && i === 1 ? 0 : 1,
                  }}
                />
              ))}
            </button>
          </div>
        </div>
      </header>

      {/* ─── Mobile menu overlay (full-screen, frosted white) ─── */}
      {mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            aria-hidden
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.18)",
              zIndex: 99,
              animation: "atelierFadeIn 200ms ease forwards",
            }}
          />
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navigation"
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: "100%",
              maxWidth: "440px",
              height: "100vh",
              background: "rgba(255,255,255,0.98)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              zIndex: 100,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.10)",
              animation: "atelierSlideIn 300ms cubic-bezier(0.32, 0.72, 0, 1) forwards",
            }}
          >
            {/* Mobile menu header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                flexShrink: 0,
              }}
            >
              <a
                href="/atelier"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0",
                  textDecoration: "none",
                }}
              >
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: C.text,
                    fontFamily: C.fontSans,
                    letterSpacing: "-0.02em",
                  }}
                >
                  HARCH
                </span>
                <span
                  aria-hidden
                  style={{ width: "1px", height: "12px", background: C.pipe, margin: "0 8px" }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 400,
                    color: C.textMuted,
                    fontFamily: C.fontSans,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  Atelier
                </span>
              </a>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Fermer le menu"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: C.text,
                  borderRadius: "6px",
                }}
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* Mobile nav items */}
            <div
              style={{
                padding: "8px 20px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {ATELIER_NAV_LINKS.map((item) => (
                <MobileNavItem
                  key={item.label}
                  item={item}
                  isExpanded={mobileExpanded === item.label}
                  onToggle={() =>
                    setMobileExpanded(mobileExpanded === item.label ? null : item.label)
                  }
                  onNavigate={() => {
                    setMobileOpen(false);
                    setMobileExpanded(null);
                  }}
                />
              ))}
            </div>

            {/* Mobile bottom cluster */}
            <div
              style={{
                padding: "20px",
                borderTop: "1px solid rgba(0,0,0,0.06)",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                <a
                  href={signInHref}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: C.textSec,
                    textDecoration: "none",
                    fontFamily: C.fontSans,
                  }}
                >
                  {signInLabel}
                </a>
                <a
                  href="/atelier/pricing"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: C.textSec,
                    textDecoration: "none",
                    fontFamily: C.fontSans,
                  }}
                >
                  Tarifs
                </a>

                {/* Language toggle (mobile) */}
                <div
                  role="group"
                  aria-label="Sélection de la langue"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontFamily: C.fontMono,
                    marginLeft: "auto",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#4A7B5F",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    backgroundColor: "rgba(74, 123, 95, 0.1)",
                  }}
                >
                  FR
                </div>
              </div>

              <a
                href="/atelier/audit"
                onClick={() => setMobileOpen(false)}
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#FFFFFF",
                  textDecoration: "none",
                  fontFamily: C.fontSans,
                  padding: "16px",
                  background: C.charcoal,
                  borderRadius: "12px",
                  textAlign: "center",
                  display: "block",
                }}
              >
                Demander une démo
              </a>
            </div>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .atelier-nav-desktop { display: none !important; }
          .atelier-burger { display: flex !important; }
        }
        @keyframes atelierDropdownIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .atelier-megamenu {
          animation: atelierDropdownIn 200ms ease forwards;
        }
        @keyframes atelierFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes atelierSlideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .atelier-megamenu { animation: none; }
        }
      `}</style>
    </>
  );
}

// ─── Desktop nav item with mega-menu dropdown ──────────────────

function NavItemDesktop({
  item,
  isOpen,
  onHoverOpen,
  onLeave,
  onDropdownEnter,
  onDropdownLeave,
  onToggle,
}: {
  item: NavItem;
  isOpen: boolean;
  onHoverOpen: () => void;
  onLeave: () => void;
  onDropdownEnter: () => void;
  onDropdownLeave: () => void;
  onToggle: () => void;
}) {
  // Simple link (no dropdown)
  if (!item.dropdown) {
    return (
      <a
        href={item.href}
        style={{
          fontSize: "14px",
          fontWeight: 500,
          color: C.textSec,
          textDecoration: "none",
          fontFamily: C.fontSans,
          transition: "color 0.15s ease",
          whiteSpace: "nowrap",
          display: "inline-flex",
          alignItems: "center",
          padding: "8px 14px",
          height: "100%",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = C.text; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = C.textSec; }}
      >
        {item.label}
      </a>
    );
  }

  const sections = item.dropdown.sections;
  const multiCol = sections.length > 1;

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        display: "flex",
        alignItems: "center",
      }}
      onMouseEnter={onHoverOpen}
      onMouseLeave={onLeave}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        style={{
          fontSize: "14px",
          fontWeight: 500,
          color: isOpen ? C.text : C.textSec,
          fontFamily: C.fontSans,
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 14px",
          transition: "color 0.15s ease",
          whiteSpace: "nowrap",
          height: "100%",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = C.text; }}
        onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.color = C.textSec; }}
      >
        {item.label}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden
          style={{
            color: C.textFaint,
            transition: "transform 200ms ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <path
            d="M2 3.5L5 6.5L8 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Mega menu dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: "8px",
            zIndex: 100,
          }}
          onMouseEnter={onDropdownEnter}
          onMouseLeave={onDropdownLeave}
        >
          <div
            className="atelier-megamenu"
            style={{
              background: C.bg,
              border: "1px solid rgba(0,0,0,0.04)",
              borderRadius: "16px",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
              padding: "8px",
              minWidth: "400px",
              maxWidth: "560px",
            }}
          >
            {/* Section grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: multiCol
                  ? `repeat(${sections.length}, minmax(180px, 1fr))`
                  : "1fr",
                gap: "16px",
              }}
            >
              {sections.map((section) => (
                <div key={section.heading}>
                  {/* Section heading */}
                  <div
                    style={{
                      fontSize: "10px",
                      fontFamily: C.fontMono,
                      color: C.textFaint,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      margin: "8px 12px 4px",
                      fontWeight: 500,
                    }}
                  >
                    {section.heading}
                  </div>
                  {/* Links */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {section.links.map((link) => {
                      const Icon = iconForLabel(link.label);
                      return (
                        <a
                          key={link.href + link.label}
                          href={link.href}
                          style={{
                            padding: "10px 12px",
                            borderRadius: "10px",
                            textDecoration: "none",
                            transition: "background 0.15s ease",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "12px",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = C.surfaceHover;
                            const iconBox = e.currentTarget.querySelector(
                              ".atelier-mega-icon"
                            ) as HTMLElement | null;
                            if (iconBox) {
                              iconBox.style.background = C.iconHoverBg;
                              const svg = iconBox.querySelector("svg") as HTMLElement | null;
                              if (svg) svg.style.color = C.iconHoverColor;
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            const iconBox = e.currentTarget.querySelector(
                              ".atelier-mega-icon"
                            ) as HTMLElement | null;
                            if (iconBox) {
                              iconBox.style.background = C.iconBg;
                              const svg = iconBox.querySelector("svg") as HTMLElement | null;
                              if (svg) svg.style.color = C.textMuted;
                            }
                          }}
                        >
                          {/* Icon box */}
                          <span
                            className="atelier-mega-icon"
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "8px",
                              background: C.iconBg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              transition: "background 0.15s ease",
                            }}
                          >
                            <Icon size={16} strokeWidth={1.5} color={C.textMuted} />
                          </span>
                          {/* Title + description */}
                          <span
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "2px",
                              minWidth: 0,
                              flex: 1,
                            }}
                          >
                            <span
                              style={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: C.text,
                                fontFamily: C.fontSans,
                                lineHeight: 1.3,
                              }}
                            >
                              {link.label}
                            </span>
                            {link.desc && (
                              <span
                                style={{
                                  fontSize: "12px",
                                  color: C.textMuted,
                                  fontFamily: C.fontSans,
                                  lineHeight: 1.4,
                                }}
                              >
                                {link.desc}
                              </span>
                            )}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mobile nav item (accordion) ───────────────────────────────

function MobileNavItem({
  item,
  isExpanded,
  onToggle,
  onNavigate,
}: {
  item: NavItem;
  isExpanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  if (!item.dropdown) {
    return (
      <a
        href={item.href}
        onClick={onNavigate}
        style={{
          fontSize: "18px",
          fontWeight: 500,
          color: C.text,
          textDecoration: "none",
          fontFamily: C.fontSans,
          padding: "0 12px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {item.label}
      </a>
    );
  }

  return (
    <div style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 12px",
          height: "56px",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
          fontWeight: 500,
          color: C.text,
          fontFamily: C.fontSans,
        }}
      >
        {item.label}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden
          style={{
            color: C.textFaint,
            transition: "transform 200ms ease",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <path
            d="M3 5L7 9L11 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {isExpanded && (
        <div
          style={{
            padding: "4px 0 12px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {item.dropdown.sections
            .flatMap((section) => section.links)
            .map((link) => {
              const Icon = iconForLabel(link.label);
              return (
                <a
                  key={link.href + link.label}
                  href={link.href}
                  onClick={onNavigate}
                  style={{
                    padding: "10px 12px",
                    fontSize: "14px",
                    color: C.textSec,
                    textDecoration: "none",
                    fontFamily: C.fontSans,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    borderRadius: "10px",
                  }}
                >
                  <Icon size={16} strokeWidth={1.5} color={C.textMuted} />
                  {link.label}
                </a>
              );
            })}
        </div>
      )}
    </div>
  );
}
