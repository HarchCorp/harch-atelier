"use client";

import { useState } from "react";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop } from "../components/shared";
import { StatCard } from "../components/charts/Charts";
import { ARTICLES, CATEGORIES, type Category } from "./articles";

const C = {
  bg: "#FAFAFA", surface: "#FFFFFF", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", borderLight: "#F0F0F0",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  accent: "#4A5D6E", sage: "#4A7B5F", sageBright: "#6FA386",
  red: "#A0524B", amber: "#B87333",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
  shadowHover: "0 12px 32px rgba(0,0,0,0.10)",
};

const CATEGORY_COLORS: Record<Category, string> = {
  "Reputation Risk": "#A0524B",
  "ESG": "#4A7B5F",
  "PR & Comms": "#B87333",
  "AI Engines": "#4A5D6E",
  "Regulation": "#8B9DAF",
  "Industry Analysis": "#6FA386",
  "Methodology": "#3D6650",
};

export default function BlogIndexPage() {
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const featured = ARTICLES.find((a) => a.featured) ?? ARTICLES[0];
  const rest = ARTICLES.filter((a) => a.slug !== featured.slug);

  const filtered =
    activeCategory === "All"
      ? rest
      : rest.filter((a) => a.category === activeCategory);

  const totalReads = ARTICLES.reduce((sum, a) => sum + (a.readMinutes * 340), 0);
  const avgRead =
    Math.round(
      (ARTICLES.reduce((s, a) => s + a.readMinutes, 0) / ARTICLES.length) * 10
    ) / 10;
  const industriesCovered = 6;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("@")) setSubscribed(true);
  };

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />

      {/* HERO */}
      <section
        style={{
          background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)`,
          borderBottom: `1px solid ${C.border}`,
          padding: "100px 32px 72px",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "6px 14px",
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "100px",
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              color: C.sage,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: C.sage,
                animation: "pulse 2s infinite",
              }}
            />
            Blog · Insights on reputation intelligence
          </div>
          <h1
            style={{
              fontSize: "clamp(40px, 6vw, 68px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.0,
              color: C.text,
              margin: "0 0 28px",
              maxWidth: "960px",
            }}
          >
            Harch Atelier Blog — Insights on reputation intelligence
          </h1>
          <p
            style={{
              fontSize: "20px",
              color: C.textSec,
              lineHeight: 1.55,
              maxWidth: "760px",
              margin: 0,
            }}
          >
            Field notes, methodology deep-dives and case studies on how Moroccan and
            African companies are measured, ranked and perceived — across media,
            social platforms and the eight AI engines that now shape every decision.
          </p>
        </div>
      </section>

      {/* STAT CARDS */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "64px 32px 32px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <StatCard
            value={ARTICLES.length}
            label="Articles published"
            sublabel="Jan – Jul 2026"
            color={C.sage}
            sparklineData={[2, 4, 6, 9, 11, 13, 15]}
          />
          <StatCard
            value={totalReads.toLocaleString("en-US")}
            label="Total reads"
            sublabel="Cumulative · all articles"
            color={C.accent}
            trend={{ direction: "up", value: "12% MoM" }}
          />
          <StatCard
            value={`${avgRead} min`}
            label="Avg read time"
            sublabel="Across 15 articles"
            color={C.amber}
          />
          <StatCard
            value={industriesCovered}
            label="Industries covered"
            sublabel="Banking · telco · mining · agri · utilities · retail"
            color={C.red}
          />
        </div>
      </section>

      {/* FEATURED ARTICLE */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 32px 24px" }}>
        <div
          style={{
            fontSize: "11px",
            fontFamily: "'JetBrains Mono', monospace",
            color: C.accent,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}
        >
          Featured article
        </div>
        <a
          href={`/atelier/blog/${featured.slug}`}
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: C.shadow,
            textDecoration: "none",
            transition: "all 0.2s",
            borderTop: `4px solid ${featured.coverColor}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = C.shadowHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = C.shadow;
          }}
        >
          {/* Visual side */}
          <div
            style={{
              minHeight: "320px",
              background: `linear-gradient(135deg, ${featured.coverColor} 0%, ${C.accent} 100%)`,
              padding: "40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-40px",
                right: "-40px",
                width: "220px",
                height: "220px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
              }}
              aria-hidden
            />
            <div
              style={{
                position: "relative",
                display: "inline-flex",
                alignSelf: "flex-start",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                background: "rgba(255,255,255,0.16)",
                borderRadius: "100px",
                fontSize: "10px",
                fontWeight: 700,
                color: "#FFFFFF",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              {featured.category}
            </div>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.75)",
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                {featured.dateLabel} · {featured.readTime}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: 600,
                }}
              >
                {featured.author}
              </div>
            </div>
          </div>

          {/* Text side */}
          <div style={{ padding: "40px", display: "flex", flexDirection: "column" }}>
            <h2
              style={{
                fontSize: "clamp(24px, 3vw, 32px)",
                fontWeight: 700,
                color: C.text,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                margin: "0 0 16px",
              }}
            >
              {featured.title}
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: C.textSec,
                lineHeight: 1.6,
                margin: "0 0 24px",
                flex: 1,
              }}
            >
              {featured.excerpt}
            </p>
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "24px",
              }}
            >
              {featured.tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: "10px",
                    fontFamily: "'JetBrains Mono', monospace",
                    color: C.textMuted,
                    padding: "3px 8px",
                    background: C.surfaceAlt,
                    borderRadius: "4px",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "15px",
                fontWeight: 600,
                color: featured.coverColor,
              }}
            >
              Read the article →
            </div>
          </div>
        </a>
      </section>

      {/* CATEGORY FILTER */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 32px 16px" }}>
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              color: C.textMuted,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginRight: "8px",
            }}
          >
            Filter:
          </span>
          <FilterChip
            label="All"
            active={activeCategory === "All"}
            onClick={() => setActiveCategory("All")}
            color={C.text}
          />
          {CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              color={CATEGORY_COLORS[cat]}
            />
          ))}
        </div>
      </section>

      {/* ARTICLE GRID */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 32px 80px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {filtered.map((a) => (
            <a
              key={a.slug}
              href={`/atelier/blog/${a.slug}`}
              style={{
                display: "flex",
                flexDirection: "column",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                overflow: "hidden",
                textDecoration: "none",
                transition: "all 0.2s",
                borderTop: `3px solid ${a.coverColor}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  height: "8px",
                  background: `linear-gradient(90deg, ${a.coverColor}, transparent)`,
                }}
                aria-hidden
              />
              <div style={{ padding: "28px", display: "flex", flexDirection: "column", flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "14px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                      padding: "3px 10px",
                      borderRadius: "100px",
                      background: `${a.coverColor}15`,
                      color: a.coverColor,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {a.category}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: C.textMuted,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {a.readTime}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: C.text,
                    letterSpacing: "-0.01em",
                    margin: "0 0 12px",
                    lineHeight: 1.3,
                  }}
                >
                  {a.title}
                </h3>
                <p
                  style={{
                    fontSize: "13.5px",
                    color: C.textSec,
                    lineHeight: 1.55,
                    margin: "0 0 20px",
                    flex: 1,
                  }}
                >
                  {a.excerpt}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "16px",
                    borderTop: `1px solid ${C.borderLight}`,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: C.text,
                      }}
                    >
                      {a.author}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: C.textMuted,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {a.dateLabel}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: a.coverColor,
                    }}
                  >
                    Read →
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section
        style={{
          background: C.surface,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          padding: "80px 32px",
        }}
      >
        <div
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              color: C.sage,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            The Atelier Briefing
          </div>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 700,
              color: C.text,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              margin: "0 0 16px",
            }}
          >
            One email. Every Tuesday. The reputation moves that mattered.
          </h2>
          <p
            style={{
              fontSize: "17px",
              color: C.textSec,
              lineHeight: 1.55,
              margin: "0 0 32px",
            }}
          >
            The week&apos;s reputation shifts across Moroccan and African business —
            sentiment deltas, AI-engine citation changes, and the regulatory signals
            worth a board minute. Read in 4 minutes. Free.
          </p>
          {subscribed ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "16px 28px",
                background: `${C.sage}10`,
                border: `1px solid ${C.sage}40`,
                borderRadius: "8px",
                color: C.sage,
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              ✓ You&apos;re on the list. First briefing lands Tuesday.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                gap: "8px",
                maxWidth: "480px",
                margin: "0 auto",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.ma"
                aria-label="Email address"
                style={{
                  flex: "1 1 240px",
                  padding: "14px 16px",
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: "4px",
                  fontSize: "15px",
                  fontFamily: "'Inter', sans-serif",
                  color: C.text,
                  outline: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "14px 28px",
                  background: C.sage,
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "15px",
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = C.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = C.sage;
                }}
              >
                Subscribe →
              </button>
            </form>
          )}
          <div
            style={{
              fontSize: "11px",
              color: C.textMuted,
              fontFamily: "'JetBrains Mono', monospace",
              marginTop: "20px",
            }}
          >
            No spam. Unsubscribe in one click. We never sell your data.
          </div>
        </div>
      </section>

      <AtelierFooter />
      <BackToTop />
    </>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 14px",
        background: active ? color : C.surface,
        color: active ? "#FFFFFF" : C.textSec,
        border: `1px solid ${active ? color : C.border}`,
        borderRadius: "100px",
        fontSize: "12px",
        fontWeight: 600,
        fontFamily: "'Inter', sans-serif",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = color;
          e.currentTarget.style.color = color;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = C.border;
          e.currentTarget.style.color = C.textSec;
        }
      }}
    >
      {label}
    </button>
  );
}
