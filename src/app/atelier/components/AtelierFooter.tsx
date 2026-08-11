"use client";

import { useEffect, useState } from "react";
import BrandBadge from "@/components/BrandBadge";
import { ATELIER_FOOTER_LINKS, ATELIER_COUNTRIES } from "./tokens";
import { C } from "./tokens";

// ─── ATELIER FOOTER — DESIGN SYSTEM V2 (light, mobile-first) ────
// White background, neutral borders, stone-500 accent, Space Mono.
// Per DS V2: padding 48px 16px on mobile, 64px 32px on desktop.

// ─── SystemStatus — live health indicator (fetches /api/health) ───
function SystemStatus() {
  const [status, setStatus] = useState<"ok" | "degraded" | "checking">("checking");
  const [lastCheck, setLastCheck] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const r = await fetch("/api/health", { signal: AbortSignal.timeout(4000) });
        if (cancelled) return;
        setStatus(r.ok ? "ok" : "degraded");
        setLastCheck(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
      } catch {
        if (!cancelled) setStatus("degraded");
      }
    };
    check();
    const id = setInterval(check, 60000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const dotColor = status === "ok" ? "#10B981" : status === "degraded" ? "#EF4444" : "#9CA3AF";
  const label = status === "ok" ? "Système opérationnel" : status === "degraded" ? "Système dégradé" : "Vérification…";

  return (
    <div
      style={{
        maxWidth: "1280px",
        margin: "0 auto 24px",
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "8px",
        background: C.bgSubtle,
        border: `1px solid ${C.border}`,
        borderRadius: "6px",
        fontFamily: C.fontMono,
        fontSize: "11px",
        letterSpacing: "0.04em",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: dotColor,
            boxShadow: status === "ok" ? `0 0 0 3px rgba(16,185,129,0.18)` : "none",
            animation: status === "ok" ? "pulse-dot 2s ease-in-out infinite" : "none",
          }}
        />
        <span style={{ color: C.text, fontWeight: 600 }}>{label}</span>
      </div>
      <span style={{ color: C.textMuted }}>
        {lastCheck ? `Dernière vérif · ${lastCheck}` : "Initialisation…"}
      </span>
      <style>{`@keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }`}</style>
    </div>
  );
}

export function AtelierFooter() {
  return (
    <footer
      style={{
        borderTop: `1px solid ${C.border}`,
        background: C.bg,
        padding: "48px 16px 24px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <SystemStatus />
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
          gap: "32px",
          marginBottom: "32px",
          alignItems: "start",
        }}
      >
        {/* Brand block */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <BrandBadge subsidiary="Atelier" href="/atelier" size="md" theme="light" accentColor={C.accent} />
          <p
            style={{
              marginTop: "8px",
              fontSize: "13px",
              color: C.textMuted,
              fontFamily: C.fontMono,
              letterSpacing: "0.04em",
              lineHeight: 1.5,
            }}
          >
            AI Reputation Intelligence — Afrique & monde francophone.
          </p>
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              marginTop: "12px",
              fontSize: "13px",
              flexWrap: "wrap",
            }}
          >
            <a
              href="mailto:atelier@harchcorp.com"
              style={{ color: C.textBody, textDecoration: "none" }}
            >
              atelier@harchcorp.com
            </a>
            <span style={{ color: C.textMuted }}>·</span>
            <a
              href="tel:+212684440682"
              style={{ color: C.textBody, textDecoration: "none" }}
            >
              +212 684 440 682
            </a>
          </div>
          <a
            href="https://harchcorp.com"
            style={{
              marginTop: "4px",
              fontSize: "13px",
              color: C.accent,
              textDecoration: "none",
            }}
          >
            → harchcorp.com
          </a>
        </div>

        {/* Link columns */}
        <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
          {Object.entries(ATELIER_FOOTER_LINKS).map(([key, links]) => (
            <div
              key={key}
              style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "120px" }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontFamily: C.fontMono,
                  color: C.textMuted,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                {key}
              </div>
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  style={{
                    fontSize: "13px",
                    color: C.textBody,
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = C.text)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = C.textBody)
                  }
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Countries */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "32px 0",
          borderTop: `1px solid ${C.border}`,
          marginTop: "32px",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontFamily: C.fontMono,
            color: C.textMuted,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}
        >
          8 marchés francophones couverts
        </div>
        <div
          style={{
            display: "grid",
            // Wider cards (220px min) so city labels like "Casablanca · Rabat · Marrakech"
            // are not aggressively truncated. Was 140px → clientWidth was 80px → "Paris - Ly…".
            // Agent 3 fix (Task 10-A3): 140px → 180px + tighter padding/gap.
            // Agent 10 VLM fix (CRAZY-10-VLM): 180px → 220px + allow city text to wrap
            // so "Paris · Lyon · Marseille" no longer truncates to "Paris · Lyon · Mars...".
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            gap: "12px",
          }}
        >
          {ATELIER_COUNTRIES.map((c) => (
            <div
              key={c.code}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 10px",
                background: C.bgSubtle,
                border: `1px solid ${C.border}`,
                borderRadius: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  fontFamily: C.fontMono,
                  color: "#FFFFFF",
                  padding: "4px 6px",
                  background: C.accent,
                  border: `1px solid ${C.accent}`,
                  borderRadius: "2px",
                  letterSpacing: "0.08em",
                  flexShrink: 0,
                }}
              >
                {c.code}
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: C.text,
                  }}
                >
                  {c.name}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: C.textMuted,
                    fontFamily: C.fontMono,
                    lineHeight: 1.4,
                    marginTop: "2px",
                    wordBreak: "break-word",
                  }}
                >
                  {c.cities}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legal */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          paddingTop: "24px",
          borderTop: `1px solid ${C.border}`,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: C.textMuted,
            fontFamily: C.fontMono,
            letterSpacing: "0.04em",
          }}
        >
          Building in Public, depuis 2026 · Casablanca, Maroc
        </div>
        <div
          style={{
            fontSize: "12px",
            color: C.textMuted,
            fontFamily: C.fontMono,
            letterSpacing: "0.04em",
          }}
        >
          Harch Atelier est une activité de Harch Corp · Virement bancaire
        </div>
      </div>
    </footer>
  );
}
