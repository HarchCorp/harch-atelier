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
//  ATELIER NAVBAR — Palantir / Stripe-grade
//  Charcoal CTA (no sage green), color-only hover on nav items,
//  mega-menu with icon + title + description, mobile slide-in.
//
//  i18n: the FR/EN toggle is wired to `router.replace(pathname,
//  { locale })` from `@/i18n/navigation`. The active locale is read
//  from `useLocale()` (next-intl), reflecting the URL prefix set by
//  the next-intl middleware in src/middleware.ts.
// ═══════════════════════════════════════════════════════════════

type Lang = "fr" | "en";

// Navbar-local design tokens (Palantir-grade palette)
const C = {
  bg: "#FFFFFF",
  bgSubtle: "#FAFAFA",
  surfaceAlt: "#F4F4F5",
  surfaceHover: "#FAFAFA",
  border: "#E5E5E5",
  borderLight: "#F0F0F0",
  text: "#0A0A0A",        // charcoal — primary
  textSec: "#525252",     // neutral-600 — body
  textMuted: "#71717A",   // zinc-500 — descriptions
  textFaint: "#9CA3AF",   // gray-400 — chevrons / inactive lang
  iconBg: "#F4F4F5",
  iconHoverBg: "rgba(120,113,108,0.10)", // stone-500 @ 10%
  pipe: "#E5E5E5",
  charcoal: "#0A0A0A",
  charcoalHover: "#1A1A1A",
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
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          borderBottom: `1px solid ${C.borderLight}`,
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
              gap: "10px",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: C.text,
                fontFamily: "'Inter', sans-serif",
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
              }}
            />
            <span
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: C.textMuted,
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "0.12em",
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
              gap: "32px",
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

          {/* ─── Right cluster ─── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              flexShrink: 0,
            }}
          >
            <div
              className="atelier-nav-desktop"
              style={{ display: "flex", alignItems: "center", gap: "20px" }}
            >
              {/* Se connecter — text link */}
              <a
                href={signInHref}
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: C.textSec,
                  textDecoration: "none",
                  fontFamily: "'Inter', sans-serif",
                  transition: "color 0.1s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = C.text; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = C.textSec; }}
              >
                {signInLabel}
              </a>

              {/* Tarifs — text link */}
              <a
                href="/atelier/pricing"
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: C.textSec,
                  textDecoration: "none",
                  fontFamily: "'Inter', sans-serif",
                  transition: "color 0.1s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = C.text; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = C.textSec; }}
              >
                Tarifs
              </a>

              {/* Language toggle: FR | EN — minimal mono text */}
              <div
                role="group"
                aria-label="Sélection de la langue"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                {(["fr", "en"] as Lang[]).map((code, idx) => {
                  const active = code === locale;
                  return (
                    <span
                      key={code}
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                      {idx === 1 && (
                        <span
                          aria-hidden
                          style={{ color: C.border, fontSize: "12px" }}
                        >
                          |
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => switchLang(code)}
                        aria-pressed={active}
                        style={{
                          fontSize: "12px",
                          fontWeight: active ? 700 : 400,
                          fontFamily: "'Space Mono', monospace",
                          color: active ? C.text : C.textFaint,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          transition: "color 0.1s ease",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          lineHeight: 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!active) e.currentTarget.style.color = C.textSec;
                        }}
                        onMouseLeave={(e) => {
                          if (!active) e.currentTarget.style.color = C.textFaint;
                        }}
                      >
                        {code.toUpperCase()}
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Demander une démo — charcoal solid button */}
            <a
              href="/atelier/audit"
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#FFFFFF",
                textDecoration: "none",
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "-0.01em",
                padding: "10px 20px",
                background: C.charcoal,
                borderRadius: "8px",
                transition: "background 0.15s ease, box-shadow 0.15s ease",
                display: "inline-flex",
                alignItems: "center",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.charcoalHover;
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = C.charcoal;
                e.currentTarget.style.boxShadow = "none";
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

      {/* ─── Mobile menu overlay ─── */}
      {mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            aria-hidden
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.3)",
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
              maxWidth: "400px",
              height: "100vh",
              background: C.bg,
              zIndex: 100,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.10)",
              animation: "atelierSlideIn 280ms cubic-bezier(0.32, 0.72, 0, 1) forwards",
            }}
          >
            {/* Mobile menu header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: `1px solid ${C.borderLight}`,
                flexShrink: 0,
              }}
            >
              <a
                href="/atelier"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  textDecoration: "none",
                }}
              >
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: C.text,
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "-0.02em",
                  }}
                >
                  HARCH
                </span>
                <span
                  aria-hidden
                  style={{ width: "1px", height: "12px", background: C.pipe }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: C.textMuted,
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "0.12em",
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
                borderTop: `1px solid ${C.borderLight}`,
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
                    fontFamily: "'Inter', sans-serif",
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
                    fontFamily: "'Inter', sans-serif",
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
                    fontFamily: "'Space Mono', monospace",
                    marginLeft: "auto",
                  }}
                >
                  {(["fr", "en"] as Lang[]).map((code, idx) => {
                    const active = code === locale;
                    return (
                      <span
                        key={code}
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                      >
                        {idx === 1 && (
                          <span
                            aria-hidden
                            style={{ color: C.border, fontSize: "12px" }}
                          >
                            |
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => switchLang(code)}
                          aria-pressed={active}
                          style={{
                            fontSize: "12px",
                            fontWeight: active ? 700 : 400,
                            fontFamily: "'Space Mono', monospace",
                            color: active ? C.text : C.textFaint,
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {code.toUpperCase()}
                        </button>
                      </span>
                    );
                  })}
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
                  fontFamily: "'Inter', sans-serif",
                  padding: "14px 20px",
                  background: C.charcoal,
                  borderRadius: "8px",
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
          from { opacity: 0; transform: translateY(-4px); }
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
          fontFamily: "'Inter', sans-serif",
          transition: "color 0.1s ease",
          whiteSpace: "nowrap",
          display: "inline-flex",
          alignItems: "center",
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
          fontFamily: "'Inter', sans-serif",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "0",
          transition: "color 0.1s ease",
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
            transition: "transform 0.2s ease",
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
            marginTop: "12px",
            zIndex: 100,
          }}
          onMouseEnter={onDropdownEnter}
          onMouseLeave={onDropdownLeave}
        >
          <div
            className="atelier-megamenu"
            style={{
              background: C.bg,
              border: `1px solid ${C.borderLight}`,
              borderRadius: "12px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              padding: "16px",
              minWidth: multiCol ? "560px" : "360px",
              maxWidth: "720px",
            }}
          >
            {/* Section grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: multiCol
                  ? `repeat(${sections.length}, minmax(180px, 1fr))`
                  : "1fr",
                gap: "24px",
              }}
            >
              {sections.map((section) => (
                <div key={section.heading}>
                  {/* Section heading */}
                  <div
                    style={{
                      fontSize: "10px",
                      fontFamily: "'Space Mono', monospace",
                      color: C.textFaint,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                      fontWeight: 500,
                      padding: "0 12px",
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
                            padding: "8px 12px",
                            borderRadius: "8px",
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
                            if (iconBox) iconBox.style.background = C.iconHoverBg;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            const iconBox = e.currentTarget.querySelector(
                              ".atelier-mega-icon"
                            ) as HTMLElement | null;
                            if (iconBox) iconBox.style.background = C.iconBg;
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
                                fontFamily: "'Inter', sans-serif",
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
                                  fontFamily: "'Inter', sans-serif",
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
          fontFamily: "'Inter', sans-serif",
          padding: "0 12px",
          height: "48px",
          display: "flex",
          alignItems: "center",
          borderBottom: `1px solid ${C.borderLight}`,
        }}
      >
        {item.label}
      </a>
    );
  }

  return (
    <div style={{ borderBottom: `1px solid ${C.borderLight}` }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 12px",
          height: "48px",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
          fontWeight: 500,
          color: C.text,
          fontFamily: "'Inter', sans-serif",
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
            transition: "transform 0.2s ease",
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
                    fontFamily: "'Inter', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    borderRadius: "8px",
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
