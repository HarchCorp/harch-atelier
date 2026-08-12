"use client";

// ═══════════════════════════════════════════════════════════════
//  STANDBY BANNER — /atelier/console/{harch-alpha,investment-bank,
//  market-competitor}
//
//  Replaces the `<ConsoleShell>` render on the 3 hidden account-type
//  routes. Shows a clean "feature in standby" message instead of
//  mounting the dashboard (which would crash with a Prisma
//  initialization error against the PostgreSQL/SQLite mismatch).
//
//  Design system V2:
//    - stone-500 accent (labels / icon ring)
//    - emerald CTA (primary action)
//    - Space Mono for labels / eyebrow
//    - white surface, neutral-200 borders
//
//  Task ID: 5-standby
// ═══════════════════════════════════════════════════════════════

import { C } from "../components/tokens";
import BrandBadge from "@/components/BrandBadge";

export interface StandbyBannerProps {
  featureName: string;
  reason?: string;
  ctaHref?: string;
  ctaLabel?: string;
}

const DEFAULT_REASON =
  "This module is on standby while we focus on the core console experience. Trader and investment-bank desks will return in a future release.";

const DEFAULT_CTA_HREF = "/atelier/console";
const DEFAULT_CTA_LABEL = "Back to Brand Monitor";

export function StandbyBanner({
  featureName,
  reason = DEFAULT_REASON,
  ctaHref = DEFAULT_CTA_HREF,
  ctaLabel = DEFAULT_CTA_LABEL,
}: StandbyBannerProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        fontFamily: C.fontSans,
        color: C.text,
      }}
    >
      <header style={{
        padding: "16px 24px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: C.bg,
      }}>
        <BrandBadge size="sm" subsidiary="Atelier" theme="light" />
        <span style={{
          fontFamily: C.fontMono,
          fontSize: "10px",
          color: C.accent,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          borderLeft: `1px solid ${C.border}`,
          paddingLeft: "10px",
        }}>
          Console
        </span>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px 24px",
        }}
      >
        <div
          role="status"
          aria-live="polite"
          style={{
            width: "100%",
            maxWidth: "560px",
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
            boxShadow: C.shadowSm,
            padding: "40px 32px",
            textAlign: "center",
          }}
        >
          {/* Standby icon — stone-500 ring with a moon/pause glyph */}
          <div
            aria-hidden
            style={{
              width: "56px",
              height: "56px",
              margin: "0 auto 20px",
              borderRadius: "50%",
              border: `2px solid ${C.accent}`,
              background: "rgba(120,113,108,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: C.accent,
              fontFamily: C.fontMono,
              fontSize: "20px",
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            ◓
          </div>

          {/* Eyebrow label */}
          <div
            style={{
              fontFamily: C.fontMono,
              fontSize: "10px",
              color: C.accent,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: "12px",
              fontWeight: 700,
            }}
          >
            On Standby
          </div>

          {/* Feature name */}
          <h1
            style={{
              fontFamily: C.fontSans,
              fontSize: "24px",
              fontWeight: 700,
              color: C.text,
              letterSpacing: "-0.02em",
              margin: "0 0 14px",
            }}
          >
            {featureName}
          </h1>

          {/* Reason */}
          <p
            style={{
              fontFamily: C.fontSans,
              fontSize: "14px",
              color: C.textBody,
              lineHeight: 1.6,
              margin: "0 auto 28px",
              maxWidth: "440px",
            }}
          >
            {reason}
          </p>

          {/* CTA — emerald-500, always */}
          <a
            href={ctaHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "11px 22px",
              background: C.cta,
              color: "#ffffff",
              fontFamily: C.fontMono,
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              textDecoration: "none",
              borderRadius: "6px",
              transition: "background 0.15s ease, transform 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = C.ctaHover;
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = C.cta;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {ctaLabel}
            <span aria-hidden style={{ fontSize: "14px" }}>
              &rarr;
            </span>
          </a>

          {/* Secondary escape hatch */}
          <div
            style={{
              marginTop: "20px",
              fontFamily: C.fontMono,
              fontSize: "11px",
              color: C.textMuted,
              letterSpacing: "0.04em",
            }}
          >
            Questions?{" "}
            <a
              href="/atelier/audit"
              style={{
                color: C.accent,
                textDecoration: "none",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              Talk to the team
            </a>
          </div>
        </div>
      </main>

      <footer style={{
        padding: "12px 24px",
        borderTop: `1px solid ${C.border}`,
        background: C.bg,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: C.fontMono,
        fontSize: "10px",
        color: C.textMuted,
        letterSpacing: "0.05em",
      }}>
        <span>HarchIQ Console · Private workspace</span>
        <span>English only · No public navigation</span>
      </footer>
    </div>
  );
}
