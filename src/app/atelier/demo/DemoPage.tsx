"use client";

// ═══════════════════════════════════════════════════════════════
//  EXECUTIVE DEMO PAGE — /atelier/demo
//
//  A clean, full-screen selector for the 4 HarchIQ offers. Each
//  card provisions a per-offer demo user (via /api/auth/demo) and
//  signs them in with NextAuth credentials. The console detects
//  demo mode via localStorage and shows the lockdown banner.
//
//  Why this page exists:
//    Amine can't afford login friction in a Comex face-to-face.
//    He opens the laptop, clicks one card, lands in a pre-populated
//    dashboard 4 seconds later. No "what was the password again?",
//    no empty-state, no accidental logout mid-pitch.
//
//  Auth model:
//    1. Click card -> POST /api/auth/demo { accountType, setupToken }
//    2. Server validates SETUP_TOKEN, upserts demo user
//    3. Server returns { email, password }
//    4. Client calls signIn("credentials", { email, password,
//       redirect: true, callbackUrl: "/atelier/console" })
//    5. NextAuth issues JWT -> redirect to per-offer dashboard
//
//  Demo mode flag:
//    localStorage["harchiq.demo"] = "true" is set BEFORE signIn so
//    the console shell can render the demo banner on first paint.
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { signIn } from "next-auth/react";
import { C } from "../components/tokens";

// SETUP_TOKEN is intentionally hard-coded here. It is a low-security
// demo secret (also documented in .env.example and the worklog).
// Exposing it client-side is acceptable because the only thing it
// unlocks is the creation of an empty demo user - the demo user has
// no real account value, and the per-offer data is seeded separately
// after the user is authenticated.
const SETUP_TOKEN = "setup-harch-atelier-2026";

type OfferId = "brand-monitor" | "market-competitor" | "investment-bank" | "harch-alpha";

interface Offer {
  id: OfferId;
  label: string;
  persona: string;
  description: string;
  accent: string;
  accentBg: string;
  bullets: string[];
  /**
   * Standby flag (Task ID: 5-standby). When true, the card renders
   * greyed-out with a "Standby" badge instead of a "Launch demo"
   * CTA, and clicks are no-ops. The underlying offer still appears
   * (communicating "coming back" better than hiding) but cannot be
   * launched.
   */
  standby?: boolean;
}

const OFFERS: Offer[] = [
  {
    id: "brand-monitor",
    label: "Brand Monitor",
    persona: "Chief Communications Officer",
    description: "Reputation intelligence for a Casablanca-listed flagship.",
    accent: "#059669",
    accentBg: "rgba(5,150,105,0.08)",
    bullets: [
      "20+ alerts across 5 topics",
      "AI visibility on 8 engines",
      "Daily briefing + monthly PDF",
    ],
  },
  {
    id: "market-competitor",
    label: "Competitor Intel",
    persona: "Strategy Director",
    description: "Tactical radar on 8 direct competitors in the same sector.",
    accent: "#d97706",
    accentBg: "rgba(217,119,6,0.10)",
    bullets: [
      "50-entity competitor basket",
      "Sankey sentiment migration",
      "Tactical alert terminal",
    ],
    standby: true,
  },
  {
    id: "investment-bank",
    label: "Investor Desk",
    persona: "Due Diligence Analyst",
    description: "Forensic terminal for M&A targets and UBO graphs.",
    accent: "#1e3a5f",
    accentBg: "rgba(30,58,95,0.06)",
    bullets: [
      "3 portfolios, 10+ holdings",
      "5 dossiers with UBO graph",
      "OFAC / EU / FATF screening",
    ],
    standby: true,
  },
  {
    id: "harch-alpha",
    label: "Alpha Desk",
    persona: "Buy-Side Trader",
    description: "Quant terminal on BVC + global markets with NLP signals.",
    accent: "#0891b2",
    accentBg: "rgba(8,145,178,0.10)",
    bullets: [
      "10 BVC assets, 90 days of OHLC",
      "Multi-currency settlement ledger",
      "Z-score + order-book matrix",
    ],
    standby: true,
  },
];

export function DemoPage() {
  const [loadingId, setLoadingId] = useState<OfferId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(offer: Offer) {
    // Standby offers (Task ID: 5-standby) cannot be launched —
    // their consoles render a StandbyBanner instead of the demo
    // dashboard. Clicks are no-ops; the card already shows a
    // "Standby" badge via the DemoCard component.
    if (offer.standby) return;
    if (loadingId) return;
    setLoadingId(offer.id);
    setError(null);

    // Set the demo flag BEFORE signIn so the console shell sees it
    // on first paint (it reads localStorage in a useEffect). The
    // value is "true" as a string - matches the spec contract.
    try {
      window.localStorage.setItem("harchiq.demo", "true");
      window.localStorage.setItem("harchiq.demo.accountType", offer.id);
    } catch {
      // localStorage may be unavailable (private mode) - the demo
      // banner is a nice-to-have, not a hard dependency.
    }

    try {
      // 1. Provision / refresh the demo user via the bypass route.
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountType: offer.id,
          setupToken: SETUP_TOKEN,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || `Demo auth failed (HTTP ${res.status})`);
      }

      const data = (await res.json()) as {
        ok: boolean;
        email: string;
        password: string;
        redirect: string;
      };

      if (!data.ok || !data.email || !data.password) {
        throw new Error("Demo route returned incomplete credentials");
      }

      // 2. Sign in via NextAuth credentials. redirect: true makes
      //    NextAuth navigate to callbackUrl on success - we don't
      //    need to window.location.href ourselves.
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: true,
        callbackUrl: "/atelier/console",
      });
      // signIn(redirect: true) never resolves - the browser is
      // navigated away. The loading state stays "on" until the
      // new page paints, which is the intended UX.
    } catch (err) {
      // Clear the demo flag so a failed attempt doesn't leave a
      // stale "demo" marker on a non-demo session.
      try {
        window.localStorage.removeItem("harchiq.demo");
        window.localStorage.removeItem("harchiq.demo.accountType");
      } catch {
        /* noop */
      }
      setError(err instanceof Error ? err.message : "Demo sign-in failed");
      setLoadingId(null);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        fontFamily: C.fontSans,
      }}
    >
      {/* Header - matches LoginPage styling */}
      <header
        style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}` }}
      >
        <span
          style={{
            fontFamily: C.fontMono,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: C.text,
            textTransform: "uppercase",
          }}
        >
          HarchIQ<span style={{ color: C.accent, marginLeft: "8px" }}>Console</span>
        </span>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 16px",
        }}
      >
        <div style={{ maxWidth: "960px", width: "100%" }}>
          {/* Title block */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div
              style={{
                fontFamily: C.fontMono,
                fontSize: "10px",
                color: C.warningText,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                marginBottom: "14px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 10px",
                background: C.warningBg,
                border: `1px solid ${C.warningBorder}`,
                borderRadius: "4px",
              }}
            >
              <span
                aria-hidden
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: C.warning,
                  display: "inline-block",
                }}
              />
              Executive Demo
            </div>
            <h1
              style={{
                fontSize: "clamp(28px, 5vw, 40px)",
                fontWeight: 700,
                color: C.text,
                letterSpacing: "-0.03em",
                margin: "0 0 14px",
              }}
            >
              Pick an offer to demo.
            </h1>
            <p
              style={{
                fontSize: "15px",
                color: C.textBody,
                lineHeight: 1.55,
                maxWidth: "560px",
                margin: "0 auto",
              }}
            >
              Each card provisions a pre-populated environment with realistic
              Moroccan market data. No password, no setup - one click lands
              you in the console.
            </p>
          </div>

          {/* 2x2 grid of offer cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {OFFERS.map((offer) => {
              const isLoading = loadingId === offer.id;
              const isDisabled = (loadingId !== null && !isLoading) || !!offer.standby;
              return (
                <DemoCard
                  key={offer.id}
                  offer={offer}
                  loading={isLoading}
                  disabled={isDisabled}
                  onClick={() => handleSelect(offer)}
                />
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              style={{
                marginTop: "24px",
                padding: "12px 14px",
                background: C.dangerBg,
                border: `1px solid ${C.danger}30`,
                borderRadius: "4px",
                fontSize: "13px",
                color: C.danger,
                lineHeight: 1.5,
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          {/* Footer links */}
          <div
            style={{
              marginTop: "40px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <a
              href="/atelier/login"
              style={{
                fontSize: "12px",
                color: C.textMuted,
                fontFamily: C.fontMono,
                textDecoration: "none",
              }}
            >
              Back to login
            </a>
            <a
              href="/atelier"
              style={{
                fontSize: "12px",
                color: C.textMuted,
                fontFamily: C.fontMono,
                textDecoration: "none",
              }}
            >
              Back to Harch Atelier
            </a>
          </div>

          {/* Demo data disclaimer */}
          <p
            style={{
              marginTop: "32px",
              fontSize: "11px",
              color: C.textMuted,
              fontFamily: C.fontMono,
              textAlign: "center",
              letterSpacing: "0.04em",
              lineHeight: 1.6,
            }}
          >
            Demo data is illustrative. Prices, alerts and sentiment scores
            <br />
            are pre-populated for presentation purposes only.
          </p>
        </div>
      </main>

      {/* Spinner keyframe - inlined to match the ConsoleShell pattern. */}
      <style>{`@keyframes demo-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── DEMO CARD ────────────────────────────────────────────────────
// Whole card is clickable (per spec). Hover: lift + accent border.
// The accent stripe on the left edge gives each offer a visual
// identity that matches its theme color in the actual dashboard.

function DemoCard({
  offer,
  loading,
  disabled,
  onClick,
}: {
  offer: Offer;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const isStandby = !!offer.standby;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isStandby ? `${offer.label} (on standby)` : `Launch ${offer.label} demo`}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        textAlign: "left",
        gap: "10px",
        padding: "24px 22px 22px",
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition:
          "transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
        overflow: "hidden",
        // The accent stripe is rendered as a pseudo-element via the
        // accentBg background bleeding through the top padding.
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = offer.accent;
        e.currentTarget.style.boxShadow = C.shadowMd;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.boxShadow = "none";
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(0) scale(0.99)";
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(-2px) scale(1)";
      }}
    >
      {/* Accent stripe - left edge */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "4px",
          background: offer.accent,
        }}
      />

      {/* Standby badge - top right (Task ID: 5-standby) */}
      {isStandby && (
        <span
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            fontFamily: C.fontMono,
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: C.warningText,
            background: C.warningBg,
            border: `1px solid ${C.warningBorder}`,
            borderRadius: "4px",
            padding: "3px 7px",
            lineHeight: 1,
          }}
        >
          Standby
        </span>
      )}

      {/* Persona badge */}
      <span
        style={{
          fontFamily: C.fontMono,
          fontSize: "10px",
          color: C.textMuted,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {offer.persona}
      </span>

      {/* Offer label */}
      <span
        style={{
          fontFamily: C.fontSans,
          fontSize: "22px",
          fontWeight: 700,
          color: C.text,
          letterSpacing: "-0.02em",
        }}
      >
        {offer.label}
      </span>

      {/* Description */}
      <span
        style={{
          fontFamily: C.fontSans,
          fontSize: "13px",
          color: C.textBody,
          lineHeight: 1.5,
        }}
      >
        {offer.description}
      </span>

      {/* Bullets */}
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "6px 0 0",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        {offer.bullets.map((b) => (
          <li
            key={b}
            style={{
              fontFamily: C.fontSans,
              fontSize: "12px",
              color: C.textMuted,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              aria-hidden
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: offer.accent,
                flexShrink: 0,
              }}
            />
            {b}
          </li>
        ))}
      </ul>

      {/* CTA row */}
      <span
        style={{
          marginTop: "auto",
          paddingTop: "14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: C.fontMono,
          fontSize: "11px",
          fontWeight: 700,
          color: isStandby
            ? C.textMuted
            : loading
            ? C.textMuted
            : offer.accent,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {isStandby ? (
          <>Standby — coming back</>
        ) : loading ? (
          <>
            <Spinner color={offer.accent} />
            Launching demo...
          </>
        ) : (
          <>
            Launch demo
            <span aria-hidden style={{ fontSize: "13px" }}>
              &rarr;
            </span>
          </>
        )}
      </span>
    </button>
  );
}

// Minimal spinner - keeps the card height stable while loading
function Spinner({ color }: { color: string }) {
  return (
    <span
      role="status"
      aria-label="loading"
      style={{
        width: "12px",
        height: "12px",
        borderRadius: "50%",
        border: `2px solid ${color}40`,
        borderTopColor: color,
        display: "inline-block",
        animation: "demo-spin 0.7s linear infinite",
      }}
    />
  );
}
