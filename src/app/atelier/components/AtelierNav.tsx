"use client";

import { useState, useEffect } from "react";
import BrandBadge from "@/components/BrandBadge";
import { ATELIER_NAV_LINKS, NavItem } from "./tokens";

// ═══════════════════════════════════════════════════════════════
//  ATELIER NAVBAR — MEGA MENU (Signal AI style)
//  6 top-level items with dropdowns containing grouped sections
//  Light theme, sticky, blur backdrop on scroll
// ═══════════════════════════════════════════════════════════════

type Lang = "fr" | "en";

const C = {
  bg: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceAlt: "#F4F4F5",
  border: "#E5E5E5",
  borderLight: "#F0F0F0",
  text: "#0A0A0A",
  textSec: "#525252",
  textMuted: "#71717A",
  accent: "#4A5D6E",
  sage: "#4A7B5F",
  sageBright: "#6FA386",
  red: "#A0524B",
};

export function AtelierNav() {
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("fr");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("atelier-lang");
      if (stored === "fr" || stored === "en") setLang(stored);
    } catch {}
  }, []);

  const switchLang = (next: Lang) => {
    if (next === lang) return;
    setLang(next);
    try {
      window.localStorage.setItem("atelier-lang", next);
    } catch {}
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: scrolled ? "rgba(255,255,255,0.96)" : "rgba(250,250,250,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
        transition: "background 0.2s, border-color 0.2s",
      }}
      onMouseLeave={() => setOpenDropdown(null)}
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
        {/* Brand */}
        <BrandBadge subsidiary="Atelier" href="/atelier" size="md" theme="light" accentColor={C.accent} />

        {/* Desktop nav — mega menu */}
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
              onHover={() => setOpenDropdown(item.dropdown ? item.label : null)}
              onToggle={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
            />
          ))}
        </nav>

        {/* Right side: language + CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            role="group"
            aria-label="Language selection"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: "32px",
              padding: "3px",
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: "999px",
              fontFamily: "'Inter', sans-serif",
              flexShrink: 0,
            }}
          >
            {(["fr", "en"] as Lang[]).map((code) => {
              const active = code === lang;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => switchLang(code)}
                  aria-pressed={active}
                  style={{
                    height: "26px",
                    minWidth: "36px",
                    padding: "0 10px",
                    fontSize: "12px",
                    fontWeight: 700,
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "0.05em",
                    lineHeight: "26px",
                    textAlign: "center",
                    color: active ? "#FFFFFF" : C.textMuted,
                    background: active ? C.sage : "transparent",
                    border: "none",
                    borderRadius: "999px",
                    cursor: "pointer",
                    transition: "background 0.15s, color 0.15s",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = C.text; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = C.textMuted; }}
                >
                  {code.toUpperCase()}
                </button>
              );
            })}
          </div>

          <a
            href="/atelier/audit"
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#FFFFFF",
              textDecoration: "none",
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "-0.01em",
              padding: "8px 20px",
              background: C.sage,
              borderRadius: "6px",
              transition: "all 0.2s",
              display: "inline-flex",
              alignItems: "center",
              height: "36px",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#3D6650";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(74,123,95,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = C.sage;
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Request a demo
          </a>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              flexDirection: "column",
              gap: "5px",
            }}
            className="atelier-burger"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: "22px",
                  height: "2px",
                  background: C.text,
                  transition: "all 0.2s",
                  transform:
                    mobileOpen && i === 0 ? "rotate(45deg) translate(5px, 5px)" :
                    mobileOpen && i === 2 ? "rotate(-45deg) translate(6px, -6px)" : "none",
                  opacity: mobileOpen && i === 1 ? 0 : 1,
                }}
              />
            ))}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            display: "none",
            padding: "16px 32px 24px",
            flexDirection: "column",
            gap: "4px",
            borderTop: `1px solid ${C.border}`,
            background: C.surface,
            maxHeight: "calc(100vh - 64px)",
            overflowY: "auto",
          }}
          className="atelier-nav-mobile"
          id="mobile-menu"
        >
          {ATELIER_NAV_LINKS.map((item) => (
            <MobileNavItem
              key={item.label}
              item={item}
              isExpanded={mobileExpanded === item.label}
              onToggle={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
              onNavigate={() => { setMobileOpen(false); setMobileExpanded(null); }}
            />
          ))}
          <a
            href="/atelier/audit"
            onClick={() => setMobileOpen(false)}
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "#FFFFFF",
              textDecoration: "none",
              fontFamily: "'Inter', sans-serif",
              padding: "12px 20px",
              background: C.sage,
              borderRadius: "6px",
              textAlign: "center",
              marginTop: "8px",
            }}
          >
            Request a demo
          </a>
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .atelier-nav-desktop { display: none !important; }
          .atelier-burger { display: flex !important; }
          .atelier-nav-mobile { display: flex !important; }
        }
      `}</style>
    </header>
  );
}

// ─── Desktop nav item with mega-menu dropdown ──────────────────

function NavItemDesktop({ item, isOpen, onHover, onToggle }: { item: NavItem; isOpen: boolean; onHover: () => void; onToggle: () => void }) {
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
          letterSpacing: "-0.01em",
          padding: "8px 14px",
          borderRadius: "6px",
          transition: "color 0.15s, background 0.15s",
          height: "100%",
          display: "flex",
          alignItems: "center",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = C.text;
          e.currentTarget.style.background = C.surfaceAlt;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = C.textSec;
          e.currentTarget.style.background = "transparent";
        }}
      >
        {item.label}
      </a>
    );
  }

  // Dropdown item
  return (
    <div
      style={{ position: "relative", height: "100%" }}
      onMouseEnter={onHover}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape" && isOpen) {
            onHover();
            e.currentTarget.focus();
          }
        }}
        style={{
          fontSize: "14px",
          fontWeight: 500,
          color: isOpen ? C.text : C.textSec,
          textDecoration: "none",
          fontFamily: "'Inter', sans-serif",
          letterSpacing: "-0.01em",
          padding: "8px 14px",
          borderRadius: "6px",
          transition: "color 0.15s, background 0.15s",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = C.text;
          e.currentTarget.style.background = C.surfaceAlt;
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.color = C.textSec;
            e.currentTarget.style.background = "transparent";
          }
        }}
      >
        {item.label}
        <span style={{
          fontSize: "9px", color: C.textMuted,
          transition: "transform 0.15s",
          transform: isOpen ? "rotate(180deg)" : "none",
        }}>
          ▾
        </span>
      </button>

      {/* Mega menu dropdown */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
            boxShadow: "0 16px 48px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.04)",
            padding: "24px",
            minWidth: "520px",
            maxWidth: "680px",
            marginTop: "8px",
            zIndex: 100,
          }}
        >
          {/* Section title */}
          <div style={{
            fontSize: "11px",
            fontFamily: "'JetBrains Mono', monospace",
            color: C.sage,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: "16px",
            fontWeight: 700,
            borderBottom: `1px solid ${C.borderLight}`,
            paddingBottom: "12px",
          }}>
            {item.dropdown.title}
          </div>

          {/* Sections grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: item.dropdown.sections.length > 1 ? "1fr 1fr" : "1fr",
            gap: "32px",
          }}>
            {item.dropdown.sections.map((section) => (
              <div key={section.heading}>
                <div style={{
                  fontSize: "11px",
                  fontFamily: "'JetBrains Mono', monospace",
                  color: C.textMuted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                  fontWeight: 600,
                }}>
                  {section.heading}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {section.links.map((link) => (
                    <a
                      key={link.href + link.label}
                      href={link.href}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        textDecoration: "none",
                        transition: "background 0.15s",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = C.surfaceAlt;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <span style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: C.text,
                        fontFamily: "'Inter', sans-serif",
                      }}>
                        {link.label}
                      </span>
                      {link.desc && (
                        <span style={{
                          fontSize: "12px",
                          color: C.textMuted,
                          fontFamily: "'Inter', sans-serif",
                          lineHeight: 1.4,
                        }}>
                          {link.desc}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mobile nav item (accordion) ───────────────────────────────

function MobileNavItem({ item, isExpanded, onToggle, onNavigate }: { item: NavItem; isExpanded: boolean; onToggle: () => void; onNavigate: () => void }) {
  if (!item.dropdown) {
    return (
      <a
        href={item.href}
        onClick={onNavigate}
        style={{
          fontSize: "15px",
          fontWeight: 500,
          color: C.text,
          textDecoration: "none",
          fontFamily: "'Inter', sans-serif",
          padding: "12px 0",
        }}
      >
        {item.label}
      </a>
    );
  }

  return (
    <div>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "15px",
          fontWeight: 600,
          color: C.text,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {item.label}
        <span style={{
          fontSize: "12px", color: C.textMuted,
          transition: "transform 0.15s",
          transform: isExpanded ? "rotate(180deg)" : "none",
        }}>▾</span>
      </button>
      {isExpanded && (
        <div style={{
          paddingLeft: "16px",
          paddingBottom: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}>
          {item.dropdown.sections.flatMap(section => section.links).map((link) => (
            <a
              key={link.href + link.label}
              href={link.href}
              onClick={onNavigate}
              style={{
                padding: "8px 12px",
                fontSize: "14px",
                color: C.textSec,
                textDecoration: "none",
                fontFamily: "'Inter', sans-serif",
                borderRadius: "6px",
                background: C.surfaceAlt,
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
