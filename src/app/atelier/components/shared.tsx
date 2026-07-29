"use client";

import { useState, useEffect, useMemo } from "react";
import { C } from "./tokens";

// ─── SHARED UI COMPONENTS — DESIGN SYSTEM V2 ──────────────────────
// Harch Atelier · AI Reputation Intelligence
// Conforme HARCH_DESIGN_SYSTEM_V2.md :
//   • Backgrounds  → neutral-50 / white / neutral-900 / neutral-950
//   • Text         → neutral-950 / neutral-600 / neutral-500 / white / neutral-400
//   • Borders      → neutral-200 (light) / neutral-800 (dark)
//   • CTA primary  → bg-emerald-500 hover:bg-emerald-400 text-white (TOUJOURS)
//   • Atelier accent → stone-500 (#78716c) — labels/stats/icônes UNIQUEMENT
//   • Fonts        → Inter (body) + Space Mono (data) — JAMAIS JetBrains Mono
// Toutes les couleurs proviennent de `C` (tokens.ts) — source unique de vérité.

// ─── SCROLL PROGRESS ─────────────────────────────────────────────
// Barre de progression en haut de page — accent stone-500 (Atelier)
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "2px",
        width: `${progress}%`,
        background: C.accent, // stone-500 — accent Atelier
        zIndex: 100,
        transition: "width 0.1s ease-out",
        boxShadow: `0 0 8px rgba(120,113,108,0.3)`, // stone-500 @ 30%
      }}
      aria-hidden
    />
  );
}

// ─── CURSOR GLOW ─────────────────────────────────────────────────
// Halo subtil qui suit le curseur — stone-500 (accent Atelier) à 4% d'opacité
export function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 0,
        // stone-500 (#78716c) @ 4% — dégradé radial vers transparent
        background:
          "radial-gradient(circle, rgba(120,113,108,0.04), transparent 60%)",
        transform: "translate(-50%, -50%)",
        transition: "left 0.15s ease-out, top 0.15s ease-out",
      }}
      aria-hidden
    />
  );
}

// ─── BACK TO TOP ─────────────────────────────────────────────────
// Bouton retour-en-haut — bg-white + border neutral-200 ;
// hover → bg-emerald-500 (CTA primary du DS V2) + text-white
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 800);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Retour en haut"
      style={{
        position: "fixed",
        bottom: "32px",
        right: "32px",
        width: "44px",
        height: "44px",
        background: C.bg, // white
        border: `1px solid ${C.border}`, // neutral-200
        borderRadius: "4px",
        color: C.text, // neutral-950
        fontSize: "20px",
        cursor: "pointer",
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.2s, color 0.2s, transform 0.2s, box-shadow 0.2s, border-color 0.2s",
        boxShadow: C.shadowSm,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = C.cta; // emerald-500
        e.currentTarget.style.borderColor = C.cta;
        e.currentTarget.style.color = C.textOnDark; // white
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 4px 16px rgba(16,185,129,0.25), 0 1px 3px rgba(0,0,0,0.06)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = C.bg;
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.color = C.text;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = C.shadowSm;
      }}
    >
      ↑
    </button>
  );
}

// ─── SECTION LABEL (eyebrow) ─────────────────────────────────────
// Label de section — Space Mono, stone-500, uppercase
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "12px",
        fontFamily: C.fontMono, // Space Mono
        color: C.accent, // stone-500
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        marginBottom: "28px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      {children}
      <span
        style={{
          width: "60px",
          height: "1px",
          background: `linear-gradient(to right, ${C.accent}, transparent)`,
        }}
        aria-hidden
      />
    </div>
  );
}

// ─── SPARKLINE ───────────────────────────────────────────────────
// Sparkline SVG inline — couleur par défaut = stone-500 (accent Atelier)
export function Sparkline({
  data,
  color = C.accent, // stone-500
  width = 80,
  height = 24,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="2"
        fill={color}
      />
    </svg>
  );
}

// ─── BUTTON STYLES ───────────────────────────────────────────────
// DS V2 — Primary CTA (TOUJOURS emerald-500) :
//   bg-emerald-500 hover:bg-emerald-400 text-white
export const btnPrimaryStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "14px 28px",
  background: C.cta, // emerald-500
  color: C.textOnDark, // white
  fontSize: "15px",
  fontWeight: 600,
  textDecoration: "none",
  borderRadius: "2px",
  border: `1px solid ${C.cta}`,
  cursor: "pointer",
  fontFamily: C.fontSans, // Inter
  transition: "background-color 0.2s",
};

// DS V2 — Secondary CTA (on light) :
//   border border-neutral-300 text-neutral-950 hover:bg-neutral-100
export const btnSecondaryStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "14px 28px",
  background: "transparent",
  color: C.text, // neutral-950
  fontSize: "15px",
  fontWeight: 500,
  textDecoration: "none",
  borderRadius: "2px",
  border: `1px solid ${C.borderStrong}`, // neutral-300
  cursor: "pointer",
  fontFamily: C.fontSans, // Inter
  transition: "background-color 0.2s",
};

// ─── SECTION / HEADING STYLES ────────────────────────────────────
// Section wrapper — border-top neutral-200
export const sectionStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  maxWidth: "1280px",
  margin: "0 auto",
  padding: "100px 32px",
  borderTop: `1px solid ${C.border}`, // neutral-200
};

export const h2Style: React.CSSProperties = {
  fontSize: "clamp(32px, 5vw, 56px)",
  fontWeight: 700,
  letterSpacing: "-0.03em",
  lineHeight: 1.05,
  color: C.text, // neutral-950 (#0a0a0a)
  margin: "0 0 24px",
  maxWidth: "1000px",
};

export const subheadStyle: React.CSSProperties = {
  fontSize: "19px",
  color: C.textBody, // neutral-600 (#525252)
  fontWeight: 400,
  lineHeight: 1.55,
  maxWidth: "720px",
  margin: "0 0 64px",
};

// Top line accent — gradient stone-500 (accent Atelier)
export const topLineStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "1px",
  background: `linear-gradient(to right, transparent, ${C.accent}, transparent)`,
  opacity: 0.5,
};

// ─── FORGE SPARKS — Détail visuel signature Atelier ──────────────
// DS V2 §6 — chaque filiale a UN détail visuel unique.
// Atelier = "Forge sparks" : petits points éparpillés.
//
// Usage (background de hero / sections dark) :
//   <div className="relative">
//     <ForgeSparks />           // absolute, pointer-events-none
//     <HeroContent />
//   </div>
//
// 28 particules positionnées de façon déterministe (seed fixe — pas de
// hydration mismatch SSR/CSR), opacité 0.10-0.30, couleur stone-500.
// Animation CSS : pulse + léger drift horizontal/vertical.
const FORGE_SPARK_COUNT = 28;

// Générateur pseudo-aléatoire déterministe (mulberry32) — garantit
// le même rendu côté serveur et client (pas de mismatch React).
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface ForgeSparksProps {
  /** Override color (defaults to stone-500 / C.accent). */
  color?: string;
  /** Override count (defaults to 28). */
  count?: number;
  /** Inline style on the wrapper (position, size, etc.). */
  style?: React.CSSProperties;
  /** Class on the wrapper. */
  className?: string;
}

export function ForgeSparks({
  color = C.accent, // stone-500
  count = FORGE_SPARK_COUNT,
  style,
  className,
}: ForgeSparksProps) {
  // Memo : on génère les sparks une seule fois (déterministe).
  const sparks = useMemo(() => {
    const rand = mulberry32(20260101);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.round(rand() * 10000) / 100,
      y: Math.round(rand() * 10000) / 100,
      size: 1.5 + rand() * 2,
      opacity: 0.1 + rand() * 0.2,
      delay: Math.round(rand() * 60) / 10,
      duration: 3 + rand() * 4,
      drift: 4 + rand() * 8,
    }));
  }, [count]);

  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        ...style,
      }}
    >
      <style>{`
        @keyframes harch-forge-pulse {
          0%, 100% { opacity: var(--harch-spark-op); transform: translate(0, 0) scale(1); }
          50%      { opacity: calc(var(--harch-spark-op) * 0.4); transform: translate(var(--harch-spark-dx), var(--harch-spark-dy)) scale(1.4); }
        }
      `}</style>
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
        preserveAspectRatio="none"
      >
        {sparks.map((s) => (
          <circle
            key={s.id}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.size}
            fill={color}
            style={
              {
                opacity: s.opacity,
                // Variables CSS consommées par @keyframes harch-forge-pulse
                "--harch-spark-op": `${s.opacity}`,
                "--harch-spark-dx": `${(s.id % 2 === 0 ? 1 : -1) * s.drift}px`,
                "--harch-spark-dy": `${(s.id % 3 === 0 ? 1 : -1) * s.drift * 0.6}px`,
                animation: `harch-forge-pulse ${s.duration}s ease-in-out ${s.delay}s infinite`,
                transformOrigin: "center",
              } as React.CSSProperties
            }
          />
        ))}
      </svg>
    </div>
  );
}

// ─── TESLA TABS — Interaction style Tesla (DS V2 §7) ─────────────
// 3 (ou N) gros boutons en bas ; le contenu d'un grand écran change au-dessus.
//
// Usage :
//   <TeslaTabs
//     tabs={[
//       { label: "Discovery", content: <DiscoveryView /> },
//       { label: "Build",     content: <BuildView /> },
//       { label: "Vault",     content: <VaultView /> },
//     ]}
//   />
//
// DS V2 : boutons border-neutral-300 hover:bg-neutral-100 ;
// bouton actif bg-stone-500 text-white ; contenu dans carte
// rounded-2xl border-neutral-200 p-8.
export interface TeslaTab {
  label: string;
  content: React.ReactNode;
}

export interface TeslaTabsProps {
  tabs: TeslaTab[];
  /** Index initial du tab actif (défaut 0). */
  defaultIndex?: number;
  /** Optionnel : callback quand le tab change. */
  onChange?: (index: number) => void;
  /** Optionnel : libellé accessible pour le groupe de tabs. */
  ariaLabel?: string;
  /** Optionnel : className sur le conteneur racine. */
  className?: string;
}

export function TeslaTabs({
  tabs,
  defaultIndex = 0,
  onChange,
  ariaLabel = "Section interactive",
  className,
}: TeslaTabsProps) {
  const [active, setActive] = useState(
    Math.max(0, Math.min(defaultIndex, tabs.length - 1))
  );

  const handleSelect = (i: number) => {
    setActive(i);
    onChange?.(i);
  };

  if (tabs.length === 0) return null;

  return (
    <div className={className} style={{ width: "100%" }}>
      {/* Grand écran / mockup qui change au-dessus */}
      <div
        role="tabpanel"
        aria-label={tabs[active]?.label}
        style={{
          borderRadius: "16px", // rounded-2xl
          border: `1px solid ${C.border}`, // border-neutral-200
          background: C.bg, // bg-white
          padding: "32px", // p-8
          minHeight: "320px",
          boxShadow: C.shadowSm,
        }}
      >
        {tabs[active]?.content}
      </div>

      {/* 3 (ou N) boutons en bas */}
      <div
        role="tablist"
        aria-label={ariaLabel}
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "16px",
          flexWrap: "wrap",
        }}
      >
        {tabs.map((tab, i) => {
          const isActive = i === active;
          return (
            <button
              key={`${tab.label}-${i}`}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleSelect(i)}
              style={{
                flex: "1 1 0",
                minWidth: "180px",
                padding: "16px 24px",
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: C.fontSans, // Inter
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                cursor: "pointer",
                borderRadius: "8px",
                transition: "background-color 0.2s, color 0.2s, border-color 0.2s",
                // Actif → bg-stone-500 text-white
                // Inactif → border-neutral-300 text-neutral-950 hover:bg-neutral-100
                background: isActive ? C.accent : C.bg, // stone-500 / white
                color: isActive ? C.textOnDark : C.text, // white / neutral-950
                border: `1px solid ${isActive ? C.accent : C.borderStrong}`, // stone-500 / neutral-300
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = C.bgHover; // neutral-100
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = C.bg;
                }
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── PHASE DISCLAIMER — Pre-launch transparency banner ─────────
// Per MASTER_VISION.md "Obligations absolues":
// ✅ Toute nouvelle page du site doit inclure le disclaimer
//
// Usage:
//   import { PhaseDisclaimer } from "../components/shared";
//   <PhaseDisclaimer />              // default — pre-launch
//   <PhaseDisclaimer variant="data" />  // for pages with scraped/scored data
//
// The disclaimer is honest about Atelier's pre-launch status and
// (for variant="data") about the fact that scores are AI-estimated
// from public sources, not official company statements.
//
// Couleurs DS V2 :
//   default  → bg neutral-50, border neutral-200, label neutral-500
//   data     → bg amber-50, border amber-300, label amber-700
//   links    → stone-500 (accent Atelier)

interface PhaseDisclaimerProps {
  variant?: "default" | "data";
  compact?: boolean;
}

export function PhaseDisclaimer({
  variant = "default",
  compact = false,
}: PhaseDisclaimerProps) {
  const isData = variant === "data";

  return (
    <div
      role="note"
      style={{
        background: isData ? C.warningBg : C.bgSubtle, // amber-50 / neutral-50
        borderBottom: `1px solid ${isData ? C.warningBorder : C.border}`, // amber-300 / neutral-200
        padding: compact ? "10px 32px" : "14px 32px",
        fontFamily: C.fontSans, // Inter
        fontSize: compact ? "12px" : "13px",
        color: C.textBody, // neutral-600
        textAlign: "center",
        lineHeight: 1.5,
      }}
    >
      <span
        style={{
          fontFamily: C.fontMono, // Space Mono (was JetBrains Mono)
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: isData ? C.warningText : C.textMuted, // amber-700 / neutral-500
          marginRight: "10px",
        }}
      >
        {isData ? "Data notice" : "Pre-launch"}
      </span>
      {isData ? (
        <>
          Scores are AI-estimated from public media + AI engine outputs, not
          official statements by the listed companies. Data refreshes weekly.{" "}
          <a
            href="/atelier/method"
            style={{ color: C.accent, textDecoration: "underline" }} // stone-500
          >
            Methodology
          </a>
          .
        </>
      ) : (
        <>
          Harch Atelier is in pre-launch phase. Built by{" "}
          <strong style={{ color: C.text }}>
            Amine Harch El Korane
          </strong>{" "}
          (16 ans, Casablanca). First pilot clients being signed Q3 2026.{" "}
          <a
            href="/atelier/about"
            style={{ color: C.accent, textDecoration: "underline" }} // stone-500
          >
            Building in Public
          </a>
          .
        </>
      )}
    </div>
  );
}
