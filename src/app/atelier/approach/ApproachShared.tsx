"use client";

import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop } from "../components/shared";

const C = {
  bg: "#FAFAFA", surface: "#FFFFFF", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", borderLight: "#F0F0F0",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  accent: "#4A5D6E", sage: "#4A7B5F", sageBright: "#6FA386",
  red: "#A0524B", amber: "#B87333",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
};

export function ApproachPage({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />
      <div style={{ background: C.bg, minHeight: "100vh" }}>{children}</div>
      <AtelierFooter />
      <BackToTop />
    </>
  );
}

export function Hero({ eyebrow, title, subtitle, color = C.sage }: { eyebrow: string; title: React.ReactNode; subtitle: string; color?: string }) {
  return (
    <section style={{
      background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)`,
      borderBottom: `1px solid ${C.border}`,
      padding: "100px 32px 80px",
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "10px",
          padding: "6px 14px", background: C.surface,
          border: `1px solid ${C.border}`, borderRadius: "100px",
          fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
          color, letterSpacing: "0.14em", textTransform: "uppercase",
          marginBottom: "24px",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, animation: "pulse 2s infinite" }} />
          {eyebrow}
        </div>
        <h1 style={{
          fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 800,
          letterSpacing: "-0.04em", lineHeight: 1.0, color: C.text,
          margin: "0 0 28px", maxWidth: "900px",
        }}>
          {title}
        </h1>
        <p style={{
          fontSize: "20px", color: C.textSec, lineHeight: 1.55,
          maxWidth: "760px",
        }}>
          {subtitle}
        </p>
      </div>
    </section>
  );
}

export function Section({ children, alt = false }: { children: React.ReactNode; alt?: boolean }) {
  return (
    <section style={{
      background: alt ? C.surface : C.bg,
      padding: "80px 32px",
      borderTop: alt ? `1px solid ${C.border}` : "none",
    }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {children}
      </div>
    </section>
  );
}

export function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <>
      <div style={{
        fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
        color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
        marginBottom: "16px",
      }}>
        {label}
      </div>
      <h2 style={{
        fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 700,
        color: C.text, letterSpacing: "-0.03em", margin: "0 0 48px",
      }}>
        {title}
      </h2>
    </>
  );
}

export function StatsGrid({ stats, color = C.sage }: { stats: { value: string; label: string }[]; color?: string }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "1px", background: C.border, border: `1px solid ${C.border}`,
      borderRadius: "12px", overflow: "hidden", maxWidth: "900px",
    }}>
      {stats.map(s => (
        <div key={s.label} style={{ background: C.surface, padding: "20px 24px" }}>
          <div style={{ fontSize: "28px", fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, marginBottom: "6px" }}>
            {s.value}
          </div>
          <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardGrid({ items, color = C.sage }: { items: { title: string; desc: string; icon: string }[]; color?: string }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "20px",
    }}>
      {items.map(item => (
        <div key={item.title} style={{
          padding: "32px", background: C.surface,
          border: `1px solid ${C.border}`, borderRadius: "12px",
          boxShadow: C.shadow, borderTop: `3px solid ${color}`,
        }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "10px",
            background: `${color}15`, color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px", fontWeight: 700, marginBottom: "20px",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {item.icon}
          </div>
          <h3 style={{ fontSize: "19px", fontWeight: 700, color: C.text, marginBottom: "12px", letterSpacing: "-0.01em" }}>
            {item.title}
          </h3>
          <p style={{ fontSize: "14px", color: C.textSec, lineHeight: 1.6, margin: 0 }}>
            {item.desc}
          </p>
        </div>
      ))}
    </div>
  );
}

export function CTABottom({ title, subtitle, href = "/atelier/audit", cta = "Request a demo →", color = C.sage }: { title: string; subtitle: string; href?: string; cta?: string; color?: string }) {
  return (
    <section style={{
      background: C.text, color: "#FFFFFF",
      padding: "80px 32px", textAlign: "center",
    }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 20px", color: "#FFFFFF" }}>
          {title}
        </h2>
        <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", marginBottom: "32px", lineHeight: 1.6 }}>
          {subtitle}
        </p>
        <a href={href} style={{
          display: "inline-block", padding: "16px 32px",
          background: color, color: "#FFFFFF",
          fontSize: "15px", fontWeight: 600, textDecoration: "none",
          borderRadius: "8px", fontFamily: "'Inter', sans-serif",
        }}>
          {cta}
        </a>
      </div>
    </section>
  );
}
