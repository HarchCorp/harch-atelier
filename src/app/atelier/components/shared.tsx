"use client";

import { useState, useEffect } from "react";

// ─── SHARED UI COMPONENTS — LIGHT THEME ───────────────────────────
// Harch Atelier · AI Reputation Intelligence
// Palette: bg #FAFAFA · surface #FFFFFF · text #0A0A0A · sage #4A7B5F · accent #4A5D6E

// Scroll progress bar — sage → accentDark gradient, works on light background
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
        background: "linear-gradient(to right, #4A7B5F, #4A5D6E)",
        zIndex: 100,
        transition: "width 0.1s ease-out",
        boxShadow: "0 0 8px rgba(74,123,95,0.3)",
      }}
      aria-hidden
    />
  );
}

// Cursor glow — very subtle accentDark on white (0.04 opacity)
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
        background:
          "radial-gradient(circle, rgba(74,93,110,0.04), transparent 60%)",
        transform: "translate(-50%, -50%)",
        transition: "left 0.15s ease-out, top 0.15s ease-out",
      }}
      aria-hidden
    />
  );
}

// Back to top — light themed button
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
        background: "#FFFFFF",
        border: "1px solid #E5E5E5",
        borderRadius: "4px",
        color: "#0A0A0A",
        fontSize: "20px",
        cursor: "pointer",
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#FFFFFF";
        e.currentTarget.style.borderColor = "#4A5D6E";
        e.currentTarget.style.color = "#0A0A0A";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow =
          "0 4px 16px rgba(74,93,110,0.15), 0 1px 3px rgba(0,0,0,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#FFFFFF";
        e.currentTarget.style.borderColor = "#E5E5E5";
        e.currentTarget.style.color = "#0A0A0A";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)";
      }}
    >
      ↑
    </button>
  );
}

// Section label (eyebrow) — JetBrains Mono, muted, uppercase
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "12px",
        fontFamily: "'JetBrains Mono', monospace",
        color: "#4A5D6E",
        letterSpacing: "0.14em",
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
          background: "linear-gradient(to right, #4A5D6E, transparent)",
        }}
        aria-hidden
      />
    </div>
  );
}

// Sparkline — generic inline SVG sparkline
export function Sparkline({
  data,
  color = "#4A7B5F",
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

// Button styles — light theme
// Primary: sage bg + white text
export const btnPrimaryStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "14px 28px",
  background: "#4A7B5F",
  color: "#FFFFFF",
  fontSize: "15px",
  fontWeight: 600,
  textDecoration: "none",
  borderRadius: "2px",
  border: "1px solid #4A7B5F",
  cursor: "pointer",
  fontFamily: "'Inter', sans-serif",
  transition: "all 0.2s",
};

// Secondary: transparent + accentDark border + near-black text
export const btnSecondaryStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "14px 28px",
  background: "transparent",
  color: "#0A0A0A",
  fontSize: "15px",
  fontWeight: 500,
  textDecoration: "none",
  borderRadius: "2px",
  border: "1px solid #4A5D6E",
  cursor: "pointer",
  fontFamily: "'Inter', sans-serif",
  transition: "all 0.2s",
};

// Section wrapper — light borders
export const sectionStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  maxWidth: "1280px",
  margin: "0 auto",
  padding: "100px 32px",
  borderTop: "1px solid #E5E5E5",
};

export const h2Style: React.CSSProperties = {
  fontSize: "clamp(32px, 5vw, 56px)",
  fontWeight: 700,
  letterSpacing: "-0.03em",
  lineHeight: 1.05,
  color: "#0A0A0A",
  margin: "0 0 24px",
  maxWidth: "1000px",
};

export const subheadStyle: React.CSSProperties = {
  fontSize: "19px",
  color: "rgba(0,0,0,0.60)",
  fontWeight: 400,
  lineHeight: 1.55,
  maxWidth: "720px",
  margin: "0 0 64px",
};

// Top line accent (reusable) — accentDark gradient
export const topLineStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "1px",
  background: "linear-gradient(to right, transparent, #4A5D6E, transparent)",
  opacity: 0.5,
};

// ─── PHASE DISCLAIMER — Pre-launch transparency banner ─────────
// Per MASTER_VISION.md "Obligations absolues":
// ✅ Toute nouvelle page du site doit inclure le disclaimer
//
// Usage:
//   import { PhaseDisclaimer } from "../components/shared";
//   <PhaseDisclaimer />        // default — pre-launch
//   <PhaseDisclaimer variant="data" />  // for pages with scraped/scored data
//
// The disclaimer is honest about Atelier's pre-launch status and
// (for variant="data") about the fact that scores are AI-estimated
// from public sources, not official company statements.

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
        background: isData ? "#FFFBEB" : "#F4F4F5",
        borderBottom: `1px solid ${isData ? "#FCD34D" : "#E5E5E5"}`,
        padding: compact ? "10px 32px" : "14px 32px",
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: compact ? "12px" : "13px",
        color: "#525252",
        textAlign: "center",
        lineHeight: 1.5,
      }}
    >
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: isData ? "#B45309" : "#71717A",
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
            style={{ color: "#4A5D6E", textDecoration: "underline" }}
          >
            Methodology
          </a>
          .
        </>
      ) : (
        <>
          Harch Atelier is in pre-launch phase. Built by{" "}
          <strong style={{ color: "#0A0A0A" }}>
            Amine Harch El Korane
          </strong>{" "}
          (16 ans, Casablanca). First pilot clients being signed Q3 2026.{" "}
          <a
            href="/atelier/about"
            style={{ color: "#4A5D6E", textDecoration: "underline" }}
          >
            Building in Public
          </a>
          .
        </>
      )}
    </div>
  );
}
